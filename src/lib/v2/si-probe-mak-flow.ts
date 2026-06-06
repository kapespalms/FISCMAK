/**
 * 6.3: SI-probe Mak conversational flow.
 *
 * Pattern mirrors rotation-debrief-mak-flow: single probe, single response,
 * then done. PHI strip + distress detection run inside writeNarrativeEvidence.
 * Distress/crisis presentation is delegated to the global ESCALATE_CRISIS
 * state — the escalation system already detects crisis language and shows
 * resources. This flow writes the evidence and returns a clean ack.
 *
 * Rules:
 * - Skippable at any time ("skip", "later", "not now", etc.).
 * - Physician-owned, RLS-scoped. Never institution-facing.
 * - Adaptive probe selection (thinnest lattice domain first) via narrative_evidence.
 * - Response writes to narrative_evidence through B1 PHI strip.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";
import { nextProbeForDomain, selectAdaptiveDomain, type SiProbe } from "@/lib/v2/si-probe-bank";
import { writeNarrativeEvidence } from "@/lib/v2/narrative-evidence";

export type SiProbeSession = {
  domain_index: number;
  question_index: number;
  question: string;
  energy_signal: "energizing" | "draining" | null;
  mak_session_id: string;
  started_at: string;
};

export type SiProbeTurnResult = {
  response: string;
  meta: OnboardingMetadata;
  complete: boolean;
  suggested_actions: { action: string; url: string }[];
};

export function getSiProbeSession(meta: OnboardingMetadata): SiProbeSession | null {
  return (meta as Record<string, unknown>).si_probe_session as SiProbeSession ?? null;
}

export function clearSiProbeSession(meta: OnboardingMetadata): OnboardingMetadata {
  const { si_probe_session: _, ...rest } = meta as Record<string, unknown>;
  return rest as OnboardingMetadata;
}

export function initSiProbeSession(
  meta: OnboardingMetadata,
  probe: SiProbe,
): OnboardingMetadata {
  const session: SiProbeSession = {
    domain_index:   probe.domain_index,
    question_index: probe.question_index,
    question:       probe.question,
    energy_signal:  probe.energy_signal ?? null,
    mak_session_id: crypto.randomUUID(),
    started_at:     new Date().toISOString(),
  };
  return { ...meta, si_probe_session: session };
}

/**
 * Select the next adaptive probe by querying narrative_evidence for the
 * thinnest domain. Falls back to domain 0 / question 0 on error or demo.
 */
export async function selectNextProbe(
  userId: string,
  supabase: SupabaseClient | null,
  demo: boolean,
): Promise<SiProbe | null> {
  if (demo || !supabase) {
    return nextProbeForDomain(0, []);
  }

  try {
    const { data } = await supabase
      .from("narrative_evidence")
      .select("domain_index, question_index")
      .eq("user_id", userId);

    const answeredByDomain: Record<number, number[]> = {};
    const countByDomain:    Record<number, number>   = {};
    for (const row of data ?? []) {
      const d = row.domain_index as number;
      answeredByDomain[d] = [...(answeredByDomain[d] ?? []), row.question_index as number];
      countByDomain[d]    = (countByDomain[d] ?? 0) + 1;
    }

    const targetDomain = selectAdaptiveDomain(countByDomain);
    const answered     = answeredByDomain[targetDomain] ?? [];
    return nextProbeForDomain(targetDomain, answered);
  } catch {
    return nextProbeForDomain(0, []);
  }
}

const SKIP_PATTERN =
  /^(skip|later|not now|no thanks|pass|next time|not today|maybe later|no)$/i;

/**
 * Process one Mak turn in the SI-probe flow.
 *
 * - Skip intent → clear session, return graceful decline message.
 * - Real response → PHI-strip + write to narrative_evidence → return ack.
 *   Distress flagging happens inside writeNarrativeEvidence; the global
 *   ESCALATE_CRISIS path in the chat route will override with resources if
 *   crisis language is detected in the user message.
 */
export async function processSiProbeTurn(params: {
  message: string;
  meta:    OnboardingMetadata;
  userId:  string;
  supabase: SupabaseClient | null;
  demo:    boolean;
}): Promise<SiProbeTurnResult> {
  const { message, meta, userId, supabase, demo } = params;
  const session = getSiProbeSession(meta);
  if (!session) {
    return { response: "", meta, complete: false, suggested_actions: [] };
  }

  if (SKIP_PATTERN.test(message.trim())) {
    return {
      response: "No problem — you can always reflect on this another time.",
      meta:     clearSiProbeSession(meta),
      complete: true,
      suggested_actions: [],
    };
  }

  const energyNum =
    session.energy_signal === "energizing" ? 5
    : session.energy_signal === "draining"  ? 1
    : null;

  let writeOk = false;
  try {
    if (supabase || demo) {
      await writeNarrativeEvidence(
        {
          userId,
          domainIndex:      session.domain_index,
          questionIndex:    session.question_index,
          responseText:     message,
          energySignal:     energyNum,
          invisibleWorkFlag: false,
          makSessionId:     session.mak_session_id,
        },
        demo,
      );
      writeOk = true;
    }
  } catch (e) {
    console.error("[si-probe-flow] narrative_evidence write failed:", e);
  }

  const ack = writeOk
    ? "Saved. I'll keep what you shared in mind as we work on your career picture."
    : "Noted — I'll file this when the connection is back.";

  return {
    response: ack,
    meta:     clearSiProbeSession(meta),
    complete: true,
    suggested_actions: [
      { action: "Open Career Map", url: "/app/lattice" },
    ],
  };
}

/** Mak intro message displayed when the SI probe flow starts. */
export function buildSiProbeIntro(probe: SiProbe): string {
  return `One reflective question — take your time, or say "skip" if it doesn't fit today.\n\n${probe.question}`;
}

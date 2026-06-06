/**
 * POST /api/v1/capture/si-probe
 *
 * 6.3: Stores a physician's response to a subjective-insight probe in narrative_evidence.
 *
 * Governance (Part XIX):
 * - Physician-owned, RLS-scoped. Never institution-facing. Never feeds any aggregate.
 * - PHI strip (B1) runs before storage — enforced in writeNarrativeEvidence.
 * - Response not auto-reported; distress_flag triggers client-side resource display only.
 *
 * GET /api/v1/capture/si-probe?domain_index=N  — returns next probe for that domain,
 *   or adaptive domain selection if domain_index is omitted.
 */

import { createClient } from "@/lib/supabase/server";
import { isErrorResponse, jsonError, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";
import { writeNarrativeEvidence } from "@/lib/v2/narrative-evidence";
import { nextProbeForDomain, selectAdaptiveDomain, type SiProbe } from "@/lib/v2/si-probe-bank";

type PostBody = {
  domain_index: number;
  question_index: number;
  response_text: string;
  energy_signal?: number | null;
  mak_session_id?: string | null;
};

export async function GET(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const rawDomain = searchParams.get("domain_index");

  if (auth.demo) {
    const domain = rawDomain !== null ? parseInt(rawDomain, 10) : 0;
    const probe = nextProbeForDomain(isNaN(domain) ? 0 : domain, []);
    return jsonOk({ probe: probe ?? null });
  }

  const supabase = await createClient();

  // Count answered probes per domain to support adaptive selection
  const { data: existing } = await supabase
    .from("narrative_evidence")
    .select("domain_index, question_index")
    .eq("user_id", auth.userId);

  const answeredByDomain: Record<number, number[]> = {};
  const countByDomain: Record<number, number> = {};
  for (const row of existing ?? []) {
    const d = row.domain_index as number;
    answeredByDomain[d] = [...(answeredByDomain[d] ?? []), row.question_index as number];
    countByDomain[d] = (countByDomain[d] ?? 0) + 1;
  }

  let targetDomain: number;
  if (rawDomain !== null) {
    const parsed = parseInt(rawDomain, 10);
    targetDomain = isNaN(parsed) || parsed < 0 || parsed > 7 ? 0 : parsed;
  } else {
    targetDomain = selectAdaptiveDomain(countByDomain);
  }

  const answered = answeredByDomain[targetDomain] ?? [];
  const probe: SiProbe | null = nextProbeForDomain(targetDomain, answered);

  return jsonOk({ probe, domain_index: targetDomain });
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  let body: Partial<PostBody>;
  try { body = (await request.json()) as Partial<PostBody>; }
  catch { return jsonError("validation_error", "Invalid JSON.", 400); }

  const { domain_index, question_index, response_text, energy_signal, mak_session_id } = body;

  if (
    typeof domain_index !== "number" || domain_index < 0 || domain_index > 7 ||
    typeof question_index !== "number" || question_index < 0 ||
    !response_text?.trim()
  ) {
    return jsonError("validation_error", "domain_index (0–7), question_index, and response_text are required.", 400);
  }

  const row = await writeNarrativeEvidence(
    {
      userId:          auth.userId,
      domainIndex:     domain_index,
      questionIndex:   question_index,
      responseText:    response_text,
      energySignal:    typeof energy_signal === "number" ? energy_signal : null,
      invisibleWorkFlag: false,
      makSessionId:    mak_session_id ?? null,
    },
    auth.demo,
  );

  return jsonOk({
    saved: true,
    distress_flag: row.distress_flag,
    id: row.id,
  }, 201);
}

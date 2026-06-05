import { getAppUser, upsertAppUser } from "@/lib/v2/api-helpers";
import { getServerDemo } from "@/lib/v2/demo-store";
import { deployedInstruments } from "@/lib/v2/onboarding-touchpoint1";
import {
  clustersForInstruments,
  extractClusterValue,
  formatInstrumentCheckInDisplay,
  instrumentProgress,
  scoreWho5,
  type InstrumentAnswer,
} from "@/lib/v2/onboarding-instruments";
import { CRISIS_LANGUAGE_PATTERN } from "@/lib/v2/escalation-protocols";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";
import type { AppUser } from "@/lib/v2/types";

const WHO5_CONCERN_THRESHOLD = 28;
const WHO5_ITEM_IDS = ["who5-cheerful", "who5-calm", "who5-active", "who5-rested", "who5-interest"];

// WHO-5 < 28 (percentage score) OR crisis language → deploy PHQ-2 as follow-up.
// MDT ≥ 4 trigger requires a weekly_pulse query not available here — handled separately.
function shouldTriggerPhq2(answers: InstrumentAnswer[], message: string): boolean {
  if (CRISIS_LANGUAGE_PATTERN.test(message)) return true;
  if (WHO5_ITEM_IDS.every((id) => answers.some((a) => a.clusterId === id))) {
    const score = scoreWho5(answers);
    if (score.composite != null && score.composite < WHO5_CONCERN_THRESHOLD) return true;
  }
  return false;
}

export async function processInstrumentTurn(
  user: AppUser,
  userId: string,
  demo: boolean,
  message: string,
): Promise<{
  captured: string[];
  pendingCluster: { id: string; makPrompt: string } | null;
  instrumentsComplete: boolean;
}> {
  const meta = getOnboardingMetadata(user);
  let instrumentIds: string[] =
    meta.instrument_ids ??
    deployedInstruments(user.career_stage, user.practice_setting).map((i) => i.id);
  const answers: InstrumentAnswer[] = [...(meta.instrument_answers ?? [])];
  const clusters = clustersForInstruments(instrumentIds);
  const answeredIds = new Set(answers.map((a) => a.clusterId));
  const pending = clusters.filter((c) => !answeredIds.has(c.id));

  const captured: string[] = [];
  for (const cluster of pending) {
    const value = extractClusterValue(message, cluster);
    if (value == null) continue;
    answers.push({
      clusterId: cluster.id,
      value,
      capturedAt: new Date().toISOString(),
    });
    captured.push(cluster.id);
    break;
  }

  // PHQ-2 trigger: inject after capturing the current answer so WHO-5 completeness is current.
  let injectedPhq2 = false;
  if (!instrumentIds.includes("phq2") && shouldTriggerPhq2(answers, message)) {
    instrumentIds = [...instrumentIds, "phq2"];
    injectedPhq2 = true;
  }

  if (captured.length > 0 || injectedPhq2) {
    const updatedMeta = {
      ...meta,
      instrument_ids: instrumentIds,
      instrument_answers: answers,
    };
    await upsertAppUser(
      userId,
      user.email,
      { onboarding_metadata: updatedMeta as Record<string, unknown> },
      demo,
    );
    if (demo) {
      getServerDemo(userId).user.onboarding_metadata = updatedMeta as Record<string, unknown>;
    }
  }

  const progress = instrumentProgress(instrumentIds, answers);
  return {
    captured,
    pendingCluster: progress.pendingCluster
      ? {
          id: progress.pendingCluster.id,
          makPrompt: formatInstrumentCheckInDisplay(progress.pendingCluster),
        }
      : null,
    instrumentsComplete: progress.answered >= progress.total && progress.total > 0,
  };
}

export { nextInstrumentPrompt } from "@/lib/v2/instrument-conversation-prompts";

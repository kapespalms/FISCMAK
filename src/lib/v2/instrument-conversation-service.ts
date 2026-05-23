import { getAppUser, upsertAppUser } from "@/lib/v2/api-helpers";
import { getServerDemo } from "@/lib/v2/demo-store";
import { deployedInstruments } from "@/lib/v2/onboarding-touchpoint1";
import {
  clustersForInstruments,
  extractClusterValue,
  instrumentProgress,
  type InstrumentAnswer,
} from "@/lib/v2/onboarding-instruments";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";
import type { AppUser } from "@/lib/v2/types";

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
  const instrumentIds =
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

  if (captured.length > 0) {
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
      ? { id: progress.pendingCluster.id, makPrompt: progress.pendingCluster.makPrompt }
      : null,
    instrumentsComplete: progress.answered >= progress.total && progress.total > 0,
  };
}

export function nextInstrumentPrompt(user: AppUser): string | null {
  const meta = getOnboardingMetadata(user);
  const instrumentIds =
    meta.instrument_ids ??
    deployedInstruments(user.career_stage, user.practice_setting).map((i) => i.id);
  const progress = instrumentProgress(instrumentIds, meta.instrument_answers ?? []);
  return progress.pendingCluster?.makPrompt ?? null;
}

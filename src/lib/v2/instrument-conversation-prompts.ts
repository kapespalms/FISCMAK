import { deployedInstruments } from "@/lib/v2/onboarding-touchpoint1";
import {
  formatInstrumentCheckInDisplay,
  instrumentProgress,
} from "@/lib/v2/onboarding-instruments";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";
import type { AppUser } from "@/lib/v2/types";

/** Client-safe — no server Supabase imports. Returns verbatim stem + Mak framing for check-in UI. */
export function nextInstrumentPrompt(user: AppUser): string | null {
  const meta = getOnboardingMetadata(user);
  const instrumentIds =
    meta.instrument_ids ??
    deployedInstruments(user.career_stage, user.practice_setting).map((i) => i.id);
  const progress = instrumentProgress(instrumentIds, meta.instrument_answers ?? []);
  return progress.pendingCluster
    ? formatInstrumentCheckInDisplay(progress.pendingCluster)
    : null;
}

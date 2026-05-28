import { deployedInstruments } from "@/lib/v2/onboarding-touchpoint1";
import { instrumentProgress } from "@/lib/v2/onboarding-instruments";
import { getOnboardingMetadata, type OnboardingMetadata } from "@/lib/v2/onboarding-compute";
import type { AppUser } from "@/lib/v2/types";

export function instrumentIdsForUser(user: AppUser, meta?: OnboardingMetadata): string[] {
  const m = meta ?? getOnboardingMetadata(user);
  return (
    m.instrument_ids ??
    deployedInstruments(user.career_stage, user.practice_setting ?? null).map((i) => i.id)
  );
}

export function instrumentsDeferred(meta: OnboardingMetadata): boolean {
  return Boolean(meta.instruments_deferred_at || meta.instruments_skipped_at);
}

export function instrumentsPending(user: AppUser, meta?: OnboardingMetadata): boolean {
  const m = meta ?? getOnboardingMetadata(user);
  if (instrumentsDeferred(m)) return false;
  const ids = instrumentIdsForUser(user, m);
  const progress = instrumentProgress(ids, m.instrument_answers ?? []);
  return progress.total > 0 && progress.answered < progress.total;
}

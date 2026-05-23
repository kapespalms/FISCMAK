import type { AppUser } from "@/lib/v2/types";
import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";

/** Quarterly pulse + annual refresh available after onboarding instruments or full tier 3. */
export function touchpointsEligible(
  user: AppUser,
  meta: OnboardingMetadata = {},
): boolean {
  if (user.tier3_complete) return true;
  if (meta.computed_at) return true;
  return Boolean(user.tier1_complete && user.tier2_complete);
}

export function isValidTouchpointAnswer(value: string | number | null | undefined): boolean {
  if (value == null || value === "") return false;
  if (typeof value === "number") return !Number.isNaN(value);
  return String(value).trim().length > 0;
}

export function filterTouchpointAnswers<T extends { value: string | number }>(
  answers: T[],
): T[] {
  return answers.filter((a) => isValidTouchpointAnswer(a.value));
}

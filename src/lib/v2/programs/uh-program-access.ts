import {
  onboardingPathFromMetadata,
  type OnboardingPathContext,
} from "@/lib/v2/onboarding-path";
import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";
import { programHasFullContent } from "@/lib/v2/programs/registry";
import { UH_PSYCH_PROGRAM_SLUG } from "@/lib/v2/programs/uh-residency-content";

export function hasUhPsychProgramAccess(ctx: OnboardingPathContext | null): boolean {
  if (!ctx) return false;
  return (
    ctx.path === "institutional" &&
    ctx.program_slug === UH_PSYCH_PROGRAM_SLUG &&
    programHasFullContent(ctx.program)
  );
}

export function uhPsychAccessFromMetadata(meta?: OnboardingMetadata | null): boolean {
  return hasUhPsychProgramAccess(onboardingPathFromMetadata(meta));
}

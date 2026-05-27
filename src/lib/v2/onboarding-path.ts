import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";
import {
  getProgramById,
  getProgramBySlug,
  type ResidencyProgram,
} from "@/lib/v2/programs/registry";

export type OnboardingPath = "public" | "institutional";

export type OnboardingPathContext = {
  path: OnboardingPath;
  program: ResidencyProgram | null;
  program_id: string | null;
  program_slug: string | null;
  trainee_initials: string | null;
};

export function resolveOnboardingPathFromParams(input: {
  programParam?: string | null;
  pathParam?: string | null;
  meta?: OnboardingMetadata;
}): OnboardingPathContext | null {
  const fromMeta = onboardingPathFromMetadata(input.meta);
  if (fromMeta) return fromMeta;

  const programFromUrl = getProgramBySlug(input.programParam);
  if (programFromUrl) {
    return {
      path: "institutional",
      program: programFromUrl,
      program_id: programFromUrl.id,
      program_slug: programFromUrl.slug,
      trainee_initials: null,
    };
  }

  if (input.pathParam === "public") {
    return {
      path: "public",
      program: null,
      program_id: null,
      program_slug: null,
      trainee_initials: null,
    };
  }

  return null;
}

export function onboardingPathFromMetadata(
  meta?: OnboardingMetadata | null,
): OnboardingPathContext | null {
  if (!meta?.onboarding_path) return null;

  const program =
    getProgramById(meta.program_id) ?? getProgramBySlug(meta.program_slug) ?? null;

  if (meta.onboarding_path === "institutional" && !program) return null;

  return {
    path: meta.onboarding_path,
    program,
    program_id: meta.program_id ?? program?.id ?? null,
    program_slug: meta.program_slug ?? program?.slug ?? null,
    trainee_initials: meta.trainee_initials ?? null,
  };
}

export function onboardingPathChosen(meta?: OnboardingMetadata | null): boolean {
  return Boolean(meta?.onboarding_path);
}

export function buildOnboardingPathMetadata(input: {
  path: OnboardingPath;
  program?: ResidencyProgram | null;
  trainee_initials?: string | null;
}): Partial<OnboardingMetadata> {
  if (input.path === "public") {
    return {
      onboarding_path: "public",
      program_id: undefined,
      program_slug: undefined,
      trainee_initials: undefined,
    };
  }

  const program = input.program;
  if (!program) {
    throw new Error("Institutional onboarding requires a program");
  }

  return {
    onboarding_path: "institutional",
    program_id: program.id,
    program_slug: program.slug,
    trainee_initials: input.trainee_initials?.trim() || undefined,
  };
}

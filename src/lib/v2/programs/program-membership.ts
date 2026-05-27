import type { CareerLevel } from "@/lib/v2/onboarding-options";
import { contentPackFor } from "@/lib/v2/profile-contract";
import type { MakContentPack } from "@/lib/v2/mak-conversation-models";
import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";
import type { ResidencyProgram } from "@/lib/v2/programs/registry";

export type ProgramMembershipRecord = {
  membership_id: string;
  program_id: string;
  user_id: string;
  role: "trainee";
  pgy_level?: string | null;
  active: boolean;
  created_at: string;
};

/** @deprecated Prefer contentPackFor / resolveProfileContractFromUser */
export function deriveContentPack(
  careerStage: CareerLevel | null | undefined,
  institutional: boolean,
): MakContentPack {
  return contentPackFor(careerStage, institutional);
}

export function buildProgramMembershipPatch(input: {
  userId: string;
  program: ResidencyProgram;
  pgyLevel?: string | null;
  priorMeta?: OnboardingMetadata;
}): {
  primary_program_id: string;
  content_pack: MakContentPack;
  onboarding_metadata: Partial<OnboardingMetadata>;
} {
  const membership: ProgramMembershipRecord = {
    membership_id: crypto.randomUUID(),
    program_id: input.program.id,
    user_id: input.userId,
    role: "trainee",
    pgy_level: input.pgyLevel ?? null,
    active: true,
    created_at: new Date().toISOString(),
  };

  return {
    primary_program_id: input.program.id,
    content_pack: "trainee",
    onboarding_metadata: {
      ...(input.priorMeta ?? {}),
      program_membership: membership,
    },
  };
}

export function clearProgramMembershipPatch(
  priorMeta: OnboardingMetadata,
): Partial<OnboardingMetadata> {
  const next = { ...priorMeta };
  delete next.program_membership;
  return next;
}

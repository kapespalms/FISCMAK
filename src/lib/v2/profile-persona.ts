import type { CareerLevel, PracticeSetting } from "@/lib/v2/onboarding-options";
import type { OnboardingPath } from "@/lib/v2/onboarding-path";
import type { ResidencyProgram } from "@/lib/v2/programs/registry";
import { UH_PSYCH_CMC_PROGRAM } from "@/lib/v2/programs/registry";

/**
 * MECE persona partition — every onboarded user maps to exactly one persona.
 * Practice setting modulates the profile contract but does not change persona identity.
 */
export type PersonaId =
  | "public_med_student"
  | "public_resident"
  | "public_fellow"
  | "public_early_attending"
  | "public_mid_attending"
  | "public_late_attending"
  | "public_retired"
  | "institutional_program_trainee";

export const PERSONA_IDS: readonly PersonaId[] = [
  "public_med_student",
  "public_resident",
  "public_fellow",
  "public_early_attending",
  "public_mid_attending",
  "public_late_attending",
  "public_retired",
  "institutional_program_trainee",
] as const;

export type ResolvePersonaInput = {
  onboarding_path: OnboardingPath;
  career_stage: CareerLevel | null;
  program?: ResidencyProgram | null;
};

/** Map career stage → public persona. Institutional uses program policy separately. */
const PUBLIC_PERSONA_BY_STAGE: Record<CareerLevel, PersonaId> = {
  "Medical Student": "public_med_student",
  Resident: "public_resident",
  Fellow: "public_fellow",
  "Early Career (0–7 yr)": "public_early_attending",
  "Mid-Career (8–20 yr)": "public_mid_attending",
  "Late Career (20+ yr)": "public_late_attending",
  Retired: "public_retired",
};

export function resolvePersona(input: ResolvePersonaInput): PersonaId | null {
  if (input.onboarding_path === "institutional") {
    const program = input.program ?? null;
    if (!program) return null;
    if (input.career_stage !== "Resident" && input.career_stage !== "Fellow") {
      return null;
    }
    if (
      !program.career_stages_allowed.includes(input.career_stage as "Resident" | "Fellow")
    ) {
      return null;
    }
    return "institutional_program_trainee";
  }

  if (!input.career_stage) return null;
  return PUBLIC_PERSONA_BY_STAGE[input.career_stage] ?? null;
}

export function isInstitutionalPersona(persona: PersonaId): boolean {
  return persona === "institutional_program_trainee";
}

export type AuditScenarioSpec = {
  persona_id: PersonaId;
  onboarding_path: OnboardingPath;
  career_stage: CareerLevel;
  practice_setting: PracticeSetting;
  program: ResidencyProgram | null;
};

/** Valid audit matrix only — no impossible institutional × career combinations. */
export function listAuditScenarioSpecs(
  practiceSettings: readonly PracticeSetting[],
): AuditScenarioSpec[] {
  const specs: AuditScenarioSpec[] = [];

  for (const careerStage of Object.keys(PUBLIC_PERSONA_BY_STAGE) as CareerLevel[]) {
    const persona_id = PUBLIC_PERSONA_BY_STAGE[careerStage];
    for (const practice_setting of practiceSettings) {
      specs.push({
        persona_id,
        onboarding_path: "public",
        career_stage: careerStage,
        practice_setting,
        program: null,
      });
    }
  }

  for (const career_stage of UH_PSYCH_CMC_PROGRAM.career_stages_allowed) {
    specs.push({
      persona_id: "institutional_program_trainee",
      onboarding_path: "institutional",
      career_stage,
      practice_setting: UH_PSYCH_CMC_PROGRAM.default_practice_setting,
      program: UH_PSYCH_CMC_PROGRAM,
    });
  }

  return specs;
}

export function auditScenarioId(spec: AuditScenarioSpec): string {
  const setting = spec.practice_setting.toLowerCase().replace(/\s+/g, "_");
  return `${spec.persona_id}:${setting}`;
}

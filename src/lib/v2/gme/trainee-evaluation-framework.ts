import type { CareerLevel } from "@/lib/v2/onboarding-options";
import { isTraineeCareerLevel } from "@/lib/v2/onboarding-options";
import {
  type AcgmeSubcompetency,
  type AcgmeUniversalCompetency,
  type MilestoneFrameworkStatus,
  getMilestoneFrameworkMeta,
  getPrimaryForSubspecialty,
  getPrimarySpecialty,
  getSpecialtySubcompetencies,
  getUniversalCompetencies,
  normalizeToAcgmePrimaryName,
  normalizeToAcgmeSubspecialtyName,
} from "@/lib/v2/gme/acgme-specialty-registry";

export type TraineeEvaluationFramework = {
  /** Always present for residents/fellows */
  universal_competencies: AcgmeUniversalCompetency[];
  /** Resolved primary residency specialty (ACGME Appendix B) */
  primary_specialty: string;
  primary_slug: string;
  /** Fellowship subspecialty when applicable */
  subspecialty: string | null;
  /** Which milestone set applies to self-assessment / eval import */
  evaluation_primary_slug: string;
  evaluation_primary_name: string;
  milestone_status: MilestoneFrameworkStatus;
  milestone_version: string | null;
  subcompetencies: AcgmeSubcompetency[];
  mapping_notes: string[];
};

export type ResolveTraineeFrameworkInput = {
  career_stage: CareerLevel | null | undefined;
  base_specialty: string | null | undefined;
  subspecialty?: string | null;
  subspecialty_training_complete?: boolean;
};

export function resolveTraineeEvaluationFramework(
  input: ResolveTraineeFrameworkInput,
): TraineeEvaluationFramework | null {
  if (!isTraineeCareerLevel(input.career_stage)) return null;

  const mapping_notes: string[] = [];
  let primaryName = normalizeToAcgmePrimaryName(input.base_specialty ?? "");
  let subspecialtyName = input.subspecialty
    ? normalizeToAcgmeSubspecialtyName(input.subspecialty, input.base_specialty ?? undefined)
    : null;

  if (!primaryName && subspecialtyName) {
    const inferred = getPrimaryForSubspecialty(subspecialtyName);
    if (inferred) {
      primaryName = inferred.name;
      mapping_notes.push(
        `Inferred primary specialty ${inferred.name} from subspecialty ${subspecialtyName}.`,
      );
    }
  }

  if (!primaryName) {
    return null;
  }

  const primary = getPrimarySpecialty(primaryName);
  if (!primary) return null;

  if (input.career_stage === "Fellow") {
    if (!subspecialtyName) {
      mapping_notes.push(
        "Fellow without subspecialty — using primary specialty milestone framework until subspecialty is set.",
      );
    } else if (!primary.subspecialties.includes(subspecialtyName)) {
      const parent = getPrimaryForSubspecialty(subspecialtyName);
      if (parent && parent.name !== primary.name) {
        mapping_notes.push(
          `Subspecialty ${subspecialtyName} maps to ${parent.name}; evaluation framework follows fellowship parent.`,
        );
        primaryName = parent.name;
      }
    }
  }

  if (input.career_stage === "Resident" && subspecialtyName) {
    mapping_notes.push(
      "Residents use primary specialty milestones; subspecialty selection stored for career planning only.",
    );
    subspecialtyName = null;
  }

  const evaluationPrimary = getPrimarySpecialty(primaryName)!;
  const frameworkMeta = getMilestoneFrameworkMeta(evaluationPrimary.slug);
  const milestone_status: MilestoneFrameworkStatus =
    frameworkMeta?.status === "seeded" ? "seeded" : "universal_only";
  const subcompetencies = getSpecialtySubcompetencies(evaluationPrimary.slug);

  if (milestone_status === "universal_only") {
    mapping_notes.push(
      `Specialty-specific ACGME milestones for ${evaluationPrimary.name} are not seeded yet — universal six competencies apply.`,
    );
  }

  if (subspecialtyName && input.career_stage === "Fellow") {
    mapping_notes.push(
      `Fellowship program ${subspecialtyName} may use additional form-specific eval items; map via program crosswalk when imported.`,
    );
  }

  return {
    universal_competencies: getUniversalCompetencies(),
    primary_specialty: primary.name,
    primary_slug: primary.slug,
    subspecialty: subspecialtyName,
    evaluation_primary_slug: evaluationPrimary.slug,
    evaluation_primary_name: evaluationPrimary.name,
    milestone_status,
    milestone_version: frameworkMeta?.milestone_version ?? null,
    subcompetencies,
    mapping_notes,
  };
}

export function validateTraineeSpecialtySelection(input: ResolveTraineeFrameworkInput): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  if (!isTraineeCareerLevel(input.career_stage)) {
    return { valid: true, errors };
  }

  const primary = normalizeToAcgmePrimaryName(input.base_specialty ?? "");
  if (!primary) {
    errors.push("Select an ACGME-accredited primary specialty for your training program.");
    return { valid: false, errors };
  }

  if (input.career_stage === "Fellow") {
    const sub = input.subspecialty
      ? normalizeToAcgmeSubspecialtyName(input.subspecialty, primary)
      : null;
    if (!sub) {
      errors.push("Fellows must select a fellowship subspecialty mapped to an ACGME program.");
    }
    // Fellows may enter multidisciplinary or cross-primary fellowships (e.g. sleep medicine
    // after anesthesiology residency). Any valid Appendix B subspecialty program is accepted.
  }

  if (input.career_stage === "Resident") {
    const sub = input.subspecialty?.trim();
    if (sub) {
      errors.push("Residents should select a primary specialty only; add fellowship subspecialty when you enter fellowship.");
    }
  }

  return { valid: errors.length === 0, errors };
}

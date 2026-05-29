/**
 * UH Psychiatry rotation curriculum seeds — resident-visible MedHub goals where seeded.
 */

import inpatientPsych from "../../../../docs/seeds/uh_curriculum_inpatient_psychiatry.json";
import { listRotationOrientationIndex } from "@/lib/v2/programs/rotation-orientation";

export type RotationCurriculumMeta = {
  service_name: string;
  program: string;
  medhub_curriculum_path: string;
  effective_date?: string;
  sites?: string[];
};

export type PgyCurriculumTrack = {
  pgy_level: string;
  portal_track?: string;
  role?: string;
  milestone_targets: Record<string, string[]>;
  other_competency_objectives?: string[];
  goal_domains?: string[];
};

export type RotationCurriculum = {
  rotation: RotationCurriculumMeta;
  pgy_tracks: PgyCurriculumTrack[];
};

const CURRICULUM_BY_SEED: Record<string, RotationCurriculum> = {
  "uh_curriculum_inpatient_psychiatry.json": inpatientPsych as RotationCurriculum,
};

/** Rotations covered by the inpatient psych curriculum seed (multi-site). */
const INPATIENT_PSYCH_CURRICULUM_ROTATIONS = new Set([
  "va_ct6",
  "uh_concord",
  "swg",
  "northcoast",
]);

export function getCurriculumSeedForRotation(rotationCode: string): string | null {
  const entry = listRotationOrientationIndex().find((e) => e.rotation_code === rotationCode);
  const seed = entry?.curriculum_seed;
  if (!seed || seed === "elective_catalog.json") return null;
  return seed;
}

export function getCurriculumForRotation(rotationCode: string): RotationCurriculum | null {
  const seed = getCurriculumSeedForRotation(rotationCode);
  if (seed) return CURRICULUM_BY_SEED[seed] ?? null;
  if (INPATIENT_PSYCH_CURRICULUM_ROTATIONS.has(rotationCode)) {
    return CURRICULUM_BY_SEED["uh_curriculum_inpatient_psychiatry.json"] ?? null;
  }
  return null;
}

export type CurriculumMetaSummary = {
  rotation_code: string;
  service_name: string;
  medhub_curriculum_path: string;
  effective_date?: string;
  sites?: string[];
  has_milestone_tracks: boolean;
  source: "seed" | "shared_inpatient" | "website_section";
};

/** Index-driven curriculum metadata — with or without full milestone tracks. */
export function getCurriculumMetaForRotation(rotationCode: string): CurriculumMetaSummary | null {
  const entry = listRotationOrientationIndex().find((e) => e.rotation_code === rotationCode);
  if (!entry) return null;

  const seed = getCurriculumSeedForRotation(rotationCode);
  const full = getCurriculumForRotation(rotationCode);

  if (full && seed) {
    return {
      rotation_code: rotationCode,
      service_name: entry.service_name,
      medhub_curriculum_path: full.rotation.medhub_curriculum_path,
      effective_date: full.rotation.effective_date,
      sites: full.rotation.sites,
      has_milestone_tracks: true,
      source: "seed",
    };
  }

  if (full && INPATIENT_PSYCH_CURRICULUM_ROTATIONS.has(rotationCode)) {
    return {
      rotation_code: rotationCode,
      service_name: entry.service_name,
      medhub_curriculum_path: full.rotation.medhub_curriculum_path,
      effective_date: full.rotation.effective_date,
      sites: full.rotation.sites,
      has_milestone_tracks: false,
      source: "shared_inpatient",
    };
  }

  if (entry.website_section) {
    return {
      rotation_code: rotationCode,
      service_name: entry.service_name,
      medhub_curriculum_path: `Home > Curriculum Objectives > ${entry.website_section}`,
      has_milestone_tracks: false,
      source: "website_section",
    };
  }

  return null;
}

/** Human-readable milestone target, e.g. "L1:A,B,C" → "Level 1 — A, B, C" */
export function formatMilestoneTarget(raw: string): string {
  const match = raw.match(/^L(\d+):(.+)$/i);
  if (!match) return raw;
  const items = match[2]
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .join(", ");
  return `Level ${match[1]} — ${items}`;
}

export const MILESTONE_LABELS: Record<string, string> = {
  PC1: "Patient care — psychiatric evaluation",
  PC2: "Patient care — psychotherapy",
  PC3: "Patient care — pharmacotherapy",
  PC4: "Patient care — acute care",
  PC5: "Patient care — longitudinal care",
  PC6: "Patient care — procedures",
  MK1: "Medical knowledge — science",
  MK2: "Medical knowledge — clinical knowledge",
  MK3: "Medical knowledge — critical thinking",
  MK4: "Medical knowledge — research",
  SBP1: "Systems — cost awareness",
  SBP2: "Systems — systems navigation",
  SBP3: "Systems — patient safety",
  PBLI1: "Practice-based learning — self-assessment",
  PBLI2: "Practice-based learning — improvement",
  PROF1: "Professionalism — compassion",
  PROF2: "Professionalism — accountability",
  PROF3: "Professionalism — sensitivity",
  ICS1: "Interpersonal — rapport",
  ICS2: "Interpersonal — team communication",
  ICS3: "Interpersonal — conflict resolution",
};

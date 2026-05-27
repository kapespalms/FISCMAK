import type { ProgramRotation, ResidencyProgram } from "@/lib/v2/programs/registry";
import {
  UH_INSTITUTION_NAME,
  UH_INSTITUTION_SHORT,
} from "@/lib/v2/programs/institution-brand";

/** Generic rotation vocabulary for blank pathways (no institution-specific seeds). */
export const GENERIC_TRAINEE_ROTATIONS: ProgramRotation[] = [
  { code: "inpatient", label: "Inpatient", category: "psychiatry_core" },
  { code: "outpatient", label: "Outpatient / Clinic", category: "psychiatry_core" },
  { code: "consult", label: "Consult Service", category: "psychiatry_core" },
  { code: "icu", label: "ICU / Critical Care", category: "off_service" },
  { code: "ed", label: "Emergency Department", category: "off_service" },
  { code: "night_float", label: "Night Float", category: "operational" },
  { code: "call", label: "Call", category: "operational" },
  { code: "elective", label: "Elective", category: "elective" },
  { code: "research", label: "Research / QI", category: "elective" },
  { code: "vacation", label: "Vacation", category: "operational" },
];

export function createBlankPathwayProgram(config: {
  id: string;
  slug: string;
  institution_name: string;
  program_name: string;
  display_title: string;
  base_specialty: string;
  academic_year?: string;
}): ResidencyProgram {
  return {
    ...config,
    specialty_locked: true,
    default_practice_setting: "Academic",
    default_career_stage: "Resident",
    career_stages_allowed: ["Resident", "Fellow"],
    academic_year: config.academic_year ?? "2026–2027",
    content_tier: "blank",
    invite_slot_capacity: 60,
    rotations: GENERIC_TRAINEE_ROTATIONS,
    welcome_blurb: `FISCMAK for ${config.program_name} trainees — capture rotation evidence, ILP-ready reflections, and career narrative.`,
  };
}

export function createUhBlankPathwayProgram(config: {
  id: string;
  slug: string;
  program_name: string;
  base_specialty: string;
  academic_year?: string;
}): ResidencyProgram {
  return createBlankPathwayProgram({
    ...config,
    institution_name: UH_INSTITUTION_NAME,
    display_title: `${UH_INSTITUTION_SHORT} — ${config.program_name}`,
  });
}

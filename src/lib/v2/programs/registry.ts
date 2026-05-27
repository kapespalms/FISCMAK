/**
 * Residency program registry — institutional onboarding.
 * UH Psychiatry = full content tier; blank pathways = generic rotations only.
 */

import { createBlankPathwayProgram, createUhBlankPathwayProgram } from "@/lib/v2/programs/blank-pathway";
import { UH_INSTITUTION_SHORT } from "@/lib/v2/programs/institution-brand";

export type ProgramContentTier = "full" | "blank";

export type ProgramRotation = {
  code: string;
  label: string;
  category: "psychiatry_core" | "off_service" | "operational" | "elective";
};

export type ResidencyProgram = {
  id: string;
  slug: string;
  institution_name: string;
  program_name: string;
  /** Display title for onboarding */
  display_title: string;
  base_specialty: string;
  specialty_locked: boolean;
  default_practice_setting: "Academic";
  default_career_stage: "Resident";
  career_stages_allowed: Array<"Resident" | "Fellow">;
  academic_year: string;
  content_tier: ProgramContentTier;
  invite_slot_capacity: number;
  schedule_source?: string;
  rotations: ProgramRotation[];
  welcome_blurb: string;
};

export const UH_PSYCH_CMC_ROTATIONS: ProgramRotation[] = [
  { code: "va_ct6", label: "VA CT6 (Inpatient)", category: "psychiatry_core" },
  { code: "uh_concord", label: "UH Concord (Inpatient)", category: "psychiatry_core" },
  { code: "swg", label: "SWG (Inpatient)", category: "psychiatry_core" },
  { code: "northcoast", label: "Northcoast (Inpatient)", category: "psychiatry_core" },
  { code: "capu", label: "CAPU / Portals (Child Inpatient)", category: "psychiatry_core" },
  { code: "psych_ed_uh", label: "Psychiatric Emergency — UH", category: "psychiatry_core" },
  { code: "psych_ed_uh_va", label: "Psychiatric Emergency — UH/VA", category: "psychiatry_core" },
  { code: "cl", label: "Consult-Liaison Psychiatry", category: "psychiatry_core" },
  { code: "mpu_cl", label: "MPU-CL", category: "psychiatry_core" },
  { code: "child_cl", label: "Child Consult-Liaison", category: "psychiatry_core" },
  { code: "outpatient_addiction", label: "Outpatient Addiction", category: "psychiatry_core" },
  { code: "va_addiction", label: "VA Addiction", category: "psychiatry_core" },
  { code: "mat_addiction", label: "MAT Addiction", category: "psychiatry_core" },
  { code: "geriatric_psychiatry", label: "Geriatric Psychiatry", category: "psychiatry_core" },
  { code: "uh_interventional", label: "UH Interventional Psychiatry", category: "psychiatry_core" },
  { code: "access_clinic", label: "Access Clinic", category: "psychiatry_core" },
  { code: "psychotherapy_clinic", label: "Resident Psychotherapy Clinic", category: "psychiatry_core" },
  { code: "outpatient_adult", label: "Outpatient Adult Clinics", category: "psychiatry_core" },
  { code: "outpatient_child", label: "Outpatient Child Clinics", category: "psychiatry_core" },
  { code: "call", label: "Call (PGY1/PGY2)", category: "operational" },
  { code: "extra_duty", label: "Extra Duty", category: "operational" },
  { code: "neurology", label: "Neurology (Off-service)", category: "off_service" },
  { code: "va_im", label: "VA Internal Medicine", category: "off_service" },
  { code: "va_ed_im", label: "VA ED for IM", category: "off_service" },
  { code: "uh_ed", label: "UH Emergency Department", category: "off_service" },
  { code: "uh_im", label: "UH Internal Medicine", category: "off_service" },
  { code: "pediatrics", label: "Pediatrics", category: "off_service" },
  { code: "peds_ed", label: "Pediatrics ED", category: "off_service" },
  { code: "medtox", label: "Medical Toxicology", category: "off_service" },
  { code: "elective", label: "Elective", category: "elective" },
  { code: "qi", label: "Quality Improvement", category: "elective" },
  { code: "nf", label: "Night Float", category: "operational" },
  { code: "vacation", label: "Vacation", category: "operational" },
];

export const UH_PSYCH_CMC_PROGRAM: ResidencyProgram = {
  id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  slug: "uh-psych-cmc",
  institution_name: "University Hospitals Cleveland Medical Center",
  program_name: "Psychiatry Residency",
  display_title: `${UH_INSTITUTION_SHORT} — Psychiatry Residency`,
  base_specialty: "Psychiatry",
  specialty_locked: true,
  default_practice_setting: "Academic",
  default_career_stage: "Resident",
  career_stages_allowed: ["Resident", "Fellow"],
  academic_year: "2026–2027",
  content_tier: "full",
  invite_slot_capacity: 60,
  schedule_source: "docs/seeds/psychiatry_uh_2026_2027_block_schedule.json",
  rotations: UH_PSYCH_CMC_ROTATIONS,
  welcome_blurb:
    "FISCMAK for UH Psychiatry residents captures rotation evidence, ILP-ready reflections, and semiannual CCC narrative — alongside MedHub, not instead of it.",
};

export const PATHWAY_INTERNAL_MEDICINE = createUhBlankPathwayProgram({
  id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  slug: "pathway-internal-medicine",
  program_name: "Internal Medicine Residency",
  base_specialty: "Internal Medicine",
});

export const PATHWAY_FAMILY_MEDICINE = createUhBlankPathwayProgram({
  id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
  slug: "pathway-family-medicine",
  program_name: "Family Medicine Residency",
  base_specialty: "Family Medicine",
});

export const PATHWAY_PEDIATRICS = createUhBlankPathwayProgram({
  id: "d4e5f6a7-b8c9-0123-def0-234567890123",
  slug: "pathway-pediatrics",
  program_name: "Pediatrics Residency",
  base_specialty: "Pediatrics",
});

export const PATHWAY_SURGERY = createUhBlankPathwayProgram({
  id: "e5f6a7b8-c9d0-1234-ef01-345678901234",
  slug: "pathway-surgery",
  program_name: "General Surgery Residency",
  base_specialty: "Surgery",
});

const ALL_PROGRAMS: ResidencyProgram[] = [
  UH_PSYCH_CMC_PROGRAM,
  PATHWAY_INTERNAL_MEDICINE,
  PATHWAY_FAMILY_MEDICINE,
  PATHWAY_PEDIATRICS,
  PATHWAY_SURGERY,
];

const PROGRAMS_BY_SLUG: Record<string, ResidencyProgram> = Object.fromEntries(
  ALL_PROGRAMS.map((p) => [p.slug, p]),
);

const PROGRAMS_BY_ID: Record<string, ResidencyProgram> = Object.fromEntries(
  ALL_PROGRAMS.map((p) => [p.id, p]),
);

export function listResidencyPrograms(): ResidencyProgram[] {
  return ALL_PROGRAMS;
}

export function getProgramBySlug(slug: string | null | undefined): ResidencyProgram | null {
  if (!slug) return null;
  return PROGRAMS_BY_SLUG[slug.trim().toLowerCase()] ?? null;
}

export function getProgramById(id: string | null | undefined): ResidencyProgram | null {
  if (!id) return null;
  return PROGRAMS_BY_ID[id] ?? null;
}

export function programHasFullContent(program: ResidencyProgram | null | undefined): boolean {
  return program?.content_tier === "full";
}

export function rotationLabel(program: ResidencyProgram, codeOrLabel: string): string {
  const match = program.rotations.find(
    (r) => r.code === codeOrLabel || r.label === codeOrLabel,
  );
  return match?.label ?? codeOrLabel;
}

export function buildProgramMakContext(input: {
  program?: ResidencyProgram | null;
  trainee_initials?: string | null;
  current_rotation?: string | null;
  pgy_level?: string | null;
}): string {
  const program = input.program;
  if (!program) return "";

  const rotation = input.current_rotation
    ? rotationLabel(program, input.current_rotation)
    : null;

  const coachingLine =
    program.content_tier === "full"
      ? "Use program rotation vocabulary. Link captures to ILP SMART goals, ACGME subcompetencies, and rotation debriefs when natural. Do not auto-fill milestone ratings."
      : "Use standard GME trainee coaching. Program-specific rotation packs are not loaded yet — focus on universal career evidence and goals.";

  return [
    `Institutional program context:`,
    `- Program: ${program.display_title}`,
    `- Institution: ${program.institution_name}`,
    `- Academic year: ${program.academic_year}`,
    input.pgy_level ? `- PGY: ${input.pgy_level}` : "",
    input.trainee_initials ? `- Trainee initials (roster): ${input.trainee_initials}` : "",
    rotation ? `- Current rotation: ${rotation}` : "",
    coachingLine,
  ]
    .filter(Boolean)
    .join("\n");
}

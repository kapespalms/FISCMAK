/**
 * Residency program registry — institutional onboarding (pilot: UH Psychiatry).
 * Production: migrate to `programs` + `program_memberships` tables (see MVP_GME_BACKEND_SPEC).
 */

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
  display_title: "University Hospitals — Psychiatry Residency",
  base_specialty: "Psychiatry",
  specialty_locked: true,
  default_practice_setting: "Academic",
  default_career_stage: "Resident",
  career_stages_allowed: ["Resident", "Fellow"],
  academic_year: "2026–2027",
  schedule_source: "docs/seeds/psychiatry_uh_2026_2027_block_schedule.json",
  rotations: UH_PSYCH_CMC_ROTATIONS,
  welcome_blurb:
    "FISCMAK for UH Psychiatry residents captures rotation evidence, ILP-ready reflections, and semiannual CCC narrative — alongside MedHub, not instead of it.",
};

const PROGRAMS_BY_SLUG: Record<string, ResidencyProgram> = {
  [UH_PSYCH_CMC_PROGRAM.slug]: UH_PSYCH_CMC_PROGRAM,
};

const PROGRAMS_BY_ID: Record<string, ResidencyProgram> = {
  [UH_PSYCH_CMC_PROGRAM.id]: UH_PSYCH_CMC_PROGRAM,
};

export function listResidencyPrograms(): ResidencyProgram[] {
  return Object.values(PROGRAMS_BY_SLUG);
}

export function getProgramBySlug(slug: string | null | undefined): ResidencyProgram | null {
  if (!slug) return null;
  return PROGRAMS_BY_SLUG[slug.trim().toLowerCase()] ?? null;
}

export function getProgramById(id: string | null | undefined): ResidencyProgram | null {
  if (!id) return null;
  return PROGRAMS_BY_ID[id] ?? null;
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

  return [
    `Institutional program context:`,
    `- Program: ${program.display_title}`,
    `- Institution: ${program.institution_name}`,
    `- Academic year: ${program.academic_year}`,
    input.pgy_level ? `- PGY: ${input.pgy_level}` : "",
    input.trainee_initials ? `- Trainee initials (roster): ${input.trainee_initials}` : "",
    rotation ? `- Current rotation: ${rotation}` : "",
    `Use UH psychiatry rotation vocabulary. Link captures to ILP SMART goals, ACGME subcompetencies, and rotation debriefs when natural. Do not auto-fill milestone ratings.`,
  ]
    .filter(Boolean)
    .join("\n");
}

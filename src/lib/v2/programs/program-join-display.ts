import {
  isUniversityHospitalsInstitution,
  UH_INSTITUTION_SHORT,
} from "@/lib/v2/programs/institution-brand";
import type { ResidencyProgram } from "@/lib/v2/programs/registry";

export { UH_INSTITUTION_NAME, UH_INSTITUTION_SHORT } from "@/lib/v2/programs/institution-brand";

export type ProgramJoinHeadlineParts = {
  isUh: true;
  institutionShort: string;
  programName: string;
};

export type ProgramJoinHeadlinePlain = {
  isUh: false;
  title: string;
};

export type ProgramJoinHeadline = ProgramJoinHeadlineParts | ProgramJoinHeadlinePlain;

export function programJoinHeadline(
  program: Pick<ResidencyProgram, "institution_name" | "program_name" | "display_title">,
): ProgramJoinHeadline {
  if (isUniversityHospitalsInstitution(program.institution_name)) {
    return {
      isUh: true,
      institutionShort: UH_INSTITUTION_SHORT,
      programName: program.program_name,
    };
  }
  return {
    isUh: false,
    title: program.display_title,
  };
}

export function programJoinDescription(
  _program: Pick<ResidencyProgram, "institution_name" | "program_name">,
): string {
  return "An intelligent career platform for physicians — capture the invisible, clarify your direction, and build the career you want.";
}

/** Hospital / institution line on program join pages — no specialty. */
export function joinInstitutionLabel(
  program: Pick<ResidencyProgram, "institution_name">,
): string {
  if (isUniversityHospitalsInstitution(program.institution_name)) {
    return UH_INSTITUTION_SHORT;
  }
  return program.institution_name;
}

/** URL segment under /join/uh/[specialty] → registry slug */
export const UH_JOIN_SPECIALTY_SLUGS: Record<string, string> = {
  psychiatry: "uh-psych-cmc",
  "internal-medicine": "pathway-internal-medicine",
  "family-medicine": "pathway-family-medicine",
  pediatrics: "pathway-pediatrics",
  surgery: "pathway-surgery",
};

export function programSlugFromUhJoinSpecialty(specialty: string): string | null {
  return UH_JOIN_SPECIALTY_SLUGS[specialty.trim().toLowerCase()] ?? null;
}

/** Marketing join path for a registry program slug (UH pathways only). */
export function uhJoinPathForProgramSlug(programSlug: string | null | undefined): string | null {
  if (!programSlug) return null;
  const entry = Object.entries(UH_JOIN_SPECIALTY_SLUGS).find(([, slug]) => slug === programSlug);
  return entry ? `/join/uh/${entry[0]}` : null;
}

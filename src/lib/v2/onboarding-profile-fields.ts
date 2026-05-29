/** Medical student year options for Core Profile. */
export const MEDICAL_STUDENT_YEARS = [
  "MS1",
  "MS2",
  "MS3",
  "MS4",
  "Research year / dual-degree year",
  "Other",
] as const;

export type MedicalStudentYear = (typeof MEDICAL_STUDENT_YEARS)[number];

export function isValidMedicalStudentYear(value: string): value is MedicalStudentYear {
  return (MEDICAL_STUDENT_YEARS as readonly string[]).includes(value);
}

/** Optional additional degree types. */
export const ADDITIONAL_DEGREE_TYPES = [
  "None",
  "Master's",
  "PhD",
  "MPH",
  "MBA",
  "MEd",
  "JD",
  "PharmD",
  "DNP/NP",
  "PA-C",
  "RN",
  "Other",
] as const;

export type AdditionalDegreeType = (typeof ADDITIONAL_DEGREE_TYPES)[number];

export type AdditionalDegreeEntry = {
  degree: AdditionalDegreeType;
  field?: string | null;
  institution?: string | null;
  year?: string | null;
  other_label?: string | null;
};

/** Lightweight current-goal single select. */
export const CURRENT_GOAL_OPTIONS = [
  "Explore specialty or career direction",
  "Build evidence for fellowship or job applications",
  "Prepare for promotion or annual review",
  "Navigate a career transition or pivot",
  "Capture invisible work and teaching",
  "Improve wellbeing and boundaries",
  "Understand non-clinical or industry pathways",
  "Other",
] as const;

export type CurrentGoal = (typeof CURRENT_GOAL_OPTIONS)[number];

export function isValidCurrentGoal(value: string): value is CurrentGoal {
  return (CURRENT_GOAL_OPTIONS as readonly string[]).includes(value);
}

/** Seed list for other industries of interest (searchable). */
export const OTHER_INDUSTRY_SEEDS = [
  "Consulting / strategy",
  "Health tech / digital health",
  "Pharma / medical affairs",
  "Health policy / public health",
  "Medical writing / media",
  "Informatics / CMIO",
  "Insurance / value-based care",
  "Entrepreneurship / startup",
  "Medical education / ed-tech",
  "Venture / investing",
] as const;

export const MAX_SPECIALTY_INTERESTS = 3;
export const MAX_EXTRACURRICULAR_INTERESTS = 3;

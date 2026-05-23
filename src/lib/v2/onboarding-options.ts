/** ABMS/AOA specialties + subspecialties (alphabetical). */
export const ACGME_SPECIALTIES = [
  "Addiction Psychiatry",
  "Adolescent Medicine",
  "Allergy and Immunology",
  "Anatomic and Clinical Pathology",
  "Anesthesiology",
  "Blood Banking/Transfusion Medicine",
  "Cardiovascular Disease",
  "Child and Adolescent Psychiatry",
  "Child Neurology",
  "Clinical Biochemical Genetics",
  "Clinical Cardiac Electrophysiology",
  "Clinical Genetics and Genomics",
  "Clinical Informatics",
  "Clinical Neurophysiology",
  "Colon and Rectal Surgery",
  "Critical Care Medicine",
  "Cytopathology",
  "Dermatology",
  "Dermatopathology",
  "Developmental-Behavioral Pediatrics",
  "Emergency Medical Services",
  "Emergency Medicine",
  "Endocrinology, Diabetes and Metabolism",
  "Epilepsy",
  "Family Medicine",
  "Female Pelvic Medicine and Reconstructive Surgery",
  "Forensic Pathology",
  "Forensic Psychiatry",
  "Gastroenterology",
  "Geriatric Medicine",
  "Geriatric Psychiatry",
  "Gynecologic Oncology",
  "Hand Surgery",
  "Hematology",
  "Hematology and Oncology",
  "Hospice and Palliative Medicine",
  "Infectious Disease",
  "Internal Medicine",
  "Internal Medicine-Pediatrics",
  "Interventional Cardiology",
  "Interventional Radiology",
  "Maternal-Fetal Medicine",
  "Medical Genetics and Genomics",
  "Medical Microbiology",
  "Medical Toxicology",
  "Molecular Genetic Pathology",
  "Neonatal-Perinatal Medicine",
  "Nephrology",
  "Neurocritical Care",
  "Neurological Surgery",
  "Neurology",
  "Neuropathology",
  "Neuroradiology",
  "Neurotology",
  "Nuclear Medicine",
  "Nuclear Radiology",
  "Obstetrics and Gynecology",
  "Occupational and Environmental Medicine",
  "Ophthalmology",
  "Orthopaedic Sports Medicine",
  "Orthopaedic Surgery",
  "Otolaryngology - Head and Neck Surgery",
  "Pain Medicine",
  "Pediatric Anesthesiology",
  "Pediatric Cardiology",
  "Pediatric Critical Care Medicine",
  "Pediatric Emergency Medicine",
  "Pediatric Endocrinology",
  "Pediatric Gastroenterology",
  "Pediatric Hematology-Oncology",
  "Pediatric Hospital Medicine",
  "Pediatric Infectious Diseases",
  "Pediatric Nephrology",
  "Pediatric Pulmonology",
  "Pediatric Radiology",
  "Pediatric Rehabilitation Medicine",
  "Pediatric Surgery",
  "Pediatric Urology",
  "Physical Medicine and Rehabilitation",
  "Plastic Surgery",
  "Plastic Surgery-Integrated",
  "Preventive Medicine",
  "Psychiatry",
  "Pulmonary Disease",
  "Radiation Oncology",
  "Radiology - Diagnostic",
  "Rheumatology",
  "Sleep Medicine",
  "Spinal Cord Injury Medicine",
  "Sports Medicine",
  "Surgery",
  "Surgical Critical Care",
  "Thoracic Surgery",
  "Transplant Hepatology",
  "Undersea and Hyperbaric Medicine",
  "Urology",
  "Vascular Neurology",
  "Vascular Surgery",
  "Other",
] as const;

export type AcgmeSpecialty = (typeof ACGME_SPECIALTIES)[number];

/** Touchpoint 1 career levels (ADDIE onboarding spec). */
export const CAREER_LEVELS = [
  "Medical Student",
  "Resident",
  "Fellow",
  "Early Career (0–7 yr)",
  "Mid-Career (8–20 yr)",
  "Late Career (20+ yr)",
  "Retired",
] as const;

export type CareerLevel = (typeof CAREER_LEVELS)[number];

/** @deprecated Use CAREER_LEVELS — alias for backward compatibility */
export const CAREER_STAGES = CAREER_LEVELS;
export type CareerStage = CareerLevel;

export const PRACTICE_SETTINGS = [
  "Academic",
  "Community",
  "Industry",
  "Hybrid",
] as const;

export type PracticeSetting = (typeof PRACTICE_SETTINGS)[number];

export const ACADEMIC_RANKS = [
  "Instructor",
  "Assistant Professor",
  "Associate Professor",
  "Full Professor",
  "Chair",
  "Emeritus",
] as const;

export type AcademicRank = (typeof ACADEMIC_RANKS)[number];

export const PRIMARY_CAREER_TRACKS = [
  "Clinician",
  "Educator",
  "Researcher",
  "Leader",
  "Advocate",
  "Innovator",
  "Quality-Safety",
  "Wellness Champion",
] as const;

export type PrimaryCareerTrack = (typeof PRIMARY_CAREER_TRACKS)[number];

const LEGACY_CAREER_MAP: Record<string, CareerLevel> = {
  "Early Attending": "Early Career (0–7 yr)",
  "Mid-Career Attending": "Mid-Career (8–20 yr)",
  "Senior Attending": "Late Career (20+ yr)",
};

export function normalizeCareerLevel(value: string | null | undefined): CareerLevel | null {
  if (!value) return null;
  if ((CAREER_LEVELS as readonly string[]).includes(value)) return value as CareerLevel;
  return LEGACY_CAREER_MAP[value] ?? null;
}

export function filterSpecialties(query: string): AcgmeSpecialty[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...ACGME_SPECIALTIES];
  return ACGME_SPECIALTIES.filter((s) => s.toLowerCase().includes(q));
}

export function isValidSpecialty(value: string): value is AcgmeSpecialty {
  return (ACGME_SPECIALTIES as readonly string[]).includes(value);
}

export function isValidCareerLevel(value: string): value is CareerLevel {
  return (CAREER_LEVELS as readonly string[]).includes(value) || value in LEGACY_CAREER_MAP;
}

export function isValidPracticeSetting(value: string): value is PracticeSetting {
  return (PRACTICE_SETTINGS as readonly string[]).includes(value);
}

export function isValidAcademicRank(value: string): value is AcademicRank {
  return (ACADEMIC_RANKS as readonly string[]).includes(value);
}

export function isValidCareerTrack(value: string): value is PrimaryCareerTrack {
  return (PRIMARY_CAREER_TRACKS as readonly string[]).includes(value);
}

export function isValidCareerStage(value: string): value is CareerLevel {
  return isValidCareerLevel(value);
}

export function requiresAcademicRank(setting: PracticeSetting | null): boolean {
  return setting === "Academic" || setting === "Hybrid";
}

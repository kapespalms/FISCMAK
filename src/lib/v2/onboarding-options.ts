/** @deprecated Prefer ACGME primary list from specialty-hierarchy / gme registry. */
import { listAllAcgmeProgramNames } from "@/lib/v2/gme/acgme-specialty-registry";

/** Legacy flat list — primary + subspecialty program names + Other (attending search). */
export const ACGME_SPECIALTIES: readonly string[] = [...listAllAcgmeProgramNames(), "Other"];

export type AcgmeSpecialty = string;

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

/** PGY labels for resident/fellow onboarding (GME). */
export const PGY_LEVELS = [
  "PGY-1",
  "PGY-2",
  "PGY-3",
  "PGY-4",
  "PGY-5+",
] as const;

export type PgyLevel = (typeof PGY_LEVELS)[number];

export function isTraineeCareerLevel(level: string | null | undefined): level is CareerLevel {
  return level === "Medical Student" || level === "Resident" || level === "Fellow";
}

/** Resident/fellow onboarding collects PGY and current rotation. */
export function requiresGmePlacementFields(level: string | null | undefined): boolean {
  return level === "Resident" || level === "Fellow";
}

/** Attending-level users report FTE per career track instead of hours/week. */
export function usesFteForCareerTracks(level: string | null | undefined): boolean {
  return (
    level === "Early Career (0–7 yr)" ||
    level === "Mid-Career (8–20 yr)" ||
    level === "Late Career (20+ yr)"
  );
}

export function allowsSubspecialtyInterests(level: string | null | undefined): boolean {
  return Boolean(level && level !== "Retired");
}

export function isValidPgyLevel(value: string): value is PgyLevel {
  return (PGY_LEVELS as readonly string[]).includes(value);
}

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
  "Volunteer / Adjunct Faculty",
] as const;

export const ACADEMIC_RANK_SPECIAL = ["Not applicable", "Other"] as const;

export type AcademicRank =
  | (typeof ACADEMIC_RANKS)[number]
  | (typeof ACADEMIC_RANK_SPECIAL)[number];

export const ACADEMIC_RANK_HELPER =
  "Academic rank is optional. Some community physicians have academic or teaching titles, but many do not.";

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

export function filterSpecialties(query: string): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [...ACGME_SPECIALTIES];
  return ACGME_SPECIALTIES.filter((s) => s.toLowerCase().includes(q));
}

export function isValidSpecialty(value: string): value is AcgmeSpecialty {
  return ACGME_SPECIALTIES.includes(value);
}

export function isValidCareerLevel(value: string): value is CareerLevel {
  return (CAREER_LEVELS as readonly string[]).includes(value) || value in LEGACY_CAREER_MAP;
}

export function isValidPracticeSetting(value: string): value is PracticeSetting {
  return (PRACTICE_SETTINGS as readonly string[]).includes(value);
}

export function isValidAcademicRank(value: string): value is AcademicRank {
  return (
    (ACADEMIC_RANKS as readonly string[]).includes(value) ||
    (ACADEMIC_RANK_SPECIAL as readonly string[]).includes(value)
  );
}

/** Values allowed on app_users.academic_rank (narrower than UI options). */
const DB_ACADEMIC_RANKS = new Set<string>(ACADEMIC_RANKS);

/** Map UI academic rank to the app_users column; store extended labels in metadata. */
export function academicRankForStorage(rank: string | null | undefined): {
  column: (typeof ACADEMIC_RANKS)[number] | null;
  selection: AcademicRank | null;
} {
  if (!rank) return { column: null, selection: null };
  if (DB_ACADEMIC_RANKS.has(rank)) {
    return { column: rank as (typeof ACADEMIC_RANKS)[number], selection: rank as AcademicRank };
  }
  return { column: null, selection: rank as AcademicRank };
}

export function isAttendingCareerLevel(level: string | null | undefined): boolean {
  return (
    level === "Early Career (0–7 yr)" ||
    level === "Mid-Career (8–20 yr)" ||
    level === "Late Career (20+ yr)" ||
    level === "Retired"
  );
}

export function isMedicalStudent(level: string | null | undefined): boolean {
  return level === "Medical Student";
}

export function isValidCareerTrack(value: string): value is PrimaryCareerTrack {
  return (PRIMARY_CAREER_TRACKS as readonly string[]).includes(value);
}

export function isValidCareerStage(value: string): value is CareerLevel {
  return isValidCareerLevel(value);
}

/** Whether to show the academic rank field (always optional when shown). */
export function requiresAcademicRank(
  setting: PracticeSetting | null | undefined,
  careerLevel?: CareerLevel | null,
): boolean {
  if (!setting || !careerLevel) return false;
  if (isTraineeCareerLevel(careerLevel)) return false;
  if (careerLevel === "Retired") return false;
  return setting === "Academic" || setting === "Hybrid" || setting === "Community";
}

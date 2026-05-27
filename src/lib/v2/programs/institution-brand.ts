/** University Hospitals brand red (UH primary). */
export const UH_BRAND_RED = "#DA291C";

export const UH_INSTITUTION_NAME = "University Hospitals Cleveland Medical Center";
export const UH_INSTITUTION_SHORT = "University Hospitals";

export function isUniversityHospitalsInstitution(name: string | null | undefined): boolean {
  if (!name) return false;
  return name.toLowerCase().includes("university hospitals");
}

export function institutionAccentClass(name: string | null | undefined): string {
  return isUniversityHospitalsInstitution(name) ? "text-uh-red" : "text-marketing-accent";
}

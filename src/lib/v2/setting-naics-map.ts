/**
 * Practice setting → NAICS code mapping (Appendix G.2, FISCMAK Intelligence Layer Spec).
 * Each FISCMAK setting maps to its most representative employer NAICS code.
 * The NAICS classifies the employer, not the worker; used for setting-aware O*NET vectors.
 */
const SETTING_NAICS_MAP: Record<string, string> = {
  Academic:    "611310",  // Colleges, Universities, and Professional Schools
  Community:   "621111",  // Offices of Physicians (except Mental Health)
  Hybrid:      "622110",  // General Medical and Surgical Hospitals
  Government:  "921190",  // Other General Government Support (VA, DoD, IHS)
  Industry:    "325412",  // Pharmaceutical Preparation Manufacturing (primary Industry anchor)
};

/** Returns the primary NAICS code for a FISCMAK practice setting, defaulting to Community. */
export function lookupNaicsCode(setting: string): string {
  return SETTING_NAICS_MAP[setting] ?? "621111";
}

/** Clinical-site modifier — where the physician physically practices (Appendix F). */
export const CLINICAL_SETTINGS = [
  "Inpatient",
  "Outpatient",
  "Hybrid",
  "Non-clinical",
] as const;

export type ClinicalSetting = (typeof CLINICAL_SETTINGS)[number];

export function isValidClinicalSetting(value: string): value is ClinicalSetting {
  return (CLINICAL_SETTINGS as readonly string[]).includes(value);
}

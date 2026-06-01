/**
 * Specialty → O*NET SOC code lookup (Appendix G.1, FISCMAK Intelligence Layer Spec).
 * Keys are lowercase ACGME primary specialty names from appendix_b_2024_2025.json.
 * Falls back to 29-1229.00 (Physicians, All Other) for unmapped specialties.
 */
const SPECIALTY_SOC_MAP: Record<string, string> = {
  "anesthesiology":                               "29-1211.00",
  "dermatology":                                  "29-1213.00",
  "emergency medicine":                           "29-1214.00",
  "family medicine":                              "29-1215.00",
  "internal medicine":                            "29-1216.00",
  "internal medicine/pediatrics":                 "29-1216.00",
  "neurology":                                    "29-1217.00",
  "child neurology":                              "29-1217.00",
  "obstetrics and gynecology":                    "29-1218.00",
  "pediatrics":                                   "29-1221.00",
  "pathology-anatomic and clinical":              "29-1222.00",
  "psychiatry":                                   "29-1223.00",
  "radiology-diagnostic":                         "29-1224.00",
  "interventional radiology – independent":  "29-1224.00",
  "interventional radiology – integrated":   "29-1224.00",
  "allergy and immunology":                       "29-1229.01",
  "urology":                                      "29-1229.03",
  "physical medicine and rehabilitation":         "29-1229.04",
  "public health and general preventive medicine":"29-1229.05",
  "aerospace medicine":                           "29-1229.05",
  "occupational and environmental medicine":      "29-1229.05",
  "ophthalmology":                                "29-1241.00",
  "orthopaedic surgery":                          "29-1242.00",
  "surgery":                                      "29-1249.00",
  "colon and rectal surgery":                     "29-1249.00",
  "neurological surgery":                         "29-1249.00",
  "plastic surgery":                              "29-1249.00",
  "plastic surgery – integrated":            "29-1249.00",
  "thoracic surgery":                             "29-1249.00",
  "thoracic surgery – integrated":           "29-1249.00",
  "vascular surgery – integrated":           "29-1249.00",
};

const SOC_CATCH_ALL = "29-1229.00";

/** Returns the O*NET SOC code for a specialty, or the catch-all if not in G.1. */
export function lookupSocCode(specialty: string): string {
  return SPECIALTY_SOC_MAP[specialty.trim().toLowerCase()] ?? SOC_CATCH_ALL;
}

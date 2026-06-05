/**
 * O*NET 30.3 Work Values — physician SOC code profiles.
 * Source: Work_Values.xlsx, O*NET 30.3 Database, U.S. DOL/ETA, CC-BY 4.0.
 * https://www.onetcenter.org/license_db.html
 *
 * Six work value dimensions (EX = Extent scale, 1–7):
 *   achievement        — sense of accomplishment, using best abilities
 *   independence       — make decisions, work with little supervision
 *   recognition        — advancement, leadership, social status
 *   relationships      — work with co-workers and help others
 *   support            — management policies, supervision, working conditions
 *   working_conditions — activity, independence, variety, compensation
 *
 * ── Canonical boundary (two representations of the same source data) ────────
 *
 * 1. SOC vectors (src/lib/v2/onet/soc-vectors.ts, dims 237–242 in 250-dim space)
 *    — the OCCUPATION SIDE of F6 person–occupation fit (cosine similarity).
 *    These are the authoritative representation for vector math. Any future
 *    edit to Work Values EX scores must also trigger a seed rebuild so the
 *    vectors stay in sync.
 *
 * 2. This file (SOC_WORK_VALUES + scoreValuesFit)
 *    — the 1A "values match" surface: compare a physician's self-rated work
 *    values (Tier-2 self-assessment, 1–5) against the occupation's O*NET
 *    profile. Both representations derive from the same O*NET EX values,
 *    so they are consistent by construction — keep them that way.
 *
 *    scoreValuesFit is a FORWARD HOOK, not yet wired to any live consumer.
 *    It is ready for Phase-5 Environmental Dx / Career Urgency once the
 *    Tier-2 self-assessment surface is built. Do not delete.
 *
 * ── Proxy mappings ───────────────────────────────────────────────────────────
 *
 * Cardiology (29-1212.00) ← Internists (29-1063.00): reasonable proxy
 *   (cardiology is a subspecialty of internal medicine).
 *
 * Emergency Medicine (29-1214.00) ← Family Medicine (29-1062.00):
 *   PROXY (weak) — EM and FM diverge most on autonomy, schedule control,
 *   and working conditions — exactly what Work Values measures. Replace with
 *   a 2018 EM-specific profile when available. Out of scope for the
 *   psychiatry pilot; do not treat this as ground truth for EM.
 *
 * ── Crosswalk ────────────────────────────────────────────────────────────────
 *
 * File uses SOC 2010 codes (29-106x); app uses SOC 2018/2020 (29-12xx).
 * The crosswalk is applied in build-onet-seed.mjs (WV_SOC_CROSSWALK).
 */

export type WorkValuesProfile = {
  /** Sense of accomplishment; using best abilities. 1–7. */
  achievement: number;
  /** Make own decisions; work with little supervision. 1–7. */
  independence: number;
  /** Advancement; leadership; social status. 1–7. */
  recognition: number;
  /** Work with co-workers; help others. 1–7. */
  relationships: number;
  /** Supportive management; clear policies; good supervision. 1–7. */
  support: number;
  /** Activity level; independence; variety; pay. 1–7. */
  working_conditions: number;
  /** O*NET source SOC code (SOC 2010). */
  source_soc: string;
  source_title: string;
};

/**
 * Work value profiles keyed by SOC 2018/2020 code.
 * For specialties not in this map, fall back to Physicians-All-Other (29-1229.00).
 */
export const SOC_WORK_VALUES: Readonly<Record<string, WorkValuesProfile>> = {
  "29-1069.03": { achievement: 6.33, independence: 5.67, recognition: 6.0, relationships: 5.33, support: 5.67, working_conditions: 5.33, source_soc: "29-1069.03", source_title: "Hospitalists" },
  "29-1211.00": { achievement: 6.0, independence: 6.0, recognition: 5.67, relationships: 6.0, support: 5.67, working_conditions: 5.5, source_soc: "29-1061.00", source_title: "Anesthesiologists" },
  "29-1212.00": { achievement: 6.33, independence: 6.33, recognition: 6.33, relationships: 6.33, support: 5.33, working_conditions: 6.0, source_soc: "29-1063.00", source_title: "Internists, General [proxy]" },
  "29-1213.00": { achievement: 6.0, independence: 5.67, recognition: 5.67, relationships: 5.67, support: 5.0, working_conditions: 5.67, source_soc: "29-1069.02", source_title: "Dermatologists" },
  "29-1214.00": { achievement: 6.33, independence: 6.33, recognition: 6.33, relationships: 6.67, support: 5.0, working_conditions: 6.0, source_soc: "29-1062.00", source_title: "Family and General Practitioners [proxy]" },
  "29-1215.00": { achievement: 6.33, independence: 6.33, recognition: 6.33, relationships: 6.67, support: 5.0, working_conditions: 6.0, source_soc: "29-1062.00", source_title: "Family and General Practitioners" },
  "29-1216.00": { achievement: 6.33, independence: 6.33, recognition: 6.33, relationships: 6.33, support: 5.33, working_conditions: 6.0, source_soc: "29-1063.00", source_title: "Internists, General" },
  "29-1217.00": { achievement: 6.33, independence: 5.67, recognition: 6.33, relationships: 5.33, support: 5.33, working_conditions: 6.0, source_soc: "29-1069.04", source_title: "Neurologists" },
  "29-1218.00": { achievement: 6.33, independence: 6.33, recognition: 6.33, relationships: 5.67, support: 4.67, working_conditions: 6.0, source_soc: "29-1064.00", source_title: "Obstetricians and Gynecologists" },
  "29-1221.00": { achievement: 6.67, independence: 6.33, recognition: 6.67, relationships: 6.67, support: 4.67, working_conditions: 6.0, source_soc: "29-1065.00", source_title: "Pediatricians, General" },
  "29-1222.00": { achievement: 5.67, independence: 5.67, recognition: 5.33, relationships: 4.33, support: 4.67, working_conditions: 4.83, source_soc: "29-1069.07", source_title: "Pathologists" },
  "29-1223.00": { achievement: 6.33, independence: 6.33, recognition: 6.33, relationships: 6.33, support: 4.33, working_conditions: 6.17, source_soc: "29-1066.00", source_title: "Psychiatrists" },
  "29-1224.00": { achievement: 5.67, independence: 5.33, recognition: 5.33, relationships: 5.0, support: 5.33, working_conditions: 5.0, source_soc: "29-1069.10", source_title: "Radiologists" },
  "29-1229.01": { achievement: 6.0, independence: 6.33, recognition: 6.33, relationships: 4.67, support: 5.0, working_conditions: 5.17, source_soc: "29-1069.01", source_title: "Allergists and Immunologists" },
  "29-1229.03": { achievement: 6.0, independence: 5.33, recognition: 6.0, relationships: 5.33, support: 5.33, working_conditions: 5.83, source_soc: "29-1069.12", source_title: "Urologists" },
  "29-1229.04": { achievement: 6.33, independence: 6.0, recognition: 6.33, relationships: 5.33, support: 4.33, working_conditions: 5.83, source_soc: "29-1069.08", source_title: "Physical Medicine and Rehabilitation Physicians" },
  "29-1229.05": { achievement: 6.0, independence: 6.0, recognition: 6.33, relationships: 5.67, support: 5.0, working_conditions: 5.67, source_soc: "29-1069.09", source_title: "Preventive Medicine Physicians" },
  "29-1229.06": { achievement: 6.33, independence: 6.0, recognition: 6.33, relationships: 5.33, support: 5.0, working_conditions: 6.17, source_soc: "29-1069.11", source_title: "Sports Medicine Physicians" },
  "29-1229.99": { achievement: 6.33, independence: 6.33, recognition: 6.33, relationships: 5.0, support: 5.67, working_conditions: 6.0, source_soc: "29-1069.05", source_title: "Nuclear Medicine Physicians" },
  "29-1241.00": { achievement: 6.0, independence: 6.0, recognition: 5.67, relationships: 5.33, support: 5.0, working_conditions: 5.33, source_soc: "29-1069.06", source_title: "Ophthalmologists" },
  "29-1242.00": { achievement: 6.0, independence: 6.33, recognition: 6.0, relationships: 6.0, support: 4.67, working_conditions: 6.0, source_soc: "29-1022.00", source_title: "Oral and Maxillofacial Surgeons" },
  "29-1249.00": { achievement: 6.67, independence: 6.33, recognition: 6.67, relationships: 6.0, support: 5.67, working_conditions: 6.17, source_soc: "29-1067.00", source_title: "Surgeons" },
} as const;

/** Returns the work values profile for a SOC code, or null if unmapped. */
export function lookupWorkValues(socCode: string | null | undefined): WorkValuesProfile | null {
  if (!socCode) return null;
  return (SOC_WORK_VALUES as Record<string, WorkValuesProfile>)[socCode] ?? null;
}

/**
 * FORWARD HOOK — not yet wired to any live consumer (Phase-5 Environmental Dx).
 *
 * Compute a values-fit score (0–1) between a physician's environment ratings
 * (Ticket 1A, 1–5 scale) and the occupation's O*NET work value profile (1–7).
 *
 * Maps three Ticket-1A items onto O*NET dimensions:
 *   values_dept_alignment → relationships + support (institutional culture fit)
 *   org_goals_fit         → achievement + recognition (organizational alignment)
 *   schedule_control      → independence + working_conditions (autonomy)
 *
 * Returns null if the occupation profile or any required Ticket-1A item is missing.
 */
export function scoreValuesFit(input: {
  values_dept_alignment: number | null;
  org_goals_fit: number | null;
  schedule_control: number | null;
  profile: WorkValuesProfile;
}): number | null {
  const { values_dept_alignment, org_goals_fit, schedule_control, profile } = input;
  if (values_dept_alignment == null || org_goals_fit == null || schedule_control == null) return null;

  // Normalise O*NET 1–7 → 1–5 for direct comparison
  const norm7to5 = (v: number) => 1 + ((v - 1) / 6) * 4;

  // Institutional culture fit: stated vs expected
  const cultureExpected = norm7to5((profile.relationships + profile.support) / 2);
  const cultureDelta = Math.abs(values_dept_alignment - cultureExpected) / 4;

  // Organisational goal fit
  const goalExpected = norm7to5((profile.achievement + profile.recognition) / 2);
  const goalDelta = Math.abs(org_goals_fit - goalExpected) / 4;

  // Autonomy / schedule control
  const autonomyExpected = norm7to5((profile.independence + profile.working_conditions) / 2);
  const autonomyDelta = Math.abs(schedule_control - autonomyExpected) / 4;

  // Equal-weight average mismatch; invert so 1 = perfect fit, 0 = max mismatch
  const mismatch = (cultureDelta + goalDelta + autonomyDelta) / 3;
  return Math.round((1 - mismatch) * 100) / 100;
}

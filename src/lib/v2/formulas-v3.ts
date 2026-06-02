/**
 * FISCMAK v3 formula system — Part IX.
 * F1 Evidence Density, and supporting types for future formulas (F3–F7).
 */

import type { SupabaseClient } from "@supabase/supabase-js";

// ---------------------------------------------------------------------------
// Source reliability weights (Part VII)
// ---------------------------------------------------------------------------

/**
 * w_s — reliability weight per evidence source.
 * Attending weights from Part VII. Trainee weights (MedHub, CCC) added when
 * those evidence streams are wired to evidence_unit.
 *
 * Sources not yet producing evidence_unit rows (energy_ranking, FCWI,
 * weekly_pulse) are present for completeness but marked; they will be wired
 * as those streams are bridged to the evidence layer in later phases.
 */
export const SOURCE_WEIGHTS: Record<string, number> = {
  cv_document:   0.50,  // career docs — Part VII
  mak_capture:   0.55,  // Mak prompts — Part VII
  // Future sources (not yet wired to evidence_unit):
  // energy_ranking: 0.60,   // domain energy ranking
  // fcwi:           0.90,   // FCWI monthly check-in
  // weekly_pulse:   0.90,   // weekly pulse
  // medhub_hours:   0.65,   // MedHub duty hours (trainee)
  // medhub_evals:   0.40,   // MedHub evals narrative (trainee)
  // ccc_milestones: 0.70,   // CCC milestone ratings (trainee)
} as const;

const DEFAULT_SOURCE_WEIGHT = 0.50; // unrecognised source → career-docs weight

function sourceWeight(inputSource: string | null | undefined): number {
  if (!inputSource) return DEFAULT_SOURCE_WEIGHT;
  return SOURCE_WEIGHTS[inputSource] ?? DEFAULT_SOURCE_WEIGHT;
}

// ---------------------------------------------------------------------------
// F1 — Evidence Density
// ---------------------------------------------------------------------------

export type DensityCell = {
  /** Skill/task axis (0–7): indexes SKILLS array. */
  skill_index:  number;
  /** Domain identity axis (0–7): indexes DOMAINS array. */
  domain_index: number;
  quadrant: "OV" | "OI" | "SV" | "SI";
  /** D(q,d,t) = Σ w_s · weight; physician-confirmed evidence only. */
  density: number;
};

export type F1Result = {
  cells: DensityCell[];   // non-zero cells only; full grid implied zero elsewhere
  computed_at: string;
};

/**
 * F1 Evidence Density: D(q,d,t) = Σ w_s · n(s,q,d,t)
 *
 * In the multi-cell weighted model, n(s,q,d,t) = Σ weight for source s in
 * cell (q,d,t). Weight already encodes how much of each evidence_unit belongs
 * to this cell, so the formula becomes:
 *
 *   D(q,d,t) = Σ_evidence_unit  w_s(eu.source) · ecw.weight
 *
 * where the sum is over all (eu, ecw) pairs with physician_confirmed = true.
 *
 * Gracefully returns empty cells if evidence tables don't exist yet or are
 * empty (migrations not yet applied).
 */
export async function computeF1Density(
  userId: string,
  supabase: SupabaseClient,
): Promise<F1Result> {
  const now = new Date().toISOString();

  // 1. Fetch all evidence_cell_weights for this user
  const { data: cellWeights, error: ecwError } = await supabase
    .from("evidence_cell_weights")
    .select("skill_index, domain_index, recognition_quadrant, weight, evidence_unit_id")
    .eq("user_id", userId);

  if (ecwError || !cellWeights?.length) {
    return { cells: [], computed_at: now };
  }

  // 2. Fetch corresponding evidence_units (physician-confirmed only)
  const euIds = [...new Set(cellWeights.map((c) => c.evidence_unit_id as string))];
  const { data: evidenceUnits } = await supabase
    .from("evidence_unit")
    .select("id, source_activity_id, physician_confirmed")
    .in("id", euIds)
    .eq("user_id", userId)
    .eq("physician_confirmed", true);

  if (!evidenceUnits?.length) {
    return { cells: [], computed_at: now };
  }

  // Build map: evidence_unit_id → source_activity_id (nullable)
  const confirmedEuIds = new Set(evidenceUnits.map((eu) => eu.id as string));
  const euToActivity = new Map(
    evidenceUnits
      .filter((eu) => eu.source_activity_id)
      .map((eu) => [eu.id as string, eu.source_activity_id as string]),
  );

  // 3. Batch-fetch input_source from activity_entries for the source weight lookup
  const activityIds = [...euToActivity.values()];
  const activitySourceMap = new Map<string, string>();
  if (activityIds.length > 0) {
    const { data: activities } = await supabase
      .from("activity_entries")
      .select("id, input_source")
      .in("id", activityIds);
    for (const a of activities ?? []) {
      if (a.input_source) activitySourceMap.set(a.id as string, a.input_source as string);
    }
  }

  // 4. Compute D(q,d,t) = Σ w_s · weight
  const densityMap = new Map<string, number>();

  for (const ecw of cellWeights) {
    const euId = ecw.evidence_unit_id as string;
    if (!confirmedEuIds.has(euId)) continue; // skip unconfirmed

    const activityId = euToActivity.get(euId);
    const inputSource = activityId ? activitySourceMap.get(activityId) : undefined;
    const w = sourceWeight(inputSource);

    const key = `${ecw.skill_index}:${ecw.domain_index}:${ecw.recognition_quadrant}`;
    densityMap.set(key, (densityMap.get(key) ?? 0) + w * (ecw.weight as number));
  }

  const cells: DensityCell[] = Array.from(densityMap.entries())
    .map(([key, density]) => {
      const [s, d, q] = key.split(":");
      return {
        skill_index:  Number(s),
        domain_index: Number(d),
        quadrant:     q as DensityCell["quadrant"],
        density,
      };
    })
    .filter((c) => c.density > 0)
    .sort((a, b) => a.domain_index - b.domain_index || a.skill_index - b.skill_index);

  return { cells, computed_at: now };
}

// ---------------------------------------------------------------------------
// F3 — Structural Discrepancy (Part IX + Annex F.4)
// ---------------------------------------------------------------------------

/**
 * Setting-normed FTE expectations (Annex F.4 table midpoints).
 * Ranges from the spec; midpoints used as Expected_d(setting).
 * Values are 0–1 fractions (e.g. 0.40 = 40%).
 */
const FTE_NORMS: Record<string, Record<string, number>> = {
  Academic:    { clinical: 0.40, teaching: 0.20, research: 0.30, admin: 0.125 },
  Community:   { clinical: 0.90, teaching: 0.025, research: 0.025, admin: 0.10 },
  Hybrid:      { clinical: 0.60, teaching: 0.125, research: 0.10, admin: 0.175 },
  Government:  { clinical: 0.75, teaching: 0.10, research: 0.125, admin: 0.15 },
  Industry:    { clinical: 0.10, teaching: 0.025, research: 0.25, admin: 0.45 },
};

const F3_DELTA = 0.01; // smoothing factor to avoid div-by-zero on tiny expected values
const F3_FLAG_THRESHOLD = 0.20; // |Δ| > 20% → flagged as material discrepancy

export type F3RoleDiscrepancy = {
  role:     string;
  actual:   number;   // 0–1
  expected: number;   // setting-normed midpoint
  delta:    number;   // (actual − expected) / (expected + δ)
  flagged:  boolean;  // |delta| > threshold
};

export type F3Result = {
  roles:       F3RoleDiscrepancy[];
  setting:     string | null;
  computed_at: string;
  /** null when fte_actual or practice_setting not yet captured */
  available:   boolean;
};

/**
 * F3 Structural Discrepancy: Δ = (Actual − Expected(setting)) / (Expected(setting) + δ)
 * Positive Δ = doing more than setting norm; negative = doing less.
 * Returns available=false when required inputs are missing.
 */
export async function computeF3Discrepancy(
  userId: string,
  supabase: SupabaseClient,
): Promise<F3Result> {
  const now = new Date().toISOString();

  const { data: user } = await supabase
    .from("app_users")
    .select("practice_setting, fte_actual")
    .eq("user_id", userId)
    .maybeSingle();

  const setting = (user?.practice_setting as string | null) ?? null;
  const fteActual = (user?.fte_actual as Record<string, number> | null) ?? null;

  if (!setting || !fteActual || Object.keys(fteActual).length === 0) {
    return { roles: [], setting, computed_at: now, available: false };
  }

  const norms = FTE_NORMS[setting] ?? FTE_NORMS.Community!;
  const roles: F3RoleDiscrepancy[] = Object.keys(norms).map((role) => {
    const actual   = fteActual[role] ?? 0;
    const expected = norms[role]!;
    const delta    = (actual - expected) / (expected + F3_DELTA);
    return { role, actual, expected, delta, flagged: Math.abs(delta) > F3_FLAG_THRESHOLD };
  });

  return { roles, setting, computed_at: now, available: true };
}

// ---------------------------------------------------------------------------
// F4 — Perception Gap (Part IX)
// ---------------------------------------------------------------------------

export type F4RoleGap = {
  role:      string;
  perceived: number;   // what physician believes institution expects
  expected:  number;   // what physician reported as institutional allocation
  gap:       number;   // perceived − expected (positive = overestimates institutional demand)
};

export type F4Result = {
  roles:       F4RoleGap[];
  computed_at: string;
  available:   boolean;
};

/**
 * F4 Perception Gap: P_d = Perceived_d − Expected_d
 * Positive gap = physician believes institution demands more than allocated.
 * Returns available=false when either FTE field is missing.
 */
export async function computeF4PerceptionGap(
  userId: string,
  supabase: SupabaseClient,
): Promise<F4Result> {
  const now = new Date().toISOString();

  const { data: user } = await supabase
    .from("app_users")
    .select("fte_perceived, fte_expected")
    .eq("user_id", userId)
    .maybeSingle();

  const perceived = (user?.fte_perceived as Record<string, number> | null) ?? null;
  const expected  = (user?.fte_expected  as Record<string, number> | null) ?? null;

  if (!perceived || !expected || Object.keys(perceived).length === 0) {
    return { roles: [], computed_at: now, available: false };
  }

  const roles = Object.keys(expected).map((role) => ({
    role,
    perceived: perceived[role] ?? 0,
    expected:  expected[role]  ?? 0,
    gap:       (perceived[role] ?? 0) - (expected[role] ?? 0),
  }));

  return { roles, computed_at: now, available: true };
}

// ---------------------------------------------------------------------------
// F5 — Recognition Gap (Part IX — internal/coaching only, never shown as a number)
// ---------------------------------------------------------------------------

export type F5Result = {
  /** G = Σ(OI+SI) / Σ(OV+SV). G > 1.0 = predominantly unrecognized. */
  G:           number;
  oi_si_total: number;
  ov_sv_total: number;
  computed_at: string;
  available:   boolean;
  /**
   * GOVERNANCE: F5 is for internal coaching context only.
   * Never surface G as a headline number to the physician.
   * Use it to shape Mak probes and transfer-pathway suggestions.
   */
  internal_only: true;
};

/**
 * F5 Recognition Gap: G = Σ(OI+SI) / Σ(OV+SV)
 * G > 1.0 means the physician has more unrecognized than recognized evidence.
 * INTERNAL / COACHING ONLY — this value must never be shown as a raw number.
 */
export async function computeF5RecognitionGap(
  userId: string,
  supabase: SupabaseClient,
): Promise<F5Result> {
  const now = new Date().toISOString();
  const f1  = await computeF1Density(userId, supabase);

  const totals: Record<string, number> = { OV: 0, OI: 0, SV: 0, SI: 0 };
  for (const cell of f1.cells) {
    totals[cell.quadrant] = (totals[cell.quadrant] ?? 0) + cell.density;
  }

  const oi_si = (totals.OI ?? 0) + (totals.SI ?? 0);
  const ov_sv = (totals.OV ?? 0) + (totals.SV ?? 0);

  const G = ov_sv > 0 ? oi_si / ov_sv : 0;

  return {
    G,
    oi_si_total: oi_si,
    ov_sv_total: ov_sv,
    computed_at: now,
    available:   f1.cells.length > 0,
    internal_only: true,
  };
}

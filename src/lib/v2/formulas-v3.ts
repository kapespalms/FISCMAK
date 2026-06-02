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
  domain_index: number;
  track_index: number;
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
    .select("domain_index, track_index, recognition_quadrant, weight, evidence_unit_id")
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

    const key = `${ecw.domain_index}:${ecw.track_index}:${ecw.recognition_quadrant}`;
    densityMap.set(key, (densityMap.get(key) ?? 0) + w * (ecw.weight as number));
  }

  const cells: DensityCell[] = Array.from(densityMap.entries())
    .map(([key, density]) => {
      const [d, t, q] = key.split(":");
      return {
        domain_index: Number(d),
        track_index:  Number(t),
        quadrant:     q as DensityCell["quadrant"],
        density,
      };
    })
    .filter((c) => c.density > 0)
    .sort((a, b) => a.domain_index - b.domain_index || a.track_index - b.track_index);

  return { cells, computed_at: now };
}

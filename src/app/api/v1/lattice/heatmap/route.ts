/**
 * GET /api/v1/lattice/heatmap
 *
 * Returns the data needed to render the v3 8×8 lattice heat map:
 *   - F1 density per cell (from evidence_cell_weights via computeF1Density)
 *   - Domain energy rank (1–5 from energy_rankings)
 *   - Ipsative normalization (density / max_density across all cells)
 *
 * Ipsative: the physician compares to themselves, not to any benchmark.
 * A cell at density_normalized = 1.0 is the physician's own densest cell.
 *
 * Part XVII.1 — density intensity × energy hue. FTE border + transfer stars
 * are deferred to Phase 5 (need F3/F7 data in lattice_cell table).
 */

import { createClient } from "@/lib/supabase/server";
import { isErrorResponse, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";
import { computeF1Density } from "@/lib/v2/formulas-v3";

export type HeatmapCell = {
  /** Skill/task axis (0–7): indexes SKILLS array. */
  skill_index:  number;
  /** Domain identity axis (0–7): indexes DOMAINS array. */
  domain_index: number;
  quadrant:     "OV" | "OI" | "SV" | "SI";
  density:      number;
  /** 0–1, ipsative: density / max_density across this user's cells. */
  density_normalized: number;
  /** 1–5 Likert from energy_rankings for this domain; null if not yet rated. */
  energy_rank: number | null;
};

export type HeatmapResult = {
  cells:       HeatmapCell[];
  max_density: number;
  computed_at: string;
};

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  if (auth.demo) {
    return jsonOk({ cells: [], max_density: 0, computed_at: new Date().toISOString(), demo: true });
  }

  const supabase = await createClient();
  const now = new Date().toISOString();

  // F1 density cells
  const f1 = await computeF1Density(auth.userId, supabase);

  // Domain energy rankings (1–5 per domain identity 0–7).
  // energy_rankings.domain_index is the identity axis — matches DensityCell.domain_index
  // after the vocabulary un-flip. No longer needs a translation.
  const { data: rankings } = await supabase
    .from("energy_rankings")
    .select("domain_index, rank")
    .eq("user_id", auth.userId);

  const energyByDomain = new Map<number, number>(
    (rankings ?? []).map((r) => [r.domain_index as number, r.rank as number]),
  );

  // Ipsative normalization
  const maxDensity = f1.cells.length > 0
    ? Math.max(...f1.cells.map((c) => c.density))
    : 0;

  const cells: HeatmapCell[] = f1.cells.map((c) => ({
    skill_index:        c.skill_index,
    domain_index:       c.domain_index,
    quadrant:           c.quadrant,
    density:            c.density,
    density_normalized: maxDensity > 0 ? c.density / maxDensity : 0,
    // energy_rankings.domain_index and DensityCell.domain_index are now both
    // the identity axis — the join is semantically correct after the un-flip.
    energy_rank:        energyByDomain.get(c.domain_index) ?? null,
  }));

  return jsonOk({ cells, max_density: maxDensity, computed_at: now } satisfies HeatmapResult);
}

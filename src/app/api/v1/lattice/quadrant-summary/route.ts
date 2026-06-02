/**
 * GET /api/v1/lattice/quadrant-summary
 *
 * Aggregates F1 evidence density by recognition quadrant (OV/OI/SV/SI)
 * and returns proportional shares for the 2×2 quadrant summary (Part XVII.2).
 *
 * The "invisible fraction" (OI + SI share) is the headline "aha" stat —
 * how much of the physician's career work is not captured in any institutional
 * record. Physician-owned; never institution-facing at the individual level.
 */

import { createClient } from "@/lib/supabase/server";
import { isErrorResponse, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";
import { computeF1Density } from "@/lib/v2/formulas-v3";

export type QuadrantShare = {
  quadrant: "OV" | "OI" | "SV" | "SI";
  density:  number;   // raw summed density for this quadrant
  share:    number;   // 0–1 fraction of total density
  pct:      number;   // 0–100 rounded to 1dp
};

export type QuadrantSummaryResult = {
  quadrants:          QuadrantShare[];
  total_density:      number;
  invisible_fraction: number;   // (OI + SI) / total — the headline stat
  computed_at:        string;
};

const QUADRANT_ORDER: Array<"OV" | "OI" | "SV" | "SI"> = ["OV", "OI", "SV", "SI"];

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  if (auth.demo) {
    return jsonOk({
      quadrants:          QUADRANT_ORDER.map((q) => ({ quadrant: q, density: 0, share: 0, pct: 0 })),
      total_density:      0,
      invisible_fraction: 0,
      computed_at:        new Date().toISOString(),
      demo:               true,
    });
  }

  const supabase = await createClient();
  const f1 = await computeF1Density(auth.userId, supabase);

  // Sum density per quadrant
  const totals: Record<string, number> = { OV: 0, OI: 0, SV: 0, SI: 0 };
  for (const cell of f1.cells) {
    totals[cell.quadrant] = (totals[cell.quadrant] ?? 0) + cell.density;
  }

  const totalDensity = Object.values(totals).reduce((s, v) => s + v, 0);

  const quadrants: QuadrantShare[] = QUADRANT_ORDER.map((q) => {
    const d = totals[q] ?? 0;
    const share = totalDensity > 0 ? d / totalDensity : 0;
    return { quadrant: q, density: d, share, pct: Math.round(share * 1000) / 10 };
  });

  const invisibleFraction =
    totalDensity > 0
      ? ((totals.OI ?? 0) + (totals.SI ?? 0)) / totalDensity
      : 0;

  return jsonOk({
    quadrants,
    total_density:      totalDensity,
    invisible_fraction: invisibleFraction,
    computed_at:        f1.computed_at,
  } satisfies QuadrantSummaryResult);
}

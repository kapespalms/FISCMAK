/**
 * GET /api/v1/lattice/density
 *
 * Returns the F1 Evidence Density grid for the authenticated physician.
 * D(q,d,t) = Σ w_s · weight (Part IX + Part VII reliability weights).
 *
 * Only returns non-zero cells. Caller treats absent cells as density = 0.
 * Used by the lattice heat map (4.3) and 2×2 quadrant summary (4.4).
 *
 * v3 endpoint — reads from evidence_cell_weights (migration 20260553).
 * Returns empty cells gracefully if tables don't exist yet.
 */

import { createClient } from "@/lib/supabase/server";
import { isErrorResponse, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";
import { computeF1Density } from "@/lib/v2/formulas-v3";

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  if (auth.demo) {
    return jsonOk({ cells: [], computed_at: new Date().toISOString(), demo: true });
  }

  const supabase = await createClient();
  const result = await computeF1Density(auth.userId, supabase);

  return jsonOk(result);
}

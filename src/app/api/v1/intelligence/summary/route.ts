/**
 * GET /api/v1/intelligence/summary
 *
 * Computes and returns all currently-available intelligence formulas:
 *   F3 — Structural Discrepancy (actual vs setting-normed FTE)
 *   F4 — Perception Gap (perceived vs expected institutional demand)
 *   F5 — Recognition Gap (OI+SI / OV+SV) — coaching-internal only
 *
 * F7 (Transfer Potential) and five-gap are separate endpoints (5.4, 5.5).
 *
 * F5 is tagged internal_only=true and must never be surfaced as a raw
 * number in physician-facing UI. Use it to shape Mak coaching context.
 *
 * Part IX + Annex F.4.
 */

import { createClient } from "@/lib/supabase/server";
import { isErrorResponse, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";
import {
  computeF3Discrepancy,
  computeF4PerceptionGap,
  computeF5RecognitionGap,
} from "@/lib/v2/formulas-v3";

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  if (auth.demo) {
    return jsonOk({
      f3: { roles: [], setting: null, computed_at: new Date().toISOString(), available: false },
      f4: { roles: [], computed_at: new Date().toISOString(), available: false },
      f5: { G: 0, oi_si_total: 0, ov_sv_total: 0, computed_at: new Date().toISOString(), available: false, internal_only: true },
      demo: true,
    });
  }

  const supabase = await createClient();

  const [f3, f4, f5] = await Promise.all([
    computeF3Discrepancy(auth.userId, supabase),
    computeF4PerceptionGap(auth.userId, supabase),
    computeF5RecognitionGap(auth.userId, supabase),
  ]);

  return jsonOk({ f3, f4, f5 });
}

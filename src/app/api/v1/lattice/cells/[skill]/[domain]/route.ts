/**
 * GET /api/v1/lattice/cells/[skill]/[domain]
 *
 * Returns the evidence_unit rows (and their cv_item_metadata labels) whose
 * primary cell is (skill_index, domain_index). Used by CellEvidenceDrawer.
 *
 * Includes ALL evidence_cell_weights for this cell, not just primaries —
 * so items that "touch" this cell via secondary weights also appear.
 */

import { createClient } from "@/lib/supabase/server";
import { isErrorResponse, jsonError, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";

type RouteContext = { params: Promise<{ skill: string; domain: string }> };

export type CellEvidenceItem = {
  evidence_unit_id: string;
  raw_text:          string | null;
  quadrant:          string;
  physician_confirmed: boolean;
  weight:            number;
  created_at:        string;
  // from cv_item_metadata (may not exist for every evidence_unit)
  item_id:           string | null;
  item_type:         string | null;
  display_label:     string | null;
};

export async function GET(_request: Request, context: RouteContext) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  if (auth.demo) return jsonOk({ items: [], skill_index: 0, domain_index: 0 });

  const { skill, domain } = await context.params;
  const si = parseInt(skill, 10);
  const di = parseInt(domain, 10);

  if (isNaN(si) || si < 0 || si > 7 || isNaN(di) || di < 0 || di > 7) {
    return jsonError("validation_error", "skill and domain must be integers 0–7.", 400);
  }

  const supabase = await createClient();

  // Get all evidence_cell_weights for this cell
  const { data: weights, error } = await supabase
    .from("evidence_cell_weights")
    .select("evidence_unit_id, weight, recognition_quadrant")
    .eq("user_id", auth.userId)
    .eq("skill_index", si)
    .eq("domain_index", di)
    .order("weight", { ascending: false })
    .limit(50);

  if (error) return jsonError("db_error", error.message, 500);

  const euIds = (weights ?? []).map((w) => w.evidence_unit_id as string).filter(Boolean);

  // Fetch evidence_unit rows and cv_item_metadata in parallel
  const [euRes, metaRes] = await Promise.all([
    euIds.length > 0
      ? supabase
          .from("evidence_unit")
          .select("id, raw_text, recognition_quadrant, physician_confirmed, created_at")
          .in("id", euIds)
          .eq("user_id", auth.userId)
      : Promise.resolve({ data: [] as Record<string, unknown>[], error: null }),
    euIds.length > 0
      ? supabase
          .from("cv_item_metadata")
          .select("id, evidence_unit_id, item_type, display_label")
          .in("evidence_unit_id", euIds)
          .eq("user_id", auth.userId)
      : Promise.resolve({ data: [] as Record<string, unknown>[], error: null }),
  ]);

  const euMap = new Map<string, Record<string, unknown>>();
  for (const eu of euRes.data ?? []) euMap.set(eu.id as string, eu);

  const metaMap = new Map<string, { id: string; item_type: string; display_label: string | null }>();
  for (const m of metaRes.data ?? []) {
    metaMap.set(m.evidence_unit_id as string, {
      id:            m.id as string,
      item_type:     m.item_type as string,
      display_label: (m.display_label as string | null) ?? null,
    });
  }

  const items: CellEvidenceItem[] = (weights ?? []).map((w) => {
    const euId = w.evidence_unit_id as string;
    const eu   = euMap.get(euId) ?? {};
    const meta = metaMap.get(euId);
    return {
      evidence_unit_id:   euId,
      raw_text:           (eu.raw_text as string | null) ?? null,
      quadrant:           (w.recognition_quadrant as string) ?? (eu.recognition_quadrant as string) ?? "OV",
      physician_confirmed: Boolean(eu.physician_confirmed),
      weight:             w.weight as number,
      created_at:         (eu.created_at as string) ?? "",
      item_id:            meta?.id ?? null,
      item_type:          meta?.item_type ?? null,
      display_label:      meta?.display_label ?? null,
    };
  });

  return jsonOk({ items, skill_index: si, domain_index: di });
}

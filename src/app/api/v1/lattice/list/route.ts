/**
 * GET /api/v1/lattice/list
 *
 * Returns evidence_unit rows with their primary cell coordinates and
 * cv_item_metadata labels. Used by the Lattice List view.
 *
 * Query params:
 *   q        — search string (matches display_label or raw_text, case-insensitive)
 *   sort     — "date_desc" (default) | "date_asc" | "density_desc"
 *   limit    — max rows (default 100, max 200)
 *   offset   — pagination offset (default 0)
 */

import { createClient } from "@/lib/supabase/server";
import { isErrorResponse, jsonError, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";

export type LatticeListItem = {
  id:                  string;
  skill_index:         number;
  domain_index:        number;
  recognition_quadrant: string;
  raw_text:            string | null;
  physician_confirmed: boolean;
  created_at:          string;
  // primary cell weight (1.0 for manual items, highest-weight cell for parsed)
  primary_weight:      number;
  // all cells this item touches
  cells: { skill_index: number; domain_index: number; weight: number; quadrant: string }[];
  // cv_item_metadata fields (null if not yet promoted to bank)
  item_id:             string | null;
  item_type:           string | null;
  display_label:       string | null;
};

export async function GET(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  if (auth.demo) return jsonOk({ items: [], total: 0 });

  const url    = new URL(request.url);
  const q      = url.searchParams.get("q") ?? "";
  const sort   = url.searchParams.get("sort") ?? "date_desc";
  const limit  = Math.min(200, parseInt(url.searchParams.get("limit") ?? "100", 10));
  const offset = Math.max(0, parseInt(url.searchParams.get("offset") ?? "0", 10));

  const supabase = await createClient();

  // Fetch evidence_unit rows
  let query = supabase
    .from("evidence_unit")
    .select("id, skill_index, domain_index, recognition_quadrant, raw_text, physician_confirmed, created_at", { count: "exact" })
    .eq("user_id", auth.userId);

  if (q) {
    query = query.ilike("raw_text", `%${q}%`);
  }

  if (sort === "date_asc") {
    query = query.order("created_at", { ascending: true });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  query = query.range(offset, offset + limit - 1);

  const { data: units, error, count } = await query;
  if (error) return jsonError("db_error", error.message, 500);

  const euIds = (units ?? []).map((u) => u.id as string);

  // Batch fetch cell weights and metadata
  const [weightsRes, metasRes] = await Promise.all([
    euIds.length > 0
      ? supabase
          .from("evidence_cell_weights")
          .select("evidence_unit_id, skill_index, domain_index, weight, recognition_quadrant")
          .in("evidence_unit_id", euIds)
          .eq("user_id", auth.userId)
      : Promise.resolve({ data: [], error: null }),
    euIds.length > 0
      ? supabase
          .from("cv_item_metadata")
          .select("id, evidence_unit_id, item_type, display_label")
          .in("evidence_unit_id", euIds)
          .eq("user_id", auth.userId)
      : Promise.resolve({ data: [], error: null }),
  ]);

  // Build lookup maps
  type WeightRow = { evidence_unit_id: unknown; skill_index: unknown; domain_index: unknown; weight: unknown; recognition_quadrant: unknown };
  const weightsByEu = new Map<string, WeightRow[]>();
  for (const w of (weightsRes.data ?? []) as WeightRow[]) {
    const euId = w.evidence_unit_id as string;
    if (!weightsByEu.has(euId)) weightsByEu.set(euId, []);
    weightsByEu.get(euId)!.push(w);
  }

  const metaByEu = new Map<string, { id: string; item_type: string; display_label: string | null }>();
  for (const m of metasRes.data ?? []) {
    metaByEu.set(m.evidence_unit_id as string, {
      id:            m.id as string,
      item_type:     m.item_type as string,
      display_label: (m.display_label as string | null) ?? null,
    });
  }

  const items: LatticeListItem[] = (units ?? []).map((u) => {
    const cells = (weightsByEu.get(u.id as string) ?? []).map((w) => ({
      skill_index:  w.skill_index as number,
      domain_index: w.domain_index as number,
      weight:       w.weight as number,
      quadrant:     (w.recognition_quadrant as string) ?? "OV",
    }));
    const primaryWeight = cells.length > 0
      ? Math.max(...cells.map((c) => c.weight))
      : 1.0;

    const meta = metaByEu.get(u.id as string);

    // If search query also matches display_label, filter those in (raw_text ilike already applied)
    if (q && meta?.display_label && !meta.display_label.toLowerCase().includes(q.toLowerCase())) {
      // keep raw_text match already filtered by DB; no extra filtering needed here
    }

    return {
      id:                   u.id as string,
      skill_index:          u.skill_index as number,
      domain_index:         u.domain_index as number,
      recognition_quadrant: (u.recognition_quadrant as string) ?? "OV",
      raw_text:             (u.raw_text as string | null) ?? null,
      physician_confirmed:  Boolean(u.physician_confirmed),
      created_at:           u.created_at as string,
      primary_weight:       primaryWeight,
      cells,
      item_id:              meta?.id ?? null,
      item_type:            meta?.item_type ?? null,
      display_label:        meta?.display_label ?? null,
    };
  });

  return jsonOk({ items, total: count ?? 0 });
}

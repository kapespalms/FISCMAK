/**
 * POST /api/v1/documents/[documentId]/confirm-lines
 *
 * Batch confirm/reject CV-parsed staging rows. For each accepted line:
 *   - Resolves final cell distribution (parsed or physician-supplied override)
 *   - Creates one evidence_unit row (primary cell = highest-weight cell)
 *   - Creates N evidence_cell_weights rows (full distribution, weights intact)
 *   - Sets activity_entries.user_confirmed = true
 * For rejected lines: sets user_confirmed = true, no evidence rows created.
 *
 * Override behaviour (§8.2 — distribution-preserving):
 *   "Accept as-is" → omit override_cells; parsed distribution used unchanged.
 *   Override       → supply a new cell list; weights re-normalized, min 0.15
 *                    filter and 3-cell cap applied. Single-cell collapse is NOT
 *                    a valid override — supply at least the primary cell with a
 *                    positive weight and the existing distribution will be kept
 *                    for any cells not included. If all cells are provided the
 *                    physician's full distribution takes precedence.
 *
 * BUILD_ORDER 4.1 Pass 3.
 */

import { createClient } from "@/lib/supabase/server";
import { isErrorResponse, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";
import { unpackCells } from "@/lib/v2/document-activities";
import type { CvCellWeight } from "@/lib/v2/lattice/document-parser";

type OverrideCell = {
  domain_index: number;
  track_index: number;
  weight: number;
  quadrant?: string;
};

type LineDecision = {
  activity_id: string;
  accept: boolean;
  /**
   * Physician-supplied distribution. If absent, the parsed distribution from
   * activity_entries.mak_rationale is used unchanged (§8.2 "accept as-is").
   * Weights are re-normalized; cells below 0.15 dropped; capped at 3.
   * Supply the full desired distribution — partial supply is treated as full
   * replacement. The UI constructs the full list (primary-swap or full edit).
   */
  override_cells?: OverrideCell[];
};

type RouteContext = { params: Promise<{ documentId: string }> };

const MIN_CELL_WEIGHT = 0.15;
const MAX_CELLS = 3;

/**
 * Re-normalize a physician-supplied cell list. Preserves relative weights,
 * drops cells below MIN_CELL_WEIGHT, caps at MAX_CELLS. Returns null if no
 * valid cells remain (falls back to parsed distribution).
 */
function normalizeOverride(raw: OverrideCell[]): CvCellWeight[] | null {
  const valid = raw.filter(
    (c) =>
      Number.isInteger(c.domain_index) && c.domain_index >= 0 && c.domain_index <= 7 &&
      Number.isInteger(c.track_index)  && c.track_index  >= 0 && c.track_index  <= 7 &&
      typeof c.weight === "number" && c.weight > 0,
  );
  if (valid.length === 0) return null;

  const total = valid.reduce((s, c) => s + c.weight, 0);
  let cells: CvCellWeight[] = valid
    .map((c) => ({
      domain_index: c.domain_index,
      track_index:  c.track_index,
      weight:       c.weight / total,
      quadrant:     (c.quadrant === "SV" ? "SV" : "OV") as "OV" | "SV",
    }))
    .sort((a, b) => b.weight - a.weight)
    .slice(0, MAX_CELLS)
    .filter((c) => c.weight >= MIN_CELL_WEIGHT);

  if (cells.length === 0) return null;

  // Re-normalize after the min-weight filter
  const finalTotal = cells.reduce((s, c) => s + c.weight, 0);
  return cells.map((c) => ({ ...c, weight: c.weight / finalTotal }));
}

export async function POST(request: Request, context: RouteContext) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const { documentId } = await context.params;
  const body = (await request.json()) as { lines?: LineDecision[] };

  if (!Array.isArray(body.lines) || body.lines.length === 0) {
    return jsonOk({ error: "validation_error", message: "Provide at least one line decision." }, 400);
  }

  if (auth.demo) {
    return jsonOk({ created: 0, skipped: 0, demo: true });
  }

  const supabase = await createClient();
  const now = new Date().toISOString();

  // Fetch all relevant activity_entries in one round-trip
  const activityIds = body.lines.map((l) => l.activity_id);
  const { data: entries, error: fetchError } = await supabase
    .from("activity_entries")
    .select("id, user_id, raw_text, mak_rationale")
    .in("id", activityIds)
    .eq("user_id", auth.userId); // belt-and-suspenders alongside RLS

  if (fetchError) {
    return jsonOk({ error: "fetch_error", message: fetchError.message }, 500);
  }

  const entryMap = new Map(
    (entries ?? []).map((e) => [e.id as string, e]),
  );

  let created = 0;
  let skipped = 0;
  const confirmedIds: string[] = [];

  for (const decision of body.lines) {
    const entry = entryMap.get(decision.activity_id);
    if (!entry) continue;

    confirmedIds.push(decision.activity_id);

    if (!decision.accept) {
      skipped++;
      continue;
    }

    // Resolve final cell distribution — override takes precedence if valid
    const parsedCells = unpackCells(entry.mak_rationale as string | null);
    const cells: CvCellWeight[] =
      (decision.override_cells?.length
        ? normalizeOverride(decision.override_cells) ?? parsedCells
        : parsedCells);

    if (cells.length === 0) {
      skipped++;
      continue;
    }

    // Primary cell = highest-weight cell (already sorted by normalizeOverride
    // and by buildWeightedCells in the parser)
    const primary = cells[0]!;

    // Insert evidence_unit (primary cell)
    const { data: euRow, error: euError } = await supabase
      .from("evidence_unit")
      .insert({
        user_id:              auth.userId,
        domain_index:         primary.domain_index,
        track_index:          primary.track_index,
        recognition_quadrant: primary.quadrant,
        raw_text:             entry.raw_text,
        physician_confirmed:  true,
        source_activity_id:   decision.activity_id,
        created_at:           now,
        updated_at:           now,
      })
      .select("id")
      .single();

    if (euError || !euRow) {
      console.error("[confirm-lines] evidence_unit insert failed:", euError?.message);
      skipped++;
      continue;
    }

    // Insert evidence_cell_weights — full distribution, normalized weights intact
    const weightRows = cells.map(({ domain_index, track_index, weight, quadrant }) => ({
      evidence_unit_id:     euRow.id,
      user_id:              auth.userId,
      domain_index,
      track_index,
      weight,
      recognition_quadrant: quadrant,
    }));

    const { error: ecwError } = await supabase
      .from("evidence_cell_weights")
      .insert(weightRows);

    if (ecwError) {
      console.error("[confirm-lines] evidence_cell_weights insert failed:", ecwError.message);
      // evidence_unit already created — log but count as partial success
    }

    created++;
  }

  // Mark all reviewed lines confirmed in one update
  if (confirmedIds.length > 0) {
    await supabase
      .from("activity_entries")
      .update({ user_confirmed: true })
      .in("id", confirmedIds)
      .eq("user_id", auth.userId);
  }

  return jsonOk({
    created,
    skipped,
    document_id: documentId,
    confirmed_at: now,
  });
}

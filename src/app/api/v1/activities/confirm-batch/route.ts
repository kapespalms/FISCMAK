/**
 * POST /api/v1/activities/confirm-batch
 *
 * C1: Bulk-confirm Mak/pulse captures → evidence_unit + evidence_cell_weights.
 * Mirrors confirm-lines (CV pipeline) but for conversational / pulse sources.
 *
 * For each accepted item:
 *   - Unpacks cell distribution from mak_rationale (same format as confirm-lines).
 *   - Falls back to primary_domain / primary_track indices for pulse entries
 *     that have no mak_rationale (single-cell, unit weight).
 *   - Derives recognition_quadrant from scope + energy_valence.
 *   - Derives energy_score from energy_valence (1–5 scale).
 *   - Inserts evidence_unit + evidence_cell_weights.
 * For all items (accepted or dismissed): sets user_confirmed = true.
 */

import { createClient } from "@/lib/supabase/server";
import { isErrorResponse, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";
import { unpackCells } from "@/lib/v2/document-activities";
import type { CvCellWeight } from "@/lib/v2/lattice/document-parser";

type BatchItem = { id: string; accept: boolean };
type RouteBody = { items?: BatchItem[] };

function resolveQuadrant(
  scope: string | null,
  inputSource: string | null,
  energyValence: string | null,
): "OV" | "SV" | "OI" | "SI" {
  const invisible =
    scope === "invisible" ||
    inputSource?.includes("invisible") ||
    inputSource === "pulse";

  if (invisible) {
    return energyValence === "draining" ? "SI" : "OI";
  }
  return "OV";
}

function resolveEnergyScore(valence: string | null): number | null {
  if (valence === "energizing") return 4;
  if (valence === "draining") return 2;
  return null;
}

/** Single-cell fallback for pulse entries that have no mak_rationale. */
function singleCellFromIndices(
  primaryDomain: string | null,
  primaryTrack: string | null,
  quadrant: "OV" | "SV" | "OI" | "SI",
): CvCellWeight[] {
  const skill_index = primaryDomain !== null ? parseInt(primaryDomain, 10) : NaN;
  const domain_index = primaryTrack !== null ? parseInt(primaryTrack, 10) : NaN;

  if (
    Number.isFinite(skill_index) && skill_index >= 0 && skill_index <= 7 &&
    Number.isFinite(domain_index) && domain_index >= 0 && domain_index <= 7
  ) {
    return [{ skill_index, domain_index, weight: 1.0, quadrant }];
  }
  // Default: Personal & Professional Development (7) × Clinician (0)
  return [{ skill_index: 7, domain_index: 0, weight: 1.0, quadrant }];
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const body = (await request.json().catch(() => ({}))) as RouteBody;
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return jsonOk({ error: "validation_error", message: "Provide at least one item." }, 400);
  }

  if (auth.demo) {
    return jsonOk({ created: 0, skipped: 0, demo: true });
  }

  const supabase = await createClient();
  const now = new Date().toISOString();

  const allIds = body.items.map((i) => i.id);
  const acceptedIds = new Set(
    body.items.filter((i) => i.accept).map((i) => i.id),
  );

  const { data: entries, error: fetchErr } = await supabase
    .from("activity_entries")
    .select(
      "id, user_id, raw_text, mak_rationale, energy_valence, scope, input_source, primary_domain, primary_track",
    )
    .in("id", allIds)
    .eq("user_id", auth.userId);

  if (fetchErr) {
    return jsonOk({ error: "fetch_error", message: fetchErr.message }, 500);
  }

  const entryMap = new Map((entries ?? []).map((e) => [e.id as string, e]));

  let created = 0;
  let skipped = 0;

  for (const id of acceptedIds) {
    const entry = entryMap.get(id);
    if (!entry) { skipped++; continue; }

    const quadrant = resolveQuadrant(
      entry.scope as string | null,
      entry.input_source as string | null,
      entry.energy_valence as string | null,
    );
    const energyScore = resolveEnergyScore(entry.energy_valence as string | null);

    // Prefer packed mak_rationale; fall back to primary_domain/track integers.
    const packed = unpackCells(entry.mak_rationale as string | null);
    const cells: CvCellWeight[] =
      packed.length > 0
        ? packed.map((c) => ({ ...c, quadrant }))
        : singleCellFromIndices(
            entry.primary_domain as string | null,
            entry.primary_track as string | null,
            quadrant,
          );

    const primary = cells[0]!;

    const { data: euRow, error: euErr } = await supabase
      .from("evidence_unit")
      .insert({
        user_id:              auth.userId,
        skill_index:          primary.skill_index,
        domain_index:         primary.domain_index,
        recognition_quadrant: primary.quadrant,
        raw_text:             entry.raw_text as string | null,
        energy_score:         energyScore,
        physician_confirmed:  true,
        source_activity_id:   id,
        created_at:           now,
        updated_at:           now,
      })
      .select("id")
      .single();

    if (euErr || !euRow) {
      console.error("[confirm-batch] evidence_unit insert:", euErr?.message);
      skipped++;
      continue;
    }

    const weightRows = cells.map(({ skill_index, domain_index, weight, quadrant: q }) => ({
      evidence_unit_id:     euRow.id,
      user_id:              auth.userId,
      skill_index,
      domain_index,
      weight,
      recognition_quadrant: q,
    }));

    const { error: ecwErr } = await supabase
      .from("evidence_cell_weights")
      .insert(weightRows);

    if (ecwErr) {
      console.error("[confirm-batch] evidence_cell_weights insert:", ecwErr.message);
    }

    created++;
  }

  // Mark all reviewed items confirmed (accepted or dismissed).
  if (allIds.length > 0) {
    await supabase
      .from("activity_entries")
      .update({ user_confirmed: true })
      .in("id", allIds)
      .eq("user_id", auth.userId);
  }

  return jsonOk({ created, skipped, confirmed_at: now });
}

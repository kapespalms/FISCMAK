/**
 * Profile items API — Phase 1a manual on-ramp.
 *
 * GET  /api/v1/profile/items           — fetch all bank items for current user
 * POST /api/v1/profile/items           — create item: evidence_unit + evidence_cell_weights + cv_item_metadata
 *
 * The POST is the atomic "manual add" operation. Unlike POST /api/v1/output/studio/bank
 * (which requires an existing evidence_unit_id), this route creates the evidence_unit
 * itself using the canonical cell for the given item_type (from profile-cells.ts).
 */

import { createClient } from "@/lib/supabase/server";
import { isErrorResponse, jsonError, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";
import { CV_ITEM_TYPES, type CvItemType } from "@/lib/v2/output-studio-bank";
import { cellForItemType } from "@/lib/v2/profile-cells";

type CreateItemBody = {
  item_type: CvItemType;
  display_label: string;
  structured_data?: Record<string, unknown>;
};

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  if (auth.demo) return jsonOk({ items: [] });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cv_item_metadata")
    .select(
      "id, evidence_unit_id, item_type, structured_data, display_label, created_at, " +
      "evidence_unit!evidence_unit_id(skill_index, domain_index, recognition_quadrant, energy_score, raw_text, physician_confirmed)",
    )
    .eq("user_id", auth.userId)
    .order("created_at", { ascending: false });

  if (error) return jsonError("db_error", error.message, 500);
  return jsonOk({ items: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  if (auth.demo) return jsonError("demo_unsupported", "Profile editing is not available in demo mode.", 403);

  let body: Partial<CreateItemBody>;
  try {
    body = (await request.json()) as Partial<CreateItemBody>;
  } catch {
    return jsonError("validation_error", "Invalid JSON body.", 400);
  }

  if (!body.item_type || !(CV_ITEM_TYPES as readonly string[]).includes(body.item_type)) {
    return jsonError("validation_error", "Valid item_type is required.", 400);
  }
  if (!body.display_label?.trim()) {
    return jsonError("validation_error", "display_label is required.", 400);
  }

  const cell = cellForItemType(body.item_type);
  const supabase = await createClient();
  const now = new Date().toISOString();

  // 1. Create evidence_unit
  const { data: eu, error: euErr } = await supabase
    .from("evidence_unit")
    .insert({
      user_id:              auth.userId,
      skill_index:          cell.skill_index,
      domain_index:         cell.domain_index,
      recognition_quadrant: cell.recognition_quadrant,
      raw_text:             body.display_label,
      physician_confirmed:  true,
      source_activity_id:   null,
      created_at:           now,
      updated_at:           now,
    })
    .select("id")
    .single();

  if (euErr || !eu) {
    return jsonError("db_error", euErr?.message ?? "evidence_unit insert failed", 500);
  }

  // 2. Create evidence_cell_weights (single primary cell, weight = 1.0)
  const { error: ecwErr } = await supabase
    .from("evidence_cell_weights")
    .insert({
      evidence_unit_id:     eu.id,
      user_id:              auth.userId,
      skill_index:          cell.skill_index,
      domain_index:         cell.domain_index,
      weight:               1.0,
      recognition_quadrant: cell.recognition_quadrant,
    });

  if (ecwErr) {
    // Non-fatal — evidence_unit already exists; log but continue
    console.error("[profile/items POST] evidence_cell_weights insert failed:", ecwErr.message);
  }

  // 3. Create cv_item_metadata
  const { data: item, error: metaErr } = await supabase
    .from("cv_item_metadata")
    .insert({
      user_id:          auth.userId,
      evidence_unit_id: eu.id,
      item_type:        body.item_type,
      display_label:    body.display_label.trim(),
      structured_data:  body.structured_data ?? {},
      updated_at:       now,
    })
    .select(
      "id, evidence_unit_id, item_type, structured_data, display_label, created_at, " +
      "evidence_unit!evidence_unit_id(skill_index, domain_index, recognition_quadrant)",
    )
    .single();

  if (metaErr || !item) {
    return jsonError("db_error", metaErr?.message ?? "cv_item_metadata insert failed", 500);
  }

  return jsonOk({ item }, 201);
}

/**
 * POST /api/v1/profile/items/from-activity
 *
 * Converts an unconfirmed activity_entry into a bank item by:
 *   1. Running the confirm-lines logic inline (evidence_unit + evidence_cell_weights)
 *   2. Creating cv_item_metadata with the physician-assigned item_type
 *   3. Marking activity_entries.user_confirmed = true
 *
 * This is the "drag from tray to section card" operation in the profile page.
 * Body: { activity_id, item_type, display_label?, structured_data? }
 */

import { createClient } from "@/lib/supabase/server";
import { isErrorResponse, jsonError, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";
import { unpackCells } from "@/lib/v2/document-activities";
import { CV_ITEM_TYPES, type CvItemType } from "@/lib/v2/output-studio-bank";

type FromActivityBody = {
  activity_id: string;
  item_type: CvItemType;
  display_label?: string;
  structured_data?: Record<string, unknown>;
};

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  if (auth.demo) return jsonError("demo_unsupported", "Profile editing is not available in demo mode.", 403);

  let body: Partial<FromActivityBody>;
  try {
    body = (await request.json()) as Partial<FromActivityBody>;
  } catch {
    return jsonError("validation_error", "Invalid JSON body.", 400);
  }

  if (!body.activity_id) return jsonError("validation_error", "activity_id is required.", 400);
  if (!body.item_type || !(CV_ITEM_TYPES as readonly string[]).includes(body.item_type)) {
    return jsonError("validation_error", "Valid item_type is required.", 400);
  }

  const supabase = await createClient();
  const now = new Date().toISOString();

  // Fetch the activity_entry
  const { data: entry, error: fetchErr } = await supabase
    .from("activity_entries")
    .select("id, user_id, raw_text, mak_rationale, user_confirmed")
    .eq("id", body.activity_id)
    .eq("user_id", auth.userId)
    .single();

  if (fetchErr || !entry) return jsonError("not_found", "Activity entry not found.", 404);
  if (entry.user_confirmed) return jsonError("already_confirmed", "This entry has already been confirmed.", 409);

  // Unpack the parsed cell distribution
  const cells = unpackCells(entry.mak_rationale as string | null);
  if (cells.length === 0) {
    return jsonError("parse_error", "No cell distribution found for this entry.", 422);
  }

  const primary = cells[0]!;

  // 1. Create evidence_unit
  const { data: eu, error: euErr } = await supabase
    .from("evidence_unit")
    .insert({
      user_id:              auth.userId,
      skill_index:          primary.skill_index,
      domain_index:         primary.domain_index,
      recognition_quadrant: primary.quadrant,
      raw_text:             entry.raw_text,
      physician_confirmed:  true,
      source_activity_id:   body.activity_id,
      created_at:           now,
      updated_at:           now,
    })
    .select("id")
    .single();

  if (euErr || !eu) {
    return jsonError("db_error", euErr?.message ?? "evidence_unit insert failed", 500);
  }

  // 2. Create evidence_cell_weights (full distribution)
  const weightRows = cells.map(({ skill_index, domain_index, weight, quadrant }) => ({
    evidence_unit_id:     eu.id,
    user_id:              auth.userId,
    skill_index,
    domain_index,
    weight,
    recognition_quadrant: quadrant,
  }));

  const { error: ecwErr } = await supabase.from("evidence_cell_weights").insert(weightRows);
  if (ecwErr) {
    console.error("[from-activity] evidence_cell_weights insert failed:", ecwErr.message);
  }

  // 3. Create cv_item_metadata
  const displayLabel = (body.display_label?.trim() || entry.raw_text || "").slice(0, 255);
  const { data: item, error: metaErr } = await supabase
    .from("cv_item_metadata")
    .insert({
      user_id:          auth.userId,
      evidence_unit_id: eu.id,
      item_type:        body.item_type,
      display_label:    displayLabel,
      structured_data:  body.structured_data ?? {},
      updated_at:       now,
    })
    .select("id, evidence_unit_id, item_type, structured_data, display_label, created_at")
    .single();

  if (metaErr || !item) {
    return jsonError("db_error", metaErr?.message ?? "cv_item_metadata insert failed", 500);
  }

  // 4. Mark activity_entry as confirmed
  await supabase
    .from("activity_entries")
    .update({ user_confirmed: true })
    .eq("id", body.activity_id)
    .eq("user_id", auth.userId);

  return jsonOk({ item }, 201);
}

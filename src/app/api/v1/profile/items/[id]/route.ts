/**
 * PATCH /api/v1/profile/items/[id]  — edit structured_data + display_label
 * DELETE /api/v1/profile/items/[id] — delete by removing evidence_unit (cascades to
 *                                     cv_item_metadata + evidence_cell_weights)
 */

import { createClient } from "@/lib/supabase/server";
import { isErrorResponse, jsonError, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";

type RouteContext = { params: Promise<{ id: string }> };

type PatchBody = {
  display_label?: string;
  structured_data?: Record<string, unknown>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  if (auth.demo) return jsonError("demo_unsupported", "Profile editing is not available in demo mode.", 403);

  const { id } = await context.params;

  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return jsonError("validation_error", "Invalid JSON body.", 400);
  }

  if (body.display_label !== undefined && !body.display_label.trim()) {
    return jsonError("validation_error", "display_label cannot be blank.", 400);
  }

  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.display_label !== undefined) patch.display_label = body.display_label.trim();
  if (body.structured_data !== undefined) patch.structured_data = body.structured_data;

  const supabase = await createClient();
  const { data: item, error } = await supabase
    .from("cv_item_metadata")
    .update(patch)
    .eq("id", id)
    .eq("user_id", auth.userId)
    .select(
      "id, evidence_unit_id, item_type, structured_data, display_label, created_at, " +
      "evidence_unit!evidence_unit_id(skill_index, domain_index, recognition_quadrant)",
    )
    .single();

  if (error) return jsonError("db_error", error.message, 500);
  if (!item) return jsonError("not_found", "Item not found.", 404);

  return jsonOk({ item });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  if (auth.demo) return jsonError("demo_unsupported", "Profile editing is not available in demo mode.", 403);

  const { id } = await context.params;
  const supabase = await createClient();

  // Resolve evidence_unit_id first (need it to cascade-delete)
  const { data: meta, error: fetchErr } = await supabase
    .from("cv_item_metadata")
    .select("evidence_unit_id")
    .eq("id", id)
    .eq("user_id", auth.userId)
    .single();

  if (fetchErr || !meta) return jsonError("not_found", "Item not found.", 404);

  // Delete evidence_unit — cascades to cv_item_metadata + evidence_cell_weights
  const { error: delErr } = await supabase
    .from("evidence_unit")
    .delete()
    .eq("id", meta.evidence_unit_id)
    .eq("user_id", auth.userId);

  if (delErr) return jsonError("db_error", delErr.message, 500);

  return jsonOk({ deleted: id });
}

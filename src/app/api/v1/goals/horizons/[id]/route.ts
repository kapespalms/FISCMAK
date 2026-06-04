/**
 * PATCH /api/v1/goals/horizons/[id]  — update a goal_record
 * DELETE /api/v1/goals/horizons/[id] — delete a goal_record
 */

import { createClient } from "@/lib/supabase/server";
import { isErrorResponse, jsonError, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  if (auth.demo) return jsonError("demo_unsupported", "Goal editing is not available in demo mode.", 403);

  const { id } = await context.params;
  let body: Record<string, unknown>;
  try { body = (await request.json()) as Record<string, unknown>; }
  catch { return jsonError("validation_error", "Invalid JSON.", 400); }

  const allowed = [
    "specific", "measurable", "achievable", "relevant", "time_bound",
    "implementation_intention", "wish", "outcome", "obstacle", "plan",
    "description", "domain_index",
  ];
  const patch: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const key of allowed) {
    if (key in body) patch[key] = typeof body[key] === "string" ? (body[key] as string).trim() || null : body[key];
  }

  const supabase = await createClient();
  try {
    const { data, error } = await supabase
      .from("goal_records")
      .update(patch)
      .eq("id", id)
      .eq("user_id", auth.userId)
      .select()
      .single();

    if (error) return jsonError("db_error", error.message, 500);
    if (!data) return jsonError("not_found", "Goal not found.", 404);
    return jsonOk({ goal: data });
  } catch (err) {
    return jsonError("db_error", err instanceof Error ? err.message : "Update failed", 500);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  if (auth.demo) return jsonError("demo_unsupported", "Goal editing is not available in demo mode.", 403);

  const { id } = await context.params;
  const supabase = await createClient();

  try {
    const { error } = await supabase
      .from("goal_records")
      .delete()
      .eq("id", id)
      .eq("user_id", auth.userId);

    if (error) return jsonError("db_error", error.message, 500);
    return jsonOk({ deleted: id });
  } catch (err) {
    return jsonError("db_error", err instanceof Error ? err.message : "Delete failed", 500);
  }
}

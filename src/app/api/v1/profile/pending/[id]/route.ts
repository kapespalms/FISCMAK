/**
 * DELETE /api/v1/profile/pending/:id
 *
 * Dismiss a pending activity_entry without creating a bank item.
 * Deletes the staging row so it no longer appears in the tray or
 * the dashboard unplaced count.
 */

import { createClient } from "@/lib/supabase/server";
import { isErrorResponse, jsonError, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  if (auth.demo) return jsonError("demo_unsupported", "Not available in demo mode.", 403);

  const { id } = await params;
  if (!id) return jsonError("validation_error", "id is required.", 400);

  const supabase = await createClient();

  const { error } = await supabase
    .from("activity_entries")
    .delete()
    .eq("id", id)
    .eq("user_id", auth.userId);

  if (error) return jsonError("db_error", error.message, 500);

  return jsonOk({ dismissed: true });
}

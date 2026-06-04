/**
 * GET /api/v1/profile/pending
 *
 * Returns activity_entries where user_confirmed = false for the current user.
 * These are the "unplaced" items in the profile drag-drop tray — parsed from
 * uploaded CVs but not yet confirmed/typed by the physician.
 *
 * Ordered most-recent first. Returns up to 200 rows (the tray is paginated in Phase 2).
 */

import { createClient } from "@/lib/supabase/server";
import { isErrorResponse, jsonError, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";

export type PendingItem = {
  id: string;
  raw_text: string | null;
  primary_domain: string | null;
  primary_track: string | null;
  confidence_score: number | null;
  source_document_id: string | null;
  input_source: string | null;
  created_at: string;
};

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  if (auth.demo) return jsonOk({ pending: [] });

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activity_entries")
    .select("id, raw_text, primary_domain, primary_track, confidence_score, source_document_id, input_source, created_at")
    .eq("user_id", auth.userId)
    .eq("user_confirmed", false)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    // Gracefully handle if migration 20260552 hasn't been applied yet
    if (error.message.includes("user_confirmed") || error.message.includes("source_document_id")) {
      return jsonOk({ pending: [], migration_pending: true });
    }
    return jsonError("db_error", error.message, 500);
  }

  return jsonOk({ pending: (data ?? []) as PendingItem[] });
}

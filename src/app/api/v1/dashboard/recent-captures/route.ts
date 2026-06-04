/**
 * GET /api/v1/dashboard/recent-captures
 *
 * Returns:
 *   - last 7 evidence_unit rows with cv_item_metadata labels (for the ledger)
 *   - count of evidence_units created in the last 7 days (for Mak observation)
 *   - count of pending (unconfirmed) activity_entries (for the tray badge)
 */

import { createClient } from "@/lib/supabase/server";
import { isErrorResponse, jsonError, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";

export type RecentCapture = {
  id:          string;
  raw_text:    string | null;
  quadrant:    string;
  created_at:  string;
  display_label: string | null;
  item_type:   string | null;
};

export type RecentCapturesResult = {
  recent:           RecentCapture[];
  this_week_count:  number;
  pending_count:    number;
};

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  if (auth.demo) return jsonOk({ recent: [], this_week_count: 0, pending_count: 0 });

  const supabase = await createClient();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [recentRes, weekCountRes, pendingRes] = await Promise.all([
    // Last 7 items
    supabase
      .from("evidence_unit")
      .select("id, raw_text, recognition_quadrant, created_at")
      .eq("user_id", auth.userId)
      .order("created_at", { ascending: false })
      .limit(7),

    // Count this week
    supabase
      .from("evidence_unit")
      .select("id", { count: "exact", head: true })
      .eq("user_id", auth.userId)
      .gte("created_at", sevenDaysAgo),

    // Pending unconfirmed activity_entries (graceful — column may not exist)
    supabase
      .from("activity_entries")
      .select("id", { count: "exact", head: true })
      .eq("user_id", auth.userId)
      .eq("user_confirmed", false),
  ]);

  if (recentRes.error) return jsonError("db_error", recentRes.error.message, 500);

  const euIds = (recentRes.data ?? []).map((u) => u.id as string);

  // Fetch cv_item_metadata labels for these units
  const metaMap = new Map<string, { display_label: string | null; item_type: string }>();
  if (euIds.length > 0) {
    const { data: metas } = await supabase
      .from("cv_item_metadata")
      .select("evidence_unit_id, display_label, item_type")
      .in("evidence_unit_id", euIds)
      .eq("user_id", auth.userId);
    for (const m of metas ?? []) {
      metaMap.set(m.evidence_unit_id as string, {
        display_label: (m.display_label as string | null) ?? null,
        item_type:     m.item_type as string,
      });
    }
  }

  const recent: RecentCapture[] = (recentRes.data ?? []).map((u) => {
    const meta = metaMap.get(u.id as string);
    return {
      id:            u.id as string,
      raw_text:      (u.raw_text as string | null) ?? null,
      quadrant:      (u.recognition_quadrant as string) ?? "OV",
      created_at:    u.created_at as string,
      display_label: meta?.display_label ?? null,
      item_type:     meta?.item_type ?? null,
    };
  });

  return jsonOk({
    recent,
    this_week_count: weekCountRes.count ?? 0,
    // Graceful: if user_confirmed column doesn't exist, return 0
    pending_count:   pendingRes.error ? 0 : (pendingRes.count ?? 0),
  } satisfies RecentCapturesResult);
}

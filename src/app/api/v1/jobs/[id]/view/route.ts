import { createClient } from "@/lib/supabase/server";
import { getServerDemo } from "@/lib/v2/demo-store";
import { isErrorResponse, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const { id: jobId } = await params;
  const now = new Date().toISOString();

  if (auth.demo) {
    const state = getServerDemo(auth.userId);
    const existing = state.jobMatches.find((j) => j.job_id === jobId);
    if (existing) {
      existing.viewed_at = now;
    } else {
      state.jobMatches.push({
        job_id: jobId,
        match_score: 80,
        viewed_at: now,
      });
    }
    return jsonOk({ viewed_at: now });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("user_job_matches").upsert(
    {
      user_id: auth.userId,
      job_id: jobId,
      viewed_at: now,
      match_score: 80,
    },
    { onConflict: "user_id,job_id" },
  );
  if (error) return jsonOk({ error: "server_error", message: error.message }, 500);
  return jsonOk({ viewed_at: now });
}

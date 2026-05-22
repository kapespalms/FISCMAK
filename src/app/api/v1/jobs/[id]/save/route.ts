import { createClient } from "@/lib/supabase/server";
import { getServerDemo } from "@/lib/v2/demo-store";
import { fetchJobs } from "@/lib/v2/db";
import { isErrorResponse, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const { id } = await params;
  const now = new Date().toISOString();
  if (auth.demo) {
    getServerDemo(auth.userId).jobMatches.push({
      job_id: id,
      match_score: 85,
      saved_at: now,
    });
    return jsonOk({ job_id: id, saved: true, saved_at: now });
  }
  const supabase = await createClient();
  await supabase.from("user_job_matches").upsert({
    user_id: auth.userId,
    job_id: id,
    match_score: 85,
    saved_at: now,
  });
  return jsonOk({ job_id: id, saved: true, saved_at: now });
}

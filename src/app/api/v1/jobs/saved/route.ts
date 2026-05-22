import { createClient } from "@/lib/supabase/server";
import { getServerDemo } from "@/lib/v2/demo-store";
import { fetchJobs } from "@/lib/v2/db";
import { isErrorResponse, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  if (auth.demo) {
    const saved = getServerDemo(auth.userId).jobMatches.filter((j) => j.saved_at);
    const jobs = await fetchJobs(true);
    const list = saved
      .map((s) => jobs.find((j) => j.job_id === s.job_id))
      .filter(Boolean);
    return jsonOk({ jobs: list, total: list.length });
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_job_matches")
    .select("*, jobs(*)")
    .eq("user_id", auth.userId)
    .not("saved_at", "is", null);
  return jsonOk({ jobs: data ?? [], total: data?.length ?? 0 });
}

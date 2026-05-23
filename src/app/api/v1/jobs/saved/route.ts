import { createClient } from "@/lib/supabase/server";
import { getServerDemo } from "@/lib/v2/demo-store";
import { fetchJobs } from "@/lib/v2/db";
import { isErrorResponse, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";
import type { Job } from "@/lib/v2/types";

function flattenSavedRow(row: Record<string, unknown>): Job | null {
  const nested = row.jobs as Job | null;
  if (nested?.job_id) {
    return {
      ...nested,
      match_score: (row.match_score as number) ?? nested.match_score,
    };
  }
  if (typeof row.job_id === "string") {
    return row as unknown as Job;
  }
  return null;
}

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  if (auth.demo) {
    const saved = getServerDemo(auth.userId).jobMatches.filter((j) => j.saved_at);
    const jobs = await fetchJobs(true);
    const list = saved
      .map((s) => jobs.find((j) => j.job_id === s.job_id))
      .filter(Boolean) as Job[];
    return jsonOk({ jobs: list, total: list.length });
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("user_job_matches")
    .select("match_score, saved_at, jobs(*)")
    .eq("user_id", auth.userId)
    .not("saved_at", "is", null);
  const list = (data ?? [])
    .map((row) => flattenSavedRow(row as Record<string, unknown>))
    .filter(Boolean) as Job[];
  return jsonOk({ jobs: list, total: list.length });
}

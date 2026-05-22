import { createClient } from "@/lib/supabase/server";
import { fetchJobs } from "@/lib/v2/db";
import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
} from "@/lib/v2/api-helpers";
import { computeJobMatchScore } from "@/lib/v2/formulas";

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const user = await getAppUser(auth.userId, auth.demo);
  const jobs = await fetchJobs(auth.demo);
  const scored = jobs.map((j) => ({
    ...j,
    match_score: user ? computeJobMatchScore(j, user) : 75,
    match_reasoning: {
      specialty_match: user?.specialty && j.specialties.includes(user.specialty) ? 1 : 0.7,
      salary_alignment: 0.9,
      location_preference: 0.8,
      growth_alignment: j.growth_potential === "HIGH" ? 1 : 0.5,
    },
  }));
  scored.sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0));
  return jsonOk({
    jobs: scored.slice(0, 10),
    total: scored.length,
    has_more: scored.length > 10,
    mak_commentary:
      scored.length > 0
        ? `These roles align with your background in ${user?.specialty ?? "medicine"}. Review the top matches with Mak.`
        : "No jobs in feed yet — check back soon.",
  });
}

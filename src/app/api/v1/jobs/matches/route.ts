import { fetchJobs } from "@/lib/v2/db";
import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
} from "@/lib/v2/api-helpers";
import { computeJobMatchScore } from "@/lib/v2/formulas";
import {
  computeSpecialtyMatchScore,
  formatSpecialtyLine,
  normalizeSpecialtyProfile,
} from "@/lib/v2/specialty-hierarchy";

const MIN_SPECIALTY_MATCH = 0.35;

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const user = await getAppUser(auth.userId, auth.demo);
  const jobs = await fetchJobs(auth.demo);

  const scored = jobs
    .map((j) => {
      const specialtyMatch = user ? computeSpecialtyMatchScore(j, user) : 0.5;
      return {
        ...j,
        match_score: user ? computeJobMatchScore(j, user) : 75,
        match_reasoning: {
          specialty_match: specialtyMatch,
          salary_alignment: 0.9,
          location_preference: 0.8,
          growth_alignment: j.growth_potential === "HIGH" ? 1 : 0.5,
        },
      };
    })
    .filter((j) => j.match_reasoning.specialty_match >= MIN_SPECIALTY_MATCH)
    .sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0));

  const profileLine = user ? formatSpecialtyLine(normalizeSpecialtyProfile(user)) : "medicine";

  return jsonOk({
    jobs: scored.slice(0, 10),
    total: scored.length,
    has_more: scored.length > 10,
    mak_commentary:
      scored.length > 0
        ? `These roles align with your training profile (${profileLine}). Subspecialty-required positions are filtered when you have not completed that fellowship.`
        : "No strong specialty matches yet — update your base specialty and fellowship status in profile, or check back soon.",
  });
}

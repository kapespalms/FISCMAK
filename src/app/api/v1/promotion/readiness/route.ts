import { createClient } from "@/lib/supabase/server";
import { getServerDemo } from "@/lib/v2/demo-store";
import { fetchAssessments } from "@/lib/v2/db";
import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
} from "@/lib/v2/api-helpers";

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const user = await getAppUser(auth.userId, auth.demo);
  const assessments = await fetchAssessments(auth.userId, auth.demo);
  const tp5 = assessments.find((a) => a.touchpoint_number === 5 && a.completed_at);
  return jsonOk({
    target_track: "Clinician-Educator",
    target_rank: "Associate Professor",
    strengths: [
      { domain: "Teaching", score: 85, note: "Strong teaching hours and evaluations" },
      { domain: "Clinical", score: 90, note: "Active practice maintained" },
    ],
    gaps: [
      {
        domain: "Educational Scholarship",
        score: 40,
        note: "Need 2-3 peer-reviewed education publications",
        suggestion: "Connect with MedEd collaborators for a curriculum study.",
      },
    ],
    overall_readiness: tp5?.score ?? 65,
    promotion_timeline: "18-24 months",
  });
}

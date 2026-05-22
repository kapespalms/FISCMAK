import { createClient } from "@/lib/supabase/server";
import { getServerDemo } from "@/lib/v2/demo-store";
import { fetchAssessments } from "@/lib/v2/db";
import { isErrorResponse, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const all = await fetchAssessments(auth.userId, auth.demo);
  const completed = all.filter((a) => a.completed_at);
  return jsonOk({
    assessments: completed.map((a) => ({
      assessment_id: a.assessment_id,
      touchpoint_number: a.touchpoint_number,
      question_category: a.question_category,
      score: a.score,
      completed_at: a.completed_at,
    })),
    total: completed.length,
    completion_rate: completed.length / 7,
  });
}

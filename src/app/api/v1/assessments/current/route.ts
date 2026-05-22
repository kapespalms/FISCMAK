import { createClient } from "@/lib/supabase/server";
import { getServerDemo } from "@/lib/v2/demo-store";
import { fetchAssessments } from "@/lib/v2/db";
import { isErrorResponse, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";
import { nextQuestion, questionsForTouchpoint } from "@/lib/v2/question-bank";

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const all = await fetchAssessments(auth.userId, auth.demo);
  const active = all.find((a) => !a.completed_at);
  if (!active) {
    return jsonOk({ assessment_id: null, message: "No active assessment" });
  }
  const answered = active.questions_answered.map((q) => q.q_id);
  const nq = nextQuestion(active.touchpoint_number, answered);
  return jsonOk({
    assessment_id: active.assessment_id,
    touchpoint_number: active.touchpoint_number,
    question_category: active.question_category,
    questions: nq ? [nq] : [],
    progress: {
      current_question: answered.length + 1,
      total_questions: questionsForTouchpoint(active.touchpoint_number).length,
    },
  });
}

import { fetchAssessments } from "@/lib/v2/db";
import { getGloballyAnsweredIds } from "@/lib/v2/conversational-assessment";
import { isErrorResponse, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";
import { nextUnansweredQuestion, questionsForTouchpoint } from "@/lib/v2/question-bank";

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const all = await fetchAssessments(auth.userId, auth.demo);
  const globalAnswered = getGloballyAnsweredIds(all);
  const active = all.find((a) => !a.completed_at);

  if (!active) {
    const nextTp = [1, 2, 3, 4, 5, 6, 7].find((tp) => {
      const qs = questionsForTouchpoint(tp);
      return qs.some((q) => !globalAnswered.includes(q.q_id));
    });
    return jsonOk({
      assessment_id: null,
      message: "No active assessment",
      suggested_touchpoint: nextTp ?? null,
      conversation_answered_count: globalAnswered.length,
    });
  }

  const nq = nextUnansweredQuestion(active.touchpoint_number, globalAnswered);
  const tpQuestions = questionsForTouchpoint(active.touchpoint_number);
  const answeredInTp = tpQuestions.filter((q) => globalAnswered.includes(q.q_id)).length;

  if (!nq) {
    return jsonOk({
      assessment_id: active.assessment_id,
      touchpoint_number: active.touchpoint_number,
      question_category: active.question_category,
      questions: [],
      all_answered: true,
      message: "All questions for this touchpoint were covered in conversation with Coach Mak.",
      progress: {
        current_question: tpQuestions.length,
        total_questions: tpQuestions.length,
        conversation_skipped: answeredInTp,
      },
    });
  }

  return jsonOk({
    assessment_id: active.assessment_id,
    touchpoint_number: active.touchpoint_number,
    question_category: active.question_category,
    questions: [nq],
    progress: {
      current_question: answeredInTp + 1,
      total_questions: tpQuestions.length,
      conversation_skipped: answeredInTp,
    },
  });
}

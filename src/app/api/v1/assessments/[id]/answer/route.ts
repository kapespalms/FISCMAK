import { createClient } from "@/lib/supabase/server";
import { getServerDemo } from "@/lib/v2/demo-store";
import { isErrorResponse, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";
import { nextQuestion, questionsForTouchpoint } from "@/lib/v2/question-bank";
import type { AssessmentAnswer, CareerAssessment } from "@/lib/v2/types";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const { id } = await params;
  const { q_id, answer, timestamp } = await request.json();

  const findAndUpdate = (assessments: CareerAssessment[]) => {
    const a = assessments.find((x) => x.assessment_id === id);
    if (!a) return null;
    const entry: AssessmentAnswer = {
      q_id,
      question: a.questions_answered.find((q) => q.q_id === q_id)?.question ?? q_id,
      answer,
      timestamp: timestamp ?? new Date().toISOString(),
    };
    const existing = a.questions_answered.filter((q) => q.q_id !== q_id);
    a.questions_answered = [...existing, entry];
    const answered = a.questions_answered.map((q) => q.q_id);
    const nq = nextQuestion(a.touchpoint_number, answered);
    return { a, nq };
  };

  if (auth.demo) {
    const result = findAndUpdate(getServerDemo(auth.userId).assessments);
    if (!result) return jsonOk({ error: "not_found", message: "Assessment not found" }, 404);
    return jsonOk({
      assessment_id: id,
      q_id,
      answer_saved: true,
      next_question: result.nq,
    });
  }

  const supabase = await createClient();
  const { data: a } = await supabase
    .from("career_assessments")
    .select("*")
    .eq("assessment_id", id)
    .eq("user_id", auth.userId)
    .maybeSingle();
  if (!a) return jsonOk({ error: "not_found", message: "Assessment not found" }, 404);
  const answered = [...(a.questions_answered as AssessmentAnswer[]), { q_id, question: q_id, answer, timestamp }];
  await supabase.from("career_assessments").update({ questions_answered: answered }).eq("assessment_id", id);
  const nq = nextQuestion(a.touchpoint_number, answered.map((q) => q.q_id));
  return jsonOk({
    assessment_id: id,
    q_id,
    answer_saved: true,
    next_question: nq,
  });
}

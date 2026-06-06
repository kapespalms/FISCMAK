// DEPRECATED (A1): Still reads/writes career_assessments to keep /app/assessment functional.
// Do not add new consumers. Remove when Phase B replaces the surface.
import { createClient } from "@/lib/supabase/server";
import { getServerDemo } from "@/lib/v2/demo-store";
import { getAppUser, isErrorResponse, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";
import { questionById } from "@/lib/v2/conversational-assessment";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";
import { nextUnansweredQuestion } from "@/lib/v2/question-bank";
import type { AssessmentAnswer } from "@/lib/v2/types";

async function globalAnsweredIds(
  userId: string,
  demo: boolean,
): Promise<string[]> {
  if (demo) {
    return [
      ...new Set(
        getServerDemo(userId).assessments.flatMap((a) =>
          a.questions_answered.map((q) => q.q_id),
        ),
      ),
    ];
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("career_assessments")
    .select("questions_answered")
    .eq("user_id", userId);
  return [
    ...new Set(
      (data ?? []).flatMap((row) =>
        (row.questions_answered as { q_id: string }[]).map((q) => q.q_id),
      ),
    ),
  ];
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const { id } = await params;
  const { q_id, answer, timestamp } = await request.json();

  const entry: AssessmentAnswer = {
    q_id,
    question: questionById(q_id)?.question ?? q_id,
    answer,
    timestamp: timestamp ?? new Date().toISOString(),
  };

  const user = await getAppUser(auth.userId, auth.demo);
  const meta = user ? getOnboardingMetadata(user) : null;

  if (auth.demo) {
    const assessments = getServerDemo(auth.userId).assessments;
    const a = assessments.find((x) => x.assessment_id === id);
    if (!a) return jsonOk({ error: "not_found", message: "Assessment not found" }, 404);
    a.questions_answered = [
      ...a.questions_answered.filter((q) => q.q_id !== q_id),
      entry,
    ];
    const global = await globalAnsweredIds(auth.userId, true);
    const nq = nextUnansweredQuestion(a.touchpoint_number, global, meta);
    return jsonOk({
      assessment_id: id,
      q_id,
      answer_saved: true,
      next_question: nq,
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

  const existing = (a.questions_answered as AssessmentAnswer[]).filter((q) => q.q_id !== q_id);
  const updated = [...existing, entry];
  await supabase
    .from("career_assessments")
    .update({ questions_answered: updated })
    .eq("assessment_id", id);

  const global = await globalAnsweredIds(auth.userId, false);
  const nq = nextUnansweredQuestion(a.touchpoint_number, global, meta);
  return jsonOk({
    assessment_id: id,
    q_id,
    answer_saved: true,
    next_question: nq,
  });
}

// DEPRECATED (A1): This route still writes to career_assessments to keep /app/assessment
// functional until Phase B (capture spine) replaces the surface. Do not add new consumers.
import { createClient } from "@/lib/supabase/server";
import { getServerDemo } from "@/lib/v2/demo-store";
import { isErrorResponse, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";
import { TOUCHPOINT_META } from "@/lib/v2/formulas";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const { touchpoint_number, question_category } = await request.json();
  const tp = touchpoint_number ?? 1;
  const meta = TOUCHPOINT_META[tp];
  const assessmentId = crypto.randomUUID();
  const row = {
    assessment_id: assessmentId,
    user_id: auth.userId,
    touchpoint_number: tp,
    question_category: question_category ?? meta?.category ?? "INTRO",
    questions_answered: [],
    score: null,
    completed_at: null,
    created_at: new Date().toISOString(),
  };

  if (auth.demo) {
    getServerDemo(auth.userId).assessments.push(row);
  } else {
    const supabase = await createClient();
    await supabase.from("career_assessments").insert(row);
  }
  return jsonOk(
    { assessment_id: assessmentId, touchpoint_number: tp, started_at: row.created_at },
    201,
  );
}

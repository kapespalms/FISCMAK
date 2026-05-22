import { createClient } from "@/lib/supabase/server";
import { getServerDemo } from "@/lib/v2/demo-store";
import { isErrorResponse, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";
import { computeAssessmentScore } from "@/lib/v2/formulas";
import type { AssessmentAnswer } from "@/lib/v2/types";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const { id } = await params;
  const now = new Date().toISOString();

  if (auth.demo) {
    const a = getServerDemo(auth.userId).assessments.find((x) => x.assessment_id === id);
    if (!a) return jsonOk({ error: "not_found", message: "Assessment not found" }, 404);
    const score = computeAssessmentScore(a.questions_answered);
    a.score = score;
    a.completed_at = now;
    return jsonOk({
      assessment_id: id,
      touchpoint_number: a.touchpoint_number,
      score,
      score_interpretation: score >= 70 ? "Strong foundation" : "Room to develop",
      completed_at: now,
      insights: {
        key_findings: ["Assessment complete for this touchpoint"],
        recommended_actions: ["Continue to next touchpoint when ready"],
      },
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
  const score = computeAssessmentScore(a.questions_answered as AssessmentAnswer[]);
  await supabase
    .from("career_assessments")
    .update({ score, completed_at: now })
    .eq("assessment_id", id);
  return jsonOk({
    assessment_id: id,
    touchpoint_number: a.touchpoint_number,
    score,
    score_interpretation: score >= 70 ? "Strong foundation" : "Room to develop",
    completed_at: now,
    insights: {
      key_findings: ["Assessment complete for this touchpoint"],
      recommended_actions: ["Continue to next touchpoint when ready"],
    },
  });
}

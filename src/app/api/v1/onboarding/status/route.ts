import { fetchAssessments } from "@/lib/v2/db";
import { getPendingQuestions } from "@/lib/v2/conversational-assessment";
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
  const tp1Pending = getPendingQuestions(1, assessments);
  const tp1Complete = tp1Pending.length === 0 && assessments.some((a) => a.touchpoint_number === 1 && a.completed_at);

  return jsonOk({
    tier1_complete: user?.tier1_complete ?? false,
    tier2_complete: user?.tier2_complete ?? false,
    tier3_complete: user?.tier3_complete ?? false,
    conversational_onboarding_complete: user?.tier3_complete ?? false,
    touchpoint_1_pending: tp1Pending.length,
    touchpoint_1_complete: tp1Complete,
    name: user?.name ?? null,
    specialty: user?.specialty ?? null,
    career_stage: user?.career_stage ?? null,
  });
}

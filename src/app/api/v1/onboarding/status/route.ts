import { fetchAssessments } from "@/lib/v2/db";
import { getPendingQuestions } from "@/lib/v2/conversational-assessment";
import { deployedInstruments } from "@/lib/v2/onboarding-touchpoint1";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";
import { instrumentProgress } from "@/lib/v2/onboarding-instruments";
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

  const meta = user ? getOnboardingMetadata(user) : {};
  const instrumentIds =
    meta.instrument_ids ??
    (user
      ? deployedInstruments(user.career_stage, user.practice_setting).map((i) => i.id)
      : []);
  const instProgress = instrumentProgress(instrumentIds, meta.instrument_answers ?? []);

  return jsonOk({
    tier1_complete: user?.tier1_complete ?? false,
    tier2_complete: user?.tier2_complete ?? false,
    tier3_complete: user?.tier3_complete ?? false,
    conversational_onboarding_complete: user?.tier3_complete ?? false,
    touchpoint_1_pending: tp1Pending.length,
    touchpoint_1_complete: tp1Complete,
    instrument_pending: instProgress.total - instProgress.answered,
    instrument_total: instProgress.total,
    name: user?.name ?? null,
    specialty: user?.specialty ?? null,
    career_stage: user?.career_stage ?? null,
    practice_setting: user?.practice_setting ?? null,
    primary_career_track: user?.primary_career_track ?? null,
  });
}

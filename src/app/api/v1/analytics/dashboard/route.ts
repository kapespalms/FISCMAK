import { buildAnalyticsDashboard } from "@/lib/v2/db";
import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
  upsertAppUser,
} from "@/lib/v2/api-helpers";

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  let user = await getAppUser(auth.userId, auth.demo);
  if (!user) {
    user = await upsertAppUser(auth.userId, auth.email, {}, auth.demo);
  }
  const dashboard = await buildAnalyticsDashboard(user, auth.demo);
  return jsonOk({
    career_readiness_index: dashboard.career_readiness_index,
    career_health: dashboard.career_health,
    coaching_brief: dashboard.coaching_brief,
    quarterly_pulse: dashboard.quarterly_pulse,
    pulse_streak: dashboard.pulse_streak,
    previous_career_health_score: dashboard.previous_career_health_score,
    onboarding_progress: dashboard.onboarding_progress,
    assessment_progress: dashboard.assessment_progress,
    burnout_trend: dashboard.burnout_trend,
    job_engagement: dashboard.job_engagement,
    next_touchpoint: dashboard.next_touchpoint,
    cv_metrics: dashboard.cv_metrics,
  });
}

import type { AppUser } from "@/lib/v2/types";
import { upsertAppUser } from "@/lib/v2/api-helpers";
import { buildCareerHealthView } from "@/lib/v2/career-health-view";
import { computeCvMetrics } from "@/lib/v2/cv-metrics";
import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";
import {
  buildQuarterlyPulseSummary,
  parsePulseAnswers,
  parseInvisibleWorkFromAnswers,
  type PulseAnswer,
} from "@/lib/v2/quarterly-pulse";
import {
  buildAnnualRefreshSummary,
  parseAnnualAnswers,
  type AnnualRefreshAnswer,
} from "@/lib/v2/annual-refresh";
import { recommendGoalFromInvisibleWork } from "@/lib/v2/invisible-work-taxonomy";
import { fetchDocuments } from "@/lib/v2/db";
import { burnoutRiskFromPfi } from "@/lib/v2/career-language";
import { runTouchpointSideEffects } from "@/lib/v2/touchpoint-side-effects";
import { updateAlignmentTracking } from "@/lib/v2/career-alignment-tracking";
import { careerAlignmentFromHealth } from "@/lib/mak-chatbot-states";
import {
  metricValuesForTracking,
  updateMetricDeclineTracking,
} from "@/lib/v2/metric-decline-tracking";
import { clearAnnualRefreshSession } from "@/lib/v2/annual-mak-flow";
import { clearQuarterlyPulseSession } from "@/lib/v2/quarterly-mak-flow";

export type TouchpointSubmitResult = {
  meta: OnboardingMetadata;
  summary: string;
  quarter?: string;
  year?: number;
  career_health_score: number;
  triggers: string[];
  completed_at: string;
};

export async function submitQuarterlyPulse(input: {
  userId: string;
  email: string;
  demo: boolean;
  user: AppUser;
  meta: OnboardingMetadata;
  answers: PulseAnswer[];
}): Promise<TouchpointSubmitResult> {
  const { userId, email, demo, user, meta, answers } = input;
  const parsed = parsePulseAnswers(answers);
  const quarter = `Q${Math.floor(new Date().getMonth() / 3) + 1} ${new Date().getFullYear()}`;
  const now = new Date().toISOString();

  const baseline = meta.pulse_baseline ?? {};
  if (!baseline.invisible_hours && parsed.invisible_hours) {
    baseline.invisible_hours = parsed.invisible_hours;
    baseline.captured_at = now;
  }

  const prevScore = meta.cdi?.score ?? null;
  const docs = await fetchDocuments(userId, demo);
  const cv = docs.find((d) => d.document_type === "CV");
  const cvMetrics = cv?.extracted_text ? computeCvMetrics(cv.extracted_text, []) : null;
  const health = buildCareerHealthView({ user, cvMetrics });
  const newScore = health.career_health_score;

  const invisibleDeltaPct =
    baseline.invisible_hours && parsed.invisible_hours
      ? ((parsed.invisible_hours - baseline.invisible_hours) / baseline.invisible_hours) * 100
      : null;

  const burnout = burnoutRiskFromPfi(
    parsed.burnout_screen != null ? parsed.burnout_screen / 1.2 : null,
  );

  const cvAchievement = answers.find((a) => a.module_id === "cv_update")?.value;
  const summary = buildQuarterlyPulseSummary({
    quarter,
    prevScore,
    newScore,
    sustainabilityStatus: burnout.status,
    invisibleHours: parsed.invisible_hours ?? null,
    invisibleDeltaPct,
    achievements: cvAchievement ? String(cvAchievement).slice(0, 120) : undefined,
  });

  const record = {
    quarter,
    completed_at: now,
    burnout_screen: parsed.burnout_screen,
    invisible_hours: parsed.invisible_hours,
    track_energy: parsed.track_energy,
    career_health_score: newScore,
    summary,
  };

  const invisibleWork = parseInvisibleWorkFromAnswers(answers);
  const invisibleRecommendations =
    invisibleWork.totalHours > 0
      ? recommendGoalFromInvisibleWork({
          hoursByCategory: invisibleWork.hoursByCategory,
          totalHours: invisibleWork.totalHours,
        })
      : [];

  let updatedMeta = clearQuarterlyPulseSession(
    updateMetricDeclineTracking(
      updateAlignmentTracking(
        {
          ...meta,
          pulse_baseline: baseline,
          pulse_history: [record, ...(meta.pulse_history ?? [])].slice(0, 8),
          last_quarterly_summary: summary,
          cdi: {
            score: newScore,
            domains: Object.fromEntries(health.domains.map((d) => [d.label, d.score])),
          },
          invisible_work_hours_by_category: invisibleWork.hoursByCategory,
          invisible_work_recommendations: invisibleRecommendations,
          touchpoint_session_answers: undefined,
        },
        careerAlignmentFromHealth(health) ?? newScore,
      ),
      metricValuesForTracking({
        health,
        taskAlignmentScore:
          parsed.invisible_hours != null
            ? Math.max(0, Math.round(100 - parsed.invisible_hours * 5))
            : null,
      }),
    ),
  );

  await upsertAppUser(
    userId,
    email,
    { onboarding_metadata: updatedMeta as Record<string, unknown> },
    demo,
  );

  updatedMeta = await runTouchpointSideEffects({
    userId,
    email,
    demo,
    user,
    meta: updatedMeta,
    enrichmentTrigger: "quarterly",
  });

  const triggers: string[] = [];
  if (parsed.burnout_screen != null && parsed.burnout_screen >= 4) {
    triggers.push("Full well-being assessment recommended at next login");
  }
  if (invisibleDeltaPct != null && invisibleDeltaPct > 25) {
    triggers.push("Full task burden reassessment recommended");
  }
  if (parsed.track_energy != null && parsed.track_energy < 4) {
    triggers.push("Career alignment conversation recommended");
  }

  return {
    meta: updatedMeta,
    summary,
    quarter,
    career_health_score: newScore,
    triggers,
    completed_at: now,
  };
}

export async function submitAnnualRefresh(input: {
  userId: string;
  email: string;
  demo: boolean;
  user: AppUser;
  meta: OnboardingMetadata;
  answers: AnnualRefreshAnswer[];
}): Promise<TouchpointSubmitResult> {
  const { userId, email, demo, user, meta, answers } = input;
  const parsed = parseAnnualAnswers(answers);
  const year = new Date().getFullYear();
  const now = new Date().toISOString();

  const docs = await fetchDocuments(userId, demo);
  const cv = docs.find((d) => d.document_type === "CV");
  const cvMetrics = cv?.extracted_text ? computeCvMetrics(cv.extracted_text, []) : null;
  const health = buildCareerHealthView({ user, cvMetrics });

  const summary = buildAnnualRefreshSummary({
    year,
    careerObjective: parsed.career_objective,
    trackEnergy: parsed.track_energy,
    invisibleHours: parsed.invisible_hours,
    goalReviewNote: parsed.goal_review,
  });

  let updatedMeta = clearAnnualRefreshSession(
    updateMetricDeclineTracking(
      updateAlignmentTracking(
        {
          ...meta,
          career_objective: parsed.career_objective ?? meta.career_objective,
          annual_refresh_history: [
            { year, completed_at: now, summary },
            ...(meta.annual_refresh_history ?? []),
          ].slice(0, 5),
          touchpoint_session_answers: undefined,
        },
        careerAlignmentFromHealth(health) ?? meta.career_alignment_pct ?? 0,
      ),
      metricValuesForTracking({
        health,
        taskAlignmentScore:
          parsed.invisible_hours != null
            ? Math.max(0, Math.round(100 - parsed.invisible_hours * 5))
            : null,
      }),
    ),
  );

  await upsertAppUser(
    userId,
    email,
    { onboarding_metadata: updatedMeta as Record<string, unknown> },
    demo,
  );

  updatedMeta = await runTouchpointSideEffects({
    userId,
    email,
    demo,
    user,
    meta: updatedMeta,
    enrichmentTrigger: "annual",
  });

  return {
    meta: updatedMeta,
    summary,
    year,
    career_health_score: health.career_health_score,
    triggers: [],
    completed_at: now,
  };
}

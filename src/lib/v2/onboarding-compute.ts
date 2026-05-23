import type { AppUser } from "@/lib/v2/types";
import {
  computeIwq,
  scoreAllInstruments,
  type InstrumentAnswer,
} from "@/lib/v2/onboarding-instruments";
import { deployedInstruments, apiEnrichmentPlan } from "@/lib/v2/onboarding-touchpoint1";
import { buildCareerHealthView, buildCareerHealthIntroForMak } from "@/lib/v2/career-health-view";
import { computeCvMetrics } from "@/lib/v2/cv-metrics";

import type { EnrichmentRunLog, EnrichmentSnapshot } from "@/lib/v2/api-enrichment";

export type OnboardingMetadata = {
  reconciliation?: { id: string; status: string }[];
  instrument_answers?: InstrumentAnswer[];
  instrument_ids?: string[];
  instrument_scores?: Record<string, unknown>;
  api_enrichment_plan?: ReturnType<typeof apiEnrichmentPlan>;
  enrichment_snapshot?: EnrichmentSnapshot;
  previous_enrichment_snapshot?: EnrichmentSnapshot;
  enrichment_runs?: EnrichmentRunLog[];
  cdi?: { score: number; domains: Record<string, number> };
  career_health_summary?: string;
  iwq?: number;
  computed_at?: string;
  pulse_baseline?: { invisible_hours?: number; burnout_screen?: number; captured_at?: string };
  pulse_history?: Array<{
    quarter: string;
    completed_at: string;
    burnout_screen?: number;
    invisible_hours?: number;
    track_energy?: number;
    career_health_score?: number;
    summary?: string;
  }>;
  last_quarterly_summary?: string;
  goal_milestone_history?: import("@/lib/v2/goal-milestone-tracking").GoalMilestoneQuarterSnapshot[];
  stalled_goal_quarters?: number;
  stalled_goal_title?: string | null;
  stalled_goal_id?: string | null;
  annual_refresh_history?: Array<{
    year: number;
    completed_at: string;
    summary: string;
  }>;
  career_objective?: string;
  stored_goals?: import("@/lib/goals").CareerGoal[];
  alignment_history?: Array<{
    quarter: string;
    alignment_pct: number;
    captured_at: string;
  }>;
  career_alignment_pct?: number;
  low_alignment_quarters?: number;
  metric_quarter_history?: import("@/lib/v2/metric-decline-tracking").MetricQuarterSnapshot[];
  metric_declines?: import("@/lib/v2/metric-decline-tracking").MetricDeclineRecord[];
  annual_refresh_session?: import("@/lib/v2/annual-mak-flow").AnnualRefreshSession;
  quarterly_pulse_session?: import("@/lib/v2/quarterly-mak-flow").QuarterlyPulseSession;
  goals_confirmed?: boolean;
  goals_confirmed_at?: string;
  invisible_work_recommendations?: Array<{
    goalType: string;
    message: string;
    priority: string;
  }>;
  invisible_work_hours_by_category?: Partial<
    Record<import("@/lib/v2/invisible-work-taxonomy").InvisibleWorkCategory, number>
  >;
};

export function getOnboardingMetadata(user: AppUser): OnboardingMetadata {
  return (user.onboarding_metadata as OnboardingMetadata | undefined) ?? {};
}

export function computeTouchpoint1Dashboard(user: AppUser, cvText?: string | null) {
  const meta = getOnboardingMetadata(user);
  const instrumentIds =
    meta.instrument_ids ??
    deployedInstruments(user.career_stage, user.practice_setting ?? null).map((i) => i.id);
  const answers = meta.instrument_answers ?? [];
  const instrumentScores = scoreAllInstruments(instrumentIds, answers);
  const bits = instrumentScores.find((s) => s.instrumentId === "bits");
  const invisible = instrumentScores.find((s) => s.instrumentId === "invisible_work");
  const invisibleHours =
    typeof invisible?.raw.weekly_hours === "number" ? invisible.raw.weekly_hours : undefined;

  let sIndex = 30;
  if (cvText) {
    sIndex = computeCvMetrics(cvText, []).s_index;
  }

  const iwq =
    bits && invisible ? computeIwq(bits, invisible) : meta.iwq ?? null;

  const cdiView = buildCareerHealthView({ user, cvMetrics: cvText ? computeCvMetrics(cvText, []) : null });

  return {
    instrument_ids: instrumentIds,
    instrument_scores: Object.fromEntries(instrumentScores.map((s) => [s.instrumentId, s])),
    cdi: { score: cdiView.career_health_score, domains: Object.fromEntries(cdiView.domains.map((d) => [d.label, d.score])) },
    career_health_summary: cdiView.career_health_summary,
    iwq,
    s_index: sIndex,
    api_enrichment_plan: apiEnrichmentPlan(user.practice_setting ?? null, user.career_stage),
    pulse_baseline: invisibleHours
      ? { invisible_hours: invisibleHours, captured_at: new Date().toISOString() }
      : undefined,
    computed_at: new Date().toISOString(),
  };
}

export function careerHealthMakSummary(user: AppUser, cvText?: string | null): string {
  const view = buildCareerHealthView({
    user,
    cvMetrics: cvText ? computeCvMetrics(cvText, []) : null,
  });
  return buildCareerHealthIntroForMak(view);
}

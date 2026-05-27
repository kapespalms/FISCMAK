import type { AssessmentInsights } from "@/lib/v2/assessment-insights";
import type { CareerHealthView } from "@/lib/v2/career-health-view";
import type { AnalyticsDashboard } from "@/lib/v2/types";

/** Wellbeing slices for dashboard and Perspective tab — no composite Career Health Score.
 *  Internal metrics (CRI, CHS, s-index, IWQ, etc.) align with profile-contract internal_only_metrics. */
export type UserFacingCareerHealth = Pick<
  CareerHealthView,
  | "wellbeing_metrics"
  | "dashboard_title"
  | "aspiration_prompt"
  | "promotion_label"
  | "domains"
  | "intro"
>;

export function sanitizeCareerHealthForUser(
  view: CareerHealthView | null,
): UserFacingCareerHealth | null {
  if (!view) return null;
  return {
    wellbeing_metrics: view.wellbeing_metrics,
    dashboard_title: view.dashboard_title,
    aspiration_prompt: view.aspiration_prompt,
    promotion_label: view.promotion_label,
    domains: view.domains,
    intro: view.intro,
  };
}

export type UserFacingAssessmentInsights = Omit<
  AssessmentInsights,
  | "coherence_score"
  | "coherence_label"
  | "s_index"
  | "iwq"
  | "service_citizenship_summary"
  | "unrecognized_work_summary"
  | "recognition_gaps"
>;

export function sanitizeAssessmentInsightsForUser(
  insights: AssessmentInsights,
): UserFacingAssessmentInsights {
  const {
    coherence_score: _c,
    coherence_label: _cl,
    s_index: _s,
    iwq: _i,
    service_citizenship_summary: _sc,
    unrecognized_work_summary: _uw,
    recognition_gaps: _rg,
    ...rest
  } = insights;
  return rest;
}

/** Strip internal composite metrics from user-facing analytics APIs. */
export function sanitizeAnalyticsDashboardForUser(
  dashboard: AnalyticsDashboard,
): AnalyticsDashboard {
  return {
    ...dashboard,
    career_readiness_index: null,
    previous_career_health_score: null,
    career_health: sanitizeCareerHealthForUser(dashboard.career_health) as AnalyticsDashboard["career_health"],
    cv_metrics: null,
    metric_history: {
      ...dashboard.metric_history,
      alignment: [],
    },
  };
}

/** Demo payload for KP Admin retired-surface previews and internal formula review. */
export const RETIRED_METRICS_DEMO = {
  careerHealthScore: 72,
  previousScore: 68,
  scoreStatus: "developing" as const,
  trend: "up" as const,
  coherence_score: 64,
  coherence_label: "Moderate coherence between stated goals and CV evidence",
  s_index: 58,
  iwq: 62,
  service_citizenship_summary: "Breadth of service beyond clinical care (CV-regex derived — deprecated)",
  unrecognized_work_summary: "Committee load and mentoring may exceed documented CV lines",
  recognition_gaps: [
    {
      domain: "Teaching",
      from_conversation: "Regular small-group preceptor, ~4 hrs/week",
      documented_on_cv: "Not listed",
      gap_level: "high" as const,
    },
    {
      domain: "Quality improvement",
      from_conversation: "Led morbidity review workflow",
      documented_on_cv: "Brief mention only",
      gap_level: "medium" as const,
    },
  ],
};

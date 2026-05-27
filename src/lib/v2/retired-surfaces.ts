/** Retired user-facing surfaces — preserved for KP Admin review only. */

export type RetiredSurfaceComponent =
  | "institutional_onboarding_welcome"
  | "health_score_card"
  | "assessment_composite_metrics";

export type RetiredSurface = {
  id: string;
  title: string;
  retiredAt: string;
  reason: string;
  component: RetiredSurfaceComponent;
};

export const RETIRED_SURFACES: RetiredSurface[] = [
  {
    id: "institutional-onboarding-welcome",
    title: "Institutional program welcome (UH Psychiatry)",
    retiredAt: "2026-05-21",
    reason:
      "Unified onboarding on SOAPO for all paths. Program-specific expectation-setting moves to profile step and institutional context banner.",
    component: "institutional_onboarding_welcome",
  },
  {
    id: "health-score-card",
    title: "Career Health Score gauge (dashboard)",
    retiredAt: "2026-05-21",
    reason:
      "CDI/CRI composite lacks validated evidence tier. Internal-only via `internal_user_metrics`; users see Perspective instrument summaries instead.",
    component: "health_score_card",
  },
  {
    id: "assessment-composite-metrics",
    title: "Insights composite cards (coherence, CV s-index, recognition gaps)",
    retiredAt: "2026-05-21",
    reason:
      "Coherence score, CV-regex s-index, and IWQ-derived recognition gaps are not evidence-tier metrics. S-Index is invisible Mak coaching input only (ADR-003); KP Admin dev console at `/app/kp-admin`.",
    component: "assessment_composite_metrics",
  },
];

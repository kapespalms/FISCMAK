import {
  analyzeCvEvidence,
  computeCvMetrics,
  explainSIndex,
  type CvMetrics,
} from "@/lib/v2/cv-metrics";
import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";
import type { CareerAssessment } from "@/lib/v2/types";

/** Server-only coaching input — never expose to users or institutions. */
export type ServiceFootprintBand = "minimal" | "moderate" | "strong";
export type WorkloadRecognitionGap = "low" | "moderate" | "elevated";

export type InternalCoachingSignals = {
  available: boolean;
  /** CV-regex composite — Mak input only */
  s_index: number | null;
  iwq: number | null;
  promotion_aligned_pct: number | null;
  service_footprint_band: ServiceFootprintBand;
  workload_recognition_gap: WorkloadRecognitionGap;
  invisible_work_signals: string[];
  portfolio_documentation_gap: boolean;
  evidence_summary: {
    mentoring_mentions: number;
    committee_roles: number;
    leadership_roles: number;
    service_mentions: number;
    qi_signals: number;
  } | null;
  interpretation: CvMetrics["interpretation"] | null;
  s_index_breakdown: ReturnType<typeof explainSIndex> | null;
};

export type MakCoachingEscalationLevel = 1 | 2 | 3 | 4;

function bandServiceFootprint(sIndex: number | null): ServiceFootprintBand {
  if (sIndex == null) return "minimal";
  if (sIndex >= 60) return "strong";
  if (sIndex >= 35) return "moderate";
  return "minimal";
}

function bandRecognitionGap(iwq: number | null): WorkloadRecognitionGap {
  if (iwq == null) return "low";
  if (iwq >= 60) return "elevated";
  if (iwq >= 35) return "moderate";
  return "low";
}

export function computeInternalCoachingSignals(
  cvText: string | null | undefined,
  assessments: CareerAssessment[] = [],
): InternalCoachingSignals {
  const empty: InternalCoachingSignals = {
    available: false,
    s_index: null,
    iwq: null,
    promotion_aligned_pct: null,
    service_footprint_band: "minimal",
    workload_recognition_gap: "low",
    invisible_work_signals: [],
    portfolio_documentation_gap: false,
    evidence_summary: null,
    interpretation: null,
    s_index_breakdown: null,
  };

  if (!cvText?.trim()) return empty;

  const metrics = computeCvMetrics(cvText, assessments);
  const evidence = analyzeCvEvidence(cvText);
  const portfolio_documentation_gap =
    metrics.s_index >= 50 && metrics.promotion_aligned_pct < 45;

  return {
    available: true,
    s_index: metrics.s_index,
    iwq: metrics.iwq,
    promotion_aligned_pct: metrics.promotion_aligned_pct,
    service_footprint_band: bandServiceFootprint(metrics.s_index),
    workload_recognition_gap: bandRecognitionGap(metrics.iwq),
    invisible_work_signals: metrics.evidence.invisible_work_signals,
    portfolio_documentation_gap,
    evidence_summary: {
      mentoring_mentions: evidence.mentoring_mentions,
      committee_roles: evidence.committee_roles,
      leadership_roles: evidence.leadership_roles,
      service_mentions: evidence.service_mentions,
      qi_signals: evidence.qi_signals,
    },
    interpretation: metrics.interpretation,
    s_index_breakdown: explainSIndex(evidence),
  };
}

/** Persisted on user metadata — bands only, no named metrics in user APIs. */
export function internalCoachingMetadataPatch(signals: InternalCoachingSignals): {
  _internal_coaching: {
    service_footprint_band: ServiceFootprintBand;
    workload_recognition_gap: WorkloadRecognitionGap;
    portfolio_documentation_gap: boolean;
    invisible_work_signals: string[];
    updated_at: string;
    /** KP admin / server diagnostics only */
    s_index?: number;
    iwq?: number;
  };
} {
  return {
    _internal_coaching: {
      service_footprint_band: signals.service_footprint_band,
      workload_recognition_gap: signals.workload_recognition_gap,
      portfolio_documentation_gap: signals.portfolio_documentation_gap,
      invisible_work_signals: signals.invisible_work_signals,
      updated_at: new Date().toISOString(),
      ...(signals.available
        ? { s_index: signals.s_index ?? undefined, iwq: signals.iwq ?? undefined }
        : {}),
    },
  };
}

export function inferMakCoachingEscalationLevel(
  meta: Pick<
    OnboardingMetadata,
    "low_alignment_quarters" | "stalled_goal_quarters" | "computed_at"
  >,
  signals: InternalCoachingSignals,
): MakCoachingEscalationLevel {
  if (
    signals.workload_recognition_gap === "elevated" &&
    (meta.low_alignment_quarters ?? 0) >= 2
  ) {
    return 4;
  }
  if (signals.portfolio_documentation_gap && signals.service_footprint_band === "strong") {
    return 3;
  }
  if (signals.workload_recognition_gap === "elevated" || signals.portfolio_documentation_gap) {
    return 2;
  }
  if (signals.service_footprint_band !== "minimal") {
    return 1;
  }
  return 1;
}

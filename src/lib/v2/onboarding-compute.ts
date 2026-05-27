import type { AppUser } from "@/lib/v2/types";
import {
  computeIwq,
  scoreAllInstruments,
  type InstrumentAnswer,
} from "@/lib/v2/onboarding-instruments";
import { deployedInstruments, apiEnrichmentPlan } from "@/lib/v2/onboarding-touchpoint1";
import { buildCareerHealthView, buildCareerHealthIntroForMak } from "@/lib/v2/career-health-view";
import { computeCvMetrics } from "@/lib/v2/cv-metrics";
import {
  computeInternalCoachingSignals,
  internalCoachingMetadataPatch,
} from "@/lib/v2/internal-coaching-signals";

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
  npi_verification_deferred?: boolean;
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
  goal_setting_session?: import("@/lib/v2/goal-setting-mak-flow").GoalSettingSession;
  goal_woop_records?: import("@/lib/v2/career-coaching-frameworks").GoalWoopRecords;
  grow_exploration_session?: import("@/lib/v2/grow-exploration-mak-flow").GrowExplorationSession;
  grow_exploration_context?: import("@/lib/v2/career-coaching-frameworks").GrowExplorationContext;
  goals_confirmed?: boolean;
  goals_confirmed_at?: string;
  touchpoint_session_mode?: "quarterly" | "annual";
  touchpoint_session_answers?: Array<
    | import("@/lib/v2/quarterly-pulse").PulseAnswer
    | import("@/lib/v2/annual-refresh").AnnualRefreshAnswer
  >;
  invisible_work_recommendations?: Array<{
    goalType: string;
    message: string;
    priority: string;
  }>;
  job_search_active?: boolean;
  job_search_activated_at?: string;
  invisible_work_hours_by_category?: Partial<
    Record<import("@/lib/v2/invisible-work-taxonomy").InvisibleWorkCategory, number>
  >;
  narrative_anchor?: import("@/lib/v2/mak-conversation-models").NarrativeAnchor;
  narrative_anchor_session?: import("@/lib/v2/rotation-debrief-mak-flow").NarrativeAnchorSession;
  rotation_debrief_session?: import("@/lib/v2/rotation-debrief-mak-flow").RotationDebriefSession;
  rotation_debrief_entries?: import("@/lib/v2/rotation-debrief-mak-flow").RotationDebriefEntry[];
  promotion_context?: import("@/lib/v2/mak-conversation-models").PromotionContext;
  promotion_context_session?: import("@/lib/v2/early-attending-mak-flow").PromotionContextSession;
  attending_quarterly_session?: import("@/lib/v2/early-attending-mak-flow").AttendingQuarterlySession;
  attending_quarterly_captures?: import("@/lib/v2/mak-conversation-models").AttendingQuarterlyCapture[];
  impact_translation_session?: import("@/lib/v2/early-attending-mak-flow").ImpactTranslationSession;
  impact_translations?: import("@/lib/v2/mak-conversation-models").ImpactTranslationEntry[];
  promotion_readiness_snapshots?: import("@/lib/v2/mak-conversation-models").PromotionReadinessSnapshot[];
  /** Public vs institutional onboarding */
  onboarding_path?: "public" | "institutional";
  program_id?: string;
  program_slug?: string;
  trainee_initials?: string;
  career_track_rankings?: Array<{
    track: import("@/lib/v2/onboarding-options").PrimaryCareerTrack;
    rank: number;
    hours_per_week?: number;
    fte?: number;
  }>;
  subspecialty_interests?: string[];
  uh_psych_enrichment_tracks?: string[];
  call_schedule_note?: string | null;
  schedule_color_overrides?: Record<string, string>;
  schedule_dashboard_span?: 1 | 3 | 6 | 9 | 12;
  schedule_events?: import("@/lib/v2/schedule-calendar/types").UserScheduleEvent[];
  schedule_mak_session?: import("@/lib/v2/schedule-mak-flow").ScheduleMakSession;
  schedule_review_cadence?: import("@/lib/v2/coaching-cadence").ScheduleReviewCadence;
  schedule_review_session?: import("@/lib/v2/schedule-review-mak-flow").ScheduleReviewSession;
  schedule_review_history?: import("@/lib/v2/coaching-cadence").ScheduleReviewHistoryEntry[];
  rotation_touchpoint_history?: import("@/lib/v2/coaching-cadence").RotationTouchpointHistoryEntry[];
  /** Remaining free AI messages (mirrors app_users.message_balance) */
  message_balance?: number;
  invite_token?: string;
  invite_slot_number?: number;
  program_membership?: import("@/lib/v2/programs/program-membership").ProgramMembershipRecord;
  career_pivot_context?: import("@/lib/v2/non-traditional-career-models").CareerPivotContext;
  career_thesis?: import("@/lib/v2/non-traditional-career-models").CareerThesis;
  career_pivot_session?: import("@/lib/v2/non-traditional-career-mak-flow").CareerPivotSession;
  pivot_quarterly_session?: import("@/lib/v2/non-traditional-career-mak-flow").PivotQuarterlySession;
  pivot_quarterly_captures?: Array<{
    id: string;
    path: import("@/lib/v2/non-traditional-career-models").NonTraditionalTargetPath;
    completed_at: string;
    modules: Record<string, string>;
  }>;
  identity_navigation_session?: import("@/lib/v2/non-traditional-career-mak-flow").IdentityNavigationSession;
  pivot_translations?: import("@/lib/v2/non-traditional-career-models").PivotTranslationEntry[];
  career_translation_session?: import("@/lib/v2/non-traditional-career-mak-flow").CareerTranslationSession;
  career_board?: import("@/lib/v2/career-board-models").CareerBoardSnapshot;
  board_awareness_session?: import("@/lib/v2/career-board-mak-flow").BoardAwarenessSession;
  board_building_session?: import("@/lib/v2/career-board-mak-flow").BoardBuildingSession;
  career_narrative?: {
    stage_id: import("@/lib/v2/career-narrative-templates").CareerNarrativeStageId;
    track_id: import("@/lib/v2/career-narrative-templates").CareerNarrativeTrackId;
    application_id: import("@/lib/v2/career-narrative-templates").CareerNarrativeApplicationId;
    sections: Record<
      string,
      { content: string; completion_percentage: number; last_edited: string }
    >;
    updated_at: string;
  };
  career_portfolio?: {
    stage_id: import("@/lib/v2/career-portfolio-templates").CareerPortfolioStageId;
    items: Record<string, import("@/lib/v2/career-portfolio-templates").PortfolioItemState>;
    cross_cutting: Record<string, import("@/lib/v2/career-portfolio-templates").PortfolioItemState>;
    updated_at: string;
  };
  academic_dossier?: {
    stage_id: import("@/lib/v2/academic-dossier-templates").AcademicDossierStageId;
    items: Record<string, import("@/lib/v2/academic-dossier-templates").DossierItemState>;
    supporting: Record<string, import("@/lib/v2/academic-dossier-templates").DossierItemState>;
    updated_at: string;
  };
  academic_core_documents?: Partial<
    Record<
      import("@/lib/v2/academic-core-document-templates").AcademicCoreDocumentId,
      {
        sections: Record<
          string,
          { content: string; completion_percentage: number; last_edited: string }
        >;
        updated_at: string;
      }
    >
  >;
  cover_letter?: {
    stage_id: import("@/lib/v2/cover-letter-templates").CoverLetterStageId;
    position_type?: import("@/lib/v2/cover-letter-guide").CoverLetterPositionTypeId;
    institutional_setting?: import("@/lib/v2/cover-letter-guide").CoverLetterInstitutionalSettingId;
    specialty_category?: import("@/lib/v2/cover-letter-guide").CoverLetterSpecialtyCategoryId;
    sections: Record<
      string,
      { content: string; completion_percentage: number; last_edited: string }
    >;
    checklist?: Record<string, boolean>;
    updated_at: string;
  };
  industry_career_documents?: Partial<
    Record<
      import("@/lib/v2/industry-career-templates").IndustryDocumentType,
      {
        stage_id: import("@/lib/v2/industry-career-templates").IndustryCareerStageId;
        sector_id: import("@/lib/v2/industry-career-templates").IndustrySectorId;
        sections: Record<
          string,
          { content: string; completion_percentage: number; last_edited: string }
        >;
        updated_at: string;
      }
    >
  >;
  /** User-uploaded Output Studio templates keyed by OUTPUT_TEMPLATES id */
  output_user_templates?: import("@/lib/v2/output-user-templates").UserOutputTemplatesMap;
  /** Cached document→lattice evidence (invalidated when vault docs change) */
  lattice_document_cache?: import("@/lib/v2/lattice/document-cache").LatticeDocumentCache;
  /** Server-only Mak coaching bands — never expose s_index to users */
  _internal_coaching?: {
    service_footprint_band: "minimal" | "moderate" | "strong";
    workload_recognition_gap: "low" | "moderate" | "elevated";
    portfolio_documentation_gap: boolean;
    invisible_work_signals: string[];
    updated_at: string;
    s_index?: number;
    iwq?: number;
  };
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

  const cvMetrics = cvText ? computeCvMetrics(cvText, []) : null;

  const iwq =
    bits && invisible ? computeIwq(bits, invisible) : meta.iwq ?? null;

  const cdiView = buildCareerHealthView({ user, cvMetrics });

  const internalSignals = cvText
    ? computeInternalCoachingSignals(cvText, [])
    : null;

  return {
    instrument_ids: instrumentIds,
    instrument_scores: Object.fromEntries(instrumentScores.map((s) => [s.instrumentId, s])),
    cdi: { score: cdiView.career_health_score, domains: Object.fromEntries(cdiView.domains.map((d) => [d.label, d.score])) },
    career_health_summary: cdiView.career_health_summary,
    iwq,
    api_enrichment_plan: apiEnrichmentPlan(user.practice_setting ?? null, user.career_stage),
    pulse_baseline: invisibleHours
      ? { invisible_hours: invisibleHours, captured_at: new Date().toISOString() }
      : undefined,
    computed_at: new Date().toISOString(),
    ...(internalSignals ? internalCoachingMetadataPatch(internalSignals) : {}),
  };
}

export function careerHealthMakSummary(user: AppUser, cvText?: string | null): string {
  const view = buildCareerHealthView({
    user,
    cvMetrics: cvText ? computeCvMetrics(cvText, []) : null,
  });
  return buildCareerHealthIntroForMak(view);
}

import {
  computeInternalCoachingSignals,
  type InternalCoachingSignals,
} from "@/lib/v2/internal-coaching-signals";
import { buildLatticeDashboard } from "@/lib/v2/lattice/aggregate";
import { summarizeInstrumentEvaluation } from "@/lib/v2/lattice/profile-lattice-evidence";
import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";
import type { AppUser, CareerAssessment } from "@/lib/v2/types";
import type { ActivityEntry } from "@/lib/types/database";
import type { DocumentRecord } from "@/lib/v2/types";
import type { ScheduleBlock, UserScheduleEvent } from "@/lib/v2/schedule-calendar/types";

/** Internal only — not shown to end users (ADR-003). */
export const S_INDEX_TRACKING = {
  metric_key: "s_index",
  label: "S-Index (CV-regex service citizenship)",
  version: "cv_regex_v1",
  visibility: "mak_internal_and_kp_admin" as const,
  user_facing: false,
  institution_facing: false,
  formula_summary:
    "Sum weighted CV regex counts (mentoring×8, committee×7, leadership×9, service×3, QI×6, DEI×5, invisible-work lines×4), cap at 100.",
  future_replacement:
    "Mannix & Bell activity-based contribution scoring (s_index_points on activity_entries) when deployed.",
};

export type KpAdminTrackingSnapshot = InternalCoachingSignals & {
  metric: typeof S_INDEX_TRACKING;
};

export type KpAdminEvaluationSummary = {
  profile: {
    specialty: string | null;
    career_track: string | null;
    current_rotation: string | null;
    pgy_level: string | null;
    career_stage: string | null;
  };
  instruments: ReturnType<typeof summarizeInstrumentEvaluation>;
  touchpoint_assessments: {
    completed: number;
    total_answered_questions: number;
    categories: string[];
  };
  lattice_coverage: {
    evidence_total: number;
    by_source: Record<string, number>;
    populated_domains: string[];
    populated_domain_count: number;
  };
  evaluation_framework: OnboardingMetadata["evaluation_framework"] | null;
  coaching_cadence: {
    schedule_review_cadence: OnboardingMetadata["schedule_review_cadence"] | null;
    schedule_events_count: number;
    rotation_history_count: number;
  };
};

export function buildKpAdminEvaluationSummary(input: {
  user: AppUser;
  meta: OnboardingMetadata;
  assessments: CareerAssessment[];
  activities: ActivityEntry[];
  documents: DocumentRecord[];
  scheduleEvents: UserScheduleEvent[];
  programBlocks: ScheduleBlock[];
  isTrainee: boolean;
}): KpAdminEvaluationSummary {
  const { dashboard } = buildLatticeDashboard({
    activities: input.activities,
    documents: input.documents,
    timeframe: "all",
    isTrainee: input.isTrainee,
    documentCache: input.meta.lattice_document_cache,
    scheduleEvents: input.scheduleEvents,
    programBlocks: input.programBlocks,
    user: input.user,
    meta: input.meta,
    assessments: input.assessments,
  });

  const populatedDomains = new Set<string>();
  for (const cell of dashboard.fiscmak.cells) {
    if (cell.count > 0) populatedDomains.add(cell.rowLabel);
  }

  const completedAssessments = input.assessments.filter((a) => a.completed_at);
  const categories = [
    ...new Set(input.assessments.map((a) => a.question_category).filter(Boolean)),
  ];

  return {
    profile: {
      specialty: [input.user.base_specialty, input.user.subspecialty].filter(Boolean).join(" · ") || input.user.specialty,
      career_track: input.user.primary_career_track,
      current_rotation: input.user.current_rotation,
      pgy_level: input.user.pgy_level,
      career_stage: input.user.career_stage,
    },
    instruments: summarizeInstrumentEvaluation(input.user, input.meta),
    touchpoint_assessments: {
      completed: completedAssessments.length,
      total_answered_questions: input.assessments.reduce(
        (sum, a) => sum + (a.questions_answered?.length ?? 0),
        0,
      ),
      categories,
    },
    lattice_coverage: {
      evidence_total: dashboard.evidence_total,
      by_source: {
        activity: dashboard.activity_evidence_count,
        document: dashboard.document_evidence_count,
        profile: dashboard.profile_evidence_count,
        assessment: dashboard.assessment_evidence_count,
        goal: dashboard.goal_evidence_count,
        schedule: dashboard.schedule_evidence_count,
        rotation: dashboard.rotation_evidence_count,
      },
      populated_domains: [...populatedDomains].sort(),
      populated_domain_count: populatedDomains.size,
    },
    evaluation_framework: input.meta.evaluation_framework ?? null,
    coaching_cadence: {
      schedule_review_cadence: input.meta.schedule_review_cadence ?? null,
      schedule_events_count: input.scheduleEvents.length,
      rotation_history_count: input.meta.rotation_touchpoint_history?.length ?? 0,
    },
  };
}

export function buildKpAdminTrackingSnapshot(
  cvText: string | null | undefined,
  assessments: CareerAssessment[] = [],
): KpAdminTrackingSnapshot {
  const signals = computeInternalCoachingSignals(cvText, assessments);
  return {
    metric: S_INDEX_TRACKING,
    ...signals,
  };
}

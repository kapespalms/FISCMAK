import {
  computeInternalCoachingSignals,
  type InternalCoachingSignals,
} from "@/lib/v2/internal-coaching-signals";
import type { CareerAssessment } from "@/lib/v2/types";

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

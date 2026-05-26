import {
  buildKpAdminTrackingSnapshot,
  type KpAdminTrackingSnapshot,
} from "@/lib/v2/kp-admin-tracking";
import {
  buildMakDiscrepancyCoachingHints,
  formatMakInternalCoachingContext,
} from "@/lib/v2/mak-coaching-prompts";
import {
  computeInternalCoachingSignals,
  inferMakCoachingEscalationLevel,
  type InternalCoachingSignals,
} from "@/lib/v2/internal-coaching-signals";
import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";
import type { CareerAssessment } from "@/lib/v2/types";

export type MakInternalCoachingBundle = {
  signals: InternalCoachingSignals;
  escalation_level: ReturnType<typeof inferMakCoachingEscalationLevel>;
  hints: ReturnType<typeof buildMakDiscrepancyCoachingHints>;
  context_block: string;
};

export function buildMakInternalCoachingBundle(
  cvText: string | null | undefined,
  assessments: CareerAssessment[],
  meta: Pick<
    OnboardingMetadata,
    "low_alignment_quarters" | "stalled_goal_quarters" | "computed_at"
  >,
): MakInternalCoachingBundle {
  const signals = computeInternalCoachingSignals(cvText, assessments);
  const escalation_level = inferMakCoachingEscalationLevel(meta, signals);
  const hints = buildMakDiscrepancyCoachingHints(signals, escalation_level);
  const context_block = formatMakInternalCoachingContext(signals, hints, escalation_level);

  return { signals, escalation_level, hints, context_block };
}

/** KP Admin dev mirror of Mak internal inputs. */
export function buildKpAdminMakSignalPreview(
  cvText: string | null | undefined,
  assessments: CareerAssessment[],
  meta: Pick<
    OnboardingMetadata,
    "low_alignment_quarters" | "stalled_goal_quarters" | "computed_at"
  >,
): {
  tracking: KpAdminTrackingSnapshot;
  mak_bundle: MakInternalCoachingBundle;
} {
  const tracking = buildKpAdminTrackingSnapshot(cvText, assessments);
  const mak_bundle = buildMakInternalCoachingBundle(cvText, assessments, meta);
  return { tracking, mak_bundle };
}

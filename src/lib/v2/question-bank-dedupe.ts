import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";
import type { QuestionDef } from "@/lib/v2/types";

/**
 * Burnout Likert items in the 60-Q bank that overlap with Single-Item Burnout instrument capture.
 * Skip these when the physician has already answered the SIB cluster in the instrument flow.
 */
export const BURNOUT_OWNED_QUESTION_IDS = new Set(["Q3.1", "Q3.2", "Q3.3", "Q3.4"]);

const BURNOUT_RECENCY_DAYS = 84;

export function hasRecentBurnoutCapture(meta: OnboardingMetadata): boolean {
  const answers = meta.instrument_answers ?? [];
  const sibAnswered = answers.some((a) => a.clusterId === "sib-level");
  if (sibAnswered) return true;

  const scores = meta.instrument_scores as Record<string, unknown> | undefined;
  if (scores?.single_item_burnout) return true;

  const lastPulse = meta.pulse_history?.[0];
  if (lastPulse?.completed_at) {
    const days = Math.floor(
      (Date.now() - new Date(lastPulse.completed_at).getTime()) / 86400000,
    );
    if (days <= BURNOUT_RECENCY_DAYS && lastPulse.burnout_screen != null) return true;
  }

  return false;
}

export function applyPfiQuestionDedupe(
  questions: QuestionDef[],
  meta?: OnboardingMetadata | null,
): QuestionDef[] {
  if (!meta || !hasRecentBurnoutCapture(meta)) return questions;
  return questions.filter((q) => !BURNOUT_OWNED_QUESTION_IDS.has(q.q_id));
}

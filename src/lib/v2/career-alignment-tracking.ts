import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";
import { CAREER_ALIGNMENT_LOW } from "@/lib/v2/escalation-protocols";

export type AlignmentQuarterSnapshot = {
  quarter: string;
  alignment_pct: number;
  captured_at: string;
};

function currentQuarterLabel(): string {
  const now = new Date();
  return `Q${Math.floor(now.getMonth() / 3) + 1} ${now.getFullYear()}`;
}

function countConsecutiveLowQuarters(
  history: AlignmentQuarterSnapshot[],
  threshold = CAREER_ALIGNMENT_LOW,
): number {
  let count = 0;
  for (const entry of history) {
    if (entry.alignment_pct < threshold) count += 1;
    else break;
  }
  return count;
}

/** Track career alignment per quarter and update escalation metadata for trigger #7. */
export function updateAlignmentTracking(
  meta: OnboardingMetadata,
  alignmentPct: number,
): OnboardingMetadata {
  const quarter = currentQuarterLabel();
  const now = new Date().toISOString();
  const snapshot: AlignmentQuarterSnapshot = {
    quarter,
    alignment_pct: alignmentPct,
    captured_at: now,
  };

  const history = meta.alignment_history ?? [];
  const sameQuarter = history[0]?.quarter === quarter;
  const nextHistory = sameQuarter
    ? [snapshot, ...history.slice(1)]
    : [snapshot, ...history].slice(0, 8);

  const lowAlignmentQuarters = countConsecutiveLowQuarters(nextHistory);

  return {
    ...meta,
    alignment_history: nextHistory,
    career_alignment_pct: alignmentPct,
    low_alignment_quarters: lowAlignmentQuarters,
  };
}

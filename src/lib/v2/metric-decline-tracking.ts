import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";
import { RAPID_DECLINE_PERCENTILE_POINTS } from "@/lib/v2/escalation-protocols";
import type { CareerHealthView } from "@/lib/v2/career-health-view";
import { careerAlignmentFromHealth } from "@/lib/mak-chatbot-states";

export type MetricQuarterSnapshot = {
  quarter: string;
  captured_at: string;
  fulfillment?: number;
  strain?: number;
  alignment?: number;
  task_alignment?: number;
};

export type MetricDeclineRecord = {
  metricName: string;
  fromPercentile: number;
  toPercentile: number;
  quarter: string;
  detected_at: string;
};

const TRACKED_METRICS: { key: keyof Omit<MetricQuarterSnapshot, "quarter" | "captured_at">; label: string }[] = [
  { key: "fulfillment", label: "Professional fulfillment" },
  { key: "strain", label: "Work-related strain" },
  { key: "alignment", label: "Career alignment" },
  { key: "task_alignment", label: "Task alignment" },
];

function currentQuarterLabel(): string {
  const now = new Date();
  return `Q${Math.floor(now.getMonth() / 3) + 1} ${now.getFullYear()}`;
}

function detectDeclines(
  previous: MetricQuarterSnapshot | undefined,
  current: MetricQuarterSnapshot,
): MetricDeclineRecord[] {
  if (!previous) return [];
  const detected: MetricDeclineRecord[] = [];
  const now = new Date().toISOString();

  for (const { key, label } of TRACKED_METRICS) {
    const from = previous[key];
    const to = current[key];
    if (from == null || to == null) continue;
    const delta = from - to;
    if (delta > RAPID_DECLINE_PERCENTILE_POINTS) {
      detected.push({
        metricName: label,
        fromPercentile: from,
        toPercentile: to,
        quarter: current.quarter,
        detected_at: now,
      });
    }
  }
  return detected;
}

/** Snapshot longitudinal metrics and detect rapid declines for escalation trigger #6. */
export function updateMetricDeclineTracking(
  meta: OnboardingMetadata,
  current: {
    fulfillment?: number;
    strain?: number;
    alignment?: number;
    task_alignment?: number;
  },
): OnboardingMetadata {
  const quarter = currentQuarterLabel();
  const now = new Date().toISOString();
  const snapshot: MetricQuarterSnapshot = {
    quarter,
    captured_at: now,
    fulfillment: current.fulfillment,
    strain: current.strain,
    alignment: current.alignment,
    task_alignment: current.task_alignment,
  };

  const history = meta.metric_quarter_history ?? [];
  const sameQuarter = history[0]?.quarter === quarter;
  const previous = sameQuarter ? history[1] : history[0];
  const nextHistory = sameQuarter
    ? [snapshot, ...history.slice(1)]
    : [snapshot, ...history].slice(0, 8);

  const newDeclines = detectDeclines(previous, snapshot);
  const priorDeclines = meta.metric_declines ?? [];
  const mergedDeclines = [
    ...newDeclines,
    ...priorDeclines.filter((d) => d.quarter !== quarter),
  ].slice(0, 8);

  return {
    ...meta,
    metric_quarter_history: nextHistory,
    metric_declines: mergedDeclines.length ? mergedDeclines : undefined,
  };
}

export function metricValuesForTracking(input: {
  health: CareerHealthView | null;
  taskAlignmentScore?: number | null;
}): {
  fulfillment?: number;
  strain?: number;
  alignment?: number;
  task_alignment?: number;
} {
  const fulfillmentMetric = input.health?.wellbeing_metrics.find(
    (m) => m.id === "professional_fulfillment",
  );
  const strainMetric = input.health?.wellbeing_metrics.find((m) => m.id === "burnout_risk");

  const scoreFromStatus = (status?: string) => {
    if (status === "strong") return 72;
    if (status === "developing") return 55;
    if (status === "needs_attention") return 40;
    return undefined;
  };

  return {
    fulfillment: scoreFromStatus(fulfillmentMetric?.status),
    strain: scoreFromStatus(strainMetric?.status),
    alignment: careerAlignmentFromHealth(input.health) ?? undefined,
    task_alignment: input.taskAlignmentScore ?? undefined,
  };
}

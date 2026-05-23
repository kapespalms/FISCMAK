/** Design system tokens — Loveable Design Framework */

export type MetricStatus = "strong" | "developing" | "needs_attention" | "stable";

export const STATUS_LABELS: Record<MetricStatus, string> = {
  strong: "Strong",
  developing: "Developing",
  needs_attention: "Needs Attention",
  stable: "Stable",
};

export const STATUS_COLORS: Record<MetricStatus, { bg: string; text: string; border: string }> = {
  strong: {
    bg: "bg-fm-strong/10",
    text: "text-fm-strong",
    border: "border-fm-strong/30",
  },
  developing: {
    bg: "bg-fm-developing/10",
    text: "text-fm-developing",
    border: "border-fm-developing/40",
  },
  needs_attention: {
    bg: "bg-fm-attention/10",
    text: "text-fm-attention",
    border: "border-fm-attention/30",
  },
  stable: {
    bg: "bg-fm-neutral/10",
    text: "text-fm-neutral",
    border: "border-fm-neutral/30",
  },
};

export function scoreToMetricStatus(score: number): MetricStatus {
  if (score >= 70) return "strong";
  if (score >= 50) return "developing";
  return "needs_attention";
}

/** Inverted for risk metrics (lower raw risk = stronger status) */
export function riskToMetricStatus(riskLevel: "low" | "moderate" | "high" | "unknown"): MetricStatus {
  if (riskLevel === "low") return "strong";
  if (riskLevel === "moderate") return "developing";
  if (riskLevel === "high") return "needs_attention";
  return "stable";
}

export function formatMetricWithStatus(
  label: string,
  percentile: number | null,
  status: MetricStatus,
): string {
  if (percentile == null) return `${label}: ${STATUS_LABELS[status]}`;
  return `${label}: ${percentile}${ordinal(percentile)} percentile — ${STATUS_LABELS[status]}`;
}

function ordinal(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return "th";
  switch (n % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

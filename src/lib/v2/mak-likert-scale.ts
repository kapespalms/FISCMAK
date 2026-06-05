import type { InstrumentCluster } from "@/lib/v2/onboarding-instruments";

export type MakLikertScalePayload = {
  cluster_id: string;
  min: number;
  max: number;
  anchors: string;
  labels: string[];
};

const GENERIC_LABELS = ["0", "1", "2", "3", "4", "5", "6", "7"];

export function likertScaleForCluster(
  cluster: Pick<InstrumentCluster, "id" | "likertMax" | "instrumentId"> | null,
): MakLikertScalePayload | null {
  if (!cluster || cluster.likertMax <= 0) return null;

  const max = cluster.likertMax;
  // WHO-5 and PHQ-2 start at 0; most others start at 1
  const startsAtZero = ["who5", "phq2"].includes(cluster.instrumentId);
  const min = startsAtZero ? 0 : 1;

  return {
    cluster_id: cluster.id,
    min,
    max,
    anchors: `Rate from ${min} to ${max}.`,
    labels: GENERIC_LABELS.slice(min, max + 1),
  };
}

export function buildBaselineCheckinIntro(userName?: string | null): string {
  const name = userName?.trim();
  return `${name ? `${name}, welcome` : "Welcome"} to your **baseline check-in** — part of onboarding.

This takes about **10 minutes**. I'll ask standard wellbeing and career questions one at a time. You can tap a number or type a reply. Pause anytime.

When we're done, I'll read back a plain summary for you to confirm — no scores on screen.`;
}

import { PFI_ANCHORS, PFI_LIKERT_MAX } from "@/lib/v2/pfi-scale";
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
  const min = cluster.instrumentId === "pfi" || max === PFI_LIKERT_MAX ? 0 : 1;

  return {
    cluster_id: cluster.id,
    min,
    max,
    anchors: max === PFI_LIKERT_MAX ? PFI_ANCHORS : `Rate from ${min} to ${max}.`,
    labels: GENERIC_LABELS.slice(min, max + 1),
  };
}

export function buildBaselineCheckinIntro(userName?: string | null): string {
  const name = userName?.trim();
  return `${name ? `${name}, welcome` : "Welcome"} to your **baseline check-in** — part of onboarding.

This takes about **10 minutes**. I'll ask standard wellbeing and career questions one at a time. You can tap a number or type a reply. Pause anytime.

When we're done, I'll read back a plain summary for you to confirm — no scores on screen.`;
}

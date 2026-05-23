import type { AppUser } from "@/lib/v2/types";
import type { PracticeSetting } from "@/lib/v2/onboarding-options";
import {
  computeCdi,
  computeIwq,
  scoreAllInstruments,
  type InstrumentAnswer,
} from "@/lib/v2/onboarding-instruments";
import { deployedInstruments, apiEnrichmentPlan } from "@/lib/v2/onboarding-touchpoint1";
import { computeCvMetrics } from "@/lib/v2/cv-metrics";

export type OnboardingMetadata = {
  reconciliation?: { id: string; status: string }[];
  instrument_answers?: InstrumentAnswer[];
  instrument_ids?: string[];
  instrument_scores?: Record<string, unknown>;
  api_enrichment_plan?: ReturnType<typeof apiEnrichmentPlan>;
  cdi?: { score: number; domains: Record<string, number> };
  iwq?: number;
  computed_at?: string;
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
  const pfi = instrumentScores.find((s) => s.instrumentId === "pfi");

  let sIndex = 30;
  let clinicalProductivity = 50;
  if (cvText) {
    const cvMetrics = computeCvMetrics(cvText, []);
    sIndex = cvMetrics.s_index;
    clinicalProductivity = Math.min(100, cvMetrics.domain_scores.clinical * 10);
  }

  const iwq =
    bits && invisible ? computeIwq(bits, invisible) : meta.iwq ?? null;

  const cdi = computeCdi({
    setting: (user.practice_setting as PracticeSetting | null) ?? null,
    pfi,
    bits,
    sIndex,
    clinicalProductivity,
  });

  return {
    instrument_ids: instrumentIds,
    instrument_scores: Object.fromEntries(instrumentScores.map((s) => [s.instrumentId, s])),
    cdi,
    iwq,
    s_index: sIndex,
    api_enrichment_plan: apiEnrichmentPlan(user.practice_setting ?? null, user.career_stage),
    computed_at: new Date().toISOString(),
  };
}

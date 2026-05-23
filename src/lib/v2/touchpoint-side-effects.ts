import type { AppUser } from "@/lib/v2/types";
import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";
import { fetchDocuments, fetchCareerGoals } from "@/lib/v2/db";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";
import {
  mergeEnrichmentIntoMetadata,
  runApiEnrichment,
  type EnrichmentSnapshot,
} from "@/lib/v2/api-enrichment";
import { updateGoalMilestoneHistory } from "@/lib/v2/goal-milestone-tracking";
import { upsertAppUser } from "@/lib/v2/api-helpers";

export async function runTouchpointSideEffects(input: {
  userId: string;
  email: string;
  demo: boolean;
  user: AppUser;
  meta: OnboardingMetadata;
  enrichmentTrigger: EnrichmentSnapshot["trigger"];
}): Promise<OnboardingMetadata> {
  let meta = input.meta;
  const goals = await fetchCareerGoals(input.userId, input.demo);
  meta = updateGoalMilestoneHistory(meta, goals);

  const docs = await fetchDocuments(input.userId, input.demo);
  const cv = docs.find((d) => d.document_type === "CV" && d.extracted_text);
  if (cv?.extracted_text) {
    try {
      const snapshot = await runApiEnrichment({
        user: input.user,
        cvText: cv.extracted_text,
        trigger: input.enrichmentTrigger,
        previousSnapshot: meta.enrichment_snapshot ?? null,
      });
      meta = mergeEnrichmentIntoMetadata(meta, snapshot);
    } catch (e) {
      console.error("Touchpoint enrichment failed:", e);
    }
  }

  await upsertAppUser(
    input.userId,
    input.email,
    { onboarding_metadata: meta as Record<string, unknown> },
    input.demo,
  );

  return meta;
}

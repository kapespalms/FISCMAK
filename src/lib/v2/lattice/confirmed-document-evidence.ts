import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";
import { reconciliationItemsDetailed } from "@/lib/v2/reconcile-mak-helpers";
import {
  acgmeLevelIndex,
  inferDevelopmentLevel,
} from "@/lib/v2/lattice/ontology-bridge";
import { matchTextToActivityPlacement } from "@/lib/v2/lattice/ontology-registry";
import type { LatticeEvidence } from "@/lib/v2/lattice/types";

/** CV / enrichment lattice cells — confirmed reconcile rows only (not raw parser snippets). */
export function buildConfirmedDocumentLatticeEvidence(
  meta: OnboardingMetadata,
  fallbackTrackIndex = 0,
): LatticeEvidence[] {
  return reconciliationItemsDetailed(meta)
    .filter((item) => item.status === "confirmed")
    .map((item) => {
      const text = item.detail ? `${item.label}: ${item.detail}` : item.label;
      const match = matchTextToActivityPlacement(text);
      const domainIndex = match?.domainIndex ?? 4;
      const trackIndex = match?.trackIndex ?? fallbackTrackIndex;
      const acgmeKey = match?.acgmeKey ?? "medical_knowledge";
      const developmentLevel = inferDevelopmentLevel(
        text,
        match?.defaultDevelopmentLevel ?? 2,
      );
      return {
        id: `recon-${item.id}`,
        source: "document" as const,
        sourceLabel: item.source,
        rawText: text,
        date: null,
        energy: null,
        developmentLevel,
        fiscmak: { domainIndex, trackIndex },
        acgme: {
          competencyKey: acgmeKey,
          levelIndex: acgmeLevelIndex(developmentLevel),
        },
      };
    });
}

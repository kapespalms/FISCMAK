import type { EnrichmentSnapshot } from "@/lib/v2/api-enrichment";
import { enrichmentVaultLine } from "@/lib/v2/api-enrichment";
import type { PracticeSetting } from "@/lib/v2/onboarding-options";
import type { ObjectiveBandSummary } from "@/lib/v2/dashboard-data";

export type CareerVaultSection = {
  id: string;
  label: string;
  count: number;
};

export type CareerVaultModel = {
  summary: string;
  sections: CareerVaultSection[];
  sources: string[];
  last_enrichment_at: string | null;
  npi_verified: boolean;
  orcid: string | null;
  citations_total: number | null;
  changes_since_quarter: string | null;
  pending_review: number;
  enrichment_status: EnrichmentSnapshot["status"] | null;
};

export function buildCareerVaultModel(input: {
  setting: PracticeSetting | null;
  enrichment?: EnrichmentSnapshot | null;
  objective: ObjectiveBandSummary;
}): CareerVaultModel {
  const snap = input.enrichment;
  const summary =
    enrichmentVaultLine(input.setting, snap) ??
    input.objective.vaultSummary ??
    "Upload documents to populate Career Vault";

  const sections: CareerVaultSection[] = snap
    ? [
        { id: "publications", label: "Publications", count: snap.publications_detected },
        { id: "grants", label: "Grants", count: snap.grants_detected },
        { id: "teaching", label: "Teaching", count: snap.courses_detected },
        { id: "committees", label: "Committees & Service", count: snap.committees_detected },
        { id: "presentations", label: "Presentations", count: snap.presentations_detected },
        { id: "awards", label: "Awards", count: snap.awards_detected },
        {
          id: "certifications",
          label: "Peer reviews & credentials",
          count: snap.peer_reviews_detected,
        },
      ]
    : [];

  return {
    summary,
    sections,
    sources: snap?.sources ?? [],
    last_enrichment_at: snap?.completed_at ?? null,
    npi_verified: Boolean(snap?.npi_verified),
    orcid: snap?.orcid ?? null,
    citations_total: snap?.citations_total ?? null,
    changes_since_quarter: input.objective.changesSinceQuarter,
    pending_review: input.objective.pendingReviewCount,
    enrichment_status: snap?.status ?? null,
  };
}

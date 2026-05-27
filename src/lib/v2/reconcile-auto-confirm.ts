import type { EnrichmentSnapshot, VaultPublicationExtract } from "@/lib/v2/api-enrichment";
import type { ReconciliationItem } from "@/lib/v2/onboarding-touchpoint1";

export type CvIdentifierSet = {
  dois: string[];
  pmids: string[];
  grantIds: string[];
};

export function normalizeDoi(doi: string): string {
  return doi
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\/(dx\.)?doi\.org\//i, "");
}

export function normalizeGrantId(grantId: string): string {
  return grantId.replace(/\s+/g, " ").trim().toUpperCase();
}

/** Exact DOI or PMID overlap between CV text and API enrichment extract. */
export function isAutoReconcilablePublication(
  pub: VaultPublicationExtract,
  cvIds: CvIdentifierSet,
): boolean {
  if (pub.doi) {
    const normalized = normalizeDoi(pub.doi);
    if (cvIds.dois.some((d) => normalizeDoi(d) === normalized)) return true;
  }
  if (pub.pmid) {
    const pmid = pub.pmid.replace(/\D/g, "");
    if (cvIds.pmids.some((p) => p.replace(/\D/g, "") === pmid)) return true;
  }
  return false;
}

export function isAutoReconcilableGrant(grantId: string, cvIds: CvIdentifierSet): boolean {
  const normalized = normalizeGrantId(grantId);
  return cvIds.grantIds.some((g) => normalizeGrantId(g) === normalized);
}

export function cvIdentifiersFromSnapshot(snapshot: EnrichmentSnapshot): CvIdentifierSet {
  const dois = new Set<string>();
  const pmids = new Set<string>();
  const grantIds = new Set<string>();

  for (const pub of snapshot.vault_extracts?.publications ?? []) {
    if (pub.doi) dois.add(normalizeDoi(pub.doi));
    if (pub.pmid) pmids.add(pub.pmid.replace(/\D/g, ""));
  }
  for (const grantId of snapshot.vault_extracts?.grant_ids ?? []) {
    grantIds.add(normalizeGrantId(grantId));
  }

  return {
    dois: [...dois],
    pmids: [...pmids],
    grantIds: [...grantIds],
  };
}

/** Mark bulk reconciliation items confirmed when all extracted identifiers are CV-exact. */
export function applyAutoConfirmToReconciliationItems(
  items: ReconciliationItem[],
  snapshot: EnrichmentSnapshot,
): ReconciliationItem[] {
  const cvIds = cvIdentifiersFromSnapshot(snapshot);
  const vaultPubs = snapshot.vault_extracts?.publications ?? [];
  const identifiablePubs = vaultPubs.filter((p) => p.doi || p.pmid);
  const allPubsAuto =
    identifiablePubs.length > 0 &&
    identifiablePubs.every((p) => isAutoReconcilablePublication(p, cvIds));
  const grantIds = snapshot.vault_extracts?.grant_ids ?? [];
  const allGrantsAuto =
    grantIds.length > 0 && grantIds.every((g) => isAutoReconcilableGrant(g, cvIds));

  return items.map((item) => {
    if (item.id === "enrichment-publications" && allPubsAuto) {
      return { ...item, status: "confirmed" as const };
    }
    if (item.id === "enrichment-grants" && allGrantsAuto) {
      return { ...item, status: "confirmed" as const };
    }
    if (item.id === "enrichment-npi" && snapshot.npi_verified) {
      return { ...item, status: "confirmed" as const };
    }
    return item;
  });
}

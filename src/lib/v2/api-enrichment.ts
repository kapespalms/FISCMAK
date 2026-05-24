import type { AppUser } from "@/lib/v2/types";
import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";
import { apiEnrichmentPlan } from "@/lib/v2/onboarding-touchpoint1";
import type { ReconciliationItem } from "@/lib/v2/onboarding-touchpoint1";

export type VaultPublicationExtract = {
  doi?: string;
  pmid?: string;
  title: string;
  citation_count?: number;
};

export type EnrichmentSnapshot = {
  run_id: string;
  completed_at: string;
  trigger: "onboarding" | "quarterly" | "annual" | "manual" | "cv_upload";
  status: "completed" | "partial" | "failed";
  sources: string[];
  publications_detected: number;
  citations_total: number | null;
  grants_detected: number;
  peer_reviews_detected: number;
  presentations_detected: number;
  committees_detected: number;
  courses_detected: number;
  awards_detected: number;
  changes_summary: string | null;
  reconciliation_items: ReconciliationItem[];
  npi?: string | null;
  npi_verified?: boolean;
  orcid?: string | null;
  orcid_works_count?: number | null;
  cms_open_payments_signals?: number;
  cms_medicare_signals?: number;
  /** Structured extracts for Career Data vault dual-write */
  vault_extracts?: {
    publications: VaultPublicationExtract[];
    grant_ids: string[];
  };
};

export type EnrichmentRunLog = {
  run_id: string;
  completed_at: string;
  trigger: EnrichmentSnapshot["trigger"];
  status: EnrichmentSnapshot["status"];
  sources: string[];
};

const DOI_REGEX = /\b10\.\d{4,9}\/[^\s,)>\]]+/gi;
const PMID_REGEX = /\bPMID:?\s*(\d{7,8})\b/gi;
const GRANT_REGEX = /\b(R01|R21|K23|K08|F32|U01|P01)[\s-]?([A-Z]{2}\d{6,8}(?:-\d+)?)\b/gi;
const NPI_REGEX = /\bNPI[:\s#-]*(\d{10})\b/i;
const ORCID_REGEX = /\b(\d{4}-\d{4}-\d{4}-\d{3}[0-9X])\b/gi;
const STANDALONE_NPI = /\b(?<![\d.])(\d{10})(?![\d.])/g;

function extractNpi(cvText: string): string | null {
  const labeled = cvText.match(NPI_REGEX);
  if (labeled?.[1]) return labeled[1];
  const matches = cvText.match(STANDALONE_NPI) ?? [];
  return matches.find((n) => n.startsWith("1") || n.startsWith("2")) ?? null;
}

function extractOrcids(cvText: string): string[] {
  return unique([...(cvText.match(ORCID_REGEX) ?? [])]);
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

export function extractCvIdentifiers(cvText: string): {
  dois: string[];
  pmids: string[];
  grantIds: string[];
  npi: string | null;
  orcids: string[];
} {
  const dois = unique((cvText.match(DOI_REGEX) ?? []).map((d) => d.toLowerCase()));
  const pmids = unique(
    [...cvText.matchAll(PMID_REGEX)].map((m) => m[1]).filter(Boolean) as string[],
  );
  const grantIds = unique(
    [...cvText.matchAll(GRANT_REGEX)].map((m) => `${m[1]} ${m[2]}`.trim()),
  );
  return { dois, pmids, grantIds, npi: extractNpi(cvText), orcids: extractOrcids(cvText) };
}

type OpenAlexWork = {
  cited_by_count?: number;
  title?: string;
  doi?: string;
};

async function fetchOpenAlexDoi(doi: string): Promise<OpenAlexWork | null> {
  try {
    const normalized = doi.startsWith("http") ? doi : `https://doi.org/${doi}`;
    const res = await fetch(
      `https://api.openalex.org/works/${encodeURIComponent(normalized)}`,
      { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(8000) },
    );
    if (!res.ok) return null;
    return (await res.json()) as OpenAlexWork;
  } catch {
    return null;
  }
}

async function fetchPubMedCitedCount(pmids: string[]): Promise<number | null> {
  if (pmids.length === 0) return null;
  try {
    const id = pmids.slice(0, 10).join(",");
    const res = await fetch(
      `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=pubmed&id=${id}&retmode=json`,
      { signal: AbortSignal.timeout(8000) },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      result?: Record<string, { pmid?: string; title?: string }>;
    };
    const keys = Object.keys(data.result ?? {}).filter((k) => k !== "uids");
    return keys.length;
  } catch {
    return null;
  }
}

async function fetchNppesProvider(npi: string): Promise<{ verified: boolean; name?: string } | null> {
  try {
    const res = await fetch(
      `https://npiregistry.cms.hhs.gov/api/?version=2.1&number=${npi}`,
      { signal: AbortSignal.timeout(8000) },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      result_count?: number;
      results?: Array<{ basic?: { first_name?: string; last_name?: string } }>;
    };
    if (!data.result_count || !data.results?.length) return { verified: false };
    const basic = data.results[0]?.basic;
    const name =
      basic?.first_name && basic?.last_name
        ? `${basic.first_name} ${basic.last_name}`
        : undefined;
    return { verified: true, name };
  } catch {
    return null;
  }
}

async function fetchOrcidWorksCount(orcid: string): Promise<number | null> {
  try {
    const res = await fetch(`https://pub.orcid.org/v3.0/${orcid}/works`, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { group?: unknown[] };
    return data.group?.length ?? 0;
  } catch {
    return null;
  }
}

function cmsHeuristics(cvText: string): { openPayments: number; medicare: number } {
  const lower = cvText.toLowerCase();
  return {
    openPayments: countHeuristic(lower, [
      /\bopen payments\b/,
      /\bconsulting fee\b/,
      /\bspeaking fee\b/,
      /\bpharmaceutical\b/,
      /\badvisory board\b/,
    ]),
    medicare: countHeuristic(lower, [
      /\bwrvu\b/,
      /\bmedicare\b/,
      /\brvu\b/,
      /\bbilling\b/,
      /\bclinical volume\b/,
    ]),
  };
}

async function fetchNihGrantCount(grantIds: string[]): Promise<number | null> {
  if (grantIds.length === 0) return null;
  try {
    const res = await fetch("https://api.reporter.nih.gov/v2/projects/search", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        criteria: { project_nums: grantIds.slice(0, 5) },
        limit: 5,
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return grantIds.length;
    const data = (await res.json()) as { results?: unknown[] };
    return data.results?.length ?? grantIds.length;
  } catch {
    return grantIds.length;
  }
}

function countHeuristic(cvText: string, patterns: RegExp[]): number {
  return patterns.reduce((sum, p) => sum + (cvText.match(new RegExp(p.source, `${p.flags}g`))?.length ?? 0), 0);
}

function heuristicCounts(cvText: string) {
  const lower = cvText.toLowerCase();
  return {
    publications: countHeuristic(lower, [/\bdoi:\b/, /\bet al\.?\b/, /\bjournal\b/, /\bpmid\b/]),
    grants: countHeuristic(lower, [/\bgrant\b/, /\bnih\b/, /\br01\b/, /\bk23\b/, /\bf32\b/]),
    peer_reviews: countHeuristic(lower, [/\bpeer review\b/, /\breviewer\b/, /\beditorial board\b/]),
    presentations: countHeuristic(lower, [/\bpresented\b/, /\bposter\b/, /\boral presentation\b/]),
    committees: countHeuristic(lower, [/\bcommittee\b/, /\btask force\b/, /\bworkgroup\b/]),
    courses: countHeuristic(lower, [/\bcourse director\b/, /\bcurriculum\b/, /\blecture\b/]),
    awards: countHeuristic(lower, [/\baward\b/, /\bhonor\b/, /\bfellow\b/]),
  };
}

function buildChangesSummary(
  current: Omit<EnrichmentSnapshot, "changes_summary" | "reconciliation_items" | "run_id" | "completed_at" | "trigger" | "status" | "sources">,
  previous: EnrichmentSnapshot | null | undefined,
): string | null {
  if (!previous) return null;
  const parts: string[] = [];
  const pubDelta = current.publications_detected - previous.publications_detected;
  if (pubDelta > 0) parts.push(`+${pubDelta} publication${pubDelta > 1 ? "s" : ""}`);
  if (current.citations_total != null && previous.citations_total != null) {
    const citeDelta = current.citations_total - previous.citations_total;
    if (citeDelta > 0) parts.push(`+${citeDelta} citations`);
  }
  const grantDelta = current.grants_detected - previous.grants_detected;
  if (grantDelta > 0) parts.push(`+${grantDelta} grant${grantDelta > 1 ? "s" : ""}`);
  const reviewDelta = current.peer_reviews_detected - previous.peer_reviews_detected;
  if (reviewDelta > 0) parts.push(`+${reviewDelta} peer review${reviewDelta > 1 ? "s" : ""}`);
  return parts.length ? `${parts.join(", ")} since last quarter` : null;
}

function buildReconciliationFromEnrichment(input: {
  dois: string[];
  openAlexTitles: string[];
  grantIds: string[];
  plan: ReturnType<typeof apiEnrichmentPlan>;
  npi?: string | null;
  npiVerified?: boolean;
  npiName?: string;
  orcid?: string | null;
  orcidWorks?: number | null;
  cmsOpenPayments?: number;
  cmsMedicare?: number;
}): ReconciliationItem[] {
  const items: ReconciliationItem[] = [];
  if (input.plan.pubmed_icite && input.dois.length > 0) {
    items.push({
      id: "enrichment-publications",
      source: "PubMed + OpenAlex",
      label: `${input.dois.length} publication identifier${input.dois.length > 1 ? "s" : ""} detected`,
      detail:
        input.openAlexTitles.length > 0
          ? `Verify: ${input.openAlexTitles.slice(0, 2).join("; ")}`
          : "Confirm authorship and match to your publication profile.",
      status: "pending",
    });
  }
  if (input.plan.nih_reporter && input.grantIds.length > 0) {
    items.push({
      id: "enrichment-grants",
      source: "NIH RePORTER",
      label: `${input.grantIds.length} grant identifier${input.grantIds.length > 1 ? "s" : ""} detected`,
      detail: "Confirm active and prior awards for portfolio scoring.",
      status: "pending",
    });
  }
  if (input.plan.nppes && input.npi) {
    items.push({
      id: "enrichment-npi",
      source: "NPPES",
      label: input.npiVerified ? `NPI ${input.npi} verified` : `NPI ${input.npi} pending verification`,
      detail: input.npiName
        ? `Registry match: ${input.npiName}. Confirm practice location.`
        : "Confirm NPI matches current practice location.",
      status: input.npiVerified ? "pending" : "pending",
    });
  } else if (input.plan.nppes) {
    items.push({
      id: "enrichment-npi",
      source: "NPPES",
      label: "NPI registry lookup",
      detail: "Add NPI to CV or profile to enable registry verification.",
      status: "pending",
    });
  }
  if (input.plan.orcid && input.orcid) {
    items.push({
      id: "enrichment-orcid",
      source: "ORCID",
      label: `ORCID ${input.orcid}${input.orcidWorks != null ? ` — ${input.orcidWorks} works indexed` : ""}`,
      detail: "Confirm ORCID profile matches your publication record.",
      status: "pending",
    });
  }
  if (input.plan.cms_open_payments && (input.cmsOpenPayments ?? 0) > 0) {
    items.push({
      id: "enrichment-open-payments",
      source: "CMS Open Payments",
      label: "Industry payment signals detected on CV",
      detail: "Review Open Payments disclosures for accuracy and completeness.",
      status: "pending",
    });
  }
  if (input.plan.cms_medicare && (input.cmsMedicare ?? 0) > 0) {
    items.push({
      id: "enrichment-medicare",
      source: "CMS Medicare",
      label: "Clinical volume / Medicare signals detected",
      detail: "Confirm wRVU and clinical volume metrics when data becomes available.",
      status: "pending",
    });
  }
  return items;
}

export async function runApiEnrichment(input: {
  user: AppUser;
  cvText: string;
  trigger?: EnrichmentSnapshot["trigger"];
  previousSnapshot?: EnrichmentSnapshot | null;
}): Promise<EnrichmentSnapshot> {
  const plan = apiEnrichmentPlan(input.user.practice_setting, input.user.career_stage);
  const { dois, pmids, grantIds, npi, orcids } = extractCvIdentifiers(input.cvText);
  const heuristics = heuristicCounts(input.cvText);
  const cms = cmsHeuristics(input.cvText);
  const sources: string[] = ["cv_parse"];

  let citationsTotal: number | null = null;
  const openAlexTitles: string[] = [];
  const vaultPublications: VaultPublicationExtract[] = [];
  let npiVerified: boolean | undefined;
  let npiName: string | undefined;
  let orcidWorks: number | null = null;
  const orcid = orcids[0] ?? null;

  if (plan.openalex && dois.length > 0) {
    sources.push("openalex");
    let citeSum = 0;
    for (const doi of dois.slice(0, 5)) {
      const work = await fetchOpenAlexDoi(doi);
      if (work?.cited_by_count != null) citeSum += work.cited_by_count;
      if (work?.title) openAlexTitles.push(work.title);
      vaultPublications.push({
        doi,
        title: work?.title ?? `Publication (${doi})`,
        citation_count: work?.cited_by_count,
      });
    }
    citationsTotal = citeSum > 0 ? citeSum : null;
  }

  for (const pmid of pmids.slice(0, 10)) {
    if (!vaultPublications.some((p) => p.pmid === pmid)) {
      vaultPublications.push({ pmid, title: `PubMed ${pmid}` });
    }
  }

  if (plan.pubmed_icite && pmids.length > 0) {
    sources.push("pubmed_icite");
    const pubmedCount = await fetchPubMedCitedCount(pmids);
    if (pubmedCount != null && heuristics.publications < pubmedCount) {
      heuristics.publications = pubmedCount;
    }
  }

  let grantsDetected = heuristics.grants;
  if (plan.nih_reporter && grantIds.length > 0) {
    sources.push("nih_reporter");
    const nihCount = await fetchNihGrantCount(grantIds);
    if (nihCount != null) grantsDetected = Math.max(grantsDetected, nihCount);
  }

  if (plan.nppes && npi) {
    sources.push("nppes");
    const nppes = await fetchNppesProvider(npi);
    if (nppes) {
      npiVerified = nppes.verified;
      npiName = nppes.name;
    }
  } else if (plan.nppes) {
    sources.push("nppes");
  }

  if (plan.orcid && orcid) {
    sources.push("orcid");
    orcidWorks = await fetchOrcidWorksCount(orcid);
    if (orcidWorks != null && heuristics.publications < orcidWorks) {
      heuristics.publications = orcidWorks;
    }
  } else if (plan.orcid) {
    sources.push("orcid");
  }

  if (plan.cms_open_payments && cms.openPayments > 0) sources.push("cms_open_payments");
  if (plan.cms_medicare && cms.medicare > 0) sources.push("cms_medicare");

  const publicationsDetected = Math.max(heuristics.publications, dois.length, pmids.length);
  const reconciliation_items = buildReconciliationFromEnrichment({
    dois,
    openAlexTitles,
    grantIds,
    plan,
    npi,
    npiVerified,
    npiName,
    orcid,
    orcidWorks,
    cmsOpenPayments: cms.openPayments,
    cmsMedicare: cms.medicare,
  });

  const core = {
    publications_detected: publicationsDetected,
    citations_total: citationsTotal,
    grants_detected: grantsDetected,
    peer_reviews_detected: heuristics.peer_reviews,
    presentations_detected: heuristics.presentations,
    committees_detected: heuristics.committees,
    courses_detected: heuristics.courses,
    awards_detected: heuristics.awards,
  };

  const snapshot: EnrichmentSnapshot = {
    run_id: crypto.randomUUID(),
    completed_at: new Date().toISOString(),
    trigger: input.trigger ?? "manual",
    status: sources.length > 1 ? "completed" : "partial",
    sources,
    ...core,
    changes_summary: buildChangesSummary(core, input.previousSnapshot),
    reconciliation_items,
    npi,
    npi_verified: npiVerified,
    orcid,
    orcid_works_count: orcidWorks,
    cms_open_payments_signals: cms.openPayments,
    cms_medicare_signals: cms.medicare,
    vault_extracts: {
      publications: vaultPublications,
      grant_ids: grantIds,
    },
  };

  return snapshot;
}

export function mergeEnrichmentIntoMetadata(
  meta: OnboardingMetadata,
  snapshot: EnrichmentSnapshot,
): OnboardingMetadata {
  const runs: EnrichmentRunLog[] = meta.enrichment_runs ?? [];
  return {
    ...meta,
    previous_enrichment_snapshot: meta.enrichment_snapshot ?? meta.previous_enrichment_snapshot,
    enrichment_snapshot: snapshot,
    enrichment_runs: [
      {
        run_id: snapshot.run_id,
        completed_at: snapshot.completed_at,
        trigger: snapshot.trigger,
        status: snapshot.status,
        sources: snapshot.sources,
      },
      ...runs,
    ].slice(0, 12),
    reconciliation: mergeReconciliation(meta.reconciliation ?? [], snapshot.reconciliation_items),
  };
}

function mergeReconciliation(
  existing: { id: string; status: string }[],
  newItems: ReconciliationItem[],
): { id: string; status: string }[] {
  const map = new Map(existing.map((r) => [r.id, r.status]));
  for (const item of newItems) {
    if (!map.has(item.id)) map.set(item.id, item.status);
  }
  return [...map.entries()].map(([id, status]) => ({ id, status }));
}

export function enrichmentVaultLine(
  setting: AppUser["practice_setting"],
  snapshot: EnrichmentSnapshot | null | undefined,
): string | null {
  if (!snapshot) return null;
  if (setting === "Community") {
    return `${snapshot.publications_detected} presentations · ${snapshot.committees_detected} committees · quality metrics tracked`;
  }
  if (setting === "Industry") {
    return `${snapshot.publications_detected} therapeutic publications · ${snapshot.committees_detected} advisory boards · ${snapshot.grants_detected} grants`;
  }
  return `${snapshot.publications_detected} publications · ${snapshot.grants_detected} active grants · ${snapshot.courses_detected} courses · ${snapshot.committees_detected} committees · ${snapshot.presentations_detected} presentations · ${snapshot.awards_detected} awards`;
}

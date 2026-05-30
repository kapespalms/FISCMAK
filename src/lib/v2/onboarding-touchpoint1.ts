import type { CareerLevel, PracticeSetting } from "@/lib/v2/onboarding-options";

export type DocumentType =
  | "CV"
  | "NIH_Biosketch"
  | "Teaching_Portfolio"
  | "Personal_Statement"
  | "Promotion_Dossier"
  | "Annual_Review"
  | "LinkedIn_Export";

export type DocumentRequirement = "required" | "optional" | "skip";

export type OnboardingDocumentSpec = {
  type: DocumentType;
  label: string;
  requirement: DocumentRequirement;
  apiKey: string;
};

export type OnboardingInstrument = {
  id: string;
  name: string;
  items: number;
  minutes: number;
  description: string;
};

const DOC_LABELS: Record<DocumentType, string> = {
  CV: "CV / Resume",
  NIH_Biosketch: "NIH Biosketch",
  Teaching_Portfolio: "Teaching / Educator Portfolio",
  Personal_Statement: "Personal Statement",
  Promotion_Dossier: "Promotion Dossier",
  Annual_Review: "Annual Review / Faculty Activity Report",
  LinkedIn_Export: "LinkedIn Profile Export",
};

function isAcademic(setting: PracticeSetting | null): boolean {
  return setting === "Academic" || setting === "Hybrid";
}

function isCommunity(setting: PracticeSetting | null): boolean {
  return setting === "Community" || setting === "Hybrid";
}

function isIndustry(setting: PracticeSetting | null): boolean {
  return setting === "Industry";
}

function isTrainee(level: CareerLevel | null): boolean {
  return level === "Medical Student" || level === "Resident" || level === "Fellow";
}

function isEarlyOrMid(level: CareerLevel | null): boolean {
  return (
    level === "Early Career (0–7 yr)" ||
    level === "Mid-Career (8–20 yr)" ||
    level === "Late Career (20+ yr)"
  );
}

export function documentRequirements(
  level: CareerLevel | null,
  setting: PracticeSetting | null,
): OnboardingDocumentSpec[] {
  const req = (type: DocumentType, requirement: DocumentRequirement): OnboardingDocumentSpec => ({
    type,
    label: DOC_LABELS[type],
    requirement,
    apiKey: type.toLowerCase(),
  });

  const docs: OnboardingDocumentSpec[] = [];

  // CV matrix from spec
  docs.push(req("CV", "optional"));

  if (isAcademic(setting) && isEarlyOrMid(level)) {
    docs.push(req("NIH_Biosketch", level === "Early Career (0–7 yr)" ? "optional" : "optional"));
    docs.push(req("Teaching_Portfolio", "optional"));
    docs.push(req("Promotion_Dossier", level === "Late Career (20+ yr)" ? "required" : "optional"));
    docs.push(req("Annual_Review", "optional"));
  }

  if (isCommunity(setting) && !isTrainee(level)) {
    docs.push(req("Annual_Review", "optional"));
  }

  if (isIndustry(setting)) {
    docs.push(req("LinkedIn_Export", "required"));
  } else if (isCommunity(setting) && isEarlyOrMid(level)) {
    docs.push(req("LinkedIn_Export", "optional"));
  }

  docs.push(req("Personal_Statement", "optional"));

  return docs;
}

export function requiredDocuments(
  level: CareerLevel | null,
  setting: PracticeSetting | null,
): OnboardingDocumentSpec[] {
  return documentRequirements(level, setting).filter((d) => d.requirement === "required");
}

export function apiEnrichmentPlan(setting: PracticeSetting | null, level: CareerLevel | null) {
  const academic = isAcademic(setting);
  const community = isCommunity(setting);
  const industry = isIndustry(setting);
  const trainee = isTrainee(level);

  return {
    pubmed_icite: !trainee || level !== "Medical Student",
    openalex: academic || level === "Resident" || level === "Fellow",
    nih_reporter: academic && !trainee,
    nppes: !trainee || level === "Resident" || level === "Fellow",
    cms_medicare: academic || community,
    cms_open_payments: academic || community || industry,
    orcid: true,
  };
}

export function deployedInstruments(
  level: CareerLevel | null,
  setting: PracticeSetting | null,
): OnboardingInstrument[] {
  const all: OnboardingInstrument[] = [
    { id: "pfi", name: "Stanford PFI", items: 16, minutes: 3, description: "Burnout, fulfillment, and self-valuation" },
    { id: "bits", name: "BITS", items: 8, minutes: 2, description: "Illegitimate tasks and invisible work burden" },
    { id: "career_aspirations", name: "Career Aspirations", items: 10, minutes: 3, description: "Tracks, goals, energizers and drainers" },
    { id: "pif", name: "PIF Scale (Tagawa)", items: 15, minutes: 3, description: "Professional identity formation stage" },
    { id: "uwes", name: "UWES-9", items: 9, minutes: 2, description: "Work engagement" },
    { id: "invisible_work", name: "Invisible Work Log", items: 5, minutes: 2, description: "Estimated weekly invisible hours by category" },
    { id: "sop", name: "SOP Score (FM only)", items: 32, minutes: 5, description: "Scope of practice breadth" },
  ];

  const include = new Set<string>();

  // All levels get PFI + Career Aspirations + PIF per spec
  include.add("pfi");
  include.add("career_aspirations");
  include.add("pif");

  if (level === "Resident" || level === "Fellow" || isEarlyOrMid(level)) {
    include.add("bits");
    include.add("uwes");
    include.add("invisible_work");
  }

  if (
    setting === "Community" &&
    level &&
    (level.includes("Early") || level.includes("Mid") || level.includes("Late"))
  ) {
    // SOP would check specialty === Family Medicine — handled at runtime
  }

  if (level === "Medical Student" || level === "Retired") {
    include.delete("bits");
    include.delete("uwes");
    include.delete("invisible_work");
  }

  return all.filter((i) => include.has(i.id));
}

export function estimatedInstrumentMinutes(level: CareerLevel | null, setting: PracticeSetting | null): number {
  return deployedInstruments(level, setting).reduce((s, i) => s + i.minutes, 0);
}

export type ReconciliationItem = {
  id: string;
  source: string;
  label: string;
  detail: string;
  status: "pending" | "confirmed" | "rejected";
  /** exact_match = CV identifier matched API row; manual_review = user must confirm */
  confidence?: "exact_match" | "manual_review" | "verified_registry";
};

export function buildReconciliationCandidates(input: {
  cvText?: string | null;
  specialty?: string | null;
  enrichmentPlan: ReturnType<typeof apiEnrichmentPlan>;
}): ReconciliationItem[] {
  const items: ReconciliationItem[] = [];
  const text = (input.cvText ?? "").toLowerCase();

  if (input.enrichmentPlan.pubmed_icite && /publication|doi|et al|journal|pmid/.test(text)) {
    items.push({
      id: "pubmed-publications",
      source: "PubMed + iCite",
      label: "Publications detected on CV",
      detail: "Verify authorship and match to your PubMed profile (common-name check).",
      status: "pending",
    });
  }
  if (input.enrichmentPlan.nih_reporter && /grant|nih|r01|k23|f32|funding/.test(text)) {
    items.push({
      id: "nih-grants",
      source: "NIH RePORTER",
      label: "Grant language detected",
      detail: "Confirm active and prior NIH awards for portfolio scoring.",
      status: "pending",
    });
  }
  if (input.enrichmentPlan.nppes) {
    items.push({
      id: "nppes-npi",
      source: "NPPES",
      label: "NPI registry lookup",
      detail: "Confirm NPI matches current practice location.",
      status: "pending",
    });
  }
  if (input.enrichmentPlan.cms_medicare && /medicare|wrvu|billing|clinical volume/.test(text)) {
    items.push({
      id: "cms-utilization",
      source: "CMS Medicare Utilization",
      label: "Clinical productivity signals",
      detail: "Supplementary wRVU benchmarking when NPI-linked data is available.",
      status: "pending",
    });
  }
  if (items.length === 0) {
    items.push({
      id: "cv-baseline",
      source: "CV parse",
      label: "CV structured extraction complete",
      detail: "No external API matches yet — confirm parsed sections look accurate.",
      status: "pending",
    });
  }
  return items;
}

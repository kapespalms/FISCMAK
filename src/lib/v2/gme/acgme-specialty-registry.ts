import appendixB from "../../../../docs/seeds/acgme/appendix_b_2024_2025.json";
import universalCompetencies from "../../../../docs/seeds/acgme/universal_core_competencies.json";
import milestoneFrameworks from "../../../../docs/seeds/acgme/milestone_frameworks.json";
import milestoneCatalog from "../../../../docs/seeds/acgme/milestone_catalog.json";
import allProgramMilestones from "../../../../docs/seeds/acgme/all_program_milestones.json";
import psychiatryMilestones from "../../../../docs/seeds/acgme/psychiatry_milestones_v2.json";

export type AcgmeSpecialtyGroup =
  | "hospital_based"
  | "medical"
  | "surgical"
  | "sponsor_institution_fellowship";

export type AcgmePrimarySpecialty = {
  name: string;
  slug: string;
  group: AcgmeSpecialtyGroup;
  subspecialties: string[];
};

export type AcgmeUniversalCompetency = {
  key: string;
  name: string;
  short_name: string;
  description: string;
};

export type AcgmeSubcompetencyLevelDescriptions = {
  level_1?: string[];
  level_2?: string[];
  level_3?: string[];
  level_4?: string[];
  level_5?: string[];
};

export type AcgmeSubcompetency = {
  id: string;
  number: number;
  name: string;
  acgme_competency_key: string;
  medhub_outpatient_form?: boolean;
  levels?: AcgmeSubcompetencyLevelDescriptions;
};

export type MilestoneFrameworkStatus = "seeded" | "catalog_only" | "universal_only";

export type MilestoneCatalogEntry = {
  slug: string;
  name: string;
  program_type: "primary" | "subspecialty";
  parent_slug: string;
  milestone_pdf_url: string;
  supplemental_guide_url: string;
  parse_status: string;
  subcompetency_count: number;
  download_errors?: { type: string; url: string; error: string }[];
  parse_errors?: string[];
};

export type MilestoneFrameworkMeta = {
  primary_slug: string;
  primary_name: string;
  status: MilestoneFrameworkStatus;
  milestone_version?: string;
  subcompetency_seed?: string;
  catalog_slug?: string;
  citation?: string;
  citation_url?: string;
  supplemental_guide_url?: string;
};

const PRIMARY_SPECIALTIES: AcgmePrimarySpecialty[] =
  appendixB.primary_specialties as AcgmePrimarySpecialty[];

const SUBSPECIALTY_TO_PRIMARY = appendixB.subspecialty_to_primary as Record<string, string>;

/** Canonical ACGME milestone/eval sponsor primary per subspecialty (Appendix B). */
export function getSubspecialtySponsorPrimary(subspecialty: string): string | null {
  const normalized = normalizeToAcgmeSubspecialtyName(subspecialty);
  return normalized ? (SUBSPECIALTY_TO_PRIMARY[normalized] ?? null) : null;
}

const PRIMARY_BY_NAME = new Map(PRIMARY_SPECIALTIES.map((p) => [p.name, p]));
const PRIMARY_BY_SLUG = new Map(PRIMARY_SPECIALTIES.map((p) => [p.slug, p]));

/** Legacy onboarding labels → ACGME Appendix B canonical names */
const SPECIALTY_ALIASES: Record<string, string> = {
  "Emergency Medicine": "Emergency medicine",
  "Internal Medicine": "Internal medicine",
  "Anatomic and Clinical Pathology": "Pathology-anatomic and clinical",
  "Internal Medicine-Pediatrics": "Internal medicine/Pediatrics",
  "Radiology - Diagnostic": "Radiology-diagnostic",
  "Otolaryngology - Head and Neck Surgery": "Otolaryngology – head and neck surgery",
  "Obstetrics and Gynecology": "Obstetrics and gynecology",
  "Orthopaedic Surgery": "Orthopaedic surgery",
  "Physical Medicine and Rehabilitation": "Physical medicine and rehabilitation",
  Psychiatry: "Psychiatry",
  Pediatrics: "Pediatrics",
  Surgery: "Surgery",
  Neurology: "Neurology",
  Dermatology: "Dermatology",
  Anesthesiology: "Anesthesiology",
  "Family Medicine": "Family medicine",
  Urology: "Urology",
  Ophthalmology: "Ophthalmology",
  "Plastic Surgery": "Plastic surgery",
  "Plastic Surgery-Integrated": "Plastic surgery – integrated",
  "Colon and Rectal Surgery": "Colon and rectal surgery",
  "Neurological Surgery": "Neurological surgery",
  "Nuclear Medicine": "Nuclear medicine",
  "Radiation Oncology": "Radiation oncology",
  "Allergy and Immunology": "Allergy and immunology",
  "Child Neurology": "Child neurology",
  "Interventional Radiology": "Interventional radiology – integrated",
  "Preventive Medicine": "Public health and general preventive medicine",
  "Occupational and Environmental Medicine": "Occupational and environmental medicine",
};

const SUBSPECIALTY_ALIASES: Record<string, string> = {
  "Endocrinology, Diabetes and Metabolism": "Endocrinology, diabetes, and metabolism",
  "Pediatric Hematology-Oncology": "Pediatric hematology/oncology",
  "Hematology and Oncology": "Hematology and medical oncology",
  "Pediatric Emergency Medicine": "Pediatric emergency medicine",
  "Emergency Medical Services": "Emergency medical services",
  "Medical Toxicology": "Medical toxicology",
  "Sports Medicine": "Sports medicine",
  "Geriatric Medicine": "Geriatric medicine",
  "Hospice and Palliative Medicine": "Hospice and palliative medicine (multidisciplinary)",
  "Sleep Medicine": "Sleep medicine (multidisciplinary)",
  "Pain Medicine": "Pain medicine (multidisciplinary)",
  "Critical Care Medicine": "Critical care medicine",
  "Cardiovascular Disease": "Cardiovascular disease",
  "Clinical Cardiac Electrophysiology": "Clinical cardiac electrophysiology",
  "Interventional Cardiology": "Interventional cardiology",
  "Infectious Disease": "Infectious disease",
  "Pulmonary Disease": "Pulmonary disease",
  "Addiction Medicine": "Addiction medicine (multidisciplinary)",
  "Addiction Psychiatry": "Addiction psychiatry",
  "Child and Adolescent Psychiatry": "Child and adolescent psychiatry",
  "Consultation-Liaison Psychiatry": "Consultation-liaison psychiatry",
  "Consultation Liaison Psychiatry": "Consultation-liaison psychiatry",
  "Forensic Psychiatry": "Forensic psychiatry",
  "Geriatric Psychiatry": "Geriatric psychiatry",
  "Clinical Neurophysiology": "Clinical neurophysiology",
  "Vascular Neurology": "Vascular neurology",
  "Neurocritical Care": "Neurocritical care (multidisciplinary)",
  "Interventional Radiology": "Interventional radiology – integrated",
  "Neuroradiology": "Neuroradiology",
  "Nuclear Radiology": "Nuclear radiology",
  "Pediatric Radiology": "Pediatric radiology",
  "Female Pelvic Medicine and Reconstructive Surgery":
    "Female pelvic medicine and reconstructive surgery",
  "Gynecologic Oncology": "Gynecologic oncology",
  "Maternal-Fetal Medicine": "Maternal-fetal medicine",
  "Hand Surgery": "Hand surgery",
  "Thoracic Surgery": "Thoracic surgery",
  "Vascular Surgery": "Vascular surgery",
  "Pediatric Surgery": "Pediatric surgery",
  "Surgical Critical Care": "Surgical critical care",
  "Orthopaedic Sports Medicine": "Orthopaedic sports medicine",
  "Neonatal-Perinatal Medicine": "Neonatal-perinatal medicine",
  "Developmental-Behavioral Pediatrics": "Developmental-behavioral pediatrics",
  "Adolescent Medicine": "Adolescent medicine",
  "Pediatric Cardiology": "Pediatric cardiology",
  "Pediatric Critical Care Medicine": "Pediatric critical care medicine",
  "Pediatric Endocrinology": "Pediatric endocrinology",
  "Pediatric Gastroenterology": "Pediatric gastroenterology",
  "Pediatric Infectious Diseases": "Pediatric infectious diseases",
  "Pediatric Nephrology": "Pediatric nephrology",
  "Pediatric Pulmonology": "Pediatric pulmonology",
  "Pediatric Rehabilitation Medicine": "Pediatric rehabilitation medicine",
  "Spinal Cord Injury Medicine": "Spinal cord injury medicine",
  "Forensic Pathology": "Forensic pathology",
  "Cytopathology": "Cytopathology",
  "Blood Banking/Transfusion Medicine": "Blood banking/transfusion medicine",
  "Neuropathology": "Neuropathology",
  "Dermatopathology": "Dermatopathology (multidisciplinary)",
};

type ProgramMilestoneBundleEntry = {
  subcompetencies: AcgmeSubcompetency[];
  sources?: { milestone_pdf_url?: string; supplemental_guide_url?: string | null };
  program_type?: "primary" | "subspecialty";
  parent_slug?: string;
  specialty?: string;
  version?: string;
};

const PROGRAM_MILESTONES = allProgramMilestones.programs as Record<
  string,
  ProgramMilestoneBundleEntry
>;

const MILESTONE_CATALOG_PROGRAMS = milestoneCatalog.programs as MilestoneCatalogEntry[];
const CATALOG_BY_SLUG = new Map(MILESTONE_CATALOG_PROGRAMS.map((p) => [p.slug, p]));
const CATALOG_BY_NAME = new Map(MILESTONE_CATALOG_PROGRAMS.map((p) => [p.name.toLowerCase(), p]));

/** Hand-seeded psychiatry primary — canonical over parser output */
const SEEDED_MILESTONES: Record<string, { subcompetencies: AcgmeSubcompetency[] }> = {
  psychiatry: {
    subcompetencies: psychiatryMilestones.subcompetencies as AcgmeSubcompetency[],
  },
};

function bundledSubcompetencies(slug: string): AcgmeSubcompetency[] {
  if (slug === "psychiatry") {
    return SEEDED_MILESTONES.psychiatry.subcompetencies;
  }
  return PROGRAM_MILESTONES[slug]?.subcompetencies ?? [];
}

function slugifyProgramName(value: string): string {
  return value
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function listAcgmePrimarySpecialties(): AcgmePrimarySpecialty[] {
  return PRIMARY_SPECIALTIES;
}

export function listAcgmePrimarySpecialtyNames(): string[] {
  return PRIMARY_SPECIALTIES.map((p) => p.name).sort((a, b) => a.localeCompare(b));
}

export function listAllAcgmeProgramNames(): string[] {
  const subs = Object.keys(SUBSPECIALTY_TO_PRIMARY);
  return [...listAcgmePrimarySpecialtyNames(), ...subs].sort((a, b) => a.localeCompare(b));
}

export function getUniversalCompetencies(): AcgmeUniversalCompetency[] {
  return universalCompetencies.competencies as AcgmeUniversalCompetency[];
}

export function normalizeToAcgmePrimaryName(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (PRIMARY_BY_NAME.has(trimmed)) return trimmed;
  const alias = SPECIALTY_ALIASES[trimmed];
  if (alias && PRIMARY_BY_NAME.has(alias)) return alias;
  const lower = trimmed.toLowerCase();
  for (const p of PRIMARY_SPECIALTIES) {
    if (p.name.toLowerCase() === lower) return p.name;
  }
  return null;
}

export function normalizeToAcgmeSubspecialtyName(value: string, base?: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (SUBSPECIALTY_TO_PRIMARY[trimmed]) return trimmed;
  const alias = SUBSPECIALTY_ALIASES[trimmed];
  if (alias && SUBSPECIALTY_TO_PRIMARY[alias]) return alias;
  if (base) {
    const primary = normalizeToAcgmePrimaryName(base);
    if (primary) {
      const match = PRIMARY_BY_NAME.get(primary)?.subspecialties.find(
        (s) => s.toLowerCase() === trimmed.toLowerCase(),
      );
      if (match) return match;
    }
  }
  return null;
}

export function getPrimarySpecialty(nameOrSlug: string): AcgmePrimarySpecialty | null {
  const normalized = normalizeToAcgmePrimaryName(nameOrSlug);
  if (normalized) return PRIMARY_BY_NAME.get(normalized) ?? null;
  return PRIMARY_BY_SLUG.get(nameOrSlug) ?? null;
}

export function getPrimaryForSubspecialty(subspecialty: string): AcgmePrimarySpecialty | null {
  const normalized = normalizeToAcgmeSubspecialtyName(subspecialty);
  if (!normalized) return null;
  const primaryName = SUBSPECIALTY_TO_PRIMARY[normalized];
  return primaryName ? (PRIMARY_BY_NAME.get(primaryName) ?? null) : null;
}

export function subspecialtiesForPrimary(primaryName: string): string[] {
  const primary = getPrimarySpecialty(primaryName);
  return primary ? [...primary.subspecialties].sort((a, b) => a.localeCompare(b)) : [];
}

export function isAcgmePrimarySpecialty(value: string): boolean {
  return normalizeToAcgmePrimaryName(value) != null;
}

export function isAcgmeSubspecialtyForPrimary(base: string, subspecialty: string): boolean {
  const primary = normalizeToAcgmePrimaryName(base);
  const sub = normalizeToAcgmeSubspecialtyName(subspecialty, base);
  if (!primary || !sub) return false;
  return subspecialtiesForPrimary(primary).includes(sub);
}

export function getMilestoneFrameworkMeta(primarySlug: string): MilestoneFrameworkMeta | null {
  const fw = milestoneFrameworks.frameworks as Record<string, MilestoneFrameworkMeta>;
  return fw[primarySlug] ?? null;
}

export function getMilestoneCatalogEntry(slug: string): MilestoneCatalogEntry | null {
  return CATALOG_BY_SLUG.get(slug) ?? null;
}

export function getMilestoneCatalogForProgram(nameOrSlug: string): MilestoneCatalogEntry | null {
  const bySlug = CATALOG_BY_SLUG.get(nameOrSlug);
  if (bySlug) return bySlug;

  const trimmed = nameOrSlug.trim();
  if (!trimmed) return null;

  const byName = CATALOG_BY_NAME.get(trimmed.toLowerCase());
  if (byName) return byName;

  const sub = normalizeToAcgmeSubspecialtyName(trimmed);
  if (sub) {
    const sponsor = getPrimaryForSubspecialty(sub);
    if (sponsor) {
      const compositeSlug = `${sponsor.slug}--${slugifyProgramName(sub)}`;
      const composite = CATALOG_BY_SLUG.get(compositeSlug);
      if (composite) return composite;
    }
    const match = MILESTONE_CATALOG_PROGRAMS.find(
      (p) => p.program_type === "subspecialty" && p.name === sub,
    );
    if (match) return match;
    const slugGuess = slugifyProgramName(sub);
    const bySlugGuess = CATALOG_BY_SLUG.get(slugGuess);
    if (bySlugGuess) return bySlugGuess;
  }

  const primary = normalizeToAcgmePrimaryName(trimmed);
  if (primary) {
    const p = getPrimarySpecialty(primary);
    if (p) return CATALOG_BY_SLUG.get(p.slug) ?? null;
  }

  return null;
}

export function listAllMilestonePrograms(): MilestoneCatalogEntry[] {
  return [...MILESTONE_CATALOG_PROGRAMS];
}

export function getSpecialtySubcompetencies(primarySlug: string): AcgmeSubcompetency[] {
  return bundledSubcompetencies(primarySlug);
}

export function getSubspecialtySubcompetencies(subSlugOrName: string): AcgmeSubcompetency[] {
  const catalog = getMilestoneCatalogForProgram(subSlugOrName);
  if (catalog) {
    return bundledSubcompetencies(catalog.slug);
  }
  return bundledSubcompetencies(slugifyProgramName(subSlugOrName));
}

export function getSubspecialtyToPrimaryMap(): Readonly<Record<string, string>> {
  return SUBSPECIALTY_TO_PRIMARY;
}

export function getSubsByPrimaryRecord(): Record<string, readonly string[]> {
  const out: Record<string, readonly string[]> = {};
  for (const p of PRIMARY_SPECIALTIES) {
    out[p.name] = p.subspecialties;
  }
  return out;
}

export type AcgmeOnboardingAuditRow = {
  primary_name: string;
  slug: string;
  group: AcgmeSpecialtyGroup;
  subspecialty_count: number;
  in_onboarding: boolean;
  milestone_status: MilestoneFrameworkStatus;
  subcompetency_count: number;
};

export function auditAcgmeOnboardingCoverage(): {
  source: string;
  primary_count: number;
  subspecialty_count: number;
  seeded_framework_count: number;
  rows: AcgmeOnboardingAuditRow[];
  gaps: string[];
  milestone_seed_pending: string[];
} {
  const onboardingNames = new Set(listAcgmePrimarySpecialtyNames());
  const rows: AcgmeOnboardingAuditRow[] = PRIMARY_SPECIALTIES.map((p) => {
    const meta = getMilestoneFrameworkMeta(p.slug);
    const status: MilestoneFrameworkStatus =
      meta?.status === "seeded"
        ? "seeded"
        : meta?.status === "catalog_only"
          ? "catalog_only"
          : "universal_only";
    const subcompetencies = getSpecialtySubcompetencies(p.slug);
    return {
      primary_name: p.name,
      slug: p.slug,
      group: p.group,
      subspecialty_count: p.subspecialties.length,
      in_onboarding: onboardingNames.has(p.name),
      milestone_status: status,
      subcompetency_count: subcompetencies.length,
    };
  });

  const gaps: string[] = [];
  const milestone_seed_pending: string[] = [];

  for (const row of rows) {
    if (!row.in_onboarding) {
      gaps.push(`Primary specialty missing from onboarding: ${row.primary_name}`);
    }
    if (row.milestone_status === "universal_only") {
      milestone_seed_pending.push(row.primary_name);
    }
  }

  for (const [sub, sponsorPrimary] of Object.entries(SUBSPECIALTY_TO_PRIMARY)) {
    if (!PRIMARY_BY_NAME.has(sponsorPrimary)) {
      gaps.push(`Subspecialty orphan (no primary): ${sub}`);
      continue;
    }
    const listedUnder = PRIMARY_SPECIALTIES.some((p) => p.subspecialties.includes(sub));
    if (!listedUnder) {
      gaps.push(`Subspecialty missing from all primary lists: ${sub}`);
    }
  }

  for (const p of PRIMARY_SPECIALTIES) {
    for (const sub of p.subspecialties) {
      if (!SUBSPECIALTY_TO_PRIMARY[sub]) {
        gaps.push(`Subspecialty not in evaluation map: ${sub} (under ${p.name})`);
      }
    }
  }

  return {
    source: appendixB.source,
    primary_count: PRIMARY_SPECIALTIES.length,
    subspecialty_count: Object.keys(SUBSPECIALTY_TO_PRIMARY).length,
    seeded_framework_count: rows.filter((r) => r.milestone_status === "seeded").length,
    rows,
    gaps,
    milestone_seed_pending,
  };
}

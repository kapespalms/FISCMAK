/**
 * UH Psychiatry residency & education hub content — resident-visible, static pilot.
 * MECE structure: one residency hub (rotations + program admin), one education hub.
 */

import { UH_PSYCH_ROTATION_SECTIONS } from "@/lib/v2/programs/rotation-catalog";
import {
  getRotationOrientationPack,
  listRotationOrientationIndex,
  type RotationOrientationPack,
} from "@/lib/v2/programs/rotation-orientation";
import { getProgramBySlug } from "@/lib/v2/programs/registry";

export const UH_PSYCH_PROGRAM_SLUG = "uh-psych-cmc";

export type RotationSectionId =
  | "prior-to-rotation"
  | "overview"
  | "location"
  | "personnel"
  | "schedule"
  | "logistics"
  | "resources";

export const ROTATION_SECTION_LABELS: Record<RotationSectionId, string> = {
  "prior-to-rotation": "Prior to rotation",
  overview: "Overview",
  location: "Location",
  personnel: "Personnel",
  schedule: "Schedule",
  logistics: "Logistics",
  resources: "Resources",
};

/** Highest-traffic rotations — full content from orientation seeds. */
export const PRIORITY_ROTATION_CODES = [
  "cl",
  "capu",
  "mpu_cl",
  "va_ct6",
  "call",
  "psych_ed_uh_va",
  "outpatient_adult",
  "neurology",
] as const;

export type ResidencyPageContent = {
  slug: string;
  title: string;
  subtitle?: string;
  category: "rotation" | "admin" | "operational";
  catalogSectionId?: string;
  lastUpdated?: string;
  seeded: boolean;
  overviewText?: string;
  sections: Partial<Record<RotationSectionId, string[]>>;
  driveFiles?: Array<{ label: string; url: string }>;
};

export type ResidencyHubCategory = {
  id: string;
  title: string;
  description: string;
  pageSlugs: string[];
};

import {
  EDUCATION_CATEGORIES,
  type EducationCategory,
  type EducationDocument,
} from "@/lib/v2/programs/uh-education-manifest";

export type { EducationCategory, EducationDocument };

const ADMIN_PAGES: ResidencyPageContent[] = [
  {
    slug: "contacts-calendars",
    title: "Contacts & Calendars",
    subtitle: "Program staff, scheduling systems, and key calendars",
    category: "admin",
    seeded: true,
    overviewText:
      "Primary contacts for residency administration, plus QGenda call scheduling and MedHub evaluation calendars.",
    sections: {
      personnel: [
        "Program Director — see MedHub directory or program coordinator",
        "Program Coordinator — scheduling, MedHub, and orientation logistics",
        "Chief Resident — call switch questions and resident workflow",
        "PGY-3/4 Elective Coordinator — elective requests (see Education hub spreadsheet)",
      ],
      resources: [
        "MedHub — evaluations, curriculum objectives, portfolio entries",
        "QGenda — call schedule, switch rules, and backup assignments",
        "CMC call coverage grid — seeded from Cleveland psychiatry schedule (initials + shift only)",
        "Office calendar — daily attending assignments (CL/MPU and outpatient clinics)",
        "Full block schedule — Dashboard calendar or /app/calendar",
      ],
      logistics: [
        "Use QGenda for call switches per published rules",
        "Check office calendar before each CL/MPU day for attending assignment",
        "MedHub reminders drive evaluation and milestone deadlines",
      ],
    },
  },
  {
    slug: "clinical-skills",
    title: "Clinical Skills Verification",
    subtitle: "CSV, EPAT, and observed skills documentation",
    category: "admin",
    seeded: true,
    overviewText:
      "Structured assessment of core clinical skills (CSV) and entrustable professional activities (EPAT) per ACGME psychiatry milestones.",
    sections: {
      overview: [
        "Clinical Skills Verification (CSV) forms document observed patient encounters across core skills.",
        "EPAT assessments track entrustable activities at key transition points.",
        "Completed forms live in MedHub and support CCC and milestone discussions.",
      ],
      "prior-to-rotation": [
        "Review MedHub for pending CSV/EPAT assignments before CCC",
        "Know your preceptor and scheduled observation dates",
      ],
      resources: [
        "MedHub — Psychiatry Clinical Skills Evaluation forms",
        "MedHub — EPAT assessments and milestone tracking",
        "Program faculty guide — faculty guide to MedHub evaluations (program drive)",
      ],
    },
  },
  {
    slug: "electives",
    title: "Electives",
    subtitle: "Master catalog, request process, and enrichment tracks",
    category: "operational",
    seeded: true,
    overviewText:
      "PGY-3 and PGY-4 individualized electives. Submit requests per program timeline; see master spreadsheet in Education hub.",
    sections: {
      "prior-to-rotation": [
        "Review Master Elective Spreadsheet (Education hub)",
        "Contact PGY-3/4 elective coordinator per program deadline",
        "Affiliation paperwork for external sites as needed",
      ],
      logistics: [
        "Elective requests typically due several weeks before block start",
        "Longitudinal electives may span multiple blocks — confirm with coordinator",
        "Outpatient longitudinal clinics use separate weekly schedules",
      ],
      resources: [
        "Master Elective Spreadsheet — /app/education (Electives category)",
        "MedHub elective evaluation forms",
        "Enrichment tracks — LME, reproductive psychiatry, community fellowship (onboarding profile)",
      ],
    },
  },
];

function packToPage(pack: RotationOrientationPack): ResidencyPageContent {
  return {
    slug: pack.rotation_code,
    title: pack.service_name,
    category: pack.category === "operational" ? "operational" : "rotation",
    lastUpdated: pack.source.last_updated,
    seeded: true,
    overviewText: pack.overview,
    sections: {
      "prior-to-rotation": pack.prior_to_rotation,
      overview: pack.overview ? [pack.overview] : undefined,
      location: pack.location,
      personnel: pack.personnel,
      schedule: pack.schedule,
      logistics: pack.logistics,
      resources: pack.resources ?? pack.recommended_reading,
    },
    driveFiles: pack.source.drive_files,
  };
}

function placeholderRotationPage(code: string, serviceName: string): ResidencyPageContent {
  return {
    slug: code,
    title: serviceName,
    category: "rotation",
    seeded: false,
    overviewText: "Detailed rotation guide coming soon. Ask Coach Mak for orientation tips in the meantime.",
    sections: {
      overview: [
        "This rotation page is being migrated from the legacy resident website.",
        "Core logistics are available to Coach Mak for debrief and capture coaching.",
      ],
    },
  };
}

export function listAllResidencyPages(): ResidencyPageContent[] {
  const index = listRotationOrientationIndex();
  const rotationPages: ResidencyPageContent[] = index.map((entry) => {
    const pack = getRotationOrientationPack(entry.rotation_code);
    if (pack) return packToPage(pack);
    return placeholderRotationPage(entry.rotation_code, entry.service_name);
  });

  const codes = new Set(rotationPages.map((p) => p.slug));
  for (const code of PRIORITY_ROTATION_CODES) {
    if (!codes.has(code)) {
      const pack = getRotationOrientationPack(code);
      if (pack) rotationPages.push(packToPage(pack));
    }
  }

  return [...ADMIN_PAGES, ...rotationPages];
}

export function getResidencyPage(slug: string): ResidencyPageContent | null {
  const admin = ADMIN_PAGES.find((p) => p.slug === slug);
  if (admin) return admin;

  const pack = getRotationOrientationPack(slug);
  if (pack) return packToPage(pack);

  const indexEntry = listRotationOrientationIndex().find((e) => e.rotation_code === slug);
  if (indexEntry) {
    return placeholderRotationPage(indexEntry.rotation_code, indexEntry.service_name);
  }

  return null;
}

export function residencyHubCategories(): ResidencyHubCategory[] {
  const pages = listAllResidencyPages();
  const bySlug = new Map(pages.map((p) => [p.slug, p]));

  const catalogSections = UH_PSYCH_ROTATION_SECTIONS.filter((s) => s.id !== "overview");
  const rotationCategories: ResidencyHubCategory[] = catalogSections.map((section) => ({
    id: section.id,
    title: section.title,
    description: section.description,
    pageSlugs: section.rotationCodes.filter((code) => bySlug.has(code)),
  }));

  return [
    ...rotationCategories,
    {
      id: "program-admin",
      title: "Program admin",
      description: "Contacts, calendars, clinical skills verification, and electives process.",
      pageSlugs: ["contacts-calendars", "clinical-skills", "electives"],
    },
  ];
}

export function searchResidencyPages(query: string): ResidencyPageContent[] {
  const q = query.trim().toLowerCase();
  if (!q) return listAllResidencyPages();
  return listAllResidencyPages().filter((page) => {
    const haystack = [
      page.title,
      page.subtitle,
      page.overviewText,
      ...Object.values(page.sections).flatMap((s) => s ?? []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(q) || page.slug.includes(q);
  });
}

export { EDUCATION_CATEGORIES };

export function listAllEducationDocuments(): EducationDocument[] {
  return EDUCATION_CATEGORIES.flatMap((c) => c.documents);
}

export function searchEducationDocuments(query: string): Array<EducationDocument & { categoryId: string; categoryTitle: string }> {
  const q = query.trim().toLowerCase();
  const all = EDUCATION_CATEGORIES.flatMap((cat) =>
    cat.documents.map((doc) => ({
      ...doc,
      categoryId: cat.id,
      categoryTitle: cat.title,
    })),
  );
  if (!q) return all;
  return all.filter((doc) => {
    const haystack = [
      doc.title,
      doc.description,
      doc.filename,
      doc.subcategory,
      ...(doc.tags ?? []),
      doc.categoryTitle,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function uhPsychProgram() {
  return getProgramBySlug(UH_PSYCH_PROGRAM_SLUG);
}

export function residencyPageHref(slug: string): string {
  return `/app/residency/${slug}`;
}

export function residencySectionAnchor(sectionId: RotationSectionId): string {
  return `#${sectionId}`;
}

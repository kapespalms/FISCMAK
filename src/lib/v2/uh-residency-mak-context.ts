/**
 * Coach Mak context for UH Psychiatry residents — vocabulary, hub routes, page-aware help.
 */

import type { ResidencyPageContent, RotationSectionId } from "@/lib/v2/programs/uh-residency-content";
import { listElectiveCatalogEntries } from "@/lib/v2/programs/elective-catalog";
import {
  EDUCATION_CATEGORIES,
  listAllEducationDocuments,
  residencyPageHref,
  UH_PSYCH_PROGRAM_SLUG,
} from "@/lib/v2/programs/uh-residency-content";

/** UH/CMC psychiatry resident vocabulary — use naturally, don't lecture. */
export const UH_RESIDENT_VOCABULARY = [
  "EPAT — entrustable professional activity assessments in MedHub",
  "CSV — clinical skills verification observed encounters",
  "CAPU — child & adolescent psychiatry inpatient unit",
  "MPU — medical psychiatry unit (C-L overlap)",
  "CL — consult-liaison psychiatry at UH-CMC Lakeside",
  "VA CT6 — Wade Park VA inpatient adult psychiatry",
  "Psych ED — emergency psychiatry (UH and VA/Rainbow variants)",
  "MedHub — evaluations, milestones, portfolio, curriculum objectives",
  "QGenda — call schedule and switch rules",
  "Wade Park — VA medical center campus",
  "Walker clinic — adult outpatient residency clinic",
  "Access clinic — urgent outpatient psychiatry access",
  "Night float (NF) — inpatient coverage blocks",
  "Bridge shift — VA call handoff block for PGY-2",
  "ILP — individualized learning plan (SMART goals tied to ACGME subcompetencies)",
];

const RESIDENCY_ROUTES: Array<{ label: string; path: string }> = [
  { label: "UH Psych Hub", path: "/app/uh-psych" },
  { label: "Schedule (blocks + call)", path: "/app/schedule" },
  { label: "Education hub", path: "/app/education" },
  { label: "Contacts directory", path: "/app/contacts" },
  { label: "Call rotation guide", path: "/app/residency/call" },
  { label: "Extra duty", path: "/app/residency/extra_duty" },
  { label: "Clinical skills verification", path: "/app/residency/clinical-skills" },
  { label: "Electives catalog", path: "/app/residency/electives" },
  { label: "Consult-liaison (CL)", path: "/app/residency/cl" },
  { label: "CAPU", path: "/app/residency/capu" },
  { label: "VA inpatient (CT6)", path: "/app/residency/va_ct6" },
];

export function buildUhResidencyMakContext(input?: {
  pathname?: string | null;
  page?: ResidencyPageContent | null;
  activeSection?: RotationSectionId | null;
}): string {
  const lines: string[] = [
    "## UH Psychiatry resident coaching mode",
    `Program slug: ${UH_PSYCH_PROGRAM_SLUG}.`,
    "You are Coach Mak for University Hospitals / Case Western psychiatry residents.",
    "Use UH-specific vocabulary when helpful. Link directly to residency/education pages when answering logistics questions.",
    "Residents CAN see rotation guides on /app/residency — share relevant section links (with #anchors) when they ask about schedules, locations, personnel, or resources.",
    "",
    "### Key routes (deep-link when relevant)",
    ...RESIDENCY_ROUTES.map((r) => `- ${r.label}: ${r.path}`),
    "",
    "### Section anchors on rotation pages",
    "- Prior to rotation: #prior-to-rotation",
    "- Overview: #overview",
    "- Location: #location",
    "- Personnel: #personnel",
    "- Schedule: #schedule",
    "- Logistics: #logistics",
    "- Resources: #resources",
    "",
    "### Education hub categories",
    ...EDUCATION_CATEGORIES.map((c) => `- ${c.title}: /app/education (${c.documents.length} docs seeded)`),
    "",
    "### Elective catalog (internal summary)",
    `- ${listElectiveCatalogEntries().length} catalogued electives at /app/residency/electives — searchable table with PGY coordination block.`,
    "- Hub search also surfaces elective matches alongside rotations and education docs.",
    "- Rotation pages may show a Catalog match card when an elective row maps to that rotation_code.",
    "",
    "### Content pipeline (maintainer)",
    "- Rotation drive files: docs/seeds/uh-rotation-orientations/index.json → UI Downloads block.",
    "- Run `node scripts/sync-uh-psych-content.mjs` after adding repo PDFs (manifest only, no Drive download).",
    "- Pending Drive files shown as Content gaps on hub/electives — honest coming-soon labels for residents.",
    "",
    "### Vocabulary",
    ...UH_RESIDENT_VOCABULARY.map((v) => `- ${v}`),
  ];

  if (input?.pathname?.startsWith("/app/uh-psych") || input?.pathname?.startsWith("/app/residency")) {
    lines.push("", "### Current page", `- Path: ${input.pathname}`);
    if (input.page) {
      lines.push(`- Rotation/topic: ${input.page.title}`);
      if (input.activeSection) {
        lines.push(`- Focus section: ${input.activeSection} (${input.pathname}${input.activeSection ? `#${input.activeSection}` : ""})`);
      }
    }
  }

  if (input?.pathname?.startsWith("/app/education")) {
    lines.push("", "### Current page", "- Path: /app/education");
    lines.push(`- Available documents: ${listAllEducationDocuments().map((d) => d.title).join("; ")}`);
  }

  lines.push(
    "",
    "When suggesting a page, use markdown links like [Call schedule](/app/residency/call#schedule).",
    "For career evidence, ILP, and debriefs — continue standard FISCMAK coaching; rotation packs supplement but do not replace capture workflow.",
  );

  return lines.join("\n");
}

export function makMessageForResidencyPage(page: ResidencyPageContent): string {
  return `I'm on the ${page.title} page in the UH residency hub. What should I know before this rotation, and where on this page should I look?`;
}

export function makMessageForEducationCategory(categoryTitle: string): string {
  return `Help me find the right resource in ${categoryTitle} on the psychiatry education hub.`;
}

export const RESIDENCY_MAK_CHIPS = [
  {
    id: "call-schedule",
    label: "Call schedule help",
    message: "Where do I find my call schedule and switch rules at UH psychiatry?",
  },
  {
    id: "current-rotation",
    label: "Prep for rotation",
    message: "What should I review before my current rotation? Link me to the right residency page sections.",
  },
  {
    id: "education-landmark",
    label: "Find a reading",
    message: "Help me find a landmark article or core reading on the education hub.",
  },
  {
    id: "patient-handout",
    label: "Patient handout",
    message: "I need a patient handout or community resource — what is available on the education hub?",
  },
] as const;

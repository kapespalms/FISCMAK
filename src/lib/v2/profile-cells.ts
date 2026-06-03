/**
 * Profile on-ramp helpers — Phase 1a.
 *
 * Maps the 32 CV item types to their primary lattice cell so a manually added
 * item can have evidence_unit + evidence_cell_weights created automatically.
 * Cells are derived from the canonical rank matrix (docs/domain_skill_rank_matrix.json):
 * primary cell = top-ranked skill for the item's home domain.
 *
 * SKILLS axis (skill_index 0–7):
 *   0 Clinical Expertise · 1 Medical Knowledge · 2 Practice-Based Learning
 *   3 Communication · 4 Professionalism & Ethics · 5 Systems Thinking
 *   6 Collaboration & Teamwork · 7 Personal & Professional Development
 *
 * DOMAINS axis (domain_index 0–7):
 *   0 Clinician · 1 Educator · 2 Researcher · 3 Administrator/Leader
 *   4 Advocate · 5 Innovator · 6 Quality/Safety · 7 Wellness Champion
 */

import type { CvItemType } from "@/lib/v2/output-studio-bank";

export type ItemCell = {
  skill_index: number;
  domain_index: number;
  /** All manually-entered CV items are OV: physician-documented, positive energy. */
  recognition_quadrant: "OV";
};

export const ITEM_TYPE_CELL_MAP: Record<CvItemType, ItemCell> = {
  // ── Publications → Researcher (2), Medical Knowledge (1) ──────────────
  "CV-PUB-ORIG": { skill_index: 1, domain_index: 2, recognition_quadrant: "OV" },
  "CV-PUB-REV":  { skill_index: 1, domain_index: 2, recognition_quadrant: "OV" },
  "CV-PUB-CASE": { skill_index: 1, domain_index: 2, recognition_quadrant: "OV" },
  "CV-PUB-CHAP": { skill_index: 1, domain_index: 2, recognition_quadrant: "OV" },
  "CV-PUB-EDIT": { skill_index: 1, domain_index: 2, recognition_quadrant: "OV" },
  "CV-PUB-ABS":  { skill_index: 1, domain_index: 2, recognition_quadrant: "OV" },

  // ── Presentations → Educator (1), Communication (3) ───────────────────
  "CV-PRES-NATL": { skill_index: 3, domain_index: 1, recognition_quadrant: "OV" },
  "CV-PRES-REG":  { skill_index: 3, domain_index: 1, recognition_quadrant: "OV" },
  "CV-PRES-INST": { skill_index: 3, domain_index: 1, recognition_quadrant: "OV" },
  // Invited presentations lean more scholarly (Researcher)
  "CV-PRES-INV":  { skill_index: 1, domain_index: 2, recognition_quadrant: "OV" },
  // Posters are scholarship output → Researcher
  "CV-PRES-POST": { skill_index: 1, domain_index: 2, recognition_quadrant: "OV" },

  // ── Teaching → Educator (1), Communication (3) ────────────────────────
  "CV-TEACH-UME": { skill_index: 3, domain_index: 1, recognition_quadrant: "OV" },
  "CV-TEACH-GME": { skill_index: 3, domain_index: 1, recognition_quadrant: "OV" },
  "CV-TEACH-CME": { skill_index: 3, domain_index: 1, recognition_quadrant: "OV" },
  // Curriculum development → Practice-Based Learning
  "CV-CURR":      { skill_index: 2, domain_index: 1, recognition_quadrant: "OV" },
  "CV-CURR-MAT":  { skill_index: 2, domain_index: 1, recognition_quadrant: "OV" },
  // Mentorship → Collaboration & Teamwork
  "CV-MENTOR":    { skill_index: 6, domain_index: 1, recognition_quadrant: "OV" },

  // ── Research & Funding → Researcher (2), Medical Knowledge (1) ────────
  "CV-RES-PROJ": { skill_index: 1, domain_index: 2, recognition_quadrant: "OV" },
  "CV-GRANT":    { skill_index: 1, domain_index: 2, recognition_quadrant: "OV" },

  // ── QI → Quality/Safety (6), Practice-Based Learning (2) ─────────────
  "CV-QI": { skill_index: 2, domain_index: 6, recognition_quadrant: "OV" },

  // ── Service & Leadership → Administrator/Leader (3), Systems Thinking (5)
  "CV-COMM-INST": { skill_index: 5, domain_index: 3, recognition_quadrant: "OV" },
  "CV-COMM-NATL": { skill_index: 5, domain_index: 3, recognition_quadrant: "OV" },
  "CV-LEAD":      { skill_index: 5, domain_index: 3, recognition_quadrant: "OV" },
  // Peer review / advocacy → Advocate (4)
  "CV-PEER":      { skill_index: 4, domain_index: 4, recognition_quadrant: "OV" },
  "CV-ADVOCACY":  { skill_index: 5, domain_index: 4, recognition_quadrant: "OV" },

  // ── Recognition & Membership ──────────────────────────────────────────
  "CV-AWARD": { skill_index: 4, domain_index: 0, recognition_quadrant: "OV" }, // Clinician, Professionalism
  "CV-MEDIA": { skill_index: 3, domain_index: 1, recognition_quadrant: "OV" }, // Educator, Communication
  "CV-MEM":   { skill_index: 4, domain_index: 4, recognition_quadrant: "OV" }, // Advocate, Professionalism

  // ── Education & Credentials → Clinician (0) ───────────────────────────
  "CV-DEG":   { skill_index: 7, domain_index: 0, recognition_quadrant: "OV" }, // PPD
  "CV-LIC":   { skill_index: 0, domain_index: 0, recognition_quadrant: "OV" }, // Clinical Expertise
  "CV-CERT":  { skill_index: 0, domain_index: 0, recognition_quadrant: "OV" },
  "CV-SKILL": { skill_index: 7, domain_index: 0, recognition_quadrant: "OV" }, // PPD
};

export function cellForItemType(type: CvItemType): ItemCell {
  return ITEM_TYPE_CELL_MAP[type];
}

// ---------------------------------------------------------------------------
// Section definitions — used by profile page and API routes
// ---------------------------------------------------------------------------

export type ProfileSection = {
  id: string;
  title: string;
  types: CvItemType[];
  /** Hint shown on the empty-state CTA */
  emptyLabel: string;
};

export const PROFILE_SECTIONS: ProfileSection[] = [
  {
    id: "experience",
    title: "Experience",
    types: ["CV-LEAD", "CV-COMM-INST", "CV-COMM-NATL"],
    emptyLabel: "Capture a leadership or committee role",
  },
  {
    id: "education",
    title: "Education & Credentials",
    types: ["CV-DEG", "CV-LIC", "CV-CERT", "CV-SKILL"],
    emptyLabel: "Add a degree, license, or certification",
  },
  {
    id: "publications",
    title: "Publications",
    types: ["CV-PUB-ORIG", "CV-PUB-REV", "CV-PUB-CASE", "CV-PUB-CHAP", "CV-PUB-EDIT", "CV-PUB-ABS"],
    emptyLabel: "Add a publication or abstract",
  },
  {
    id: "presentations",
    title: "Presentations",
    types: ["CV-PRES-NATL", "CV-PRES-REG", "CV-PRES-INST", "CV-PRES-POST", "CV-PRES-INV"],
    emptyLabel: "Add a presentation or poster",
  },
  {
    id: "teaching",
    title: "Teaching",
    types: ["CV-TEACH-UME", "CV-TEACH-GME", "CV-TEACH-CME", "CV-CURR", "CV-CURR-MAT", "CV-MENTOR"],
    emptyLabel: "Capture a teaching activity or curriculum contribution",
  },
  {
    id: "research",
    title: "Research & QI",
    types: ["CV-RES-PROJ", "CV-GRANT", "CV-QI"],
    emptyLabel: "Add a research project, grant, or QI initiative",
  },
  {
    id: "service",
    title: "Service & Leadership",
    types: ["CV-PEER", "CV-ADVOCACY"],
    emptyLabel: "Capture a peer review role, committee, or advocacy work",
  },
  {
    id: "recognition",
    title: "Recognition",
    types: ["CV-AWARD", "CV-MEDIA", "CV-MEM"],
    emptyLabel: "Add an award, media mention, or membership",
  },
];

// Human-readable labels for each item type
export const ITEM_TYPE_LABELS: Record<CvItemType, string> = {
  "CV-DEG":       "Degree",
  "CV-LIC":       "License",
  "CV-CERT":      "Certification",
  "CV-SKILL":     "Skill",
  "CV-PUB-ORIG":  "Original Research Article",
  "CV-PUB-REV":   "Review Article",
  "CV-PUB-CASE":  "Case Report",
  "CV-PUB-CHAP":  "Book Chapter",
  "CV-PUB-EDIT":  "Editorial",
  "CV-PUB-ABS":   "Abstract",
  "CV-PRES-NATL": "National Presentation",
  "CV-PRES-REG":  "Regional Presentation",
  "CV-PRES-INST": "Institutional Presentation",
  "CV-PRES-POST": "Poster",
  "CV-PRES-INV":  "Invited Talk",
  "CV-TEACH-UME": "Undergraduate Medical Education",
  "CV-TEACH-GME": "Graduate Medical Education",
  "CV-TEACH-CME": "Continuing Medical Education",
  "CV-CURR":      "Curriculum Development",
  "CV-CURR-MAT":  "Curriculum Materials",
  "CV-MENTOR":    "Mentorship",
  "CV-RES-PROJ":  "Research Project",
  "CV-GRANT":     "Grant",
  "CV-QI":        "Quality Improvement",
  "CV-COMM-INST": "Institutional Committee",
  "CV-COMM-NATL": "National Committee",
  "CV-PEER":      "Peer Review",
  "CV-LEAD":      "Leadership Role",
  "CV-ADVOCACY":  "Advocacy",
  "CV-MEDIA":     "Media / Press",
  "CV-AWARD":     "Award / Honor",
  "CV-MEM":       "Membership",
};

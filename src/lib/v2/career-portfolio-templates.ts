/**
 * Physician career portfolio — cumulative living document by career stage.
 * Stages are cumulative; earlier elements remain relevant for promotion and legacy docs.
 */

import {
  normalizeCareerNarrativeStage,
  type CareerNarrativeStageId,
} from "@/lib/v2/career-narrative-templates";

export type CareerPortfolioStageId = CareerNarrativeStageId;

export type PortfolioItemDef = {
  id: string;
  label: string;
  hint?: string;
};

export type PortfolioDomainDef = {
  id: string;
  title: string;
  items: PortfolioItemDef[];
};

export type CareerPortfolioStageDef = {
  id: CareerPortfolioStageId;
  label: string;
  focus: string;
  domains: PortfolioDomainDef[];
};

export type CrossCuttingElementDef = {
  id: string;
  title: string;
  description: string;
};

export const PORTFOLIO_DESIGN_PRINCIPLES = [
  "Stages are cumulative — earlier portfolio elements stay relevant for promotion and legacy documentation",
  "Early stages emphasize personal competency; later stages emphasize impact through others (mentees, programs, institutions)",
  "Legacy stage supports succession planning, knowledge transfer, and institutional memory",
  "Adapt to institutional promotion criteria and specialty-specific milestones",
];

function item(domainId: string, label: string, hint?: string): PortfolioItemDef {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 48);
  return { id: `${domainId}__${slug}`, label, hint };
}

function domain(id: string, title: string, labels: Array<string | { label: string; hint?: string }>): PortfolioDomainDef {
  return {
    id,
    title,
    items: labels.map((l) =>
      typeof l === "string" ? item(id, l) : item(id, l.label, l.hint),
    ),
  };
}

export const CAREER_PORTFOLIO_STAGES: CareerPortfolioStageDef[] = [
  {
    id: "med_student",
    label: "Medical Student",
    focus: "Foundation building & exploration",
    domains: [
      domain("ms_clinical", "Clinical Development", [
        "Core clerkship evaluations and narrative feedback",
        "Clinical skills milestones (history, physical exam, clinical reasoning)",
        "Procedures log with competency attestations",
        "Step/board exam scores and study plans",
      ]),
      domain("ms_scholarly", "Academic & Scholarly Activity", [
        "Research experiences (basic science, clinical, QI)",
        "Abstracts, posters, and publications",
        "Case reports or literature reviews",
      ]),
      domain("ms_identity", "Professional Identity Formation", [
        "Personal statement and evolving career goals",
        "Specialty exploration activities and mentorship log",
        "Leadership roles (student government, interest groups, community orgs)",
        "Volunteer and service-learning experiences",
      ]),
      domain("ms_teaching", "Teaching", [
        "Peer tutoring or near-peer teaching",
        "Teaching evaluations (if available)",
      ]),
      domain("ms_wellness", "Wellness & Reflection", [
        "Reflective narratives on formative clinical experiences",
        "Wellness strategies and self-care plan",
      ]),
    ],
  },
  {
    id: "resident",
    label: "Resident",
    focus: "Clinical competency & specialization",
    domains: [
      domain("res_clinical", "Clinical Development", [
        "Milestone evaluations mapped to ACGME competencies",
        "Case and procedure logs with progressive autonomy documentation",
        "In-training exam scores and improvement trajectory",
        "Multisource (360°) feedback summaries",
        "Patient outcomes or quality metrics (if tracked)",
      ]),
      domain("res_scholarly", "Academic & Scholarly Activity", [
        "Research projects (ongoing and completed)",
        "Publications, presentations, and grants",
        "Quality improvement or patient safety projects",
        "Journal club participation and critical appraisal skills",
      ]),
      domain("res_teaching", "Teaching & Education", [
        "Teaching roles (medical students, junior residents, allied health)",
        "Teaching evaluations and feedback",
        "Curriculum development contributions",
      ]),
      domain("res_leadership", "Leadership & Service", [
        "Committee memberships (residency, hospital, professional society)",
        "Chief resident or leadership roles",
        "Advocacy or community engagement",
      ]),
      domain("res_profdev", "Professional Development", [
        "Board preparation plan and timeline",
        "Fellowship or career planning with mentor input",
        "Conferences attended and key takeaways",
        "Networking log (mentors, sponsors, collaborators)",
      ]),
      domain("res_wellness", "Wellness & Reflection", [
        "Burnout self-assessment and mitigation strategies",
        "Reflections on critical incidents and professional growth",
      ]),
    ],
  },
  {
    id: "fellow",
    label: "Fellow",
    focus: "Subspecialty expertise & independent practice preparation",
    domains: [
      domain("fel_clinical", "Clinical Development", [
        "Subspecialty-specific case and procedure logs",
        "Competency committee evaluations",
        "Independent decision-making milestones",
        "Complication tracking and M&M participation",
      ]),
      domain("fel_scholarly", "Academic & Scholarly Activity", [
        "Primary research projects and mentored scholarship",
        "Grant applications (internal and external)",
        "Publications (first-author, collaborative)",
        "National/international presentations",
        "Focused research niche or clinical expertise area",
      ]),
      domain("fel_teaching", "Teaching & Education", [
        "Formal teaching (didactics, simulation, bedside)",
        "Mentorship of residents and students",
        "Curriculum or educational resource development",
      ]),
      domain("fel_leadership", "Leadership & Professional Service", [
        "Professional society involvement and committee work",
        "Institutional committee participation",
        "Emerging national reputation in area of focus",
      ]),
      domain("fel_career", "Career Planning", [
        "Academic vs. clinical vs. hybrid track decision",
        "Job search portfolio (CV, cover letter, personal statement)",
        "Contract negotiation preparation",
        "Practice-building strategy",
      ]),
    ],
  },
  {
    id: "early_attending",
    label: "Early-Career Attending (Years 1–7)",
    focus: "Establishing practice, reputation & promotion",
    domains: [
      domain("ea_clinical", "Clinical Practice", [
        "Clinical volume, case mix, and complexity metrics",
        "Patient satisfaction scores and trends",
        "Quality and safety metrics (complications, readmissions, outcomes)",
        "New program or service line development",
        "Referral network development",
      ]),
      domain("ea_scholarly", "Academic & Scholarly Productivity", [
        "Publication record with citation metrics",
        "Funded grants (PI, Co-PI, Co-I) — amounts and sources",
        "Invited lectures and visiting professorships",
        "Editorial board memberships or peer review activity",
      ]),
      domain("ea_teaching", "Teaching & Mentorship", [
        "Formal teaching roles and evaluations",
        "Mentees (students, residents, fellows) and their outcomes",
        "Course or clerkship directorship",
        "Educational scholarship (publications, innovations)",
      ]),
      domain("ea_leadership", "Leadership & Service", [
        "Institutional committee leadership",
        "Professional society roles (local, regional, national)",
        "Hospital or departmental leadership positions",
        "Community outreach and advocacy",
      ]),
      domain("ea_promotion", "Promotion & Advancement", [
        "Promotion criteria tracking (mapped to institutional requirements)",
        "Annual faculty development plan with chair/mentor",
        "External letters of support cultivation",
        "Documentation of regional/national recognition",
      ]),
      domain("ea_wellness", "Wellness & Sustainability", [
        "Work-life integration strategies",
        "Financial planning milestones",
        "Burnout monitoring and proactive interventions",
      ]),
    ],
  },
  {
    id: "mid_career",
    label: "Mid-Career Attending (Years 8–20)",
    focus: "Amplifying impact, leadership & legacy planning",
    domains: [
      domain("mc_clinical", "Clinical Excellence", [
        "Outcomes data benchmarked against national standards",
        "Innovation in clinical practice (techniques, protocols, pathways)",
        "Multidisciplinary program leadership",
        "Expert consultation and complex case reputation",
      ]),
      domain("mc_scholarly", "Academic Impact", [
        "H-index and evolving citation profile",
        "Major grant funding (R01, U-series, foundation, industry)",
        "Landmark or practice-changing publications",
        "Guideline committee participation or authorship",
        "Textbook chapters or editorship",
      ]),
      domain("mc_teaching", "Teaching & Mentorship — Multiplier Effect", [
        "Mentee tracking: career outcomes of former trainees",
        "Fellowship or residency program directorship",
        "National educational leadership (board examiner, test committee)",
        "Enduring educational materials or curricula",
      ]),
      domain("mc_leadership", "Leadership & Institutional Impact", [
        "Division chief, vice-chair, center director, or equivalent",
        "Hospital-wide committee or governance leadership",
        "Professional society leadership (board, president-elect, task force)",
        "Health policy or advocacy leadership",
      ]),
      domain("mc_strategy", "Strategic Career Management", [
        "Endowed chair or professorship pursuit",
        "National award nominations and recognition",
        "Speaking circuit and thought leadership platform",
        "Industry relationships and consulting (with COI management)",
        "Sabbatical or renewal planning",
      ]),
      domain("mc_giving_back", "Giving Back", [
        "Sponsorship of junior faculty (active advocacy, not just mentorship)",
        "Diversity, equity, and inclusion initiatives",
        "Pipeline programs for underrepresented trainees",
      ]),
    ],
  },
  {
    id: "legacy_attending",
    label: "Legacy Attending (Years 20+)",
    focus: "Wisdom transfer, institutional memory & lasting impact",
    domains: [
      domain("leg_clinical", "Clinical Legacy", [
        "Lifetime clinical outcomes and career case volume",
        "Named procedures, techniques, or clinical innovations",
        "Practice transition and succession planning",
        "Emeritus or consultative clinical roles",
      ]),
      domain("leg_scholarly", "Academic Legacy", [
        "Career publication and citation summary",
        "Landmark contributions to the field",
        "Mentorship tree: multi-generational academic descendants",
        "Named lectures, awards, and honorary degrees",
        "Oral history or career narrative for institutional archives",
      ]),
      domain("leg_teaching", "Teaching & Mentorship Legacy", [
        "Senior mentorship and mentor-of-mentors role",
        "Grand rounds, keynote, and commencement addresses",
        "Endowed lectureship or teaching award establishment",
        "Written reflections or essays on career lessons",
      ]),
      domain("leg_institutional", "Leadership & Institutional Legacy", [
        "Governance and advisory board roles (emeritus)",
        "Philanthropic engagement and endowment development",
        "Institutional history and culture stewardship",
        "Professional society lifetime achievement and honorary memberships",
      ]),
      domain("leg_transition", "Transition & Retirement Planning", [
        "Phased retirement strategy",
        "Knowledge transfer plan for clinical programs and research",
        "Post-retirement roles (consulting, writing, board service, global health)",
        {
          label: "Personal legacy statement: what I want to be remembered for",
          hint: "Connect earliest motivations to lasting impact",
        },
      ]),
      domain("leg_reflection", "Reflection & Wisdom", [
        "Career retrospective: pivotal decisions, failures, and lessons",
        "Advice to the next generation (written or recorded)",
        "Personal wellness and identity beyond medicine",
      ]),
    ],
  },
];

export const CROSS_CUTTING_PORTFOLIO_ELEMENTS: CrossCuttingElementDef[] = [
  {
    id: "cross_cv",
    title: "Curriculum Vitae",
    description: "Updated annually; tailored versions for different purposes",
  },
  {
    id: "cross_personal_statement",
    title: "Personal Statement",
    description: "Evolves at each stage to reflect growth and vision",
  },
  {
    id: "cross_mentorship_map",
    title: "Mentorship Map",
    description: "Mentors, sponsors, coaches, and peer advisors at each stage",
  },
  {
    id: "cross_network",
    title: "Professional Network",
    description: "Key collaborators, referral partners, and allies",
  },
  {
    id: "cross_credentials",
    title: "Certifications & Licensure",
    description: "Board certification, MOC, state licenses, DEA, privileges",
  },
  {
    id: "cross_cme",
    title: "CME & Lifelong Learning",
    description: "Conferences, courses, self-directed learning, MOC activities",
  },
  {
    id: "cross_awards",
    title: "Awards & Honors",
    description: "Chronological log with context and significance",
  },
  {
    id: "cross_media",
    title: "Media & Public Engagement",
    description: "Interviews, op-eds, social media, podcasts, public education",
  },
  {
    id: "cross_financial",
    title: "Financial Milestones",
    description: "Loan repayment, disability/life insurance, retirement planning",
  },
  {
    id: "cross_wellness",
    title: "Wellness Dashboard",
    description: "Annual self-check on burnout, satisfaction, and purpose",
  },
];

export type PortfolioItemState = {
  checked?: boolean;
  notes?: string;
  updated_at?: string;
};

export function getPortfolioStageDef(
  stageId: CareerPortfolioStageId,
): CareerPortfolioStageDef {
  return CAREER_PORTFOLIO_STAGES.find((s) => s.id === stageId) ?? CAREER_PORTFOLIO_STAGES[0]!;
}

export function normalizeCareerPortfolioStage(input?: string | null): CareerPortfolioStageId {
  return normalizeCareerNarrativeStage(input);
}

export function allPortfolioItemsForStage(stageId: CareerPortfolioStageId): PortfolioItemDef[] {
  return getPortfolioStageDef(stageId).domains.flatMap((d) => d.items);
}

export function portfolioItemById(itemId: string): PortfolioItemDef | undefined {
  for (const stage of CAREER_PORTFOLIO_STAGES) {
    for (const domainDef of stage.domains) {
      const found = domainDef.items.find((i) => i.id === itemId);
      if (found) return found;
    }
  }
  return CROSS_CUTTING_PORTFOLIO_ELEMENTS.find((c) => c.id === itemId)
    ? { id: itemId, label: CROSS_CUTTING_PORTFOLIO_ELEMENTS.find((c) => c.id === itemId)!.title }
    : undefined;
}

export function portfolioCompletion(
  stageId: CareerPortfolioStageId,
  items: Record<string, PortfolioItemState>,
  crossCutting: Record<string, PortfolioItemState>,
): number {
  const stageItems = allPortfolioItemsForStage(stageId);
  const crossIds = CROSS_CUTTING_PORTFOLIO_ELEMENTS.map((c) => c.id);
  const total = stageItems.length + crossIds.length;
  if (!total) return 0;
  let done = 0;
  for (const i of stageItems) {
    if (items[i.id]?.checked || items[i.id]?.notes?.trim()) done += 1;
  }
  for (const id of crossIds) {
    if (crossCutting[id]?.checked || crossCutting[id]?.notes?.trim()) done += 1;
  }
  return Math.round((done / total) * 100);
}

export function assemblePortfolioSummary(input: {
  stageId: CareerPortfolioStageId;
  items: Record<string, PortfolioItemState>;
  crossCutting: Record<string, PortfolioItemState>;
}): string {
  const stage = getPortfolioStageDef(input.stageId);
  const lines: string[] = [
    `Career Portfolio — ${stage.label}`,
    `Focus: ${stage.focus}`,
    "",
  ];

  for (const domainDef of stage.domains) {
    lines.push(`## ${domainDef.title}`);
    for (const itemDef of domainDef.items) {
      const state = input.items[itemDef.id];
      const mark = state?.checked ? "[x]" : "[ ]";
      const note = state?.notes?.trim();
      lines.push(`${mark} ${itemDef.label}${note ? `\n    ${note}` : ""}`);
    }
    lines.push("");
  }

  lines.push("## Cross-Cutting Elements (All Stages)");
  for (const cross of CROSS_CUTTING_PORTFOLIO_ELEMENTS) {
    const state = input.crossCutting[cross.id];
    const mark = state?.checked ? "[x]" : "[ ]";
    const note = state?.notes?.trim();
    lines.push(`${mark} ${cross.title} — ${cross.description}${note ? `\n    ${note}` : ""}`);
  }

  return lines.join("\n");
}

export function buildCareerPortfolioMakContext(input: {
  stageId: CareerPortfolioStageId;
  domainTitle?: string;
}): string {
  const stage = getPortfolioStageDef(input.stageId);
  const domainNote = input.domainTitle ? `Current domain: ${input.domainTitle}.` : "";
  return `Career portfolio — ${stage.label}. Focus: ${stage.focus}.
${domainNote}
Design principles: ${PORTFOLIO_DESIGN_PRINCIPLES.join(" ")}
Help physician capture evidence, metrics, and narrative notes for each item — not just check boxes.
Stages are cumulative; earlier elements remain relevant for promotion and legacy.
Connect items to Career Data vault evidence when available. Never cite internal framework names.`;
}

export function cumulativeStagesUpTo(stageId: CareerPortfolioStageId): CareerPortfolioStageDef[] {
  const order = CAREER_PORTFOLIO_STAGES.map((s) => s.id);
  const idx = order.indexOf(stageId);
  if (idx < 0) return [getPortfolioStageDef(stageId)];
  return CAREER_PORTFOLIO_STAGES.slice(0, idx + 1);
}

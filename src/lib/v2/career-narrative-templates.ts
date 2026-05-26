/**
 * Career narrative templates — stage × track × application type.
 * Covers medical student through legacy attending; powers wizard + Mak.
 */

import { normalizeCareerLevel, type CareerLevel } from "@/lib/v2/onboarding-options";
import {
  assembleFullPersonalStatement,
  buildPersonalStatementMakContext,
  buildSpecialtyPromptLines,
  getPersonalStatementSections,
  personalStatementSectionById,
  prefillPersonalStatementSection,
  resolveSpecialtyGuide,
} from "@/lib/v2/personal-statement-templates";

export type CareerNarrativeStageId =
  | "med_student"
  | "resident"
  | "fellow"
  | "early_attending"
  | "mid_career"
  | "legacy_attending";

export type CareerNarrativeTrackId =
  | "clinician_scientist"
  | "clinician_educator"
  | "clinician_administrator"
  | "clinical_innovator";

export type CareerNarrativeApplicationId =
  | "promotion"
  | "grant"
  | "job"
  | "award"
  | "training_personal_statement"
  | "dei"
  | "leadership_vision";

export type CareerNarrativeSection = {
  id: string;
  title: string;
  subtitle: string;
  targetWords: number;
  prompts: string[];
  placeholder: string;
};

export type CareerNarrativeStageDefinition = {
  id: CareerNarrativeStageId;
  label: string;
  purpose: string;
  sections: CareerNarrativeSection[];
};

export type CareerNarrativeTrackDefinition = {
  id: CareerNarrativeTrackId;
  label: string;
  coreIdentity: string;
  committeeLookFor: string[];
  stageNotes: Partial<Record<CareerNarrativeStageId, string[]>>;
  sampleFraming?: string;
};

export type CareerNarrativeApplicationDefinition = {
  id: CareerNarrativeApplicationId;
  label: string;
  audience: string;
  voice: string;
  principles: string[];
  structureNotes: string[];
};

export const CAREER_NARRATIVE_STAGES: CareerNarrativeStageDefinition[] = [
  {
    id: "med_student",
    label: "Medical Student",
    purpose: "Residency applications, scholarship essays, personal statements",
    sections: [
      {
        id: "origin_story",
        title: "Opening — Origin Story",
        subtitle: "1–2 paragraphs",
        targetWords: 250,
        prompts: [
          "What drew you to medicine — the moment, experience, or value that ignited commitment",
          "How your background (cultural, academic, personal) shapes your perspective",
          "Avoid clichés; start with a specific moment when possible",
        ],
        placeholder:
          "The moment that clarified my path to medicine was… My background in [context] shapes how I approach…",
      },
      {
        id: "growth_discovery",
        title: "Body — Growth & Discovery",
        subtitle: "2–3 paragraphs",
        targetWords: 400,
        prompts: [
          "Clinical experience: a patient encounter or rotation that confirmed or redirected specialty interest",
          "Research or QI: why it mattered, not just what you did",
          "Leadership and service: student orgs, community health, mentorship, advocacy",
          "Challenges and resilience: obstacles and what they taught you",
        ],
        placeholder:
          "During [rotation/experience], I learned… My research in [area] mattered because…",
      },
      {
        id: "vision",
        title: "Closing — Vision",
        subtitle: "1 paragraph",
        targetWords: 150,
        prompts: [
          "What kind of physician do you want to become?",
          "Connect past experiences to future goals specifically and authentically",
        ],
        placeholder:
          "I aim to become a physician who… The experiences above prepare me to…",
      },
    ],
  },
  {
    id: "resident",
    label: "Resident",
    purpose: "Fellowship applications, award nominations, early faculty positions",
    sections: [
      {
        id: "professional_identity",
        title: "Opening — Professional Identity",
        subtitle: "1–2 paragraphs",
        targetWords: 250,
        prompts: [
          "How residency shaped your identity as a physician",
          "Clinical philosophy or approach that defines you",
          "Anchor in specialty choice and what drives daily work",
        ],
        placeholder:
          "Residency in [specialty] has shaped me into a physician who… My daily work is driven by…",
      },
      {
        id: "developing_expertise",
        title: "Body — Developing Expertise",
        subtitle: "2–3 paragraphs",
        targetWords: 400,
        prompts: [
          "Clinical growth: evolving skills and judgment — use a specific case",
          "Scholarly activity: research, publications, QI — your role and impact",
          "Teaching and mentorship: philosophy and experience with learners",
          "Leadership: chief resident, committees, curriculum, advocacy",
        ],
        placeholder:
          "My clinical judgment has evolved through… Scholarly work includes… I teach by…",
      },
      {
        id: "trajectory",
        title: "Closing — Trajectory",
        subtitle: "1 paragraph",
        targetWords: 150,
        prompts: [
          "Fellowship goals or early career vision",
          "Link to skills and values developed in training",
        ],
        placeholder:
          "My next step is… because the skills I've developed in residency prepare me to…",
      },
    ],
  },
  {
    id: "fellow",
    label: "Fellow",
    purpose: "Faculty applications, K-awards, promotion packets",
    sections: [
      {
        id: "niche_mission",
        title: "Opening — Niche & Mission",
        subtitle: "1–2 paragraphs",
        targetWords: 250,
        prompts: [
          "Define your subspecialty niche and the clinical or scientific question that drives you",
          "How training trajectory led to this focus",
        ],
        placeholder:
          "My work centers on [niche] and the question of [clinical/scientific problem]…",
      },
      {
        id: "building_portfolio",
        title: "Body — Building a Portfolio",
        subtitle: "2–3 paragraphs",
        targetWords: 450,
        prompts: [
          "Clinical expertise: procedural skills, patient population, innovation",
          "Research arc: early questions → current projects → future aims; funding and mentorship",
          "Education: curricula developed, teaching awards, educational scholarship",
          "Professional development: societies, national presentations, peer review, networks",
        ],
        placeholder:
          "Clinically, I focus on… My research program addresses… Education contributions include…",
      },
      {
        id: "independent_vision",
        title: "Closing — Independent Vision",
        subtitle: "1 paragraph",
        targetWords: 175,
        prompts: [
          "3–5 year plan as independent clinician-scientist, educator, or clinical leader",
          "Be specific about what you will build",
        ],
        placeholder:
          "Over the next five years, I will build [specific program/lab/clinical initiative]…",
      },
    ],
  },
  {
    id: "early_attending",
    label: "Early-Career Attending (Years 1–7)",
    purpose: "Promotion to Associate Professor, grants, leadership opportunities",
    sections: [
      {
        id: "establishing_brand",
        title: "Opening — Establishing Your Brand",
        subtitle: "1–2 paragraphs",
        targetWords: 250,
        prompts: [
          "Professional identity in one sentence (e.g., clinician-educator focused on…)",
          "How your work addresses an unmet need in your field or institution",
        ],
        placeholder:
          "I am a [track identity] focused on [niche]. My work addresses [unmet need] by…",
      },
      {
        id: "demonstrating_impact",
        title: "Body — Demonstrating Impact",
        subtitle: "3–4 paragraphs",
        targetWords: 550,
        prompts: [
          "Clinical impact: practice, outcomes, program development, QI — quantify when possible",
          "Scholarship: publications, funding, trajectory — highlight independent role",
          "Education: courses directed, mentees, curricula, innovations",
          "Service and leadership: institutional, regional, national — influence on policy or culture",
          "Collaboration: interdisciplinary or multi-institutional partnerships",
        ],
        placeholder:
          "Clinical impact includes… Scholarship focuses on… I direct… Service contributions…",
      },
      {
        id: "growth_trajectory",
        title: "Closing — Growth Trajectory",
        subtitle: "1 paragraph",
        targetWords: 175,
        prompts: [
          "Where your career is headed in 5–10 years",
          "What you will build, lead, or change",
        ],
        placeholder:
          "Over the next decade, I will [build/lead/change]…",
      },
    ],
  },
  {
    id: "mid_career",
    label: "Mid-Career Attending (Years 8–20)",
    purpose: "Promotion to Full Professor, endowed positions, named lectureships",
    sections: [
      {
        id: "thematic_arc",
        title: "Opening — Thematic Arc",
        subtitle: "1–2 paragraphs",
        targetWords: 250,
        prompts: [
          "Career as a cohesive arc — throughline connecting clinical, scholarship, education, leadership",
          "How focus has evolved or deepened over time",
        ],
        placeholder:
          "Over [years], my career has centered on [throughline], evolving from… to…",
      },
      {
        id: "sustained_excellence",
        title: "Body — Sustained Excellence & Influence",
        subtitle: "3–4 paragraphs",
        targetWords: 550,
        prompts: [
          "National/international reputation: guidelines, editorial boards, invited lectures, society leadership",
          "Scholarship: most cited or practice-changing work; cumulative research impact",
          "Mentorship legacy: who you've trained and where they are now",
          "Clinical leadership: programs built, divisions led, innovations at scale",
          "Institutional citizenship: strategic planning, DEI, culture change",
        ],
        placeholder:
          "My national contributions include… Most impactful scholarship… Mentees now lead…",
      },
      {
        id: "expanding_influence",
        title: "Closing — Expanding Influence",
        subtitle: "1 paragraph",
        targetWords: 175,
        prompts: [
          "Next chapter: policy, advocacy, global health, or institutional transformation",
        ],
        placeholder:
          "The next chapter leverages my expertise to [broader impact]…",
      },
    ],
  },
  {
    id: "legacy_attending",
    label: "Legacy Attending (Years 20+)",
    purpose: "Distinguished professorships, lifetime achievement, emeritus applications",
    sections: [
      {
        id: "defining_contribution",
        title: "Opening — Defining Contribution",
        subtitle: "1–2 paragraphs",
        targetWords: 250,
        prompts: [
          "Single most important contribution to your field or institution",
          "Values and principles that guided your career from the beginning",
        ],
        placeholder:
          "The contribution I am most proud of is… Throughout my career, I have been guided by…",
      },
      {
        id: "career_in_review",
        title: "Body — Career in Review",
        subtitle: "3–4 paragraphs",
        targetWords: 550,
        prompts: [
          "Field-shaping impact: how your work changed practice, training, or understanding",
          "Mentorship tree: careers of trainees and how influence multiplied",
          "Institutional legacy: programs, centers, cultures that endure",
          "Evolution: navigating change in medicine — technology, paradigms, populations",
          "Wisdom: what you know now that you wish you'd known earlier",
        ],
        placeholder:
          "My work changed [field/practice] by… The educators and clinicians I've trained now…",
      },
      {
        id: "enduring_mission",
        title: "Closing — The Enduring Mission",
        subtitle: "1 paragraph",
        targetWords: 175,
        prompts: [
          "Ongoing contributions — emeritus work, advisory roles, writing, advocacy",
          "Legacy you hope to leave",
        ],
        placeholder:
          "What remains to be done includes… I hope my legacy will be…",
      },
    ],
  },
];

export const CAREER_NARRATIVE_TRACKS: CareerNarrativeTrackDefinition[] = [
  {
    id: "clinician_scientist",
    label: "Clinician-Scientist",
    coreIdentity:
      "I am a physician-scientist whose research in [area] aims to [specific goal], improving [patient outcome / disease understanding].",
    committeeLookFor: [
      "Coherent research arc — not disconnected projects",
      "Increasing independence (mentored → independent funding)",
      "Translation of research into clinical impact",
      "Protected time justification and productivity",
    ],
    stageNotes: {
      med_student: [
        "Emphasize the question that captivated you, not just the lab",
        "Describe mentor relationship and scientific process learned",
        "Frame research as a calling — why you must ask this question",
      ],
      resident: [
        "Observation that sparked inquiry → mentor's lab → early results",
        "Explain why this question requires a career, not a rotation",
      ],
      fellow: [
        "Transition from mentored to semi-independent work",
        "Research aims connecting to a larger program; pilot data or K-award plans",
        "Include Research Program Blueprint: Aim 1 (near-term), Aim 2 (mid-term), Aim 3 (long-term), funding strategy",
      ],
      early_attending: [
        "Research arc with beginning, middle, projected end",
        "K-award → R01 transition; quantify publications, citations, h-index",
        "Delineate independent vs. collaborative contributions clearly",
      ],
      mid_career: [
        "Cumulative program impact on the field",
        "Sustained funding, multi-site trials, study section leadership",
        "Training next generation of physician-scientists",
      ],
      legacy_attending: [
        "Body of work summary; trainees running independent labs",
        "2–3 discoveries that will outlast active career",
        "Role sustaining the physician-scientist pipeline",
      ],
    },
    sampleFraming:
      "During residency I observed that patients with [condition] experienced [outcome], yet no mechanistic explanation existed. That led me to investigate [question] — work that became a career, not a rotation.",
  },
  {
    id: "clinician_educator",
    label: "Clinician-Educator",
    coreIdentity:
      "I am a clinician-educator dedicated to [educational focus], using [methods] to improve how [learners] are trained in [area].",
    committeeLookFor: [
      "Scholarly approach to education — not just 'I like teaching'",
      "Educational innovation, dissemination, and adoption",
      "Measurable learner outcomes",
      "Regional or national educator recognition",
    ],
    stageNotes: {
      med_student: [
        "Teaching moment that shaped identity",
        "Peer teaching, simulation, curriculum contributions",
        "Education as scholarly pursuit, not personality trait",
      ],
      resident: [
        "Redesigned teaching format with tracked learner outcomes",
        "Education done rigorously as patient safety intervention",
      ],
      fellow: [
        "Curricula developed; teaching awards and evaluations",
        "Articulate educational scholarship niche (simulation, assessment, clinical reasoning, equity)",
      ],
      early_attending: [
        "Educator's portfolio: direct teaching, curriculum, scholarship, mentorship, leadership",
        "Quantify reach — learners trained, institutions adopting curriculum",
        "Align with Educator's Portfolio categories (APA/AAMC frameworks)",
      ],
      mid_career: [
        "National influence: invited workshops, published curricula, MedEd editorial roles",
        "Adoption beyond home institution; mentorship of junior educators",
      ],
      legacy_attending: [
        "How medical education changed during your career and your role",
        "Programs and paradigms that exist because of your work",
      ],
    },
    sampleFraming:
      "Leading morning report, I noticed case discussions rarely changed ward behavior. I redesigned the format with structured feedback and tracked diagnostic accuracy — teaching, done rigorously, as patient safety.",
  },
  {
    id: "clinician_administrator",
    label: "Clinician-Administrator / Leader",
    coreIdentity:
      "I am a physician-leader who [builds/transforms/leads] [programs/systems] to improve [quality, access, equity, outcomes] for [population].",
    committeeLookFor: [
      "Progressive leadership responsibility with measurable organizational impact",
      "Strategic vision and execution",
      "Leading diverse teams through complex systems",
      "Formal leadership training (MBA, MPH, MHA, fellowships)",
    ],
    stageNotes: {
      med_student: [
        "Early leadership: org roles, advocacy, community organizing",
        "Systems-level QI or patient safety thinking",
      ],
      resident: ["Chief resident, committee chair, workflow redesign"],
      fellow: ["Program development, clinical operations, QI; leadership philosophy"],
      early_attending: [
        "Programs built or transformed with quantified impact (readmissions, satisfaction, retention)",
        "Medical director or division roles with team development",
      ],
      mid_career: [
        "Program → department → institutional leadership trajectory",
        "Strategic initiatives: DEI, digital health, crisis leadership",
      ],
      legacy_attending: [
        "Institutions and systems shaped; leaders developed",
        "Perspective on evolution of healthcare leadership",
      ],
    },
    sampleFraming:
      "As Medical Director, I led a team to redesign [process], reducing 30-day readmissions from 22% to 14% — sustainable change through culture, data, and stakeholder alignment.",
  },
  {
    id: "clinical_innovator",
    label: "Clinical Innovator / Quality-Safety Leader",
    coreIdentity:
      "I am a clinical innovator who develops and implements [technologies/processes/systems] to improve [aspect of care delivery].",
    committeeLookFor: [
      "Innovation implemented, not just conceived",
      "Measurable outcomes, efficiency, or safety improvement",
      "Dissemination beyond home institution",
      "Collaboration with engineering, informatics, or industry",
    ],
    stageNotes: {
      med_student: ["Clinical problem identified and solution piloted; QI methodology exposure"],
      resident: ["PDSA, Lean, or Six Sigma projects with outcomes"],
      fellow: ["Devices, pathways, decision tools — adoption and impact metrics"],
      early_attending: [
        "Innovations with patient volume affected and outcomes improved",
        "Implementation science approach — idea to practice",
      ],
      mid_career: [
        "Scale adoption multi-institutional; failures and iterations",
        "Innovation infrastructure built at institution",
      ],
      legacy_attending: ["Training next generation of clinical innovators"],
    },
  },
];

export const CAREER_NARRATIVE_APPLICATIONS: CareerNarrativeApplicationDefinition[] = [
  {
    id: "training_personal_statement",
    label: "Training Program Personal Statement",
    audience: "Residency or fellowship selection committees",
    voice: "First person, authentic, reflective",
    principles: [
      "Authenticity over polish — show, don't tell with specific experiences",
      "Answer: Will this person thrive and contribute to our community?",
      "Avoid clichés; hook with a specific moment in the middle of the action",
    ],
    structureNotes: [
      "Opening hook → bridge to specialty → evidence of fit → future vision",
      "Close with forward momentum, returning to opening theme",
    ],
  },
  {
    id: "promotion",
    label: "Promotion Dossier",
    audience: "Institutional promotion committee, department chair, external reviewers",
    voice: "First person (check institutional norms); confident, evidence-rich",
    principles: [
      "Align with institution's promotion criteria language",
      "Distinguish independent vs. collaborative contributions",
      "Quantify everything possible",
    ],
    structureNotes: [
      "Assistant → Associate: emerging independence, signature accomplishments, trajectory",
      "Associate → Full: sustained national impact, mentorship legacy, practice-changing work",
      "Full → Endowed: field-shaping legacy, highest recognition, programs built",
    ],
  },
  {
    id: "grant",
    label: "Grant Application",
    audience: "Study section reviewers, program officers, foundation boards",
    voice: "Assertive, forward-looking, logical progression",
    principles: [
      "Convince reviewers you are the right person for this work",
      "Training → early work → current aims → future vision",
      "Address gaps honestly and briefly",
    ],
    structureNotes: [
      "K-award: training trajectory, mentorship team, path to independence, institutional commitment",
      "R01: track record, unique expertise, preliminary data — not a CV summary",
      "Foundation: human impact, passion, what funding uniquely enables",
    ],
  },
  {
    id: "job",
    label: "Job Application",
    audience: "Search committees, department chairs, division chiefs",
    voice: "First person; tailored to specific institution",
    principles: [
      "Show you understand the institution's mission and fit",
      "Be specific about what you bring and what you need",
      "Address 'why here, why now' directly",
    ],
    structureNotes: [
      "First faculty: training preparation, 3–5 year build plan, startup needs",
      "Lateral move: motivation without disparaging current institution",
      "Leadership: philosophy, vision, challenges, financial and human dimensions",
    ],
  },
  {
    id: "award",
    label: "Award Nomination",
    audience: "Award committees, society leadership, nominators",
    voice: "Third person (typically drafted for nominator); celebratory, evidence-rich",
    principles: [
      "Focus on specific award criteria",
      "Lead with single most compelling accomplishment",
      "Quantify impact with context",
    ],
    structureNotes: [
      "Teaching: specific educational impact example, learner outcomes, philosophy",
      "Research: discovery significance, citations, practice change",
      "Clinical excellence: de-identified patient story, outcomes, peer recognition",
      "Lifetime achievement: full arc, 2–3 defining contributions, mentorship tree",
    ],
  },
  {
    id: "dei",
    label: "DEI Statement",
    audience: "Search committees, promotion committees, institutional leadership",
    voice: "First person, specific and personal",
    principles: [
      "Specific actions and impact — not generic 'valuing diversity'",
      "Connect DEI work to clinical, educational, and scholarly mission",
    ],
    structureNotes: [
      "Personal foundation → actions taken → impact → future plans",
    ],
  },
  {
    id: "leadership_vision",
    label: "Leadership Vision Statement",
    audience: "Search committees for division chief, chair, dean, CMO roles",
    voice: "First person; strategic and actionable",
    principles: [
      "Demonstrate understanding of unit's current state",
      "Clear actionable vision — not vague aspirations",
      "Address people, finance, and culture",
    ],
    structureNotes: [
      "Assessment of current state → 5–10 year vision → 3–5 strategic priorities",
      "People strategy → leadership philosophy → early wins in 6–12 months",
    ],
  },
];

export const GENERAL_NARRATIVE_TIPS = [
  "Show, don't tell — specific examples and de-identified patient stories over abstract claims",
  "Quantify impact — patients served, mentees, grants, citations, curricula adopted",
  "Be authentic about challenges, pivots, and growth",
  "Tailor tone and emphasis to audience and application type",
  "Revise annually — a career narrative is a living document",
];

const STAGE_ALIASES: Record<string, CareerNarrativeStageId> = {
  "medical student": "med_student",
  med_student: "med_student",
  resident: "resident",
  fellow: "fellow",
  "early career (0–7 yr)": "early_attending",
  "early career": "early_attending",
  early_attending: "early_attending",
  "early attending": "early_attending",
  "mid-career (8–20 yr)": "mid_career",
  "mid-career": "mid_career",
  mid_career: "mid_career",
  "late career (20+ yr)": "legacy_attending",
  "late career": "legacy_attending",
  legacy_attending: "legacy_attending",
  retired: "legacy_attending",
};

const TRACK_ALIASES: Record<string, CareerNarrativeTrackId> = {
  researcher: "clinician_scientist",
  "clinician-scientist": "clinician_scientist",
  "physician-scientist": "clinician_scientist",
  educator: "clinician_educator",
  "clinician-educator": "clinician_educator",
  leader: "clinician_administrator",
  "administrator/leader": "clinician_administrator",
  "clinician-administrator": "clinician_administrator",
  innovator: "clinical_innovator",
  "quality-safety": "clinical_innovator",
  "quality/safety": "clinical_innovator",
  "clinical innovator": "clinical_innovator",
};

export function normalizeCareerNarrativeStage(input?: string | null): CareerNarrativeStageId {
  if (!input?.trim()) return "early_attending";
  const key = input.trim().toLowerCase();
  if (STAGE_ALIASES[key]) return STAGE_ALIASES[key]!;
  const normalized = normalizeCareerLevel(input);
  if (normalized === "Medical Student") return "med_student";
  if (normalized === "Resident") return "resident";
  if (normalized === "Fellow") return "fellow";
  if (normalized === "Early Career (0–7 yr)") return "early_attending";
  if (normalized === "Mid-Career (8–20 yr)") return "mid_career";
  if (normalized === "Late Career (20+ yr)" || normalized === "Retired") return "legacy_attending";
  return "early_attending";
}

export function normalizeCareerNarrativeTrack(input?: string | null): CareerNarrativeTrackId {
  if (!input?.trim()) return "clinician_educator";
  const key = input.trim().toLowerCase();
  if (TRACK_ALIASES[key]) return TRACK_ALIASES[key]!;
  return "clinician_educator";
}

export function defaultApplicationForStage(stageId: CareerNarrativeStageId): CareerNarrativeApplicationId {
  if (stageId === "med_student" || stageId === "resident" || stageId === "fellow") {
    return "training_personal_statement";
  }
  return "promotion";
}

export function getStageDefinition(stageId: CareerNarrativeStageId): CareerNarrativeStageDefinition {
  return CAREER_NARRATIVE_STAGES.find((s) => s.id === stageId) ?? CAREER_NARRATIVE_STAGES[3]!;
}

export function getTrackDefinition(trackId: CareerNarrativeTrackId): CareerNarrativeTrackDefinition {
  return CAREER_NARRATIVE_TRACKS.find((t) => t.id === trackId) ?? CAREER_NARRATIVE_TRACKS[1]!;
}

export function getApplicationDefinition(
  appId: CareerNarrativeApplicationId,
): CareerNarrativeApplicationDefinition {
  return (
    CAREER_NARRATIVE_APPLICATIONS.find((a) => a.id === appId) ??
    CAREER_NARRATIVE_APPLICATIONS[0]!
  );
}

export function resolveSectionsForContext(input: {
  stageId: CareerNarrativeStageId;
  applicationId: CareerNarrativeApplicationId;
}): CareerNarrativeSection[] {
  if (input.applicationId === "training_personal_statement") {
    return getPersonalStatementSections(input.stageId);
  }
  return getSectionsForStage(input.stageId);
}

export function getSectionsForStage(stageId: CareerNarrativeStageId): CareerNarrativeSection[] {
  return getStageDefinition(stageId).sections;
}

export function careerNarrativeSectionById(
  sectionId: string,
): CareerNarrativeSection | undefined {
  return (
    personalStatementSectionById(sectionId) ??
    CAREER_NARRATIVE_STAGES.flatMap((s) => s.sections).find((s) => s.id === sectionId)
  );
}

export function completionForCareerSection(content: string, targetWords: number): number {
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  return Math.min(100, Math.round((words / targetWords) * 100));
}

export function buildSectionPrompts(input: {
  sectionId: string;
  stageId: CareerNarrativeStageId;
  trackId: CareerNarrativeTrackId;
  applicationId: CareerNarrativeApplicationId;
  specialty?: string | null;
}): string[] {
  const section = careerNarrativeSectionById(input.sectionId);
  if (!section) return [];

  if (input.applicationId === "training_personal_statement") {
    const guide = resolveSpecialtyGuide(input.specialty);
    return [
      ...section.prompts,
      ...(guide ? buildSpecialtyPromptLines(guide) : []),
      ...PERSONAL_STATEMENT_APPLICATION_PRINCIPLES,
    ];
  }

  const track = getTrackDefinition(input.trackId);
  const app = getApplicationDefinition(input.applicationId);
  const trackNotes = track.stageNotes[input.stageId] ?? [];
  return [
    ...section.prompts,
    ...trackNotes.map((n) => `[${track.label}] ${n}`),
    ...app.principles.slice(0, 2).map((p) => `[${app.label}] ${p}`),
  ];
}

const PERSONAL_STATEMENT_APPLICATION_PRINCIPLES = [
  "[Personal statement] One narrative thread — do not summarize the CV",
  "[Personal statement] Show, don't tell — specific examples over adjectives",
];

export function prefillCareerNarrativeSection(
  sectionId: string,
  ctx: {
    stageId: CareerNarrativeStageId;
    trackId: CareerNarrativeTrackId;
    applicationId: CareerNarrativeApplicationId;
    specialty?: string;
    careerObjective?: string;
  },
): string {
  if (ctx.applicationId === "training_personal_statement") {
    return prefillPersonalStatementSection(sectionId, {
      stageId: ctx.stageId,
      specialty: ctx.specialty,
    });
  }

  const track = getTrackDefinition(ctx.trackId);
  const specialty = ctx.specialty ?? "medicine";
  const objective = ctx.careerObjective ?? "my stated career goals";

  const identityOpeners: Record<CareerNarrativeStageId, string> = {
    med_student: `My path to ${specialty} began when…`,
    resident: `Training in ${specialty} has shaped me as a physician who…`,
    fellow: `My subspecialty focus in ${specialty} centers on…`,
    early_attending: track.coreIdentity.replace("[area]", specialty).replace("[specific goal]", objective),
    mid_career: `Over my career in ${specialty}, a throughline has been…`,
    legacy_attending: `The contribution I am most proud of in ${specialty} is…`,
  };

  if (sectionId.includes("origin") || sectionId.includes("identity") || sectionId.includes("niche") || sectionId.includes("brand") || sectionId.includes("arc") || sectionId.includes("contribution")) {
    return identityOpeners[ctx.stageId];
  }
  if (sectionId.includes("vision") || sectionId.includes("trajectory") || sectionId.includes("influence") || sectionId.includes("mission")) {
    return `Looking ahead, I will ${objective}. This connects to the work described above by…`;
  }
  if (track.sampleFraming && (sectionId.includes("growth") || sectionId.includes("expertise") || sectionId.includes("portfolio") || sectionId.includes("impact") || sectionId.includes("excellence") || sectionId.includes("review"))) {
    return `${track.sampleFraming}\n\n[Adapt with your specific experiences, metrics, and outcomes.]`;
  }
  const section = careerNarrativeSectionById(sectionId);
  return section?.placeholder ?? "";
}

export function assembleFullCareerNarrative(
  stageId: CareerNarrativeStageId,
  sections: { section: string; content: string | null }[],
  applicationId: CareerNarrativeApplicationId = "promotion",
): string {
  if (applicationId === "training_personal_statement") {
    return assembleFullPersonalStatement(stageId, sections);
  }
  const defs = getSectionsForStage(stageId);
  return defs
    .map((def) => {
      const row = sections.find((s) => s.section === def.id);
      const body = row?.content?.trim() || "[Draft pending]";
      return `${def.title}\n\n${body}`;
    })
    .join("\n\n---\n\n");
}

export function buildCareerNarrativeMakContext(input: {
  stageId: CareerNarrativeStageId;
  trackId: CareerNarrativeTrackId;
  applicationId: CareerNarrativeApplicationId;
  sectionTitle?: string;
  specialty?: string | null;
}): string {
  if (input.applicationId === "training_personal_statement") {
    return buildPersonalStatementMakContext({
      stageId: input.stageId,
      specialty: input.specialty,
      sectionTitle: input.sectionTitle,
    });
  }

  const stage = getStageDefinition(input.stageId);
  const track = getTrackDefinition(input.trackId);
  const app = getApplicationDefinition(input.applicationId);
  const sectionNote = input.sectionTitle ? `Current section: ${input.sectionTitle}.` : "";

  return `Career narrative — ${stage.label} × ${track.label} × ${app.label}.
Purpose: ${stage.purpose}.
Audience: ${app.audience}. Voice: ${app.voice}.
${sectionNote}
Core identity: ${track.coreIdentity}
Track emphasis: ${track.committeeLookFor.join("; ")}
Application principles: ${app.principles.join("; ")}
General tips: ${GENERAL_NARRATIVE_TIPS.slice(0, 3).join(" ")}
Show impact not activity; quantify; maintain thematic throughline (increasingly important with seniority).
Never cite framework names. One section at a time. Use physician's own language from captured reflections.`;
}

export function inferCareerNarrativeStageFromLevel(level?: CareerLevel | string | null): CareerNarrativeStageId {
  return normalizeCareerNarrativeStage(level ?? undefined);
}

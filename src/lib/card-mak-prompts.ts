import type { MakFlowIntent } from "@/lib/mak-sections";
import type { MakFlowTouchpoint } from "@/components/layout/AppShell";

export type MakDiscussConfig = {
  intent: MakFlowIntent;
  question: string;
  label?: string;
  navigateTo?: string;
  touchpoint?: MakFlowTouchpoint;
  goalFlow?: "set" | "modify";
  goalModifyId?: string;
  /** Sent automatically after Mak opens (e.g. quarterly review kickoff). */
  autoMessage?: string;
  /** Open Mak and send message without resetting to a flow greeting. */
  messageOnly?: boolean;
};

export function makDiscuss(
  intent: MakFlowIntent,
  question: string,
  overrides?: Partial<Omit<MakDiscussConfig, "intent" | "question">>,
): MakDiscussConfig {
  return { intent, question, ...overrides };
}

/** Subjective — Career Perspective metrics */
export const SUBJECTIVE_MAK = {
  career_direction: makDiscuss(
    "discuss",
    "I'd like to talk about my career direction — my track and 3-year objective.",
  ),
  professional_fulfillment: makDiscuss(
    "discuss",
    "Help me reflect on my professional fulfillment and what would improve it.",
  ),
  work_strain: makDiscuss(
    "discuss",
    "I want to discuss work-related strain and what's contributing to it.",
  ),
  task_alignment: makDiscuss(
    "discuss",
    "Let's review my task alignment — what work fits my role versus what doesn't.",
  ),
  work_engagement: makDiscuss(
    "discuss",
    "I'd like to discuss my work engagement and energy for my current track.",
  ),
  unrecognized_work: makDiscuss(
    "discuss",
    "Help me estimate and discuss unrecognized work that may not show on my CV.",
  ),
  career_alignment: makDiscuss(
    "assess",
    "Walk me through my career alignment score and what would improve it.",
  ),
  trends: makDiscuss(
    "discuss",
    "What longitudinal trends should I watch across my career perspective metrics?",
  ),
  intro: makDiscuss(
    "discuss",
    "I'm ready to begin my Career Perspective assessment with you.",
  ),
} as const;

/** Objective — Career Data */
export const OBJECTIVE_MAK = {
  vault: makDiscuss(
    "review",
    "Walk me through my Career Data vault — what's verified and what might be missing.",
  ),
  vaultSection: (label: string) =>
    makDiscuss("review", `Tell me about my ${label} in the Career Data vault.`),
  reconcile: makDiscuss(
    "review",
    "Help me reconcile enrichment items I'm unsure about.",
  ),
  activities: makDiscuss(
    "capture",
    "Help me capture career evidence that might not appear on my CV.",
    { navigateTo: "/app/objective?tab=activities" },
  ),
  documents: makDiscuss(
    "upload",
    "Help me understand which documents to upload and how they feed my Career Data.",
    { navigateTo: "/app/objective?tab=documents&upload=1" },
  ),
} as const;

/** Assessment — Career Profile */
export const ASSESSMENT_MAK = {
  overview: makDiscuss(
    "assess",
    "Give me an overview of my career profile and what stands out.",
  ),
  career_pattern: makDiscuss(
    "assess",
    "Explain my career pattern and what it means for my next steps.",
  ),
  coherence: makDiscuss(
    "assess",
    "What does my coherence score mean, and how can I improve it?",
  ),
  service_citizenship: makDiscuss(
    "assess",
    "Discuss my service citizenship index and opportunities to broaden impact.",
  ),
  unrecognized_work: makDiscuss(
    "assess",
    "Help me identify unrecognized work that my profile may be missing.",
  ),
  touchpoints: makDiscuss(
    "assess",
    "Which touchpoints should we explore next in conversation?",
  ),
  touchpoint: (number: number, title: string) =>
    makDiscuss("assess", `Let's discuss Touchpoint ${number}: ${title}.`),
  strengths: makDiscuss(
    "assess",
    "Walk me through my strengths and opportunities from the career profile.",
  ),
  recognition_gaps: makDiscuss(
    "assess",
    "Help me close the gaps between what we've discussed and what's on my CV.",
  ),
} as const;

/** Plan — Career Strategy */
export const PLAN_MAK = {
  goal: (label: string, title: string, goalModifyId: string) =>
    makDiscuss(
      "plan",
      `Let's refine my ${label} goal: "${title}".`,
      { goalFlow: "modify", goalModifyId },
    ),
  review: makDiscuss(
    "plan",
    "Let's review milestone progress on my three career goals this quarter.",
    { touchpoint: "quarterly", autoMessage: "Begin quarterly goal review." },
  ),
  setup: makDiscuss(
    "plan",
    "Walk me through setting up my Development, Maintenance, and Sustainability goals.",
    { goalFlow: "set", autoMessage: "Begin Development Goal" },
  ),
  editGoal: makDiscuss(
    "plan",
    "Help me refine the goal fields I'm editing — title, milestones, and timeline.",
    { navigateTo: "/app/plan" },
  ),
} as const;

/** Output — Career Documents */
export const OUTPUT_MAK = {
  career_data_source: makDiscuss(
    "create",
    "How should I use my Career Data when drafting this document?",
    { navigateTo: "/app/output" },
  ),
  promotion_readiness: makDiscuss(
    "create",
    "Discuss my promotion readiness — strengths, gaps, and timeline.",
    { navigateTo: "/app/output" },
  ),
  template: (name: string) =>
    makDiscuss(
      "create",
      `Help me draft or update my ${name}. What should we focus on first?`,
      { navigateTo: "/app/output" },
    ),
  evidence: makDiscuss(
    "create",
    "Help me choose the best career evidence to cite in this document.",
    { navigateTo: "/app/output" },
  ),
  version_history: makDiscuss(
    "create",
    "Help me compare document versions and decide what to keep.",
    { navigateTo: "/app/output" },
  ),
  promotion_section: (section: string) =>
    makDiscuss(
      "create",
      `Help me draft the ${section} section of my promotion narrative.`,
      { navigateTo: "/app/output" },
    ),
} as const;

/** Jobs */
export const JOBS_MAK = {
  overview: makDiscuss(
    "plan",
    "Help me interpret my job matches and which roles fit my career strategy.",
    { navigateTo: "/app/plan?tab=jobs" },
  ),
  role: (title: string, institution: string, matchScore: number) =>
    makDiscuss(
      "plan",
      `Discuss this role with me: ${title} at ${institution} (${matchScore}% match). Is it a good fit?`,
      { navigateTo: "/app/plan?tab=jobs" },
    ),
} as const;

/** Pathways — specialty career tracks */
export const PATHWAYS_MAK = {
  overview: makDiscuss(
    "plan",
    "Help me compare career pathways for my specialty and choose a direction that fits my goals.",
    { navigateTo: "/app/plan?tab=pathways" },
  ),
  pathway: (pathwayType: string, description: string) =>
    makDiscuss(
      "plan",
      `Discuss the ${pathwayType} pathway with me: ${description || "How does this track fit my career strategy?"}`,
      { navigateTo: "/app/plan?tab=pathways" },
    ),
} as const;

/** Touchpoint panels */
export const TOUCHPOINT_MAK = {
  annual: makDiscuss(
    "discuss",
    "I'm ready for my annual career refresh with Coach Mak.",
    { touchpoint: "annual", autoMessage: "Begin annual refresh." },
  ),
  quarterly: makDiscuss(
    "discuss",
    "I'm ready for my quarterly pulse check-in with Coach Mak.",
    { touchpoint: "quarterly", autoMessage: "Begin quarterly check-in." },
  ),
} as const;

/** Career Map lattice */
export const LATTICE_MAK = {
  overview: makDiscuss(
    "review",
    "Help me interpret my Career Map — domains, tracks, and gaps.",
    { navigateTo: "/app/objective?tab=lattice" },
  ),
} as const;

/** Account pages */
export const PROFILE_MAK = {
  context: makDiscuss(
    "discuss",
    "Help me review and update my career profile context — specialty, phase, and goals.",
    { navigateTo: "/app/profile" },
  ),
} as const;

export const SETTINGS_MAK = {
  privacy: makDiscuss(
    "discuss",
    "Explain my data privacy options and what my institution can see.",
    { navigateTo: "/app/settings" },
  ),
} as const;

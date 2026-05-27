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
  /** Output Studio document type — loads user-uploaded template for Mak */
  outputTemplateType?: string;
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
  rotationDebrief: (rotationName?: string) =>
    makDiscuss(
      "rotation_debrief",
      rotationName
        ? `I'd like to debrief my ${rotationName} rotation while it's fresh.`
        : "I'd like to debrief a rotation I just finished.",
      { navigateTo: "/app/objective?tab=activities" },
    ),
  rotationTouchpoint: (title: string) =>
    makDiscuss(
      "rotation_debrief",
      title,
      {
        navigateTo: "/app/dashboard",
        autoMessage: "__rotation_touchpoint__",
      },
    ),
  narrativeAnchor: makDiscuss(
    "narrative_anchor",
    "Help me set my narrative anchor — specialty direction, origin story, and what I want to contribute.",
    { navigateTo: "/app/subjective" },
  ),
  personalStatementArc: makDiscuss(
    "personal_statement_arc",
    "Help me build my personal statement from experiences I've captured — hook, origin, journey, and vision.",
    { navigateTo: "/app/output" },
  ),
  fellowshipMining: makDiscuss(
    "fellowship_mining",
    "Help me sharpen my fellowship narrative — subspecialty niche, scholarly thread, and defining moments.",
    { navigateTo: "/app/subjective" },
  ),
  careerTranslation: makDiscuss(
    "career_translation",
    "Help me translate a clinical experience into outsider language for my career pivot.",
    { navigateTo: "/app/objective?tab=activities" },
  ),
  documents: makDiscuss(
    "upload",
    "Help me understand which documents to upload and how they feed my Career Data.",
    { navigateTo: "/app/documents?upload=1" },
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
    "Which career check-ins should we explore next in conversation?",
  ),
  touchpoint: (_number: number, title: string) =>
    makDiscuss("assess", `Let's discuss ${title}.`),
  strengths: makDiscuss(
    "assess",
    "Walk me through my strengths and opportunities from the career profile.",
  ),
  recognition_gaps: makDiscuss(
    "assess",
    "Help me close the gaps between what we've discussed and what's on my CV.",
  ),
  growExploration: makDiscuss(
    "grow_exploration",
    "Help me explore career direction before I commit — what's possible and the smallest step to test.",
    { navigateTo: "/app/subjective", autoMessage: "__grow_exploration__" },
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
  boardAwareness: makDiscuss(
    "board_awareness",
    "Help me map my Career Board — mentor, sponsor, coach, and connector — and find gaps.",
    { navigateTo: "/app/plan", autoMessage: "__board_awareness__" },
  ),
  boardBuilding: makDiscuss(
    "board_building",
    "Help me find or connect with someone for a specific Board role — mentor, sponsor, coach, or connector.",
    { navigateTo: "/app/plan", autoMessage: "__board_building__" },
  ),
  growExploration: makDiscuss(
    "grow_exploration",
    "Help me explore career direction before I commit — what good looks like and the smallest step to test.",
    { navigateTo: "/app/plan", autoMessage: "__grow_exploration__" },
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
    "promotion_readiness",
    "Run my promotion readiness audit — strengths, gaps, and timeline across all five domains.",
    { navigateTo: "/app/assessment" },
  ),
  promotion_context: makDiscuss(
    "promotion_context",
    "Help me set up my promotion context — institution, track, timeline, and mentor feedback.",
    { navigateTo: "/app/profile" },
  ),
  promotion_dossier: makDiscuss(
    "promotion_dossier",
    "Help me build my promotion career narrative section by section.",
    { navigateTo: "/app/output" },
  ),
  impact_translation: makDiscuss(
    "impact_translation",
    "Help me translate a recent activity into promotion-ready impact language.",
    { navigateTo: "/app/objective?tab=activities" },
  ),
  career_pivot_onboarding: makDiscuss(
    "career_pivot_onboarding",
    "Help me clarify my career direction — what energizes me, my strengths, and paths that fit before I pick a role.",
    { navigateTo: "/app/subjective", autoMessage: "__career_pivot_onboarding__" },
  ),
  pivot_quarterly: makDiscuss(
    "pivot_quarterly",
    "Begin path-specific quarterly capture for my career pivot.",
    { navigateTo: "/app/subjective", autoMessage: "__pivot_quarterly__" },
  ),
  pivot_narrative: makDiscuss(
    "pivot_narrative",
    "Help me build my pivot cover letter — bridge, credential, translation, catalyst, and vision.",
    { navigateTo: "/app/output" },
  ),
  career_translation: makDiscuss(
    "career_translation",
    "Translate a clinical experience into outsider language for my resume or portfolio.",
    { navigateTo: "/app/objective?tab=activities" },
  ),
  identity_navigation: makDiscuss(
    "identity_navigation",
    "Help me navigate the identity side of my career transition — what I'm carrying forward and what I'm moving toward.",
    { navigateTo: "/app/subjective", autoMessage: "__identity_navigation__" },
  ),
  template: (name: string, templateType?: string) =>
    makDiscuss(
      "create",
      `Help me draft or update my ${name}. What should we focus on first?`,
      { navigateTo: "/app/output", outputTemplateType: templateType },
    ),
  user_template: (templateType: string, name: string, hasSeed: boolean) =>
    makDiscuss(
      "create",
      hasSeed
        ? `I'm seeding my ${name} from an existing document. Help me fill it section by section using my Career Data — keep my headings and structure.`
        : `Help me draft my ${name}. I can pick a document from Career Data or upload a template — what do you recommend?`,
      { navigateTo: "/app/output", outputTemplateType: templateType },
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
  promotion_section: (section: string, trackLabel?: string) =>
    makDiscuss(
      "create",
      trackLabel
        ? `Help me draft the "${section}" section of my ${trackLabel} promotion narrative. Focus on impact and metrics, not activity lists. Mirror institutional promotion criteria.`
        : `Help me draft the ${section} section of my promotion narrative.`,
      { navigateTo: "/app/output" },
    ),

  career_narrative_section: (section: string, stageLabel: string, trackLabel: string) =>
    makDiscuss(
      "personal_statement_arc",
      `Help me draft the "${section}" section of my career narrative as a ${stageLabel} on the ${trackLabel} track. Show impact with specific examples and metrics. Maintain a coherent throughline — not a CV rehash.`,
      { navigateTo: "/app/output" },
    ),
  academic_document_section: (documentLabel: string, sectionTitle: string) =>
    makDiscuss(
      "create",
      `Help me draft the "${sectionTitle}" section of my ${documentLabel}. Use Career Data vault evidence — metrics and outcomes, not activity lists. Match the official format requirements.`,
      { navigateTo: "/app/output" },
    ),
  cover_letter_section: (stageLabel: string, sectionTitle: string) =>
    makDiscuss(
      "create",
      `Help me draft the "${sectionTitle}" section of my ${stageLabel} physician cover letter. One page total — quantify accomplishments and tailor to the specific institution and position.`,
      { navigateTo: "/app/output" },
    ),
  industry_career_section: (documentLabel: string, sectorLabel: string, sectionTitle: string) =>
    makDiscuss(
      "pivot_narrative",
      `Help me draft the "${sectionTitle}" section of my ${documentLabel} for ${sectorLabel}. Translate clinical experience into outsider language — quantified impact, not academic CV language.`,
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
  attendingQuarterly: makDiscuss(
    "attending_quarterly",
    "Begin my quarterly accomplishment capture for promotion documentation.",
    { navigateTo: "/app/subjective", autoMessage: "__attending_quarterly__" },
  ),
  attendingDeepReflection: makDiscuss(
    "attending_deep_reflection",
    "Begin my deep promotion reflection for the past year.",
    { navigateTo: "/app/subjective", autoMessage: "__attending_deep_reflection__" },
  ),
  pivotQuarterly: makDiscuss(
    "pivot_quarterly",
    "Begin path-specific quarterly capture for my career pivot.",
    { navigateTo: "/app/subjective", autoMessage: "__pivot_quarterly__" },
  ),
  identityNavigation: makDiscuss(
    "identity_navigation",
    "Help me navigate the identity side of my career transition.",
    { navigateTo: "/app/subjective", autoMessage: "__identity_navigation__" },
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
  promotionContext: makDiscuss(
    "promotion_context",
    "Help me set up my promotion context — institution, track, timeline, and mentor feedback.",
    { navigateTo: "/app/profile" },
  ),
  careerPivotOnboarding: makDiscuss(
    "career_pivot_onboarding",
    "Help me clarify my career direction — what energizes me, my strengths, and paths that fit.",
    { navigateTo: "/app/profile", autoMessage: "__career_pivot_onboarding__" },
  ),
  board: makDiscuss(
    "board_awareness",
    "Help me map my Career Board — mentor, sponsor, coach, and connector — and find gaps.",
    { navigateTo: "/app/profile", autoMessage: "__board_awareness__" },
  ),
  boardBuilding: makDiscuss(
    "board_building",
    "Help me find or connect with someone for a Board role — including cold outreach if needed.",
    { navigateTo: "/app/profile", autoMessage: "__board_building__" },
  ),
  career_portfolio: (stageLabel: string) =>
    makDiscuss(
      "discuss",
      `Help me build my career portfolio as a ${stageLabel}. Stages are cumulative — help me capture evidence, metrics, and notes for each domain, not just check boxes.`,
      { navigateTo: "/app/profile" },
    ),
  career_portfolio_domain: (domainTitle: string, stageLabel: string) =>
    makDiscuss(
      "discuss",
      `Help me document evidence for "${domainTitle}" in my ${stageLabel} career portfolio — specific metrics, outcomes, and narrative notes I can reuse for promotion or applications.`,
      { navigateTo: "/app/profile" },
    ),
  academic_dossier: (stageLabel: string) =>
    makDiscuss(
      "discuss",
      `Help me build my academic medicine dossier as a ${stageLabel}. Align with promotion criteria across clinical, research, education, and service — capture metrics and evidence, not activity lists.`,
      { navigateTo: "/app/profile" },
    ),
  academic_dossier_section: (sectionTitle: string, stageLabel: string) =>
    makDiscuss(
      "discuss",
      `Help me document the "${sectionTitle}" section of my ${stageLabel} academic dossier — specific content, metrics, and formatting appropriate for promotion or credentialing.`,
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

/** Dashboard & full calendar — scheduling with Coach Mak */
export const SCHEDULE_MAK = {
  addEvent: makDiscuss(
    "discuss",
    "Help me add events to my schedule.",
    {
      label: "+ Events",
      navigateTo: "/app/calendar",
      autoMessage: "__schedule_events__",
    },
  ),
  reviewPeriod: makDiscuss(
    "discuss",
    "Let's review my recent schedule events together.",
    {
      label: "Review schedule",
      navigateTo: "/app/dashboard",
      autoMessage: "__schedule_review__",
    },
  ),
} as const;

import {
  SOAP_TAB,
  subjectiveNavLabel,
  type SoapSectionKey,
} from "@/lib/v2/soap-tab-spec";
import {
  DASHBOARD_MECE_GREETING,
  DASHBOARD_MECE_OPTIONS,
} from "@/lib/v2/dashboard-mak-menu";

/** v3 rail sections */
export type AppSection =
  | "dashboard"
  | "lattice"
  | "wellbeing"
  | "goals"
  | "output"
  | "training"
  | "profile"
  // SOAP sections kept as internal aliases — components still reference them
  | "subjective"
  | "objective"
  | "assessment"
  | "plan";

export type MakSectionConfig = {
  greeting: string;
  quickOptions: string[];
  placeholder: string;
  mode: string;
};

export const SOAP_SECTION_NAV: {
  section: Exclude<AppSection, "dashboard">;
  href: string;
  label: string;
  shortLabel: string;
  icon: string;
  iconSize?: number;
}[] = [
  {
    section: "subjective",
    href: "/app/subjective",
    label: SOAP_TAB.subjective.nav,
    shortLabel: SOAP_TAB.subjective.nav,
    icon: "/brand/nav/subjective.png",
  },
  {
    section: "objective",
    href: "/app/objective",
    label: SOAP_TAB.objective.nav,
    shortLabel: SOAP_TAB.objective.nav,
    icon: "/brand/nav/objective.png",
  },
  {
    section: "assessment",
    href: "/app/assessment",
    label: SOAP_TAB.assessment.nav,
    shortLabel: SOAP_TAB.assessment.nav,
    icon: "/brand/nav/assessment.png",
  },
  {
    section: "plan",
    href: "/app/plan",
    label: SOAP_TAB.plan.nav,
    shortLabel: SOAP_TAB.plan.nav,
    icon: "/brand/nav/plan.png",
  },
  {
    section: "output",
    href: "/app/output",
    label: SOAP_TAB.output.nav,
    shortLabel: SOAP_TAB.output.nav,
    icon: "/brand/nav/output.png",
  },
];

export const SECTION_NAV: {
  section: AppSection;
  href: string;
  label: string;
  shortLabel: string;
  icon: string;
  iconSize?: number;
}[] = [
  {
    section: "dashboard",
    href: "/app/dashboard",
    label: "Dashboard",
    shortLabel: "Dashboard",
    icon: "/brand/nav/dashboard.png",
    iconSize: 30,
  },
  ...SOAP_SECTION_NAV,
];

export const FIVE_OPTIONS = [
  {
    id: "discuss",
    icon: "S",
    title: SOAP_TAB.subjective.title,
    subtitle: SOAP_TAB.subjective.description,
    href: "/app/subjective",
    greeting: SOAP_TAB.subjective.chatEntry,
    bg: "bg-[#E8F4F8] hover:bg-[#D1E9F0]",
    section: "subjective" as AppSection,
  },
  {
    id: "review",
    icon: "O",
    title: SOAP_TAB.objective.title,
    subtitle: SOAP_TAB.objective.description,
    href: "/app/objective?tab=activities",
    greeting: SOAP_TAB.objective.chatEntry,
    bg: "bg-[#DBEAFE] hover:bg-[#93C5FD]",
    section: "objective" as AppSection,
  },
  {
    id: "assess",
    icon: "A",
    title: SOAP_TAB.assessment.title,
    subtitle: SOAP_TAB.assessment.description,
    href: "/app/assessment",
    greeting: SOAP_TAB.assessment.chatEntry,
    bg: "bg-[#EDE9FE] hover:bg-[#D8BFD8]",
    section: "assessment" as AppSection,
  },
  {
    id: "plan",
    icon: "P",
    title: SOAP_TAB.plan.title,
    subtitle: SOAP_TAB.plan.description,
    href: "/app/plan",
    greeting: SOAP_TAB.plan.chatEntry,
    bg: "bg-[#FEF3C7] hover:bg-[#FCD34D]",
    section: "plan" as AppSection,
  },
  {
    id: "create",
    icon: "O",
    title: SOAP_TAB.output.title,
    subtitle: SOAP_TAB.output.description,
    href: "/app/output",
    greeting: SOAP_TAB.output.chatEntry,
    bg: "bg-[#FEE2E2] hover:bg-[#FECACA]",
    section: "output" as AppSection,
  },
] as const;

export const SOAP_SECTION_COLORS: Record<
  "subjective" | "objective" | "assessment" | "plan" | "output",
  string
> = {
  subjective: "#E8F4F8",
  objective: "#DBEAFE",
  assessment: "#EDE9FE",
  plan: "#FEF3C7",
  output: "#FEE2E2",
};

export const SECTION_TO_FLOW: Record<
  Exclude<AppSection, "dashboard">,
  "discuss" | "review" | "assess" | "plan" | "create"
> = {
  // v3 sections
  lattice:   "review",
  wellbeing: "discuss",
  goals:     "plan",
  output:    "create",
  training:  "discuss",
  profile:   "review",
  // SOAP aliases
  subjective: "discuss",
  objective:  "review",
  assessment: "assess",
  plan:       "plan",
};

export type MakFlowIntent =
  | "capture"
  | "upload"
  | "onboarding"
  | "rotation_debrief"
  | "narrative_anchor"
  | "personal_statement_arc"
  | "fellowship_mining"
  | "promotion_context"
  | "attending_quarterly"
  | "attending_deep_reflection"
  | "promotion_readiness"
  | "promotion_dossier"
  | "impact_translation"
  | "career_pivot_onboarding"
  | "pivot_quarterly"
  | "pivot_narrative"
  | "career_translation"
  | "identity_navigation"
  | "board_awareness"
  | "board_building"
  | "grow_exploration"
  | "si_probe"
  | "goal_horizon"
  | (typeof FIVE_OPTIONS)[number]["id"];

export const MAK_SECTION_CONFIG: Record<AppSection, MakSectionConfig> = {
  // v3 sections
  lattice: {
    greeting: "Here's your Career Lattice — patterns across competency domains and career identities.",
    quickOptions: ["Show my strongest domains", "What should I capture next?", "Open list view"],
    placeholder: "Ask about your lattice…",
    mode: "Analyst",
  },
  wellbeing: {
    greeting: "How are you doing? I can walk you through a check-in or review your trends.",
    quickOptions: ["Start a pulse check-in", "Review my FCWI", "Quarterly snapshot"],
    placeholder: "Talk about how you're doing…",
    mode: "Coach",
  },
  goals: {
    greeting: "Here are your goals across the four horizons. Let's work on what matters most.",
    quickOptions: ["Set a new goal", "Review 3-month goals", "Explore career directions"],
    placeholder: "Talk through your goals…",
    mode: "Strategist",
  },
  training: {
    greeting: "Here's your training dashboard — milestones, rotations, and CCC prep.",
    quickOptions: ["Current rotation", "Milestone check-in", "CCC prep"],
    placeholder: "Ask about your training…",
    mode: "Coach",
  },
  profile: {
    greeting: "This is your Profile — the bank made human. Add or review your career story.",
    quickOptions: ["Upload my CV", "Add an accomplishment", "Review bank items"],
    placeholder: "Ask about your profile…",
    mode: "Documenter",
  },
  dashboard: {
    greeting: DASHBOARD_MECE_GREETING,
    quickOptions: DASHBOARD_MECE_OPTIONS.map((o) => o.label),
    placeholder: "Type or click voice…",
    mode: "Coach",
  },
  subjective: {
    greeting: SOAP_TAB.subjective.chatEntry,
    quickOptions: [
      "Begin quarterly check-in",
      "Review career direction",
      "Discuss task alignment",
    ],
    placeholder: "Describe your professional trajectory…",
    mode: "Listener",
  },
  objective: {
    greeting:
      "Here's what's in your Objective data. I'll flag new items and anything needing your confirmation.",
    quickOptions: [
      "Capture activity",
      "Debrief a rotation",
      "Set narrative anchor",
      "Translate for career pivot",
      "Upload a document",
      "Review career vault",
      "Open career lattice",
    ],
    placeholder: "Describe an activity or accomplishment…",
    mode: "Documenter",
  },
  assessment: {
    greeting:
      "Here's your Insights view — career patterns, touchpoint coverage, and themes from conversation.",
    quickOptions: [
      "Summarize my career pattern",
      "Show growth opportunities",
      "What should I capture next?",
      "Advancement readiness",
    ],
    placeholder: "Reflect on your career map with Coach Mak…",
    mode: "Analyst",
  },
  plan: {
    greeting:
      "This section tracks your Strategy — Development, Maintenance, and Sustainability goals with quarterly milestones.",
    quickOptions: ["Set up with Mak", "Explore career direction", "Map my Career Board", "Edit in template"],
    placeholder: "Talk through your career strategy…",
    mode: "Strategist",
  },
  output: {
    greeting:
      "Which document would you like to work on in Output Studio? CV, biosketch, cover letter, personal statement, or career brief.",
    quickOptions: [
      "Update my CV",
      "Industry resume",
      "Pivot cover letter",
      "Draft personal statement",
      "Advancement readiness report",
    ],
    placeholder: "Describe your document need…",
    mode: "Ghostwriter",
  },
};

export const MAK_FLOW_GREETINGS: Record<MakFlowIntent, string> = {
  capture: "Let's make your work visible. What did you accomplish that might not be on your CV?",
  upload: "I'll read this and update your Career Data. One moment…",
  onboarding: "__welcome__",
  rotation_debrief: "__rotation_debrief__",
  narrative_anchor: "__narrative_anchor__",
  personal_statement_arc:
    "Let's build your personal statement from experiences you've captured — hook, origin, journey, vision. One section at a time.",
  fellowship_mining:
    "Fellowship narrative mining — we'll sharpen your subspecialty niche, scholarly thread, and defining moments.",
  promotion_context: "__promotion_context__",
  attending_quarterly: "__attending_quarterly__",
  attending_deep_reflection: "__attending_deep_reflection__",
  promotion_readiness: "__promotion_readiness__",
  promotion_dossier:
    "Let's build your promotion career narrative — identity, scholarship arc, teaching, clinical impact, service, and future direction.",
  impact_translation:
    "Let's translate something you did into promotion-ready impact language — outcomes, not just activities.",
  career_pivot_onboarding: "__career_pivot_onboarding__",
  pivot_quarterly: "__pivot_quarterly__",
  pivot_narrative:
    "Let's build your pivot narrative — bridge, credential, translation, catalyst, and vision for an outsider audience.",
  career_translation:
    "Let's translate a clinical experience into outsider language for your resume or portfolio.",
  identity_navigation: "__identity_navigation__",
  board_awareness: "__board_awareness__",
  board_building: "__board_building__",
  grow_exploration: "__grow_exploration__",
  si_probe: "__si_probe__",
  goal_horizon: "Let's set a goal for this horizon — one question at a time.",
  discuss: SOAP_TAB.subjective.chatEntry,
  review: SOAP_TAB.objective.chatEntry,
  assess: SOAP_TAB.assessment.chatEntry,
  plan: SOAP_TAB.plan.chatEntry,
  create: SOAP_TAB.output.chatEntry,
};

const LEGACY_PATH_MAP: Record<string, AppSection> = {
  "/app/lattice": "objective",
  "/app/activities": "objective",
  "/app/documents": "objective",
  "/app/goals": "plan",
  "/app/jobs": "plan",
  "/app/studio": "output",
  "/app/mak": "dashboard",
  "/app/uh-psych": "dashboard",
  "/app/residency": "dashboard",
  "/app/education": "dashboard",
  "/app/schedule": "dashboard",
  "/app/contacts": "dashboard",
  "/app/rotations": "dashboard",
  "/app/calendar": "dashboard",
};

export function sectionFromPath(pathname: string): AppSection {
  if (pathname.startsWith("/app/dashboard") || pathname === "/app") return "dashboard";
  // v3 routes — checked first
  if (pathname.startsWith("/app/lattice")) return "lattice";
  if (pathname.startsWith("/app/wellbeing")) return "wellbeing";
  if (pathname.startsWith("/app/goals")) return "goals";
  if (pathname.startsWith("/app/output")) return "output";
  if (pathname.startsWith("/app/training")) return "training";
  if (pathname.startsWith("/app/profile")) return "profile";
  if (pathname.startsWith("/app/settings")) return "profile";
  // SOAP aliases (routes redirect, but components may still call this)
  if (pathname.startsWith("/app/subjective")) return "subjective";
  if (pathname.startsWith("/app/objective")) return "objective";
  if (pathname.startsWith("/app/assessment")) return "assessment";
  if (pathname.startsWith("/app/plan")) return "plan";
  if (pathname.startsWith("/app/jobs")) return "goals";

  for (const [prefix, section] of Object.entries(LEGACY_PATH_MAP)) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return section;
    }
  }

  return "dashboard";
}

const MAK_CONTEXT_LABELS: Record<Exclude<AppSection, "subjective">, string> = {
  // v3 sections
  dashboard: "Career conversation",
  lattice:   "Career Lattice",
  wellbeing: "Well-being",
  goals:     "Goals",
  output:    "Output Studio",
  training:  "Training",
  profile:   "Profile",
  // SOAP aliases
  objective:  SOAP_TAB.objective.nav,
  assessment: SOAP_TAB.assessment.nav,
  plan:       SOAP_TAB.plan.nav,
};

export function sectionNavShortLabel(
  section: AppSection,
  displayName?: string | null,
): string {
  if (section === "subjective") return subjectiveNavLabel(displayName);
  if (section === "dashboard") return "Dashboard";
  // v3 sections
  if (section === "lattice") return "Lattice";
  if (section === "wellbeing") return "Well-being";
  if (section === "goals") return "Goals";
  if (section === "output") return "Output Studio";
  if (section === "training") return "Training";
  if (section === "profile") return "Profile";
  // SOAP aliases fallback
  const soapKey = section as SoapSectionKey;
  return SOAP_TAB[soapKey]?.nav ?? section;
}

export function makContextLabel(section: AppSection, displayName?: string | null): string {
  if (section === "subjective") return subjectiveNavLabel(displayName);
  return MAK_CONTEXT_LABELS[section];
}

export const MAK_INPUT_PLACEHOLDER = "Tell me one thing.";

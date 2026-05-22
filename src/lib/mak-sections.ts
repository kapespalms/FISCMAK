export type AppSection =
  | "dashboard"
  | "subjective"
  | "objective"
  | "assessment"
  | "plan"
  | "output";

export type MakSectionConfig = {
  greeting: string;
  quickOptions: string[];
  placeholder: string;
  mode: string;
};

export const SECTION_NAV: {
  section: AppSection;
  href: string;
  label: string;
  icon: string;
  iconSize?: number;
}[] = [
  {
    section: "dashboard",
    href: "/app/dashboard",
    label: "Dashboard",
    icon: "/brand/nav/dashboard.png",
    iconSize: 30,
  },
  {
    section: "subjective",
    href: "/app/subjective",
    label: "Subjective",
    icon: "/brand/nav/subjective.png",
  },
  {
    section: "objective",
    href: "/app/objective",
    label: "Objective",
    icon: "/brand/nav/objective.png",
  },
  {
    section: "assessment",
    href: "/app/assessment",
    label: "Assessment",
    icon: "/brand/nav/assessment.png",
  },
  {
    section: "plan",
    href: "/app/plan",
    label: "Plan",
    icon: "/brand/nav/plan.png",
  },
  {
    section: "output",
    href: "/app/output",
    label: "Output Studio",
    icon: "/brand/nav/output.png",
  },
];

export const FIVE_OPTIONS = [
  {
    id: "discuss",
    icon: "💭",
    title: "Discuss Your Energy",
    subtitle: "How are you feeling this week?",
    href: "/app/subjective",
    greeting: "How's your energy this week?",
    bg: "bg-[#E8F8E8] hover:bg-[#C0DD97]",
    section: "subjective" as AppSection,
  },
  {
    id: "review",
    icon: "📋",
    title: "Review Your Activities",
    subtitle: "What have you been doing?",
    href: "/app/objective?tab=activities",
    greeting: "Let's look at what you've been doing.",
    bg: "bg-[#DBEAFE] hover:bg-[#93C5FD]",
    section: "objective" as AppSection,
  },
  {
    id: "assess",
    icon: "🔍",
    title: "Assess Your Patterns",
    subtitle: "What's your career story?",
    href: "/app/assessment",
    greeting: "Let's talk about your patterns.",
    bg: "bg-[#F3E8FF] hover:bg-[#D8BFD8]",
    section: "assessment" as AppSection,
  },
  {
    id: "plan",
    icon: "🗺️",
    title: "Plan Your Strategy",
    subtitle: "What's your 5-year path?",
    href: "/app/plan",
    greeting: "Let's build your strategy.",
    bg: "bg-[#FEF3C7] hover:bg-[#FCD34D]",
    section: "plan" as AppSection,
  },
  {
    id: "create",
    icon: "✍️",
    title: "Create Your Outputs",
    subtitle: "What are we writing today?",
    href: "/app/output",
    greeting: "What are we writing today?",
    bg: "bg-[#FEE2E2] hover:bg-[#FECACA]",
    section: "output" as AppSection,
  },
] as const;

export const SOAP_SECTION_COLORS: Record<
  "subjective" | "objective" | "assessment" | "plan",
  string
> = {
  subjective: "#E8F8E8",
  objective: "#DBEAFE",
  assessment: "#F3E8FF",
  plan: "#FEF3C7",
};

export const DASHBOARD_OPTION_TABS = FIVE_OPTIONS.filter((o) => o.id !== "create").map(
  (option) => {
    const nav = SECTION_NAV.find((n) => n.section === option.section)!;
    return {
      id: option.id,
      href: option.href,
      label:
        option.id === "discuss"
          ? "Discuss"
          : option.id === "review"
            ? "Review"
            : option.id === "assess"
              ? "Assess"
              : "Plan",
      icon: nav.icon,
      color: SOAP_SECTION_COLORS[option.section as keyof typeof SOAP_SECTION_COLORS],
      section: option.section,
    };
  },
);

export type MakFlowIntent =
  | "capture"
  | "upload"
  | "onboarding"
  | (typeof FIVE_OPTIONS)[number]["id"];

export const MAK_SECTION_CONFIG: Record<AppSection, MakSectionConfig> = {
  dashboard: {
    greeting: "How can I help today?",
    quickOptions: [
      "Capture invisible work",
      "Discuss my energy",
      "Review my activities",
    ],
    placeholder: "Type or click voice…",
    mode: "Coach",
  },
  subjective: {
    greeting: "How's your energy this week?",
    quickOptions: ["I'm energized", "I'm drained", "I'm balanced"],
    placeholder: "Share what's affecting your energy…",
    mode: "Listener",
  },
  objective: {
    greeting: "Let's look at what you've been doing.",
    quickOptions: [
      "Log new activity",
      "Upload a document",
      "Review my lattice",
      "Find invisible work",
    ],
    placeholder: "Describe an activity or accomplishment…",
    mode: "Documenter",
  },
  assessment: {
    greeting: "Let's talk about your patterns.",
    quickOptions: [
      "Show my strengths",
      "Show my blind spots",
      "What's my career pattern?",
      "What's draining me?",
    ],
    placeholder: "Ask about patterns or signals…",
    mode: "Analyst",
  },
  plan: {
    greeting: "Let's build your strategy.",
    quickOptions: [
      "Generate outputs",
      "Plan my next move",
      "Track my progress",
      "Get promotion ready",
    ],
    placeholder: "Talk through your strategy…",
    mode: "Strategist",
  },
  output: {
    greeting: "What are we writing today?",
    quickOptions: [
      "Academic tenure",
      "Annual performance review",
      "Promotion narrative",
      "Community health impact",
    ],
    placeholder: "Describe your output goal…",
    mode: "Ghostwriter",
  },
};

export const MAK_FLOW_GREETINGS: Record<MakFlowIntent, string> = {
  capture: "Let's make your work visible. What did you do?",
  upload: "Let me read this. One moment…",
  onboarding: "__welcome__",
  discuss: "How's your energy this week?",
  review: "Let's look at what you've been doing.",
  assess: "Let's talk about your patterns.",
  plan: "Let's build your strategy.",
  create: "What are we writing today?",
};

const LEGACY_PATH_MAP: Record<string, AppSection> = {
  "/app/lattice": "objective",
  "/app/activities": "objective",
  "/app/documents": "objective",
  "/app/goals": "plan",
  "/app/studio": "output",
  "/app/mak": "dashboard",
};

export function sectionFromPath(pathname: string): AppSection {
  if (pathname.startsWith("/app/dashboard") || pathname === "/app") {
    return "dashboard";
  }
  if (pathname.startsWith("/app/subjective")) return "subjective";
  if (pathname.startsWith("/app/objective")) return "objective";
  if (pathname.startsWith("/app/assessment")) return "assessment";
  if (pathname.startsWith("/app/plan")) return "plan";
  if (pathname.startsWith("/app/output")) return "output";

  for (const [prefix, section] of Object.entries(LEGACY_PATH_MAP)) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return section;
    }
  }

  return "dashboard";
}

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
    label: "Career Perspective",
    icon: "/brand/nav/subjective.png",
  },
  {
    section: "objective",
    href: "/app/objective",
    label: "Career Data",
    icon: "/brand/nav/objective.png",
  },
  {
    section: "assessment",
    href: "/app/assessment",
    label: "Career Profile",
    icon: "/brand/nav/assessment.png",
  },
  {
    section: "plan",
    href: "/app/plan",
    label: "Career Strategy",
    icon: "/brand/nav/plan.png",
  },
  {
    section: "output",
    href: "/app/output",
    label: "Career Documents",
    icon: "/brand/nav/output.png",
  },
];

export const FIVE_OPTIONS = [
  {
    id: "discuss",
    icon: "S",
    title: "Career Perspective",
    subtitle: "Career direction, satisfaction, and task alignment",
    href: "/app/subjective",
    greeting:
      "This section captures your professional perspective — career direction, work engagement, and task alignment.",
    bg: "bg-[#E8F4F8] hover:bg-[#D1E9F0]",
    section: "subjective" as AppSection,
  },
  {
    id: "review",
    icon: "O",
    title: "Career Data",
    subtitle: "Verified data from documents and databases",
    href: "/app/objective?tab=activities",
    greeting: "This section displays verified career data from your uploaded documents and public databases.",
    bg: "bg-[#DBEAFE] hover:bg-[#93C5FD]",
    section: "objective" as AppSection,
  },
  {
    id: "assess",
    icon: "A",
    title: "Career Profile",
    subtitle: "Career Health Score and benchmarked standing",
    href: "/app/assessment",
    greeting:
      "This section synthesizes your Career Perspective and Career Data into a comprehensive Career Profile.",
    bg: "bg-[#EDE9FE] hover:bg-[#D8BFD8]",
    section: "assessment" as AppSection,
  },
  {
    id: "plan",
    icon: "P",
    title: "Career Strategy",
    subtitle: "Development, maintenance, and sustainability goals",
    href: "/app/plan",
    greeting: "This section tracks your career goals and quarterly milestones.",
    bg: "bg-[#FEF3C7] hover:bg-[#FCD34D]",
    section: "plan" as AppSection,
  },
  {
    id: "create",
    icon: "O",
    title: "Career Documents",
    subtitle: "CV, biosketch, and career briefs",
    href: "/app/output",
    greeting: "This section generates and manages your career documents.",
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

export const DASHBOARD_OPTION_TABS = FIVE_OPTIONS.filter((o) => o.id !== "create").map(
  (option) => {
    const nav = SECTION_NAV.find((n) => n.section === option.section)!;
    return {
      id: option.id,
      href: option.href,
      label:
        option.id === "discuss"
          ? "Career Perspective"
          : option.id === "review"
            ? "Career Data"
            : option.id === "assess"
              ? "Career Profile"
              : "Career Strategy",
      icon: nav.icon,
      color: SOAP_SECTION_COLORS[option.section as keyof typeof SOAP_SECTION_COLORS],
      section: option.section,
    };
  },
);

export const SECTION_TO_FLOW: Record<
  Exclude<AppSection, "dashboard">,
  "discuss" | "review" | "assess" | "plan" | "create"
> = {
  subjective: "discuss",
  objective: "review",
  assessment: "assess",
  plan: "plan",
  output: "create",
};

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
    greeting:
      "This section captures your professional perspective — career direction, work engagement, and task alignment.",
    quickOptions: [
      "Begin quarterly assessment",
      "Review task alignment",
      "Update career objective",
    ],
    placeholder: "Describe your professional trajectory…",
    mode: "Listener",
  },
  objective: {
    greeting:
      "Here's what's in your Career Data. I'll flag new items and anything needing your confirmation.",
    quickOptions: [
      "Show new items",
      "Upload a document",
      "Confirm a publication",
      "Review career vault",
    ],
    placeholder: "Describe an activity or accomplishment…",
    mode: "Documenter",
  },
  assessment: {
    greeting:
      "Here's your Career Map. I'll highlight what improved, what needs attention, and how aligned you are with your goals.",
    quickOptions: [
      "Explain my Career Health Score",
      "Show growth opportunities",
      "Career alignment check",
      "Advancement readiness",
    ],
    placeholder: "Reflect on your career map with Coach Mak…",
    mode: "Analyst",
  },
  plan: {
    greeting:
      "This section tracks your Development, Maintenance, and Sustainability goals — including milestones due this quarter.",
    quickOptions: [
      "Review goal progress",
      "Modify a goal",
      "Skill translation pathway",
      "Activate position search",
    ],
    placeholder: "Talk through your career strategy…",
    mode: "Strategist",
  },
  output: {
    greeting:
      "Which document would you like to work on? CV, biosketch, cover letter, personal statement, advancement readiness report, or career brief.",
    quickOptions: [
      "Update my CV",
      "NIH Biosketch",
      "Generate cover letter",
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
  discuss:
    "This section captures your professional perspective — career direction, work engagement, and task alignment.",
  review:
    "This section displays verified career data from your uploaded documents and public databases.",
  assess:
    "This section synthesizes your Career Perspective and Career Data into a comprehensive Career Profile.",
  plan: "This section tracks your Development, Maintenance, and Sustainability goals.",
  create:
    "This section generates and manages your career documents — CV, biosketch, cover letter, or advancement readiness report.",
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

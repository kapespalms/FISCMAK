import { SOAP_TAB } from "@/lib/v2/soap-tab-spec";
import {
  DASHBOARD_MECE_GREETING,
  DASHBOARD_MECE_OPTIONS,
} from "@/lib/v2/dashboard-mak-menu";

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
      "Upload a document",
      "Review career vault",
      "Open career lattice",
    ],
    placeholder: "Describe an activity or accomplishment…",
    mode: "Documenter",
  },
  assessment: {
    greeting:
      "Here's your Insights view — Career Map, health score, and what needs attention.",
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
      "This section tracks your Strategy — Development, Maintenance, and Sustainability goals with quarterly milestones.",
    quickOptions: ["Set up with Mak", "Edit in template"],
    placeholder: "Talk through your career strategy…",
    mode: "Strategist",
  },
  output: {
    greeting:
      "Which document would you like to work on in Output Studio? CV, biosketch, cover letter, personal statement, or career brief.",
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
};

export function sectionFromPath(pathname: string): AppSection {
  if (pathname.startsWith("/app/dashboard") || pathname === "/app") {
    return "dashboard";
  }
  if (pathname.startsWith("/app/subjective")) return "subjective";
  if (pathname.startsWith("/app/objective")) return "objective";
  if (pathname.startsWith("/app/assessment")) return "assessment";
  if (pathname.startsWith("/app/plan")) return "plan";
  if (pathname.startsWith("/app/jobs")) return "plan";
  if (pathname.startsWith("/app/output")) return "output";

  for (const [prefix, section] of Object.entries(LEGACY_PATH_MAP)) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return section;
    }
  }

  return "dashboard";
}

const MAK_CONTEXT_LABELS: Record<AppSection, string> = {
  dashboard: "Career conversation",
  subjective: SOAP_TAB.subjective.nav,
  objective: SOAP_TAB.objective.nav,
  assessment: SOAP_TAB.assessment.nav,
  plan: SOAP_TAB.plan.nav,
  output: SOAP_TAB.output.nav,
};

export function makContextLabel(section: AppSection): string {
  return MAK_CONTEXT_LABELS[section];
}

export const MAK_INPUT_PLACEHOLDER = "Tell me one thing.";

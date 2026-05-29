import type { MakFlowIntent } from "@/lib/mak-sections";

export type DashboardMeceOption = {
  id: string;
  label: string;
  intent: MakFlowIntent;
  href: string;
  message: string;
  focusInput?: boolean;
};

export const DASHBOARD_MECE_GREETING =
  "What would you like help with? Pick one, or type your question.";

/** Four mutually exclusive dashboard actions — everything else lives in top nav tabs. */
export const DASHBOARD_MECE_OPTIONS: DashboardMeceOption[] = [
  {
    id: "profile",
    label: "Review my profile",
    intent: "discuss",
    href: "/app/dashboard",
    message:
      "Walk me through my profile — track, milestones, and what to focus on next.",
  },
  {
    id: "capture",
    label: "Capture invisible work",
    intent: "capture",
    href: "/app/objective?tab=activities",
    message:
      "Help me capture work that might not be on my CV. I'll log it in Activities after we talk.",
    focusInput: true,
  },
  {
    id: "upload",
    label: "Upload a document",
    intent: "upload",
    href: "/app/objective?tab=documents&upload=1",
    message: "I want to upload a document to my career vault.",
  },
  {
    id: "goals",
    label: "Work on my goals",
    intent: "plan",
    href: "/app/plan",
    message: "Help me with my Development, Maintenance, and Sustainability goals.",
  },
];

export function findDashboardMeceOption(id: string): DashboardMeceOption | undefined {
  return DASHBOARD_MECE_OPTIONS.find((o) => o.id === id);
}

export function findDashboardMeceOptionByLabel(label: string): DashboardMeceOption | undefined {
  return DASHBOARD_MECE_OPTIONS.find(
    (o) => o.label.toLowerCase() === label.trim().toLowerCase(),
  );
}

type MakFlowStarter = (
  intent: MakFlowIntent,
  navigateTo?: string,
  customGreeting?: string,
  touchpoint?: "annual" | "quarterly",
  goalFlow?: "set" | "modify",
  goalModifyId?: string,
  autoMessage?: string,
) => void;

export function openDashboardMakMenu(startMakFlow: MakFlowStarter) {
  startMakFlow("discuss", "/app/dashboard", DASHBOARD_MECE_GREETING);
}

export function openDashboardMeceOption(
  startMakFlow: MakFlowStarter,
  optionId: string,
  focusMakInput?: () => void,
) {
  const option = findDashboardMeceOption(optionId);
  if (!option) {
    openDashboardMakMenu(startMakFlow);
    return;
  }
  startMakFlow(option.intent, option.href, option.message);
  if (option.focusInput) focusMakInput?.();
}

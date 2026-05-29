import type { OnboardingWizardStep } from "@/lib/v2/onboarding-progress";

export const ONBOARDING_OBSIDIAN = "#0B0B0C";
export const ONBOARDING_LIME = "#39FF14";

export type OnboardingMilestone = {
  id: 1 | 2 | 3;
  label: "Core Profile" | "Evidence Vault" | "AI Diagnostic";
  detail: string;
  steps: readonly OnboardingWizardStep[];
};

export const ONBOARDING_MILESTONES: readonly OnboardingMilestone[] = [
  {
    id: 1,
    label: "Core Profile",
    detail: "Verify medical specialty, licensing state, and current practice structure.",
    steps: ["welcome", "profile"],
  },
  {
    id: 2,
    label: "Evidence Vault",
    detail: "Securely drop CVs, board certifications, and historical peer reviews.",
    steps: ["documents", "reconcile"],
  },
  {
    id: 3,
    label: "AI Diagnostic",
    detail: "Initiate a brief 3-minute intake chat with Mak to map invisible career goals.",
    steps: ["instruments"],
  },
] as const;

export const INSTITUTIONAL_MILESTONE_DETAILS: Record<OnboardingMilestone["id"], string> = {
  1: "Confirm training program, PGY level, and hospital affiliation.",
  2: "Upload CV, licensing documents, and prior evaluations.",
  3: "Brief Mak intake to map competencies and invisible work.",
};

export function milestoneIndexForStep(step: string): number {
  const idx = ONBOARDING_MILESTONES.findIndex((milestone) =>
    (milestone.steps as readonly string[]).includes(step),
  );
  return idx >= 0 ? idx : 0;
}

export function milestoneDetail(milestone: OnboardingMilestone, institutional: boolean): string {
  if (institutional) {
    return INSTITUTIONAL_MILESTONE_DETAILS[milestone.id];
  }
  return milestone.detail;
}

/** First wizard step for a milestone (for back navigation). */
export function firstStepInMilestone(milestoneIndex: number): OnboardingWizardStep {
  return ONBOARDING_MILESTONES[milestoneIndex]?.steps[0] ?? "welcome";
}

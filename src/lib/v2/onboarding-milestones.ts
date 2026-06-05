import type { OnboardingWizardStep } from "@/lib/v2/onboarding-progress";

/** @deprecated use warm design tokens instead */
export const ONBOARDING_OBSIDIAN = "#0B0B0C";
/** @deprecated use warm design tokens instead */
export const ONBOARDING_LIME = "#39FF14";

export type OnboardingMilestone = {
  id: 1 | 2 | 3;
  label: string;
  subtitle: string;
  detail: string;
  steps: readonly OnboardingWizardStep[];
};

export const ONBOARDING_MILESTONES: readonly OnboardingMilestone[] = [
  {
    id: 1,
    label: "Core Profile",
    subtitle: "About you",
    detail: "Name, career stage, specialty, and how you spend your time.",
    steps: ["welcome", "profile"],
  },
  {
    id: 2,
    label: "Evidence Vault",
    subtitle: "CV & docs",
    detail: "Upload your CV or other documents — or skip and add anytime.",
    steps: ["documents", "reconcile"],
  },
  {
    id: 3,
    label: "Meet Mak",
    subtitle: "Career chat",
    detail: "A short intake conversation to personalize your career lattice.",
    steps: ["instruments"],
  },
] as const;

export const INSTITUTIONAL_MILESTONE_DETAILS: Record<OnboardingMilestone["id"], string> = {
  1: "Confirm training program, PGY level, and hospital affiliation.",
  2: "Upload CV, licensing documents, and prior evaluations — or skip and add anytime.",
  3: "A brief Mak intake to personalize your career lattice.",
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
  const milestone = ONBOARDING_MILESTONES[milestoneIndex];
  if (!milestone) return "welcome";
  if (milestoneIndex === 0 && (milestone.steps as readonly string[]).includes("profile")) {
    return "profile";
  }
  return milestone.steps[0] ?? "welcome";
}

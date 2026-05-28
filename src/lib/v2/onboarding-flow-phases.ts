import type { OnboardingStep } from "@/lib/v2/onboarding-flow-types";

export type OnboardingFlowPhaseId =
  | "join"
  | "orient"
  | "identity"
  | "records"
  | "verify"
  | "baseline";

export type OnboardingFlowPhase = {
  id: OnboardingFlowPhaseId;
  label: string;
  agenda: string;
  skippable: boolean;
  skipLabel: string;
};

export const ONBOARDING_FLOW_PHASES: OnboardingFlowPhase[] = [
  {
    id: "join",
    label: "Join",
    agenda: "Connect your account to a program or the individual physician path.",
    skippable: false,
    skipLabel: "",
  },
  {
    id: "orient",
    label: "Orient",
    agenda: "Preview what setup covers before we ask for details.",
    skippable: true,
    skipLabel: "Skip intro",
  },
  {
    id: "identity",
    label: "You",
    agenda: "Name, training level, and career direction — Mak’s foundation for coaching.",
    skippable: false,
    skipLabel: "",
  },
  {
    id: "records",
    label: "Records",
    agenda: "Your CV seeds career data and what we can verify publicly.",
    skippable: true,
    skipLabel: "Skip for now",
  },
  {
    id: "verify",
    label: "Verify",
    agenda: "Confirm only what we inferred — nothing imports without your OK.",
    skippable: true,
    skipLabel: "Skip verification",
  },
  {
    id: "baseline",
    label: "Baseline",
    agenda: "Short wellbeing check-ins with Mak (~15 min total, one question at a time).",
    skippable: true,
    skipLabel: "Do this with Mak later",
  },
];

const STEP_TO_PHASE: Record<OnboardingStep, OnboardingFlowPhaseId> = {
  path: "join",
  welcome: "orient",
  profile: "identity",
  documents: "records",
  reconcile: "verify",
  instruments: "baseline",
};

export function phaseForStep(step: OnboardingStep): OnboardingFlowPhase {
  const id = STEP_TO_PHASE[step];
  return ONBOARDING_FLOW_PHASES.find((p) => p.id === id) ?? ONBOARDING_FLOW_PHASES[0]!;
}

export const FLOW_PHASES_AFTER_JOIN: OnboardingFlowPhaseId[] = [
  "orient",
  "identity",
  "records",
  "verify",
  "baseline",
];

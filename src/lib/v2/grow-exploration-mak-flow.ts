import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";
import {
  GROW_EXPLORATION_STEPS,
  buildGrowExplorationIntro,
  type GrowExplorationContext,
} from "@/lib/v2/career-coaching-frameworks";

export type GrowExplorationSession = {
  step_index: number;
  partial: Partial<GrowExplorationContext>;
  started_at: string;
};

export type GrowFlowTurnResult = {
  meta: OnboardingMetadata;
  response: string;
  suggested_actions: { action: string; url: string }[];
  complete: boolean;
};

export function initGrowExplorationSession(meta: OnboardingMetadata): OnboardingMetadata {
  return {
    ...meta,
    grow_exploration_session: {
      step_index: 0,
      partial: meta.grow_exploration_context ?? {},
      started_at: new Date().toISOString(),
    },
  };
}

export function clearGrowExplorationSession(meta: OnboardingMetadata): OnboardingMetadata {
  const { grow_exploration_session: _, ...rest } = meta;
  return rest;
}

export function processGrowExplorationTurn(input: {
  message: string;
  meta: OnboardingMetadata;
}): GrowFlowTurnResult {
  const session = input.meta.grow_exploration_session;
  if (!session) {
    return {
      meta: input.meta,
      response: buildGrowExplorationIntro(),
      suggested_actions: [],
      complete: false,
    };
  }

  const step = GROW_EXPLORATION_STEPS[session.step_index];
  const trimmed = input.message.trim();

  if (step && trimmed) {
    const partial = { ...session.partial, [step.field]: trimmed };
    const nextIdx = session.step_index + 1;
    const nextStep = GROW_EXPLORATION_STEPS[nextIdx];

    if (!nextStep) {
      const context: GrowExplorationContext = {
        ...partial,
        captured_at: new Date().toISOString(),
      };
      const cleared = clearGrowExplorationSession(input.meta);
      return {
        meta: { ...cleared, grow_exploration_context: context },
        response: `Got it — your next experiment is: **${context.way_forward ?? trimmed}**

That's worth testing before any big commitment. When you're ready to shape a one-line career direction from what you learn, we can do that next — or set structured goals on Strategy.`,
        suggested_actions: [
          { action: "Set goals with Mak", url: "/app/plan" },
          { action: "Explore career direction", url: "/app/subjective" },
        ],
        complete: true,
      };
    }

    return {
      meta: {
        ...input.meta,
        grow_exploration_session: { ...session, step_index: nextIdx, partial },
      },
      response: `Got it.\n\n${nextStep.prompt(partial)}`,
      suggested_actions: [],
      complete: false,
    };
  }

  if (step) {
    return {
      meta: input.meta,
      response: step.prompt(session.partial),
      suggested_actions: [],
      complete: false,
    };
  }

  return {
    meta: input.meta,
    response: buildGrowExplorationIntro(),
    suggested_actions: [],
    complete: false,
  };
}

export function buildGrowExplorationMakSystemContext(meta: OnboardingMetadata): string {
  const session = meta.grow_exploration_session;
  if (!session) return "";
  const step = GROW_EXPLORATION_STEPS[session.step_index];
  return step
    ? `Career exploration — step ${session.step_index + 1}/${GROW_EXPLORATION_STEPS.length}. Solution-focused, not problem-focused. Never say GROW. Current: ${step.prompt(session.partial)}`
    : "";
}

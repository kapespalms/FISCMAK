"use client";

import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ONBOARDING_LIME,
  ONBOARDING_MILESTONES,
  milestoneIndexForStep,
  firstStepInMilestone,
} from "@/lib/v2/onboarding-milestones";

type OnboardingMilestoneNavProps = {
  currentStep: string;
  onNavigate?: (step: string) => void;
};

export function OnboardingMilestoneNav({ currentStep, onNavigate }: OnboardingMilestoneNavProps) {
  const activeIndex = milestoneIndexForStep(currentStep);

  return (
    <nav
      aria-label="Onboarding milestones"
      className="mb-8 flex items-center justify-between gap-2 sm:gap-4"
    >
      {ONBOARDING_MILESTONES.map((milestone, index) => {
        const completed = index < activeIndex;
        const current = index === activeIndex;
        const canNavigate = completed && onNavigate;

        const content = (
          <>
            <span
              className={cn(
                "flex h-3 w-3 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                current && "border-[#39FF14] bg-[#39FF14]",
                completed && "border-[#39FF14] bg-[#39FF14]",
                !current && !completed && "border-zinc-300 bg-transparent",
              )}
              style={
                current || completed
                  ? { borderColor: ONBOARDING_LIME, backgroundColor: ONBOARDING_LIME }
                  : undefined
              }
              aria-hidden
            />
            <span
              className={cn(
                "hidden text-xs font-semibold tracking-wide sm:inline",
                current ? "text-[#0B0B0C]" : completed ? "text-zinc-600" : "text-zinc-400",
              )}
            >
              {milestone.label}
            </span>
            {completed ? (
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#39FF14] sm:hidden" aria-hidden />
            ) : null}
          </>
        );

        if (canNavigate) {
          return (
            <button
              key={milestone.id}
              type="button"
              onClick={() => onNavigate(firstStepInMilestone(index))}
              className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-lg px-1 py-2 transition hover:bg-zinc-50"
            >
              {content}
            </button>
          );
        }

        return (
          <div
            key={milestone.id}
            className="flex min-w-0 flex-1 items-center justify-center gap-2 px-1 py-2"
            aria-current={current ? "step" : undefined}
          >
            {content}
          </div>
        );
      })}
    </nav>
  );
}

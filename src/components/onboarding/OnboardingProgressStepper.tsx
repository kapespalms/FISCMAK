"use client";

import { cn } from "@/lib/utils";
import {
  ONBOARDING_LIME,
  ONBOARDING_MILESTONES,
  ONBOARDING_OBSIDIAN,
  firstStepInMilestone,
  milestoneIndexForStep,
} from "@/lib/v2/onboarding-milestones";

type OnboardingProgressStepperProps = {
  currentStep: string;
  onNavigate?: (step: string) => void;
};

export function OnboardingProgressStepper({
  currentStep,
  onNavigate,
}: OnboardingProgressStepperProps) {
  const activeIndex = milestoneIndexForStep(currentStep);
  const currentMilestone = activeIndex + 1;

  return (
    <nav
      aria-label="Onboarding progress"
      className="mx-auto w-full max-w-4xl px-4 py-4 md:py-5"
    >
      <div className="flex flex-col gap-2 rounded-xl border border-slate-200/60 bg-slate-50 p-2 md:flex-row md:items-center md:justify-between md:gap-0">
        {ONBOARDING_MILESTONES.map((milestone, idx) => {
          const isActive = currentMilestone === milestone.id;
          const isCompleted = currentMilestone > milestone.id;
          const canNavigate = isCompleted && onNavigate;

          const segment = (
            <div
              className={cn(
                "flex w-full items-center gap-4 rounded-lg p-3 transition-all duration-200",
                isActive
                  ? "border border-slate-200 bg-white shadow-sm"
                  : "border border-transparent bg-transparent",
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-bold transition-all duration-300",
                  isCompleted && "border-[#0B0B0C] bg-[#0B0B0C] text-white",
                  isActive &&
                    "border-[#39FF14] bg-[#39FF14]/10 text-[#0B0B0C] shadow-sm shadow-[#39FF14]/20",
                  !isActive && !isCompleted && "border-slate-200 bg-slate-100 text-slate-400",
                )}
                style={
                  isActive
                    ? { borderColor: ONBOARDING_LIME, color: ONBOARDING_OBSIDIAN }
                    : undefined
                }
                aria-hidden
              >
                {isCompleted ? (
                  <svg
                    className="h-4 w-4 stroke-current"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 12.75l6 6 9-13.5"
                    />
                  </svg>
                ) : (
                  milestone.id
                )}
              </div>

              <div className="flex min-w-0 flex-col">
                <span
                  className={cn(
                    "truncate text-sm font-semibold transition-colors duration-200",
                    isActive && "text-slate-900",
                    isCompleted && "text-slate-700",
                    !isActive && !isCompleted && "text-slate-400",
                  )}
                >
                  {milestone.label}
                </span>
                <span
                  className={cn(
                    "truncate text-xs transition-colors duration-200",
                    isActive ? "font-medium text-[#0B0B0C]" : "text-slate-400",
                  )}
                  style={isActive ? { color: ONBOARDING_OBSIDIAN } : undefined}
                >
                  {milestone.subtitle}
                </span>
              </div>
            </div>
          );

          return (
            <div
              key={milestone.id}
              className="relative flex w-full flex-1 items-center"
              aria-current={isActive ? "step" : undefined}
            >
              {canNavigate ? (
                <button
                  type="button"
                  onClick={() => onNavigate(firstStepInMilestone(idx))}
                  className="w-full text-left transition hover:opacity-90"
                >
                  {segment}
                </button>
              ) : (
                segment
              )}

              {idx < ONBOARDING_MILESTONES.length - 1 ? (
                <div
                  className="hidden select-none items-center justify-center px-2 text-slate-300 md:flex"
                  aria-hidden
                >
                  <svg
                    className="h-5 w-5 fill-none stroke-current"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.25 4.5l7.5 7.5-7.5 7.5"
                    />
                  </svg>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </nav>
  );
}

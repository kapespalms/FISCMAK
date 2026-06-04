"use client";

import { cn } from "@/lib/utils";
import {
  ONBOARDING_MILESTONES,
  firstStepInMilestone,
  milestoneIndexForStep,
} from "@/lib/v2/onboarding-milestones";

type OnboardingMilestoneTimelineProps = {
  currentStep: string;
  cardIndex?: number;
  cardCount?: number;
  variant?: "light" | "dark";
  onNavigate?: (step: string) => void;
};

/** 0–100 progress for the horizontal timeline fill. */
export function computeMilestoneTimelineProgress(
  currentStep: string,
  cardIndex?: number,
  cardCount?: number,
): number {
  const milestoneIdx = milestoneIndexForStep(currentStep);
  let intra = 0;

  if (milestoneIdx === 0) {
    if (cardCount && cardCount > 0 && typeof cardIndex === "number") {
      intra = (cardIndex + 1) / cardCount;
    } else if (currentStep === "welcome") {
      intra = 0.15;
    } else if (currentStep === "profile") {
      intra = 0.5;
    }
  } else if (milestoneIdx === 1) {
    intra = currentStep === "reconcile" ? 1 : currentStep === "documents" ? 0.55 : 0.25;
  } else if (milestoneIdx === 2) {
    intra = currentStep === "instruments" ? 0.85 : 1;
  }

  return Math.min(100, ((milestoneIdx + intra) / ONBOARDING_MILESTONES.length) * 100);
}

export function OnboardingMilestoneTimeline({
  currentStep,
  cardIndex,
  cardCount,
  variant = "light",
  onNavigate,
}: OnboardingMilestoneTimelineProps) {
  const dark = variant === "dark";
  const activeMilestone = milestoneIndexForStep(currentStep);
  const fillPercent = computeMilestoneTimelineProgress(currentStep, cardIndex, cardCount);

  return (
    <nav
      aria-label="Onboarding milestone timeline"
      className={cn(
        "w-full py-4 md:py-5",
        dark ? "text-white" : "text-cx-text",
      )}
    >
      <div className="flex w-full items-center justify-between gap-4">
        <p className="font-futura-bold text-lg tracking-[0.18em] md:text-xl">
          <span className={dark ? "text-white" : "text-cx-text"}>FISC</span>
          <span className="text-fis-gold">MAK</span>
        </p>
      </div>

      {/* Horizontal progress track — aligned with cards below */}
      <div className="relative mt-4 w-full">
        <div
          className={cn(
            "absolute left-0 right-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full",
            dark ? "bg-white/10" : "bg-cx-forest-dark/12",
          )}
          aria-hidden
        />
        <div
          className="absolute left-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-[#A3E635] transition-[width] duration-700 ease-out"
          style={{ width: `${fillPercent}%` }}
          aria-hidden
        />

        {/* Step nodes — evenly spaced across top */}
        <ol className="relative flex items-start justify-between gap-2 md:gap-4">
          {ONBOARDING_MILESTONES.map((milestone, idx) => {
            const isActive = activeMilestone === idx;
            const isCompleted = activeMilestone > idx;
            const canNavigate = isCompleted && onNavigate;

            const node = (
              <div className="flex flex-col items-center text-center">
                <div
                  className={cn(
                    "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-futura-bold transition-all duration-500 md:h-9 md:w-9",
                    isCompleted && "border-[#A3E635] bg-[#A3E635] text-[#0A0C10]",
                    isActive &&
                      !isCompleted &&
                      "border-[#A3E635] bg-[#A3E635]/15 text-fis-gold shadow-[0_0_12px_rgba(163,230,53,0.35)]",
                    !isActive &&
                      !isCompleted &&
                      (dark
                        ? "border-white/20 bg-[#141722] text-white/40"
                        : "border-cx-forest-dark/20 bg-white text-cx-text/40"),
                  )}
                >
                  {isCompleted ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="3">
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                  ) : (
                    milestone.id
                  )}
                </div>
                <div className="mt-2 min-w-0 max-w-[8rem] md:max-w-[10rem]">
                  <p
                    className={cn(
                      "font-futura-bold text-xs uppercase leading-tight tracking-wide md:text-sm",
                      isActive && (dark ? "text-white" : "text-cx-text"),
                      isCompleted && (dark ? "text-gray-300" : "text-cx-text/80"),
                      !isActive && !isCompleted && (dark ? "text-white/40" : "text-cx-text/40"),
                    )}
                  >
                    {milestone.label}
                  </p>
                </div>
              </div>
            );

            if (canNavigate) {
              return (
                <li key={milestone.id} className="flex flex-1 justify-center">
                  <button
                    type="button"
                    onClick={() => onNavigate(firstStepInMilestone(idx))}
                    className="transition hover:opacity-90"
                  >
                    {node}
                  </button>
                </li>
              );
            }

            return (
              <li
                key={milestone.id}
                className="flex flex-1 justify-center"
                aria-current={isActive ? "step" : undefined}
              >
                {node}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}

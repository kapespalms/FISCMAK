"use client";

import { cn } from "@/lib/utils";
import {
  ONBOARDING_MILESTONES,
  firstStepInMilestone,
  milestoneIndexForStep,
} from "@/lib/v2/onboarding-milestones";

type OnboardingMilestoneTimelineProps = {
  currentStep: string;
  /** 0-based card index within Step 1 profile carousel */
  cardIndex?: number;
  cardCount?: number;
  variant?: "light" | "dark";
  onNavigate?: (step: string) => void;
};

/** 0–100 progress for the rising timeline fill. */
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
        "mx-auto w-full max-w-4xl px-4 py-5 md:px-6",
        dark ? "bg-[#0A0C10] text-white" : "bg-white text-cx-forest-dark",
      )}
    >
      {/* FISCMAK wordmark — all caps */}
      <p className="font-futura-bold text-lg tracking-[0.18em] md:text-xl">
        <span className={dark ? "text-white" : "text-cx-forest-dark"}>FISC</span>
        <span className="text-[#A3E635]">MAK</span>
      </p>

      <div className="mt-5 flex gap-5 md:gap-8">
        {/* Rising vertical timeline track */}
        <div className="relative flex w-3 shrink-0 justify-center pt-1">
          <div
            className={cn(
              "absolute bottom-0 top-0 w-0.5 rounded-full",
              dark ? "bg-white/10" : "bg-cx-forest-dark/15",
            )}
            aria-hidden
          />
          <div
            className="absolute top-0 w-0.5 rounded-full bg-[#A3E635] transition-[height] duration-700 ease-out"
            style={{ height: `${fillPercent}%` }}
            aria-hidden
          />
        </div>

        {/* Step nodes */}
        <ol className="flex flex-1 flex-col gap-5 md:gap-6">
          {ONBOARDING_MILESTONES.map((milestone, idx) => {
            const isActive = activeMilestone === idx;
            const isCompleted = activeMilestone > idx;
            const canNavigate = isCompleted && onNavigate;

            const node = (
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-futura-bold transition-all duration-500",
                    isCompleted && "border-[#A3E635] bg-[#A3E635] text-[#0A0C10]",
                    isActive &&
                      !isCompleted &&
                      "border-[#A3E635] bg-[#A3E635]/15 text-[#A3E635] shadow-[0_0_12px_rgba(163,230,53,0.35)]",
                    !isActive &&
                      !isCompleted &&
                      (dark
                        ? "border-white/20 bg-[#141722] text-white/40"
                        : "border-cx-forest-dark/20 bg-white text-cx-forest-dark/40"),
                  )}
                >
                  {isCompleted ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="3">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    milestone.id
                  )}
                </div>
                <div className="min-w-0 pt-0.5">
                  <p
                    className={cn(
                      "font-futura-bold text-sm uppercase tracking-wide md:text-base",
                      isActive && (dark ? "text-white" : "text-cx-forest-dark"),
                      isCompleted && (dark ? "text-gray-300" : "text-cx-forest-dark/80"),
                      !isActive && !isCompleted && (dark ? "text-white/40" : "text-cx-forest-dark/40"),
                    )}
                  >
                    Step {milestone.id}: {milestone.label}
                  </p>
                  <p
                    className={cn(
                      "font-futura-book mt-0.5 text-xs md:text-sm",
                      isActive && (dark ? "text-[#A3E635]" : "text-cx-forest-dark/70"),
                      !isActive && (dark ? "text-white/35" : "text-cx-forest-dark/45"),
                    )}
                  >
                    {milestone.subtitle}
                  </p>
                  {isActive && cardCount && cardCount > 0 && typeof cardIndex === "number" && idx === 0 ? (
                    <p
                      className={cn(
                        "font-futura-medium mt-1.5 text-xs uppercase tracking-wider",
                        dark ? "text-gray-500" : "text-cx-forest-dark/55",
                      )}
                    >
                      Card {cardIndex + 1} of {cardCount}
                    </p>
                  ) : null}
                </div>
              </div>
            );

            if (canNavigate) {
              return (
                <li key={milestone.id}>
                  <button
                    type="button"
                    onClick={() => onNavigate(firstStepInMilestone(idx))}
                    className="w-full text-left transition hover:opacity-90"
                  >
                    {node}
                  </button>
                </li>
              );
            }

            return (
              <li key={milestone.id} aria-current={isActive ? "step" : undefined}>
                {node}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}

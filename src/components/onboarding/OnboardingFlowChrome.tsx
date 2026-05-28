"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  FLOW_PHASES_AFTER_JOIN,
  ONBOARDING_FLOW_PHASES,
  phaseForStep,
} from "@/lib/v2/onboarding-flow-phases";
import type { OnboardingFlowPhaseId } from "@/lib/v2/onboarding-flow-phases";
import type { OnboardingStep } from "@/lib/v2/onboarding-flow-types";

type OnboardingFlowChromeProps = {
  step: OnboardingStep;
  includeJoinPhase?: boolean;
  onClose: () => void;
  onSkip?: () => void;
  skipDisabled?: boolean;
  closeDisabled?: boolean;
  children: React.ReactNode;
};

export function OnboardingFlowChrome({
  step,
  includeJoinPhase,
  onClose,
  onSkip,
  skipDisabled,
  closeDisabled,
  children,
}: OnboardingFlowChromeProps) {
  const phase = phaseForStep(step);
  const phases = includeJoinPhase
    ? ONBOARDING_FLOW_PHASES
    : ONBOARDING_FLOW_PHASES.filter((p) =>
        (FLOW_PHASES_AFTER_JOIN as OnboardingFlowPhaseId[]).includes(p.id),
      );
  const currentIdx = phases.findIndex((p) => p.id === phase.id);

  return (
    <div className="mb-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-cx-label uppercase text-cx-forest-dark/60">
            Setup · {currentIdx >= 0 ? currentIdx + 1 : 1} of {phases.length} · {phase.label}
          </p>
          <div className="mt-2 flex gap-1">
            {phases.map((p, i) => (
              <div
                key={p.id}
                className={cn(
                  "h-1 flex-1 rounded-full",
                  i < currentIdx
                    ? "bg-cx-forest-dark"
                    : i === currentIdx
                      ? "bg-[#5FD65F]"
                      : "bg-cx-forest-dark/15",
                )}
              />
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={closeDisabled}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-cx-forest-dark/15 text-cx-forest-dark/70 transition hover:bg-cx-forest-dark/5 hover:text-cx-forest-dark disabled:opacity-40"
          aria-label="Exit setup"
          title={closeDisabled ? "Save your profile first" : "Exit to dashboard"}
        >
          <X size={20} />
        </button>
      </div>

      <div className="cx-surface-elevated mt-4 rounded-2xl border border-cx-forest-dark/10 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-cx-forest-dark/60">
          Why we ask
        </p>
        <p className="mt-1 text-sm leading-relaxed text-cx-forest-dark/85">{phase.agenda}</p>
      </div>

      <div className="mt-4">{children}</div>

      {phase.skippable && onSkip && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onSkip}
            disabled={skipDisabled}
            className="text-sm font-medium text-cx-forest-dark/60 underline-offset-2 hover:text-cx-forest-dark hover:underline disabled:opacity-40"
          >
            {phase.skipLabel}
          </button>
        </div>
      )}
    </div>
  );
}

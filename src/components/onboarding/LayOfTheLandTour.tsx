"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { LAY_OF_LAND_STEPS, markTourSeen } from "@/lib/v2/onboarding-flow";

type LayOfTheLandTourProps = {
  open: boolean;
  onClose: () => void;
};

export function LayOfTheLandTour({ open, onClose }: LayOfTheLandTourProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  if (!open) return null;

  const current = LAY_OF_LAND_STEPS[step];
  const isLast = step >= LAY_OF_LAND_STEPS.length - 1;

  function finish() {
    markTourSeen();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-cx-forest-dark/10 bg-white p-6 shadow-xl">
        <p className="text-xs font-medium uppercase tracking-wide text-cx-text/70">
          Lay of the Land · {step + 1} / {LAY_OF_LAND_STEPS.length}
        </p>
        <h2 id="tour-title" className="mt-2 text-xl font-semibold text-cx-text">
          {current.title}
        </h2>
        {current.highlight && (
          <p className="mt-2 text-sm font-medium text-[#AC8636]">{current.highlight}</p>
        )}
        <p className="mt-3 text-sm leading-relaxed text-cx-text/80">{current.body}</p>

        <div className="mt-6 flex gap-2">
          {step > 0 && (
            <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          )}
          <Button
            className="flex-1"
            onClick={() => (isLast ? finish() : setStep((s) => s + 1))}
          >
            {isLast ? "Start coaching conversation" : "Next"}
          </Button>
        </div>
        <button
          type="button"
          onClick={finish}
          className="mt-3 w-full text-center text-xs text-cx-text/60 hover:underline"
        >
          Skip tour
        </button>
      </div>
    </div>
  );
}

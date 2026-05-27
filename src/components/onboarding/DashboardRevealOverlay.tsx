"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { SOAP_SECTION_ORDER, SOAP_TAB } from "@/lib/v2/soap-tab-spec";

const BAND_LETTERS: Record<(typeof SOAP_SECTION_ORDER)[number], string> = {
  subjective: "S",
  objective: "O",
  assessment: "A",
  plan: "P",
  output: "O",
};

const BANDS = SOAP_SECTION_ORDER.map((key) => ({
  letter: BAND_LETTERS[key],
  title: SOAP_TAB[key].title,
  detail: SOAP_TAB[key].description,
}));

type DashboardRevealOverlayProps = {
  onComplete: () => void;
};

export function DashboardRevealOverlay({ onComplete }: DashboardRevealOverlayProps) {
  const [index, setIndex] = useState(0);
  const band = BANDS[index];
  const isLast = index >= BANDS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-cx-forest-dark/70 p-6">
      <div className="max-w-lg rounded-2xl bg-white p-8 shadow-xl">
        <p className="text-xs font-medium uppercase tracking-wide text-cx-forest-dark/70">
          Step 6 of 7 · Dashboard reveal
        </p>
        <h2 className="mt-2 text-xl font-semibold text-cx-forest-dark">Your Career Dashboard</h2>
        <p className="mt-2 text-sm text-cx-forest-dark/80">
          Each section is available from the top navigation bar.
        </p>
        <div className="mt-6 rounded-2xl border-2 border-cx-forest-dark/20 bg-cx-forest-dark/[0.04] p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-cx-forest-dark/70">
            Band {index + 1} of 5
          </p>
          <p className="mt-1 text-lg font-semibold text-[#5FD65F]">
            {band.letter} — {band.title}
          </p>
          <p className="mt-2 text-sm text-cx-forest-dark/80">{band.detail}</p>
        </div>
        <div className="mt-6 flex gap-3">
          {!isLast ? (
            <Button className="flex-1" onClick={() => setIndex((i) => i + 1)}>
              Next band
            </Button>
          ) : (
            <Button className="flex-1" onClick={onComplete}>
              Continue to goal setting
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

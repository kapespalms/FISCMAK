"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

const BANDS = [
  {
    letter: "S",
    title: "Career Perspective",
    detail: "Self-reported career direction, professional satisfaction, and work engagement",
  },
  {
    letter: "O",
    title: "Career Data",
    detail: "Verified career data from documents and public databases",
  },
  {
    letter: "A",
    title: "Career Profile",
    detail: "Career Health Score, Career Map, strengths, and growth areas",
  },
  {
    letter: "P",
    title: "Career Strategy",
    detail: "Development, maintenance, and sustainability goals — set next",
  },
  {
    letter: "O",
    title: "Career Documents",
    detail: "CV, biosketch, reports — ready to generate or update",
  },
];

type DashboardRevealOverlayProps = {
  onComplete: () => void;
};

export function DashboardRevealOverlay({ onComplete }: DashboardRevealOverlayProps) {
  const [index, setIndex] = useState(0);
  const band = BANDS[index];
  const isLast = index >= BANDS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-cx-primary/60 p-6">
      <div className="max-w-lg rounded-2xl bg-cx-white p-8 shadow-xl">
        <p className="text-cx-label uppercase">Step 6 of 7 · Dashboard reveal</p>
        <h2 className="mt-2 text-cx-h2">Your Career Dashboard</h2>
        <p className="mt-2 text-cx-body">
          Each section is available from the top navigation bar.
        </p>
        <div className="mt-6 rounded-2xl border-2 border-cx-primary bg-cx-cream/50 p-5">
          <p className="text-cx-label uppercase">Band {index + 1} of 5</p>
          <p className="mt-1 text-lg font-semibold text-cx-text">
            {band.letter} — {band.title}
          </p>
          <p className="mt-2 text-cx-body">{band.detail}</p>
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

"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const SOAPO_OVERVIEW = [
  {
    letter: "S",
    name: "Career Perspective",
    detail: "Career aspirations, professional satisfaction, and work-life factors",
  },
  {
    letter: "O",
    name: "Career Data",
    detail: "Verified data from uploaded documents and public databases",
  },
  {
    letter: "A",
    name: "Career Profile",
    detail: "Synthesized profile with strengths, growth areas, and benchmarks",
  },
  {
    letter: "P",
    name: "Career Strategy",
    detail: "Structured goals with quarterly milestones",
  },
  {
    letter: "O",
    name: "Career Documents",
    detail: "CV, biosketch, personal statements, and more",
  },
];

type OnboardingWelcomeProps = {
  onBegin: () => void;
};

export function OnboardingWelcome({ onBegin }: OnboardingWelcomeProps) {
  return (
    <Card>
      <p className="text-cx-label uppercase">Step 1 of 7</p>
      <h1 className="mt-1 text-page-title">Welcome to FISCMAK</h1>
      <p className="mt-3 text-cx-body">
        This platform organizes career development using a framework familiar to every
        physician: <strong className="text-cx-text">SOAPO</strong> — Subjective, Objective,
        Assessment, Plan, Output.
      </p>
      <ul className="mt-6 space-y-3">
        {SOAPO_OVERVIEW.map((item) => (
          <li
            key={item.letter + item.name}
            className="flex gap-3 rounded-2xl border border-cx-border bg-cx-white px-4 py-3"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cx-primary text-sm font-bold text-white">
              {item.letter}
            </span>
            <div>
              <p className="font-semibold text-cx-text">{item.name}</p>
              <p className="text-sm text-cx-text-secondary">{item.detail}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-cx-body">Getting started takes about 20 minutes.</p>
      <Button className="mt-6 w-full" onClick={onBegin}>
        Begin setup
      </Button>
    </Card>
  );
}

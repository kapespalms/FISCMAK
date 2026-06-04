"use client";

/**
 * @retired 2026-05-21 — Replaced by SOAPO `OnboardingWelcome` (institutional variant) for all users.
 * Preserved for KP Admin Dashboard preview only. Do not import in production onboarding flows.
 */

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { ResidencyProgram } from "@/lib/v2/programs/registry";

const INSTITUTIONAL_OVERVIEW = [
  {
    title: "Rotation evidence",
    detail: "Capture clinical moments while memory is fresh — mapped to your current block.",
  },
  {
    title: "ILP & CCC prep",
    detail: "Semiannual narrative and SMART goal evidence alongside MedHub.",
  },
  {
    title: "Career lattice",
    detail: "Track domains across inpatient, CL, emergency, addiction, and off-service blocks.",
  },
  {
    title: "Mak",
    detail: "Block-aware debriefs and specialty origin threading from day one.",
  },
];

type InstitutionalOnboardingWelcomeProps = {
  program: ResidencyProgram;
  onBegin: () => void;
};

export function InstitutionalOnboardingWelcome({
  program,
  onBegin,
}: InstitutionalOnboardingWelcomeProps) {
  return (
    <Card>
      <p className="text-cx-label uppercase">Step 1 of 7 · Program onboarding</p>
      <h1 className="mt-1 text-page-title">{program.display_title}</h1>
      <p className="mt-3 text-sm text-cx-text/80">{program.welcome_blurb}</p>
      <p className="mt-2 text-xs text-cx-text/60">
        {program.institution_name} · Academic year {program.academic_year}
      </p>

      <ul className="mt-6 space-y-3">
        {INSTITUTIONAL_OVERVIEW.map((item) => (
          <li
            key={item.title}
            className="cx-surface-elevated flex gap-3 rounded-2xl px-4 py-3"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cx-forest-dark text-sm font-bold text-[#AC8636]">
              ✓
            </span>
            <div>
              <p className="font-semibold text-cx-text">{item.title}</p>
              <p className="text-sm text-cx-text/70">{item.detail}</p>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-sm text-cx-text/80">
        Profile setup takes about 10 minutes. Your program affiliation is recorded for contextual
        prompts — your private reflections stay yours unless you choose to share.
      </p>
      <Button className="mt-6 w-full" onClick={onBegin}>
        Begin program setup
      </Button>
    </Card>
  );
}

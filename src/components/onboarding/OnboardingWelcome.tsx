"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgramJoinHeadline } from "@/components/onboarding/ProgramJoinHeadline";
import { isUniversityHospitalsInstitution } from "@/lib/v2/programs/institution-brand";
import type { ResidencyProgram } from "@/lib/v2/programs/registry";

const SETUP_STEPS = [
  { title: "Profile", detail: "Name, training level, and current rotation." },
  { title: "Documents", detail: "Upload your CV and key career files." },
  { title: "Self-assessment", detail: "Short check-in — finish on your dashboard when ready." },
] as const;

export type OnboardingWelcomeVariant = "default" | "public" | "institutional";

type OnboardingWelcomeProps = {
  onBegin: () => void;
  variant?: OnboardingWelcomeVariant;
  program?: Pick<
    ResidencyProgram,
    "display_title" | "institution_name" | "program_name" | "academic_year" | "welcome_blurb"
  >;
};

export function OnboardingWelcome({
  onBegin,
  variant = "default",
  program,
}: OnboardingWelcomeProps) {
  const isInstitutional = variant === "institutional" && Boolean(program);
  const isPublic = variant === "public";
  const isUh = isUniversityHospitalsInstitution(program?.institution_name);

  return (
    <Card>
      {isInstitutional && program ? (
        <>
          <ProgramJoinHeadline program={program} variant="onboarding" />
          <p className="mt-2 text-sm text-cx-forest-dark/75">
            Academic year {program.academic_year}
          </p>
          {isUh && (
            <Image
              src="/brands/uh-university-hospitals.png"
              alt="University Hospitals"
              width={120}
              height={40}
              className="mt-4 h-8 w-auto object-contain"
            />
          )}
        </>
      ) : (
        <>
          <h1 className="text-page-title">Welcome to FISCMAK</h1>
          {isPublic && (
            <p className="mt-2 text-sm text-cx-forest-dark/75">
              Individual physician platform — not tied to a residency program.
            </p>
          )}
        </>
      )}

      <ol className="mt-6 space-y-3">
        {SETUP_STEPS.map((step, index) => (
          <li
            key={step.title}
            className="cx-surface-elevated flex gap-3 rounded-2xl px-4 py-3"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cx-forest-dark text-sm font-bold text-[#5FD65F]">
              {index + 1}
            </span>
            <div>
              <p className="font-semibold text-cx-forest-dark">{step.title}</p>
              <p className="text-sm text-cx-forest-dark/70">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      <Button className="mt-6 w-full" onClick={onBegin}>
        Get started
      </Button>
    </Card>
  );
}

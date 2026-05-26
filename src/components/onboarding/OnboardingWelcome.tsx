"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SOAP_TAB } from "@/lib/v2/soap-tab-spec";
import type { ResidencyProgram } from "@/lib/v2/programs/registry";

const SOAPO_OVERVIEW = [
  {
    letter: "S",
    name: SOAP_TAB.subjective.nav,
    detail: SOAP_TAB.subjective.description,
  },
  {
    letter: "O",
    name: SOAP_TAB.objective.nav,
    detail: SOAP_TAB.objective.description,
  },
  {
    letter: "A",
    name: SOAP_TAB.assessment.nav,
    detail: SOAP_TAB.assessment.description,
  },
  {
    letter: "P",
    name: SOAP_TAB.plan.nav,
    detail: SOAP_TAB.plan.description,
  },
  {
    letter: "O",
    name: SOAP_TAB.output.nav,
    detail: SOAP_TAB.output.description,
  },
] as const;

export type OnboardingWelcomeVariant = "default" | "public" | "institutional";

type OnboardingWelcomeProps = {
  onBegin: () => void;
  variant?: OnboardingWelcomeVariant;
  /** Required when variant is institutional — drives UH/program banner */
  program?: Pick<
    ResidencyProgram,
    "display_title" | "institution_name" | "academic_year" | "welcome_blurb"
  >;
};

export function OnboardingWelcome({
  onBegin,
  variant = "default",
  program,
}: OnboardingWelcomeProps) {
  const isInstitutional = variant === "institutional" && Boolean(program);

  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wide text-cx-forest-dark/70">
        Step 1 of 7
      </p>
      <h1 className="mt-1 text-page-title">Welcome to FISCMAK</h1>

      {variant === "public" && (
        <p className="mt-2 rounded-lg bg-cx-forest-dark/5 px-3 py-2 text-sm text-cx-forest-dark/80">
          Individual physician account — not affiliated with a residency program on FISCMAK.
        </p>
      )}

      {isInstitutional && program && (
        <div className="mt-3 rounded-lg border border-cx-forest-dark/10 bg-cx-forest-dark/[0.03] px-4 py-3">
          <div className="flex items-center gap-3">
            <Image
              src="/brands/uh-university-hospitals.png"
              alt="University Hospitals"
              width={120}
              height={40}
              className="h-8 w-auto object-contain"
            />
            <div>
              <p className="text-sm font-semibold text-cx-forest-dark">{program.display_title}</p>
              <p className="text-xs text-cx-forest-dark/60">
                {program.institution_name} · Academic year {program.academic_year}
              </p>
            </div>
          </div>
          <p className="mt-2 text-sm text-cx-forest-dark/75">{program.welcome_blurb}</p>
        </div>
      )}

      <p className="mt-3 text-sm text-cx-forest-dark/80">
        This platform organizes career development using a framework familiar to every
        physician: <strong className="text-cx-forest-dark">SOAPO</strong> — Subjective, Objective,
        Assessment, Plan, Output.
      </p>
      <ul className="mt-6 space-y-3">
        {SOAPO_OVERVIEW.map((item) => (
          <li
            key={item.letter + item.name}
            className="cx-surface-elevated flex gap-3 rounded-2xl px-4 py-3"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cx-forest-dark text-sm font-bold text-[#5FD65F]">
              {item.letter}
            </span>
            <div>
              <p className="font-semibold text-cx-forest-dark">{item.name}</p>
              <p className="text-sm text-cx-forest-dark/70">{item.detail}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm text-cx-forest-dark/80">
        {isInstitutional
          ? "Profile setup takes about 10 minutes. Program context enables rotation vocabulary and ILP-ready capture — private reflections stay yours unless you choose to share."
          : "Getting started takes about 20 minutes."}
      </p>
      <Button className="mt-6 w-full" onClick={onBegin}>
        {isInstitutional ? "Begin program setup" : "Begin setup"}
      </Button>
    </Card>
  );
}

"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgramJoinHeadline } from "@/components/onboarding/ProgramJoinHeadline";
import { isUniversityHospitalsInstitution } from "@/lib/v2/programs/institution-brand";
import type { ResidencyProgram } from "@/lib/v2/programs/registry";

const PUBLIC_SETUP_STEPS = [
  {
    title: "Identity Context",
    detail:
      "A brief baseline to capture your professional background, industry focus, and personal career lens.",
  },
  {
    title: "Evidence Repository",
    detail:
      "Securely upload your CV, resume, or past performance artifacts to build your encrypted, lifelong professional dossier.",
  },
  {
    title: "Professional Inventory",
    detail:
      "An interactive blend of standardized career questions and private conversations with Coach Mak to audit your skills, surface your invisible work, and clarify your growth goals.",
  },
] as const;

const INSTITUTIONAL_SETUP_STEPS = [
  {
    title: "Professional Identity Context",
    detail:
      "Select your training program, PGY level, and hospital system to align your dashboard with your specific specialty tracks.",
  },
  {
    title: "Evidence Repository",
    detail:
      "Upload your current CV, licensing documents, and past evaluations to seed your professional dossier.",
  },
  {
    title: "Professional Inventory",
    detail:
      "An interactive blend of standardized competency questions and personal conversations with Coach Mak to audit your skills, log your invisible work, and calculate your capacity.",
  },
] as const;

const INSTITUTIONAL_PRIVACY_DISCLOSURES = [
  {
    title: "Cohort Data Sharing",
    detail:
      "Your institution uses aggregated and cohort-level data from this platform to assist with program reviews, track overall training trends, and support Clinical Competency Committee (CCC) evaluations.",
  },
  {
    title: "Evaluations & Milestone Sync",
    detail:
      "Standardized assessment scores, logged hours, and milestone metrics from your Professional Inventory will generate structured review portfolios accessible by your Program Director and leadership.",
  },
  {
    title: "AI Conversation Firewall",
    detail:
      "While your clinical metrics and milestone data are shared for reviews, your raw, unstructured chat transcripts with Coach Mak remain strictly confidential. Leadership sees the calculated competency outputs, not your private exploratory conversations.",
  },
] as const;

const INDIVIDUAL_PRIVACY_DISCLOSURES = [
  {
    title: "Zero Third-Party Sharing",
    detail:
      "Because you are using an independent account, no one has access to your data. There is no institutional oversight, no employer reporting, and no corporate tracking.",
  },
  {
    title: "Absolute Privacy Firewall",
    detail:
      "Every document uploaded to your Evidence Repository and every conversation with Coach Mak is strictly confidential, encrypted, and isolated. Your raw chat transcripts belong entirely to you.",
  },
  {
    title: "Portable Narrative Career Map",
    detail:
      "Your data, calculated competencies, and generated CVs are completely portable. You own 100% of your career evidence base, moving with you wherever your career takes you.",
  },
] as const;

export type OnboardingWelcomeVariant = "default" | "public" | "institutional";

type OnboardingWelcomeProps = {
  onBegin: () => void;
  variant?: OnboardingWelcomeVariant;
  program?: Pick<
    ResidencyProgram,
    "display_title" | "institution_name" | "program_name" | "academic_year" | "welcome_blurb"
  >;
  institutionalToken?: string;
  onInstitutionalTokenChange?: (value: string) => void;
  onApplyInstitutionalToken?: () => void;
  tokenPreviewLabel?: string | null;
  tokenLoading?: boolean;
  tokenError?: string | null;
};

function InstitutionalPrivacyNotice() {
  return (
    <section
      aria-labelledby="institutional-privacy-notice"
      className="mt-6 rounded-2xl border-2 border-amber-500/70 bg-amber-50/90 px-4 py-4 shadow-sm"
    >
      <p className="text-xs font-bold uppercase tracking-wide text-amber-900/80">
        Critical disclosures
      </p>
      <h2
        id="institutional-privacy-notice"
        className="mt-1 text-base font-bold text-cx-forest-dark"
      >
        Institutional Review &amp; Data Privacy Disclosure
      </h2>
      <p className="mt-2 text-sm text-cx-forest-dark/80">
        Transparency here prevents users from feeling blindsided during review season.
      </p>
      <ul className="mt-4 space-y-3">
        {INSTITUTIONAL_PRIVACY_DISCLOSURES.map((item) => (
          <li key={item.title} className="text-sm text-cx-forest-dark/90">
            <span className="font-semibold text-cx-forest-dark">{item.title}: </span>
            {item.detail}
          </li>
        ))}
      </ul>
    </section>
  );
}

function IndividualPrivacyNotice() {
  return (
    <section
      aria-labelledby="individual-privacy-notice"
      className="mt-6 rounded-2xl border-2 border-sky-500/60 bg-sky-50/90 px-4 py-4 shadow-sm"
    >
      <p className="text-xs font-bold uppercase tracking-wide text-sky-900/80">
        Critical Privacy &amp; Data Sovereignty Disclosures
      </p>
      <h2
        id="individual-privacy-notice"
        className="mt-1 text-base font-bold text-cx-forest-dark"
      >
        Your Data Sovereignty Guarantee
      </h2>
      <ul className="mt-4 space-y-3">
        {INDIVIDUAL_PRIVACY_DISCLOSURES.map((item) => (
          <li key={item.title} className="text-sm text-cx-forest-dark/90">
            <span className="font-semibold text-cx-forest-dark">{item.title}: </span>
            {item.detail}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function OnboardingWelcome({
  onBegin,
  variant = "default",
  program,
  institutionalToken = "",
  onInstitutionalTokenChange,
  onApplyInstitutionalToken,
  tokenPreviewLabel,
  tokenLoading = false,
  tokenError,
}: OnboardingWelcomeProps) {
  const isInstitutional = variant === "institutional" && Boolean(program);
  const isPublic = variant === "public" || (!isInstitutional && variant !== "institutional");
  const setupSteps = isInstitutional ? INSTITUTIONAL_SETUP_STEPS : PUBLIC_SETUP_STEPS;

  return (
    <Card>
      {isInstitutional && program ? (
        <>
          <h1 className="text-page-title">Welcome to Your Career Track Hub</h1>
          <div className="mt-2">
            <ProgramJoinHeadline program={program} variant="onboarding" className="text-lg" />
            <p className="mt-1 text-sm text-cx-forest-dark/75">
              Academic year {program.academic_year}
            </p>
          </div>
          {isUniversityHospitalsInstitution(program.institution_name) && (
            <Image
              src="/brands/uh-university-hospitals.png"
              alt="University Hospitals"
              width={120}
              height={40}
              className="mt-4 h-8 w-auto object-contain"
            />
          )}
          <p className="mt-4 text-sm leading-relaxed text-cx-forest-dark/80">
            Your institutional token configures your workspace for standard training requirements,
            allowing you to easily track your milestones, map your skills, and prepare for your
            program reviews.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-page-title">Welcome to Your Personal Career Hub</h1>
          <p className="mt-4 text-sm leading-relaxed text-cx-forest-dark/80">
            You are in control of your professional narrative. This independent workspace is built
            entirely for you—designed to help you map your competencies, track your impact, and
            navigate your unique career trajectory on your own terms.
          </p>
        </>
      )}

      <div className="mt-6">
        <h2 className="text-lg font-bold text-cx-forest-dark">The Onboarding Process</h2>
        <p className="mt-1 text-sm text-cx-forest-dark/75">
          {isInstitutional
            ? "You will complete three brief steps to establish your profile."
            : "You will complete three brief steps to activate your personal dashboard."}
        </p>
      </div>

      <ol className="mt-4 space-y-3">
        {setupSteps.map((step, index) => (
          <li
            key={step.title}
            className="cx-surface-elevated flex gap-3 rounded-2xl px-4 py-3"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cx-forest-dark text-sm font-bold text-[#5FD65F]">
              {index + 1}
            </span>
            <div>
              <p className="font-semibold text-cx-forest-dark">{step.title}</p>
              <p className="mt-1 text-sm text-cx-forest-dark/75">{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      {isInstitutional ? <InstitutionalPrivacyNotice /> : isPublic ? <IndividualPrivacyNotice /> : null}

      {!isInstitutional && onInstitutionalTokenChange && onApplyInstitutionalToken ? (
        <div className="mt-6 rounded-2xl border border-cx-forest-dark/10 bg-white/60 px-4 py-4">
          <p className="font-semibold text-cx-forest-dark">Have an institutional token?</p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={institutionalToken}
              onChange={(e) => onInstitutionalTokenChange(e.target.value)}
              placeholder="Enter token from your institution"
              className="cx-field flex-1 text-base text-black"
              autoComplete="off"
              spellCheck={false}
            />
            <Button
              type="button"
              variant="secondary"
              disabled={tokenLoading || !institutionalToken.trim()}
              onClick={onApplyInstitutionalToken}
              className="shrink-0"
            >
              {tokenLoading ? "Checking…" : "Apply"}
            </Button>
          </div>
          {tokenPreviewLabel ? (
            <p className="mt-2 text-sm text-cx-forest-dark/75">{tokenPreviewLabel}</p>
          ) : null}
          {tokenError ? (
            <p className="mt-2 text-sm text-red-700">{tokenError}</p>
          ) : null}
        </div>
      ) : null}

      <Button className="mt-6 w-full" onClick={onBegin}>
        Begin Onboarding
      </Button>
    </Card>
  );
}

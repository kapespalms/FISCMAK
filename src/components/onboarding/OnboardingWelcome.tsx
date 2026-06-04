"use client";

import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgramJoinHeadline } from "@/components/onboarding/ProgramJoinHeadline";
import { isUniversityHospitalsInstitution } from "@/lib/v2/programs/institution-brand";
import type { ResidencyProgram } from "@/lib/v2/programs/registry";
import {
  ONBOARDING_MILESTONES,
  milestoneDetail,
} from "@/lib/v2/onboarding-milestones";

const INDIVIDUAL_PRIVACY_DISCLOSURES = [
  {
    title: "Zero Third-Party Sharing",
    detail: "No institutional oversight. No employer reporting.",
  },
  {
    title: "Cryptographic Privacy",
    detail: "Transcripts and files are fully encrypted and isolated.",
  },
  {
    title: "Portable Career Map",
    detail: "You own 100% of your career data permanently.",
  },
] as const;

const INSTITUTIONAL_PRIVACY_DISCLOSURES = [
  {
    title: "Cohort Data Sharing",
    detail: "Aggregated program data supports reviews and CCC evaluations.",
  },
  {
    title: "Milestone Sync",
    detail: "Assessment scores and metrics reach your Program Director. Not raw chat.",
  },
  {
    title: "AI Conversation Firewall",
    detail: "Private Mak transcripts stay confidential. Leadership sees outputs only.",
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

function PrivacyVault({
  title,
  disclosures,
  id,
}: {
  id: string;
  title: string;
  disclosures: readonly { title: string; detail: string }[];
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className="mt-8 rounded-r-xl border-l-[3px] border-[#39FF14] bg-zinc-100/90 px-6 py-5"
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
        Secure disclosure
      </p>
      <h2 id={`${id}-heading`} className="mt-1 text-base font-bold text-[#0B0B0C]">
        {title}
      </h2>
      <ul className="mt-4 space-y-3">
        {disclosures.map((item) => (
          <li key={item.title} className="text-sm leading-snug text-zinc-700">
            <span className="font-semibold text-[#0B0B0C]">{item.title}: </span>
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

  return (
    <Card className="overflow-hidden border-zinc-200/80 bg-white px-7 py-8 sm:px-9 sm:py-10">
      {isInstitutional && program ? (
        <>
          <h1 className="text-page-title text-[#0B0B0C]">Your Career Track Hub</h1>
          <div className="mt-3">
            <ProgramJoinHeadline program={program} variant="onboarding" className="text-lg" />
            <p className="mt-1 text-sm text-zinc-500">Academic year {program.academic_year}</p>
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
          <p className="mt-4 max-w-prose text-sm leading-relaxed text-zinc-600">
            Institutional token applied. Three steps activate your training workspace.
          </p>
        </>
      ) : (
        <>
          <h1 className="text-page-title text-[#0B0B0C]">Your Personal Career Hub</h1>
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-zinc-600">
            Independent workspace. Your narrative, your data, your trajectory.
          </p>
        </>
      )}

      <div className="mt-8">
        <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-zinc-500">
          Three milestones
        </h2>
        <p className="mt-1 text-sm text-zinc-600">
          {isInstitutional
            ? "Complete all three to unlock your program dashboard."
            : "Complete all three to activate your dashboard."}
        </p>
      </div>

      <ol className="mt-5 space-y-4">
        {ONBOARDING_MILESTONES.map((milestone, index) => (
          <li
            key={milestone.id}
            className="flex gap-4 rounded-xl bg-white px-6 py-5 shadow-sm ring-1 ring-zinc-200/80"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0B0B0C] text-sm font-bold text-white">
              {index + 1}
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-[#0B0B0C]">{milestone.label}</p>
              <p className="mt-1 text-sm leading-snug text-zinc-600">
                {milestoneDetail(milestone, isInstitutional)}
              </p>
            </div>
          </li>
        ))}
      </ol>

      {isInstitutional ? (
        <PrivacyVault
          id="institutional-privacy"
          title="Institutional Review & Data Privacy"
          disclosures={INSTITUTIONAL_PRIVACY_DISCLOSURES}
        />
      ) : isPublic ? (
        <PrivacyVault
          id="individual-privacy"
          title="Your Data Sovereignty Guarantee"
          disclosures={INDIVIDUAL_PRIVACY_DISCLOSURES}
        />
      ) : null}

      {!isInstitutional && onInstitutionalTokenChange && onApplyInstitutionalToken ? (
        <div className="mt-8 rounded-xl border border-zinc-200 bg-zinc-50 px-5 py-5">
          <p className="font-semibold text-[#0B0B0C]">Institutional token?</p>
          <p className="mt-1 text-xs text-zinc-500">Switch to your program workspace.</p>
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
            <p className="mt-2 text-sm text-zinc-600">{tokenPreviewLabel}</p>
          ) : null}
          {tokenError ? <p className="mt-2 text-sm text-[#C28D6C]">{tokenError}</p> : null}
        </div>
      ) : null}

      <button
        type="button"
        onClick={onBegin}
        className="mt-8 w-full rounded-md bg-[#0B0B0C] px-6 py-4 text-sm font-bold text-white transition-colors hover:bg-[#39FF14] hover:text-[#0B0B0C]"
      >
        Activate Hub
      </button>
    </Card>
  );
}

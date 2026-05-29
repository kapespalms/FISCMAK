"use client";

import { SubspecialtyInterestsFields } from "@/components/onboarding/SubspecialtyInterestsFields";
import { UhPsychEnrichmentTracksFields } from "@/components/onboarding/UhPsychEnrichmentTracksFields";
import { OnboardingProfileSubheading } from "@/components/onboarding/OnboardingProfileSection";
import type { CareerLevel } from "@/lib/v2/onboarding-options";

type OnboardingInterestsBlockProps = {
  baseSpecialty: string;
  baseSpecialties?: string[];
  careerStage?: CareerLevel;
  subspecialtyInterests: string[];
  onSubspecialtyInterestsChange: (next: string[]) => void;
  showUhPsychTracks: boolean;
  uhPsychTracks: string[];
  onUhPsychTracksChange: (next: string[]) => void;
};

export function OnboardingInterestsBlock({
  baseSpecialty,
  baseSpecialties,
  careerStage,
  subspecialtyInterests,
  onSubspecialtyInterestsChange,
  showUhPsychTracks,
  uhPsychTracks,
  onUhPsychTracksChange,
}: OnboardingInterestsBlockProps) {
  return (
    <>
      <SubspecialtyInterestsFields
        baseSpecialty={baseSpecialty}
        baseSpecialties={baseSpecialties}
        selected={subspecialtyInterests}
        onChange={onSubspecialtyInterestsChange}
        careerStage={careerStage}
      />

      {showUhPsychTracks && (
        <div className="border-t border-cx-forest-dark/10 pt-5">
          <OnboardingProfileSubheading
            title="UH Psychiatry program tracks"
            description="Optional enrichment pathways offered by your program."
          />
          <div className="mt-3">
            <UhPsychEnrichmentTracksFields
              selected={uhPsychTracks}
              onChange={onUhPsychTracksChange}
              embedded
            />
          </div>
        </div>
      )}
    </>
  );
}

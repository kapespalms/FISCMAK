"use client";

import {
  OTHER_INDUSTRY_SEEDS,
  MAX_EXTRACURRICULAR_INTERESTS,
} from "@/lib/v2/onboarding-profile-fields";
import { TagTypeaheadInput } from "@/components/onboarding/TagTypeaheadInput";
import { OnboardingProfileSubheading } from "@/components/onboarding/OnboardingProfileSection";

type OnboardingBeyondPhysicianFieldsProps = {
  otherIndustries: string[];
  onOtherIndustriesChange: (next: string[]) => void;
  extracurricularInterests: string[];
  onExtracurricularInterestsChange: (next: string[]) => void;
};

const EXTRACURRICULAR_SEEDS = [
  "Advocacy",
  "Global health",
  "Medical education",
  "Music / arts",
  "Running / fitness",
  "Writing",
  "Community service",
  "Research mentorship",
];

export function OnboardingBeyondPhysicianFields({
  otherIndustries,
  onOtherIndustriesChange,
  extracurricularInterests,
  onExtracurricularInterestsChange,
}: OnboardingBeyondPhysicianFieldsProps) {
  return (
    <div className="space-y-6">
      <TagTypeaheadInput
        id="other-industries"
        label="What other career industries are you interested in?"
        placeholder="Search or type an industry…"
        value={otherIndustries}
        onChange={onOtherIndustriesChange}
        suggestions={[...OTHER_INDUSTRY_SEEDS]}
        maxTags={3}
      />

      <div>
        <OnboardingProfileSubheading title="Interests & extracurriculars" />
        <div className="mt-3">
          <TagTypeaheadInput
            id="extracurricular-interests"
            label="What do you enjoy doing in your free time?"
            placeholder="Search or add an interest…"
            value={extracurricularInterests}
            onChange={onExtracurricularInterestsChange}
            suggestions={EXTRACURRICULAR_SEEDS}
            maxTags={MAX_EXTRACURRICULAR_INTERESTS}
          />
        </div>
      </div>
    </div>
  );
}

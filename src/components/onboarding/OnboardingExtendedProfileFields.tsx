"use client";

import { useMemo, useState } from "react";
import {
  ADDITIONAL_DEGREE_TYPES,
  CURRENT_GOAL_OPTIONS,
  OTHER_INDUSTRY_SEEDS,
  MAX_EXTRACURRICULAR_INTERESTS,
  type AdditionalDegreeEntry,
  type CurrentGoal,
} from "@/lib/v2/onboarding-profile-fields";
import {
  OnboardingChoiceButton,
  OnboardingFieldLabel,
  OnboardingProfileHint,
  OnboardingProfileSection,
} from "@/components/onboarding/OnboardingProfileSection";
import { Button } from "@/components/ui/Button";

type OnboardingExtendedProfileFieldsProps = {
  additionalDegrees: AdditionalDegreeEntry[];
  onAdditionalDegreesChange: (next: AdditionalDegreeEntry[]) => void;
  currentGoal: CurrentGoal | "";
  onCurrentGoalChange: (value: CurrentGoal | "") => void;
  otherIndustries: string[];
  onOtherIndustriesChange: (next: string[]) => void;
  extracurricularInterests: string[];
  onExtracurricularInterestsChange: (next: string[]) => void;
  sectionStep: string;
};

export function OnboardingExtendedProfileFields({
  additionalDegrees,
  onAdditionalDegreesChange,
  currentGoal,
  onCurrentGoalChange,
  otherIndustries,
  onOtherIndustriesChange,
  extracurricularInterests,
  onExtracurricularInterestsChange,
  sectionStep,
}: OnboardingExtendedProfileFieldsProps) {
  const [industryQuery, setIndustryQuery] = useState("");
  const [interestInput, setInterestInput] = useState("");

  const filteredIndustries = useMemo(() => {
    const q = industryQuery.trim().toLowerCase();
    const seeds = [...OTHER_INDUSTRY_SEEDS];
    if (!q) return seeds;
    return seeds.filter((s) => s.toLowerCase().includes(q));
  }, [industryQuery]);

  function toggleIndustry(value: string) {
    if (otherIndustries.includes(value)) {
      onOtherIndustriesChange(otherIndustries.filter((s) => s !== value));
    } else {
      onOtherIndustriesChange([...otherIndustries, value]);
    }
  }

  function addCustomIndustry() {
    const trimmed = industryQuery.trim();
    if (!trimmed || otherIndustries.includes(trimmed)) return;
    onOtherIndustriesChange([...otherIndustries, trimmed]);
    setIndustryQuery("");
  }

  function addDegree() {
    onAdditionalDegreesChange([...additionalDegrees, { degree: "Master's" }]);
  }

  function updateDegree(index: number, patch: Partial<AdditionalDegreeEntry>) {
    onAdditionalDegreesChange(
      additionalDegrees.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)),
    );
  }

  function removeDegree(index: number) {
    onAdditionalDegreesChange(additionalDegrees.filter((_, i) => i !== index));
  }

  function addInterest() {
    const trimmed = interestInput.trim();
    if (
      !trimmed ||
      extracurricularInterests.includes(trimmed) ||
      extracurricularInterests.length >= MAX_EXTRACURRICULAR_INTERESTS
    ) {
      return;
    }
    onExtracurricularInterestsChange([...extracurricularInterests, trimmed]);
    setInterestInput("");
  }

  return (
    <>
      <OnboardingProfileSection
        step={sectionStep}
        title="Additional degrees"
        description="Optional — other degrees beyond your MD/DO."
      >
        {additionalDegrees.map((entry, index) => (
          <div
            key={index}
            className="space-y-3 rounded-xl border border-cx-forest-dark/10 px-4 py-4"
          >
            <div>
              <OnboardingFieldLabel>Degree</OnboardingFieldLabel>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {ADDITIONAL_DEGREE_TYPES.filter((d) => d !== "None").map((d) => (
                  <OnboardingChoiceButton
                    key={d}
                    active={entry.degree === d}
                    onClick={() => updateDegree(index, { degree: d })}
                  >
                    {d}
                  </OnboardingChoiceButton>
                ))}
              </div>
            </div>
            {entry.degree === "Other" && (
              <div>
                <OnboardingFieldLabel htmlFor={`degree-other-${index}`}>Degree name</OnboardingFieldLabel>
                <input
                  id={`degree-other-${index}`}
                  type="text"
                  value={entry.other_label ?? ""}
                  onChange={(e) => updateDegree(index, { other_label: e.target.value })}
                  className="cx-field mt-2 text-base text-black"
                />
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <OnboardingFieldLabel htmlFor={`degree-field-${index}`}>Field</OnboardingFieldLabel>
                <input
                  id={`degree-field-${index}`}
                  type="text"
                  value={entry.field ?? ""}
                  onChange={(e) => updateDegree(index, { field: e.target.value })}
                  className="cx-field mt-2 text-base text-black"
                  placeholder="Optional"
                />
              </div>
              <div>
                <OnboardingFieldLabel htmlFor={`degree-inst-${index}`}>Institution</OnboardingFieldLabel>
                <input
                  id={`degree-inst-${index}`}
                  type="text"
                  value={entry.institution ?? ""}
                  onChange={(e) => updateDegree(index, { institution: e.target.value })}
                  className="cx-field mt-2 text-base text-black"
                  placeholder="Optional"
                />
              </div>
              <div>
                <OnboardingFieldLabel htmlFor={`degree-year-${index}`}>Year</OnboardingFieldLabel>
                <input
                  id={`degree-year-${index}`}
                  type="text"
                  value={entry.year ?? ""}
                  onChange={(e) => updateDegree(index, { year: e.target.value })}
                  className="cx-field mt-2 text-base text-black"
                  placeholder="Optional"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeDegree(index)}
              className="text-sm text-cx-text/70 underline-offset-2 hover:underline"
            >
              Remove degree
            </button>
          </div>
        ))}
        <Button type="button" variant="secondary" onClick={addDegree}>
          Add degree
        </Button>
      </OnboardingProfileSection>

      <OnboardingProfileSection
        step={`${sectionStep}+`}
        title="Current goal"
        description="What do you most want FISCMAK to help with right now?"
      >
        <div className="grid gap-2">
          {CURRENT_GOAL_OPTIONS.map((option) => (
            <OnboardingChoiceButton
              key={option}
              active={currentGoal === option}
              onClick={() => onCurrentGoalChange(option)}
            >
              {option}
            </OnboardingChoiceButton>
          ))}
        </div>
        <OnboardingProfileHint>Optional — you can change this anytime.</OnboardingProfileHint>
      </OnboardingProfileSection>

      <OnboardingProfileSection
        step={`${sectionStep}++`}
        title="Other industries & interests"
        description="Optional — explore non-clinical pathways and personal interests."
      >
        <div>
          <OnboardingFieldLabel htmlFor="industry-search">
            Other industries of interest
          </OnboardingFieldLabel>
          <input
            id="industry-search"
            type="text"
            value={industryQuery}
            onChange={(e) => setIndustryQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCustomIndustry();
              }
            }}
            placeholder="Search or type an industry…"
            className="cx-field mt-2 text-base text-black"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {filteredIndustries.map((industry) => (
              <button
                key={industry}
                type="button"
                onClick={() => toggleIndustry(industry)}
                className={`rounded-full border px-3 py-1.5 text-sm ${
                  otherIndustries.includes(industry)
                    ? "border-cx-forest-dark bg-cx-forest-dark/10 font-medium text-black"
                    : "border-cx-forest-dark/20 text-black hover:bg-cx-forest-dark/5"
                }`}
              >
                {industry}
              </button>
            ))}
          </div>
          {otherIndustries.filter((i) => !OTHER_INDUSTRY_SEEDS.includes(i as (typeof OTHER_INDUSTRY_SEEDS)[number])).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {otherIndustries
                .filter((i) => !OTHER_INDUSTRY_SEEDS.includes(i as (typeof OTHER_INDUSTRY_SEEDS)[number]))
                .map((industry) => (
                  <button
                    key={industry}
                    type="button"
                    onClick={() => toggleIndustry(industry)}
                    className="rounded-full border border-cx-forest-dark bg-cx-forest-dark/10 px-3 py-1.5 text-sm font-medium text-black"
                  >
                    {industry} ×
                  </button>
                ))}
            </div>
          )}
        </div>

        <div className="border-t border-cx-forest-dark/10 pt-4">
          <OnboardingFieldLabel htmlFor="extracurricular-interest">
            Interests & extracurriculars
          </OnboardingFieldLabel>
          <OnboardingProfileHint>
            Up to {MAX_EXTRACURRICULAR_INTERESTS} — separate from industries (e.g. advocacy, music,
            global health).
          </OnboardingProfileHint>
          <div className="mt-2 flex gap-2">
            <input
              id="extracurricular-interest"
              type="text"
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addInterest();
                }
              }}
              placeholder="Add an interest…"
              className="cx-field flex-1 text-base text-black"
            />
            <button
              type="button"
              onClick={addInterest}
              disabled={
                !interestInput.trim() ||
                extracurricularInterests.length >= MAX_EXTRACURRICULAR_INTERESTS
              }
              className="rounded-lg border border-cx-forest-dark/20 px-4 py-2 text-sm font-medium text-cx-text hover:bg-cx-forest-dark/5 disabled:opacity-40"
            >
              Add
            </button>
          </div>
          {extracurricularInterests.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {extracurricularInterests.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() =>
                    onExtracurricularInterestsChange(
                      extracurricularInterests.filter((i) => i !== interest),
                    )
                  }
                  className="rounded-full border border-cx-forest-dark bg-cx-forest-dark/10 px-3 py-1.5 text-sm font-medium text-black"
                >
                  {interest} ×
                </button>
              ))}
            </div>
          )}
        </div>
      </OnboardingProfileSection>
    </>
  );
}

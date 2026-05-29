"use client";

import {
  ADDITIONAL_DEGREE_TYPES,
  type AdditionalDegreeEntry,
} from "@/lib/v2/onboarding-profile-fields";
import {
  OnboardingChoiceButton,
  OnboardingFieldLabel,
} from "@/components/onboarding/OnboardingProfileSection";
import { Button } from "@/components/ui/Button";

type AdditionalDegreesFieldsProps = {
  value: AdditionalDegreeEntry[];
  onChange: (next: AdditionalDegreeEntry[]) => void;
};

export function AdditionalDegreesFields({ value, onChange }: AdditionalDegreesFieldsProps) {
  function addDegree() {
    onChange([...value, { degree: "Master's" }]);
  }

  function updateDegree(index: number, patch: Partial<AdditionalDegreeEntry>) {
    onChange(value.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)));
  }

  function removeDegree(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-4">
      {value.map((entry, index) => (
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
            className="text-sm text-cx-forest-dark/70 underline-offset-2 hover:underline"
          >
            Remove degree
          </button>
        </div>
      ))}
      <Button type="button" variant="secondary" onClick={addDegree}>
        Add degree
      </Button>
    </div>
  );
}

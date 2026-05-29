"use client";

import { useMemo, useState } from "react";
import { subspecialtiesForBase } from "@/lib/v2/specialty-hierarchy";
import { listAllAcgmeProgramNames } from "@/lib/v2/gme/acgme-specialty-registry";
import { formatSpecialtyDisplayLabel } from "@/lib/v2/specialty-display-label";
import { OnboardingProfileSubheading } from "@/components/onboarding/OnboardingProfileSection";
import type { CareerStage } from "@/lib/v2/onboarding-options";
import { isAttendingCareerLevel, isMedicalStudent } from "@/lib/v2/onboarding-options";
import { MAX_SPECIALTY_INTERESTS } from "@/lib/v2/onboarding-profile-fields";

const ALL_SUBSPECIALTIES = [...new Set(listAllAcgmeProgramNames())].sort((a, b) =>
  a.localeCompare(b),
);

type SubspecialtyInterestsFieldsProps = {
  baseSpecialty: string;
  baseSpecialties?: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  embedded?: boolean;
  careerStage?: CareerStage;
  maxSelections?: number;
  allowFreeText?: boolean;
};

function interestsTitle(careerStage?: CareerStage): string {
  if (isMedicalStudent(careerStage)) return "Subspecialty interests";
  if (careerStage === "Resident" || careerStage === "Fellow") {
    return "Subspecialty / fellowship interests";
  }
  if (isAttendingCareerLevel(careerStage)) {
    return "Subspecialty / areas of practice";
  }
  return "Subspecialties of interest";
}

function interestsDescription(careerStage?: CareerStage, embedded?: boolean): string {
  if (isMedicalStudent(careerStage)) {
    return "From your selected specialties — tap up to three subspecialties you are exploring.";
  }
  if (careerStage === "Resident" || careerStage === "Fellow") {
    return embedded
      ? "Tap up to three fellowship or subspecialty areas you are exploring."
      : "Optional — select up to three fellowship or subspecialty interests.";
  }
  if (isAttendingCareerLevel(careerStage)) {
    return "Optional — up to three subspecialties or practice areas (type custom entries below).";
  }
  return embedded
    ? "Tap any subspecialties you are exploring — no need to rank them."
    : "Optional — select any subspecialties you are exploring or prioritizing.";
}

export function SubspecialtyInterestsFields({
  baseSpecialty,
  baseSpecialties,
  selected,
  onChange,
  embedded = false,
  careerStage,
  maxSelections = MAX_SPECIALTY_INTERESTS,
  allowFreeText = false,
}: SubspecialtyInterestsFieldsProps) {
  const [freeText, setFreeText] = useState("");

  const bases = baseSpecialties?.length ? baseSpecialties : [baseSpecialty];
  const baseOptions = [
    ...new Set(
      bases.flatMap((base) => subspecialtiesForBase(base).filter((s) => s !== base)),
    ),
  ];
  const options = baseOptions.length > 0 ? baseOptions : ALL_SUBSPECIALTIES;

  const displayOptions = useMemo(
    () =>
      options.map((canonical) => ({
        canonical,
        label: formatSpecialtyDisplayLabel(canonical),
      })),
    [options],
  );

  function toggle(value: string) {
    if (selected.includes(value)) {
      onChange(selected.filter((s) => s !== value));
    } else if (selected.length < maxSelections) {
      onChange([...selected, value]);
    }
  }

  function addFreeText() {
    const trimmed = freeText.trim();
    if (!trimmed || selected.includes(trimmed) || selected.length >= maxSelections) return;
    onChange([...selected, trimmed]);
    setFreeText("");
  }

  return (
    <div className="font-futura-book">
      <OnboardingProfileSubheading
        title={interestsTitle(careerStage)}
        description={interestsDescription(careerStage, embedded)}
      />
      <div className="mt-3 max-h-56 overflow-y-auto rounded-xl border border-cx-forest-dark/15 p-3">
        <div className="flex flex-wrap gap-2">
          {displayOptions.map(({ canonical, label }) => {
            const active = selected.includes(canonical);
            const atMax = selected.length >= maxSelections && !active;
            return (
              <button
                key={canonical}
                type="button"
                disabled={atMax}
                onClick={() => toggle(canonical)}
                className={`font-futura-medium rounded-full border px-3 py-1.5 text-sm text-black ${
                  active
                    ? "border-cx-forest-dark bg-cx-forest-dark/10"
                    : atMax
                      ? "border-cx-forest-dark/10 opacity-40"
                      : "border-cx-forest-dark/20 hover:bg-cx-forest-dark/5"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
      {(allowFreeText || isAttendingCareerLevel(careerStage)) && (
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={freeText}
            onChange={(e) => setFreeText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addFreeText();
              }
            }}
            placeholder="Add custom area of practice…"
            className="cx-field flex-1 text-base text-black"
          />
          <button
            type="button"
            onClick={addFreeText}
            disabled={!freeText.trim() || selected.length >= maxSelections}
            className="rounded-lg border border-cx-forest-dark/20 px-4 py-2 text-sm font-medium text-cx-forest-dark hover:bg-cx-forest-dark/5 disabled:opacity-40"
          >
            Add
          </button>
        </div>
      )}
      {selected.length > 0 && (
        <p className="mt-2 text-sm text-black">
          {selected.length} of {maxSelections} selected
        </p>
      )}
    </div>
  );
}

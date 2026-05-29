"use client";

import { useMemo } from "react";
import {
  filterBaseSpecialties,
  filterSubspecialties,
  hasSubspecialtyOptions,
} from "@/lib/v2/specialty-hierarchy";
import { formatSpecialtyDisplayLabel } from "@/lib/v2/specialty-display-label";
import type { CareerStage } from "@/lib/v2/onboarding-options";
import { isAttendingCareerLevel, isMedicalStudent } from "@/lib/v2/onboarding-options";
import { MAX_SPECIALTY_INTERESTS } from "@/lib/v2/onboarding-profile-fields";
import { TagTypeaheadInput } from "@/components/onboarding/TagTypeaheadInput";
import { OnboardingProfileHint } from "@/components/onboarding/OnboardingProfileSection";

type SpecialtyIntakeFieldsProps = {
  baseSpecialty: string;
  onPickBase: (value: string) => void;
  subspecialty: string;
  onPickSubspecialty: (value: string) => void;
  trainingComplete: boolean;
  onTrainingCompleteChange: (value: boolean) => void;
  careerStage: CareerStage;
  /** Institutional program onboarding — base specialty is pre-set */
  hideBaseSpecialtyPicker?: boolean;
  /** Medical student — multi-select specialties of interest */
  specialtyInterests?: string[];
  onSpecialtyInterestsChange?: (next: string[]) => void;
};

function baseSpecialtyLabel(careerStage: CareerStage): string {
  if (isMedicalStudent(careerStage)) return "Specialties of interest";
  if (careerStage === "Resident" || careerStage === "Fellow") return "Specialty";
  return "Specialty";
}

function subspecialtyLabel(careerStage: CareerStage): string {
  if (careerStage === "Fellow") return "Subspecialty";
  if (isAttendingCareerLevel(careerStage)) return "Subspecialty";
  return "Fellowship / subspecialty";
}

export function SpecialtyIntakeFields({
  baseSpecialty,
  onPickBase,
  subspecialty,
  onPickSubspecialty,
  trainingComplete,
  onTrainingCompleteChange,
  careerStage,
  hideBaseSpecialtyPicker = false,
  specialtyInterests = [],
  onSpecialtyInterestsChange,
}: SpecialtyIntakeFieldsProps) {
  const isFellow = careerStage === "Fellow";
  const isMedStudent = isMedicalStudent(careerStage);
  const showSubspecialty =
    !isMedStudent &&
    baseSpecialty &&
    (isFellow || hasSubspecialtyOptions(baseSpecialty));

  const baseSuggestions = useMemo(
    () => filterBaseSpecialties("", careerStage),
    [careerStage],
  );

  const subspecialtySuggestions = useMemo(() => {
    if (!baseSpecialty) return [];
    return filterSubspecialties(baseSpecialty, "", careerStage);
  }, [baseSpecialty, careerStage]);

  if (isMedStudent && !hideBaseSpecialtyPicker) {
    return (
      <div className="space-y-5 font-futura-book">
        <TagTypeaheadInput
          id="specialty-interests"
          label={baseSpecialtyLabel(careerStage)}
          placeholder="Start typing, e.g. Internal Medicine…"
          value={specialtyInterests}
          onChange={(next) => onSpecialtyInterestsChange?.(next)}
          suggestions={baseSuggestions}
          maxTags={MAX_SPECIALTY_INTERESTS}
          formatSuggestion={formatSpecialtyDisplayLabel}
        />
      </div>
    );
  }

  return (
    <div className="space-y-5 font-futura-book">
      {!hideBaseSpecialtyPicker && (
        <TagTypeaheadInput
          id="base-specialty"
          label={baseSpecialtyLabel(careerStage)}
          placeholder="Start typing, e.g. Internal Medicine…"
          value={baseSpecialty ? [baseSpecialty] : []}
          onChange={(tags) => onPickBase(tags[0] ?? "")}
          suggestions={baseSuggestions}
          maxTags={1}
          formatSuggestion={formatSpecialtyDisplayLabel}
        />
      )}

      {showSubspecialty && (
        <>
          <TagTypeaheadInput
            id="subspecialty"
            label={
              isFellow
                ? `${subspecialtyLabel(careerStage)} (required)`
                : `${subspecialtyLabel(careerStage)} (optional)`
            }
            placeholder="Start typing subspecialty…"
            value={subspecialty ? [subspecialty] : []}
            onChange={(tags) => onPickSubspecialty(tags[0] ?? "")}
            suggestions={subspecialtySuggestions}
            maxTags={1}
            formatSuggestion={formatSpecialtyDisplayLabel}
          />

          {subspecialty && !isFellow && (
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-cx-forest-dark/15 bg-cx-forest-dark/[0.03] px-4 py-3">
              <input
                type="checkbox"
                checked={trainingComplete}
                onChange={(e) => onTrainingCompleteChange(e.target.checked)}
                className="mt-1"
              />
              <span className="font-futura-book text-base text-black">
                <span className="font-futura-medium text-cx-forest-dark">
                  Fellowship training complete
                </span>
                <span className="mt-0.5 block text-black">
                  Check when you are board-eligible or certified in this subspecialty.
                </span>
              </span>
            </label>
          )}

          {subspecialty && isFellow && (
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-cx-forest-dark/15 bg-cx-forest-dark/[0.03] px-4 py-3">
              <input
                type="checkbox"
                checked={trainingComplete}
                onChange={(e) => onTrainingCompleteChange(e.target.checked)}
                className="mt-1"
              />
              <span className="font-futura-book text-base text-black">
                <span className="font-futura-medium text-cx-forest-dark">
                  Fellowship training complete
                </span>
                <span className="mt-0.5 block text-black">
                  Leave unchecked while you are still in fellowship.
                </span>
              </span>
            </label>
          )}
        </>
      )}

      {isMedStudent && hideBaseSpecialtyPicker && (
        <OnboardingProfileHint>Select your fellowship subspecialty below.</OnboardingProfileHint>
      )}
    </div>
  );
}

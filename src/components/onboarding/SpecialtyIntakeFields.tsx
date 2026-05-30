"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
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
import { LuxuryHint } from "@/components/onboarding/OnboardingLuxuryUi";

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
  variant?: "default" | "luxury";
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

function TrainingCheckbox({
  checked,
  onChange,
  title,
  description,
  luxury,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  title: string;
  description: string;
  luxury: boolean;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3",
        luxury
          ? checked
            ? "border-[#A3E635]/40 bg-[#0A0C10]"
            : "border-white/5 bg-[#0A0C10] hover:border-white/10"
          : "border-cx-forest-dark/15 bg-cx-forest-dark/[0.03]",
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className={cn("mt-1", luxury && "accent-[#A3E635]")}
      />
      <span className={cn("font-futura-book text-base", luxury ? "text-gray-300" : "text-black")}>
        <span
          className={cn(
            "font-futura-medium",
            luxury ? "text-[#D4AF37]" : "text-cx-forest-dark",
          )}
        >
          {title}
        </span>
        <span className={cn("mt-0.5 block", luxury ? "text-gray-500" : "text-black")}>
          {description}
        </span>
      </span>
    </label>
  );
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
  variant = "default",
}: SpecialtyIntakeFieldsProps) {
  const luxury = variant === "luxury";
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

  const tagVariant = luxury ? "luxury" : "default";
  const Hint = luxury ? LuxuryHint : OnboardingProfileHint;

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
          variant={tagVariant}
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
          variant={tagVariant}
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
            variant={tagVariant}
          />

          {subspecialty && !isFellow && (
            <TrainingCheckbox
              luxury={luxury}
              checked={trainingComplete}
              onChange={onTrainingCompleteChange}
              title="Fellowship training complete"
              description="Check when you are board-eligible or certified in this subspecialty."
            />
          )}

          {subspecialty && isFellow && (
            <TrainingCheckbox
              luxury={luxury}
              checked={trainingComplete}
              onChange={onTrainingCompleteChange}
              title="Fellowship training complete"
              description="Leave unchecked while you are still in fellowship."
            />
          )}
        </>
      )}

      {isMedStudent && hideBaseSpecialtyPicker && (
        <Hint>Select your fellowship subspecialty below.</Hint>
      )}
    </div>
  );
}

"use client";

import { useMemo } from "react";
import { subspecialtiesForBase } from "@/lib/v2/specialty-hierarchy";
import { listAllAcgmeProgramNames } from "@/lib/v2/gme/acgme-specialty-registry";
import { formatSpecialtyDisplayLabel } from "@/lib/v2/specialty-display-label";
import type { CareerStage } from "@/lib/v2/onboarding-options";
import { isMedicalStudent } from "@/lib/v2/onboarding-options";
import { MAX_SPECIALTY_INTERESTS } from "@/lib/v2/onboarding-profile-fields";
import { TagTypeaheadInput } from "@/components/onboarding/TagTypeaheadInput";

const ALL_SUBSPECIALTIES = [...new Set(listAllAcgmeProgramNames())].sort((a, b) =>
  a.localeCompare(b),
);

type SubspecialtyInterestsFieldsProps = {
  baseSpecialty: string;
  baseSpecialties?: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  careerStage?: CareerStage;
  maxSelections?: number;
};

function interestsLabel(careerStage?: CareerStage): string {
  if (isMedicalStudent(careerStage)) return "Subspecialties of interest (optional)";
  return "Subspecialties of interest (optional)";
}

export function SubspecialtyInterestsFields({
  baseSpecialty,
  baseSpecialties,
  selected,
  onChange,
  careerStage,
  maxSelections = MAX_SPECIALTY_INTERESTS,
}: SubspecialtyInterestsFieldsProps) {
  const bases = baseSpecialties?.length ? baseSpecialties : [baseSpecialty];
  const baseOptions = [
    ...new Set(
      bases.flatMap((base) => subspecialtiesForBase(base).filter((s) => s !== base)),
    ),
  ];
  const options = baseOptions.length > 0 ? baseOptions : ALL_SUBSPECIALTIES;

  const suggestions = useMemo(() => options, [options]);

  return (
    <TagTypeaheadInput
      id="subspecialty-interests"
      label={interestsLabel(careerStage)}
      placeholder="Search or type a subspecialty…"
      value={selected}
      onChange={onChange}
      suggestions={suggestions}
      maxTags={maxSelections}
      formatSuggestion={formatSpecialtyDisplayLabel}
    />
  );
}

"use client";

import { useMemo } from "react";
import {
  filterBaseSpecialties,
  filterSubspecialties,
  hasSubspecialtyOptions,
  isTraineeCareerLevel,
} from "@/lib/v2/specialty-hierarchy";
import { formatSpecialtyDisplayLabel } from "@/lib/v2/specialty-display-label";
import type { CareerStage } from "@/lib/v2/onboarding-options";
import { isAttendingCareerLevel, isMedicalStudent } from "@/lib/v2/onboarding-options";
import { MAX_SPECIALTY_INTERESTS } from "@/lib/v2/onboarding-profile-fields";
import { cn } from "@/lib/utils";

type SpecialtyIntakeFieldsProps = {
  baseSpecialty: string;
  baseQuery: string;
  onBaseQueryChange: (value: string) => void;
  onPickBase: (value: string) => void;
  baseListOpen: boolean;
  onBaseListOpenChange: (open: boolean) => void;
  subspecialty: string;
  subspecialtyQuery: string;
  onSubspecialtyQueryChange: (value: string) => void;
  onPickSubspecialty: (value: string) => void;
  subspecialtyListOpen: boolean;
  onSubspecialtyListOpenChange: (open: boolean) => void;
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
  return "Primary specialty";
}

function subspecialtyLabel(careerStage: CareerStage): string {
  if (careerStage === "Resident" || careerStage === "Fellow") {
    return "Fellowship / subspecialty";
  }
  if (isAttendingCareerLevel(careerStage)) {
    return "Subspecialty / area of practice";
  }
  return "Fellowship / subspecialty";
}

export function SpecialtyIntakeFields({
  baseSpecialty,
  baseQuery,
  onBaseQueryChange,
  onPickBase,
  baseListOpen,
  onBaseListOpenChange,
  subspecialty,
  subspecialtyQuery,
  onSubspecialtyQueryChange,
  onPickSubspecialty,
  subspecialtyListOpen,
  onSubspecialtyListOpenChange,
  trainingComplete,
  onTrainingCompleteChange,
  careerStage,
  hideBaseSpecialtyPicker = false,
  specialtyInterests = [],
  onSpecialtyInterestsChange,
}: SpecialtyIntakeFieldsProps) {
  const filteredBases = useMemo(
    () => filterBaseSpecialties(baseQuery, careerStage),
    [baseQuery, careerStage],
  );
  const isTrainee = isTraineeCareerLevel(careerStage);
  const isFellow = careerStage === "Fellow";
  const isMedStudent = isMedicalStudent(careerStage);
  const showSubspecialty =
    !isMedStudent &&
    baseSpecialty &&
    (isFellow || hasSubspecialtyOptions(baseSpecialty)) &&
    (!isTrainee || isFellow);
  const filteredSubs = useMemo(
    () => (baseSpecialty ? filterSubspecialties(baseSpecialty, subspecialtyQuery, careerStage) : []),
    [baseSpecialty, subspecialtyQuery, careerStage],
  );

  function toggleSpecialtyInterest(value: string) {
    if (!onSpecialtyInterestsChange) return;
    if (specialtyInterests.includes(value)) {
      onSpecialtyInterestsChange(specialtyInterests.filter((s) => s !== value));
    } else if (specialtyInterests.length < MAX_SPECIALTY_INTERESTS) {
      onSpecialtyInterestsChange([...specialtyInterests, value]);
    }
  }

  if (isMedStudent && !hideBaseSpecialtyPicker) {
    const displayOptions = filteredBases.map((canonical) => ({
      canonical,
      label: formatSpecialtyDisplayLabel(canonical),
    }));

    return (
      <div className="relative space-y-5 font-futura-book">
        <div>
          <label className="cx-field-label">{baseSpecialtyLabel(careerStage)}</label>
          <p className="font-futura-book mt-0.5 text-base text-black">
            Select up to three. It is okay if you are unsure — this helps Mak understand your
            current exploration phase.
          </p>
          <input
            id="base-specialty-search"
            type="text"
            value={baseQuery}
            onChange={(e) => {
              onBaseQueryChange(e.target.value);
              onBaseListOpenChange(true);
            }}
            onFocus={() => onBaseListOpenChange(true)}
            placeholder="Start typing, e.g. Internal Medicine…"
            className="cx-field mt-2"
            autoComplete="off"
          />
          {baseListOpen && (
            <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-cx-forest-dark/15 bg-white shadow-md">
              {displayOptions.length === 0 ? (
                <li className="px-4 py-3 text-base text-black">No matches</li>
              ) : (
                displayOptions.map(({ canonical, label }) => {
                  const active = specialtyInterests.includes(canonical);
                  const atMax = specialtyInterests.length >= MAX_SPECIALTY_INTERESTS && !active;
                  return (
                    <li key={canonical}>
                      <button
                        type="button"
                        disabled={atMax}
                        onClick={() => toggleSpecialtyInterest(canonical)}
                        className={cn(
                          "font-futura-book w-full px-4 py-2.5 text-left text-base text-black hover:bg-cx-forest-dark/5",
                          active && "bg-cx-forest-dark/10 font-futura-medium",
                          atMax && "opacity-40",
                        )}
                      >
                        {label}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          )}
          {specialtyInterests.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {specialtyInterests.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSpecialtyInterest(s)}
                  className="font-futura-medium rounded-full border border-cx-forest-dark bg-cx-forest-dark/10 px-3 py-1.5 text-sm text-black"
                >
                  {formatSpecialtyDisplayLabel(s)} ×
                </button>
              ))}
            </div>
          )}
          <p className="mt-2 text-sm text-black">
            {specialtyInterests.length} of {MAX_SPECIALTY_INTERESTS} selected
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 font-futura-book">
      {!hideBaseSpecialtyPicker && (
      <div className="relative">
        <label htmlFor="base-specialty-search" className="cx-field-label">
          {baseSpecialtyLabel(careerStage)}
        </label>
        <p className="font-futura-book mt-0.5 text-base text-black">
          {isTrainee
            ? "ACGME-accredited residency program (Appendix B primary specialty)."
            : "Residency training program (e.g. Internal Medicine, Pediatrics)."}
        </p>
        <input
          id="base-specialty-search"
          type="text"
          value={baseQuery}
          onChange={(e) => {
            onBaseQueryChange(e.target.value);
            onBaseListOpenChange(true);
          }}
          onFocus={() => onBaseListOpenChange(true)}
          placeholder="Start typing, e.g. Internal Medicine…"
          className="cx-field mt-2"
          autoComplete="off"
        />
        {baseListOpen && (
          <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-cx-forest-dark/15 bg-white shadow-md">
            {filteredBases.length === 0 ? (
              <li className="px-4 py-3 text-base text-black">No matches</li>
            ) : (
              filteredBases.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => onPickBase(s)}
                    className={cn(
                      "font-futura-book w-full px-4 py-2.5 text-left text-base text-black hover:bg-cx-forest-dark/5",
                      baseSpecialty === s && "bg-cx-forest-dark/10 font-futura-medium",
                    )}
                  >
                    {formatSpecialtyDisplayLabel(s)}
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
      )}

      {showSubspecialty && (
        <>
          <div className="relative">
            <label htmlFor="subspecialty-search" className="cx-field-label">
              {subspecialtyLabel(careerStage)}{" "}
              {isFellow ? (
                <span className="font-normal text-cx-forest-dark/70">(required)</span>
              ) : (
                <span className="font-normal text-cx-forest-dark/70">(optional)</span>
              )}
            </label>
            <p className="font-futura-book mt-0.5 text-base text-black">
              {isFellow
                ? "Select your ACGME-accredited fellowship program — evaluation mapping uses this subspecialty."
                : isAttendingCareerLevel(careerStage)
                  ? "Optional — areas you practice in or focus on."
                  : "e.g. Interventional Cardiology after Internal Medicine residency."}
            </p>
            <input
              id="subspecialty-search"
              type="text"
              value={subspecialtyQuery}
              onChange={(e) => {
                onSubspecialtyQueryChange(e.target.value);
                onSubspecialtyListOpenChange(true);
              }}
              onFocus={() => onSubspecialtyListOpenChange(true)}
              placeholder={
                isAttendingCareerLevel(careerStage)
                  ? "Type subspecialty or area of practice…"
                  : "Start typing subspecialty…"
              }
              className="cx-field mt-2"
              autoComplete="off"
            />
            {subspecialtyListOpen && (
              <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-cx-forest-dark/15 bg-white shadow-md">
                {!isFellow && (
                  <li>
                    <button
                      type="button"
                      onClick={() => onPickSubspecialty("")}
                      className="font-futura-book w-full px-4 py-2.5 text-left text-base text-black hover:bg-cx-forest-dark/5"
                    >
                      None — practicing in base specialty only
                    </button>
                  </li>
                )}
                {filteredSubs.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      onClick={() => onPickSubspecialty(s)}
                      className={cn(
                        "font-futura-book w-full px-4 py-2.5 text-left text-base text-black hover:bg-cx-forest-dark/5",
                        subspecialty === s && "bg-cx-forest-dark/10 font-futura-medium",
                      )}
                    >
                      {formatSpecialtyDisplayLabel(s)}
                    </button>
                  </li>
                ))}
                {isAttendingCareerLevel(careerStage) &&
                  subspecialtyQuery.trim() &&
                  !filteredSubs.some(
                    (s) => s.toLowerCase() === subspecialtyQuery.trim().toLowerCase(),
                  ) && (
                    <li>
                      <button
                        type="button"
                        onClick={() => onPickSubspecialty(subspecialtyQuery.trim())}
                        className="font-futura-book w-full px-4 py-2.5 text-left text-base text-black hover:bg-cx-forest-dark/5"
                      >
                        Use &ldquo;{subspecialtyQuery.trim()}&rdquo;
                      </button>
                    </li>
                  )}
              </ul>
            )}
          </div>

          {subspecialty && (
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-cx-forest-dark/15 bg-cx-forest-dark/[0.03] px-4 py-3">
              <input
                type="checkbox"
                checked={trainingComplete}
                onChange={(e) => onTrainingCompleteChange(e.target.checked)}
                className="mt-1"
              />
              <span className="font-futura-book text-base text-black">
                <span className="font-futura-medium text-cx-forest-dark">Fellowship training complete</span>
                <span className="mt-0.5 block text-black">
                  {careerStage === "Fellow"
                    ? "Leave unchecked while you are still in fellowship."
                    : "Check when you are board-eligible or certified in this subspecialty."}
                </span>
              </span>
            </label>
          )}
        </>
      )}
    </div>
  );
}

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
};

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
}: SpecialtyIntakeFieldsProps) {
  const filteredBases = useMemo(
    () => filterBaseSpecialties(baseQuery, careerStage),
    [baseQuery, careerStage],
  );
  const isTrainee = isTraineeCareerLevel(careerStage);
  const isFellow = careerStage === "Fellow";
  const showSubspecialty =
    baseSpecialty &&
    (isFellow || hasSubspecialtyOptions(baseSpecialty)) &&
    (!isTrainee || isFellow);
  const filteredSubs = useMemo(
    () => (baseSpecialty ? filterSubspecialties(baseSpecialty, subspecialtyQuery, careerStage) : []),
    [baseSpecialty, subspecialtyQuery, careerStage],
  );

  return (
    <div className="space-y-5 font-futura-book">
      {!hideBaseSpecialtyPicker && (
      <div className="relative">
        <label htmlFor="base-specialty-search" className="cx-field-label">
          Base specialty
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
              Fellowship / subspecialty{" "}
              {isFellow ? (
                <span className="font-normal text-cx-forest-dark/70">(required)</span>
              ) : (
                <span className="font-normal text-cx-forest-dark/70">(optional)</span>
              )}
            </label>
            <p className="font-futura-book mt-0.5 text-base text-black">
              {isFellow
                ? "Select your ACGME-accredited fellowship program — evaluation mapping uses this subspecialty."
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
              placeholder="Start typing subspecialty…"
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

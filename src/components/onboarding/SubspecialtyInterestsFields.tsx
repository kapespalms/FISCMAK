"use client";

import { useMemo } from "react";
import { subspecialtiesForBase } from "@/lib/v2/specialty-hierarchy";
import { listAllAcgmeProgramNames } from "@/lib/v2/gme/acgme-specialty-registry";
import { formatSpecialtyDisplayLabel } from "@/lib/v2/specialty-display-label";
import { OnboardingProfileSubheading } from "@/components/onboarding/OnboardingProfileSection";

const ALL_SUBSPECIALTIES = [...new Set(listAllAcgmeProgramNames())].sort((a, b) =>
  a.localeCompare(b),
);

type SubspecialtyInterestsFieldsProps = {
  baseSpecialty: string;
  selected: string[];
  onChange: (next: string[]) => void;
  embedded?: boolean;
};

export function SubspecialtyInterestsFields({
  baseSpecialty,
  selected,
  onChange,
  embedded = false,
}: SubspecialtyInterestsFieldsProps) {
  const baseOptions = subspecialtiesForBase(baseSpecialty).filter((s) => s !== baseSpecialty);
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
    } else {
      onChange([...selected, value]);
    }
  }

  return (
    <div className="font-futura-book">
      <OnboardingProfileSubheading
        title="Subspecialties of interest"
        description={
          embedded
            ? "Tap any subspecialties you are exploring — no need to rank them."
            : "Optional — select any subspecialties you are exploring or prioritizing."
        }
      />
      <div className="mt-3 max-h-56 overflow-y-auto rounded-xl border border-cx-forest-dark/15 p-3">
        <div className="flex flex-wrap gap-2">
          {displayOptions.map(({ canonical, label }) => {
            const active = selected.includes(canonical);
            return (
              <button
                key={canonical}
                type="button"
                onClick={() => toggle(canonical)}
                className={`font-futura-medium rounded-full border px-3 py-1.5 text-sm text-black ${
                  active
                    ? "border-cx-forest-dark bg-cx-forest-dark/10"
                    : "border-cx-forest-dark/20 hover:bg-cx-forest-dark/5"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
      {selected.length > 0 && (
        <p className="mt-2 text-sm text-black">{selected.length} selected</p>
      )}
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";
import {
  ADDITIONAL_DEGREE_TYPES,
  type AdditionalDegreeEntry,
} from "@/lib/v2/onboarding-profile-fields";
import {
  OnboardingChoiceButton,
  OnboardingFieldLabel,
} from "@/components/onboarding/OnboardingProfileSection";
import {
  LuxuryChoiceButton,
  LuxuryTextInput,
} from "@/components/onboarding/OnboardingLuxuryUi";
import { Button } from "@/components/ui/Button";

type AdditionalDegreesFieldsProps = {
  value: AdditionalDegreeEntry[];
  onChange: (next: AdditionalDegreeEntry[]) => void;
  variant?: "default" | "luxury";
};

export function AdditionalDegreesFields({
  value,
  onChange,
  variant = "default",
}: AdditionalDegreesFieldsProps) {
  const luxury = variant === "luxury";

  function addDegree() {
    onChange([...value, { degree: "Master's" }]);
  }

  function updateDegree(index: number, patch: Partial<AdditionalDegreeEntry>) {
    onChange(value.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)));
  }

  function removeDegree(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  const DegreeLabel = luxury
    ? ({ children }: { children: React.ReactNode }) => (
        <h4 className="font-futura-bold text-xs uppercase tracking-[0.15em] text-[#D4AF37]">
          {children}
        </h4>
      )
    : ({ children }: { children: React.ReactNode }) => (
        <OnboardingFieldLabel>{children}</OnboardingFieldLabel>
      );

  return (
    <div className="space-y-4">
      {value.map((entry, index) => (
        <div
          key={index}
          className={cn(
            "space-y-3 rounded-xl border px-4 py-4",
            luxury ? "border-white/10 bg-[#0A0C10]" : "border-cx-forest-dark/10",
          )}
        >
          <div>
            <DegreeLabel>Degree</DegreeLabel>
            <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {ADDITIONAL_DEGREE_TYPES.filter((d) => d !== "None").map((d) =>
                luxury ? (
                  <LuxuryChoiceButton
                    key={d}
                    active={entry.degree === d}
                    onClick={() => updateDegree(index, { degree: d })}
                  >
                    {d}
                  </LuxuryChoiceButton>
                ) : (
                  <OnboardingChoiceButton
                    key={d}
                    active={entry.degree === d}
                    onClick={() => updateDegree(index, { degree: d })}
                  >
                    {d}
                  </OnboardingChoiceButton>
                ),
              )}
            </div>
          </div>
          {entry.degree === "Other" && (
            <div>
              <DegreeLabel>Degree name</DegreeLabel>
              {luxury ? (
                <LuxuryTextInput
                  id={`degree-other-${index}`}
                  value={entry.other_label ?? ""}
                  onChange={(v) => updateDegree(index, { other_label: v })}
                  className="mt-2"
                />
              ) : (
                <input
                  id={`degree-other-${index}`}
                  type="text"
                  value={entry.other_label ?? ""}
                  onChange={(e) => updateDegree(index, { other_label: e.target.value })}
                  className="cx-field mt-2 text-base text-black"
                />
              )}
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-3">
            {(
              [
                ["Field", "field", "field"],
                ["Institution", "institution", "inst"],
                ["Year", "year", "year"],
              ] as const
            ).map(([label, key, idSuffix]) => (
              <div key={key}>
                <DegreeLabel>{label}</DegreeLabel>
                {luxury ? (
                  <LuxuryTextInput
                    id={`degree-${idSuffix}-${index}`}
                    value={(entry[key] as string | undefined) ?? ""}
                    onChange={(v) => updateDegree(index, { [key]: v })}
                    placeholder="Optional"
                    className="mt-2"
                  />
                ) : (
                  <input
                    id={`degree-${idSuffix}-${index}`}
                    type="text"
                    value={(entry[key] as string | undefined) ?? ""}
                    onChange={(e) => updateDegree(index, { [key]: e.target.value })}
                    className="cx-field mt-2 text-base text-black"
                    placeholder="Optional"
                  />
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => removeDegree(index)}
            className={cn(
              "text-sm underline-offset-2 hover:underline",
              luxury ? "text-gray-500 hover:text-white" : "text-cx-text/70",
            )}
          >
            Remove degree
          </button>
        </div>
      ))}
      {luxury ? (
        <button
          type="button"
          onClick={addDegree}
          className="rounded-xl border border-dashed border-white/15 px-4 py-3 font-futura-medium text-sm uppercase tracking-wider text-gray-400 transition-colors hover:border-[#A3E635]/40 hover:text-fis-gold"
        >
          Add degree
        </button>
      ) : (
        <Button type="button" variant="secondary" onClick={addDegree}>
          Add degree
        </Button>
      )}
    </div>
  );
}

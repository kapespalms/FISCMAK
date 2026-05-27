"use client";

import type { ProgramRotation } from "@/lib/v2/programs/registry";
import { groupedRotationsForSelect } from "@/lib/v2/programs/rotation-catalog";
import { OnboardingFieldLabel } from "@/components/onboarding/OnboardingProfileSection";

type RotationSelectFieldsProps = {
  rotations: ProgramRotation[];
  pgyLevel: string;
  value: string;
  onChange: (label: string) => void;
  blockHint?: {
    matched: boolean;
    rotation_label?: string;
    block_id?: string;
    days_remaining?: number;
    message?: string;
  } | null;
  lookupLoading?: boolean;
};

export function RotationSelectFields({
  rotations,
  value,
  onChange,
  blockHint,
  lookupLoading,
}: RotationSelectFieldsProps) {
  const groups = groupedRotationsForSelect(rotations);

  return (
    <div className="font-futura-book">
      <OnboardingFieldLabel htmlFor="current-rotation">Current rotation</OnboardingFieldLabel>
      <select
        id="current-rotation"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="cx-field mt-2 w-full text-base text-black"
      >
        <option value="">Select your current rotation…</option>
        {groups.map((group) => (
          <optgroup key={group.label} label={group.label}>
            {group.rotations.map((r) => (
              <option key={r.code} value={r.label}>
                {r.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
      {lookupLoading && <p className="mt-2 text-sm text-black">Loading…</p>}
      {blockHint?.matched && blockHint.rotation_label && (
        <p className="mt-2 text-sm text-black">
          Suggested: {blockHint.rotation_label}
          {typeof blockHint.days_remaining === "number" && blockHint.days_remaining > 0
            ? ` · ${blockHint.days_remaining} day${blockHint.days_remaining === 1 ? "" : "s"} left in this rotation`
            : ""}
        </p>
      )}
    </div>
  );
}

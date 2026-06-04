"use client";

import type { MakLikertScalePayload } from "@/lib/v2/mak-likert-scale";

type MakLikertChipsProps = {
  scale: MakLikertScalePayload;
  disabled?: boolean;
  onSelect: (value: number) => void;
};

export function MakLikertChips({ scale, disabled, onSelect }: MakLikertChipsProps) {
  const values = Array.from({ length: scale.max - scale.min + 1 }, (_, i) => scale.min + i);

  return (
    <div className="mt-2 space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {values.map((value) => (
          <button
            key={value}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(value)}
            className="min-w-[2.25rem] rounded-lg border border-cx-forest-dark/20 bg-white px-2.5 py-1.5 text-sm font-semibold text-cx-text transition hover:border-cx-forest-dark/40 hover:bg-cx-forest-dark/5 disabled:opacity-50"
            aria-label={`Rate ${value} of ${scale.max}`}
          >
            {value}
          </button>
        ))}
      </div>
      <p className="text-[11px] leading-snug text-cx-text/60">{scale.anchors}</p>
    </div>
  );
}

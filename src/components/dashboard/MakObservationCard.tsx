"use client";

import { MessageCircle } from "lucide-react";
import { useAppShell } from "@/components/layout/AppShell";

type Props = {
  weekCount: number;
  pendingCount: number;
  /** Phase 6: full Mak engine generates this string. For now: data-derived. */
  overrideText?: string;
};

function deriveObservation(weekCount: number, pendingCount: number): string {
  if (weekCount === 0 && pendingCount === 0) {
    return "Nothing captured this week yet — ready when you are.";
  }
  if (weekCount === 0 && pendingCount > 0) {
    return `${pendingCount} parsed item${pendingCount !== 1 ? "s" : ""} waiting to be placed on your profile.`;
  }
  if (pendingCount > 0) {
    return `${weekCount} capture${weekCount !== 1 ? "s" : ""} this week · ${pendingCount} still unplaced.`;
  }
  return `${weekCount} capture${weekCount !== 1 ? "s" : ""} confirmed this week.`;
}

export function MakObservationCard({ weekCount, pendingCount, overrideText }: Props) {
  const { openMak } = useAppShell();
  const text = overrideText ?? deriveObservation(weekCount, pendingCount);

  return (
    <div className="rounded-2xl border border-cx-forest-dark/10 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-fis-gold/10">
          <MessageCircle size={17} className="text-fis-gold" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-cx-forest-dark">{text}</p>
          <button
            type="button"
            onClick={openMak}
            className="mt-2 text-xs font-medium text-fis-gold hover:opacity-80 transition-opacity"
          >
            Capture with Mak →
          </button>
        </div>
      </div>

      {/* Quick-capture field */}
      <button
        type="button"
        onClick={openMak}
        className="mt-3 w-full rounded-xl border border-cx-forest-dark/10 bg-neutral-50 px-4 py-2.5 text-left text-sm text-cx-forest-dark/40 transition-colors hover:border-fis-gold/40 hover:bg-fis-gold/5 hover:text-cx-forest-dark/70"
      >
        What did you work on today?
      </button>
    </div>
  );
}

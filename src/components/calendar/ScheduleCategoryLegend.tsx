"use client";

import { ROTATION_CATEGORY_COLORS } from "@/lib/v2/schedule-calendar/colors";

const CATEGORY_LABELS: Record<string, string> = {
  inpatient: "Inpatient",
  outpatient: "Outpatient",
  consult: "Consult–liaison",
  off_service: "Off-service",
  elective: "Elective / QI",
  operational: "Call / time off",
  personal: "Your events",
};

/** Compact category legend — replaces per-rotation color wall at bottom of calendar. */
export function ScheduleCategoryLegend() {
  const entries = Object.entries(ROTATION_CATEGORY_COLORS).filter(([key]) => key !== "personal");

  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-cx-forest-dark/10 pt-3">
      <span className="font-futura-medium text-[11px] uppercase tracking-wide text-cx-text/55">
        By type
      </span>
      {entries.map(([key, color]) => (
        <span
          key={key}
          className="font-futura-book inline-flex items-center gap-1 text-[11px] text-black/80"
        >
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm border border-black/10"
            style={{ backgroundColor: color }}
            aria-hidden
          />
          {CATEGORY_LABELS[key] ?? key}
        </span>
      ))}
    </div>
  );
}

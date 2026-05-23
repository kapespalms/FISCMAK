"use client";

import type { TouchpointBarState } from "@/lib/v2/dashboard-redesign";
import { StatusIndicator, type StatusKind } from "@/components/ui/StatusIndicator";

type TouchpointStatusBarProps = {
  states: TouchpointBarState[];
};

function tpStatus(state: TouchpointBarState): StatusKind {
  if (state === "done") return "done";
  if (state === "active") return "upcoming";
  return "locked";
}

export function TouchpointStatusBar({ states }: TouchpointStatusBarProps) {
  return (
    <div
      className="cx-card flex flex-wrap items-center gap-3 py-4"
      aria-label="Touchpoint progress"
    >
      {states.map((state, i) => (
        <div key={i} className="flex items-center gap-2">
          {i > 0 && <span className="text-cx-border">|</span>}
          <span className="text-cx-label font-medium text-cx-text-secondary">TP{i + 1}</span>
          <StatusIndicator status={tpStatus(state)} size={14} />
        </div>
      ))}
    </div>
  );
}

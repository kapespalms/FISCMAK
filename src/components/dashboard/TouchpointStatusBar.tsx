"use client";

import { cn } from "@/lib/utils";
import {
  statusIcon,
  statusIconClass,
  type TouchpointBarState,
} from "@/lib/v2/dashboard-redesign";

type TouchpointStatusBarProps = {
  states: TouchpointBarState[];
};

export function TouchpointStatusBar({ states }: TouchpointStatusBarProps) {
  return (
    <div
      className="flex flex-wrap items-center gap-2 rounded-xl bg-cx-white px-4 py-3 shadow-[0_2px_8px_rgba(0,0,0,0.06)]"
      aria-label="Touchpoint progress"
    >
      {states.map((state, i) => (
        <div key={i} className="flex items-center gap-2">
          {i > 0 && <span className="text-cx-text-secondary">|</span>}
          <span className="text-cx-label font-medium text-cx-text-secondary">
            TP{i + 1}
          </span>
          <span
            className={cn("text-base leading-none", statusIconClass(state))}
            aria-hidden
          >
            {state === "active" ? "◎" : statusIcon(state === "done" ? "done" : "locked")}
          </span>
        </div>
      ))}
    </div>
  );
}

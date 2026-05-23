"use client";

import { ArrowRight } from "lucide-react";
import type { ActiveTouchpointView } from "@/lib/v2/dashboard-redesign";

type DashboardActiveTouchpointProps = {
  active: ActiveTouchpointView | null;
  upcoming: ActiveTouchpointView | null;
  onContinue: (touchpoint: ActiveTouchpointView) => void;
  onViewHistory?: () => void;
};

export function DashboardActiveTouchpoint({
  active,
  upcoming,
  onContinue,
  onViewHistory,
}: DashboardActiveTouchpointProps) {
  if (!active && !upcoming) return null;

  return (
    <section aria-labelledby="touchpoint-heading" className="space-y-4">
      {active && (
        <div className="cx-card">
          <p className="text-cx-label uppercase tracking-wide">
            {active.kind === "annual"
              ? "Annual Refresh"
              : active.kind === "quarterly"
                ? "Quarterly Pulse"
                : `TP${active.id.replace("tp-", "")}`}
            {" · "}
            {active.duration}
          </p>
          <h2 id="touchpoint-heading" className="mt-1 text-cx-h2">
            {active.title}
          </h2>
          <p className="mt-1 text-sm font-medium text-cx-primary">{active.statusLabel}</p>
          <p className="mt-3 text-cx-body">{active.description}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onContinue(active)}
              className="inline-flex items-center gap-2 rounded-lg bg-cx-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Continue <ArrowRight size={16} />
            </button>
            {onViewHistory && (
              <button
                type="button"
                onClick={onViewHistory}
                className="rounded-lg border border-cx-border px-4 py-2 text-sm font-medium text-cx-text hover:bg-cx-cream"
              >
                View History
              </button>
            )}
          </div>

          {active.upNext && (
            <p className="mt-4 text-cx-label">
              Up next: {active.upNext.title} ({active.upNext.label})
            </p>
          )}
        </div>
      )}

      {!active && upcoming && (
        <div className="cx-card border border-dashed border-cx-border bg-cx-white/80">
          <p className="text-cx-label">{upcoming.statusLabel}</p>
          <h2 className="mt-1 text-cx-h3">{upcoming.title}</h2>
          <p className="mt-2 text-cx-body">{upcoming.description}</p>
        </div>
      )}

      {active && upcoming && active.id !== upcoming.id && !active.upNext && (
        <div className="rounded-xl border border-cx-border bg-cx-white/60 px-4 py-3">
          <p className="text-cx-label">
            Up next: {upcoming.title} · {upcoming.duration}
          </p>
        </div>
      )}
    </section>
  );
}

"use client";

import { ScoreDisplay } from "@/components/ui/ScoreDisplay";
import { StatusChip } from "@/components/ui/StatusChip";
import type { DashboardHeaderModel } from "@/lib/v2/dashboard-architecture";
import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";

type DashboardHeaderProps = {
  model: DashboardHeaderModel;
};

function TrendIcon({ trend }: { trend: DashboardHeaderModel["trend"] }) {
  if (trend === "up") return <ArrowUp className="text-fm-strong" size={20} />;
  if (trend === "down") return <ArrowDown className="text-fm-attention" size={20} />;
  return <ArrowRight className="text-fm-neutral" size={20} />;
}

export function DashboardHeader({ model }: DashboardHeaderProps) {
  return (
    <header className="grid gap-4 border-b border-fiscmak-border pb-5 lg:grid-cols-[1fr_auto_1fr] lg:items-end">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-fiscmak-ink">
          {model.displayName}
          {model.degree ? `, ${model.degree}` : ""}
        </h1>
        <p className="mt-1 text-sm text-slate-500">{model.profileLine}</p>
      </div>

      <div className="flex flex-col items-center justify-center text-center">
        <p className="text-data-label">Career Health Score</p>
        <div className="mt-1 flex items-center gap-2">
          {model.careerHealthScore != null ? (
            <>
              <ScoreDisplay
                value={model.careerHealthScore}
                previousValue={model.previousScore}
                className="text-5xl font-bold text-fm-primary"
              />
              <span className="text-lg text-fiscmak-muted">/100</span>
              <TrendIcon trend={model.trend} />
            </>
          ) : (
            <span className="text-2xl font-semibold text-fiscmak-muted">—</span>
          )}
        </div>
        {model.scoreStatus && (
          <div className="mt-2">
            <StatusChip status={model.scoreStatus} />
          </div>
        )}
      </div>

      <div className="text-right text-caption text-fiscmak-muted lg:justify-self-end">
        {model.lastUpdated && <p>Last updated: {model.lastUpdated}</p>}
        {model.nextCheckIn && (
          <p className="mt-0.5">Next quarterly check-in: {model.nextCheckIn}</p>
        )}
        {model.quarterlyPulseDue && (
          <p className="mt-1 font-medium text-fm-developing">Quarterly check-in available</p>
        )}
        {model.annualRefreshDue && (
          <p className="mt-1 font-medium text-fm-developing">Annual career refresh available</p>
        )}
        {model.pulseStreak >= 2 && (
          <p className="mt-1">{model.pulseStreak} consecutive quarters</p>
        )}
      </div>
    </header>
  );
}

"use client";

import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";
import type { DashboardHeaderModel } from "@/lib/v2/dashboard-architecture";
import { cn } from "@/lib/utils";

type DashboardHeroMetricsProps = {
  header: DashboardHeaderModel;
  track: string | null;
  nextMilestone: string | null;
};

function TrendIcon({ trend }: { trend: DashboardHeaderModel["trend"] }) {
  if (trend === "up") return <ArrowUp className="text-green-600" size={18} />;
  if (trend === "down") return <ArrowDown className="text-cx-attention" size={18} />;
  return <ArrowRight className="text-cx-text-secondary" size={18} />;
}

export function DashboardHeroMetrics({
  header,
  track,
  nextMilestone,
}: DashboardHeroMetricsProps) {
  return (
    <section aria-labelledby="hero-metrics-heading">
      <h2 id="hero-metrics-heading" className="sr-only">
        Key metrics
      </h2>
      <div className="grid gap-6 md:grid-cols-3">
        <div className="cx-card flex min-h-[140px] flex-col justify-between">
          <p className="text-cx-label">Health Score</p>
          <div className="mt-2 flex items-end gap-2">
            {header.careerHealthScore != null ? (
              <>
                <span className="text-4xl font-bold tabular-nums text-cx-text">
                  {header.careerHealthScore}
                </span>
                <span className="pb-1 text-cx-body">/100</span>
                <TrendIcon trend={header.trend} />
              </>
            ) : (
              <span className="text-2xl font-semibold text-cx-text-secondary">—</span>
            )}
          </div>
          {header.scoreStatus && (
            <p className="mt-2 text-cx-label capitalize">{header.scoreStatus.replace(/_/g, " ")}</p>
          )}
        </div>

        <div className="cx-card flex min-h-[140px] flex-col justify-between">
          <p className="text-cx-label">Track</p>
          <p className="mt-2 text-cx-h3">{track ?? "Set direction"}</p>
          <p className="mt-2 text-cx-body">{header.profileLine}</p>
        </div>

        <div className="cx-card flex min-h-[140px] flex-col justify-between">
          <p className="text-cx-label">Next Milestone</p>
          <p className={cn("mt-2 text-cx-h3", !nextMilestone && "text-cx-text-secondary")}>
            {nextMilestone ?? "None due"}
          </p>
          {header.nextCheckIn && (
            <p className="mt-2 text-cx-body">Next check-in: {header.nextCheckIn}</p>
          )}
        </div>
      </div>
    </section>
  );
}

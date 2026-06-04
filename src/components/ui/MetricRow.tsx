"use client";

import { StatusChip } from "@/components/ui/StatusChip";
import { TechnicalDetailToggle } from "@/components/ui/TechnicalDetailToggle";
import { MakDiscussLink } from "@/components/ui/MakDiscussLink";
import type { MakDiscussConfig } from "@/lib/card-mak-prompts";
import type { MetricStatus } from "@/lib/design-system";

type MetricRowProps = {
  label: string;
  summary: string;
  status?: MetricStatus;
  percentile?: number | null;
  trend?: string;
  technical?: Record<string, unknown>;
  sourceAttribution?: string;
  mak?: MakDiscussConfig;
};

export function MetricRow({
  label,
  summary,
  status,
  percentile,
  trend,
  technical,
  sourceAttribution,
  mak,
}: MetricRowProps) {
  return (
    <div className="rounded-xl border border-cx-forest-dark/10 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-sm font-semibold text-cx-text">{label}</p>
        {status && <StatusChip status={status} />}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-cx-text/80">{summary}</p>
      {trend && <p className="mt-1 text-xs text-cx-text/60">{trend}</p>}
      {(technical || sourceAttribution) && (
        <TechnicalDetailToggle technical={technical} sources={sourceAttribution} />
      )}
      {mak && (
        <div className="mt-3 border-t border-cx-forest-dark/15 pt-3">
          <MakDiscussLink
            mak={mak}
            className="text-cx-text hover:text-cx-text/80"
          />
        </div>
      )}
    </div>
  );
}

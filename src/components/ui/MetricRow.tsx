"use client";

import { StatusChip } from "@/components/ui/StatusChip";
import { TechnicalDetailToggle } from "@/components/ui/TechnicalDetailToggle";
import type { MetricStatus } from "@/lib/design-system";

type MetricRowProps = {
  label: string;
  summary: string;
  status?: MetricStatus;
  percentile?: number | null;
  trend?: string;
  technical?: Record<string, unknown>;
  sourceAttribution?: string;
};

export function MetricRow({
  label,
  summary,
  status,
  percentile,
  trend,
  technical,
  sourceAttribution,
}: MetricRowProps) {
  return (
    <div className="rounded-lg border border-fiscmak-border bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-data-label">{label}</p>
        {status && <StatusChip status={status} />}
      </div>
      <p className="mt-2 text-sm text-fiscmak-ink">{summary}</p>
      {percentile != null && (
        <p className="mt-1 text-caption">Benchmark: {percentile}th percentile</p>
      )}
      {trend && <p className="mt-1 text-caption">{trend}</p>}
      {(technical || sourceAttribution) && (
        <TechnicalDetailToggle
          technical={technical}
          sources={sourceAttribution}
        />
      )}
    </div>
  );
}

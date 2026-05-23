"use client";

import { StatusChip } from "@/components/ui/StatusChip";
import type { MetricStatus } from "@/lib/design-system";
import { cn } from "@/lib/utils";

type DashboardMetricBarProps = {
  label: string;
  summary: string;
  percent: number;
  status?: MetricStatus;
  trend?: "up" | "flat" | "down";
  sparkline?: number[];
};

function barColor(status?: MetricStatus): string {
  if (status === "strong") return "bg-fm-strong";
  if (status === "needs_attention") return "bg-fm-attention";
  if (status === "developing") return "bg-fm-developing";
  return "bg-fm-neutral";
}

function Sparkline({ values, trend }: { values: number[]; trend?: "up" | "flat" | "down" }) {
  const max = Math.max(...values, 1);
  const stroke =
    trend === "up" ? "#059669" : trend === "down" ? "#DC2626" : "#94A3B8";
  const points = values
    .map((v, i) => {
      const x = (i / Math.max(1, values.length - 1)) * 40;
      const y = 12 - (v / max) * 10;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={44} height={14} className="opacity-80" aria-hidden>
      <polyline fill="none" stroke={stroke} strokeWidth={1.5} points={points} />
    </svg>
  );
}

export function DashboardMetricBar({
  label,
  summary,
  percent,
  status,
  trend,
  sparkline,
}: DashboardMetricBarProps) {
  return (
    <div className="group rounded-lg border border-fiscmak-border/60 bg-fm-background/50 px-3 py-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-data-label">{label}</p>
        <div className="flex items-center gap-2">
          {sparkline && sparkline.length > 1 && (
            <span className="hidden group-hover:inline sm:inline">
              <Sparkline values={sparkline} trend={trend} />
            </span>
          )}
          {status && <StatusChip status={status} />}
        </div>
      </div>
      <p className="mt-1 text-sm text-fiscmak-ink">{summary}</p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-fiscmak-subtle">
        <div
          className={cn("h-full rounded-full transition-all", barColor(status))}
          style={{ width: `${Math.min(100, Math.max(0, percent))}%` }}
        />
      </div>
    </div>
  );
}

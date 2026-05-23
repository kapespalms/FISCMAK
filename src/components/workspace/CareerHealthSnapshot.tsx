"use client";

import { StatusChip } from "@/components/ui/StatusChip";
import { ScoreDisplay } from "@/components/ui/ScoreDisplay";
import { TechnicalDetailToggle, DataSourceTooltip } from "@/components/ui/TechnicalDetailToggle";
import type { CareerHealthDomain, CareerHealthMetric, CareerHealthView } from "@/lib/v2/career-health-view";

function DomainRow({ domain }: { domain: CareerHealthDomain }) {
  const sources =
    typeof domain.technical.data_sources === "string"
      ? domain.technical.data_sources
      : "Career Profile, validated instruments, CV parse";

  return (
    <div className="rounded-lg border border-fiscmak-border bg-fm-surface p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-data-value">{domain.label}</p>
            <StatusChip status={domain.status} />
          </div>
          <p className="mt-2 text-sm text-fiscmak-muted">{domain.summary}</p>
          <DataSourceTooltip sources={sources} />
        </div>
        <p className="text-data-value tabular-nums">{domain.score}</p>
      </div>
      <TechnicalDetailToggle technical={domain.technical} />
    </div>
  );
}

function MetricRow({ metric }: { metric: CareerHealthMetric }) {
  return (
    <div className="rounded-lg border border-fiscmak-border bg-fm-surface p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-data-value">{metric.label}</p>
        {metric.status && <StatusChip status={metric.status} />}
      </div>
      <p className="mt-2 text-sm text-fiscmak-muted">{metric.summary}</p>
      <TechnicalDetailToggle
        technical={metric.technical}
        sources="Stanford PFI, BITS, physician career development research"
      />
    </div>
  );
}

export function CareerHealthSnapshot({
  view,
  previousScore,
}: {
  view: CareerHealthView;
  previousScore?: number | null;
}) {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-data-label">{view.dashboard_title}</p>
        <h2 className="text-section-header mt-1">Career Health snapshot</h2>
        <p className="mt-2 text-sm text-fiscmak-muted">{view.intro}</p>
      </div>

      <div className="rounded-xl border border-fiscmak-border bg-fm-surface p-6 shadow-sm">
        <p className="text-data-label">Career Health Score</p>
        <div className="mt-2">
          <ScoreDisplay value={view.career_health_score} previousValue={previousScore} />
        </div>
        <p className="mt-3 text-sm text-fiscmak-ink">{view.career_health_summary}</p>
        <p className="mt-3 text-caption italic">{view.weights_adjustable_note}</p>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {view.domains.map((d) => (
          <DomainRow key={d.key} domain={d} />
        ))}
      </div>

      <div>
        <p className="text-data-label mb-3">Well-being and unrecognized work</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {view.wellbeing_metrics.map((m) => (
            <MetricRow key={m.id} metric={m} />
          ))}
        </div>
      </div>

      <p className="text-sm text-fiscmak-muted">
        <span className="font-semibold text-fiscmak-ink">Reflection:</span> {view.aspiration_prompt}
      </p>
    </div>
  );
}

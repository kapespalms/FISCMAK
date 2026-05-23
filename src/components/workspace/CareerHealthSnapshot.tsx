"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { CareerHealthDomain, CareerHealthMetric, CareerHealthView } from "@/lib/v2/career-health-view";
import { trafficLightEmoji } from "@/lib/v2/career-language";

function TechnicalDetail({ technical }: { technical: Record<string, unknown> }) {
  const [open, setOpen] = useState(false);
  const entries = Object.entries(technical).filter(([, v]) => v != null);

  if (entries.length === 0) return null;

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-xs text-fiscmak-green hover:underline"
      >
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        Show technical detail
      </button>
      {open && (
        <dl className="mt-2 space-y-1 rounded-md bg-fiscmak-subtle px-3 py-2 text-xs">
          {entries.map(([key, value]) => (
            <div key={key} className="flex gap-2">
              <dt className="shrink-0 font-mono text-fiscmak-muted">{key}:</dt>
              <dd className="break-all">
                {Array.isArray(value) ? value.join(", ") : String(value)}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

function DomainRow({ domain }: { domain: CareerHealthDomain }) {
  return (
    <div className="rounded-lg border border-fiscmak-border p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">
            {trafficLightEmoji(domain.traffic_light)} {domain.label}
          </p>
          <p className="mt-1 text-sm text-fiscmak-muted">{domain.summary}</p>
        </div>
        <p className="text-lg font-bold tabular-nums">{domain.score}</p>
      </div>
      <TechnicalDetail technical={domain.technical} />
    </div>
  );
}

function MetricRow({ metric }: { metric: CareerHealthMetric }) {
  return (
    <div className="rounded-lg border border-fiscmak-border p-4">
      <p className="font-semibold">
        {metric.traffic_light ? `${trafficLightEmoji(metric.traffic_light)} ` : ""}
        {metric.label}
      </p>
      <p className="mt-1 text-sm text-fiscmak-muted">{metric.summary}</p>
      <TechnicalDetail technical={metric.technical} />
    </div>
  );
}

export function CareerHealthSnapshot({ view }: { view: CareerHealthView }) {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase text-fiscmak-muted">{view.dashboard_title}</p>
        <h2 className="mt-1 text-xl font-bold">Career Health snapshot</h2>
        <p className="mt-2 text-sm text-fiscmak-muted">{view.intro}</p>
      </div>

      <div className="rounded-xl border-2 border-fiscmak-green/30 bg-fiscmak-green-light/30 p-5">
        <p className="text-xs font-semibold uppercase text-fiscmak-muted">Career Health Score</p>
        <p className="mt-1 text-5xl font-bold text-fiscmak-green">{view.career_health_score}</p>
        <p className="mt-2 text-sm">{view.career_health_summary}</p>
        <p className="mt-3 text-xs text-fiscmak-muted italic">{view.weights_adjustable_note}</p>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {view.domains.map((d) => (
          <DomainRow key={d.key} domain={d} />
        ))}
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold">Well-being & invisible work</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {view.wellbeing_metrics.map((m) => (
            <MetricRow key={m.id} metric={m} />
          ))}
        </div>
      </div>

      <p className="text-sm text-fiscmak-muted">
        <span className="font-semibold">Reflection:</span> {view.aspiration_prompt}
      </p>
    </div>
  );
}

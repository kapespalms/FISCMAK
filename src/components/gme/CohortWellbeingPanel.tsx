"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { CohortWellbeingAggregate, WellbeingBand } from "@/lib/v2/gme/cohort-wellbeing-aggregate";

type Props = {
  programSlug: string;
};

export function CohortWellbeingPanel({ programSlug }: Props) {
  const [aggregate, setAggregate] = useState<CohortWellbeingAggregate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/v1/programs/${encodeURIComponent(programSlug)}/cohort-wellbeing`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Could not load well-being data.");
      setAggregate(data.aggregate ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load well-being data.");
      setAggregate(null);
    } finally {
      setLoading(false);
    }
  }, [programSlug]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-cx-label uppercase">GME · Program</p>
          <h3 className="mt-1 text-lg font-semibold text-cx-text">Well-being overview</h3>
          <p className="mt-1 text-sm text-cx-text/60">
            De-identified program-level signals · N≥5 required · no individual data
          </p>
        </div>
        <Button variant="secondary" onClick={() => void load()} disabled={loading}>
          {loading ? "Loading…" : "Refresh"}
        </Button>
      </div>

      {error && <p className="mt-3 text-sm text-cx-text/70">{error}</p>}

      {aggregate && (
        <div className="mt-5 space-y-5">
          {aggregate.suppressed ? (
            <div className="rounded-lg border border-cx-forest-dark/10 bg-[#E7DEC9]/30 px-4 py-3 text-sm text-cx-text/70">
              <p className="font-semibold text-cx-text">Aggregate not yet available</p>
              <p className="mt-1">
                Program-level well-being requires at least 5 residents with data. Currently{" "}
                {aggregate.n === 0 ? "no residents are linked" : `${aggregate.n} resident${aggregate.n !== 1 ? "s are" : " is"} linked`}
                . Signals will appear once the cohort reaches the minimum threshold.
              </p>
            </div>
          ) : (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <PrevalenceCard
                  label="Burnout signal"
                  description="Recent high emotional exhaustion or disengagement"
                  prevalence={aggregate.burnout.prevalence}
                  band={aggregate.burnout.band}
                  respondentN={aggregate.burnout.respondent_n}
                  suppressed={aggregate.burnout.suppressed}
                />
                <PrevalenceCard
                  label="Moral distress"
                  description="Recent high moral distress (≥4 on 0–10 scale)"
                  prevalence={aggregate.mdt_distress.prevalence}
                  band={aggregate.mdt_distress.band}
                  respondentN={aggregate.mdt_distress.respondent_n}
                  suppressed={aggregate.mdt_distress.suppressed}
                />
                <PrevalenceCard
                  label="Work well-being signal"
                  description="Concern signal from recent monthly check-in"
                  prevalence={aggregate.fcwi_concern.prevalence}
                  band={aggregate.fcwi_concern.band}
                  respondentN={aggregate.fcwi_concern.respondent_n}
                  suppressed={aggregate.fcwi_concern.suppressed}
                />
              </div>

              <RetentionRow aggregate={aggregate} />

              {aggregate.environment.respondent_n >= 5 && (
                <EnvironmentRow aggregate={aggregate} />
              )}

              {aggregate.quarterly_trend.length >= 2 && (
                <TrendSparkline trend={aggregate.quarterly_trend} />
              )}

              <p className="text-[11px] text-cx-text/40">
                Based on {aggregate.n} residents · computed {new Date(aggregate.computed_at).toLocaleDateString()} ·
                {" "}de-identified program-level aggregates only · N≥5 required · no individual data
              </p>
            </>
          )}
        </div>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Subcomponents
// ---------------------------------------------------------------------------

const BAND_BG: Record<WellbeingBand, string> = {
  low_concern: "bg-[#3C8A60]/15",
  watch: "bg-[#C2D0DD]/50",
  elevated: "bg-[#C28D6C]/20",
};

const BAND_TEXT: Record<WellbeingBand, string> = {
  low_concern: "text-[#3C8A60]",
  watch: "text-[#34597A]",
  elevated: "text-[#C28D6C]",
};

const BAND_LABEL: Record<WellbeingBand, string> = {
  low_concern: "Low concern",
  watch: "Watch",
  elevated: "Elevated",
};

const BAND_BAR_COLOR: Record<WellbeingBand, string> = {
  low_concern: "bg-[#3C8A60]/50",
  watch: "bg-[#6E93B8]/50",
  elevated: "bg-[#C28D6C]/60",
};

function PrevalenceCard({
  label,
  description,
  prevalence,
  band,
  respondentN,
  suppressed,
}: {
  label: string;
  description: string;
  prevalence: number | null;
  band: WellbeingBand | null;
  respondentN: number;
  suppressed: boolean;
}) {
  const pct = prevalence != null ? Math.round(prevalence * 100) : null;
  const effectiveBand = band ?? "low_concern";

  if (suppressed) {
    return (
      <div className="rounded-lg border border-cx-forest-dark/10 bg-[#F4EFE6]/40 p-4">
        <p className="text-xs font-semibold text-cx-text/60 uppercase tracking-wide">{label}</p>
        <p className="mt-2 text-xs text-cx-text/50">
          N≥5 required · {respondentN} respondent{respondentN !== 1 ? "s" : ""} so far
        </p>
        <p className="mt-1.5 text-[11px] text-cx-text/35">{description}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-cx-forest-dark/10 p-4">
      <p className="text-xs font-semibold text-cx-text/60 uppercase tracking-wide">{label}</p>
      <div className="mt-2 flex items-end gap-2">
        <span className="text-2xl font-semibold text-cx-text tabular-nums">
          {pct != null ? `${pct}%` : "—"}
        </span>
        {band && (
          <span
            className={`mb-0.5 rounded-full px-2 py-0.5 text-[11px] font-medium ${BAND_BG[effectiveBand]} ${BAND_TEXT[effectiveBand]}`}
          >
            {BAND_LABEL[effectiveBand]}
          </span>
        )}
      </div>
      {pct != null && band && (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-cx-forest-dark/8">
          <div
            className={`h-full rounded-full transition-all ${BAND_BAR_COLOR[effectiveBand]}`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      )}
      <p className="mt-1.5 text-[11px] text-cx-text/45">{description} · {respondentN} residents</p>
    </div>
  );
}

function RetentionRow({ aggregate }: { aggregate: CohortWellbeingAggregate }) {
  const { retention } = aggregate;

  if (retention.pending) {
    return (
      <div className="rounded-lg border border-cx-forest-dark/10 px-4 py-3">
        <p className="text-sm font-semibold text-cx-text">Retention signal</p>
        <p className="mt-1 text-sm text-cx-text/55">
          Pending — institutional anchoring data is collected at onboarding. Will appear once
          enough residents have completed Day-0 setup.
        </p>
      </div>
    );
  }

  if (retention.suppressed) {
    return (
      <div className="rounded-lg border border-cx-forest-dark/10 bg-[#F4EFE6]/40 px-4 py-3">
        <p className="text-sm font-semibold text-cx-text">Retention signal</p>
        <p className="mt-1 text-sm text-cx-text/55">
          N≥5 required — {retention.respondent_n} resident{retention.respondent_n !== 1 ? "s" : ""} have
          completed this step so far.
        </p>
      </div>
    );
  }

  const pct = retention.prevalence != null ? Math.round(retention.prevalence * 100) : null;

  return (
    <div
      className={`rounded-lg border px-4 py-3 ${
        retention.flagged
          ? "border-[#C28D6C]/40 bg-[#C28D6C]/8"
          : "border-cx-forest-dark/10"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-semibold text-cx-text">Retention signal</p>
        {retention.flagged && (
          <span className="rounded-full bg-[#C28D6C]/20 px-2 py-0.5 text-[11px] font-medium text-[#C28D6C]">
            &gt;25% — review at next CCC
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-cx-text/70">
        {pct != null ? (
          <>
            <span className="font-semibold">{pct}%</span> of residents considering a move in the
            next 2 years.
          </>
        ) : (
          "Insufficient data."
        )}
        {!retention.flagged && pct != null && " No threshold concern at this time."}
      </p>
      <p className="mt-1 text-[11px] text-cx-text/40">
        Institutional anchoring signal · aggregate only · Day-0 data
      </p>
    </div>
  );
}

function EnvironmentRow({ aggregate }: { aggregate: CohortWellbeingAggregate }) {
  const { environment } = aggregate;
  const valPct =
    environment.values_alignment_mean != null
      ? Math.round(((environment.values_alignment_mean - 1) / 4) * 100)
      : null;
  const schedPct =
    environment.schedule_control_mean != null
      ? Math.round(((environment.schedule_control_mean - 1) / 4) * 100)
      : null;

  return (
    <div className="rounded-lg border border-cx-forest-dark/10 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-cx-text/60">
        Environment signals
      </p>
      <p className="mt-0.5 text-[11px] text-cx-text/40">
        Mean 1–5 · {environment.respondent_n} residents with Day-0 data
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <BarMean
          label="Values alignment"
          mean={environment.values_alignment_mean}
          pct={valPct}
        />
        <BarMean
          label="Schedule control"
          mean={environment.schedule_control_mean}
          pct={schedPct}
        />
      </div>
    </div>
  );
}

function BarMean({
  label,
  mean,
  pct,
}: {
  label: string;
  mean: number | null;
  pct: number | null;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-xs text-cx-text/60">{label}</p>
        <p className="text-sm font-semibold text-cx-text tabular-nums">
          {mean != null ? mean.toFixed(1) : "—"}
        </p>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-cx-forest-dark/8">
        {pct != null && (
          <div
            className="h-full rounded-full bg-[#6E93B8]/60 transition-all"
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        )}
      </div>
    </div>
  );
}

function TrendSparkline({
  trend,
}: {
  trend: CohortWellbeingAggregate["quarterly_trend"];
}) {
  const W = 240;
  const H = 48;
  const PAD = 6;
  const innerW = W - PAD * 2;
  const innerH = H - PAD * 2;

  const points = trend.map((t, i) => ({
    x: PAD + (i / Math.max(trend.length - 1, 1)) * innerW,
    y: t.burnout_prevalence != null
      ? H - PAD - t.burnout_prevalence * innerH
      : null,
    quarter: t.quarter,
    suppressed: t.burnout_prevalence == null,
  }));

  const pathParts: string[] = [];
  let pen: "up" | "down" = "down";
  for (const pt of points) {
    if (pt.y == null) { pen = "down"; continue; }
    pathParts.push(`${pen === "down" ? "M" : "L"}${pt.x.toFixed(1)},${pt.y.toFixed(1)}`);
    pen = "up";
  }

  return (
    <div className="rounded-lg border border-cx-forest-dark/10 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-cx-text/60">
        Quarterly burnout signal — trend
      </p>
      <p className="mt-0.5 text-[11px] text-cx-text/40">
        Aggregate prevalence by quarter · gaps = below N≥5 threshold
      </p>
      <div className="mt-3 overflow-x-auto">
        <svg
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          className="block"
          aria-label="Quarterly burnout prevalence sparkline"
        >
          {pathParts.length > 0 && (
            <path
              d={pathParts.join(" ")}
              fill="none"
              stroke="#6E93B8"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
          {points.map((pt, i) =>
            pt.y != null ? (
              <circle
                key={i}
                cx={pt.x}
                cy={pt.y}
                r={3}
                fill="#6E93B8"
                opacity={0.8}
              >
                <title>
                  {pt.quarter}: {trend[i]?.burnout_prevalence != null
                    ? `${Math.round(trend[i]!.burnout_prevalence! * 100)}%`
                    : "—"}
                </title>
              </circle>
            ) : null,
          )}
        </svg>
        <div className="mt-1 flex justify-between px-1 text-[10px] text-cx-text/35">
          {trend.length > 0 && <span>{trend[0]?.quarter}</span>}
          {trend.length > 1 && <span>{trend[trend.length - 1]?.quarter}</span>}
        </div>
      </div>
    </div>
  );
}

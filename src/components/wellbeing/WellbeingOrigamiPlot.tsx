"use client";

import { useEffect, useState } from "react";
import type { OrigamiAxisData, OrigamiResult, TrendPoint } from "@/app/api/v1/wellbeing/origami/route";

// ---------------------------------------------------------------------------
// Inline color helpers — no new npm deps
// Muted palette: warm amber for concerning direction, teal for positive.
// Luxury restrained: no neon, nothing alarming.
// ---------------------------------------------------------------------------

// Each axis has a "good" band and a "concern" band.
// For lower_better: low values = good (teal), high values = concerning (amber)
// For higher_better: high values = good (teal), low values = muted (warm gray)

const COLORS = {
  teal:       "rgb(52, 115, 105)",   // positive fill
  teal_light: "rgb(180, 220, 215)",  // positive fill (below threshold, building)
  amber:      "rgb(180, 100, 40)",   // concern fill (above threshold, concerning)
  amber_faint:"rgb(220, 180, 150)",  // mild concern (below threshold, lower_better)
  track:      "rgb(230, 234, 236)",  // unfilled track
  threshold:  "rgba(255,255,255,0.9)", // threshold marker line
} as const;

function axisFillColor(
  normalized: number,
  threshold: number,
  direction: OrigamiAxisData["direction"],
): string {
  if (direction === "lower_better") {
    // High = concerning
    return normalized >= threshold ? COLORS.amber : COLORS.amber_faint;
  }
  // higher_better: high = positive
  return normalized >= threshold ? COLORS.teal : COLORS.teal_light;
}

// ---------------------------------------------------------------------------
// Single origami axis strip
// ---------------------------------------------------------------------------

function OrigamiAxis({ axis }: { axis: OrigamiAxisData }) {
  const { label, normalized, threshold, direction } = axis;

  if (normalized === null) {
    // No data yet — show placeholder track
    return (
      <div className="flex items-center gap-3">
        <span className="w-52 shrink-0 text-right text-[11px] font-medium text-cx-text/50">
          {label}
        </span>
        <div
          className="relative h-5 flex-1 rounded-sm"
          style={{ backgroundColor: COLORS.track }}
          aria-label={`${label}: no data yet`}
        >
          <div
            className="absolute inset-y-0"
            style={{
              left: `${threshold * 100}%`,
              width: 2,
              backgroundColor: "rgba(0,0,0,0.10)",
            }}
          />
        </div>
        <span className="w-20 text-[10px] text-cx-text/35">no data yet</span>
      </div>
    );
  }

  const fillPct  = Math.round(normalized * 100);
  const fillColor = axisFillColor(normalized, threshold, direction);

  // Accessibility: describe position relative to threshold without raw numbers
  const positionDesc =
    direction === "lower_better"
      ? normalized >= threshold ? "in the concern range" : "in the manageable range"
      : normalized >= threshold ? "in the positive range" : "in the building range";

  return (
    <div className="flex items-center gap-3">
      <span className="w-52 shrink-0 text-right text-[11px] font-medium text-cx-text/70">
        {label}
      </span>
      <div
        role="meter"
        aria-label={`${label}: ${positionDesc}`}
        aria-valuenow={fillPct}
        aria-valuemin={0}
        aria-valuemax={100}
        className="relative h-5 flex-1 overflow-hidden rounded-sm"
        style={{ backgroundColor: COLORS.track }}
      >
        {/* Filled portion */}
        <div
          className="absolute inset-y-0 left-0 transition-all duration-500"
          style={{ width: `${fillPct}%`, backgroundColor: fillColor }}
        />
        {/* Threshold marker */}
        <div
          aria-hidden="true"
          className="absolute inset-y-0"
          style={{
            left: `${threshold * 100}%`,
            width: 2,
            backgroundColor: COLORS.threshold,
            zIndex: 1,
          }}
        />
      </div>
      {/* Contextual label — no raw number, no instrument name */}
      <span
        className="w-20 text-[10px] leading-tight"
        style={{
          color: direction === "lower_better"
            ? normalized >= threshold ? COLORS.amber : "rgb(100,130,120)"
            : normalized >= threshold ? COLORS.teal  : "rgb(140,120,90)",
        }}
      >
        {direction === "lower_better"
          ? normalized >= threshold ? "high" : "manageable"
          : normalized >= threshold ? "positive" : "building"}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Trend sparklines — inline SVG, no D3, no new deps
// Shows EE / DP / QoL / MDT over last 16 weeks in plain language.
// ---------------------------------------------------------------------------

type NumericTrendKey = "ee" | "dp" | "qol" | "mdt";
const TREND_AXES: { key: NumericTrendKey; label: string; max: number; reverse: boolean }[] = [
  { key: "ee",  label: "Feeling depleted",     max: 4,  reverse: true  },
  { key: "dp",  label: "Feeling disconnected",  max: 4,  reverse: true  },
  { key: "qol", label: "Overall quality",       max: 4,  reverse: false },
  { key: "mdt", label: "Distress level",        max: 10, reverse: true  },
];

function Sparkline({ points, max, reverse, label }: {
  points: Array<number | null>;
  max: number;
  reverse: boolean;
  label: string;
}) {
  const W = 100;
  const H = 36;
  const PAD = 3;
  const valid = points.filter((p) => p !== null);
  if (valid.length < 2) {
    return (
      <div className="flex flex-col items-center gap-1">
        <svg width={W} height={H} aria-label={`${label} trend`}>
          <text x={W / 2} y={H / 2 + 4} textAnchor="middle" fontSize="8" fill="rgb(180,185,188)">
            no data
          </text>
        </svg>
        <span className="text-[9px] text-cx-text/40">{label}</span>
      </div>
    );
  }

  const n = points.length;
  const plotPoints = points.map((v, i) => {
    if (v === null) return null;
    const x = PAD + (i / Math.max(n - 1, 1)) * (W - PAD * 2);
    const normalizedY = v / max;
    // reverse = higher value is worse, so draw higher = higher on chart (more concerning = visually higher)
    const y = PAD + (reverse ? normalizedY : 1 - normalizedY) * (H - PAD * 2);
    return { x, y, v };
  });

  const segments: string[] = [];
  let pathStr = "";
  let inSegment = false;
  for (const pt of plotPoints) {
    if (!pt) { inSegment = false; continue; }
    if (!inSegment) { pathStr += `M${pt.x.toFixed(1)},${pt.y.toFixed(1)}`; inSegment = true; }
    else            { pathStr += `L${pt.x.toFixed(1)},${pt.y.toFixed(1)}`; }
  }
  if (pathStr) segments.push(pathStr);

  const lastPt = plotPoints.filter(Boolean).at(-1);

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={W} height={H} aria-label={`${label} trend`}>
        {segments.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="rgb(52,115,105)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        ))}
        {plotPoints.map((pt, i) =>
          pt ? (
            <circle key={i} cx={pt.x} cy={pt.y} r={1.5} fill="rgb(52,115,105)" />
          ) : null,
        )}
        {lastPt && (
          <circle cx={lastPt.x} cy={lastPt.y} r={3} fill="rgb(52,115,105)" stroke="white" strokeWidth={1} />
        )}
      </svg>
      <span className="text-[9px] text-cx-text/55">{label}</span>
    </div>
  );
}

function TrendLines({ trends }: { trends: TrendPoint[] }) {
  if (trends.length < 2) return null;

  return (
    <div className="mt-5 space-y-2 border-t border-cx-forest-dark/10 pt-4">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-cx-text/40">
        Trends over time
      </p>
      <div className="flex flex-wrap gap-6">
        {TREND_AXES.map(({ key, label, max, reverse }) => (
          <Sparkline
            key={key}
            points={trends.map((t) => t[key] ?? null)}
            max={max}
            reverse={reverse}
            label={label}
          />
        ))}
      </div>
      <p className="text-[9px] text-cx-text/35">
        Each dot is one weekly check-in · {trends.length} recorded
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MDT resource link — shown only when mdt_flag
// Plain language; no mention of MDT, instrument names, or numeric threshold.
// ---------------------------------------------------------------------------

function DistressResourceLink() {
  return (
    <div className="mt-4 rounded-lg border border-cx-forest-dark/15 bg-cx-forest-dark/[0.03] px-4 py-3">
      <p className="text-sm text-cx-text/80">
        Some responses suggest you may benefit from speaking with a colleague or wellness resource.
      </p>
      <p className="mt-1 text-xs text-cx-text/55">
        This reflection is just for you — nothing is shared automatically.{" "}
        <a
          href="https://www.acgme.org/residents-and-fellows/physician-well-being-resources/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-cx-text/80"
        >
          Wellness resources
        </a>
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function WellbeingOrigamiPlot() {
  const [data, setData]       = useState<OrigamiResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetch("/api/v1/wellbeing/origami")
      .then((r) => r.json() as Promise<OrigamiResult>)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-sm text-cx-text/50">Loading…</p>;
  }

  if (!data || !data.has_data) {
    return (
      <p className="text-sm text-cx-text/60">
        Patterns across your check-ins will appear here once you have completed a few regular check-ins.
      </p>
    );
  }

  return (
    <div className="space-y-1.5">
      {/* Seven independent axes — no connecting polygon, no composite score (§C governance) */}
      {data.axes.map((axis) => (
        <OrigamiAxis key={axis.label} axis={axis} />
      ))}

      {/* MDT resource link — surfaced only when distress flag is set */}
      {data.mdt_flag && <DistressResourceLink />}

      {/* Plain-language summary — no instrument names, no raw numbers */}
      {data.summary && !data.mdt_flag && (
        <p className="mt-3 text-xs text-cx-text/60">{data.summary}</p>
      )}

      {/* Longitudinal trend lines — separate from origami, as specified */}
      <TrendLines trends={data.trends} />
    </div>
  );
}

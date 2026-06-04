"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { QuadrantShare, QuadrantSummaryResult } from "@/app/api/v1/lattice/quadrant-summary/route";

// ---------------------------------------------------------------------------
// Quadrant metadata — plain language, no instrument names
// ---------------------------------------------------------------------------

const QUADRANT_META: Record<string, { label: string; axis: string; description: string; colorClass: string }> = {
  OV: {
    label:       "Objective · Visible",
    axis:        "OV",
    description: "Counted, recorded, externally verified work",
    colorClass:  "bg-emerald-500 text-white",
  },
  OI: {
    label:       "Objective · Invisible",
    axis:        "OI",
    description: "Concrete work not captured in institutional records",
    colorClass:  "bg-[#E7DEC9] text-[#20201D]",
  },
  SV: {
    label:       "Subjective · Visible",
    axis:        "SV",
    description: "How your institution sees your work",
    colorClass:  "bg-sky-400 text-sky-950",
  },
  SI: {
    label:       "Subjective · Invisible",
    axis:        "SI",
    description: "Inner experience not expressed or recognized",
    colorClass:  "bg-violet-400 text-violet-950",
  },
};

// ---------------------------------------------------------------------------
// Cell — size proportional to share (min 15% so tiny cells still read)
// ---------------------------------------------------------------------------

const MIN_DISPLAY_PCT = 15;

function cellSizePct(share: number): number {
  if (share === 0) return MIN_DISPLAY_PCT;
  return Math.max(MIN_DISPLAY_PCT, Math.round(share * 100));
}

function QuadrantCell({ q, hasData }: { q: QuadrantShare; hasData: boolean }) {
  const meta = QUADRANT_META[q.quadrant]!;
  const sizePct = cellSizePct(q.share);

  return (
    <div
      className={cn(
        "flex flex-col justify-between rounded-xl p-3 transition-all",
        hasData ? meta.colorClass : "bg-cx-forest-dark/5 text-cx-forest-dark/40",
      )}
      style={{ minHeight: `${sizePct * 1.2}px` }}
    >
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wide opacity-75">
          {meta.axis}
        </p>
        <p className="mt-0.5 text-xs font-medium leading-tight">{meta.label}</p>
      </div>
      <p className={cn("text-xl font-bold", hasData ? "" : "opacity-30")}>
        {hasData ? `${q.pct}%` : "—"}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type Props = {
  prefetchedData?: QuadrantSummaryResult;
};

export function QuadrantSummaryV3({ prefetchedData }: Props) {
  const [data, setData] = useState<QuadrantSummaryResult | null>(prefetchedData ?? null);
  const [loading, setLoading] = useState(!prefetchedData);

  useEffect(() => {
    if (prefetchedData) return;
    void fetch("/api/v1/lattice/quadrant-summary")
      .then((r) => r.json() as Promise<QuadrantSummaryResult>)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [prefetchedData]);

  if (loading) {
    return <p className="text-sm text-cx-forest-dark/50">Loading…</p>;
  }

  if (!data || data.total_density === 0) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-cx-forest-dark/70">
          Your career picture will appear here once evidence is confirmed.
        </p>
        <p className="text-xs text-cx-forest-dark/50">
          The four quadrants show how your work is distributed across visible and
          invisible, objective and subjective dimensions.
        </p>
      </div>
    );
  }

  const hasData = data.total_density > 0;
  const invisPct = Math.round(data.invisible_fraction * 100);

  // Map quadrant list to a 2×2 layout: top row = OV, OI; bottom = SV, SI
  const byQ = Object.fromEntries(data.quadrants.map((q) => [q.quadrant, q]));

  return (
    <div className="space-y-4">
      {/* Invisible-fraction headline — the "aha" */}
      {hasData && (
        <div className="rounded-xl border border-cx-forest-dark/10 bg-cx-forest-dark/[0.03] px-4 py-3">
          <p className="text-sm text-cx-forest-dark">
            <span className="text-2xl font-bold text-cx-forest-dark">{invisPct}%</span>
            {" "}of your confirmed career evidence is invisible to institutional records.
          </p>
          <p className="mt-1 text-xs text-cx-forest-dark/50">
            Invisible work (objective + subjective) that accumulates live over time.
          </p>
        </div>
      )}

      {/* 2×2 grid */}
      <div className="grid grid-cols-2 gap-2">
        {/* Header labels */}
        <p className="col-span-1 text-center text-[10px] font-semibold uppercase tracking-wide text-cx-forest-dark/40">
          Visible
        </p>
        <p className="col-span-1 text-center text-[10px] font-semibold uppercase tracking-wide text-cx-forest-dark/40">
          Invisible
        </p>

        {/* Row 1: Objective */}
        <QuadrantCell q={byQ.OV!} hasData={hasData} />
        <QuadrantCell q={byQ.OI!} hasData={hasData} />

        {/* Row 2: Subjective */}
        <QuadrantCell q={byQ.SV!} hasData={hasData} />
        <QuadrantCell q={byQ.SI!} hasData={hasData} />
      </div>

      {/* Row axis labels */}
      <div className="grid grid-cols-[auto_1fr_1fr] items-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-cx-forest-dark/40">
        <span />
        <span className="text-center">Objective</span>
        <span className="text-center">Subjective</span>
      </div>

      <p className="text-xs text-cx-forest-dark/40">
        Proportional to your confirmed evidence density. Invisible work grows as you log
        daily activities — this picture fills in over time.
      </p>
    </div>
  );
}

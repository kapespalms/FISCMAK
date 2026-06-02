"use client";

import { Fragment, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { SKILLS, DOMAINS } from "@/lib/constants";
import type { HeatmapCell, HeatmapResult } from "@/app/api/v1/lattice/heatmap/route";

// ---------------------------------------------------------------------------
// Axis labels (post vocabulary un-flip)
//   SKILL_SHORT — row axis (skill_index) — abbreviated task/skill names
//   DOMAIN_SHORT — column axis (domain_index) — abbreviated identity names
// ---------------------------------------------------------------------------

const SKILL_SHORT  = SKILLS.map((s) =>
  s.split(" ").slice(0, 2).join(" ").replace("&", "&"),
) as string[];

const DOMAIN_SHORT = DOMAINS.map((d) =>
  d.split("/")[0]!.trim(),
) as string[];

// ---------------------------------------------------------------------------
// Cell color — density intensity × energy hue (ipsative)
//
// Energy tiers:  energizing (4–5), neutral (3 or unrated), draining (1–2)
// Density tiers: empty (0), low (0–0.33), medium (0.33–0.67), high (0.67–1)
//
// Color matrix keeps the app's cx-forest-dark green palette for energizing
// work and shifts to amber for draining work so the "danger zone" (high-
// density draining) reads clearly without numerical scores.
// ---------------------------------------------------------------------------

function cellColorClass(densityNorm: number, energyRank: number | null): string {
  if (densityNorm === 0) return "bg-cx-forest-dark/5 border-cx-forest-dark/10 text-transparent";

  const tier = densityNorm >= 0.67 ? "high" : densityNorm >= 0.33 ? "mid" : "low";
  const energy = energyRank == null ? "neutral"
    : energyRank >= 4 ? "energizing"
    : energyRank <= 2 ? "draining"
    : "neutral";

  const map: Record<string, string> = {
    // Energizing — green family (strength zone)
    "low-energizing":    "bg-emerald-100  border-emerald-300  text-emerald-700",
    "mid-energizing":    "bg-emerald-300  border-emerald-500  text-emerald-900",
    "high-energizing":   "bg-emerald-500  border-emerald-700  text-white",
    // Neutral — cx-forest-dark grey-green
    "low-neutral":       "bg-cx-forest-dark/10 border-cx-forest-dark/20 text-cx-forest-dark/70",
    "mid-neutral":       "bg-cx-forest-dark/25 border-cx-forest-dark/40 text-cx-forest-dark",
    "high-neutral":      "bg-cx-forest-dark/50 border-cx-forest-dark/70 text-white",
    // Draining — amber family (visible misalignment / danger zone)
    "low-draining":      "bg-amber-100    border-amber-300    text-amber-700",
    "mid-draining":      "bg-amber-300    border-amber-500    text-amber-900",
    "high-draining":     "bg-amber-500    border-amber-700    text-white",
  };

  return map[`${tier}-${energy}`] ?? "bg-cx-forest-dark/10 border-cx-forest-dark/20";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type Props = {
  /** Optional: bypass internal fetch and pass data directly (e.g. from a parent loader). */
  prefetchedData?: HeatmapResult;
};

export function LatticeHeatmapV3({ prefetchedData }: Props) {
  const [data, setData] = useState<HeatmapResult | null>(prefetchedData ?? null);
  const [loading, setLoading] = useState(!prefetchedData);
  const [selected, setSelected] = useState<HeatmapCell | null>(null);

  useEffect(() => {
    if (prefetchedData) return;
    void fetch("/api/v1/lattice/heatmap")
      .then((r) => r.json() as Promise<HeatmapResult>)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [prefetchedData]);

  if (loading) {
    return <p className="text-sm text-cx-forest-dark/50">Loading lattice…</p>;
  }

  if (!data || data.cells.length === 0) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-cx-forest-dark/70">
          Your career lattice will appear here once evidence is confirmed.
        </p>
        <p className="text-xs text-cx-forest-dark/50">
          Upload and confirm a CV, or log activities through Mak, to populate the lattice.
        </p>
      </div>
    );
  }

  // Build cell lookup: "skill_index:domain_index" → HeatmapCell
  const cellMap = new Map(
    data.cells.map((c) => [`${c.skill_index}:${c.domain_index}`, c]),
  );

  const NUM_SKILLS  = 8;  // row axis
  const NUM_DOMAINS = 8;  // column axis

  return (
    <div className="space-y-4">
      {/* Ipsative label */}
      <p className="text-xs text-cx-forest-dark/50">
        Intensity is relative to your own densest cell — not benchmarked against anyone else.
        Colour reflects how energizing that work is for you.
      </p>

      {/* Grid — rows = Skills (task axis), columns = Domains (identity axis) */}
      <div className="overflow-x-auto">
        <div
          className="inline-grid gap-0.5"
          style={{ gridTemplateColumns: `80px repeat(${NUM_DOMAINS}, minmax(40px, 1fr))` }}
        >
          {/* Header row — Domain identity names (column axis) */}
          <div />
          {DOMAIN_SHORT.map((domain) => (
            <div key={domain} className="px-0.5 py-1 text-center text-[9px] font-semibold leading-tight text-cx-forest-dark/50">
              {domain}
            </div>
          ))}

          {/* Data rows — Skill names (row axis) */}
          {Array.from({ length: NUM_SKILLS }, (_, si) => (
            <Fragment key={si}>
              <div className="flex items-center pr-2 text-right text-[10px] font-medium text-cx-forest-dark/60">
                {SKILL_SHORT[si]}
              </div>
              {Array.from({ length: NUM_DOMAINS }, (_, di) => {
                const cell = cellMap.get(`${si}:${di}`);
                const dn = cell?.density_normalized ?? 0;
                const er = cell?.energy_rank ?? null;
                return (
                  <button
                    key={`${si}-${di}`}
                    type="button"
                    onClick={() => setSelected(cell ?? null)}
                    title={
                      cell
                        ? `${SKILLS[si]} × ${DOMAINS[di]} · density ${cell.density.toFixed(3)} · energy ${cell.energy_rank ?? "unrated"}`
                        : `${SKILLS[si]} × ${DOMAINS[di]} · no evidence yet`
                    }
                    className={cn(
                      "h-10 w-full rounded border text-[9px] font-semibold transition-all hover:ring-1 hover:ring-cx-forest-dark/40",
                      cellColorClass(dn, er),
                      selected?.skill_index === si && selected?.domain_index === di && "ring-2 ring-cx-forest-dark",
                    )}
                  >
                    {dn > 0 ? dn.toFixed(2) : ""}
                  </button>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-cx-forest-dark/60">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded border border-emerald-500 bg-emerald-300 inline-block" />Energizing</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded border border-cx-forest-dark/40 bg-cx-forest-dark/25 inline-block" />Neutral / unrated</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded border border-amber-500 bg-amber-300 inline-block" />Draining</span>
        <span className="flex items-center gap-1.5 ml-4 text-cx-forest-dark/40">Darker = denser (ipsative)</span>
      </div>

      {/* Selected cell detail */}
      {selected && (
        <div className="rounded-xl border border-cx-forest-dark/15 bg-cx-forest-dark/[0.03] px-4 py-3">
          <p className="text-sm font-medium text-cx-forest-dark">
            {SKILLS[selected.skill_index]} × {DOMAINS[selected.domain_index]}
          </p>
          <p className="mt-1 text-xs text-cx-forest-dark/60">
            Density {selected.density.toFixed(4)} · Ipsative {(selected.density_normalized * 100).toFixed(0)}% of your max ·{" "}
            Energy {selected.energy_rank != null ? `${selected.energy_rank}/5` : "not yet rated"} ·{" "}
            Quadrant {selected.quadrant}
          </p>
        </div>
      )}
    </div>
  );
}

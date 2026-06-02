"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CAREER_DOMAINS } from "@/lib/v2/domains";
import type { HeatmapCell, HeatmapResult } from "@/app/api/v1/lattice/heatmap/route";

// ---------------------------------------------------------------------------
// Domain and track labels
// ---------------------------------------------------------------------------

const TRACK_SHORT = [
  "Clinician", "Educator", "Researcher", "Leader",
  "Advocate", "Innovator", "Qual/Safety", "Wellness",
] as const;

const DOMAIN_SHORT = CAREER_DOMAINS.map((d) =>
  d.name.split(" ")[0]!.replace("/", ""),
);

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

  // Build cell lookup: "domain:track" → HeatmapCell
  const cellMap = new Map(
    data.cells.map((c) => [`${c.domain_index}:${c.track_index}`, c]),
  );

  const NUM_DOMAINS = 8;
  const NUM_TRACKS  = 8;

  return (
    <div className="space-y-4">
      {/* Ipsative label */}
      <p className="text-xs text-cx-forest-dark/50">
        Intensity is relative to your own densest cell — not benchmarked against anyone else.
        Colour reflects how energizing that work is for you.
      </p>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div
          className="inline-grid gap-0.5"
          style={{ gridTemplateColumns: `80px repeat(${NUM_TRACKS}, minmax(40px, 1fr))` }}
        >
          {/* Header row */}
          <div />
          {TRACK_SHORT.map((track) => (
            <div key={track} className="px-0.5 py-1 text-center text-[9px] font-semibold leading-tight text-cx-forest-dark/50">
              {track}
            </div>
          ))}

          {/* Data rows */}
          {Array.from({ length: NUM_DOMAINS }, (_, di) => (
            <>
              <div key={`label-${di}`} className="flex items-center pr-2 text-right text-[10px] font-medium text-cx-forest-dark/60">
                {DOMAIN_SHORT[di]}
              </div>
              {Array.from({ length: NUM_TRACKS }, (_, ti) => {
                const cell = cellMap.get(`${di}:${ti}`);
                const dn = cell?.density_normalized ?? 0;
                const er = cell?.energy_rank ?? null;
                return (
                  <button
                    key={`${di}-${ti}`}
                    type="button"
                    onClick={() => setSelected(cell ?? null)}
                    title={
                      cell
                        ? `${CAREER_DOMAINS[di]?.name} × ${TRACK_SHORT[ti]} · density ${cell.density.toFixed(3)} · energy ${cell.energy_rank ?? "unrated"}`
                        : `${CAREER_DOMAINS[di]?.name} × ${TRACK_SHORT[ti]} · no evidence yet`
                    }
                    className={cn(
                      "h-10 w-full rounded border text-[9px] font-semibold transition-all hover:ring-1 hover:ring-cx-forest-dark/40",
                      cellColorClass(dn, er),
                      selected?.domain_index === di && selected?.track_index === ti && "ring-2 ring-cx-forest-dark",
                    )}
                  >
                    {dn > 0 ? dn.toFixed(2) : ""}
                  </button>
                );
              })}
            </>
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
            {CAREER_DOMAINS[selected.domain_index]?.name} × {TRACK_SHORT[selected.track_index]}
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

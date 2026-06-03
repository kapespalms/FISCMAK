"use client";

import { Fragment, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { SKILLS, DOMAINS } from "@/lib/constants";
import type { HeatmapCell, HeatmapResult } from "@/app/api/v1/lattice/heatmap/route";

// ---------------------------------------------------------------------------
// Axis labels (post vocabulary un-flip)
// ---------------------------------------------------------------------------

const SKILL_SHORT = SKILLS.map((s) =>
  s.split(" ").slice(0, 2).join(" ").replace("&", "&"),
) as string[];

const DOMAIN_SHORT = DOMAINS.map((d) =>
  d.split("/")[0]!.trim(),
) as string[];

// ---------------------------------------------------------------------------
// Scaffold fields — not yet in HeatmapCell; guard on absence
// ---------------------------------------------------------------------------

type CellWithScaffold = HeatmapCell & {
  /** F3 result — absent until Phase 5 wires it */
  fte_discrepancy?: number;
  /** F7 result — absent until Phase 5 wires it */
  transfer_flag?: boolean;
};

// ---------------------------------------------------------------------------
// Density fill — CVD-safe sequential single-hue ramp (cream → deep navy)
// Perceptually uniform; energy lives in the glyph, not the fill.
// ---------------------------------------------------------------------------

const DENSITY_RAMP: ReadonlyArray<{ t: number; r: number; g: number; b: number }> = [
  { t: 0.00, r: 240, g: 245, b: 250 },
  { t: 0.33, r: 176, g: 206, b: 234 },
  { t: 0.67, r: 72,  g: 122, b: 180 },
  { t: 1.00, r: 20,  g: 48,  b: 96  },
];

function lerpN(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function densityFillRGB(dn: number): [number, number, number] {
  const v = Math.min(1, Math.max(0.001, dn));
  let lo = DENSITY_RAMP[0], hi = DENSITY_RAMP[DENSITY_RAMP.length - 1];
  for (let i = 0; i < DENSITY_RAMP.length - 1; i++) {
    if (v >= DENSITY_RAMP[i]!.t && v <= DENSITY_RAMP[i + 1]!.t) {
      lo = DENSITY_RAMP[i]!;
      hi = DENSITY_RAMP[i + 1]!;
      break;
    }
  }
  const range = hi.t - lo.t;
  const frac = range > 0 ? (v - lo.t) / range : 0;
  return [
    Math.round(lerpN(lo.r, hi.r, frac)),
    Math.round(lerpN(lo.g, hi.g, frac)),
    Math.round(lerpN(lo.b, hi.b, frac)),
  ];
}

function densityToStyle(dn: number): React.CSSProperties {
  if (dn === 0) return {};
  const [r, g, b] = densityFillRGB(dn);
  return {
    backgroundColor: `rgb(${r},${g},${b})`,
    borderColor: `rgba(${r - 18},${g - 18},${b - 18},0.65)`,
    color: dn >= 0.45 ? "white" : "rgb(24,45,78)",
  };
}

// ---------------------------------------------------------------------------
// Energy glyph — muted corner dot, separate from fill
// Top-left = energizing (green), top-right = draining (rose)
// ---------------------------------------------------------------------------

const GLYPH_ENERGIZING = "rgb(74, 134, 74)";
const GLYPH_DRAINING   = "rgb(172, 78, 78)";

function EnergyGlyph({ rank }: { rank: number | null }) {
  if (rank == null) return null;
  if (rank >= 4) {
    return (
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 3, left: 3,
          width: rank === 5 ? 6 : 4,
          height: rank === 5 ? 6 : 4,
          borderRadius: "50%",
          backgroundColor: GLYPH_ENERGIZING,
          display: "block",
          flexShrink: 0,
        }}
      />
    );
  }
  if (rank <= 2) {
    return (
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 3, right: 3,
          width: rank === 1 ? 6 : 4,
          height: rank === 1 ? 6 : 4,
          borderRadius: "50%",
          backgroundColor: GLYPH_DRAINING,
          display: "block",
          flexShrink: 0,
        }}
      />
    );
  }
  return null;
}

// ---------------------------------------------------------------------------
// Tooltip helpers
// ---------------------------------------------------------------------------

const ENERGY_LABELS: Record<number, string> = {
  1: "very draining",
  2: "draining",
  3: "neutral",
  4: "energizing",
  5: "very energizing",
};

function energyLabel(rank: number | null) {
  return rank != null ? ENERGY_LABELS[rank] ?? "unrated" : "unrated";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type Props = {
  prefetchedData?: HeatmapResult;
};

export function LatticeHeatmapV3({ prefetchedData }: Props) {
  const [data, setData] = useState<HeatmapResult | null>(prefetchedData ?? null);
  const [loading, setLoading] = useState(!prefetchedData);
  const [selected, setSelected] = useState<CellWithScaffold | null>(null);

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

  const cellMap = new Map(
    data.cells.map((c) => [`${c.skill_index}:${c.domain_index}`, c as CellWithScaffold]),
  );

  const NUM_SKILLS  = 8;
  const NUM_DOMAINS = 8;

  return (
    <div className="space-y-4">
      {/* Ipsative + encoding note */}
      <p className="text-xs text-cx-forest-dark/50">
        Shade intensity = evidence density, relative to your own densest cell.
        Corner dots show energy alignment.
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
            <div
              key={domain}
              className="px-0.5 py-1 text-center text-[9px] font-semibold leading-tight text-cx-forest-dark/50"
            >
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

                // FTE border scaffold: solid until F3 value is present on the cell
                const fteBorder =
                  cell?.fte_discrepancy != null
                    ? ({ borderStyle: "dashed" } as React.CSSProperties)
                    : {};

                const ariaLabel = cell
                  ? `${SKILLS[si]}, ${DOMAINS[di]}: density ${cell.density.toFixed(3)}, ${energyLabel(er)}`
                  : `${SKILLS[si]}, ${DOMAINS[di]}: no evidence`;

                const titleText = cell
                  ? `${SKILLS[si]} × ${DOMAINS[di]} · density ${cell.density.toFixed(3)} · ${energyLabel(er)} · click to explore`
                  : `${SKILLS[si]} × ${DOMAINS[di]} · no evidence yet`;

                return (
                  <button
                    key={`${si}-${di}`}
                    type="button"
                    onClick={() => setSelected(cell ?? null)}
                    title={titleText}
                    aria-label={ariaLabel}
                    className={cn(
                      "relative h-10 w-full rounded border text-[9px] font-semibold transition-all hover:ring-1 hover:ring-cx-forest-dark/40",
                      dn === 0 && "border-cx-forest-dark/10 bg-cx-forest-dark/5 text-transparent",
                      selected?.skill_index === si && selected?.domain_index === di && "ring-2 ring-cx-forest-dark",
                    )}
                    style={
                      dn > 0
                        ? { ...densityToStyle(dn), ...fteBorder }
                        : fteBorder
                    }
                  >
                    <EnergyGlyph rank={er} />
                    {dn > 0 ? dn.toFixed(2) : ""}
                    {/* Transfer star scaffold: render only when F7 data is present */}
                    {cell?.transfer_flag && (
                      <span
                        aria-hidden="true"
                        style={{
                          position: "absolute",
                          bottom: 2, right: 2,
                          fontSize: "7px",
                          lineHeight: 1,
                          color: "rgb(180,150,30)",
                        }}
                      >
                        ★
                      </span>
                    )}
                  </button>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-cx-forest-dark/60">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-3 w-3 rounded border"
            style={{ backgroundColor: "rgb(72,122,180)", borderColor: "rgb(54,104,162)" }}
          />
          Evidence density (darker = denser)
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: GLYPH_ENERGIZING }}
          />
          Energizing (top-left dot)
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: GLYPH_DRAINING }}
          />
          Draining (top-right dot)
        </span>
      </div>

      {/* Selected cell detail */}
      {selected && (
        <div className="rounded-xl border border-cx-forest-dark/15 bg-cx-forest-dark/[0.03] px-4 py-3">
          <p className="text-sm font-medium text-cx-forest-dark">
            {SKILLS[selected.skill_index]} × {DOMAINS[selected.domain_index]}
          </p>
          <p className="mt-1 text-xs text-cx-forest-dark/60">
            Density {selected.density.toFixed(4)} · Ipsative{" "}
            {(selected.density_normalized * 100).toFixed(0)}% of your max ·{" "}
            Energy{" "}
            {selected.energy_rank != null
              ? `${selected.energy_rank}/5 (${energyLabel(selected.energy_rank)})`
              : "not yet rated"}{" "}
            · Quadrant {selected.quadrant}
          </p>
        </div>
      )}
    </div>
  );
}

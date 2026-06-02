"use client";

import Link from "next/link";
import { ChevronRight, Grid3x3 } from "lucide-react";
import { SKILLS, DOMAINS, type LatticeCellState } from "@/lib/constants";
import { cn, energyCellClass } from "@/lib/utils";

type MiniLatticeProps = {
  cells: LatticeCellState[];
  href?: string;
  className?: string;
  compact?: boolean;
  showHeader?: boolean;
};

function getCell(cells: LatticeCellState[], d: number, t: number): LatticeCellState {
  return (
    cells.find((c) => c.domainIndex === d && c.trackIndex === t) ?? {
      domainIndex: d,
      trackIndex: t,
      activityCount: 0,
      energy: null,
    }
  );
}

export function MiniLattice({
  cells,
  href = "/app/objective?tab=lattice",
  className,
  compact = false,
  showHeader = true,
}: MiniLatticeProps) {
  const activeCells = cells.filter((c) => c.activityCount > 0).length;
  const cellSize = compact ? "h-3 w-3" : "h-3.5 w-3.5";
  const gap = compact ? "gap-px" : "gap-0.5";

  return (
    <div
      className={cn(
        "cx-dashboard-subpanel rounded-xl border border-cx-forest-dark/10 bg-cx-forest-dark/[0.03] p-2.5",
        className,
      )}
    >
      {showHeader && (
        <div className="mb-2 flex items-center gap-2">
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-cx-forest-dark/10 text-cx-forest-dark"
            aria-hidden
          >
            <Grid3x3 size={14} strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-wide text-cx-forest-dark/70">
              Career lattice
            </p>
            <p className="text-xs font-semibold text-cx-forest-dark">
              {activeCells > 0 ? `${activeCells} active cells` : "No activity yet"}
            </p>
          </div>
        </div>
      )}

      <Link href={href} className="group block">
        <div
          className={cn("mx-auto inline-grid", gap)}
          style={{ gridTemplateColumns: "repeat(8, 1fr)" }}
          role="img"
          aria-label={`Career lattice heat map, ${activeCells} of 64 cells with activity`}
        >
          {Array.from({ length: 8 }, (_, d) =>
            Array.from({ length: 8 }, (_, t) => {
              const cell = getCell(cells, d, t);
              const opacity =
                cell.activityCount === 0
                  ? 0.35
                  : Math.min(1, 0.55 + cell.activityCount * 0.06);
              const skill  = SKILLS[d]?.slice(0, 14) ?? "Skill";
              const domain = DOMAINS[t]?.slice(0, 12) ?? "Domain";
              return (
                <div
                  key={`${d}-${t}`}
                  title={
                    cell.activityCount > 0
                      ? `${skill} × ${domain}: ${cell.activityCount} activities`
                      : `${skill} × ${domain}: no activity`
                  }
                  className={cn(
                    "rounded-[2px] border transition-opacity group-hover:opacity-100",
                    cellSize,
                    energyCellClass(cell.energy, cell.activityCount),
                  )}
                  style={{ opacity }}
                />
              );
            }),
          )}
        </div>
      </Link>

      <Link
        href={href}
        className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium text-cx-forest-dark/70 hover:text-cx-forest-dark"
      >
        Full lattice
        <ChevronRight size={12} />
      </Link>
    </div>
  );
}

"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { LatticeCellState } from "@/lib/constants";
import { cn, energyCellClass } from "@/lib/utils";

type MiniLatticeProps = {
  cells: LatticeCellState[];
};

export function MiniLattice({ cells }: MiniLatticeProps) {
  function getCell(d: number, t: number) {
    return (
      cells.find((c) => c.domainIndex === d && c.trackIndex === t) ?? {
        domainIndex: d,
        trackIndex: t,
        activityCount: 0,
        energy: null,
      }
    );
  }

  return (
    <div>
      <div
        className="inline-grid gap-0.5"
        style={{ gridTemplateColumns: "repeat(8, 1fr)" }}
      >
        {Array.from({ length: 8 }, (_, d) =>
          Array.from({ length: 8 }, (_, t) => {
            const cell = getCell(d, t);
            const opacity =
              cell.activityCount === 0
                ? 0.3
                : Math.min(1, 0.45 + cell.activityCount * 0.08);
            return (
              <div
                key={`${d}-${t}`}
                title={
                  cell.activityCount > 0
                    ? `${cell.activityCount} activities`
                    : "No activity"
                }
                className={cn(
                  "h-5 w-5 rounded-sm border",
                  energyCellClass(cell.energy, cell.activityCount),
                )}
                style={{ opacity }}
              />
            );
          }),
        )}
      </div>
      <Link
        href="/app/objective?tab=lattice"
        className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-cx-text hover:text-cx-primary"
      >
        Full lattice
        <ChevronRight size={14} />
      </Link>
    </div>
  );
}

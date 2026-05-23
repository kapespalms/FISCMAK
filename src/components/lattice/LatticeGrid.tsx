"use client";

import { Fragment, useState } from "react";
import { DOMAINS, TRACKS, type LatticeCellState } from "@/lib/constants";
import { cn, energyCellClass } from "@/lib/utils";
import { Card } from "@/components/ui/Card";

export function LatticeGrid({ cells }: { cells: LatticeCellState[] }) {
  const [selected, setSelected] = useState<LatticeCellState | null>(null);

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
    <div className="space-y-6">
      <p className="text-sm text-cx-text-secondary">
        Your career pattern:{" "}
        <strong className="text-cx-text">
          Clinician-Educator with Emerging Systems Leadership
        </strong>
      </p>
      <div className="overflow-x-auto">
        <div
          className="inline-grid gap-1"
          style={{
            gridTemplateColumns: `120px repeat(${TRACKS.length}, minmax(48px, 1fr))`,
          }}
        >
          <div />
          {TRACKS.map((track) => (
            <div
              key={track}
              className="px-1 py-2 text-center text-[10px] font-semibold leading-tight text-cx-text-secondary"
            >
              {track.split("/")[0]}
            </div>
          ))}
          {DOMAINS.map((domain, di) => (
            <Fragment key={domain}>
              <div
                className="flex items-center pr-2 text-right text-[10px] font-medium text-cx-text-secondary"
              >
                {domain.split(" ")[0]}
              </div>
              {TRACKS.map((_, ti) => {
                const cell = getCell(di, ti);
                return (
                  <button
                    key={`${di}-${ti}`}
                    type="button"
                    onClick={() => setSelected(cell)}
                    title={`${domain} × ${TRACKS[ti]}: ${cell.activityCount} activities`}
                    className={cn(
                      "flex h-12 min-w-12 items-center justify-center rounded border text-xs font-semibold transition-shadow hover:border-black hover:shadow-md",
                      energyCellClass(cell.energy, cell.activityCount),
                    )}
                  >
                    {cell.activityCount > 0 ? cell.activityCount : ""}
                  </button>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>

      {selected && selected.activityCount > 0 && (
        <Card>
          <h3 className="text-lg font-semibold">
            {DOMAINS[selected.domainIndex]} × {TRACKS[selected.trackIndex]}
          </h3>
          <p className="mt-2 text-sm text-cx-text-secondary">
            {selected.activityCount} activities · Energy:{" "}
            {selected.energy?.replace("_", " ") ?? "mixed"}
          </p>
          <p className="mt-4 text-sm text-cx-body">
            Log activities through Mak or Career Data → Activities to populate live lattice data.
          </p>
        </Card>
      )}
    </div>
  );
}

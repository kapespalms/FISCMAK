"use client";

import { Fragment, useMemo, useState } from "react";
import type { LatticeCellMetrics, LatticeGridModel } from "@/lib/v2/lattice/types";
import { latticeCellStyle } from "@/lib/v2/lattice/cell-styles";
import { cn } from "@/lib/utils";
import { LatticeCellDetailCard } from "@/components/lattice/LatticeCellDetailCard";

type Props = {
  model: LatticeGridModel;
  rowHeaderWidth?: number;
  colHeaderHeight?: number;
};

export function DualLatticeGrid({
  model,
  rowHeaderWidth = 120,
  colHeaderHeight = 48,
}: Props) {
  const [selected, setSelected] = useState<LatticeCellMetrics | null>(null);

  const cellMap = useMemo(() => {
    const map = new Map<string, LatticeCellMetrics>();
    for (const cell of model.cells) {
      map.set(`${cell.rowIndex}-${cell.colIndex}`, cell);
    }
    return map;
  }, [model.cells]);

  function getCell(row: number, col: number): LatticeCellMetrics {
    return (
      cellMap.get(`${row}-${col}`) ?? {
        rowIndex: row,
        colIndex: col,
        rowLabel: model.rowLabels[row] ?? "",
        colLabel: model.colLabels[col] ?? "",
        count: 0,
        relativeIntensity: 0,
        energizingCount: 0,
        drainingCount: 0,
        neutralCount: 0,
        maxDevelopmentLevel: 0,
        evidence: [],
      }
    );
  }

  const rowCount = model.rowLabels.length;
  const colCount = model.colLabels.length;

  return (
    <>
      <div className="overflow-x-auto pb-2">
        <div
          className="inline-grid gap-1.5"
          style={{
            gridTemplateColumns: `${rowHeaderWidth}px repeat(${colCount}, minmax(52px, 1fr))`,
          }}
        >
          <div style={{ minHeight: colHeaderHeight }} />
          {model.colLabels.map((label) => (
            <div
              key={label}
              className="flex items-end justify-center px-1 pb-1 text-center text-[10px] font-semibold leading-tight text-cx-forest-dark/65"
              style={{ minHeight: colHeaderHeight }}
            >
              {label.split(" ")[0]}
              {label.includes(" ") ? (
                <>
                  <br />
                  {label.split(" ").slice(1).join(" ")}
                </>
              ) : null}
            </div>
          ))}

          {Array.from({ length: rowCount }, (_, ri) => (
            <Fragment key={model.rowLabels[ri]}>
              <div className="flex items-center justify-end pr-2 text-right text-[10px] font-medium leading-tight text-cx-forest-dark/60">
                {model.rowLabels[ri]}
              </div>
              {Array.from({ length: colCount }, (_, ci) => {
                const cell = getCell(ri, ci);
                const { className, style } = latticeCellStyle(cell, model.kind);
                return (
                  <button
                    key={`${ri}-${ci}`}
                    type="button"
                    aria-label={`${cell.rowLabel} × ${cell.colLabel}, ${cell.count} items`}
                    title={`${cell.rowLabel} × ${cell.colLabel}: ${cell.count}`}
                    onClick={() => setSelected(cell)}
                    className={cn(
                      className,
                      "h-12 min-w-[52px] cursor-pointer hover:brightness-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-cx-forest-dark/40",
                    )}
                    style={style}
                  >
                    {cell.count > 0 ? cell.count : ""}
                  </button>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>

      {selected ? (
        <LatticeCellDetailCard
          cell={selected}
          latticeKind={model.kind}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </>
  );
}

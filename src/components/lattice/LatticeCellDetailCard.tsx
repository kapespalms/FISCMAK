"use client";

import { X } from "lucide-react";
import type { LatticeCellMetrics } from "@/lib/v2/lattice/types";
import { Card } from "@/components/ui/Card";

type Props = {
  cell: LatticeCellMetrics;
  latticeKind: "fiscmak" | "acgme";
  onClose: () => void;
};

function energyLabel(energy: string | null): string {
  if (!energy) return "Not rated";
  return energy.replace(/_/g, " ");
}

function evidenceSourceLabel(source: LatticeCellMetrics["evidence"][number]["source"]): string {
  switch (source) {
    case "document":
      return "Document";
    case "schedule":
      return "Calendar";
    case "rotation":
      return "Rotation";
    default:
      return "Activity";
  }
}

export function LatticeCellDetailCard({ cell, latticeKind, onClose }: Props) {
  const title =
    latticeKind === "fiscmak"
      ? `${cell.rowLabel} × ${cell.colLabel}`
      : `${cell.colLabel} · ${cell.rowLabel}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/25 p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lattice-cell-title"
      onClick={onClose}
    >
      <Card
        className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-md p-1 text-cx-forest-dark/50 hover:bg-cx-forest-dark/5 hover:text-cx-forest-dark"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <h3 id="lattice-cell-title" className="pr-8 text-lg font-semibold text-cx-forest-dark">
          {title}
        </h3>

        <p className="mt-2 text-sm text-cx-forest-dark/70">
          {cell.count} mapped item{cell.count === 1 ? "" : "s"} in this window · relative intensity{" "}
          {Math.round(cell.relativeIntensity * 100)}%
          {cell.maxDevelopmentLevel > 0
            ? ` · peak development level ${cell.maxDevelopmentLevel}`
            : ""}
        </p>

        {cell.count > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            {cell.energizingCount > 0 ? (
              <span className="rounded-full bg-[#C9A227]/15 px-2 py-0.5 text-[#8a6b12]">
                {cell.energizingCount} energizing
              </span>
            ) : null}
            {cell.drainingCount > 0 ? (
              <span className="rounded-full bg-[#CC5500]/12 px-2 py-0.5 text-[#994000]">
                {cell.drainingCount} draining
              </span>
            ) : null}
            {cell.neutralCount > 0 ? (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-gray-600">
                {cell.neutralCount} neutral
              </span>
            ) : null}
          </div>
        ) : (
          <p className="mt-4 text-sm text-cx-forest-dark/75">
            No evidence mapped here yet. Log activities, add calendar events with Coach Mak, or
            upload career documents — mapped skills and tasks will appear when they match this cell.
          </p>
        )}

        {cell.evidence.length > 0 ? (
          <ul className="mt-5 space-y-3">
            {cell.evidence.map((item) => (
              <li
                key={item.id}
                className="rounded-lg border border-cx-forest-dark/10 bg-cx-cream/40 p-3"
              >
                <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-cx-forest-dark/50">
                  <span>{evidenceSourceLabel(item.source)}</span>
                  {item.date ? <span>{item.date}</span> : null}
                  {item.developmentLevel > 0 ? (
                    <span>Level {item.developmentLevel}</span>
                  ) : null}
                </div>
                <p className="mt-1 text-xs text-cx-forest-dark/55">{item.sourceLabel}</p>
                <p className="mt-2 text-sm leading-relaxed text-cx-forest-dark/85">
                  {item.rawText}
                </p>
                {item.energy ? (
                  <p className="mt-2 text-xs text-cx-forest-dark/60">
                    Energy: {energyLabel(item.energy)}
                  </p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </Card>
    </div>
  );
}

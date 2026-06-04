"use client";

import { useEffect, useState } from "react";
import { X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { SKILLS, DOMAINS } from "@/lib/constants";
import type { HeatmapCell } from "@/app/api/v1/lattice/heatmap/route";
import type { CellEvidenceItem } from "@/app/api/v1/lattice/cells/[skill]/[domain]/route";

const QUADRANT_LABELS: Record<string, { label: string; color: string }> = {
  OV: { label: "Objective · Visible",   color: "text-emerald-700 bg-emerald-50" },
  OI: { label: "Objective · Invisible", color: "text-amber-700  bg-amber-50"   },
  SV: { label: "Stated · Visible",      color: "text-sky-700    bg-sky-50"     },
  SI: { label: "Stated · Invisible",    color: "text-violet-700 bg-violet-50"  },
};

type Props = {
  cell: HeatmapCell | null;
  onClose: () => void;
};

export function CellEvidenceDrawer({ cell, onClose }: Props) {
  const [items, setItems] = useState<CellEvidenceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!cell) return;
    setLoading(true);
    setError(null);
    fetch(`/api/v1/lattice/cells/${cell.skill_index}/${cell.domain_index}`)
      .then((r) => r.json() as Promise<{ items?: CellEvidenceItem[]; message?: string }>)
      .then((d) => setItems(d.items ?? []))
      .catch(() => setError("Could not load evidence."))
      .finally(() => setLoading(false));
  }, [cell?.skill_index, cell?.domain_index]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") onClose(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!cell) return null;

  const skillName  = SKILLS[cell.skill_index]  ?? `Skill ${cell.skill_index}`;
  const domainName = DOMAINS[cell.domain_index] ?? `Domain ${cell.domain_index}`;

  function itemLabel(item: CellEvidenceItem): string {
    return item.display_label || item.raw_text?.slice(0, 120) || item.item_type || "Unlabelled entry";
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-white shadow-2xl"
        aria-label={`Evidence for ${skillName} × ${domainName}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-neutral-100 px-5 py-4">
          <div>
            <p className="text-xs font-medium text-fis-gold uppercase tracking-wide">Cell Evidence</p>
            <h2 className="mt-0.5 text-sm font-semibold text-cx-forest-dark leading-snug">
              {skillName}
              <span className="mx-1.5 text-cx-forest-dark/30">×</span>
              {domainName}
            </h2>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {(() => {
                const q = QUADRANT_LABELS[cell.quadrant];
                return q ? (
                  <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-medium", q.color)}>
                    {q.label}
                  </span>
                ) : null;
              })()}
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] text-neutral-600">
                density {cell.density.toFixed(3)}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-cx-forest-dark"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-cx-forest-dark/50">
              <Loader2 size={14} className="animate-spin" />
              Loading evidence…
            </div>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}

          {!loading && !error && items.length === 0 && (
            <p className="text-sm text-cx-forest-dark/50">
              No confirmed evidence in this cell yet.
            </p>
          )}

          {!loading && items.length > 0 && (
            <ul className="space-y-3">
              {items.map((item, i) => {
                const q = QUADRANT_LABELS[item.quadrant];
                return (
                  <li
                    key={item.evidence_unit_id + i}
                    className="rounded-xl border border-neutral-100 bg-neutral-50 p-3"
                  >
                    <p className="text-sm font-medium text-cx-forest-dark leading-snug">
                      {itemLabel(item)}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      {item.item_type && (
                        <span className="rounded-full bg-fis-gold/10 px-2 py-0.5 text-[10px] font-medium text-fis-gold">
                          {item.item_type}
                        </span>
                      )}
                      {q && (
                        <span className={cn("rounded-full px-2 py-0.5 text-[10px]", q.color)}>
                          {item.quadrant}
                        </span>
                      )}
                      <span className="text-[10px] text-neutral-400">
                        weight {(item.weight * 100).toFixed(0)}%
                      </span>
                    </div>
                    {item.raw_text && item.display_label && item.raw_text !== item.display_label && (
                      <p className="mt-2 text-[11px] text-neutral-500 line-clamp-2 italic">
                        &ldquo;{item.raw_text.slice(0, 140)}&rdquo;
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-100 px-5 py-3">
          <p className="text-[10px] text-neutral-400">
            {items.length} item{items.length !== 1 ? "s" : ""} touching this cell
          </p>
        </div>
      </aside>
    </>
  );
}

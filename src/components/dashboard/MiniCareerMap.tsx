"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DOMAINS, TRACKS } from "@/lib/constants";
import type { DashboardLatticeCell } from "@/lib/v2/dashboard-data";
import { cn } from "@/lib/utils";

function scoreToHeatClass(score: number | null): string {
  if (score == null || score === 0) return "bg-slate-200 border-slate-300";
  if (score >= 75) return "bg-emerald-700 border-emerald-800";
  if (score >= 55) return "bg-amber-500 border-amber-600";
  return "bg-red-800 border-red-900";
}

type MiniCareerMapProps = {
  cells: DashboardLatticeCell[];
  href?: string;
  glowCell?: { domainIndex: number; trackIndex: number } | null;
};

export function MiniCareerMap({ cells, href = "/app/assessment", glowCell }: MiniCareerMapProps) {
  const [activeGlow, setActiveGlow] = useState(glowCell ?? null);

  useEffect(() => {
    if (!glowCell) return;
    setActiveGlow(glowCell);
    const t = setTimeout(() => setActiveGlow(null), 500);
    return () => clearTimeout(t);
  }, [glowCell]);

  function cellScore(d: number, t: number): number | null {
    const cell = cells.find((c) => c.domainIndex === d && c.trackIndex === t);
    if (!cell) return null;
    if (cell.score != null) return cell.score;
    if (cell.activityCount === 0) return null;
    const energyBoost =
      cell.energy === "very_energizing"
        ? 15
        : cell.energy === "energizing"
          ? 10
          : cell.energy === "draining"
            ? -10
            : 0;
    return Math.min(100, Math.max(20, 40 + cell.activityCount * 8 + energyBoost));
  }

  return (
    <div>
      <Link href={href} className="block">
        <div
          className="inline-grid gap-0.5"
          style={{ gridTemplateColumns: "repeat(8, 1fr)" }}
          role="img"
          aria-label="Mini Career Map heat map"
        >
          {Array.from({ length: 8 }, (_, d) =>
            Array.from({ length: 8 }, (_, t) => {
              const score = cellScore(d, t);
              const domain = DOMAINS[d]?.slice(0, 12);
              const track = TRACKS[t]?.slice(0, 10);
              const isGlowing =
                activeGlow?.domainIndex === d && activeGlow?.trackIndex === t;
              return (
                <div
                  key={`${d}-${t}`}
                  title={
                    score != null
                      ? `${domain} × ${track}: ${score}/100`
                      : `${domain} × ${track}: insufficient data`
                  }
                  className={cn(
                    "h-4 w-4 rounded-sm border transition-all hover:opacity-100 hover:ring-2 hover:ring-fm-primary/40",
                    scoreToHeatClass(score),
                    isGlowing && "animate-cell-glow ring-2 ring-fm-primary/60",
                  )}
                  style={{ opacity: score == null ? 0.35 : 0.85 }}
                />
              );
            }),
          )}
        </div>
      </Link>
      <p className="mt-2 text-caption text-fiscmak-muted">
        Warm cells = strong positioning · Cool cells = developing · Click to open Career Profile
      </p>
    </div>
  );
}

"use client";

import Link from "next/link";
import { Clock, Plus } from "lucide-react";
import { useAppShell } from "@/components/layout/AppShell";
import type { RecentCapture } from "@/app/api/v1/dashboard/recent-captures/route";

const QUADRANT_DOT: Record<string, string> = {
  OV: "bg-emerald-400",
  OI: "bg-amber-400",
  SV: "bg-sky-400",
  SI: "bg-violet-400",
};

type Props = {
  items:   RecentCapture[];
  loading: boolean;
};

function captureLabel(c: RecentCapture): string {
  return c.display_label || c.raw_text?.slice(0, 80) || "(unlabelled)";
}

export function RecentCapturesLedger({ items, loading }: Props) {
  const { openMak } = useAppShell();

  return (
    <div className="rounded-2xl border border-cx-forest-dark/10 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock size={15} className="text-cx-forest-dark/50" />
          <span className="text-xs font-semibold uppercase tracking-wide text-cx-forest-dark/50">
            Recent captures
          </span>
        </div>
        <Link href="/app/lattice?view=list" className="text-xs text-fis-gold hover:opacity-80">
          All →
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-7 w-full animate-pulse rounded-lg bg-neutral-100" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-cx-forest-dark/15 py-6 text-center">
          <p className="mb-2 text-xs text-cx-forest-dark/50">Nothing captured yet</p>
          <button
            type="button"
            onClick={openMak}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-fis-gold hover:opacity-80"
          >
            <Plus size={12} />
            Capture today
          </button>
        </div>
      ) : (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-2.5">
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${QUADRANT_DOT[item.quadrant] ?? "bg-neutral-300"}`}
                aria-hidden="true"
              />
              <p className="flex-1 min-w-0 truncate text-xs text-cx-forest-dark">
                {captureLabel(item)}
              </p>
              <span className="shrink-0 text-[10px] text-neutral-400">
                {new Date(item.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

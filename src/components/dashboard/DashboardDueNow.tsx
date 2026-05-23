"use client";

import { ArrowRight } from "lucide-react";
import type { DashboardDueNowItem } from "@/lib/v2/dashboard-redesign";

export type DashboardDueItem = DashboardDueNowItem;

export function DashboardDueNow({
  item,
  onContinue,
}: {
  item: DashboardDueItem;
  onContinue: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#5FD65F]/35 bg-[#5FD65F]/10 px-4 py-3">
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wide text-cx-forest-dark/70">
          Due now · {item.label}
        </p>
        <p className="text-sm font-semibold text-cx-forest-dark">{item.title}</p>
        {item.detail && (
          <p className="mt-0.5 line-clamp-2 text-xs text-cx-forest-dark/70">{item.detail}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onContinue}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-cx-forest-dark px-3 py-1.5 text-xs font-semibold text-white hover:bg-cx-forest-dark/90"
      >
        Continue
        <ArrowRight size={14} aria-hidden />
      </button>
    </div>
  );
}

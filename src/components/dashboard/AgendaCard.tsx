"use client";

import Link from "next/link";
import { Calendar, CheckCircle2 } from "lucide-react";
import type { DashboardDueNowItem } from "@/lib/v2/dashboard-redesign";

type Props = {
  dueItem:  DashboardDueNowItem | null | undefined;
  onContinue?: () => void;
  loading?: boolean;
};

export function AgendaCard({ dueItem, onContinue, loading }: Props) {
  return (
    <div className="rounded-2xl border border-cx-forest-dark/10 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <Calendar size={15} className="text-cx-forest-dark/50" />
        <span className="text-xs font-semibold uppercase tracking-wide text-cx-forest-dark/50">
          This week
        </span>
      </div>

      {loading ? (
        <div className="h-16 w-full animate-pulse rounded-xl bg-neutral-100" />
      ) : dueItem ? (
        <div className="rounded-xl border border-fis-gold/20 bg-fis-gold/5 p-4">
          <p className="text-[10px] font-medium uppercase tracking-wide text-fis-gold">
            {dueItem.label}
          </p>
          <p className="mt-1 text-sm font-semibold text-cx-forest-dark">{dueItem.title}</p>
          {dueItem.detail && (
            <p className="mt-0.5 text-xs text-cx-forest-dark/60">{dueItem.detail}</p>
          )}
          {onContinue && (
            <button
              type="button"
              onClick={onContinue}
              className="mt-3 w-full rounded-xl bg-fis-gold py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            >
              Continue
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-fis-green">
            <CheckCircle2 size={15} />
            <span>All caught up this week</span>
          </div>
          <p className="text-xs text-cx-forest-dark/50">
            No check-ins or reviews due right now.
          </p>
        </div>
      )}

      {/* Calendar stub */}
      <div className="mt-4 rounded-xl border border-dashed border-cx-forest-dark/10 px-4 py-3 text-center">
        <p className="text-xs text-cx-forest-dark/40">Google Calendar · Outlook</p>
        <Link
          href="/app/settings"
          className="mt-0.5 block text-[11px] font-medium text-fis-gold hover:opacity-80"
        >
          Connect calendar →
        </Link>
      </div>
    </div>
  );
}

"use client";

import {
  Flag,
  Route,
  UserCircle,
} from "lucide-react";
import { MiniLattice } from "@/components/dashboard/MiniLattice";
import type { DashboardHeaderModel } from "@/lib/v2/dashboard-architecture";
import type { ProfileRow } from "@/lib/v2/dashboard-redesign";
import type { DashboardLatticeCell } from "@/lib/v2/dashboard-data";
import { cn } from "@/lib/utils";

function rowStatusClass(status?: ProfileRow["status"]): string {
  if (status === "strong") return "text-[#AC8636]";
  if (status === "developing") return "text-[#C28D6C]";
  if (status === "needs_attention") return "text-[#C28D6C]";
  return "text-cx-forest-dark";
}

function formatTrackTitle(tracks: string[] | null | undefined): string {
  if (!tracks?.length) return "Set direction";
  return [...new Set(tracks.map((t) => t.trim()).filter(Boolean))].join(" · ");
}

function SummaryMiniCard({
  icon: Icon,
  label,
  value,
  trailing,
  subtext,
}: {
  icon: typeof Route;
  label: string;
  value: string;
  trailing?: React.ReactNode;
  subtext?: string;
}) {
  return (
    <div className="cx-dashboard-subpanel rounded-lg border border-cx-forest-dark/10 bg-cx-forest-dark/[0.03] p-2.5">
      <div className="flex items-start gap-2">
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-cx-forest-dark/10 text-cx-forest-dark"
          aria-hidden
        >
          <Icon size={14} strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-wide text-cx-forest-dark/70">
            {label}
          </p>
          <div className="mt-0.5 flex items-center gap-1">
            <p className="line-clamp-2 text-xs font-semibold text-cx-forest-dark">{value}</p>
            {trailing}
          </div>
          {subtext && (
            <p className="mt-0.5 text-[10px] text-cx-forest-dark/60">{subtext}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCell({ row }: { row: ProfileRow }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-medium text-cx-forest-dark/70">{row.label}</dt>
      <dd className={cn("mt-0.5 text-xs font-semibold", rowStatusClass(row.status))}>
        {row.value}
      </dd>
    </div>
  );
}

export function ProfileSummaryCard({
  rows,
  tracks,
  header,
  nextMilestone,
  latticeCells = [],
  className,
}: {
  rows: ProfileRow[];
  tracks?: string[] | null;
  header: DashboardHeaderModel;
  nextMilestone: string | null;
  latticeCells?: DashboardLatticeCell[];
  className?: string;
}) {
  const byId = Object.fromEntries(rows.map((row) => [row.id, row]));
  const direction = byId.direction;
  const fulfillment = byId.fulfillment;
  const strain = byId.strain;
  const alignment = byId.alignment;
  const progress = byId.progress;
  const status = byId.status;

  return (
    <div className={cn("cx-dashboard-panel rounded-xl bg-white p-3 shadow-sm", className)}>
      <div className="flex items-start gap-2.5">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cx-forest-dark/10 text-cx-forest-dark"
          aria-hidden
        >
          <UserCircle size={16} strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-cx-forest-dark">Profile</h3>
        </div>
      </div>

      {(direction || strain || fulfillment || alignment || progress || status) && (
        <dl className="mt-3 grid grid-cols-3 gap-x-3 gap-y-2">
          {direction ? <MetricCell row={direction} /> : <div aria-hidden />}
          {strain ? <MetricCell row={strain} /> : <div aria-hidden />}
          <div aria-hidden />

          {fulfillment ? <MetricCell row={fulfillment} /> : <div aria-hidden />}
          {alignment ? <MetricCell row={alignment} /> : <div aria-hidden />}
          <div aria-hidden />

          {progress ? <MetricCell row={progress} /> : <div aria-hidden />}
          {status ? <MetricCell row={status} /> : <div aria-hidden />}
          <div aria-hidden />
        </dl>
      )}

      <div className="mt-3">
        <MiniLattice cells={latticeCells} compact showHeader />
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <SummaryMiniCard
          icon={Route}
          label={tracks && tracks.length > 1 ? "Tracks" : "Track"}
          value={formatTrackTitle(tracks)}
        />
        <SummaryMiniCard
          icon={Flag}
          label="Next milestone"
          value={nextMilestone ?? "None due"}
          subtext={
            header.nextCheckIn ? `Check-in: ${header.nextCheckIn}` : undefined
          }
        />
      </div>
    </div>
  );
}

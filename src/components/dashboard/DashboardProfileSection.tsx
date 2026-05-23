"use client";

import type { DashboardMakAction } from "@/lib/v2/dashboard-redesign";
import { DASHBOARD_MAK_ACTIONS } from "@/lib/v2/dashboard-redesign";
import { cn } from "@/lib/utils";

type DashboardProfileSectionProps = {
  displayName: string;
  rows: import("@/lib/v2/dashboard-redesign").ProfileRow[];
  onMakAction: (action: DashboardMakAction) => void;
};

function rowStatusClass(status?: import("@/lib/v2/dashboard-redesign").ProfileRow["status"]): string {
  if (status === "strong") return "text-cx-success";
  if (status === "developing") return "text-cx-attention";
  if (status === "needs_attention") return "text-cx-attention";
  return "text-cx-text";
}

export function DashboardProfileSection({
  displayName,
  rows,
  onMakAction,
}: DashboardProfileSectionProps) {
  const primary = DASHBOARD_MAK_ACTIONS.filter((a) => a.tier === "primary");
  const flows = DASHBOARD_MAK_ACTIONS.filter((a) => a.tier === "flow");

  return (
    <section aria-labelledby="profile-heading">
      <div className="mb-6">
        <h2 id="profile-heading" className="text-cx-h2">
          Your profile
        </h2>
        <p className="mt-1 text-cx-body">{displayName}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="cx-card">
          <dl className="grid gap-4 sm:grid-cols-2">
            {rows.map((row) => (
              <div key={row.id} className="min-w-0">
                <dt className="text-cx-label">{row.label}</dt>
                <dd className={cn("mt-1 text-sm font-semibold", rowStatusClass(row.status))}>
                  {row.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="space-y-4">
          <div className="cx-card">
            <h3 className="text-cx-h3">Quick actions</h3>
            <div className="mt-4 space-y-2">
              {primary.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => onMakAction(action)}
                    className="flex w-full items-start gap-3 rounded-xl border border-cx-border bg-cx-cream/40 px-4 py-3 text-left transition-colors hover:border-cx-accent hover:bg-cx-accent-soft/30"
                  >
                    <Icon size={18} className="mt-0.5 shrink-0 text-cx-text" aria-hidden />
                    <span>
                      <span className="block text-sm font-semibold text-cx-text">{action.label}</span>
                      <span className="mt-0.5 block text-xs text-cx-text-secondary">
                        {action.subtitle}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="cx-card-dark">
            <h3 className="text-sm font-semibold">Talk with Mak</h3>
            <p className="mt-1 text-xs text-white/70">Context-aware coaching flows</p>
            <ul className="mt-4 space-y-1">
              {flows.map((action) => {
                const Icon = action.icon;
                return (
                  <li key={action.id}>
                    <button
                      type="button"
                      onClick={() => onMakAction(action)}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-white/90 transition-colors hover:bg-white/10"
                    >
                      <Icon size={16} className="shrink-0 text-cx-accent" aria-hidden />
                      <span className="min-w-0">
                        <span className="block font-medium">{action.label}</span>
                        <span className="block text-xs text-white/60">{action.subtitle}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

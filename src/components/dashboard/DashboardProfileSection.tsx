"use client";

import type { ProfileRow } from "@/lib/v2/dashboard-redesign";
import { PROFILE_QUICK_ACTIONS } from "@/lib/v2/dashboard-redesign";
import { cn } from "@/lib/utils";

type DashboardProfileSectionProps = {
  displayName: string;
  rows: ProfileRow[];
  onQuickAction: (action: (typeof PROFILE_QUICK_ACTIONS)[number]) => void;
};

function rowStatusClass(status?: ProfileRow["status"]): string {
  if (status === "strong") return "text-cx-success";
  if (status === "developing") return "text-cx-attention";
  if (status === "needs_attention") return "text-cx-attention";
  return "text-cx-text";
}

export function DashboardProfileSection({
  displayName,
  rows,
  onQuickAction,
}: DashboardProfileSectionProps) {
  return (
    <section aria-labelledby="profile-heading">
      <div className="mb-6">
        <h2 id="profile-heading" className="text-cx-h2">
          Your Profile
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

        <div className="cx-card">
          <h3 className="text-cx-h3">Quick Actions</h3>
          <ul className="mt-4 space-y-1">
            {PROFILE_QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <li key={action.label}>
                  <button
                    type="button"
                    onClick={() => onQuickAction(action)}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm text-cx-text transition-colors hover:bg-cx-cream"
                  >
                    <Icon size={16} className="shrink-0 text-cx-text-secondary" aria-hidden />
                    {action.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}

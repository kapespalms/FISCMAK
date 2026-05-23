"use client";

import Link from "next/link";
import {
  statusIcon,
  type DashboardNextAction,
} from "@/lib/v2/dashboard-redesign";
import { StatusIndicator } from "@/components/ui/StatusIndicator";

type DashboardNextActionsProps = {
  actions: DashboardNextAction[];
  onAction?: (action: DashboardNextAction) => void;
};

export function DashboardNextActions({ actions, onAction }: DashboardNextActionsProps) {
  if (actions.length === 0) return null;

  return (
    <section aria-labelledby="next-actions-heading" className="cx-card">
      <h2 id="next-actions-heading" className="text-cx-h2">
        Next Actions
      </h2>
      <ul className="mt-4 divide-y divide-cx-border">
        {actions.map((action) => {
          const content = (
            <>
              <StatusIndicator status={statusIcon(action.status)} size={16} />
              <span className="text-sm text-cx-text">{action.label}</span>
            </>
          );

          if (action.href) {
            return (
              <li key={action.id}>
                <Link
                  href={action.href}
                  onClick={() => onAction?.(action)}
                  className="flex items-center gap-3 py-3 transition-colors hover:text-cx-text"
                >
                  {content}
                </Link>
              </li>
            );
          }

          return (
            <li key={action.id} className="flex items-center gap-3 py-3">
              {content}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

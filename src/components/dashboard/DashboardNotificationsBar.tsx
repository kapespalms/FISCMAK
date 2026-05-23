"use client";

import Link from "next/link";
import type { EngagementNotification } from "@/lib/v2/engagement-tracking";
import { cn } from "@/lib/utils";

type Props = {
  notifications: EngagementNotification[];
  onAction?: (note: EngagementNotification) => void;
};

const severityStyles: Record<EngagementNotification["severity"], string> = {
  info: "border-fiscmak-border bg-white",
  attention: "border-fiscmak-amber bg-amber-50",
  urgent: "border-red-300 bg-red-50",
};

export function DashboardNotificationsBar({ notifications, onAction }: Props) {
  if (!notifications.length) return null;

  return (
    <div className="space-y-2">
      {notifications.slice(0, 4).map((note) => (
        <div
          key={note.id}
          className={cn(
            "flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm",
            severityStyles[note.severity],
          )}
        >
          <div>
            <p className="font-semibold text-fiscmak-ink">{note.title}</p>
            <p className="mt-0.5 text-fiscmak-muted">{note.message}</p>
          </div>
          {note.href && (
            <Link
              href={note.href}
              className="shrink-0 font-medium text-fm-accent hover:underline"
              onClick={() => onAction?.(note)}
            >
              {note.actionLabel ?? "View"} →
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}

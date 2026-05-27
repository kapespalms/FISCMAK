"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { EngagementNotification } from "@/lib/v2/engagement-tracking";
import { cn } from "@/lib/utils";

function severityClass(severity: EngagementNotification["severity"]): string {
  if (severity === "urgent") return "border-red-400/40 bg-red-500/10";
  if (severity === "attention") return "border-amber-400/40 bg-amber-500/10";
  return "border-white/15 bg-white/5";
}

export function DashboardAlerts({ items }: { items: EngagementNotification[] }) {
  if (items.length === 0) return null;

  return (
    <ul className="mt-3 space-y-2" aria-label="Additional reminders">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={item.href ?? "/app/dashboard"}
            className={cn(
              "flex items-start justify-between gap-3 rounded-lg border px-3 py-2.5 transition-opacity hover:opacity-90",
              severityClass(item.severity),
            )}
          >
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-wide text-white/60">
                {item.severity === "urgent" ? "Needs attention" : "Reminder"}
              </p>
              <p className="text-sm font-semibold text-white">{item.title}</p>
              <p className="mt-0.5 line-clamp-2 text-xs text-white/70">{item.message}</p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-0.5 pt-1 text-[10px] font-medium text-[#5FD65F]">
              {item.actionLabel ?? "Open"}
              <ChevronRight size={12} aria-hidden />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

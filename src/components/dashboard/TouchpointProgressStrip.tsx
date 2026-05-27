"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TouchpointBarState } from "@/lib/v2/dashboard-redesign";

const SEGMENT_LABELS = ["1", "2", "3", "4", "5", "6", "7"];

function segmentClass(state: TouchpointBarState): string {
  if (state === "done") return "bg-[#5FD65F]";
  if (state === "active") {
    return "bg-white ring-1 ring-[#5FD65F]/60 ring-offset-1 ring-offset-cx-forest-dark/80";
  }
  return "bg-white/20";
}

export function TouchpointProgressStrip({
  states,
  href = "/app/assessment",
}: {
  states: TouchpointBarState[];
  href?: string;
}) {
  const completed = states.filter((s) => s === "done").length;
  const hasActive = states.some((s) => s === "active");
  const destination =
    href === "/app/subjective" ? "your perspective check-ins" : "coaching check-in status";

  return (
    <Link
      href={href}
      className="block rounded-lg transition-opacity hover:opacity-90"
      aria-label={`Coaching progress — open ${destination}`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-medium uppercase tracking-wide text-white/70">
          Coaching progress
        </p>
        <p className="inline-flex items-center gap-0.5 text-[10px] font-medium text-white/60">
          {completed} of 7
          {hasActive && (
            <>
              <span className="text-white/40">·</span>
              <span className="text-[#5FD65F]">Check-in due</span>
            </>
          )}
          <ChevronRight size={12} className="text-white/50" />
        </p>
      </div>
      <div
        className="mt-2 grid grid-cols-7 gap-1"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={7}
        aria-valuenow={completed}
      >
        {states.map((state, i) => (
          <div
            key={SEGMENT_LABELS[i]}
            className={cn("h-2 rounded-full transition-colors", segmentClass(state))}
            title={`Check-in ${SEGMENT_LABELS[i]}`}
          />
        ))}
      </div>
    </Link>
  );
}

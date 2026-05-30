"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CurrentBlockResult } from "@/lib/v2/programs/block-schedule";

type SchedulePositionPayload = {
  current: CurrentBlockResult | null;
  next: CurrentBlockResult | null;
  pgy_level: string | null;
};

export function SchedulePositionBanner({ compact = false }: { compact?: boolean }) {
  const [data, setData] = useState<SchedulePositionPayload | null>(null);

  useEffect(() => {
    fetch("/api/v1/onboarding/block-lookup")
      .then((r) => r.json())
      .then((json) => {
        if (json.current || json.next) {
          setData({
            current: json.current ?? null,
            next: json.next ?? null,
            pgy_level: json.pgy_level ?? null,
          });
        }
      })
      .catch(() => undefined);
  }, []);

  if (!data?.current?.matched && !data?.next?.matched) return null;

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  return (
    <div
      className={
        compact
          ? "rounded-xl border border-cx-forest-dark/15 bg-cx-forest-dark/[0.04] px-3 py-2.5"
          : "rounded-xl border border-cx-forest-dark/15 bg-gradient-to-r from-cx-forest-dark/[0.06] to-white px-4 py-3"
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-cx-forest-dark/50">
            Today · {today}
            {data.pgy_level ? ` · ${data.pgy_level}` : ""}
          </p>
          {data.current?.matched ? (
            <p className="mt-0.5 text-sm font-semibold text-cx-forest-dark">
              <span className="mr-1.5 inline-block rounded bg-cx-forest-dark px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                Now
              </span>
              {data.current.rotation_label}
              <span className="ml-1 font-normal text-cx-forest-dark/60">
                through {data.current.end_date}
                {typeof data.current.days_remaining === "number"
                  ? ` · ${data.current.days_remaining}d left`
                  : ""}
              </span>
            </p>
          ) : (
            <p className="mt-0.5 text-sm text-cx-forest-dark/70">Between blocks — see schedule below.</p>
          )}
          {data.next?.matched && (
            <p className="mt-1 text-xs text-cx-forest-dark/75">
              <span className="font-semibold text-cx-forest-dark">Up next:</span>{" "}
              {data.next.rotation_label} · starts {data.next.start_date}
            </p>
          )}
        </div>
        {!compact && (
          <Link
            href="/app/schedule?tab=blocks"
            className="shrink-0 text-xs font-medium text-cx-forest-dark underline-offset-2 hover:underline"
          >
            Full schedule →
          </Link>
        )}
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ScheduleCalendarView, type ScheduleBlock } from "@/components/calendar/ScheduleCalendarView";
import { BlockScheduleLegend } from "@/components/uh-psych/BlockScheduleLegend";
import type { UserScheduleEvent } from "@/lib/v2/schedule-calendar/types";

export function ScheduleCalendarWorkspace({ embedded = false }: { embedded?: boolean }) {
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
  const [userEvents, setUserEvents] = useState<UserScheduleEvent[]>([]);
  const [programLabel, setProgramLabel] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadSchedule = useCallback(() => {
    return fetch("/api/v1/onboarding/schedule")
      .then((r) => r.json())
      .then((data) => {
        if (data.enabled) {
          setEnabled(true);
          setBlocks(data.blocks ?? []);
          setUserEvents(data.user_events ?? []);
          setProgramLabel(data.program_label ?? null);
        }
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    void loadSchedule();
    const onScheduleUpdated = () => void loadSchedule();
    window.addEventListener("fiscmak:schedule-updated", onScheduleUpdated);
    return () => window.removeEventListener("fiscmak:schedule-updated", onScheduleUpdated);
  }, [loadSchedule]);

  if (loading) {
    return <p className="font-futura-book text-base text-black">Loading schedule…</p>;
  }

  if (!enabled) {
    return (
      <p className="font-futura-book text-base text-black">
        Schedule is not available for your program yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {!embedded && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-futura-medium text-sm uppercase tracking-wide text-cx-forest-dark">
              Schedule
            </p>
            <h1 className="text-page-title">Your calendar</h1>
            <p className="font-futura-book mt-1 text-base text-black">
              Month, week, and day views. Add events with Coach Mak, customize colors, and export to
              iCal, Google, or Outlook.
            </p>
          </div>
          <Link
            href="/app/dashboard"
            className="font-futura-medium text-sm text-cx-forest-dark underline-offset-2 hover:underline"
          >
            ← Dashboard
          </Link>
        </div>
      )}
      <BlockScheduleLegend />
      <ScheduleCalendarView
        blocks={blocks}
        userEvents={userEvents}
        programLabel={programLabel ?? undefined}
        variant="page"
      />
    </div>
  );
}

"use client";

import { ScheduleCalendarView, type ScheduleBlock } from "@/components/calendar/ScheduleCalendarView";
import type { UserScheduleEvent } from "@/lib/v2/schedule-calendar/types";

export type { ScheduleBlock };

type ResidentScheduleCalendarProps = {
  blocks: ScheduleBlock[];
  userEvents?: UserScheduleEvent[];
  programLabel?: string;
};

/** Dashboard-embedded rotation schedule (compact, multi-month strip). */
export function ResidentScheduleCalendar({
  blocks,
  userEvents,
  programLabel,
}: ResidentScheduleCalendarProps) {
  return (
    <ScheduleCalendarView
      blocks={blocks}
      userEvents={userEvents}
      programLabel={programLabel}
      variant="dashboard"
    />
  );
}

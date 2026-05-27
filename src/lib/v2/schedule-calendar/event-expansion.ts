import { assignmentByDay, parseIsoDate, toIsoDate } from "@/lib/v2/schedule-calendar/assignments";
import type { DayAssignment, ScheduleBlock, UserScheduleEvent } from "@/lib/v2/schedule-calendar/types";

export const PERSONAL_EVENT_CODE_PREFIX = "personal:";

export function personalEventCode(eventId: string): string {
  return `${PERSONAL_EVENT_CODE_PREFIX}${eventId}`;
}

export function isPersonalEventCode(code: string): boolean {
  return code.startsWith(PERSONAL_EVENT_CODE_PREFIX);
}

function parseEventInstant(value: string): Date {
  if (value.includes("T")) {
    const d = new Date(value);
    if (!Number.isNaN(d.getTime())) return d;
  }
  return parseIsoDate(value.slice(0, 10));
}

function daysBetween(start: Date, end: Date): string[] {
  const out: string[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    out.push(toIsoDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

function recurrenceEndDate(
  event: UserScheduleEvent,
  windowEnd: Date,
): { maxDate: Date; maxCount: number } {
  const end = event.recurrence?.end;
  if (end?.type === "date" && end.date) {
    return { maxDate: parseIsoDate(end.date), maxCount: Number.POSITIVE_INFINITY };
  }
  if (end?.type === "count" && end.count) {
    return { maxDate: windowEnd, maxCount: end.count };
  }
  return { maxDate: windowEnd, maxCount: Number.POSITIVE_INFINITY };
}

function expandRecurringOccurrences(
  event: UserScheduleEvent,
  windowStart: Date,
  windowEnd: Date,
): string[] {
  const recurrence = event.recurrence;
  if (!recurrence) return [];

  const start = parseEventInstant(event.start_date);
  const { maxDate, maxCount } = recurrenceEndDate(event, windowEnd);
  const interval = Math.max(1, recurrence.interval ?? 1);
  const frequency = recurrence.frequency;
  const daysOfWeek = recurrence.days_of_week?.length ? recurrence.days_of_week : null;

  const out: string[] = [];
  let count = 0;

  if (frequency === "weekly" && daysOfWeek) {
    const cursor = new Date(Math.max(start.getTime(), windowStart.getTime()));
    cursor.setHours(0, 0, 0, 0);
    const anchorWeekStart = new Date(start);
    anchorWeekStart.setDate(anchorWeekStart.getDate() - anchorWeekStart.getDay());

    while (cursor <= windowEnd && cursor <= maxDate && count < maxCount) {
      const weekStart = new Date(cursor);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weeksSince =
        Math.floor((weekStart.getTime() - anchorWeekStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
      if (weeksSince >= 0 && weeksSince % interval === 0 && daysOfWeek.includes(cursor.getDay())) {
        if (cursor >= start && cursor >= windowStart) {
          out.push(toIsoDate(cursor));
          count++;
        }
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    return out;
  }

  let cursor = new Date(start);
  while (cursor <= windowEnd && cursor <= maxDate && count < maxCount) {
    if (cursor >= windowStart) {
      out.push(toIsoDate(cursor));
      count++;
    }
    const next = new Date(cursor);
    switch (frequency) {
      case "daily":
        next.setDate(next.getDate() + interval);
        break;
      case "weekly":
        next.setDate(next.getDate() + 7 * interval);
        break;
      case "monthly":
        next.setMonth(next.getMonth() + interval);
        break;
      case "yearly":
        next.setFullYear(next.getFullYear() + interval);
        break;
      default:
        return out;
    }
    cursor = next;
  }
  return out;
}

export function expandUserEventOccurrences(
  event: UserScheduleEvent,
  windowStart: Date,
  windowEnd: Date,
): string[] {
  if (event.recurrence) {
    return expandRecurringOccurrences(event, windowStart, windowEnd);
  }
  const start = parseEventInstant(event.start_date);
  const end = parseEventInstant(event.end_date || event.start_date);
  const rangeStart = start < windowStart ? windowStart : start;
  const rangeEnd = end > windowEnd ? windowEnd : end;
  if (rangeStart > rangeEnd) return [];
  return daysBetween(rangeStart, rangeEnd);
}

const DEFAULT_WINDOW_PAST_DAYS = 30;
const DEFAULT_WINDOW_FUTURE_DAYS = 730;

export function defaultExpansionWindow(anchor?: Date): { start: Date; end: Date } {
  const base = anchor ?? new Date();
  const start = new Date(base);
  start.setDate(start.getDate() - DEFAULT_WINDOW_PAST_DAYS);
  const end = new Date(base);
  end.setDate(end.getDate() + DEFAULT_WINDOW_FUTURE_DAYS);
  return { start, end };
}

export function expandUserEventsToDays(
  events: UserScheduleEvent[],
  windowStart?: Date,
  windowEnd?: Date,
): DayAssignment[] {
  const { start, end } =
    windowStart && windowEnd
      ? { start: windowStart, end: windowEnd }
      : defaultExpansionWindow();

  const days: DayAssignment[] = [];
  for (const event of events) {
    const code = personalEventCode(event.id);
    for (const iso of expandUserEventOccurrences(event, start, end)) {
      days.push({
        iso,
        rotation_code: code,
        rotation_label: event.title,
        block_id: `evt-${event.id}-${iso}`,
        kind: "personal",
      });
    }
  }
  return days;
}

export function mergedAssignmentByDay(
  programBlocks: ScheduleBlock[],
  userEvents: UserScheduleEvent[],
): Map<string, DayAssignment> {
  const map = assignmentByDay(programBlocks);
  for (const day of expandUserEventsToDays(userEvents)) {
    if (!map.has(day.iso)) {
      map.set(day.iso, day);
    }
  }
  return map;
}

export function userEventsToDisplayBlocks(events: UserScheduleEvent[]): ScheduleBlock[] {
  const { start, end } = defaultExpansionWindow();
  const blocks: ScheduleBlock[] = [];
  for (const event of events) {
    const code = personalEventCode(event.id);
    for (const iso of expandUserEventOccurrences(event, start, end)) {
      blocks.push({
        block_id: `evt-${event.id}-${iso}`,
        start_date: iso,
        end_date: iso,
        rotation_code: code,
        rotation_label: event.title,
        kind: "personal",
      });
    }
  }
  return blocks;
}

export function formatEventTimeLabel(event: UserScheduleEvent): string {
  if (event.all_day) return "All day";
  const start = event.start_date;
  if (!start.includes("T")) return "All day";
  const d = new Date(start);
  if (Number.isNaN(d.getTime())) return "All day";
  return d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export function formatRecurrenceLabel(event: UserScheduleEvent): string {
  const r = event.recurrence;
  if (!r) return "Does not repeat";
  const interval = r.interval && r.interval > 1 ? `every ${r.interval} ` : "every ";
  const unit =
    r.frequency === "daily"
      ? "day(s)"
      : r.frequency === "weekly"
        ? "week(s)"
        : r.frequency === "monthly"
          ? "month(s)"
          : "year(s)";
  let label = `Repeats ${interval}${unit}`;
  if (r.days_of_week?.length) {
    const names = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    label += ` on ${r.days_of_week.map((d) => names[d]).join(", ")}`;
  }
  if (r.end?.type === "date" && r.end.date) label += ` until ${r.end.date}`;
  if (r.end?.type === "count" && r.end.count) label += ` for ${r.end.count} times`;
  return label;
}

export function summarizeUpcomingEvents(
  events: UserScheduleEvent[],
  horizonDays = 60,
): string {
  if (!events.length) return "";

  const today = toIsoDate(new Date());
  const horizon = new Date();
  horizon.setDate(horizon.getDate() + horizonDays);
  const horizonIso = toIsoDate(horizon);

  const lines: string[] = [];
  for (const event of events) {
    const occurrences = expandUserEventOccurrences(
      event,
      parseIsoDate(today),
      horizon,
    ).filter((iso) => iso >= today && iso <= horizonIso);
    if (!occurrences.length) continue;
    const next = occurrences[0];
    const time = formatEventTimeLabel(event);
    const repeat = event.recurrence ? ` (${formatRecurrenceLabel(event)})` : "";
    const lattice =
      event.lattice_domain && event.lattice_track
        ? ` [lattice: ${event.lattice_domain} × ${event.lattice_track}]`
        : "";
    lines.push(`- ${next}: ${event.title} (${time})${repeat}${lattice}`);
  }

  if (!lines.length) {
    return `Saved calendar events (${events.length} total) — none in the next ${horizonDays} days.`;
  }
  return `Upcoming calendar events (next ${horizonDays} days):\n${lines.slice(0, 12).join("\n")}`;
}

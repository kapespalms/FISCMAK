import type { DayAssignment, ScheduleBlock, UserScheduleEvent } from "@/lib/v2/schedule-calendar/types";
import { userEventsToDisplayBlocks } from "@/lib/v2/schedule-calendar/event-expansion";

export function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function toIsoDate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function expandBlocksToDays(blocks: ScheduleBlock[]): DayAssignment[] {
  const days: DayAssignment[] = [];
  for (const block of blocks) {
    const start = parseIsoDate(block.start_date);
    const end = parseIsoDate(block.end_date);
    const cursor = new Date(start);
    while (cursor <= end) {
      days.push({
        iso: toIsoDate(cursor),
        rotation_code: block.rotation_code,
        rotation_label: block.rotation_label,
        block_id: block.block_id,
        kind:
          block.kind === "personal"
            ? "personal"
            : block.kind ?? (block.rotation_code === "call" ? "call" : "rotation"),
      });
      cursor.setDate(cursor.getDate() + 1);
    }
  }
  return days;
}

export function assignmentByDay(blocks: ScheduleBlock[]): Map<string, DayAssignment> {
  const map = new Map<string, DayAssignment>();
  for (const day of expandBlocksToDays(blocks)) {
    map.set(day.iso, day);
  }
  return map;
}

export function uniqueRotationsFromBlocks(blocks: ScheduleBlock[]) {
  return [...new Map(blocks.map((b) => [b.rotation_code, b])).values()].sort((a, b) =>
    a.rotation_label.localeCompare(b.rotation_label),
  );
}

export function initialAnchorMonth(
  blocks: ScheduleBlock[],
  userEvents: UserScheduleEvent[] = [],
): Date {
  const eventBlocks = userEventsToDisplayBlocks(userEvents);
  const sorted = [...blocks, ...eventBlocks].sort((a, b) =>
    a.start_date.localeCompare(b.start_date),
  );
  if (!sorted.length) return new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const today = toIsoDate(new Date());
  const covering = sorted.find((b) => today >= b.start_date && today <= b.end_date);
  if (covering) {
    const [y, m] = covering.start_date.split("-").map(Number);
    return new Date(y, m - 1, 1);
  }
  const [y, m] = sorted[0].start_date.split("-").map(Number);
  return new Date(y, m - 1, 1);
}

export function addMonths(d: Date, count: number): Date {
  return new Date(d.getFullYear(), d.getMonth() + count, 1);
}

export function monthLabel(d: Date): string {
  return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export function weekStartSunday(d: Date): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() - copy.getDay());
  return copy;
}

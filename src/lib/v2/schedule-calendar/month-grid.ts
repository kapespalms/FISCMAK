import { parseIsoDate, toIsoDate } from "@/lib/v2/schedule-calendar/assignments";
import { mergedAssignmentByDay } from "@/lib/v2/schedule-calendar/event-expansion";
import type { DayAssignment, ScheduleBlock, UserScheduleEvent } from "@/lib/v2/schedule-calendar/types";

export type MonthCell = { day: number; iso: string; assignment?: DayAssignment } | null;

export type MonthGrid = {
  key: string;
  label: string;
  year: number;
  month: number;
  cells: MonthCell[];
};

export function buildMonthGrid(
  year: number,
  month: number,
  byDay: Map<string, DayAssignment>,
): MonthGrid {
  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  const leading = firstDay.getDay();
  const cells: MonthCell[] = [];
  for (let i = 0; i < leading; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    const iso = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({ day, iso, assignment: byDay.get(iso) });
  }
  return {
    key: `${year}-${String(month).padStart(2, "0")}`,
    label: firstDay.toLocaleDateString(undefined, { month: "long", year: "numeric" }),
    year,
    month,
    cells,
  };
}

export function buildMonthGrids(
  anchor: Date,
  span: number,
  blocks: ScheduleBlock[],
  userEvents: UserScheduleEvent[] = [],
): MonthGrid[] {
  const byDay = mergedAssignmentByDay(blocks, userEvents);
  const grids: MonthGrid[] = [];
  for (let i = 0; i < span; i++) {
    const d = new Date(anchor.getFullYear(), anchor.getMonth() + i, 1);
    grids.push(buildMonthGrid(d.getFullYear(), d.getMonth() + 1, byDay));
  }
  return grids;
}

export function cellSizeClass(span: number, variant: "dashboard" | "page"): string {
  if (variant === "page") return "min-h-10 text-sm";
  if (span === 1) return "min-h-8 text-sm";
  if (span <= 3) return "min-h-6 text-[11px]";
  if (span <= 6) return "min-h-5 text-[10px]";
  if (span <= 9) return "min-h-4 text-[9px]";
  return "min-h-3.5 text-[8px]";
}

export function monthWidthClass(span: number, variant: "dashboard" | "page"): string {
  if (variant === "page" && span === 1) return "w-full";
  if (span === 1) return "w-full min-w-0";
  if (span <= 3) return "w-[11rem] shrink-0 md:w-[12.5rem]";
  if (span <= 6) return "w-[9rem] shrink-0";
  if (span <= 9) return "w-[7.5rem] shrink-0";
  return "w-[6.5rem] shrink-0";
}

export function parsePickerMonth(value: string): Date | null {
  const [y, m] = value.split("-").map(Number);
  if (!y || !m) return null;
  return new Date(y, m - 1, 1);
}

export function pickerValue(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function isoInWeek(iso: string, weekStart: Date): boolean {
  const d = parseIsoDate(iso);
  const end = new Date(weekStart);
  end.setDate(end.getDate() + 6);
  return d >= weekStart && d <= end;
}

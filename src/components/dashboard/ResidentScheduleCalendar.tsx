"use client";

import { useMemo } from "react";
import { rotationTone } from "@/lib/v2/programs/rotation-catalog";

export type ScheduleBlock = {
  block_id: string;
  start_date: string;
  end_date: string;
  rotation_code: string;
  rotation_label: string;
};

type ResidentScheduleCalendarProps = {
  blocks: ScheduleBlock[];
  programLabel?: string;
};

function parseDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function monthLabel(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export function ResidentScheduleCalendar({ blocks, programLabel }: ResidentScheduleCalendarProps) {
  const months = useMemo(() => {
    if (!blocks.length) return [];
    const sorted = [...blocks].sort((a, b) => a.start_date.localeCompare(b.start_date));
    const start = parseDate(sorted[0].start_date);
    const end = parseDate(sorted[sorted.length - 1].end_date);
    const keys: string[] = [];
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    const last = new Date(end.getFullYear(), end.getMonth(), 1);
    while (cursor <= last) {
      keys.push(monthKey(cursor));
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return keys.map((key) => {
      const [y, m] = key.split("-").map(Number);
      const firstDay = new Date(y, m - 1, 1);
      const daysInMonth = new Date(y, m, 0).getDate();
      const leading = firstDay.getDay();
      const cells: Array<{ day: number; block?: ScheduleBlock } | null> = [];
      for (let i = 0; i < leading; i++) cells.push(null);
      for (let day = 1; day <= daysInMonth; day++) {
        const iso = `${y}-${String(m).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        const block = blocks.find((b) => iso >= b.start_date && iso <= b.end_date);
        cells.push({ day, block });
      }
      return { key, label: monthLabel(key), cells };
    });
  }, [blocks]);

  if (!blocks.length) {
    return (
      <div className="rounded-2xl border border-cx-forest-dark/15 bg-white/60 p-4 text-sm text-cx-forest-dark/70">
        No schedule blocks found for your roster slot yet.
      </div>
    );
  }

  return (
    <section className="rounded-2xl border border-cx-forest-dark/15 bg-white/80 p-4 md:p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold text-cx-forest-dark">Your rotation schedule</h2>
        {programLabel && (
          <p className="text-xs text-cx-forest-dark/60">{programLabel}</p>
        )}
      </div>
      <p className="mt-1 text-xs text-cx-forest-dark/65">
        Color-coded from your program block schedule. PGY-3/4 weekly schedules appear when uploaded.
      </p>
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        {months.map((month) => (
          <div key={month.key}>
            <h3 className="mb-2 text-sm font-semibold text-cx-forest-dark">{month.label}</h3>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium text-cx-forest-dark/50">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                <div key={d}>{d}</div>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-1">
              {month.cells.map((cell, idx) => {
                if (!cell) return <div key={`empty-${idx}`} className="aspect-square" />;
                const tone = cell.block ? rotationTone(cell.block.rotation_code) : "";
                return (
                  <div
                    key={`${month.key}-${cell.day}`}
                    title={cell.block?.rotation_label ?? undefined}
                    className={`aspect-square rounded-md border text-[10px] leading-tight ${
                      cell.block ? tone : "border-transparent bg-cx-forest-dark/5"
                    } flex items-center justify-center`}
                  >
                    {cell.day}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {[...new Map(blocks.map((b) => [b.rotation_code, b])).values()].slice(0, 8).map((b) => (
          <span
            key={b.rotation_code}
            className={`rounded-full border px-2 py-0.5 text-[10px] ${rotationTone(b.rotation_code)}`}
          >
            {b.rotation_label}
          </span>
        ))}
      </div>
    </section>
  );
}

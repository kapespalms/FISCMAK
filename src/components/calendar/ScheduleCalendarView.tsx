"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  addMonths,
  initialAnchorMonth,
  weekStartSunday,
  toIsoDate,
  parseIsoDate,
} from "@/lib/v2/schedule-calendar/assignments";
import { mergedAssignmentByDay, personalEventCode } from "@/lib/v2/schedule-calendar/event-expansion";
import {
  resolveRotationColors,
  rotationAbbreviation,
  textColorForBackground,
} from "@/lib/v2/schedule-calendar/colors";
import {
  buildMonthGrids,
  cellSizeClass,
  monthWidthClass,
  pickerValue,
  parsePickerMonth,
} from "@/lib/v2/schedule-calendar/month-grid";
import {
  fetchSchedulePreferences,
  loadLocalColorOverrides,
  loadLocalDashboardSpan,
  persistSchedulePreferences,
  saveLocalColorOverrides,
  saveLocalDashboardSpan,
} from "@/lib/v2/schedule-calendar/preferences-storage";
import { googleCalendarSubscribeUrl, outlookSubscribeUrl } from "@/lib/v2/schedule-calendar/ics";
import type {
  CalendarPageView,
  CalendarSpan,
  ScheduleBlock,
  UserScheduleEvent,
} from "@/lib/v2/schedule-calendar/types";
import { ScheduleCategoryLegend } from "@/components/calendar/ScheduleCategoryLegend";
import { SchedulePositionBanner } from "@/components/calendar/SchedulePositionBanner";
import { ScheduleKey } from "@/components/calendar/ScheduleKey";

export type { ScheduleBlock };

const SPAN_OPTIONS: CalendarSpan[] = [1, 3, 6, 9, 12];
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

type ScheduleCalendarViewProps = {
  blocks: ScheduleBlock[];
  userEvents?: UserScheduleEvent[];
  programLabel?: string;
  variant?: "dashboard" | "page";
};

function MonthMiniGrid({
  grid,
  span,
  variant,
  colors,
  onSelectDay,
  selectedIso,
  todayIso,
}: {
  grid: ReturnType<typeof buildMonthGrids>[number];
  span: number;
  variant: "dashboard" | "page";
  colors: Record<string, string>;
  onSelectDay?: (iso: string) => void;
  selectedIso?: string;
  todayIso?: string;
}) {
  const cellClass = cellSizeClass(span, variant);
  return (
    <div className={monthWidthClass(span, variant)}>
      <h3 className="font-futura-medium mb-1 truncate text-center text-sm text-cx-forest-dark">
        {span === 1 ? grid.label : grid.label.replace(/\s+\d{4}$/, "")}
      </h3>
      <div className="grid grid-cols-7 gap-px text-center font-futura-book text-black/70">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-[10px] font-futura-medium uppercase text-cx-forest-dark">
            {span > 6 ? d.charAt(0) : d}
          </div>
        ))}
      </div>
      <div className="mt-0.5 grid grid-cols-7 gap-px">
        {grid.cells.map((cell, idx) => {
          if (!cell) return <div key={`e-${idx}`} className={cellClass} />;
          const code = cell.assignment?.rotation_code;
          const bg = code ? colors[code] : "#F3F4F6";
          const fg = code ? textColorForBackground(bg) : "#111111";
          const selected = selectedIso === cell.iso;
          const isToday = todayIso === cell.iso;
          const abbr =
            cell.assignment && span > 1
              ? rotationAbbreviation(cell.assignment.rotation_label, cell.assignment.rotation_code)
              : null;
          return (
            <button
              key={cell.iso}
              type="button"
              title={cell.assignment?.rotation_label}
              onClick={() => onSelectDay?.(cell.iso)}
              className={`${cellClass} relative rounded-sm border font-futura-book leading-none transition-opacity ${
                onSelectDay ? "cursor-pointer hover:opacity-90" : "cursor-default"
              } ${selected ? "ring-2 ring-cx-forest-dark ring-offset-1" : isToday ? "ring-2 ring-[#5FD65F] ring-offset-1" : "border-transparent"}`}
              style={{ backgroundColor: bg, color: fg }}
            >
              <span className="block text-[10px] font-semibold">{cell.day}</span>
              {abbr && span > 1 ? (
                <span className="mt-0.5 block truncate text-[8px] font-medium leading-none opacity-90">
                  {abbr}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ExportButtons({ exportPath }: { exportPath: string }) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const icsUrl = `${origin}${exportPath}`;
  return (
    <div className="flex flex-wrap gap-2">
      <a
        href={exportPath}
        download
        className="font-futura-medium rounded-lg border border-cx-forest-dark/20 bg-white px-3 py-1.5 text-sm text-cx-forest-dark hover:bg-cx-forest-dark/5"
      >
        iCal (.ics)
      </a>
      <a
        href={googleCalendarSubscribeUrl(icsUrl)}
        target="_blank"
        rel="noopener noreferrer"
        className="font-futura-medium rounded-lg border border-cx-forest-dark/20 bg-white px-3 py-1.5 text-sm text-cx-forest-dark hover:bg-cx-forest-dark/5"
      >
        Google Calendar
      </a>
      <a
        href={outlookSubscribeUrl(icsUrl)}
        target="_blank"
        rel="noopener noreferrer"
        className="font-futura-medium rounded-lg border border-cx-forest-dark/20 bg-white px-3 py-1.5 text-sm text-cx-forest-dark hover:bg-cx-forest-dark/5"
      >
        Outlook
      </a>
    </div>
  );
}

export function ScheduleCalendarView({
  blocks,
  userEvents = [],
  programLabel,
  variant = "dashboard",
}: ScheduleCalendarViewProps) {
  const [anchor, setAnchor] = useState(() => initialAnchorMonth(blocks, userEvents));
  const [span, setSpan] = useState<CalendarSpan>(1);
  const [pageView, setPageView] = useState<CalendarPageView>("month");
  const [selectedDay, setSelectedDay] = useState(() => toIsoDate(new Date()));
  const [colorOverrides, setColorOverrides] = useState<Record<string, string>>({});

  useEffect(() => {
    setAnchor(initialAnchorMonth(blocks, userEvents));
  }, [blocks, userEvents]);

  useEffect(() => {
    const local = loadLocalColorOverrides();
    setColorOverrides(local);
    if (variant === "dashboard") setSpan(loadLocalDashboardSpan());
    void fetchSchedulePreferences().then((prefs) => {
      if (prefs.color_overrides && Object.keys(prefs.color_overrides).length) {
        setColorOverrides((prev) => ({ ...prev, ...prefs.color_overrides }));
      }
      if (variant === "dashboard" && prefs.dashboard_span) setSpan(prefs.dashboard_span);
    });
  }, [variant]);

  const codes = useMemo(() => {
    const programCodes = blocks.map((b) => b.rotation_code);
    const eventCodes = userEvents.map((e) => personalEventCode(e.id));
    return [...new Set([...programCodes, ...eventCodes])];
  }, [blocks, userEvents]);
  const colors = useMemo(
    () => resolveRotationColors(codes, colorOverrides, "category"),
    [codes, colorOverrides],
  );

  const todayIso = toIsoDate(new Date());

  const effectiveSpan = variant === "page" && pageView !== "month" ? 1 : span;
  const monthGrids = useMemo(
    () => buildMonthGrids(anchor, effectiveSpan, blocks, userEvents),
    [anchor, effectiveSpan, blocks, userEvents],
  );

  const byDay = useMemo(
    () => mergedAssignmentByDay(blocks, userEvents),
    [blocks, userEvents],
  );

  const persistColors = useCallback((next: Record<string, string>) => {
    saveLocalColorOverrides(next);
    void persistSchedulePreferences({ color_overrides: next, dashboard_span: span });
  }, [span]);

  function handleColorChange(code: string, hex: string) {
    setColorOverrides((prev) => {
      const next = { ...prev, [code]: hex };
      persistColors(next);
      return next;
    });
  }

  function handleSpanChange(next: CalendarSpan) {
    setSpan(next);
    saveLocalDashboardSpan(next);
    void persistSchedulePreferences({ color_overrides: colorOverrides, dashboard_span: next });
  }

  function shiftAnchor(delta: number) {
    setAnchor((prev) => addMonths(prev, delta));
  }

  const weekStart = weekStartSunday(parseIsoDate(selectedDay));
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return toIsoDate(d);
  });

  const selectedAssignment = byDay.get(selectedDay);
  const hasProgramBlocks = blocks.length > 0;
  const hasCalendarContent = hasProgramBlocks || userEvents.length > 0;

  return (
    <section className="rounded-2xl border border-cx-forest-dark/15 bg-white/80 p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-futura-medium text-lg text-cx-forest-dark md:text-xl">
            {variant === "page" ? "Schedule" : "Your rotation schedule"}
          </h2>
          {programLabel && (
            <p className="font-futura-book mt-0.5 text-sm text-black">{programLabel}</p>
          )}
          <p className="font-futura-book mt-1 text-sm text-black">
            {hasProgramBlocks
              ? "Program rotations and your saved events — never includes patient information."
              : hasCalendarContent
                ? "Your saved events — add more with + Events or Mak."
                : "Add events with Mak, or your program schedule will appear here when linked."}
          </p>
        </div>
        {variant === "dashboard" && (
          <Link
            href="/app/schedule?tab=blocks"
            className="font-futura-medium shrink-0 text-sm text-cx-forest-dark underline-offset-2 hover:underline"
          >
            Open full calendar →
          </Link>
        )}
      </div>

      <SchedulePositionBanner compact={variant === "dashboard"} />

      {selectedAssignment && (variant === "dashboard" || pageView === "month") && (
        <div className="mt-3 rounded-lg border border-cx-forest-dark/12 bg-white px-3 py-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-cx-forest-dark/50">
            Selected day
          </p>
          <p className="text-sm font-medium text-cx-forest-dark">
            {parseIsoDate(selectedDay).toLocaleDateString(undefined, {
              weekday: "long",
              month: "short",
              day: "numeric",
            })}
            {selectedDay === todayIso ? " · Today" : ""}
          </p>
          <p className="text-sm text-cx-forest-dark/75">
            {selectedAssignment.rotation_label}
          </p>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => shiftAnchor(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-cx-forest-dark/20 text-cx-forest-dark hover:bg-cx-forest-dark/5"
          aria-label="Previous month"
        >
          <ChevronLeft size={18} />
        </button>
        <input
          type="month"
          value={pickerValue(anchor)}
          onChange={(e) => {
            const parsed = parsePickerMonth(e.target.value);
            if (parsed) setAnchor(parsed);
          }}
          className="cx-field font-futura-book py-1.5 text-base text-black"
          aria-label="Jump to month"
        />
        <button
          type="button"
          onClick={() => shiftAnchor(1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-cx-forest-dark/20 text-cx-forest-dark hover:bg-cx-forest-dark/5"
          aria-label="Next month"
        >
          <ChevronRight size={18} />
        </button>

        {variant === "dashboard" ? (
          <div className="ml-auto flex flex-wrap gap-1">
            {SPAN_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => handleSpanChange(option)}
                className={`font-futura-medium rounded-lg px-2.5 py-1.5 text-sm ${
                  span === option
                    ? "bg-cx-forest-dark text-white"
                    : "border border-cx-forest-dark/20 text-cx-forest-dark hover:bg-cx-forest-dark/5"
                }`}
              >
                {option} mo
              </button>
            ))}
          </div>
        ) : (
          <div className="ml-auto flex gap-1">
            {(["month", "week", "day"] as CalendarPageView[]).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setPageView(v)}
                className={`font-futura-medium rounded-lg px-3 py-1.5 text-sm capitalize ${
                  pageView === v
                    ? "bg-cx-forest-dark text-white"
                    : "border border-cx-forest-dark/20 text-cx-forest-dark hover:bg-cx-forest-dark/5"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        )}
      </div>

      {variant === "page" && pageView === "week" && (
        <div className="mt-4 grid gap-2 sm:grid-cols-7">
          {weekDays.map((iso) => {
            const assignment = byDay.get(iso);
            const bg = assignment ? colors[assignment.rotation_code] : "#F9FAFB";
            const fg = assignment ? textColorForBackground(bg) : "#111111";
            const d = parseIsoDate(iso);
            return (
              <button
                key={iso}
                type="button"
                onClick={() => setSelectedDay(iso)}
                className={`rounded-xl border p-3 text-left ${
                  selectedDay === iso ? "ring-2 ring-cx-forest-dark" : "border-cx-forest-dark/15"
                }`}
                style={{ backgroundColor: bg, color: fg }}
              >
                <p className="font-futura-medium text-sm">
                  {d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
                </p>
                <p className="font-futura-book mt-1 text-sm">{assignment?.rotation_label ?? "—"}</p>
              </button>
            );
          })}
        </div>
      )}

      {variant === "page" && pageView === "day" && (
        <div className="mt-4 rounded-xl border border-cx-forest-dark/15 p-5">
          <p className="font-futura-medium text-lg text-cx-forest-dark">
            {parseIsoDate(selectedDay).toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          {selectedAssignment ? (
            <div
              className="mt-3 rounded-lg px-4 py-3"
              style={{
                backgroundColor: colors[selectedAssignment.rotation_code],
                color: textColorForBackground(colors[selectedAssignment.rotation_code]),
              }}
            >
              <p className="font-futura-medium text-base">{selectedAssignment.rotation_label}</p>
              <p className="font-futura-book mt-1 text-sm opacity-90">
                {selectedAssignment.kind === "call"
                  ? "Call"
                  : selectedAssignment.kind === "personal"
                    ? "Event"
                    : "Rotation"}
              </p>
            </div>
          ) : (
            <p className="font-futura-book mt-3 text-base text-black">No assignment on this day.</p>
          )}
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => {
                const d = parseIsoDate(selectedDay);
                d.setDate(d.getDate() - 1);
                setSelectedDay(toIsoDate(d));
              }}
              className="font-futura-medium rounded-lg border border-cx-forest-dark/20 px-3 py-2 text-sm"
            >
              Previous day
            </button>
            <button
              type="button"
              onClick={() => {
                const d = parseIsoDate(selectedDay);
                d.setDate(d.getDate() + 1);
                setSelectedDay(toIsoDate(d));
              }}
              className="font-futura-medium rounded-lg border border-cx-forest-dark/20 px-3 py-2 text-sm"
            >
              Next day
            </button>
          </div>
        </div>
      )}

      {(variant === "dashboard" || pageView === "month") && (
        <div
          className={`mt-4 flex gap-3 overflow-x-auto pb-1 ${
            effectiveSpan > 1 ? "flex-nowrap" : "flex-wrap"
          }`}
        >
          {monthGrids.map((grid) => (
            <MonthMiniGrid
              key={grid.key}
              grid={grid}
              span={effectiveSpan}
              variant={variant}
              colors={colors}
              todayIso={todayIso}
              onSelectDay={
                variant === "page"
                  ? (iso) => {
                      setSelectedDay(iso);
                      setPageView("day");
                    }
                  : (iso) => setSelectedDay(iso)
              }
              selectedIso={selectedDay}
            />
          ))}
        </div>
      )}

      {variant === "dashboard" ? (
        <ScheduleCategoryLegend />
      ) : (
        <details className="mt-3 border-t border-cx-forest-dark/10 pt-3">
          <summary className="cursor-pointer font-futura-medium text-xs text-cx-forest-dark/70">
            Customize colors
          </summary>
          <ScheduleKey
            programBlocks={blocks}
            userEvents={userEvents}
            colors={colors}
            onColorChange={handleColorChange}
          />
        </details>
      )}

      {(hasProgramBlocks || userEvents.length > 0) && (
        <div className="mt-4 border-t border-cx-forest-dark/10 pt-4">
          <p className="font-futura-medium mb-2 text-sm text-cx-forest-dark">Add to your calendar</p>
          <ExportButtons exportPath="/api/v1/onboarding/schedule/export" />
        </div>
      )}
    </section>
  );
}

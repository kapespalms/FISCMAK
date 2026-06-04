"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  addDaysIso,
  addMonthsIso,
  callAssignmentsForDate,
  callAssignmentsForInitials,
  callCoverageGridForMonth,
  callScheduleDateRange,
  listCallScheduleDates,
  residentCallRoles,
  weekDatesContaining,
} from "@/lib/v2/programs/call-schedule";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function formatDisplayDate(iso: string): string {
  const d = new Date(`${iso}T12:00:00`);
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function formatMonthLabel(year: number, monthIndex: number): string {
  return new Date(year, monthIndex, 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function dayOfMonth(iso: string): number {
  return Number(iso.slice(8, 10));
}

function weekdayLetter(iso: string): string {
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-US", { weekday: "narrow" });
}

type ViewMode = "day" | "month" | "mine";

export function CallScheduleView({ embedded = false }: { embedded?: boolean }) {
  const range = callScheduleDateRange();
  const allDates = useMemo(() => listCallScheduleDates(), []);

  const [selectedDate, setSelectedDate] = useState(() => {
    const t = todayIso();
    if (allDates.includes(t)) return t;
    return allDates[0] ?? t;
  });
  const [monthAnchor, setMonthAnchor] = useState(() => {
    const t = todayIso();
    const d = new Date(`${t}T12:00:00`);
    return { year: d.getFullYear(), month: d.getMonth() };
  });
  const [initialsFilter, setInitialsFilter] = useState("");
  const [myInitials, setMyInitials] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("month");

  useEffect(() => {
    fetch("/api/v1/onboarding/touchpoint1")
      .then((r) => r.json())
      .then((d) => {
        const abbr = d.onboarding?.trainee_initials ?? d.onboarding_metadata?.trainee_initials;
        if (typeof abbr === "string" && abbr.trim()) {
          setMyInitials(abbr.trim().toUpperCase());
        }
      })
      .catch(() => undefined);
  }, []);

  const weekDates = useMemo(() => weekDatesContaining(selectedDate), [selectedDate]);
  const dayAssignments = useMemo(() => callAssignmentsForDate(selectedDate), [selectedDate]);
  const residentRoles = useMemo(() => new Set(residentCallRoles().map((r) => r.role)), []);
  const monthGrid = useMemo(
    () => callCoverageGridForMonth(monthAnchor.year, monthAnchor.month),
    [monthAnchor.month, monthAnchor.year],
  );

  const monthWeekStrip = useMemo(() => {
    const inMonth = new Set(monthGrid.dates);
    const anchor = inMonth.has(todayIso())
      ? todayIso()
      : inMonth.has(selectedDate)
        ? selectedDate
        : monthGrid.dates[0];
    if (!anchor) return [];
    return weekDatesContaining(anchor).filter((d) => inMonth.has(d));
  }, [monthGrid.dates, selectedDate]);

  const filteredDay = useMemo(() => {
    const rows = dayAssignments.filter((a) => residentRoles.has(a.role) || residentRoles.size === 0);
    const q = initialsFilter.trim().toUpperCase();
    if (!q) return rows;
    return rows.filter((a) => a.assignee_abbr.toUpperCase().includes(q));
  }, [dayAssignments, initialsFilter, residentRoles]);

  const myAssignments = useMemo(() => {
    const abbr = myInitials ?? initialsFilter.trim();
    if (!abbr) return [];
    return callAssignmentsForInitials(abbr).sort((a, b) => a.date.localeCompare(b.date));
  }, [myInitials, initialsFilter]);

  function shiftWeek(delta: number) {
    setSelectedDate((d) => {
      const next = addDaysIso(d, delta * 7);
      if (range && next < range.start) return range.start;
      if (range && next > range.end) return range.end;
      return next;
    });
  }

  function shiftMonth(delta: number) {
    setMonthAnchor((current) => {
      const nextIso = addMonthsIso(`${current.year}-${String(current.month + 1).padStart(2, "0")}-01`, delta);
      const next = new Date(`${nextIso}T12:00:00`);
      return { year: next.getFullYear(), month: next.getMonth() };
    });
  }

  const viewPills: Array<{ id: ViewMode; label: string }> = [
    { id: "month", label: "Month grid" },
    { id: "day", label: "By day" },
    { id: "mine", label: "My assignments" },
  ];

  return (
    <div className="space-y-5">
      {!embedded && (
        <div>
          <Link
            href="/app/schedule?tab=links"
            className="text-xs font-medium text-cx-forest-dark/60 hover:text-cx-forest-dark"
          >
            ← Schedule
          </Link>
          <h1 className="mt-1 text-page-title">CMC call schedule</h1>
        </div>
      )}
      <p className="text-sm text-cx-forest-dark/70">
        Seeded coverage grid · live switches in QGenda
      </p>

      <div className="flex flex-wrap gap-2">
        {viewPills.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setView(id)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              view === id
                ? "bg-cx-forest-dark text-white"
                : "border border-cx-forest-dark/15 text-cx-forest-dark/80"
            }`}
          >
            {label}
          </button>
        ))}
        {myInitials && (
          <button
            type="button"
            onClick={() => {
              setInitialsFilter(myInitials);
              setView("mine");
            }}
            className="rounded-full border border-[#AC8636]/40 bg-[#AC8636]/10 px-3 py-1.5 text-xs font-medium text-cx-forest-dark"
          >
            Use my initials ({myInitials})
          </button>
        )}
      </div>

      {view === "month" && (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => shiftMonth(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-cx-forest-dark/15 hover:bg-cx-forest-dark/5"
            >
              <ChevronLeft size={18} />
            </button>
            <p className="min-w-[10rem] text-center text-sm font-semibold text-cx-forest-dark">
              {formatMonthLabel(monthAnchor.year, monthAnchor.month)}
            </p>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => shiftMonth(1)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-cx-forest-dark/15 hover:bg-cx-forest-dark/5"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {monthWeekStrip.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-cx-forest-dark/55">Week</span>
              <div className="flex flex-1 gap-1 overflow-x-auto">
                {monthWeekStrip.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setSelectedDate(d);
                      setView("day");
                    }}
                    className={`min-w-[3.5rem] shrink-0 rounded-lg px-2 py-1.5 text-center text-xs ${
                      d === todayIso()
                        ? "border border-[#AC8636]/50 bg-[#AC8636]/10 text-cx-forest-dark"
                        : "border border-cx-forest-dark/10 text-cx-forest-dark/80 hover:bg-cx-forest-dark/5"
                    }`}
                  >
                    {formatDisplayDate(d)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="overflow-x-auto rounded-2xl border border-cx-forest-dark/15 bg-white">
            <table className="min-w-full text-left text-xs">
              <thead className="border-b border-cx-forest-dark/10 bg-cx-forest-dark/[0.03]">
                <tr>
                  <th className="sticky left-0 z-10 min-w-[10rem] bg-cx-forest-dark/[0.03] px-2 py-2 font-semibold text-cx-forest-dark">
                    Role
                  </th>
                  {monthGrid.dates.map((date) => {
                    const isToday = date === todayIso();
                    return (
                      <th
                        key={date}
                        className={`min-w-[2.25rem] px-1 py-2 text-center font-semibold ${
                          isToday ? "bg-[#AC8636]/15 text-cx-forest-dark" : "text-cx-forest-dark/70"
                        }`}
                      >
                        <span className="block text-[10px] uppercase">{weekdayLetter(date)}</span>
                        <span>{dayOfMonth(date)}</span>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {monthGrid.rows.map((row) => (
                  <tr key={row.role} className="border-b border-cx-forest-dark/5">
                    <td className="sticky left-0 z-10 bg-white px-2 py-2 font-medium text-cx-forest-dark/85">
                      {row.role.replace(/Psych Service Answering /i, "")}
                    </td>
                    {monthGrid.dates.map((date) => {
                      const cell = row.cells.get(date);
                      const isToday = date === todayIso();
                      const isMine =
                        myInitials &&
                        cell?.assignee_abbr.toUpperCase() === myInitials.toUpperCase();
                      return (
                        <td
                          key={`${row.role}-${date}`}
                          className={`px-1 py-2 text-center align-middle ${
                            isToday ? "bg-[#AC8636]/10" : ""
                          } ${isMine ? "font-semibold text-cx-forest-dark" : "text-cx-forest-dark/75"}`}
                          title={cell?.shift ? `${cell.assignee_abbr} · ${cell.shift}` : undefined}
                        >
                          {cell?.assignee_abbr ?? "—"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {view === "day" && (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              aria-label="Previous week"
              onClick={() => shiftWeek(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-cx-forest-dark/15 hover:bg-cx-forest-dark/5"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex flex-1 gap-1 overflow-x-auto">
              {weekDates.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSelectedDate(d)}
                  className={`min-w-[4.5rem] shrink-0 rounded-xl px-2 py-2 text-center text-xs ${
                    d === selectedDate
                      ? "bg-cx-forest-dark text-white"
                      : d === todayIso()
                        ? "border border-[#AC8636]/50 bg-[#AC8636]/10 text-cx-forest-dark"
                        : "border border-cx-forest-dark/10 text-cx-forest-dark/80 hover:bg-cx-forest-dark/5"
                  }`}
                >
                  {formatDisplayDate(d)}
                </button>
              ))}
            </div>
            <button
              type="button"
              aria-label="Next week"
              onClick={() => shiftWeek(1)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-cx-forest-dark/15 hover:bg-cx-forest-dark/5"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <label className="text-xs font-medium text-cx-forest-dark/70">
              Filter initials
              <input
                type="text"
                value={initialsFilter}
                onChange={(e) => setInitialsFilter(e.target.value.toUpperCase())}
                placeholder="e.g. HouA"
                className="mt-1 block w-32 rounded-lg border border-cx-forest-dark/15 px-3 py-2 text-sm uppercase"
              />
            </label>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-cx-forest-dark/15 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-cx-forest-dark/10 bg-cx-forest-dark/[0.03]">
                <tr>
                  <th className="px-4 py-3 font-semibold text-cx-forest-dark">Role</th>
                  <th className="px-4 py-3 font-semibold text-cx-forest-dark">Initials</th>
                  <th className="px-4 py-3 font-semibold text-cx-forest-dark">Shift</th>
                </tr>
              </thead>
              <tbody>
                {filteredDay.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-cx-forest-dark/60">
                      No assignments for {formatDisplayDate(selectedDate)}.
                    </td>
                  </tr>
                ) : (
                  filteredDay.map((row, i) => (
                    <tr key={`${row.role}-${i}`} className="border-b border-cx-forest-dark/5">
                      <td className="px-4 py-3 text-cx-forest-dark/85">{row.role}</td>
                      <td className="px-4 py-3 font-medium text-cx-forest-dark">{row.assignee_abbr}</td>
                      <td className="px-4 py-3 text-cx-forest-dark/75">{row.shift ?? "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {view === "mine" && (
        <div className="overflow-x-auto rounded-2xl border border-cx-forest-dark/15 bg-white">
          {!myInitials && !initialsFilter.trim() ? (
            <p className="px-4 py-8 text-center text-sm text-cx-forest-dark/60">
              Enter your roster initials above, or complete onboarding with your program invite.
            </p>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-cx-forest-dark/10 bg-cx-forest-dark/[0.03]">
                <tr>
                  <th className="px-4 py-3 font-semibold text-cx-forest-dark">Date</th>
                  <th className="px-4 py-3 font-semibold text-cx-forest-dark">Role</th>
                  <th className="px-4 py-3 font-semibold text-cx-forest-dark">Shift</th>
                </tr>
              </thead>
              <tbody>
                {myAssignments.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-cx-forest-dark/60">
                      No assignments found for {myInitials ?? initialsFilter}.
                    </td>
                  </tr>
                ) : (
                  myAssignments.map((row, i) => (
                    <tr key={`${row.date}-${row.role}-${i}`} className="border-b border-cx-forest-dark/5">
                      <td className="px-4 py-3 text-cx-forest-dark">{formatDisplayDate(row.date)}</td>
                      <td className="px-4 py-3 text-cx-forest-dark/85">{row.role}</td>
                      <td className="px-4 py-3 text-cx-forest-dark/75">{row.shift ?? "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  addDaysIso,
  callAssignmentsForDate,
  callAssignmentsForInitials,
  callScheduleDateRange,
  callScheduleMeta,
  callScheduleStats,
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

export function CallScheduleView() {
  const meta = callScheduleMeta();
  const stats = callScheduleStats();
  const range = callScheduleDateRange();
  const allDates = useMemo(() => listCallScheduleDates(), []);

  const [selectedDate, setSelectedDate] = useState(() => {
    const t = todayIso();
    if (allDates.includes(t)) return t;
    return allDates[0] ?? t;
  });
  const [initialsFilter, setInitialsFilter] = useState("");
  const [myInitials, setMyInitials] = useState<string | null>(null);
  const [view, setView] = useState<"day" | "mine">("day");

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/app/residency/contacts-calendars"
            className="text-xs font-medium text-cx-forest-dark/60 hover:text-cx-forest-dark"
          >
            ← Contacts & calendars
          </Link>
          <h1 className="mt-1 text-page-title">CMC call schedule</h1>
          <p className="mt-2 max-w-2xl text-sm text-cx-forest-dark/75">
            {meta.site} — seeded coverage grid ({stats.assignment_count} assignments).{" "}
            {meta.qgenda_note}
          </p>
          <p className="mt-1 text-xs text-cx-forest-dark/50">{meta.privacy_note}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setView("day")}
          className={`rounded-full px-3 py-1.5 text-xs font-medium ${
            view === "day"
              ? "bg-cx-forest-dark text-white"
              : "border border-cx-forest-dark/15 text-cx-forest-dark/80"
          }`}
        >
          By day
        </button>
        <button
          type="button"
          onClick={() => setView("mine")}
          className={`rounded-full px-3 py-1.5 text-xs font-medium ${
            view === "mine"
              ? "bg-cx-forest-dark text-white"
              : "border border-cx-forest-dark/15 text-cx-forest-dark/80"
          }`}
        >
          My assignments
        </button>
        {myInitials && (
          <button
            type="button"
            onClick={() => {
              setInitialsFilter(myInitials);
              setView("mine");
            }}
            className="rounded-full border border-[#5FD65F]/40 bg-[#5FD65F]/10 px-3 py-1.5 text-xs font-medium text-cx-forest-dark"
          >
            Use my initials ({myInitials})
          </button>
        )}
      </div>

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
                        ? "border border-[#5FD65F]/50 bg-[#5FD65F]/10 text-cx-forest-dark"
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

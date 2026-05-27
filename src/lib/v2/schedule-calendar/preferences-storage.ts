import type { CalendarSpan, ScheduleCalendarPreferences } from "@/lib/v2/schedule-calendar/types";

const COLOR_KEY = "fiscmak_schedule_color_overrides";
const SPAN_KEY = "fiscmak_schedule_dashboard_span";

export function loadLocalColorOverrides(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(COLOR_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, string>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function saveLocalColorOverrides(overrides: Record<string, string>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(COLOR_KEY, JSON.stringify(overrides));
}

export function loadLocalDashboardSpan(): CalendarSpan {
  if (typeof window === "undefined") return 1;
  const raw = localStorage.getItem(SPAN_KEY);
  const n = Number(raw);
  if (n === 3 || n === 6 || n === 9 || n === 12) return n;
  return 1;
}

export function saveLocalDashboardSpan(span: CalendarSpan) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SPAN_KEY, String(span));
}

export async function fetchSchedulePreferences(): Promise<ScheduleCalendarPreferences> {
  try {
    const res = await fetch("/api/v1/onboarding/schedule/preferences");
    if (!res.ok) return {};
    return (await res.json()) as ScheduleCalendarPreferences;
  } catch {
    return {};
  }
}

export async function persistSchedulePreferences(prefs: ScheduleCalendarPreferences): Promise<void> {
  await fetch("/api/v1/onboarding/schedule/preferences", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(prefs),
  }).catch(() => undefined);
}

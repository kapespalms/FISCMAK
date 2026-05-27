import callScheduleData from "../../../../docs/seeds/uh_psych_call_schedule_cmc.json";

export type CallAssignment = {
  date: string;
  day_of_week?: string;
  assignee_abbr: string;
  shift: string | null;
};

export type CallScheduleRole = {
  role: string;
  assignments: CallAssignment[];
};

export type CallScheduleMeta = {
  name: string;
  site: string;
  schedule_type: string;
  source_file: string;
  printed_at?: string;
  date_range?: { start: string; end: string };
  privacy_note: string;
  qgenda_note: string;
};

const data = callScheduleData as {
  program: CallScheduleMeta;
  roles: CallScheduleRole[];
  stats: { role_count: number; day_columns: number; assignment_count: number };
};

export function callScheduleMeta(): CallScheduleMeta {
  return data.program;
}

export function callScheduleStats() {
  return data.stats;
}

export function listCallScheduleRoles(): CallScheduleRole[] {
  return data.roles;
}

/** Resident-facing roles from the Cleveland call grid (excludes attending-only rows). */
export function residentCallRoles(): CallScheduleRole[] {
  return data.roles.filter((r) => /RES|FEL/i.test(r.role));
}

export function callAssignmentsForDate(isoDate: string): Array<CallAssignment & { role: string }> {
  return data.roles.flatMap((role) =>
    role.assignments
      .filter((a) => a.date === isoDate)
      .map((a) => ({ ...a, role: role.role })),
  );
}

export function callScheduleSummary(): string {
  const meta = data.program;
  const range = meta.date_range;
  const rangeLabel = range ? `${range.start} → ${range.end}` : "date range unavailable";
  return `${meta.name}: ${data.stats.role_count} coverage lines, ${data.stats.day_columns} days (${rangeLabel}). Live switches in QGenda.`;
}

export function callScheduleDateRange(): { start: string; end: string } | null {
  const range = data.program.date_range;
  if (!range?.start || !range?.end) return null;
  return { start: range.start, end: range.end };
}

export function listCallScheduleDates(): string[] {
  const dates = new Set<string>();
  for (const role of data.roles) {
    for (const a of role.assignments) dates.add(a.date);
  }
  return [...dates].sort();
}

export function callAssignmentsForInitials(
  abbr: string,
): Array<CallAssignment & { role: string }> {
  const needle = abbr.trim();
  if (!needle) return [];
  const upper = needle.toUpperCase();
  return data.roles.flatMap((role) =>
    role.assignments
      .filter((a) => a.assignee_abbr.toUpperCase() === upper)
      .map((a) => ({ ...a, role: role.role })),
  );
}

export function addDaysIso(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T12:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function weekDatesContaining(isoDate: string): string[] {
  const d = new Date(`${isoDate}T12:00:00`);
  const day = d.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + mondayOffset);
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(monday);
    x.setDate(monday.getDate() + i);
    return x.toISOString().slice(0, 10);
  });
}

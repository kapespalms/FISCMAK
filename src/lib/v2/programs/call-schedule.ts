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

export type ScheduleBlock = {
  block_id: string;
  start_date: string;
  end_date: string;
  rotation_code: string;
  rotation_label: string;
  pgy_level?: string;
  kind?: "rotation" | "call" | "personal";
};

export type DayAssignment = {
  iso: string;
  rotation_code: string;
  rotation_label: string;
  block_id: string;
  kind: "rotation" | "call" | "personal";
};

export type CalendarSpan = 1 | 3 | 6 | 9 | 12;

export type CalendarPageView = "month" | "week" | "day";

export type ScheduleCalendarPreferences = {
  color_overrides?: Record<string, string>;
  dashboard_span?: CalendarSpan;
};

export type ScheduleRecurrenceEnd =
  | { type: "never" }
  | { type: "date"; date: string }
  | { type: "count"; count: number };

export type ScheduleRecurrence = {
  frequency: "daily" | "weekly" | "monthly" | "yearly";
  interval?: number;
  days_of_week?: number[];
  end?: ScheduleRecurrenceEnd;
};

export type ScheduleEventKind = "personal" | "call" | "conference" | "admin" | "learning";

export type UserScheduleEvent = {
  id: string;
  title: string;
  start_date: string;
  end_date: string;
  all_day?: boolean;
  kind?: ScheduleEventKind;
  recurrence?: ScheduleRecurrence;
  /** Optional lattice placement for career coaching */
  lattice_domain?: string;
  lattice_track?: string;
  notes?: string;
  created_at: string;
  source?: "mak" | "user";
};

export type ScheduleEventDraft = {
  title: string;
  start_date: string;
  end_date: string;
  all_day?: boolean;
  kind?: ScheduleEventKind;
  recurrence?: ScheduleRecurrence | null;
  lattice_domain?: string;
  lattice_track?: string;
  notes?: string;
};

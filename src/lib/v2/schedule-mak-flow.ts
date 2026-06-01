import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";
import {
  formatRecurrenceLabel,
  summarizeUpcomingEvents,
} from "@/lib/v2/schedule-calendar/event-expansion";
import type {
  ScheduleBlock,
  ScheduleEventDraft,
  UserScheduleEvent,
} from "@/lib/v2/schedule-calendar/types";

export type { ScheduleEventDraft, UserScheduleEvent } from "@/lib/v2/schedule-calendar/types";

export type ScheduleMakSession = {
  started_at: string;
};

const SCHEDULE_EVENT_MARKER = "@@SCHEDULE_EVENT@@";

export function initScheduleMakSession(meta: OnboardingMetadata): OnboardingMetadata {
  return {
    ...meta,
    schedule_mak_session: { started_at: new Date().toISOString() },
  };
}

export function buildScheduleEventsIntro(hasProgramBlocks: boolean): string {
  const scheduleNote = hasProgramBlocks
    ? "Your program rotations are already on the calendar — I'll help you layer personal events, call swaps, conferences, and reminders on top."
    : "Your calendar is empty for now — we can start from scratch with personal events, clinic blocks, call, conferences, or anything else you need to track.";

  return `${scheduleNote}

Use plain language — the same phrasing you'd use in Google Calendar or Outlook. For example:
• "Dentist appointment next Tuesday at 2 PM"
• "Weekly supervision every Thursday at noon"
• "Call every 3rd weekend, starting June 1"
• "Journal club first Monday of each month at 7 AM"

I'll confirm **title**, **date**, **time** (or all-day), and whether it **repeats** (daily, weekly, monthly, yearly — with interval, days of week, and when it ends: never, on a date, or after N times).

When you confirm, I'll save it to your FiscMak calendar so I can reference it for goals, your career lattice, and workload coaching.

What would you like to add first?`;
}

export function summarizeScheduleBlocks(blocks: ScheduleBlock[], limit = 8): string {
  if (!blocks.length) return "No program blocks loaded yet.";
  const unique = new Map<string, string>();
  for (const block of blocks) {
    if (!unique.has(block.rotation_code)) {
      unique.set(block.rotation_code, block.rotation_label);
    }
  }
  const labels = [...unique.values()].slice(0, limit);
  const suffix = unique.size > limit ? ` (+${unique.size - limit} more)` : "";
  return `Program rotations on calendar: ${labels.join(", ")}${suffix}.`;
}

export function normalizeScheduleEventDraft(raw: unknown): ScheduleEventDraft | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const title = typeof obj.title === "string" ? obj.title.trim() : "";
  const start_date = typeof obj.start_date === "string" ? obj.start_date.trim() : "";
  const end_date =
    typeof obj.end_date === "string" && obj.end_date.trim()
      ? obj.end_date.trim()
      : start_date;
  if (!title || !start_date) return null;

  const draft: ScheduleEventDraft = {
    title,
    start_date,
    end_date,
    all_day: obj.all_day !== false,
    kind:
      typeof obj.kind === "string"
        ? (obj.kind as ScheduleEventDraft["kind"])
        : "personal",
  };

  if (typeof obj.lattice_domain === "string" && obj.lattice_domain.trim()) {
    draft.lattice_domain = obj.lattice_domain.trim();
  }
  if (typeof obj.lattice_track === "string" && obj.lattice_track.trim()) {
    draft.lattice_track = obj.lattice_track.trim();
  }
  if (typeof obj.notes === "string" && obj.notes.trim()) {
    draft.notes = obj.notes.trim();
  }

  if (obj.recurrence && typeof obj.recurrence === "object") {
    const r = obj.recurrence as Record<string, unknown>;
    const frequency = r.frequency;
    if (
      frequency === "daily" ||
      frequency === "weekly" ||
      frequency === "monthly" ||
      frequency === "yearly"
    ) {
      draft.recurrence = {
        frequency,
        interval: typeof r.interval === "number" && r.interval > 0 ? r.interval : 1,
        days_of_week: Array.isArray(r.days_of_week)
          ? r.days_of_week.filter((d): d is number => typeof d === "number" && d >= 0 && d <= 6)
          : undefined,
        end:
          r.end && typeof r.end === "object"
            ? normalizeRecurrenceEnd(r.end as Record<string, unknown>)
            : { type: "never" },
      };
    }
  } else if (obj.recurrence === null) {
    draft.recurrence = null;
  }

  if (!draft.all_day && !start_date.includes("T")) {
    draft.all_day = true;
  }

  return draft;
}

function normalizeRecurrenceEnd(raw: Record<string, unknown>) {
  if (raw.type === "date" && typeof raw.date === "string") {
    return { type: "date" as const, date: raw.date.slice(0, 10) };
  }
  if (raw.type === "count" && typeof raw.count === "number" && raw.count > 0) {
    return { type: "count" as const, count: Math.floor(raw.count) };
  }
  return { type: "never" as const };
}

export function appendScheduleEvent(
  meta: OnboardingMetadata,
  draft: ScheduleEventDraft,
): { meta: OnboardingMetadata; event: UserScheduleEvent } {
  const event: UserScheduleEvent = {
    id: crypto.randomUUID(),
    title: draft.title,
    start_date: draft.start_date,
    end_date: draft.end_date || draft.start_date,
    all_day: draft.all_day ?? true,
    kind: draft.kind ?? "personal",
    recurrence: draft.recurrence ?? undefined,
    lattice_domain: draft.lattice_domain,
    lattice_track: draft.lattice_track,
    notes: draft.notes,
    created_at: new Date().toISOString(),
    source: "mak",
  };

  const existing = meta.schedule_events ?? [];
  return {
    meta: { ...meta, schedule_events: [...existing, event] },
    event,
  };
}

export function extractScheduleEventFromAssistantResponse(
  response: string,
  meta: OnboardingMetadata,
): { response: string; meta: OnboardingMetadata; saved?: UserScheduleEvent } {
  const markerIndex = response.lastIndexOf(SCHEDULE_EVENT_MARKER);
  if (markerIndex === -1) return { response, meta };

  const jsonPart = response.slice(markerIndex + SCHEDULE_EVENT_MARKER.length).trim();
  const cleaned = response.slice(0, markerIndex).trimEnd();
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonPart);
  } catch {
    return { response: cleaned, meta };
  }

  const draft = normalizeScheduleEventDraft(parsed);
  if (!draft) return { response: cleaned, meta };

  const { meta: nextMeta, event } = appendScheduleEvent(meta, draft);
  return { response: cleaned, meta: nextMeta, saved: event };
}

export function buildScheduleMakSystemContext(
  meta: OnboardingMetadata,
  options?: { blocks?: ScheduleBlock[]; careerStage?: string },
): string {
  const events = meta.schedule_events ?? [];
  const blocksSummary = summarizeScheduleBlocks(options?.blocks ?? []);
  const stage = options?.careerStage ?? "physician";
  const upcoming = summarizeUpcomingEvents(events, 90);

  return `SCHEDULE & CALENDAR COACHING (Coach Mak)
User career stage: ${stage}.
${blocksSummary}
${upcoming}

Use standard calendar vocabulary users expect from Google Calendar, Outlook, and Apple Calendar:
- Create: Add, New event, Save (confirm before persisting)
- Recurrence: Repeat, Recurring, Does not repeat, Custom
- Frequency: Daily, Weekly, Monthly, Yearly (Annually)
- Interval: every N days/weeks/months (e.g. every 2 weeks)
- Weekly: specific days (Mon, Wed, Fri)
- End: Never / Indefinitely, End on [date], End after [N occurrences]

Accept natural-language scheduling ("dentist every 3rd Tuesday at 2 PM") and translate into structured fields. Ask one clarifying question at a time when ambiguous.

When relevant, tag events with optional lattice_domain and lattice_track (e.g. Educator × Communication for journal club).

Never store or ask for patient identifiers or PHI. Rotations and call only for program data; personal events are user-owned.

When the user explicitly confirms (yes, save, add it, looks good, that's correct), append EXACTLY ONE LINE at the very end of your response:
@@SCHEDULE_EVENT@@{"title":"...","start_date":"YYYY-MM-DD or ISO datetime","end_date":"...","all_day":true|false,"kind":"personal|conference|admin|learning|call","recurrence":{...}|null,"lattice_domain":"optional","lattice_track":"optional"}
Only append after confirmation when title and start_date are known. Omit the marker until confirmed.
Saved events appear on the user's calendar and feed their Career Map lattice (FISCMAK and ACGME for trainees). Tag lattice_domain and lattice_track when the event clearly maps to a domain×track (e.g. journal club → Medical Knowledge × Educator).`;
}

/** Persistent calendar memory for goals, lattice, and general coaching */
export function buildScheduleMemoryContext(meta: OnboardingMetadata): string {
  const events = meta.schedule_events ?? [];
  if (!events.length) return "";

  const upcoming = summarizeUpcomingEvents(events, 90);
  const recurring = events
    .filter((e) => e.recurrence)
    .slice(0, 6)
    .map((e) => `${e.title}: ${formatRecurrenceLabel(e)}`)
    .join("; ");

  return `CALENDAR MEMORY (user-confirmed — reference for lattice timing, goal milestones, workload, and quarterly planning):
${upcoming}
${recurring ? `Recurring commitments: ${recurring}.` : ""}
Use these events when discussing career lattice placement, goal deadlines, rotation transitions, conference prep, and invisible-work load. Saved events and program rotation blocks also appear as evidence on the Career Map lattice. Do not invent events not listed here.`;
}

export function buildScheduleEventSavedAck(event: UserScheduleEvent): string {
  const repeat = event.recurrence ? `\nRepeat: ${formatRecurrenceLabel(event)}` : "";
  return `\n\n**Saved to your calendar:** ${event.title} (${event.start_date.slice(0, 10)}${event.all_day === false ? ", timed" : ", all day"})${repeat}`;
}

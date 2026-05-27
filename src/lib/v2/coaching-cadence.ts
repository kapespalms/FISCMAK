import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";
import { expandUserEventOccurrences } from "@/lib/v2/schedule-calendar/event-expansion";
import type { ScheduleBlock, UserScheduleEvent } from "@/lib/v2/schedule-calendar/types";
import type { BlockPhase, BlockPhaseContext } from "@/lib/v2/programs/block-phase";
import { findCurrentBlockPhase } from "@/lib/v2/programs/block-phase";
import { parseIsoDate, toIsoDate } from "@/lib/v2/schedule-calendar/assignments";

export type ScheduleReviewCadence = "weekly" | "biweekly" | "monthly";

export type ReviewableEvent = {
  id: string;
  title: string;
  date: string;
  kind: "calendar" | "rotation";
  source_label: string;
  rotation_code?: string;
  block_id?: string;
};

export type ScheduleReviewDue = {
  due: true;
  cadence: ScheduleReviewCadence;
  period_start: string;
  period_end: string;
  label: string;
  events: ReviewableEvent[];
};

export type RotationTouchpointDue = BlockPhaseContext & {
  due: true;
  title: string;
  detail: string;
};

export type CoachingCadenceView = {
  schedule_review: ScheduleReviewDue | null;
  rotation_touchpoint: RotationTouchpointDue | null;
  schedule_review_cadence: ScheduleReviewCadence;
};

export type ScheduleReviewHistoryEntry = {
  id: string;
  completed_at: string;
  cadence: ScheduleReviewCadence;
  period_start: string;
  period_end: string;
  reviewed_event_ids: string[];
  summary?: string;
};

export type RotationTouchpointHistoryEntry = {
  block_id: string;
  rotation_code: string;
  rotation_label: string;
  phase: BlockPhase;
  completed_at: string;
  notes?: string;
};

const CADENCE_DAYS: Record<ScheduleReviewCadence, number> = {
  weekly: 7,
  biweekly: 14,
  monthly: 30,
};

const CADENCE_LABELS: Record<ScheduleReviewCadence, string> = {
  weekly: "Weekly",
  biweekly: "Biweekly",
  monthly: "Monthly",
};

export function defaultScheduleReviewCadence(): ScheduleReviewCadence {
  return "biweekly";
}

export function resolveScheduleReviewCadence(meta: OnboardingMetadata): ScheduleReviewCadence {
  return meta.schedule_review_cadence ?? defaultScheduleReviewCadence();
}

function periodBounds(cadence: ScheduleReviewCadence, asOf = new Date()) {
  const days = CADENCE_DAYS[cadence];
  const end = new Date(asOf);
  end.setHours(23, 59, 59, 999);
  const start = new Date(end);
  start.setDate(start.getDate() - days + 1);
  start.setHours(0, 0, 0, 0);
  return { start, end, startIso: toIsoDate(start), endIso: toIsoDate(end) };
}

function lastReviewCompletedAt(meta: OnboardingMetadata): Date | null {
  const history = meta.schedule_review_history ?? [];
  if (!history.length) return null;
  const last = history[history.length - 1]!;
  const d = new Date(last.completed_at);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function collectReviewableEvents(input: {
  scheduleEvents: UserScheduleEvent[];
  programBlocks: ScheduleBlock[];
  periodStart: Date;
  periodEnd: Date;
}): ReviewableEvent[] {
  const events: ReviewableEvent[] = [];
  const seen = new Set<string>();

  for (const event of input.scheduleEvents) {
    const occurrences = expandUserEventOccurrences(
      event,
      input.periodStart,
      input.periodEnd,
    );
    const date = occurrences[0] ?? event.start_date.slice(0, 10);
    if (!occurrences.length) continue;
    const key = `cal-${event.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    events.push({
      id: key,
      title: event.title,
      date,
      kind: "calendar",
      source_label: event.recurrence ? "Recurring event" : "Calendar event",
    });
  }

  for (const block of input.programBlocks) {
    const blockStart = parseIsoDate(block.start_date);
    const blockEnd = parseIsoDate(block.end_date);
    blockEnd.setHours(23, 59, 59, 999);
    if (blockEnd < input.periodStart || blockStart > input.periodEnd) continue;
    const key = `rot-${block.block_id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    events.push({
      id: key,
      title: block.rotation_label,
      date: block.start_date,
      kind: "rotation",
      source_label: "Program rotation block",
      rotation_code: block.rotation_code,
      block_id: block.block_id,
    });
  }

  return events.sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
}

export function scheduleReviewDue(
  meta: OnboardingMetadata,
  input: {
    scheduleEvents: UserScheduleEvent[];
    programBlocks: ScheduleBlock[];
    asOf?: Date;
  },
): ScheduleReviewDue | null {
  const cadence = resolveScheduleReviewCadence(meta);
  const asOf = input.asOf ?? new Date();
  const last = lastReviewCompletedAt(meta);
  const daysSince = last
    ? Math.floor((asOf.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
    : CADENCE_DAYS[cadence] + 1;

  if (daysSince < CADENCE_DAYS[cadence]) return null;

  const { start, end, startIso, endIso } = periodBounds(cadence, asOf);
  const events = collectReviewableEvents({
    scheduleEvents: input.scheduleEvents,
    programBlocks: input.programBlocks,
    periodStart: start,
    periodEnd: end,
  });

  if (!events.length) return null;

  return {
    due: true,
    cadence,
    period_start: startIso,
    period_end: endIso,
    label: `${CADENCE_LABELS[cadence]} schedule review`,
    events,
  };
}

export function rotationTouchpointDue(
  meta: OnboardingMetadata,
  programBlocks: ScheduleBlock[],
  asOf = new Date(),
): RotationTouchpointDue | null {
  const phaseCtx = findCurrentBlockPhase(programBlocks, asOf);
  if (!phaseCtx) return null;

  const history = meta.rotation_touchpoint_history ?? [];
  const alreadyDone = history.some(
    (h) => h.block_id === phaseCtx.block_id && h.phase === phaseCtx.phase,
  );
  if (alreadyDone) return null;

  const phaseCopy: Record<BlockPhase, { title: string; detail: string }> = {
    start: {
      title: `Start of ${phaseCtx.rotation_label}`,
      detail: "Set expectations and learning goals for this block.",
    },
    mid: {
      title: `Mid-rotation check-in: ${phaseCtx.rotation_label}`,
      detail: "Review progress, struggles, and course corrections.",
    },
    end: {
      title: `End of ${phaseCtx.rotation_label}`,
      detail: "Debrief what happened, what it meant, and how it connects to your path.",
    },
  };

  const copy = phaseCopy[phaseCtx.phase];
  return {
    ...phaseCtx,
    due: true,
    title: copy.title,
    detail: copy.detail,
  };
}

export function buildCoachingCadenceView(input: {
  meta: OnboardingMetadata;
  scheduleEvents: UserScheduleEvent[];
  programBlocks: ScheduleBlock[];
  asOf?: Date;
}): CoachingCadenceView {
  return {
    schedule_review_cadence: resolveScheduleReviewCadence(input.meta),
    schedule_review: scheduleReviewDue(input.meta, {
      scheduleEvents: input.scheduleEvents,
      programBlocks: input.programBlocks,
      asOf: input.asOf,
    }),
    rotation_touchpoint: rotationTouchpointDue(
      input.meta,
      input.programBlocks,
      input.asOf,
    ),
  };
}

export function appendScheduleReviewHistory(
  meta: OnboardingMetadata,
  entry: Omit<ScheduleReviewHistoryEntry, "id">,
): OnboardingMetadata {
  const record: ScheduleReviewHistoryEntry = { ...entry, id: crypto.randomUUID() };
  return {
    ...meta,
    schedule_review_history: [...(meta.schedule_review_history ?? []), record],
    schedule_review_session: undefined,
  };
}

export function appendRotationTouchpointHistory(
  meta: OnboardingMetadata,
  entry: Omit<RotationTouchpointHistoryEntry, "completed_at"> & { completed_at?: string },
): OnboardingMetadata {
  const record: RotationTouchpointHistoryEntry = {
    ...entry,
    completed_at: entry.completed_at ?? new Date().toISOString(),
  };
  return {
    ...meta,
    rotation_touchpoint_history: [...(meta.rotation_touchpoint_history ?? []), record],
  };
}

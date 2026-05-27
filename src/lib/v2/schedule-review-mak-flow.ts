import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";
import type { ReviewableEvent, ScheduleReviewCadence } from "@/lib/v2/coaching-cadence";
import { appendScheduleReviewHistory } from "@/lib/v2/coaching-cadence";

export type ScheduleReviewSession = {
  started_at: string;
  cadence: ScheduleReviewCadence;
  period_start: string;
  period_end: string;
  event_ids: string[];
  events: ReviewableEvent[];
  reviewed_event_ids: string[];
  notes_by_event: Record<string, string>;
};

export type ScheduleReviewTurnResult = {
  meta: OnboardingMetadata;
  response: string;
  suggested_actions: { action: string; url: string }[];
  complete: boolean;
};

export function initScheduleReviewSession(
  meta: OnboardingMetadata,
  input: {
    cadence: ScheduleReviewCadence;
    period_start: string;
    period_end: string;
    events: ReviewableEvent[];
    focus_event_id?: string;
  },
): OnboardingMetadata {
  const reviewed = input.focus_event_id ? [input.focus_event_id] : [];
  return {
    ...meta,
    schedule_review_session: {
      started_at: new Date().toISOString(),
      cadence: input.cadence,
      period_start: input.period_start,
      period_end: input.period_end,
      event_ids: input.events.map((e) => e.id),
      events: input.events,
      reviewed_event_ids: reviewed,
      notes_by_event: {},
    },
  };
}

export function clearScheduleReviewSession(meta: OnboardingMetadata): OnboardingMetadata {
  const { schedule_review_session: _, ...rest } = meta;
  return rest;
}

function formatEventList(events: ReviewableEvent[]): string {
  return events
    .map((e, i) => `${i + 1}. **${e.title}** (${e.date}) — _${e.source_label}_`)
    .join("\n");
}

export function buildScheduleReviewIntro(
  events: ReviewableEvent[],
  cadenceLabel: string,
  periodStart: string,
  periodEnd: string,
  focusEvent?: ReviewableEvent,
): string {
  const grouped =
    events.length > 1
      ? `Here are **${events.length} events** from your ${cadenceLabel.toLowerCase()} window (${periodStart} – ${periodEnd}):\n\n${formatEventList(events)}`
      : `One item to review from ${periodStart} – ${periodEnd}:\n\n${formatEventList(events)}`;

  const focusLine = focusEvent
    ? `\n\nLet's start with **${focusEvent.title}**. What happened, and did it move your career forward?`
    : `\n\nPick any event from the list (or say "all") — we'll loop through each one: what happened, energy level, and anything to capture for your lattice or goals.`;

  return `${grouped}${focusLine}`;
}

export function buildScheduleReviewMakSystemContext(
  meta: OnboardingMetadata,
  events: ReviewableEvent[],
): string {
  const session = meta.schedule_review_session;
  if (!session) return "";

  const remaining = events.filter((e) => !session.reviewed_event_ids.includes(e.id));
  const reviewed = events.filter((e) => session.reviewed_event_ids.includes(e.id));

  return `SCHEDULE REVIEW SESSION (${session.cadence}, ${session.period_start} – ${session.period_end})
Reviewed: ${reviewed.map((e) => e.title).join("; ") || "none yet"}
Remaining: ${remaining.map((e) => e.title).join("; ") || "none"}
Loop one event at a time. For each: (1) what happened, (2) energizing/draining/neutral, (3) lattice domain×track if relevant, (4) capture-worthy for goals.
When all events are discussed, summarize themes and ask if anything should become a calendar event, activity capture, or goal milestone.
User can click events in the dashboard list to jump to a specific item — treat that as focus for the next turn.`;
}

export function processScheduleReviewTurn(input: {
  message: string;
  meta: OnboardingMetadata;
  events?: ReviewableEvent[];
}): ScheduleReviewTurnResult {
  const session = input.meta.schedule_review_session;
  if (!session) {
    return {
      meta: input.meta,
      response: "Let's review your recent schedule. Open a review from your dashboard to begin.",
      suggested_actions: [{ action: "Dashboard", url: "/app/dashboard" }],
      complete: false,
    };
  }

  const events = input.events ?? session.events ?? [];
  const msg = input.message.trim();
  const cadenceLabel =
    session.cadence === "weekly"
      ? "Weekly"
      : session.cadence === "monthly"
        ? "Monthly"
        : "Biweekly";

  const focusMatch = msg.match(/^__review_event:([a-zA-Z0-9_-]+)__$/);
  const eventFocusId = focusMatch?.[1];

  let reviewedIds = [...session.reviewed_event_ids];
  if (eventFocusId && session.event_ids.includes(eventFocusId) && !reviewedIds.includes(eventFocusId)) {
    reviewedIds.push(eventFocusId);
  } else if (msg.length > 2 && !msg.startsWith("__")) {
    const pending = events.find((e) => !reviewedIds.includes(e.id));
    if (pending) {
      reviewedIds.push(pending.id);
      const notes = { ...session.notes_by_event, [pending.id]: msg };
      session.notes_by_event = notes;
    }
  }

  const allReviewed = session.event_ids.every((id) => reviewedIds.includes(id));

  if (allReviewed && msg.length > 2 && !msg.startsWith("__review_event")) {
    const cleared = clearScheduleReviewSession(input.meta);
    const nextMeta = appendScheduleReviewHistory(cleared, {
      completed_at: new Date().toISOString(),
      cadence: session.cadence,
      period_start: session.period_start,
      period_end: session.period_end,
      reviewed_event_ids: reviewedIds,
      summary: msg.slice(0, 500),
    });
    return {
      meta: nextMeta,
      response: `**${cadenceLabel} review saved.** I'll use these events when we talk about your lattice, goals, and workload.

Anything worth capturing as a formal activity or adjusting on your calendar?`,
      suggested_actions: [
        { action: "Open Career Map", url: "/app/objective?tab=lattice" },
        { action: "Review goals", url: "/app/plan" },
      ],
      complete: true,
    };
  }

  const nextEvent = events.find((e) => !reviewedIds.includes(e.id));
  const focusEvent = eventFocusId
    ? events.find((e) => e.id === eventFocusId)
    : nextEvent;

  const updatedSession: ScheduleReviewSession = {
    ...session,
    reviewed_event_ids: reviewedIds,
  };

  if (focusEvent && eventFocusId) {
    return {
      meta: { ...input.meta, schedule_review_session: updatedSession },
      response: `**${focusEvent.title}** (${focusEvent.date})\n\nWhat happened during this — and was it energizing, draining, or neutral for your career?`,
      suggested_actions: [],
      complete: false,
    };
  }

  if (nextEvent) {
    return {
      meta: { ...input.meta, schedule_review_session: updatedSession },
      response: `Got it.\n\nNext: **${nextEvent.title}** (${nextEvent.date}). What stands out?`,
      suggested_actions: [],
      complete: false,
    };
  }

  return {
    meta: { ...input.meta, schedule_review_session: updatedSession },
    response: `We've covered all ${events.length} events. Any overall themes — or should I save this review?`,
    suggested_actions: [{ action: "Save review", url: "" }],
    complete: false,
  };
}

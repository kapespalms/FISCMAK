"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarDays, RotateCw } from "lucide-react";
import { useAppShell } from "@/components/layout/AppShell";
import type {
  CoachingCadenceView,
  ReviewableEvent,
  ScheduleReviewCadence,
} from "@/lib/v2/coaching-cadence";

const CADENCE_OPTIONS: { value: ScheduleReviewCadence; label: string }[] = [
  { value: "weekly", label: "Weekly" },
  { value: "biweekly", label: "Biweekly" },
  { value: "monthly", label: "Monthly" },
];

export function CoachingCadencePanel() {
  const { startMakFlow } = useAppShell();
  const [data, setData] = useState<CoachingCadenceView | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    return fetch("/api/v1/coaching/cadence")
      .then((r) => r.json())
      .then((json) => setData(json))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    void load();
    const onUpdate = () => void load();
    window.addEventListener("fiscmak:schedule-updated", onUpdate);
    window.addEventListener("fiscmak:coaching-cadence-updated", onUpdate);
    return () => {
      window.removeEventListener("fiscmak:schedule-updated", onUpdate);
      window.removeEventListener("fiscmak:coaching-cadence-updated", onUpdate);
    };
  }, [load]);

  function updateCadence(cadence: ScheduleReviewCadence) {
    void fetch("/api/v1/coaching/cadence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cadence }),
    }).then(() => {
      window.dispatchEvent(new CustomEvent("fiscmak:coaching-cadence-updated"));
    });
  }

  function beginScheduleReview(focusEvent?: ReviewableEvent) {
    const review = data?.schedule_review;
    if (!review) return;
    const autoMessage = focusEvent
      ? `__review_event:${focusEvent.id}__`
      : "__schedule_review__";
    startMakFlow(
      "discuss",
      "/app/dashboard",
      "Let's review your recent schedule together.",
      undefined,
      undefined,
      undefined,
      autoMessage,
    );
  }

  function beginRotationTouchpoint() {
    const touchpoint = data?.rotation_touchpoint;
    if (!touchpoint) return;
    startMakFlow(
      "rotation_debrief",
      "/app/dashboard",
      touchpoint.title,
      undefined,
      undefined,
      undefined,
      "__rotation_touchpoint__",
    );
  }

  if (loading || !data) return null;

  const hasReview = Boolean(data.schedule_review?.due);
  const hasRotation = Boolean(data.rotation_touchpoint?.due);
  if (!hasReview && !hasRotation) return null;

  return (
    <div className="mt-4 space-y-3">
      {hasRotation && data.rotation_touchpoint && (
        <div className="rounded-xl border border-[#3C8A60]/30 bg-[#3C8A60]/8 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-cx-forest-dark/70">
                <RotateCw size={12} aria-hidden />
                Rotation debrief · {data.rotation_touchpoint.phase}
              </p>
              <p className="mt-0.5 text-sm font-semibold text-cx-forest-dark">
                {data.rotation_touchpoint.title}
              </p>
              <p className="mt-0.5 text-xs text-cx-forest-dark/70">
                {data.rotation_touchpoint.detail}
              </p>
            </div>
            <button
              type="button"
              onClick={beginRotationTouchpoint}
              className="shrink-0 rounded-full bg-cx-forest-dark px-3 py-1.5 text-xs font-semibold text-white hover:bg-cx-forest-dark/90"
            >
              Discuss with Mak
            </button>
          </div>
        </div>
      )}

      {hasReview && data.schedule_review && (
        <div className="rounded-xl border border-indigo-200/60 bg-indigo-50/40 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide text-cx-forest-dark/70">
                <CalendarDays size={12} aria-hidden />
                {data.schedule_review.label}
              </p>
              <p className="mt-0.5 text-sm font-semibold text-cx-forest-dark">
                Review {data.schedule_review.events.length} event
                {data.schedule_review.events.length === 1 ? "" : "s"} with Mak
              </p>
              <p className="mt-0.5 text-xs text-cx-forest-dark/70">
                {data.schedule_review.period_start} – {data.schedule_review.period_end}
              </p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {data.schedule_review.events.map((event) => (
                  <li key={event.id}>
                    <button
                      type="button"
                      onClick={() => beginScheduleReview(event)}
                      className="font-futura-book rounded-full border border-indigo-200/80 bg-white px-2 py-0.5 text-[11px] text-cx-forest-dark hover:border-indigo-300 hover:bg-indigo-50"
                      title={event.source_label}
                    >
                      {event.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <button
                type="button"
                onClick={() => beginScheduleReview()}
                className="rounded-full bg-cx-forest-dark px-3 py-1.5 text-xs font-semibold text-white hover:bg-cx-forest-dark/90"
              >
                Review all
              </button>
              <label className="flex items-center gap-1.5 text-[10px] text-cx-forest-dark/70">
                Cadence
                <select
                  value={data.schedule_review_cadence}
                  onChange={(e) => updateCadence(e.target.value as ScheduleReviewCadence)}
                  className="rounded border border-cx-forest-dark/15 bg-white px-1.5 py-0.5 text-[10px] text-cx-forest-dark"
                >
                  {CADENCE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

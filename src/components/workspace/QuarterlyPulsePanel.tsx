"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { QuarterlyPulseStatus } from "@/lib/v2/quarterly-pulse";

type Props = {
  status: QuarterlyPulseStatus;
  onComplete?: () => void;
};

export function QuarterlyPulsePanel({ status, onComplete }: Props) {
  const [open, setOpen] = useState(status.due);
  const [exhaustion, setExhaustion] = useState("");
  const [depersonalization, setDepersonalization] = useState("");
  const [invisibleHours, setInvisibleHours] = useState("");
  const [invisibleCategory, setInvisibleCategory] = useState("");
  const [trackEnergy, setTrackEnergy] = useState("");
  const [cvUpdate, setCvUpdate] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState("");

  if (!status.due && !open) return null;

  async function submit() {
    setLoading(true);
    setError("");
    const now = new Date().toISOString();
    const answers = [
      { module_id: "pfi_screen", question_id: "exhaustion", value: Number(exhaustion), captured_at: now },
      { module_id: "pfi_screen", question_id: "depersonalization", value: Number(depersonalization), captured_at: now },
      { module_id: "invisible_pulse", question_id: "weekly_hours", value: Number(invisibleHours), captured_at: now },
      { module_id: "invisible_pulse", question_id: "biggest_category", value: invisibleCategory, captured_at: now },
      { module_id: "career_momentum", question_id: "track_energy", value: Number(trackEnergy), captured_at: now },
      { module_id: "cv_update", question_id: "updates", value: cvUpdate, captured_at: now },
    ].filter((a) => a.value !== "" && !Number.isNaN(a.value as number));

    const res = await fetch("/api/v1/touchpoints/quarterly", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message ?? "Could not save pulse");
      setLoading(false);
      return;
    }
    setSummary(data.summary);
    setLoading(false);
    onComplete?.();
  }

  if (summary) {
    return (
      <Card accent="green">
        <p className="text-xs font-semibold uppercase text-fiscmak-muted">{status.quarter_label} pulse complete</p>
        <pre className="mt-3 whitespace-pre-wrap text-sm">{summary}</pre>
        <Button variant="secondary" className="mt-4" onClick={() => setOpen(false)}>
          Done
        </Button>
      </Card>
    );
  }

  return (
    <Card accent="amber">
      <p className="text-xs font-semibold uppercase text-fiscmak-muted">Touchpoint 2 · Quarterly pulse · ~5–8 min</p>
      <h2 className="mt-1 text-lg font-bold">{status.quarter_label} check-in</h2>
      <p className="mt-2 text-sm text-fiscmak-muted">
        Quick update on well-being, unrecognized work, and career momentum — plain language, no jargon.
      </p>
      {status.days_since_last != null && (
        <p className="mt-1 text-xs text-fiscmak-muted">
          Last pulse: {status.days_since_last} days ago
        </p>
      )}

      {!open ? (
        <Button className="mt-4" onClick={() => setOpen(true)}>
          Start quarterly pulse
        </Button>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm">
              <span className="font-semibold">Emotional exhaustion (0–6)</span>
              <input
                type="number"
                min={0}
                max={6}
                value={exhaustion}
                onChange={(e) => setExhaustion(e.target.value)}
                className="mt-1 w-full rounded-md border border-fiscmak-border px-3 py-2"
              />
            </label>
            <label className="text-sm">
              <span className="font-semibold">Depersonalization (0–6)</span>
              <input
                type="number"
                min={0}
                max={6}
                value={depersonalization}
                onChange={(e) => setDepersonalization(e.target.value)}
                className="mt-1 w-full rounded-md border border-fiscmak-border px-3 py-2"
              />
            </label>
          </div>
          <label className="block text-sm">
            <span className="font-semibold">Unrecognized work hours per week</span>
            <input
              type="number"
              min={0}
              max={80}
              value={invisibleHours}
              onChange={(e) => setInvisibleHours(e.target.value)}
              className="mt-1 w-full rounded-md border border-fiscmak-border px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-semibold">Biggest unrecognized work category this quarter</span>
            <input
              type="text"
              value={invisibleCategory}
              onChange={(e) => setInvisibleCategory(e.target.value)}
              placeholder="e.g. after-hours charting, prior auth…"
              className="mt-1 w-full rounded-md border border-fiscmak-border px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-semibold">Energy for primary career track (1–10)</span>
            <input
              type="number"
              min={1}
              max={10}
              value={trackEnergy}
              onChange={(e) => setTrackEnergy(e.target.value)}
              className="mt-1 w-full rounded-md border border-fiscmak-border px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            <span className="font-semibold">New achievements since last update (optional)</span>
            <textarea
              value={cvUpdate}
              onChange={(e) => setCvUpdate(e.target.value)}
              rows={2}
              placeholder="Publications, grants, roles, awards…"
              className="mt-1 w-full rounded-md border border-fiscmak-border px-3 py-2"
            />
          </label>
          <div className="flex gap-2">
            <Button onClick={submit} disabled={loading}>
              {loading ? "Saving…" : "Submit pulse"}
            </Button>
            <Button variant="secondary" onClick={() => setOpen(false)}>
              Later
            </Button>
          </div>
          {error && <p className="text-sm text-fiscmak-red">{error}</p>}
        </div>
      )}
    </Card>
  );
}

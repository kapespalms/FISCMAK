"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { AnnualRefreshStatus } from "@/lib/v2/annual-refresh";
import { filterTouchpointAnswers } from "@/lib/v2/touchpoint-eligibility";
import { postTouchpointJson } from "@/lib/v2/touchpoint-fetch";

type Props = {
  status: AnnualRefreshStatus;
  onComplete?: () => void;
  onBeginWithMak?: () => void;
};

export function AnnualRefreshPanel({ status, onComplete, onBeginWithMak }: Props) {
  const [open, setOpen] = useState(status.due);
  const [careerObjective, setCareerObjective] = useState("");
  const [trackEnergy, setTrackEnergy] = useState("");
  const [invisibleHours, setInvisibleHours] = useState("");
  const [goalReview, setGoalReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState("");

  if (!status.due && !open) return null;

  async function submit() {
    setLoading(true);
    setError("");
    const now = new Date().toISOString();
    const answers = filterTouchpointAnswers([
      {
        module_id: "career_direction",
        question_id: "three_year_objective",
        value: careerObjective.trim(),
        captured_at: now,
      },
      {
        module_id: "work_engagement",
        question_id: "vigor_mean",
        value: trackEnergy === "" ? "" : Number(trackEnergy),
        captured_at: now,
      },
      {
        module_id: "invisible_work_annual",
        question_id: "weekly_hours",
        value: invisibleHours === "" ? "" : Number(invisibleHours),
        captured_at: now,
      },
      {
        module_id: "goal_annual_reset",
        question_id: "review_summary",
        value: goalReview.trim(),
        captured_at: now,
      },
    ]);

    if (answers.length === 0) {
      setError("Add at least one field before completing the annual refresh.");
      setLoading(false);
      return;
    }

    const result = await postTouchpointJson<{ summary: string }>(
      "/api/v1/touchpoints/annual",
      { answers },
    );
    if (!result.ok || !result.data) {
      setError(result.error ?? "Could not save annual refresh");
      setLoading(false);
      return;
    }
    setSummary(result.data.summary);
    setLoading(false);
    onComplete?.();
  }

  if (summary) {
    return (
      <Card accent="green">
        <p className="text-xs font-semibold uppercase text-fiscmak-muted">
          {status.year} annual refresh complete
        </p>
        <pre className="mt-3 whitespace-pre-wrap text-sm">{summary}</pre>
        <Button variant="secondary" className="mt-4" onClick={() => setOpen(false)}>
          Done
        </Button>
      </Card>
    );
  }

  return (
    <Card accent="amber">
      <p className="text-xs font-semibold uppercase text-fiscmak-muted">
        Touchpoint 3 · Annual deep refresh · ~{status.estimated_minutes} min
      </p>
      <h2 className="mt-1 text-lg font-bold">{status.year} annual career refresh</h2>
      <p className="mt-2 text-sm text-fiscmak-muted">
        Reconfirm career direction, work engagement, task burden, and goals. API enrichment runs
        automatically after submission.
      </p>
      {status.days_since_last != null && (
        <p className="mt-1 text-xs text-fiscmak-muted">
          Last annual refresh: {status.days_since_last} days ago
        </p>
      )}

      <div className="mt-4 space-y-3">
        <label className="block text-sm">
          <span className="font-medium">3-year career objective</span>
          <input
            className="mt-1 w-full rounded-md border border-fiscmak-border px-3 py-2 text-sm"
            value={careerObjective}
            onChange={(e) => setCareerObjective(e.target.value)}
            placeholder="e.g., Program Director within 3 years"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Track energy (1–10)</span>
          <input
            type="number"
            min={1}
            max={10}
            className="mt-1 w-full rounded-md border border-fiscmak-border px-3 py-2 text-sm"
            value={trackEnergy}
            onChange={(e) => setTrackEnergy(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Unrecognized work (hrs/week)</span>
          <input
            type="number"
            min={0}
            className="mt-1 w-full rounded-md border border-fiscmak-border px-3 py-2 text-sm"
            value={invisibleHours}
            onChange={(e) => setInvisibleHours(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium">Goal review summary</span>
          <input
            className="mt-1 w-full rounded-md border border-fiscmak-border px-3 py-2 text-sm"
            value={goalReview}
            onChange={(e) => setGoalReview(e.target.value)}
            placeholder="Continue all 3 goals / modify sustainability goal"
          />
        </label>
      </div>

      {error && <p className="mt-3 text-sm text-fiscmak-red">{error}</p>}

      <div className="mt-4 flex flex-wrap gap-2">
        {onBeginWithMak && (
          <Button variant="secondary" onClick={onBeginWithMak}>
            Continue with Coach Mak
          </Button>
        )}
        <Button onClick={() => void submit()} disabled={loading}>
          {loading ? "Saving…" : "Complete annual refresh"}
        </Button>
        {!status.due && (
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Dismiss
          </Button>
        )}
      </div>
    </Card>
  );
}

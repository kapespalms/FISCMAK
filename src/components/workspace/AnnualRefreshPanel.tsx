"use client";

import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CardSection } from "@/components/ui/CardSection";
import type { AnnualRefreshStatus } from "@/lib/v2/annual-refresh";
import { filterTouchpointAnswers } from "@/lib/v2/touchpoint-eligibility";
import { postTouchpointJson } from "@/lib/v2/touchpoint-fetch";

type Props = {
  status: AnnualRefreshStatus;
  onComplete?: () => void;
  onBeginWithMak?: () => void;
};

export function AnnualRefreshPanel({ status, onComplete, onBeginWithMak }: Props) {
  const [showFallback, setShowFallback] = useState(false);
  const [careerObjective, setCareerObjective] = useState("");
  const [trackEnergy, setTrackEnergy] = useState("");
  const [invisibleHours, setInvisibleHours] = useState("");
  const [goalReview, setGoalReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState("");

  if (!status.due && !summary) return null;

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
      <CardSection
        accent="green"
        eyebrow={`${status.year} annual refresh`}
        title="Complete"
        icon={CalendarClock}
      >
        <pre className="whitespace-pre-wrap text-sm text-cx-forest-dark/80">{summary}</pre>
        <Button variant="secondary" className="mt-4" onClick={() => setSummary(null)}>
          Done
        </Button>
      </CardSection>
    );
  }

  return (
    <CardSection
      accent="amber"
      eyebrow="Annual refresh"
      title={`${status.year} annual career refresh`}
      description="Coach Mak guides seven modules — career direction, engagement, well-being, task burden, unrecognized work, Career Data refresh, and goal reset. Enrichment runs automatically when you finish."
      icon={CalendarClock}
      footer={
        status.days_since_last != null ? (
          <p className="text-xs text-cx-forest-dark/70">
            Last annual refresh: {status.days_since_last} days ago · ~{status.estimated_minutes} min
          </p>
        ) : (
          <p className="text-xs text-cx-forest-dark/70">~{status.estimated_minutes} min</p>
        )
      }
    >
      {!showFallback ? (
        <div className="flex flex-wrap gap-2">
          {onBeginWithMak && (
            <Button onClick={onBeginWithMak}>Begin with Coach Mak</Button>
          )}
          <Button variant="secondary" onClick={() => setShowFallback(true)}>
            Use form instead
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <label className="block text-sm text-cx-forest-dark">
            <span className="font-semibold">3-year career objective</span>
            <textarea
              value={careerObjective}
              onChange={(e) => setCareerObjective(e.target.value)}
              rows={2}
              placeholder="e.g., Program Director within 3 years"
              className="cx-field mt-1 w-full"
            />
          </label>
          <label className="block text-sm text-cx-forest-dark">
            <span className="font-semibold">Track energy (1–10)</span>
            <input
              type="number"
              min={1}
              max={10}
              value={trackEnergy}
              onChange={(e) => setTrackEnergy(e.target.value)}
              className="cx-field mt-1 w-full"
            />
          </label>
          <label className="block text-sm text-cx-forest-dark">
            <span className="font-semibold">Unrecognized work (hours/week)</span>
            <input
              type="number"
              min={0}
              value={invisibleHours}
              onChange={(e) => setInvisibleHours(e.target.value)}
              className="cx-field mt-1 w-full"
            />
          </label>
          <label className="block text-sm text-cx-forest-dark">
            <span className="font-semibold">Goal review summary</span>
            <textarea
              value={goalReview}
              onChange={(e) => setGoalReview(e.target.value)}
              rows={2}
              placeholder="Continue all 3 goals / modify sustainability goal"
              className="cx-field mt-1 w-full"
            />
          </label>
          <div className="flex gap-2">
            <Button onClick={() => void submit()} disabled={loading}>
              {loading ? "Saving…" : "Submit annual refresh"}
            </Button>
            <Button variant="secondary" onClick={() => setShowFallback(false)}>
              Back to Mak
            </Button>
          </div>
          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
              {error}
            </p>
          )}
        </div>
      )}
    </CardSection>
  );
}

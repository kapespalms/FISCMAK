"use client";

import { useState } from "react";
import { HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CardSection } from "@/components/ui/CardSection";
import type { QuarterlyPulseStatus } from "@/lib/v2/quarterly-pulse";
import { filterTouchpointAnswers } from "@/lib/v2/touchpoint-eligibility";
import { postTouchpointJson } from "@/lib/v2/touchpoint-fetch";

type Props = {
  status: QuarterlyPulseStatus;
  onComplete?: () => void;
  onBeginWithMak?: () => void;
};

export function QuarterlyPulsePanel({ status, onComplete, onBeginWithMak }: Props) {
  const [showFallback, setShowFallback] = useState(false);
  const [exhaustion, setExhaustion] = useState("");
  const [depersonalization, setDepersonalization] = useState("");
  const [invisibleHours, setInvisibleHours] = useState("");
  const [invisibleCategory, setInvisibleCategory] = useState("");
  const [trackEnergy, setTrackEnergy] = useState("");
  const [cvUpdate, setCvUpdate] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState("");

  if (!status.due && !summary) return null;

  async function submit() {
    setLoading(true);
    setError("");
    const now = new Date().toISOString();
    const answers = filterTouchpointAnswers([
      { module_id: "pfi_screen", question_id: "exhaustion", value: exhaustion === "" ? "" : Number(exhaustion), captured_at: now },
      { module_id: "pfi_screen", question_id: "depersonalization", value: depersonalization === "" ? "" : Number(depersonalization), captured_at: now },
      { module_id: "invisible_pulse", question_id: "weekly_hours", value: invisibleHours === "" ? "" : Number(invisibleHours), captured_at: now },
      { module_id: "invisible_pulse", question_id: "biggest_category", value: invisibleCategory.trim(), captured_at: now },
      { module_id: "career_momentum", question_id: "track_energy", value: trackEnergy === "" ? "" : Number(trackEnergy), captured_at: now },
      { module_id: "cv_update", question_id: "updates", value: cvUpdate.trim(), captured_at: now },
    ]);

    if (answers.length === 0) {
      setError("Add at least one field before submitting the pulse.");
      setLoading(false);
      return;
    }

    const result = await postTouchpointJson<{ summary: string }>(
      "/api/v1/touchpoints/quarterly",
      { answers },
    );
    if (!result.ok || !result.data) {
      setError(result.error ?? "Could not save pulse");
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
        eyebrow={status.quarter_label}
        title="Pulse complete"
        icon={HeartPulse}
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
      eyebrow="Touchpoint 2 · Quarterly pulse"
      title={`${status.quarter_label} check-in`}
      description="Coach Mak walks you through four quick modules (~5–8 min). Your answers save to your dashboard and Career Data vault automatically."
      icon={HeartPulse}
      footer={
        status.days_since_last != null ? (
          <p className="text-xs text-cx-forest-dark/70">
            Last pulse: {status.days_since_last} days ago
          </p>
        ) : undefined
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
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-cx-forest-dark">
              <span className="font-semibold">Emotional exhaustion (0–6)</span>
              <input
                type="number"
                min={0}
                max={6}
                value={exhaustion}
                onChange={(e) => setExhaustion(e.target.value)}
                className="cx-field mt-1 w-full"
              />
            </label>
            <label className="text-sm text-cx-forest-dark">
              <span className="font-semibold">Depersonalization (0–6)</span>
              <input
                type="number"
                min={0}
                max={6}
                value={depersonalization}
                onChange={(e) => setDepersonalization(e.target.value)}
                className="cx-field mt-1 w-full"
              />
            </label>
          </div>
          <label className="block text-sm text-cx-forest-dark">
            <span className="font-semibold">Unrecognized work hours per week</span>
            <input
              type="number"
              min={0}
              max={80}
              value={invisibleHours}
              onChange={(e) => setInvisibleHours(e.target.value)}
              className="cx-field mt-1 w-full"
            />
          </label>
          <label className="block text-sm text-cx-forest-dark">
            <span className="font-semibold">Biggest unrecognized work category this quarter</span>
            <input
              type="text"
              value={invisibleCategory}
              onChange={(e) => setInvisibleCategory(e.target.value)}
              placeholder="e.g. after-hours charting, prior auth…"
              className="cx-field mt-1 w-full"
            />
          </label>
          <label className="block text-sm text-cx-forest-dark">
            <span className="font-semibold">Energy for primary career track (1–10)</span>
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
            <span className="font-semibold">New achievements since last update (optional)</span>
            <textarea
              value={cvUpdate}
              onChange={(e) => setCvUpdate(e.target.value)}
              rows={2}
              placeholder="Publications, grants, roles, awards…"
              className="cx-field mt-1 w-full"
            />
          </label>
          <div className="flex gap-2">
            <Button onClick={() => void submit()} disabled={loading}>
              {loading ? "Saving…" : "Submit pulse"}
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

"use client";

import { useState } from "react";
import { HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CardSection } from "@/components/ui/CardSection";
import { CheckinSummaryConfirm } from "@/components/checkin/CheckinSummaryConfirm";
import type { QuarterlyPulseStatus } from "@/lib/v2/quarterly-pulse";
import type { PulseAnswer } from "@/lib/v2/quarterly-pulse";
import { filterTouchpointAnswers } from "@/lib/v2/touchpoint-eligibility";
import { postTouchpointJson } from "@/lib/v2/touchpoint-fetch";

type Props = {
  status: QuarterlyPulseStatus;
  onComplete?: () => void;
  onBeginWithMak?: () => void;
};

type PreviewResponse = {
  requires_confirm?: boolean;
  bullets?: string[];
  summary?: string;
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
  const [pendingAnswers, setPendingAnswers] = useState<PulseAnswer[] | null>(null);
  const [confirmBullets, setConfirmBullets] = useState<string[] | null>(null);
  const [error, setError] = useState("");

  if (!status.due && !summary && !confirmBullets) return null;

  function buildAnswers(): PulseAnswer[] {
    const now = new Date().toISOString();
    return filterTouchpointAnswers([
      { module_id: "pfi_screen", question_id: "exhaustion", value: exhaustion === "" ? "" : Number(exhaustion), captured_at: now },
      { module_id: "pfi_screen", question_id: "depersonalization", value: depersonalization === "" ? "" : Number(depersonalization), captured_at: now },
      { module_id: "invisible_pulse", question_id: "weekly_hours", value: invisibleHours === "" ? "" : Number(invisibleHours), captured_at: now },
      { module_id: "invisible_pulse", question_id: "biggest_category", value: invisibleCategory.trim(), captured_at: now },
      { module_id: "career_momentum", question_id: "track_energy", value: trackEnergy === "" ? "" : Number(trackEnergy), captured_at: now },
      { module_id: "cv_update", question_id: "updates", value: cvUpdate.trim(), captured_at: now },
    ]);
  }

  async function submitPreview() {
    setLoading(true);
    setError("");
    const answers = buildAnswers();
    if (answers.length === 0) {
      setError("Add at least one field before submitting the pulse.");
      setLoading(false);
      return;
    }

    const result = await postTouchpointJson<PreviewResponse>(
      "/api/v1/touchpoints/quarterly",
      { answers },
    );
    if (!result.ok || !result.data) {
      setError(result.error ?? "Could not save pulse");
      setLoading(false);
      return;
    }
    if (result.data.requires_confirm && result.data.bullets?.length) {
      setPendingAnswers(answers);
      setConfirmBullets(result.data.bullets);
      setLoading(false);
      return;
    }
    if (result.data.summary) {
      setSummary(result.data.summary);
      onComplete?.();
    }
    setLoading(false);
  }

  async function confirmSave() {
    if (!pendingAnswers?.length) return;
    setLoading(true);
    setError("");
    const result = await postTouchpointJson<{ summary: string }>(
      "/api/v1/touchpoints/quarterly",
      { answers: pendingAnswers, summary_confirmed: true },
    );
    if (!result.ok || !result.data) {
      setError(result.error ?? "Could not save pulse");
      setLoading(false);
      return;
    }
    setSummary(result.data.summary);
    setConfirmBullets(null);
    setPendingAnswers(null);
    setLoading(false);
    onComplete?.();
  }

  function resetConfirm() {
    setConfirmBullets(null);
    setPendingAnswers(null);
    setError("");
  }

  if (summary) {
    return (
      <CardSection
        accent="green"
        eyebrow={status.quarter_label}
        title="Check-in complete"
        icon={HeartPulse}
      >
        <pre className="whitespace-pre-wrap text-sm text-cx-forest-dark/80">{summary}</pre>
        <Button variant="secondary" className="mt-4" onClick={() => setSummary(null)}>
          Done
        </Button>
      </CardSection>
    );
  }

  if (confirmBullets) {
    return (
      <CardSection
        accent="amber"
        eyebrow={status.quarter_label}
        title="Review your summary"
        icon={HeartPulse}
      >
        <CheckinSummaryConfirm
          bullets={confirmBullets}
          loading={loading}
          onConfirm={() => void confirmSave()}
          onChangeWithMak={onBeginWithMak}
          onNotQuite={resetConfirm}
        />
        {error && (
          <p className="mt-3 rounded-xl border border-[#C28D6C]/20 bg-[#C28D6C]/8 px-4 py-2 text-sm text-[#C28D6C]">
            {error}
          </p>
        )}
      </CardSection>
    );
  }

  return (
    <CardSection
      accent="amber"
      eyebrow="Quarterly pulse"
      title={`${status.quarter_label} check-in`}
      description="Mak walks you through four quick modules (~5–8 min). Your answers save to your dashboard and Career Data vault after you confirm the summary."
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
            <Button onClick={onBeginWithMak}>Begin with Mak</Button>
          )}
          <Button variant="secondary" onClick={() => setShowFallback(true)}>
            Use form instead
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-cx-forest-dark">
              <span className="font-semibold">Emotional exhaustion (0–4)</span>
              <input
                type="number"
                min={0}
                max={4}
                value={exhaustion}
                onChange={(e) => setExhaustion(e.target.value)}
                className="cx-field mt-1 w-full"
              />
            </label>
            <label className="text-sm text-cx-forest-dark">
              <span className="font-semibold">Depersonalization (0–4)</span>
              <input
                type="number"
                min={0}
                max={4}
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
            <Button onClick={() => void submitPreview()} disabled={loading}>
              {loading ? "Saving…" : "Review summary"}
            </Button>
            <Button variant="secondary" onClick={() => setShowFallback(false)}>
              Back to Mak
            </Button>
          </div>
          {error && (
            <p className="rounded-xl border border-[#C28D6C]/20 bg-[#C28D6C]/8 px-4 py-2 text-sm text-[#C28D6C]">
              {error}
            </p>
          )}
        </div>
      )}
    </CardSection>
  );
}

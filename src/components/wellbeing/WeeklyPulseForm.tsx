"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { WellnessResourcesSection } from "@/components/layout/WellnessResourcesSection";

const EE_DP_LABELS = ["Never", "Rarely", "Sometimes", "Often", "Always"] as const;
const QOL_LABELS = ["Poor", "Fair", "Good", "Very good", "Excellent"] as const;
const MDT_RANGE = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

function RatingRow({
  question,
  labels,
  value,
  onChange,
}: {
  question: string;
  labels: readonly string[];
  value: number | null;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-cx-forest-dark">{question}</p>
      <div className="flex flex-wrap gap-2">
        {labels.map((label, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
              value === i
                ? "border-cx-forest-dark bg-cx-forest-dark text-white"
                : "border-cx-forest-dark/20 text-cx-forest-dark/60 hover:border-cx-forest-dark/50 hover:text-cx-forest-dark",
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

type Props = { onSaved: () => void };

export function WeeklyPulseForm({ onSaved }: Props) {
  const [ee, setEe] = useState<number | null>(null);
  const [dp, setDp] = useState<number | null>(null);
  const [qol, setQol] = useState<number | null>(null);
  const [mdt, setMdt] = useState<number | null>(null);
  const [energyBoost, setEnergyBoost] = useState("");
  const [energyDrain, setEnergyDrain] = useState("");
  const [invisibleFlag, setInvisibleFlag] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showResources, setShowResources] = useState(false);
  const [saved, setSaved] = useState(false);

  const allRated = ee !== null && dp !== null && qol !== null && mdt !== null;

  async function handleSubmit() {
    if (!allRated) {
      setError("Please answer all four questions before submitting.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const res = await fetch("/api/v1/wellbeing/pulse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ee,
          dp,
          qol,
          mdt,
          energy_boost_task: energyBoost.trim() || null,
          energy_drain_task: energyDrain.trim() || null,
          invisible_flag: invisibleFlag,
        }),
      });
      const data = (await res.json()) as { error?: string; message?: string; mdt?: number };
      if (!res.ok || data.error) {
        setError(data.message ?? "Could not save. Please try again.");
        return;
      }
      setSaved(true);
      // MDT ≥4: surface resources and pause before clearing — never auto-report (§C governance)
      if ((mdt ?? 0) >= 4) {
        setShowResources(true);
      } else {
        onSaved();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (saved && showResources) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-cx-forest-dark">
          Check-in saved. Based on your responses, you may find the resources below helpful.
          These are confidential — nothing here is reported to your institution.
        </p>
        <WellnessResourcesSection />
        <button
          type="button"
          onClick={onSaved}
          className="text-sm font-medium text-cx-forest-dark underline underline-offset-2 hover:text-cx-forest-dark/80"
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RatingRow
        question="How often this week did you feel emotionally drained by your work?"
        labels={EE_DP_LABELS}
        value={ee}
        onChange={setEe}
      />
      <RatingRow
        question="How often did you feel disconnected from the people you work with or care for?"
        labels={EE_DP_LABELS}
        value={dp}
        onChange={setDp}
      />
      <RatingRow
        question="How would you rate your overall quality of life this week?"
        labels={QOL_LABELS}
        value={qol}
        onChange={setQol}
      />

      {/* MDT 0–10 — "moral distress" is clinically understood language; "MDT" instrument name never shown */}
      <div className="space-y-2">
        <p className="text-sm text-cx-forest-dark">
          How much moral distress did you experience at work this week?
        </p>
        <p className="text-xs text-cx-forest-dark/50">0 = none · 10 = unbearable</p>
        <div className="flex flex-wrap gap-1.5">
          {MDT_RANGE.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setMdt(n)}
              className={cn(
                "h-9 w-9 rounded-lg border text-xs font-medium transition-all",
                mdt === n
                  ? "border-cx-forest-dark bg-cx-forest-dark text-white"
                  : "border-cx-forest-dark/20 text-cx-forest-dark/60 hover:border-cx-forest-dark/50 hover:text-cx-forest-dark",
              )}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm text-cx-forest-dark" htmlFor="energy-boost">
          What gave you energy this week? <span className="text-cx-forest-dark/50">(optional)</span>
        </label>
        <textarea
          id="energy-boost"
          rows={2}
          value={energyBoost}
          onChange={(e) => setEnergyBoost(e.target.value)}
          placeholder="A task, conversation, patient, moment…"
          className="w-full resize-none rounded-xl border border-cx-forest-dark/15 bg-transparent px-4 py-3 text-sm text-cx-forest-dark placeholder:text-cx-forest-dark/30 focus:border-cx-forest-dark/40 focus:outline-none"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm text-cx-forest-dark" htmlFor="energy-drain">
          What drained your energy most? <span className="text-cx-forest-dark/50">(optional)</span>
        </label>
        <textarea
          id="energy-drain"
          rows={2}
          value={energyDrain}
          onChange={(e) => setEnergyDrain(e.target.value)}
          placeholder="A task, situation, system, interaction…"
          className="w-full resize-none rounded-xl border border-cx-forest-dark/15 bg-transparent px-4 py-3 text-sm text-cx-forest-dark placeholder:text-cx-forest-dark/30 focus:border-cx-forest-dark/40 focus:outline-none"
        />
      </div>

      <label className="flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={invisibleFlag}
          onChange={(e) => setInvisibleFlag(e.target.checked)}
          className="mt-0.5 accent-cx-forest-dark"
        />
        <span className="text-sm text-cx-forest-dark/80">
          Some of this work felt unrecognized or uncounted.
        </span>
      </label>

      {error && <p className="text-sm text-[#C28D6C]">{error}</p>}

      <button
        type="button"
        onClick={() => void handleSubmit()}
        disabled={saving || !allRated}
        className={cn(
          "rounded-xl px-6 py-3 text-sm font-medium transition-all",
          allRated && !saving
            ? "bg-cx-forest-dark text-white hover:opacity-90"
            : "cursor-not-allowed bg-cx-forest-dark/20 text-cx-forest-dark/40",
        )}
      >
        {saving ? "Saving…" : "Submit pulse check-in"}
      </button>
    </div>
  );
}

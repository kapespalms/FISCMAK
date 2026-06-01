"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { FCWI_ITEMS, FCWI_LIKERT, type FcwiFrequencyTier } from "@/lib/v2/fcwi";

type Props = {
  frequencyTier?: FcwiFrequencyTier;
  onSaved: () => void;
};

export function FcwiForm({ frequencyTier = "monthly", onSaved }: Props) {
  const [ratings, setRatings] = useState<Record<number, number>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const allAnswered = FCWI_ITEMS.every((item) => ratings[item.item] !== undefined);

  function setRating(item: number, value: number) {
    setRatings((prev) => ({ ...prev, [item]: value }));
  }

  async function handleSubmit() {
    if (!allAnswered) {
      setError("Please respond to all questions before submitting.");
      return;
    }
    setError("");
    setSaving(true);
    try {
      const items = FCWI_ITEMS.map((i) => ratings[i.item] ?? 0);
      const res = await fetch("/api/v1/wellbeing/fcwi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, frequency_tier: frequencyTier }),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok || data.error) {
        setError(data.message ?? "Could not save. Please try again.");
        return;
      }
      onSaved();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {FCWI_ITEMS.map((item) => (
        <div key={item.item} className="space-y-2">
          <p className="text-sm text-cx-forest-dark">{item.text}</p>
          <div className="flex flex-wrap gap-2">
            {FCWI_LIKERT.map(({ value, label }) => {
              const selected = ratings[item.item] === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(item.item, value)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                    selected
                      ? "border-cx-forest-dark bg-cx-forest-dark text-white"
                      : "border-cx-forest-dark/20 text-cx-forest-dark/60 hover:border-cx-forest-dark/50 hover:text-cx-forest-dark",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={() => void handleSubmit()}
        disabled={saving || !allAnswered}
        className={cn(
          "rounded-xl px-6 py-3 text-sm font-medium transition-all",
          allAnswered && !saving
            ? "bg-cx-forest-dark text-white hover:opacity-90"
            : "cursor-not-allowed bg-cx-forest-dark/20 text-cx-forest-dark/40",
        )}
      >
        {saving ? "Saving…" : "Submit check-in"}
      </button>

      {/* Governance: no composite score shown (§C). */}
    </div>
  );
}

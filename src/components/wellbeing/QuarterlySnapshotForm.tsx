"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { CAREER_DOMAINS } from "@/lib/v2/domains";
import { PRACTICE_SETTINGS, type PracticeSetting } from "@/lib/v2/onboarding-options";
import { CLINICAL_SETTINGS, type ClinicalSetting } from "@/lib/v2/setting-naics-map";

type SnapshotContext = {
  energy_rankings: { domain_index: number; rank: number }[];
  goals: { id: string; horizon: string; specific?: string; wish?: string }[];
  fte_expected: Record<string, number> | null;
  practice_setting: string | null;
  clinical_setting: string | null;
};

type Props = { onSaved: () => void };

const STEPS = ["Energy", "Role", "Goals", "Setting"] as const;

function StepProgress({ current }: { current: number }) {
  return (
    <div className="mb-6 flex gap-2">
      {STEPS.map((label, i) => (
        <div key={label} className="flex flex-1 flex-col items-center gap-1">
          <div
            className={cn(
              "h-1.5 w-full rounded-full",
              i < current ? "bg-cx-forest-dark" : i === current ? "bg-cx-forest-dark/50" : "bg-cx-forest-dark/15",
            )}
          />
          <span className={cn("text-xs", i === current ? "text-cx-forest-dark font-medium" : "text-cx-forest-dark/40")}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function QuarterlySnapshotForm({ onSaved }: Props) {
  const [step, setStep] = useState(0);
  const [ctx, setCtx] = useState<SnapshotContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Step 1 — Energy rankings
  const [energyRankings, setEnergyRankings] = useState<Record<number, number>>({});

  // Step 2 — FTE
  const [clinicalPct, setClinicalPct] = useState("");
  const [teachingPct, setTeachingPct] = useState("");
  const [researchPct, setResearchPct] = useState("");
  const [adminPct, setAdminPct] = useState("");

  // Step 3 — Goals
  const [goalNote, setGoalNote] = useState("");

  // Step 4 — Setting
  const [practiceSetting, setPracticeSetting] = useState<PracticeSetting | "">("");
  const [clinicalSetting, setClinicalSetting] = useState<ClinicalSetting | "">("");

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch("/api/v1/wellbeing/quarterly-snapshot");
        const data = (await res.json()) as SnapshotContext & { due: boolean };
        setCtx(data);

        // Pre-populate from existing values
        const erMap: Record<number, number> = {};
        for (const r of data.energy_rankings) erMap[r.domain_index] = r.rank;
        setEnergyRankings(erMap);

        if (data.fte_expected) {
          setClinicalPct(String(Math.round((data.fte_expected.clinical ?? 0) * 100)));
          setTeachingPct(String(Math.round((data.fte_expected.teaching ?? 0) * 100)));
          setResearchPct(String(Math.round((data.fte_expected.research ?? 0) * 100)));
          setAdminPct(String(Math.round((data.fte_expected.admin ?? 0) * 100)));
        }
        if (data.practice_setting) setPracticeSetting(data.practice_setting as PracticeSetting);
        if (data.clinical_setting) setClinicalSetting(data.clinical_setting as ClinicalSetting);
      } catch {
        setCtx({ energy_rankings: [], goals: [], fte_expected: null, practice_setting: null, clinical_setting: null });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleSubmit() {
    setSaving(true);
    setError("");
    try {
      const hasAnyFte = clinicalPct || teachingPct || researchPct || adminPct;
      const fte_expected = hasAnyFte
        ? {
            clinical: parseFloat(clinicalPct) / 100 || 0,
            teaching: parseFloat(teachingPct) / 100 || 0,
            research: parseFloat(researchPct) / 100 || 0,
            admin: parseFloat(adminPct) / 100 || 0,
          }
        : null;

      const rankedDomains = Object.entries(energyRankings)
        .filter(([, rank]) => rank > 0)
        .map(([idx, rank]) => ({ domain_index: Number(idx), rank }));

      const res = await fetch("/api/v1/wellbeing/quarterly-snapshot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          energy_rankings: rankedDomains,
          fte_expected,
          goal_note: goalNote.trim() || null,
          practice_setting: practiceSetting || null,
          clinical_setting: clinicalSetting || null,
        }),
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

  if (loading) return <p className="text-sm text-cx-forest-dark/50">Loading…</p>;

  const ftePctTotal = [clinicalPct, teachingPct, researchPct, adminPct]
    .map((v) => parseFloat(v) || 0)
    .reduce((a, b) => a + b, 0);

  return (
    <div>
      <StepProgress current={step} />

      {/* Step 0 — Energy rankings */}
      {step === 0 && (
        <div className="space-y-4">
          <p className="text-sm text-cx-forest-dark/70">
            How is each area of your work feeling right now? 1 = very draining · 5 = very energizing.
          </p>
          {CAREER_DOMAINS.map((domain) => (
            <div key={domain.index} className="flex items-center gap-3">
              <span className="w-40 shrink-0 text-sm text-cx-forest-dark">{domain.name}</span>
              <div className="flex gap-1.5">
                {([1, 2, 3, 4, 5] as const).map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setEnergyRankings((prev) => ({ ...prev, [domain.index]: prev[domain.index] === n ? 0 : n }))}
                    className={cn(
                      "h-8 w-8 rounded-lg border text-xs font-medium transition-all",
                      energyRankings[domain.index] === n
                        ? "border-cx-forest-dark bg-cx-forest-dark text-white"
                        : "border-cx-forest-dark/20 text-cx-forest-dark/60 hover:border-cx-forest-dark/40",
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Step 1 — FTE / Role composition */}
      {step === 1 && (
        <div className="space-y-4">
          <p className="text-sm text-cx-forest-dark/70">
            Has your role composition changed? Update or confirm the percentages below.
          </p>
          <div className="grid grid-cols-2 gap-3">
            {([
              ["Clinical", clinicalPct, setClinicalPct],
              ["Teaching", teachingPct, setTeachingPct],
              ["Research", researchPct, setResearchPct],
              ["Admin", adminPct, setAdminPct],
            ] as [string, string, (v: string) => void][]).map(([label, value, setter]) => (
              <div key={label}>
                <p className="mb-1 text-xs text-cx-forest-dark/60">{label}</p>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  placeholder="0"
                  className="w-full rounded-xl border border-cx-forest-dark/15 bg-transparent px-4 py-3 text-sm text-cx-forest-dark placeholder:text-cx-forest-dark/30 focus:border-cx-forest-dark/40 focus:outline-none"
                />
              </div>
            ))}
          </div>
          {[clinicalPct, teachingPct, researchPct, adminPct].some(Boolean) && (
            <p className="text-xs text-cx-forest-dark/50">
              Total:{" "}
              <span className={Math.abs(ftePctTotal - 100) > 1 ? "text-amber-500" : "text-cx-forest-dark"}>
                {ftePctTotal}%
              </span>
              {" "}(should equal 100%)
            </p>
          )}
        </div>
      )}

      {/* Step 2 — Goal review */}
      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-cx-forest-dark/70">
            Review your current goals. Are they still relevant? Any progress to note?
          </p>
          {ctx?.goals && ctx.goals.length > 0 ? (
            <ul className="space-y-2">
              {ctx.goals.map((g) => (
                <li key={g.id} className="rounded-xl border border-cx-forest-dark/10 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-cx-forest-dark/50">{g.horizon}</p>
                  <p className="mt-1 text-sm text-cx-forest-dark">{g.specific ?? g.wish ?? "—"}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-cx-forest-dark/50">
              No goals on record yet. You can add goals in your career plan.
            </p>
          )}
          <div>
            <label className="text-sm text-cx-forest-dark" htmlFor="goal-note">
              Note on your goals <span className="text-cx-forest-dark/50">(optional)</span>
            </label>
            <textarea
              id="goal-note"
              rows={3}
              value={goalNote}
              onChange={(e) => setGoalNote(e.target.value)}
              placeholder="Progress, pivots, or anything you want to remember…"
              className="mt-1 w-full resize-none rounded-xl border border-cx-forest-dark/15 bg-transparent px-4 py-3 text-sm text-cx-forest-dark placeholder:text-cx-forest-dark/30 focus:border-cx-forest-dark/40 focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Step 3 — Setting update */}
      {step === 3 && (
        <div className="space-y-5">
          <p className="text-sm text-cx-forest-dark/70">
            Has your practice context changed? Confirm or update below.
          </p>
          <div>
            <p className="mb-2 text-sm text-cx-forest-dark">Practice setting</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {PRACTICE_SETTINGS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setPracticeSetting(s)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm transition-all",
                    practiceSetting === s
                      ? "border-cx-forest-dark bg-cx-forest-dark text-white"
                      : "border-cx-forest-dark/20 text-cx-forest-dark/70 hover:border-cx-forest-dark/40",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm text-cx-forest-dark">
              Clinical site <span className="text-cx-forest-dark/50">(optional)</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              {CLINICAL_SETTINGS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setClinicalSetting(s)}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-sm transition-all",
                    clinicalSetting === s
                      ? "border-cx-forest-dark bg-cx-forest-dark text-white"
                      : "border-cx-forest-dark/20 text-cx-forest-dark/70 hover:border-cx-forest-dark/40",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <div className="mt-6 flex gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="rounded-xl border border-cx-forest-dark/20 px-5 py-2.5 text-sm font-medium text-cx-forest-dark hover:border-cx-forest-dark/40"
          >
            Back
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={() => setStep((s) => s + 1)}
            className="rounded-xl bg-cx-forest-dark px-6 py-2.5 text-sm font-medium text-white hover:opacity-90"
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={saving}
            className={cn(
              "rounded-xl px-6 py-2.5 text-sm font-medium transition-all",
              !saving
                ? "bg-cx-forest-dark text-white hover:opacity-90"
                : "cursor-not-allowed bg-cx-forest-dark/20 text-cx-forest-dark/40",
            )}
          >
            {saving ? "Saving…" : "Complete snapshot"}
          </button>
        )}
      </div>
    </div>
  );
}

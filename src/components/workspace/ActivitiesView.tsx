"use client";

import { useCallback, useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CardSection } from "@/components/ui/CardSection";
import { Badge } from "@/components/ui/Badge";
import { ENERGY_OPTIONS } from "@/lib/constants";
import { OBJECTIVE_MAK } from "@/lib/card-mak-prompts";
import { fetchActivities } from "@/lib/activities-storage";
import { cn } from "@/lib/utils";
import type { ActivityEntry } from "@/lib/types/database";
import type { ClassificationResult } from "@/lib/types/database";
import { isUnconfirmedMakCapture } from "@/lib/v2/activity-confirm";

export function ActivitiesView() {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [text, setText] = useState("");
  const [energy, setEnergy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastClassification, setLastClassification] =
    useState<ClassificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const loadActivities = useCallback(async () => {
    const data = await fetchActivities();
    setActivities(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadActivities();
    const onLogged = () => void loadActivities();
    window.addEventListener("fiscmak:activity-logged", onLogged);
    return () => window.removeEventListener("fiscmak:activity-logged", onLogged);
  }, [loadActivities]);

  async function addActivity(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), energy_valence: energy ?? undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message ?? "Failed to save activity");
      }

      if (data.activity) {
        setLastClassification({
          primary_domain: data.activity.primary_domain ?? "",
          primary_track: data.activity.primary_track ?? "",
          primary_domain_confidence: data.activity.primary_domain_confidence ?? 0,
          primary_track_confidence: data.activity.primary_track_confidence ?? 0,
          scope: data.activity.scope ?? "",
          evidence_strength: data.activity.evidence_strength ?? "",
          confidence_score: data.activity.confidence_score ?? 0,
          rationale: "",
        });
      }

      setText("");
      setEnergy(null);
      await loadActivities();
      window.dispatchEvent(new CustomEvent("fiscmak:activity-logged"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save activity");
    } finally {
      setSaving(false);
    }
  }

  async function confirmActivity(id: string) {
    setConfirmingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/v1/activities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message ?? "Could not confirm activity");
      }
      await loadActivities();
      window.dispatchEvent(new CustomEvent("fiscmak:activity-logged"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not confirm activity");
    } finally {
      setConfirmingId(null);
    }
  }

  function energyAccent(valence: string | null) {
    if (!valence) return undefined;
    if (valence.includes("drain")) return "red" as const;
    if (valence.includes("energiz")) return "green" as const;
    return "amber" as const;
  }

  function badgeEnergy(valence: string | null) {
    if (!valence) return "neutral" as const;
    if (valence.includes("drain")) return "draining" as const;
    if (valence.includes("energiz")) return "energizing" as const;
    return "neutral" as const;
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <CardSection
        eyebrow="Career Data"
        title="Log career evidence"
        description="Capture work that may not show on your CV — or tell Mak from the dashboard."
        icon={ClipboardList}
        mak={OBJECTIVE_MAK.activities}
      >
        <form onSubmit={addActivity} className="space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="cx-field w-full"
            placeholder="Something meaningful that might not show up on a CV…"
            aria-label="Activity description"
          />
          <div>
            <p className="text-cx-label">Energy level (optional)</p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Energy level">
              {ENERGY_OPTIONS.map((o) => {
                const selected = energy === o.value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setEnergy(selected ? null : o.value)}
                    className={cn(
                      "cx-nav-pill text-sm",
                      selected ? "cx-nav-pill-active" : "cx-nav-pill-inactive",
                    )}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving & classifying…" : "Save activity"}
          </Button>
        </form>

        {lastClassification && (
          <div className="mt-4 rounded-xl border border-l-4 border-cx-forest-dark/15 border-l-[#5FD65F] bg-cx-forest-dark/[0.03] p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-cx-forest-dark/70">Classification</p>
            <p className="mt-1 font-semibold text-cx-forest-dark">
              {lastClassification.primary_domain} × {lastClassification.primary_track}
            </p>
            <p className="mt-1 text-sm text-cx-forest-dark/80">
              {Math.round(lastClassification.confidence_score * 100)}% confidence
            </p>
          </div>
        )}
      </CardSection>

      <CardSection
        eyebrow="History"
        title="Recent activities"
        mak={OBJECTIVE_MAK.activities}
      >
        {loading && <p className="text-sm text-cx-forest-dark/70">Loading…</p>}
        {!loading && activities.length === 0 && (
          <p className="text-sm text-cx-forest-dark/70">
            No activities yet. Log your first one above or through Mak.
          </p>
        )}
        <div className="space-y-3">
        {activities.map((a) => (
          <div
            key={a.id}
            className={`cx-surface-elevated rounded-xl p-4 ${
              energyAccent(a.energy_valence) === "red"
                ? "border-l-4 border-l-red-500"
                : energyAccent(a.energy_valence) === "green"
                  ? "border-l-4 border-l-cx-success"
                  : energyAccent(a.energy_valence) === "amber"
                    ? "border-l-4 border-l-cx-attention"
                    : ""
            }`}
          >
            <p className="text-sm text-cx-forest-dark">{a.raw_text}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge energy={badgeEnergy(a.energy_valence)}>
                {a.energy_valence?.replace(/_/g, " ") ?? "—"}
              </Badge>
              {a.primary_domain && <Badge>{a.primary_domain}</Badge>}
              {a.primary_track && <Badge>{a.primary_track}</Badge>}
              {a.input_source === "mak_capture" && <Badge>Mak</Badge>}
              {isUnconfirmedMakCapture(a) && <Badge>Needs confirm</Badge>}
              <span className="text-xs text-cx-forest-dark/70">{a.activity_date}</span>
            </div>
            {isUnconfirmedMakCapture(a) && (
              <Button
                variant="secondary"
                className="mt-3"
                disabled={confirmingId === a.id}
                onClick={() => void confirmActivity(a.id)}
                aria-label="Confirm this activity looks right"
              >
                {confirmingId === a.id ? "Saving…" : "This looks right"}
              </Button>
            )}
          </div>
        ))}
        </div>
      </CardSection>
    </div>
  );
}

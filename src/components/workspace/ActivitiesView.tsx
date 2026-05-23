"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ENERGY_OPTIONS } from "@/lib/constants";
import { fetchActivities } from "@/lib/activities-storage";
import type { ActivityEntry } from "@/lib/types/database";
import type { ClassificationResult } from "@/lib/types/database";

export function ActivitiesView() {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [text, setText] = useState("");
  const [energy, setEnergy] = useState("energizing");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastClassification, setLastClassification] =
    useState<ClassificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

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
        body: JSON.stringify({ text: text.trim(), energy_valence: energy }),
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
      await loadActivities();
      window.dispatchEvent(new CustomEvent("fiscmak:activity-logged"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save activity");
    } finally {
      setSaving(false);
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

      <Card>
        <p className="text-cx-label uppercase">Activity log</p>
        <h2 className="mt-1 font-semibold text-cx-text">Log career evidence</h2>
        <p className="mt-1 text-cx-body">
          Capture work that may not show on your CV — or tell Mak from the dashboard.
        </p>
        <form onSubmit={addActivity} className="mt-4 space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="cx-field w-full"
            placeholder="Something meaningful that might not show up on a CV…"
            aria-label="Activity description"
          />
          <select
            value={energy}
            onChange={(e) => setEnergy(e.target.value)}
            className="cx-field min-h-11 w-full"
            aria-label="Energy level"
          >
            {ENERGY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving & classifying…" : "Save activity"}
          </Button>
        </form>

        {lastClassification && (
          <Card accent="green" className="mt-4">
            <p className="text-cx-label uppercase">Classification</p>
            <p className="mt-1 text-cx-body">
              {lastClassification.primary_domain} × {lastClassification.primary_track} (
              {Math.round(lastClassification.confidence_score * 100)}% confidence)
            </p>
          </Card>
        )}
      </Card>

      <div className="space-y-4">
        <h2 className="font-semibold text-cx-text">Recent activities</h2>
        {loading && <p className="text-sm text-cx-text-secondary">Loading…</p>}
        {!loading && activities.length === 0 && (
          <p className="text-sm text-cx-text-secondary">
            No activities yet. Log your first one above or through Mak.
          </p>
        )}
        {activities.map((a) => (
          <Card key={a.id} accent={energyAccent(a.energy_valence)}>
            <p className="text-sm text-cx-text">{a.raw_text}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge energy={badgeEnergy(a.energy_valence)}>
                {a.energy_valence?.replace(/_/g, " ") ?? "—"}
              </Badge>
              {a.primary_domain && <Badge>{a.primary_domain}</Badge>}
              {a.primary_track && <Badge>{a.primary_track}</Badge>}
              {a.input_source === "mak_capture" && <Badge>Mak</Badge>}
              <span className="text-xs text-cx-text-secondary">{a.activity_date}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

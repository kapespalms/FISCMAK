"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ENERGY_OPTIONS } from "@/lib/constants";
import { fetchActivities, loadDemoActivities, saveDemoActivities } from "@/lib/activities-storage";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { ActivityEntry } from "@/lib/types/database";
import type { ClassificationResult } from "@/lib/types/database";

export default function ActivitiesPage() {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [text, setText] = useState("");
  const [energy, setEnergy] = useState("energizing");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastClassification, setLastClassification] =
    useState<ClassificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const supabaseConfigured = isSupabaseConfigured();

  const loadActivities = useCallback(async () => {
    const data = await fetchActivities();
    setActivities(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  async function addActivity(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;

    setSaving(true);
    setError(null);

    try {
      const classifyRes = await fetch("/api/classify/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });
      const classification: ClassificationResult = await classifyRes.json();
      setLastClassification(classification);

      if (!supabaseConfigured) {
        const entry: ActivityEntry = {
          id: crypto.randomUUID(),
          user_id: "demo",
          created_at: new Date().toISOString(),
          activity_date: new Date().toISOString().slice(0, 10),
          raw_text: text.trim(),
          input_source: "text",
          energy_valence: energy,
          primary_domain: classification.primary_domain,
          primary_track: classification.primary_track,
          primary_domain_confidence: classification.primary_domain_confidence,
          primary_track_confidence: classification.primary_track_confidence,
          scope: classification.scope,
          evidence_strength: classification.evidence_strength,
          confidence_score: classification.confidence_score,
        };
        const next = [entry, ...loadDemoActivities()];
        saveDemoActivities(next);
        setActivities(next);
        setText("");
        setSaving(false);
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");

      const { error: insertError } = await supabase
        .from("activity_entries")
        .insert({
          user_id: user.id,
          raw_text: text.trim(),
          input_source: "text",
          activity_date: new Date().toISOString().slice(0, 10),
          energy_valence: energy,
          primary_domain: classification.primary_domain,
          primary_track: classification.primary_track,
          primary_domain_confidence: classification.primary_domain_confidence,
          primary_track_confidence: classification.primary_track_confidence,
          scope: classification.scope,
          evidence_strength: classification.evidence_strength,
          confidence_score: classification.confidence_score,
          mak_rationale: classification.rationale,
        });

      if (insertError) throw insertError;

      setText("");
      await loadActivities();
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
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Activities</h1>
        <p className="mt-1 text-fiscmak-muted">
          Capture career evidence
          {!supabaseConfigured && " · saved in browser (demo)"}
        </p>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-fiscmak-red">
          {error}
        </p>
      )}

      <Card>
        <h2 className="font-semibold">Log activity</h2>
        <form onSubmit={addActivity} className="mt-4 space-y-4">
          <div>
            <label htmlFor="activity" className="text-sm font-semibold">
              What did you do?
            </label>
            <textarea
              id="activity"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              className="mt-2 w-full rounded-md border border-fiscmak-border p-4 text-base focus:border-fiscmak-green"
              placeholder="Something meaningful that might not show up on a CV…"
            />
          </div>
          <div>
            <label htmlFor="energy" className="text-sm font-semibold">
              Energy
            </label>
            <select
              id="energy"
              value={energy}
              onChange={(e) => setEnergy(e.target.value)}
              className="mt-2 min-h-11 w-full rounded-md border border-fiscmak-border px-4"
            >
              {ENERGY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving & classifying…" : "Save activity"}
          </Button>
        </form>

        {lastClassification && (
          <Card className="mt-4 bg-fiscmak-green-light p-4">
            <p className="text-sm font-semibold">Classification</p>
            <p className="mt-1 text-sm">
              {lastClassification.primary_domain} ×{" "}
              {lastClassification.primary_track} (
              {Math.round(lastClassification.confidence_score * 100)}%
              confidence)
            </p>
          </Card>
        )}
      </Card>

      <div className="space-y-4">
        <h2 className="font-semibold">Recent</h2>
        {loading && <p className="text-sm text-fiscmak-muted">Loading…</p>}
        {!loading && activities.length === 0 && (
          <p className="text-sm text-fiscmak-muted">
            No activities yet. Log your first one above.
          </p>
        )}
        {activities.map((a) => (
          <Card key={a.id} accent={energyAccent(a.energy_valence)}>
            <p className="text-sm">{a.raw_text}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge energy={badgeEnergy(a.energy_valence)}>
                {a.energy_valence?.replace(/_/g, " ") ?? "—"}
              </Badge>
              {a.primary_domain && <Badge>{a.primary_domain}</Badge>}
              {a.primary_track && <Badge>{a.primary_track}</Badge>}
              <span className="text-xs text-fiscmak-muted">
                {a.activity_date}
              </span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

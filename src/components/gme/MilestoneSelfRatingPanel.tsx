"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { DiscrepancyRow } from "@/lib/v2/gme/milestone-discrepancy";

type Subcompetency = {
  id: string;
  number: number;
  name: string;
  acgme_competency_key: string;
  medhub_outpatient_form?: boolean;
};

type SelfRating = {
  subcompetency_id: string;
  self_level: number | null;
};

type IlpGoal = {
  goal_id: string;
  subcompetency_id: string | null;
  goal_text: string;
  resources: string | null;
  status: string;
  source: string | null;
};

const LEVELS = [1, 2, 3, 4, 5] as const;

function flagBadge(flag: DiscrepancyRow["flag"]) {
  if (flag === "discuss") return <Badge energy="draining">Discuss</Badge>;
  if (flag === "watch") return <Badge energy="neutral">Watch</Badge>;
  return null;
}

export function MilestoneSelfRatingPanel() {
  const [subcompetencies, setSubcompetencies] = useState<Subcompetency[]>([]);
  const [ratings, setRatings] = useState<Record<string, number | null>>({});
  const [discrepancy, setDiscrepancy] = useState<DiscrepancyRow[]>([]);
  const [ilpGoals, setIlpGoals] = useState<IlpGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const discrepancyById = useMemo(
    () => new Map(discrepancy.map((row) => [row.subcompetency_id, row])),
    [discrepancy],
  );

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [defsRes, ratingsRes, discRes, ilpRes] = await Promise.all([
        fetch("/api/v1/trainee/milestones/definitions"),
        fetch("/api/v1/trainee/milestones/self-ratings?period=current"),
        fetch("/api/v1/trainee/milestones/discrepancy?period=current"),
        fetch("/api/v1/ilp-goals?period=current"),
      ]);

      const [defs, ratingsData, discData, ilpData] = await Promise.all([
        defsRes.json(),
        ratingsRes.json(),
        discRes.json(),
        ilpRes.json(),
      ]);

      if (!defsRes.ok) throw new Error(defs.message ?? "Could not load milestones.");
      if (!ratingsRes.ok) throw new Error(ratingsData.message ?? "Could not load self-ratings.");
      if (!discRes.ok) throw new Error(discData.message ?? "Could not load discrepancy.");

      setSubcompetencies(defs.subcompetencies ?? []);
      const ratingMap: Record<string, number | null> = {};
      for (const row of (ratingsData.ratings ?? []) as SelfRating[]) {
        ratingMap[row.subcompetency_id] = row.self_level;
      }
      setRatings(ratingMap);
      setDiscrepancy(discData.rows ?? []);
      setIlpGoals(ilpData.goals ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load milestone data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const ratedCount = subcompetencies.filter((s) => ratings[s.id] != null).length;

  const saveRatings = async () => {
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const payload = subcompetencies.map((sub) => ({
        subcompetency_id: sub.id,
        self_level: ratings[sub.id] ?? null,
      }));
      const res = await fetch("/api/v1/trainee/milestones/self-ratings?period=current", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period: "current", ratings: payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Could not save self-ratings.");

      const discRes = await fetch("/api/v1/trainee/milestones/discrepancy?period=current");
      const discData = await discRes.json();
      if (discRes.ok) setDiscrepancy(discData.rows ?? []);

      setMessage(`Saved ${ratedCount} self-rating(s). Tier 3 reflection — not a final milestone score.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save self-ratings.");
    } finally {
      setSaving(false);
    }
  };

  const draftIlp = async () => {
    setDrafting(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/v1/trainee/ilp/draft-from-gaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period: "current", replace_drafts: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Could not draft ILP goals.");
      setIlpGoals(data.goals ?? []);
      setMessage(
        data.drafted
          ? `Drafted ${data.drafted} ILP goal(s) from milestone gaps — review with your PD at CCC.`
          : (data.note ?? "No new ILP drafts."),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not draft ILP goals.");
    } finally {
      setDrafting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <p className="text-sm text-cx-forest-dark/70">Loading milestone self-assessment…</p>
      </Card>
    );
  }

  if (!subcompetencies.length) {
    return null;
  }

  return (
    <Card>
      <p className="text-cx-label uppercase">GME · Milestones</p>
      <h3 className="mt-1 text-lg font-semibold text-cx-forest-dark">
        ACGME milestone self-assessment
      </h3>
      <p className="mt-2 text-sm text-cx-forest-dark/75">
        Rate all {subcompetencies.length} psychiatry subcompetencies (Tier 3 reflection). Compare
        against imported MedHub faculty ratings — discrepancies flag areas to discuss at CCC.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={() => void saveRatings()} disabled={saving}>
          {saving ? "Saving…" : `Save self-ratings (${ratedCount}/${subcompetencies.length})`}
        </Button>
        <Button variant="secondary" onClick={() => void draftIlp()} disabled={drafting}>
          {drafting ? "Drafting…" : "Draft ILP from gaps"}
        </Button>
      </div>

      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}
      {message && <p className="mt-3 text-sm text-cx-forest-dark/80">{message}</p>}

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-cx-forest-dark/15 text-xs uppercase text-cx-forest-dark/60">
              <th className="py-2 pr-3">#</th>
              <th className="py-2 pr-3">Subcompetency</th>
              <th className="py-2 pr-3">Self</th>
              <th className="py-2 pr-3">Faculty</th>
              <th className="py-2 pr-3">Δ</th>
              <th className="py-2">Flag</th>
            </tr>
          </thead>
          <tbody>
            {subcompetencies.map((sub) => {
              const disc = discrepancyById.get(sub.id);
              return (
                <tr key={sub.id} className="border-b border-cx-forest-dark/8 align-top">
                  <td className="py-2 pr-3 text-cx-forest-dark/60">{sub.number}</td>
                  <td className="py-2 pr-3">
                    <p className="font-medium text-cx-forest-dark">{sub.name}</p>
                    <p className="text-xs text-cx-forest-dark/55">
                      {sub.acgme_competency_key.toUpperCase()}
                      {sub.medhub_outpatient_form ? " · MedHub form" : ""}
                    </p>
                  </td>
                  <td className="py-2 pr-3">
                    <select
                      className="rounded border border-cx-forest-dark/20 bg-white px-2 py-1 text-sm"
                      value={ratings[sub.id] ?? ""}
                      onChange={(e) =>
                        setRatings((prev) => ({
                          ...prev,
                          [sub.id]: e.target.value ? Number(e.target.value) : null,
                        }))
                      }
                    >
                      <option value="">—</option>
                      {LEVELS.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2 pr-3 tabular-nums">
                    {disc?.external_level ?? "—"}
                  </td>
                  <td className="py-2 pr-3 tabular-nums">
                    {disc?.delta != null ? (disc.delta > 0 ? `+${disc.delta}` : disc.delta) : "—"}
                  </td>
                  <td className="py-2">{disc ? flagBadge(disc.flag) : null}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {ilpGoals.length > 0 && (
        <div className="mt-6">
          <p className="font-semibold text-cx-forest-dark">ILP goals</p>
          <ul className="mt-3 space-y-3">
            {ilpGoals.map((goal) => (
              <li
                key={goal.goal_id}
                className="rounded-lg border border-cx-forest-dark/10 px-3 py-2 text-sm"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Badge energy={goal.status === "active" ? "energizing" : "default"}>
                    {goal.status}
                  </Badge>
                  {goal.source === "system_draft" && (
                    <span className="text-xs text-cx-forest-dark/55">System draft</span>
                  )}
                </div>
                <p className="mt-1 text-cx-forest-dark">{goal.goal_text}</p>
                {goal.resources && (
                  <p className="mt-1 text-xs text-cx-forest-dark/60">Resources: {goal.resources}</p>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

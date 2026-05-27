"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { CohortDashboard } from "@/lib/v2/gme/cohort-dashboard";
import { HEATMAP_CELL_STYLES } from "@/lib/v2/gme/pgy-milestone-benchmarks";

type CohortHeatmapPanelProps = {
  programSlug: string;
};

export function CohortHeatmapPanel({ programSlug }: CohortHeatmapPanelProps) {
  const [dashboard, setDashboard] = useState<CohortDashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [medhubOnly, setMedhubOnly] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const subs = useMemo(
    () =>
      (dashboard?.subcompetencies ?? []).filter(
        (s) => !medhubOnly || s.medhub_outpatient_form,
      ),
    [dashboard, medhubOnly],
  );

  const cellMap = useMemo(() => {
    const map = new Map<string, CohortDashboard["milestone_heatmap"][number]>();
    for (const cell of dashboard?.milestone_heatmap ?? []) {
      map.set(`${cell.trainee_id}:${cell.subcompetency_id}`, cell);
    }
    return map;
  }, [dashboard]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/v1/programs/${encodeURIComponent(programSlug)}/cohort-heatmap?period=current`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Could not load cohort heatmap.");
      setDashboard({
        period: data.period,
        subcompetencies: data.subcompetencies ?? [],
        trainees: data.trainees ?? [],
        milestone_heatmap: data.heatmap ?? [],
        assessment_volume: [],
        narrative_quality_pct: data.narrative_quality_pct ?? 0,
        equity_alerts: data.equity_alerts ?? [],
        summary: data.summary ?? {
          trainee_count: 0,
          total_evaluations: 0,
          cohort_avg_milestone: null,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load cohort dashboard.");
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  }, [programSlug]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Card>
      <p className="text-cx-label uppercase">GME · Cohort</p>
      <h3 className="mt-1 text-lg font-semibold text-cx-forest-dark">Milestone heatmap</h3>
      <p className="mt-2 text-sm text-cx-forest-dark/75">
        Subcompetency × trainee view from imported MedHub evals and self-ratings. Colors compare
        against PGY-expected milestone levels.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => void load()} disabled={loading}>
          {loading ? "Loading…" : "Refresh heatmap"}
        </Button>
        <Button
          variant="secondary"
          onClick={() => setMedhubOnly((v) => !v)}
        >
          {medhubOnly ? "Show all 21 subcompetencies" : "Show MedHub 14 only"}
        </Button>
      </div>

      {error && <p className="mt-3 text-sm text-red-700">{error}</p>}

      {dashboard && (
        <div className="mt-4 space-y-3 text-sm">
          <p className="text-cx-forest-dark/70">
            {dashboard.summary.trainee_count} trainee(s) · {dashboard.summary.total_evaluations}{" "}
            eval(s) · cohort avg {dashboard.summary.cohort_avg_milestone ?? "—"} · narrative
            quality {dashboard.narrative_quality_pct}%
          </p>

          {!dashboard.trainees.length ? (
            <p className="text-cx-forest-dark/60">No linked trainees — import MedHub CSV first.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-[720px] text-left text-xs">
                <thead>
                  <tr className="border-b border-cx-forest-dark/15 text-cx-forest-dark/55">
                    <th className="sticky left-0 bg-white py-2 pr-2">Trainee</th>
                    {subs.map((sub) => (
                      <th key={sub.id} className="px-1 py-2 text-center" title={sub.name}>
                        {sub.number}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {dashboard.trainees.map((trainee) => (
                    <tr key={trainee.user_id} className="border-b border-cx-forest-dark/8">
                      <td className="sticky left-0 bg-white py-2 pr-2 font-medium">
                        {trainee.initials ?? "—"}
                        <span className="block text-[10px] text-cx-forest-dark/50">
                          {trainee.pgy_level ?? "PGY ?"}
                        </span>
                      </td>
                      {subs.map((sub) => {
                        const cell = cellMap.get(`${trainee.user_id}:${sub.id}`);
                        const level = cell?.external_level ?? cell?.self_level;
                        return (
                          <td key={sub.id} className="px-1 py-1 text-center">
                            <span
                              className={`inline-block min-w-[2rem] rounded px-1 py-0.5 tabular-nums ${HEATMAP_CELL_STYLES[cell?.flag ?? "missing"]}`}
                              title={`${sub.name} · expected ${cell?.expected_level ?? "—"}`}
                            >
                              {level ?? "—"}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex flex-wrap gap-3 text-[11px] text-cx-forest-dark/60">
            <span className="rounded px-2 py-0.5 bg-[#5FD65F]/30">Above expected</span>
            <span className="rounded px-2 py-0.5 bg-cx-forest-dark/10">On track</span>
            <span className="rounded px-2 py-0.5 bg-amber-100">Watch</span>
            <span className="rounded px-2 py-0.5 bg-red-100">Gap</span>
          </div>

          {dashboard.equity_alerts.length > 0 && (
            <div className="rounded-lg border border-cx-forest-dark/10 px-3 py-2 text-xs text-cx-forest-dark/75">
              <p className="font-semibold text-cx-forest-dark">Equity guardrail</p>
              {dashboard.equity_alerts.map((alert) => (
                <p key={alert.metric} className="mt-1">
                  {alert.note}
                  {alert.group_delta != null ? ` (Δ ${alert.group_delta})` : ""}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

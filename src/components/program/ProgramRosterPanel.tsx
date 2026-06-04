"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CohortHeatmapPanel } from "@/components/gme/CohortHeatmapPanel";
import { cn } from "@/lib/utils";

type Resident = {
  user_id: string;
  name: string | null;
  initials: string | null;
  pgy_level: string | null;
  eval_count: number;
  milestones_rated: boolean;
  pre_ccc_ready: boolean;
  ilp_active_count: number;
  ilp_draft_count: number;
  duty_hours_flag: null;
};

type Tab = "roster" | "cohort";

export function ProgramRosterPanel({ programId }: { programId: string }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("roster");
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/programs/${encodeURIComponent(programId)}/residents`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Could not load resident roster.");
      setResidents(data.residents ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load resident roster.");
    } finally {
      setLoading(false);
    }
  }, [programId]);

  useEffect(() => {
    void load();
  }, [load]);

  const byPgy = useMemo(() => {
    const map = new Map<string, Resident[]>();
    for (const r of residents) {
      const key = r.pgy_level ?? "Unknown";
      const bucket = map.get(key) ?? [];
      bucket.push(r);
      map.set(key, bucket);
    }
    return [...map.entries()].sort(([a], [b]) => {
      const na = parseInt(a.replace(/\D/g, "")) || 99;
      const nb = parseInt(b.replace(/\D/g, "")) || 99;
      return na - nb;
    });
  }, [residents]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={tab === "roster" ? "primary" : "secondary"}
          onClick={() => setTab("roster")}
        >
          Roster
        </Button>
        <Button
          variant={tab === "cohort" ? "primary" : "secondary"}
          onClick={() => setTab("cohort")}
        >
          Cohort view
        </Button>
      </div>

      {tab === "roster" && (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-cx-label uppercase">GME · Roster</p>
              <h3 className="mt-1 text-lg font-semibold text-cx-forest-dark">
                Residents by PGY
              </h3>
            </div>
            <Button variant="secondary" onClick={() => void load()} disabled={loading}>
              {loading ? "Loading…" : "Refresh"}
            </Button>
          </div>

          {error && (
            <p className="mt-3 text-sm text-cx-forest-dark/70">{error}</p>
          )}

          {!loading && !error && residents.length === 0 && (
            <p className="mt-4 text-sm text-cx-forest-dark/60">
              No residents linked to this program yet — import MedHub CSV or add trainees via
              invite.
            </p>
          )}

          {byPgy.map(([pgy, group]) => (
            <div key={pgy} className="mt-6">
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-cx-forest-dark/55">
                {pgy}
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b border-cx-forest-dark/10 text-left text-xs text-cx-forest-dark/50">
                      <th className="pb-2 pr-4 font-medium">Resident</th>
                      <th className="pb-2 pr-4 font-medium">Evaluations</th>
                      <th className="pb-2 pr-4 font-medium">Pre-CCC</th>
                      <th className="pb-2 pr-4 font-medium">ILP</th>
                      <th className="pb-2 font-medium">Duty hours</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.map((r) => (
                      <tr
                        key={r.user_id}
                        className="cursor-pointer border-b border-cx-forest-dark/8 hover:bg-rail-item-hover"
                        onClick={() => router.push(`/app/program/residents/${r.user_id}`)}
                      >
                        <td className="py-2.5 pr-4">
                          <span className="font-medium text-cx-forest-dark">
                            {r.name ?? r.initials ?? "—"}
                          </span>
                        </td>
                        <td className="py-2.5 pr-4">
                          {r.milestones_rated ? (
                            <span className="rounded-full bg-[#E6ECF0] px-2 py-0.5 text-[11px] font-medium text-[#34597A]">
                              {r.eval_count} eval{r.eval_count !== 1 ? "s" : ""}
                            </span>
                          ) : (
                            <span className="text-xs text-cx-forest-dark/40">No data</span>
                          )}
                        </td>
                        <td className="py-2.5 pr-4">
                          {r.pre_ccc_ready ? (
                            <span className="rounded-full bg-fis-gold/15 px-2 py-0.5 text-[11px] font-medium text-fis-gold">
                              Ready
                            </span>
                          ) : (
                            <span className="text-xs text-cx-forest-dark/40">Pending</span>
                          )}
                        </td>
                        <td className="py-2.5 pr-4">
                          <IlpBadge active={r.ilp_active_count} draft={r.ilp_draft_count} />
                        </td>
                        <td className="py-2.5 text-xs text-cx-forest-dark/40">Phase 2</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </Card>
      )}

      {tab === "cohort" && (
        <div className="space-y-3">
          <p className="text-sm text-cx-forest-dark/60">
            De-identified milestone heatmap · aggregates of ≥5 required for PGY-subgroup comparison
            · trainee initials only · no well-being data
          </p>
          <CohortHeatmapPanel programSlug={programId} />
        </div>
      )}
    </div>
  );
}

function IlpBadge({ active, draft }: { active: number; draft: number }) {
  if (active === 0 && draft === 0) {
    return <span className="text-xs text-cx-forest-dark/40">None</span>;
  }
  return (
    <span className={cn("text-xs", active > 0 ? "text-fis-gold" : "text-cx-forest-dark/60")}>
      {active > 0 && `${active} active`}
      {active > 0 && draft > 0 && " · "}
      {draft > 0 && `${draft} pending`}
    </span>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PreCccSummaryPanel } from "@/components/gme/PreCccSummaryPanel";

type HeatmapCell = {
  subcompetency_id: string;
  number: number;
  name: string;
  external_level: number | null;
  self_level: number | null;
  expected_level: number;
  flag: string;
  style: string;
};

type IlpGoal = {
  goal_id: string;
  subcompetency_id: string | null;
  goal_text: string;
  status: string;
  source: string | null;
};

type Tab = "milestones" | "preccc" | "ilp";

export function PdResidentDetailPanel({
  programId,
  userId,
}: {
  programId: string;
  userId: string;
}) {
  const [tab, setTab] = useState<Tab>("milestones");

  return (
    <div className="space-y-5">
      <Link
        href="/app/program"
        className="inline-flex items-center gap-1.5 text-sm text-cx-forest-dark/60 hover:text-cx-forest-dark"
      >
        <ArrowLeft size={14} />
        Back to roster
      </Link>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={tab === "milestones" ? "primary" : "secondary"}
          onClick={() => setTab("milestones")}
        >
          Milestones
        </Button>
        <Button
          variant={tab === "preccc" ? "primary" : "secondary"}
          onClick={() => setTab("preccc")}
        >
          Pre-CCC
        </Button>
        <Button
          variant={tab === "ilp" ? "primary" : "secondary"}
          onClick={() => setTab("ilp")}
        >
          ILP
        </Button>
      </div>

      {tab === "milestones" && (
        <PdMilestonePanel programId={programId} userId={userId} />
      )}
      {tab === "preccc" && (
        <PreCccSummaryPanel
          programSlug={programId}
          userId={userId}
          title="Pre-CCC summary (PD view)"
          description="Imported MedHub rotation evaluations synthesized for semiannual review prep."
        />
      )}
      {tab === "ilp" && (
        <PdIlpPanel programId={programId} userId={userId} />
      )}
    </div>
  );
}

function PdMilestonePanel({
  programId,
  userId,
}: {
  programId: string;
  userId: string;
}) {
  const [cells, setCells] = useState<HeatmapCell[]>([]);
  const [pgyLevel, setPgyLevel] = useState<string | null>(null);
  const [evalCount, setEvalCount] = useState(0);
  const [prite, setPrite] = useState<{ exam_year: number; overall_percentile: number | null } | null>(null);
  const [loading, setLoading] = useState(false);
  const [medhubOnly, setMedhubOnly] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        period: "current",
        medhub_only: medhubOnly ? "true" : "false",
      });
      const res = await fetch(
        `/api/v1/programs/${encodeURIComponent(programId)}/residents/${encodeURIComponent(userId)}/milestones/heatmap?${params}`,
      );
      const data = await res.json();
      if (res.ok) {
        setCells(data.cells ?? []);
        setPgyLevel(data.pgy_level ?? null);
        setEvalCount(data.eval_count ?? 0);
        setPrite(data.prite ?? null);
      }
    } finally {
      setLoading(false);
    }
  }, [programId, userId, medhubOnly]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Card>
      <p className="text-cx-label uppercase">GME · Milestones</p>
      <h3 className="mt-1 text-lg font-semibold text-cx-forest-dark">
        Milestone heatmap — PGY {pgyLevel ?? "—"}
      </h3>
      <p className="mt-2 text-sm text-cx-forest-dark/75">
        {evalCount} faculty eval{evalCount !== 1 ? "s" : ""} · faculty ratings take precedence over
        self-ratings · current period only
      </p>

      {prite && (
        <p className="mt-1 text-xs text-cx-forest-dark/60">
          Latest PRITE ({prite.exam_year}): {prite.overall_percentile ?? "—"}th percentile
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <Button variant="secondary" onClick={() => void load()} disabled={loading}>
          {loading ? "Loading…" : "Refresh"}
        </Button>
        <Button variant="secondary" onClick={() => setMedhubOnly((v) => !v)}>
          {medhubOnly ? "Show all 21 subcompetencies" : "Show MedHub 14 only"}
        </Button>
      </div>

      {cells.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {cells.map((cell) => {
            const level = cell.external_level ?? cell.self_level;
            return (
              <div
                key={cell.subcompetency_id}
                className={`rounded-lg px-2 py-2 text-xs ${cell.style}`}
                title={cell.name}
              >
                <p className="font-semibold tabular-nums">{level ?? "—"}</p>
                <p className="mt-0.5 line-clamp-2 leading-snug">{cell.name}</p>
                <p className="mt-1 text-[10px] opacity-70">exp {cell.expected_level}</p>
              </div>
            );
          })}
        </div>
      )}

      {!loading && cells.length === 0 && (
        <p className="mt-4 text-sm text-cx-forest-dark/60">
          No milestone data for this resident yet — import MedHub CSV first.
        </p>
      )}
    </Card>
  );
}

function PdIlpPanel({
  programId,
  userId,
}: {
  programId: string;
  userId: string;
}) {
  const [goals, setGoals] = useState<IlpGoal[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(
        `/api/v1/programs/${encodeURIComponent(programId)}/residents/${encodeURIComponent(userId)}/ilp?period=current`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Could not load ILP goals.");
      setGoals(data.goals ?? []);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not load ILP goals.");
      setGoals([]);
    } finally {
      setLoading(false);
    }
  }, [programId, userId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function approveGoal(goalId: string) {
    setMessage(null);
    try {
      const res = await fetch(
        `/api/v1/programs/${encodeURIComponent(programId)}/ilp/${encodeURIComponent(goalId)}/approve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trainee_user_id: userId, period: "current" }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Could not approve goal.");
      setMessage("Goal approved and activated.");
      await load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not approve goal.");
    }
  }

  return (
    <Card>
      <p className="text-cx-label uppercase">GME · ILP</p>
      <h3 className="mt-1 text-lg font-semibold text-cx-forest-dark">
        Individual Learning Plan
      </h3>
      <p className="mt-2 text-sm text-cx-forest-dark/75">
        Approve draft goals after CCC co-production. Current period only.
      </p>

      <Button className="mt-4" variant="secondary" onClick={() => void load()} disabled={loading}>
        {loading ? "Loading…" : goals.length ? "Refresh" : "Load goals"}
      </Button>

      {message && (
        <p className="mt-3 text-sm text-cx-forest-dark/80">{message}</p>
      )}

      {!loading && goals.length === 0 && !message && (
        <p className="mt-3 text-sm text-cx-forest-dark/60">No ILP goals for current period.</p>
      )}

      {goals.length > 0 && (
        <ul className="mt-4 space-y-3 text-sm">
          {goals.map((goal) => (
            <li
              key={goal.goal_id}
              className="rounded-lg border border-cx-forest-dark/10 px-3 py-2"
            >
              <p className="font-medium text-cx-forest-dark">{goal.goal_text}</p>
              <p className="mt-1 text-xs text-cx-forest-dark/60">
                {goal.status} · {goal.source ?? "trainee"}
              </p>
              {goal.status === "draft" && (
                <Button
                  className="mt-2"
                  variant="secondary"
                  onClick={() => void approveGoal(goal.goal_id)}
                >
                  Approve goal
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

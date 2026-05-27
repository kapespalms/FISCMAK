"use client";

import { useCallback, useEffect, useState } from "react";
import type { UserSurface } from "@/lib/v2/profile-contract";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

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

type LongitudinalPeriod = {
  period_id: string;
  period_label: string;
  rated_count: number;
  total_count: number;
  cells: HeatmapCell[];
};

function HeatmapGrid({ cells }: { cells: HeatmapCell[] }) {
  if (cells.length === 0) return null;

  return (
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
  );
}

export function TraineeMilestoneHeatmapCard() {
  const [show, setShow] = useState(false);
  const [view, setView] = useState<"current" | "longitudinal">("current");
  const [cells, setCells] = useState<HeatmapCell[]>([]);
  const [periods, setPeriods] = useState<LongitudinalPeriod[]>([]);
  const [activePeriodId, setActivePeriodId] = useState<string>("current");
  const [pgyLevel, setPgyLevel] = useState<string | null>(null);
  const [prite, setPrite] = useState<{ exam_year: number; overall_percentile: number | null } | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  const loadCurrent = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/trainee/milestones/heatmap?period=current&medhub_only=true");
      const data = await res.json();
      if (res.ok) {
        setCells(data.cells ?? []);
        setPgyLevel(data.pgy_level ?? null);
        setPrite(data.prite ?? null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const loadLongitudinal = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/trainee/milestones/longitudinal?medhub_only=true");
      const data = await res.json();
      if (res.ok) {
        const nextPeriods = (data.periods ?? []) as LongitudinalPeriod[];
        setPeriods(nextPeriods);
        setPgyLevel(data.pgy_level ?? null);
        if (nextPeriods.length > 0 && !nextPeriods.some((p) => p.period_id === activePeriodId)) {
          setActivePeriodId(nextPeriods[0].period_id);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [activePeriodId]);

  const load = useCallback(async () => {
    if (view === "current") {
      await loadCurrent();
    } else {
      await loadLongitudinal();
    }
  }, [view, loadCurrent, loadLongitudinal]);

  useEffect(() => {
    fetch("/api/v1/onboarding/touchpoint1")
      .then((r) => r.json())
      .then((data) => {
        const surfaces = (data.profile_contract?.user_surfaces ?? []) as UserSurface[];
        if (surfaces.includes("milestone_heatmap")) {
          setShow(true);
          void loadCurrent();
        }
      })
      .catch(() => undefined);
  }, [loadCurrent]);

  useEffect(() => {
    if (!show || view !== "longitudinal") return;
    void loadLongitudinal();
  }, [show, view, loadLongitudinal]);

  if (!show) return null;

  const activePeriod = periods.find((p) => p.period_id === activePeriodId);

  return (
    <Card>
      <p className="text-cx-label uppercase">GME · Milestones</p>
      <h3 className="mt-1 text-lg font-semibold text-cx-forest-dark">My milestone heatmap</h3>
      <p className="mt-2 text-sm text-cx-forest-dark/75">
        MedHub outpatient form subcompetencies vs PGY {pgyLevel ?? "—"} expected levels. Faculty
        ratings take precedence over self-ratings when both exist.
      </p>

      {prite && (
        <p className="mt-2 text-xs text-cx-forest-dark/60">
          Latest PRITE ({prite.exam_year}): {prite.overall_percentile ?? "—"}th percentile
        </p>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          variant={view === "current" ? "primary" : "secondary"}
          onClick={() => setView("current")}
        >
          Current period
        </Button>
        <Button
          variant={view === "longitudinal" ? "primary" : "secondary"}
          onClick={() => setView("longitudinal")}
        >
          Over time
        </Button>
        <Button variant="secondary" onClick={() => void load()} disabled={loading}>
          {loading ? "Loading…" : "Refresh"}
        </Button>
      </div>

      {view === "longitudinal" && periods.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {periods.map((period) => (
            <Button
              key={period.period_id}
              variant={period.period_id === activePeriodId ? "primary" : "secondary"}
              onClick={() => setActivePeriodId(period.period_id)}
            >
              {period.period_label}
              <span className="ml-1 text-[10px] opacity-70">
                ({period.rated_count}/{period.total_count})
              </span>
            </Button>
          ))}
        </div>
      )}

      {view === "current" && <HeatmapGrid cells={cells} />}
      {view === "longitudinal" && activePeriod && (
        <>
          <p className="mt-3 text-xs text-cx-forest-dark/60">
            {activePeriod.period_label}: {activePeriod.rated_count} of {activePeriod.total_count}{" "}
            subcompetencies rated
          </p>
          <HeatmapGrid cells={activePeriod.cells} />
        </>
      )}
    </Card>
  );
}

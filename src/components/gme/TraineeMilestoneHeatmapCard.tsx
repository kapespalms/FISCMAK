"use client";

import { useCallback, useEffect, useState } from "react";
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

export function TraineeMilestoneHeatmapCard() {
  const [show, setShow] = useState(false);
  const [cells, setCells] = useState<HeatmapCell[]>([]);
  const [pgyLevel, setPgyLevel] = useState<string | null>(null);
  const [prite, setPrite] = useState<{ exam_year: number; overall_percentile: number | null } | null>(
    null,
  );
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
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

  useEffect(() => {
    fetch("/api/v1/onboarding/touchpoint1")
      .then((r) => r.json())
      .then((data) => {
        if (data.onboarding?.onboarding_path === "institutional") {
          setShow(true);
          void load();
        }
      })
      .catch(() => undefined);
  }, [load]);

  if (!show) return null;

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

      <Button className="mt-3" variant="secondary" onClick={() => void load()} disabled={loading}>
        {loading ? "Loading…" : "Refresh heatmap"}
      </Button>

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
    </Card>
  );
}

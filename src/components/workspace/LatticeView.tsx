"use client";

import { useCallback, useEffect, useState } from "react";
import { LatticeGrid } from "@/components/lattice/LatticeGrid";
import { fetchActivities } from "@/lib/activities-storage";
import { activitiesToLatticeCells } from "@/lib/lattice";
import { getDemoLatticeCells } from "@/lib/demo-data";
import type { LatticeCellState } from "@/lib/constants";

export function LatticeView() {
  const [cells, setCells] = useState<LatticeCellState[]>(getDemoLatticeCells());
  const [usingLive, setUsingLive] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const activities = await fetchActivities();
    if (activities.length > 0) {
      setCells(activitiesToLatticeCells(activities));
      setUsingLive(true);
    } else {
      setCells(getDemoLatticeCells());
      setUsingLive(false);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
    const onUpdate = () => void load();
    window.addEventListener("fiscmak:activity-logged", onUpdate);
    window.addEventListener("fiscmak:touchpoint-complete", onUpdate);
    return () => {
      window.removeEventListener("fiscmak:activity-logged", onUpdate);
      window.removeEventListener("fiscmak:touchpoint-complete", onUpdate);
    };
  }, [load]);

  return (
    <div className="space-y-4">
      <p className="text-sm text-cx-text-secondary">
        8 domains × 8 tracks
        {usingLive
          ? " · Live from your activities"
          : " · Demo data (log activities to populate)"}
      </p>
      {loading ? (
        <p className="text-cx-text-secondary">Loading lattice…</p>
      ) : (
        <LatticeGrid cells={cells} />
      )}
    </div>
  );
}

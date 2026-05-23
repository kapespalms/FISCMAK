"use client";

import { useCallback, useEffect, useState } from "react";
import { Grid3x3 } from "lucide-react";
import { CardSection } from "@/components/ui/CardSection";
import { LatticeGrid } from "@/components/lattice/LatticeGrid";
import { fetchActivities } from "@/lib/activities-storage";
import { activitiesToLatticeCells } from "@/lib/lattice";
import { getDemoLatticeCells } from "@/lib/demo-data";
import { LATTICE_MAK } from "@/lib/card-mak-prompts";
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
      <CardSection
        compact
        eyebrow="Career Map"
        title="8 domains × 8 tracks"
        description={
          usingLive
            ? "Live from your logged activities."
            : "Demo data — log activities to populate your map."
        }
        icon={Grid3x3}
        mak={LATTICE_MAK.overview}
      />
      {loading ? (
        <p className="text-sm text-cx-forest-dark/70">Loading lattice…</p>
      ) : (
        <LatticeGrid cells={cells} />
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { LatticeGrid } from "@/components/lattice/LatticeGrid";
import { getDemoLatticeCells } from "@/lib/demo-data";
import { activitiesToLatticeCells } from "@/lib/lattice";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { ActivityEntry } from "@/lib/types/database";
import type { LatticeCellState } from "@/lib/constants";

export default function LatticePage() {
  const [cells, setCells] = useState<LatticeCellState[]>(getDemoLatticeCells());
  const [usingLive, setUsingLive] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setCells(getDemoLatticeCells());
      setUsingLive(false);
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("activity_entries")
      .select("*")
      .eq("user_id", user.id);

    const activities = (data as ActivityEntry[]) ?? [];
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
    load();
  }, [load]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Career lattice</h1>
        <p className="mt-1 text-fiscmak-muted">
          8 domains × 8 tracks
          {usingLive
            ? " · Live from your activities"
            : " · Demo data (log activities to populate)"}
        </p>
      </div>
      {loading ? (
        <p className="text-fiscmak-muted">Loading lattice…</p>
      ) : (
        <LatticeGrid cells={cells} />
      )}
    </div>
  );
}

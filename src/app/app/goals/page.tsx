"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { GoalHorizonCard } from "@/components/goals/GoalHorizonCard";
import { GoalFormModal } from "@/components/goals/GoalFormModal";
import { PathwaysExplorer } from "@/components/workspace/PathwaysExplorer";
import { useAppShell } from "@/components/layout/AppShell";
import type {
  GoalHorizon,
  GoalRecord,
  GoalsByHorizon,
} from "@/lib/v2/goal-records";
import { HORIZON_ORDER } from "@/lib/v2/goal-records";

const EMPTY_BY_HORIZON: GoalsByHorizon = {
  "3mo": [], "1yr": [], "5yr": [], "10yr": [],
};

type ModalState = { horizon: GoalHorizon; existing?: GoalRecord } | null;

function GoalsContent() {
  const router          = useRouter();
  const params          = useSearchParams();
  const view            = (params.get("view") ?? "goals") as "goals" | "directions";
  const { startMakFlow } = useAppShell();

  const [byHorizon, setByHorizon] = useState<GoalsByHorizon>(EMPTY_BY_HORIZON);
  const [loading,   setLoading]   = useState(true);
  const [migrationPending, setMigrationPending] = useState(false);
  const [modal, setModal] = useState<ModalState>(null);

  const loadGoals = useCallback(async () => {
    try {
      const res  = await fetch("/api/v1/goals/horizons");
      const data = (await res.json()) as { goals?: GoalsByHorizon; migration_pending?: boolean };
      if (data.migration_pending) setMigrationPending(true);
      setByHorizon(data.goals ?? EMPTY_BY_HORIZON);
    } catch { /* non-blocking */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { void loadGoals(); }, [loadGoals]);

  function setView(v: "goals" | "directions") {
    const p = new URLSearchParams(params.toString());
    p.set("view", v);
    router.replace(`/app/goals?${p.toString()}`);
  }

  function handleSaved(goal: GoalRecord) {
    setByHorizon((prev) => {
      const h = goal.horizon;
      const existing = prev[h].find((g) => g.id === goal.id);
      return {
        ...prev,
        [h]: existing
          ? prev[h].map((g) => (g.id === goal.id ? goal : g))
          : [...prev[h], goal],
      };
    });
    setModal(null);
  }

  async function handleDelete(id: string, horizon: GoalHorizon) {
    if (!confirm("Delete this goal?")) return;
    await fetch(`/api/v1/goals/horizons/${id}`, { method: "DELETE" });
    setByHorizon((prev) => ({
      ...prev,
      [horizon]: prev[horizon].filter((g) => g.id !== id),
    }));
  }

  return (
    <div className="space-y-5">
      {/* Header + Goals | Directions toggle */}
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-cx-text">Goals</h1>
        <div className="flex gap-0.5 rounded-lg border border-cx-forest-dark/10 bg-white/60 p-0.5">
          {(["goals", "directions"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={cn(
                "rounded-md px-4 py-1.5 text-xs font-medium transition-colors capitalize",
                view === v
                  ? "bg-cx-forest-dark text-white"
                  : "text-cx-text/70 hover:bg-cx-forest-dark/5",
              )}
            >
              {v}
            </button>
          ))}
        </div>
        {view === "goals" && (
          <button
            type="button"
            onClick={() => startMakFlow("si_probe")}
            className="ml-auto rounded-lg border border-cx-forest-dark/15 px-3 py-1.5 text-xs text-cx-text/60 transition-colors hover:border-fis-gold/40 hover:bg-fis-gold/5 hover:text-fis-gold"
          >
            Reflect with Mak
          </button>
        )}
      </div>

      {migrationPending && (
        <div className="rounded-xl border border-fis-gold/30 bg-fis-gold/5 px-4 py-3 text-xs text-cx-text/70">
          Goal records migration not yet applied — goals will save once migration 20260539 is run.
          You can still set goals; they&apos;ll persist after migration.
        </div>
      )}

      {view === "goals" ? (
        loading ? (
          <div className="grid gap-4 md:grid-cols-2">
            {HORIZON_ORDER.map((h) => (
              <div key={h} className="h-48 animate-pulse rounded-2xl bg-neutral-100" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {HORIZON_ORDER.map((horizon) => (
              <GoalHorizonCard
                key={horizon}
                horizon={horizon}
                goals={byHorizon[horizon]}
                onAdd={() => setModal({ horizon })}
                onEdit={(goal) => setModal({ horizon, existing: goal })}
                onDelete={(id) => void handleDelete(id, horizon)}
              />
            ))}
          </div>
        )
      ) : (
        <PathwaysExplorer embedded />
      )}

      {modal && (
        <GoalFormModal
          horizon={modal.horizon}
          existing={modal.existing}
          onSave={handleSaved}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

export default function GoalsPage() {
  return (
    <Suspense fallback={<div className="text-sm text-cx-text/50">Loading…</div>}>
      <GoalsContent />
    </Suspense>
  );
}

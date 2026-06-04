"use client";

import { Pencil, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GoalHorizon, GoalRecord } from "@/lib/v2/goal-records";
import { HORIZON_FRAMEWORK, HORIZON_LABELS } from "@/lib/v2/goal-records";

// ── Horizon metadata ────────────────────────────────────────────────────────

const HORIZON_DESCRIPTIONS: Record<GoalHorizon, string> = {
  "3mo":  "What will you accomplish in the next 90 days?",
  "1yr":  "Where will you be a year from now?",
  "5yr":  "What do you deeply want your career to look like?",
  "10yr": "What is your professional legacy?",
};

const FRAMEWORK_BADGE: Record<string, string> = {
  SMART:    "SMART",
  SMART_II: "SMART + II",
  WOOP:     "WOOP",
  legacy:   "Legacy",
};

// ── Goal content display ────────────────────────────────────────────────────

function GoalContent({ goal }: { goal: GoalRecord }) {
  const fw = goal.framework;

  if (fw === "WOOP") {
    return (
      <div className="space-y-2 text-sm">
        {goal.wish && (
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-cx-forest-dark/40">Wish</span>
            <p className="mt-0.5 text-cx-forest-dark">{goal.wish}</p>
          </div>
        )}
        {goal.outcome && (
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-cx-forest-dark/40">Outcome</span>
            <p className="mt-0.5 text-cx-forest-dark/80">{goal.outcome}</p>
          </div>
        )}
        {goal.obstacle && (
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-cx-forest-dark/40">Obstacle</span>
            <p className="mt-0.5 text-cx-forest-dark/70">{goal.obstacle}</p>
          </div>
        )}
        {goal.plan && (
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-cx-forest-dark/40">Plan</span>
            <p className="mt-0.5 text-cx-forest-dark/70">{goal.plan}</p>
          </div>
        )}
      </div>
    );
  }

  if (fw === "legacy") {
    return (
      <p className="text-sm italic text-cx-forest-dark/80">
        {goal.description ?? "(no statement yet)"}
      </p>
    );
  }

  // SMART / SMART_II
  const rows: { label: string; value: string | null }[] = [
    { label: "Specific",   value: goal.specific },
    { label: "Measurable", value: goal.measurable },
    { label: "Achievable", value: goal.achievable },
    { label: "Relevant",   value: goal.relevant },
    { label: "Time-bound", value: goal.time_bound },
  ];
  if (fw === "SMART_II" && goal.implementation_intention) {
    rows.push({ label: "When / then", value: goal.implementation_intention });
  }

  return (
    <div className="space-y-1.5">
      {rows.map(({ label, value }) =>
        value ? (
          <div key={label} className="flex gap-2 text-sm">
            <span className="w-20 shrink-0 text-[10px] font-semibold uppercase tracking-wide text-cx-forest-dark/40 pt-0.5">
              {label}
            </span>
            <span className="text-cx-forest-dark/80">{value}</span>
          </div>
        ) : null,
      )}
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────

type Props = {
  horizon:   GoalHorizon;
  goals:     GoalRecord[];
  onAdd:     () => void;
  onEdit:    (goal: GoalRecord) => void;
  onDelete:  (id: string) => void;
};

export function GoalHorizonCard({ horizon, goals, onAdd, onEdit, onDelete }: Props) {
  const framework = HORIZON_FRAMEWORK[horizon];
  const hasGoals  = goals.length > 0;

  // Horizon color accent (left border)
  const borderColor =
    horizon === "3mo"  ? "border-l-fis-gold"   :
    horizon === "1yr"  ? "border-l-[#6E93B8]"  :
    horizon === "5yr"  ? "border-l-[#E7DEC9]"  : // sand — fis-green reserved for aliveness only
                         "border-l-[#9A968C]";

  return (
    <div className={cn(
      "flex flex-col rounded-2xl border border-cx-forest-dark/10 bg-white shadow-sm",
      "border-l-4", borderColor,
    )}>
      {/* Header */}
      <div className="flex items-start justify-between px-5 pt-5 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold text-cx-forest-dark">
              {HORIZON_LABELS[horizon]}
            </h2>
            <span className="rounded-full bg-fis-gold/10 px-2 py-0.5 text-[10px] font-medium text-fis-gold">
              {FRAMEWORK_BADGE[framework]}
            </span>
          </div>
          <p className="mt-0.5 text-[11px] text-cx-forest-dark/50">
            {HORIZON_DESCRIPTIONS[horizon]}
          </p>
        </div>
        {!hasGoals && (
          <button
            type="button"
            onClick={onAdd}
            className="flex items-center gap-1.5 rounded-lg border border-fis-gold/30 px-3 py-1.5 text-xs font-medium text-fis-gold transition-colors hover:bg-fis-gold/10"
          >
            <Plus size={13} />
            Add
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 px-5 pb-5">
        {hasGoals ? (
          <div className="space-y-4">
            {goals.map((goal) => (
              <div key={goal.id} className="group">
                <GoalContent goal={goal} />
                <div className="mt-3 flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => onEdit(goal)}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-cx-forest-dark/50 transition-colors hover:bg-neutral-100 hover:text-cx-forest-dark"
                  >
                    <Pencil size={12} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(goal.id)}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-cx-forest-dark/50 transition-colors hover:bg-[#C28D6C]/10 hover:text-[#C28D6C]"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                  <button
                    type="button"
                    onClick={onAdd}
                    className="ml-auto flex items-center gap-1.5 rounded-lg border border-fis-gold/30 px-2.5 py-1.5 text-xs font-medium text-fis-gold transition-colors hover:bg-fis-gold/10"
                  >
                    <Plus size={12} />
                    Add another
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <button
            type="button"
            onClick={onAdd}
            className="flex w-full flex-col items-center gap-1.5 rounded-xl border border-dashed border-cx-forest-dark/15 py-8 text-center transition-colors hover:border-fis-gold/40 hover:bg-fis-gold/5"
          >
            <Plus size={16} className="text-fis-gold/60" />
            <span className="text-xs text-cx-forest-dark/50">
              {HORIZON_DESCRIPTIONS[horizon]}
            </span>
            <span className="text-xs font-medium text-fis-gold">Set goal</span>
          </button>
        )}
      </div>
    </div>
  );
}

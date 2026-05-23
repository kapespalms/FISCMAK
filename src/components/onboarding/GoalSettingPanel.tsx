"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusChip } from "@/components/ui/StatusChip";
import { GOAL_FRAMEWORK_LABELS, type GoalFrameworkType } from "@/lib/v2/soap-tab-spec";
import {
  GOAL_MODIFY_PROMPT,
  GOAL_REPLACE_PROMPT,
  type StructuredGoal,
  defaultStructuredGoals,
} from "@/lib/v2/goal-framework";

export type ProposedGoal = {
  type: GoalFrameworkType;
  title: string;
  rationale: string;
  milestones: string[];
  progress?: number;
  status?: "strong" | "developing" | "needs_attention" | "stable";
  latticeCells?: string[];
  invisibleWorkTargets?: string[];
};

type GoalSettingPanelProps = {
  goals: ProposedGoal[];
  onConfirm: (goals: ProposedGoal[]) => void;
  onModifyWithMak?: (goalType: GoalFrameworkType) => void;
  loading?: boolean;
};

function structuredToProposed(goals: StructuredGoal[]): ProposedGoal[] {
  return goals.map((g) => ({
    type: g.type,
    title: g.title,
    rationale: g.rationale,
    milestones: g.milestones.map((m) => {
      const prefix = m.status === "completed" ? "✓" : "☐";
      return `${prefix} ${m.quarter}: ${m.label}`;
    }),
    progress: g.progress,
    status:
      g.type === "sustainability"
        ? "needs_attention"
        : g.type === "maintenance"
          ? "strong"
          : "developing",
    latticeCells: g.latticeCells,
    invisibleWorkTargets: g.invisibleWorkTargets,
  }));
}

export function GoalSettingPanel({
  goals: initial,
  onConfirm,
  onModifyWithMak,
  loading,
}: GoalSettingPanelProps) {
  const [goals, setGoals] = useState(initial);
  const [modifyType, setModifyType] = useState<GoalFrameworkType | null>(null);
  const [replaceText, setReplaceText] = useState("");

  function toggleMilestone(goalIndex: number, milestoneIndex: number) {
    setGoals((prev) =>
      prev.map((g, gi) => {
        if (gi !== goalIndex) return g;
        const milestones = [...g.milestones];
        const line = milestones[milestoneIndex];
        if (line.startsWith("✓")) {
          milestones[milestoneIndex] = line.replace(/^✓\s*/, "☐ ");
        } else if (line.startsWith("☐")) {
          milestones[milestoneIndex] = line.replace(/^☐\s*/, "✓ ");
        }
        return { ...g, milestones };
      }),
    );
  }

  return (
    <Card>
      <p className="text-xs font-semibold uppercase text-fiscmak-muted">Step 7 of 7</p>
      <h1 className="mt-1 text-page-title">Career Strategy</h1>
      <p className="mt-2 text-sm text-fiscmak-muted">
        Based on your Career Profile, the platform suggests three goals — Development,
        Maintenance, and Sustainability — each with quarterly SMART milestones. Review each
        and confirm, modify, or replace.
      </p>
      <div className="mt-6 space-y-4">
        {goals.map((goal, gi) => (
          <div
            key={goal.type}
            className="rounded-xl border border-fiscmak-border bg-fm-surface p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-data-label">{GOAL_FRAMEWORK_LABELS[goal.type].label}</p>
              {goal.status && <StatusChip status={goal.status} />}
            </div>
            <h3 className="mt-2 font-semibold">{goal.title}</h3>
            <p className="mt-2 text-sm text-fiscmak-muted">
              <span className="font-medium text-fiscmak-ink">Rationale: </span>
              {goal.rationale}
            </p>
            {goal.progress != null && (
              <p className="mt-2 text-sm">Progress: {goal.progress}%</p>
            )}
            {goal.latticeCells && goal.latticeCells.length > 0 && (
              <p className="mt-2 text-caption">
                Lattice cells: {goal.latticeCells.join("; ")}
              </p>
            )}
            {goal.invisibleWorkTargets && goal.invisibleWorkTargets.length > 0 && (
              <p className="mt-2 text-caption">
                Invisible work targeted: {goal.invisibleWorkTargets.join("; ")}
              </p>
            )}
            <ul className="mt-3 space-y-1 text-sm">
              {goal.milestones.map((m, mi) => (
                <li key={m}>
                  <button
                    type="button"
                    className="text-left hover:text-fm-accent"
                    onClick={() => toggleMilestone(gi, mi)}
                  >
                    {m}
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="secondary"
                className="text-xs"
                onClick={() => setModifyType(goal.type)}
              >
                Modify
              </Button>
              <Button
                variant="secondary"
                className="text-xs"
                onClick={() => {
                  setModifyType(goal.type);
                  setReplaceText("");
                }}
              >
                Replace with my own
              </Button>
            </div>
            {modifyType === goal.type && (
              <div className="mt-4 rounded-lg border border-fiscmak-border bg-white p-4 text-sm">
                <p className="whitespace-pre-line text-fiscmak-muted">{GOAL_MODIFY_PROMPT}</p>
                <textarea
                  className="mt-3 w-full rounded-md border border-fiscmak-border p-3 text-sm"
                  rows={2}
                  placeholder={GOAL_REPLACE_PROMPT}
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                />
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="secondary"
                    className="text-xs"
                    onClick={() => onModifyWithMak?.(goal.type)}
                  >
                    Refine with Coach Mak
                  </Button>
                  <Button
                    variant="secondary"
                    className="text-xs"
                    onClick={() => setModifyType(null)}
                  >
                    Done
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <Button className="mt-6 w-full" disabled={loading} onClick={() => onConfirm(goals)}>
        {loading ? "Saving goals…" : "Confirm goals and open dashboard"}
      </Button>
    </Card>
  );
}

export function defaultProposedGoals(input: {
  primaryTrack?: string | null;
  careerObjective?: string | null;
  sustainabilityNote?: string | null;
  unreasonableTaskScore?: number | null;
  unrecognizedWorkHours?: number | null;
}): ProposedGoal[] {
  return structuredToProposed(
    defaultStructuredGoals({
      careerObjective: input.careerObjective,
      primaryTrack: input.primaryTrack,
      unreasonableTaskScore: input.unreasonableTaskScore,
      unrecognizedWorkHours: input.unrecognizedWorkHours,
    }),
  );
}

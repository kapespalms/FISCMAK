"use client";

import { useState } from "react";
import { Check, Square } from "lucide-react";
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

const DONE_PREFIX = "[x] ";
const TODO_PREFIX = "[ ] ";

function parseMilestone(line: string) {
  if (line.startsWith(DONE_PREFIX)) {
    return { done: true, text: line.slice(DONE_PREFIX.length) };
  }
  if (line.startsWith(TODO_PREFIX)) {
    return { done: false, text: line.slice(TODO_PREFIX.length) };
  }
  return { done: false, text: line.replace(/^[✓☐]\s*/, "") };
}

function formatMilestone(done: boolean, text: string) {
  return `${done ? DONE_PREFIX : TODO_PREFIX}${text}`;
}

function structuredToProposed(goals: StructuredGoal[]): ProposedGoal[] {
  return goals.map((g) => ({
    type: g.type,
    title: g.title,
    rationale: g.rationale,
    milestones: g.milestones.map((m) =>
      formatMilestone(m.status === "completed", `${m.quarter}: ${m.label}`),
    ),
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
        const { done, text } = parseMilestone(milestones[milestoneIndex]);
        milestones[milestoneIndex] = formatMilestone(!done, text);
        return { ...g, milestones };
      }),
    );
  }

  return (
    <Card>
      <p className="text-cx-label uppercase">Step 7 of 7</p>
      <h1 className="mt-1 text-page-title">Career Strategy</h1>
      <p className="mt-2 text-cx-body">
        Based on your Career Profile, the platform suggests three goals — Development,
        Maintenance, and Sustainability — each with quarterly SMART milestones. Review each
        and confirm, modify, or replace.
      </p>
      <div className="mt-6 space-y-4">
        {goals.map((goal, gi) => (
          <div
            key={goal.type}
            className="rounded-2xl border border-cx-border bg-cx-white p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-cx-label uppercase">{GOAL_FRAMEWORK_LABELS[goal.type].label}</p>
              {goal.status && <StatusChip status={goal.status} />}
            </div>
            <h3 className="mt-2 font-semibold text-cx-text">{goal.title}</h3>
            <p className="mt-2 text-cx-body">
              <span className="font-medium text-cx-text">Rationale: </span>
              {goal.rationale}
            </p>
            {goal.progress != null && (
              <p className="mt-2 text-sm text-cx-text">Progress: {goal.progress}%</p>
            )}
            {goal.latticeCells && goal.latticeCells.length > 0 && (
              <p className="mt-2 text-cx-label">
                Lattice cells: {goal.latticeCells.join("; ")}
              </p>
            )}
            {goal.invisibleWorkTargets && goal.invisibleWorkTargets.length > 0 && (
              <p className="mt-2 text-cx-label">
                Invisible work targeted: {goal.invisibleWorkTargets.join("; ")}
              </p>
            )}
            <ul className="mt-3 space-y-2 text-sm">
              {goal.milestones.map((m, mi) => {
                const { done, text } = parseMilestone(m);
                return (
                  <li key={m}>
                    <button
                      type="button"
                      className="flex items-start gap-2 text-left text-cx-text hover:text-cx-primary"
                      onClick={() => toggleMilestone(gi, mi)}
                    >
                      {done ? (
                        <Check size={16} className="mt-0.5 shrink-0 text-cx-success" />
                      ) : (
                        <Square size={16} className="mt-0.5 shrink-0 text-cx-text-secondary" />
                      )}
                      <span>{text}</span>
                    </button>
                  </li>
                );
              })}
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
              <div className="mt-4 rounded-xl border border-cx-border bg-cx-white p-4 text-sm">
                <p className="whitespace-pre-line text-cx-body">{GOAL_MODIFY_PROMPT}</p>
                <textarea
                  className="mt-3 w-full rounded-xl border border-cx-border p-3 text-sm"
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

"use client";

import { useState } from "react";
import { ChevronDown, Pencil, Trash2 } from "lucide-react";
import { CardSection } from "@/components/ui/CardSection";
import { GOAL_FRAMEWORK_LABELS, type GoalFrameworkType } from "@/lib/v2/soap-tab-spec";
import type { StructuredGoal } from "@/lib/v2/goal-framework";
import type { CareerGoal } from "@/lib/goals";
import {
  findCurrentMilestoneIndex,
  type MilestoneStatus,
} from "@/lib/v2/goal-milestone-actions";
import { PLAN_MAK } from "@/lib/card-mak-prompts";
import { cn } from "@/lib/utils";

type CareerStrategyGoalCardProps = {
  goal: CareerGoal;
  structured: StructuredGoal | null;
  updating: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMilestoneStatus: (milestoneIndex: number, status: MilestoneStatus) => void;
};

const MILESTONE_STATUSES: MilestoneStatus[] = [
  "completed",
  "in_progress",
  "not_started",
  "deferred",
];

function frameworkType(goal: CareerGoal): GoalFrameworkType | null {
  const t = goal.goal_type;
  if (t === "development" || t === "maintenance" || t === "sustainability") return t;
  return null;
}

export function CareerStrategyGoalCard({
  goal,
  structured,
  updating,
  onEdit,
  onDelete,
  onMilestoneStatus,
}: CareerStrategyGoalCardProps) {
  const [milestonesOpen, setMilestonesOpen] = useState(false);
  const type = frameworkType(goal);
  const label = type ? GOAL_FRAMEWORK_LABELS[type].label : "Goal";
  const progress = structured?.progress ?? 0;
  const milestoneIndex = findCurrentMilestoneIndex(goal);
  const currentMilestone =
    structured?.milestones.find((m) => m.status === "in_progress") ??
    structured?.milestones.find((m) => m.status === "pending");

  const makConfig = { ...PLAN_MAK.goal(label, goal.goal_title, goal.id), label: "Refine with Mak" };

  return (
    <CardSection
      eyebrow={label}
      title={goal.goal_title}
      description={goal.goal_description ?? undefined}
      mak={makConfig}
      action={<p className="text-sm font-semibold text-[#5FD65F]">{progress}%</p>}
      footer={
        <>
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-1 text-sm text-cx-forest-dark hover:text-cx-forest-dark/80"
          >
            <Pencil size={14} /> Edit
          </button>
          {!type && (
            <button
              type="button"
              onClick={onDelete}
              className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
            >
              <Trash2 size={14} /> Delete
            </button>
          )}
        </>
      }
    >
      <div className="h-2 overflow-hidden rounded-full bg-cx-forest-dark/10">
        <div
          className="h-full rounded-full bg-cx-forest-dark"
          style={{ width: `${Math.max(progress, 4)}%` }}
        />
      </div>

      {currentMilestone && (
        <div className="mt-4 rounded-xl border border-cx-forest-dark/15 bg-cx-forest-dark/[0.03] p-3">
          <p className="text-xs font-medium text-cx-forest-dark/70">This quarter</p>
          <p className="mt-1 text-sm text-cx-forest-dark">{currentMilestone.label}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {MILESTONE_STATUSES.map((status) => (
              <button
                key={status}
                type="button"
                disabled={updating}
                onClick={() => onMilestoneStatus(milestoneIndex, status)}
                className="rounded-full border border-cx-forest-dark/20 bg-white px-2.5 py-1 text-xs capitalize text-cx-forest-dark transition-colors hover:border-cx-forest-dark/40 disabled:opacity-50"
              >
                {status.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      )}

      {(goal.recommended_actions?.length ?? 0) > 0 && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setMilestonesOpen((o) => !o)}
            className="flex items-center gap-1 text-xs font-medium text-cx-forest-dark/70 hover:text-cx-forest-dark"
          >
            <ChevronDown
              size={14}
              className={cn("transition-transform", milestonesOpen && "rotate-180")}
            />
            All milestones ({goal.recommended_actions?.length})
          </button>
          {milestonesOpen && (
            <ul className="mt-2 space-y-1 text-sm text-cx-forest-dark/70">
              {goal.recommended_actions!.map((item) => (
                <li key={item} className="leading-snug">
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </CardSection>
  );
}

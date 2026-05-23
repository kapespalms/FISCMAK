import type { CareerGoal } from "@/lib/goals";

export type MilestoneStatus = "completed" | "in_progress" | "deferred" | "not_started";

function stripMilestoneSuffix(action: string): string {
  return action.replace(/\s*—\s*(COMPLETED|DEFERRED).*$/i, "").trim();
}

export function findCurrentMilestoneIndex(goal: CareerGoal): number {
  const actions = goal.recommended_actions ?? [];
  const open = actions.findIndex((a) => !/COMPLETED/i.test(a) && !/DEFERRED/i.test(a));
  if (open >= 0) return open;
  return Math.max(0, actions.length - 1);
}

export function applyMilestoneStatus(
  goal: CareerGoal,
  milestoneIndex: number,
  status: MilestoneStatus,
): CareerGoal {
  const actions = [...(goal.recommended_actions ?? [])];
  if (milestoneIndex < 0 || milestoneIndex >= actions.length) return goal;

  const base = stripMilestoneSuffix(actions[milestoneIndex]);

  if (status === "completed") {
    actions[milestoneIndex] = `${base} — COMPLETED`;
  } else if (status === "deferred") {
    actions[milestoneIndex] = `${base} — DEFERRED to next quarter`;
  } else if (status === "in_progress") {
    actions[milestoneIndex] = base;
  } else {
    actions[milestoneIndex] = base;
  }

  return {
    ...goal,
    recommended_actions: actions,
    updated_at: new Date().toISOString(),
  };
}

export function milestoneProgressPercent(goal: CareerGoal): number {
  const actions = goal.recommended_actions ?? [];
  if (!actions.length) return 0;
  const completed = actions.filter((a) => /COMPLETED/i.test(a)).length;
  return Math.round((completed / actions.length) * 100);
}

import type { CareerGoal } from "@/lib/goals";
import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";

export type GoalMilestoneQuarterSnapshot = {
  quarter: string;
  captured_at: string;
  goals: Array<{
    goal_id: string;
    goal_title: string;
    completed_count: number;
    total_count: number;
    percent: number;
  }>;
};

export type GoalProgressResult = {
  percent: number;
  stalled: boolean;
  stalledQuarters: number;
};

function currentQuarterLabel(): string {
  const now = new Date();
  return `Q${Math.floor(now.getMonth() / 3) + 1} ${now.getFullYear()}`;
}

function milestoneCounts(goal: CareerGoal): { completed: number; total: number; percent: number } {
  const actions = goal.recommended_actions ?? [];
  if (actions.length === 0) return { completed: 0, total: 0, percent: 0 };
  const completed = actions.filter((a) => /COMPLETED/i.test(a)).length;
  return {
    completed,
    total: actions.length,
    percent: Math.round((completed / actions.length) * 100),
  };
}

export function snapshotGoalMilestones(goals: CareerGoal[]): GoalMilestoneQuarterSnapshot {
  const active = goals.filter((g) => g.status === "active");
  return {
    quarter: currentQuarterLabel(),
    captured_at: new Date().toISOString(),
    goals: active.map((g) => {
      const counts = milestoneCounts(g);
      return {
        goal_id: g.id,
        goal_title: g.goal_title,
        completed_count: counts.completed,
        total_count: counts.total,
        percent: counts.percent,
      };
    }),
  };
}

export function updateGoalMilestoneHistory(
  meta: OnboardingMetadata,
  goals: CareerGoal[],
): OnboardingMetadata {
  const snapshot = snapshotGoalMilestones(goals);
  const history = meta.goal_milestone_history ?? [];
  const sameQuarter = history[0]?.quarter === snapshot.quarter;
  const nextHistory = sameQuarter
    ? [snapshot, ...history.slice(1)]
    : [snapshot, ...history].slice(0, 8);

  const stall = detectMostStalledGoal(nextHistory, goals);

  return {
    ...meta,
    goal_milestone_history: nextHistory,
    stalled_goal_quarters: stall?.stalledQuarters,
    stalled_goal_title: stall?.goalTitle ?? null,
    stalled_goal_id: stall?.goalId ?? null,
  };
}

export function detectMostStalledGoal(
  history: GoalMilestoneQuarterSnapshot[],
  goals: CareerGoal[],
): { goalId: string; goalTitle: string; stalledQuarters: number } | null {
  let worst: { goalId: string; goalTitle: string; stalledQuarters: number } | null = null;

  for (const goal of goals.filter((g) => g.status === "active")) {
    const result = computeGoalProgressWithHistory(goal, history);
    if (result.stalled && result.stalledQuarters >= 2) {
      if (!worst || result.stalledQuarters > worst.stalledQuarters) {
        worst = {
          goalId: goal.id,
          goalTitle: goal.goal_title,
          stalledQuarters: result.stalledQuarters,
        };
      }
    }
  }
  return worst;
}

export function computeGoalProgressWithHistory(
  goal: CareerGoal,
  history: GoalMilestoneQuarterSnapshot[] = [],
): GoalProgressResult {
  const { completed, total, percent } = milestoneCounts(goal);
  if (total === 0) return { percent: 0, stalled: false, stalledQuarters: 0 };

  const goalHistory = history
    .map((h) => h.goals.find((g) => g.goal_id === goal.id))
    .filter(Boolean) as GoalMilestoneQuarterSnapshot["goals"];

  let stalledQuarters = 0;
  if (goalHistory.length >= 2) {
    for (let i = 0; i < Math.min(2, goalHistory.length - 1); i++) {
      const current = goalHistory[i];
      const previous = goalHistory[i + 1];
      if (current && previous && current.completed_count <= previous.completed_count) {
        stalledQuarters += 1;
      } else {
        break;
      }
    }
  }

  const stalled = stalledQuarters >= 2 || (percent <= 30 && completed === 0 && goalHistory.length >= 2);
  return { percent, stalled, stalledQuarters: stalled ? Math.max(stalledQuarters, 2) : stalledQuarters };
}

export function computeGoalProgress(
  goal: CareerGoal,
  history?: GoalMilestoneQuarterSnapshot[],
): GoalProgressResult {
  return computeGoalProgressWithHistory(goal, history ?? []);
}

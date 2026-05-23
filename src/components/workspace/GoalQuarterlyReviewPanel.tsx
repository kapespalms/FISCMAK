"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusChip } from "@/components/ui/StatusChip";
import { GOAL_FRAMEWORK_LABELS } from "@/lib/v2/soap-tab-spec";
import {
  careerGoalsToStructuredGoals,
  milestoneStatusResponse,
  type StructuredGoal,
} from "@/lib/v2/goal-framework";
import { fetchGoals, saveDemoGoals, type CareerGoal } from "@/lib/goals";
import {
  findCurrentMilestoneIndex,
  type MilestoneStatus,
} from "@/lib/v2/goal-milestone-actions";

type GoalQuarterlyReviewPanelProps = {
  quarterLabel?: string;
  annualDue?: boolean;
  onDiscussWithMak?: () => void;
  onGoalsUpdated?: (goals: CareerGoal[]) => void;
};

function milestoneStatusChip(status: StructuredGoal["milestones"][0]["status"]) {
  if (status === "completed") return "strong" as const;
  if (status === "in_progress") return "developing" as const;
  if (status === "deferred") return "stable" as const;
  return "needs_attention" as const;
}

function currentQuarterLabel(): string {
  const now = new Date();
  return `Q${Math.floor(now.getMonth() / 3) + 1} ${now.getFullYear()}`;
}

export function GoalQuarterlyReviewPanel({
  quarterLabel = currentQuarterLabel(),
  annualDue = false,
  onDiscussWithMak,
  onGoalsUpdated,
}: GoalQuarterlyReviewPanelProps) {
  const [goals, setGoals] = useState<CareerGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchGoals();
      setGoals(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function updateMilestone(
    goalId: string,
    milestoneIndex: number,
    status: MilestoneStatus,
  ) {
    setUpdating(`${goalId}-${status}`);
    setError(null);
    try {
      const res = await fetch("/api/v1/goals/milestone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal_id: goalId, milestone_index: milestoneIndex, status }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Could not update milestone");
        return;
      }
      const next = (data.goals as CareerGoal[]) ?? goals;
      setGoals(next);
      saveDemoGoals(next);
      onGoalsUpdated?.(next);
    } catch {
      setError("Could not update milestone");
    } finally {
      setUpdating(null);
    }
  }

  const activeGoals = goals.filter((g) => g.status === "active");
  const structured = careerGoalsToStructuredGoals(activeGoals);

  if (loading) {
    return (
      <Card accent="amber">
        <p className="text-sm text-fiscmak-muted">Loading goal review…</p>
      </Card>
    );
  }

  return (
    <Card accent="amber">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-data-label">
            {annualDue ? "Annual goal reset" : `Quarterly goal review — ${quarterLabel}`}
          </p>
          <p className="mt-1 text-sm text-fiscmak-muted">
            {annualDue
              ? "Review all three goals for the year ahead. Mark milestones complete to sync progress across dashboard and Coach Mak."
              : "Review milestone status for each Development, Maintenance, and Sustainability objective."}
          </p>
        </div>
        {onDiscussWithMak && (
          <Button variant="secondary" onClick={onDiscussWithMak}>
            Review with Coach Mak
          </Button>
        )}
      </div>

      {error && (
        <p className="mt-3 text-sm text-fiscmak-red">{error}</p>
      )}

      <div className="mt-4 space-y-4">
        {structured.map((goal, index) => {
          const sourceGoal = activeGoals[index];
          const goalId = sourceGoal?.id;
          const milestoneIndex = sourceGoal
            ? findCurrentMilestoneIndex(sourceGoal)
            : 0;
          const due =
            goal.milestones.find((m) => m.status === "in_progress") ??
            goal.milestones.find((m) => m.status === "pending");

          return (
            <div
              key={goal.type}
              className="rounded-lg border border-fiscmak-border bg-white p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-data-label">
                  {GOAL_FRAMEWORK_LABELS[goal.type].label}
                </p>
                <StatusChip
                  status={
                    goal.progress >= 70
                      ? "strong"
                      : goal.progress >= 40
                        ? "developing"
                        : "needs_attention"
                  }
                />
              </div>
              <h3 className="mt-1 font-semibold">{goal.title}</h3>
              <p className="mt-1 text-sm">Progress: {goal.progress}%</p>
              {due && goalId && (
                <div className="mt-3">
                  <p className="text-xs font-semibold uppercase text-fiscmak-muted">
                    Milestone due this quarter
                  </p>
                  <p className="mt-1 text-sm">{due.label}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {(["completed", "in_progress", "not_started", "deferred"] as const).map(
                      (status) => (
                        <button
                          key={status}
                          type="button"
                          disabled={updating != null}
                          title={milestoneStatusResponse(
                            status === "not_started" ? "not_started" : status,
                            goal.title,
                          )}
                          onClick={() =>
                            void updateMilestone(goalId, milestoneIndex, status)
                          }
                          className="rounded-full border border-fiscmak-border px-2 py-0.5 text-xs capitalize transition-colors hover:border-fiscmak-green hover:bg-fiscmak-green-light disabled:opacity-50"
                        >
                          {updating === `${goalId}-${status}` ? "Saving…" : status.replace("_", " ")}
                        </button>
                      ),
                    )}
                  </div>
                  {due.status !== "pending" && (
                    <StatusChip
                      status={milestoneStatusChip(due.status)}
                      className="mt-2"
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

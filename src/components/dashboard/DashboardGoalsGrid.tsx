"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { GoalCardModel } from "@/lib/v2/dashboard-redesign";
import { cn } from "@/lib/utils";

type DashboardGoalCardProps = {
  goal: GoalCardModel;
  onStart: (goalId: string) => void;
  onDetails: (goalId: string) => void;
};

const borderColors = {
  primary: "border-l-cx-primary",
  attention: "border-l-cx-attention",
  success: "border-l-green-500",
};

const fillClasses = {
  primary: "cx-progress-fill-primary",
  attention: "cx-progress-fill-attention",
  success: "cx-progress-fill-success",
};

export function DashboardGoalCard({ goal, onStart, onDetails }: DashboardGoalCardProps) {
  return (
    <article
      className={cn(
        "cx-card flex h-[320px] w-full max-w-[280px] flex-col border-l-4",
        borderColors[goal.borderColor],
      )}
    >
      <span className="inline-flex w-fit rounded-md bg-cx-light-blue px-2 py-0.5 text-cx-label font-medium text-cx-primary">
        {goal.typeLabel}
      </span>

      <div className="mt-4">
        <div className="cx-progress-track">
          <div
            className={fillClasses[goal.fillColor]}
            style={{ width: `${Math.max(goal.percent, 4)}%` }}
          />
        </div>
        <p className="mt-2 text-sm text-cx-text">{goal.percent}%</p>
      </div>

      <h3 className="mt-4 line-clamp-2 text-cx-h3">{goal.title}</h3>

      <p className="mt-2 line-clamp-2 text-cx-label">
        Next: {goal.nextMilestone}
      </p>

      <div className="mt-auto flex flex-wrap gap-2 pt-4">
        <button
          type="button"
          onClick={() => onStart(goal.id)}
          className="inline-flex items-center gap-1 rounded-lg bg-cx-primary px-3 py-2 text-xs font-medium text-white hover:opacity-90"
        >
          → Start
        </button>
        <button
          type="button"
          onClick={() => onDetails(goal.id)}
          className="rounded-lg border border-cx-border px-3 py-2 text-xs font-medium text-cx-text hover:bg-cx-cream"
        >
          Details
        </button>
      </div>

      {goal.stalled && (
        <p className="mt-3 text-cx-label text-cx-attention">⚠ Needs attention</p>
      )}
    </article>
  );
}

type DashboardGoalsGridProps = {
  goals: GoalCardModel[];
  onStart: (goalId: string) => void;
  onDetails: (goalId: string) => void;
};

export function DashboardGoalsGrid({ goals, onStart, onDetails }: DashboardGoalsGridProps) {
  if (goals.length === 0) {
    return (
      <section aria-labelledby="goals-heading">
        <h2 id="goals-heading" className="text-cx-h2">
          Your Goals
        </h2>
        <div className="cx-card mt-6">
          <p className="text-cx-body">No active goals yet.</p>
          <Link
            href="/app/plan"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-cx-primary hover:underline"
          >
            Set goals <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section aria-labelledby="goals-heading">
      <h2 id="goals-heading" className="text-cx-h2">
        Your Goals
      </h2>
      <div className="mt-6 grid justify-items-center gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {goals.map((goal) => (
          <DashboardGoalCard
            key={goal.id}
            goal={goal}
            onStart={onStart}
            onDetails={onDetails}
          />
        ))}
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import type { GoalCardModel } from "@/lib/v2/dashboard-redesign";
import { cn } from "@/lib/utils";

type DashboardGoalCardProps = {
  goal: GoalCardModel;
  compact?: boolean;
  nested?: boolean;
  hideActions?: boolean;
  onDetails?: (goalId: string) => void;
};

const borderColors = {
  primary: "border-l-cx-forest-dark",
  attention: "border-l-amber-500",
  success: "border-l-[#5FD65F]",
};

const fillClasses = {
  primary: "bg-cx-forest-dark",
  attention: "bg-amber-500",
  success: "bg-[#5FD65F]",
};

export function DashboardGoalCard({
  goal,
  compact = false,
  nested = false,
  hideActions = false,
  onDetails,
}: DashboardGoalCardProps) {
  return (
    <article
      className={cn(
        "flex w-full flex-col rounded-xl border border-cx-forest-dark/10 border-l-4",
        nested
          ? "bg-cx-forest-dark/[0.03] p-2.5 shadow-none"
          : cn("bg-white shadow-sm", compact ? "p-3" : "max-w-[280px] p-5"),
        borderColors[goal.borderColor],
      )}
    >
      <p className={cn("font-bold text-cx-forest-dark", compact ? "text-sm" : "text-lg")}>
        {goal.typeLabel}
      </p>

      <h3
        className={cn(
          "mt-1 line-clamp-2 font-semibold text-cx-forest-dark",
          compact ? "text-xs" : "text-base",
        )}
      >
        {goal.title}
      </h3>

      <div className={compact ? "mt-2" : "mt-4"}>
        <div className="flex items-center justify-between gap-2">
          <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-cx-forest-dark/10">
            <div
              className={cn("h-full rounded-full", fillClasses[goal.fillColor])}
              style={{ width: `${Math.max(goal.percent, 4)}%` }}
            />
          </div>
          <span className="shrink-0 text-xs font-semibold text-cx-forest-dark">{goal.percent}%</span>
        </div>
      </div>

      {goal.stalled && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-600">
          <StatusIndicator status="attention" size={14} />
          Needs attention
        </p>
      )}

      {!hideActions && onDetails && (
        <div className={cn("flex gap-2", compact ? "mt-2" : "mt-4")}>
          <button
            type="button"
            onClick={() => onDetails(goal.id)}
            className="rounded-full border border-cx-forest-dark/20 px-3 py-1.5 text-xs font-semibold text-cx-forest-dark hover:bg-cx-forest-dark/5"
          >
            Details
          </button>
        </div>
      )}
    </article>
  );
}

type DashboardGoalsGridProps = {
  goals: GoalCardModel[];
  onDetails?: (goalId: string) => void;
  variant?: "section" | "inline";
};

export function DashboardGoalsGrid({
  goals,
  onDetails,
  variant = "section",
}: DashboardGoalsGridProps) {
  const inline = variant === "inline";

  if (goals.length === 0) {
    if (inline) return null;
    return (
      <section aria-labelledby="goals-heading">
        <h2 id="goals-heading" className="text-xl font-semibold text-cx-forest-dark">
          Your Goals
        </h2>
        <div className="mt-6 rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-cx-forest-dark/70">No active goals yet.</p>
          <Link
            href="/app/plan"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-cx-forest-dark hover:underline"
          >
            Set goals <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    );
  }

  if (inline) {
    return (
      <div className="rounded-xl bg-white p-3 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-cx-forest-dark">Goals</h3>
          <Link
            href="/app/plan"
            className="inline-flex items-center gap-0.5 text-[10px] font-medium text-cx-forest-dark/70 hover:text-cx-forest-dark"
          >
            Strategy
            <ArrowRight size={12} />
          </Link>
        </div>
        <div className="mt-2 space-y-2">
          {goals.map((goal) => (
            <DashboardGoalCard key={goal.id} goal={goal} compact nested hideActions />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section aria-labelledby="goals-heading">
      <h2 id="goals-heading" className="text-xl font-semibold text-cx-forest-dark">
        Your Goals
      </h2>
      <div className="mt-6 grid justify-items-center gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {goals.map((goal) => (
          <DashboardGoalCard
            key={goal.id}
            goal={goal}
            onDetails={onDetails}
          />
        ))}
      </div>
    </section>
  );
}

"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CardSection } from "@/components/ui/CardSection";
import { Input } from "@/components/ui/Input";
import {
  type CareerGoal,
  type GoalFormData,
  GOAL_STATUSES,
  emptyGoalForm,
  formToGoalPayload,
  goalToForm,
  persistGoals,
} from "@/lib/goals";
import { SOAP_TAB, type GoalFrameworkType } from "@/lib/v2/soap-tab-spec";
import { careerGoalsToStructuredGoals } from "@/lib/v2/goal-framework";
import { PageShell } from "@/components/layout/PageShell";
import { CareerStrategyGoalCard } from "@/components/workspace/CareerStrategyGoalCard";
import { useAppShell } from "@/components/layout/AppShell";
import { useAnalytics } from "@/components/layout/AnalyticsProvider";
import { buildAnnualPlanResetGreeting } from "@/lib/mak-chatbot-states";
import { buildGoalSettingIntro } from "@/lib/v2/goal-setting-mak-flow";
import { PLAN_MAK } from "@/lib/card-mak-prompts";
import {
  type MilestoneStatus,
} from "@/lib/v2/goal-milestone-actions";

type GoalsWorkspaceProps = {
  embedded?: boolean;
};

const FRAMEWORK_ORDER: GoalFrameworkType[] = [
  "development",
  "maintenance",
  "sustainability",
];

function sortGoals(goals: CareerGoal[]): CareerGoal[] {
  return [...goals].sort((a, b) => {
    const ai = FRAMEWORK_ORDER.indexOf(a.goal_type as GoalFrameworkType);
    const bi = FRAMEWORK_ORDER.indexOf(b.goal_type as GoalFrameworkType);
    const aRank = ai === -1 ? 99 : ai;
    const bRank = bi === -1 ? 99 : bi;
    return aRank - bRank || a.priority - b.priority;
  });
}

function currentQuarterLabel(): string {
  const now = new Date();
  return `Q${Math.floor(now.getMonth() / 3) + 1} ${now.getFullYear()}`;
}

export function GoalsWorkspace({ embedded = false }: GoalsWorkspaceProps) {
  const { startMakFlow } = useAppShell();
  const { analytics } = useAnalytics();
  const formRef = useRef<HTMLDivElement>(null);
  const [goals, setGoals] = useState<CareerGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<GoalFormData>(emptyGoalForm());
  const [error, setError] = useState<string | null>(null);
  const [milestoneUpdating, setMilestoneUpdating] = useState<string | null>(null);
  const [goalsConfirmed, setGoalsConfirmed] = useState(false);

  const loadGoals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/goals");
      const data = await res.json();
      setGoals((data.goals as CareerGoal[]) ?? []);
      setGoalsConfirmed(Boolean(data.goals_confirmed));
    } catch {
      setError("Could not load goals.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadGoals();

    const refresh = () => void loadGoals();
    window.addEventListener("fiscmak:goals-updated", refresh);
    return () => window.removeEventListener("fiscmak:goals-updated", refresh);
  }, [loadGoals]);

  const sortedGoals = useMemo(() => sortGoals(goals.filter((g) => g.status !== "completed")), [goals]);
  const structuredByType = useMemo(() => {
    const map = new Map<GoalFrameworkType, ReturnType<typeof careerGoalsToStructuredGoals>[0]>();
    for (const s of careerGoalsToStructuredGoals(sortedGoals)) {
      map.set(s.type, s);
    }
    return map;
  }, [sortedGoals]);

  const annualDue = analytics?.annual_refresh?.due ?? false;

  function startGoalSettingWithMak() {
    startMakFlow(
      "plan",
      undefined,
      buildGoalSettingIntro(),
      undefined,
      "set",
      undefined,
      PLAN_MAK.setup.autoMessage,
    );
  }

  function reviewWithMak() {
    if (annualDue) {
      startMakFlow(
        "plan",
        undefined,
        buildAnnualPlanResetGreeting({ goals, analytics }),
        "annual",
        undefined,
        undefined,
        "Begin annual goal review.",
      );
    } else {
      startMakFlow(
        "plan",
        undefined,
        `${currentQuarterLabel()} — let's review milestone progress on your three goals.`,
        "quarterly",
        undefined,
        undefined,
        PLAN_MAK.review.autoMessage,
      );
    }
  }

  function openEdit(goal: CareerGoal) {
    setEditingId(goal.id);
    setForm(goalToForm(goal));
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  function closeEdit() {
    setEditingId(null);
    setForm(emptyGoalForm());
  }

  async function saveGoal(e: React.FormEvent) {
    e.preventDefault();
    if (!form.goal_title.trim()) return;
    setError(null);

    const payload = formToGoalPayload(form, editingId ?? undefined);
    const existing = goals.find((g) => g.id === editingId);
    const next = editingId
      ? goals.map((g) =>
          g.id === editingId
            ? ({ ...g, ...payload, goal_type: existing?.goal_type ?? g.goal_type } as CareerGoal)
            : g,
        )
      : goals;

    const result = await persistGoals(next);
    if (!result.ok) {
      setError(result.error ?? "Could not save goal.");
      return;
    }
    setGoals(next);
    closeEdit();
  }

  async function deleteGoal(id: string) {
    if (!confirm("Delete this goal?")) return;
    const next = goals.filter((g) => g.id !== id);
    const result = await persistGoals(next);
    if (!result.ok) {
      setError(result.error ?? "Could not delete goal.");
      return;
    }
    setGoals(next);
  }

  async function updateMilestone(
    goalId: string,
    milestoneIndex: number,
    status: MilestoneStatus,
  ) {
    setMilestoneUpdating(`${goalId}-${status}`);
    setError(null);
    try {
      const res = await fetch("/api/v1/goals/milestone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal_id: goalId, milestone_index: milestoneIndex, status }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Could not update milestone.");
        return;
      }
      const next = (data.goals as CareerGoal[]) ?? goals;
      setGoals(next);
      await persistGoals(next);
    } catch {
      setError("Could not update milestone.");
    } finally {
      setMilestoneUpdating(null);
    }
  }

  const body = (
    <>
      {error && (
        <p className="cx-alert-banner mb-6 px-4 py-3 text-sm">
          {error}
        </p>
      )}

      {!loading && sortedGoals.length > 0 && (
        <CardSection
          className="mb-6"
          compact
          eyebrow={annualDue ? "Annual review" : currentQuarterLabel()}
          title={annualDue ? "Confirm or reset your three goals" : "Mark milestone status below"}
          mak={PLAN_MAK.review}
          footer={
            <Button variant="secondary" className="shrink-0" onClick={reviewWithMak}>
              Review with Mak
            </Button>
          }
        />
      )}

      {editingId && (
        <div ref={formRef} className="mb-6">
          <CardSection
            eyebrow="Template edit"
            title="Edit goal"
            mak={PLAN_MAK.editGoal}
          >
            <form onSubmit={saveGoal} className="space-y-4">
              <Input
                label="Title"
                id="title"
                required
                value={form.goal_title}
                onChange={(e) => setForm((f) => ({ ...f, goal_title: e.target.value }))}
              />
              <div>
                <label htmlFor="desc" className="text-sm font-semibold text-cx-forest-dark">
                  Description
                </label>
                <textarea
                  id="desc"
                  rows={2}
                  value={form.goal_description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, goal_description: e.target.value }))
                  }
                  className="mt-2 w-full rounded-xl border border-cx-forest-dark/20 p-3 text-sm text-cx-forest-dark"
                />
              </div>
              <div>
                <label htmlFor="actions" className="text-sm font-semibold text-cx-forest-dark">
                  Milestones (one per line)
                </label>
                <textarea
                  id="actions"
                  rows={4}
                  value={form.recommended_actions}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, recommended_actions: e.target.value }))
                  }
                  className="mt-2 w-full rounded-xl border border-cx-forest-dark/20 p-3 text-sm text-cx-forest-dark"
                />
              </div>
              <div>
                <label htmlFor="status" className="text-sm font-semibold text-cx-forest-dark">
                  Status
                </label>
                <select
                  id="status"
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      status: e.target.value as CareerGoal["status"],
                    }))
                  }
                  className="mt-2 min-h-11 w-full rounded-xl border border-cx-forest-dark/20 px-4 text-sm text-cx-forest-dark"
                >
                  {GOAL_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Save</Button>
                <Button type="button" variant="secondary" onClick={closeEdit}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardSection>
        </div>
      )}

      {loading && (
        <p className="text-sm text-cx-forest-dark/70">Loading goals…</p>
      )}

      {!loading && sortedGoals.length === 0 && (
        <CardSection
          eyebrow="Career strategy"
          title="No goals yet"
          description="Coach Mak walks you through Development, Maintenance, and Sustainability goals — or edit the template directly."
          mak={PLAN_MAK.setup}
          footer={<Button onClick={startGoalSettingWithMak}>Set up with Mak</Button>}
        />
      )}

      <div className="space-y-4">
        {sortedGoals.map((goal) => {
          const type = goal.goal_type as GoalFrameworkType | null;
          const structured =
            type && FRAMEWORK_ORDER.includes(type)
              ? structuredByType.get(type) ?? null
              : null;

          return (
            <CareerStrategyGoalCard
              key={goal.id}
              goal={goal}
              structured={structured}
              updating={milestoneUpdating != null}
              onEdit={() => openEdit(goal)}
              onDelete={() => deleteGoal(goal.id)}
              onMilestoneStatus={(index, status) =>
                void updateMilestone(goal.id, index, status)
              }
            />
          );
        })}
      </div>

      {!embedded && !loading && sortedGoals.length > 0 && (
        <p className="mt-8 text-center text-sm text-cx-forest-dark/70">
          <Link
            href="/app/plan?tab=jobs"
            className="inline-flex items-center gap-1 font-medium text-cx-forest-dark hover:underline"
          >
            Pathways & position search
            <ArrowRight size={14} />
          </Link>
        </p>
      )}
    </>
  );

  if (embedded) return body;

  return (
    <PageShell
      eyebrow={SOAP_TAB.plan.nav}
      title={SOAP_TAB.plan.title}
      subtitle={SOAP_TAB.plan.description}
      maxWidth="md"
      action={
        !goalsConfirmed ? (
          <Button onClick={startGoalSettingWithMak}>Set up with Mak</Button>
        ) : undefined
      }
    >
      {body}
    </PageShell>
  );
}

"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import {
  type CareerGoal,
  type GoalFormData,
  GOAL_STATUSES,
  emptyGoalForm,
  formToGoalPayload,
  goalToForm,
  loadDemoGoals,
  saveDemoGoals,
} from "@/lib/goals";
import { GOAL_FRAMEWORK_LABELS, SOAP_TAB, type GoalFrameworkType } from "@/lib/v2/soap-tab-spec";
import { Pencil, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageShell } from "@/components/layout/PageShell";
import { PathwaysExplorer } from "@/components/workspace/PathwaysExplorer";
import { GoalQuarterlyReviewPanel } from "@/components/workspace/GoalQuarterlyReviewPanel";
import { useAppShell } from "@/components/layout/AppShell";
import { goalExamplesForProfile } from "@/lib/v2/goal-framework";
import { buildAnnualPlanResetGreeting } from "@/lib/mak-chatbot-states";
import { PlanActivationPanel } from "@/components/workspace/PlanActivationPanel";
import { AcademicSoapSectionGate } from "@/components/layout/AcademicSoapSectionGate";
import type { PracticeSetting, CareerStage, AcademicRank } from "@/lib/v2/onboarding-options";
import type { AnalyticsDashboard } from "@/lib/v2/types";

export function GoalsWorkspace() {
  const { startMakFlow } = useAppShell();
  const [goals, setGoals] = useState<CareerGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<GoalFormData>(emptyGoalForm());
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsDashboard | null>(null);
  const [profile, setProfile] = useState<{
    practice_setting?: PracticeSetting | null;
    career_stage?: CareerStage | null;
    academic_rank?: AcademicRank | null;
    primary_career_track?: string | null;
    specialty?: string | null;
  }>({});

  const loadGoals = useCallback(async () => {
    if (!isSupabaseConfigured()) {
      setGoals(loadDemoGoals());
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setGoals(loadDemoGoals());
      setLoading(false);
      return;
    }

    const { data, error: fetchError } = await supabase
      .from("career_goals")
      .select("*")
      .eq("user_id", user.id)
      .order("priority", { ascending: true });

    if (fetchError) setError(fetchError.message);
    else setGoals((data as CareerGoal[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadGoals();
    fetch("/api/v1/analytics/dashboard")
      .then((r) => r.json())
      .then((data) => setAnalytics(data as AnalyticsDashboard))
      .catch(() => undefined);
    fetch("/api/v1/onboarding/touchpoint1")
      .then((r) => r.json())
      .then((data) => setProfile(data))
      .catch(() => undefined);
  }, [loadGoals]);

  function openCreate() {
    setEditingId(null);
    setForm(emptyGoalForm());
    setShowForm(true);
  }

  function openEdit(goal: CareerGoal) {
    setEditingId(goal.id);
    setForm(goalToForm(goal));
    setShowForm(true);
  }

  async function saveGoal(e: React.FormEvent) {
    e.preventDefault();
    if (!form.goal_title.trim()) return;
    setError(null);

    const payload = formToGoalPayload(form, editingId ?? undefined);

    if (!isSupabaseConfigured()) {
      const next = editingId
        ? goals.map((g) =>
            g.id === editingId ? ({ ...g, ...payload } as CareerGoal) : g,
          )
        : [...goals, payload as CareerGoal];
      saveDemoGoals(next);
      setGoals(next);
      setShowForm(false);
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const row = {
      ...payload,
      user_id: user.id,
      updated_at: new Date().toISOString(),
    };

    if (editingId) {
      const { error: updateError } = await supabase
        .from("career_goals")
        .update(row)
        .eq("id", editingId);
      if (updateError) {
        setError(updateError.message);
        return;
      }
    } else {
      const { error: insertError } = await supabase
        .from("career_goals")
        .insert(row);
      if (insertError) {
        setError(insertError.message);
        return;
      }
    }

    setShowForm(false);
    await loadGoals();
  }

  async function deleteGoal(id: string) {
    if (!confirm("Delete this goal?")) return;

    if (!isSupabaseConfigured()) {
      const next = goals.filter((g) => g.id !== id);
      saveDemoGoals(next);
      setGoals(next);
      return;
    }

    const supabase = createClient();
    await supabase.from("career_goals").delete().eq("id", id);
    await loadGoals();
  }

  function statusBadge(status: CareerGoal["status"]) {
    if (status === "completed") return "energizing";
    if (status === "paused") return "neutral";
    return "default";
  }

  return (
    <PageShell
      eyebrow="Career strategy"
      title={SOAP_TAB.plan.title}
      subtitle={
        SOAP_TAB.plan.description +
        (!isSupabaseConfigured() ? " · saved in browser (demo)" : "")
      }
      maxWidth="md"
      action={<Button onClick={openCreate}>Add goal</Button>}
    >
      <AcademicSoapSectionGate intent="plan" />

      {error && (
        <p className="mb-6 rounded-xl border border-cx-attention bg-amber-50 px-4 py-3 text-sm text-cx-text">
          {error}
        </p>
      )}

      <PathwaysExplorer />

      <GoalQuarterlyReviewPanel
        annualDue={analytics?.annual_refresh?.due ?? false}
        onGoalsUpdated={setGoals}
        onDiscussWithMak={() => {
          if (analytics?.annual_refresh?.due) {
            startMakFlow(
              "plan",
              undefined,
              buildAnnualPlanResetGreeting({ goals, analytics }),
            );
          } else {
            startMakFlow("plan", undefined, "Begin quarterly goal review.");
          }
        }}
      />

      <PlanActivationPanel
        setting={profile.practice_setting}
        level={profile.career_stage}
        rank={profile.academic_rank}
        track={profile.primary_career_track}
        specialty={profile.specialty}
      />

      <Card>
        <p className="text-data-label">Goal examples by profile</p>
        <p className="mt-2 text-sm text-cx-text-secondary">
          Development:{" "}
          {goalExamplesForProfile({
            setting: profile.practice_setting ?? "Academic",
            level: profile.career_stage,
            rank: profile.academic_rank,
            track: profile.primary_career_track,
          })
            ?.development.slice(0, 2)
            .join("; ") ?? "Set profile for tailored examples"}
          . Maintenance and Sustainability goals adapt similarly by setting, rank, and track.
        </p>
      </Card>

      {showForm && (
        <Card>
          <h2 className="font-semibold">
            {editingId ? "Edit goal" : "New goal"}
          </h2>
          <form onSubmit={saveGoal} className="mt-4 space-y-4">
            <Input
              label="Goal title"
              id="title"
              required
              value={form.goal_title}
              onChange={(e) =>
                setForm((f) => ({ ...f, goal_title: e.target.value }))
              }
            />
            <div>
              <label htmlFor="desc" className="text-sm font-semibold">
                Description
              </label>
              <textarea
                id="desc"
                rows={3}
                value={form.goal_description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, goal_description: e.target.value }))
                }
                className="mt-2 w-full rounded-md border border-cx-border p-4"
              />
            </div>
            <div>
              <label htmlFor="why" className="text-sm font-semibold">
                Why this fits
              </label>
              <textarea
                id="why"
                rows={2}
                value={form.why_this_fits}
                onChange={(e) =>
                  setForm((f) => ({ ...f, why_this_fits: e.target.value }))
                }
                className="mt-2 w-full rounded-md border border-cx-border p-4"
              />
            </div>
            <div>
              <label htmlFor="missing" className="text-sm font-semibold">
                Missing evidence (one per line)
              </label>
              <textarea
                id="missing"
                rows={2}
                value={form.missing_evidence}
                onChange={(e) =>
                  setForm((f) => ({ ...f, missing_evidence: e.target.value }))
                }
                className="mt-2 w-full rounded-md border border-cx-border p-4"
                placeholder="Committee leadership documentation"
              />
            </div>
            <div>
              <label htmlFor="actions" className="text-sm font-semibold">
                Recommended actions (one per line)
              </label>
              <textarea
                id="actions"
                rows={2}
                value={form.recommended_actions}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    recommended_actions: e.target.value,
                  }))
                }
                className="mt-2 w-full rounded-md border border-cx-border p-4"
                placeholder="Log 3 leadership activities"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Input
                label="Target date"
                id="date"
                type="date"
                value={form.target_date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, target_date: e.target.value }))
                }
              />
              <div>
                <label htmlFor="priority" className="text-sm font-semibold">
                  Priority (1–5)
                </label>
                <select
                  id="priority"
                  value={form.priority}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      priority: Number(e.target.value),
                    }))
                  }
                  className="mt-2 min-h-11 w-full rounded-md border border-cx-border px-4"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="status" className="text-sm font-semibold">
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
                  className="mt-2 min-h-11 w-full rounded-md border border-cx-border px-4"
                >
                  {GOAL_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit">Save goal</Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {loading && <p className="text-sm text-cx-text-secondary">Loading goals…</p>}

      {!loading && goals.length === 0 && (
        <EmptyState
          title="Career goals will appear here"
          description="Goals are suggested after your Career Profile is generated — structured as Development, Maintenance, and Sustainability objectives with quarterly milestones."
          actionLabel="Complete assessment first"
          actionHref="/app/assessment"
        />
      )}

      <div className="space-y-4">
        {goals.map((goal) => (
          <Card key={goal.id} accent="green">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                {goal.goal_type &&
                  (goal.goal_type === "development" ||
                    goal.goal_type === "maintenance" ||
                    goal.goal_type === "sustainability") && (
                    <p className="text-data-label">
                      {GOAL_FRAMEWORK_LABELS[goal.goal_type as GoalFrameworkType].label}
                    </p>
                  )}
                <h3 className="text-lg font-semibold">{goal.goal_title}</h3>
                {goal.goal_description && (
                  <p className="mt-1 text-sm text-cx-text-secondary">
                    {goal.goal_description}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Badge energy={statusBadge(goal.status)}>{goal.status}</Badge>
                <Badge>P{goal.priority}</Badge>
              </div>
            </div>

            {goal.why_this_fits && (
              <p className="mt-3 text-sm">
                <span className="font-semibold">Why: </span>
                {goal.why_this_fits}
              </p>
            )}

            {goal.missing_evidence && goal.missing_evidence.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold uppercase text-cx-text-secondary">
                  Missing evidence
                </p>
                <ul className="mt-1 list-disc pl-5 text-sm">
                  {goal.missing_evidence.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {goal.recommended_actions &&
              goal.recommended_actions.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold uppercase text-cx-text-secondary">
                    Milestones
                  </p>
                  <ul className="mt-1 list-disc pl-5 text-sm">
                    {goal.recommended_actions.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

            {goal.target_date && (
              <p className="mt-3 text-xs text-cx-text-secondary">
                Target: {goal.target_date}
              </p>
            )}

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => openEdit(goal)}
                className="flex items-center gap-1 text-sm text-cx-text hover:text-cx-primary"
              >
                <Pencil size={14} /> Edit
              </button>
              <button
                type="button"
                onClick={() => deleteGoal(goal.id)}
                className="flex items-center gap-1 text-sm text-cx-attention hover:text-cx-primary"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}

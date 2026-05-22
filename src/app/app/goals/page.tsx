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
import { Target, Pencil, Trash2 } from "lucide-react";

export default function GoalsPage() {
  const [goals, setGoals] = useState<CareerGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<GoalFormData>(emptyGoalForm());
  const [error, setError] = useState<string | null>(null);

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
    loadGoals();
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
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold">
            <Target className="text-fiscmak-green" size={28} />
            Goals
          </h1>
          <p className="mt-1 text-fiscmak-muted">
            Career strategy and next steps
            {!isSupabaseConfigured() && " · saved in browser (demo)"}
          </p>
        </div>
        <Button onClick={openCreate}>Add goal</Button>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-fiscmak-red">
          {error}
        </p>
      )}

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
                className="mt-2 w-full rounded-md border border-fiscmak-border p-4"
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
                className="mt-2 w-full rounded-md border border-fiscmak-border p-4"
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
                className="mt-2 w-full rounded-md border border-fiscmak-border p-4"
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
                className="mt-2 w-full rounded-md border border-fiscmak-border p-4"
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
                  className="mt-2 min-h-11 w-full rounded-md border border-fiscmak-border px-4"
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
                  className="mt-2 min-h-11 w-full rounded-md border border-fiscmak-border px-4"
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

      {loading && <p className="text-sm text-fiscmak-muted">Loading goals…</p>}

      {!loading && goals.length === 0 && (
        <Card>
          <p className="text-sm text-fiscmak-muted">
            No goals yet. Add one to connect your lattice to your next career
            move.
          </p>
        </Card>
      )}

      <div className="space-y-4">
        {goals.map((goal) => (
          <Card key={goal.id} accent="green">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="text-lg font-semibold">{goal.goal_title}</h3>
                {goal.goal_description && (
                  <p className="mt-1 text-sm text-fiscmak-muted">
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
                <p className="text-xs font-semibold uppercase text-fiscmak-muted">
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
                  <p className="text-xs font-semibold uppercase text-fiscmak-muted">
                    Next actions
                  </p>
                  <ul className="mt-1 list-disc pl-5 text-sm">
                    {goal.recommended_actions.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

            {goal.target_date && (
              <p className="mt-3 text-xs text-fiscmak-muted">
                Target: {goal.target_date}
              </p>
            )}

            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => openEdit(goal)}
                className="flex items-center gap-1 text-sm text-fiscmak-green hover:underline"
              >
                <Pencil size={14} /> Edit
              </button>
              <button
                type="button"
                onClick={() => deleteGoal(goal.id)}
                className="flex items-center gap-1 text-sm text-fiscmak-red hover:underline"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

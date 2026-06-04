"use client";

import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MilestoneSelfRatingPanel } from "@/components/gme/MilestoneSelfRatingPanel";
import type { IlpGoalRow } from "@/lib/v2/gme/trainee-gme-data";

// Sentinel values in the `resources` field that tag career-narrative prompts.
const CAREER = {
  long_term: "career:long_term",
  this_year: "career:this_year",
  obstacle:  "career:obstacle",
} as const;

type CareerKey = keyof typeof CAREER;

type CareerEntry = { id: string | null; text: string };
type CareerState = Record<CareerKey, CareerEntry>;

const CAREER_PROMPTS: Record<CareerKey, string> = {
  long_term: "Long-term direction — where do you want to be in 5–10 years?",
  this_year: "This-year focus — what is your most important goal for this academic year?",
  obstacle:  "Obstacle / next step — what stands in the way, and what is your next concrete action?",
};

const isSentinel = (r: string | null | undefined) =>
  r != null && Object.values(CAREER).includes(r as (typeof CAREER)[CareerKey]);

export function IlpForm() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [career, setCareer] = useState<CareerState>({
    long_term: { id: null, text: "" },
    this_year: { id: null, text: "" },
    obstacle:  { id: null, text: "" },
  });
  const [savingCareer, setSavingCareer] = useState(false);
  const [careerMsg, setCareerMsg] = useState<string | null>(null);

  const [smartGoals, setSmartGoals] = useState<IlpGoalRow[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState({ goal_text: "", resources: "", target_date: "" });
  const [addingGoal, setAddingGoal] = useState(false);
  const [newDraft, setNewDraft] = useState({ goal_text: "", resources: "", target_date: "" });
  const [smartMsg, setSmartMsg] = useState<string | null>(null);
  const [savingSmart, setSavingSmart] = useState(false);

  const [isFinalized, setIsFinalized] = useState(false);
  const [approvedCount, setApprovedCount] = useState(0);
  const [finalizing, setFinalizing] = useState(false);
  const [finalizeMsg, setFinalizeMsg] = useState<string | null>(null);

  const loadGoals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/trainee/ilp?period=current");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Could not load ILP goals.");

      const goals: IlpGoalRow[] = data.goals ?? [];

      const find = (sentinel: string) => goals.find((g) => g.resources === sentinel);
      setCareer({
        long_term: { id: find(CAREER.long_term)?.goal_id ?? null, text: find(CAREER.long_term)?.goal_text ?? "" },
        this_year: { id: find(CAREER.this_year)?.goal_id ?? null, text: find(CAREER.this_year)?.goal_text ?? "" },
        obstacle:  { id: find(CAREER.obstacle)?.goal_id ?? null,  text: find(CAREER.obstacle)?.goal_text  ?? "" },
      });

      const smart = goals.filter((g) => !isSentinel(g.resources) && g.status !== "deferred");
      setSmartGoals(smart);
      setIsFinalized(goals.some((g) => !!g.locked_at));
      setApprovedCount(smart.filter((g) => g.status === "active").length);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load ILP.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadGoals();
  }, [loadGoals]);

  async function saveCareerGoals() {
    setSavingCareer(true);
    setCareerMsg(null);
    try {
      const keys = Object.keys(CAREER) as CareerKey[];
      for (const key of keys) {
        const { id, text } = career[key];
        const sentinel = CAREER[key];
        if (id) {
          if (text.trim()) {
            await fetch("/api/v1/ilp-goals", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ goal_id: id, goal_text: text.trim() }),
            });
          }
        } else if (text.trim()) {
          await fetch("/api/v1/ilp-goals", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ goal_text: text.trim(), resources: sentinel, status: "draft" }),
          });
        }
      }
      setCareerMsg("Career goals saved.");
      await loadGoals();
    } catch {
      setCareerMsg("Could not save career goals.");
    } finally {
      setSavingCareer(false);
    }
  }

  async function addSmartGoal() {
    if (!newDraft.goal_text.trim()) return;
    setSavingSmart(true);
    setSmartMsg(null);
    try {
      const res = await fetch("/api/v1/ilp-goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal_text: newDraft.goal_text.trim(),
          resources: newDraft.resources.trim() || null,
          target_date: newDraft.target_date || null,
          status: "draft",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Could not add goal.");
      setNewDraft({ goal_text: "", resources: "", target_date: "" });
      setAddingGoal(false);
      await loadGoals();
    } catch (err) {
      setSmartMsg(err instanceof Error ? err.message : "Could not add goal.");
    } finally {
      setSavingSmart(false);
    }
  }

  async function saveEditSmartGoal(goalId: string) {
    if (!editDraft.goal_text.trim()) return;
    setSavingSmart(true);
    setSmartMsg(null);
    try {
      const res = await fetch(`/api/v1/trainee/ilp/${encodeURIComponent(goalId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goal_text: editDraft.goal_text.trim(),
          resources: editDraft.resources.trim() || null,
          target_date: editDraft.target_date || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Could not update goal.");
      setEditingId(null);
      await loadGoals();
    } catch (err) {
      setSmartMsg(err instanceof Error ? err.message : "Could not update goal.");
    } finally {
      setSavingSmart(false);
    }
  }

  async function deleteSmartGoal(goalId: string) {
    setSmartMsg(null);
    try {
      const res = await fetch(`/api/v1/trainee/ilp/${encodeURIComponent(goalId)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Could not delete goal.");
      await loadGoals();
    } catch (err) {
      setSmartMsg(err instanceof Error ? err.message : "Could not delete goal.");
    }
  }

  async function finalize() {
    setFinalizing(true);
    setFinalizeMsg(null);
    try {
      const res = await fetch("/api/v1/trainee/ilp/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period: "current" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Could not finalize ILP.");
      setFinalizeMsg(`Submitted for PD review — ${data.finalized} goal(s) locked.`);
      await loadGoals();
    } catch (err) {
      setFinalizeMsg(err instanceof Error ? err.message : "Could not finalize ILP.");
    } finally {
      setFinalizing(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <p className="text-sm text-cx-text/70">Loading ILP…</p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <p className="text-sm text-[#C28D6C]">{error}</p>
        <Button className="mt-3" variant="secondary" onClick={() => void loadGoals()}>
          Retry
        </Button>
      </Card>
    );
  }

  const hasUnlockedGoals =
    smartGoals.some((g) => !g.locked_at) ||
    Object.values(career).some((c) => c.text.trim() && !isFinalized);

  return (
    <div className="space-y-6">
      {/* Finalized notice */}
      {isFinalized && (
        <div className="rounded-xl border border-[#6E93B8]/30 bg-[#6E93B8]/10 px-4 py-3 text-sm text-[#34597A]">
          <p className="font-semibold">Submitted for PD review</p>
          <p className="mt-0.5 text-xs opacity-80">
            Goals are locked for editing.
            {approvedCount > 0 && ` ${approvedCount} goal(s) approved by PD.`}
          </p>
        </div>
      )}

      {/* ── Section 1: Career Goals ─────────────────────────────────── */}
      <Card>
        <p className="text-cx-label uppercase">ILP · Section 1</p>
        <h3 className="mt-1 text-lg font-semibold text-cx-text">Career goals</h3>
        <p className="mt-2 text-sm text-cx-text/75">
          Reflect on your direction, this year's focus, and what's in your way.
        </p>

        <div className="mt-5 space-y-5">
          {(Object.keys(CAREER) as CareerKey[]).map((key) => (
            <div key={key}>
              <label className="block text-sm font-medium text-cx-text">
                {CAREER_PROMPTS[key]}
              </label>
              {isFinalized && career[key].id ? (
                <p className="mt-2 rounded-lg border border-cx-forest-dark/10 bg-cx-forest-dark/3 px-3 py-2 text-sm text-cx-text">
                  {career[key].text || <span className="text-cx-text/40">Not answered</span>}
                </p>
              ) : (
                <textarea
                  className="cx-field mt-2 w-full text-sm"
                  rows={3}
                  placeholder="Write your response…"
                  value={career[key].text}
                  onChange={(e) =>
                    setCareer((prev) => ({
                      ...prev,
                      [key]: { ...prev[key], text: e.target.value },
                    }))
                  }
                />
              )}
            </div>
          ))}
        </div>

        {!isFinalized && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button onClick={() => void saveCareerGoals()} disabled={savingCareer}>
              {savingCareer ? "Saving…" : "Save career goals"}
            </Button>
            {careerMsg && <p className="text-sm text-cx-text/70">{careerMsg}</p>}
          </div>
        )}
        {isFinalized && careerMsg && (
          <p className="mt-3 text-sm text-cx-text/70">{careerMsg}</p>
        )}
      </Card>

      {/* ── Section 2: Competency Self-Assessment ───────────────────── */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-cx-text/55">
          ILP · Section 2 — Milestone self-assessment
        </p>
        <MilestoneSelfRatingPanel />
      </div>

      {/* ── Section 3: SMART Goals ──────────────────────────────────── */}
      <Card>
        <p className="text-cx-label uppercase">ILP · Section 3</p>
        <h3 className="mt-1 text-lg font-semibold text-cx-text">SMART goals</h3>
        <p className="mt-2 text-sm text-cx-text/75">
          Specific, Measurable, Achievable, Relevant, Time-bound learning goals for PD review and
          approval. Use "Draft from gaps" in Section 2 to pre-populate suggestions.
        </p>

        {smartMsg && <p className="mt-3 text-sm text-[#C28D6C]">{smartMsg}</p>}

        {smartGoals.length === 0 && !addingGoal && (
          <p className="mt-4 text-sm text-cx-text/50">
            No goals yet — add one below or use "Draft ILP from gaps" in the self-assessment.
          </p>
        )}

        <ul className="mt-4 space-y-3">
          {smartGoals.map((goal) => {
            const locked = !!goal.locked_at;
            const isEditing = editingId === goal.goal_id;
            return (
              <li
                key={goal.goal_id}
                className="rounded-xl border border-cx-forest-dark/10 px-4 py-3 text-sm"
              >
                {isEditing ? (
                  <div className="space-y-3">
                    <textarea
                      className="cx-field w-full text-sm"
                      rows={3}
                      value={editDraft.goal_text}
                      onChange={(e) => setEditDraft((d) => ({ ...d, goal_text: e.target.value }))}
                      placeholder="SMART goal…"
                    />
                    <input
                      className="cx-field w-full text-sm"
                      placeholder="Resources (optional)"
                      value={editDraft.resources}
                      onChange={(e) => setEditDraft((d) => ({ ...d, resources: e.target.value }))}
                    />
                    <input
                      type="date"
                      className="cx-field text-sm"
                      value={editDraft.target_date}
                      onChange={(e) => setEditDraft((d) => ({ ...d, target_date: e.target.value }))}
                    />
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() => void saveEditSmartGoal(goal.goal_id)}
                        disabled={savingSmart}
                      >
                        {savingSmart ? "Saving…" : "Save"}
                      </Button>
                      <Button variant="secondary" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="font-medium text-cx-text">{goal.goal_text}</p>
                      <GoalStatusBadge status={goal.status} locked={locked} />
                    </div>
                    {goal.resources && !isSentinel(goal.resources) && (
                      <p className="mt-1 text-xs text-cx-text/60">
                        Resources: {goal.resources}
                      </p>
                    )}
                    {goal.target_date && (
                      <p className="mt-1 text-xs text-cx-text/60">
                        Target: {goal.target_date}
                      </p>
                    )}
                    {!locked && goal.status !== "active" && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setEditingId(goal.goal_id);
                            setEditDraft({
                              goal_text: goal.goal_text,
                              resources: goal.resources && !isSentinel(goal.resources) ? goal.resources : "",
                              target_date: goal.target_date ?? "",
                            });
                          }}
                        >
                          Edit
                        </Button>
                        <button
                          type="button"
                          className="text-xs text-cx-text/50 hover:text-[#C28D6C]"
                          onClick={() => void deleteSmartGoal(goal.goal_id)}
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </>
                )}
              </li>
            );
          })}
        </ul>

        {!isFinalized && !addingGoal && (
          <Button
            className="mt-4"
            variant="secondary"
            onClick={() => {
              setAddingGoal(true);
              setNewDraft({ goal_text: "", resources: "", target_date: "" });
            }}
          >
            + Add goal
          </Button>
        )}

        {addingGoal && (
          <div className="mt-4 space-y-3 rounded-xl border border-cx-forest-dark/10 p-4">
            <p className="text-sm font-medium text-cx-text">New SMART goal</p>
            <textarea
              className="cx-field w-full text-sm"
              rows={3}
              placeholder="By [date] I will… as measured by…"
              value={newDraft.goal_text}
              onChange={(e) => setNewDraft((d) => ({ ...d, goal_text: e.target.value }))}
            />
            <input
              className="cx-field w-full text-sm"
              placeholder="Resources (optional)"
              value={newDraft.resources}
              onChange={(e) => setNewDraft((d) => ({ ...d, resources: e.target.value }))}
            />
            <input
              type="date"
              className="cx-field text-sm"
              value={newDraft.target_date}
              onChange={(e) => setNewDraft((d) => ({ ...d, target_date: e.target.value }))}
            />
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void addSmartGoal()} disabled={savingSmart || !newDraft.goal_text.trim()}>
                {savingSmart ? "Saving…" : "Add goal"}
              </Button>
              <Button variant="secondary" onClick={() => setAddingGoal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* ── Finalize ────────────────────────────────────────────────── */}
      <Card>
        <h3 className="text-lg font-semibold text-cx-text">Finalize / submit for review</h3>
        <p className="mt-2 text-sm text-cx-text/75">
          When you are ready, submit your ILP for PD review. Your goals will be locked for editing
          and will appear in your program dashboard for approval. You may still add new goals after
          submission.
        </p>

        {finalizeMsg && (
          <p className="mt-3 text-sm text-cx-text/80">{finalizeMsg}</p>
        )}

        <Button
          className="mt-4"
          onClick={() => void finalize()}
          disabled={finalizing || (!hasUnlockedGoals && isFinalized)}
        >
          {finalizing
            ? "Submitting…"
            : isFinalized && !hasUnlockedGoals
            ? "Submitted"
            : isFinalized
            ? "Re-finalize / submit new goals"
            : "Finalize / submit for review"}
        </Button>
      </Card>
    </div>
  );
}

function GoalStatusBadge({ status, locked }: { status: string; locked: boolean }) {
  if (status === "active") {
    return (
      <span className="shrink-0 rounded-full bg-[#AC8636]/15 px-2 py-0.5 text-[11px] font-medium text-fis-gold">
        Approved
      </span>
    );
  }
  if (locked) {
    return (
      <span className="shrink-0 rounded-full bg-[#6E93B8]/20 px-2 py-0.5 text-[11px] font-medium text-[#34597A]">
        Submitted
      </span>
    );
  }
  return (
    <span className="shrink-0 rounded-full bg-cx-forest-dark/10 px-2 py-0.5 text-[11px] font-medium text-cx-text/60">
      Draft
    </span>
  );
}

import { isClientDemoMode } from "@/lib/demo-mode";
import type { GoalFrameworkType } from "@/lib/v2/soap-tab-spec";
import type { GoalArchetype, GoalArchetypeAnatomy } from "@/lib/v2/goal-archetype-templates";

export type CareerGoal = {
  id: string;
  user_id?: string;
  goal_title: string;
  goal_description: string | null;
  goal_type: string | null;
  goal_archetype?: GoalArchetype | null;
  goal_anatomy?: GoalArchetypeAnatomy | null;
  why_this_fits: string | null;
  missing_evidence: string[] | null;
  recommended_actions: string[] | null;
  target_date: string | null;
  priority: number;
  status: "active" | "paused" | "completed";
  created_at?: string;
  updated_at?: string;
};

export type GoalFormData = {
  goal_title: string;
  goal_description: string;
  why_this_fits: string;
  missing_evidence: string;
  recommended_actions: string;
  target_date: string;
  priority: number;
  status: CareerGoal["status"];
};

export const GOAL_STATUSES: CareerGoal["status"][] = [
  "active",
  "paused",
  "completed",
];

export const DEMO_GOALS: CareerGoal[] = [
  {
    id: "demo-development",
    goal_title: "Build educational leadership portfolio",
    goal_description: "Advance toward stated program director objective.",
    goal_type: "development",
    goal_archetype: "skill_development",
    goal_anatomy: {
      current_skills: "Clinical expert, strong teaching evaluations, ad-hoc mentoring",
      target_credential: "Formal educational leadership credential and accreditation experience",
      pathway: "Certificate (6 mo) → education scholarship (6 mo) → clerkship director (6 mo) → program director track (6 mo)",
      timeline: "18 months",
      internal_obstacle: 'Imposter syndrome — "I\'m a clinician, not an administrator"',
    },
    why_this_fits:
      "Teaching impact is strong; educational leadership experience is the primary gap relative to your 3-year objective.",
    missing_evidence: ["Education scholarship manuscript", "Accreditation experience"],
    recommended_actions: [
      "Q3 2026: Complete education leadership certificate — COMPLETED",
      "Q4 2026: Submit 1 education scholarship manuscript",
      "Q1 2027: Take on clerkship or rotation director role",
      "Q2 2027: Apply for associate program director or program director position",
    ],
    target_date: "2027-06-01",
    priority: 1,
    status: "active",
  },
  {
    id: "demo-maintenance",
    goal_title: "Sustain clinical teaching excellence",
    goal_description: "Protect teaching capacity as administrative responsibilities expand.",
    goal_type: "maintenance",
    goal_archetype: "visibility_recognition",
    goal_anatomy: {
      invisible_work: "Teaching hours and curriculum design without protected time or formal credit",
      formalization_goal: "Protected teaching schedule (≥60% current hours) and teaching award nomination",
      stakeholders: "Department chair, medical education committee",
      timeline: "12 months — schedule protection → evaluation check → award nomination",
      internal_obstacle: 'Fear of asking — "Teaching is just what I do, not something to negotiate for"',
    },
    why_this_fits:
      "Teaching evaluations are in a strong percentile — a documented professional strength worth protecting.",
    missing_evidence: [],
    recommended_actions: [
      "Q3 2026: Confirm teaching schedule protected at ≥60% of current hours — COMPLETED",
      "Q4 2026: Mid-year teaching evaluation check — maintain ≥4.5/5.0",
      "Q1 2027: Submit teaching award nomination",
      "Q2 2027: Annual teaching portfolio update completed",
    ],
    target_date: "2026-12-01",
    priority: 2,
    status: "active",
  },
  {
    id: "demo-sustainability",
    goal_title: "Optimize task alignment",
    goal_description: "Reduce unrecognized work and reallocate time toward core professional activities.",
    goal_type: "sustainability",
    goal_archetype: "work_life_integration",
    goal_anatomy: {
      burnout_signals: "35% of time on tasks outside core role; 10 hrs/week unrecognized work; unreasonable task score 3.2/5.0",
      target_state: "Core-role focus with ≤8 hrs/week unrecognized work and sustainable energy",
      constraints: "Cannot reduce clinical volume below contract minimum; limited admin support",
      experiment: "Delegate Documentation Overspill via scribe workflow; reassign Care Coordination to RN team",
      internal_obstacle: 'Guilt — "If I push back, I\'m not being a team player"',
    },
    why_this_fits:
      "Task alignment data shows 35% of work time on tasks outside core role, with 10 hrs/week unrecognized work. Unreasonable task score (3.2/5.0) is above specialty median.",
    missing_evidence: ["Delegation plan documentation", "Pre/post workflow hours tracked"],
    recommended_actions: [
      "Q3 2026: Identify top 2 unrecognized work categories — COMPLETED (Documentation Overspill: 4 hrs/week; Care Coordination: 3 hrs/week)",
      "Q4 2026: Implement 1 delegation or workflow change for Documentation Overspill",
      "Q1 2027: Reduce total unrecognized work from 10 to ≤8 hours/week",
      "Q2 2027: Achieve unreasonable task score ≤2.5/5.0 (from 3.2)",
    ],
    target_date: "2026-09-01",
    priority: 3,
    status: "active",
  },
];

const STORAGE_KEY = "fiscmak_goals_demo";

export async function confirmGoalsOnServer(goals: CareerGoal[]): Promise<void> {
  if (typeof window === "undefined") return;
  try {
    await fetch("/api/v1/goals/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goals }),
    });
  } catch {
    /* best-effort */
  }
}

export function saveOnboardingGoalsFromProposal(
  goals: { type: GoalFrameworkType; title: string; rationale: string; milestones: string[] }[],
): CareerGoal[] {
  const mapped: CareerGoal[] = goals.map((g, i) => ({
    id: `onboarding-${g.type}`,
    goal_title: g.title,
    goal_description: g.rationale,
    goal_type: g.type,
    why_this_fits: g.rationale,
    missing_evidence: null,
    recommended_actions: g.milestones.map((m) => m.replace(/^\[[x ]\]\s*|^[✓☐]\s*/, "")),
    target_date: null,
    priority: i + 1,
    status: "active",
  }));
  void persistGoals(mapped);
  void confirmGoalsOnServer(mapped);
  if (typeof window !== "undefined") {
    localStorage.setItem("fiscmak_goals_onboarding_complete", "1");
  }
  return mapped;
}

export function loadDemoGoals(): CareerGoal[] {
  if (typeof window === "undefined" || !isClientDemoMode()) return DEMO_GOALS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as CareerGoal[];
  } catch {
    /* ignore */
  }
  return DEMO_GOALS;
}

export function saveDemoGoals(goals: CareerGoal[]) {
  if (!isClientDemoMode()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));
}

export async function syncGoalsToServer(goals: CareerGoal[]): Promise<void> {
  await persistGoals(goals);
}

export async function persistGoals(
  goals: CareerGoal[],
): Promise<{ ok: boolean; error?: string }> {
  if (typeof window === "undefined") return { ok: true };

  saveDemoGoals(goals);

  try {
    const res = await fetch("/api/v1/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goals }),
    });
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { message?: string };
      return { ok: false, error: data.message ?? "Could not save goals." };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not save goals." };
  }
}

export async function fetchGoals(): Promise<CareerGoal[]> {
  if (typeof window === "undefined") return DEMO_GOALS;

  try {
    const res = await fetch("/api/v1/goals");
    if (res.ok) {
      const data = (await res.json()) as { goals?: CareerGoal[] };
      if (data.goals?.length) return data.goals;
    }
  } catch {
    /* fall through to local demo cache */
  }

  return loadDemoGoals();
}

export function emptyGoalForm(): GoalFormData {
  return {
    goal_title: "",
    goal_description: "",
    why_this_fits: "",
    missing_evidence: "",
    recommended_actions: "",
    target_date: "",
    priority: 3,
    status: "active",
  };
}

export function goalToForm(g: CareerGoal): GoalFormData {
  return {
    goal_title: g.goal_title,
    goal_description: g.goal_description ?? "",
    why_this_fits: g.why_this_fits ?? "",
    missing_evidence: (g.missing_evidence ?? []).join("\n"),
    recommended_actions: (g.recommended_actions ?? []).join("\n"),
    target_date: g.target_date ?? "",
    priority: g.priority,
    status: g.status,
  };
}

export function formToGoalPayload(form: GoalFormData, id?: string) {
  return {
    id: id ?? crypto.randomUUID(),
    goal_title: form.goal_title,
    goal_description: form.goal_description || null,
    why_this_fits: form.why_this_fits || null,
    missing_evidence: form.missing_evidence
      ? form.missing_evidence.split("\n").map((s) => s.trim()).filter(Boolean)
      : [],
    recommended_actions: form.recommended_actions
      ? form.recommended_actions.split("\n").map((s) => s.trim()).filter(Boolean)
      : [],
    target_date: form.target_date || null,
    priority: form.priority,
    status: form.status,
  };
}

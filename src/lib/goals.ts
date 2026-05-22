import { isClientDemoMode } from "@/lib/demo-mode";

export type CareerGoal = {
  id: string;
  user_id?: string;
  goal_title: string;
  goal_description: string | null;
  goal_type: string | null;
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
    id: "demo-1",
    goal_title: "Prepare promotion packet",
    goal_description: "Build evidence for associate to full professor track.",
    goal_type: "prepare_promotion",
    why_this_fits: "Strong educator track; recognition gap in leadership domain.",
    missing_evidence: ["Committee leadership documentation", "QI outcomes"],
    recommended_actions: [
      "Log 3 leadership activities",
      "Generate promotion narrative",
    ],
    target_date: "2026-12-01",
    priority: 1,
    status: "active",
  },
];

const STORAGE_KEY = "fiscmak_goals_demo";

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

export async function fetchGoals(): Promise<CareerGoal[]> {
  if (typeof window === "undefined") return DEMO_GOALS;

  const { createClient, isSupabaseConfigured } = await import(
    "@/lib/supabase/client"
  );

  if (!isSupabaseConfigured()) {
    return loadDemoGoals();
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return loadDemoGoals();
  }

  const { data, error } = await supabase
    .from("career_goals")
    .select("*")
    .eq("user_id", user.id)
    .order("priority", { ascending: true });

  if (error || !data?.length) {
    return loadDemoGoals();
  }

  return data as CareerGoal[];
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

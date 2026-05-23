import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";

export type AnnualRefreshModule = {
  id: string;
  name: string;
  items: number;
  minutes: number;
  description: string;
  conversation_id: string;
};

/** Touchpoint 3 — annual deep refresh instrument battery */
export const ANNUAL_REFRESH_MODULES: AnnualRefreshModule[] = [
  {
    id: "career_direction",
    name: "Career Direction",
    items: 10,
    minutes: 3,
    description: "Reconfirm career track, objective, and 3-year aspiration",
    conversation_id: "S-6",
  },
  {
    id: "work_engagement",
    name: "Work Engagement (UWES-9)",
    items: 9,
    minutes: 2,
    description: "Annual work engagement and vigor assessment",
    conversation_id: "S-7",
  },
  {
    id: "pfi_full",
    name: "Professional Fulfillment Index",
    items: 16,
    minutes: 3,
    description: "Full well-being and fulfillment reassessment",
    conversation_id: "S-1",
  },
  {
    id: "bits_full",
    name: "Task Burden (BITS)",
    items: 8,
    minutes: 2,
    description: "Illegitimate tasks and unreasonable workload review",
    conversation_id: "S-2",
  },
  {
    id: "invisible_work_annual",
    name: "Unrecognized Work Review",
    items: 5,
    minutes: 2,
    description: "Annual invisible work categories and hours",
    conversation_id: "S-3",
  },
  {
    id: "career_data_refresh",
    name: "Career Data Refresh",
    items: 1,
    minutes: 5,
    description: "CV update + API enrichment cascade",
    conversation_id: "O-1",
  },
  {
    id: "goal_annual_reset",
    name: "Goal Annual Reset",
    items: 3,
    minutes: 5,
    description: "Review all 3 goals — continue, modify, or replace",
    conversation_id: "P-5",
  },
];

export type AnnualRefreshAnswer = {
  module_id: string;
  question_id: string;
  value: string | number;
  captured_at: string;
};

export type AnnualRefreshRecord = {
  year: number;
  completed_at: string;
  answers: AnnualRefreshAnswer[];
  summary: string;
};

export type AnnualRefreshStatus = {
  due: boolean;
  year: number;
  days_since_last: number | null;
  modules: AnnualRefreshModule[];
  last_summary: string | null;
  estimated_minutes: number;
};

function daysBetween(iso: string | undefined): number | null {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

export function annualRefreshStatus(meta: OnboardingMetadata): AnnualRefreshStatus {
  const history = meta.annual_refresh_history ?? [];
  const last = history[0];
  const days = daysBetween(last?.completed_at);
  const due = !last || (days != null && days >= 365);

  return {
    due,
    year: new Date().getFullYear(),
    days_since_last: days,
    modules: ANNUAL_REFRESH_MODULES,
    last_summary: last?.summary ?? null,
    estimated_minutes: ANNUAL_REFRESH_MODULES.reduce((s, m) => s + m.minutes, 0),
  };
}

export function buildAnnualRefreshSummary(input: {
  year: number;
  careerObjective?: string;
  trackEnergy?: number;
  invisibleHours?: number;
  goalReviewNote?: string;
}): string {
  const lines = [`${input.year} Annual Career Refresh:`];
  if (input.careerObjective) lines.push(`Career objective reaffirmed: ${input.careerObjective}`);
  if (input.trackEnergy != null) lines.push(`Track energy: ${input.trackEnergy}/10`);
  if (input.invisibleHours != null) lines.push(`Unrecognized work: ~${input.invisibleHours} hrs/week`);
  if (input.goalReviewNote) lines.push(`Goals: ${input.goalReviewNote}`);
  lines.push("Full instrument battery recorded — Career Profile and dashboard updated.");
  return lines.join("\n");
}

export function parseAnnualAnswers(answers: AnnualRefreshAnswer[]): {
  track_energy?: number;
  invisible_hours?: number;
  career_objective?: string;
  goal_review?: string;
} {
  const get = (module: string, q: string) =>
    answers.find((a) => a.module_id === module && a.question_id === q)?.value;

  const track = Number(get("work_engagement", "vigor_mean"));
  const invisible = Number(get("invisible_work_annual", "weekly_hours"));
  const objective = get("career_direction", "three_year_objective");
  const goalReview = get("goal_annual_reset", "review_summary");

  return {
    track_energy: Number.isNaN(track) ? undefined : track,
    invisible_hours: Number.isNaN(invisible) ? undefined : invisible,
    career_objective: objective != null ? String(objective) : undefined,
    goal_review: goalReview != null ? String(goalReview) : undefined,
  };
}

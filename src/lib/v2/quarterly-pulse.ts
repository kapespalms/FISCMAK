import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";

export type QuarterlyPulseModule = {
  id: string;
  name: string;
  items: number;
  minutes: number;
  description: string;
};

export const QUARTERLY_MODULES: QuarterlyPulseModule[] = [
  {
    id: "pfi_screen",
    name: "Well-being screen",
    items: 2,
    minutes: 1,
    description: "Quick burnout check — emotional exhaustion and depersonalization",
  },
  {
    id: "invisible_pulse",
    name: "Unrecognized work pulse",
    items: 3,
    minutes: 1,
    description: "Weekly invisible hours, biggest category, new uncompensated responsibilities",
  },
  {
    id: "career_momentum",
    name: "Career momentum",
    items: 5,
    minutes: 2,
    description: "Goal progress, new achievements, barriers, track energy, setting change interest",
  },
  {
    id: "cv_update",
    name: "Quick CV update",
    items: 1,
    minutes: 3,
    description: "New publications, grants, roles, or awards since last update",
  },
];

export type PulseAnswer = {
  module_id: string;
  question_id: string;
  value: string | number;
  captured_at: string;
};

export type PulseRecord = {
  quarter: string;
  completed_at: string;
  answers: PulseAnswer[];
  burnout_screen?: number;
  invisible_hours?: number;
  track_energy?: number;
};

export type QuarterlyPulseStatus = {
  due: boolean;
  quarter_label: string;
  days_since_last: number | null;
  modules: QuarterlyPulseModule[];
  last_summary: string | null;
  triggers: string[];
};

function currentQuarterLabel(): string {
  const now = new Date();
  const q = Math.floor(now.getMonth() / 3) + 1;
  return `Q${q} ${now.getFullYear()}`;
}

function daysBetween(iso: string | undefined): number | null {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

export function quarterlyPulseStatus(meta: OnboardingMetadata): QuarterlyPulseStatus {
  const history = meta.pulse_history ?? [];
  const last = history[0];
  const days = daysBetween(last?.completed_at);
  const due = !last || (days != null && days >= 84); // ~12 weeks

  const triggers: string[] = [];
  if (due) triggers.push("Quarterly pulse due (~12 weeks since last update)");

  const lastBurnout = last?.burnout_screen;
  if (lastBurnout != null && lastBurnout >= 4) {
    triggers.push("Prior pulse burnout screen elevated — full well-being check recommended");
  }

  const baseline = meta.pulse_baseline?.invisible_hours as number | undefined;
  const lastHours = last?.invisible_hours;
  if (baseline && lastHours && lastHours > baseline * 1.25) {
    triggers.push("Unrecognized work increased >25% — full task burden reassessment suggested");
  }

  let last_summary: string | null = null;
  if (last) {
    const parts: string[] = [];
    if (lastBurnout != null && lastBurnout >= 4) parts.push("burnout screen elevated");
    else if (lastBurnout != null) parts.push("burnout screen below threshold");
    if (lastHours != null) parts.push(`${lastHours} hrs/week unrecognized work`);
    if (last.track_energy != null) parts.push(`track energy ${last.track_energy}/10`);
    last_summary = parts.length ? parts.join(" · ") : "Last pulse recorded";
  }

  return {
    due,
    quarter_label: currentQuarterLabel(),
    days_since_last: days,
    modules: QUARTERLY_MODULES,
    last_summary,
    triggers,
  };
}

export function buildQuarterlyPulseSummary(input: {
  quarter: string;
  prevScore: number | null;
  newScore: number;
  burnoutLight: "green" | "amber" | "red";
  invisibleHours: number | null;
  invisibleDeltaPct: number | null;
  achievements?: string;
}): string {
  const lines: string[] = [`${input.quarter} Update:`];

  if (input.achievements) {
    lines.push(`✅ ${input.achievements}`);
  }

  const burnoutEmoji =
    input.burnoutLight === "green" ? "🟢" : input.burnoutLight === "amber" ? "🟡" : "🔴";
  lines.push(`Burnout screen: ${burnoutEmoji} ${input.burnoutLight === "green" ? "Low Risk" : input.burnoutLight === "amber" ? "Moderate Risk" : "High Risk"}`);

  if (input.invisibleHours != null) {
    const delta =
      input.invisibleDeltaPct != null
        ? ` (${input.invisibleDeltaPct > 0 ? "↑" : "↓"}${Math.abs(Math.round(input.invisibleDeltaPct))}% from baseline)`
        : "";
    lines.push(`Unrecognized work: ~${input.invisibleHours} hours/week${delta}`);
  }

  if (input.prevScore != null) {
    const delta = input.newScore - input.prevScore;
    lines.push(
      `Career Health Score: ${input.newScore}/100 (${delta >= 0 ? "↑" : "↓"}${Math.abs(delta)} from last quarter)`,
    );
  } else {
    lines.push(`Career Health Score: ${input.newScore}/100`);
  }

  return lines.join("\n");
}

export function parsePulseAnswers(answers: PulseAnswer[]): Partial<PulseRecord> {
  const get = (module: string, q: string) =>
    answers.find((a) => a.module_id === module && a.question_id === q)?.value;

  const exhaustion = Number(get("pfi_screen", "exhaustion"));
  const depersonalization = Number(get("pfi_screen", "depersonalization"));
  const burnout_screen =
    !Number.isNaN(exhaustion) && !Number.isNaN(depersonalization)
      ? Math.max(exhaustion, depersonalization)
      : undefined;

  const invisible_hours = Number(get("invisible_pulse", "weekly_hours"));
  const track_energy = Number(get("career_momentum", "track_energy"));

  return {
    burnout_screen,
    invisible_hours: Number.isNaN(invisible_hours) ? undefined : invisible_hours,
    track_energy: Number.isNaN(track_energy) ? undefined : track_energy,
  };
}

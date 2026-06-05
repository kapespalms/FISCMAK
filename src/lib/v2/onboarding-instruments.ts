import type { CareerLevel, PracticeSetting } from "@/lib/v2/onboarding-options";
import {
  PFI_DEPERSONALIZATION_STEM,
  PFI_EXHAUSTION_STEM,
  PFI_FULFILLMENT_STEM,
  PFI_SCALE_INSTRUCTION,
  PFI_SELF_VALUATION_STEM,
  pfiScreenPrompt,
} from "@/lib/v2/pfi-scale";

export type InstrumentCluster = {
  id: string;
  instrumentId: string;
  label: string;
  /** Mak coaching intro/outro — wraps the published stem; never paraphrase the stem in UI. */
  makPrompt: string;
  /** Published validated item text — shown verbatim in check-in UI. */
  publishedStem: string;
  /** Expected numeric range for Likert extraction */
  likertMax: number;
};

const PFI_SCALE = PFI_SCALE_INSTRUCTION;

/** Quarterly PFI 2-item screen — same stems and 0–4 scale as onboarding burnout clusters. */
export const PFI_QUARTERLY_SCREEN_CLUSTERS: Pick<
  InstrumentCluster,
  "id" | "publishedStem" | "likertMax"
>[] = [
  {
    id: "pfi-burnout-exhaustion",
    publishedStem: PFI_EXHAUSTION_STEM,
    likertMax: 4,
  },
  {
    id: "pfi-burnout-disengagement",
    publishedStem: PFI_DEPERSONALIZATION_STEM,
    likertMax: 4,
  },
];

export function formatInstrumentCheckInDisplay(cluster: InstrumentCluster): string {
  if (cluster.likertMax === 0) {
    return `${cluster.makPrompt}\n\n"${cluster.publishedStem}"`;
  }
  const scale =
    cluster.likertMax === 4 && cluster.instrumentId === "pfi"
      ? PFI_SCALE
      : `Rate from 0 to ${cluster.likertMax}.`;
  return `${cluster.makPrompt}\n\n"${cluster.publishedStem}"\n\n${scale}`;
}

export function formatPfiQuarterlyScreenPrompt(): string {
  return pfiScreenPrompt();
}

export type InstrumentScore = {
  instrumentId: string;
  name: string;
  raw: Record<string, number>;
  composite?: number;
  interpretation?: string;
};

const PFI_CLUSTERS: InstrumentCluster[] = [
  {
    id: "pfi-fulfillment",
    instrumentId: "pfi",
    label: "Professional fulfillment",
    makPrompt: "Here's a standard professional fulfillment question.",
    publishedStem: PFI_FULFILLMENT_STEM,
    likertMax: 4,
  },
  {
    id: "pfi-burnout-exhaustion",
    instrumentId: "pfi",
    label: "Work exhaustion",
    makPrompt: "Next, a standard work exhaustion question.",
    publishedStem: PFI_EXHAUSTION_STEM,
    likertMax: 4,
  },
  {
    id: "pfi-burnout-disengagement",
    instrumentId: "pfi",
    label: "Interpersonal disengagement",
    makPrompt: "One more on how work affects your connections with others.",
    publishedStem: PFI_DEPERSONALIZATION_STEM,
    likertMax: 4,
  },
  {
    id: "pfi-self-valuation",
    instrumentId: "pfi",
    label: "Self-valuation",
    makPrompt: "Last PFI question — how valued you feel at work.",
    publishedStem: PFI_SELF_VALUATION_STEM,
    likertMax: 4,
  },
];

const BITS_CLUSTERS: InstrumentCluster[] = [
  {
    id: "bits-unnecessary",
    instrumentId: "bits",
    label: "Unnecessary tasks",
    makPrompt: "A question about unnecessary tasks in your work.",
    publishedStem: "I spend a lot of time on tasks that I think are unnecessary.",
    likertMax: 5,
  },
  {
    id: "bits-unreasonable",
    instrumentId: "bits",
    label: "Unreasonable tasks",
    makPrompt: "And one about tasks that feel unreasonable for your role.",
    publishedStem:
      "I spend a lot of time on tasks that are unreasonable given my training and role.",
    likertMax: 5,
  },
];

const CAREER_CLUSTERS: InstrumentCluster[] = [
  {
    id: "career-track-energy",
    instrumentId: "career_aspirations",
    label: "Primary track energy",
    makPrompt: "How energized do you feel about your primary career track right now?",
    publishedStem:
      "How energized do you feel about your primary career track right now? (1 = very low, 10 = very high)",
    likertMax: 10,
  },
  {
    id: "career-5yr-goal",
    instrumentId: "career_aspirations",
    label: "Five-year goal",
    makPrompt: "What is your most important career goal for the next five years?",
    publishedStem: "What is your most important career goal for the next five years?",
    likertMax: 0,
  },
];

const PIF_CLUSTERS: InstrumentCluster[] = [
  {
    id: "pif-stage",
    instrumentId: "pif",
    label: "Identity formation",
    makPrompt: "A question about how your professional identity is forming.",
    publishedStem:
      "My professional identity is mostly shaped by others' expectations, authored by me, or transforming beyond either. (1 = others' expectations, 5 = self-transforming)",
    likertMax: 5,
  },
];

const UWES_CLUSTERS: InstrumentCluster[] = [
  {
    id: "uwes-engagement",
    instrumentId: "uwes",
    label: "Work engagement",
    makPrompt: "A standard work engagement question.",
    publishedStem: "I am enthusiastic about my job.",
    likertMax: 6,
  },
];

const INVISIBLE_CLUSTERS: InstrumentCluster[] = [
  {
    id: "iw-hours",
    instrumentId: "invisible_work",
    label: "Invisible hours",
    makPrompt: "Estimate your weekly unrecognized work hours.",
    publishedStem:
      "Roughly how many hours per week do you spend on invisible work — after-hours EHR, prior auth, care coordination, uncompensated call, informal mentoring?",
    likertMax: 80,
  },
];

/**
 * Day-0 environmental context items — physician-owned, never institution-facing at individual level.
 * Feeds Career Urgency and Environmental Diagnosis (Phase 5). All items are optional / skippable.
 * "skip" values are stored and treated as null by formula consumers.
 */
const CAREER_ENVIRONMENT_CLUSTERS: InstrumentCluster[] = [
  {
    id: "env-schedule-control",
    instrumentId: "career_environment",
    label: "Schedule control",
    makPrompt:
      "One thing that shapes how sustainable work feels day-to-day is how much control you have over your time. This is just for context — no right answer:",
    publishedStem:
      "How much control do you have over your own schedule? (1 = very little, 5 = a lot)",
    likertMax: 5,
  },
  {
    id: "env-intent-to-leave",
    instrumentId: "career_environment",
    label: "Institutional anchoring",
    makPrompt:
      "I want to understand where you're anchored right now — completely yours, just helps me understand your starting point:",
    publishedStem:
      "How likely are you to leave your current institution within the next 2 years? (1 = very unlikely, 5 = very likely)",
    likertMax: 5,
  },
  {
    id: "env-qol-baseline",
    instrumentId: "career_environment",
    label: "Quality of life baseline",
    makPrompt: "One more baseline before we move on — a simple anchor point:",
    publishedStem:
      "How would you rate your overall quality of life right now? (0 = poor, 10 = excellent)",
    likertMax: 10,
  },
  {
    id: "env-values-dept-alignment",
    instrumentId: "career_environment",
    label: "Department values fit",
    makPrompt:
      "A few quick questions about your work environment — this helps me understand the context you're navigating:",
    publishedStem:
      "The values of my department align with my own. (1 = strongly disagree, 5 = strongly agree)",
    likertMax: 5,
  },
  {
    id: "env-leaders-value-input",
    instrumentId: "career_environment",
    label: "Leadership recognition",
    makPrompt: "Related to that:",
    publishedStem:
      "Leaders value my input. (1 = strongly disagree, 5 = strongly agree)",
    likertMax: 5,
  },
  {
    id: "env-org-goals-fit",
    instrumentId: "career_environment",
    label: "Organizational goal alignment",
    makPrompt: "And one more on your environment:",
    publishedStem:
      "The organization's goals fit with my own. (1 = strongly disagree, 5 = strongly agree)",
    likertMax: 5,
  },
];

const ALL_CLUSTERS: InstrumentCluster[] = [
  ...PFI_CLUSTERS,
  ...BITS_CLUSTERS,
  ...CAREER_CLUSTERS,
  ...PIF_CLUSTERS,
  ...UWES_CLUSTERS,
  ...INVISIBLE_CLUSTERS,
  ...CAREER_ENVIRONMENT_CLUSTERS,
];

export function clustersForInstruments(instrumentIds: string[]): InstrumentCluster[] {
  const set = new Set(instrumentIds);
  return ALL_CLUSTERS.filter((c) => set.has(c.instrumentId));
}

export type InstrumentAnswer = {
  clusterId: string;
  value: number | string;
  capturedAt: string;
};

export function scorePfi(answers: InstrumentAnswer[]): InstrumentScore {
  const num = (id: string) => {
    const v = answers.find((a) => a.clusterId === id)?.value;
    return typeof v === "number" ? v : null;
  };
  const fulfillment = num("pfi-fulfillment");
  const exhaustion = num("pfi-burnout-exhaustion");
  const disengagement = num("pfi-burnout-disengagement");
  const selfVal = num("pfi-self-valuation");

  const burnoutItems = [exhaustion, disengagement].filter((v): v is number => v != null);
  const burnoutMean = burnoutItems.length
    ? burnoutItems.reduce((s, v) => s + v, 0) / burnoutItems.length
    : null;
  const burnoutScore = burnoutMean != null ? burnoutMean * 2.5 : null;

  return {
    instrumentId: "pfi",
    name: "Stanford PFI",
    raw: {
      fulfillment: fulfillment ?? 0,
      burnout: burnoutScore ?? 0,
      self_valuation: selfVal ?? 0,
    },
    composite: burnoutScore ?? undefined,
    interpretation:
      burnoutScore != null && burnoutScore >= 3.325
        ? "Positive burnout screen — worth monitoring."
        : fulfillment != null && fulfillment >= 3
          ? "Strong professional fulfillment signal."
          : "Baseline captured.",
  };
}

export function scoreBits(answers: InstrumentAnswer[]): InstrumentScore {
  const num = (id: string) => {
    const v = answers.find((a) => a.clusterId === id)?.value;
    return typeof v === "number" ? v : null;
  };
  const unnecessary = num("bits-unnecessary") ?? 0;
  const unreasonable = num("bits-unreasonable") ?? 0;
  return {
    instrumentId: "bits",
    name: "BITS",
    raw: { unnecessary, unreasonable },
    composite: (unnecessary + unreasonable) / 2,
    interpretation: unreasonable >= 3.5 ? "Elevated unreasonable-task burden." : "Baseline captured.",
  };
}

export function scoreInvisibleWork(
  answers: InstrumentAnswer[],
  totalWorkHours = 50,
): InstrumentScore {
  const hours =
    typeof answers.find((a) => a.clusterId === "iw-hours")?.value === "number"
      ? (answers.find((a) => a.clusterId === "iw-hours")!.value as number)
      : 0;
  const ratio = totalWorkHours > 0 ? hours / totalWorkHours : 0;
  return {
    instrumentId: "invisible_work",
    name: "Invisible Work Log",
    raw: { weekly_hours: hours, invisible_ratio: ratio },
    composite: ratio,
  };
}

export function computeIwq(bits: InstrumentScore, invisible: InstrumentScore): number {
  const unreasonable = bits.raw.unreasonable ?? 0;
  const unnecessary = bits.raw.unnecessary ?? 0;
  const ratio = invisible.raw.invisible_ratio ?? 0;
  return unreasonable * 0.4 + unnecessary * 0.3 + ratio * 10 * 0.3;
}

export function computeCdi(input: {
  setting: PracticeSetting | null;
  pfi?: InstrumentScore;
  bits?: InstrumentScore;
  sIndex?: number;
  clinicalProductivity?: number;
}): { score: number; domains: Record<string, number> } {
  const wellbeing = input.pfi
    ? Math.max(0, 100 - (input.pfi.raw.burnout ?? 0) * 10)
    : 50;
  const scholarly = Math.min(100, (input.sIndex ?? 30) * 2);
  const clinical = input.clinicalProductivity ?? 50;
  const service = Math.min(100, (input.sIndex ?? 30) * 1.5);
  const education = 50;
  const scope = 50;

  const academic = {
    Scholarly: scholarly * 0.25,
    Clinical: clinical * 0.2,
    Education: education * 0.15,
    Service: service * 0.15,
    Scope: scope * 0.1,
    Wellbeing: wellbeing * 0.15,
  };

  const community = {
    Clinical: clinical * 0.3,
    Scope: scope * 0.2,
    Leadership: service * 0.15,
    Wellbeing: wellbeing * 0.2,
    Growth: education * 0.15,
  };

  const industry = {
    Expertise: scholarly * 0.25,
    Leadership: service * 0.25,
    Innovation: scope * 0.2,
    Wellbeing: wellbeing * 0.15,
    Network: clinical * 0.15,
  };

  const weights =
    input.setting === "Community" || input.setting === "Hybrid"
      ? community
      : input.setting === "Industry"
        ? industry
        : academic;

  const score = Math.round(Object.values(weights).reduce((s, v) => s + v, 0));
  return { score, domains: weights };
}

export function extractClusterValue(
  message: string,
  cluster: InstrumentCluster,
): number | string | null {
  const lower = message.toLowerCase();
  if (cluster.likertMax === 0) {
    const trimmed = message.trim();
    return trimmed.length > 8 ? trimmed : null;
  }
  // Explicit skip/decline — physician may decline any item; record as "skip" so it advances
  if (/\b(skip|pass|decline|rather not|prefer not|no answer|not comfortable|n\/a)\b/i.test(message)) {
    return "skip";
  }
  const max = cluster.likertMax;
  const m = message.match(new RegExp(`\\b(\\d+(?:\\.\\d+)?)\\s*(?:\\/\\s*${max})?\\b`));
  if (m) {
    const n = parseFloat(m[1]);
    if (n >= 0 && n <= max) return n;
  }
  if (max === 10 && /\bvery energized\b|\bhigh energy\b/.test(lower)) return 9;
  if (max === 10 && /\bdrained\b|\blow energy\b/.test(lower)) return 3;
  if (max <= 5 && /\bnever\b|\brarely\b/.test(lower)) return 1;
  if (max <= 5 && /\boften\b|\bconstantly\b|\bmost of the time\b/.test(lower)) return 4;
  return null;
}

/**
 * Returns each career_environment item as a number in raw, or omits the key
 * entirely if the item was skipped or not yet answered.
 *
 * CANONICAL SOURCE NOTE: Phase-5 formulas (Career Urgency, Environmental Dx)
 * and the GME well-being aggregate must read the typed onboarding_metadata
 * fields (schedule_control, intent_to_leave, …) — NOT this raw map — because
 * those fields use null for "no data" while InstrumentScore.raw is
 * Record<string,number> and cannot express null. Absent keys here mean "not
 * captured"; any consumer that averages or thresholds this map would
 * incorrectly treat a missing item as a real 0-scale value.
 */
export function scoreCareerEnvironment(answers: InstrumentAnswer[]): InstrumentScore {
  const raw: Record<string, number> = {};
  const CLUSTERS = [
    ["env-schedule-control", "schedule_control"],
    ["env-intent-to-leave", "intent_to_leave"],
    ["env-qol-baseline", "qol_baseline"],
    ["env-values-dept-alignment", "values_dept_alignment"],
    ["env-leaders-value-input", "leaders_value_input"],
    ["env-org-goals-fit", "org_goals_fit"],
  ] as const;
  for (const [clusterId, key] of CLUSTERS) {
    const v = answers.find((a) => a.clusterId === clusterId)?.value;
    if (typeof v === "number") raw[key] = v;
    // "skip" or absent → key omitted (not -1); callers must treat absence as unavailable
  }
  return {
    instrumentId: "career_environment",
    name: "Career Environment Context",
    raw,
  };
}

export function scoreAllInstruments(
  instrumentIds: string[],
  answers: InstrumentAnswer[],
): InstrumentScore[] {
  const scores: InstrumentScore[] = [];
  if (instrumentIds.includes("pfi")) scores.push(scorePfi(answers));
  if (instrumentIds.includes("bits")) scores.push(scoreBits(answers));
  if (instrumentIds.includes("invisible_work")) scores.push(scoreInvisibleWork(answers));
  if (instrumentIds.includes("uwes")) {
    const v = answers.find((a) => a.clusterId === "uwes-engagement")?.value;
    scores.push({
      instrumentId: "uwes",
      name: "UWES-9",
      raw: { engagement: typeof v === "number" ? v : 0 },
      composite: typeof v === "number" ? v : undefined,
    });
  }
  if (instrumentIds.includes("pif")) {
    const v = answers.find((a) => a.clusterId === "pif-stage")?.value;
    scores.push({
      instrumentId: "pif",
      name: "PIF Scale",
      raw: { stage: typeof v === "number" ? v : 0 },
      composite: typeof v === "number" ? v : undefined,
    });
  }
  if (instrumentIds.includes("career_aspirations")) {
    const energy = answers.find((a) => a.clusterId === "career-track-energy")?.value;
    scores.push({
      instrumentId: "career_aspirations",
      name: "Career Aspirations",
      raw: {
        track_energy: typeof energy === "number" ? energy : 0,
      },
      composite: typeof energy === "number" ? energy : undefined,
    });
  }
  if (instrumentIds.includes("career_environment")) {
    scores.push(scoreCareerEnvironment(answers));
  }
  return scores;
}

export function instrumentProgress(
  instrumentIds: string[],
  answers: InstrumentAnswer[],
): { total: number; answered: number; pendingCluster: InstrumentCluster | null } {
  const clusters = clustersForInstruments(instrumentIds);
  const answeredIds = new Set(answers.map((a) => a.clusterId));
  const pending = clusters.find((c) => !answeredIds.has(c.id)) ?? null;
  return {
    total: clusters.length,
    answered: clusters.filter((c) => answeredIds.has(c.id)).length,
    pendingCluster: pending,
  };
}

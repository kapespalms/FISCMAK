import type { CareerLevel, PracticeSetting } from "@/lib/v2/onboarding-options";

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

export function formatInstrumentCheckInDisplay(cluster: InstrumentCluster): string {
  if (cluster.likertMax === 0) {
    return `${cluster.makPrompt}\n\n"${cluster.publishedStem}"`;
  }
  return `${cluster.makPrompt}\n\n"${cluster.publishedStem}"\n\nRate from 0 to ${cluster.likertMax}.`;
}

export type InstrumentScore = {
  instrumentId: string;
  name: string;
  raw: Record<string, number>;
  composite?: number;
  interpretation?: string;
};

// ---------------------------------------------------------------------------
// WHO-5 Well-Being Index (public domain — WHO Regional Office Europe 1998)
// 5 items, 0–5 scale (0=At no time … 5=All of the time), past 2 weeks.
// Raw sum 0–25; multiply ×4 for 0–100 percentage score.
// ≥52 = adequate well-being; <28 = likely depression screen positive.
// ---------------------------------------------------------------------------

const WHO5_CLUSTERS: InstrumentCluster[] = [
  {
    id: "who5-cheerful",
    instrumentId: "who5",
    label: "Cheerful and good spirits",
    makPrompt: "A few quick questions about the past two weeks — there are no right answers:",
    publishedStem: "I have felt cheerful and in good spirits. (0 = at no time, 5 = all of the time)",
    likertMax: 5,
  },
  {
    id: "who5-calm",
    instrumentId: "who5",
    label: "Calm and relaxed",
    makPrompt: "Still thinking about the past two weeks:",
    publishedStem: "I have felt calm and relaxed. (0 = at no time, 5 = all of the time)",
    likertMax: 5,
  },
  {
    id: "who5-active",
    instrumentId: "who5",
    label: "Active and vigorous",
    makPrompt: "",
    publishedStem: "I have felt active and vigorous. (0 = at no time, 5 = all of the time)",
    likertMax: 5,
  },
  {
    id: "who5-rested",
    instrumentId: "who5",
    label: "Woke up fresh and rested",
    makPrompt: "",
    publishedStem: "I woke up feeling fresh and rested. (0 = at no time, 5 = all of the time)",
    likertMax: 5,
  },
  {
    id: "who5-interest",
    instrumentId: "who5",
    label: "Daily life filled with interest",
    makPrompt: "",
    publishedStem: "My daily life has been filled with things that interest me. (0 = at no time, 5 = all of the time)",
    likertMax: 5,
  },
];

// ---------------------------------------------------------------------------
// Single-Item Burnout — West et al. 2009 (public domain, no permission needed).
// "Using your own definition of burnout, how would you rate your current level?"
// 1–5 labeled scale; score ≥ 3 = positive burnout signal.
// Single-item burnout signal for Career Urgency.
// ---------------------------------------------------------------------------

const SINGLE_ITEM_BURNOUT_CLUSTERS: InstrumentCluster[] = [
  {
    id: "sib-level",
    instrumentId: "single_item_burnout",
    label: "Burnout level",
    makPrompt:
      "One question about how you've been feeling at work — use your own sense of what burnout means to you:",
    publishedStem:
      "Using your own definition of burnout, how would you rate your current level of burnout? " +
      "(1 = I enjoy my work, no symptoms; 2 = Under stress but not burned out; " +
      "3 = Definitely burning out, have symptoms; 4 = Symptoms won't go away, hard to function; " +
      "5 = Completely burned out, may need help)",
    likertMax: 5,
  },
];

/** Quarterly single-item burnout screen cluster — used by the quarterly pulse check-in. */
export const BURNOUT_QUARTERLY_SCREEN_CLUSTERS: Pick<
  InstrumentCluster,
  "id" | "publishedStem" | "likertMax"
>[] = [
  {
    id: "sib-level",
    publishedStem:
      "Using your own definition of burnout, how would you rate your current level of burnout? (1–5)",
    likertMax: 5,
  },
];

// ---------------------------------------------------------------------------
// PHQ-2 (Kroenke & Spitzer 2002 — public domain, no permission required).
// 2 items, 0–3 scale (0=Not at all … 3=Nearly every day), past 2 weeks.
// Score ≥ 3 → distress-routing trigger (Ticket 17); feeds PHQ-2 + MDT crisis gate.
// ---------------------------------------------------------------------------

const PHQ2_CLUSTERS: InstrumentCluster[] = [
  {
    id: "phq2-anhedonia",
    instrumentId: "phq2",
    label: "Anhedonia",
    makPrompt:
      "Two more questions about the past two weeks — these help me make sure I'm supporting you well:",
    publishedStem:
      "Little interest or pleasure in doing things. (0 = not at all, 3 = nearly every day)",
    likertMax: 3,
  },
  {
    id: "phq2-depression",
    instrumentId: "phq2",
    label: "Depressed mood",
    makPrompt: "",
    publishedStem:
      "Feeling down, depressed, or hopeless. (0 = not at all, 3 = nearly every day)",
    likertMax: 3,
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

/** FISCMAK-owned professional identity item — no external instrument reference. */
const PIF_CLUSTERS: InstrumentCluster[] = [
  {
    id: "pif-stage",
    instrumentId: "pif",
    label: "Professional identity stage",
    makPrompt: "One question about where you are with your identity as a physician:",
    publishedStem:
      "Where are you with your identity as a physician right now? " +
      "(1 = Still figuring out who I am in medicine · 2 = Actively shaping it on my own terms · " +
      "3 = Settled, and evolving it intentionally · 4 = Haven't really thought about it)",
    likertMax: 4,
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
  ...WHO5_CLUSTERS,
  ...SINGLE_ITEM_BURNOUT_CLUSTERS,
  ...PHQ2_CLUSTERS,
  ...CAREER_CLUSTERS,
  ...PIF_CLUSTERS,
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

// ---------------------------------------------------------------------------
// Scoring functions
// ---------------------------------------------------------------------------

export function scoreWho5(answers: InstrumentAnswer[]): InstrumentScore {
  const num = (id: string) => {
    const v = answers.find((a) => a.clusterId === id)?.value;
    return typeof v === "number" ? v : null;
  };
  const items = [
    num("who5-cheerful"),
    num("who5-calm"),
    num("who5-active"),
    num("who5-rested"),
    num("who5-interest"),
  ];
  const answered = items.filter((v): v is number => v != null);
  const rawSum = answered.length ? answered.reduce((s, v) => s + v, 0) : null;
  // Pro-rate if < 5 items answered; ×4 to convert 0–25 to 0–100 percentage score
  const prorated = rawSum != null && answered.length > 0 ? (rawSum / answered.length) * 5 : null;
  const pct = prorated != null ? Math.round(prorated * 4) : null;
  return {
    instrumentId: "who5",
    name: "WHO-5 Well-Being Index",
    raw: {
      raw_sum: rawSum ?? 0,
      percentage_score: pct ?? 0,
      items_answered: answered.length,
    },
    composite: pct ?? undefined,
    interpretation:
      pct == null
        ? "Pending."
        : pct < 28
          ? "Well-being concern — consider reviewing resources."
          : pct < 52
            ? "Moderate well-being — worth monitoring."
            : "Adequate well-being.",
  };
}

/** Single-Item Burnout (West et al. 2009). Score ≥ 3 = positive burnout signal. */
export function scoreSingleItemBurnout(answers: InstrumentAnswer[]): InstrumentScore {
  const v = answers.find((a) => a.clusterId === "sib-level")?.value;
  const score = typeof v === "number" ? v : null;
  return {
    instrumentId: "single_item_burnout",
    name: "Single-Item Burnout",
    raw: { level: score ?? 0 },
    composite: score ?? undefined,
    interpretation:
      score == null
        ? "Pending."
        : score >= 3
          ? "Positive burnout signal — worth monitoring."
          : "Below burnout threshold — baseline captured.",
  };
}

/**
 * PHQ-2. Score ≥ 3 feeds distress routing (Ticket 17) alongside MDT.
 * Not a diagnostic — a triage signal only.
 */
export function scorePhq2(answers: InstrumentAnswer[]): InstrumentScore {
  const num = (id: string) => {
    const v = answers.find((a) => a.clusterId === id)?.value;
    return typeof v === "number" ? v : null;
  };
  const anhedonia = num("phq2-anhedonia") ?? 0;
  const depression = num("phq2-depression") ?? 0;
  const total = anhedonia + depression;
  return {
    instrumentId: "phq2",
    name: "PHQ-2",
    raw: { anhedonia, depression, total },
    composite: total,
    interpretation:
      total >= 3
        ? "PHQ-2 positive — distress routing active."
        : "PHQ-2 below threshold.",
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

/**
 * IWQ — unrecognized-work burden, using invisible_work ratio only.
 * Invisible-work ratio × 10 gives a 0–10 signal on a 50-hr week baseline.
 */
export function computeIwq(invisible: InstrumentScore): number {
  const ratio = invisible.raw.invisible_ratio ?? 0;
  return ratio * 10;
}

export function computeCdi(input: {
  setting: PracticeSetting | null;
  burnoutLevel?: number | null;
  sIndex?: number;
  clinicalProductivity?: number;
}): { score: number; domains: Record<string, number> } {
  // Wellbeing derived from Single-Item Burnout (1–5 → inverted 0–100)
  const wellbeing = input.burnoutLevel != null
    ? Math.max(0, Math.round(100 - (input.burnoutLevel - 1) * 25))
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
  if (instrumentIds.includes("who5")) scores.push(scoreWho5(answers));
  if (instrumentIds.includes("single_item_burnout")) scores.push(scoreSingleItemBurnout(answers));
  if (instrumentIds.includes("phq2")) scores.push(scorePhq2(answers));
  if (instrumentIds.includes("invisible_work")) scores.push(scoreInvisibleWork(answers));
  if (instrumentIds.includes("pif")) {
    const v = answers.find((a) => a.clusterId === "pif-stage")?.value;
    scores.push({
      instrumentId: "pif",
      name: "Professional Identity (FISCMAK)",
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
): { total: number; answered: number; pendingCluster: InstrumentCluster | null };
export function instrumentProgress(
  instrumentIds: string[],
  answers: InstrumentAnswer[],
): { total: number; answered: number; pendingCluster: InstrumentCluster | null };
export function instrumentProgress(
  instrumentIds: string[],
  answers: InstrumentAnswer[] = [],
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

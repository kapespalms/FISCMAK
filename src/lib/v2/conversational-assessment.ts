import type { AppUser, CareerAssessment, QuestionDef } from "@/lib/v2/types";
import { QUESTION_BANK, questionsForTouchpoint } from "@/lib/v2/question-bank";
import type { CareerStage } from "@/lib/v2/onboarding-options";
import { formatSpecialtyLine, normalizeSpecialtyProfile } from "@/lib/v2/specialty-hierarchy";

export type ExtractedAnswer = {
  q_id: string;
  answer: string | number;
  confidence: "high" | "medium";
};

const CAREER_STAGE_TO_RANK: Partial<Record<CareerStage, string>> = {
  "Medical Student": "Student",
  Resident: "Resident",
  Fellow: "Fellow",
  "Early Career (0–7 yr)": "Assistant Professor",
  "Mid-Career (8–20 yr)": "Associate Professor",
  "Late Career (20+ yr)": "Full Professor",
  Retired: "Full Professor",
};

const LEGACY_RANK: Record<string, string> = {
  "Early Attending": "Assistant Professor",
  "Mid-Career Attending": "Associate Professor",
  "Senior Attending": "Full Professor",
};

export function getGloballyAnsweredIds(assessments: CareerAssessment[]): string[] {
  const ids = new Set<string>();
  for (const a of assessments) {
    for (const q of a.questions_answered) ids.add(q.q_id);
  }
  return [...ids];
}

export function getPendingQuestions(
  touchpoint: number,
  assessments: CareerAssessment[],
): QuestionDef[] {
  const answered = new Set(getGloballyAnsweredIds(assessments));
  return questionsForTouchpoint(touchpoint).filter((q) => !answered.has(q.q_id));
}

export function seedAnswersFromProfile(user: AppUser): ExtractedAnswer[] {
  const seeded: ExtractedAnswer[] = [];
  if (user.career_stage) {
    const rank =
      CAREER_STAGE_TO_RANK[user.career_stage] ?? LEGACY_RANK[user.career_stage];
    if (rank) {
      seeded.push({ q_id: "Q1.1", answer: rank, confidence: "high" });
    }
  }
  if (user.primary_career_track) {
    seeded.push({ q_id: "Q1.6", answer: user.primary_career_track, confidence: "high" });
  } else if (user.specialty) {
    seeded.push({
      q_id: "Q1.6",
      answer: inferPrimaryDomain(user.specialty),
      confidence: "medium",
    });
  }
  if (user.name) {
    const line = formatSpecialtyLine(normalizeSpecialtyProfile(user));
    seeded.push({
      q_id: "Q1.3",
      answer: `${user.name}, ${line} — ${user.career_stage ?? "career stage pending"}.`,
      confidence: "medium",
    });
  }
  return seeded;
}

function inferPrimaryDomain(specialty: string): string {
  const s = specialty.toLowerCase();
  if (/pathology|radiology|lab/.test(s)) return "Research";
  if (/surgery|anesthesia|emergency|hospitalist|internal medicine|family/.test(s)) return "Clinical";
  if (/pediatric|med-ed|education/.test(s)) return "Teaching";
  return "Clinical";
}

function matchChoice(text: string, options: string[]): string | null {
  const lower = text.toLowerCase();
  for (const opt of options) {
    if (lower.includes(opt.toLowerCase())) return opt;
  }
  if (options.includes("Yes") && /\byes\b|\bI do\b|\bhave one\b/.test(lower)) return "Yes";
  if (options.includes("No") && /\bno\b|\bdon't\b|\bdo not\b/.test(lower)) return "No";
  if (options.includes("Looking for one") && /looking|need a mentor|seeking/.test(lower)) {
    return "Looking for one";
  }
  return null;
}

function extractLikert(text: string): number | null {
  const m = text.match(/\b([1-5])\s*(?:\/\s*5|out of 5)?\b/);
  if (m) return parseInt(m[1], 10);
  if (/\bvery clear\b|\bhigh clarity\b/.test(text.toLowerCase())) return 5;
  if (/\bunclear\b|\bunsure\b|\blost\b/.test(text.toLowerCase())) return 2;
  return null;
}

export function extractAnswersFromMessage(
  message: string,
  pending: QuestionDef[],
  user: AppUser,
): ExtractedAnswer[] {
  const lower = message.toLowerCase();
  const found: ExtractedAnswer[] = [];

  for (const q of pending) {
    if (q.q_id === "Q1.2" && q.options) {
      const m = matchChoice(message, q.options);
      if (m) found.push({ q_id: q.q_id, answer: m, confidence: "high" });
      continue;
    }
    if (q.q_id === "Q1.7" && q.options) {
      const m = matchChoice(message, q.options);
      if (m) found.push({ q_id: q.q_id, answer: m, confidence: "high" });
      continue;
    }
    if (q.q_id === "Q1.4" && /goal|promotion|professor|next \d|years|aim|want to/.test(lower)) {
      found.push({ q_id: q.q_id, answer: message.trim(), confidence: "medium" });
      continue;
    }
    if (q.q_id === "Q1.3" && /identity|describe myself|I am a|I'm a|see myself as/.test(lower)) {
      found.push({ q_id: q.q_id, answer: message.trim(), confidence: "medium" });
      continue;
    }
    if (q.question_type === "likert") {
      const n = extractLikert(message);
      if (n != null) found.push({ q_id: q.q_id, answer: n, confidence: "high" });
      continue;
    }
    if (q.q_id === "Q2.1" && /teach|course|lecture|curriculum|educator/.test(lower)) {
      found.push({ q_id: q.q_id, answer: message.trim(), confidence: "medium" });
      continue;
    }
    if (q.q_id === "Q2.2" && /mentor|mentored|resident|fellow/.test(lower)) {
      found.push({ q_id: q.q_id, answer: message.trim(), confidence: "medium" });
      continue;
    }
    if (q.q_id === "Q2.4" && /clinical|attending|patient|practice|hospital/.test(lower)) {
      found.push({ q_id: q.q_id, answer: message.trim(), confidence: "medium" });
      continue;
    }
    if (q.q_id === "Q2.5" && /committee|chair|task force|council/.test(lower)) {
      found.push({ q_id: q.q_id, answer: message.trim(), confidence: "medium" });
      continue;
    }
  }

  if (user.career_stage && !found.some((f) => f.q_id === "Q1.1")) {
    const rank = CAREER_STAGE_TO_RANK[user.career_stage];
    if (rank && pending.some((p) => p.q_id === "Q1.1")) {
      found.push({ q_id: "Q1.1", answer: rank, confidence: "high" });
    }
  }

  const seen = new Set<string>();
  return found.filter((f) => {
    if (seen.has(f.q_id)) return false;
    seen.add(f.q_id);
    return pending.some((p) => p.q_id === f.q_id);
  });
}

export function questionById(qId: string): QuestionDef | undefined {
  return QUESTION_BANK.find((q) => q.q_id === qId);
}

export function buildConversationalPrompt(
  user: AppUser,
  pending: QuestionDef[],
  onboarding: boolean,
): string {
  if (!onboarding) return "";
  const lines = [
    "ONBOARDING MODE: Guide a 10–15 minute welcome conversation. Do NOT present a form or numbered questionnaire.",
    "Ask one natural question at a time. Weave in career assessment topics conversationally.",
    `Physician: ${user.name ?? "Unknown"}, ${user.specialty ?? "specialty pending"}, ${user.career_stage ?? "stage pending"}.`,
  ];
  if (pending.length > 0) {
    lines.push(
      `Still learn naturally (do not quote verbatim): ${pending.slice(0, 3).map((q) => q.question).join(" | ")}`,
    );
  } else {
    lines.push("Intro touchpoint is complete. Summarize what you learned and invite CV upload or capturing invisible work.");
  }
  return lines.join("\n");
}

import type { AppUser } from "@/lib/v2/types";
import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";
import { scoreAllInstruments } from "@/lib/v2/onboarding-instruments";
import { deployedInstruments } from "@/lib/v2/onboarding-touchpoint1";
import { parsePulseAnswers, type PulseAnswer } from "@/lib/v2/quarterly-pulse";
import { parseAnnualAnswers, type AnnualRefreshAnswer } from "@/lib/v2/annual-refresh";
import { dominantInvisibleWorkByLevel } from "@/lib/v2/invisible-work-taxonomy";

export type SummaryConfirmIntent = "yes" | "change" | "not_quite";

const YES_PATTERNS =
  /\b(yes[,.]?\s*save|yes\s+that'?s?\s+right|sounds?\s+right|looks?\s+good|save\s+this|confirm)\b/i;
const CHANGE_PATTERNS = /\b(change\s+with\s+mak|edit\s+summary|update\s+summary|revise)\b/i;
const NOT_QUITE_PATTERNS = /\b(not\s+quite|doesn'?t\s+sound\s+right|that'?s?\s+not\s+right|wrong)\b/i;

export function parseSummaryConfirmIntent(message: string): SummaryConfirmIntent | null {
  const t = message.trim();
  if (!t || t.length < 2) return null;
  if (NOT_QUITE_PATTERNS.test(t)) return "not_quite";
  if (CHANGE_PATTERNS.test(t)) return "change";
  if (YES_PATTERNS.test(t)) return "yes";
  return null;
}

export function isCheckinSummaryConfirmed(meta: OnboardingMetadata): boolean {
  return Boolean(meta.checkin_summary_confirmed_at);
}

export function tier3CompleteGate(input: {
  instrumentsComplete: boolean;
  reconcileComplete: boolean;
  meta: OnboardingMetadata;
}): boolean {
  return (
    input.instrumentsComplete &&
    input.reconcileComplete &&
    isCheckinSummaryConfirmed(input.meta)
  );
}

export function buildBaselineCheckinSummaryBullets(
  user: AppUser,
  meta: OnboardingMetadata,
): string[] {
  const bullets: string[] = [];
  const instrumentIds =
    meta.instrument_ids ??
    deployedInstruments(user.career_stage, user.practice_setting).map((i) => i.id);
  const scores = scoreAllInstruments(instrumentIds, meta.instrument_answers ?? []);
  const sib = scores.find((s) => s.instrumentId === "single_item_burnout");
  const who5 = scores.find((s) => s.instrumentId === "who5");
  const invisible = scores.find((s) => s.instrumentId === "invisible_work");
  const career = scores.find((s) => s.instrumentId === "career_aspirations");

  const wellbeingInterpretation = sib?.interpretation ?? who5?.interpretation;
  if (wellbeingInterpretation) {
    bullets.push(`How work has felt: ${plainWellbeingLine(wellbeingInterpretation)}`);
  } else {
    bullets.push("How work has felt: captured from your baseline check-in.");
  }

  const iwHours = invisible?.raw.weekly_hours;
  if (typeof iwHours === "number" && iwHours > 0) {
    bullets.push(
      `Main friction: about ${iwHours} hours per week of work that may not show up in your record yet.`,
    );
  }

  const goalAnswer = meta.instrument_answers?.find((a) => a.clusterId === "career-5yr-goal")?.value;
  if (typeof goalAnswer === "string" && goalAnswer.trim()) {
    bullets.push(`Five-year direction: ${goalAnswer.trim().slice(0, 200)}`);
  } else if (meta.career_objective?.trim()) {
    bullets.push(`Five-year direction: ${meta.career_objective.trim().slice(0, 200)}`);
  }

  const trackEnergy = career?.raw.track_energy;
  if (typeof trackEnergy === "number") {
    bullets.push(
      `Career momentum: ${trackEnergy >= 7 ? "energized about your primary track" : trackEnergy >= 4 ? "mixed energy on your primary track" : "lower energy on your primary track lately"}.`,
    );
  }

  if (user.primary_career_track) {
    bullets.push(`Career map theme: ${user.primary_career_track} track as a starting anchor.`);
  }

  // Environmental context snapshot — only if any Day-0 env items were captured
  const schedCtrl = meta.instrument_answers?.find((a) => a.clusterId === "env-schedule-control" && a.value !== "skip")?.value;
  const itl = meta.instrument_answers?.find((a) => a.clusterId === "env-intent-to-leave" && a.value !== "skip")?.value;
  if (typeof schedCtrl === "number" || typeof itl === "number") {
    const parts: string[] = [];
    if (typeof schedCtrl === "number") {
      parts.push(schedCtrl >= 4 ? "good schedule control" : schedCtrl >= 3 ? "moderate schedule control" : "limited schedule control");
    }
    if (typeof itl === "number") {
      parts.push(itl <= 2 ? "anchored at your institution" : itl >= 4 ? "open to a move" : "weighing your options");
    }
    if (parts.length) bullets.push(`Work situation: ${parts.join(", ")}.`);
  }

  return bullets.slice(0, 5);
}

function plainWellbeingLine(interpretation: string): string {
  return interpretation
    .replace(/burnout score|\/100|percentile/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatSummaryConfirmPrompt(bullets: string[]): string {
  const body = bullets.map((b) => `• ${b}`).join("\n");
  return `Here's what I'm saving from this check-in:\n\n${body}\n\nDoes this summary sound right?\n\n**Yes, save this** · **Change with Mak** · **Not quite**`;
}

export function buildQuarterlyCheckinSummaryBullets(
  user: AppUser,
  answers: PulseAnswer[],
): string[] {
  const parsed = parsePulseAnswers(answers);
  const bullets: string[] = [];

  if (parsed.burnout_screen != null) {
    const heavy = parsed.burnout_screen >= 3;
    bullets.push(
      heavy
        ? "How work has felt: a heavier stretch lately — we can keep the next steps light."
        : "How work has felt: manageable overall this quarter.",
    );
  }

  if (parsed.invisible_hours != null) {
    bullets.push(
      `Unrecognized work: about ${parsed.invisible_hours} hours per week outside what your record shows.`,
    );
  } else {
    const dominant = dominantInvisibleWorkByLevel(user.career_stage ?? null);
    bullets.push(`Unrecognized work: ${dominant}`);
  }

  const goalSnippet = answers.find((a) => a.module_id === "career_momentum" && a.question_id === "progress_summary");
  if (goalSnippet && String(goalSnippet.value).trim()) {
    bullets.push(`Career momentum: ${String(goalSnippet.value).trim().slice(0, 160)}`);
  }

  return bullets.slice(0, 5);
}

export function buildAnnualCheckinSummaryBullets(
  user: AppUser,
  answers: AnnualRefreshAnswer[],
): string[] {
  const parsed = parseAnnualAnswers(answers);
  const bullets: string[] = [];
  const year = new Date().getFullYear();

  if (parsed.career_objective?.trim()) {
    bullets.push(`Career direction: ${parsed.career_objective.trim().slice(0, 180)}`);
  } else if (user.primary_career_track) {
    bullets.push(`Career direction: ${user.primary_career_track} track remains your anchor.`);
  }

  if (parsed.track_energy != null) {
    bullets.push(
      parsed.track_energy >= 7
        ? "Work engagement: fairly energized about your direction this year."
        : parsed.track_energy >= 4
          ? "Work engagement: mixed — worth revisiting priorities if that persists."
          : "Work engagement: lower lately — we can keep next steps light.",
    );
  }

  if (parsed.invisible_hours != null) {
    bullets.push(
      `Unrecognized work: about ${parsed.invisible_hours} hours per week outside what your record shows.`,
    );
  } else {
    bullets.push(`Unrecognized work: ${dominantInvisibleWorkByLevel(user.career_stage ?? null)}`);
  }

  if (parsed.goal_review?.trim()) {
    bullets.push(`Goals: ${parsed.goal_review.trim().slice(0, 160)}`);
  }

  bullets.push(`${year} yearly check-in captured — Career Data and goals update after you confirm.`);

  return bullets.slice(0, 5);
}

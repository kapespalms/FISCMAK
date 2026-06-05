import type { AnnualRefreshAnswer } from "@/lib/v2/annual-refresh";
import type { PulseAnswer } from "@/lib/v2/quarterly-pulse";
import { INVISIBLE_WORK_CATEGORIES } from "@/lib/v2/invisible-work-taxonomy";
function clampScale(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function extractNumbers(text: string): number[] {
  return (text.match(/\b(\d+(?:\.\d+)?)\b/g) ?? [])
    .map(Number)
    .filter((n) => !Number.isNaN(n));
}

function mergeAnswers<T extends { module_id: string; question_id: string }>(
  existing: T[],
  incoming: T[],
): T[] {
  const map = new Map(existing.map((a) => [`${a.module_id}:${a.question_id}`, a]));
  for (const a of incoming) {
    map.set(`${a.module_id}:${a.question_id}`, a);
  }
  return [...map.values()];
}

export function captureQuarterlyFromMessage(
  moduleId: string,
  message: string,
  capturedAt: string,
): PulseAnswer[] {
  const trimmed = message.trim();
  if (!trimmed || trimmed.length < 2) return [];
  const numbers = extractNumbers(trimmed);

  switch (moduleId) {
    case "burnout_screen": {
      // Single-Item Burnout (West et al.): 1–5 scale
      const level = numbers.find((n) => n >= 1 && n <= 5);
      return [
        {
          module_id: "burnout_screen",
          question_id: "sib_level",
          value: level != null ? clampScale(level, 1, 5) : trimmed.slice(0, 500),
          captured_at: capturedAt,
        },
      ];
    }
    case "invisible_pulse": {
      const answers: PulseAnswer[] = [];
      const weekly = numbers.find((n) => n >= 0 && n <= 80);
      if (weekly != null) {
        answers.push({
          module_id: "invisible_pulse",
          question_id: "weekly_hours",
          value: weekly,
          captured_at: capturedAt,
        });
      }
      for (const cat of INVISIBLE_WORK_CATEGORIES) {
        const re = new RegExp(`${cat.label.split(" ")[0]}[^\\d]*(\\d+)`, "i");
        const match = trimmed.match(re);
        if (match?.[1]) {
          answers.push({
            module_id: "invisible_pulse",
            question_id: cat.id,
            value: Number(match[1]),
            captured_at: capturedAt,
          });
        }
      }
      if (numbers.length > 1 && !answers.some((a) => a.question_id !== "weekly_hours")) {
        numbers.slice(0, 6).forEach((n, i) => {
          const cat = INVISIBLE_WORK_CATEGORIES[i];
          if (cat) {
            answers.push({
              module_id: "invisible_pulse",
              question_id: cat.id,
              value: n,
              captured_at: capturedAt,
            });
          }
        });
        const total = numbers.reduce((s, n) => s + n, 0);
        answers.push({
          module_id: "invisible_pulse",
          question_id: "weekly_hours",
          value: total,
          captured_at: capturedAt,
        });
      }
      answers.push({
        module_id: "invisible_pulse",
        question_id: "biggest_category",
        value: trimmed.slice(0, 300),
        captured_at: capturedAt,
      });
      return answers;
    }
    case "career_momentum": {
      const answers: PulseAnswer[] = [];
      const energy = numbers.find((n) => n >= 1 && n <= 10);
      if (energy != null) {
        answers.push({
          module_id: "career_momentum",
          question_id: "track_energy",
          value: energy,
          captured_at: capturedAt,
        });
      }
      answers.push({
        module_id: "career_momentum",
        question_id: "progress_summary",
        value: trimmed.slice(0, 500),
        captured_at: capturedAt,
      });
      return answers;
    }
    case "cv_update":
      return [
        {
          module_id: "cv_update",
          question_id: "updates",
          value: trimmed.slice(0, 800),
          captured_at: capturedAt,
        },
      ];
    default:
      return [];
  }
}

export function quarterlyModuleReady(moduleId: string, answers: PulseAnswer[]): boolean {
  const forModule = answers.filter((a) => a.module_id === moduleId);
  if (!forModule.length) return false;
  switch (moduleId) {
    case "burnout_screen":
      return forModule.some((a) => a.question_id === "sib_level");
    case "invisible_pulse":
      return forModule.some(
        (a) => a.question_id === "weekly_hours" || a.question_id === "biggest_category",
      );
    case "career_momentum":
      return forModule.some(
        (a) => a.question_id === "track_energy" || a.question_id === "progress_summary",
      );
    case "cv_update":
      return forModule.some((a) => a.question_id === "updates" && String(a.value).trim().length > 2);
    default:
      return forModule.length > 0;
  }
}

export function captureAnnualFromMessage(
  moduleId: string,
  message: string,
  capturedAt: string,
): AnnualRefreshAnswer[] {
  const trimmed = message.trim();
  if (!trimmed || trimmed.length < 2) return [];
  const numbers = extractNumbers(trimmed);

  switch (moduleId) {
    case "career_direction":
      return [
        {
          module_id: "career_direction",
          question_id: "three_year_objective",
          value: trimmed.slice(0, 500),
          captured_at: capturedAt,
        },
      ];
    case "work_engagement": {
      const vigor = numbers.find((n) => n >= 1 && n <= 7) ?? numbers[0];
      if (vigor == null) {
        return [
          {
            module_id: "work_engagement",
            question_id: "vigor_summary",
            value: trimmed.slice(0, 400),
            captured_at: capturedAt,
          },
        ];
      }
      return [
        {
          module_id: "work_engagement",
          question_id: "vigor_mean",
          value: vigor,
          captured_at: capturedAt,
        },
      ];
    }
    case "wellbeing_check":
    case "invisible_work_burden":
      return [
        {
          module_id: moduleId,
          question_id: "summary",
          value: trimmed.slice(0, 600),
          captured_at: capturedAt,
        },
      ];
    case "invisible_work_annual": {
      const weekly = numbers.find((n) => n >= 0 && n <= 80) ?? numbers[0];
      const answers: AnnualRefreshAnswer[] = [
        {
          module_id: "invisible_work_annual",
          question_id: "category_summary",
          value: trimmed.slice(0, 600),
          captured_at: capturedAt,
        },
      ];
      if (weekly != null) {
        answers.push({
          module_id: "invisible_work_annual",
          question_id: "weekly_hours",
          value: weekly,
          captured_at: capturedAt,
        });
      }
      return answers;
    }
    case "career_data_refresh":
      return [
        {
          module_id: "career_data_refresh",
          question_id: "updates",
          value: trimmed.slice(0, 800),
          captured_at: capturedAt,
        },
      ];
    case "goal_annual_reset":
      return [
        {
          module_id: "goal_annual_reset",
          question_id: "review_summary",
          value: trimmed.slice(0, 600),
          captured_at: capturedAt,
        },
      ];
    default:
      return [];
  }
}

export function annualModuleReady(moduleId: string, answers: AnnualRefreshAnswer[]): boolean {
  const forModule = answers.filter((a) => a.module_id === moduleId);
  if (!forModule.length) return false;
  switch (moduleId) {
    case "career_direction":
      return String(forModule.find((a) => a.question_id === "three_year_objective")?.value ?? "").length > 5;
    case "work_engagement":
      return forModule.some(
        (a) => a.question_id === "vigor_mean" || a.question_id === "vigor_summary",
      );
    case "invisible_work_annual":
      return forModule.some(
        (a) => a.question_id === "weekly_hours" || a.question_id === "category_summary",
      );
    case "goal_annual_reset":
      return String(forModule.find((a) => a.question_id === "review_summary")?.value ?? "").length > 3;
    default:
      return forModule.some((a) => String(a.value).trim().length > 5);
  }
}

export function mergeQuarterlySessionAnswers(
  existing: PulseAnswer[],
  incoming: PulseAnswer[],
): PulseAnswer[] {
  return mergeAnswers(existing, incoming);
}

export function mergeAnnualSessionAnswers(
  existing: AnnualRefreshAnswer[],
  incoming: AnnualRefreshAnswer[],
): AnnualRefreshAnswer[] {
  return mergeAnswers(existing, incoming);
}

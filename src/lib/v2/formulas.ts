import type { AppUser, CareerAssessment, Job } from "@/lib/v2/types";
import { computeSpecialtyMatchScore } from "@/lib/v2/specialty-hierarchy";

/** Assessment score: (weighted sum / max) × 100 for Likert 1-5 answers */
export function computeAssessmentScore(answers: { answer: string | number }[]): number {
  const likert = answers
    .map((a) => (typeof a.answer === "number" ? a.answer : parseInt(String(a.answer), 10)))
    .filter((n) => !Number.isNaN(n) && n >= 1 && n <= 5);
  if (likert.length === 0) return 50;
  const sum = likert.reduce((s, n) => s + n, 0);
  const max = likert.length * 5;
  return Math.round((sum / max) * 100);
}

/** CRI = (Assessment×0.4) + (CV×0.3) + (Pathway×0.3) */
export function computeCareerReadinessIndex(input: {
  avgAssessmentScore: number;
  cvUploaded: boolean;
  pathwayClarity: number;
}): number {
  const cvScore = input.cvUploaded ? 100 : 0;
  return Math.round(
    input.avgAssessmentScore * 0.4 + cvScore * 0.3 + input.pathwayClarity * 0.3,
  );
}

export function computePathwayClarity(
  user: Pick<AppUser, "specialty" | "career_stage" | "tier1_complete">,
  completedAssessments: number,
): number {
  if (!user.tier1_complete) return 30;
  if (completedAssessments >= 3) return 85;
  if (completedAssessments >= 1) return 60;
  return 50;
}

/** Job match: specialty×0.5 + salary×0.2 + location×0.2 + growth×0.1 */
export function computeJobMatchScore(
  job: Job,
  user: Pick<
    AppUser,
    | "specialty"
    | "base_specialty"
    | "subspecialty"
    | "subspecialty_training_complete"
    | "career_stage"
    | "preferred_location"
    | "salary_min"
    | "salary_max"
  >,
): number {
  const specialtyMatch = computeSpecialtyMatchScore(job, user);
  const salaryMatch =
    user.salary_min != null &&
    user.salary_max != null &&
    job.salary != null &&
    job.salary >= user.salary_min &&
    job.salary <= user.salary_max
      ? 1.0
      : 0.7;
  const locationMatch =
    user.preferred_location && job.location?.includes(user.preferred_location) ? 1.0 : 0.5;
  const growthMatch = job.growth_potential === "HIGH" ? 1.0 : 0.5;
  return Math.round(
    (specialtyMatch * 0.5 + salaryMatch * 0.2 + locationMatch * 0.2 + growthMatch * 0.1) * 100,
  );
}

export function recognitionGapFromAssessments(assessments: CareerAssessment[]): number {
  const burnout = assessments.filter((a) => a.question_category === "BURNOUT" && a.score != null);
  if (burnout.length === 0) return 0;
  return Math.round(burnout.reduce((s, a) => s + (a.score ?? 0), 0) / burnout.length);
}

export const TOUCHPOINT_META: Record<
  number,
  { category: string; title: string; daysFromStart: number }
> = {
  1: { category: "INTRO", title: "Professional Identity", daysFromStart: 0 },
  2: { category: "INVENTORY", title: "Career Inventory", daysFromStart: 3 },
  3: { category: "BURNOUT", title: "Energy & Invisible Work", daysFromStart: 7 },
  4: { category: "VALUES", title: "Values & Narrative", daysFromStart: 14 },
  5: { category: "GAPS", title: "Promotion Readiness", daysFromStart: 21 },
  6: { category: "MARKET", title: "Job Market Fit", daysFromStart: 60 },
  7: { category: "ACCOUNTABILITY", title: "Progress Review", daysFromStart: 90 },
};

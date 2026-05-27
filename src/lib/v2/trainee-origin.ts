import { isTraineeCareerLevel } from "@/lib/v2/onboarding-options";

/** Display label for onboarding origin prompt — subspecialty when set, else base specialty. */
export function formatSpecialtyChoiceLabel(
  baseSpecialty: string,
  subspecialty?: string | null,
): string {
  if (subspecialty?.trim()) return subspecialty.trim();
  return baseSpecialty.trim();
}

/** Onboarding origin question shown after name / PGY / rotation. */
export function buildSpecialtyOriginQuestion(
  baseSpecialty: string,
  subspecialty?: string | null,
  careerStage?: string | null,
): string {
  const label =
    careerStage === "Fellow" && subspecialty?.trim()
      ? subspecialty.trim()
      : baseSpecialty.trim();
  return `What drew you to ${label}? Even one sentence.`;
}

/** Persistent Mak context from onboarding origin + GME placement. */
export function buildTraineeOriginMakContext(input: {
  career_stage?: string | null;
  base_specialty?: string | null;
  subspecialty?: string | null;
  specialty_origin?: string | null;
  pgy_level?: string | null;
  current_rotation?: string | null;
}): string {
  const trainee = isTraineeCareerLevel(input.career_stage);
  if (!trainee && !input.specialty_origin) return "";

  const parts: string[] = [];
  if (input.pgy_level) parts.push(`PGY level: ${input.pgy_level}`);
  if (input.current_rotation) parts.push(`Current rotation: ${input.current_rotation}`);

  if (input.specialty_origin?.trim()) {
    parts.push(
      `Onboarding origin — why ${formatSpecialtyChoiceLabel(
        input.base_specialty ?? input.subspecialty ?? "this specialty",
        input.subspecialty,
      )}: "${input.specialty_origin.trim()}"`,
    );
    parts.push(
      "Thread this origin in rotation debriefs, narrative anchor work, ILP evidence, and application documents. Preserve the trainee's own phrasing — do not rewrite unless asked.",
    );
  }

  return parts.filter(Boolean).join("\n");
}

export function seedNarrativeAnchorFromOrigin(input: {
  base_specialty: string;
  subspecialty?: string | null;
  specialty_origin: string;
  existing?: { captured_at?: string } | null;
}): {
  target_specialty: string;
  origin_story: string;
  captured_at: string;
} {
  return {
    target_specialty: formatSpecialtyChoiceLabel(input.base_specialty, input.subspecialty),
    origin_story: input.specialty_origin.trim(),
    captured_at: input.existing?.captured_at ?? new Date().toISOString(),
  };
}

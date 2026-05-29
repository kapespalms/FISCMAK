import type { CareerLevel } from "@/lib/v2/onboarding-options";
import { formatSpecialtyChoiceLabel } from "@/lib/v2/trainee-origin";

export const NARRATIVE_HELPER =
  "One sentence is enough. This helps Mak anchor your career story.";

/** Stage-adaptive prompt for the Your Narrative field in Core Profile. */
export function buildNarrativePrompt(
  careerLevel: CareerLevel,
  baseSpecialty?: string | null,
  subspecialty?: string | null,
): string {
  const specialtyLabel = formatSpecialtyChoiceLabel(
    baseSpecialty ?? "your specialty",
    subspecialty,
  );

  switch (careerLevel) {
    case "Medical Student":
      return "What drew you to medicine — or what questions are you exploring in training right now?";
    case "Resident":
      return `What drew you to ${specialtyLabel}? Even one sentence.`;
    case "Fellow":
      return subspecialty?.trim()
        ? `What drew you to ${subspecialty.trim()}? Even one sentence.`
        : `What drew you to ${specialtyLabel}? Even one sentence.`;
    case "Early Career (0–7 yr)":
      return "What kind of physician are you becoming now that training is over?";
    case "Mid-Career (8–20 yr)":
      return "What work or impact matters most to you at this stage of your career?";
    case "Late Career (20+ yr)":
      return "What legacy or contribution do you want your career to reflect?";
    case "Retired":
      return "What wisdom, mentorship, or contribution do you want to preserve?";
    default:
      return `What drew you to ${specialtyLabel}? Even one sentence.`;
  }
}

export function showNarrativeField(careerLevel: CareerLevel): boolean {
  return Boolean(careerLevel);
}

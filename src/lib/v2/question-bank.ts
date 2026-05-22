import type { QuestionDef } from "@/lib/v2/types";

/** Subset of 60-Q bank — one touchpoint at a time in MVP pivot */
export const QUESTION_BANK: QuestionDef[] = [
  // TP1 — INTRO (8)
  { q_id: "Q1.1", touchpoint_number: 1, question_category: "INTRO", question: "What's your current academic rank?", question_type: "choice", options: ["Student", "Resident", "Fellow", "Assistant Professor", "Associate Professor", "Full Professor"] },
  { q_id: "Q1.2", touchpoint_number: 1, question_category: "INTRO", question: "What promotion track best describes your career focus?", question_type: "choice", options: ["Clinician-Educator", "Clinician-Scientist", "Clinical Excellence", "Research Scientist", "Administrative Leadership", "Other"] },
  { q_id: "Q1.3", touchpoint_number: 1, question_category: "INTRO", question: "In one sentence, how would you describe your professional identity?", question_type: "text" },
  { q_id: "Q1.4", touchpoint_number: 1, question_category: "INTRO", question: "What's your biggest career goal over the next 3-5 years?", question_type: "text" },
  { q_id: "Q1.5", touchpoint_number: 1, question_category: "INTRO", question: "Rate your clarity on your career direction (1-5)", question_type: "likert" },
  { q_id: "Q1.6", touchpoint_number: 1, question_category: "INTRO", question: "Which academic domain feels like your primary focus?", question_type: "choice", options: ["Teaching", "Research", "Clinical", "Administration", "Multiple equally"] },
  { q_id: "Q1.7", touchpoint_number: 1, question_category: "INTRO", question: "Do you have a mentor in your current track?", question_type: "choice", options: ["Yes", "No", "Looking for one"] },
  { q_id: "Q1.8", touchpoint_number: 1, question_category: "INTRO", question: "How well do you articulate your professional accomplishments? (1-5)", question_type: "likert" },
  // TP2 — INVENTORY (6 sample)
  { q_id: "Q2.1", touchpoint_number: 2, question_category: "INVENTORY", question: "Describe your most impactful teaching role.", question_type: "text" },
  { q_id: "Q2.2", touchpoint_number: 2, question_category: "INVENTORY", question: "How many residents or fellows have you formally mentored?", question_type: "text" },
  { q_id: "Q2.3", touchpoint_number: 2, question_category: "INVENTORY", question: "What's been your primary research focus?", question_type: "text" },
  { q_id: "Q2.4", touchpoint_number: 2, question_category: "INVENTORY", question: "Describe your clinical role and scope.", question_type: "text" },
  { q_id: "Q2.5", touchpoint_number: 2, question_category: "INVENTORY", question: "What institutional committees are you on?", question_type: "text" },
  { q_id: "Q2.6", touchpoint_number: 2, question_category: "INVENTORY", question: "What non-billable work consumes significant time?", question_type: "text" },
  // TP3 — BURNOUT (8)
  { q_id: "Q3.1", touchpoint_number: 3, question_category: "BURNOUT", question: "I feel emotionally exhausted from my work (1-5)", question_type: "likert" },
  { q_id: "Q3.2", touchpoint_number: 3, question_category: "BURNOUT", question: "I feel cynical about my work (1-5)", question_type: "likert" },
  { q_id: "Q3.3", touchpoint_number: 3, question_category: "BURNOUT", question: "I feel effective in my role (1-5, reverse scored)", question_type: "likert" },
  { q_id: "Q3.4", touchpoint_number: 3, question_category: "BURNOUT", question: "My workload feels sustainable (1-5)", question_type: "likert" },
  { q_id: "Q3.5", touchpoint_number: 3, question_category: "BURNOUT", question: "How many mentees have you actively guided?", question_type: "text" },
  { q_id: "Q3.6", touchpoint_number: 3, question_category: "BURNOUT", question: "Estimate hours/month on uncompensated service.", question_type: "text" },
  { q_id: "Q3.7", touchpoint_number: 3, question_category: "BURNOUT", question: "Have you taken on DEI or advocacy work?", question_type: "choice", options: ["Yes", "No"] },
  { q_id: "Q3.8", touchpoint_number: 3, question_category: "BURNOUT", question: "How visible are your contributions to leadership? (1-5)", question_type: "likert" },
  // TP4 — VALUES (6)
  { q_id: "Q4.1", touchpoint_number: 4, question_category: "VALUES", question: "What are your top 3 professional values?", question_type: "text" },
  { q_id: "Q4.2", touchpoint_number: 4, question_category: "VALUES", question: "Describe your career in one sentence.", question_type: "text" },
  { q_id: "Q4.3", touchpoint_number: 4, question_category: "VALUES", question: "How aligned is your current role with your values? (1-5)", question_type: "likert" },
  { q_id: "Q4.4", touchpoint_number: 4, question_category: "VALUES", question: "What's the biggest obstacle to your career goals?", question_type: "text" },
  { q_id: "Q4.5", touchpoint_number: 4, question_category: "VALUES", question: "Rate confidence explaining why you're ready for promotion (1-5)", question_type: "likert" },
  { q_id: "Q4.6", touchpoint_number: 4, question_category: "VALUES", question: "Ideal career trajectory?", question_type: "choice", options: ["Climb institution", "Move externally", "Pivot specialty", "Balance roles", "Other"] },
  // TP5 — GAPS (8)
  { q_id: "Q5.1", touchpoint_number: 5, question_category: "GAPS", question: "Teaching/Educational leadership performance (1-5)", question_type: "likert" },
  { q_id: "Q5.2", touchpoint_number: 5, question_category: "GAPS", question: "Research/Scholarship productivity (1-5)", question_type: "likert" },
  { q_id: "Q5.3", touchpoint_number: 5, question_category: "GAPS", question: "Clinical excellence/innovation (1-5)", question_type: "likert" },
  { q_id: "Q5.4", touchpoint_number: 5, question_category: "GAPS", question: "Service/Leadership impact (1-5)", question_type: "likert" },
  { q_id: "Q5.5", touchpoint_number: 5, question_category: "GAPS", question: "Strongest promotion domain?", question_type: "choice", options: ["Teaching", "Research", "Clinical", "Service"] },
  { q_id: "Q5.6", touchpoint_number: 5, question_category: "GAPS", question: "Domain needing most development?", question_type: "choice", options: ["Teaching", "Research", "Clinical", "Service"] },
  { q_id: "Q5.7", touchpoint_number: 5, question_category: "GAPS", question: "Discussed promotion timeline with chair/mentor?", question_type: "choice", options: ["Yes", "No", "Not sure"] },
  { q_id: "Q5.8", touchpoint_number: 5, question_category: "GAPS", question: "External recognition that would strengthen your case?", question_type: "text" },
  // TP6 — MARKET (6)
  { q_id: "Q6.1", touchpoint_number: 6, question_category: "MARKET", question: "What type of position would excite you elsewhere?", question_type: "text" },
  { q_id: "Q6.2", touchpoint_number: 6, question_category: "MARKET", question: "How portable is your current work? (1-5)", question_type: "likert" },
  { q_id: "Q6.3", touchpoint_number: 6, question_category: "MARKET", question: "Satisfied with institutional investment in your career? (1-5)", question_type: "likert" },
  { q_id: "Q6.4", touchpoint_number: 6, question_category: "MARKET", question: "How valued is your profile in the current market?", question_type: "choice", options: ["Low", "Moderate", "High", "Not sure"] },
  { q_id: "Q6.5", touchpoint_number: 6, question_category: "MARKET", question: "Explore opportunities at other institutions?", question_type: "choice", options: ["Yes", "No", "Maybe"] },
  { q_id: "Q6.6", touchpoint_number: 6, question_category: "MARKET", question: "Preferred geographic region?", question_type: "text" },
  // TP7 — ACCOUNTABILITY (8)
  { q_id: "Q7.1", touchpoint_number: 7, question_category: "ACCOUNTABILITY", question: "Target promotion timeline?", question_type: "choice", options: ["Within 1 year", "1-2 years", "2-3 years", "3+ years", "Not seeking promotion"] },
  { q_id: "Q7.2", touchpoint_number: 7, question_category: "ACCOUNTABILITY", question: "ONE thing you'll do this month toward your goal?", question_type: "text" },
  { q_id: "Q7.3", touchpoint_number: 7, question_category: "ACCOUNTABILITY", question: "Progress on previous commitments?", question_type: "text" },
  { q_id: "Q7.4", touchpoint_number: 7, question_category: "ACCOUNTABILITY", question: "Confidence achieving promotion on timeline (1-5)", question_type: "likert" },
  { q_id: "Q7.5", touchpoint_number: 7, question_category: "ACCOUNTABILITY", question: "What support do you need most?", question_type: "choice", options: ["Mentoring", "Research support", "Teaching relief", "Career counseling"] },
  { q_id: "Q7.6", touchpoint_number: 7, question_category: "ACCOUNTABILITY", question: "How has coaching affected career clarity? (1-5)", question_type: "likert" },
  { q_id: "Q7.7", touchpoint_number: 7, question_category: "ACCOUNTABILITY", question: "Would you recommend FISCMAK to a colleague?", question_type: "choice", options: ["Yes", "No", "Maybe"] },
  { q_id: "Q7.8", touchpoint_number: 7, question_category: "ACCOUNTABILITY", question: "Anything else Coach Mak should remember?", question_type: "text" },
];

export function questionsForTouchpoint(touchpoint: number): QuestionDef[] {
  return QUESTION_BANK.filter((q) => q.touchpoint_number === touchpoint);
}

export function nextQuestion(
  touchpoint: number,
  answeredIds: string[],
): QuestionDef | null {
  const qs = questionsForTouchpoint(touchpoint);
  return qs.find((q) => !answeredIds.includes(q.q_id)) ?? null;
}

/** Skip questions already answered in any touchpoint (e.g. via Mak conversation). */
export function nextUnansweredQuestion(
  touchpoint: number,
  allAnsweredIds: string[],
): QuestionDef | null {
  const qs = questionsForTouchpoint(touchpoint);
  return qs.find((q) => !allAnsweredIds.includes(q.q_id)) ?? null;
}

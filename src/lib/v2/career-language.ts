import type { PrimaryCareerTrack, PracticeSetting } from "@/lib/v2/onboarding-options";

/** Backend metric keys → user-facing labels (never show raw keys in UI). */
export const METRIC_LABELS = {
  h_index: "Research Influence",
  m_quotient: "Research Influence",
  g_index: "Research Influence",
  rcr: "Research Impact per Paper",
  wrcr: "Total Research Footprint",
  epsilon_index: "Career-Adjusted Research Standing",
  publication_velocity: "Publication Momentum",
  s_index: "Service Citizenship",
  wrvu: "Clinical Volume",
  sop_score: "Clinical Breadth",
  pfi_burnout: "Burnout Risk",
  pfi_fulfillment: "Professional Fulfillment",
  bits_score: "Task Burden",
  iwq: "Unrecognized Work",
  cdi: "Career Health Score",
  lps: "Career Map",
  track_alignment: "Career Alignment",
  grant_portfolio: "Funding Track Record",
  promotion_readiness: "Advancement Readiness",
  cri: "Career Health Score",
} as const;

export type MetricKey = keyof typeof METRIC_LABELS;

import type { MetricStatus } from "@/lib/design-system";
import { scoreToMetricStatus } from "@/lib/design-system";

export type { MetricStatus };

/** @deprecated Use MetricStatus */
export type TrafficLight = "green" | "amber" | "red";

export type CareerLevelLabel =
  | "Career Explorer"
  | "Career Builder"
  | "Career Launcher"
  | "Career Accelerator"
  | "Career Legacy"
  | "Career Reflection";

const CAREER_LEVEL_LABELS: Record<string, CareerLevelLabel> = {
  "Medical Student": "Career Explorer",
  Resident: "Career Builder",
  Fellow: "Career Builder",
  "Early Career (0–7 yr)": "Career Launcher",
  "Mid-Career (8–20 yr)": "Career Accelerator",
  "Late Career (20+ yr)": "Career Legacy",
  Retired: "Career Reflection",
  "Early Attending": "Career Launcher",
  "Mid-Career Attending": "Career Accelerator",
  "Senior Attending": "Career Legacy",
};

export function careerLevelDashboardTitle(careerStage: string | null): CareerLevelLabel {
  if (!careerStage) return "Career Launcher";
  return CAREER_LEVEL_LABELS[careerStage] ?? "Career Launcher";
}

export function careerLevelAspirationPrompt(careerStage: string | null): string {
  const prompts: Record<string, string> = {
    "Medical Student": "Which parts of medicine excite you most?",
    Resident: "What kind of physician do you want to become?",
    Fellow: "What kind of physician do you want to become?",
    "Early Career (0–7 yr)": "Where do you want to be in 5 years?",
    "Mid-Career (8–20 yr)": "What's your next big move?",
    "Late Career (20+ yr)": "How do you want to be remembered?",
    Retired: "What still gives you purpose?",
  };
  return prompts[careerStage ?? ""] ?? "Where do you want to be in 5 years?";
}

export type SpecialtyGroup = "cognitive" | "procedural" | "diagnostic" | "primary_care" | "other";

export function specialtyGroup(specialty: string | null): SpecialtyGroup {
  if (!specialty) return "other";
  const s = specialty.toLowerCase();
  if (/psychiatr|neurolog|internal medicine|pediatric/.test(s) && !/surgery|radiology/.test(s)) {
    if (/family medicine/.test(s)) return "primary_care";
    if (/psychiatr|neurolog|internal medicine|pediatric/.test(s)) return "cognitive";
  }
  if (/family medicine|general internal|general pediatr/.test(s)) return "primary_care";
  if (/surgery|emergency|obstetric|gynecolog|orthop|anesthes|otolaryng/.test(s)) return "procedural";
  if (/radiology|pathology|diagnostic/.test(s)) return "diagnostic";
  if (/psychiatr|neurolog/.test(s)) return "cognitive";
  return "other";
}

export function normalizeCdiTrack(
  track: PrimaryCareerTrack | null,
): "Researcher" | "Clinician-Educator" | "Clinician" | "Leader/Admin" {
  switch (track) {
    case "Researcher":
      return "Researcher";
    case "Educator":
      return "Clinician-Educator";
    case "Leader":
      return "Leader/Admin";
    case "Clinician":
    case "Advocate":
    case "Innovator":
    case "Quality-Safety":
    case "Wellness Champion":
    default:
      return "Clinician";
  }
}

export function clinicalVolumePhrase(specialty: string | null): string {
  const s = (specialty ?? "").toLowerCase();
  if (/psychiatr/.test(s)) return "patient encounters and therapy hours";
  if (/family medicine|internal medicine|pediatric/.test(s)) return "patient panel size and visit volume";
  if (/emergency/.test(s)) return "patients per shift and shift volume";
  if (/surgery|orthop|urolog|obstetric/.test(s)) return "operative cases and procedures";
  return "clinical activity and patient volume";
}

export function invisibleWorkExamples(specialty: string | null): string {
  const s = (specialty ?? "").toLowerCase();
  if (/psychiatr/.test(s)) {
    return "after-hours crisis calls, involuntary commitment paperwork, care coordination with social services";
  }
  if (/family medicine/.test(s)) {
    return "prior authorizations, insurance appeals, care coordination calls, community resource navigation";
  }
  if (/emergency/.test(s)) {
    return "post-shift charting, callbacks, medical-legal documentation, EMS medical direction";
  }
  if (/surgery|orthop/.test(s)) {
    return "tumor boards, M&M preparation, pre-op planning, post-op family calls";
  }
  return "after-hours charting, prior authorizations, care coordination, and informal mentoring";
}

export function researchInfluencePhrase(specialty: string | null): string {
  const s = (specialty ?? "").toLowerCase();
  if (/psychiatr/.test(s)) return "your published work and its influence on the field of psychiatry";
  if (/family medicine/.test(s)) return "your contributions to the family medicine knowledge base";
  if (/emergency/.test(s)) return "your scholarly output and its impact on emergency medicine practice";
  if (/surgery|orthop/.test(s)) return "your research contributions and their influence on surgical practice";
  return "your published work and its influence in your field";
}

export function promotionReadinessLabel(
  setting: PracticeSetting | null,
  specialty: string | null,
): string {
  const s = (specialty ?? "").toLowerCase();
  if (setting === "Community") return "Career milestone progress";
  if (/emergency/.test(s)) return "Promotion benchmarks";
  if (/surgery/.test(s)) return "Academic advancement metrics";
  return "Advancement readiness";
}

export function scoreToStatus(score: number): MetricStatus {
  return scoreToMetricStatus(score);
}

/** @deprecated Use scoreToStatus */
export function scoreToTrafficLight(score: number): TrafficLight {
  const s = scoreToMetricStatus(score);
  if (s === "strong") return "green";
  if (s === "developing") return "amber";
  return "red";
}

export function burnoutRiskFromPfi(burnoutScore: number | null | undefined): {
  status: MetricStatus;
  label: string;
  summary: string;
} {
  if (burnoutScore == null) {
    return {
      status: "stable",
      label: "Professional Sustainability",
      summary: "Complete your well-being check with Coach Mak to establish a baseline.",
    };
  }
  if (burnoutScore >= 3.325) {
    return {
      status: "needs_attention",
      label: "Professional Sustainability",
      summary:
        "Professional Sustainability: Needs Attention — elevated strain indicators suggest your energy and engagement may need structured support.",
    };
  }
  if (burnoutScore >= 2.5) {
    return {
      status: "developing",
      label: "Professional Sustainability",
      summary:
        "Professional Sustainability: Developing — monitor workload shifts and task burden as clinical demands change.",
    };
  }
  return {
    status: "strong",
    label: "Professional Sustainability",
    summary:
      "Professional Sustainability: Strong — energy and engagement indicators are in a healthy range.",
  };
}

export function fulfillmentSummary(fulfillmentScore: number | null | undefined): string {
  if (fulfillmentScore == null) {
    return "Professional Fulfillment: pending — complete your well-being conversation with Coach Mak.";
  }
  if (fulfillmentScore >= 3) {
    return "Professional Fulfillment: Strong — fulfillment signals are in a healthy range.";
  }
  if (fulfillmentScore >= 2) {
    return "Professional Fulfillment: Developing — worth revisiting as workload shifts.";
  }
  return "Professional Fulfillment: Needs Attention — consider a shorter check-in and support options.";
}

export function researchInfluenceSummary(input: {
  percentile: number;
  specialty: string | null;
  rank?: string | null;
  trend?: "up" | "stable" | "down";
}): string {
  const field = input.specialty ?? "your specialty";
  const rank = input.rank ? ` ${input.rank.toLowerCase()}` : "";
  const trend =
    input.trend === "up"
      ? " and trending upward"
      : input.trend === "down"
        ? " — momentum may be slowing"
        : "";
  return `Your published work is being cited and building influence at the ${input.percentile}${ordinalSuffix(input.percentile)} percentile for ${field}${rank}${trend}.`;
}

export function serviceCitizenshipSummary(input: {
  score: number;
  committeeRoles?: number;
  mentoringMentions?: number;
}): string {
  const parts: string[] = [];
  if (input.committeeRoles && input.committeeRoles > 0) {
    parts.push(`${input.committeeRoles} committee role${input.committeeRoles > 1 ? "s" : ""}`);
  }
  if (input.mentoringMentions && input.mentoringMentions > 0) {
    parts.push(`${input.mentoringMentions} mentoring signal${input.mentoringMentions > 1 ? "s" : ""}`);
  }
  const detail = parts.length ? parts.join(", ") : "contributions beyond clinical care";
  if (input.score >= 70) {
    return `Your service contributions (${detail}) place you in a strong range for your setting.`;
  }
  if (input.score >= 45) {
    return `Your service contributions span ${detail} — solid citizenship with room to make more visible.`;
  }
  return `Your documented service footprint is still emerging — ${detail}.`;
}

export function unrecognizedWorkSummary(input: {
  weeklyHours?: number;
  specialty: string | null;
  aboveAverage?: boolean;
}): string {
  const examples = invisibleWorkExamples(input.specialty);
  if (!input.weeklyHours) {
    return `Unrecognized work — ${examples} — often doesn't show up on your CV or in compensation. Tell Mak your weekly estimate to quantify this.`;
  }
  const avgNote = input.aboveAverage ? " This is above average for your specialty." : "";
  return `Your unrecognized work load is significant — about ${input.weeklyHours} hours/week on ${examples}.${avgNote}`;
}

export function taskBurdenSummary(input: {
  unnecessary?: number;
  unreasonable?: number;
  weeklyHours?: number;
}): string {
  const hours = input.weeklyHours ?? 0;
  if (input.unreasonable != null && input.unreasonable >= 3.5) {
    return `You're spending an estimated ${hours || 8} hours/week on tasks that feel outside your core responsibilities — higher than average for your specialty.`;
  }
  if (input.unnecessary != null && input.unnecessary >= 3) {
    return `A meaningful share of your time goes to tasks that feel unnecessary — worth discussing delegation with Coach Mak.`;
  }
  return `Your task burden appears manageable relative to peers, though seasonal spikes are common.`;
}

export function careerHealthScoreSummary(score: number, strongest: string[], growth: string[]): string {
  const strong =
    strongest.length > 0 ? `Strongest areas: ${strongest.join(" and ")}.` : "";
  const grow =
    growth.length > 0 ? `Growth opportunity: ${growth.join(" and ")}.` : "";
  return `Your overall Career Health Score is ${score}/100. ${strong} ${grow}`.trim();
}

function ordinalSuffix(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return "th";
  switch (n % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}

export function domainStatusLabel(score: number): string {
  const status = scoreToMetricStatus(score);
  const labels = { strong: "Strong", developing: "Developing", needs_attention: "Needs Attention", stable: "Stable" };
  return `${labels[status]} · ${score}/100`;
}

/** @deprecated No emojis in status labels — use StatusChip */
export function trafficLightEmoji(_light: TrafficLight): string {
  return "";
}

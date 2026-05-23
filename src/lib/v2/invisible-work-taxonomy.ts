import type { PracticeSetting, CareerStage } from "@/lib/v2/onboarding-options";
import type { GoalFrameworkType } from "@/lib/v2/soap-tab-spec";

export type InvisibleWorkCategory =
  | "documentation_overspill"
  | "care_coordination"
  | "uncompensated_teaching"
  | "administrative_burden"
  | "dei_service"
  | "professional_maintenance";

export type InvisibleWorkCategorySpec = {
  id: InvisibleWorkCategory;
  label: string;
  definition: string;
  bitsClass: "unnecessary" | "unreasonable" | "mixed";
  academicExamples: string;
  communityExamples: string;
  industryExamples: string;
};

export const INVISIBLE_WORK_CATEGORIES: InvisibleWorkCategorySpec[] = [
  {
    id: "documentation_overspill",
    label: "Documentation overspill",
    definition: "Clinical documentation completed outside scheduled work hours.",
    bitsClass: "unnecessary",
    academicExamples: "After-hours EHR charting, inbox management, note completion",
    communityExamples: "After-hours charting, results review, prescription refills between visits",
    industryExamples: "Regulatory documentation, clinical trial case report forms",
  },
  {
    id: "care_coordination",
    label: "Care coordination",
    definition: "Non-billable patient care activities between visits.",
    bitsClass: "unreasonable",
    academicExamples: "Peer-to-peer prior auth calls, specialist coordination",
    communityExamples: "Prior authorizations, insurance appeals, referral coordination",
    industryExamples: "Adverse event reporting, safety signal follow-up",
  },
  {
    id: "uncompensated_teaching",
    label: "Uncompensated teaching",
    definition: "Teaching and mentoring not formally recognized or compensated.",
    bitsClass: "unreasonable",
    academicExamples: "Informal mentoring, hallway teaching, reviewing trainee manuscripts",
    communityExamples: "Student precepting without compensation, informal mentoring",
    industryExamples: "Training new hires, mentoring junior medical affairs staff",
  },
  {
    id: "administrative_burden",
    label: "Administrative burden",
    definition: "Committee work and institutional service without protected time.",
    bitsClass: "mixed",
    academicExamples: "Unfunded committee service, IRB reviews, compliance training",
    communityExamples: "Medical staff meetings, credentialing paperwork, quality reporting",
    industryExamples: "Corporate meetings, compliance training, cross-functional teams",
  },
  {
    id: "dei_service",
    label: "Diversity and equity service",
    definition: "DEI-related service that may be disproportionately assigned.",
    bitsClass: "unreasonable",
    academicExamples: "DEI committees, mentoring URiM trainees, community outreach",
    communityExamples: "Community health outreach, diversity recruitment",
    industryExamples: "Diversity advisory boards, ERG leadership",
  },
  {
    id: "professional_maintenance",
    label: "Professional maintenance",
    definition: "Activities required to maintain professional standing.",
    bitsClass: "mixed",
    academicExamples: "CME, MOC, peer review, license renewal",
    communityExamples: "CME, MOC, hospital privileging paperwork",
    industryExamples: "Regulatory certification maintenance, therapeutic area CME",
  },
];

export function invisibleWorkPromptsForSetting(
  setting: PracticeSetting | null,
): { id: InvisibleWorkCategory; prompt: string }[] {
  return INVISIBLE_WORK_CATEGORIES.map((cat) => {
    let example = cat.academicExamples;
    if (setting === "Community") example = cat.communityExamples;
    if (setting === "Industry") example = cat.industryExamples;
    return {
      id: cat.id,
      prompt: `${cat.label}: ${cat.definition} Examples: ${example}. Estimated hours/week:`,
    };
  });
}

export type InvisibleWorkGoalRecommendation = {
  goalType: GoalFrameworkType;
  message: string;
  priority: "high" | "medium";
};

export function recommendGoalFromInvisibleWork(input: {
  hoursByCategory: Partial<Record<InvisibleWorkCategory, number>>;
  totalHours: number;
  isUrim?: boolean;
}): InvisibleWorkGoalRecommendation[] {
  const recs: InvisibleWorkGoalRecommendation[] = [];
  const h = input.hoursByCategory;

  if ((h.documentation_overspill ?? 0) > 4) {
    recs.push({
      goalType: "sustainability",
      priority: "medium",
      message:
        "Documentation overspill is above the median for your specialty. Task alignment data suggests an opportunity to optimize documentation workflow — voice dictation, templates, scribing support, or departmental workflow review.",
    });
  }
  if ((h.care_coordination ?? 0) > 3) {
    recs.push({
      goalType: "sustainability",
      priority: "medium",
      message:
        "Care coordination time is significant. Consider whether tasks could be delegated to care coordinators, nurses, or social workers, or addressed through institutional advocacy on prior authorization burden.",
    });
  }
  if ((h.uncompensated_teaching ?? 0) > 3) {
    recs.push({
      goalType: "development",
      priority: "medium",
      message:
        "Uncompensated teaching time is substantial. Consider formalizing this in your educator portfolio for advancement, or setting boundaries by redirecting informal teaching to formal assignments.",
    });
  }
  if ((h.dei_service ?? 0) > 2 && input.isUrim) {
    recs.push({
      goalType: "sustainability",
      priority: "high",
      message:
        "Diversity-related service is above typical department levels. This work is valuable but should be formally recognized — consider protected time, compensation, or formal role designation documented for your advancement portfolio.",
    });
  }
  if ((h.administrative_burden ?? 0) > 3) {
    recs.push({
      goalType: "sustainability",
      priority: "medium",
      message:
        "Administrative burden is significant relative to protected time. Review which committees align with career objectives and which could be declined or rotated.",
    });
  }
  if (input.totalHours > 15) {
    recs.push({
      goalType: "sustainability",
      priority: "high",
      message:
        "Total unrecognized work exceeds 15 hours per week — approximately 30% of a standard work week. This level is associated with elevated professional strain and warrants priority attention with department leadership.",
    });
  }
  return recs;
}

export function dominantInvisibleWorkByLevel(level: CareerStage | null): string {
  if (level === "Medical Student") return "Minimal formal invisible work; establish baseline tracking.";
  if (level === "Resident" || level === "Fellow")
    return "Documentation overspill and uncompensated teaching typically dominate during training.";
  if (level === "Early Career (0–7 yr)")
    return "All categories emerge; documentation overspill and care coordination are often highest.";
  if (level === "Mid-Career (8–20 yr)")
    return "Administrative burden and care coordination often peak; highest burnout risk period.";
  if (level === "Late Career (20+ yr)")
    return "Administrative burden and uncompensated mentoring shift toward advisory roles.";
  if (level === "Retired") return "Volunteer teaching and community service — intentional and optional.";
  return "Track unrecognized work quarterly to inform Sustainability goals.";
}

import type {
  PracticeSetting,
  CareerStage,
  AcademicRank,
  PrimaryCareerTrack,
} from "@/lib/v2/onboarding-options";
import type { SoapBandId } from "@/lib/v2/dashboard-snapshot";
import type { AnalyticsDashboard } from "@/lib/v2/types";
import type { QuarterlyPulseStatus } from "@/lib/v2/quarterly-pulse";
import { scoreToMetricStatus } from "@/lib/design-system";
import { isAcademicContext, resolveAcademicProfile } from "@/lib/v2/academic-profiles";

export type DashboardBandOrder = SoapBandId[];

export type DashboardAdaptationRow = {
  setting: string;
  level: string;
  bandOrder: DashboardBandOrder;
  subjectiveLead: string;
  objectiveLead: string;
  assessmentLead: string;
  planLead: string;
  outputLead: string;
};

export const DASHBOARD_ADAPTATIONS: DashboardAdaptationRow[] = [
  {
    setting: "Academic",
    level: "Early Career (0–7 yr)",
    bandOrder: ["subjective", "objective", "assessment", "plan", "output"],
    subjectiveLead: "Career Direction",
    objectiveLead: "Publications + Grants",
    assessmentLead: "Promotion Readiness",
    planLead: "Development Goal",
    outputLead: "CV + Biosketch",
  },
  {
    setting: "Academic",
    level: "Mid-Career (8–20 yr)",
    bandOrder: ["subjective", "objective", "assessment", "plan", "output"],
    subjectiveLead: "Career Alignment",
    objectiveLead: "National reputation",
    assessmentLead: "Promotion to Full Professor",
    planLead: "Development Goal",
    outputLead: "Promotion Dossier",
  },
  {
    setting: "Academic",
    level: "Late Career (20+ yr)",
    bandOrder: ["subjective", "assessment", "plan", "output", "objective"],
    subjectiveLead: "Professional Fulfillment",
    objectiveLead: "Career-long impact",
    assessmentLead: "Legacy Impact Score",
    planLead: "Sustainability Goal",
    outputLead: "Narrative CV",
  },
  {
    setting: "Community",
    level: "Early Career (0–7 yr)",
    bandOrder: ["subjective", "objective", "assessment", "plan", "output"],
    subjectiveLead: "Task Alignment",
    objectiveLead: "Clinical volume + Quality",
    assessmentLead: "Clinical Breadth Score",
    planLead: "Development Goal",
    outputLead: "Resume + Credentialing",
  },
  {
    setting: "Community",
    level: "Mid-Career (8–20 yr)",
    bandOrder: ["subjective", "plan", "assessment", "output", "objective"],
    subjectiveLead: "Work-Related Strain",
    objectiveLead: "wRVU + Quality trends",
    assessmentLead: "Burnout Trajectory",
    planLead: "Sustainability Goal",
    outputLead: "Resume + Quality Portfolio",
  },
  {
    setting: "Industry",
    level: "Any",
    bandOrder: ["subjective", "objective", "assessment", "plan", "output"],
    subjectiveLead: "Career Direction",
    objectiveLead: "Therapeutic area publications",
    assessmentLead: "Therapeutic Expertise Depth",
    planLead: "Development Goal",
    outputLead: "Industry CV",
  },
  {
    setting: "Medical Student",
    level: "Medical Student",
    bandOrder: ["subjective", "objective", "plan", "assessment", "output"],
    subjectiveLead: "Career Exploration",
    objectiveLead: "Experiences + Research",
    assessmentLead: "Career Explorer Map",
    planLead: "Exploration Goals",
    outputLead: "Basic CV",
  },
  {
    setting: "Resident/Fellow",
    level: "Resident",
    bandOrder: ["subjective", "objective", "assessment", "plan", "output"],
    subjectiveLead: "Career Identity Formation",
    objectiveLead: "Milestones + Publications",
    assessmentLead: "Career Builder Map",
    planLead: "Build Goals",
    outputLead: "CV + Application Materials",
  },
  {
    setting: "Resident/Fellow",
    level: "Fellow",
    bandOrder: ["subjective", "objective", "assessment", "plan", "output"],
    subjectiveLead: "Subspecialty Identity + Track Selection",
    objectiveLead: "Fellowship Portfolio + Grants",
    assessmentLead: "Subspecialty Readiness Map",
    planLead: "Transition Goals",
    outputLead: "CV + Biosketch + Job Materials",
  },
  {
    setting: "Academic",
    level: "Retired",
    bandOrder: ["subjective", "assessment", "plan", "output", "objective"],
    subjectiveLead: "Post-Career Purpose",
    objectiveLead: "Volunteer + Advisory Roles",
    assessmentLead: "Impact Retrospective",
    planLead: "Optional Engagement Goals",
    outputLead: "Legacy CV",
  },
];

const DEFAULT_ORDER: DashboardBandOrder = [
  "subjective",
  "objective",
  "assessment",
  "plan",
  "output",
];

export function resolveDashboardAdaptation(input: {
  setting?: PracticeSetting | null;
  level?: CareerStage | null;
  rank?: AcademicRank | null;
  track?: PrimaryCareerTrack | string | null;
}): DashboardAdaptationRow {
  const { setting, level, rank, track } = input;
  const academic = resolveAcademicProfile({ setting, level, rank, track });
  if (academic && isAcademicContext({ setting, level })) {
    return {
      setting: setting === "Hybrid" ? "Hybrid" : "Academic",
      level: level ?? "Early Career (0–7 yr)",
      bandOrder: academic.bandOrder,
      subjectiveLead: academic.subjectiveLead,
      objectiveLead: academic.objectiveLead,
      assessmentLead: academic.assessmentLead,
      planLead: academic.planLead,
      outputLead: academic.outputLead,
    };
  }
  if (level === "Medical Student") {
    return DASHBOARD_ADAPTATIONS.find((r) => r.level === "Medical Student")!;
  }
  if (level === "Resident" || level === "Fellow") {
    return (
      DASHBOARD_ADAPTATIONS.find((r) => r.setting === "Resident/Fellow" && r.level === level) ??
      DASHBOARD_ADAPTATIONS.find((r) => r.setting === "Resident/Fellow")!
    );
  }
  if (setting === "Industry") {
    return DASHBOARD_ADAPTATIONS.find((r) => r.setting === "Industry")!;
  }
  const match = DASHBOARD_ADAPTATIONS.find((r) => r.setting === setting && r.level === level);
  if (match) return match;
  if (level === "Late Career (20+ yr)" || level === "Retired") {
    return (
      DASHBOARD_ADAPTATIONS.find((r) => r.setting === "Academic" && r.level === "Late Career (20+ yr)") ??
      DASHBOARD_ADAPTATIONS[0]
    );
  }
  return DASHBOARD_ADAPTATIONS.find((r) => r.setting === "Academic" && r.level === "Early Career (0–7 yr)")!;
}

export function resolveBandOrder(
  setting: PracticeSetting | null,
  level: CareerStage | null,
  rank?: AcademicRank | null,
  track?: PrimaryCareerTrack | string | null,
): DashboardBandOrder {
  return resolveDashboardAdaptation({ setting, level, rank, track }).bandOrder;
}

export function formatProfileSummaryLine(input: {
  specialty?: string | null;
  setting?: PracticeSetting | null;
  rank?: AcademicRank | null;
  level?: CareerStage | null;
  track?: string | null;
}): string {
  const parts: string[] = [];
  if (input.specialty) parts.push(input.specialty);
  if (input.setting) {
    const settingLabel =
      input.setting === "Academic"
        ? "Academic Medicine"
        : input.setting === "Community"
          ? "Community Practice"
          : input.setting;
    parts.push(settingLabel);
  }
  if (input.rank && (input.setting === "Academic" || input.setting === "Hybrid")) {
    parts.push(input.rank);
  } else if (input.level) {
    parts.push(input.level);
  }
  if (input.track) parts.push(input.track);
  return parts.join(" · ") || "Complete profile configuration";
}

export type DashboardHeaderModel = {
  displayName: string;
  degree: string;
  profileLine: string;
  careerHealthScore: number | null;
  previousScore: number | null;
  scoreStatus: ReturnType<typeof scoreToMetricStatus> | null;
  trend: "up" | "down" | "flat";
  lastUpdated: string | null;
  nextCheckIn: string | null;
  quarterlyPulseDue: boolean;
  annualRefreshDue: boolean;
  pulseStreak: number;
};

export type DashboardQuickAction = {
  label: string;
  intent:
    | "discuss"
    | "review"
    | "assess"
    | "plan"
    | "create"
    | "capture"
    | "upload";
  href: string;
};

export function buildDashboardHeader(input: {
  name?: string | null;
  specialty?: string | null;
  setting?: PracticeSetting | null;
  rank?: AcademicRank | null;
  level?: CareerStage | null;
  track?: string | null;
  analytics: AnalyticsDashboard;
  quarterlyPulse?: QuarterlyPulseStatus | null;
}): DashboardHeaderModel {
  const health = input.analytics.career_health;
  const score = health?.career_health_score ?? null;
  const prev = input.analytics.previous_career_health_score;
  let trend: "up" | "down" | "flat" = "flat";
  if (score != null && prev != null) {
    if (score > prev) trend = "up";
    else if (score < prev) trend = "down";
  }

  const now = new Date();
  const nextQ = Math.floor(now.getMonth() / 3) * 3 + 3;
  const nextCheckIn = new Date(now.getFullYear(), nextQ, 1);

  return {
    displayName: input.name?.trim() ? `Dr. ${input.name.trim()}` : "Welcome",
    degree: "MD",
    profileLine: formatProfileSummaryLine({
      specialty: input.specialty,
      setting: input.setting,
      rank: input.rank,
      level: input.level,
      track: input.track,
    }),
    careerHealthScore: score,
    previousScore: prev,
    scoreStatus: score != null ? scoreToMetricStatus(score) : null,
    trend,
    lastUpdated: health ? now.toLocaleDateString() : null,
    nextCheckIn: nextCheckIn.toLocaleDateString(),
    quarterlyPulseDue: input.quarterlyPulse?.due ?? false,
    annualRefreshDue: input.analytics.annual_refresh?.due ?? false,
    pulseStreak: input.analytics.pulse_streak,
  };
}

export function buildContextualQuickActions(input: {
  quarterlyPulseDue: boolean;
  annualRefreshDue: boolean;
  cvNeedsUpdate: boolean;
  goalMilestoneDue: boolean;
  tier2Complete: boolean;
}): DashboardQuickAction[] {
  if (input.annualRefreshDue) {
    return [
      { label: "Annual refresh", intent: "discuss", href: "/app/subjective" },
      { label: "Review goals", intent: "plan", href: "/app/plan" },
    ];
  }
  if (input.quarterlyPulseDue) {
    return [
      { label: "Quarterly check-in", intent: "discuss", href: "/app/subjective" },
      { label: "Explore map", intent: "assess", href: "/app/assessment" },
    ];
  }
  if (input.cvNeedsUpdate) {
    return [
      { label: "Update CV", intent: "create", href: "/app/output" },
      { label: "Review data", intent: "review", href: "/app/objective" },
    ];
  }
  if (input.goalMilestoneDue) {
    return [
      { label: "Review goals", intent: "plan", href: "/app/plan" },
      { label: "Explore map", intent: "assess", href: "/app/assessment" },
    ];
  }
  if (!input.tier2Complete) {
    return [
      { label: "Upload CV", intent: "upload", href: "/app/objective?tab=documents" },
      { label: "Complete setup", intent: "discuss", href: "/app/onboarding" },
    ];
  }
  return [
    { label: "Assess patterns", intent: "assess", href: "/app/assessment" },
    { label: "Generate document", intent: "create", href: "/app/output" },
  ];
}

export function settingDocumentLabels(
  setting: PracticeSetting | null,
): { primary: string; secondary: string } {
  if (setting === "Community") {
    return { primary: "Resume", secondary: "Credentialing Packet" };
  }
  if (setting === "Industry") {
    return { primary: "Industry CV", secondary: "Expertise Statement" };
  }
  if (setting === "Academic" || setting === "Hybrid") {
    return { primary: "CV", secondary: "NIH Biosketch" };
  }
  return { primary: "CV", secondary: "Career Brief" };
}

export function vaultSummaryForSetting(
  setting: PracticeSetting | null,
  cvAvailable: boolean,
): string {
  if (!cvAvailable) return "Upload documents to populate Career Vault";
  if (setting === "Community") {
    return "Clinical volume · Quality metrics · Certifications · Presentations";
  }
  if (setting === "Industry") {
    return "Therapeutic publications · Advisory boards · Regulatory contributions";
  }
  return "38 publications · 3 active grants · 12 courses · 6 committees · 24 presentations · 5 awards";
}

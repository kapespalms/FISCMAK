import type { CareerHealthView } from "@/lib/v2/career-health-view";
import type { PracticeSetting, CareerStage, AcademicRank } from "@/lib/v2/onboarding-options";
import { SOAP_TAB, GOAL_FRAMEWORK_LABELS, type GoalFrameworkType } from "@/lib/v2/soap-tab-spec";
import type { AnalyticsDashboard } from "@/lib/v2/types";
import type { SubjectiveCheckIn } from "@/lib/subjective-storage";
import type { CareerGoal } from "@/lib/goals";
import type { MetricStatus } from "@/lib/design-system";
import { scoreToMetricStatus, riskToMetricStatus } from "@/lib/design-system";
import {
  resolveBandOrder,
  resolveDashboardAdaptation,
} from "@/lib/v2/dashboard-architecture";
import {
  advancementReadinessFromHealth,
  formatLatticeStrength,
  sparklineTrend,
  type DocumentFreshness,
  type DashboardDocumentCard,
} from "@/lib/v2/dashboard-data";
import { computeGoalProgressWithHistory } from "@/lib/v2/goal-milestone-tracking";

export type SoapBandId = "subjective" | "objective" | "assessment" | "plan" | "output";

export type { DocumentFreshness, DashboardDocumentCard } from "@/lib/v2/dashboard-data";

export type DashboardBandMetric = {
  id: string;
  label: string;
  summary: string;
  percent: number;
  status?: MetricStatus;
  trend?: "up" | "flat" | "down";
  sparkline?: number[];
};

export type SoapBandSnapshot = {
  id: SoapBandId;
  letter: string;
  title: string;
  subtitle: string;
  href: string;
  background: string;
  flowIntent: "discuss" | "review" | "assess" | "plan" | "create";
  lines: string[];
  emphasis?: string;
  progress?: { label: string; percent: number; status?: MetricStatus; stalled?: boolean }[];
  actionLabel: string;
  bandLead?: string;
  metrics?: DashboardBandMetric[];
  careerDirection?: string;
  vaultSummary?: string;
  changesSinceQuarter?: string;
  pendingReviewCount?: number;
  certificationAlert?: string;
  newItemBadge?: number;
  strengths?: string[];
  developmentArea?: string;
  careerAlignment?: { percent: number; label: string };
  advancementReadiness?: { met: number; total: number; label: string };
  showMiniMap?: boolean;
  documentCards?: DashboardDocumentCard[];
  nextMilestone?: string;
  stalledGoalIndex?: number;
};

const SOAP_COLORS: Record<SoapBandId, string> = {
  subjective: "#E8F4F8",
  objective: "#DBEAFE",
  assessment: "#EDE9FE",
  plan: "#FEF3C7",
  output: "#FEE2E2",
};

const SOAP_HREFS: Record<SoapBandId, string> = {
  subjective: "/app/subjective",
  objective: "/app/objective",
  assessment: "/app/assessment",
  plan: "/app/plan",
  output: "/app/output",
};

function fulfillmentLine(health: CareerHealthView | null): string {
  const fulfillment = health?.wellbeing_metrics.find((m) => m.id === "professional_fulfillment" || m.id === "fulfillment");
  if (!fulfillment) return "Fulfillment: Pending";
  return `Fulfillment: ${fulfillment.summary}`;
}

function strainLine(health: CareerHealthView | null): string {
  const strain = health?.wellbeing_metrics.find((m) => m.id === "burnout_risk" || m.id === "work_related_strain");
  if (!strain) return "Strain: Baseline needed";
  return `Strain: ${strain.summary}`;
}

function metricFromWellbeing(
  health: CareerHealthView | null,
  id: string,
  label: string,
  fallbackSummary: string,
  history: number[],
  burnoutTrend?: AnalyticsDashboard["burnout_trend"]["trend"],
  invertRisk = false,
): DashboardBandMetric {
  const metric = health?.wellbeing_metrics.find((m) => m.id === id);
  const tech = metric?.technical ?? {};
  const percentile =
    typeof tech.estimated_percentile === "number"
      ? tech.estimated_percentile
      : typeof tech.percentile === "number"
        ? tech.percentile
        : null;
  const percent = percentile ?? (metric?.status === "strong" ? 72 : metric?.status === "developing" ? 55 : 40);
  const status =
    metric?.status ??
    (invertRisk && typeof tech.risk_level === "string"
      ? riskToMetricStatus(tech.risk_level as "low" | "moderate" | "high" | "unknown")
      : scoreToMetricStatus(percent));
  const sparkline = history.length >= 2 ? history : history.length === 1 ? [history[0], percent] : undefined;
  let trend = sparkline ? sparklineTrend(sparkline) : ("flat" as const);
  if (invertRisk && burnoutTrend === "improving") trend = "up";
  if (invertRisk && burnoutTrend === "declining") trend = "down";
  return {
    id,
    label,
    summary: metric?.summary ?? fallbackSummary,
    percent,
    status,
    trend,
    sparkline,
  };
}

function subjectiveMetricOrder(setting: PracticeSetting | null): string[] {
  if (setting === "Community" || setting === "Hybrid") {
    return ["task_alignment", "work_related_strain", "professional_fulfillment", "career_alignment", "career_direction"];
  }
  if (setting === "Industry") {
    return ["career_direction", "professional_fulfillment", "work_related_strain", "task_alignment", "career_alignment"];
  }
  return ["career_direction", "professional_fulfillment", "work_related_strain", "task_alignment", "career_alignment"];
}

export function documentFreshnessClass(freshness: DocumentFreshness): string {
  if (freshness === "current") return "bg-fm-strong";
  if (freshness === "needs_update") return "bg-fm-developing";
  return "bg-fm-attention";
}

function nextMilestoneFromGoals(goals: CareerGoal[]): string | undefined {
  for (const g of goals) {
    const pending = g.recommended_actions?.find((a) => !a.includes("COMPLETED"));
    if (pending) {
      const cleaned = pending.replace(/^Q\d+ \d{4}:\s*/, "");
      return cleaned;
    }
  }
  return undefined;
}

function settingBandEmphasis(
  setting: PracticeSetting | null,
  level: CareerStage | null,
  band: SoapBandId,
): string | undefined {
  const isAcademic = setting === "Academic" || setting === "Hybrid";
  const isCommunity = setting === "Community" || setting === "Hybrid";
  const isIndustry = setting === "Industry";
  const isTrainee = level === "Medical Student" || level === "Resident" || level === "Fellow";
  const isEarly = level === "Early Career (0–7 yr)" || level === "Resident" || level === "Fellow";
  const isLate = level === "Late Career (20+ yr)" || level === "Retired";

  if (isTrainee && band === "assessment") return "Career Builder map — specialty alignment emerging";
  if (isLate && band === "plan") return "Legacy and transition planning emphasized";
  if (isCommunity && band === "objective") return "Clinical volume and scope metrics primary";
  if (isIndustry && band === "objective") return "Therapeutic expertise and industry engagement primary";
  if (isAcademic && isEarly && band === "plan") return "Development goal emphasized — portfolio building";
  if (isCommunity && level === "Mid-Career (8–20 yr)" && band === "subjective") {
    return "Professional sustainability indicators warrant quarterly monitoring";
  }
  if (isIndustry && band === "subjective") return "Clinical identity and role fit";
  return undefined;
}

export function buildSoapDashboardBands(input: {
  analytics: AnalyticsDashboard;
  subjective?: SubjectiveCheckIn;
  goals?: CareerGoal[];
  specialty?: string | null;
  setting?: PracticeSetting | null;
  level?: CareerStage | null;
  aspiration?: string | null;
  careerTrack?: string | null;
  careerObjective?: string | null;
  rank?: AcademicRank | null;
}): SoapBandSnapshot[] {
  const {
    analytics,
    goals = [],
    specialty,
    setting,
    level,
    aspiration,
    careerTrack,
    careerObjective,
    rank,
  } = input;
  const health = analytics.career_health;
  const cv = analytics.cv_metrics;
  const history = analytics.metric_history;
  const objective = analytics.objective_summary;
  const burnoutTrend = analytics.burnout_trend.trend;
  const goalHistory = analytics.goal_milestone_history ?? [];

  const alignmentPct =
    health?.domains.length
      ? Math.round(
          health.domains.reduce((s, d) => s + d.score, 0) / health.domains.length,
        )
      : null;

  const careerDirectionText = aspiration || careerObjective
    ? `${careerTrack ?? "Track pending"} → (${careerObjective ?? aspiration}, 3yr)`
    : `${careerTrack ?? "Set with Mak"}`;

  const fulfillmentMetric = metricFromWellbeing(
    health,
    "professional_fulfillment",
    "Fulfillment",
    "Pending",
    history.fulfillment,
  );
  const strainMetric = metricFromWellbeing(
    health,
    "burnout_risk",
    "Strain",
    "Baseline needed",
    history.strain,
    burnoutTrend,
    true,
  );
  const taskAlignmentPct =
    cv.bits_score != null
      ? Math.round(100 - cv.bits_score * 8)
      : history.task_alignment.at(-1) ?? 65;
  const taskMetric: DashboardBandMetric = {
    id: "task_alignment",
    label: "Task Alignment",
    summary: `${taskAlignmentPct}% of work aligned with core professional role`,
    percent: taskAlignmentPct,
    status: scoreToMetricStatus(taskAlignmentPct),
    trend: sparklineTrend(history.task_alignment.length >= 2 ? history.task_alignment : [taskAlignmentPct]),
    sparkline: history.task_alignment.length >= 2 ? history.task_alignment : undefined,
  };
  const alignmentMetric: DashboardBandMetric = {
    id: "career_alignment",
    label: "Alignment",
    summary:
      alignmentPct != null
        ? `${alignmentPct}% toward objective`
        : "Pending",
    percent: alignmentPct ?? 0,
    status: alignmentPct != null ? scoreToMetricStatus(alignmentPct) : "stable",
    trend: sparklineTrend(history.alignment.length >= 2 ? history.alignment : alignmentPct != null ? [alignmentPct] : []),
    sparkline: history.alignment.length >= 2 ? history.alignment : undefined,
  };
  const directionMetric: DashboardBandMetric = {
    id: "career_direction",
    label: "Direction",
    summary: careerDirectionText,
    percent: alignmentPct ?? 50,
    status: "stable",
    trend: "flat",
  };

  const metricMap: Record<string, DashboardBandMetric> = {
    career_direction: directionMetric,
    professional_fulfillment: fulfillmentMetric,
    work_related_strain: { ...strainMetric, id: "work_related_strain", label: "Strain" },
    task_alignment: taskMetric,
    career_alignment: alignmentMetric,
  };
  const orderedSubjectiveMetrics = subjectiveMetricOrder(setting ?? null)
    .map((id) => metricMap[id])
    .filter(Boolean);

  const subjectiveBand: SoapBandSnapshot = {
    id: "subjective",
    letter: "S",
    title: SOAP_TAB.subjective.nav,
    subtitle: SOAP_TAB.subjective.title,
    href: SOAP_HREFS.subjective,
    background: SOAP_COLORS.subjective,
    flowIntent: "discuss",
    lines: [
      `Direction: ${careerDirectionText}`,
      fulfillmentLine(health),
      strainLine(health),
      `Task Alignment: ${taskMetric.summary}`,
      alignmentPct != null
        ? `Alignment: ${alignmentPct}%`
        : "Alignment: Pending",
    ],
    careerDirection: careerDirectionText,
    metrics: orderedSubjectiveMetrics,
    emphasis: settingBandEmphasis(setting ?? null, level ?? null, "subjective"),
    actionLabel: "Open Perspective",
  };

  const objectiveBand: SoapBandSnapshot = {
    id: "objective",
    letter: "O",
    title: SOAP_TAB.objective.nav,
    subtitle: SOAP_TAB.objective.title,
    href: SOAP_HREFS.objective,
    background: SOAP_COLORS.objective,
    flowIntent: "review",
    lines: [
      objective.vaultSummary,
      objective.changesSinceQuarter ?? "Changes since last quarter: pending API enrichment",
      objective.pendingReviewCount
        ? `${objective.pendingReviewCount} item${objective.pendingReviewCount > 1 ? "s" : ""} pending review`
        : "Items pending review: reconcile when enrichment completes",
    ],
    vaultSummary: objective.vaultSummary,
    changesSinceQuarter: objective.changesSinceQuarter ?? undefined,
    pendingReviewCount: objective.pendingReviewCount || undefined,
    newItemBadge: objective.newItemCount > 0 ? objective.newItemCount : undefined,
    certificationAlert: objective.certificationAlert ?? undefined,
    emphasis: settingBandEmphasis(setting ?? null, level ?? null, "objective"),
    actionLabel: "Open Objective",
  };

  const latticeCells = analytics.dashboard_lattice;
  const topLattice = [...latticeCells]
    .filter((c) => c.score != null)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 3);
  const weakLattice = [...latticeCells]
    .filter((c) => c.score != null)
    .sort((a, b) => (a.score ?? 0) - (b.score ?? 0))[0];

  const topDomains = health?.domains.slice().sort((a, b) => b.score - a.score).slice(0, 3) ?? [];
  const weakDomain = health?.domains.slice().sort((a, b) => a.score - b.score)[0];
  const strengths =
    topLattice.length >= 3
      ? topLattice.map(formatLatticeStrength)
      : topDomains.map((d) => `${d.label} (${d.score})`);

  const readiness = advancementReadinessFromHealth(health, rank ?? null, setting ?? null);

  const assessmentBand: SoapBandSnapshot = {
    id: "assessment",
    letter: "A",
    title: SOAP_TAB.assessment.nav,
    subtitle: SOAP_TAB.assessment.title,
    href: SOAP_HREFS.assessment,
    background: SOAP_COLORS.assessment,
    flowIntent: "assess",
    lines: health
      ? [
          topDomains.length
            ? `Strengths: ${topDomains.map((d) => `${d.label} (${d.score})`).join(", ")}`
            : "Strengths: pending more data",
          weakDomain
            ? `Development Area: ${weakDomain.label} (${weakDomain.score}) — largest gap to stated objective`
            : "Development area: complete assessment modules",
          alignmentPct != null && (careerObjective ?? aspiration)
            ? `Career Alignment: ${alignmentPct}% toward ${careerObjective ?? aspiration}`
            : health.promotion_label,
        ]
      : ["Complete Insights setup to generate your Career Map"],
    showMiniMap: true,
    strengths,
    developmentArea: weakLattice
      ? `${formatLatticeStrength(weakLattice)} — largest gap to stated objective`
      : weakDomain
        ? `${weakDomain.label} (${weakDomain.score}) — largest gap to stated objective`
        : undefined,
    careerAlignment:
      alignmentPct != null
        ? {
            percent: alignmentPct,
            label: careerObjective ?? aspiration ?? "stated objective",
          }
        : undefined,
    advancementReadiness: readiness,
    emphasis: settingBandEmphasis(setting ?? null, level ?? null, "assessment"),
    actionLabel: "Open Insights",
  };

  const activeGoals = goals.filter((g) => g.status === "active").slice(0, 3);
  const defaultProgress: SoapBandSnapshot["progress"] = [
    { label: "Development Goal", percent: 0, status: "stable" },
    { label: "Maintenance Goal", percent: 0, status: "stable" },
    { label: "Sustainability Goal", percent: 0, status: "stable" },
  ];
  const planProgress =
    activeGoals.length > 0
      ? activeGoals.map((g) => {
          const { percent, stalled } = computeGoalProgressWithHistory(g, goalHistory);
          return {
            label: `${GOAL_FRAMEWORK_LABELS[g.goal_type as GoalFrameworkType]?.label ?? "Goal"}: ${g.goal_title}`,
            percent: g.status === "completed" ? 100 : percent,
            status: (g.status === "completed"
              ? "strong"
              : stalled
                ? "needs_attention"
                : "developing") as MetricStatus,
            stalled,
          };
        })
      : defaultProgress;

  const stalledIdx =
    planProgress.findIndex((p) => p.stalled) >= 0
      ? planProgress.findIndex((p) => p.stalled)
      : analytics.stalled_goal_quarters >= 2
        ? planProgress.findIndex((p) => p.status === "needs_attention")
        : -1;

  const planBand: SoapBandSnapshot = {
    id: "plan",
    letter: "P",
    title: SOAP_TAB.plan.nav,
    subtitle: SOAP_TAB.plan.title,
    href: SOAP_HREFS.plan,
    background: SOAP_COLORS.plan,
    flowIntent: "plan",
    lines:
      activeGoals.length > 0
        ? activeGoals.map(
            (g) =>
              `${GOAL_FRAMEWORK_LABELS[g.goal_type as GoalFrameworkType]?.label ?? "Goal"}: ${g.goal_title}`,
          )
        : ["Goals will be suggested after your Insights are generated"],
    progress: planProgress,
    nextMilestone: nextMilestoneFromGoals(activeGoals),
    stalledGoalIndex: stalledIdx >= 0 ? stalledIdx : undefined,
    emphasis: settingBandEmphasis(setting ?? null, level ?? null, "plan"),
    actionLabel: "Open Strategy",
  };

  const outputBand: SoapBandSnapshot = {
    id: "output",
    letter: "O",
    title: SOAP_TAB.output.nav,
    subtitle: SOAP_TAB.output.title,
    href: SOAP_HREFS.output,
    background: SOAP_COLORS.output,
    flowIntent: "create",
    lines: analytics.document_cards.map((d) => `${d.title}: ${d.detail}`),
    documentCards: analytics.document_cards,
    advancementReadiness: readiness
      ? { ...readiness, label: "Advancement Readiness Report" }
      : undefined,
    emphasis: settingBandEmphasis(setting ?? null, level ?? null, "output"),
    actionLabel: "Open Output Studio",
  };

  const bandMap: Record<SoapBandId, SoapBandSnapshot> = {
    subjective: subjectiveBand,
    objective: objectiveBand,
    assessment: assessmentBand,
    plan: planBand,
    output: outputBand,
  };

  const order = resolveBandOrder(setting ?? null, level ?? null, rank ?? null, careerTrack ?? null);
  const adaptation = resolveDashboardAdaptation({
    setting: setting ?? null,
    level: level ?? null,
    rank: rank ?? null,
    track: careerTrack ?? null,
  });
  const leadByBand: Record<SoapBandId, string> = {
    subjective: adaptation.subjectiveLead,
    objective: adaptation.objectiveLead,
    assessment: adaptation.assessmentLead,
    plan: adaptation.planLead,
    output: adaptation.outputLead,
  };
  return order.map((id) => ({ ...bandMap[id], bandLead: leadByBand[id] }));
}

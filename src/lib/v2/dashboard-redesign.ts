import type { CareerGoal } from "@/lib/goals";
import type { MetricStatus } from "@/lib/design-system";
import type { DashboardBandMetric } from "@/lib/v2/dashboard-snapshot";
import type { AnalyticsDashboard } from "@/lib/v2/types";
import type { DashboardHeaderModel } from "@/lib/v2/dashboard-architecture";
import { TOUCHPOINT_META } from "@/lib/v2/formulas";
import { GOAL_FRAMEWORK_LABELS, type GoalFrameworkType } from "@/lib/v2/soap-tab-spec";
import { computeGoalProgressWithHistory } from "@/lib/v2/goal-milestone-tracking";
import type { EngagementNotification } from "@/lib/v2/engagement-tracking";

export type TouchpointBarState = "done" | "active" | "locked";

export type ProfileRow = {
  id: string;
  label: string;
  value: string;
  status?: MetricStatus;
};

export type ActiveTouchpointView = {
  id: string;
  title: string;
  duration: string;
  statusLabel: string;
  description: string;
  upNext?: { title: string; label: string };
  kind: "annual" | "quarterly" | "assessment";
};

export function touchpointBarStates(completed: number): TouchpointBarState[] {
  return Array.from({ length: 7 }, (_, i) => {
    const n = i + 1;
    if (n <= completed) return "done";
    if (n === completed + 1) return "active";
    return "locked";
  });
}

export function simplifyMetricLabel(label: string): string {
  return label
    .replace(/^Career\s+/i, "")
    .replace(/^Professional\s+/i, "")
    .replace(/^Work-Related\s+/i, "Work ");
}

function shortDirection(summary: string): string {
  const arrow = summary.match(/(.+?)\s*→\s*(.+?)(?:\s*\(|$)/);
  if (arrow) {
    const target = arrow[2].replace(/\s*\(.*$/, "").trim();
    const yr = summary.match(/\((\d+-?yr?[^)]*)\)/i);
    return `${target}${yr ? ` (${yr[1]})` : ""}`;
  }
  if (summary.length > 48) return `${summary.slice(0, 45)}…`;
  return summary;
}

function shortFulfillment(summary: string): string {
  if (/complete|pending|baseline/i.test(summary)) {
    if (/pending/i.test(summary)) return "Pending";
    if (/baseline/i.test(summary)) return "Baseline needed";
    return "Check-in needed";
  }
  const parts = summary.split(":");
  const tail = (parts.length > 1 ? parts.slice(1).join(":") : summary).trim();
  if (tail.length > 36) return `${tail.slice(0, 33)}…`;
  return tail || "Pending";
}

function shortStrain(summary: string): string {
  if (/pending|baseline|complete your/i.test(summary)) return "Baseline needed";
  const parts = summary.split(":");
  const tail = (parts.length > 1 ? parts.slice(1).join(":") : summary).trim();
  if (tail.length > 32) return `${tail.slice(0, 29)}…`;
  return tail || "Baseline needed";
}

function shortAlignment(summary: string, percent?: number): string {
  if (percent != null) return `${percent}%`;
  const match = summary.match(/(\d+)%/);
  if (match) return `${match[1]}%`;
  if (/pending/i.test(summary)) return "Pending";
  return summary.length > 24 ? `${summary.slice(0, 21)}…` : summary;
}

export function buildProfileRows(metrics: DashboardBandMetric[]): ProfileRow[] {
  const byId = Object.fromEntries(metrics.map((m) => [m.id, m]));
  const rows: ProfileRow[] = [];

  const direction = byId.career_direction;
  if (direction) {
    rows.push({
      id: "direction",
      label: "Direction",
      value: shortDirection(direction.summary),
      status: direction.status,
    });
  }

  const fulfillment = byId.professional_fulfillment;
  if (fulfillment) {
    rows.push({
      id: "fulfillment",
      label: "Fulfillment",
      value: shortFulfillment(fulfillment.summary),
      status: fulfillment.status,
    });
  }

  const strain = byId.work_related_strain ?? byId.burnout_risk;
  if (strain) {
    rows.push({
      id: "strain",
      label: "Strain",
      value: shortStrain(strain.summary),
      status: strain.status,
    });
  }

  const alignment = byId.career_alignment;
  if (alignment) {
    rows.push({
      id: "alignment",
      label: "Alignment",
      value: shortAlignment(alignment.summary, alignment.percent),
      status: alignment.status,
    });
  }

  return rows;
}

export function buildProgressStatus(analytics: AnalyticsDashboard): ProfileRow {
  const pct = analytics.assessment_progress.completion_percentage;
  return {
    id: "progress",
    label: "Progress",
    value: `${pct}%`,
    status: pct >= 70 ? "strong" : pct >= 40 ? "developing" : "needs_attention",
  };
}

export function buildHealthStatusRow(header: DashboardHeaderModel): ProfileRow {
  const score = header.careerHealthScore;
  let value = "Pending";
  if (score != null) {
    if (score >= 70) value = "Strong";
    else if (score >= 50) value = "Developing";
    else value = "Needs attention";
  }
  return {
    id: "status",
    label: "Status",
    value,
    status: header.scoreStatus ?? "stable",
  };
}

/** Recognition gap from IWQ — spec dashboard quick-stat. */
export function buildRecognitionGapRow(analytics: AnalyticsDashboard): ProfileRow | null {
  const iwq = analytics.cv_metrics?.iwq;
  if (iwq == null) return null;

  let status: ProfileRow["status"] = "strong";
  if (iwq >= 70) status = "needs_attention";
  else if (iwq >= 50) status = "developing";

  return {
    id: "recognition_gap",
    label: "Recognition gap",
    value: iwq >= 50 ? `${iwq}% unrecognized` : "Low",
    status,
  };
}

export function buildActiveTouchpointView(analytics: AnalyticsDashboard): {
  active: ActiveTouchpointView | null;
  upcoming: ActiveTouchpointView | null;
} {
  if (analytics.annual_refresh?.due) {
    const upcoming = analytics.quarterly_pulse?.due
      ? {
          id: "quarterly",
          title: "Quarterly pulse",
          duration: "~5–8 min",
          statusLabel: "Up next",
          description: "Well-being, invisible work, and momentum check.",
          kind: "quarterly" as const,
        }
      : buildAssessmentTouchpoint(analytics, "upcoming");

    return {
      active: {
        id: "annual",
        title: "Annual refresh",
        duration: "~20 min",
        statusLabel: "Active now",
        description: "Reconfirm direction, energy, invisible work, and goals.",
        kind: "annual",
        upNext: upcoming
          ? { title: upcoming.title, label: upcoming.duration }
          : undefined,
      },
      upcoming,
    };
  }

  if (analytics.quarterly_pulse?.due) {
    return {
      active: {
        id: "quarterly",
        title: `${analytics.quarterly_pulse.quarter_label} pulse`,
        duration: "~5–8 min",
        statusLabel: "Active now",
        description: "Well-being, invisible work, and momentum check.",
        kind: "quarterly",
        upNext: buildAssessmentTouchpoint(analytics, "upcoming")
          ? {
              title: buildAssessmentTouchpoint(analytics, "upcoming")!.title,
              label: buildAssessmentTouchpoint(analytics, "upcoming")!.duration,
            }
          : undefined,
      },
      upcoming: buildAssessmentTouchpoint(analytics, "upcoming"),
    };
  }

  const active = buildAssessmentTouchpoint(analytics, "active");
  const upcoming = buildAssessmentTouchpoint(analytics, "upcoming", active?.id);
  return { active, upcoming };
}

function buildAssessmentTouchpoint(
  analytics: AnalyticsDashboard,
  role: "active" | "upcoming",
  skipId?: string,
): ActiveTouchpointView | null {
  const completed = analytics.assessment_progress.completed_touchpoints;
  const nextNum =
    role === "active"
      ? completed < 7
        ? completed + 1
        : null
      : completed < 6
        ? completed + 2
        : null;

  if (!nextNum || nextNum > 7) return null;
  const meta = TOUCHPOINT_META[nextNum];
  if (!meta) return null;

  const id = `tp-${nextNum}`;
  if (skipId === id) return null;

  return {
    id,
    title: meta.title,
    duration: nextNum <= 3 ? "~15 min" : nextNum <= 5 ? "~20 min" : "~10 min",
    statusLabel: role === "active" ? "Active now" : "Up next",
    description: touchpointDescription(nextNum),
    kind: "assessment",
  };
}

function touchpointDescription(tp: number): string {
  const descriptions: Record<number, string> = {
    1: "Establish professional identity and baseline perspective.",
    2: "Inventory publications, grants, and core activities.",
    3: "Energy levels and invisible work baseline.",
    4: "Values, narrative, and goal alignment.",
    5: "Promotion readiness and gap analysis.",
    6: "Job market fit and opportunity scan.",
    7: "Progress review and accountability.",
  };
  return descriptions[tp] ?? "Continue your assessment pathway.";
}

export type GoalCardModel = {
  id: string;
  type: string;
  typeLabel: string;
  title: string;
  percent: number;
  nextMilestone: string;
  stalled: boolean;
  borderColor: "primary" | "attention" | "success";
  fillColor: "primary" | "attention" | "success";
};

export function buildGoalCards(
  goals: CareerGoal[],
  history: AnalyticsDashboard["goal_milestone_history"],
): GoalCardModel[] {
  return goals
    .filter((g) => g.status === "active")
    .slice(0, 3)
    .map((goal) => {
      const { percent, stalled } = computeGoalProgressWithHistory(goal, history);
      const type = (goal.goal_type ?? "development") as GoalFrameworkType;
      const typeLabel =
        GOAL_FRAMEWORK_LABELS[type]?.label.replace(/\s+Goal$/i, "") ?? "Development";

      const pending = goal.recommended_actions?.find((a) => !/COMPLETED/i.test(a));
      const nextMilestone = pending
        ? pending.replace(/^Q\d+ \d{4}:\s*/, "")
        : "No milestone due";

      let borderColor: GoalCardModel["borderColor"] = "primary";
      let fillColor: GoalCardModel["fillColor"] = "primary";
      if (percent >= 80) {
        borderColor = "success";
        fillColor = "success";
      } else if (stalled || percent < 30) {
        borderColor = "attention";
        fillColor = "attention";
      }

      return {
        id: goal.id,
        type,
        typeLabel,
        title: goal.goal_title,
        percent,
        nextMilestone,
        stalled,
        borderColor,
        fillColor,
      };
    });
}

export type DashboardDueNowItem = {
  label: string;
  title: string;
  detail?: string;
  kind: ActiveTouchpointView["kind"];
};

export function buildDashboardDueNow(
  analytics: AnalyticsDashboard,
  touchpoints: { active: ActiveTouchpointView | null },
): DashboardDueNowItem | null {
  if (analytics.annual_refresh?.due) {
    return {
      label: "Annual refresh",
      title: "Reconfirm direction, energy, and goals",
      detail: "~20 min",
      kind: "annual",
    };
  }
  if (analytics.quarterly_pulse?.due) {
    return {
      label: "Quarterly pulse",
      title: analytics.quarterly_pulse.quarter_label
        ? `${analytics.quarterly_pulse.quarter_label} check-in`
        : "Quarterly check-in",
      detail: "~5–8 min",
      kind: "quarterly",
    };
  }
  const active = touchpoints.active;
  if (active) {
    return {
      label: active.statusLabel,
      title: active.title,
      detail: active.description ?? active.duration,
      kind: active.kind,
    };
  }
  return null;
}

/** Secondary alerts — excludes items already shown in due-now banner. */
export function buildDashboardSecondaryAlerts(
  notifications: EngagementNotification[],
  dueNow: DashboardDueNowItem | null,
): EngagementNotification[] {
  const skip = new Set<string>();
  if (dueNow?.kind === "annual") skip.add("annual_refresh");
  if (dueNow?.kind === "quarterly") skip.add("quarterly_pulse");

  return (notifications ?? []).filter((n) => !skip.has(n.id)).slice(0, 3);
}

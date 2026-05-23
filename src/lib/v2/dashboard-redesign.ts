import type { CareerGoal } from "@/lib/goals";
import type { MetricStatus } from "@/lib/design-system";
import type { DashboardBandMetric } from "@/lib/v2/dashboard-snapshot";
import type { AnalyticsDashboard } from "@/lib/v2/types";
import type { DashboardHeaderModel, DashboardQuickAction } from "@/lib/v2/dashboard-architecture";
import { TOUCHPOINT_META } from "@/lib/v2/formulas";
import { GOAL_FRAMEWORK_LABELS, type GoalFrameworkType } from "@/lib/v2/soap-tab-spec";
import { computeGoalProgressWithHistory } from "@/lib/v2/goal-milestone-tracking";
import type { EngagementNotification } from "@/lib/v2/engagement-tracking";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  ClipboardList,
  FileText,
  Map,
  MessageCircle,
  Upload,
  Zap,
} from "lucide-react";
import { MAK_FLOW_GREETINGS } from "@/lib/mak-sections";

export type TouchpointBarState = "done" | "active" | "locked";

export type ProfileRow = {
  id: string;
  label: string;
  value: string;
  status?: MetricStatus;
};

export type DashboardNextAction = {
  id: string;
  label: string;
  status: "done" | "active" | "attention" | "locked";
  href?: string;
  intent?: DashboardQuickAction["intent"];
};

export type DashboardMakAction = {
  id: string;
  label: string;
  subtitle: string;
  icon: LucideIcon;
  intent: DashboardQuickAction["intent"];
  href: string;
  message?: string;
  tier: "primary" | "flow";
};

/** Post-onboarding dashboard Mak entry points (primary + SOAPO flows). */
export const DASHBOARD_MAK_ACTIONS: DashboardMakAction[] = [
  {
    id: "capture",
    label: "Capture invisible work",
    subtitle: "Log an activity in 30 seconds",
    icon: Zap,
    intent: "capture",
    href: "/app/dashboard",
    tier: "primary",
  },
  {
    id: "upload",
    label: "Upload document",
    subtitle: "CV, dossier, or PDF",
    icon: Upload,
    intent: "upload",
    href: "/app/objective?tab=documents",
    tier: "primary",
  },
  {
    id: "discuss-energy",
    label: "Discuss your energy",
    subtitle: "How are you feeling this week?",
    icon: MessageCircle,
    intent: "discuss",
    href: "/app/subjective",
    message: "How's my energy and well-being this week?",
    tier: "flow",
  },
  {
    id: "review-activities",
    label: "Review your activities",
    subtitle: "See what you have logged",
    icon: ClipboardList,
    intent: "review",
    href: "/app/objective?tab=activities",
    message: "Let's review my recent activities and recognition gaps.",
    tier: "flow",
  },
  {
    id: "assess-patterns",
    label: "Assess your patterns",
    subtitle: "Career story and coherence",
    icon: BarChart3,
    intent: "assess",
    href: "/app/assessment",
    tier: "flow",
  },
  {
    id: "plan-strategy",
    label: "Plan your strategy",
    subtitle: "Goals and quarterly milestones",
    icon: Map,
    intent: "plan",
    href: "/app/plan",
    tier: "flow",
  },
  {
    id: "create-outputs",
    label: "Create your outputs",
    subtitle: "CV, biosketch, or narrative",
    icon: FileText,
    intent: "create",
    href: "/app/output",
    tier: "flow",
  },
];

/** @deprecated Use DASHBOARD_MAK_ACTIONS */
export const PROFILE_QUICK_ACTIONS = DASHBOARD_MAK_ACTIONS.filter((a) => a.tier === "flow");

export function makActionGreeting(action: DashboardMakAction): string {
  return action.message ?? MAK_FLOW_GREETINGS[action.intent];
}

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

export function buildNextActions(input: {
  analytics: AnalyticsDashboard;
  notifications: EngagementNotification[];
  quickActions: DashboardQuickAction[];
  jobSearchActive?: boolean;
}): DashboardNextAction[] {
  const actions: DashboardNextAction[] = [];

  if (input.analytics.annual_refresh?.due) {
    actions.push({
      id: "annual",
      label: "Complete annual refresh",
      status: "active",
      href: "/app/subjective",
    });
  } else if (input.analytics.quarterly_pulse?.due) {
    actions.push({
      id: "quarterly",
      label: "Complete quarterly pulse",
      status: "active",
      href: "/app/subjective",
    });
  }

  for (const note of input.notifications.slice(0, 3)) {
    actions.push({
      id: note.id,
      label: note.title,
      status: note.severity === "urgent" ? "attention" : "active",
      href: note.href,
    });
  }

  for (const qa of input.quickActions.slice(0, 2)) {
    if (actions.some((a) => a.label === qa.label)) continue;
    actions.push({
      id: qa.label,
      label: qa.label,
      status: "active",
      href: qa.href,
      intent: qa.intent,
    });
  }

  if (input.analytics.stalled_goal_title) {
    actions.push({
      id: "stalled-goal",
      label: `Review: ${input.analytics.stalled_goal_title}`,
      status: "attention",
      href: "/app/plan",
    });
  }

  const jobs = input.analytics.job_engagement;
  if (jobs.jobs_saved > 0) {
    actions.push({
      id: "saved-jobs",
      label: `Review ${jobs.jobs_saved} saved position${jobs.jobs_saved > 1 ? "s" : ""}`,
      status: "active",
      href: "/app/jobs",
    });
  } else if (input.analytics.job_engagement.jobs_viewed === 0) {
    const meta = input.jobSearchActive;
    if (meta) {
      actions.push({
        id: "job-search",
        label: "Review job matches",
        status: "active",
        href: "/app/jobs",
      });
    }
  }

  return actions.slice(0, 6);
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
        GOAL_FRAMEWORK_LABELS[type]?.label.replace(/\s+Goal$/i, "").toUpperCase() ?? "DEVELOP";

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

export function statusIcon(status: DashboardNextAction["status"] | TouchpointBarState): StatusKind {
  if (status === "done") return "done";
  if (status === "active") return "active";
  if (status === "attention") return "attention";
  return "locked";
}

export type StatusKind = "done" | "active" | "attention" | "locked";

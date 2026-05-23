import type { OnboardingMetadata } from "@/lib/v2/onboarding-compute";
import { quarterlyPulseStatus } from "@/lib/v2/quarterly-pulse";
import { annualRefreshStatus } from "@/lib/v2/annual-refresh";

export type EngagementNotification = {
  id: string;
  severity: "info" | "attention" | "urgent";
  title: string;
  message: string;
  href?: string;
  actionLabel?: string;
};

export function buildEngagementNotifications(
  meta: OnboardingMetadata,
): EngagementNotification[] {
  const notes: EngagementNotification[] = [];
  const pulse = quarterlyPulseStatus(meta);
  const annual = annualRefreshStatus(meta);

  if (annual.due) {
    notes.push({
      id: "annual_refresh",
      severity: "attention",
      title: "Annual career refresh due",
      message: "Complete your annual direction and goal reset with Coach Mak.",
      href: "/app/subjective",
      actionLabel: "Begin with Mak",
    });
  } else if (pulse.due) {
    notes.push({
      id: "quarterly_pulse",
      severity: "attention",
      title: `${pulse.quarter_label} check-in due`,
      message:
        pulse.last_summary ??
        "Quick well-being, unrecognized work, and momentum update (~5–8 min).",
      href: "/app/subjective",
      actionLabel: "Start check-in",
    });
  }

  if ((meta.low_alignment_quarters ?? 0) >= 2) {
    notes.push({
      id: "low_alignment",
      severity: "urgent",
      title: "Career alignment below target",
      message: `Alignment has been low for ${meta.low_alignment_quarters} consecutive quarters. A career direction conversation is recommended.`,
      href: "/app/subjective",
      actionLabel: "Discuss with Mak",
    });
  }

  if ((meta.stalled_goal_quarters ?? 0) >= 2 && meta.stalled_goal_title) {
    notes.push({
      id: "stalled_goal",
      severity: "attention",
      title: "Goal progress stalled",
      message: `"${meta.stalled_goal_title}" has not advanced in ${meta.stalled_goal_quarters} quarters.`,
      href: "/app/plan",
      actionLabel: "Review goals",
    });
  }

  if ((meta.metric_declines?.length ?? 0) > 0) {
    const latest = meta.metric_declines![0];
    notes.push({
      id: "metric_decline",
      severity: "attention",
      title: `${latest.metricName} declined`,
      message: `${latest.metricName} dropped from ${latest.fromPercentile} to ${latest.toPercentile} in ${latest.quarter}.`,
      href: "/app/assessment",
      actionLabel: "View Career Profile",
    });
  }

  if (!meta.goals_confirmed && meta.computed_at) {
    notes.push({
      id: "goals_unconfirmed",
      severity: "info",
      title: "Confirm your career goals",
      message: "Review and confirm your three proposed goals to unlock full dashboard insights.",
      href: "/app/plan",
      actionLabel: "Confirm goals",
    });
  }

  const pendingReconcile = (meta.reconciliation ?? []).filter(
    (r) => r.status === "pending",
  ).length;
  if (pendingReconcile > 0) {
    notes.push({
      id: "reconcile_pending",
      severity: "info",
      title: `${pendingReconcile} career data item${pendingReconcile > 1 ? "s" : ""} pending review`,
      message: "Confirm or reject enriched items to keep your Career Data vault current.",
      href: "/app/objective?tab=reconcile",
      actionLabel: "Review items",
    });
  }

  if (meta.invisible_work_recommendations?.length) {
    notes.push({
      id: "invisible_work_rec",
      severity: "info",
      title: "Sustainability goal suggested",
      message: meta.invisible_work_recommendations[0].message,
      href: "/app/plan",
      actionLabel: "Review suggestion",
    });
  }

  return notes;
}

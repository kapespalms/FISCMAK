import { TOUCHPOINT_META } from "@/lib/v2/formulas";
import type { EngagementNotification } from "@/lib/v2/engagement-tracking";

export type TouchpointCadenceContext = {
  userCreatedAt: string;
  completedTouchpoints: number;
  tier3Complete: boolean;
};

/**
 * Nudge users into the next scheduled coaching touchpoint based on daysFromStart.
 */
export function buildTouchpointCadenceNotifications(
  ctx: TouchpointCadenceContext,
): EngagementNotification[] {
  if (!ctx.tier3Complete || ctx.completedTouchpoints >= 7) return [];

  const nextNum = ctx.completedTouchpoints + 1;
  const meta = TOUCHPOINT_META[nextNum];
  if (!meta) return [];

  const dueMs =
    new Date(ctx.userCreatedAt).getTime() + meta.daysFromStart * 86_400_000;
  const daysUntil = Math.ceil((dueMs - Date.now()) / 86_400_000);

  if (daysUntil > 7) return [];

  const title = `Touchpoint ${nextNum}: ${meta.title}`;

  if (daysUntil <= 0) {
    const overdue = Math.abs(daysUntil);
    return [
      {
        id: `touchpoint_${nextNum}_due`,
        severity: overdue >= 7 ? "urgent" : "attention",
        title: overdue >= 7 ? `${title} overdue` : `${title} is due`,
        message:
          overdue >= 7
            ? `This check-in was due ${overdue} days ago. Coach Mak can help you catch up in ~15 minutes.`
            : "Your scheduled coaching check-in is ready. Continue with Mak to stay on track.",
        href: "/app/assessment",
        actionLabel: "Start with Mak",
      },
    ];
  }

  return [
    {
      id: `touchpoint_${nextNum}_upcoming`,
      severity: "info",
      title: `${title} in ${daysUntil} day${daysUntil === 1 ? "" : "s"}`,
      message: `Your ${meta.title.toLowerCase()} touchpoint opens soon. Plan ~15 minutes with Coach Mak.`,
      href: "/app/assessment",
      actionLabel: "Preview touchpoint",
    },
  ];
}

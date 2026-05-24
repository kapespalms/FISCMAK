/**
 * Email notifications for engagement alerts (quarterly pulse, touchpoints, recognition gap).
 * Uses Resend when RESEND_API_KEY is set; otherwise logs only.
 */

import type { EngagementNotification } from "@/lib/v2/engagement-tracking";

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim() && process.env.RESEND_FROM_EMAIL?.trim());
}

function buildEmailHtml(name: string, notifications: EngagementNotification[]): string {
  const items = notifications
    .map(
      (n) =>
        `<li><strong>${n.title}</strong><br/>${n.message}${n.href ? ` <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}${n.href}">${n.actionLabel ?? "Open"}</a>` : ""}</li>`,
    )
    .join("");

  return `<p>Hi ${name},</p><p>Coach Mak has ${notifications.length} update${notifications.length === 1 ? "" : "s"} for you:</p><ul>${items}</ul><p>— FISCMAK</p>`;
}

export async function sendEngagementDigest(input: {
  to: string;
  name: string;
  notifications: EngagementNotification[];
}): Promise<{ sent: boolean; reason?: string }> {
  if (input.notifications.length === 0) {
    return { sent: false, reason: "no_notifications" };
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!apiKey || !from) {
    console.log(
      `[notifications] Would email ${input.to}: ${input.notifications.map((n) => n.title).join(", ")}`,
    );
    return { sent: false, reason: "email_not_configured" };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: input.to,
      subject: `Coach Mak — ${input.notifications[0].title}`,
      html: buildEmailHtml(input.name, input.notifications),
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Resend error:", err);
    return { sent: false, reason: "send_failed" };
  }

  return { sent: true };
}

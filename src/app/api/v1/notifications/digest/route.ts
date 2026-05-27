import { NextResponse } from "next/server";
import { buildAnalyticsDashboard } from "@/lib/v2/db";
import { sendEngagementDigest, isEmailConfigured } from "@/lib/v2/notification-service";
import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
} from "@/lib/v2/api-helpers";

function authorizeCron(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

/** Send engagement digest email for the current user (or cron with userId body). */
export async function POST(request: Request) {
  const cron = authorizeCron(request);
  let userId: string | null = null;
  let email: string | null = null;

  if (cron) {
    const body = await request.json().catch(() => ({}));
    userId = typeof body.userId === "string" ? body.userId : null;
    email = typeof body.email === "string" ? body.email : null;
    if (!userId || !email) {
      return NextResponse.json({ error: "userId and email required for cron" }, { status: 400 });
    }
  } else {
    const auth = await requireApiUser();
    if (isErrorResponse(auth)) return auth;
    userId = auth.userId;
    email = auth.email;
  }

  const user = await getAppUser(userId, false);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const dashboard = await buildAnalyticsDashboard(user, false);
  const notifications = dashboard.engagement_notifications.filter(
    (n) => n.severity === "attention" || n.severity === "urgent",
  );

  const result = await sendEngagementDigest({
    to: email,
    name: user.name ?? "Doctor",
    notifications,
  });

  return jsonOk({
    email_configured: isEmailConfigured(),
    notification_count: notifications.length,
    ...result,
  });
}

import { getAppUser, isErrorResponse, jsonOk, requireApiUser, upsertAppUser } from "@/lib/v2/api-helpers";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";
import type { CalendarSpan } from "@/lib/v2/schedule-calendar/types";

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) return jsonOk({ error: "not_found" }, 404);

  const meta = getOnboardingMetadata(user);
  return jsonOk({
    color_overrides: meta.schedule_color_overrides ?? {},
    dashboard_span: meta.schedule_dashboard_span ?? 1,
  });
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) return jsonOk({ error: "not_found" }, 404);

  const body = (await request.json()) as {
    color_overrides?: Record<string, string>;
    dashboard_span?: CalendarSpan;
  };

  const priorMeta = getOnboardingMetadata(user);
  const color_overrides = body.color_overrides ?? priorMeta.schedule_color_overrides ?? {};
  const dashboard_span = body.dashboard_span ?? priorMeta.schedule_dashboard_span ?? 1;

  const sanitizedColors: Record<string, string> = {};
  for (const [code, hex] of Object.entries(color_overrides)) {
    if (typeof hex === "string" && /^#[0-9A-Fa-f]{6}$/.test(hex.trim())) {
      sanitizedColors[code] = hex.trim();
    }
  }

  const span: CalendarSpan =
    dashboard_span === 3 || dashboard_span === 6 || dashboard_span === 9 || dashboard_span === 12
      ? dashboard_span
      : 1;

  await upsertAppUser(
    auth.userId,
    auth.email,
    {
      onboarding_metadata: {
        ...priorMeta,
        schedule_color_overrides: sanitizedColors,
        schedule_dashboard_span: span,
      },
    },
    auth.demo,
  );

  return jsonOk({ color_overrides: sanitizedColors, dashboard_span: span });
}

import {
  isErrorResponse,
  jsonOk,
  requireApiUser,
} from "@/lib/v2/api-helpers";
import { lookupInviteToken, redeemInviteToken } from "@/lib/v2/programs/invite-tokens";

type RouteContext = { params: Promise<{ token: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { token } = await context.params;
  const preview = await lookupInviteToken(token);
  if (!preview.valid) {
    return jsonOk(preview, 404);
  }
  return jsonOk(preview);
}

export async function POST(_request: Request, context: RouteContext) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const { token } = await context.params;
  const result = await redeemInviteToken({
    token,
    userId: auth.userId,
    email: auth.email,
    demo: auth.demo,
  });

  if (!result.ok) {
    return jsonOk({ error: "invite_error", message: result.message }, result.status);
  }

  const meta = result.user.onboarding_metadata as Record<string, unknown> | undefined;

  return jsonOk({
    redeemed: true,
    program_slug: result.program.slug,
    program_title: result.program.display_title,
    trainee_initials: meta?.trainee_initials ?? null,
    onboarding_path: meta?.onboarding_path ?? "institutional",
  });
}

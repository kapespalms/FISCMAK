import { isErrorResponse, jsonOk } from "@/lib/v2/api-helpers";
import { requireKpAdminApiUser } from "@/lib/v2/kp-admin";
import { joinUrlForToken, listInviteTokensForProgram } from "@/lib/v2/programs/invite-tokens";
import { listResidencyPrograms } from "@/lib/v2/programs/registry";

export async function GET(request: Request) {
  const auth = await requireKpAdminApiUser();
  if (isErrorResponse(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const programSlug = searchParams.get("program");

  if (!programSlug) {
    return jsonOk({
      programs: listResidencyPrograms().map((p) => ({
        slug: p.slug,
        display_title: p.display_title,
        content_tier: p.content_tier,
        invite_slot_capacity: p.invite_slot_capacity,
      })),
    });
  }

  const tokens = await listInviteTokensForProgram(programSlug);
  const used = tokens.filter((t) => t.used).length;

  return jsonOk({
    program_slug: programSlug,
    total: tokens.length,
    used,
    available: tokens.length - used,
    tokens: tokens.map((t) => ({
      slot_number: t.slot_number,
      token: t.token,
      join_url: t.join_url,
      label: t.label,
      trainee_initials: t.trainee_initials,
      roster_email: t.roster_email,
      used: t.used,
      used_at: t.used_at,
    })),
    sample_join_url: tokens[0] ? joinUrlForToken(tokens[0].token) : null,
  });
}

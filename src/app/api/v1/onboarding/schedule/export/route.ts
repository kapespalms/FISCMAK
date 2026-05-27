import { getAppUser, isErrorResponse, requireApiUser } from "@/lib/v2/api-helpers";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";
import {
  listBlocksForTrainee,
} from "@/lib/v2/programs/block-schedule";
import { lookupInviteTokenForUser } from "@/lib/v2/programs/invite-tokens";
import { getProgramBySlug } from "@/lib/v2/programs/registry";
import { buildRotationIcs } from "@/lib/v2/schedule-calendar/ics";

export async function GET(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) {
    return new Response("Not found", { status: 404 });
  }

  const meta = getOnboardingMetadata(user);
  const { searchParams } = new URL(request.url);
  const programSlug = searchParams.get("program") ?? meta.program_slug ?? "uh-psych-cmc";
  const program = getProgramBySlug(programSlug);

  let initials = meta.trainee_initials?.trim().toUpperCase() ?? "";
  if (!initials) {
    const tokenRow = await lookupInviteTokenForUser(auth.userId, meta.invite_token);
    initials = tokenRow?.trainee_initials?.trim().toUpperCase() ?? "";
  }

  const blocks = initials && program?.schedule_source ? listBlocksForTrainee(initials) : [];
  const calendarName = program?.display_title
    ? `${program.display_title} — Rotations`
    : "FISCMAK Rotation Schedule";

  const ics = buildRotationIcs({ blocks, calendarName });

  return new Response(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="fiscmak-rotations.ics"',
      "Cache-Control": "no-store",
    },
  });
}

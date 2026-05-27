import { getAppUser, isErrorResponse, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";
import {
  listBlocksForTrainee,
  resolveCurrentBlock,
} from "@/lib/v2/programs/block-schedule";
import { lookupInviteTokenForUser } from "@/lib/v2/programs/invite-tokens";
import { getProgramBySlug } from "@/lib/v2/programs/registry";

export async function GET(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) return jsonOk({ error: "not_found" }, 404);

  const meta = getOnboardingMetadata(user);
  const { searchParams } = new URL(request.url);
  const programSlug = searchParams.get("program") ?? meta.program_slug ?? "uh-psych-cmc";
  const program = getProgramBySlug(programSlug);

  if (!program?.schedule_source) {
    return jsonOk({
      enabled: false,
      message: "Schedule calendar is not configured for this program.",
    });
  }

  let initials = meta.trainee_initials?.trim().toUpperCase() ?? "";
  if (!initials) {
    const tokenRow = await lookupInviteTokenForUser(auth.userId, meta.invite_token);
    initials = tokenRow?.trainee_initials?.trim().toUpperCase() ?? "";
  }

  if (!initials) {
    return jsonOk({
      enabled: true,
      matched: false,
      program_slug: program.slug,
      blocks: [],
      current: null,
      message: "Roster initials not linked — redeem your program invite token.",
    });
  }

  const blocks = listBlocksForTrainee(initials);
  const current = resolveCurrentBlock({ trainee_initials: initials });

  return jsonOk({
    enabled: true,
    matched: blocks.length > 0,
    program_slug: program.slug,
    program_label: program.display_title,
    trainee_initials: initials,
    blocks,
    current: current.matched
      ? {
          block_id: current.block_id,
          rotation_code: current.rotation_code,
          rotation_label: current.rotation_label,
          start_date: current.start_date,
          end_date: current.end_date,
          days_remaining: current.days_remaining,
        }
      : null,
  });
}

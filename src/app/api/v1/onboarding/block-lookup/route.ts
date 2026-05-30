import { getAppUser, isErrorResponse, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";
import {
  normalizePgyForOnboarding,
  resolveCurrentBlock,
  resolveNextBlock,
} from "@/lib/v2/programs/block-schedule";
import { lookupInviteTokenRecord } from "@/lib/v2/programs/invite-tokens";
import { getProgramBySlug } from "@/lib/v2/programs/registry";

async function resolveInitials(input: {
  userId: string;
  initialsParam?: string;
  tokenParam?: string;
  metaInitials?: string | null;
}): Promise<string> {
  if (input.initialsParam?.trim()) return input.initialsParam.trim().toUpperCase();
  if (input.metaInitials?.trim()) return input.metaInitials.trim().toUpperCase();
  if (input.tokenParam) {
    const record = await lookupInviteTokenRecord(input.tokenParam);
    return record?.trainee_initials?.trim().toUpperCase() ?? "";
  }
  return "";
}

export async function GET(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const user = await getAppUser(auth.userId, auth.demo);
  const meta = user ? getOnboardingMetadata(user) : {};

  const { searchParams } = new URL(request.url);
  const programSlug = searchParams.get("program") ?? meta.program_slug ?? "uh-psych-cmc";
  const tokenParam = searchParams.get("token") ?? meta.invite_token ?? undefined;
  const initials = await resolveInitials({
    userId: auth.userId,
    initialsParam: searchParams.get("initials") ?? undefined,
    tokenParam,
    metaInitials: meta.trainee_initials,
  });

  const program = getProgramBySlug(programSlug);
  if (!program) {
    return jsonOk({ error: "not_found", message: "Program not found." }, 404);
  }

  if (!initials) {
    return jsonOk({
      matched: false,
      message: "Link your program invite token to sync block schedule.",
    });
  }

  if (program.content_tier !== "full" || !program.schedule_source) {
    return jsonOk({
      matched: false,
      program_slug: program.slug,
      message: "Block schedule lookup is not configured for this program yet.",
    });
  }

  const current = resolveCurrentBlock({ trainee_initials: initials });
  const next = resolveNextBlock({ trainee_initials: initials });
  const suggestedPgy =
    normalizePgyForOnboarding(current.pgy_level) ??
    normalizePgyForOnboarding(current.roster_pgy_level);

  return jsonOk({
    program_slug: program.slug,
    ...current,
    current,
    next,
    pgy_level: current.roster_pgy_level ?? current.pgy_level ?? suggestedPgy,
    trainee_initials: initials,
    suggested_pgy: suggestedPgy,
  });
}

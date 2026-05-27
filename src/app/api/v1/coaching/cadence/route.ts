import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
  upsertAppUser,
} from "@/lib/v2/api-helpers";
import {
  buildCoachingCadenceView,
  defaultScheduleReviewCadence,
  type ScheduleReviewCadence,
} from "@/lib/v2/coaching-cadence";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";
import { listBlocksForTrainee } from "@/lib/v2/programs/block-schedule";
import { lookupInviteTokenForUser } from "@/lib/v2/programs/invite-tokens";

async function resolveProgramBlocks(userId: string, meta: ReturnType<typeof getOnboardingMetadata>) {
  let initials = meta.trainee_initials?.trim().toUpperCase() ?? "";
  if (!initials) {
    const tokenRow = await lookupInviteTokenForUser(userId, meta.invite_token);
    initials = tokenRow?.trainee_initials?.trim().toUpperCase() ?? "";
  }
  if (!initials) return [];
  return listBlocksForTrainee(initials);
}

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) return jsonOk({ error: "not_found" }, 404);

  const meta = getOnboardingMetadata(user);
  const scheduleEvents = meta.schedule_events ?? [];
  const programBlocks = await resolveProgramBlocks(auth.userId, meta);
  const cadence = buildCoachingCadenceView({
    meta,
    scheduleEvents,
    programBlocks,
  });

  return jsonOk(cadence);
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) return jsonOk({ error: "not_found" }, 404);

  const body = await request.json();
  const cadence = body.cadence as ScheduleReviewCadence | undefined;
  const allowed: ScheduleReviewCadence[] = ["weekly", "biweekly", "monthly"];

  if (!cadence || !allowed.includes(cadence)) {
    return jsonOk({ error: "invalid_cadence" }, 400);
  }

  const meta = getOnboardingMetadata(user);
  await upsertAppUser(
    auth.userId,
    auth.email,
    {
      onboarding_metadata: {
        ...meta,
        schedule_review_cadence: cadence,
      },
    },
    auth.demo,
  );

  return jsonOk({ schedule_review_cadence: cadence ?? defaultScheduleReviewCadence() });
}

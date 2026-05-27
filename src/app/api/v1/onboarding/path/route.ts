import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
  upsertAppUser,
} from "@/lib/v2/api-helpers";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";
import {
  buildOnboardingPathMetadata,
  type OnboardingPath,
} from "@/lib/v2/onboarding-path";
import { getProgramBySlug, listResidencyPrograms } from "@/lib/v2/programs/registry";
import { buildProgramMembershipPatch } from "@/lib/v2/programs/program-membership";
import { syncProgramMembership } from "@/lib/v2/programs/sync-program-membership";

export async function GET() {
  const programs = listResidencyPrograms().map((p) => ({
    slug: p.slug,
    display_title: p.display_title,
    institution_name: p.institution_name,
    program_name: p.program_name,
    academic_year: p.academic_year,
  }));
  return jsonOk({ programs });
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const body = (await request.json()) as {
    onboarding_path?: OnboardingPath;
    program_slug?: string;
    trainee_initials?: string;
  };

  const path = body.onboarding_path;
  if (path !== "public" && path !== "institutional") {
    return jsonOk({ error: "validation_error", message: "Select public or institutional onboarding." }, 400);
  }

  const user = await getAppUser(auth.userId, auth.demo);
  const priorMeta = user ? getOnboardingMetadata(user) : {};

  let pathMeta: Partial<typeof priorMeta>;
  if (path === "public") {
    pathMeta = buildOnboardingPathMetadata({ path: "public" });
  } else {
    const program = getProgramBySlug(body.program_slug);
    if (!program) {
      return jsonOk({ error: "validation_error", message: "Select a valid residency program." }, 400);
    }
    pathMeta = buildOnboardingPathMetadata({
      path: "institutional",
      program,
      trainee_initials: body.trainee_initials,
    });
  }

  const cleared = { ...priorMeta };
  if (path === "public") {
    delete cleared.program_id;
    delete cleared.program_slug;
    delete cleared.trainee_initials;
    delete cleared.program_membership;
  }

  let userPatch: Partial<import("@/lib/v2/types").AppUser> & {
    onboarding_metadata: Record<string, unknown>;
  };

  if (path === "institutional") {
    const program = getProgramBySlug(body.program_slug);
    if (!program) {
      return jsonOk({ error: "validation_error", message: "Select a valid residency program." }, 400);
    }
    const membershipPatch = buildProgramMembershipPatch({
      userId: auth.userId,
      program,
      priorMeta: { ...cleared, ...pathMeta },
    });
    userPatch = {
      primary_program_id: membershipPatch.primary_program_id,
      content_pack: membershipPatch.content_pack,
      institution: program.institution_name,
      onboarding_metadata: {
        ...cleared,
        ...pathMeta,
        ...membershipPatch.onboarding_metadata,
      } as Record<string, unknown>,
    };
  } else {
    userPatch = {
      primary_program_id: null,
      content_pack: "default",
      onboarding_metadata: { ...cleared, ...pathMeta } as Record<string, unknown>,
    };
  }

  const updated = await upsertAppUser(auth.userId, auth.email, userPatch, auth.demo);

  if (path === "institutional") {
    const meta = getOnboardingMetadata(updated);
    if (meta.program_membership) {
      await syncProgramMembership({
        demo: auth.demo,
        userId: auth.userId,
        membership: meta.program_membership,
      });
    }
  }

  const meta = getOnboardingMetadata(updated);
  return jsonOk({
    onboarding_path: meta.onboarding_path,
    program_id: meta.program_id ?? null,
    program_slug: meta.program_slug ?? null,
    trainee_initials: meta.trainee_initials ?? null,
    saved_at: new Date().toISOString(),
  });
}

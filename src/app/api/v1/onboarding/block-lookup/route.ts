import { isErrorResponse, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";
import {
  normalizePgyForOnboarding,
  resolveCurrentBlock,
} from "@/lib/v2/programs/block-schedule";
import { getProgramBySlug } from "@/lib/v2/programs/registry";

export async function GET(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const initials = searchParams.get("initials")?.trim() ?? "";
  const programSlug = searchParams.get("program") ?? "uh-psych-cmc";

  const program = getProgramBySlug(programSlug);
  if (!program) {
    return jsonOk({ error: "not_found", message: "Program not found." }, 404);
  }

  if (!initials) {
    return jsonOk({ matched: false, message: "Provide trainee initials." });
  }

  const block = resolveCurrentBlock({ trainee_initials: initials });
  const suggestedPgy =
    normalizePgyForOnboarding(block.pgy_level) ??
    normalizePgyForOnboarding(block.roster_pgy_level);

  return jsonOk({
    program_slug: program.slug,
    ...block,
    suggested_pgy: suggestedPgy,
  });
}

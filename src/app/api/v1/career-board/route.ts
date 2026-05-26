import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
} from "@/lib/v2/api-helpers";
import {
  buildBoardProfileView,
  demoCareerBoardSnapshot,
  type CareerBoardSnapshot,
} from "@/lib/v2/career-board-models";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) {
    return jsonOk({ board: null, snapshot: null });
  }

  const meta = getOnboardingMetadata(user);
  let snapshot = meta.career_board as CareerBoardSnapshot | undefined;

  if (auth.demo && (!snapshot?.members?.length)) {
    snapshot = demoCareerBoardSnapshot();
  }

  const board = buildBoardProfileView(snapshot);
  return jsonOk({ board, snapshot: snapshot ?? null });
}

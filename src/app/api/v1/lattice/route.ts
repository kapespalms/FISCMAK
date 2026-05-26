import {
  fetchActivities,
  fetchDocuments,
} from "@/lib/v2/db";
import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
  upsertAppUser,
} from "@/lib/v2/api-helpers";
import { buildLatticeDashboard } from "@/lib/v2/lattice/aggregate";
import type { LatticeTimeframe } from "@/lib/v2/lattice/types";
import { isTraineeCareerLevel } from "@/lib/v2/onboarding-options";

const TIMEFRAMES: LatticeTimeframe[] = ["30d", "90d", "1y", "all"];

function parseTimeframe(value: string | null): LatticeTimeframe {
  if (value && TIMEFRAMES.includes(value as LatticeTimeframe)) {
    return value as LatticeTimeframe;
  }
  return "90d";
}

export async function GET(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const timeframe = parseTimeframe(searchParams.get("timeframe"));

  let user = await getAppUser(auth.userId, auth.demo);
  if (!user) {
    user = await upsertAppUser(auth.userId, auth.email, {}, auth.demo);
  }

  const [activities, documents] = await Promise.all([
    fetchActivities(auth.userId, auth.demo, 500),
    fetchDocuments(auth.userId, auth.demo),
  ]);

  const dashboard = buildLatticeDashboard({
    activities,
    documents,
    timeframe,
    isTrainee: isTraineeCareerLevel(user.career_stage),
  });

  return jsonOk(dashboard);
}

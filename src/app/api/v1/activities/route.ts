import { fetchActivities } from "@/lib/v2/db";
import {
  getAppUser,
  isErrorResponse,
  jsonError,
  jsonOk,
  requireApiUser,
} from "@/lib/v2/api-helpers";
import { captureActivityFromMak } from "@/lib/v2/activity-capture";

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const activities = await fetchActivities(auth.userId, auth.demo);
  return jsonOk({ activities });
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const { text, energy_valence } = await request.json();
  if (!text?.trim()) {
    return jsonError("text_required", "Activity text is required", 400);
  }

  const user = await getAppUser(auth.userId, auth.demo);
  const entry = await captureActivityFromMak({
    userId: auth.userId,
    demo: auth.demo,
    text: text.trim(),
    specialty: user?.specialty,
    careerPhase: user?.career_stage,
    energyValence: energy_valence ?? null,
    inputSource: "text",
  });

  return jsonOk({ activity: entry });
}

import { isErrorResponse, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";

const CHECKLISTS: Record<string, string[]> = {
  "clinician-educator": [
    "Direct teaching hours/year documented",
    "Curriculum innovation described",
    "Learner evaluations at or above benchmark",
    "Peer-reviewed education publications (2-3)",
    "Formal mentoring outcomes",
    "Clinical practice maintained",
    "Institutional service documented",
    "Regional/national society role",
    "Coherent narrative theme identified",
  ],
};

export async function GET(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const track =
    new URL(request.url).searchParams.get("track")?.toLowerCase() ?? "clinician-educator";
  return jsonOk({
    track,
    checklist: CHECKLISTS[track] ?? CHECKLISTS["clinician-educator"],
  });
}

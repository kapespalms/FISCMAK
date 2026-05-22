import { createClient } from "@/lib/supabase/server";
import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
} from "@/lib/v2/api-helpers";

export async function GET(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const specialty =
    new URL(request.url).searchParams.get("specialty") ??
    (await getAppUser(auth.userId, auth.demo))?.specialty ??
    "Cardiology";

  if (auth.demo) {
    return jsonOk({
      specialty,
      pathways: [
        {
          pathway_id: "demo-clinical",
          specialty,
          pathway_type: "Clinical",
          description: "Focus on patient care and clinical excellence.",
          salary_range: "$200,000 - $400,000",
          job_market_demand: "HIGH",
          milestones: [{ year: 1, goal: "Board certification" }],
          open_positions: 45,
        },
        {
          pathway_id: "demo-research",
          specialty,
          pathway_type: "Research",
          description: "Career in research and grants.",
          salary_range: "$120,000 - $250,000",
          job_market_demand: "MEDIUM",
          milestones: [],
          open_positions: 12,
        },
      ],
    });
  }

  const supabase = await createClient();
  const { data } = await supabase.from("pathways").select("*").eq("specialty", specialty);
  return jsonOk({ specialty, pathways: data ?? [] });
}

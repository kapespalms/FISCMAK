import { createClient } from "@/lib/supabase/server";
import { isErrorResponse, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const { id } = await params;

  if (auth.demo) {
    return jsonOk({
      pathway_id: id,
      specialty: "Cardiology",
      pathway_type: "Clinical",
      description: "Focus on patient care and clinical excellence.",
      detailed_milestones: [{ year: 1, goal: "Board certification", skills_needed: ["Clinical skills"] }],
      skill_gaps_for_user: ["Advanced echocardiography"],
      related_jobs: [],
      mentors: [],
    });
  }

  const supabase = await createClient();
  const { data } = await supabase.from("pathways").select("*").eq("pathway_id", id).maybeSingle();
  if (!data) return jsonOk({ error: "not_found", message: "Pathway not found" }, 404);
  return jsonOk({
    ...data,
    detailed_milestones: data.milestones,
    skill_gaps_for_user: [],
    related_jobs: [],
    mentors: [],
  });
}

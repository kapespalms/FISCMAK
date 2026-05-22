import { createClient } from "@/lib/supabase/server";
import { getServerDemo } from "@/lib/v2/demo-store";
import { isErrorResponse, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const { id } = await params;
  if (auth.demo) {
    const d = getServerDemo(auth.userId).dossiers.find((x) => x.dossier_id === id);
    if (!d) return jsonOk({ error: "not_found", message: "Dossier not found" }, 404);
    return jsonOk(d);
  }
  const supabase = await createClient();
  const { data } = await supabase
    .from("promotion_dossier")
    .select("*")
    .eq("dossier_id", id)
    .eq("user_id", auth.userId)
    .maybeSingle();
  if (!data) return jsonOk({ error: "not_found", message: "Dossier not found" }, 404);
  return jsonOk(data);
}

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
    return jsonOk({ specialty, pathways: [] });
  }

  const supabase = await createClient();
  const { data } = await supabase.from("pathways").select("*").eq("specialty", specialty);
  return jsonOk({ specialty, pathways: data ?? [] });
}

import { createClient } from "@/lib/supabase/server";
import { getServerDemo } from "@/lib/v2/demo-store";
import { isErrorResponse, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";

export async function GET(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const params = new URL(request.url).searchParams;
  const limit = parseInt(params.get("limit") ?? "50", 10);
  if (auth.demo) {
    const msgs = getServerDemo(auth.userId).chatMessages.slice(-limit);
    return jsonOk({ messages: msgs, total: msgs.length, has_more: false });
  }
  const supabase = await createClient();
  const query = supabase
    .from("chat_messages")
    .select("*")
    .eq("user_id", auth.userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  const { data } = await query;
  const messages = (data ?? []).reverse();
  return jsonOk({ messages, total: messages.length, has_more: false });
}

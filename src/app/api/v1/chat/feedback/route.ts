import { createClient } from "@/lib/supabase/server";
import { isErrorResponse, jsonError, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const body = await request.json().catch(() => ({}));
  const rating = body.rating === "down" ? "down" : "up";
  const content = String(body.content ?? "").trim().slice(0, 4000);
  const section = typeof body.section === "string" ? body.section.slice(0, 64) : null;

  if (!content) {
    return jsonError("validation_error", "Message content is required.", 400);
  }

  if (auth.demo) {
    return jsonOk({ saved: true, demo: true });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("chat_feedback").insert({
    user_id: auth.userId,
    message_content: content,
    rating,
    section,
  });

  if (error) {
    console.error("chat_feedback insert failed:", error.message);
    return jsonError("storage_error", "Could not save feedback.", 500);
  }

  return jsonOk({ saved: true, rating });
}

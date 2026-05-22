import { createClient } from "@/lib/supabase/server";
import { getServerDemo } from "@/lib/v2/demo-store";
import { extractCvMetadata } from "@/lib/v2/db";
import { fetchDocuments } from "@/lib/v2/db";
import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
  upsertAppUser,
} from "@/lib/v2/api-helpers";

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const body = await request.json().catch(() => ({}));
  const user = await getAppUser(auth.userId, auth.demo);
  const docs = await fetchDocuments(auth.userId, auth.demo);
  const cv = docs.find((d) => d.document_type === "CV");
  const summary =
    body.coaching_summary ??
    `Physician career coaching for ${user?.specialty ?? "medicine"} — ${user?.career_stage ?? "career stage pending"}.`;
  const key_facts = body.key_facts ?? {
    specialty: user?.specialty,
    career_stage: user?.career_stage,
    cv_uploaded: user?.cv_uploaded,
    ...(cv?.metadata ?? {}),
  };
  const exportId = crypto.randomUUID();
  const now = new Date().toISOString();

  if (auth.demo) {
    const state = getServerDemo(auth.userId);
    state.mempalace = {
      export_id: exportId,
      user_id: auth.userId,
      coaching_summary: summary,
      key_facts,
      preferences: body.preferences ?? {},
      career_evolution: body.career_evolution ?? {},
      created_at: now,
    };
    state.user.mempalace_id = exportId;
    return jsonOk({ mempalace_id: exportId, synced_at: now, message: "Coaching data synced to MemPalace" });
  }

  const supabase = await createClient();
  await supabase.from("mempalace_exports").insert({
    export_id: exportId,
    user_id: auth.userId,
    coaching_summary: summary,
    key_facts,
    preferences: body.preferences ?? {},
    career_evolution: body.career_evolution ?? {},
  });
  await upsertAppUser(auth.userId, auth.email, { mempalace_id: exportId }, auth.demo);
  if (cv?.extracted_text) {
    await supabase
      .from("documents")
      .update({ metadata: extractCvMetadata(cv.extracted_text) })
      .eq("document_id", cv.document_id);
  }
  return jsonOk({ mempalace_id: exportId, synced_at: now, message: "Coaching data synced to MemPalace" });
}

import { fetchDocuments, fetchLatestMemPalace } from "@/lib/v2/db";
import {
  getAppUser,
  isErrorResponse,
  jsonOk,
  requireApiUser,
  upsertAppUser,
} from "@/lib/v2/api-helpers";
import { computeTouchpoint1Dashboard, getOnboardingMetadata } from "@/lib/v2/onboarding-compute";
import { deployedInstruments } from "@/lib/v2/onboarding-touchpoint1";
import { createClient } from "@/lib/supabase/server";
import { getServerDemo } from "@/lib/v2/demo-store";

export async function POST() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) return jsonOk({ error: "not_found", message: "User not found" }, 404);

  const docs = await fetchDocuments(auth.userId, auth.demo);
  const cv = docs.find((d) => d.document_type === "CV");
  const computed = computeTouchpoint1Dashboard(user, cv?.extracted_text);
  const meta = getOnboardingMetadata(user);

  const onboarding_metadata = {
    ...meta,
    ...computed,
    instrument_ids:
      meta.instrument_ids ??
      deployedInstruments(user.career_stage, user.practice_setting).map((i) => i.id),
  };

  await upsertAppUser(
    auth.userId,
    auth.email,
    {
      tier3_complete: true,
      onboarding_metadata: onboarding_metadata as Record<string, unknown>,
    },
    auth.demo,
  );

  const summary = `Touchpoint 1 complete. CDI baseline: ${computed.cdi.score}. ${
    computed.iwq != null ? `IWQ: ${computed.iwq.toFixed(1)}.` : ""
  } S-Index estimate: ${computed.s_index}.`;

  if (auth.demo) {
    const state = getServerDemo(auth.userId);
    state.mempalace = {
      export_id: crypto.randomUUID(),
      user_id: auth.userId,
      coaching_summary: summary,
      key_facts: {
        cdi: computed.cdi,
        iwq: computed.iwq,
        s_index: computed.s_index,
        practice_setting: user.practice_setting,
        primary_career_track: user.primary_career_track,
      },
      preferences: {},
      career_evolution: {},
      created_at: new Date().toISOString(),
    };
  } else {
    const existing = await fetchLatestMemPalace(auth.userId, auth.demo);
    const supabase = await createClient();
    await supabase.from("mempalace_exports").insert({
      export_id: crypto.randomUUID(),
      user_id: auth.userId,
      coaching_summary: summary,
      key_facts: {
        ...(existing?.key_facts ?? {}),
        cdi: computed.cdi,
        iwq: computed.iwq,
        s_index: computed.s_index,
      },
      preferences: existing?.preferences ?? {},
      career_evolution: existing?.career_evolution ?? {},
    });
  }

  return jsonOk({
    tier3_complete: true,
    cdi: computed.cdi,
    iwq: computed.iwq,
    s_index: computed.s_index,
    instrument_scores: computed.instrument_scores,
    redirect: "/app/dashboard?welcome=1",
  });
}

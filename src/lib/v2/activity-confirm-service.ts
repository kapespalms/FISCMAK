import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import type { ActivityEntry } from "@/lib/types/database";
import { updateServerDemoActivity } from "@/lib/v2/demo-store";

export async function confirmActivityEvidence(input: {
  userId: string;
  demo: boolean;
  activityId: string;
}): Promise<ActivityEntry | null> {
  if (input.demo || !isSupabaseConfigured()) {
    return updateServerDemoActivity(input.userId, input.activityId, {
      evidence_strength: "confirmed",
    });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activity_entries")
    .update({ evidence_strength: "confirmed" })
    .eq("id", input.activityId)
    .eq("user_id", input.userId)
    .select()
    .single();

  if (error || !data) return null;

  return {
    id: data.id as string,
    user_id: input.userId,
    created_at: data.created_at as string,
    activity_date: (data.activity_date as string | null) ?? null,
    raw_text: (data.raw_text as string | null) ?? null,
    input_source: (data.input_source as string | null) ?? null,
    energy_valence: (data.entry_energy as string | null) ?? null,
    primary_domain: (data.inferred_activity_key as string | null) ?? null,
    primary_track: ((data.inferred_career_track_keys as string[] | undefined)?.[0] ?? null) as string | null,
    primary_domain_confidence: (data.overall_confidence as number | null) ?? null,
    primary_track_confidence: (data.overall_confidence as number | null) ?? null,
    scope: (data.scope as string | null) ?? null,
    evidence_strength: "confirmed",
    confidence_score: (data.overall_confidence as number | null) ?? null,
  };
}

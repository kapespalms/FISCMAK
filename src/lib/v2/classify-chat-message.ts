import type { SupabaseClient } from "@supabase/supabase-js";
import { FreeClassifier } from "@/lib/v2/free-classifier";
import FISCMAKClassifier from "@/lib/v2/classifier-v2";

export type ChatClassification = {
  tier: "free" | "premium";
  mak_response: string;
  activity_entry?: Record<string, unknown>;
  detected_signals: string[];
  activity_key?: string;
  development_level?: number;
};

function specialtyToOntologyKey(specialty?: string | null): string | undefined {
  if (!specialty) return undefined;
  const s = specialty.toLowerCase();
  if (s.includes("psych")) return "psych";
  if (s.includes("internal medicine") || s === "im") return "im";
  if (s.includes("emergency") || s === "em") return "em";
  if (s.includes("pediatr") || s === "peds") return "peds";
  if (s.includes("family") || s === "fm") return "fm";
  if (s.includes("surg")) return "surgery";
  if (s.includes("neuro")) return "neuro";
  if (s.includes("ob") || s.includes("gyn")) return "ob";
  if (s.includes("radiol")) return "radiology";
  if (s.includes("pathol")) return "pathology";
  return undefined;
}

/**
 * Route chat/capture messages to Free (keyword) or Premium (ontology) classifier.
 */
export async function classifyChatMessage(
  supabase: SupabaseClient,
  isPremium: boolean,
  params: {
    userId: string;
    rawText: string;
    userSpecialty?: string | null;
    userRole?: string | null;
  },
): Promise<ChatClassification> {
  if (isPremium) {
    const premiumClassifier = new FISCMAKClassifier(supabase);
    const result = await premiumClassifier.classifyActivity({
      userId: params.userId,
      rawText: params.rawText,
      userSpecialty: specialtyToOntologyKey(params.userSpecialty),
      userRole: params.userRole ?? undefined,
      inputSource: "chat",
    });

    return {
      tier: "premium",
      mak_response: result.mak_primary_response,
      activity_entry: result.activity_entry,
      detected_signals: result.detected_signals.map((s) => s.indicator_key),
      activity_key: result.primary_activity?.activity_key,
      development_level: result.primary_activity?.development_level,
    };
  }

  const freeClassifier = new FreeClassifier();
  const result = await freeClassifier.classifyActivity({
    userId: params.userId,
    rawText: params.rawText,
    userSpecialty: params.userSpecialty ?? undefined,
    userRole: params.userRole ?? undefined,
  });

  return {
    tier: "free",
    mak_response: result.mak_response,
    activity_entry: result.activity_entry,
    detected_signals: result.detected_signals,
    activity_key: result.activity_key,
    development_level: result.development_level,
  };
}

export async function persistClassificationActivity(
  supabase: SupabaseClient,
  activityEntry?: Record<string, unknown>,
): Promise<void> {
  if (!activityEntry) return;
  const { error } = await supabase.from("activity_entries").insert(activityEntry);
  if (error) console.warn("Could not store classified activity:", error.message);
}

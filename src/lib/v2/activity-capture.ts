import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { classifyActivityFallback } from "@/lib/classify";
import { addServerDemoActivity } from "@/lib/v2/demo-store";
import { FISCMAKClassifier } from "@/lib/v2/FISCMAKClassifier";
import { FreeClassifier } from "@/lib/v2/free-classifier";
import { hasActiveSubscription } from "@/lib/v2/stripe-config";
import type { ActivityEntry, ClassificationResult } from "@/lib/types/database";

const SKIP_CAPTURE_MESSAGES = new Set([
  "Capture invisible work",
  "Log new activity",
  "Upload document",
  "Upload a document",
  "Discuss your energy",
  "Review your activities",
  "Assess your patterns",
  "Plan your strategy",
  "Create your outputs",
  "I'd like to share how I'm feeling today.",
]);

export function shouldCaptureActivityMessage(
  message: string,
  flowIntent?: string | null,
): boolean {
  if (flowIntent !== "capture") return false;
  const trimmed = message.trim();
  if (!trimmed || trimmed === "__welcome__") return false;
  if (trimmed.length < 12) return false;
  if (SKIP_CAPTURE_MESSAGES.has(trimmed)) return false;
  return true;
}

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

function activityEntryFromRow(
  row: Record<string, unknown>,
  userId: string,
  fallback?: Partial<ActivityEntry>,
): ActivityEntry {
  const trackKeys = row.inferred_career_track_keys as string[] | undefined;
  return {
    id: (row.id as string) ?? crypto.randomUUID(),
    user_id: userId,
    created_at: (row.created_at as string) ?? new Date().toISOString(),
    activity_date: new Date().toISOString().slice(0, 10),
    raw_text: (row.raw_text as string) ?? fallback?.raw_text ?? null,
    input_source: (row.input_source as string) ?? "mak_capture",
    energy_valence: (row.entry_energy as string) ?? fallback?.energy_valence ?? null,
    primary_domain:
      (row.inferred_activity_key as string) ??
      (row.activity_category as string) ??
      fallback?.primary_domain ??
      null,
    primary_track: trackKeys?.[0] ?? fallback?.primary_track ?? null,
    primary_domain_confidence:
      (row.overall_confidence as number) ?? fallback?.primary_domain_confidence ?? null,
    primary_track_confidence:
      (row.overall_confidence as number) ?? fallback?.primary_track_confidence ?? null,
    scope: (row.scope as string) ?? fallback?.scope ?? null,
    evidence_strength: fallback?.evidence_strength ?? null,
    confidence_score:
      (row.overall_confidence as number) ?? fallback?.confidence_score ?? null,
  };
}

async function classifyActivityText(
  text: string,
  specialty?: string | null,
  careerPhase?: string | null,
): Promise<ClassificationResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                "Classify physician activity. Return JSON: primary_domain, primary_track, primary_domain_confidence, primary_track_confidence, scope, evidence_strength, confidence_score, rationale.",
            },
            {
              role: "user",
              content: `Activity: ${text}\nCareer phase: ${careerPhase ?? "unknown"}\nSpecialty: ${specialty ?? "unknown"}`,
            },
          ],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const raw = data.choices?.[0]?.message?.content;
        if (raw) return JSON.parse(raw) as ClassificationResult;
      }
    } catch (e) {
      console.error("OpenAI classify error:", e);
    }
  }
  return classifyActivityFallback(text);
}

async function captureWithFreeClassifier(params: {
  userId: string;
  text: string;
  specialty?: string | null;
  careerPhase?: string | null;
  energyValence?: string | null;
  inputSource?: string;
}): Promise<ActivityEntry | null> {
  const supabase = await createClient();
  const classifier = new FreeClassifier();
  const result = await classifier.classifyActivity({
    userId: params.userId,
    rawText: params.text.trim(),
    userSpecialty: params.specialty ?? undefined,
    userRole: params.careerPhase ?? undefined,
  });

  const row = {
    ...result.activity_entry,
    input_source: params.inputSource ?? "mak_capture",
    entry_energy: params.energyValence ?? null,
  };

  const { data, error } = await supabase.from("activity_entries").insert(row).select().single();
  if (error) {
    console.error("Free classifier insert failed:", error);
    return null;
  }
  return activityEntryFromRow(data as Record<string, unknown>, params.userId);
}

async function captureWithOntologyClassifier(params: {
  userId: string;
  text: string;
  specialty?: string | null;
  careerPhase?: string | null;
  energyValence?: string | null;
  inputSource?: string;
}): Promise<ActivityEntry | null> {
  const supabase = await createClient();
  const classifier = new FISCMAKClassifier(supabase);
  const result = await classifier.classifyActivity({
    userId: params.userId,
    rawText: params.text.trim(),
    userSpecialty: specialtyToOntologyKey(params.specialty),
    userRole: params.careerPhase ?? undefined,
    inputSource: "chat",
    additionalContext: params.energyValence
      ? { energy_valence: params.energyValence }
      : undefined,
  });

  if (!result.activity_entry) return null;

  const row = {
    ...result.activity_entry,
    input_source: params.inputSource ?? "mak_capture",
    entry_energy: params.energyValence ?? result.activity_entry.entry_energy,
  };

  const { data, error } = await supabase
    .from("activity_entries")
    .insert(row)
    .select()
    .single();

  if (error) {
    console.error("Ontology classifier insert failed:", error);
    return null;
  }

  return activityEntryFromRow(data as Record<string, unknown>, params.userId);
}

export async function captureActivityFromMak(params: {
  userId: string;
  demo: boolean;
  text: string;
  specialty?: string | null;
  careerPhase?: string | null;
  energyValence?: string | null;
  inputSource?: string;
}): Promise<ActivityEntry> {
  if (!params.demo && isSupabaseConfigured()) {
    const supabase = await createClient();
    const isPremium = await hasActiveSubscription(supabase, params.userId);
    try {
      if (isPremium) {
        const classified = await captureWithOntologyClassifier(params);
        if (classified) return classified;
      } else {
        const classified = await captureWithFreeClassifier(params);
        if (classified) return classified;
      }
    } catch (e) {
      console.error("Classifier capture failed, falling back:", e);
    }
  }

  const classification = await classifyActivityText(
    params.text,
    params.specialty,
    params.careerPhase,
  );

  const entry: ActivityEntry = {
    id: crypto.randomUUID(),
    user_id: params.userId,
    created_at: new Date().toISOString(),
    activity_date: new Date().toISOString().slice(0, 10),
    raw_text: params.text.trim(),
    input_source: params.inputSource ?? "mak_capture",
    energy_valence: params.energyValence ?? null,
    primary_domain: classification.primary_domain,
    primary_track: classification.primary_track,
    primary_domain_confidence: classification.primary_domain_confidence,
    primary_track_confidence: classification.primary_track_confidence,
    scope: classification.scope,
    evidence_strength: classification.evidence_strength,
    confidence_score: classification.confidence_score,
  };

  if (params.demo || !isSupabaseConfigured()) {
    addServerDemoActivity(params.userId, entry);
    return entry;
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("activity_entries")
    .insert(entry)
    .select()
    .single();
  if (error) throw error;
  return data as ActivityEntry;
}

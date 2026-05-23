import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { classifyActivityFallback } from "@/lib/classify";
import { addServerDemoActivity } from "@/lib/v2/demo-store";
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

export async function captureActivityFromMak(params: {
  userId: string;
  demo: boolean;
  text: string;
  specialty?: string | null;
  careerPhase?: string | null;
  energyValence?: string | null;
}): Promise<ActivityEntry> {
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
    input_source: "mak_capture",
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

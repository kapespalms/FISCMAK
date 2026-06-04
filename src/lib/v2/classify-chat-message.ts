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

// ---------------------------------------------------------------------------
// Signal → lattice cell distribution (mirrors packCells in document-activities)
// d = skill_index (task axis, 0–7), t = domain_index (identity axis, 0–7)
// w = weight (normalized to sum=1), q = quadrant (OV visible / SV subjective)
// ---------------------------------------------------------------------------

type PackedCell = { d: number; t: number; w: number; q: "OV" | "SV" };

/** Known signal keys → primary lattice cells.
 *  SKILLS: 0=Clinical Expertise 1=Medical Knowledge 2=Practice-Based Learning
 *          3=Communication 4=Professionalism & Ethics 5=Systems Thinking
 *          6=Collaboration & Teamwork 7=Personal & Professional Development
 *  DOMAINS: 0=Clinician 1=Educator 2=Researcher 3=Administrator/Leader
 *           4=Advocate 5=Innovator 6=Quality/Safety 7=Wellness Champion
 */
const SIGNAL_CELLS: Record<string, PackedCell[]> = {
  leadership:       [{ d: 6, t: 3, w: 0.6, q: "OV" }, { d: 5, t: 3, w: 0.4, q: "OV" }],
  mentorship:       [{ d: 6, t: 1, w: 0.7, q: "OV" }, { d: 3, t: 1, w: 0.3, q: "OV" }],
  teaching:         [{ d: 3, t: 1, w: 0.6, q: "OV" }, { d: 2, t: 1, w: 0.4, q: "OV" }],
  emotional_labor:  [{ d: 3, t: 0, w: 0.6, q: "SV" }, { d: 4, t: 7, w: 0.4, q: "SV" }],
  systems_thinking: [{ d: 5, t: 6, w: 0.6, q: "OV" }, { d: 5, t: 5, w: 0.4, q: "OV" }],
  advocacy:         [{ d: 4, t: 4, w: 0.7, q: "OV" }, { d: 5, t: 4, w: 0.3, q: "OV" }],
  scholarship:      [{ d: 1, t: 2, w: 0.7, q: "OV" }, { d: 2, t: 2, w: 0.3, q: "OV" }],
  innovation:       [{ d: 5, t: 5, w: 0.7, q: "OV" }, { d: 2, t: 5, w: 0.3, q: "OV" }],
  wellbeing:        [{ d: 7, t: 7, w: 0.8, q: "SV" }, { d: 4, t: 7, w: 0.2, q: "SV" }],
  feedback:         [{ d: 3, t: 1, w: 0.6, q: "OV" }, { d: 2, t: 1, w: 0.4, q: "OV" }],
  general_activity: [{ d: 0, t: 0, w: 1.0, q: "OV" }],
};

/** Normalize an unknown signal key (ontology-specific) to a known vocabulary entry. */
function resolveSignalKey(key: string): string {
  const k = key.toLowerCase();
  if (k.includes("teach") || k.includes("curriculum") || k.includes("educ")) return "teaching";
  if (k.includes("mentor")) return "mentorship";
  if (k.includes("lead") || k.includes("manag") || k.includes("direct") || k.includes("collab")) return "leadership";
  if (k.includes("emotion") || k.includes("burnout") || k.includes("wellbeing") || k.includes("support") || k.includes("empath")) return "emotional_labor";
  if (k.includes("system") || k.includes("quality") || k.includes("improv") || k.includes("process") || k.includes("qi")) return "systems_thinking";
  if (k.includes("advocat") || k.includes("policy") || k.includes("equity") || k.includes("justice")) return "advocacy";
  if (k.includes("research") || k.includes("scholar") || k.includes("publish") || k.includes("present") || k.includes("grant")) return "scholarship";
  if (k.includes("innovat") || k.includes("novel") || k.includes("creat") || k.includes("design")) return "innovation";
  if (k.includes("wellness") || k.includes("self_care") || k.includes("balance")) return "wellbeing";
  if (k.includes("feedback") || k.includes("review") || k.includes("evaluat") || k.includes("assess")) return "feedback";
  return "general_activity";
}

/**
 * Build the mak_rationale JSON string from chat classifier signals.
 * Mirrors the packCells format used by seedActivityEntriesFromCv so
 * unpackCells() can reconstruct the full evidence_cell_weights distribution.
 */
function chatSignalsToCells(signals: string[]): string {
  const effectiveSignals = signals.length > 0 ? signals : ["general_activity"];

  // Accumulate weighted cells; secondary signals decay by 0.65 per position.
  const weightMap = new Map<string, PackedCell>();
  effectiveSignals.forEach((sig, idx) => {
    const resolved = resolveSignalKey(sig);
    const cells = SIGNAL_CELLS[resolved] ?? SIGNAL_CELLS.general_activity!;
    const decay = Math.pow(0.65, idx);
    for (const cell of cells) {
      const key = `${cell.d}-${cell.t}`;
      const existing = weightMap.get(key);
      if (existing) {
        existing.w += cell.w * decay;
      } else {
        weightMap.set(key, { ...cell, w: cell.w * decay });
      }
    }
  });

  // Normalize so weights sum to 1, round to 2 dp, descending order.
  const entries = Array.from(weightMap.values());
  const total = entries.reduce((s, c) => s + c.w, 0);
  if (total === 0) return JSON.stringify({ cv_cells: [{ d: 0, t: 0, w: 1.0, q: "OV" }] });

  const cv_cells = entries
    .map((c) => ({ ...c, w: Math.round((c.w / total) * 100) / 100 }))
    .sort((a, b) => b.w - a.w);

  return JSON.stringify({ cv_cells });
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

    const detected = result.detected_signals.map((s) => s.indicator_key);
    const actEntry = result.activity_entry
      ? {
          ...result.activity_entry,
          mak_rationale:  chatSignalsToCells(detected),
          user_confirmed: false,
        }
      : result.activity_entry;

    return {
      tier: "premium",
      mak_response: result.mak_primary_response,
      activity_entry: actEntry,
      detected_signals: detected,
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

  const actEntry = result.activity_entry
    ? {
        ...result.activity_entry,
        mak_rationale:  chatSignalsToCells(result.detected_signals),
        user_confirmed: false,
      }
    : result.activity_entry;

  return {
    tier: "free",
    mak_response: result.mak_response,
    activity_entry: actEntry,
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

import type { ParsedMedhubEvalRow } from "@/lib/v2/gme/medhub-csv-import";

export type NarrativeQuote = {
  text: string;
  eval_id: string | null;
  supervisor_name: string | null;
  rotation_name: string | null;
};

export type NarrativeSynthesis = {
  strengths: string[];
  areas_for_growth: string[];
  concerns: string[];
  quotes: NarrativeQuote[];
  subcompetency_tags: string[];
  low_quality_eval_ids: string[];
  ai_generated: boolean;
};

const STRENGTH_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\b(excellent|outstanding|strong|superb|exceptional)\b/i, label: "overall performance strength" },
  { pattern: /\b(rapport|empath|communicat)\b/i, label: "patient communication" },
  { pattern: /\b(thorough|comprehensive|detailed)\b/i, label: "clinical thoroughness" },
  { pattern: /\b(professional|reliable|dependable|punctual)\b/i, label: "professionalism" },
  { pattern: /\b(team|collaborat|helpful)\b/i, label: "teamwork" },
  { pattern: /\b(knowledge|learn|curious|reading)\b/i, label: "medical knowledge growth" },
];

const GROWTH_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\b(continue to work|needs to|should work|improve|develop)\b/i, label: "skill development" },
  { pattern: /\b(concise|concision|documentation|note)\b/i, label: "documentation concision" },
  { pattern: /\b(formulation|differential|diagnos)\b/i, label: "diagnostic formulation" },
  { pattern: /\b(time management|efficiency|priorit)\b/i, label: "time management" },
  { pattern: /\b(confiden|independen)\b/i, label: "clinical independence" },
  { pattern: /\b(presentation|oral|explain)\b/i, label: "oral presentation" },
];

const CONCERN_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /\b(concern|worried|unsatisf|deficien|below expectation)\b/i, label: "performance concern" },
  { pattern: /\b(unprofessional|late|absent|missed)\b/i, label: "professionalism concern" },
  { pattern: /\b(patient safety|error|adverse)\b/i, label: "patient safety" },
];

function extractSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length >= 40 && s.length <= 320);
}

function pickQuotes(evaluations: ParsedMedhubEvalRow[], limit = 4): NarrativeQuote[] {
  const quotes: NarrativeQuote[] = [];
  for (const ev of evaluations) {
    if (!ev.narrative_text?.trim()) continue;
    for (const sentence of extractSentences(ev.narrative_text)) {
      quotes.push({
        text: sentence,
        eval_id: ev.eval_id ?? null,
        supervisor_name: ev.supervisor_name,
        rotation_name: ev.rotation_name,
      });
      if (quotes.length >= limit) return quotes;
    }
  }
  return quotes;
}

function matchLabels(text: string, patterns: Array<{ pattern: RegExp; label: string }>): string[] {
  const found = new Set<string>();
  for (const { pattern, label } of patterns) {
    if (pattern.test(text)) found.add(label);
  }
  return [...found];
}

export function synthesizeNarratives(evaluations: ParsedMedhubEvalRow[]): NarrativeSynthesis {
  const strengths = new Set<string>();
  const growth = new Set<string>();
  const concerns = new Set<string>();
  const tags = new Set<string>();
  const lowQuality: string[] = [];

  for (const ev of evaluations) {
    const text = ev.narrative_text?.trim() ?? "";
    if (!text) {
      if (ev.eval_id) lowQuality.push(ev.eval_id);
      continue;
    }
    if (text.length < 80) {
      if (ev.eval_id) lowQuality.push(ev.eval_id);
    }

    for (const label of matchLabels(text, STRENGTH_PATTERNS)) strengths.add(label);
    for (const label of matchLabels(text, GROWTH_PATTERNS)) growth.add(label);
    for (const label of matchLabels(text, CONCERN_PATTERNS)) concerns.add(label);

    if (/formulation|differential/i.test(text)) tags.add("formulation");
    if (/medication|psychopharm/i.test(text)) tags.add("psychopharmacology");
    if (/therapy|psychotherap/i.test(text)) tags.add("psychotherapy");
    if (/family|collateral/i.test(text)) tags.add("collateral communication");
  }

  return {
    strengths: [...strengths].slice(0, 6),
    areas_for_growth: [...growth].slice(0, 6),
    concerns: [...concerns].slice(0, 4),
    quotes: pickQuotes(evaluations),
    subcompetency_tags: [...tags].slice(0, 8),
    low_quality_eval_ids: lowQuality,
    ai_generated: false,
  };
}

const LLM_PROMPT = `You synthesize psychiatry residency faculty evaluation narratives for a CCC pre-read.
Return JSON only:
{
  "strengths": ["string"],
  "areas_for_growth": ["string"],
  "concerns": ["string"],
  "subcompetency_tags": ["string"]
}
Rules: never assign milestone levels; extract themes only; flag concerns only when explicitly stated; max 6 items per array.`;

function parseLlmSynthesis(raw: string, evaluations: ParsedMedhubEvalRow[]): NarrativeSynthesis | null {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    const parsed = JSON.parse(jsonMatch[0]) as {
      strengths?: string[];
      areas_for_growth?: string[];
      concerns?: string[];
      subcompetency_tags?: string[];
    };
    const base = synthesizeNarratives(evaluations);
    return {
      strengths: (parsed.strengths ?? base.strengths).slice(0, 6),
      areas_for_growth: (parsed.areas_for_growth ?? base.areas_for_growth).slice(0, 6),
      concerns: (parsed.concerns ?? base.concerns).slice(0, 4),
      quotes: base.quotes,
      subcompetency_tags: (parsed.subcompetency_tags ?? base.subcompetency_tags).slice(0, 8),
      low_quality_eval_ids: base.low_quality_eval_ids,
      ai_generated: true,
    };
  } catch {
    return null;
  }
}

/** Rule-based fallback; uses Claude when ANTHROPIC_API_KEY is set. */
export async function synthesizeNarrativesEnhanced(
  evaluations: ParsedMedhubEvalRow[],
): Promise<NarrativeSynthesis> {
  const ruleBased = synthesizeNarratives(evaluations);
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey || process.env.NARRATIVE_SYNTHESIS_LLM === "false") {
    return ruleBased;
  }

  const narratives = evaluations
    .map(
      (ev, i) =>
        `[${i + 1}] ${ev.rotation_name ?? "Rotation"} / ${ev.supervisor_name ?? "Faculty"}:\n${(ev.narrative_text ?? "").slice(0, 2000)}`,
    )
    .filter((n) => n.length > 20)
    .join("\n\n");

  if (!narratives.trim()) return ruleBased;

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 1024,
        messages: [{ role: "user", content: `${LLM_PROMPT}\n\nNARRATIVES:\n${narratives.slice(0, 24000)}` }],
      }),
    });
    if (!res.ok) return ruleBased;
    const data = await res.json();
    const raw = data.content?.find((b: { type: string }) => b.type === "text")?.text ?? "";
    return parseLlmSynthesis(raw, evaluations) ?? ruleBased;
  } catch {
    return ruleBased;
  }
}

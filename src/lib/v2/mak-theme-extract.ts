/**
 * 6.2: Mak memory — extract controlled-vocabulary themes from coaching conversations.
 *
 * RULE: Mak persists THEMES and STRUCTURED SUMMARIES, never raw transcripts.
 * - The verbatim conversation is read in-memory; only themes reach the DB.
 * - PHI strip (B1) runs on any text before theme extraction (defense-in-depth).
 * - Themes use controlled vocabulary — never free-form clinical text.
 * - Output stored in app_users.mak_memory_summary (max 500 chars).
 *   This is the ONLY Mak memory store; it is physician-owned and never
 *   institution-facing, never feeds the GME aggregate.
 *
 * Extraction is deterministic (keyword-based) — no LLM required for theme storage.
 * The LLM generates responses; theme extraction is a separate, offline pass.
 */

import { stripPhi } from "@/lib/v2/phi-strip";

export type MakTheme = {
  category: string;
  signal: "energizing" | "draining" | "neutral";
  domain_hint: string | null;
};

export type MakMemoryUpdate = {
  themes: MakTheme[];
  summary: string;
};

// ── Controlled vocabulary ────────────────────────────────────────────────────

const ENERGY_POSITIVE = /\b(energizing|energized|fulfilling|meaningful|love|thriving|rewarding|proud|excited|motivated|galvanized|passion)\b/i;
const ENERGY_NEGATIVE = /\b(draining|drained|exhausted|burnout|burned out|depleted|overwhelm|dreading|frustrated|resentful|miserable|pointless)\b/i;

type CategoryRule = { category: string; domain_hint: string | null; pattern: RegExp };

const CATEGORY_RULES: CategoryRule[] = [
  { category: "clinical_care",        domain_hint: "Clinician",          pattern: /\b(patient|clinic|admit|consult|procedure|rounds|case|diagnosis|treatment|care)\b/i },
  { category: "teaching_mentorship",  domain_hint: "Educator",           pattern: /\b(teach|curriculum|mentor|feedback|learner|resident|student|faculty|education)\b/i },
  { category: "research_scholarship", domain_hint: "Researcher",         pattern: /\b(research|publish|grant|manuscript|study|data|abstract|present|journal)\b/i },
  { category: "leadership_admin",     domain_hint: "Administrator",      pattern: /\b(committee|admin|meeting|leadership|director|chair|department|policy|budget)\b/i },
  { category: "advocacy",             domain_hint: "Advocate",           pattern: /\b(advocate|equity|justice|policy|community|underserved|disparity)\b/i },
  { category: "innovation",           domain_hint: "Innovator",          pattern: /\b(innovat|build|design|create|novel|tool|technology|workflow|improve)\b/i },
  { category: "quality_safety",       domain_hint: "Quality/Safety",     pattern: /\b(quality|safety|qi|improvement|protocol|error|process|standard|outcome)\b/i },
  { category: "wellbeing",            domain_hint: "Wellness Champion",  pattern: /\b(wellness|wellbeing|burnout|sustainab|boundary|balance|self.care|restore)\b/i },
  { category: "invisible_work",       domain_hint: null,                 pattern: /\b(invisible|prior auth|inbox|paperwork|ehr|documentation|no credit|unrecognized)\b/i },
  { category: "career_direction",     domain_hint: null,                 pattern: /\b(career|goal|identity|transition|pivot|next chapter|future|legacy)\b/i },
  { category: "goals",                domain_hint: null,                 pattern: /\b(goal|milestone|target|achieve|objective|plan)\b/i },
];

// ── Extraction ────────────────────────────────────────────────────────────────

function classifySignal(text: string): "energizing" | "draining" | "neutral" {
  const isPos = ENERGY_POSITIVE.test(text);
  const isNeg = ENERGY_NEGATIVE.test(text);
  if (isPos && !isNeg) return "energizing";
  if (isNeg) return "draining";
  return "neutral";
}

/**
 * Extract themes from a single conversation turn (user message).
 * PHI is stripped first; only controlled-vocabulary categories are returned.
 */
export function extractThemesFromTurn(rawTurn: string): MakTheme[] {
  const stripped = stripPhi(rawTurn).scrubbed;
  const signal = classifySignal(stripped);
  const themes: MakTheme[] = [];

  for (const rule of CATEGORY_RULES) {
    if (rule.pattern.test(stripped)) {
      themes.push({ category: rule.category, signal, domain_hint: rule.domain_hint });
    }
  }
  return themes;
}

/**
 * Build an updated Mak memory summary from the existing summary and new themes.
 *
 * The summary is a compact, controlled-vocabulary string (max 500 chars).
 * Format: "theme1(signal);theme2(signal);..." sorted by recency, deduped.
 *
 * This replaces (not appends to) the previous summary — the most recent
 * themes are the most relevant; the summary doesn't grow unboundedly.
 */
export function buildMakMemorySummary(
  existingSummary: string | null,
  newThemes: MakTheme[],
): string {
  if (newThemes.length === 0) return existingSummary ?? "";

  // Parse existing entries
  const existing: MakTheme[] = (existingSummary ?? "")
    .split(";")
    .flatMap((part) => {
      const match = part.trim().match(/^([a-z_]+)\(([^)]+)\)(?::([^;]*))?$/);
      if (!match) return [];
      return [{ category: match[1]!, signal: (match[2] ?? "neutral") as MakTheme["signal"], domain_hint: match[3] ?? null }];
    });

  // Merge: new themes take precedence; keep up to 12 entries total.
  const seen = new Map<string, MakTheme>();
  for (const t of [...newThemes, ...existing]) {
    if (!seen.has(t.category)) seen.set(t.category, t);
  }

  const merged = Array.from(seen.values()).slice(0, 12);
  const summary = merged
    .map((t) => `${t.category}(${t.signal})${t.domain_hint ? `:${t.domain_hint}` : ""}`)
    .join(";")
    .slice(0, 500);

  return summary;
}

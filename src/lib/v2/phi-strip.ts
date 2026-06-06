/**
 * B1: PHI-strip guardrail — deterministic, dependency-free.
 *
 * Applied to every free-text turn BEFORE classify/store as defense-in-depth.
 * Rules-first: a privacy office trusts readable regex over a model.
 * The LLM is a second pass only — this layer must pass the gate test solo.
 *
 * Gate: Jane-Doe + MRN regression tests must pass with no LLM in the loop.
 */

export type PhiTokenType = "mrn" | "ssn" | "phone" | "email" | "dob" | "name";

export type PhiStripResult = {
  scrubbed: string;
  tokensFound: PhiTokenType[];
};

type Rule = { type: PhiTokenType; re: RegExp; replacement: string };

const RULES: Rule[] = [
  // MRN — explicit label forms only (avoid stripping random numbers)
  {
    type: "mrn",
    re: /\bMRN\s*[:#]?\s*\d{4,12}\b/gi,
    replacement: "[MRN]",
  },
  {
    type: "mrn",
    re: /\b(?:medical\s+record\s+(?:number|num|#)|patient\s+(?:id|number|#))\s*:?\s*\d{4,12}\b/gi,
    replacement: "[MRN]",
  },
  // SSN — hyphenated or space-separated nnn-nn-nnnn
  {
    type: "ssn",
    re: /\b\d{3}[-\s]\d{2}[-\s]\d{4}\b/g,
    replacement: "[SSN]",
  },
  // Email — before phone to prevent partial overlap
  {
    type: "email",
    re: /\b[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}\b/g,
    replacement: "[EMAIL]",
  },
  // Phone — NANP format; lookbehind/lookahead instead of \b so "(NNN)" parens work
  {
    type: "phone",
    re: /(?<!\d)(?:\+1[-.\s]?)?\(?[2-9]\d{2}\)?[-.\s]\d{3}[-.\s]\d{4}(?!\d)/g,
    replacement: "[PHONE]",
  },
  // DOB — requires an explicit context word to avoid stripping all dates
  {
    type: "dob",
    re: /\b(?:DOB|D\.O\.B\.?|date\s+of\s+birth|born)\s*:?\s*\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/gi,
    replacement: "[DOB]",
  },
  // Patient name — "patient Jane Doe" / "pt Jane Doe" / "pt. Jane Doe"
  // Requires at least first + last (two capitalized words) to avoid false positives.
  {
    type: "name",
    re: /\b(?:patient|pt\.?)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g,
    replacement: "patient [NAME]",
  },
  // Honorific + name — "Mr. John Smith", "Dr. Jane Doe"
  {
    type: "name",
    re: /\b(?:Mr|Mrs|Ms|Dr)\.?\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g,
    replacement: "[NAME]",
  },
];

export function stripPhi(text: string): PhiStripResult {
  if (!text) return { scrubbed: text, tokensFound: [] };

  let scrubbed = text;
  const found: PhiTokenType[] = [];

  for (const { type, re, replacement } of RULES) {
    const prev = scrubbed;
    scrubbed = scrubbed.replace(re, replacement);
    if (scrubbed !== prev && !found.includes(type)) {
      found.push(type);
    }
  }

  return { scrubbed, tokensFound: found };
}

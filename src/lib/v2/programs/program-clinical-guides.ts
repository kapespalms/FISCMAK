/**
 * UH Psychiatry program clinical guides — Mak internal background only.
 * Cross-cutting didactic references (risk assessment, documentation frameworks).
 */

import riskGuide from "../../../../docs/seeds/uh-program-guides/suicide_violence_risk_assessment.json";
import type { ResidencyProgram } from "@/lib/v2/programs/registry";

type LatticeHint = { domain: string; track: string };

type ClinicalGuide = {
  id: string;
  title: string;
  program_slug: string;
  disclaimer: string;
  checklist: string[];
  documentation_template: string;
  suicide_risk_levels: Record<string, string>;
  suicide_warning_signs: string[];
  suicide_acute_dynamic_factors: string[];
  suicide_chronic_static_factors: string[];
  suicide_chronic_dynamic_factors: string[];
  violence_acute_dynamic_factors: string[];
  violence_chronic_factors: string[];
  protective_factors: string[];
  risk_reduction_strategies: string[];
  appendix_highlights: Record<string, string>;
  population_specific: Record<string, string>;
  lattice_tags: string[];
  lattice_hints: LatticeHint[];
  mak_usage: string[];
};

const SUICIDE_VIOLENCE_GUIDE = riskGuide as ClinicalGuide;

const GUIDE_RULES = `[Clinical guide — internal only; identification support ONLY]
Not a standard of care. Risk stratification is the treating provider's judgment — NOT Mak's.

NEVER assign, imply, or state low/moderate/high (or any) suicide or violence risk level for any patient or case.
NEVER write that someone "is high risk," "moderate risk," or "low risk" — even if the resident asks.
NEVER fill in, suggest, or complete documentation template language with risk levels or note-ready prose.
NEVER replace attending supervision, emergency evaluation, or crisis services (988, ED).

Mak MAY: ask reflective questions about factors the resident considered (acute/chronic, static/dynamic, protective); help tag learning captures on the lattice; frame competency language in Output Studio without clinical risk labels.
Do NOT recite factor lists unprompted.`;

export function buildClinicalGuidesMakContext(input: {
  program?: ResidencyProgram | null;
  purpose?: "chat" | "lattice" | "output_studio" | "debrief";
}): string {
  if (!input.program || input.program.content_tier !== "full") return "";

  const g = SUICIDE_VIOLENCE_GUIDE;
  const expanded =
    input.purpose === "debrief" ||
    input.purpose === "lattice" ||
    input.purpose === "output_studio" ||
    input.purpose === "chat";

  const lines = [
    GUIDE_RULES,
    `${g.title} (UH Psychiatry didactics — Resnick/Magellan/APA).`,
    g.disclaimer,
    `Checklist: ${g.checklist.join(" → ")}`,
  ];

  if (!expanded) {
    lines.push(
      "Available silently to help residents identify factors they considered — never to stratify risk.",
    );
    return lines.join("\n");
  }

  lines.push(
    "",
    "Factor categories (reflective questions only — never map to risk levels for any patient):",
    "- Acute vs chronic; static vs dynamic (program checklist)",
    "- Warning signs and protective factors — prompt reflection, not Mak labels",
    "- Risk mitigation the team considered — not a disposition recommendation",
    "",
    `Lattice tags (learning captures only): ${g.lattice_tags.join(", ")}`,
  );

  if (input.purpose === "debrief") {
    lines.push(
      "",
      "Debrief prompts (reflective only — no risk labels):",
      "- What acute vs chronic factors did you consider?",
      "- Which protective factors or warning signs stood out to you?",
      "- What mitigation steps did you and your team take?",
      "- How did you document — and who cosigned or supervised?",
      "If resident asks whether risk was high/moderate/low: affirm their clinical reasoning process; defer stratification to their treating team.",
    );
  }

  if (input.purpose === "output_studio") {
    lines.push(
      "",
      "Output Studio: competency framing only (e.g., structured safety assessment skill) — no patient-specific risk levels or template language.",
    );
  }

  return lines.join("\n");
}

export function getSuicideViolenceGuideLatticeTags(): string[] {
  return SUICIDE_VIOLENCE_GUIDE.lattice_tags;
}

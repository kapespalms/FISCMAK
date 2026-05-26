/**
 * Non-traditional career path — translation tables, pivot narrative, destination mapping.
 */

export type NonTraditionalTargetPath =
  | "industry_pharma"
  | "policy_government"
  | "media_communication"
  | "entrepreneurship_healthtech"
  | "consulting"
  | "hybrid"
  | "exploring";

export type CareerPivotContext = {
  target_path?: NonTraditionalTargetPath;
  certainty?: string;
  attraction?: string;
  hybrid_model?: boolean;
  clinical_footprint?: string;
  network_notes?: string;
  success_vision_5yr?: string;
  catalyst_moment?: string;
  why_not_stay?: string;
  intentional_framing?: string;
  identity_notes?: string;
  captured_at?: string;
};

export type PivotTranslationEntry = {
  id: string;
  clinical_experience: string;
  target_path: NonTraditionalTargetPath;
  translated_framing: string;
  captured_at: string;
};

export type PivotOutputFormat =
  | "industry_resume"
  | "pivot_cover_letter"
  | "speaker_bio"
  | "linkedin_profile"
  | "consulting_bio"
  | "pitch_deck_outline"
  | "academic_cv";

export const NON_TRADITIONAL_PATH_LABELS: Record<NonTraditionalTargetPath, string> = {
  industry_pharma: "Industry / Pharma / Medical Affairs",
  policy_government: "Policy / Government / Public Health",
  media_communication: "Media / Science Communication",
  entrepreneurship_healthtech: "Entrepreneurship / Health Tech",
  consulting: "Consulting / Advisory",
  hybrid: "Hybrid (clinical + non-clinical)",
  exploring: "Still exploring",
};

/** Clinical experience → target-world language (from translation framework) */
export const CLINICAL_TRANSLATION_MATRIX: Array<{
  clinical: string;
  industry: string;
  policy: string;
  media: string;
  entrepreneurship: string;
}> = [
  {
    clinical: "Clinical decision-making under uncertainty",
    industry: "Risk-benefit analysis, evidence-based decision frameworks",
    policy: "Balancing population-level tradeoffs, resource allocation",
    media: "Explaining complex decisions to lay audiences",
    entrepreneurship: "Rapid iteration, operating with incomplete data",
  },
  {
    clinical: "Running a code / leading resuscitation",
    industry: "Crisis leadership, real-time team coordination",
    policy: "Emergency response, incident command",
    media: "High-stakes storytelling, narrative tension",
    entrepreneurship: "Leading under pressure, pivoting in real time",
  },
  {
    clinical: "QI / patient safety projects",
    industry: "Process improvement, outcomes measurement",
    policy: "Program evaluation, policy implementation metrics",
    media: "Data-driven storytelling, impact narratives",
    entrepreneurship: "Lean methodology, metrics-driven optimization",
  },
  {
    clinical: "Clinical research / trials",
    industry: "Drug development lifecycle, regulatory science",
    policy: "Evidence synthesis for policy, HTA",
    media: "Science communication, translating data for public",
    entrepreneurship: "Product validation, clinical evidence generation",
  },
  {
    clinical: "Teaching / mentorship",
    industry: "Training and development, talent pipeline",
    policy: "Workforce development, capacity building",
    media: "Content creation, curriculum design",
    entrepreneurship: "Team building, knowledge transfer",
  },
  {
    clinical: "Patient communication",
    industry: "Stakeholder engagement, user-centered design",
    policy: "Constituent engagement, health literacy",
    media: "Audience engagement, empathy-driven communication",
    entrepreneurship: "Customer discovery, empathy mapping",
  },
  {
    clinical: "Managing a clinical service",
    industry: "P&L operations, throughput optimization",
    policy: "Program management, systems administration",
    media: "Managing editorial/production workflows",
    entrepreneurship: "Operations leadership, scaling a service",
  },
];

export function translationForPath(
  clinicalExperience: string,
  path: NonTraditionalTargetPath,
): string | null {
  const row = CLINICAL_TRANSLATION_MATRIX.find((r) =>
    clinicalExperience.toLowerCase().includes(r.clinical.split(" ")[0]!.toLowerCase()),
  );
  if (!row) return null;
  switch (path) {
    case "industry_pharma":
    case "consulting":
      return row.industry;
    case "policy_government":
      return row.policy;
    case "media_communication":
      return row.media;
    case "entrepreneurship_healthtech":
      return row.entrepreneurship;
    default:
      return row.industry;
  }
}

export function buildCareerPivotIntro(): string {
  return `Let's map where you're moving — not just where you've been.

I'll ask what non-traditional path you're exploring, what draws you to it, and whether this is a full pivot or a hybrid model. We'll frame your transition as moving **toward** something intentional, not running away.

What path are you exploring — industry/pharma, policy, media, entrepreneurship, consulting, or still deciding?`;
}

export const CAREER_PIVOT_STEPS: Array<{
  field: keyof CareerPivotContext;
  prompt: (partial: Partial<CareerPivotContext>) => string;
}> = [
  {
    field: "target_path",
    prompt: () =>
      "What non-traditional path are you exploring — industry/pharma, policy/government, media, entrepreneurship/health tech, consulting, or hybrid? How certain are you?",
  },
  {
    field: "attraction",
    prompt: () =>
      "What specifically attracts you — the work, impact model, scale, autonomy, lifestyle? Be concrete.",
  },
  {
    field: "hybrid_model",
    prompt: () =>
      "Is this a full departure from clinical medicine, or a hybrid (e.g., 1–2 days clinical + consulting)? Describe your ideal split.",
  },
  {
    field: "network_notes",
    prompt: () =>
      "Who do you know in this space? Have you talked to physicians who made this transition?",
  },
  {
    field: "success_vision_5yr",
    prompt: () =>
      "What does success look like in 5 years — in your own terms, not academic metrics?",
  },
  {
    field: "catalyst_moment",
    prompt: () =>
      "Was there a specific moment or realization that catalyzed this direction? Frame it as moving toward something.",
  },
  {
    field: "why_not_stay",
    prompt: () =>
      "What isn't working in traditional academic/clinical medicine for you — and how do you talk about that without sounding like escape?",
  },
  {
    field: "intentional_framing",
    prompt: () =>
      "In one sentence: how would you introduce this pivot to an interviewer so it sounds intentional and forward-looking?",
  },
];

export const PIVOT_QUARTERLY_BY_PATH: Record<
  NonTraditionalTargetPath,
  Array<{ id: string; prompt: string }>
> = {
  industry_pharma: [
    {
      id: "trials_engagement",
      prompt:
        "Any clinical trial involvement — PI, sub-I, enrollment challenges you've seen firsthand?",
    },
    {
      id: "pharma_interaction",
      prompt:
        "Interactions with MSLs, advisory boards, or speaker bureaus — what did you observe about how industry operates?",
    },
    {
      id: "unmet_need",
      prompt:
        "Any unmet clinical need where you thought someone should build a drug, device, or diagnostic?",
    },
    {
      id: "therapeutic_expertise",
      prompt:
        "Therapeutic area depth that maps to an active pipeline — and any formulary/payer work?",
    },
  ],
  policy_government: [
    {
      id: "systems_problem",
      prompt:
        "A systems-level delivery problem you've seen that policy could fix — what would you change?",
    },
    {
      id: "public_engagement",
      prompt:
        "Testimony, public comments, legislator engagement, or regulatory interaction?",
    },
    {
      id: "underserved_insight",
      prompt:
        "Work with underserved populations that revealed structural barriers?",
    },
    {
      id: "population_health",
      prompt: "Population health, epidemiology, health economics, or emergency response work?",
    },
  ],
  media_communication: [
    {
      id: "lay_writing",
      prompt:
        "Writing for non-medical audiences — op-eds, blogs, patient education, social threads?",
    },
    {
      id: "public_speaking",
      prompt:
        "Public speaking outside medical conferences — community talks, podcasts, media?",
    },
    {
      id: "explain_breakthrough",
      prompt:
        "A time you explained something complex to a patient/family and it clicked — what made it work?",
    },
    {
      id: "miscommunication_fix",
      prompt:
        "A health topic consistently miscommunicated to the public that you could do better?",
    },
  ],
  entrepreneurship_healthtech: [
    {
      id: "workflow_problem",
      prompt: "A workflow problem in practice that technology could solve?",
    },
    {
      id: "adopted_tool",
      prompt: "Anything you built — tool, protocol, workaround — that other physicians adopted?",
    },
    {
      id: "tech_purchasing",
      prompt: "Clinical technology purchasing decisions — what worked and what didn't?",
    },
    {
      id: "cant_believe_missing",
      prompt: '"I can\'t believe this doesn\'t exist yet" — what was it?',
    },
  ],
  consulting: [
    {
      id: "ops_leadership",
      prompt: "Operations or service-line leadership with measurable outcomes?",
    },
    {
      id: "stakeholder_work",
      prompt: "Cross-functional projects with hospital admin, payers, or vendors?",
    },
    {
      id: "expertise_monetized",
      prompt: "Informal consulting or expert calls you've already done?",
    },
  ],
  hybrid: [
    {
      id: "clinical_footprint",
      prompt: "How are you maintaining clinical currency — days, setting, board cert?",
    },
    {
      id: "non_clinical_build",
      prompt: "What non-clinical work are you building in parallel?",
    },
    {
      id: "dual_narrative",
      prompt:
        "How do you explain the hybrid model as a strength, not split commitment?",
    },
  ],
  exploring: [
    {
      id: "explore_interest",
      prompt: "Which paths are you curious about — and what would you need to learn to decide?",
    },
    {
      id: "informational",
      prompt: "Any informational interviews or shadowing outside medicine?",
    },
  ],
};

export const IDENTITY_NAVIGATION_PROMPTS = [
  "How do you feel about the word 'leaving' medicine — is that how you see it, or is this an expansion?",
  "When you imagine introducing yourself without 'I'm a doctor,' what comes up?",
  "What parts of your medical identity do you want to carry forward? What are you ready to let go of?",
  "How do colleagues and mentors react when you talk about this transition?",
  "What would you tell a medical student who wanted to do what you're doing?",
];

export function buildPivotNarrativeArcPrompt(path?: NonTraditionalTargetPath): string {
  return `Pivot narrative / cover letter (non-traditional audience — NOT academic personal statement):
1. **The Bridge** — what connects medical career to ${path ? NON_TRADITIONAL_PATH_LABELS[path] : "this new path"} (toward, not away)
2. **The Credential** — 2–3 sentences of clinical/academic credibility; decode jargon for outsiders
3. **The Translation** — 2–3 specific experiences explicitly mapped to new-role competencies (connect the dots for the reader)
4. **The Catalyst** — intentional moment of decision; not burnout narrative unless reframed as purpose
5. **The Vision** — unique value only a physician with your background brings

Output formats available: 1–2 page industry resume, pivot cover letter, speaker bio, LinkedIn rewrite, consulting bio, pitch deck outline. Preserve clinical framing when audience is medical.`;
}

export function buildIndustryResumeGuidance(): string {
  return `Industry resume rules (NOT academic CV):
- Value proposition summary at top (therapeutic area + years + target role)
- Achievement-oriented bullets with metrics — never "Responsibilities included..."
- Skills in industry language; decode all medical jargon (no PGY, no "attending" without explanation)
- Publications: 5–8 most relevant only, not full list
- 1–2 pages maximum`;
}

export function buildCareerPivotSystemContext(ctx?: CareerPivotContext | null): string {
  if (!ctx?.target_path && !ctx?.success_vision_5yr) return "";
  const pathLabel = ctx.target_path
    ? NON_TRADITIONAL_PATH_LABELS[ctx.target_path]
    : "exploring";
  return `Career pivot context:
- Target path: ${pathLabel}
- Attraction: ${ctx.attraction ?? "not set"}
- Hybrid: ${ctx.hybrid_model ? `yes — ${ctx.clinical_footprint ?? "details pending"}` : "full pivot or undecided"}
- 5-year success vision: ${ctx.success_vision_5yr ?? "not set"}
- Catalyst: ${ctx.catalyst_moment ?? "not set"}
- Intentional framing: ${ctx.intentional_framing ?? "not set"}
Frame all outputs for OUTSIDER audiences unless medical audience specified. Translate, don't assume clinical literacy.`;
}

export function isNonTraditionalContext(
  practiceSetting?: string | null,
  pivotContext?: CareerPivotContext | null,
): boolean {
  if (pivotContext?.target_path && pivotContext.target_path !== "exploring") return true;
  if (practiceSetting === "Industry") return true;
  return false;
}

export function buildClinicalToTargetTranslationPrompt(
  clinicalExperience: string,
  path: NonTraditionalTargetPath,
): string {
  const suggested = translationForPath(clinicalExperience, path);
  return `Translation engine active.
Clinical experience logged: "${clinicalExperience}"
Target path: ${NON_TRADITIONAL_PATH_LABELS[path]}
${suggested ? `Suggested framing: ${suggested}` : "Map to target-world competencies."}
Ask the physician to quantify impact in outsider language. Do not invent metrics. Offer a draft bullet they can edit.`;
}

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

export type CareerThesisConfidence = "draft" | "confirmed";

export type CareerThesisSource = "instruments" | "lattice" | "conversation";

/** One-sentence career direction — gates pathway surfacing (thesis before paths). */
export type CareerThesis = {
  energizers?: string;
  outside_interests?: string;
  core_strengths?: string;
  audience?: string;
  problem?: string;
  skill_interest?: string;
  sentence?: string;
  confidence?: CareerThesisConfidence;
  sources?: CareerThesisSource[];
  proposed_paths?: NonTraditionalTargetPath[];
  updated_at?: string;
  confirmed_at?: string;
};

export type CareerPivotContext = {
  target_path?: NonTraditionalTargetPath;
  certainty?: string;
  attraction?: string;
  hybrid_model?: boolean;
  clinical_footprint?: string;
  network_notes?: string;
  success_vision_5yr?: string;
  catalyst_moment?: string;
  /** Legacy — no longer collected in onboarding; problem-focused framing avoided. */
  why_not_stay?: string;
  intentional_framing?: string;
  identity_notes?: string;
  captured_at?: string;
};

export type CareerDirectionStepKind = "thesis" | "thesis_confirm" | "pathways" | "context";

export type CareerDirectionStep = {
  kind: CareerDirectionStepKind;
  field?: keyof CareerThesis | keyof CareerPivotContext;
  prompt: (input: {
    thesis: Partial<CareerThesis>;
    context: Partial<CareerPivotContext>;
  }) => string;
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

const PATHWAY_FIT_SIGNALS: Record<NonTraditionalTargetPath, RegExp[]> = {
  industry_pharma: [
    /trial|pharma|biotech|drug|pipeline|msl|medical affairs|clinical development|regulatory|heor|pharmacovigilance/i,
    /therapeutic|medication|fda|device/i,
  ],
  policy_government: [
    /policy|government|public health|population|regulation|cms|legislat|advocacy|health equity|underserved/i,
    /systems.?level|epidemiolog|health economics/i,
  ],
  media_communication: [
    /writ|media|communicat|journal|podcast|author|story|science comm|patient education|op.?ed|audience/i,
    /explain|teach|lay audience/i,
  ],
  entrepreneurship_healthtech: [
    /startup|founder|health tech|digital health|app|product|workflow|ehr|emr|ai|telehealth|innovation|build/i,
    /technology|software|platform/i,
  ],
  consulting: [
    /consult|advisory|operations|process|workflow|efficiency|throughput|strategy|management|readmission|length of stay|utilization/i,
    /stakeholder|cross.?functional|implementation/i,
  ],
  hybrid: [
    /hybrid|part.?time|both|split|keep clinical|maintain practice|side/i,
  ],
  exploring: [/explor|unsure|decid|consider|open|not sure/i],
};

const PATHWAY_PROPOSAL_BLURBS: Record<NonTraditionalTargetPath, string> = {
  industry_pharma: "Pharma, biotech, or medical affairs — clinical development, MSL, regulatory, HEOR",
  policy_government: "Policy, government, or public health — population health, regulation, advocacy",
  media_communication: "Media or science communication — writing, podcasts, patient-facing content",
  entrepreneurship_healthtech: "Health tech or entrepreneurship — product, digital health, startups",
  consulting: "Healthcare consulting or operations — workflow, strategy, utilization, quality",
  hybrid: "Hybrid model — clinical practice plus a parallel non-clinical build",
  exploring: "Still exploring — compare options before committing",
};

export function buildThesisDraftSentence(thesis: Partial<CareerThesis>): string {
  const audience = thesis.audience?.trim() || "organizations";
  const problem = thesis.problem?.trim() || "a meaningful problem in healthcare";
  const skill =
    thesis.skill_interest?.trim() ||
    thesis.core_strengths?.trim() ||
    thesis.energizers?.trim() ||
    "my clinical experience and interests";
  return `I help ${audience} solve ${problem} using ${skill}.`;
}

export function proposePathwaysFromThesis(
  thesis: Partial<CareerThesis>,
  limit = 3,
): NonTraditionalTargetPath[] {
  const corpus = [
    thesis.sentence,
    thesis.audience,
    thesis.problem,
    thesis.skill_interest,
    thesis.core_strengths,
    thesis.energizers,
    thesis.outside_interests,
  ]
    .filter(Boolean)
    .join(" ");

  const scored = (Object.keys(PATHWAY_FIT_SIGNALS) as NonTraditionalTargetPath[])
    .map((path) => {
      const hits = PATHWAY_FIT_SIGNALS[path].reduce(
        (sum, pattern) => sum + (pattern.test(corpus) ? 1 : 0),
        0,
      );
      return { path, score: hits };
    })
    .filter((row) => row.path !== "exploring")
    .sort((a, b) => b.score - a.score);

  const top = scored.filter((row) => row.score > 0).slice(0, limit).map((row) => row.path);

  if (top.length === 0) {
    return ["consulting", "industry_pharma", "exploring"];
  }
  if (top.length < limit && !top.includes("exploring")) {
    top.push("exploring");
  }
  return top.slice(0, limit);
}

export function formatPathwayProposal(
  paths: NonTraditionalTargetPath[],
  thesis: Partial<CareerThesis>,
): string {
  const lines = paths.map(
    (path, index) =>
      `${index + 1}. **${NON_TRADITIONAL_PATH_LABELS[path]}** — ${PATHWAY_PROPOSAL_BLURBS[path]}`,
  );
  const thesisLine = thesis.sentence?.trim()
    ? `\nBased on your direction — *"${thesis.sentence.trim()}"* — these fit best:\n`
    : "\nBased on what you've shared, these directions seem like the strongest fit:\n";
  return `${thesisLine}${lines.join("\n")}\n\nWhich resonates most? You can pick one, combine ideas, or say you're still exploring.`;
}

export function buildCareerPivotProfileHints(meta?: {
  instrument_scores?: Record<string, unknown>;
}): string {
  if (!meta?.instrument_scores) return "";
  const scores = meta.instrument_scores as Record<string, { raw?: Record<string, unknown> }>;
  const energy = scores.career_aspirations?.raw?.track_energy;
  if (typeof energy === "number" && energy <= 4) {
    return "From your Career Profile, your primary track may not be energizing you right now — we'll focus on what would feel sustainable and aligned.";
  }
  if (typeof energy === "number" && energy >= 7) {
    return "From your Career Profile, you seem fairly energized by your current track — we'll clarify whether you're expanding, redirecting, or building something in parallel.";
  }
  return "";
}

export function buildCareerPivotIntro(hints?: string): string {
  const intro = `Before we talk about specific roles, I want to understand what would actually energize you — not just what sounds impressive on paper.

We'll build a one-sentence career direction from your answers, then I'll suggest a few paths that fit. This is about moving **toward** something intentional.${hints ? `\n\n${hints}` : ""}`;

  const first = CAREER_DIRECTION_STEPS[0];
  if (!first) return intro;
  return `${intro}\n\n${first.prompt({ thesis: {}, context: {} })}`;
}

/** Thesis-first, solution-focused exploration — paths surface only after thesis confirm. */
export const CAREER_DIRECTION_STEPS: CareerDirectionStep[] = [
  {
    kind: "thesis",
    field: "energizers",
    prompt: () =>
      "What clinical activities give you energy versus drain you? Name a few — patterns matter more than a perfect list.",
  },
  {
    kind: "thesis",
    field: "outside_interests",
    prompt: () =>
      "Outside medicine, what do you do that you'd keep doing even if unpaid? Hobbies, side projects, causes — anything counts.",
  },
  {
    kind: "thesis",
    field: "core_strengths",
    prompt: () =>
      "What do you do exceptionally well — the thing colleagues actually come to you for?",
  },
  {
    kind: "thesis",
    field: "audience",
    prompt: ({ thesis }) => {
      const hint = thesis.energizers ? `You mentioned energy around ${thesis.energizers.slice(0, 80)}… ` : "";
      return `${hint}Who do you most want to help — patients, health systems, payers, industry teams, policymakers, the public?`;
    },
  },
  {
    kind: "thesis",
    field: "problem",
    prompt: ({ thesis }) => {
      const hint = thesis.audience ? `For ${thesis.audience}, ` : "";
      return `${hint}what specific problem would you want to solve if you had full autonomy?`;
    },
  },
  {
    kind: "thesis",
    field: "skill_interest",
    prompt: ({ thesis }) => {
      const hint = thesis.core_strengths
        ? `You said you're strong at ${thesis.core_strengths.slice(0, 80)}… `
        : "";
      return `${hint}How would you combine that with your interests — in one phrase if you can?`;
    },
  },
  {
    kind: "thesis_confirm",
    prompt: ({ thesis }) => {
      const draft = buildThesisDraftSentence(thesis);
      return `Here's a one-line career direction based on what you've shared:

*"${draft}"*

Does that capture it? Edit freely — one sentence is fine.`;
    },
  },
  {
    kind: "pathways",
    prompt: ({ thesis }) => formatPathwayProposal(proposePathwaysFromThesis(thesis), thesis),
  },
  {
    kind: "context",
    field: "attraction",
    prompt: ({ context }) => {
      const path = context.target_path
        ? NON_TRADITIONAL_PATH_LABELS[context.target_path]
        : "this direction";
      return `What specifically draws you to ${path} — the work, impact model, scale, autonomy, or lifestyle? Be concrete.`;
    },
  },
  {
    kind: "context",
    field: "hybrid_model",
    prompt: () =>
      "Is this a full shift, or a hybrid (e.g., 1–2 days clinical plus consulting or industry work)? Describe your ideal split.",
  },
  {
    kind: "context",
    field: "network_notes",
    prompt: () =>
      "Who do you know in this space? Have you talked to physicians who made a similar move?",
  },
  {
    kind: "context",
    field: "success_vision_5yr",
    prompt: () =>
      "What does success look like in 5 years — in your own terms, not academic metrics?",
  },
  {
    kind: "context",
    field: "catalyst_moment",
    prompt: () =>
      "Was there a moment or realization that pointed you this way? Frame it as moving toward something, not running away.",
  },
];

/** @deprecated Use CAREER_DIRECTION_STEPS */
export const CAREER_PIVOT_STEPS = CAREER_DIRECTION_STEPS;

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

export function buildCareerThesisSystemContext(thesis?: CareerThesis | null): string {
  if (!thesis?.sentence && thesis?.confidence !== "confirmed") return "";
  return `Career direction (confirmed thesis — use as focus parameter for roles and outputs):
- Sentence: ${thesis.sentence ?? buildThesisDraftSentence(thesis)}
- Audience: ${thesis.audience ?? "not set"}
- Problem: ${thesis.problem ?? "not set"}
- Skill/interests: ${thesis.skill_interest ?? thesis.core_strengths ?? "not set"}
- Energizers: ${thesis.energizers ?? "not set"}
Do not recommend paths misaligned with this thesis. Prefer solution-focused, approach-oriented coaching — not problem-focused escape framing.`;
}

export function buildCareerPivotSystemContext(
  ctx?: CareerPivotContext | null,
  thesis?: CareerThesis | null,
): string {
  const thesisBlock = buildCareerThesisSystemContext(thesis);
  if (!ctx?.target_path && !ctx?.success_vision_5yr && !thesisBlock) return thesisBlock;
  const pathLabel = ctx?.target_path
    ? NON_TRADITIONAL_PATH_LABELS[ctx.target_path]
    : "exploring";
  const pivotBlock = ctx?.target_path || ctx?.success_vision_5yr
    ? `Career pivot context:
- Target path: ${pathLabel}
- Attraction: ${ctx?.attraction ?? "not set"}
- Hybrid: ${ctx?.hybrid_model ? `yes — ${ctx?.clinical_footprint ?? "details pending"}` : "full pivot or undecided"}
- 5-year success vision: ${ctx?.success_vision_5yr ?? "not set"}
- Catalyst: ${ctx?.catalyst_moment ?? "not set"}
- Intentional framing: ${ctx?.intentional_framing ?? thesis?.sentence ?? "not set"}
Frame all outputs for OUTSIDER audiences unless medical audience specified. Translate, don't assume clinical literacy.`
    : "";
  return [thesisBlock, pivotBlock].filter(Boolean).join("\n\n");
}

export function hasConfirmedCareerThesis(thesis?: CareerThesis | null): boolean {
  return thesis?.confidence === "confirmed" && Boolean(thesis.sentence?.trim());
}

export function isNonTraditionalContext(
  practiceSetting?: string | null,
  pivotContext?: CareerPivotContext | null,
  thesis?: CareerThesis | null,
): boolean {
  if (hasConfirmedCareerThesis(thesis)) return true;
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

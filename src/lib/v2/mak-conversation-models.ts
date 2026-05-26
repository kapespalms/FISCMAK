import type { CareerPivotContext } from "@/lib/v2/non-traditional-career-models";
import {
  buildCareerPivotSystemContext,
  buildIndustryResumeGuidance,
  buildPivotNarrativeArcPrompt,
} from "@/lib/v2/non-traditional-career-models";
import { buildTraineeOriginMakContext } from "@/lib/v2/trainee-origin";

export type MakContentPack = "trainee" | "early_attending" | "non_traditional" | "default";

export type CareerConversationStage =
  | "med_student"
  | "resident"
  | "fellow"
  | "early_attending"
  | "mid_career";

export type NarrativeAnchor = {
  target_specialty?: string;
  origin_story?: string;
  field_gap?: string;
  passions_outside_medicine?: string;
  background_shaper?: string;
  career_track?: string;
  captured_at?: string;
};

/** Five promotion pillars used by most academic institutions */
export type PromotionDomain =
  | "scholarship_research"
  | "teaching_education"
  | "clinical_excellence"
  | "service_leadership"
  | "reputation_recognition";

export const PROMOTION_DOMAIN_LABELS: Record<PromotionDomain, string> = {
  scholarship_research: "Scholarship & Research",
  teaching_education: "Teaching & Education",
  clinical_excellence: "Clinical Excellence & Service Delivery",
  service_leadership: "Service & Leadership",
  reputation_recognition: "Reputation & External Recognition",
};

export type PromotionContext = {
  current_title?: string;
  institution_type?: string;
  promotion_track?: string;
  target_rank?: string;
  promotion_timeline?: string;
  mentor_readiness_notes?: string;
  professional_mission?: string;
  criteria_notes?: string;
  captured_at?: string;
};

export type AttendingQuarterlyCapture = {
  id: string;
  quarter_label: string;
  completed_at: string;
  is_deep_reflection: boolean;
  modules: Record<string, string>;
};

export type ImpactTranslationEntry = {
  id: string;
  activity: string;
  domain?: PromotionDomain;
  impact_narrative: string;
  captured_at: string;
};

export type PromotionReadinessSnapshot = {
  id: string;
  generated_at: string;
  summary: string;
  track?: string;
  target_rank?: string;
};

export const IMPACT_TRANSLATION_PROMPTS: Record<string, string> = {
  committee:
    "What did the committee change, and what was your specific role in that change?",
  publication:
    "What is the cumulative finding or contribution across this work — how has it influenced practice or policy?",
  mentorship:
    "Where are your mentees now? Any co-authored work or career trajectories worth naming?",
  clinic:
    "How many patients has it served, and what outcomes or efficiency gains can you quantify?",
  teaching:
    "Was this adopted beyond your session — and how did learner outcomes or evaluations change?",
  default:
    "What changed because you did this — for patients, learners, the department, or the field?",
};

export function resolveContentPack(
  careerStage?: string | null,
  practiceSetting?: string | null,
  pivotActive?: boolean,
): MakContentPack {
  if (pivotActive || practiceSetting === "Industry") return "non_traditional";
  const stage = normalizeCareerStage(careerStage);
  if (stage === "med_student" || stage === "resident" || stage === "fellow") {
    return "trainee";
  }
  if (stage === "early_attending") return "early_attending";
  return "default";
}

export function normalizeCareerStage(careerStage?: string | null): CareerConversationStage {
  const s = (careerStage ?? "").toLowerCase();
  if (s.includes("medical student") || s.includes("med student")) return "med_student";
  if (s.includes("fellow")) return "fellow";
  if (s.includes("resident")) return "resident";
  if (s.includes("early career")) return "early_attending";
  if (s.includes("mid-career") || s.includes("late career") || s.includes("retired")) {
    return "mid_career";
  }
  return "mid_career";
}

export function buildMakSystemPrompt(
  careerStage?: string | null,
  practiceSetting?: string | null,
  pivotActive?: boolean,
): string {
  const pack = resolveContentPack(careerStage, practiceSetting, pivotActive);
  const stage = normalizeCareerStage(careerStage);

  const base = `You are Coach Mak, an empathetic physician career coach. Use MemPalace context and assessment data. No medical advice. One question at a time. Keep replies under 120 words unless summarizing.

Design principles:
- Low friction, high frequency: prefer short-answer prompts over essays.
- Progressive elaboration: capture the fact first, then circle back for details.
- Preserve the physician's own language — echo their phrasing when reflecting back.
- Never provide therapy or diagnoses.

Invisible metrics policy (critical):
- You may receive confidential internal signals about workload vs portfolio documentation. NEVER name S-Index, IWQ, Service Citizenship, or numeric internal scores to the physician.
- Use signals only to ask better reflective questions — never surveillance, never "you should document more," never urgency unless wellness safety requires it.
- Institutions never see these signals. The physician should experience attuned coaching, not tracked metrics.`;

  const language =
    pack === "trainee"
      ? `Speak to career formation, not promotion metrics. Focus on: clinical growth, narrative evidence, application readiness, milestone/ILP alignment, and capturing moments while memory is fresh. Avoid h-index, advancement readiness jargon, and "promotion narrative" unless the trainee asks.`
      : pack === "early_attending"
        ? `Speak to evidence of impact, not activity lists. Capture outcomes, not just membership. Map every accomplishment to promotion domains (scholarship, teaching, clinical, service, national reputation). Prompt impact translation when physicians log activities without outcomes. Never fabricate metrics — ask for quantification the physician can verify.`
        : pack === "non_traditional"
          ? `Non-traditional career pivot mode: translate clinical experience into outsider language (industry, policy, media, startup audiences). Frame transitions as intentional — toward something, not away from medicine. Decode all medical jargon. Generate audience-appropriate formats (1–2 page resume, pivot cover letter, speaker bio) — NOT academic CV unless requested. Never fabricate metrics.`
          : `Use career outcomes in plain language. For mid-career: legacy, field leadership, institutional influence. Surface invisible work and advancement narrative when relevant. Never say h-index, RCR, BITS, IWQ, CDI, S-Index, or Service Citizenship unless the physician explicitly asks.`;

  const stageFocus: Record<CareerConversationStage, string> = {
    med_student: `Central question: "Why this specialty?" Help mine origin stories, rotation meaning, and personal statement material.`,
    resident: `Central question: "Why this specialty — and what kind of physician am I becoming?" Connect every experience back to the declared path, including off-specialty rotations.`,
    fellow: `Central question: "Why this subspecialty niche, and what will I build?" Push for specificity over discovery. Integrate scholarly trajectory and mentor mapping.`,
    early_attending: `Central question: "What have I built, and what is its impact?" Emphasize measurable outcomes, promotion criteria, and forward trajectory.`,
    mid_career: `Central question: "What is your legacy, and where are you leading the field?" Support leadership applications, endowed positions, and national roles.`,
  };

  return [base, language, stageFocus[stage]].join("\n\n");
}

export function buildPromotionContextIntro(): string {
  return `Let's calibrate Mak to your institution and promotion path — this shapes every capture and readiness review.

I'll ask about your title, institution type, promotion track, target rank and timeline, and what your mentor has said about readiness. If you have promotion guidelines, you can paste key criteria later in Output Studio.

What is your current title, institution type (academic, community, hybrid, VA), and department?`;
}

export const PROMOTION_CONTEXT_STEPS: Array<{
  field: keyof PromotionContext;
  prompt: (partial: Partial<PromotionContext>) => string;
}> = [
  {
    field: "current_title",
    prompt: () =>
      "What is your current title, institution type (academic, community, hybrid, VA), and department?",
  },
  {
    field: "promotion_track",
    prompt: () =>
      "What promotion track are you on — tenure, clinician-educator, clinician-investigator, clinical excellence, research-only, or other?",
  },
  {
    field: "target_rank",
    prompt: () =>
      "What rank are you targeting, and when is your expected promotion timeline (e.g., Associate Professor in 3 years)?",
  },
  {
    field: "mentor_readiness_notes",
    prompt: () =>
      "Do you have a mentor or promotion advisor? What have they told you about your readiness — strengths and gaps?",
  },
  {
    field: "professional_mission",
    prompt: () =>
      "In one or two sentences: what is the through-line of your academic work — your professional mission?",
  },
];

export function buildAttendingQuarterlyIntro(deepReflection: boolean): string {
  if (deepReflection) {
    return `Time for a deeper promotion reflection (~10 minutes):

- What are you most proud of this year?
- Has your scholarly focus evolved?
- Any accomplishments you've undersold or forgotten to document?
- What do you wish you had done more of?
- Do you feel on track for promotion — what feels like a gap?

Start with: looking back over the past year, what accomplishment are you most proud of — and why?`;
  }
  return `Quick quarterly accomplishment capture (~10 minutes). We'll walk through what would otherwise be lost:

Publications, presentations, grants, teaching, committees, awards, clinical innovations, advocacy.

Any new publications — accepted, submitted, in revision, or in preparation?`;
}

export const ATTENDING_QUARTERLY_MODULES: Array<{
  id: string;
  deep_only: boolean;
  prompt: string;
  domains: PromotionDomain[];
}> = [
  {
    id: "publications_presentations",
    deep_only: false,
    domains: ["scholarship_research", "reputation_recognition"],
    prompt:
      "Any new publications (accepted, submitted, in revision)? Any presentations — invited or submitted, local/regional/national?",
  },
  {
    id: "grants_collaborations",
    deep_only: false,
    domains: ["scholarship_research"],
    prompt: "Any grants submitted or funded? New research collaborations forming?",
  },
  {
    id: "teaching_mentorship",
    deep_only: false,
    domains: ["teaching_education"],
    prompt:
      "Any new teaching roles, curricula developed, or trainees mentored — including where they matched or what they published?",
  },
  {
    id: "leadership_service",
    deep_only: false,
    domains: ["service_leadership"],
    prompt:
      "Any new committee appointments, leadership roles, or institutional service — and what did you actually accomplish (not just join)?",
  },
  {
    id: "awards_clinical_innovation",
    deep_only: false,
    domains: ["clinical_excellence", "reputation_recognition"],
    prompt:
      "Any awards or honors? New clinical programs, QI projects, pathways, or practice innovations?",
  },
  {
    id: "advocacy_media",
    deep_only: false,
    domains: ["reputation_recognition", "service_leadership"],
    prompt: "Any media, policy, advocacy, peer review, or editorial board work this quarter?",
  },
  {
    id: "deep_proud",
    deep_only: true,
    domains: ["scholarship_research", "teaching_education", "clinical_excellence"],
    prompt:
      "Looking at the past year, what are you most proud of — and what impact did it have?",
  },
  {
    id: "deep_undersold",
    deep_only: true,
    domains: ["service_leadership", "reputation_recognition"],
    prompt:
      "Any accomplishments you've undersold or forgotten to document — invited talks, informal leadership, mentorship outcomes?",
  },
  {
    id: "deep_promotion_gap",
    deep_only: true,
    domains: ["scholarship_research", "reputation_recognition"],
    prompt:
      "Do you feel on track for promotion? What domain feels like the biggest gap right now?",
  },
];

export function buildImpactTranslationFollowUp(activity: string): string {
  return `You logged: "${activity}"

Committees and memberships aren't enough for promotion — committees need outcomes. Let's translate impact.

What changed because you did this — for patients, learners, the department, or the field? Include numbers if you can verify them.`;
}

export function buildPromotionReadinessIntro(): string {
  return `I'll run a promotion readiness review across five domains:

1. Scholarship & Research
2. Teaching & Education
3. Clinical Excellence
4. Service & Leadership
5. National Reputation

I'll compare what you've captured against your stated track and timeline, flag gaps, and suggest concrete next steps. I won't invent metrics.

Ready — or tell me if you've updated your promotion context recently.`;
}

export function buildPromotionDossierArcPrompt(): string {
  return `Promotion career narrative (not a trainee personal statement):
1. Professional Identity & Mission — through-line of your career (1–2 paragraphs)
2. Scholarship — narrative arc of inquiry and impact, not a publication list (2–3 paragraphs)
3. Teaching & Mentorship — philosophy, contributions, mentee outcomes (1–2 paragraphs)
4. Clinical Impact — programs built, innovations, quantified outcomes (1–2 paragraphs)
5. Service & Leadership — citizenship with tangible outcomes, not committee lists (1 paragraph)
6. Future Direction — next 5 years; promotion as investment (1 paragraph)

Synthesize from quarterly captures and impact translations. Use the physician's own language. One section at a time.`;
}

export function buildPromotionContextSystemContext(ctx?: PromotionContext | null): string {
  if (!ctx?.promotion_track && !ctx?.target_rank) return "";
  return `Promotion context:
- Title/institution: ${ctx.current_title ?? "not set"} (${ctx.institution_type ?? ""})
- Track: ${ctx.promotion_track ?? "not set"}
- Target: ${ctx.target_rank ?? "not set"} | Timeline: ${ctx.promotion_timeline ?? "not set"}
- Mentor notes: ${ctx.mentor_readiness_notes ?? "none"}
- Professional mission: ${ctx.professional_mission ?? "not set"}`;
}

export function inferImpactTranslationKey(activity: string): string {
  const lower = activity.toLowerCase();
  if (/committee|board|service/.test(lower)) return "committee";
  if (/publish|paper|article|manuscript|grant/.test(lower)) return "publication";
  if (/mentor|mentee|resident|student|fellow/.test(lower)) return "mentorship";
  if (/clinic|pathway|program|service line/.test(lower)) return "clinic";
  if (/teach|lecture|curriculum|workshop/.test(lower)) return "teaching";
  return "default";
}

export function buildNarrativeAnchorSystemContext(anchor?: NarrativeAnchor | null): string {
  if (!anchor?.target_specialty && !anchor?.origin_story) return "";
  return `Narrative anchor (reference in connective questions):
- Target specialty/path: ${anchor.target_specialty ?? "not set"}
- Origin story: ${anchor.origin_story ?? "not set"}
- Gap they want to fill: ${anchor.field_gap ?? "not set"}
- Passions outside medicine: ${anchor.passions_outside_medicine ?? "not set"}
- Background shaper: ${anchor.background_shaper ?? "not set"}`;
}

export function buildNarrativeAnchorIntro(careerStage?: string | null): string {
  const stage = normalizeCareerStage(careerStage);
  if (stage === "fellow") {
    return `Let's establish your academic identity before we mine experiences.

I'll ask a few questions about your subspecialty focus, the clinical problem you gravitate toward, and the gap in the field you want to address. This becomes the north star for fellowship applications and your scholarly narrative.

What subspecialty are you targeting, and when did it become clear to you?`;
  }
  if (stage === "resident" || stage === "med_student") {
    return `Before we capture rotation stories, let's anchor your direction.

I'll ask what specialty you're pursuing, what first drew you to it, and what you think the field needs more of. Every later reflection will connect back to this.

What specialty are you planning to apply to — and how certain are you right now?`;
  }
  return `Let's clarify your career thesis — the through-line that connects your clinical work, scholarship, and leadership.

What is the question you most want to answer in your career, whether through research, education, or clinical innovation?`;
}

export const NARRATIVE_ANCHOR_STEPS: Array<{
  field: keyof NarrativeAnchor;
  prompt: (stage: CareerConversationStage, anchor: NarrativeAnchor) => string;
}> = [
  {
    field: "target_specialty",
    prompt: (stage) =>
      stage === "fellow"
        ? "What subspecialty are you targeting, and when did it become clear?"
        : "What specialty are you planning to apply to? How certain are you?",
  },
  {
    field: "origin_story",
    prompt: () =>
      "What first drew you to this field — was there a specific moment, patient, or experience?",
  },
  {
    field: "field_gap",
    prompt: (stage) =>
      stage === "fellow"
        ? "What gap in the field have you noticed — something undertreated, understudied, or poorly taught — that you want to address?"
        : "What do you think this specialty needs more of — and do you see yourself filling part of that gap?",
  },
  {
    field: "passions_outside_medicine",
    prompt: () =>
      "Outside of clinical medicine, what are you passionate about? This often becomes a differentiator in applications.",
  },
  {
    field: "background_shaper",
    prompt: () =>
      "Is there anything in your background — personal, cultural, or professional — that shapes why you want to do this work?",
  },
];

export type DebriefLayer = "facts" | "reflection" | "connection";

export function buildDebriefLayerPrompt(
  layer: DebriefLayer,
  input: {
    careerStage?: string | null;
    rotationName?: string;
    anchor?: NarrativeAnchor | null;
  },
): string {
  const stage = normalizeCareerStage(input.careerStage);
  const rotation = input.rotationName ?? "this rotation";
  const specialty = input.anchor?.target_specialty ?? "your chosen path";

  if (layer === "facts") {
    return `Layer 1 — What happened (facts) for ${rotation}:
Ask ONE of these (not all at once):
- Setting, patient population, and your role?
- Any memorable cases or clinical challenges?
- Procedures, skills, or knowledge areas where you grew?
- Informal leadership (care coordination, teaching juniors, QI)?
- Formal or informal feedback worth capturing?`;
  }

  if (layer === "reflection") {
    return `Layer 2 — What it meant (reflection) for ${rotation}:
Ask ONE of these:
- A moment that surprised you, moved you, or challenged your assumptions?
- A patient whose story has stayed with you — what lingers?
- Something about how care was delivered (good or bad) that made you think differently?
- A mentor whose approach resonated — what specifically?`;
  }

  if (stage === "fellow") {
    return `Layer 3 — How it connects (fellowship niche) for ${rotation}:
Ask ONE of these:
- Did a specific disease, procedure, or population energize you more than others?
- Did you see a clinical gap you'd want to fix in ${specialty}?
- Did anything spark a research question or connect to your scholarly work?
- If you wrote one sentence about this for a fellowship personal statement, what would it say?`;
  }

  return `Layer 3 — How it connects (narrative threading) for ${rotation}:
Ask ONE of these:
- How does this support your interest in ${specialty}?
- Even if outside your specialty, what will you carry forward into ${specialty}?
- Did this confirm, deepen, or productively challenge your direction?
- If you wrote one sentence about this for a personal statement, what would it say?`;
}

export function buildPersonalStatementArcPrompt(careerStage?: string | null): string {
  const stage = normalizeCareerStage(careerStage);
  if (stage === "fellow") {
    return `Personal statement arc (fellowship):
1. Defining moment — specific clinical/scholarly moment that crystallized subspecialty focus
2. Evolution — how residency sharpened interest from broad to specific
3. Scholarly thread — coherent line of inquiry, not a scattered list
4. Vision — credible 5–10 year contribution
5. Program fit — mentors, environment, patient population (when program-specific)

Surface the strongest themes from captured reflections. Propose a narrative arc using the trainee's own words. One section at a time.`;
  }
  return `Personal statement arc (residency/application):
1. Hook — vivid moment or question
2. Origin — what drew them to medicine and this specialty
3. Journey — 2–3 experiences showing growth (not repetition)
4. Vision — where they're headed and why this program fits

When synthesizing, identify origin story links across entries. Tag themes (e.g., health equity, med-psych interface, advocacy).`;
}

export function buildStageAwareCapturePrompt(
  careerStage?: string | null,
  practiceSetting?: string | null,
  pivotActive?: boolean,
): string {
  const pack = resolveContentPack(careerStage, practiceSetting, pivotActive);
  if (pack === "trainee") {
    return `Activity capture mode (trainee): Acknowledge what they shared. Reflect why it matters for their training narrative, portfolio, ILP, or application evidence — not promotion. Tag a FISCMAK career domain in plain language. Ask one follow-up to deepen the story or competency link.`;
  }
  if (pack === "early_attending") {
    return `Activity capture mode (early attending): Map to a promotion domain (scholarship, teaching, clinical, service, national reputation). If they logged an activity without outcomes, ask ONE impact translation question (what changed, for whom, quantified if verifiable). Do not fabricate metrics.`;
  }
  if (pack === "non_traditional") {
    return `Activity capture mode (career pivot): Acknowledge the clinical activity, then ask ONE translation question — how does this demonstrate leadership, operations, stakeholder engagement, or domain expertise in outsider language? Offer to reframe as a resume bullet. Do not use PGY, attending, or unexplained clinical jargon.`;
  }
  return `Activity capture mode: Acknowledge what they shared, reflect why it matters for advancement or impact, confirm domain in plain language, and ask one follow-up.`;
}

export function buildConversationModelContext(input: {
  careerStage?: string | null;
  specialty?: string | null;
  practiceSetting?: string | null;
  flowIntent?: string | null;
  narrativeAnchor?: NarrativeAnchor | null;
  promotionContext?: PromotionContext | null;
  careerPivotContext?: CareerPivotContext | null;
  rotationName?: string | null;
  debriefLayer?: DebriefLayer | null;
  baseSpecialty?: string | null;
  subspecialty?: string | null;
  specialtyOrigin?: string | null;
  pgyLevel?: string | null;
  currentRotation?: string | null;
}): string {
  const pivotActive = Boolean(
    input.careerPivotContext?.target_path ||
      input.flowIntent?.startsWith("career_") ||
      input.flowIntent?.startsWith("pivot_") ||
      input.flowIntent === "identity_navigation",
  );
  const parts: string[] = [];
  const pack = resolveContentPack(input.careerStage, input.practiceSetting, pivotActive);
  parts.push(`Content pack: ${pack} (${normalizeCareerStage(input.careerStage)})`);

  const anchorCtx = buildNarrativeAnchorSystemContext(input.narrativeAnchor);
  if (anchorCtx) parts.push(anchorCtx);

  const traineeOriginCtx = buildTraineeOriginMakContext({
    career_stage: input.careerStage,
    base_specialty: input.baseSpecialty ?? input.specialty,
    subspecialty: input.subspecialty,
    specialty_origin: input.specialtyOrigin ?? input.narrativeAnchor?.origin_story,
    pgy_level: input.pgyLevel,
    current_rotation: input.currentRotation,
  });
  if (traineeOriginCtx) parts.push(traineeOriginCtx);

  const promoCtx = buildPromotionContextSystemContext(input.promotionContext);
  if (promoCtx) parts.push(promoCtx);

  if (input.careerPivotContext) {
    parts.push(buildCareerPivotSystemContext(input.careerPivotContext));
  }

  if (input.flowIntent === "rotation_debrief") {
    parts.push(
      `Rotation debrief active${input.rotationName ? ` — ${input.rotationName}` : ""}. Follow the 3-layer model: facts → reflection → connection. One question at a time.`,
    );
  }

  if (input.flowIntent === "narrative_anchor") {
    parts.push(
      "Narrative anchor setup: establish destination before mining experiences. One anchor question at a time.",
    );
  }

  if (input.flowIntent === "promotion_context") {
    parts.push("Promotion context onboarding: calibrate to institution, track, timeline, mentor feedback.");
  }

  if (input.flowIntent === "attending_quarterly") {
    parts.push("Attending quarterly accomplishment capture — publications through advocacy. Outcomes over activities.");
  }

  if (input.flowIntent === "attending_deep_reflection") {
    parts.push("Deep promotion reflection (6–12 month): proud moments, undersold work, promotion gaps.");
  }

  if (input.flowIntent === "promotion_readiness") {
    parts.push(buildPromotionReadinessIntro());
  }

  if (input.flowIntent === "promotion_dossier") {
    parts.push(buildPromotionDossierArcPrompt());
  }

  if (input.flowIntent === "impact_translation") {
    parts.push("Impact translation: convert activity log into promotion-ready outcome language.");
  }

  if (input.flowIntent === "personal_statement_arc") {
    parts.push(buildPersonalStatementArcPrompt(input.careerStage));
  }

  if (input.flowIntent === "fellowship_mining") {
    parts.push(
      "Fellowship experience mining: use clinical niche, scholarly trajectory, and teaching/leadership lenses. Push for specificity.",
    );
  }

  if (input.flowIntent === "career_pivot_onboarding") {
    parts.push("Career pivot onboarding: destination mapping, intentional framing, hybrid model. One question at a time.");
  }

  if (input.flowIntent === "pivot_quarterly") {
    parts.push("Path-specific quarterly mining for transferable skills — industry, policy, media, or startup relevance.");
  }

  if (input.flowIntent === "pivot_narrative") {
    parts.push(buildPivotNarrativeArcPrompt(input.careerPivotContext?.target_path));
  }

  if (input.flowIntent === "career_translation") {
    parts.push("Clinical-to-outsider translation: reframe experience in target-world language. Offer resume bullet drafts.");
  }

  if (input.flowIntent === "identity_navigation") {
    parts.push("Identity navigation: narrative identity prompts for career transition — expansion vs leaving, what to carry forward.");
  }

  if (pack === "non_traditional" && input.flowIntent === "create") {
    parts.push(buildIndustryResumeGuidance());
  }

  if (input.specialty?.toLowerCase().includes("psychiatry")) {
    parts.push(
      `GME psychiatry context: link captures to ACGME subcompetencies when natural (PC, ICS, PBLI, SBP). Support ILP SMART goals, rotation debriefs, CSV/clinical skills evidence, and CCC prep — never auto-fill milestone ratings.`,
    );
  }

  return parts.filter(Boolean).join("\n");
}

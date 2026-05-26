/**
 * Personal statement templates — stage-specific sections + specialty guidance.
 * Used when career narrative application type is training_personal_statement.
 */

import type {
  CareerNarrativeSection,
  CareerNarrativeStageId,
} from "@/lib/v2/career-narrative-templates";

export type SpecialtyPersonalStatementGuide = {
  label: string;
  emphasize: string[];
  uniqueAngle: string;
  avoid?: string[];
  strongOpeners: string[];
  toneNote?: string;
};

export const PERSONAL_STATEMENT_UNIVERSAL_TIPS = [
  "Show, don't tell — replace adjectives with specific evidence",
  "One narrative thread; do not summarize the CV",
  "Tailor tone and depth to the reader (program director, committee, grant reviewers)",
  "Authenticity and specificity beat polished generic prose",
  "Plan for 5–10 drafts with mentor feedback",
];

export const PERSONAL_STATEMENT_STAGES: Record<
  CareerNarrativeStageId,
  { purpose: string; targetWords: number; sections: CareerNarrativeSection[] }
> = {
  med_student: {
    purpose: "Residency applications (ERAS), research programs, scholarship applications",
    targetWords: 900,
    sections: [
      {
        id: "ps_hook",
        title: "Opening Hook",
        subtitle: "Vivid clinical moment — avoid clichés",
        targetWords: 150,
        prompts: [
          "A brief, vivid clinical moment or formative experience that sparked interest in your specialty",
          "Start in the middle of the action — not 'I've always wanted to be a doctor since I was five'",
          "De-identify patient details; make it specific to you",
        ],
        placeholder:
          "The patient in Bed 4 taught me something no textbook could — [specific moment that sparked your specialty interest]…",
      },
      {
        id: "ps_why_specialty",
        title: "Why This Specialty",
        subtitle: "Connect the hook to the field",
        targetWords: 175,
        prompts: [
          "Patient population, intellectual challenges, procedural elements, or continuity of care",
          "Link directly to the opening vignette",
          "Name what this specialty offers that others do not — for you specifically",
        ],
        placeholder:
          "What draws me to [specialty] is [specific aspect] — the intersection of…",
      },
      {
        id: "ps_what_you_bring",
        title: "What You Bring",
        subtitle: "2–3 experiences with evidence",
        targetWords: 250,
        prompts: [
          "Clinical rotations, research, leadership, or community work — show, don't tell",
          "Use specific examples, not adjective lists ('passionate,' 'dedicated')",
          "What the CV cannot reveal about who you are as a future physician",
        ],
        placeholder:
          "Through [rotation/research/leadership experience], I demonstrated…",
      },
      {
        id: "ps_future_vision",
        title: "Future Vision",
        subtitle: "Goals in the specialty",
        targetWords: 150,
        prompts: [
          "Clinical interests, research questions, underserved populations",
          "Academic vs. community practice direction — be honest about uncertainty if applicable",
        ],
        placeholder:
          "In [specialty], I hope to contribute by…",
      },
      {
        id: "ps_closing",
        title: "Closing",
        subtitle: "Circle back to opening theme",
        targetWords: 100,
        prompts: [
          "Return to the opening theme with forward momentum",
          "Convey enthusiasm and readiness — not a summary of prior paragraphs",
        ],
        placeholder:
          "The moment in [opening reference] was not an exception — it reflects the physician I am becoming…",
      },
    ],
  },
  resident: {
    purpose: "Fellowship applications, chief resident, early career opportunities",
    targetWords: 900,
    sections: [
      {
        id: "ps_opening_narrative",
        title: "Opening Narrative",
        subtitle: "Patient encounter that crystallized direction",
        targetWords: 175,
        prompts: [
          "A patient encounter or clinical challenge during residency that crystallized subspecialty interest",
          "Specific, vivid, de-identified",
        ],
        placeholder:
          "During my [PGY year] on [service], a single case clarified why I am pursuing [fellowship/subspecialty]…",
      },
      {
        id: "ps_evolution_interest",
        title: "Evolution of Interest",
        subtitle: "Medical school → residency maturation",
        targetWords: 175,
        prompts: [
          "How thinking matured from medical school through residency",
          "Clinical experiences, mentors, or research that shaped current focus",
        ],
        placeholder:
          "My interest in [area] evolved from… through residency experiences including…",
      },
      {
        id: "ps_clinical_contributions",
        title: "Clinical & Academic Contributions",
        subtitle: "Impact, not participation",
        targetWords: 200,
        prompts: [
          "QI projects, publications, teaching roles, or leadership — emphasize impact",
          "Demonstrate growth and increasing independence",
        ],
        placeholder:
          "During residency I led [project/role], resulting in…",
      },
      {
        id: "ps_why_program",
        title: "Why This Fellowship / Program",
        subtitle: "Program-specific when applicable",
        targetWords: 150,
        prompts: [
          "Faculty, patient population, research infrastructure, clinical volume",
          "Show you have researched the program — name specifics when possible",
        ],
        placeholder:
          "I am drawn to [program] because of [faculty/population/infrastructure]…",
      },
      {
        id: "ps_career_trajectory",
        title: "Career Trajectory",
        subtitle: "5–10 year vision",
        targetWords: 150,
        prompts: [
          "Be specific: clinician-educator, translational researcher, community clinical leader, etc.",
          "Balance clinical passion with scholarly or leadership ambitions",
        ],
        placeholder:
          "Over the next decade, I aim to become…",
      },
    ],
  },
  fellow: {
    purpose: "Faculty positions, advanced fellowships, K-awards, leadership roles",
    targetWords: 1100,
    sections: [
      {
        id: "ps_professional_identity",
        title: "Professional Identity Statement",
        subtitle: "Lead with your niche",
        targetWords: 175,
        prompts: [
          "Clear articulation: physician-scientist, clinician-educator, or clinical expert",
          "Tone reflects transition from trainee to independent professional",
        ],
        placeholder:
          "I am a [identity] focused on [niche] in [specialty/subspecialty]…",
      },
      {
        id: "ps_defining_experience",
        title: "Defining Experience",
        subtitle: "Pivotal case, finding, or mentorship",
        targetWords: 175,
        prompts: [
          "Pivotal case, research finding, or mentorship moment that shaped identity",
          "Coherent narrative connecting training choices to future goals",
        ],
        placeholder:
          "A pivotal [case/finding/mentorship] during fellowship defined my path…",
      },
      {
        id: "ps_research_scholarly",
        title: "Research & Scholarly Focus",
        subtitle: "Question, methods, findings, field fit",
        targetWords: 225,
        prompts: [
          "The question you pursue, methodology, preliminary findings, field context",
          "For clinician-educators: educational scholarship or curriculum development",
          "For K-awards: mentored-to-independent transition plan",
        ],
        placeholder:
          "My scholarly work addresses [question] using [methods]. Preliminary findings suggest…",
      },
      {
        id: "ps_clinical_expertise",
        title: "Clinical Expertise",
        subtitle: "Strengths complementing academic work",
        targetWords: 150,
        prompts: [
          "Clinical strengths and how they complement scholarship or education",
          "Quantify where possible: patients, procedures, learner hours",
        ],
        placeholder:
          "Clinically, I focus on [population/procedures] which informs my [research/teaching] by…",
      },
      {
        id: "ps_vision_impact",
        title: "Vision & Impact",
        subtitle: "Gap you will fill",
        targetWords: 175,
        prompts: [
          "What gap will you fill? What program will you build? What outcomes will you improve?",
        ],
        placeholder:
          "I plan to contribute by [specific program/research/clinical initiative]…",
      },
      {
        id: "ps_fit",
        title: "Fit",
        subtitle: "Mutual benefit with institution",
        targetWords: 125,
        prompts: [
          "What you bring and what the environment offers",
          "Name specific faculty, resources, or collaborations when known",
        ],
        placeholder:
          "At [institution], I would contribute… while benefiting from…",
      },
    ],
  },
  early_attending: {
    purpose: "Promotion packets, grants, society nominations, new positions",
    targetWords: 1100,
    sections: [
      {
        id: "ps_professional_mission",
        title: "Professional Mission",
        subtitle: "Declarative identity — not aspirational",
        targetWords: 150,
        prompts: [
          "Confident statement of professional identity and mission",
          "Shift from 'potential' to 'accomplishment' language",
        ],
        placeholder:
          "I am a [identity] whose mission is to [specific unmet need]…",
      },
      {
        id: "ps_training_foundation",
        title: "Training Foundation",
        subtitle: "Brief — focus on what you've built",
        targetWords: 100,
        prompts: [
          "Formative training experiences — keep short",
          "Bridge to pillars of impact below",
        ],
        placeholder:
          "Training in [programs] provided the foundation for…",
      },
      {
        id: "ps_pillar_clinical",
        title: "Pillar 1 — Clinical Impact",
        subtitle: "Practice, innovation, populations",
        targetWords: 200,
        prompts: [
          "Clinical practice, expertise, innovations, unique patient populations",
          "Use metrics: volumes, outcomes, quality data",
        ],
        placeholder:
          "My clinical practice in [setting] focuses on… with outcomes including…",
      },
      {
        id: "ps_pillar_scholarship",
        title: "Pillar 2 — Scholarship",
        subtitle: "Research, education, or QI program",
        targetWords: 200,
        prompts: [
          "Research program, educational contributions, or QI/safety work",
          "Key publications, grants, or curricula — independent role clear",
        ],
        placeholder:
          "My scholarship in [area] includes [publications/grants/curricula]…",
      },
      {
        id: "ps_pillar_leadership",
        title: "Pillar 3 — Leadership & Service",
        subtitle: "Mentorship, committees, national roles",
        targetWords: 175,
        prompts: [
          "Committee roles, mentorship, society involvement, community engagement",
          "Cohesive narrative — clinical, scholarly, and service tell one story",
        ],
        placeholder:
          "Leadership contributions include… Mentorship of [N] trainees has resulted in…",
      },
      {
        id: "ps_trajectory",
        title: "Trajectory & Closing",
        subtitle: "Next 5–10 years",
        targetWords: 150,
        prompts: [
          "Where heading; resources or collaborations needed",
          "Forward-looking momentum and purpose",
        ],
        placeholder:
          "Over the next decade, I will [build/lead/expand]…",
      },
    ],
  },
  mid_career: {
    purpose: "Full professor promotion, division leadership, endowed chair, major grants",
    targetWords: 1400,
    sections: [
      {
        id: "ps_leadership_philosophy",
        title: "Leadership Philosophy",
        subtitle: "Principles guiding your work",
        targetWords: 175,
        prompts: [
          "Philosophy of clinical care, education, or research leadership",
          "Authoritative but not self-congratulatory tone",
        ],
        placeholder:
          "My approach to [clinical/education/research] leadership is grounded in…",
      },
      {
        id: "ps_career_arc",
        title: "Career Arc",
        subtitle: "Inflection points",
        targetWords: 175,
        prompts: [
          "High-level trajectory with inflection points: pivotal grant, program built, innovation, leadership transition",
        ],
        placeholder:
          "My career arc from [early focus] to [current focus] was shaped by…",
      },
      {
        id: "ps_signature_contributions",
        title: "Signature Contributions",
        subtitle: "Centerpiece — 2–3 major contributions",
        targetWords: 300,
        prompts: [
          "Research that changed practice; clinical program built; educational innovation with outcomes; national initiative led",
          "Focus on impact — what changed because of your work?",
        ],
        placeholder:
          "Three contributions define my mid-career impact: First… Second… Third…",
      },
      {
        id: "ps_mentorship_legacy",
        title: "Mentorship & Legacy Building",
        subtitle: "Next generation and culture",
        targetWords: 200,
        prompts: [
          "Mentees who went on to independent careers",
          "Culture you have built; acknowledge collaborators and teams",
        ],
        placeholder:
          "I have mentored [N] faculty and trainees, including [names/outcomes where appropriate]…",
      },
      {
        id: "ps_national_impact",
        title: "National / International Impact",
        subtitle: "Society, guidelines, policy",
        targetWords: 175,
        prompts: [
          "Society leadership, guidelines, editorial boards, lectureships, policy influence",
          "Breadth: local, regional, national, international",
        ],
        placeholder:
          "At the national level, I contribute through…",
      },
      {
        id: "ps_future_vision_mid",
        title: "Future Vision",
        subtitle: "Next chapter — continued ambition",
        targetWords: 150,
        prompts: [
          "What remains to be done; next chapter with continued relevance",
          "For leadership roles: vision, team-building, strategic thinking",
        ],
        placeholder:
          "The next chapter focuses on…",
      },
    ],
  },
  legacy_attending: {
    purpose: "Named lectureships, lifetime achievement, emeritus, reflective essays",
    targetWords: 1600,
    sections: [
      {
        id: "ps_reflective_opening",
        title: "Reflective Opening",
        subtitle: "Philosophical — what drew you to medicine",
        targetWords: 175,
        prompts: [
          "What drew you to medicine and how the field evolved during your career",
          "Storytelling and reflection take precedence over metrics at this stage",
        ],
        placeholder:
          "When I entered medicine, [field] looked different. What drew me then — and still drives me — is…",
      },
      {
        id: "ps_career_three_acts",
        title: "Career in Three Acts",
        subtitle: "Foundation · Building · Harvest",
        targetWords: 275,
        prompts: [
          "Foundation: training and early career questions",
          "Building: programs, discoveries, movements you led",
          "Harvest: synthesis, mentees carrying work forward, lasting changes",
        ],
        placeholder:
          "Act I — Foundation… Act II — Building… Act III — Harvest…",
      },
      {
        id: "ps_defining_contributions",
        title: "Defining Contributions",
        subtitle: "3–5 landmarks for the field",
        targetWords: 250,
        prompts: [
          "Landmark contributions as advances for patients or the field — not just personal achievements",
          "Select the most meaningful; avoid exhaustive lists",
        ],
        placeholder:
          "The contributions I hope endure include…",
      },
      {
        id: "ps_the_people",
        title: "The People",
        subtitle: "Mentors, mentees, community",
        targetWords: 200,
        prompts: [
          "Mentors who shaped you; mentees who carry the torch; community you built",
          "Be generous crediting others — reflects confidence",
        ],
        placeholder:
          "I was shaped by mentors including… The work continues through mentees such as…",
      },
      {
        id: "ps_lessons_learned",
        title: "Lessons Learned",
        subtitle: "Wisdom for the next generation",
        targetWords: 150,
        prompts: [
          "What you know now that you wish you'd known earlier",
          "What you would do differently — adds authenticity",
        ],
        placeholder:
          "If I could offer one lesson to the next generation, it would be…",
      },
      {
        id: "ps_ongoing_work",
        title: "Ongoing & Future Work",
        subtitle: "Continued engagement",
        targetWords: 125,
        prompts: [
          "Emeritus research, advisory roles, writing, advocacy, global health",
        ],
        placeholder:
          "Even now, I remain engaged in…",
      },
      {
        id: "ps_closing_reflection",
        title: "Closing Reflection",
        subtitle: "Full circle to earliest motivations",
        targetWords: 125,
        prompts: [
          "Connect earliest motivations to lasting impact",
          "What you want to be remembered for",
        ],
        placeholder:
          "From [earliest motivation] to [lasting impact], my career has been about…",
      },
    ],
  },
};

/** Specialty keys are lowercase substrings matched against user specialty. */
export const SPECIALTY_PERSONAL_STATEMENT_GUIDES: Record<string, SpecialtyPersonalStatementGuide> = {
  "family medicine": {
    label: "Family Medicine",
    emphasize: ["Breadth", "continuity of care", "community engagement", "preventive medicine", "health equity"],
    uniqueAngle: "Intellectual challenge of undifferentiated patients; comfort with ambiguity across the life cycle",
    avoid: ["Framing FM as a backup or default choice"],
    strongOpeners: ["A longitudinal patient relationship", "a home visit", "a community health project"],
    toneNote: "Value generalism as a deliberate, principled choice",
  },
  "internal medicine": {
    label: "Internal Medicine",
    emphasize: ["Diagnostic reasoning", "pathophysiology", "complexity", "multisystem disease"],
    uniqueAngle: "Solving diagnostic puzzles; managing medically complex patients; internist as the doctor's doctor",
    avoid: ["Vague career plans — state subspecialty, hospitalist, primary care, or academic general medicine direction"],
    strongOpeners: ["A challenging diagnostic case", "clinical reasoning that changed a trajectory"],
  },
  pediatrics: {
    label: "Pediatrics",
    emphasize: ["Advocacy", "developmental perspective", "family-centered care", "health disparities in children"],
    uniqueAngle: "Shaping health trajectories from birth; intersection of medicine and child development",
    avoid: ["'I love kids' as primary motivation — go deeper intellectually and emotionally"],
    strongOpeners: ["A NICU encounter", "a child's resilience", "an advocacy moment"],
  },
  "emergency medicine": {
    label: "Emergency Medicine",
    emphasize: ["Decisiveness", "procedural skill", "undifferentiated patients", "team-based care", "social determinants"],
    uniqueAngle: "ER as safety net; high-stakes decisions with incomplete information",
    avoid: ["Adrenaline-junkie narratives — lead with intellectual and humanistic dimensions"],
    strongOpeners: ["A critical resuscitation", "calm in chaos", "unexpected ED diagnosis"],
  },
  anesthesiology: {
    label: "Anesthesiology",
    emphasize: ["Physiology", "pharmacology", "crisis management", "perioperative medicine"],
    uniqueAngle: "Silent guardian responsible for life while surgery proceeds; science and vigilance",
    avoid: ["Minimizing the specialty as 'behind the scenes'"],
    strongOpeners: ["Critical airway", "intraoperative crisis", "pharmacologic precision"],
  },
  "general surgery": {
    label: "General Surgery",
    emphasize: ["Technical skill", "decision-making", "leadership", "breadth of pathology"],
    uniqueAngle: "Surgeon as diagnostician and therapist — trusted with the patient's body",
    avoid: ["Glorifying long hours or suffering"],
    strongOpeners: ["Pivotal operation", "trauma activation", "surgical decision-making moment"],
  },
  "orthopedic surgery": {
    label: "Orthopedic Surgery",
    emphasize: ["Biomechanics", "functional restoration", "musculoskeletal anatomy", "quality of life"],
    uniqueAngle: "Restoring mobility; tangible outcomes; intersection of engineering and biology",
    avoid: ["Making it only about sports — include trauma, oncology, spine, arthroplasty"],
    strongOpeners: ["Complex fracture", "patient returning to activity"],
  },
  neurosurgery: {
    label: "Neurosurgery",
    emphasize: ["Neuroanatomy", "technical precision", "high-stakes decisions", "innovation", "humility"],
    uniqueAngle: "Operating on the organ that defines personhood",
    avoid: ["Hubris — value teamwork and intellectual curiosity"],
    strongOpeners: ["Craniotomy revealing neuroanatomy", "spine case restoring function"],
  },
  neurology: {
    label: "Neurology",
    emphasize: ["Localization", "stroke", "epilepsy", "neurodegeneration", "therapeutic revolution"],
    uniqueAngle: "Neurologic exam as elegant diagnostic tool; stroke, MS, and neurogenetics advances",
    avoid: ["Nihilism — emphasize therapeutic options today"],
    strongOpeners: ["Localization leading to diagnosis", "stroke intervention", "rare finding"],
  },
  psychiatry: {
    label: "Psychiatry",
    emphasize: ["Neuroscience", "psychotherapy", "addiction", "consultation-liaison", "health equity"],
    uniqueAngle: "Intersection of brain and mind; therapeutic relationship as tool",
    avoid: ["Overemphasizing personal mental health — focus on patients; brief mention OK if it informs clinical view"],
    strongOpeners: ["Therapeutic breakthrough", "patient recovery", "psychiatric interview connection"],
  },
  radiology: {
    label: "Radiology",
    emphasize: ["Anatomy", "pattern recognition", "clinical correlation", "AI integration"],
    uniqueAngle: "Radiologist sees every patient; integrates imaging with clinical context",
    avoid: ["'I'm a visual learner' as primary motivation"],
    strongOpeners: ["Finding that changed diagnosis", "pattern recognition moment"],
  },
  pathology: {
    label: "Pathology",
    emphasize: ["Diagnostic accuracy", "molecular pathology", "genomics", "definitive diagnosis"],
    uniqueAngle: "Pathologist as doctor's doctor; molecular revolution",
    avoid: ["Framing as avoiding patients — many pathologists collaborate clinically"],
    strongOpeners: ["Diagnosis that changed treatment", "molecular finding guiding therapy"],
  },
  dermatology: {
    label: "Dermatology",
    emphasize: ["Pattern recognition", "dermatopathology", "skin cancer", "health disparities in skin of color"],
    uniqueAngle: "Skin as window to systemic disease; dermato-oncology growth",
    avoid: ["Lifestyle-focused statements — lead with intellectual and clinical passion"],
    strongOpeners: ["Skin finding revealing systemic disease", "melanoma caught early"],
  },
  "obstetrics and gynecology": {
    label: "Obstetrics & Gynecology",
    emphasize: ["Women's health advocacy", "surgical skill", "reproductive health", "health equity"],
    uniqueAngle: "Surgeon and primary care provider; presence at transformative life moments",
    strongOpeners: ["Delivery", "gynecologic surgery", "patient advocacy moment"],
  },
  "ob/gyn": {
    label: "Obstetrics & Gynecology",
    emphasize: ["Women's health advocacy", "surgical skill", "reproductive health", "health equity"],
    uniqueAngle: "Surgeon and primary care provider; presence at transformative life moments",
    avoid: ["Lifestyle-only framing"],
    strongOpeners: ["Delivery", "high-risk obstetric case", "advocacy moment"],
  },
  "radiation oncology": {
    label: "Radiation Oncology",
    emphasize: ["Cancer biology", "physics", "SBRT/brachytherapy", "multidisciplinary care"],
    uniqueAngle: "Physicist and physician; precision of modern radiation; longitudinal cancer relationships",
    strongOpeners: ["Treatment response", "complex plan", "interdisciplinary collaboration"],
  },
  "palliative care": {
    label: "Palliative Care / Hospice",
    emphasize: ["Symptom management", "goals-of-care", "interdisciplinary teamwork", "communication as procedure"],
    uniqueAngle: "Adds life to days; integration across all specialties",
    strongOpeners: ["Goals-of-care conversation", "symptom relief moment", "family meeting"],
  },
  "hospice": {
    label: "Palliative Care / Hospice",
    emphasize: ["Symptom management", "goals-of-care", "family support", "equity at end of life"],
    uniqueAngle: "Communication skill as core procedural competency",
    avoid: ["Framing as 'giving up' on patients"],
    strongOpeners: ["Family meeting that changed trajectory"],
  },
  cardiology: {
    label: "Cardiology",
    emphasize: ["Hemodynamics", "imaging", "intervention", "heart failure", "prevention"],
    uniqueAngle: "Integrating physiology, imaging, and real-time intervention",
    strongOpeners: ["STEMI activation", "echo finding changing management"],
  },
  "infectious disease": {
    label: "Infectious Disease",
    emphasize: ["Microbiology", "stewardship", "HIV", "global health", "diagnostic reasoning"],
    uniqueAngle: "Ultimate diagnostician; individual care and public health intersection",
    strongOpeners: ["Diagnostic mystery solved", "HIV transformation on ART"],
  },
  "global health": {
    label: "Global Health / Humanitarian Medicine",
    emphasize: ["Health equity", "capacity building", "cultural humility", "sustainable partnerships"],
    uniqueAngle: "Building systems, not just providing care",
    avoid: ["Voluntourism narratives — emphasize partnership and humility"],
    strongOpeners: ["Clinical challenge in resource-limited setting", "capacity-building success"],
  },
};

const CATEGORY_FALLBACKS: Record<string, SpecialtyPersonalStatementGuide> = {
  surgery: {
    label: "Surgical Specialty",
    emphasize: ["Technical skill", "decision-making", "team leadership", "outcomes"],
    uniqueAngle: "Direct ability to fix what is broken; privilege of operative trust",
    avoid: ["'I like working with my hands' as endpoint — go deeper"],
    strongOpeners: ["Operative decision", "trauma or complex case"],
    toneNote: "Value directness and confidence; show humility and teamwork",
  },
  pediatric: {
    label: "Pediatric Specialty",
    emphasize: ["Developmental considerations", "family dynamics", "advocacy", "transition to adult care"],
    uniqueAngle: "Unique pathophysiology of childhood disease; family-centered care",
    avoid: ["'I love kids' without intellectual depth"],
    strongOpeners: ["Family-centered clinical moment", "developmental insight"],
  },
  primary_care: {
    label: "Primary Care",
    emphasize: ["Continuity", "prevention", "whole-person care", "community"],
    uniqueAngle: "Longitudinal relationships and undifferentiated presentations",
    avoid: ["Framing as less specialized or default"],
    strongOpeners: ["Longitudinal patient story", "preventive impact"],
  },
};

export function getPersonalStatementSections(
  stageId: CareerNarrativeStageId,
): CareerNarrativeSection[] {
  return PERSONAL_STATEMENT_STAGES[stageId]?.sections ?? PERSONAL_STATEMENT_STAGES.med_student.sections;
}

export function personalStatementSectionById(
  sectionId: string,
): CareerNarrativeSection | undefined {
  for (const stage of Object.values(PERSONAL_STATEMENT_STAGES)) {
    const found = stage.sections.find((s) => s.id === sectionId);
    if (found) return found;
  }
  return undefined;
}

export function normalizeSpecialtyKey(specialty?: string | null): string {
  return (specialty ?? "").trim().toLowerCase();
}

export function resolveSpecialtyGuide(specialty?: string | null): SpecialtyPersonalStatementGuide | null {
  const key = normalizeSpecialtyKey(specialty);
  if (!key) return null;

  for (const [pattern, guide] of Object.entries(SPECIALTY_PERSONAL_STATEMENT_GUIDES)) {
    if (key.includes(pattern) || pattern.includes(key)) return guide;
  }

  if (/pediatric|child|neonat|adolescent/.test(key)) return CATEGORY_FALLBACKS.pediatric!;
  if (/surgery|surgical|ortho|urology|otolaryngology|ent|plastics|vascular|cardiothoracic|transplant|trauma|colorectal|hand surgery/.test(key)) {
    return CATEGORY_FALLBACKS.surgery!;
  }
  if (/family medicine|internal medicine primary|primary care|med-peds|med peds/.test(key)) {
    return CATEGORY_FALLBACKS.primary_care!;
  }

  return null;
}

export function buildSpecialtyPromptLines(guide: SpecialtyPersonalStatementGuide): string[] {
  return [
    `[${guide.label}] Emphasize: ${guide.emphasize.join(", ")}`,
    `[${guide.label}] Unique angle: ${guide.uniqueAngle}`,
    `[${guide.label}] Avoid: ${(guide.avoid ?? []).join("; ") || "specialty clichés"}`,
    `[${guide.label}] Strong opener ideas: ${guide.strongOpeners.join("; ")}`,
    ...(guide.toneNote ? [`[${guide.label}] Tone: ${guide.toneNote}`] : []),
  ];
}

export function buildPersonalStatementMakContext(input: {
  stageId: CareerNarrativeStageId;
  specialty?: string | null;
  sectionTitle?: string;
}): string {
  const stage = PERSONAL_STATEMENT_STAGES[input.stageId];
  const guide = resolveSpecialtyGuide(input.specialty);
  const sectionNote = input.sectionTitle ? `Current section: ${input.sectionTitle}.` : "";

  return `Personal statement — ${input.stageId.replace(/_/g, " ")}.
Purpose: ${stage?.purpose ?? "Training or career application"}.
Target length: ~${stage?.targetWords ?? 900} words total.
${sectionNote}
Universal principles: ${PERSONAL_STATEMENT_UNIVERSAL_TIPS.join("; ")}
${guide ? `Specialty (${guide.label}): ${guide.uniqueAngle}. Avoid: ${(guide.avoid ?? []).join("; ") || "specialty clichés"}.` : "Research specialty culture — match tone to field."}
One narrative thread. Show don't tell. Do not summarize CV. One section at a time.
Never cite framework names. Use captured reflections and specific de-identified examples.`;
}

export function prefillPersonalStatementSection(
  sectionId: string,
  ctx: { stageId: CareerNarrativeStageId; specialty?: string | null },
): string {
  const section = personalStatementSectionById(sectionId);
  const guide = resolveSpecialtyGuide(ctx.specialty);
  const specialty = ctx.specialty ?? "my chosen specialty";

  if (sectionId === "ps_hook" || sectionId === "ps_opening_narrative") {
    const opener = guide?.strongOpeners[0] ?? "a formative clinical moment";
    return `[Describe ${opener} in ${specialty} — specific, vivid, de-identified. Avoid clichés.]`;
  }
  if (sectionId === "ps_why_specialty" || sectionId === "ps_why_program") {
    return `What draws me to ${specialty} is [specific intellectual/clinical/population reason linked to your opening]…`;
  }
  return section?.placeholder ?? "";
}

export function assembleFullPersonalStatement(
  stageId: CareerNarrativeStageId,
  sections: { section: string; content: string | null }[],
): string {
  const defs = getPersonalStatementSections(stageId);
  return defs
    .map((def) => {
      const row = sections.find((s) => s.section === def.id);
      const body = row?.content?.trim() || "[Draft pending]";
      return `${def.title}\n\n${body}`;
    })
    .join("\n\n---\n\n");
}

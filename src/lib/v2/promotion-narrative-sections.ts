/**
 * Academic promotion narrative templates — standard + four track-specific variants.
 * Powers PromotionNarrativeWizard, dossier API, and output prefill.
 */

export type PromotionTrackId =
  | "standard"
  | "clinician_educator"
  | "clinician_scientist"
  | "clinical_excellence"
  | "clinician_educator_administrator";

export type PromotionNarrativeSection = {
  id: string;
  title: string;
  subtitle: string;
  targetWords: number;
  prompts: string[];
  placeholder: string;
  emphasis?: "primary" | "secondary";
};

export type PromotionTrackDefinition = {
  id: PromotionTrackId;
  label: string;
  dossierLabel: string;
  primaryDomain: string;
  typicalLength: string;
  tone: string;
  sections: PromotionNarrativeSection[];
  trackTips: string[];
};

const STANDARD_SECTIONS: PromotionNarrativeSection[] = [
  {
    id: "introduction",
    title: "Introduction & Professional Identity",
    subtitle: "½–1 page · your niche and narrative arc",
    targetWords: 250,
    emphasis: "primary",
    prompts: [
      "Current role, rank, department, and institution",
      "Thematic niche that unifies teaching, scholarship, clinical, and service",
      "Academic philosophy — what drives your work",
      "Promotion rank and track sought",
    ],
    placeholder:
      "Since joining the faculty in [year], I have built an academic career centered on [niche]. I am nominated for promotion to [target rank] on the [track] pathway…",
  },
  {
    id: "education_teaching",
    title: "Education & Teaching",
    subtitle: "1–1.5 pages · impact, not activity lists",
    targetWords: 400,
    prompts: [
      "What you teach, to whom, and at what volume (learner levels, hours, settings)",
      "Scholarly approach — evidence-informed methods, not just hours logged",
      "Curriculum development and dissemination beyond your institution",
      "Mentoring outcomes — publications, awards, career trajectories",
      "Teaching evaluations, awards, and measurable learner impact",
    ],
    placeholder:
      "My approach to teaching emphasizes [philosophy]. I teach across [learner levels] in [settings], delivering approximately [hours] annually…",
  },
  {
    id: "research_scholarship",
    title: "Research & Scholarship",
    subtitle: "½–1 page · scholarly arc, not a CV rehash",
    targetWords: 350,
    prompts: [
      "Scholarly arc connecting publications, grants, and products to your niche",
      "3–5 key works — significance, citations, adoption, or practice change",
      "Non-traditional scholarship (curricula, tools, MedEdPORTAL, podcasts)",
      "Your role in collaborative work (conception vs. contribution)",
      "Future research or scholarship direction",
    ],
    placeholder:
      "My scholarship reflects a focused program in [thematic area]. Representative work includes…",
  },
  {
    id: "clinical_excellence",
    title: "Clinical Excellence",
    subtitle: "¼–½ page (1–2 pages on clinical excellence track)",
    targetWords: 250,
    prompts: [
      "Scope, complexity, and setting of clinical practice",
      "How clinical work informs your academic mission",
      "Clinical innovations, QI projects, and patient safety contributions",
      "Outcomes metrics, peer recognition, or patient satisfaction",
    ],
    placeholder:
      "I maintain active clinical practice in [specialty/setting], with emphasis on [scope]. Clinical work informs my [teaching/research] by…",
  },
  {
    id: "service_leadership",
    title: "Service & Leadership",
    subtitle: "½ page · impact at each level",
    targetWords: 250,
    prompts: [
      "Institutional service — committees, program leadership, governance",
      "Regional, national, or international roles — societies, editorial boards, study sections",
      "What you accomplished in each role, not just membership",
      "Community engagement or advocacy, if relevant",
    ],
    placeholder:
      "Institutional service includes [roles with outcomes]. At the national level, I contribute…",
  },
  {
    id: "future_vision",
    title: "Summary & Future Vision",
    subtitle: "¼–½ page · synthesis and forward trajectory",
    targetWords: 200,
    prompts: [
      "Synthesis of how contributions meet promotion criteria for the rank sought",
      "Forward-looking goals for the next 3–5 years",
      "How your niche will grow in scope and impact",
      "Alignment with department and institutional mission",
    ],
    placeholder:
      "Taken together, my contributions demonstrate readiness for [target rank]. Over the next five years, I will…",
  },
];

const CLINICIAN_EDUCATOR_SECTIONS: PromotionNarrativeSection[] = [
  {
    id: "ce_introduction",
    title: "Introduction & Overview",
    subtitle: "Establish clinician-educator identity and promotion case",
    targetWords: 200,
    emphasis: "primary",
    prompts: [
      "Nomination from current rank to proposed rank, department, and institution",
      "Year joined faculty and thematic identity as a clinician-educator",
      "Unifying narrative arc across teaching, scholarship, clinical care, and service",
    ],
    placeholder:
      "[Name] is nominated for promotion from [current rank] to [proposed rank] in [department] at [institution]. Since joining in [year], I have established myself as a clinician-educator whose contributions span…",
  },
  {
    id: "ce_teaching_impact",
    title: "Teaching & Educational Impact",
    subtitle: "Primary domain · 1–2 pages",
    targetWords: 450,
    emphasis: "primary",
    prompts: [
      "Direct teaching roles (course director, clerkship director, attending) and learner levels",
      "Teaching volume — hours annually, longitudinal relationships, settings",
      "Curriculum development and innovation — need, design, implementation, adoption",
      "Mentoring — number of mentees, outcomes (publications, awards, career advancement)",
      "Teaching evaluations (percentile vs. peers) and awards with years",
    ],
    placeholder:
      "I serve as [role(s)] teaching [learner levels]. Key contributions include approximately [hours] of didactic and clinical teaching annually…",
  },
  {
    id: "ce_education_scholarship",
    title: "Scholarship in Education",
    subtitle: "Peer-reviewed educational scholarship · 1 page",
    targetWords: 350,
    emphasis: "primary",
    prompts: [
      "Thematic focus of educational scholarship (simulation, assessment, clinical reasoning, equity)",
      "Publications — count, first/senior author works, key citations with impact",
      "Presentations at national meetings (AAMC, SGIM, specialty MedEd venues)",
      "Educational grants and funded projects with role and amounts",
      "Editorial board or peer review roles in education journals",
    ],
    placeholder:
      "My scholarly work reflects a focused program in [thematic area]. I have authored [number] peer-reviewed publications, including…",
  },
  {
    id: "ce_clinical",
    title: "Clinical Excellence",
    subtitle: "Supporting domain · 1 paragraph",
    targetWords: 200,
    prompts: [
      "Active clinical practice scope and setting",
      "How clinical excellence supports credibility as a clinician-educator",
      "Clinical innovations or QI relevant to teaching",
      "Board certification and maintenance",
    ],
    placeholder:
      "I maintain active clinical practice in [specialty], providing [scope]. Clinical excellence is integral to my identity as a clinician-educator…",
  },
  {
    id: "ce_service",
    title: "Service & Leadership",
    subtitle: "Institutional and national · 1 page",
    targetWords: 250,
    prompts: [
      "Institutional committees and leadership roles with accomplishments",
      "Regional and national society roles, workshop facilitation, abstract review",
      "Contributions to diversity, equity, and inclusion in education, if applicable",
    ],
    placeholder:
      "Institutional service includes [committees and leadership]. At the national level…",
  },
  {
    id: "ce_future",
    title: "Future Directions",
    subtitle: "Forward-looking · 1 paragraph",
    targetWords: 150,
    prompts: [
      "2–3 goals for the next 3–5 years (funding, leadership, national dissemination)",
      "Next phase of your educational niche",
    ],
    placeholder:
      "I plan to build on current work by [goals], expanding impact in [thematic area]…",
  },
  {
    id: "ce_summary",
    title: "Summary",
    subtitle: "Closing recommendation · 1 paragraph",
    targetWords: 150,
    prompts: [
      "Synthesis of sustained contributions across teaching, scholarship, clinical, and service",
      "Explicit statement that criteria for proposed rank are met",
    ],
    placeholder:
      "In summary, I have made sustained contributions as a clinician-educator and meet the criteria for promotion to [proposed rank]…",
  },
];

const CLINICIAN_SCIENTIST_SECTIONS: PromotionNarrativeSection[] = [
  {
    id: "cs_introduction",
    title: "Introduction & Overview",
    subtitle: "Independent investigator identity",
    targetWords: 200,
    emphasis: "primary",
    prompts: [
      "Nomination for promotion with tenure (if applicable), department, institution",
      "Research area and national recognition established since joining faculty",
      "Central research question your program addresses",
    ],
    placeholder:
      "[Name] is nominated for promotion to [proposed rank] [with tenure] in [department]. I have established an independent research program in [area] with national recognition…",
  },
  {
    id: "cs_research",
    title: "Research & Scholarship",
    subtitle: "Primary domain · 2–3 pages",
    targetWords: 550,
    emphasis: "primary",
    prompts: [
      "Research program focus, methods, and evolution over time",
      "2–3 landmark findings and significance to the field",
      "Extramural funding — grants as PI/Co-PI, funder, amounts, years",
      "Publications — count, first/senior author, h-index, key citations with impact",
      "Invited lectures, editorial boards, study sections, and research awards",
    ],
    placeholder:
      "My research program focuses on [thematic area], addressing [central question] using [methods]. Key contributions include…",
  },
  {
    id: "cs_teaching_mentoring",
    title: "Teaching & Mentoring",
    subtitle: "Secondary domain · ½–1 page",
    targetWords: 250,
    prompts: [
      "Teaching roles — graduate courses, seminars, clinical teaching",
      "Trainees mentored — postdocs, graduate students, residents, medical students",
      "Mentee outcomes — K awards, faculty positions, publications",
    ],
    placeholder:
      "Although research is my primary mission, I contribute meaningfully to education through…",
  },
  {
    id: "cs_clinical",
    title: "Clinical Activity",
    subtitle: "If applicable · ½ page",
    targetWords: 150,
    prompts: [
      "Clinical effort (weeks of service, continuity clinic)",
      "How clinical activity informs translational research",
    ],
    placeholder:
      "I maintain [clinical effort], which informs my research by connecting bedside questions to…",
  },
  {
    id: "cs_service",
    title: "Service & Leadership",
    subtitle: "Institutional and national · ½ page",
    targetWords: 200,
    prompts: [
      "Institutional committees (IRB, faculty senate, search committees)",
      "NIH study sections, journal editorial boards, society committees",
    ],
    placeholder:
      "Service contributions include [institutional roles] and [national roles]…",
  },
  {
    id: "cs_summary",
    title: "Summary",
    subtitle: "1 paragraph",
    targetWords: 150,
    prompts: [
      "Independent, externally funded program with national recognition",
      "Combined mentoring, teaching, and service meet criteria for proposed rank",
    ],
    placeholder:
      "I have established an independent, externally funded research program in [field] and meet criteria for promotion to [proposed rank]…",
  },
];

const CLINICAL_EXCELLENCE_SECTIONS: PromotionNarrativeSection[] = [
  {
    id: "cx_introduction",
    title: "Introduction & Overview",
    subtitle: "Clinical excellence track identity",
    targetWords: 200,
    emphasis: "primary",
    prompts: [
      "Nomination on Clinical Excellence track, department, institution",
      "Distinguished record in clinical care, innovation, and quality",
    ],
    placeholder:
      "[Name] is nominated for promotion on the Clinical Excellence track, distinguished through outstanding patient care and clinical innovation…",
  },
  {
    id: "cx_clinical_primary",
    title: "Clinical Excellence",
    subtitle: "Primary domain · 1.5–2 pages",
    targetWords: 500,
    emphasis: "primary",
    prompts: [
      "Clinical practice scope — volume, complexity, unique expertise",
      "Measurable outcomes — complication rates, satisfaction, readmissions, benchmarks",
      "Clinical innovations and QI projects with scope of impact",
      "Patient safety contributions — protocols, RCA, safety culture",
      "Board certification and maintenance of certification",
    ],
    placeholder:
      "I maintain a [high-volume/complex] practice in [setting], performing approximately [volume]. Clinical outcomes include…",
  },
  {
    id: "cx_scholarship",
    title: "Scholarship",
    subtitle: "QI and clinical scholarship · ½–1 page",
    targetWords: 250,
    prompts: [
      "Peer-reviewed publications — case series, reviews, QI reports, guidelines",
      "Book chapters, clinical manuals, or practice guidelines",
      "Presentations at regional and national meetings",
    ],
    placeholder:
      "While clinical care is my primary mission, I contribute to scholarship through…",
  },
  {
    id: "cx_teaching",
    title: "Teaching",
    subtitle: "Bedside and didactic · ½ page",
    targetWords: 200,
    prompts: [
      "Bedside and procedural teaching of trainees",
      "Grand rounds, case conferences, CME contributions",
      "Teaching evaluations and awards",
    ],
    placeholder:
      "I teach in the course of clinical duties through bedside teaching and [didactic roles]…",
  },
  {
    id: "cx_service",
    title: "Service & Leadership",
    subtitle: "Clinical leadership · ½–1 page",
    targetWords: 250,
    prompts: [
      "Clinical leadership — division chief, medical director, quality committee chair",
      "Specialty society committees, guideline panels, board examiner roles",
    ],
    placeholder:
      "Clinical leadership roles include [positions]. Institutional service includes…",
  },
  {
    id: "cx_summary",
    title: "Summary",
    subtitle: "1 paragraph",
    targetWords: 150,
    prompts: [
      "Exemplifies clinical excellence through outcomes, innovation, and leadership",
      "Meets criteria for proposed rank on Clinical Excellence track",
    ],
    placeholder:
      "I exemplify clinical excellence through outstanding patient care, measurable quality outcomes, and leadership…",
  },
];

const CLINICIAN_EDUCATOR_ADMIN_SECTIONS: PromotionNarrativeSection[] = [
  {
    id: "cea_introduction",
    title: "Introduction & Overview",
    subtitle: "Educational leadership identity",
    targetWords: 200,
    emphasis: "primary",
    prompts: [
      "Nomination on Clinician-Educator-Administrator track",
      "Combination of teaching, program administration, and educational scholarship",
    ],
    placeholder:
      "[Name] is nominated for promotion on the Clinician-Educator-Administrator track, established as a leader in medical education through program administration and scholarship…",
  },
  {
    id: "cea_ed_leadership",
    title: "Educational Leadership & Administration",
    subtitle: "Primary domain · 1.5 pages",
    targetWords: 450,
    emphasis: "primary",
    prompts: [
      "Program leadership roles (PD, clerkship director, simulation director) and tenure in role",
      "Program outcomes — match rates, board pass rates, accreditation, growth",
      "Operational innovations — scheduling, evaluation platforms, competency-based assessment",
      "Management scope — trainees, faculty, budget",
      "LCME, ACGME, or accreditation contributions and outcomes",
    ],
    placeholder:
      "I serve as [administrative role(s)] since [year]. Key accomplishments under my leadership include…",
  },
  {
    id: "cea_teaching_mentoring",
    title: "Direct Teaching & Mentoring",
    subtitle: "Active teaching alongside administration · ½–1 page",
    targetWords: 250,
    prompts: [
      "Bedside teaching, small groups, lectures maintained alongside admin duties",
      "Mentoring — number and outcomes of mentees",
      "Teaching evaluations and awards",
    ],
    placeholder:
      "In addition to administrative roles, I maintain active teaching through…",
  },
  {
    id: "cea_education_scholarship",
    title: "Scholarship in Education",
    subtitle: "Program evaluation and leadership scholarship · 1 page",
    targetWords: 300,
    emphasis: "primary",
    prompts: [
      "Thematic focus — competency-based assessment, program evaluation, simulation, wellness",
      "Publications, presentations, and educational grants",
      "Editorial and peer review activities",
    ],
    placeholder:
      "My scholarly work reflects a focus on [thematic area], including [publications and grants]…",
  },
  {
    id: "cea_clinical",
    title: "Clinical Activity",
    subtitle: "Supporting credibility · 1 paragraph",
    targetWords: 150,
    prompts: [
      "Clinical practice scope supporting educator/administrator credibility",
    ],
    placeholder:
      "I maintain clinical practice in [specialty], supporting credibility as an educator and administrator…",
  },
  {
    id: "cea_service",
    title: "Service",
    subtitle: "Institutional and national · ½ page",
    targetWords: 200,
    prompts: [
      "Institutional committees and task forces beyond primary admin role",
      "ACGME, AAMC, or specialty society education committee roles",
      "DEI contributions if relevant to institutional criteria",
    ],
    placeholder:
      "Additional service includes [institutional and national roles]…",
  },
  {
    id: "cea_summary",
    title: "Summary",
    subtitle: "1 paragraph",
    targetWords: 150,
    prompts: [
      "Sustained excellence in educational leadership with programmatic impact",
      "Meets criteria for proposed rank on Clinician-Educator-Administrator track",
    ],
    placeholder:
      "I have demonstrated sustained excellence in educational leadership, combining program management with teaching, scholarship, and clinical care…",
  },
];

export const PROMOTION_TRACKS: PromotionTrackDefinition[] = [
  {
    id: "standard",
    label: "Standard (All Domains)",
    dossierLabel: "Standard",
    primaryDomain: "Balanced across teaching, scholarship, clinical, and service",
    typicalLength: "3–5 pages single-spaced",
    tone: "Professional, first person, confident but not boastful",
    sections: STANDARD_SECTIONS,
    trackTips: [
      "Tell a coherent story with a unifying niche — not a list of unrelated activities",
      "Show impact in every section; mirror your institution's promotion criteria language",
      "Distinguish scholarship from teaching — educational work should be studied and disseminated",
    ],
  },
  {
    id: "clinician_educator",
    label: "Clinician-Educator",
    dossierLabel: "Clinician-Educator",
    primaryDomain: "Teaching impact and educational scholarship",
    typicalLength: "3–5 pages single-spaced",
    tone: "Emphasize scholarly approach to teaching — intentional, evidence-informed, reflective",
    sections: CLINICIAN_EDUCATOR_SECTIONS,
    trackTips: [
      "Identify a focused thematic identity (e.g., simulation educator, clinical reasoning expert)",
      "Quantify teaching hours, mentee outcomes, evaluation percentiles, and curriculum adoption",
      "Educational scholarship must be peer-reviewed and disseminated — not just delivery",
    ],
  },
  {
    id: "clinician_scientist",
    label: "Clinician-Scientist (Tenure)",
    dossierLabel: "Clinician-Scientist",
    primaryDomain: "Independent, externally funded research and national reputation",
    typicalLength: "4–6 pages single-spaced",
    tone: "Lead with research program maturity, funding, and field impact",
    sections: CLINICIAN_SCIENTIST_SECTIONS,
    trackTips: [
      "Publications, grant funding, and h-index are primary currency",
      "Demonstrate independent extramural funding (e.g., R01) and landmark findings",
      "Teaching and clinical sections are secondary but should show meaningful contribution",
    ],
  },
  {
    id: "clinical_excellence",
    label: "Clinical Excellence",
    dossierLabel: "Clinical Excellence",
    primaryDomain: "Measurable clinical impact, innovation, and peer recognition",
    typicalLength: "3–5 pages single-spaced",
    tone: "Lead with clinical outcomes, quality metrics, and patient safety impact",
    sections: CLINICAL_EXCELLENCE_SECTIONS,
    trackTips: [
      "Use benchmarked outcomes — satisfaction, complications, readmissions, volume",
      "QI and patient safety scholarship may suffice; bench research is not expected",
      "Clinical leadership roles strengthen the case for senior ranks",
    ],
  },
  {
    id: "clinician_educator_administrator",
    label: "Clinician-Educator-Administrator",
    dossierLabel: "Clinician-Educator-Administrator",
    primaryDomain: "Programmatic impact through educational leadership",
    typicalLength: "4–5 pages single-spaced",
    tone: "Show how leadership transformed programs — outcomes, not titles alone",
    sections: CLINICIAN_EDUCATOR_ADMIN_SECTIONS,
    trackTips: [
      "Document program outcomes under your leadership — match rates, accreditation, trainee success",
      "Scholarly approach to administration — program evaluation, innovation, dissemination",
      "Balance admin scope with maintained direct teaching and clinical credibility",
    ],
  },
];

/** @deprecated Use getSectionsForTrack — kept for imports that expect the standard template. */
export const PROMOTION_NARRATIVE_SECTIONS = STANDARD_SECTIONS;

const ALL_SECTIONS: PromotionNarrativeSection[] = PROMOTION_TRACKS.flatMap((t) => t.sections);

const TRACK_ALIASES: Record<string, PromotionTrackId> = {
  standard: "standard",
  general: "standard",
  "clinician-educator": "clinician_educator",
  "clinician educator": "clinician_educator",
  educator: "clinician_educator",
  "clinician-scientist": "clinician_scientist",
  "clinician scientist": "clinician_scientist",
  "physician-scientist": "clinician_scientist",
  "physician scientist": "clinician_scientist",
  "tenure track": "clinician_scientist",
  "clinician-investigator": "clinician_scientist",
  "clinical excellence": "clinical_excellence",
  "clinical-excellence": "clinical_excellence",
  "pure clinician": "clinical_excellence",
  clinician: "clinical_excellence",
  "clinician-educator-administrator": "clinician_educator_administrator",
  "clinician-educator-admin": "clinician_educator_administrator",
  "clinician educator administrator": "clinician_educator_administrator",
};

export function normalizePromotionTrack(input?: string | null): PromotionTrackId {
  if (!input?.trim()) return "clinician_educator";
  const key = input.trim().toLowerCase();
  if (TRACK_ALIASES[key]) return TRACK_ALIASES[key]!;
  const byId = PROMOTION_TRACKS.find((t) => t.id === key);
  if (byId) return byId.id;
  const byLabel = PROMOTION_TRACKS.find(
    (t) => t.label.toLowerCase() === key || t.dossierLabel.toLowerCase() === key,
  );
  if (byLabel) return byLabel.id;
  return "standard";
}

export function getPromotionTrackDefinition(
  trackId: PromotionTrackId,
): PromotionTrackDefinition {
  return PROMOTION_TRACKS.find((t) => t.id === trackId) ?? PROMOTION_TRACKS[1]!;
}

export function getSectionsForTrack(trackId: PromotionTrackId): PromotionNarrativeSection[] {
  return getPromotionTrackDefinition(trackId).sections;
}

export function sectionById(id: string): PromotionNarrativeSection | undefined {
  return ALL_SECTIONS.find((s) => s.id === id);
}

export function completionForSection(content: string, targetWords: number): number {
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  return Math.min(100, Math.round((words / targetWords) * 100));
}

export function assembleFullNarrative(
  sections: { section: string; content: string | null }[],
  trackId: PromotionTrackId = "standard",
): string {
  const defs = getSectionsForTrack(trackId);
  return defs
    .map((def) => {
      const row = sections.find((s) => s.section === def.id);
      const body = row?.content?.trim() || "[Draft pending]";
      return `${def.title}\n\n${body}`;
    })
    .join("\n\n---\n\n");
}

export function prefillSection(
  sectionId: string,
  ctx: {
    target_rank?: string;
    target_track?: string;
    specialty?: string;
    career_stage?: string;
    strengths?: { domain: string; note: string }[];
    gaps?: { domain: string; suggestion: string }[];
  },
): string {
  const rank = ctx.target_rank ?? "Associate Professor";
  const trackId = normalizePromotionTrack(ctx.target_track);
  const specialty = ctx.specialty ?? "medicine";
  const stage = ctx.career_stage ?? "attending";
  const trackDef = getPromotionTrackDefinition(trackId);

  const teachingStrength = ctx.strengths?.find((s) => /teach|education/i.test(s.domain));
  const scholarshipGap = ctx.gaps?.find((g) => /scholar|research|publication/i.test(g.domain));

  switch (sectionId) {
    case "introduction":
    case "ce_introduction":
    case "cs_introduction":
    case "cx_introduction":
    case "cea_introduction":
      return `I am a ${stage} physician in ${specialty}, nominated for promotion to ${rank} on the ${trackDef.dossierLabel} track. My academic identity integrates work around a central theme of [describe your through-line — your niche, not a broad field label].`;

    case "education_teaching":
    case "ce_teaching_impact":
    case "cea_teaching_mentoring":
      return teachingStrength
        ? `Teaching is a documented strength (${teachingStrength.note}). I lead [describe roles, learner levels, and approximate annual hours]…`
        : `My teaching contributions span [learner levels] through [settings]. I emphasize [evidence-informed approach]…`;

    case "research_scholarship":
    case "ce_education_scholarship":
    case "cs_research":
    case "cea_education_scholarship":
      return scholarshipGap
        ? `Scholarship development focus: ${scholarshipGap.suggestion}`
        : `My scholarship reflects a focused program in [thematic area connected to your niche]…`;

    case "clinical_excellence":
    case "ce_clinical":
    case "cs_clinical":
    case "cx_clinical_primary":
    case "cea_clinical":
      return `I maintain active clinical practice in ${specialty}, with emphasis on [scope/complexity]. Clinical work ${trackId === "clinical_excellence" ? "is my primary domain and includes measurable outcomes such as" : "informs my academic mission by"} [describe connection or metrics].`;

    case "service_leadership":
    case "ce_service":
    case "cs_service":
    case "cx_service":
    case "cea_service":
      return "Institutional and professional service contributions include committee leadership, program development, and mentoring across career stages — with emphasis on outcomes, not membership alone.";

    case "future_vision":
    case "ce_future":
      return `Promotion to ${rank} reflects readiness to expand impact in ${trackDef.primaryDomain.toLowerCase()} over the next 3–5 years, aligned with departmental priorities.`;

    case "ce_summary":
    case "cs_summary":
    case "cx_summary":
    case "cea_summary":
      return `In summary, my sustained contributions on the ${trackDef.dossierLabel} track meet the criteria for promotion to ${rank}, with a clear trajectory for continued growth.`;

    case "cs_teaching_mentoring":
      return "Although research is my primary mission, I contribute to education through [teaching roles] and mentoring of [trainee types], with outcomes including [publications, awards, or career advancement].";

    case "cx_scholarship":
      return "Clinical scholarship includes [peer-reviewed QI reports, case series, or practice guidelines] connected to my clinical innovation work.";

    case "cx_teaching":
      return "I teach through bedside and procedural instruction and contribute to [grand rounds, case conferences, or CME].";

    case "cea_ed_leadership":
      return `As [program leadership role] since [year], I have led [describe scope — trainees, faculty, budget] with programmatic outcomes including [match rates, accreditation, board pass rates, or operational improvements].`;

    default:
      return "";
  }
}

export const PROMOTION_WRITING_PRINCIPLES = {
  do: [
    "Write in first person with active voice and concrete language",
    "Quantify impact — learners, hours, adoption rates, grant dollars, h-index",
    "Connect every section back to your thematic niche",
    "Mirror your institution's promotion criteria language",
    "Have a mentor and successfully promoted colleague review the draft",
  ],
  dont: [
    "Rehash the CV line by line",
    "Use vague openings ('I have always been passionate about…')",
    "Overstate contributions — committees detect inflation",
    "Ignore gaps — briefly acknowledge context if a domain is thin",
    "Exceed 5 pages unless your institution specifies otherwise",
  ],
  commonMistakes: [
    "No unifying theme — reads as a list of activities",
    "Activities without impact — what changed because of your work?",
    "Ignoring the audience — explain significance for reviewers outside your department",
    "Not aligning with institutional criteria",
    "Waiting too long — begin drafting 2–3 years before promotion",
  ],
};

export function buildPromotionTrackMakContext(
  trackId: PromotionTrackId,
  sectionTitle?: string,
): string {
  const track = getPromotionTrackDefinition(trackId);
  const sectionNote = sectionTitle ? `Current section: ${sectionTitle}.` : "";
  return `Promotion narrative — ${track.label} track.
Primary domain: ${track.primaryDomain}.
${sectionNote}
Tone: ${track.tone}.
Track tips: ${track.trackTips.join(" ")}
Writing principles: show impact not activity; quantify; maintain narrative arc around a focused niche.
Never cite framework names (GROW, WOOP, etc.). Help draft in first person, professional tone.
For external reviewers: make significance of contributions clear even outside the specialty.`;
}

export function dossierLabelForTrack(trackId: PromotionTrackId): string {
  return getPromotionTrackDefinition(trackId).dossierLabel;
}

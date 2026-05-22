/** Six-section academic promotion narrative (Master Document template). */
export type PromotionNarrativeSectionId =
  | "introduction"
  | "education_teaching"
  | "research_scholarship"
  | "clinical_excellence"
  | "service_leadership"
  | "future_vision";

export type PromotionNarrativeSection = {
  id: PromotionNarrativeSectionId;
  title: string;
  subtitle: string;
  targetWords: number;
  prompts: string[];
  placeholder: string;
};

export const PROMOTION_NARRATIVE_SECTIONS: PromotionNarrativeSection[] = [
  {
    id: "introduction",
    title: "Introduction & Professional Identity",
    subtitle: "1–2 paragraphs",
    targetWords: 200,
    prompts: [
      "Current role, rank, and department",
      "Overarching theme or narrative arc tying activities together",
      "Promotion rank sought and promotion track",
    ],
    placeholder:
      "I am an [rank] in [department] at [institution], seeking promotion to [target rank] on the [track] pathway. My academic work centers on…",
  },
  {
    id: "education_teaching",
    title: "Education & Teaching",
    subtitle: "1–3 paragraphs",
    targetWords: 350,
    prompts: [
      "Teaching philosophy and learner populations",
      "Courses, workshops, simulation, and clinical teaching",
      "Mentorship outcomes and educational scholarship",
      "Teaching evaluations, awards, and impact metrics",
    ],
    placeholder:
      "My approach to teaching emphasizes… Key contributions include course leadership in…",
  },
  {
    id: "research_scholarship",
    title: "Research & Scholarship",
    subtitle: "1–3 paragraphs",
    targetWords: 350,
    prompts: [
      "Research focus and trajectory",
      "Key publications, citations, and practice impact",
      "Grant funding history and role on teams",
      "National presentations and future direction",
    ],
    placeholder:
      "My scholarship focuses on… Representative work includes…",
  },
  {
    id: "clinical_excellence",
    title: "Clinical Excellence",
    subtitle: "1–2 paragraphs",
    targetWords: 250,
    prompts: [
      "Scope and complexity of clinical practice",
      "Quality improvement, innovation, and patient safety",
      "Clinical volume or unique expertise",
      "Recognition and patient satisfaction metrics",
    ],
    placeholder:
      "I maintain an active clinical practice in… Quality initiatives include…",
  },
  {
    id: "service_leadership",
    title: "Service & Leadership",
    subtitle: "1–2 paragraphs",
    targetWords: 250,
    prompts: [
      "Institutional committees and program leadership",
      "Regional, national, or society service",
      "Editorial boards, study sections, and advocacy",
      "Impact of service on the organization or field",
    ],
    placeholder:
      "Institutional service includes… At the national level, I contribute…",
  },
  {
    id: "future_vision",
    title: "Summary & Future Vision",
    subtitle: "1 paragraph",
    targetWords: 200,
    prompts: [
      "Synthesis of how contributions meet promotion criteria",
      "Forward-looking goals for the next 3–5 years",
      "Alignment with department and institutional mission",
    ],
    placeholder:
      "Taken together, my contributions demonstrate… Over the next five years, I will…",
  },
];

export function sectionById(id: string): PromotionNarrativeSection | undefined {
  return PROMOTION_NARRATIVE_SECTIONS.find((s) => s.id === id);
}

export function completionForSection(content: string, targetWords: number): number {
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  return Math.min(100, Math.round((words / targetWords) * 100));
}

export function assembleFullNarrative(
  sections: { section: string; content: string | null }[],
): string {
  return PROMOTION_NARRATIVE_SECTIONS.map((def) => {
    const row = sections.find((s) => s.section === def.id);
    const body = row?.content?.trim() || "[Draft pending]";
    return `${def.title}\n\n${body}`;
  }).join("\n\n---\n\n");
}

export function prefillSection(
  sectionId: PromotionNarrativeSectionId,
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
  const track = ctx.target_track ?? "Clinician-Educator";
  const specialty = ctx.specialty ?? "medicine";
  const stage = ctx.career_stage ?? "attending";

  switch (sectionId) {
    case "introduction":
      return `I am a ${stage} physician in ${specialty}, nominated for promotion to ${rank} on the ${track} track. My academic identity integrates clinical care, teaching, and scholarship around a central theme of [describe your through-line].`;
    case "education_teaching":
      return ctx.strengths?.find((s) => /teach|education/i.test(s.domain))
        ? `Teaching is a core strength (${ctx.strengths.find((s) => /teach|education/i.test(s.domain))?.note}). I lead…`
        : "";
    case "research_scholarship":
      return ctx.gaps?.find((g) => /scholar|research|publication/i.test(g.domain))
        ? `Scholarship development focus: ${ctx.gaps.find((g) => /scholar|research|publication/i.test(g.domain))?.suggestion}`
        : "";
    case "clinical_excellence":
      return `I maintain active clinical practice in ${specialty}, with emphasis on high-complexity care and continuous quality improvement.`;
    case "service_leadership":
      return "Institutional and professional service contributions include committee leadership, program development, and mentoring across career stages.";
    case "future_vision":
      return `Promotion to ${rank} reflects readiness to expand impact in ${track} domains over the next 3–5 years, aligned with departmental priorities.`;
    default:
      return "";
  }
}

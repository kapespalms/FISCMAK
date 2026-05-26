/**
 * Physician CV cover letter templates — stage-specific structure and guidance.
 * One page; CV provides detail, letter provides narrative.
 */

import {
  buildCoverLetterContextualGuidance,
  type CoverLetterInstitutionalSettingId,
  type CoverLetterPositionTypeId,
  type CoverLetterSpecialtyCategoryId,
} from "@/lib/v2/cover-letter-guide";
import {
  normalizeCareerNarrativeStage,
  type CareerNarrativeStageId,
} from "@/lib/v2/career-narrative-templates";

export type CoverLetterStageId = CareerNarrativeStageId;

export type CoverLetterSectionDef = {
  id: string;
  title: string;
  subtitle: string;
  targetWords: number;
  prompts: string[];
  placeholder: string;
  example?: string;
};

export type CoverLetterStageDef = {
  id: CoverLetterStageId;
  label: string;
  emphasis: string;
  sections: CoverLetterSectionDef[];
};

export const COVER_LETTER_UNIVERSAL_TIPS = [
  "Tailor every letter — reference specific faculty, programs, or institutional priorities",
  "Quantify accomplishments (e.g., mentored 12 residents vs. extensive mentoring experience)",
  "Keep it to one page — the CV provides detail; the letter provides narrative",
  "Match tone to career stage — enthusiasm and potential early; vision and impact later",
  "Proofread meticulously — errors signal carelessness in medicine",
  "Have a mentor in the field review before submission",
];

export const COVER_LETTER_FORMATTING = [
  "One page maximum at all career stages",
  "Professional font (Arial 11pt or Times New Roman 12pt), 1-inch margins",
  "Block or modified-block letter format with full contact header",
  "Tailor opening and fit paragraphs to each specific position and institution",
];

function sec(
  id: string,
  title: string,
  subtitle: string,
  targetWords: number,
  prompts: string[],
  placeholder: string,
  example?: string,
): CoverLetterSectionDef {
  return { id, title, subtitle, targetWords, prompts, placeholder, example };
}

const HEADER_PLACEHOLDER = `[Your Name, Degrees]
[Your Address] | [Email] | [Phone]
[Date]

[Recipient Name, Title]
[Department/Institution]
[Address]`;

const CLOSING_PLACEHOLDER = `[Reiterate enthusiasm for the position. State availability for interview. Thank the reader.]

Sincerely,
[Your Name]`;

export const COVER_LETTER_STAGES: CoverLetterStageDef[] = [
  {
    id: "med_student",
    label: "Medical Student",
    emphasis: "Clinical exposure, research involvement, and enthusiasm for the field",
    sections: [
      sec(
        "cl_ms_header",
        "Letter Header",
        "Contact block and recipient address",
        60,
        ["Your name, address, email, phone", "Date", "Recipient name, title, department, institution, address"],
        HEADER_PLACEHOLDER,
      ),
      sec(
        "cl_ms_opening",
        "Opening",
        "2–3 sentences — position, source, year and institution",
        70,
        [
          "State the specific position or program and where you found it",
          "Mention current year in medical school and institution",
        ],
        "Dear [Dr./Committee Name],\n\nI am writing to express my interest in [position/program] at [Institution]. I am a [year] medical student at [School of Medicine] with a strong interest in [specialty/field].",
        "I am writing to express my interest in [position/program] at [Institution]. I am a [year] medical student at [School of Medicine] with a strong interest in [specialty/field].",
      ),
      sec(
        "cl_ms_body_clinical",
        "Body 1: Clinical Interest & Fit",
        "3–4 sentences — rotations, mentors, program strengths",
        90,
        [
          "What drew you to this specialty or opportunity",
          "Specific clinical rotations, patient populations, or mentors",
          "Connect your goals to the program's strengths",
        ],
        "[Describe what drew you to this specialty. Reference specific rotations, patient populations, or mentors. Connect your goals to the program's strengths.]",
      ),
      sec(
        "cl_ms_body_research",
        "Body 2: Research & Scholarly Work",
        "3–4 sentences — projects, publications, QI; quantify output",
        90,
        [
          "Research experience, publications, presentations, or QI projects",
          "Skills gained (data analysis, IRB, clinical trial exposure)",
          "Quantify output (abstracts, manuscripts)",
        ],
        "[Highlight research experience, publications, presentations, or QI projects. Emphasize skills gained. Quantify output where possible.]",
      ),
      sec(
        "cl_ms_body_leadership",
        "Body 3: Leadership & Service",
        "2–3 sentences — leadership, community, teaching",
        70,
        [
          "Leadership roles, community engagement, volunteer work, or teaching",
          "Tie to professional identity and values",
        ],
        "[Mention leadership roles, community engagement, volunteer work, or teaching experience.]",
      ),
      sec(
        "cl_ms_closing",
        "Closing",
        "2–3 sentences — enthusiasm, interview availability, thanks",
        50,
        ["Reiterate enthusiasm", "State availability for interview", "Thank the reader"],
        CLOSING_PLACEHOLDER,
      ),
    ],
  },
  {
    id: "resident",
    label: "Resident",
    emphasis: "Training highlights, research trajectory, and career vision fit",
    sections: [
      sec("cl_res_header", "Letter Header", "Contact block and recipient address", 60, ["Full header with MD"], HEADER_PLACEHOLDER.replace("[Your Name, Degrees]", "[Your Name, MD]")),
      sec(
        "cl_res_opening",
        "Opening",
        "2–3 sentences — position, PGY level, program, referral source",
        80,
        [
          "Identify fellowship, faculty role, or other opportunity",
          "Current PGY level, program, and institution",
          "Referral source or how you learned of the opening",
        ],
        "Dear [Dr./Committee Name],\n\nI am a PGY-[X] resident in [Specialty] at [Institution] and am writing to apply for [position]. I learned of this opportunity through [source/mentor].",
        "I am a PGY-[X] resident in [Specialty] at [Institution] and am writing to apply for [position]. I learned of this opportunity through [source/mentor].",
      ),
      sec(
        "cl_res_body_clinical",
        "Body 1: Clinical Training & Expertise",
        "3–4 sentences — case volume, procedures, subspecialty exposure",
        100,
        ["Training highlights: case volume, procedural competencies, unique rotations", "Clinical strengths relevant to the position"],
        "[Summarize training highlights — case volume, procedural competencies, unique rotations, or subspecialty exposure.]",
      ),
      sec(
        "cl_res_body_research",
        "Body 2: Research & Scholarship",
        "3–4 sentences — publications, grants, projects, mentorship",
        100,
        [
          "Research trajectory: publications, grants, ongoing projects, presentations",
          "Mentorship relationships and collaborative work",
          "For research-heavy fellowships: methodology and future plans",
        ],
        "[Detail your research trajectory, including publications, grants, ongoing projects, and presentations.]",
      ),
      sec(
        "cl_res_body_teaching",
        "Body 3: Teaching, Leadership & Service",
        "2–3 sentences — teaching roles, committees, advocacy",
        80,
        ["Medical student education, simulation instruction", "Committee involvement or advocacy", "Emerging leadership"],
        "[Describe teaching roles, committee involvement, or advocacy work.]",
      ),
      sec(
        "cl_res_body_vision",
        "Body 4: Career Vision & Fit",
        "2–3 sentences — goals and why this program/institution",
        80,
        ["Articulate career goals", "Why this specific program or institution aligns", "Faculty, resources, or institutional mission"],
        "[Articulate your career goals and explain why this specific program or institution aligns with them.]",
      ),
      sec("cl_res_closing", "Closing", "2–3 sentences", 50, ["Enthusiasm and availability", "Thank the reader"], CLOSING_PLACEHOLDER.replace("[Your Name]", "[Your Name, MD]")),
    ],
  },
  {
    id: "fellow",
    label: "Fellow",
    emphasis: "Clinical niche, research program, and institutional fit",
    sections: [
      sec("cl_fel_header", "Letter Header", "Contact block and recipient address", 60, ["Full header with MD"], HEADER_PLACEHOLDER.replace("[Your Name, Degrees]", "[Your Name, MD]")),
      sec(
        "cl_fel_opening",
        "Opening",
        "2–3 sentences — faculty position, fellowship, completion date",
        80,
        ["Faculty or clinical position applied for", "Current fellowship, subspecialty, institution", "Referral source if applicable"],
        "Dear [Dr./Committee Name],\n\nI am writing to apply for the position of [Title] in the Division of [Subspecialty] at [Institution]. I am currently completing my [fellowship type] fellowship at [Institution] and anticipate completing training in [month/year].",
      ),
      sec(
        "cl_fel_body_clinical",
        "Body 1: Clinical Expertise & Niche",
        "3–4 sentences — niche, procedures, differentiators",
        100,
        ["Define clinical niche", "Procedural volumes, specialized training, certifications", "What differentiates you from other candidates"],
        "[Define your clinical niche. Detail procedural volumes, specialized training, and unique clinical skills.]",
      ),
      sec(
        "cl_fel_body_research",
        "Body 2: Research Program",
        "4–5 sentences — narrative, funding, vision, collaborators",
        130,
        [
          "Cohesive research narrative: current projects, funding or plans",
          "Publication record and 3–5 year research vision",
          "K-award or career development plans if applicable",
          "Key collaborators or mentors",
        ],
        "[Present a cohesive research narrative — current projects, funding, publication record, and 3–5 year research vision.]",
      ),
      sec(
        "cl_fel_body_education",
        "Body 3: Education & Mentorship",
        "2–3 sentences — curriculum, mentorship, didactics",
        80,
        ["Curriculum development, trainee mentorship", "Didactic contributions or education scholarship"],
        "[Highlight curriculum development, trainee mentorship, didactic contributions, or education scholarship.]",
      ),
      sec(
        "cl_fel_body_fit",
        "Body 4: Institutional Fit & Vision",
        "2–3 sentences — why this institution and division",
        80,
        ["Why this institution and division", "Specific faculty, programs, patient populations, or resources"],
        "[Explain specifically why this institution and division are the right environment for your career.]",
      ),
      sec("cl_fel_closing", "Closing", "2–3 sentences", 50, ["Interest and availability", "Thank the reader"], CLOSING_PLACEHOLDER.replace("[Your Name]", "[Your Name, MD]")),
    ],
  },
  {
    id: "early_attending",
    label: "Early-Career Attending (0–7 Years)",
    emphasis: "Clinical impact, research funding, and strategic fit",
    sections: [
      sec(
        "cl_ea_header",
        "Letter Header",
        "Contact block with board certifications",
        60,
        ["Name with MD/DO and board certifications"],
        HEADER_PLACEHOLDER.replace("[Your Name, Degrees]", "[Your Name, MD/DO, Board Certifications]"),
      ),
      sec(
        "cl_ea_opening",
        "Opening",
        "2–3 sentences — position, current role, why seeking opportunity",
        80,
        ["Position and current role, title, institution", "Why seeking this opportunity (advancement, geography, mission)"],
        "Dear [Dr./Committee Name],\n\nI am an Assistant Professor of [Specialty] at [Institution] and am writing to express my interest in the [position] at [Institution]. My clinical and academic focus in [area] aligns closely with your division's mission.",
      ),
      sec(
        "cl_ea_body_clinical",
        "Body 1: Clinical Practice & Impact",
        "3–4 sentences — scope, volume, programs built; quantify",
        100,
        ["Clinical practice scope, patient volume, procedural expertise", "Programs or services built", "Quantify: clinic growth, new programs, quality metrics"],
        "[Describe clinical practice scope, patient volume, and programs you have built. Quantify impact where possible.]",
      ),
      sec(
        "cl_ea_body_research",
        "Body 2: Research & Funding",
        "4–5 sentences — grants, publications, trajectory",
        130,
        [
          "Research program: active grants, publications, ongoing trials, collaborations",
          "Trajectory toward or achievement of independent funding",
          "Awards or recognitions",
        ],
        "[Outline your research program — active grants, publications, ongoing trials, and collaborations.]",
      ),
      sec(
        "cl_ea_body_education",
        "Body 3: Education & Leadership",
        "3–4 sentences — educational roles, service, national involvement",
        100,
        ["Fellowship program director, course director, simulation leadership", "Institutional service and committee work", "National society involvement"],
        "[Detail educational roles, institutional service, and national society involvement.]",
      ),
      sec(
        "cl_ea_body_fit",
        "Body 4: Strategic Fit",
        "2–3 sentences — what you bring and 5-year goals",
        80,
        ["What you would bring to the institution", "What you hope to accomplish in the next 5 years", "Specific synergies"],
        "[Articulate what you would bring to the institution and what you hope to accomplish in the next 5 years.]",
      ),
      sec("cl_ea_closing", "Closing", "2–3 sentences", 50, ["Enthusiasm and availability"], CLOSING_PLACEHOLDER.replace("[Your Name]", "[Your Name, MD/DO]")),
    ],
  },
  {
    id: "mid_career",
    label: "Mid-Career Attending (8–20 Years)",
    emphasis: "Leadership accomplishments, national reputation, and role vision",
    sections: [
      sec(
        "cl_mc_header",
        "Letter Header",
        "Contact block with board certifications",
        60,
        ["Name with MD/DO and board certifications"],
        HEADER_PLACEHOLDER.replace("[Your Name, Degrees]", "[Your Name, MD/DO, Board Certifications]"),
      ),
      sec(
        "cl_mc_opening",
        "Opening",
        "2–3 sentences — leadership position, title, years of experience",
        90,
        [
          "Position (Division Chief, Endowed Chair, Vice Chair, Program Director)",
          "Current title, institution, years of experience",
          "Frame opportunity in terms of career trajectory",
        ],
        "Dear [Dr./Committee Name],\n\nI am writing to express my interest in the [position] at [Institution]. As an Associate Professor of [Specialty] at [Institution] with [X] years of clinical and academic experience, I am eager to bring my expertise in [area] to your program.",
      ),
      sec(
        "cl_mc_body_leadership",
        "Body 1: Leadership & Administrative Accomplishments",
        "4–5 sentences — programs built, outcomes quantified",
        130,
        [
          "Lead with leadership: programs built, divisions grown, budgets managed",
          "Quantify: faculty recruited, revenue, rankings, accreditation",
        ],
        "[Describe programs you have built, divisions you have grown, or strategic initiatives you have led. Quantify outcomes.]",
      ),
      sec(
        "cl_mc_body_clinical",
        "Body 2: Clinical Excellence",
        "3–4 sentences — reputation, innovation, QI",
        100,
        ["Clinical reputation, referral patterns, specialized expertise", "Clinical innovation: new techniques, multidisciplinary programs, QI"],
        "[Summarize clinical reputation, referral patterns, and contributions to clinical innovation.]",
      ),
      sec(
        "cl_mc_body_scholarship",
        "Body 3: Scholarship & National Reputation",
        "3–4 sentences — publications, grants, national roles",
        110,
        [
          "Publication record, h-index or citations if strong",
          "Grant funding history, editorial boards, guideline committees",
          "Invited lectureships; national or international recognition",
        ],
        "[Highlight publication record, grant funding, editorial board roles, and national recognition.]",
      ),
      sec(
        "cl_mc_body_mentorship",
        "Body 4: Mentorship Legacy",
        "2–3 sentences — trainee and junior faculty outcomes",
        80,
        ["Track record mentoring trainees and junior faculty", "Quantify mentee outcomes: faculty positions, grants, awards"],
        "[Describe your track record of mentoring trainees and junior faculty. Quantify mentee outcomes.]",
      ),
      sec(
        "cl_mc_body_vision",
        "Body 5: Vision for the Role",
        "3–4 sentences — strategic priorities for the position",
        110,
        [
          "Concise strategic vision for the position",
          "Understanding of institution's challenges and opportunities",
          "2–3 priorities you would pursue",
        ],
        "[Present a strategic vision for the position. Outline 2–3 priorities you would pursue.]",
      ),
      sec("cl_mc_closing", "Closing", "2–3 sentences", 50, ["Enthusiasm and availability"], CLOSING_PLACEHOLDER.replace("[Your Name]", "[Your Name, MD/DO]")),
    ],
  },
  {
    id: "legacy_attending",
    label: "Senior / Legacy Attending (20+ Years)",
    emphasis: "Legacy impact, leadership at scale, and institutional vision",
    sections: [
      sec(
        "cl_leg_header",
        "Letter Header",
        "Contact block with honors",
        60,
        ["Name with MD/DO, board certifications, honors"],
        HEADER_PLACEHOLDER.replace("[Your Name, Degrees]", "[Your Name, MD/DO, Board Certifications, Honors]"),
      ),
      sec(
        "cl_leg_opening",
        "Opening",
        "2–3 sentences — senior role, career arc, gravitas",
        90,
        [
          "Position (Department Chair, Dean, Institute Director, Emeritus, advisory)",
          "Frame career arc in one sentence",
          "Convey gravitas without arrogance",
        ],
        "Dear [Dr./Committee Name],\n\nI am honored to be considered for the position of [Title] at [Institution]. Over a [X]-year career in academic [Specialty], I have dedicated myself to [brief thematic summary].",
      ),
      sec(
        "cl_leg_body_contributions",
        "Body 1: Career-Defining Contributions",
        "4–5 sentences — signature accomplishments and legacy impact",
        130,
        [
          "Signature accomplishments — work you are known for",
          "Landmark studies, transformative programs, national policy, institutional transformation",
          "Legacy-level impact",
        ],
        "[Highlight your signature accomplishments — the work for which you are known. Focus on legacy-level impact.]",
      ),
      sec(
        "cl_leg_body_leadership",
        "Body 2: Leadership at Scale",
        "3–4 sentences — large organizations, strategic planning",
        110,
        [
          "Leading large organizations, departments, or national initiatives",
          "Strategic planning, culture change, financial stewardship, stakeholder navigation",
        ],
        "[Describe experience leading large organizations or national initiatives.]",
      ),
      sec(
        "cl_leg_body_mentorship",
        "Body 3: Mentorship & Pipeline Building",
        "3–4 sentences — mentorship legacy and DEI",
        100,
        [
          "Number of trainees mentored and current positions",
          "Diversity and inclusion initiatives",
          "Philosophy of developing the next generation",
        ],
        "[Quantify your mentorship legacy — trainees mentored, mentee outcomes, DEI initiatives.]",
      ),
      sec(
        "cl_leg_body_scholarship",
        "Body 4: Continued Scholarly Impact",
        "2–3 sentences — ongoing grants, publications, thought leadership",
        80,
        ["Active grants, recent high-impact publications", "Advisory roles or thought leadership"],
        "[Summarize ongoing scholarly contributions — active grants, recent publications, advisory roles.]",
      ),
      sec(
        "cl_leg_body_vision",
        "Body 5: Vision & Institutional Alignment",
        "3–4 sentences — vision for role and institution",
        110,
        [
          "Vision for the role and institution",
          "Deep understanding of institution's position in the landscape",
          "How your experience uniquely positions you to lead",
        ],
        "[Articulate your vision for the role. Demonstrate how your experience uniquely positions you to lead.]",
      ),
      sec("cl_leg_closing", "Closing", "2–3 sentences", 50, ["Enthusiasm and commitment", "Thank search committee"], CLOSING_PLACEHOLDER.replace("[Your Name]", "[Your Name, MD/DO]")),
    ],
  },
];

export function getCoverLetterStageDef(stageId: CoverLetterStageId): CoverLetterStageDef {
  return COVER_LETTER_STAGES.find((s) => s.id === stageId) ?? COVER_LETTER_STAGES[0]!;
}

export function normalizeCoverLetterStage(input?: string | null): CoverLetterStageId {
  return normalizeCareerNarrativeStage(input);
}

export function getSectionsForCoverLetterStage(stageId: CoverLetterStageId): CoverLetterSectionDef[] {
  return getCoverLetterStageDef(stageId).sections;
}

export function coverLetterSectionById(sectionId: string): CoverLetterSectionDef | undefined {
  for (const stage of COVER_LETTER_STAGES) {
    const found = stage.sections.find((s) => s.id === sectionId);
    if (found) return found;
  }
  return undefined;
}

export function coverLetterStageForSection(sectionId: string): CoverLetterStageId | undefined {
  for (const stage of COVER_LETTER_STAGES) {
    if (stage.sections.some((s) => s.id === sectionId)) return stage.id;
  }
  return undefined;
}

export function completionForCoverLetterSection(content: string, targetWords: number): number {
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  if (!targetWords) return content.trim() ? 100 : 0;
  return Math.min(100, Math.round((words / targetWords) * 100));
}

export function assembleFullCoverLetter(
  stageId: CoverLetterStageId,
  sections: Record<string, { content?: string }>,
): string {
  const stage = getCoverLetterStageDef(stageId);
  const parts: string[] = [`Cover Letter — ${stage.label}`, stage.emphasis, ""];

  for (const def of stage.sections) {
    const content = sections[def.id]?.content?.trim();
    parts.push(content || `[${def.title} — not yet drafted]`);
    parts.push("");
  }

  return parts.join("\n");
}

export function buildCoverLetterMakContext(input: {
  stageId: CoverLetterStageId;
  sectionTitle?: string;
  specialty?: string;
  positionType?: CoverLetterPositionTypeId;
  institutionalSetting?: CoverLetterInstitutionalSettingId;
  specialtyCategory?: CoverLetterSpecialtyCategoryId;
}): string {
  const stage = getCoverLetterStageDef(input.stageId);
  const sectionNote = input.sectionTitle ? `Current section: ${input.sectionTitle}.` : "";
  const specialtyNote = input.specialty ? `Specialty: ${input.specialty}.` : "";

  let contextBlock = "";
  if (input.positionType && input.institutionalSetting && input.specialtyCategory) {
    const ctx = buildCoverLetterContextualGuidance({
      stageId: input.stageId,
      positionType: input.positionType,
      institutionalSetting: input.institutionalSetting,
      specialtyCategory: input.specialtyCategory,
    });
    contextBlock = `Position type guidance: ${ctx.position.slice(0, 2).join(" ")}
Narrative arc: ${ctx.narrativeArc}
Institutional tips: ${ctx.institutional.tips.slice(0, 2).join(" ")}`;
  }

  return `Physician CV cover letter — ${stage.label}. Emphasis: ${stage.emphasis}.
${sectionNote}${specialtyNote}
${contextBlock}
One page maximum. Quantify accomplishments; tailor to specific institution and faculty.
Apply "So What?" test — every paragraph must connect to value for this role.
Use Career Data vault evidence — never invent metrics. Never cite internal framework names.`;
}

export function prefillCoverLetterSection(
  sectionId: string,
  input?: { name?: string; specialty?: string; institution?: string },
): string {
  const def = coverLetterSectionById(sectionId);
  if (!def) return "";
  let text = def.placeholder;
  if (input?.name) {
    text = text.replace(/\[Your Name[^\]]*\]/g, input.name);
  }
  if (input?.specialty) {
    text = text.replace(/\[Specialty\]/g, input.specialty).replace(/\[specialty\]/g, input.specialty);
  }
  if (input?.institution) {
    text = text.replace(/\[Institution\]/g, input.institution);
  }
  return text;
}

export function totalTargetWords(stageId: CoverLetterStageId): number {
  return getSectionsForCoverLetterStage(stageId).reduce((sum, s) => sum + s.targetWords, 0);
}

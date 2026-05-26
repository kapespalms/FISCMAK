/**
 * Academic Medicine Dossier — career stage guide for residency through legacy faculty.
 * Scalable, cumulative structure aligned with promotion committee expectations.
 */

import {
  normalizeCareerNarrativeStage,
  type CareerNarrativeStageId,
} from "@/lib/v2/career-narrative-templates";

export type AcademicDossierStageId = CareerNarrativeStageId;

export type DossierItemDef = {
  id: string;
  label: string;
  hint?: string;
};

export type DossierSectionDef = {
  id: string;
  title: string;
  items: DossierItemDef[];
};

export type AcademicDossierStageDef = {
  id: AcademicDossierStageId;
  label: string;
  purpose: string;
  sections: DossierSectionDef[];
};

export type DossierItemState = {
  checked?: boolean;
  notes?: string;
  updated_at?: string;
};

export const DOSSIER_DESIGN_PRINCIPLES = [
  "Alignment with promotion criteria — mid-career and senior templates mirror typical committee expectations across clinical, research, education, and service missions",
  "Scalability — each stage builds on the prior, so maintaining a dossier from early career forward simplifies later promotion packets",
  "Flexibility — sections can be weighted differently by academic track (clinician-educator, clinician-scientist, clinician-administrator)",
];

export const DOSSIER_FORMATTING_GUIDELINES = [
  "Update at minimum annually; before any application or review",
  "Use consistent fonts (Arial 11pt or Times New Roman 12pt), 1-inch margins",
  "Publication formatting: consistent citation style (Vancouver/ICMJE recommended); bold your name; include PMID or DOI",
  "Version control: date each version (e.g., Last updated: May 2026)",
  "Tailor sections and emphasis to purpose — promotion, grant application, recruitment, or credentialing",
];

export const DOSSIER_SUPPORTING_DOCUMENTS: DossierItemDef[] = [
  { id: "support_cv", label: "Updated CV (NIH Biosketch format and institutional format)" },
  { id: "support_teaching_portfolio", label: "Teaching portfolio" },
  { id: "support_clinical_outcomes", label: "Clinical outcomes data" },
  { id: "support_teaching_evals", label: "Representative teaching evaluations" },
  {
    id: "support_career_narrative",
    label: "Personal statement / career narrative (updated annually)",
  },
];

function item(sectionId: string, label: string, hint?: string): DossierItemDef {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 48);
  return { id: `${sectionId}__${slug}`, label, hint };
}

function section(
  id: string,
  title: string,
  labels: Array<string | { label: string; hint?: string }>,
): DossierSectionDef {
  return {
    id,
    title,
    items: labels.map((l) =>
      typeof l === "string" ? item(id, l) : item(id, l.label, l.hint),
    ),
  };
}

export const ACADEMIC_DOSSIER_STAGES: AcademicDossierStageDef[] = [
  {
    id: "med_student",
    label: "Medical Student",
    purpose: "Residency application preparation and career planning",
    sections: [
      section("ms_contact", "Contact Information & Demographics", [
        "Full name, contact information, and demographic details as required by applications",
      ]),
      section("ms_education", "Education", [
        "Medical school and expected graduation date",
        "Undergraduate and graduate degrees, honors",
      ]),
      section("ms_clinical", "Clinical Experiences", [
        "Core clerkship evaluations and honors",
        "Sub-internships and away rotations",
      ]),
      section("ms_research", "Research Experience", [
        "Projects (PI name, institution, dates)",
        "Publications (peer-reviewed, abstracts, posters)",
        "Presentations (local, regional, national)",
      ]),
      section("ms_leadership", "Leadership & Service", [
        "Student government, interest groups, committees",
        "Community service and volunteer work",
      ]),
      section("ms_awards", "Awards & Honors", [
        "Dean's list, AOA membership, scholarships",
      ]),
      section("ms_exams", "Standardized Exam Scores (if applicable)", [
        "USMLE/COMLEX scores and dates",
      ]),
      section("ms_skills", "Skills & Certifications", [
        "BLS, ACLS, procedural training, languages",
      ]),
      section("ms_statement", "Personal Statement / Career Goals", [
        { label: "Brief narrative on career goals and specialty direction", hint: "1 page or less" },
      ]),
      section("ms_references", "References", [
        "3–4 faculty mentors with contact information",
      ]),
    ],
  },
  {
    id: "resident",
    label: "Resident",
    purpose: "Fellowship applications, early faculty positions, and training documentation",
    sections: [
      section("res_contact", "Contact Information", ["Current contact and training program details"]),
      section("res_education", "Education & Training", [
        "Residency program, PGY level, expected completion",
        "Medical school and degrees",
      ]),
      section("res_licensure", "Licensure & Certifications", [
        "State medical license(s), DEA",
        "Board eligibility/certification status",
        "ACLS, ATLS, PALS, etc.",
      ]),
      section("res_clinical", "Clinical Experience & Competency", [
        "Case/procedure logs (volume and complexity)",
        "Milestone evaluations summary",
        "Moonlighting experience (if applicable)",
      ]),
      section("res_research", "Research & Scholarship", [
        "Publications (peer-reviewed, case reports, reviews)",
        "Abstracts and presentations",
        "Ongoing projects with expected outcomes",
        "Grants or funding received",
      ]),
      section("res_teaching", "Teaching Experience", [
        "Medical student teaching, lectures delivered",
        "Simulation instruction, curriculum development",
      ]),
      section("res_qi", "Quality Improvement & Patient Safety", [
        "QI projects with measurable outcomes",
      ]),
      section("res_leadership", "Leadership & Service", [
        "Chief resident role, committee membership",
        "Professional society involvement",
      ]),
      section("res_awards", "Awards & Honors", ["Dean's awards, research prizes, teaching honors"]),
      section("res_goals", "Career Goals Statement", [
        { label: "Brief narrative on fellowship or career direction", hint: "½–1 page" },
      ]),
      section("res_references", "References", [
        "Program director + 2–3 faculty references",
      ]),
    ],
  },
  {
    id: "fellow",
    label: "Fellow",
    purpose: "Faculty recruitment, subspecialty credentialing, early academic portfolio",
    sections: [
      section("fel_contact", "Contact Information", [
        "Current contact, fellowship program, and subspecialty",
      ]),
      section("fel_education", "Education & Training", [
        "Fellowship program, subspecialty, expected completion",
        "Residency and medical school",
      ]),
      section("fel_credentials", "Licensure, Certification & Credentialing", [
        "Board certification (general + subspecialty eligibility)",
        "State licenses, DEA, institutional privileges",
      ]),
      section("fel_clinical", "Clinical Expertise", [
        "Subspecialty case/procedure logs",
        "Unique clinical skills or niche expertise",
        "Independent practice readiness assessment",
      ]),
      section("fel_research", "Research & Scholarship", [
        "Publications by type: original research, reviews, chapters",
        "h-index and citation metrics (if applicable)",
        "Funded grants (role: PI, Co-I, mentored award)",
        "Ongoing and planned research program",
      ]),
      section("fel_teaching", "Teaching & Mentorship", [
        "Formal teaching roles (didactics, simulation, bedside)",
        "Mentees (students, residents)",
        "Curriculum development",
      ]),
      section("fel_qi_admin", "Quality Improvement & Administrative", [
        "QI/patient safety projects",
        "Committee service",
      ]),
      section("fel_prof_dev", "Professional Development", [
        "Society memberships and roles",
        "Invited lectures, visiting professorships",
        "Peer review activities",
      ]),
      section("fel_awards", "Awards & Honors", [
        "Fellowship awards, research prizes, teaching recognition",
      ]),
      section("fel_vision", "Academic Career Vision Statement", [
        {
          label: "Clinical, research, education, and service goals",
          hint: "1 page",
        },
      ]),
      section("fel_references", "References", [
        "Fellowship director, research mentor, clinical mentor",
      ]),
    ],
  },
  {
    id: "early_attending",
    label: "Early-Career Attending (Years 1–7)",
    purpose: "Promotion to Associate Professor, building academic identity, grant applications",
    sections: [
      section("ea_contact", "Contact Information & Academic Appointment", [
        "Current title, department, division, institution",
        "Date of initial appointment",
      ]),
      section("ea_education", "Education, Training & Certification", [
        "Medical school, residency, fellowship, board certification",
      ]),
      section("ea_licensure", "Licensure & Credentialing", [
        "State licenses, DEA, hospital privileges",
      ]),
      section("ea_clinical", "Academic Mission: Clinical", [
        "Clinical effort (% FTE), practice setting",
        "Clinical volume metrics and outcomes data",
        "Unique clinical programs developed",
        "Regional/national referral patterns",
      ]),
      section("ea_research", "Academic Mission: Research & Scholarship", [
        "Active and completed grants (role, agency, amount, dates)",
        "Publications by type with citation metrics",
        "Original research, reviews and editorials, book chapters",
        "Guidelines or consensus statements",
        "Invited lectures, national/international meetings",
        {
          label: "Research program narrative",
          hint: "1–2 paragraphs describing trajectory",
        },
      ]),
      section("ea_education_mission", "Academic Mission: Education", [
        "Teaching portfolio (courses, lectures, clinical teaching)",
        "Curriculum development and innovation",
        "Mentorship of trainees (students, residents, fellows)",
        "Educational scholarship (publications, grants)",
        "Teaching evaluations summary",
      ]),
      section("ea_service", "Academic Mission: Service & Leadership", [
        "Institutional committees",
        "Professional society roles",
        "Peer review and editorial board service",
        "Community engagement",
      ]),
      section("ea_qi", "Quality Improvement & Patient Safety", [
        "QI projects with measurable outcomes and institutional impact",
      ]),
      section("ea_awards", "Awards, Honors & Recognition", [
        "Teaching, research, clinical, and service awards",
      ]),
      section("ea_prof_dev", "Professional Development Activities", [
        "Courses, workshops, leadership training",
      ]),
      section("ea_statement", "Personal Statement / Academic Vision", [
        {
          label: "Academic vision for promotion packet",
          hint: "2–3 pages",
        },
      ]),
      section("ea_letters", "External Letters of Reference", [
        "5–7 arm's-length evaluators for promotion",
      ]),
    ],
  },
  {
    id: "mid_career",
    label: "Mid-Career Attending (Years 8–20)",
    purpose: "Promotion to Full Professor, leadership positions, sustained impact documentation",
    sections: [
      section("mc_contact", "Contact Information & Academic Appointment", [
        "Current and prior titles, endowed positions",
        "Administrative roles held",
      ]),
      section("mc_education", "Education, Training & Certification", [
        "Training history and board certification status",
      ]),
      section("mc_clinical", "Academic Mission: Clinical Excellence & Innovation", [
        "Clinical leadership roles (division chief, medical director, etc.)",
        "Programs built, clinical innovations implemented",
        "Outcomes data and national benchmarking",
        "Practice guidelines authored or contributed to",
      ]),
      section("mc_research", "Academic Mission: Research & Scholarship", [
        "Cumulative funding as PI and Co-I (total dollars)",
        "Publication record: total count by type, h-index, i10-index",
        {
          label: "Impact narrative: key contributions to the field",
          hint: "2–3 paragraphs",
        },
        "Trainees mentored who obtained independent funding or faculty positions",
        "Invited lectures and visiting professorships",
      ]),
      section("mc_education_mission", "Academic Mission: Education & Mentorship", [
        "Educational leadership roles (program director, clerkship director)",
        "Mentorship tree: trainees mentored and current positions",
        "National educational contributions (board question writing, exam committees)",
        "Educational grants and scholarship",
      ]),
      section("mc_leadership", "Academic Mission: Leadership & Service", [
        "Institutional: department, school, hospital leadership",
        "National/international: society leadership, study sections, editorial boards",
        "Advocacy and policy work",
      ]),
      section("mc_qi", "Quality, Safety & Systems Improvement", [
        "Major QI initiatives with institutional or system-level impact",
      ]),
      section("mc_awards", "Awards, Honors & Named Lectureships", [
        "National awards, named lectureships, society honors",
      ]),
      section("mc_media", "Media & Public Engagement (if applicable)", [
        "Op-eds, podcasts, public education, policy commentary",
      ]),
      section("mc_narrative", "Promotion Narrative / Impact Statement", [
        {
          label: "Full Professor promotion impact statement",
          hint: "3–5 pages",
        },
      ]),
      section("mc_letters", "External Letters of Reference", [
        "8–10 arm's-length national/international evaluators",
      ]),
    ],
  },
  {
    id: "legacy_attending",
    label: "Legacy / Senior Attending (20+ Years)",
    purpose: "Endowed chairs, lifetime achievement, emeritus status, legacy documentation",
    sections: [
      section("leg_contact", "Contact Information & Academic Appointment History", [
        "Timeline of all academic appointments and titles",
        "Endowed chair(s) held",
      ]),
      section("leg_education", "Education, Training & Certification", [
        "Complete training and certification history",
      ]),
      section("leg_summary", "Career Impact Summary", [
        {
          label: "Executive summary",
          hint: "1 page — defining contributions, cumulative metrics, signature achievements",
        },
        "Total publications, total grant funding, trainees mentored",
        "3–5 signature achievement bullet points",
      ]),
      section("leg_clinical", "Clinical Legacy", [
        "Clinical programs or centers established",
        "Techniques, protocols, or innovations that became standard of care",
        "Patient population impact",
      ]),
      section("leg_research", "Research Legacy", [
        "Landmark publications (10–15 most impactful works, annotated)",
        "Cumulative funding history",
        "Field-defining contributions (narrative)",
        "Research lineage: academic descendants and their contributions",
      ]),
      section("leg_education", "Educational Legacy", [
        "Training programs built or transformed",
        "Mentorship tree with trainee outcomes (faculty positions, leadership, awards)",
        "Textbooks, definitive reviews, educational resources created",
      ]),
      section("leg_institutional", "Leadership & Institutional Legacy", [
        "Departments, divisions, or centers built",
        "Institutional policies or systems shaped",
        "National/international organizational leadership",
      ]),
      section("leg_service", "Professional Service Legacy", [
        "Journal editorships",
        "Study section and review panel leadership",
        "Guideline committees chaired",
        "Advisory roles (NIH, FDA, WHO, professional societies)",
      ]),
      section("leg_honors", "Honors, Awards & Named Lectureships", [
        "Lifetime achievement awards",
        "Honorary degrees and society fellowships",
        "Awards or lectureships named after the individual",
      ]),
      section("leg_public", "Public Impact & Advocacy", [
        "Policy influence, public health contributions",
        "Media presence, public education",
      ]),
      section("leg_narrative", "Legacy Narrative", [
        {
          label: "Career arc, philosophy, and field impact",
          hint: "5–10 pages",
        },
      ]),
      section("leg_succession", "Succession Planning (if applicable)", [
        "Programs and roles transitioned",
        "Ongoing mentorship commitments",
      ]),
      section("leg_emeritus", "Emeritus Activities (if applicable)", [
        "Continued teaching, mentorship, writing, consulting",
      ]),
    ],
  },
];

export function getDossierStageDef(stageId: AcademicDossierStageId): AcademicDossierStageDef {
  return ACADEMIC_DOSSIER_STAGES.find((s) => s.id === stageId) ?? ACADEMIC_DOSSIER_STAGES[0]!;
}

export function normalizeAcademicDossierStage(input?: string | null): AcademicDossierStageId {
  return normalizeCareerNarrativeStage(input);
}

export function allDossierItemsForStage(stageId: AcademicDossierStageId): DossierItemDef[] {
  return getDossierStageDef(stageId).sections.flatMap((s) => s.items);
}

export function dossierItemById(itemId: string): DossierItemDef | undefined {
  for (const stage of ACADEMIC_DOSSIER_STAGES) {
    for (const sectionDef of stage.sections) {
      const found = sectionDef.items.find((i) => i.id === itemId);
      if (found) return found;
    }
  }
  return DOSSIER_SUPPORTING_DOCUMENTS.find((d) => d.id === itemId);
}

export function dossierCompletion(
  stageId: AcademicDossierStageId,
  items: Record<string, DossierItemState>,
  supporting: Record<string, DossierItemState>,
): number {
  const stageItems = allDossierItemsForStage(stageId);
  const supportIds = DOSSIER_SUPPORTING_DOCUMENTS.map((d) => d.id);
  const total = stageItems.length + supportIds.length;
  if (!total) return 0;
  let done = 0;
  for (const i of stageItems) {
    if (items[i.id]?.checked || items[i.id]?.notes?.trim()) done += 1;
  }
  for (const id of supportIds) {
    if (supporting[id]?.checked || supporting[id]?.notes?.trim()) done += 1;
  }
  return Math.round((done / total) * 100);
}

export function assembleDossierSummary(input: {
  stageId: AcademicDossierStageId;
  items: Record<string, DossierItemState>;
  supporting: Record<string, DossierItemState>;
}): string {
  const stage = getDossierStageDef(input.stageId);
  const lines: string[] = [
    `Academic Medicine Dossier — ${stage.label}`,
    `Purpose: ${stage.purpose}`,
    "",
  ];

  for (const sectionDef of stage.sections) {
    lines.push(`## ${sectionDef.title}`);
    if (sectionDef.items.length === 0) {
      lines.push("[ ] Section documented");
    } else {
      for (const itemDef of sectionDef.items) {
        const state = input.items[itemDef.id];
        const mark = state?.checked ? "[x]" : "[ ]";
        const note = state?.notes?.trim();
        lines.push(`${mark} ${itemDef.label}${note ? `\n    ${note}` : ""}`);
      }
    }
    lines.push("");
  }

  lines.push("## Supporting Documents");
  for (const doc of DOSSIER_SUPPORTING_DOCUMENTS) {
    const state = input.supporting[doc.id];
    const mark = state?.checked ? "[x]" : "[ ]";
    const note = state?.notes?.trim();
    lines.push(`${mark} ${doc.label}${note ? `\n    ${note}` : ""}`);
  }

  lines.push("");
  lines.push("## Formatting Guidelines");
  for (const g of DOSSIER_FORMATTING_GUIDELINES) {
    lines.push(`• ${g}`);
  }

  return lines.join("\n");
}

export function buildAcademicDossierMakContext(input: {
  stageId: AcademicDossierStageId;
  sectionTitle?: string;
}): string {
  const stage = getDossierStageDef(input.stageId);
  const sectionNote = input.sectionTitle ? `Current section: ${input.sectionTitle}.` : "";
  return `Academic medicine dossier — ${stage.label}. Purpose: ${stage.purpose}.
${sectionNote}
Design principles: ${DOSSIER_DESIGN_PRINCIPLES.join(" ")}
Help physician document dossier content with metrics and evidence — not activity lists.
Align with promotion criteria; tailor emphasis to academic track. Never cite internal framework names.`;
}

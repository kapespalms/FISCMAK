/**
 * Academic core documents — NIH Biosketch, Institutional CV, Teaching Portfolio.
 * Planning/drafting templates; official NIH submissions use SciENcv.
 */

export type AcademicCoreDocumentId = "nih_biosketch" | "institutional_cv" | "teaching_portfolio";

export type CoreDocumentSectionDef = {
  id: string;
  title: string;
  subtitle: string;
  targetWords: number;
  prompts: string[];
  placeholder: string;
};

export type CoreDocumentDef = {
  id: AcademicCoreDocumentId;
  label: string;
  description: string;
  formattingNotes: string[];
  sections: CoreDocumentSectionDef[];
};

export const NIH_BIOSKETCH_FORMATTING = [
  "Page limit: 5 pages total",
  "Font: Arial 11pt (recommended); margins: 0.5 inches minimum",
  "Generate official format through SciENcv (sciencv.ncbi.nlm.nih.gov)",
  "Include ORCID iD if available",
  "Update before each submission — tailor Personal Statement and Contributions to each grant",
];

export const INSTITUTIONAL_CV_FORMATTING = [
  "Font: Times New Roman 12pt or Arial 11pt; margins: 1 inch",
  "Update at least annually; before promotion review, application, or credentialing",
  "Check Office of Faculty Affairs for mandatory institutional CV format",
  "Bold your name in author lists; Vancouver/ICMJE citations with PMID or DOI",
];

export const TEACHING_PORTFOLIO_FORMATTING = [
  "Recommended length: 10–20 pages (excluding appendices)",
  "Update annually; before promotion reviews",
  "Check Academy of Medical Educators or Faculty Affairs for institutional requirements",
  "Consider maintaining a parallel digital version for easy sharing",
];

function section(
  id: string,
  title: string,
  subtitle: string,
  targetWords: number,
  prompts: string[],
  placeholder: string,
): CoreDocumentSectionDef {
  return { id, title, subtitle, targetWords, prompts, placeholder };
}

export const NIH_BIOSKETCH_SECTIONS: CoreDocumentSectionDef[] = [
  section(
    "bio_a_identification",
    "Section A: Identification & Education",
    "Name, eRA Commons, position, education/training table",
    120,
    [
      "Full name and degrees",
      "eRA Commons username",
      "Current position title",
      "Education/training table: institution, degree, completion date, field of study",
    ],
    `Name: [Full Name, Degrees]
eRA Commons Username: [Username]
Position Title: [Current Title]

Education/Training:
Institution | Degree | Completion Date | Field of Study
[University] | [B.S.] | [MM/YYYY] | [Biology]
[Medical School] | [M.D.] | [MM/YYYY] | [Medicine]
[Residency] | [Residency] | [MM/YYYY] | [Specialty]
[Fellowship] | [Fellowship] | [MM/YYYY] | [Subspecialty]`,
  ),
  section(
    "bio_a_statement",
    "Section A: Personal Statement",
    "Up to 4 short paragraphs + up to 4 citations",
    350,
    [
      "Paragraph 1: Broad expertise and relevance to proposed project",
      "Paragraph 2: Specific relevant experience, skills, or accomplishments",
      "Paragraph 3: Commitment to research area and relevant collaborations",
      "Paragraph 4 (optional): Gaps or unique circumstances",
      "List up to 4 peer-reviewed publications or research products with PMID",
    ],
    `[Paragraph 1: Describe your broad expertise and how it relates to the proposed project.]

[Paragraph 2: Highlight specific relevant experience, skills, or accomplishments.]

[Paragraph 3: Describe your commitment to the research area and any relevant collaborations.]

[Paragraph 4 (optional): Address any gaps or unique circumstances.]

Citations (up to 4):
[Author(s). Title. Journal. Year;Volume(Issue):Pages. PMID: XXXXXXXX.]`,
  ),
  section(
    "bio_b_positions",
    "Section B: Positions, Appointments & Honors",
    "Positions, memberships, honors tables",
    250,
    [
      "Positions and scientific appointments (dates, title, institution)",
      "Other experiences and professional memberships",
      "Honors with dates",
    ],
    `Positions and Scientific Appointments
Dates | Position Title | Institution/Organization
[YYYY–Present] | [Associate Professor of Medicine] | [Institution]

Other Experiences and Professional Memberships
Dates | Role | Organization
[YYYY–Present] | [Editorial Board Member] | [Journal Name]

Honors
Date | Honor
[YYYY] | [Young Investigator Award, AHA]`,
  ),
  section(
    "bio_c_contribution_1",
    "Section C: Contribution 1",
    "Narrative + up to 4 supporting citations",
    200,
    [
      "Descriptive title for the contribution",
      "One paragraph: significance, your specific role, impact on the field",
      "Up to 4 publications or research products",
    ],
    `Contribution 1: [Descriptive Title]
[Narrative paragraph describing the contribution, its significance, and your specific role.]

[Author(s). Title. Journal. Year;Volume(Issue):Pages. PMID: XXXXXXXX.]`,
  ),
  section(
    "bio_c_contribution_2",
    "Section C: Contribution 2",
    "Narrative + up to 4 supporting citations",
    200,
    ["Same structure as Contribution 1"],
    `Contribution 2: [Descriptive Title]\n[Narrative paragraph.]\n[Citations…]`,
  ),
  section(
    "bio_c_contribution_3",
    "Section C: Contribution 3",
    "Narrative + up to 4 supporting citations",
    200,
    ["Same structure as Contribution 1"],
    `Contribution 3: [Descriptive Title]\n[Narrative paragraph.]\n[Citations…]`,
  ),
  section(
    "bio_c_contribution_4",
    "Section C: Contribution 4",
    "Narrative + up to 4 supporting citations",
    200,
    ["Same structure as Contribution 1"],
    `Contribution 4: [Descriptive Title]\n[Narrative paragraph.]\n[Citations…]`,
  ),
  section(
    "bio_c_contribution_5",
    "Section C: Contribution 5",
    "Narrative + up to 4 supporting citations",
    200,
    ["Same structure as Contribution 1"],
    `Contribution 5: [Descriptive Title]\n[Narrative paragraph.]\n[Citations…]`,
  ),
  section(
    "bio_c_bibliography",
    "Section C: Complete Published Work",
    "My Bibliography or SciENcv link",
    40,
    ["Link to My Bibliography or SciENcv profile URL"],
    "Complete List of Published Work:\n[Link to My Bibliography or SciENcv: URL]",
  ),
  section(
    "bio_d_research_support",
    "Section D: Research Support",
    "Ongoing and completed grants with role descriptions",
    300,
    [
      "Ongoing research support: grant number, PI, title, dates, annual direct costs",
      "Brief description of major goals and your role; note overlap with proposed project",
      "Completed research support with brief descriptions",
    ],
    `Ongoing Research Support
Grant Number | PI Name | Project Title | Dates | Annual Direct Costs
[R01 HL123456] | [PI Name] | [Title] | [MM/YY–MM/YY] | [$XXX,XXX]
[Brief description of goals and your role.]

Completed Research Support
Grant Number | PI Name | Project Title | Dates
[K23 HL654321] | [PI Name] | [Title] | [MM/YY–MM/YY]`,
  ),
];

export const INSTITUTIONAL_CV_SECTIONS: CoreDocumentSectionDef[] = [
  section(
    "cv_header",
    "Header & Contact",
    "Name, department, institution, contact, ORCID, last updated",
    80,
    ["Full name and degrees", "Department, division, institution", "Address, phone, email", "ORCID iD", "Last updated date"],
    `[Full Name, Degree(s)]
Department of [Department], Division of [Division]
[Institution Name]
Address: [Street, City, State, ZIP]
Phone: [Phone] | Email: [Email]
ORCID: [ORCID iD]
Last Updated: [Month Year]`,
  ),
  section(
    "cv_education_training",
    "Education & Postgraduate Training",
    "Degrees and training timeline",
    150,
    ["Education table: dates, degree, institution, field", "Postgraduate training: internship, residency, fellowship"],
    `Education
Dates | Degree | Institution | Field

Postgraduate Training
Dates | Training Type | Institution | Specialty`,
  ),
  section(
    "cv_licensure",
    "Licensure & Certification",
    "Medical license, DEA, board certification",
    100,
    ["Medical license(s) with number and status", "DEA registration", "Board and subspecialty certification with dates"],
    `Medical License: [State], License #[Number], [Status]
DEA Registration: [Number], [Expiration]
Board Certification: [Board], [Specialty], [Date Certified]`,
  ),
  section(
    "cv_academic_appointments",
    "Academic Appointments",
    "Faculty titles and institutions",
    120,
    ["Dates, title, department, institution for each appointment"],
    `Dates | Title | Department | Institution
[YYYY–Present] | [Current Title] | [Department] | [Institution]`,
  ),
  section(
    "cv_hospital_administrative",
    "Hospital & Administrative Appointments",
    "Clinical and program leadership roles",
    120,
    ["Medical director, program director, and other administrative titles"],
    `Dates | Title | Institution/Organization`,
  ),
  section(
    "cv_honors_awards",
    "Honors & Awards",
    "Chronological awards",
    100,
    ["Date, award name, granting organization"],
    `Date | Award | Granting Organization`,
  ),
  section(
    "cv_memberships",
    "Professional Society Memberships",
    "Roles in professional organizations",
    80,
    ["Dates, role (Fellow, Member), society name"],
    `Dates | Role | Society`,
  ),
  section(
    "cv_funding",
    "Funding & Grants",
    "Active, completed, and pending grants",
    200,
    ["Active grants: dates, agency/grant #, title, role, costs", "Completed and pending grants"],
    `Active
Dates | Agency/Grant # | Title | Role | Total/Annual Costs

Completed
Dates | Agency/Grant # | Title | Role | Total Costs

Pending
Dates | Agency/Grant # | Title | Role | Total Costs`,
  ),
  section(
    "cv_publications",
    "Publications",
    "By type — bold your name; Vancouver/ICMJE with PMID/DOI",
    400,
    [
      "Peer-reviewed original research",
      "Reviews, editorials, commentaries",
      "Book chapters",
      "Guidelines and consensus statements",
      "Letters and case reports",
      "Non–peer-reviewed publications",
    ],
    `Peer-Reviewed Original Research
[Author(s). Title. Journal. Year;Volume(Issue):Pages. PMID: XXXXXXXX.]

Reviews, Editorials, and Commentaries
[...]`,
  ),
  section(
    "cv_publication_metrics",
    "Publication Metrics (optional)",
    "h-index, i10-index, total citations",
    40,
    ["Total peer-reviewed publications", "h-index and i10-index", "Total citations"],
    `Total peer-reviewed publications: [#]
h-index: [#] | i10-index: [#]
Total citations: [#]`,
  ),
  section(
    "cv_presentations",
    "Presentations",
    "Invited, national/international, and regional",
    200,
    ["Invited lectures and visiting professorships", "National/international meeting presentations", "Regional and local presentations"],
    `Invited Lectures and Visiting Professorships
Date | Title | Venue/Institution | Type

National and International Meeting Presentations
Date | Title | Meeting | Type`,
  ),
  section(
    "cv_teaching",
    "Teaching",
    "Courses, clinical teaching, curriculum development",
    180,
    ["Formal courses and didactics", "Clinical teaching roles and learner levels", "Curriculum development projects"],
    `Formal Courses and Didactics
Dates | Course/Lecture Title | Audience | Institution

Clinical Teaching
Dates | Role | Setting | Learner Level

Curriculum Development
Dates | Project | Scope`,
  ),
  section(
    "cv_mentorship",
    "Mentorship",
    "Graduate, resident/fellow, and medical student mentees",
    150,
    ["Mentee name, level, dates, current position or outcome"],
    `Graduate and Postdoctoral Mentees
Dates | Name | Level | Current Position

Resident and Fellow Mentees
Dates | Name | Level | Current Position

Medical Student Mentees
Dates | Name | Project/Role | Outcome`,
  ),
  section(
    "cv_service",
    "Service",
    "Institutional, national, peer review, community",
    180,
    ["Institutional committees", "National/international service", "Peer review activities", "Community service"],
    `Institutional Committees
Dates | Committee | Role

National and International Service
Dates | Organization/Activity | Role

Peer Review Activities
Dates | Journal/Agency | Role`,
  ),
  section(
    "cv_clinical_summary",
    "Clinical Activity Summary (optional)",
    "Volume metrics for academic CV",
    80,
    ["Annual patient encounters, procedures, wRVUs with time period"],
    `Metric | Value | Time Period
[e.g., Annual patient encounters] | [#] | [YYYY]`,
  ),
];

export const TEACHING_PORTFOLIO_SECTIONS: CoreDocumentSectionDef[] = [
  section(
    "tp_philosophy",
    "Part 1: Teaching Philosophy Statement",
    "1–2 pages on approach to medical education",
    600,
    [
      "Core beliefs about how learners develop clinical competence",
      "Teaching methods and why (case-based, simulation, bedside, flipped classroom)",
      "Inclusive learning environment for diverse learners",
      "Assessment and feedback practices",
      "Evolution of teaching based on reflection and feedback",
      "Future goals as an educator",
    ],
    `[Write 1–2 pages describing your approach to medical education…]`,
  ),
  section(
    "tp_responsibilities",
    "Part 2: Teaching Responsibilities",
    "Didactic, clinical, simulation, small group, mentee teaching",
    350,
    [
      "Classroom and didactic teaching table",
      "Clinical teaching settings and learner levels",
      "Simulation and procedural teaching",
      "Small group facilitation",
      "Graduate/research mentee teaching",
      "Other teaching activities (board review, CME, podcasts)",
    ],
    `A. Classroom and Didactic Teaching
Academic Year | Course Title | Audience | # Learners | Hours/Year | Role

B. Clinical Teaching
Academic Year | Setting | Learner Level | Weeks/Year | Role`,
  ),
  section(
    "tp_curriculum",
    "Part 3: Curriculum Development & Innovation",
    "Projects with context, outcomes, dissemination",
    400,
    [
      "For each project: dates, context/need, description, target learners",
      "Assessment strategy and outcomes/impact",
      "Dissemination (presentations, publications, MedEdPORTAL)",
    ],
    `Project 1: [Title]
Dates: [YYYY–YYYY]
Context/Need: [What gap did this address?]
Description: [What was developed?]
Outcomes/Impact: [Evaluation data, adoption]
Dissemination: [Presentations, publications]`,
  ),
  section(
    "tp_assessment",
    "Part 4: Learner Assessment & Feedback",
    "Formative and summative methods",
    250,
    [
      "Formative assessment methods (mini-CEX, direct observation)",
      "Summative assessment (OSCE, exam questions)",
      "Feedback practices and assessment tools developed",
    ],
    `[Describe your approach to assessing learners and providing feedback…]`,
  ),
  section(
    "tp_evaluations",
    "Part 5: Teaching Evaluations & Effectiveness",
    "Quantitative, qualitative, peer, and other evidence",
    350,
    [
      "Quantitative summary of learner evaluations vs institutional mean",
      "Qualitative feedback themes with representative quotes",
      "Peer evaluations of teaching",
      "Other evidence: board pass rates, match results, pre/post assessments",
    ],
    `A. Quantitative Summary of Learner Evaluations
Academic Year | Course/Rotation | # Respondents | Overall Rating | Institutional Mean

B. Qualitative Feedback Themes
Strengths identified by learners:
[...]`,
  ),
  section(
    "tp_educational_scholarship",
    "Part 6: Educational Scholarship",
    "Publications, presentations, MedEdPORTAL, grants, invited talks",
    300,
    [
      "Peer-reviewed educational publications",
      "Educational abstracts and presentations",
      "MedEdPORTAL or open educational resources",
      "Educational grants",
      "Invited educational talks",
    ],
    `A. Peer-Reviewed Educational Publications
[Author(s). Title. Journal. Year. PMID/DOI.]

D. Educational Grants
Dates | Agency | Title | Role | Amount`,
  ),
  section(
    "tp_mentorship",
    "Part 7: Mentorship",
    "Philosophy and mentorship record with outcomes",
    250,
    [
      "Brief mentorship philosophy",
      "Mentorship record: dates, name, level, focus, current position",
      "Mentee achievements summary",
    ],
    `A. Mentorship Philosophy
[Brief statement on your approach to mentoring.]

B. Mentorship Record
Dates | Mentee Name | Level at Start | Focus | Current Position`,
  ),
  section(
    "tp_professional_development",
    "Part 8: Professional Development in Education",
    "Courses, workshops, teaching scholars programs",
    120,
    ["Date, activity, sponsor for each educational development experience"],
    `Date | Activity | Sponsor
[YYYY] | [Harvard Macy Institute Program] | [Sponsor]`,
  ),
  section(
    "tp_leadership_service",
    "Part 9: Educational Leadership & Service",
    "Directorships, committees, NBME, journal review",
    150,
    ["Clerkship/program directorships", "Medical education committees", "National educational service"],
    `Dates | Role | Organization/Institution
[YYYY–Present] | [Clerkship Director] | [Institution]`,
  ),
  section(
    "tp_awards",
    "Part 10: Teaching Awards",
    "Teaching-specific honors",
    80,
    ["Date, award, granting organization"],
    `Date | Award | Granting Organization`,
  ),
  section(
    "tp_future_goals",
    "Part 11: Future Educational Goals",
    "3–5 year educational vision",
    300,
    [
      "New curricula or programs to develop",
      "Educational scholarship plans",
      "Leadership roles aspired to",
      "Skills or training to acquire",
      "How you will measure impact",
    ],
    `[Write 1–2 paragraphs on educational goals for the next 3–5 years…]`,
  ),
];

export const ACADEMIC_CORE_DOCUMENTS: CoreDocumentDef[] = [
  {
    id: "nih_biosketch",
    label: "NIH Biosketch",
    description:
      "Updated NIH format — Personal Statement, Positions & Honors, Contributions to Science, Research Support. Use SciENcv for official submissions.",
    formattingNotes: NIH_BIOSKETCH_FORMATTING,
    sections: NIH_BIOSKETCH_SECTIONS,
  },
  {
    id: "institutional_cv",
    label: "Institutional CV",
    description:
      "Comprehensive academic medicine CV — education through clinical activity. Adapt to your Office of Faculty Affairs requirements.",
    formattingNotes: INSTITUTIONAL_CV_FORMATTING,
    sections: INSTITUTIONAL_CV_SECTIONS,
  },
  {
    id: "teaching_portfolio",
    label: "Teaching Portfolio",
    description:
      "Philosophy, responsibilities, curriculum innovation, evaluations, educational scholarship, and leadership — essential for clinician-educator promotion.",
    formattingNotes: TEACHING_PORTFOLIO_FORMATTING,
    sections: TEACHING_PORTFOLIO_SECTIONS,
  },
];

export function getCoreDocumentDef(documentId: AcademicCoreDocumentId): CoreDocumentDef {
  return ACADEMIC_CORE_DOCUMENTS.find((d) => d.id === documentId) ?? ACADEMIC_CORE_DOCUMENTS[0]!;
}

export function getSectionsForDocument(documentId: AcademicCoreDocumentId): CoreDocumentSectionDef[] {
  return getCoreDocumentDef(documentId).sections;
}

export function documentSectionById(sectionId: string): CoreDocumentSectionDef | undefined {
  for (const doc of ACADEMIC_CORE_DOCUMENTS) {
    const found = doc.sections.find((s) => s.id === sectionId);
    if (found) return found;
  }
  return undefined;
}

export function documentIdForSection(sectionId: string): AcademicCoreDocumentId | undefined {
  for (const doc of ACADEMIC_CORE_DOCUMENTS) {
    if (doc.sections.some((s) => s.id === sectionId)) return doc.id;
  }
  return undefined;
}

export function normalizeCoreDocumentId(input?: string | null): AcademicCoreDocumentId {
  if (input === "biosketch") return "nih_biosketch";
  if (input === "institutional_cv" || input === "cv_academic") return "institutional_cv";
  if (input === "teaching_portfolio") return "teaching_portfolio";
  if (input && ACADEMIC_CORE_DOCUMENTS.some((d) => d.id === input)) {
    return input as AcademicCoreDocumentId;
  }
  return "nih_biosketch";
}

export function completionForDocumentSection(content: string, targetWords: number): number {
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  if (!targetWords) return content.trim() ? 100 : 0;
  return Math.min(100, Math.round((words / targetWords) * 100));
}

export function assembleFullDocument(
  documentId: AcademicCoreDocumentId,
  sections: Record<string, { content?: string }>,
): string {
  const doc = getCoreDocumentDef(documentId);
  const lines: string[] = [doc.label, doc.description, ""];

  for (const def of doc.sections) {
    const content = sections[def.id]?.content?.trim();
    lines.push(`## ${def.title}`);
    lines.push(def.subtitle);
    lines.push("");
    lines.push(content || `[${def.title} — not yet drafted]`);
    lines.push("");
  }

  lines.push("## Formatting Notes");
  for (const note of doc.formattingNotes) {
    lines.push(`• ${note}`);
  }

  return lines.join("\n");
}

export function buildDocumentMakContext(
  documentId: AcademicCoreDocumentId,
  sectionTitle?: string,
): string {
  const doc = getCoreDocumentDef(documentId);
  const sectionNote = sectionTitle ? `Current section: ${sectionTitle}.` : "";
  return `${doc.label} — ${doc.description}
${sectionNote}
Use Career Data vault evidence; do not invent publications or grants.
For NIH Biosketch, emphasize contributions to science narratives over publication lists.
For teaching portfolio, emphasize evidence of effectiveness and educational scholarship.
Never cite internal framework names.`;
}

export function prefillDocumentSection(
  sectionId: string,
  input?: { name?: string; specialty?: string; rank?: string | null },
): string {
  const def = documentSectionById(sectionId);
  if (!def) return "";
  if (sectionId === "bio_a_identification" || sectionId === "cv_header") {
    return def.placeholder
      .replace("[Full Name, Degrees]", input?.name ? `${input.name}` : "[Full Name, Degrees]")
      .replace("[Department]", input?.specialty ? `Department of ${input.specialty}` : "[Department]");
  }
  return def.placeholder;
}

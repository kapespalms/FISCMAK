/**
 * Physician industry career transition — recruiting sectors, resume templates,
 * pivot cover letters, and stage positioning guide.
 */

import {
  normalizeCareerNarrativeStage,
  type CareerNarrativeStageId,
} from "@/lib/v2/career-narrative-templates";

export type IndustryCareerStageId = CareerNarrativeStageId;

export type IndustrySectorId =
  | "ai_health_tech"
  | "pharma_biotech"
  | "medical_devices"
  | "management_consulting"
  | "venture_capital_pe"
  | "health_insurance"
  | "government_regulatory"
  | "legal_expert_witness"
  | "medical_communications"
  | "healthcare_administration";

export type IndustryDocumentType = "industry_resume" | "industry_cover_letter";

export type IndustrySectionDef = {
  id: string;
  title: string;
  subtitle: string;
  targetWords: number;
  prompts: string[];
  placeholder: string;
};

export const INDUSTRY_TRANSITION_TIPS = [
  "Academic CV → industry resume: strip to relevant highlights; condense publications to Selected Publications",
  "Quantify everything — 'Reduced readmissions by 18%' beats 'Participated in QI'",
  "Tailor each application — pharma resume differs from consulting or AI startup resume",
  "Network before applying — DocPhin, SEAK, Physicians in Tech, industry-specific groups",
  "Lead with impact, not duties — industry recruiters spend 6–10 seconds on initial screening",
  "Keep industry resume 1–2 pages; maintain full academic CV separately for academia",
];

export const INDUSTRY_RECRUITING_SECTORS: Array<{
  id: IndustrySectorId;
  label: string;
  roles: string;
  hasDetailedResumeTemplate: boolean;
}> = [
  {
    id: "ai_health_tech",
    label: "AI & Health Technology",
    roles: "Clinical AI, algorithm validation, clinical informatics, digital health startups, AI safety/ethics",
    hasDetailedResumeTemplate: true,
  },
  {
    id: "pharma_biotech",
    label: "Pharmaceutical & Biotechnology",
    roles: "Medical affairs, clinical development, pharmacovigilance, MSL",
    hasDetailedResumeTemplate: true,
  },
  {
    id: "medical_devices",
    label: "Medical Devices & Diagnostics",
    roles: "Clinical research, product development, regulatory affairs, medical advisory",
    hasDetailedResumeTemplate: true,
  },
  {
    id: "management_consulting",
    label: "Management Consulting",
    roles: "Healthcare strategy (McKinsey, BCG, Bain), life sciences consulting",
    hasDetailedResumeTemplate: true,
  },
  {
    id: "venture_capital_pe",
    label: "Venture Capital & Private Equity",
    roles: "Healthcare investing, due diligence, portfolio company advising",
    hasDetailedResumeTemplate: true,
  },
  {
    id: "health_insurance",
    label: "Health Insurance & Managed Care",
    roles: "Utilization management, medical director, population health, policy",
    hasDetailedResumeTemplate: false,
  },
  {
    id: "government_regulatory",
    label: "Government & Regulatory",
    roles: "FDA, CDC, NIH, CMS, public health policy, WHO",
    hasDetailedResumeTemplate: false,
  },
  {
    id: "legal_expert_witness",
    label: "Legal & Expert Witness",
    roles: "Medical-legal consulting, patent law, malpractice review",
    hasDetailedResumeTemplate: false,
  },
  {
    id: "medical_communications",
    label: "Medical Communications & Publishing",
    roles: "Medical writing, CME development, editorial roles",
    hasDetailedResumeTemplate: false,
  },
  {
    id: "healthcare_administration",
    label: "Healthcare Administration & Operations",
    roles: "Hospital leadership, CMO/CQO, health system strategy",
    hasDetailedResumeTemplate: false,
  },
];

export const INDUSTRY_COVER_LETTER_TIPS: Record<IndustrySectorId, string[]> = {
  ai_health_tech: [
    "Emphasize clinical workflow knowledge, data literacy, clinical-to-technical translation",
    "Mention AI/ML projects, algorithm validation, or informatics coursework",
  ],
  pharma_biotech: [
    "Emphasize therapeutic area expertise, trial experience, KOL relationships",
    "Name drugs or indications relevant to the company's pipeline",
  ],
  medical_devices: [
    "Emphasize procedural volume, hands-on device experience, proctoring roles",
    "Reference regulatory pathways (IDE, PMA, 510(k)); name device categories",
  ],
  management_consulting: [
    "Use consulting language: stakeholder alignment, strategic recommendations",
    "Quantify project outcomes; emphasize analytical and communication skills",
  ],
  venture_capital_pe: [
    "Emphasize deal evaluation, market knowledge, startup advisory experience",
    "Assess clinical and commercial viability of healthcare investments",
  ],
  health_insurance: [
    "Emphasize utilization review, population health, evidence-based medicine",
    "Understanding of payer-provider dynamics",
  ],
  government_regulatory: [
    "Emphasize public health, policy knowledge, population-level thinking",
    "Prior government or advisory committee work",
  ],
  legal_expert_witness: [
    "Emphasize case review experience, standard-of-care expertise, testimony readiness",
    "Clear communication of complex medicine to non-clinical audiences",
  ],
  medical_communications: [
    "Emphasize writing portfolio, CME development, scientific communication",
    "Publications and presentation record tailored to audience",
  ],
  healthcare_administration: [
    "Emphasize operational leadership, quality metrics, financial stewardship",
    "System-level outcomes and physician engagement",
  ],
};

type StageBand = "med_student" | "resident" | "fellow" | "early_attending" | "mid_career" | "legacy_attending";

export const INDUSTRY_STAGE_POSITIONING: Record<
  StageBand,
  {
    label: string;
    strengths: string[];
    commonRoles: string[];
    resumeTips: string[];
    bestIndustries: IndustrySectorId[];
  }
> = {
  med_student: {
    label: "Medical Student",
    strengths: [
      "Research (data science, AI, clinical trials)",
      "Technical skills (programming, bioinformatics)",
      "Leadership in student orgs, advocacy, innovation",
      "Adaptability and willingness to learn",
    ],
    commonRoles: [
      "Internships (consulting, pharma, health tech, VC)",
      "Research associate or clinical annotator (AI)",
      "Medical writing (freelance or part-time)",
      "Startup co-founder or early team member",
    ],
    resumeTips: [
      "1-page resume, not a CV",
      "Lead with education and research, not clinical rotations",
      "Highlight hackathons, case competitions, entrepreneurship",
      "Prominent Technical Skills section if applicable",
    ],
    bestIndustries: ["ai_health_tech", "management_consulting", "medical_communications"],
  },
  resident: {
    label: "Resident",
    strengths: [
      "High-volume clinical experience and pattern recognition",
      "QI and systems-based practice projects",
      "Teaching and mentorship",
      "Granular clinical workflow understanding",
    ],
    commonRoles: [
      "Clinical domain expert (AI, health tech — part-time)",
      "MSL (especially PGY-3+)",
      "Clinical development associate (pharma)",
      "Medical writing (moonlighting)",
      "Government fellowships (Health Policy, CDC EIS)",
    ],
    resumeTips: [
      "1–2 pages maximum",
      "Quantify clinical volume and QI outcomes",
      "Highlight industry-adjacent experience (advisory, consulting)",
      "Keep research concise",
    ],
    bestIndustries: ["ai_health_tech", "pharma_biotech", "management_consulting", "government_regulatory"],
  },
  fellow: {
    label: "Fellow",
    strengths: [
      "Deep subspecialty expertise — primary differentiator",
      "Research portfolio (translational or industry-sponsored)",
      "Procedural skills (for device roles)",
      "Emerging KOL status in niche area",
    ],
    commonRoles: [
      "Medical Director (pharma/biotech — therapeutic area match)",
      "Clinical Development Lead",
      "Clinical domain expert (AI)",
      "Medical advisor (devices, diagnostics)",
      "VC analyst or associate",
    ],
    resumeTips: [
      "1–2 pages for industry resume; keep academic CV separate",
      "Lead with subspecialty expertise and therapeutic area",
      "Highlight industry-sponsored trial involvement",
      "Name relevant conferences and KOL connections",
    ],
    bestIndustries: ["pharma_biotech", "medical_devices", "ai_health_tech", "venture_capital_pe"],
  },
  early_attending: {
    label: "Early-Career Attending (0–7 Years)",
    strengths: [
      "Board certification and active clinical practice",
      "Fresh training with up-to-date knowledge",
      "Energy and flexibility for transition",
      "Growing publication record and network",
    ],
    commonRoles: ["All industries accessible — optimal transition window"],
    resumeTips: [
      "1–2 pages; results-oriented",
      "Balance clinical achievements with industry-relevant experience",
      "Highlight advisory, consulting, or startup involvement",
      "Consider MBA, informatics certificate, or similar credentials",
    ],
    bestIndustries: [
      "ai_health_tech",
      "pharma_biotech",
      "medical_devices",
      "management_consulting",
      "venture_capital_pe",
      "health_insurance",
    ],
  },
  mid_career: {
    label: "Mid-Career Attending (8–20 Years)",
    strengths: [
      "Established reputation and referral network",
      "Leadership (department, committee, institutional)",
      "Mentorship track record",
      "Operational and financial understanding of healthcare",
    ],
    commonRoles: [
      "Senior Medical Director (pharma, biotech, insurance)",
      "VP (health tech, digital health)",
      "Principal/Partner-track (consulting)",
      "Venture Partner (VC)",
      "CMO (startups, mid-size companies)",
      "Expert witness and medical-legal consulting",
    ],
    resumeTips: [
      "2 pages maximum; highly curated",
      "Lead with leadership and impact, not clinical volume",
      "Quantify institutional or system-level outcomes",
      "Include board and advisory roles prominently",
    ],
    bestIndustries: [
      "management_consulting",
      "venture_capital_pe",
      "health_insurance",
      "healthcare_administration",
      "ai_health_tech",
    ],
  },
  legacy_attending: {
    label: "Legacy Attending (20+ Years)",
    strengths: [
      "National or international reputation",
      "Society leadership and guideline authorship",
      "Extensive KOL network",
      "Board-level credibility and policy influence",
    ],
    commonRoles: [
      "Board of Directors (public and private companies)",
      "CMO (large organizations)",
      "Senior Advisor or Venture Partner (VC/PE)",
      "Government appointments (FDA, NIH study sections)",
      "Expert witness (high-profile cases)",
    ],
    resumeTips: [
      "2 pages for industry resume; separate full academic CV",
      "Lead with highest-impact roles and recognitions",
      "Emphasize influence, not volume",
      "Selected Honors & Awards section",
      "1-page executive bio for board and advisory roles",
    ],
    bestIndustries: [
      "venture_capital_pe",
      "government_regulatory",
      "legal_expert_witness",
      "healthcare_administration",
    ],
  },
};

function sec(
  id: string,
  title: string,
  subtitle: string,
  targetWords: number,
  prompts: string[],
  placeholder: string,
): IndustrySectionDef {
  return { id, title, subtitle, targetWords, prompts, placeholder };
}

const HEADER = `[FULL NAME], MD [Additional Degrees]
[City, State] | [Email] | [Phone] | [LinkedIn URL]`;

function baseResumeSections(industryBlock: {
  title: string;
  prompts: string[];
  placeholder: string;
}): IndustrySectionDef[] {
  return [
    sec("ir_header", "Header & Contact", "Name, degrees, contact, LinkedIn", 40, ["Full name and degrees", "City, state, email, phone", "LinkedIn; GitHub/portfolio if AI/tech"], HEADER),
    sec(
      "ir_summary",
      "Professional Summary",
      "3–4 lines — career stage, specialty, domain, target role",
      80,
      [
        "Career stage and years of clinical experience",
        "2–3 relevant domains for target industry",
        "What you seek to leverage in industry role",
      ],
      "[Career stage]-level physician with [X] years of clinical experience in [Specialty]. Expertise in [2–3 domains]. Seeking to leverage deep clinical domain knowledge to advance [industry-specific goal].",
    ),
    sec(
      "ir_competencies",
      "Core Competencies",
      "6–8 bullet skills tailored to industry",
      60,
      ["Industry-relevant skills only", "Use keywords from job posting", "Mix clinical and transferable skills"],
      "• Clinical Workflow & Decision-Making\n• [Industry Skill 1]\n• [Industry Skill 2]\n• Cross-Functional Leadership\n• Data-Driven Quality Improvement",
    ),
    sec(
      "ir_experience_current",
      "Professional Experience — Current Role",
      "Achievements with quantified impact, not duties",
      120,
      [
        "Achievement with quantified impact (not duty list)",
        "Bridge clinical work to industry-relevant outcomes",
        "Clinical volume only if relevant to role",
      ],
      "[Current Role] | [Institution], [City, State] | [Start] – Present\n\n• [Achievement with quantified impact]\n• [Achievement bridging clinical → industry value]\n• [Achievement]",
    ),
    sec(
      "ir_experience_previous",
      "Professional Experience — Previous",
      "Prior roles with quantified achievements",
      100,
      ["Prior clinical or industry roles", "Quantify outcomes", "Focus on transferable accomplishments"],
      "[Previous Role] | [Institution/Company] | [Dates]\n\n• [Achievement]\n• [Achievement]",
    ),
    sec("ir_industry_block", industryBlock.title, "Industry-specific experience block", 100, industryBlock.prompts, industryBlock.placeholder),
    sec(
      "ir_education",
      "Education & Training",
      "Fellowship, residency, medical school, additional degrees",
      80,
      ["Fellowship, residency, MD/DO", "MBA, MPH, MS prominently if relevant"],
      "[Fellowship], [Subspecialty] | [Institution] | [Year]\n[Residency], [Specialty] | [Institution] | [Year]\n[MD/DO] | [Medical School] | [Year]",
    ),
    sec(
      "ir_board_licensure",
      "Board Certification & Licensure",
      "Board certs, informatics cert if applicable, state licenses",
      40,
      ["Board certification", "Additional certifications", "State medical license(s)"],
      "[Board Certification, e.g., ABIM — Internal Medicine]\n[State Medical License(s)]",
    ),
    sec(
      "ir_publications",
      "Selected Publications & Presentations",
      "3–5 most relevant; note full list available upon request",
      80,
      ["Limit to 3–7 most industry-relevant", "Full list available upon request", "Conference talks if relevant"],
      "[Author(s). Title. Journal. Year;Volume:Pages.]\n[Limit to 3–5; note 'Full publication list available upon request']",
    ),
    sec(
      "ir_leadership_advisory",
      "Leadership, Service & Advisory Roles",
      "Committees, advisory boards, society roles",
      60,
      ["Advisory board roles", "Innovation or governance committees", "Professional society roles"],
      "• [Role, e.g., Advisor, Digital Health Startup]\n• [Role, e.g., Chair, AI Governance Committee]",
    ),
  ];
}

const INDUSTRY_RESUME_BLOCKS: Record<
  IndustrySectorId,
  { title: string; prompts: string[]; placeholder: string; extraSections?: IndustrySectionDef[] }
> = {
  ai_health_tech: {
    title: "AI & Technology Experience",
    prompts: [
      "Clinical domain expert for AI algorithm development",
      "Dataset curation, algorithm validation, CDS implementation",
      "FDA SaMD, HIPAA, AI/ML coursework or capstone projects",
    ],
    placeholder:
      "[Project/Role] | [Organization] | [Dates]\n\n• Served as clinical domain expert for [FDA-cleared AI application]\n• Collaborated on [N]+ clinical datasets for ML training\n• [Coursework/certificate in ML if applicable]",
    extraSections: [
      sec(
        "ir_technical_skills",
        "Technical Skills (if applicable)",
        "Programming, tools, platforms — optional for clinical domain expert roles",
        50,
        [
          "Note: many physician AI roles are clinical domain expert — coding not required",
          "Python, R, SQL if applicable",
          "Epic, Cerner, FHIR/HL7, cloud platforms",
        ],
        "Programming: [Python, R, SQL]\nTools: [Jupyter, FHIR/HL7]\nPlatforms: [Epic, AWS Healthcare API]",
      ),
    ],
  },
  pharma_biotech: {
    title: "Research & Clinical Trials Experience",
    prompts: [
      "PI/Sub-I for industry-sponsored trials",
      "Therapeutic area expertise and protocol development",
      "IRB/ethics committee roles",
    ],
    placeholder:
      "PI / Sub-I for [Trial Name], [Sponsor] — [Phase, therapeutic area]\n[Additional trial experience]",
  },
  medical_devices: {
    title: "Device Industry Experience",
    prompts: [
      "Clinical advisory board or consultant roles",
      "IDE submission contribution, proctor/trainer roles",
      "Institutional device evaluation and procurement influence",
    ],
    placeholder:
      "Clinical Advisory Board Member, [Company], [Dates]\nConsultant — contributed to IDE submission for [device]",
    extraSections: [
      sec(
        "ir_patents",
        "Patents & Intellectual Property (if applicable)",
        "Patents related to devices or techniques",
        40,
        ["Patent title, number, status"],
        "[Patent title, number, status]",
      ),
    ],
  },
  management_consulting: {
    title: "Case Competition & Consulting Experience",
    prompts: [
      "Case competitions (McKinsey Healthcare Hackathon, etc.)",
      "Pro bono consulting for nonprofits or startups",
      "C-suite presentations and strategic recommendations",
    ],
    placeholder:
      "Finalist, [Case Competition], [Year]\nAdvised [nonprofit/startup] on [healthcare strategy topic]",
    extraSections: [
      sec(
        "ir_additional",
        "Additional",
        "Languages, technical skills, relevant interests",
        40,
        ["Excel, Tableau, SQL", "Languages", "Health policy or global health interests"],
        "Languages: [Languages]\nTechnical: [Excel, Tableau, SQL]",
      ),
    ],
  },
  venture_capital_pe: {
    title: "Investment & Advisory Experience",
    prompts: [
      "Clinical due diligence on healthcare deals",
      "Startup advisory contributing to fundraise or FDA clearance",
      "Technology evaluation influencing purchasing decisions",
    ],
    placeholder:
      "Clinical Advisor, [Startup] — contributed to [Series A / FDA clearance]\nEvaluated [N] healthcare investment opportunities in [sector]",
  },
  health_insurance: {
    title: "Payer & Population Health Experience",
    prompts: [
      "Utilization review or medical director experience",
      "Population health and value-based care initiatives",
      "Evidence synthesis for coverage decisions",
    ],
    placeholder:
      "[Utilization management / population health role with quantified outcomes]",
  },
  government_regulatory: {
    title: "Policy & Public Health Experience",
    prompts: [
      "Public health projects, policy committee work",
      "Government fellowship or advisory roles",
      "Population-level program evaluation",
    ],
    placeholder:
      "[Public health initiative or government advisory role with impact metrics]",
  },
  legal_expert_witness: {
    title: "Medical-Legal Experience",
    prompts: [
      "Case review, standard-of-care analysis",
      "Expert report or testimony experience",
      "Malpractice review committee roles",
    ],
    placeholder:
      "[Medical-legal consulting or expert review experience]",
  },
  medical_communications: {
    title: "Writing & Communications Portfolio",
    prompts: [
      "Medical writing samples, CME development",
      "Editorial or journal roles",
      "Scientific communication for lay audiences",
    ],
    placeholder:
      "[Medical writing portfolio, CME modules developed, editorial roles]",
  },
  healthcare_administration: {
    title: "Administrative & Operational Leadership",
    prompts: [
      "Medical director, service line, or C-suite adjacent roles",
      "Quality, safety, and financial outcomes",
      "Physician engagement and change management",
    ],
    placeholder:
      "[Medical director or operational leadership role with system-level outcomes]",
  },
};

export function getIndustryResumeSections(sectorId: IndustrySectorId): IndustrySectionDef[] {
  const block = INDUSTRY_RESUME_BLOCKS[sectorId];
  const sections = baseResumeSections(block);
  if (block.extraSections) sections.push(...block.extraSections);
  return sections;
}

export function getIndustryCoverLetterSections(): IndustrySectionDef[] {
  return [
    sec(
      "ic_header",
      "Letter Header",
      "Contact block and recipient",
      50,
      ["Your name and degrees", "Recipient and company", "Date"],
      `[Your Name], MD\n[Address]\n[Email] | [Phone]\n[Date]\n\n[Hiring Manager / Hiring Committee]\n[Company Name]`,
    ),
    sec(
      "ic_hook",
      "Paragraph 1 — The Hook",
      "Role, source, credentials, company mission",
      90,
      [
        "Specific job title and company",
        "Board-certified [Specialty] with [X] years experience",
        "Drawn to company's mission — research before writing",
      ],
      "I am writing to express my interest in the [Job Title] position at [Company], as advertised on [Source]. As a board-certified [Specialty] physician with [X] years of experience, I am drawn to [Company]'s mission to [specific mission or recent achievement].",
    ),
    sec(
      "ic_bridge",
      "Paragraph 2 — The Bridge (Clinical → Industry)",
      "Transferable skill with quantified clinical achievement",
      110,
      [
        "Specific transferable skill from clinical career",
        "Concrete achievement with quantified impact",
        "Connect to industry-relevant challenge",
      ],
      "My clinical career has provided me with [transferable skill]. For example, [quantified achievement]. This experience has given me a unique perspective on [industry-relevant challenge].",
    ),
    sec(
      "ic_value",
      "Paragraph 3 — The Value Proposition",
      "What you would contribute; unique qualifications",
      100,
      [
        "Specific project, product, or initiative at company",
        "Value you would add — bridge clinical and technical/business teams",
        "1–2 sentences on unique qualifications",
      ],
      "At [Company], I am excited to contribute to [specific project]. My background in [relevant experience] positions me to [specific value add]. I am particularly well-suited because [unique qualifications].",
    ),
    sec(
      "ic_close",
      "Paragraph 4 — The Close",
      "Availability and enthusiasm",
      50,
      ["Welcome opportunity to discuss", "Contact information"],
      "I would welcome the opportunity to discuss how my clinical expertise and [specific skill] can contribute to [Company]'s goals. I am available at [phone] or [email].\n\nSincerely,\n[Full Name], MD",
    ),
  ];
}

export function getSectionsForIndustryDocument(
  documentType: IndustryDocumentType,
  sectorId: IndustrySectorId,
): IndustrySectionDef[] {
  if (documentType === "industry_cover_letter") return getIndustryCoverLetterSections();
  return getIndustryResumeSections(sectorId);
}

export function industrySectionById(sectionId: string): IndustrySectionDef | undefined {
  for (const sector of INDUSTRY_RECRUITING_SECTORS) {
    for (const s of getIndustryResumeSections(sector.id)) {
      if (s.id === sectionId) return s;
    }
  }
  for (const s of getIndustryCoverLetterSections()) {
    if (s.id === sectionId) return s;
  }
  return undefined;
}

export function normalizeIndustrySector(input?: string | null): IndustrySectorId {
  const valid = INDUSTRY_RECRUITING_SECTORS.map((s) => s.id);
  if (input && valid.includes(input as IndustrySectorId)) return input as IndustrySectorId;
  return "ai_health_tech";
}

export function normalizeIndustryDocumentType(input?: string | null): IndustryDocumentType {
  if (input === "industry_cover_letter" || input === "pivot_cover_letter") return "industry_cover_letter";
  return "industry_resume";
}

export function normalizeIndustryCareerStage(input?: string | null): IndustryCareerStageId {
  return normalizeCareerNarrativeStage(input);
}

export function completionForIndustrySection(content: string, targetWords: number): number {
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  if (!targetWords) return content.trim() ? 100 : 0;
  return Math.min(100, Math.round((words / targetWords) * 100));
}

export function assembleIndustryDocument(input: {
  documentType: IndustryDocumentType;
  sectorId: IndustrySectorId;
  stageId: IndustryCareerStageId;
  sections: Record<string, { content?: string }>;
}): string {
  const sector = INDUSTRY_RECRUITING_SECTORS.find((s) => s.id === input.sectorId)!;
  const stage = INDUSTRY_STAGE_POSITIONING[input.stageId];
  const defs = getSectionsForIndustryDocument(input.documentType, input.sectorId);
  const docLabel =
    input.documentType === "industry_resume"
      ? `Industry Resume — ${sector.label}`
      : `Industry Cover Letter — ${sector.label}`;

  const lines = [docLabel, stage?.label ?? input.stageId, ""];

  for (const def of defs) {
    const content = input.sections[def.id]?.content?.trim();
    lines.push(`## ${def.title}`);
    lines.push(content || `[${def.title} — not yet drafted]`);
    lines.push("");
  }

  return lines.join("\n");
}

export function buildIndustryCareerMakContext(input: {
  documentType: IndustryDocumentType;
  sectorId: IndustrySectorId;
  stageId: IndustryCareerStageId;
  sectionTitle?: string;
  specialty?: string;
}): string {
  const sector = INDUSTRY_RECRUITING_SECTORS.find((s) => s.id === input.sectorId)!;
  const stage = INDUSTRY_STAGE_POSITIONING[input.stageId];
  const docLabel = input.documentType === "industry_resume" ? "Industry resume" : "Industry cover letter";
  return `${docLabel} — ${sector.label} — ${stage?.label ?? input.stageId}.
${input.sectionTitle ? `Section: ${input.sectionTitle}.` : ""}
${input.specialty ? `Specialty: ${input.specialty}.` : ""}
Translate clinical experience into outsider language. Quantify impact. 1–2 pages for resume.
NOT an academic CV. Intentional pivot framing — toward something, not away from medicine.
Never invent metrics. Never cite internal framework names.`;
}

export function enrichIndustrySectionPrompts(
  basePrompts: string[],
  input: {
    documentType: IndustryDocumentType;
    sectorId: IndustrySectorId;
    stageId: IndustryCareerStageId;
    sectionId: string;
  },
): string[] {
  const stage = INDUSTRY_STAGE_POSITIONING[input.stageId];
  const extra: string[] = [];

  if (input.documentType === "industry_resume") {
    extra.push(...(stage?.resumeTips.slice(0, 2) ?? []));
    if (input.sectionId.includes("experience") || input.sectionId.includes("summary")) {
      extra.push("Apply 'So What?' test — connect every bullet to industry value");
      extra.push("Use action verbs with quantified outcomes");
    }
  } else {
    extra.push(...(INDUSTRY_COVER_LETTER_TIPS[input.sectorId]?.slice(0, 2) ?? []));
    if (input.sectionId === "ic_bridge") {
      extra.push("Bridge clinical experience to the specific industry need for this company");
    }
  }

  return [...basePrompts, ...extra];
}

export function mapPivotPathToIndustry(path?: string | null): IndustrySectorId {
  const map: Record<string, IndustrySectorId> = {
    industry_pharma: "pharma_biotech",
    policy_government: "government_regulatory",
    media_communication: "medical_communications",
    entrepreneurship_healthtech: "ai_health_tech",
    consulting: "management_consulting",
  };
  return (path && map[path]) || "ai_health_tech";
}

/**
 * Comprehensive CV cover letter guide — position type × specialty × institutional setting.
 * Powers contextual prompts, Mak context, and wizard guidance panels.
 */

import type { CoverLetterStageId } from "@/lib/v2/cover-letter-templates";

export type CoverLetterPositionTypeId =
  | "academic_medicine"
  | "private_practice"
  | "hospital_employed"
  | "fqhc_community"
  | "locum_tenens"
  | "telehealth"
  | "government_military_va"
  | "startup_industry";

export type CoverLetterInstitutionalSettingId =
  | "large_academic"
  | "community_teaching"
  | "rural_critical_access"
  | "childrens_hospital"
  | "cancer_center"
  | "rehab_ltac"
  | "asc_outpatient"
  | "startup_digital";

export type CoverLetterSpecialtyCategoryId =
  | "primary_care"
  | "surgical"
  | "medical_subspecialty"
  | "emergency_medicine"
  | "anesthesiology"
  | "radiology_pathology"
  | "psychiatry"
  | "ob_gyn"
  | "competitive_specialty"
  | "pm_r"
  | "pediatric_subspecialty"
  | "general";

type StageBand = "trainee" | "early_faculty" | "senior";

function stageBand(stageId: CoverLetterStageId): StageBand {
  if (stageId === "med_student" || stageId === "resident") return "trainee";
  if (stageId === "fellow" || stageId === "early_attending") return "early_faculty";
  return "senior";
}

export const COVER_LETTER_POSITION_TYPES: Array<{
  id: CoverLetterPositionTypeId;
  label: string;
  summary: string;
}> = [
  { id: "academic_medicine", label: "Academic Medicine", summary: "Clinical care, scholarship, and education — weight shifts by stage" },
  { id: "private_practice", label: "Private Practice", summary: "Clinical volume, efficiency, patient satisfaction, cultural fit" },
  { id: "hospital_employed", label: "Hospital-Employed / Health System", summary: "Productivity, system citizenship, organizational alignment" },
  { id: "fqhc_community", label: "FQHC / Community Health", summary: "Mission alignment, health equity, underserved populations" },
  { id: "locum_tenens", label: "Locum Tenens", summary: "Brief, transactional — availability, credentials, adaptability" },
  { id: "telehealth", label: "Telehealth / Digital Health", summary: "Virtual care platforms, remote assessment, multi-state licensure" },
  { id: "government_military_va", label: "Government / Military / VA", summary: "Mission alignment, population-specific experience" },
  { id: "startup_industry", label: "Startup / Industry", summary: "Clinical credibility + business acumen, regulatory awareness" },
];

export const COVER_LETTER_INSTITUTIONAL_SETTINGS: Array<{
  id: CoverLetterInstitutionalSettingId;
  label: string;
  values: string[];
  tips: string[];
}> = [
  {
    id: "large_academic",
    label: "Large Academic Medical Center",
    values: ["Research productivity and funding", "National reputation", "Teaching and mentorship", "Multidisciplinary collaboration", "Institutional governance"],
    tips: [
      "Reference specific research centers, institutes, or cores",
      "Name faculty you would collaborate with",
      "Describe how your research complements existing programs",
      "For leadership: cite US News ranking, NIH funding rank, strategic priorities",
    ],
  },
  {
    id: "community_teaching",
    label: "Community Teaching Hospital",
    values: ["Clinical excellence and volume", "Education without NIH pressure", "QI and patient safety", "Community engagement", "Building programs from the ground up"],
    tips: [
      "Emphasize clinical volume and breadth over research pedigree",
      "Passion for teaching in a clinically immersive environment",
      "QI projects with measurable outcomes",
      "Interest in community health needs assessments",
    ],
  },
  {
    id: "rural_critical_access",
    label: "Rural / Critical Access Hospital",
    values: ["Broad skills, limited resources", "Community commitment and retention", "Telehealth capability", "Multiple hats", "Rural cultural competency"],
    tips: [
      "Breadth of training and procedural versatility",
      "Rural rotations, NHSC obligations, or personal ties",
      "Transfer protocols and independent decision-making",
      "Address retention — why you want rural long-term",
    ],
  },
  {
    id: "childrens_hospital",
    label: "Children's Hospital",
    values: ["Pediatric mission and advocacy", "Family-centered communication", "Pediatric-specific research", "Multidisciplinary coordination", "Child life and psychosocial support"],
    tips: [
      "Lead with passion for pediatric care",
      "Pediatric protocols, dosing, developmental considerations",
      "Advocacy for children's health policy",
      "Pediatric clinical trials and IRB for minors",
    ],
  },
  {
    id: "cancer_center",
    label: "NCI-Designated Cancer Center",
    values: ["Translational research", "Clinical trial accrual", "Tumor board leadership", "Precision medicine", "Survivorship programs"],
    tips: [
      "Reference NCI designation and specific research programs",
      "Clinical trial portfolio (phase I/II/III, cooperative group)",
      "Molecular tumor boards or genomic medicine",
      "For surgical oncologists: complex case volume",
    ],
  },
  {
    id: "rehab_ltac",
    label: "Rehabilitation / LTAC",
    values: ["Goal-oriented care", "Functional outcomes", "Multidisciplinary leadership", "Medically complex patients", "Discharge planning"],
    tips: [
      "Realistic functional goals with patients and families",
      "IRF-PAI documentation and CMS compliance",
      "Lead and motivate interdisciplinary teams",
    ],
  },
  {
    id: "asc_outpatient",
    label: "Ambulatory Surgery Center",
    values: ["Efficiency and throughput", "Patient selection judgment", "Low complications, same-day discharge", "Cost-consciousness", "Patient experience"],
    tips: [
      "Outpatient procedural volume and safety record",
      "Patient selection and risk stratification",
      "ERAS protocols and multimodal analgesia",
      "ASC governance and accreditation experience",
    ],
  },
  {
    id: "startup_digital",
    label: "Startup / Digital Health",
    values: ["Clinical + business acumen", "Ambiguity and rapid iteration", "Regulatory pathways (FDA, HIPAA)", "Clinical-to-product translation", "Non-medical communication"],
    tips: [
      "Lead with the clinical problem you want to solve",
      "Entrepreneurial experience: startups, patents, innovation",
      "Clinical informatics, data science, health technology",
      "Understand the company's product, market, and landscape",
    ],
  },
];

const POSITION_GUIDANCE: Record<
  CoverLetterPositionTypeId,
  Partial<Record<StageBand, string[]>>
> = {
  academic_medicine: {
    trainee: [
      "Emphasize research productivity for training stage (abstracts, posters, manuscripts in preparation)",
      "Highlight teaching roles (anatomy TA, near-peer tutoring, simulation)",
      "Reference specific faculty mentors at the target institution",
      "Mention clinician-educator vs. clinician-scientist track interest if applicable",
    ],
    early_faculty: [
      "State academic track (clinician-scientist, clinician-educator, clinician-innovator)",
      "Clinician-scientist: 3–5 year research plan, K-award plans, named collaborators",
      "Clinician-educator: curriculum development, MedEdPORTAL/Academic Medicine scholarship",
      "Quantify protected time expectations and how you would use it",
    ],
    senior: [
      "Lead with leadership: division/department growth, accreditation, faculty recruitment",
      "Highlight funding portfolio (R01s, U-grants, industry trials, philanthropy)",
      "National reputation: guidelines, editorial boards, named lectureships, society leadership",
      "Strategic vision for department/division and competitive landscape",
    ],
  },
  private_practice: {
    trainee: [
      "Clinical readiness: procedural logs, case volume, independent decision-making",
      "Efficiency: EMR proficiency, high patient volumes, outpatient experience",
      "Business awareness: RVU compensation, value-based care, practice economics",
      "Community ties or geographic commitment for retention",
    ],
    early_faculty: [
      "Lead with clinical expertise and procedural competency — quantify volumes",
      "Patient panel philosophy and practice growth approach",
      "Subspecialty niche that expands group offerings",
      "Call coverage, team-based care, multi-location flexibility",
    ],
    senior: [
      "Practice-building: volume growth, referral networks, ancillary services",
      "Leadership: managing partners, medical director, quality committee",
      "Financial acumen: revenue, cost reduction, payer mix",
      "If academic-to-private transition: clinical focus, autonomy — frame positively",
    ],
  },
  hospital_employed: {
    trainee: [
      "Adaptability to system protocols, EMR, team-based care",
      "QI or patient safety projects during training",
      "Multidisciplinary teams, care coordination, population health",
    ],
    early_faculty: [
      "Clinical scope aligned with service line strategy",
      "Quality metrics: CMS measures, Leapfrog, Magnet",
      "System committees, outreach clinics, telehealth willingness",
      "Interest in building new programs if system is growing",
    ],
    senior: [
      "System-level leadership: medical director, service line development",
      "Physician alignment, employed physician engagement, change management",
      "Population health, value-based care, ACO experience",
      "Vision for how specialty advances system strategic plan",
    ],
  },
  fqhc_community: {
    trainee: [
      "Commitment to health equity — specific communities served and impact",
      "Language skills, cultural competency, diverse patient populations",
      "Sliding-fee scales, Medicaid/Medicare, social determinants of health",
    ],
    early_faculty: [
      "Same as trainee — deepen with specific program or clinic outcomes",
      "Resource-limited settings and creative problem-solving",
    ],
    senior: [
      "HRSA grant-writing, 340B program knowledge, community partnerships",
      "Mission alignment and long-term community commitment",
    ],
  },
  locum_tenens: {
    trainee: ["Half page maximum", "Availability dates, duration, geographic flexibility", "Active licenses, board certs, DEA", "Adaptability to new EMR and teams", "References from prior locum assignments"],
    early_faculty: ["Half page maximum", "Availability and licensure", "Quick ramp-up with minimal orientation", "Procedural competency for assignment scope"],
    senior: ["Half page maximum", "Availability and multi-state licensure", "Track record of reliable locum coverage", "Adaptability across settings"],
  },
  telehealth: {
    trainee: ["Virtual care platform comfort", "Async and sync telehealth experience", "Rapport and thorough remote assessment", "Multi-state licensure or willingness to obtain"],
    early_faculty: ["Same as trainee", "Experience scaling telehealth or remote protocols"],
    senior: ["Scaling telehealth programs", "Managing remote clinical teams", "Clinical protocols for virtual care"],
  },
  government_military_va: {
    trainee: ["Align with agency mission (VA veterans, DoD readiness, IHS tribal communities)", "Experience with target patient population", "Prior government/military service or PSLF eligibility"],
    early_faculty: ["VA: CPRS/VistA familiarity, VA quality metrics, academic affiliations", "Military: operational medicine, deployment readiness"],
    senior: ["Leadership in government health systems", "Policy influence and population health at scale"],
  },
  startup_industry: {
    trainee: ["Clinical problem you are passionate about solving", "Innovation competitions, clinical informatics exposure"],
    early_faculty: ["Clinical credibility + product sense", "Regulatory awareness (FDA, HIPAA, clinical validation)", "Advisory or consulting experience"],
    senior: ["Translate clinical needs to product requirements", "Industry collaborations and IP", "Communication with engineers, investors, executives"],
  },
};

export const COVER_LETTER_SPECIALTY_CATEGORIES: Array<{
  id: CoverLetterSpecialtyCategoryId;
  label: string;
  differentiators: string[];
  sampleLanguage?: Partial<Record<StageBand, string>>;
}> = [
  {
    id: "primary_care",
    label: "Primary Care (IM, FM, Peds, Med-Peds)",
    differentiators: [
      "Continuity of care and panel management",
      "Preventive care, chronic disease, wellness",
      "Undifferentiated patients and diagnostic uncertainty",
      "Population health, HEDIS, MIPS, value-based care",
      "Behavioral health integration, MAT, geriatrics if applicable",
    ],
    sampleLanguage: {
      early_faculty:
        "In my current role at [Institution], I manage a panel of [X] patients with a focus on [chronic disease/population]. I achieved [quality metric] and implemented [initiative] that improved outcomes by [X]%.",
    },
  },
  {
    id: "surgical",
    label: "Surgical Specialties",
    differentiators: [
      "Case volume and mix — be specific (e.g., 250+ lap cholecystectomies)",
      "Outcomes: complications, LOS, readmissions, NSQIP benchmarks",
      "Robotic certification and volume if applicable",
      "Call coverage and trauma experience if relevant",
      "Academic: clinical trials, device development, surgical education innovation",
    ],
    sampleLanguage: {
      early_faculty:
        "During fellowship in [subspecialty] at [Institution], I performed [X] cases as primary surgeon, including [complex procedures]. My [X%] complication rate for [procedure] reflects commitment to surgical excellence.",
    },
  },
  {
    id: "medical_subspecialty",
    label: "Medical Subspecialties",
    differentiators: [
      "Procedural volumes with specifics (e.g., 500+ endoscopies, 150+ ERCPs for GI)",
      "Disease-specific programs built (e.g., pulmonary hypertension clinic)",
      "Clinical trials — PI/co-PI, enrollment, industry relationships",
      "Oncology: tumor boards, precision medicine; Critical care: ECMO, ICU leadership",
    ],
  },
  {
    id: "emergency_medicine",
    label: "Emergency Medicine",
    differentiators: [
      "Annual volume and acuity mix; patients per hour; door-to-disposition",
      "Ultrasound credentialing and procedures",
      "Pediatric, geriatric, psychiatric emergency comfort",
      "Toxicology, EMS direction, disaster medicine if applicable",
      "Academic: simulation, residency education, clinical decision rule research",
    ],
  },
  {
    id: "anesthesiology",
    label: "Anesthesiology / Critical Care",
    differentiators: [
      "Case volume by type (cardiac, neuro, pediatric, obstetric, regional)",
      "Regional anesthesia and ultrasound-guided blocks; TEE certification",
      "ACT vs. solo practice experience",
      "Critical care: medical vs. surgical ICU, ECMO",
      "QI: ERAS, opioid-sparing anesthesia, OR efficiency",
    ],
  },
  {
    id: "radiology_pathology",
    label: "Radiology / Pathology / Lab Medicine",
    differentiators: [
      "Subspecialty case volume (e.g., 15,000+ cross-sectional studies annually)",
      "Interventional radiology volumes if applicable",
      "AI/ML in image interpretation; molecular diagnostics for pathology",
      "Turnaround time metrics and QA leadership; teleradiology experience",
    ],
  },
  {
    id: "psychiatry",
    label: "Psychiatry",
    differentiators: [
      "Population expertise (child/adolescent, geriatric, forensic, addiction, C-L)",
      "Psychotherapy modalities (CBT, DBT, MI)",
      "Treatment-resistant care, ECT/TMS/ketamine; telepsychiatry",
      "Collaborative care and integrated behavioral health",
      "Crisis intervention and de-escalation expertise",
    ],
  },
  {
    id: "ob_gyn",
    label: "Obstetrics & Gynecology",
    differentiators: [
      "Delivery volume and cesarean section rate",
      "High-risk OB and Level III/IV NICU collaboration",
      "MIGS volumes (lap, robotic, hysteroscopic)",
      "Subspecialty interests: urogyn, REI, gyn onc",
      "Academic: simulation-based education, skills lab development",
    ],
  },
  {
    id: "competitive_specialty",
    label: "Dermatology / Ophthalmology / ENT",
    differentiators: [
      "Highly competitive — emphasize unique differentiators",
      "Procedural volumes (Mohs, cataracts, cochlear implants)",
      "Research in niche areas; patient satisfaction and reputation",
      "Private practice: revenue potential and referral network",
    ],
  },
  {
    id: "pm_r",
    label: "Physical Medicine & Rehabilitation",
    differentiators: [
      "Population focus (stroke, TBI, SCI, amputee, pediatric, sports)",
      "EMG/NCS, ultrasound injections, spasticity management",
      "IRF metrics: FIM scores, community discharge, LOS",
      "Multidisciplinary team leadership",
    ],
  },
  {
    id: "pediatric_subspecialty",
    label: "Pediatric Subspecialties",
    differentiators: [
      "Rare diseases and diagnostic odysseys",
      "Family-centered care and transition to adult care",
      "Multidisciplinary clinics and complex coordination",
      "Pediatric trials and health services research",
      "Children's health policy advocacy",
    ],
  },
  {
    id: "general",
    label: "General / Other Specialty",
    differentiators: [
      "Quantify clinical volume, procedures, or panel size",
      "Highlight teaching, research, or leadership relevant to the role",
      "Connect accomplishments to the specific position requirements",
    ],
  },
];

export const COVER_LETTER_ADVANCED_STRATEGIES = {
  soWhatTest: "After each paragraph ask: So what? Why does this matter to the reader? Connect every accomplishment to value you bring.",
  specificity: {
    weak: "I have published 15 peer-reviewed articles.",
    strong:
      "My 15 peer-reviewed publications in [area] have informed [clinical practice/guidelines/policy], positioning me to lead a research program in [area] at your institution.",
  },
  mirrorTechnique: "Mirror language from the job posting and institutional website — innovation, community engagement, etc.",
  narrativeArcs: {
    med_student: "I discovered → I explored → I am ready to commit.",
    resident: "I trained → I excelled → I am prepared to contribute.",
    fellow: "I specialized → I produced → I am ready to lead.",
    early_attending: "I built → I grew → I am ready for more.",
    mid_career: "I led → I transformed → I am ready for greater impact.",
    legacy_attending: "I pioneered → I mentored → I am ready to shape the future.",
  } as Record<CoverLetterStageId, string>,
  redFlags: [
    "Career gap: brief positive framing with renewed focus",
    "Multiple job changes: diverse settings as unique perspective",
    "Switching specialties: compelling reason enriching current work",
    "Geographic move: relocation as opportunity to contribute to mission",
    "Research gap (academic): re-engagement through specific projects",
  ],
  avoid: [
    "Salary expectations (unless requested)",
    "Exhaustive publication lists (that's the CV)",
    "Personal health or excessive family details",
    "Negative comments about current or former employers",
    "Clichés: 'passionate about patient care' — show, don't tell",
    "Unsubstantiated superlatives: 'best surgeon in my program'",
  ],
};

export const COVER_LETTER_SUBMISSION_CHECKLIST = [
  "Addressed to correct person and institution (triple-check spelling)",
  "Position title matches job posting exactly",
  "At least 2–3 institution-specific references",
  "Career stage-appropriate tone and emphasis",
  "Accomplishments quantified wherever possible",
  "One page maximum (rare exceptions for chair/dean roles)",
  "No typos, grammar errors, or formatting inconsistencies",
  "Proofread by at least one trusted colleague or mentor",
  "Matches CV narrative — no contradictions",
  "Saved as PDF with professional filename (LastNameCoverLetterInstitution.pdf)",
];

export const COVER_LETTER_SAMPLE_LETTERS: Array<{
  id: string;
  title: string;
  stageId: CoverLetterStageId;
  positionType: CoverLetterPositionTypeId;
  excerpt: string;
}> = [
  {
    id: "sample_gi_fellowship",
    title: "PGY-3 IM Resident → Academic GI Fellowship",
    stageId: "resident",
    positionType: "academic_medicine",
    excerpt:
      "I am writing to apply for the Gastroenterology Fellowship at [Institution]. I am a PGY-3 Internal Medicine resident at [Training Hospital], where I have developed a focused interest in inflammatory bowel disease and advanced endoscopy… My research experience includes two first-author publications examining novel biomarkers for biologic therapy response in ulcerative colitis… I am particularly drawn to [Institution]'s IBD Center and the work of Dr. [Faculty Name] in mucosal immunology.",
  },
  {
    id: "sample_cardiology_community",
    title: "Early-Career Cardiologist → Community Hospital with Teaching",
    stageId: "early_attending",
    positionType: "hospital_employed",
    excerpt:
      "As an Assistant Professor with four years of post-fellowship experience, I have built a practice centered on heart failure management and cardiac imaging… I manage a heart failure clinic serving over 400 patients, with 30-day readmission rates below the national benchmark… I am drawn to [Hospital]'s commitment to graduate medical education and would welcome contributing to your fellowship training programs.",
  },
  {
    id: "sample_chair_surgery",
    title: "Senior Surgeon → Department Chair at Academic Medical Center",
    stageId: "legacy_attending",
    positionType: "academic_medicine",
    excerpt:
      "Over a 25-year career in academic surgery, I have dedicated myself to advancing hepatobiliary and pancreatic surgery through clinical innovation, translational research, and developing the next generation of surgical leaders… As Division Chief for 12 years, I grew the division from 6 to 18 faculty and established a nationally recognized hepatobiliary program… I envision investing in precision surgical oncology, AI-augmented surgical education, and a diverse surgeon-scientist pipeline.",
  },
];

export function normalizePositionType(input?: string | null): CoverLetterPositionTypeId {
  const valid = COVER_LETTER_POSITION_TYPES.map((p) => p.id);
  if (input && valid.includes(input as CoverLetterPositionTypeId)) {
    return input as CoverLetterPositionTypeId;
  }
  return "academic_medicine";
}

export function normalizeInstitutionalSetting(
  input?: string | null,
): CoverLetterInstitutionalSettingId {
  const valid = COVER_LETTER_INSTITUTIONAL_SETTINGS.map((s) => s.id);
  if (input && valid.includes(input as CoverLetterInstitutionalSettingId)) {
    return input as CoverLetterInstitutionalSettingId;
  }
  return "large_academic";
}

export function inferSpecialtyCategory(specialty?: string | null): CoverLetterSpecialtyCategoryId {
  if (!specialty) return "general";
  const s = specialty.toLowerCase();
  if (/family medicine|internal medicine|pediatrics|med-peds|primary care/.test(s)) return "primary_care";
  if (/surgery|surgical|orthop|neurosur|urolog|otolaryng|ent|plastic|vascular|cardiothoracic|thoracic/.test(s)) return "surgical";
  if (/cardiology|gastroenter|pulmon|nephrology|rheumatology|endocrin|hematology|oncology|infectious|critical care/.test(s)) return "medical_subspecialty";
  if (/emergency/.test(s)) return "emergency_medicine";
  if (/anesthes|pain medicine/.test(s)) return "anesthesiology";
  if (/radiolog|patholog|laboratory medicine/.test(s)) return "radiology_pathology";
  if (/psychiat/.test(s)) return "psychiatry";
  if (/obstet|gynecol|ob\/gyn|ob-gyn/.test(s)) return "ob_gyn";
  if (/dermatolog|ophthalmolog|otolaryng/.test(s)) return "competitive_specialty";
  if (/physical medicine|rehabilitation|pm&r|pmr/.test(s)) return "pm_r";
  if (/pediatric/.test(s) && !/family medicine/.test(s)) return "pediatric_subspecialty";
  return "general";
}

export function inferPositionTypeFromSetting(
  practiceSetting?: string | null,
): CoverLetterPositionTypeId {
  if (!practiceSetting) return "academic_medicine";
  const ps = practiceSetting.toLowerCase();
  if (ps.includes("academic")) return "academic_medicine";
  if (ps.includes("private") || ps.includes("group")) return "private_practice";
  if (ps.includes("hospital") || ps.includes("health system")) return "hospital_employed";
  if (ps.includes("community") || ps.includes("fqhc")) return "fqhc_community";
  return "hospital_employed";
}

export function resolvePositionGuidance(
  positionId: CoverLetterPositionTypeId,
  stageId: CoverLetterStageId,
): string[] {
  const band = stageBand(stageId);
  return POSITION_GUIDANCE[positionId]?.[band] ?? POSITION_GUIDANCE[positionId]?.trainee ?? [];
}

export function resolveInstitutionalGuidance(settingId: CoverLetterInstitutionalSettingId): {
  values: string[];
  tips: string[];
} {
  const def = COVER_LETTER_INSTITUTIONAL_SETTINGS.find((s) => s.id === settingId);
  return { values: def?.values ?? [], tips: def?.tips ?? [] };
}

export function resolveSpecialtyGuidance(
  categoryId: CoverLetterSpecialtyCategoryId,
  stageId: CoverLetterStageId,
): { differentiators: string[]; sampleLanguage: string | null } {
  const def = COVER_LETTER_SPECIALTY_CATEGORIES.find((c) => c.id === categoryId);
  const band = stageBand(stageId);
  return {
    differentiators: def?.differentiators ?? [],
    sampleLanguage: def?.sampleLanguage?.[band] ?? null,
  };
}

export function buildCoverLetterContextualGuidance(input: {
  stageId: CoverLetterStageId;
  positionType: CoverLetterPositionTypeId;
  institutionalSetting: CoverLetterInstitutionalSettingId;
  specialtyCategory: CoverLetterSpecialtyCategoryId;
}): {
  position: string[];
  institutional: { values: string[]; tips: string[] };
  specialty: { differentiators: string[]; sampleLanguage: string | null };
  narrativeArc: string;
  advancedTips: string[];
} {
  const inst = resolveInstitutionalGuidance(input.institutionalSetting);
  return {
    position: resolvePositionGuidance(input.positionType, input.stageId),
    institutional: inst,
    specialty: resolveSpecialtyGuidance(input.specialtyCategory, input.stageId),
    narrativeArc: COVER_LETTER_ADVANCED_STRATEGIES.narrativeArcs[input.stageId],
    advancedTips: [
      COVER_LETTER_ADVANCED_STRATEGIES.soWhatTest,
      COVER_LETTER_ADVANCED_STRATEGIES.mirrorTechnique,
      `Specificity: replace "${COVER_LETTER_ADVANCED_STRATEGIES.specificity.weak}" with concrete metrics and outcomes.`,
    ],
  };
}

export function enrichSectionPrompts(
  basePrompts: string[],
  input: {
    stageId: CoverLetterStageId;
    positionType: CoverLetterPositionTypeId;
    institutionalSetting: CoverLetterInstitutionalSettingId;
    specialtyCategory: CoverLetterSpecialtyCategoryId;
    sectionId: string;
  },
): string[] {
  const ctx = buildCoverLetterContextualGuidance(input);
  const extra: string[] = [];

  if (input.sectionId.includes("opening") || input.sectionId.includes("fit") || input.sectionId.includes("vision")) {
    extra.push(...ctx.position.slice(0, 2));
    extra.push(`Narrative arc: ${ctx.narrativeArc}`);
    extra.push(...ctx.institutional.tips.slice(0, 1));
  }
  if (input.sectionId.includes("clinical") || input.sectionId.includes("research") || input.sectionId.includes("leadership")) {
    extra.push(...ctx.specialty.differentiators.slice(0, 2));
    if (ctx.specialty.sampleLanguage) extra.push(`Sample framing: ${ctx.specialty.sampleLanguage}`);
  }
  if (input.positionType === "locum_tenens") {
    extra.push("Locum letters: half page maximum — lead with availability and credentials.");
  }

  return [...basePrompts, ...extra];
}

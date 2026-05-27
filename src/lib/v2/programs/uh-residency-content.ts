/**
 * UH Psychiatry residency & education hub content — resident-visible, static pilot.
 * MECE structure: one residency hub (rotations + program admin), one education hub.
 */

import { UH_PSYCH_ROTATION_SECTIONS } from "@/lib/v2/programs/rotation-catalog";
import {
  getRotationOrientationPack,
  listRotationOrientationIndex,
  type RotationOrientationPack,
} from "@/lib/v2/programs/rotation-orientation";
import { getProgramBySlug } from "@/lib/v2/programs/registry";
import {
  EDUCATION_CATEGORIES,
  type EducationCategory,
  type EducationDocument,
} from "@/lib/v2/programs/uh-education-manifest";

export const UH_PSYCH_PROGRAM_SLUG = "uh-psych-cmc";

export type RotationSectionId =
  | "prior-to-rotation"
  | "overview"
  | "location"
  | "personnel"
  | "schedule"
  | "logistics"
  | "resources";

export const ROTATION_SECTION_LABELS: Record<RotationSectionId, string> = {
  "prior-to-rotation": "Prior to rotation",
  overview: "Overview",
  location: "Location",
  personnel: "Personnel",
  schedule: "Schedule",
  logistics: "Logistics",
  resources: "Resources",
};

/** Highest-traffic rotations — full content from orientation seeds. */
export const PRIORITY_ROTATION_CODES = [
  "cl",
  "capu",
  "mpu_cl",
  "va_ct6",
  "call",
  "psych_ed_uh_va",
  "outpatient_adult",
  "neurology",
] as const;

export type ResidencyPageContent = {
  slug: string;
  title: string;
  subtitle?: string;
  category: "rotation" | "admin" | "operational";
  catalogSectionId?: string;
  lastUpdated?: string;
  seeded: boolean;
  overviewText?: string;
  sections: Partial<Record<RotationSectionId, string[]>>;
  driveFiles?: Array<{ label: string; url: string }>;
};

export type ResidencyHubCategory = {
  id: string;
  title: string;
  description: string;
  pageSlugs: string[];
};

export type { EducationCategory, EducationDocument };

const QGENDA_URL = "https://www.qgenda.com";

/** Friendly URL aliases → canonical rotation/admin slug. */
const RESIDENCY_SLUG_ALIASES: Record<string, string> = {
  "em-uh": "uh_ed",
  "em-va": "va_ed_im",
  "va-inpatient": "va_ct6",
  concord: "uh_concord",
  mpu: "mpu_cl",
  "extra-duty": "extra_duty",
};

const ADMIN_PAGES: ResidencyPageContent[] = [
  {
    slug: "contacts-calendars",
    title: "Contacts & Calendars",
    subtitle: "Faculty/resident directories, call schedules, and program calendars",
    category: "admin",
    lastUpdated: "2026-05-27",
    seeded: true,
    overviewText:
      "Department and residency program contacts for institutional onboarding — plus faculty/resident directories, call schedules, and program calendars.",
    sections: {
      overview: [
        "Department Chair: Dr. Jeanne Lackamp (jeanne.lackamp@uhhospitals.org)",
        "Program Director: Dr. Cathleen Cerny-Suelzer (cathleen.cerny@uhhospitals.org)",
        "Assistant Program Director: Dr. Andrew Hunt (andrew.hunt@uhhospitals.org)",
        "Program Administrator: Melvyna Williams (melvyna.williams@uhhospitals.org)",
        "Chief Residents: Daniel Phillip, Eric Reinhart, Jonathan Hardy",
        "Education Chief: Andrea Costin",
        "Full directory: docs/seeds/UH_INSTITUTIONAL_ONBOARDING_STAFF.md",
      ],
      personnel: [
        "Department Chair — Dr. Jeanne Lackamp (jeanne.lackamp@uhhospitals.org)",
        "Program Director — Dr. Cathleen Cerny-Suelzer (cathleen.cerny@uhhospitals.org)",
        "Assistant Program Director — Dr. Andrew Hunt (andrew.hunt@uhhospitals.org)",
        "Program Administrator — Melvyna Williams (melvyna.williams@uhhospitals.org)",
        "Chief Residents — Daniel Phillip, Eric Reinhart, Jonathan Hardy",
        "Education Chief — Andrea Costin",
        "Kate Kilbane — department staff (role to confirm)",
        "Addiction Psychiatry Fellowship — same PD/APD/administrator as General Adult Psychiatry residency",
        "Attending and resident contact tables — office phone, cell, pager, and notes (legacy resident site)",
      ],
      schedule: [
        "Psychiatry call schedules — MedHub",
        "Neurology call — QGenda: log in at qgenda.com → Tasks → NEU - General On-Call → select date",
        "Internal Medicine call — QGenda: select Internal Medicine group",
        "Resident life & wellness, time away, and birthday calendar — subscribe via Google Calendar (+ icon on shared calendar)",
      ],
      resources: [
        "MedHub — psychiatry call schedule, evaluations, curriculum objectives, portfolio",
        `QGenda — neurology and internal medicine call (${QGENDA_URL})`,
        "Office calendar — daily CL/MPU and outpatient attending assignments",
        "Full block schedule — Dashboard calendar or /app/calendar",
        "Faculty profiles — mentor directory on legacy resident site",
      ],
      logistics: [
        "Use QGenda for neurology/IM call; MedHub for psychiatry call and evaluation deadlines",
        "Check office calendar before each CL/MPU day for attending assignment",
        "Add the resident website calendar to your personal Google Calendar for time-away and events",
      ],
    },
  },
  {
    slug: "clinical-skills",
    title: "Clinical Skills Verification",
    subtitle: "CSV requirements, examiners, and MedHub submission",
    category: "admin",
    lastUpdated: "2023-06-17",
    seeded: true,
    overviewText:
      "Clinical Skills Verification (CSV) documents observed patient encounters for ABPN board eligibility. Standard is a competent practicing psychiatrist — occasional failure in early years is expected.",
    sections: {
      overview: [
        "Required for residents entering PGY1 on/after July 2007, PGY2 on/after July 2008, or combined programs on those dates; also for pre-2007 trainees seeking psychiatry certification.",
        "Three acceptable CSVs required to sit for boards; third must be within five years of the first acceptable CSV. CSVs valid seven years after the third.",
        "Program goal: four CSV attempts per year; minimum one per year for ACGME annual clinical skills exam compliance. Attempt one each quarter.",
      ],
      "prior-to-rotation": [
        "Review trained examiner list and weekend faculty CSV availability (resource folder)",
        "Practice CSVs with senior residents encouraged before formal attempts",
        "Review ABPN-approved forms and preparation resources on resident site",
      ],
      schedule: [
        "Minimum 45 minutes total: ≥30 minutes evaluation + 10–15 minutes case presentation",
        "Patient must be unknown to candidate; no videotape, simulated patients, or translators",
        "Two of three CSVs may use the same examiner",
      ],
      logistics: [
        "Score all three areas (physician-patient relationship, psychiatric interview/MSE, case presentation) as acceptable to pass",
        "Optional scored areas: differential diagnosis and treatment planning",
        "Upload completed CSV copy to MedHub after each attempt",
      ],
      resources: [
        "MedHub — Psychiatry Clinical Skills Evaluation forms and EPAT assessments",
        "ABPN-approved CSV scoring forms",
        "Weekend faculty CSV list — resource folder on resident drive",
        "Program faculty guide to MedHub evaluations",
      ],
    },
  },
  {
    slug: "electives",
    title: "Electives",
    subtitle: "Request process, PGY expectations, and master catalog",
    category: "operational",
    lastUpdated: "2023-12-07",
    seeded: true,
    overviewText:
      "Flexible educational experiences tailored to resident interests. PGY3/4 schedules are individualized; residents may be cross-covered for required services and must remain available unless vacation/leave with backup arranged.",
    sections: {
      "prior-to-rotation": [
        "Review Master Elective Spreadsheet (/app/education)",
        "Develop mentor-approved plan: location, schedule (days/weeks/blocks), UH-affiliated supervisor, brief description and objectives",
        "Non-UH supervisor: email Melvyna Williams for affiliation agreement",
        "Submit elective request form + mentor approval email to Dr. Andrew Hunt (Andrew.Hunt@UHHospitals.org) ≥6 weeks before start",
        "PGY3/4/PPP electives: coordinate through Dr. Kathleen Cerny",
      ],
      overview: [
        "PGY1: elective time in two-week increments — often Step 3/Level 3 study, QI, research, or reading",
        "PGY2: ~6 weeks in two-week blocks — forensic shadowing, interventional (ECT/TMS/ketamine), specialty clinics, scholarly electives",
        "PGY3: typically half-day to full day per week longitudinal electives",
        "PGY4: typically 1.5 days per week longitudinal electives; fast-track CAP affects availability",
      ],
      personnel: [
        "Mentor — required for plan development and approval",
        "Supervisor — must be UH-affiliated unless affiliation agreement completed",
        "Dr. Andrew Hunt — elective request submissions",
        "Melvyna Williams — external site affiliation agreements",
        "Dr. Kathleen Cerny — PGY3/4/PPP elective coordination",
      ],
      logistics: [
        "Chiefs provide advance notice when cross-covering required services during elective blocks",
        "Remain in town and available unless vacation/educational leave with backup arranged",
        "Longitudinal electives may span multiple blocks — confirm outpatient requirements in catalog row",
      ],
      resources: [
        "Master Elective Spreadsheet — /app/education (Electives category)",
        "Elective request form — resident website / program drive",
        "MedHub elective evaluation forms",
        "Rotation catalog page — /app/residency/elective for 62 catalogued options",
      ],
    },
  },
];

type PagePatch = Partial<
  Pick<ResidencyPageContent, "subtitle" | "lastUpdated" | "overviewText" | "sections" | "driveFiles">
>;

const RESIDENCY_PAGE_OVERRIDES: Record<string, ResidencyPageContent> = {
  extra_duty: {
    slug: "extra_duty",
    title: "Extra Duty",
    subtitle: "Internal moonlighting (EPAT/CL coverage) and external options",
    category: "operational",
    lastUpdated: "2024-08-24",
    seeded: true,
    overviewText:
      "Internal extra duty augments EPAT with psychiatric expertise and manages after-hours CL consults. PGY2+ in good standing (including fellows). External moonlighting requires independent Ohio license/DEA and approved application — not approved unless internal schedule is covered.",
    sections: {
      "prior-to-rotation": [
        "Review resident website materials and linked EPAT/MPU guidelines",
        "Confirm addition to internal extra duty WhatsApp group",
        "Shadow a colleague during one internal extra duty shift before solo coverage",
      ],
      overview: [
        "Weekday shifts: 5:30 PM – 11:30 PM (6 hours in-house); weekend shifts: 9:00 AM – 9:00 PM (12 hours in-house)",
        "Forward CL pager (#30164) to personal pager via UH-CMC operator by 5 PM weekdays / 9 AM weekends",
        "After in-house shift, manage pager from home until relieved (8 AM weekdays by CL; 9 AM weekends by next moonlighter)",
        "Pay: $600 weekday / $1,200 weekend via regular paycheck; chiefs email billing instructions biweekly",
      ],
      location: [
        "EPAT office — Hanna House 106 at UH-CMC (left off elevator; key under reception desk if locked)",
        "Shred container across hall; printer in reception area",
      ],
      personnel: [
        "EPAT staff and CMC social worker (patient assignments)",
        "On-call attendings for clinical questions",
        "Chief residents — billing sheets and schedule coordination",
        "External SWG moonlighting: Dr. Charlie Luther (CLutherMD@swgeneral.com) — $2,250/weekend as of July 2024",
      ],
      schedule: [
        "Weekday in-house: 5:30 PM – 11:30 PM; pager home coverage until 8 AM CL relief",
        "Weekend in-house: 9 AM – 9 PM; pager home coverage until 9 AM next moonlighter",
        "Shifts count toward duty hours — log in MedHub per ACGME rules",
        "ER pages go to EPAT, not moonlighter; child psych fellows manage pediatric restraint/seclusion",
      ],
      logistics: [
        "Person starting shift initiates pager transfer; confirm test page within 10 minutes",
        "Non-urgent overnight consults may pass to morning CL team",
        "External moonlighting: Southwest General inpatient/consults; Signature Health no longer offers (Aug 2024)",
      ],
      resources: [
        "Internal extra duty staffing guidelines and EPAT coverage guidelines — resident drive",
        "MPU guidelines — resident drive",
        "External moonlighting application and program policy — resident drive",
      ],
    },
  },
};

const RESIDENCY_PAGE_SUPPLEMENTS: Record<string, PagePatch> = {
  call: {
    lastUpdated: "2023-11-22",
    sections: {
      location: [
        "PGY1: UH emergency psychiatry / answering service",
        "PGY2: Wade Park VA night float and Bridge Shift",
      ],
      schedule: [
        `Call schedule via QGenda (${QGENDA_URL}) — tutorial and switch rules on resident site`,
        "PGY1 weekends/holidays: select days are 24-hour shifts (8 AM – 8 AM)",
        "PGY2 Saturday AM 8 AM – 8 PM; Saturday PM overnight; Sunday 8 AM – 8 PM",
        "Call Learning Model: comfort zone / zone of proximal development / danger zone",
      ],
      resources: [
        "PGY1 Call Manual — resident drive",
        "VA Call Manual (53 pages) — responsibilities, consults, admissions, CPRS tips, phone numbers",
        "Backup call responsibilities document",
        "VA Buddy Call checklist",
      ],
    },
  },
  uh_ed: {
    lastUpdated: "2024-06-16",
    overviewText:
      "Two-week UH-CMC ED block — academic urban Level 1 trauma center. Eight shifts (~8–9 hours) with variable start times; no psychiatry didactics or grand rounds during block.",
    sections: {
      "prior-to-rotation": [
        "Expect Welcome email from EM chiefs and Shift Admin scheduling portal emails ~4 weeks before block",
        "Review EM primer emailed by chiefs; contact EMChiefResidents@uhhospitals.org with schedule questions",
      ],
      location: ["UH-CMC Emergency Room", "Parking: UH-CMC garages"],
      personnel: [
        "Multiple ED attendings",
        "2024–2025 EM Chiefs: Vincent Marshall, Austin Schoeffler, Polly Wiltz",
        "EMChiefResidents@uhhospitals.org",
      ],
      schedule: [
        "8 shifts per 2-week block — typical times 7 AM–3 PM, 10 AM–6 PM, 2 PM–11 PM, 6 PM–2 AM, 10 PM–7 AM",
        "Schedule released in Shift Admin ~4 weeks ahead",
        "No Psychiatry Didactics or Grand Rounds during this rotation",
      ],
      logistics: [
        "Report to assigned ED pod on Shift Admin; introduce yourself to ED attending",
        "Group sign-out at 7 AM, 3 PM, 11 PM weekdays; 7 AM and 7 PM weekends — attend every sign-out during your shift",
        "Backup: call chief resident on call for current block (Shift Admin); if late, call ED 216-844-3723",
      ],
      resources: [
        "Clerkship Directors in Emergency Medicine (CDEM) curriculum",
        "Review topics: altered mental status, abdominal pain, cardiac arrest, chest pain, dizziness, dyspnea, headache, sepsis, stroke, syncope",
      ],
    },
  },
  va_ed_im: {
    lastUpdated: "2023-12-01",
    overviewText:
      "VA Urgent Care Center (UCC) — emergency and internal medicine experience with veteran-specific comorbidity. Weekday ambulatory urgent care with IM senior residents and attending staffing.",
    sections: {
      "prior-to-rotation": [
        "IM chiefs contact you before rotation — review materials they send",
        "Request PIV access to ED by mis-scanning PIV and emailing VA Police (instructions on resident site)",
      ],
      location: [
        "VA UCC — 1st floor past Atrium (ask front desk for access day 1)",
        "Parking: free VA employee lots",
      ],
      personnel: [
        "Multiple UCC attendings",
        "2025–2026 IM Chiefs: Julie Adams, Kevin George, Thomas O'Neill, Sivani Parsa, Dev Patel — casechiefs@gmail.com",
        "Three IM senior residents daily — patient assignment and primary resource",
      ],
      schedule: [
        "Monday–Friday 8 AM – 6 PM; no weekends",
        "Sign up for new patients until 5:30 PM; finalize notes by 6 PM",
        "Attend Psychiatry Didactics Wednesdays (remind senior Tuesday); no Friday Grand Rounds",
        "Rare Happy Call weekday may replace UCC when covering psych intern on IM — IM chiefs notify weeks ahead",
      ],
      logistics: [
        "Focused H&P → staff with attending → present HPI, vitals, exam, differential, plan",
        "Orders via Emergency Department menu in CPRS after staffing",
        "Admissions: place order and call admitting team; discharges: instructions, meds, follow-up",
        "Sign out ongoing care to attending at 6 PM; eat lunch — brief sign-out when stepping away",
      ],
      resources: [
        "CDEM curriculum — recommended EM reading",
        "Review topics: altered mental status, abdominal pain, cardiac arrest, chest pain, dizziness, dyspnea, headache, sepsis, stroke, syncope",
      ],
    },
  },
  neurology: {
    lastUpdated: "2025-06-28",
    sections: {
      schedule: [
        "Arrive 8 AM first day; rounds usually start 8 AM (varies by attending)",
        "May work past 4 PM for late consults; notify seniors for post-call, VA Bridge Shift (leave by 4:30 PM Friday), Access Clinic, Wednesday Didactics",
        "1–2 educational days for boards/conferences with psychiatry and neurology chief approval",
        "Expected to attend neurology educational activities when offered",
      ],
      resources: [
        `Qgenda senior lookup: NEU - General Sr - Res (${QGENDA_URL})`,
        "EEG reports on UH network — login reader / password eegeeg (UH network only)",
        "Neurological exam basics — linked on resident site",
      ],
    },
  },
  psych_ed_uh_va: {
    lastUpdated: "2025-01-29",
    overviewText:
      "PGY1 emergency psychiatry — primarily UH EPAT with select VA afternoon blocks and Friday BASICS at CWRU Student Health. Evaluate acute psychiatric illness and disposition in emergency settings.",
    sections: {
      "prior-to-rotation": [
        "Review 2025–2026 schedule for daily location and attending assignments",
        "Ensure login access at UH-CMC and VA",
        "Review UH Emergency Psychiatry teaching philosophy and VA Emergency Psychiatry handbook",
      ],
      location: [
        "UH EPAT — Hanna House 106 (employee parking Lot 59/61; walking directions video on site)",
        "VA ED — page CL/psychiatry pager 440-562-2194; call room 3B-174",
        "BASICS — CWRU Student Health, Dental Research Building 2124 Cornell Rd (Friday afternoons when in session)",
        "Community didactics — Walker 13th floor when CWRU not in session",
      ],
      personnel: [
        "UH EPAT: Dr. Goldman (most mornings), Dr. Wobbe (most afternoons), Dr. Laviolette (Wed PM), Dr. Noffsinger (Thu AM), EPAT social workers",
        "VA ED psych: Dr. Goldenberg (Mon/Thu), coverage attendings and VA nursing",
        "BASICS: Dr. Romero (mxf144@case.edu), addiction fellows",
      ],
      schedule: [
        "UH EPAT: Mon/Tue/Thu 8 AM – 5 PM; Wed 1 PM – 5 PM; Fri 8 AM – 12 PM",
        "VA ED psych: Mon–Thu 1 PM – 5 PM (includes sign-out to Bridge resident)",
        "BASICS: Fri 1 PM – 5 PM when CWRU in session",
        "Wed Didactics; Fri Grand Rounds remote from EPAT office; Wed PM reading time through Nov 2025 per handout",
        "Vacation allowed — swap pager coverage in QGenda; notify Dr. Wobbe, Dr. Lavakumar (VA), Dr. Romero (BASICS)",
      ],
      logistics: [
        "UH EPAT: 1–3 patients per half day; discuss with attending/senior, complete notes, communicate with ED",
        "VA: observe → observed interviews → independent evaluations with subsequent supervision when approved",
        "BASICS: 1 hr education, 2 hr patient interaction (substance screening), 1 hr supervision",
        "Concurrent with outpatient answering service — coordinate pager in QGenda",
      ],
    },
  },
};

const RESIDENCY_INLINE_PAGES: Record<string, ResidencyPageContent> = {
  psych_ed_uh: {
    slug: "psych_ed_uh",
    title: "Emergency Psychiatry (UH EPAT)",
    subtitle: "UH emergency psychiatry / answering service component",
    category: "rotation",
    lastUpdated: "2025-01-29",
    seeded: true,
    overviewText:
      "UH emergency psychiatry at EPAT — evaluate adults with acute psychiatric illness, coordinate with ED team, and determine disposition. Often paired with answering service and outpatient coverage blocks.",
    sections: {
      "prior-to-rotation": [
        "Review UH Emergency Psychiatry teaching philosophy, objectives, and expectations",
        "Confirm EPAT office access and parking (Lot 59/61 walking directions on resident site)",
      ],
      location: ["EPAT office — Hanna House 106 at UH-CMC", "Parking: UH-CMC employee garages"],
      personnel: [
        "Dr. Goldman (most mornings), Dr. Wobbe (most afternoons), Dr. Laviolette (Wed PM), Dr. Noffsinger (Thu AM)",
        "EPAT social workers",
      ],
      schedule: [
        "Typical EPAT hours: Mon/Tue/Thu 8 AM – 5 PM; Wed 1 PM – 5 PM; Fri 8 AM – 12 PM",
        "Attend Psychiatry Didactics Wednesdays; watch Grand Rounds remotely from EPAT office Fridays",
        "See also /app/residency/psych_ed_uh_va for combined PGY1 UH/VA/BASICS block schedule",
      ],
      logistics: [
        "1–3 patients (new/re-eval) per half day — discuss with attending/senior, complete notes, communicate with ED",
        "Coordinate pager with answering service blocks in QGenda when applicable",
      ],
      resources: [
        "UH Emergency Psychiatry handout — resident drive",
        "Glick — Emergency Psychiatry: Principles and Practice (2021)",
      ],
    },
  },
  nf: {
    slug: "nf",
    title: "Night Float (PGY2 VA)",
    subtitle: "Inpatient VA night float and Bridge Shift — see Call page",
    category: "operational",
    seeded: true,
    overviewText:
      "PGY2 night float at Wade Park VA — part of the Call rotation. Two or three 2-week blocks covering inpatient psychiatry overnight with Bridge Shift handoffs.",
    sections: {
      "prior-to-rotation": [
        "Review VA Call Manual and backup call responsibilities",
        "Review Call Learning Model (comfort / proximal development / danger zones)",
      ],
      overview: [
        "Night float: 8 PM – 8 AM Sun–Sat during 2-week blocks",
        "Bridge Shift: 5 PM – 8 PM Monday–Friday handoff coverage",
        "Full Call details — /app/residency/call",
      ],
      schedule: [
        "No Psychiatry Didactics or Grand Rounds during night float blocks",
        "Schedule via QGenda — switch rules on resident site",
      ],
      personnel: [
        "Dr. Jhee (Chief), Psych ED attendings, CL attendings, VARC attendings",
        "PGY3 backup residents and on-call attendings",
      ],
      logistics: [
        "Review VA Buddy Call checklist and call switch rules",
        "Escalate via backup system per VA Call Manual",
      ],
      resources: ["Call page — /app/residency/call", "VA Call Manual — resident drive", `QGenda — ${QGENDA_URL}`],
    },
  },
  child_cl: {
    slug: "child_cl",
    title: "Child Consult-Liaison Psychiatry",
    category: "rotation",
    seeded: true,
    overviewText:
      "Psychiatric consultation for pediatric medical/surgical inpatients at UH Rainbow. Workflow parallels adult CL with developmental and family-systems focus.",
    sections: {
      "prior-to-rotation": [
        "Review CL/MPU Rotation Syllabus and CL introductory document",
        "Check office calendar for daily attending assignment",
      ],
      overview: [
        "Consultation for medically hospitalized children and adolescents — formulation, capacity/consent with guardians, and team communication",
        "See adult CL page for shared Lakeside logistics — /app/residency/cl",
      ],
      location: ["UH Rainbow Babies & Children's — consult coverage per CL service assignment"],
      schedule: [
        "Monday–Friday per CL service schedule",
        "Psychiatry Didactics Wednesdays; Grand Rounds Fridays as schedule allows",
      ],
      resources: [
        "CL Tips & Tricks, CL Note Template — resident drive",
        "CAPU and child outpatient resources for disposition planning",
      ],
    },
  },
  va_addiction: {
    slug: "va_addiction",
    title: "Addiction Psychiatry (VA VARC)",
    category: "rotation",
    seeded: true,
    overviewText:
      "Two-week VARC rotation at Wade Park VA — part of the four-week addiction block. Outpatient addiction and MAT portions are separate catalog entries.",
    sections: {
      "prior-to-rotation": [
        "Contact supervisors ≥10 days before start to confirm location and times",
        "Inform supervisors of Didactics, Bridge Shift, and other obligations",
        "Review block schedule to confirm VA vs outpatient vs MAT sequence",
      ],
      location: [
        "VARC — 1st floor main VA building (hallway parallel to cafeteria hallway)",
        "Parking: free VA employee lot",
      ],
      personnel: [
        "Dr. Mary Rabb — Mary.Rabb@va.gov",
        "Dr. Youssef Mahfoud — Youssef.Mahfoud@va.gov",
        "Dr. Michael Ignatowski — Michael.Ignatowski2@va.gov",
        "Dr. Thomas Liggett — Thomas.Liggett@va.gov",
      ],
      schedule: ["Monday–Friday; no weekends", "Attend Didactics and Grand Rounds when schedule allows"],
      resources: [
        "SAMHSA TIP 63 — Medications for Opioid Use Disorder",
        "ASAM National Practice Guideline on OUD",
        "Full addiction rotation — /app/residency/outpatient_addiction",
      ],
    },
  },
  mat_addiction: {
    slug: "mat_addiction",
    title: "Addiction Psychiatry (MAT / IOP)",
    category: "rotation",
    seeded: true,
    overviewText:
      "Two-week community addiction services rotation — IOP, residential treatment, methadone clinic, and MAT teams (including The Centers WinMAT sites when assigned).",
    sections: {
      "prior-to-rotation": [
        "Contact all supervisors ≥10 days before rotation start",
        "Review daily schedule for VA, MAT, and outpatient portions on resident site",
      ],
      location: [
        "UH ARS — Walker Building suite 3200 (Walker garage)",
        "CTC Methadone Clinic — 1127 Carnegie Ave (Lot G49 parking)",
        "The Centers WinMAT — Uptown 12201 Euclid Ave; Gordon Square 5209 Detroit Ave",
        "Harbor Light / Salvation Army — 1710 Prospect Ave E",
        "Y-Haven residential — 6001 Woodland Ave Stokes Bldg 4th floor",
      ],
      personnel: [
        "Dr. Gregory Boehm — gxboehm24@gmail.com",
        "Dr. Sybil Marsh (CTC) — Sybil.Marsh@uhhospitals.org",
        "Natasha Ashcraft (UH ARS IOP) — Natasha.Ashcraft@uhhospitals.org",
        "Dr. Dinah Applewhite (The Centers) — dinah.applewhite@thecentersohio.org",
      ],
      schedule: ["Monday–Friday; no weekends", "Block order varies — check 2025–2026 addiction block schedule"],
      resources: [
        "Motivational interviewing review recommended",
        "SAMHSA TIP 63 and ASAM guidelines",
        "Full addiction overview — /app/residency/outpatient_addiction",
      ],
    },
  },
  pediatrics: {
    slug: "pediatrics",
    title: "Pediatrics (Off-service)",
    category: "rotation",
    seeded: true,
    overviewText:
      "Required off-service pediatrics block — inpatient and ambulatory pediatric medicine experience for psychiatry trainees per program block schedule.",
    sections: {
      "prior-to-rotation": [
        "Confirm block dates and site assignment with program coordinator",
        "Review pediatrics orientation materials from hosting service",
      ],
      schedule: [
        "Block schedule per UH/CWRU pediatrics service — see /app/calendar",
        "Coordinate psychiatry Didactics attendance with pediatrics chiefs",
      ],
      logistics: [
        "Document patient encounters in hosting service EMR",
        "Notify psychiatry program of schedule conflicts or duty-hour concerns",
      ],
      resources: ["Block schedule — /app/calendar", "Program coordinator for site-specific contacts"],
    },
  },
  qi: {
    slug: "qi",
    title: "Quality Improvement",
    subtitle: "Scholarly/QI elective block",
    category: "operational",
    seeded: true,
    overviewText:
      "Dedicated QI or scholarly improvement block — often taken as a PGY1 or PGY2 two-week elective for project work, journal review, or curriculum development.",
    sections: {
      "prior-to-rotation": [
        "Define QI question, stakeholders, and mentor with program or QI faculty",
        "Submit elective request if block requires formal approval — see /app/residency/electives",
      ],
      overview: [
        "Common PGY2 scholarly elective option alongside research and reading blocks",
        "Align project with program QI priorities and ACGME systems-based practice milestones",
      ],
      logistics: [
        "Remain available for cross-cover if assigned — chiefs notify in advance",
        "Document outcomes for CCC, ILP, and potential poster/manuscript",
      ],
      resources: [
        "Electives process — /app/residency/electives",
        "Master Elective Spreadsheet — /app/education",
      ],
    },
  },
  vacation: {
    slug: "vacation",
    title: "Vacation",
    category: "operational",
    seeded: true,
    overviewText:
      "Scheduled vacation blocks per program policy. Arrange backup coverage for call, clinic, and longitudinal duties before approved time away.",
    sections: {
      "prior-to-rotation": [
        "Submit vacation requests per program timeline to coordinator/chiefs",
        "Swap call and clinic coverage in QGenda/MedHub as required",
      ],
      logistics: [
        "EPAT/answering service blocks: swap pager in QGenda and notify Dr. Wobbe, Dr. Lavakumar, or Dr. Romero as applicable",
        "VA rotations: email site director with Decey Cabarle copied for planned leave",
        "Remain reachable per program policy until coverage confirmed",
      ],
      resources: [
        "Contacts — /app/residency/contacts-calendars",
        "Call switch rules — /app/residency/call",
      ],
    },
  },
};

const CATALOG_ROTATION_LABELS: Record<string, string> = {
  psych_ed_uh: "Psychiatric Emergency — UH",
  nf: "Night Float",
  child_cl: "Child Consult-Liaison",
  va_addiction: "VA Addiction",
  mat_addiction: "MAT Addiction",
  pediatrics: "Pediatrics",
  qi: "Quality Improvement",
  vacation: "Vacation",
};

function resolveResidencySlug(slug: string): string {
  return RESIDENCY_SLUG_ALIASES[slug] ?? slug;
}

function mergeSectionLists(
  base: Partial<Record<RotationSectionId, string[]>>,
  patch?: Partial<Record<RotationSectionId, string[]>>,
): Partial<Record<RotationSectionId, string[]>> {
  if (!patch) return base;
  const merged = { ...base };
  for (const [key, items] of Object.entries(patch) as Array<[RotationSectionId, string[]]>) {
    if (!items?.length) continue;
    const existing = merged[key] ?? [];
    const seen = new Set(existing);
    merged[key] = [...existing, ...items.filter((item) => !seen.has(item))];
  }
  return merged;
}

function mergePageContent(base: ResidencyPageContent, patch: PagePatch): ResidencyPageContent {
  return {
    ...base,
    subtitle: patch.subtitle ?? base.subtitle,
    lastUpdated: patch.lastUpdated ?? base.lastUpdated,
    overviewText: patch.overviewText ?? base.overviewText,
    sections: mergeSectionLists(base.sections, patch.sections),
    driveFiles: patch.driveFiles ?? base.driveFiles,
  };
}

function catalogRotationCodes(): string[] {
  const codes = new Set<string>();
  for (const section of UH_PSYCH_ROTATION_SECTIONS) {
    for (const code of section.rotationCodes) codes.add(code);
  }
  for (const entry of listRotationOrientationIndex()) {
    codes.add(entry.rotation_code);
  }
  for (const code of PRIORITY_ROTATION_CODES) codes.add(code);
  return [...codes];
}

function rotationServiceName(code: string): string {
  const indexEntry = listRotationOrientationIndex().find((e) => e.rotation_code === code);
  if (indexEntry) return indexEntry.service_name;
  return CATALOG_ROTATION_LABELS[code] ?? code.replace(/_/g, " ");
}

function packToPage(pack: RotationOrientationPack): ResidencyPageContent {
  return {
    slug: pack.rotation_code,
    title: pack.service_name,
    category: pack.category === "operational" ? "operational" : "rotation",
    lastUpdated: pack.source.last_updated,
    seeded: true,
    overviewText: pack.overview,
    sections: {
      "prior-to-rotation": pack.prior_to_rotation,
      overview: pack.overview ? [pack.overview] : undefined,
      location: pack.location,
      personnel: pack.personnel,
      schedule: pack.schedule,
      logistics: pack.logistics,
      resources: pack.resources ?? pack.recommended_reading,
    },
    driveFiles: pack.source.drive_files,
  };
}

function placeholderRotationPage(code: string, serviceName: string): ResidencyPageContent {
  return {
    slug: code,
    title: serviceName,
    category: "rotation",
    seeded: false,
    overviewText: "Detailed rotation guide coming soon. Ask Coach Mak for orientation tips in the meantime.",
    sections: {
      overview: [
        "This rotation page is being migrated from the legacy resident website.",
        "Core logistics are available to Coach Mak for debrief and capture coaching.",
      ],
    },
  };
}

function buildRotationPage(code: string): ResidencyPageContent {
  const override = RESIDENCY_PAGE_OVERRIDES[code];
  if (override) return { ...override, slug: code, seeded: true };

  const inline = RESIDENCY_INLINE_PAGES[code];
  if (inline) return { ...inline, slug: code, seeded: true };

  const pack = getRotationOrientationPack(code);
  if (pack) {
    const page = packToPage(pack);
    const supplement = RESIDENCY_PAGE_SUPPLEMENTS[code];
    return supplement ? mergePageContent(page, supplement) : page;
  }

  return placeholderRotationPage(code, rotationServiceName(code));
}

export function listAllResidencyPages(): ResidencyPageContent[] {
  const rotationPages = catalogRotationCodes().map((code) => buildRotationPage(code));
  return [...ADMIN_PAGES, ...rotationPages];
}

export function getResidencyPage(slug: string): ResidencyPageContent | null {
  const resolved = resolveResidencySlug(slug);
  const admin = ADMIN_PAGES.find((p) => p.slug === resolved);
  if (admin) return admin;

  if (
    catalogRotationCodes().includes(resolved) ||
    listRotationOrientationIndex().some((e) => e.rotation_code === resolved)
  ) {
    return buildRotationPage(resolved);
  }

  return null;
}

/** Resident hub migration stats — seeded pages vs placeholders. */
export function residencyContentStats(): { total: number; seeded: number; placeholder: number } {
  const pages = listAllResidencyPages();
  const seeded = pages.filter((p) => p.seeded).length;
  return { total: pages.length, seeded, placeholder: pages.length - seeded };
}

export function residencyHubCategories(): ResidencyHubCategory[] {
  const pages = listAllResidencyPages();
  const bySlug = new Map(pages.map((p) => [p.slug, p]));

  const catalogSections = UH_PSYCH_ROTATION_SECTIONS.filter((s) => s.id !== "overview");
  const rotationCategories: ResidencyHubCategory[] = catalogSections.map((section) => ({
    id: section.id,
    title: section.title,
    description: section.description,
    pageSlugs: section.rotationCodes.filter((code) => bySlug.has(code)),
  }));

  return [
    ...rotationCategories,
    {
      id: "program-admin",
      title: "Program admin",
      description: "Contacts, calendars, clinical skills verification, and electives process.",
      pageSlugs: ["contacts-calendars", "clinical-skills", "electives"],
    },
  ];
}

export function searchResidencyPages(query: string): ResidencyPageContent[] {
  const q = query.trim().toLowerCase();
  if (!q) return listAllResidencyPages();
  return listAllResidencyPages().filter((page) => {
    const haystack = [
      page.title,
      page.subtitle,
      page.overviewText,
      ...Object.values(page.sections).flatMap((s) => s ?? []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(q) || page.slug.includes(q);
  });
}

export { EDUCATION_CATEGORIES };

export function listAllEducationDocuments(): EducationDocument[] {
  return EDUCATION_CATEGORIES.flatMap((c) => c.documents);
}

export function searchEducationDocuments(query: string): Array<EducationDocument & { categoryId: string; categoryTitle: string }> {
  const q = query.trim().toLowerCase();
  const all = EDUCATION_CATEGORIES.flatMap((cat) =>
    cat.documents.map((doc) => ({
      ...doc,
      categoryId: cat.id,
      categoryTitle: cat.title,
    })),
  );
  if (!q) return all;
  return all.filter((doc) => {
    const haystack = [
      doc.title,
      doc.description,
      doc.filename,
      doc.subcategory,
      ...(doc.tags ?? []),
      doc.categoryTitle,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
}

export function uhPsychProgram() {
  return getProgramBySlug(UH_PSYCH_PROGRAM_SLUG);
}

export function residencyPageHref(slug: string): string {
  return `/app/residency/${slug}`;
}

export function residencySectionAnchor(sectionId: RotationSectionId): string {
  return `#${sectionId}`;
}

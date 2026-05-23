export const DOMAINS = [
  "Clinical Expertise",
  "Communication",
  "Professionalism & Ethics",
  "Systems Thinking",
  "Scholarship & Learning",
  "Collaboration & Teamwork",
  "Leadership & Management",
  "Personal & Professional Development",
] as const;

export const TRACKS = [
  "Clinician",
  "Educator",
  "Researcher",
  "Administrator/Leader",
  "Advocate",
  "Innovator",
  "Quality/Safety",
  "Wellness Champion",
] as const;

export const ENERGY_OPTIONS = [
  { value: "very_energizing", label: "Very energizing" },
  { value: "energizing", label: "Energizing" },
  { value: "neutral", label: "Neutral" },
  { value: "draining", label: "Draining" },
  { value: "very_draining", label: "Very draining" },
] as const;

export const CAREER_PHASES = [
  "Medical Student",
  "Resident/Fellow",
  "Early Career Attending",
  "Mid-Career Attending",
  "Late Career Attending",
  "Transitioning",
  "Nonclinical",
  "Retired",
] as const;

export const OUTPUT_TEMPLATES = [
  { id: "cv_bullets", name: "CV Bullets", words: 150 },
  { id: "cv_update", name: "CV Update (delta)", words: 800 },
  { id: "annual_review", name: "Annual Review", words: 750 },
  { id: "promotion_narrative", name: "Promotion Narrative", words: 1500 },
  { id: "teaching_statement", name: "Teaching Statement", words: 500 },
  { id: "leadership_summary", name: "Leadership Summary", words: 500 },
  { id: "professional_bio", name: "Professional Bio", words: 200 },
  { id: "cover_letter", name: "Cover Letter", words: 400 },
  { id: "invisible_work_summary", name: "Invisible Work Summary", words: 500 },
  { id: "career_snapshot", name: "Career Snapshot", words: 300 },
] as const;

export type EnergyValue = (typeof ENERGY_OPTIONS)[number]["value"];

export type LatticeCellState = {
  domainIndex: number;
  trackIndex: number;
  activityCount: number;
  energy: EnergyValue | null;
};

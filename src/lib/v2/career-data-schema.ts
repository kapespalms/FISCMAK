/**
 * Career Data Schema types — People–Activities–Metrics–Composites
 * Mirrors docs/migrations/20260521_career_data_schema.sql
 * physician_id === app_users.user_id (1:1)
 */

export type DataSource =
  | "cv_parse"
  | "user"
  | "api"
  | "abms"
  | "orcid"
  | "pubmed"
  | "openalex"
  | "icite"
  | "crossref"
  | "google_scholar"
  | "nih_reporter"
  | "cms_medicare"
  | "cms_open_payments"
  | "self_report"
  | "institutional"
  | "questionnaire"
  | "computed"
  | "ai"
  | "ai_generated";

export type SettingType = "academic" | "community" | "industry" | "hybrid";

export type Physician = {
  physician_id: string;
  npi: string | null;
  orcid: string | null;
  first_name: string | null;
  last_name: string | null;
  name_variants: string[];
  email: string;
  gender: string | null;
  race_ethnicity: string | null;
  year_of_birth: number | null;
  year_terminal_degree: number | null;
  terminal_degree_type: "MD" | "DO" | "PhD" | "MD-PhD" | "Other" | null;
  medical_school: string | null;
  created_at: string;
  updated_at: string;
};

export type SpecialtyCertification = {
  cert_id: string;
  physician_id: string;
  board_name: string;
  specialty: string;
  subspecialty: string | null;
  certification_date: string | null;
  expiration_date: string | null;
  moc_status: string | null;
  is_primary: boolean;
  data_source: DataSource;
  created_at: string;
  updated_at: string;
};

export type CareerSettingRecord = {
  setting_id: string;
  physician_id: string;
  setting_type: SettingType;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  institution_name: string | null;
  department: string | null;
  academic_rank: string | null;
  clinical_fte: number | null;
  research_fte: number | null;
  education_fte: number | null;
  admin_fte: number | null;
  data_source: DataSource;
  created_at: string;
  updated_at: string;
};

export type IdentityVerification = {
  verification_id: string;
  physician_id: string;
  source: "NPPES" | "ORCID" | "ABMS" | "user";
  field_verified: string;
  confidence_score: number | null;
  verified_at: string;
  raw_payload: Record<string, unknown>;
};

export type Publication = {
  pub_id: string;
  physician_id: string;
  pmid: string | null;
  doi: string | null;
  openalex_id: string | null;
  title: string;
  journal: string | null;
  year: number | null;
  publication_type:
    | "original_research"
    | "review"
    | "case_report"
    | "editorial"
    | "chapter"
    | "letter"
    | "other"
    | null;
  author_position: "first" | "middle" | "last" | "corresponding" | null;
  total_authors: number | null;
  citation_count: number | null;
  rcr: number | null;
  rcr_percentile: number | null;
  field_citation_rate: number | null;
  is_open_access: boolean | null;
  mesh_terms: string[];
  cv_listed: boolean;
  api_discovered: boolean;
  reconciled: boolean;
  data_source: DataSource;
  created_at: string;
  updated_at: string;
};

export type Grant = {
  grant_id: string;
  physician_id: string;
  nih_project_number: string | null;
  funder: string;
  grant_title: string;
  role: "PI" | "Co-PI" | "Co-I" | "mentor" | null;
  total_amount: number | null;
  direct_costs: number | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean;
  study_section: string | null;
  nih_activity_code: string | null;
  cv_listed: boolean;
  api_discovered: boolean;
  reconciled: boolean;
  data_source: DataSource;
  created_at: string;
  updated_at: string;
};

export type Presentation = {
  pres_id: string;
  physician_id: string;
  title: string;
  venue: string | null;
  presentation_date: string | null;
  presentation_type:
    | "invited_lecture"
    | "oral_abstract"
    | "poster"
    | "grand_rounds"
    | "workshop"
    | "other"
    | null;
  scope: "local" | "regional" | "national" | "international" | null;
  is_peer_reviewed: boolean | null;
  data_source: DataSource;
  created_at: string;
};

export type ScholarlyMetrics = {
  metric_id: string;
  physician_id: string;
  computed_at: string;
  h_index: number | null;
  g_index: number | null;
  i10_index: number | null;
  m_quotient: number | null;
  median_rcr: number | null;
  weighted_rcr: number | null;
  epsilon_prime_index: number | null;
  total_publications: number | null;
  first_author_pubs: number | null;
  last_author_pubs: number | null;
  total_citations: number | null;
  years_since_first_pub: number | null;
  publication_velocity: number | null;
  velocity_trend: "accelerating" | "stable" | "decelerating" | null;
  data_sources_used: string[];
};

export type ClinicalProductivity = {
  clin_id: string;
  physician_id: string;
  reporting_period: string | null;
  total_wrvus: number | null;
  wrvus_per_fte: number | null;
  patient_encounters: number | null;
  unique_patients: number | null;
  procedures_performed: unknown[];
  top_cpt_codes: string[];
  clinical_fte: number | null;
  practice_type: "inpatient" | "outpatient" | "mixed" | "ED" | null;
  data_source: DataSource;
  created_at: string;
};

export type ScopeOfPractice = {
  sop_id: string;
  physician_id: string;
  assessment_date: string;
  sop_score: number | null;
  sop_items: unknown[];
  practice_type_classification: string | null;
  comprehensiveness_ratio: number | null;
  data_source: DataSource;
  created_at: string;
};

export type Compensation = {
  comp_id: string;
  physician_id: string;
  reporting_year: number;
  base_salary: number | null;
  total_compensation: number | null;
  compensation_model: "salary" | "rvu_based" | "mixed" | "eat_what_you_kill" | null;
  bonus_structure: string | null;
  benefits_value: number | null;
  comp_per_wrvu: number | null;
  percentile_rank_specialty: number | null;
  data_source: DataSource;
  created_at: string;
};

export type ServiceActivity = {
  service_id: string;
  physician_id: string;
  activity_name: string;
  organization: string | null;
  role: "member" | "chair" | "officer" | "editor" | "reviewer" | null;
  scope: "departmental" | "institutional" | "regional" | "national" | "international" | null;
  category:
    | "committee"
    | "editorial"
    | "peer_review"
    | "mentoring"
    | "advocacy"
    | "community"
    | "DEI"
    | null;
  start_date: string | null;
  end_date: string | null;
  estimated_hours_per_month: number | null;
  is_compensated: boolean | null;
  is_cv_listed: boolean;
  data_source: DataSource;
  created_at: string;
};

export type EducationalActivity = {
  edu_id: string;
  physician_id: string;
  activity_name: string;
  activity_type:
    | "course_director"
    | "lecturer"
    | "small_group"
    | "clinical_preceptor"
    | "simulation"
    | "curriculum_dev"
    | "mentoring"
    | null;
  learner_level: "student" | "resident" | "fellow" | "faculty" | "CME" | null;
  institution: string | null;
  start_date: string | null;
  end_date: string | null;
  hours_per_year: number | null;
  learners_per_year: number | null;
  innovations_implemented: string[];
  teaching_awards: string[];
  data_source: DataSource;
  created_at: string;
};

export type LeadershipPosition = {
  lead_id: string;
  physician_id: string;
  title: string;
  organization: string | null;
  scope: "departmental" | "institutional" | "regional" | "national" | "international" | null;
  position_type:
    | "clinical_leadership"
    | "administrative"
    | "society"
    | "elected"
    | "appointed"
    | null;
  start_date: string | null;
  end_date: string | null;
  direct_reports_count: number | null;
  budget_responsibility: number | null;
  data_source: DataSource;
  created_at: string;
};

export type InvisibleWorkLogEntry = {
  iw_id: string;
  physician_id: string;
  activity_date: string;
  category:
    | "after_hours_ehr"
    | "prior_auth"
    | "care_coordination"
    | "crisis_management"
    | "uncompensated_call"
    | "informal_mentoring"
    | "DEI_service"
    | "community_outreach"
    | "admin_burden";
  hours_spent: number;
  description: string | null;
  is_specialty_specific: boolean;
  data_source: DataSource;
  created_at: string;
};

export type InvisibleWorkQuestionnaire = {
  iwq_assessment_id: string;
  physician_id: string;
  assessment_date: string;
  bits_score: number | null;
  bits_unreasonable_subscale: number | null;
  bits_unnecessary_subscale: number | null;
  estimated_weekly_invisible_hours: number | null;
  invisible_work_ratio: number | null;
  iwq_composite: number | null;
  data_source: DataSource;
  created_at: string;
};

export type WellbeingAssessment = {
  wb_id: string;
  physician_id: string;
  assessment_date: string;
  instrument: "PFI" | "MBI" | "mMBI_screen" | "single_item";
  burnout_score: number | null;
  fulfillment_score: number | null;
  interpersonal_disengagement_score: number | null;
  work_exhaustion_score: number | null;
  overall_burnout_classification:
    | "burned_out"
    | "at_risk"
    | "thriving"
    | "low_risk"
    | "moderate_risk"
    | "high_risk"
    | null;
  career_choice_regret: boolean | null;
  satisfaction_work_life_integration: number | null;
  touchpoint: "onboarding" | "quarterly" | "annual" | null;
  data_source: DataSource;
  created_at: string;
};

export type ProfessionalIdentity = {
  pi_id: string;
  physician_id: string;
  assessment_date: string;
  pif_stage: string | null;
  identity_primary: string | null;
  identity_secondary: string | null;
  identity_alignment_score: number | null;
  career_satisfaction: number | null;
  data_source: DataSource;
  created_at: string;
};

export type CareerAspirationsRecord = {
  asp_id: string;
  physician_id: string;
  assessment_date: string;
  desired_tracks: string[];
  desired_domains: string[];
  five_year_goals: string[];
  ten_year_goals: string[];
  barriers_identified: string[];
  energizers_identified: string[];
  setting_change_interest: "none" | "considering" | "actively_pursuing" | null;
  target_setting: string | null;
  data_source: DataSource;
  created_at: string;
};

export type IndustryPayment = {
  payment_id: string;
  physician_id: string;
  payment_year: number;
  payer_name: string;
  payment_type:
    | "consulting"
    | "speaking"
    | "research"
    | "ownership"
    | "royalty"
    | "travel"
    | null;
  amount: number;
  product_associated: string | null;
  is_research_related: boolean | null;
  data_source: DataSource;
  created_at: string;
};

export type IndustryPosition = {
  indpos_id: string;
  physician_id: string;
  company: string;
  title: string;
  role_type:
    | "medical_affairs"
    | "clinical_development"
    | "regulatory"
    | "commercial"
    | "consulting"
    | "KOL"
    | "advisory_board"
    | null;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  maintains_clinical_practice: boolean | null;
  clinical_hours_per_week: number | null;
  data_source: DataSource;
  created_at: string;
};

export type CareerDevelopmentIndex = {
  cdi_id: string;
  physician_id: string;
  computed_at: string;
  setting_type: string;
  specialty: string;
  academic_rank: string | null;
  cdi_total: number | null;
  clinical_productivity_score: number | null;
  scholarly_impact_score: number | null;
  educational_impact_score: number | null;
  leadership_service_score: number | null;
  scope_diversification_score: number | null;
  wellbeing_score: number | null;
  component_weights_used: Record<string, number>;
  percentile_rank_specialty_setting: number | null;
  data_source: DataSource;
};

export type InvisibleWorkQuotient = {
  iwq_id: string;
  physician_id: string;
  computed_at: string;
  iwq_total: number | null;
  bits_component: number | null;
  logged_hours_component: number | null;
  minority_tax_flag: boolean;
  invisible_work_ratio: number | null;
  specialty_adjustment_factor: number | null;
  percentile_rank: number | null;
  data_source: DataSource;
};

/** 8×8 lattice scores keyed by domain × track, e.g. "clinical_expertise:clinician" */
export type LatticeScores = Record<string, number>;

export type LatticePositioning = {
  lps_id: string;
  physician_id: string;
  computed_at: string;
  lattice_scores: LatticeScores;
  primary_track: string | null;
  secondary_track: string | null;
  strongest_domains: string[];
  weakest_domains: string[];
  track_alignment_score: number | null;
  energy_map: LatticeScores;
  burnout_risk_cells: string[];
  growth_opportunity_cells: string[];
  data_source: DataSource;
};

export type BenchmarkingSnapshot = {
  bench_id: string;
  physician_id: string;
  snapshot_at: string;
  metric_name: string;
  raw_value: number | null;
  specialty_percentile: number | null;
  setting_percentile: number | null;
  rank_percentile: number | null;
  normative_source: string;
  normative_n: number | null;
  normative_year: number | null;
};

export type CareerRecommendationRecord = {
  rec_id: string;
  physician_id: string;
  generated_at: string;
  recommendation_type: "strength" | "gap" | "risk" | "opportunity";
  domain: string | null;
  track: string | null;
  priority: "high" | "medium" | "low" | null;
  recommendation_text: string;
  supporting_evidence: unknown[];
  action_items: unknown[];
  target_timeline: string | null;
  dismissed_at: string | null;
  data_source: DataSource;
};

export type CareerGeneratedDocument = {
  career_doc_id: string;
  physician_id: string;
  document_type:
    | "cv"
    | "biosketch"
    | "personal_statement"
    | "teaching_portfolio"
    | "promotion_packet"
    | "cover_letter"
    | "annual_report";
  generated_at: string;
  version: number;
  content: string | null;
  template_used: string | null;
  data_sources_referenced: unknown[];
  data_source: DataSource;
};

export type ApiEnrichmentRun = {
  run_id: string;
  physician_id: string;
  trigger: "onboarding" | "quarterly" | "annual" | "manual";
  status: "pending" | "running" | "completed" | "failed" | "partial";
  started_at: string;
  completed_at: string | null;
  apis_requested: string[];
  apis_completed: string[];
  step_log: { step: string; status: string; at?: string }[];
  error_message: string | null;
};

export type ReconciliationItem = {
  item_id: string;
  physician_id: string;
  enrichment_run_id: string | null;
  item_type: "publication" | "grant" | "role" | "payment" | "certification";
  title: string;
  detail: string | null;
  source_api: string;
  external_id: string | null;
  status: "pending" | "confirmed" | "rejected";
  linked_record_id: string | null;
  created_at: string;
  resolved_at: string | null;
};

export type HIndexNorm = {
  norm_id: string;
  specialty_group: string;
  academic_rank: string;
  gender: string;
  mean_h_index: number;
  sd_h_index: number | null;
  mean_m_quotient: number | null;
  percentile_25: number | null;
  percentile_50: number | null;
  percentile_75: number | null;
  normative_source: string;
  normative_n: number | null;
  normative_year: number;
};

export type CdiWeightTemplate = {
  template_id: string;
  setting_type: string;
  specialty_group: string;
  career_track: string;
  weights: Record<string, number>;
  normative_source: string;
  is_user_adjustable: boolean;
};

/** Full physician career profile aggregate (for API responses) */
export type PhysicianCareerProfile = {
  physician: Physician;
  current_setting: CareerSettingRecord | null;
  primary_certification: SpecialtyCertification | null;
  latest_scholarly_metrics: ScholarlyMetrics | null;
  latest_cdi: CareerDevelopmentIndex | null;
  latest_lattice: LatticePositioning | null;
  latest_wellbeing: WellbeingAssessment | null;
  pending_reconciliation_count: number;
};

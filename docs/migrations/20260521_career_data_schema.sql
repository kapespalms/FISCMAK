-- Career Data Schema: People–Activities–Metrics–Composites
-- Run after FISCMAK_V2_SCHEMA.sql and 20260521_touchpoint1_onboarding.sql
-- Maps spec physician_id → app_users.user_id (1:1)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- DOMAIN 1: PHYSICIAN IDENTITY
-- ============================================================================

CREATE TABLE IF NOT EXISTS physicians (
  physician_id UUID PRIMARY KEY REFERENCES app_users(user_id) ON DELETE CASCADE,
  npi TEXT,
  orcid TEXT,
  first_name TEXT,
  last_name TEXT,
  name_variants TEXT[] NOT NULL DEFAULT '{}',
  email TEXT NOT NULL,
  gender TEXT,
  race_ethnicity TEXT,
  year_of_birth INT,
  year_terminal_degree INT,
  terminal_degree_type TEXT CHECK (terminal_degree_type IN ('MD', 'DO', 'PhD', 'MD-PhD', 'Other')),
  medical_school TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_physicians_npi ON physicians(npi) WHERE npi IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_physicians_orcid ON physicians(orcid) WHERE orcid IS NOT NULL;

CREATE TABLE IF NOT EXISTS specialty_certifications (
  cert_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  physician_id UUID NOT NULL REFERENCES physicians(physician_id) ON DELETE CASCADE,
  board_name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  subspecialty TEXT,
  certification_date DATE,
  expiration_date DATE,
  moc_status TEXT,
  is_primary BOOLEAN NOT NULL DEFAULT FALSE,
  data_source TEXT NOT NULL DEFAULT 'user' CHECK (data_source IN ('cv_parse', 'user', 'api', 'abms')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_specialty_certs_physician ON specialty_certifications(physician_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_specialty_certs_primary
  ON specialty_certifications(physician_id) WHERE is_primary = TRUE;

CREATE TABLE IF NOT EXISTS career_setting (
  setting_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  physician_id UUID NOT NULL REFERENCES physicians(physician_id) ON DELETE CASCADE,
  setting_type TEXT NOT NULL CHECK (setting_type IN ('academic', 'community', 'industry', 'hybrid')),
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN NOT NULL DEFAULT TRUE,
  institution_name TEXT,
  department TEXT,
  academic_rank TEXT,
  clinical_fte NUMERIC(4,2),
  research_fte NUMERIC(4,2),
  education_fte NUMERIC(4,2),
  admin_fte NUMERIC(4,2),
  data_source TEXT NOT NULL DEFAULT 'user' CHECK (data_source IN ('cv_parse', 'user', 'api', 'orcid')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_career_setting_physician ON career_setting(physician_id);
CREATE INDEX IF NOT EXISTS idx_career_setting_current ON career_setting(physician_id) WHERE is_current = TRUE;

CREATE TABLE IF NOT EXISTS identity_verification (
  verification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  physician_id UUID NOT NULL REFERENCES physicians(physician_id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('NPPES', 'ORCID', 'ABMS', 'user')),
  field_verified TEXT NOT NULL,
  confidence_score NUMERIC(5,4),
  verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  raw_payload JSONB DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_identity_verification_physician ON identity_verification(physician_id);

-- ============================================================================
-- DOMAIN 2: SCHOLARLY ACTIVITY
-- ============================================================================

CREATE TABLE IF NOT EXISTS publications (
  pub_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  physician_id UUID NOT NULL REFERENCES physicians(physician_id) ON DELETE CASCADE,
  pmid TEXT,
  doi TEXT,
  openalex_id TEXT,
  title TEXT NOT NULL,
  journal TEXT,
  year INT,
  publication_type TEXT CHECK (publication_type IN (
    'original_research', 'review', 'case_report', 'editorial', 'chapter', 'letter', 'other'
  )),
  author_position TEXT CHECK (author_position IN ('first', 'middle', 'last', 'corresponding')),
  total_authors INT,
  citation_count INT,
  rcr NUMERIC(8,4),
  rcr_percentile NUMERIC(5,2),
  field_citation_rate NUMERIC(8,4),
  is_open_access BOOLEAN,
  mesh_terms TEXT[] DEFAULT '{}',
  cv_listed BOOLEAN NOT NULL DEFAULT FALSE,
  api_discovered BOOLEAN NOT NULL DEFAULT FALSE,
  reconciled BOOLEAN NOT NULL DEFAULT FALSE,
  data_source TEXT NOT NULL DEFAULT 'cv_parse' CHECK (data_source IN (
    'cv_parse', 'pubmed', 'openalex', 'icite', 'crossref', 'google_scholar', 'user'
  )),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_publications_physician ON publications(physician_id);
CREATE INDEX IF NOT EXISTS idx_publications_pmid ON publications(pmid) WHERE pmid IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_publications_reconcile ON publications(physician_id, reconciled)
  WHERE api_discovered = TRUE AND reconciled = FALSE;

CREATE TABLE IF NOT EXISTS grants (
  grant_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  physician_id UUID NOT NULL REFERENCES physicians(physician_id) ON DELETE CASCADE,
  nih_project_number TEXT,
  funder TEXT NOT NULL,
  grant_title TEXT NOT NULL,
  role TEXT CHECK (role IN ('PI', 'Co-PI', 'Co-I', 'mentor')),
  total_amount NUMERIC(14,2),
  direct_costs NUMERIC(14,2),
  start_date DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  study_section TEXT,
  nih_activity_code TEXT,
  cv_listed BOOLEAN NOT NULL DEFAULT FALSE,
  api_discovered BOOLEAN NOT NULL DEFAULT FALSE,
  reconciled BOOLEAN NOT NULL DEFAULT FALSE,
  data_source TEXT NOT NULL DEFAULT 'cv_parse' CHECK (data_source IN ('cv_parse', 'nih_reporter', 'user')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_grants_physician ON grants(physician_id);
CREATE INDEX IF NOT EXISTS idx_grants_nih ON grants(nih_project_number) WHERE nih_project_number IS NOT NULL;

CREATE TABLE IF NOT EXISTS presentations (
  pres_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  physician_id UUID NOT NULL REFERENCES physicians(physician_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  venue TEXT,
  presentation_date DATE,
  presentation_type TEXT CHECK (presentation_type IN (
    'invited_lecture', 'oral_abstract', 'poster', 'grand_rounds', 'workshop', 'other'
  )),
  scope TEXT CHECK (scope IN ('local', 'regional', 'national', 'international')),
  is_peer_reviewed BOOLEAN,
  data_source TEXT NOT NULL DEFAULT 'cv_parse',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_presentations_physician ON presentations(physician_id);

CREATE TABLE IF NOT EXISTS scholarly_metrics (
  metric_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  physician_id UUID NOT NULL REFERENCES physicians(physician_id) ON DELETE CASCADE,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  h_index INT,
  g_index INT,
  i10_index INT,
  m_quotient NUMERIC(8,4),
  median_rcr NUMERIC(8,4),
  weighted_rcr NUMERIC(10,4),
  epsilon_prime_index NUMERIC(8,4),
  total_publications INT,
  first_author_pubs INT,
  last_author_pubs INT,
  total_citations INT,
  years_since_first_pub NUMERIC(6,2),
  publication_velocity NUMERIC(8,4),
  velocity_trend TEXT CHECK (velocity_trend IN ('accelerating', 'stable', 'decelerating')),
  data_sources_used TEXT[] NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_scholarly_metrics_physician ON scholarly_metrics(physician_id, computed_at DESC);

-- ============================================================================
-- DOMAIN 3: CLINICAL ACTIVITY
-- ============================================================================

CREATE TABLE IF NOT EXISTS clinical_productivity (
  clin_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  physician_id UUID NOT NULL REFERENCES physicians(physician_id) ON DELETE CASCADE,
  reporting_period DATERANGE,
  total_wrvus NUMERIC(12,2),
  wrvus_per_fte NUMERIC(12,2),
  patient_encounters INT,
  unique_patients INT,
  procedures_performed JSONB DEFAULT '[]'::jsonb,
  top_cpt_codes TEXT[] DEFAULT '{}',
  clinical_fte NUMERIC(4,2),
  practice_type TEXT CHECK (practice_type IN ('inpatient', 'outpatient', 'mixed', 'ED')),
  data_source TEXT NOT NULL DEFAULT 'self_report' CHECK (data_source IN (
    'self_report', 'cms_medicare', 'institutional'
  )),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clinical_productivity_physician ON clinical_productivity(physician_id);

CREATE TABLE IF NOT EXISTS scope_of_practice (
  sop_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  physician_id UUID NOT NULL REFERENCES physicians(physician_id) ON DELETE CASCADE,
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  sop_score NUMERIC(5,2) CHECK (sop_score BETWEEN 0 AND 30),
  sop_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  practice_type_classification TEXT,
  comprehensiveness_ratio NUMERIC(5,4),
  data_source TEXT NOT NULL DEFAULT 'questionnaire',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scope_of_practice_physician ON scope_of_practice(physician_id, assessment_date DESC);

CREATE TABLE IF NOT EXISTS compensation (
  comp_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  physician_id UUID NOT NULL REFERENCES physicians(physician_id) ON DELETE CASCADE,
  reporting_year INT NOT NULL,
  base_salary NUMERIC(12,2),
  total_compensation NUMERIC(12,2),
  compensation_model TEXT CHECK (compensation_model IN (
    'salary', 'rvu_based', 'mixed', 'eat_what_you_kill'
  )),
  bonus_structure TEXT,
  benefits_value NUMERIC(12,2),
  comp_per_wrvu NUMERIC(10,2),
  percentile_rank_specialty NUMERIC(5,2),
  data_source TEXT NOT NULL DEFAULT 'self_report' CHECK (data_source IN ('self_report', 'institutional')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compensation_physician ON compensation(physician_id, reporting_year DESC);

-- ============================================================================
-- DOMAIN 4: SERVICE, EDUCATION & LEADERSHIP
-- ============================================================================

CREATE TABLE IF NOT EXISTS service_activities (
  service_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  physician_id UUID NOT NULL REFERENCES physicians(physician_id) ON DELETE CASCADE,
  activity_name TEXT NOT NULL,
  organization TEXT,
  role TEXT CHECK (role IN ('member', 'chair', 'officer', 'editor', 'reviewer')),
  scope TEXT CHECK (scope IN ('departmental', 'institutional', 'regional', 'national', 'international')),
  category TEXT CHECK (category IN (
    'committee', 'editorial', 'peer_review', 'mentoring', 'advocacy', 'community', 'DEI'
  )),
  start_date DATE,
  end_date DATE,
  estimated_hours_per_month NUMERIC(6,2),
  is_compensated BOOLEAN,
  is_cv_listed BOOLEAN NOT NULL DEFAULT TRUE,
  data_source TEXT NOT NULL DEFAULT 'cv_parse',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_activities_physician ON service_activities(physician_id);

CREATE TABLE IF NOT EXISTS educational_activities (
  edu_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  physician_id UUID NOT NULL REFERENCES physicians(physician_id) ON DELETE CASCADE,
  activity_name TEXT NOT NULL,
  activity_type TEXT CHECK (activity_type IN (
    'course_director', 'lecturer', 'small_group', 'clinical_preceptor',
    'simulation', 'curriculum_dev', 'mentoring'
  )),
  learner_level TEXT CHECK (learner_level IN ('student', 'resident', 'fellow', 'faculty', 'CME')),
  institution TEXT,
  start_date DATE,
  end_date DATE,
  hours_per_year NUMERIC(8,2),
  learners_per_year INT,
  innovations_implemented TEXT[] DEFAULT '{}',
  teaching_awards TEXT[] DEFAULT '{}',
  data_source TEXT NOT NULL DEFAULT 'cv_parse',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_educational_activities_physician ON educational_activities(physician_id);

CREATE TABLE IF NOT EXISTS leadership_positions (
  lead_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  physician_id UUID NOT NULL REFERENCES physicians(physician_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  organization TEXT,
  scope TEXT CHECK (scope IN ('departmental', 'institutional', 'regional', 'national', 'international')),
  position_type TEXT CHECK (position_type IN (
    'clinical_leadership', 'administrative', 'society', 'elected', 'appointed'
  )),
  start_date DATE,
  end_date DATE,
  direct_reports_count INT,
  budget_responsibility NUMERIC(14,2),
  data_source TEXT NOT NULL DEFAULT 'cv_parse',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leadership_positions_physician ON leadership_positions(physician_id);

CREATE TABLE IF NOT EXISTS invisible_work_log (
  iw_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  physician_id UUID NOT NULL REFERENCES physicians(physician_id) ON DELETE CASCADE,
  activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL CHECK (category IN (
    'after_hours_ehr', 'prior_auth', 'care_coordination', 'crisis_management',
    'uncompensated_call', 'informal_mentoring', 'DEI_service', 'community_outreach', 'admin_burden'
  )),
  hours_spent NUMERIC(6,2) NOT NULL,
  description TEXT,
  is_specialty_specific BOOLEAN NOT NULL DEFAULT FALSE,
  data_source TEXT NOT NULL DEFAULT 'questionnaire',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invisible_work_log_physician ON invisible_work_log(physician_id, activity_date DESC);

CREATE TABLE IF NOT EXISTS invisible_work_questionnaire (
  iwq_assessment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  physician_id UUID NOT NULL REFERENCES physicians(physician_id) ON DELETE CASCADE,
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  bits_score NUMERIC(5,2),
  bits_unreasonable_subscale NUMERIC(5,2),
  bits_unnecessary_subscale NUMERIC(5,2),
  estimated_weekly_invisible_hours NUMERIC(6,2),
  invisible_work_ratio NUMERIC(5,4),
  iwq_composite NUMERIC(6,3),
  data_source TEXT NOT NULL DEFAULT 'questionnaire',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invisible_work_questionnaire_physician
  ON invisible_work_questionnaire(physician_id, assessment_date DESC);

-- ============================================================================
-- DOMAIN 5: WELL-BEING & PROFESSIONAL IDENTITY
-- ============================================================================

CREATE TABLE IF NOT EXISTS wellbeing_assessments (
  wb_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  physician_id UUID NOT NULL REFERENCES physicians(physician_id) ON DELETE CASCADE,
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  instrument TEXT NOT NULL CHECK (instrument IN ('PFI', 'MBI', 'mMBI_screen', 'single_item')),
  burnout_score NUMERIC(6,3),
  fulfillment_score NUMERIC(6,3),
  interpersonal_disengagement_score NUMERIC(6,3),
  work_exhaustion_score NUMERIC(6,3),
  overall_burnout_classification TEXT CHECK (overall_burnout_classification IN (
    'burned_out', 'at_risk', 'thriving', 'low_risk', 'moderate_risk', 'high_risk'
  )),
  career_choice_regret BOOLEAN,
  satisfaction_work_life_integration INT CHECK (satisfaction_work_life_integration BETWEEN 1 AND 5),
  touchpoint TEXT CHECK (touchpoint IN ('onboarding', 'quarterly', 'annual')),
  data_source TEXT NOT NULL DEFAULT 'questionnaire',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wellbeing_assessments_physician
  ON wellbeing_assessments(physician_id, assessment_date DESC);

CREATE TABLE IF NOT EXISTS professional_identity (
  pi_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  physician_id UUID NOT NULL REFERENCES physicians(physician_id) ON DELETE CASCADE,
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  pif_stage TEXT,
  identity_primary TEXT,
  identity_secondary TEXT,
  identity_alignment_score NUMERIC(5,2),
  career_satisfaction INT CHECK (career_satisfaction BETWEEN 1 AND 10),
  data_source TEXT NOT NULL DEFAULT 'questionnaire',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_professional_identity_physician
  ON professional_identity(physician_id, assessment_date DESC);

-- V1 schema used user_id on career_aspirations; career vault uses physician_id
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'career_aspirations' AND column_name = 'user_id'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'career_aspirations' AND column_name = 'physician_id'
  ) THEN
    ALTER TABLE career_aspirations RENAME TO legacy_user_career_aspirations;
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS career_aspirations (
  asp_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  physician_id UUID NOT NULL REFERENCES physicians(physician_id) ON DELETE CASCADE,
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  desired_tracks TEXT[] NOT NULL DEFAULT '{}',
  desired_domains TEXT[] NOT NULL DEFAULT '{}',
  five_year_goals TEXT[] DEFAULT '{}',
  ten_year_goals TEXT[] DEFAULT '{}',
  barriers_identified TEXT[] DEFAULT '{}',
  energizers_identified TEXT[] DEFAULT '{}',
  setting_change_interest TEXT CHECK (setting_change_interest IN ('none', 'considering', 'actively_pursuing')),
  target_setting TEXT,
  data_source TEXT NOT NULL DEFAULT 'questionnaire',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_career_aspirations_physician
  ON career_aspirations(physician_id, assessment_date DESC);

-- ============================================================================
-- DOMAIN 6: INDUSTRY ENGAGEMENT
-- ============================================================================

CREATE TABLE IF NOT EXISTS industry_payments (
  payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  physician_id UUID NOT NULL REFERENCES physicians(physician_id) ON DELETE CASCADE,
  payment_year INT NOT NULL,
  payer_name TEXT NOT NULL,
  payment_type TEXT CHECK (payment_type IN (
    'consulting', 'speaking', 'research', 'ownership', 'royalty', 'travel'
  )),
  amount NUMERIC(12,2) NOT NULL,
  product_associated TEXT,
  is_research_related BOOLEAN,
  data_source TEXT NOT NULL DEFAULT 'cms_open_payments',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_industry_payments_physician ON industry_payments(physician_id, payment_year DESC);

CREATE TABLE IF NOT EXISTS industry_positions (
  indpos_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  physician_id UUID NOT NULL REFERENCES physicians(physician_id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  title TEXT NOT NULL,
  role_type TEXT CHECK (role_type IN (
    'medical_affairs', 'clinical_development', 'regulatory', 'commercial',
    'consulting', 'KOL', 'advisory_board'
  )),
  start_date DATE,
  end_date DATE,
  is_current BOOLEAN NOT NULL DEFAULT TRUE,
  maintains_clinical_practice BOOLEAN,
  clinical_hours_per_week NUMERIC(5,2),
  data_source TEXT NOT NULL DEFAULT 'cv_parse',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_industry_positions_physician ON industry_positions(physician_id);

-- ============================================================================
-- DOMAIN 7: COMPUTED COMPOSITES & LATTICE
-- ============================================================================

CREATE TABLE IF NOT EXISTS career_development_index (
  cdi_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  physician_id UUID NOT NULL REFERENCES physicians(physician_id) ON DELETE CASCADE,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  setting_type TEXT NOT NULL,
  specialty TEXT NOT NULL,
  academic_rank TEXT,
  cdi_total NUMERIC(5,2) CHECK (cdi_total BETWEEN 0 AND 100),
  clinical_productivity_score NUMERIC(5,2),
  scholarly_impact_score NUMERIC(5,2),
  educational_impact_score NUMERIC(5,2),
  leadership_service_score NUMERIC(5,2),
  scope_diversification_score NUMERIC(5,2),
  wellbeing_score NUMERIC(5,2),
  component_weights_used JSONB NOT NULL DEFAULT '{}'::jsonb,
  percentile_rank_specialty_setting NUMERIC(5,2),
  data_source TEXT NOT NULL DEFAULT 'computed'
);

CREATE INDEX IF NOT EXISTS idx_cdi_physician ON career_development_index(physician_id, computed_at DESC);

CREATE TABLE IF NOT EXISTS invisible_work_quotient (
  iwq_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  physician_id UUID NOT NULL REFERENCES physicians(physician_id) ON DELETE CASCADE,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  iwq_total NUMERIC(8,4),
  bits_component NUMERIC(6,3),
  logged_hours_component NUMERIC(6,3),
  minority_tax_flag BOOLEAN NOT NULL DEFAULT FALSE,
  invisible_work_ratio NUMERIC(5,4),
  specialty_adjustment_factor NUMERIC(6,4),
  percentile_rank NUMERIC(5,2),
  data_source TEXT NOT NULL DEFAULT 'computed'
);

CREATE INDEX IF NOT EXISTS idx_iwq_composite_physician ON invisible_work_quotient(physician_id, computed_at DESC);

CREATE TABLE IF NOT EXISTS lattice_positioning (
  lps_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  physician_id UUID NOT NULL REFERENCES physicians(physician_id) ON DELETE CASCADE,
  computed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  lattice_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  primary_track TEXT,
  secondary_track TEXT,
  strongest_domains TEXT[] DEFAULT '{}',
  weakest_domains TEXT[] DEFAULT '{}',
  track_alignment_score NUMERIC(5,2),
  energy_map JSONB DEFAULT '{}'::jsonb,
  burnout_risk_cells TEXT[] DEFAULT '{}',
  growth_opportunity_cells TEXT[] DEFAULT '{}',
  data_source TEXT NOT NULL DEFAULT 'computed'
);

CREATE INDEX IF NOT EXISTS idx_lattice_positioning_physician ON lattice_positioning(physician_id, computed_at DESC);

CREATE TABLE IF NOT EXISTS benchmarking_snapshots (
  bench_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  physician_id UUID NOT NULL REFERENCES physicians(physician_id) ON DELETE CASCADE,
  snapshot_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metric_name TEXT NOT NULL,
  raw_value NUMERIC(14,4),
  specialty_percentile NUMERIC(5,2),
  setting_percentile NUMERIC(5,2),
  rank_percentile NUMERIC(5,2),
  normative_source TEXT NOT NULL,
  normative_n INT,
  normative_year INT
);

CREATE INDEX IF NOT EXISTS idx_benchmarking_snapshots_physician
  ON benchmarking_snapshots(physician_id, snapshot_at DESC);
CREATE INDEX IF NOT EXISTS idx_benchmarking_snapshots_metric
  ON benchmarking_snapshots(physician_id, metric_name, snapshot_at DESC);

CREATE TABLE IF NOT EXISTS career_recommendations (
  rec_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  physician_id UUID NOT NULL REFERENCES physicians(physician_id) ON DELETE CASCADE,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN (
    'strength', 'gap', 'risk', 'opportunity'
  )),
  domain TEXT,
  track TEXT,
  priority TEXT CHECK (priority IN ('high', 'medium', 'low')),
  recommendation_text TEXT NOT NULL,
  supporting_evidence JSONB NOT NULL DEFAULT '[]'::jsonb,
  action_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  target_timeline TEXT,
  dismissed_at TIMESTAMPTZ,
  data_source TEXT NOT NULL DEFAULT 'ai'
);

CREATE INDEX IF NOT EXISTS idx_career_recommendations_physician
  ON career_recommendations(physician_id, generated_at DESC);

CREATE TABLE IF NOT EXISTS career_documents (
  career_doc_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  physician_id UUID NOT NULL REFERENCES physicians(physician_id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN (
    'cv', 'biosketch', 'personal_statement', 'teaching_portfolio',
    'promotion_packet', 'cover_letter', 'annual_report'
  )),
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  version INT NOT NULL DEFAULT 1,
  content TEXT,
  template_used TEXT,
  data_sources_referenced JSONB NOT NULL DEFAULT '[]'::jsonb,
  data_source TEXT NOT NULL DEFAULT 'ai_generated'
);

CREATE INDEX IF NOT EXISTS idx_career_documents_physician
  ON career_documents(physician_id, document_type, generated_at DESC);

-- ============================================================================
-- API ENRICHMENT PIPELINE (supports CV → API cascade workflow)
-- ============================================================================

CREATE TABLE IF NOT EXISTS api_enrichment_runs (
  run_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  physician_id UUID NOT NULL REFERENCES physicians(physician_id) ON DELETE CASCADE,
  trigger TEXT NOT NULL CHECK (trigger IN ('onboarding', 'quarterly', 'annual', 'manual')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'running', 'completed', 'failed', 'partial'
  )),
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  apis_requested TEXT[] NOT NULL DEFAULT '{}',
  apis_completed TEXT[] NOT NULL DEFAULT '{}',
  step_log JSONB NOT NULL DEFAULT '[]'::jsonb,
  error_message TEXT
);

CREATE INDEX IF NOT EXISTS idx_api_enrichment_runs_physician
  ON api_enrichment_runs(physician_id, started_at DESC);

CREATE TABLE IF NOT EXISTS reconciliation_items (
  item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  physician_id UUID NOT NULL REFERENCES physicians(physician_id) ON DELETE CASCADE,
  enrichment_run_id UUID REFERENCES api_enrichment_runs(run_id) ON DELETE SET NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('publication', 'grant', 'role', 'payment', 'certification')),
  title TEXT NOT NULL,
  detail TEXT,
  source_api TEXT NOT NULL,
  external_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
  linked_record_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_reconciliation_items_physician
  ON reconciliation_items(physician_id, status);

-- ============================================================================
-- NORMATIVE LOOKUP TABLES (read-only reference data)
-- ============================================================================

CREATE TABLE IF NOT EXISTS h_index_norms (
  norm_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  specialty_group TEXT NOT NULL,
  academic_rank TEXT NOT NULL,
  gender TEXT NOT NULL DEFAULT '',
  mean_h_index NUMERIC(8,4) NOT NULL,
  sd_h_index NUMERIC(8,4),
  mean_m_quotient NUMERIC(8,4),
  percentile_25 NUMERIC(8,4),
  percentile_50 NUMERIC(8,4),
  percentile_75 NUMERIC(8,4),
  normative_source TEXT NOT NULL,
  normative_n INT,
  normative_year INT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (specialty_group, academic_rank, gender)
);

CREATE INDEX IF NOT EXISTS idx_h_index_norms_lookup
  ON h_index_norms(specialty_group, academic_rank);

CREATE TABLE IF NOT EXISTS wrvu_norms (
  norm_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  specialty TEXT NOT NULL,
  practice_type TEXT NOT NULL DEFAULT '',
  wrvu_per_minute NUMERIC(8,6),
  median_annual_wrvus NUMERIC(12,2),
  compensation_per_wrvu NUMERIC(10,2),
  normative_source TEXT NOT NULL,
  normative_year INT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (specialty, practice_type)
);

CREATE TABLE IF NOT EXISTS compensation_norms (
  norm_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  specialty TEXT NOT NULL,
  setting_type TEXT NOT NULL,
  academic_rank TEXT,
  gender TEXT,
  median_compensation NUMERIC(12,2),
  normative_source TEXT NOT NULL,
  normative_year INT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS promotion_rate_norms (
  norm_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department TEXT NOT NULL UNIQUE,
  ten_year_promotion_rate NUMERIC(5,4) NOT NULL,
  normative_source TEXT NOT NULL,
  normative_year INT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS burnout_prevalence_norms (
  norm_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  specialty TEXT NOT NULL,
  setting_type TEXT NOT NULL,
  gender TEXT,
  burnout_prevalence NUMERIC(5,4) NOT NULL,
  normative_source TEXT NOT NULL,
  normative_year INT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sop_score_norms (
  norm_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practice_type TEXT NOT NULL UNIQUE,
  mean_sop_score NUMERIC(5,2) NOT NULL,
  normative_source TEXT NOT NULL,
  normative_year INT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS em_percentile_rulers (
  norm_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  years_since_terminal_degree INT NOT NULL,
  percentile INT NOT NULL CHECK (percentile BETWEEN 1 AND 99),
  h_index_threshold NUMERIC(8,4) NOT NULL,
  normative_source TEXT NOT NULL,
  normative_year INT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cdi_weight_templates (
  template_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_type TEXT NOT NULL,
  specialty_group TEXT NOT NULL,
  career_track TEXT NOT NULL,
  weights JSONB NOT NULL,
  normative_source TEXT NOT NULL DEFAULT 'platform_literature_synthesis',
  is_user_adjustable BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (setting_type, specialty_group, career_track)
);

-- Normative tables are platform-managed (no user RLS)
ALTER TABLE h_index_norms ENABLE ROW LEVEL SECURITY;
ALTER TABLE wrvu_norms ENABLE ROW LEVEL SECURITY;
ALTER TABLE compensation_norms ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotion_rate_norms ENABLE ROW LEVEL SECURITY;
ALTER TABLE burnout_prevalence_norms ENABLE ROW LEVEL SECURITY;
ALTER TABLE sop_score_norms ENABLE ROW LEVEL SECURITY;
ALTER TABLE em_percentile_rulers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cdi_weight_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY h_index_norms_read ON h_index_norms FOR SELECT USING (true);
CREATE POLICY wrvu_norms_read ON wrvu_norms FOR SELECT USING (true);
CREATE POLICY compensation_norms_read ON compensation_norms FOR SELECT USING (true);
CREATE POLICY promotion_rate_norms_read ON promotion_rate_norms FOR SELECT USING (true);
CREATE POLICY burnout_prevalence_norms_read ON burnout_prevalence_norms FOR SELECT USING (true);
CREATE POLICY sop_score_norms_read ON sop_score_norms FOR SELECT USING (true);
CREATE POLICY em_percentile_rulers_read ON em_percentile_rulers FOR SELECT USING (true);
CREATE POLICY cdi_weight_templates_read ON cdi_weight_templates FOR SELECT USING (true);

-- ============================================================================
-- ROW LEVEL SECURITY (physician-scoped tables)
-- ============================================================================

DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY[
    'physicians', 'specialty_certifications', 'career_setting', 'identity_verification',
    'publications', 'grants', 'presentations', 'scholarly_metrics',
    'clinical_productivity', 'scope_of_practice', 'compensation',
    'service_activities', 'educational_activities', 'leadership_positions',
    'invisible_work_log', 'invisible_work_questionnaire',
    'wellbeing_assessments', 'professional_identity', 'career_aspirations',
    'industry_payments', 'industry_positions',
    'career_development_index', 'invisible_work_quotient', 'lattice_positioning',
    'benchmarking_snapshots', 'career_recommendations', 'career_documents',
    'api_enrichment_runs', 'reconciliation_items'
  ]
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format('DROP POLICY IF EXISTS %I_select ON %I', tbl, tbl);
    EXECUTE format('DROP POLICY IF EXISTS %I_all ON %I', tbl, tbl);
    EXECUTE format(
      'CREATE POLICY %I_all ON %I FOR ALL USING (auth.uid() = physician_id) WITH CHECK (auth.uid() = physician_id)',
      tbl, tbl
    );
  END LOOP;
END $$;

-- ============================================================================
-- SYNC: app_users → physicians on signup / backfill
-- ============================================================================

CREATE OR REPLACE FUNCTION public.ensure_physician_profile()
RETURNS TRIGGER AS $$
DECLARE
  parts TEXT[];
BEGIN
  parts := regexp_split_to_array(COALESCE(NEW.name, ''), '\s+');
  INSERT INTO public.physicians (
    physician_id, email, first_name, last_name, name_variants, updated_at
  )
  VALUES (
    NEW.user_id,
    NEW.email,
    parts[1],
    CASE WHEN array_length(parts, 1) > 1 THEN array_to_string(parts[2:array_length(parts, 1)], ' ') ELSE NULL END,
    CASE WHEN NEW.name IS NOT NULL THEN ARRAY[NEW.name] ELSE '{}'::TEXT[] END,
    NOW()
  )
  ON CONFLICT (physician_id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = COALESCE(EXCLUDED.first_name, physicians.first_name),
    last_name = COALESCE(EXCLUDED.last_name, physicians.last_name),
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_app_user_physician_sync ON app_users;
CREATE TRIGGER on_app_user_physician_sync
  AFTER INSERT OR UPDATE OF email, name ON app_users
  FOR EACH ROW EXECUTE FUNCTION public.ensure_physician_profile();

INSERT INTO physicians (physician_id, email, first_name, last_name, name_variants)
SELECT
  user_id,
  email,
  split_part(COALESCE(name, email), ' ', 1),
  NULLIF(trim(substring(COALESCE(name, '') FROM position(' ' IN COALESCE(name, ' ') || ' '))), ''),
  CASE WHEN name IS NOT NULL THEN ARRAY[name] ELSE '{}'::TEXT[] END
FROM app_users
ON CONFLICT (physician_id) DO NOTHING;

-- ============================================================================
-- SEED: Published normative benchmarks (Tier B literature)
-- ============================================================================

INSERT INTO h_index_norms (
  specialty_group, academic_rank, mean_h_index, sd_h_index, mean_m_quotient,
  percentile_25, percentile_50, percentile_75, normative_source, normative_n, normative_year
) VALUES
  ('all_specialties', 'Assistant Professor', 5.22, 4.0, 0.53, 4.21, 5.22, 6.23, 'Zaorsky et al. 2020', 14567, 2020),
  ('all_specialties', 'Associate Professor', 11.22, 6.0, 0.72, 9.65, 11.22, 12.78, 'Zaorsky et al. 2020', 14567, 2020),
  ('all_specialties', 'Full Professor', 20.77, 10.0, 0.99, 17.94, 20.77, 23.60, 'Zaorsky et al. 2020', 14567, 2020),
  ('all_specialties', 'Chair', 22.08, 12.0, 1.16, 17.73, 22.08, 26.44, 'Zaorsky et al. 2020', 14567, 2020)
ON CONFLICT (specialty_group, academic_rank, gender) DO NOTHING;

INSERT INTO sop_score_norms (practice_type, mean_sop_score, normative_source, normative_year) VALUES
  ('rural_health_center', 17.7, 'Killeen et al. 2023', 2023),
  ('FQHC', 16.3, 'Killeen et al. 2023', 2023),
  ('private_practice', 15.3, 'Killeen et al. 2023', 2023),
  ('urgent_care', 14.0, 'Killeen et al. 2023', 2023)
ON CONFLICT (practice_type) DO NOTHING;

INSERT INTO promotion_rate_norms (department, ten_year_promotion_rate, normative_source, normative_year) VALUES
  ('Family Medicine', 0.244, 'Xierali et al. 2021', 2021),
  ('Otolaryngology', 0.512, 'Xierali et al. 2021', 2021),
  ('All Clinical Departments', 0.371, 'Xierali et al. 2021', 2021)
ON CONFLICT (department) DO NOTHING;

INSERT INTO wrvu_norms (specialty, wrvu_per_minute, compensation_per_wrvu, normative_source, normative_year) VALUES
  ('Emergency Medicine', 0.057, NULL, 'Childers & Maggard-Gibbons 2020', 2020),
  ('Internal Medicine', NULL, 54, 'Childers & Maggard-Gibbons 2020', 2020),
  ('Family Medicine', NULL, 50, 'Childers & Maggard-Gibbons 2020', 2020),
  ('Neurosurgery', NULL, 90, 'Childers & Maggard-Gibbons 2020', 2020)
ON CONFLICT (specialty, practice_type) DO NOTHING;

INSERT INTO cdi_weight_templates (setting_type, specialty_group, career_track, weights, normative_source) VALUES
  ('academic', 'cognitive', 'Researcher',
   '{"clinical_volume":0.10,"research_influence":0.35,"teaching_impact":0.10,"service_citizenship":0.15,"wellbeing":0.15,"professional_growth":0.15}'::jsonb,
   'platform_literature_synthesis'),
  ('academic', 'cognitive', 'Clinician-Educator',
   '{"clinical_volume":0.20,"research_influence":0.10,"teaching_impact":0.30,"service_citizenship":0.15,"wellbeing":0.15,"professional_growth":0.10}'::jsonb,
   'platform_literature_synthesis'),
  ('academic', 'cognitive', 'Clinician',
   '{"clinical_volume":0.35,"research_influence":0.05,"teaching_impact":0.15,"service_citizenship":0.15,"wellbeing":0.20,"professional_growth":0.10}'::jsonb,
   'platform_literature_synthesis'),
  ('community', 'primary_care', 'Clinician',
   '{"clinical_volume":0.25,"quality_outcomes":0.15,"mentoring_precepting":0.10,"service_citizenship":0.15,"wellbeing":0.20,"professional_growth":0.15}'::jsonb,
   'platform_literature_synthesis'),
  ('community', 'procedural', 'Clinician',
   '{"clinical_volume":0.35,"quality_outcomes":0.20,"mentoring_precepting":0.10,"service_citizenship":0.10,"wellbeing":0.20,"professional_growth":0.10}'::jsonb,
   'platform_literature_synthesis'),
  ('industry', 'all', 'Medical Affairs',
   '{"therapeutic_expertise":0.30,"leadership_management":0.15,"innovation_impact":0.20,"wellbeing":0.15,"network_influence":0.15,"clinical_maintenance":0.05}'::jsonb,
   'platform_literature_synthesis')
ON CONFLICT (setting_type, specialty_group, career_track) DO NOTHING;

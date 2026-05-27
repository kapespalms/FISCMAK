-- FISCMAK Supabase full schema bundle
-- Project: qnskxioqsgnkkuyalqcn
-- Generated: 2026-05-25T05:02:19.650Z
-- Run in Supabase SQL Editor (fresh project) or use: npm run db:migrate



-- ========================================================================
-- FILE: docs/FISCMAK_V2_SCHEMA.sql
-- ========================================================================

-- FISCMAK V2 Schema (Desktop spec platform)
-- Run in Supabase SQL Editor after auth is enabled.
-- Replaces V1 lattice model; see docs/MIGRATION_V1_TO_V2.md

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- APP USERS (V2 profile; links to auth.users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS app_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  specialty TEXT,
  career_stage TEXT CHECK (career_stage IN (
    'Medical Student', 'Resident', 'Fellow',
    'Early Career (0–7 yr)', 'Mid-Career (8–20 yr)', 'Late Career (20+ yr)', 'Retired',
    'Early Attending', 'Mid-Career Attending', 'Senior Attending'
  )),
  practice_setting TEXT CHECK (practice_setting IN ('Academic', 'Community', 'Industry', 'Hybrid')),
  academic_rank TEXT CHECK (academic_rank IN (
    'Instructor', 'Assistant Professor', 'Associate Professor',
    'Full Professor', 'Chair', 'Emeritus'
  )),
  primary_career_track TEXT CHECK (primary_career_track IN (
    'Clinician', 'Educator', 'Researcher', 'Leader', 'Advocate',
    'Innovator', 'Quality-Safety', 'Wellness Champion'
  )),
  onboarding_metadata JSONB DEFAULT '{}'::jsonb,
  institution TEXT,
  cv_uploaded BOOLEAN NOT NULL DEFAULT FALSE,
  mempalace_id UUID,
  tier1_complete BOOLEAN NOT NULL DEFAULT FALSE,
  tier2_complete BOOLEAN NOT NULL DEFAULT FALSE,
  tier3_complete BOOLEAN NOT NULL DEFAULT FALSE,
  preferred_location TEXT,
  salary_min INTEGER,
  salary_max INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY app_users_select ON app_users FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY app_users_insert ON app_users FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY app_users_update ON app_users FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- CAREER ASSESSMENTS (7 touchpoints)
-- ============================================================================
CREATE TABLE IF NOT EXISTS career_assessments (
  assessment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_users(user_id) ON DELETE CASCADE,
  touchpoint_number INT NOT NULL CHECK (touchpoint_number BETWEEN 1 AND 7),
  question_category TEXT NOT NULL,
  questions_answered JSONB NOT NULL DEFAULT '[]'::jsonb,
  score NUMERIC(5,2),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_assessments_user_touchpoint ON career_assessments(user_id, touchpoint_number);
CREATE INDEX IF NOT EXISTS idx_assessments_category_score ON career_assessments(question_category, score);

ALTER TABLE career_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY career_assessments_all ON career_assessments
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- DOCUMENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS documents (
  document_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_users(user_id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('CV', 'Resume', 'Portfolio', 'Cover Letter', 'Other')),
  file_url TEXT,
  file_name TEXT,
  extracted_text TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  extraction_status TEXT NOT NULL DEFAULT 'pending',
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_user_type ON documents(user_id, document_type);

ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY documents_all ON documents
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- PATHWAYS & JOBS
-- ============================================================================
CREATE TABLE IF NOT EXISTS pathways (
  pathway_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  specialty TEXT NOT NULL,
  pathway_type TEXT NOT NULL,
  description TEXT,
  salary_range TEXT,
  job_market_demand TEXT CHECK (job_market_demand IN ('HIGH', 'MEDIUM', 'LOW')),
  milestones JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS jobs (
  job_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source TEXT,
  external_job_id TEXT,
  title TEXT NOT NULL,
  institution TEXT,
  location TEXT,
  salary INTEGER,
  specialties TEXT[] NOT NULL DEFAULT '{}',
  description TEXT,
  growth_potential TEXT,
  posted_date DATE NOT NULL DEFAULT CURRENT_DATE
);

CREATE INDEX IF NOT EXISTS idx_jobs_specialty ON jobs USING GIN(specialties);
CREATE INDEX IF NOT EXISTS idx_jobs_posted ON jobs(posted_date DESC);

CREATE TABLE IF NOT EXISTS user_job_matches (
  user_id UUID NOT NULL REFERENCES app_users(user_id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(job_id) ON DELETE CASCADE,
  match_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  viewed_at TIMESTAMPTZ,
  saved_at TIMESTAMPTZ,
  PRIMARY KEY (user_id, job_id)
);

CREATE INDEX IF NOT EXISTS idx_user_job_matches_score ON user_job_matches(user_id, match_score DESC);

ALTER TABLE user_job_matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_job_matches_all ON user_job_matches
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Pathways/jobs are public read
ALTER TABLE pathways ENABLE ROW LEVEL SECURITY;
CREATE POLICY pathways_read ON pathways FOR SELECT USING (true);
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY jobs_read ON jobs FOR SELECT USING (true);

-- ============================================================================
-- MEMPALACE EXPORTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS mempalace_exports (
  export_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_users(user_id) ON DELETE CASCADE,
  coaching_summary TEXT,
  key_facts JSONB NOT NULL DEFAULT '{}'::jsonb,
  preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  career_evolution JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE mempalace_exports ENABLE ROW LEVEL SECURITY;
CREATE POLICY mempalace_exports_all ON mempalace_exports
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- USER SETTINGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES app_users(user_id) ON DELETE CASCADE,
  goals JSONB NOT NULL DEFAULT '[]'::jsonb,
  salary_expectations JSONB NOT NULL DEFAULT '{}'::jsonb,
  job_market_scope TEXT DEFAULT 'Both',
  notification_preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  data_sharing JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_settings_all ON user_settings
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- CHAT MESSAGES
-- ============================================================================
CREATE TABLE IF NOT EXISTS chat_messages (
  message_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_users(user_id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  section TEXT DEFAULT 'dashboard',
  suggested_actions JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user ON chat_messages(user_id, created_at DESC);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY chat_messages_all ON chat_messages
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- PROMOTION DOSSIER (Phase 7)
-- ============================================================================
CREATE TABLE IF NOT EXISTS promotion_dossier (
  dossier_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_users(user_id) ON DELETE CASCADE,
  target_rank TEXT,
  target_track TEXT,
  target_date DATE,
  narrative_draft TEXT,
  domain_scores JSONB NOT NULL DEFAULT '{}'::jsonb,
  gaps_identified JSONB NOT NULL DEFAULT '[]'::jsonb,
  action_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS narrative_progress (
  progress_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dossier_id UUID NOT NULL REFERENCES promotion_dossier(dossier_id) ON DELETE CASCADE,
  section TEXT NOT NULL,
  content TEXT,
  completion_percentage INT NOT NULL DEFAULT 0,
  mak_feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_edited TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE promotion_dossier ENABLE ROW LEVEL SECURITY;
CREATE POLICY promotion_dossier_all ON promotion_dossier
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE narrative_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY narrative_progress_all ON narrative_progress FOR ALL
  USING (EXISTS (SELECT 1 FROM promotion_dossier d WHERE d.dossier_id = narrative_progress.dossier_id AND d.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM promotion_dossier d WHERE d.dossier_id = narrative_progress.dossier_id AND d.user_id = auth.uid()));

-- ============================================================================
-- AUTH BRIDGE: create app_users on signup
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_app_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.app_users (user_id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (user_id) DO NOTHING;
  INSERT INTO public.user_settings (user_id) VALUES (NEW.id) ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_v2 ON auth.users;
CREATE TRIGGER on_auth_user_created_v2
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_app_user();

-- ============================================================================
-- SEED: Pathways (sample)
-- ============================================================================
INSERT INTO pathways (specialty, pathway_type, description, salary_range, job_market_demand, milestones)
VALUES
  ('Cardiology', 'Clinical', 'Focus on patient care and clinical excellence.', '$200,000 - $400,000', 'HIGH', '[{"year":1,"goal":"Board certification"}]'::jsonb),
  ('Cardiology', 'Research', 'Career in cardiovascular research and grants.', '$120,000 - $250,000', 'MEDIUM', '[]'::jsonb),
  ('Cardiology', 'Education', 'Medical education and curriculum leadership.', '$150,000 - $280,000', 'HIGH', '[]'::jsonb),
  ('Cardiology', 'Leadership', 'Program and health system leadership.', '$180,000 - $350,000', 'MEDIUM', '[]'::jsonb),
  ('Internal Medicine', 'Clinical', 'Hospital medicine and primary care tracks.', '$180,000 - $320,000', 'HIGH', '[]'::jsonb),
  ('Internal Medicine', 'Research', 'Clinical and translational research.', '$120,000 - $240,000', 'MEDIUM', '[]'::jsonb)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- SEED: Jobs (sample)
-- ============================================================================
INSERT INTO jobs (source, title, institution, location, salary, specialties, description, growth_potential, posted_date)
VALUES
  ('MedJobs', 'Interventional Cardiologist', 'Mayo Clinic', 'Rochester, MN', 350000, ARRAY['Cardiology'], 'Leading interventional cardiology program.', 'HIGH', CURRENT_DATE - 2),
  ('LinkedIn', 'Academic Hospitalist', 'Johns Hopkins', 'Baltimore, MD', 280000, ARRAY['Internal Medicine'], 'Academic hospital medicine with teaching.', 'HIGH', CURRENT_DATE - 5),
  ('Indeed', 'Clinician-Educator', 'UCSF', 'San Francisco, CA', 310000, ARRAY['Internal Medicine'], 'Teaching and clinical excellence track.', 'MEDIUM', CURRENT_DATE - 10)
ON CONFLICT DO NOTHING;


-- ========================================================================
-- FILE: docs/migrations/20260521_touchpoint1_onboarding.sql
-- ========================================================================

-- Touchpoint 1 onboarding expansion (run after base schema)
ALTER TABLE app_users DROP CONSTRAINT IF EXISTS app_users_career_stage_check;
ALTER TABLE app_users ADD CONSTRAINT app_users_career_stage_check CHECK (career_stage IN (
  'Medical Student', 'Resident', 'Fellow',
  'Early Career (0–7 yr)', 'Mid-Career (8–20 yr)', 'Late Career (20+ yr)', 'Retired',
  'Early Attending', 'Mid-Career Attending', 'Senior Attending'
));

ALTER TABLE app_users ADD COLUMN IF NOT EXISTS practice_setting TEXT
  CHECK (practice_setting IN ('Academic', 'Community', 'Industry', 'Hybrid'));
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS academic_rank TEXT
  CHECK (academic_rank IN (
    'Instructor', 'Assistant Professor', 'Associate Professor',
    'Full Professor', 'Chair', 'Emeritus'
  ));
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS primary_career_track TEXT
  CHECK (primary_career_track IN (
    'Clinician', 'Educator', 'Researcher', 'Leader', 'Advocate',
    'Innovator', 'Quality-Safety', 'Wellness Champion'
  ));
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS onboarding_metadata JSONB DEFAULT '{}'::jsonb;


-- ========================================================================
-- FILE: docs/migrations/20260521_career_data_schema.sql
-- ========================================================================

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


-- ========================================================================
-- FILE: docs/migrations/20260522_activity_entries_v2.sql
-- ========================================================================

-- Activity entries for Mak capture + Career Data lattice (V2 / auth.users)
-- Safe to re-run. Requires app_users or auth.users.

CREATE TABLE IF NOT EXISTS activity_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  activity_date DATE,
  raw_text TEXT,
  input_source TEXT,
  energy_valence TEXT,
  primary_domain TEXT,
  primary_track TEXT,
  primary_domain_confidence REAL,
  primary_track_confidence REAL,
  confidence_score REAL,
  scope TEXT,
  evidence_strength TEXT,
  mak_rationale TEXT
);

CREATE INDEX IF NOT EXISTS idx_activity_entries_user_id ON activity_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_entries_activity_date ON activity_entries(activity_date);
CREATE INDEX IF NOT EXISTS idx_activity_entries_primary_domain ON activity_entries(primary_domain);
CREATE INDEX IF NOT EXISTS idx_activity_entries_primary_track ON activity_entries(primary_track);
CREATE INDEX IF NOT EXISTS idx_activity_entries_user_energy ON activity_entries(user_id, energy_valence);
CREATE INDEX IF NOT EXISTS idx_activity_entries_user_domain_track ON activity_entries(user_id, primary_domain, primary_track);
CREATE INDEX IF NOT EXISTS idx_activity_user_date_domain ON activity_entries(user_id, activity_date DESC, primary_domain);

ALTER TABLE activity_entries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS activity_entries_select ON activity_entries;
DROP POLICY IF EXISTS activity_entries_insert ON activity_entries;
DROP POLICY IF EXISTS activity_entries_update ON activity_entries;
DROP POLICY IF EXISTS activity_entries_delete ON activity_entries;

CREATE POLICY activity_entries_select ON activity_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY activity_entries_insert ON activity_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY activity_entries_update ON activity_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY activity_entries_delete ON activity_entries FOR DELETE USING (auth.uid() = user_id);


-- ========================================================================
-- FILE: docs/migrations/20260523_specialty_hierarchy.sql
-- ========================================================================

-- Specialty hierarchy columns for app_users (run in Supabase SQL editor)

ALTER TABLE app_users
  ADD COLUMN IF NOT EXISTS base_specialty TEXT,
  ADD COLUMN IF NOT EXISTS subspecialty TEXT,
  ADD COLUMN IF NOT EXISTS subspecialty_training_complete BOOLEAN DEFAULT FALSE;

-- Backfill base_specialty from legacy specialty column
UPDATE app_users
SET base_specialty = specialty
WHERE base_specialty IS NULL AND specialty IS NOT NULL;

COMMENT ON COLUMN app_users.base_specialty IS 'Residency / primary board specialty (e.g. Internal Medicine)';
COMMENT ON COLUMN app_users.subspecialty IS 'Fellowship subspecialty when applicable (e.g. Interventional Cardiology)';
COMMENT ON COLUMN app_users.subspecialty_training_complete IS 'True when fellowship training is complete and user is board-eligible';


-- ========================================================================
-- FILE: docs/migrations/20260523_core_ontology.sql
-- ========================================================================

-- FISCMAK Core Ontology Layer
-- Created: 2026-05-23
-- Purpose: Reference tables that define what activities mean and how they map to competencies, tracks, levels, and outputs
-- Dependencies: Requires app_users and auth schema to exist (RLS references)

-- ============================================================================
-- TABLE 1: ontology_sources
-- ============================================================================
-- Tracks where each concept came from (ACGME, Clinician Educator, proprietary, etc.)

create table if not exists ontology_sources (
  source_id uuid primary key default gen_random_uuid(),
  source_name text not null unique,
  source_type text, -- 'ACGME', 'Clinician Educator Milestones', 'FISCMAK Proprietary', 'AAMC', 'CanMEDS', 'Dreyfus', etc.
  url text,
  citation_note text,
  version text,
  active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

comment on table ontology_sources is 'Tracks the source and citation for all ontology concepts';

-- Seed sources
insert into ontology_sources (source_name, source_type, url, citation_note, version, active) values
  ('ACGME', 'ACGME', 'https://www.acgme.org', 'Accreditation Council for Graduate Medical Education', '2024', true),
  ('Clinician Educator Milestones', 'ACGME', 'https://www.acgme.org/globalassets/pfassets/programresources/clinicianeducator.pdf', 'ACGME Clinician-Educator Track Milestones', '2024', true),
  ('FISCMAK Proprietary', 'FISCMAK Proprietary', null, 'Invisible work activities and mappings developed for FISCMAK', '1.0', true)
on conflict (source_name) do nothing;

-- ============================================================================
-- TABLE 2: ontology_specialties
-- ============================================================================
-- Canonical list of medical specialties

create table if not exists ontology_specialties (
  specialty_id uuid primary key default gen_random_uuid(),
  specialty_key text not null unique, -- stable key: 'psych', 'im', 'em', etc.
  name text not null,
  acgme_review_committee text,
  aliases text[], -- alternative names
  active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

comment on table ontology_specialties is 'Canonical specialty reference list from ACGME';
create index if not exists idx_specialties_key on ontology_specialties(specialty_key);

-- Seed specialties (start with core ones, can expand)
insert into ontology_specialties (specialty_key, name, acgme_review_committee, aliases, active) values
  ('psych', 'Psychiatry', 'Psychiatry', '{"Psychiatry", "Psych", "Psychiatric Medicine"}'::text[], true),
  ('im', 'Internal Medicine', 'Internal Medicine', '{"Internal Medicine", "Medicine", "IM"}'::text[], true),
  ('em', 'Emergency Medicine', 'Emergency Medicine', '{"Emergency Medicine", "EM", "Emergency"}'::text[], true),
  ('surgery', 'General Surgery', 'Surgery', '{"General Surgery", "Surgery", "Gen Surg"}'::text[], true),
  ('peds', 'Pediatrics', 'Pediatrics', '{"Pediatrics", "Peds", "Child Medicine"}'::text[], true),
  ('fm', 'Family Medicine', 'Family Medicine', '{"Family Medicine", "FM", "Family Practice"}'::text[], true),
  ('ob', 'Obstetrics and Gynecology', 'Obstetrics and Gynecology', '{"Obstetrics and Gynecology", "OB/GYN", "OBGYN"}'::text[], true),
  ('neuro', 'Neurology', 'Neurology', '{"Neurology", "Neuro"}'::text[], true),
  ('pathology', 'Pathology', 'Pathology', '{"Pathology", "Anatomic Pathology", "Clinical Pathology"}'::text[], true),
  ('radiology', 'Radiology', 'Radiology', '{"Radiology", "Diagnostic Radiology"}'::text[], true)
on conflict (specialty_key) do nothing;

-- ============================================================================
-- TABLE 3: ontology_subspecialties
-- ============================================================================
-- Fellowship types and specialty branches

create table if not exists ontology_subspecialties (
  subspecialty_id uuid primary key default gen_random_uuid(),
  subspecialty_key text not null unique,
  specialty_id uuid not null references ontology_specialties(specialty_id),
  name text not null,
  acgme_accredited boolean default true,
  residency_dependency_status text, -- 'Yes, Always' | 'Yes, With Exceptions' | 'No'
  aliases text[],
  active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

comment on table ontology_subspecialties is 'Fellowship programs and specialty branches';
create index if not exists idx_subspecialties_specialty on ontology_subspecialties(specialty_id);
create index if not exists idx_subspecialties_key on ontology_subspecialties(subspecialty_key);

-- Seed psychiatry fellowships
insert into ontology_subspecialties (subspecialty_key, specialty_id, name, acgme_accredited, residency_dependency_status, aliases, active)
select 'psych_child_adolescent', specialty_id, 'Child and Adolescent Psychiatry', true, 'Yes, Always', '{"CAP", "Child Psych"}'::text[], true from ontology_specialties where specialty_key = 'psych'
union all
select 'psych_forensic', specialty_id, 'Forensic Psychiatry', true, 'Yes, With Exceptions', '{"Forensic Psych"}'::text[], true from ontology_specialties where specialty_key = 'psych'
union all
select 'psych_geriatric', specialty_id, 'Geriatric Psychiatry', true, 'Yes, With Exceptions', '{"Geriatric Psych"}'::text[], true from ontology_specialties where specialty_key = 'psych'
union all
select 'psych_addiction', specialty_id, 'Addiction Psychiatry', true, 'Yes, With Exceptions', '{"Addiction Psych"}'::text[], true from ontology_specialties where specialty_key = 'psych'
union all
select 'psych_cl', specialty_id, 'Consultation-Liaison Psychiatry', true, 'Yes, With Exceptions', '{"CL Psych", "Psychosomatic Medicine"}'::text[], true from ontology_specialties where specialty_key = 'psych'
union all
select 'psych_sleep', specialty_id, 'Sleep Medicine', true, 'No', '{"Sleep"}'::text[], true from ontology_specialties where specialty_key = 'psych'
on conflict (subspecialty_key) do nothing;

-- ============================================================================
-- TABLE 4: ontology_competency_domains
-- ============================================================================
-- Broad competency buckets (ACGME 6 + FISCMAK domains)

create table if not exists ontology_competency_domains (
  domain_id uuid primary key default gen_random_uuid(),
  domain_key text not null unique, -- 'pc', 'mk', 'prof', 'teaching', etc.
  name text not null,
  framework text, -- 'ACGME', 'Clinician Educator', 'FISCMAK'
  description text,
  source_id uuid references ontology_sources(source_id),
  active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

comment on table ontology_competency_domains is 'Broad competency domains (ACGME 6 + FISCMAK native)';
create index if not exists idx_domains_key on ontology_competency_domains(domain_key);
create index if not exists idx_domains_framework on ontology_competency_domains(framework);

-- Seed domains
insert into ontology_competency_domains (domain_key, name, framework, description, source_id, active)
select 
  'pc', 'Patient Care', 'ACGME', 
  'Ability to provide patient care that is compassionate, appropriate, and effective for the treatment of health problems and the promotion of health.',
  source_id, true
from ontology_sources where source_name = 'ACGME'
union all
select 
  'mk', 'Medical Knowledge', 'ACGME',
  'Demonstration of knowledge of established and evolving biomedical, clinical, and cognate sciences and the application of this knowledge to patient care.',
  source_id, true
from ontology_sources where source_name = 'ACGME'
union all
select 
  'pbli', 'Practice-Based Learning and Improvement', 'ACGME',
  'Ability to investigate and evaluate their patient care practices, appraise and assimilate scientific evidence, and improve their patient care practices.',
  source_id, true
from ontology_sources where source_name = 'ACGME'
union all
select 
  'ics', 'Interpersonal and Communication Skills', 'ACGME',
  'Ability to demonstrate interpersonal and communication skills that result in effective information exchange and collaboration.',
  source_id, true
from ontology_sources where source_name = 'ACGME'
union all
select 
  'prof', 'Professionalism', 'ACGME',
  'Demonstration of a commitment to carrying out professional responsibilities and an adherence to ethical principles.',
  source_id, true
from ontology_sources where source_name = 'ACGME'
union all
select 
  'sbp', 'Systems-Based Practice', 'ACGME',
  'Ability to work effectively in various health care settings and to manage system resources to provide care that is safe, timely, efficient, effective, and equitable.',
  source_id, true
from ontology_sources where source_name = 'ACGME'
union all
select 
  'teaching', 'Teaching and Facilitation', 'FISCMAK',
  'Ability to teach, facilitate learning, and assess learners',
  source_id, true
from ontology_sources where source_name = 'Clinician Educator Milestones'
union all
select 
  'mentorship', 'Mentorship and Sponsorship', 'FISCMAK',
  'Ability to mentor, coach, and sponsor learners and colleagues through career development',
  source_id, true
from ontology_sources where source_name = 'Clinician Educator Milestones'
union all
select 
  'leadership', 'Leadership', 'FISCMAK',
  'Ability to lead, influence, and manage teams and initiatives',
  source_id, true
from ontology_sources where source_name = 'Clinician Educator Milestones'
union all
select 
  'admin', 'Administration', 'FISCMAK',
  'Ability to manage administrative responsibilities and programs',
  source_id, true
from ontology_sources where source_name = 'Clinician Educator Milestones'
union all
select 
  'wellbeing', 'Well-Being', 'FISCMAK',
  'Commitment to personal well-being and support of others''s well-being',
  source_id, true
from ontology_sources where source_name = 'Clinician Educator Milestones'
union all
select 
  'scholarship', 'Scholarship and Dissemination', 'FISCMAK',
  'Ability to conduct, evaluate, and disseminate scholarship',
  source_id, true
from ontology_sources where source_name = 'Clinician Educator Milestones'
union all
select 
  'innovation', 'Innovation and Informatics', 'FISCMAK',
  'Ability to innovate and use technology to improve care and education',
  source_id, true
from ontology_sources where source_name = 'FISCMAK Proprietary'
union all
select 
  'advocacy', 'Advocacy', 'FISCMAK',
  'Ability to advocate for learners, patients, and systems',
  source_id, true
from ontology_sources where source_name = 'FISCMAK Proprietary'
union all
select 
  'identity', 'Professional Identity Formation', 'FISCMAK',
  'Ability to support development of professional identity in self and others',
  source_id, true
from ontology_sources where source_name = 'Clinician Educator Milestones'
on conflict (domain_key) do nothing;

-- ============================================================================
-- TABLE 5: ontology_subcompetencies
-- ============================================================================
-- Granular competency behaviors (seeded from Clinician Educator Milestones)

create table if not exists ontology_subcompetencies (
  subcompetency_id uuid primary key default gen_random_uuid(),
  subcompetency_key text not null unique,
  domain_id uuid not null references ontology_competency_domains(domain_id),
  name text not null,
  description text,
  source_id uuid references ontology_sources(source_id),
  acgme_milestone_reference text, -- e.g., "Clinician Educator Milestones - Educational Theory and Practice 4"
  active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

comment on table ontology_subcompetencies is 'Granular competency behaviors (Clinician Educator Milestones primary source)';
create index if not exists idx_subcompetencies_domain on ontology_subcompetencies(domain_id);
create index if not exists idx_subcompetencies_key on ontology_subcompetencies(subcompetency_key);

-- Seed subcompetencies from Clinician Educator Milestones
insert into ontology_subcompetencies (subcompetency_key, domain_id, name, description, source_id, acgme_milestone_reference, active)
select 'reflective_practice', (select domain_id from ontology_competency_domains where domain_key = 'mentorship'), 'Reflective Practice and Commitment to Personal Growth', 'Engages in ongoing self-reflection regarding personal strengths, limitations, and practice patterns', (select source_id from ontology_sources where source_name = 'Clinician Educator Milestones'), 'Clinician Educator Milestones - Universal Pillars 1', true
union all
select 'personal_wellbeing', (select domain_id from ontology_competency_domains where domain_key = 'wellbeing'), 'Personal Well-Being', 'Demonstrates personal strategies for well-being and self-care', (select source_id from ontology_sources where source_name = 'Clinician Educator Milestones'), 'Clinician Educator Milestones - Universal Pillars 2', true
union all
select 'bias_assumptions', (select domain_id from ontology_competency_domains where domain_key = 'prof'), 'Recognition and Mitigation of Personal Perspectives and Assumptions', 'Identifies and addresses personal biases and their impact on patients, learners, and colleagues', (select source_id from ontology_sources where source_name = 'Clinician Educator Milestones'), 'Clinician Educator Milestones - Universal Pillars 3', true
union all
select 'professional_responsibility', (select domain_id from ontology_competency_domains where domain_key = 'prof'), 'Commitment to Professional Responsibilities', 'Fulfills professional obligations and maintains accountability', (select source_id from ontology_sources where source_name = 'Clinician Educator Milestones'), 'Clinician Educator Milestones - Universal Pillars 4', true
union all
select 'teaching_learning', (select domain_id from ontology_competency_domains where domain_key = 'teaching'), 'Teaching and Facilitating Learning', 'Facilitates learning through skilled instruction and creation of supportive learning environments', (select source_id from ontology_sources where source_name = 'Clinician Educator Milestones'), 'Clinician Educator Milestones - Educational Theory and Practice 1', true
union all
select 'learning_environment_prof', (select domain_id from ontology_competency_domains where domain_key = 'teaching'), 'Professionalism in the Learning Environment', 'Establishes a professional, ethical, and inclusive learning environment', (select source_id from ontology_sources where source_name = 'Clinician Educator Milestones'), 'Clinician Educator Milestones - Educational Theory and Practice 2', true
union all
select 'learner_assessment', (select domain_id from ontology_competency_domains where domain_key = 'teaching'), 'Learner Assessment', 'Selects and uses assessment methods appropriate for educational context and learner needs', (select source_id from ontology_sources where source_name = 'Clinician Educator Milestones'), 'Clinician Educator Milestones - Educational Theory and Practice 3', true
union all
select 'feedback', (select domain_id from ontology_competency_domains where domain_key = 'teaching'), 'Feedback', 'Fosters conversations that motivate learners to incorporate feedback and improve performance', (select source_id from ontology_sources where source_name = 'Clinician Educator Milestones'), 'Clinician Educator Milestones - Educational Theory and Practice 4', true
union all
select 'remediation', (select domain_id from ontology_competency_domains where domain_key = 'teaching'), 'Performance Improvement and Remediation', 'Identifies struggling learners and supports their improvement through tailored interventions', (select source_id from ontology_sources where source_name = 'Clinician Educator Milestones'), 'Clinician Educator Milestones - Educational Theory and Practice 5', true
union all
select 'program_eval', (select domain_id from ontology_competency_domains where domain_key = 'leadership'), 'Programmatic Evaluation', 'Participates in evaluation of educational programs and learner outcomes', (select source_id from ontology_sources where source_name = 'Clinician Educator Milestones'), 'Clinician Educator Milestones - Educational Theory and Practice 6', true
union all
select 'learner_prof_dev', (select domain_id from ontology_competency_domains where domain_key = 'mentorship'), 'Learner Professional Development', 'Supports learners in professional identity formation and career development', (select source_id from ontology_sources where source_name = 'Clinician Educator Milestones'), 'Clinician Educator Milestones - Educational Theory and Practice 7', true
union all
select 'science_learning', (select domain_id from ontology_competency_domains where domain_key = 'teaching'), 'Science of Learning', 'Incorporates best practices from learning sciences into teaching', (select source_id from ontology_sources where source_name = 'Clinician Educator Milestones'), 'Clinician Educator Milestones - Educational Theory and Practice 8', true
union all
select 'med_ed_scholarship', (select domain_id from ontology_competency_domains where domain_key = 'scholarship'), 'Medical Education Scholarship', 'Conducts and disseminates medical education scholarship', (select source_id from ontology_sources where source_name = 'Clinician Educator Milestones'), 'Clinician Educator Milestones - Educational Theory and Practice 9', true
union all
select 'learning_environment', (select domain_id from ontology_competency_domains where domain_key = 'leadership'), 'Learning Environment', 'Fosters a learning environment that supports educational mission and learner development', (select source_id from ontology_sources where source_name = 'Clinician Educator Milestones'), 'Clinician Educator Milestones - Educational Theory and Practice 10', true
union all
select 'curriculum', (select domain_id from ontology_competency_domains where domain_key = 'teaching'), 'Curriculum Design and Adaptation', 'Designs and adapts curriculum to meet learner and program needs', (select source_id from ontology_sources where source_name = 'Clinician Educator Milestones'), 'Clinician Educator Milestones - Educational Theory and Practice 11', true
union all
select 'learner_colleague_wellbeing', (select domain_id from ontology_competency_domains where domain_key = 'wellbeing'), 'Well-Being of Learners and Colleagues', 'Promotes well-being and resilience in learners and colleagues', (select source_id from ontology_sources where source_name = 'Clinician Educator Milestones'), 'Clinician Educator Milestones - Well-Being 1', true
union all
select 'admin_skills', (select domain_id from ontology_competency_domains where domain_key = 'admin'), 'Administration Skills', 'Manages administrative and operational responsibilities effectively', (select source_id from ontology_sources where source_name = 'Clinician Educator Milestones'), 'Clinician Educator Milestones - Administration 1', true
union all
select 'leadership_skills', (select domain_id from ontology_competency_domains where domain_key = 'leadership'), 'Leadership Skills', 'Demonstrates effective leadership and influence', (select source_id from ontology_sources where source_name = 'Clinician Educator Milestones'), 'Clinician Educator Milestones - Administration 2', true
union all
select 'change_management', (select domain_id from ontology_competency_domains where domain_key = 'leadership'), 'Change Management', 'Leads and manages organizational change effectively', (select source_id from ontology_sources where source_name = 'Clinician Educator Milestones'), 'Clinician Educator Milestones - Administration 3', true
on conflict (subcompetency_key) do nothing;

-- ============================================================================
-- TABLE 6: ontology_development_levels
-- ============================================================================
-- 1-5 scale from recognition through system-building

create table if not exists ontology_development_levels (
  level_id uuid primary key default gen_random_uuid(),
  level_key text not null unique, -- 'level_1', 'level_2', etc.
  numeric_value integer not null unique,
  name text not null,
  description text,
  active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

comment on table ontology_development_levels is 'Developmental progression from novice to expert/system-builder';
create index if not exists idx_levels_numeric on ontology_development_levels(numeric_value);

-- Seed levels
insert into ontology_development_levels (level_key, numeric_value, name, description, active) values
  ('level_1', 1, 'Recognizes', 'Can identify, name, or describe the competency or skill', true),
  ('level_2', 2, 'Participates', 'Helps with or applies under guidance; developing independence', true),
  ('level_3', 3, 'Performs', 'Independently applies skill in routine contexts', true),
  ('level_4', 4, 'Leads', 'Leads others; adapts across complex contexts', true),
  ('level_5', 5, 'Builds Systems', 'Creates systems, teaches others, disseminates, changes practice', true)
on conflict (level_key) do nothing;

-- ============================================================================
-- TABLE 7: ontology_career_tracks
-- ============================================================================
-- Canonical career pathways

create table if not exists ontology_career_tracks (
  track_id uuid primary key default gen_random_uuid(),
  track_key text not null unique, -- 'clinician', 'clinician_educator', etc.
  name text not null,
  description text,
  active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

comment on table ontology_career_tracks is 'Canonical career pathway options';
create index if not exists idx_tracks_key on ontology_career_tracks(track_key);

-- Seed career tracks
insert into ontology_career_tracks (track_key, name, description, active) values
  ('clinician', 'Clinician', 'Clinical practice and direct patient care', true),
  ('clinician_educator', 'Clinician Educator', 'Teaching, mentoring, and learner development', true),
  ('researcher', 'Researcher / Scholar', 'Research, scholarship, and dissemination', true),
  ('program_leader', 'Program Leader', 'Program direction and educational leadership', true),
  ('systems_leader', 'Systems Leader', 'System-level change and improvement', true),
  ('administrator', 'Administrator', 'Administrative and operational leadership', true),
  ('innovator', 'Innovator / Informaticist', 'Innovation, technology, and informatics', true),
  ('advocate', 'Advocate', 'Advocacy, social responsibility, and equity', true),
  ('wellness_champion', 'Wellness Champion', 'Well-being, resilience, and burnout prevention', true),
  ('consultant', 'Consultant', 'Consulting and expertise sharing', true),
  ('executive', 'Executive Leader', 'Executive and organizational leadership', true)
on conflict (track_key) do nothing;

-- ============================================================================
-- TABLE 8: ontology_activity_categories
-- ============================================================================
-- Broad types of invisible work

create table if not exists ontology_activity_categories (
  category_id uuid primary key default gen_random_uuid(),
  category_key text not null unique,
  name text not null,
  description text,
  active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

comment on table ontology_activity_categories is 'Categories of invisible work activities';
create index if not exists idx_categories_key on ontology_activity_categories(category_key);

-- Seed activity categories
insert into ontology_activity_categories (category_key, name, description, active) values
  ('teaching', 'Teaching', 'Formal and informal teaching activities', true),
  ('mentorship', 'Mentorship', 'Mentoring, coaching, and sponsorship activities', true),
  ('feedback', 'Feedback', 'Giving and receiving feedback', true),
  ('remediation', 'Remediation', 'Supporting struggling learners and performance improvement', true),
  ('leadership', 'Leadership', 'Leading meetings, teams, and initiatives', true),
  ('admin', 'Administration', 'Administrative and operational work', true),
  ('systems_improvement', 'Systems Improvement', 'Identifying and implementing workflow/process improvements', true),
  ('advocacy', 'Advocacy', 'Speaking up and advocating for change', true),
  ('wellbeing', 'Well-Being', 'Recognizing and supporting well-being in self and others', true),
  ('scholarship', 'Scholarship', 'Research, presentation, and dissemination activities', true),
  ('curriculum', 'Curriculum', 'Creating educational content and curriculum design', true),
  ('informatics', 'Informatics', 'Technology, tools, and data management', true),
  ('identity', 'Professional Identity', 'Supporting professional identity formation and career planning', true),
  ('coordination', 'Invisible Coordination', 'Behind-the-scenes alignment and coordination work', true)
on conflict (category_key) do nothing;

-- ============================================================================
-- TABLE 9: ontology_invisible_work_activities
-- ============================================================================
-- Proprietary core: the actual activities users log

create table if not exists ontology_invisible_work_activities (
  activity_id uuid primary key default gen_random_uuid(),
  activity_key text not null unique, -- 'gave_feedback', 'mentored_trainee', etc.
  activity_name text not null,
  category_id uuid not null references ontology_activity_categories(category_id),
  plain_language_description text, -- What does this activity mean in human terms?
  context_examples text[], -- ["Helped during rounds", "During supervision", "In team meeting"]
  default_scope text default 'local', -- 'local' (one person), 'team', 'program', 'system'
  default_evidence_type text default 'narrative', -- 'narrative', 'email', 'feedback', 'leadership', 'metrics'
  is_proprietary boolean default true,
  active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

comment on table ontology_invisible_work_activities is 'Canonical invisible work activities—the proprietary heart of FISCMAK';
create index if not exists idx_activities_key on ontology_invisible_work_activities(activity_key);
create index if not exists idx_activities_category on ontology_invisible_work_activities(category_id);

-- Seed initial invisible work activities
insert into ontology_invisible_work_activities (activity_key, activity_name, category_id, plain_language_description, context_examples, default_scope, default_evidence_type, is_proprietary, active)
select 'gave_feedback', 'Gave feedback', category_id, 'Provided reinforcing or corrective feedback to a learner or colleague to improve performance', '{"During rounds", "In supervision", "After presentation", "In one-on-one meeting"}'::text[], 'local', 'narrative', true, true from ontology_activity_categories where category_key = 'feedback'
union all
select 'mentored_trainee', 'Mentored trainee', (select category_id from ontology_activity_categories where category_key = 'mentorship'), 'Helped a learner or junior colleague think through career, performance, identity, or next steps', '{"Career planning conversation", "Professional development", "Identity formation", "Navigating challenges"}'::text[], 'local', 'narrative', true, true
union all
select 'supported_distressed_learner', 'Supported distressed learner/colleague', (select category_id from ontology_activity_categories where category_key = 'wellbeing'), 'Recognized distress, burnout, or overwhelm in a colleague and responded supportively', '{"Checked in after difficult case", "Helped process emotions", "Connected to resources", "Offered perspective"}'::text[], 'local', 'narrative', true, true
union all
select 'created_curriculum', 'Created curriculum or educational resource', (select category_id from ontology_activity_categories where category_key = 'curriculum'), 'Made an educational handout, guide, lecture, checklist, or teaching tool', '{"Created teaching script", "Built lecture slides", "Made checklist", "Designed module"}'::text[], 'team', 'artifact', true, true
union all
select 'led_meeting', 'Led meeting or workgroup', (select category_id from ontology_activity_categories where category_key = 'leadership'), 'Organized people around a decision, project, or improvement; facilitated discussion', '{"Faculty meeting", "QI workgroup", "Committee meeting", "Team huddle"}'::text[], 'team', 'narrative', true, true
union all
select 'improved_workflow', 'Improved workflow or process', (select category_id from ontology_activity_categories where category_key = 'systems_improvement'), 'Identified a broken process and changed or improved it', '{"Streamlined handoff", "Reduced bottleneck", "Changed documentation flow", "Improved scheduling"}'::text[], 'team', 'narrative', true, true
union all
select 'coordinated_complex_care', 'Coordinated complex care or services', (select category_id from ontology_activity_categories where category_key = 'coordination'), 'Aligned multiple people, services, or stakeholders around patient or program needs', '{"Family meeting coordination", "Interdepartmental alignment", "Care team alignment", "Service coordination"}'::text[], 'team', 'narrative', true, true
union all
select 'gave_informal_teaching', 'Gave informal teaching', (select category_id from ontology_activity_categories where category_key = 'teaching'), 'Taught a clinical concept during rounds, supervision, or patient care', '{"Clinical teaching", "Bedside teaching", "Case-based teaching", "Opportunistic teaching"}'::text[], 'local', 'narrative', true, true
union all
select 'recognized_burnout', 'Recognized and supported burnout', (select category_id from ontology_activity_categories where category_key = 'wellbeing'), 'Noticed a colleague or learner struggling with burnout and took supportive action', '{"Offered resources", "Checked in", "Listened without judgment", "Advocated for support"}'::text[], 'local', 'narrative', true, true
union all
select 'presented_scholarship', 'Presented scholarship or QI work', (select category_id from ontology_activity_categories where category_key = 'scholarship'), 'Shared academic, educational, or quality improvement work through poster, talk, or abstract', '{"Conference presentation", "Poster presentation", "Local teaching", "Journal publication"}'::text[], 'program', 'artifact', true, true
union all
select 'received_feedback', 'Received and acted on feedback', (select category_id from ontology_activity_categories where category_key = 'feedback'), 'Used feedback from others to change behavior or improve performance', '{"Incorporated supervisor feedback", "Changed approach based on input", "Reflected and grew", "Acknowledged and corrected"}'::text[], 'local', 'narrative', true, true
union all
select 'handled_conflict', 'Managed difficult conversation or conflict', (select category_id from ontology_activity_categories where category_key = 'leadership'), 'Addressed interpersonal or workflow conflict; helped resolve tension between people or teams', '{"Mediated disagreement", "Addressed conduct issue", "Resolved team tension", "Gave difficult feedback"}'::text[], 'team', 'narrative', true, true
union all
select 'built_tool', 'Built tool, dashboard, or structured data system', (select category_id from ontology_activity_categories where category_key = 'informatics'), 'Created a dashboard, spreadsheet, or data system to track or improve something', '{"Built evaluation tracker", "Created dashboard", "Structured data collection", "Automated reporting"}'::text[], 'team', 'artifact', true, true
union all
select 'advocated_for_change', 'Advocated for learner, patient, or system change', (select category_id from ontology_activity_categories where category_key = 'advocacy'), 'Spoke up to address unfairness, bias, or barriers; advocated for change', '{"Addressed bias", "Advocated for resource", "Pushed back on policy", "Spoke up for learner"}'::text[], 'program', 'narrative', true, true
on conflict (activity_key) do nothing;

-- ============================================================================
-- TABLE 10: ontology_activity_mappings
-- ============================================================================
-- The translation engine: activity → competency → track → level → output

create table if not exists ontology_activity_mappings (
  mapping_id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references ontology_invisible_work_activities(activity_id),
  subcompetency_id uuid not null references ontology_subcompetencies(subcompetency_id),
  track_id uuid not null references ontology_career_tracks(track_id),
  default_level_id uuid references ontology_development_levels(level_id),
  confidence_default numeric(3,2) default 0.75, -- 0.00-1.00 confidence in this mapping
  weight numeric(3,2) default 1.0, -- relative strength of this mapping
  active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique (activity_id, subcompetency_id, track_id)
);

comment on table ontology_activity_mappings is 'Translation engine: maps activity → subcompetency → track → level with confidence scores';
create index if not exists idx_mappings_activity on ontology_activity_mappings(activity_id);
create index if not exists idx_mappings_subcompetency on ontology_activity_mappings(subcompetency_id);
create index if not exists idx_mappings_track on ontology_activity_mappings(track_id);

-- Seed mappings: each activity connects to multiple competencies/tracks
-- Example: "mentored trainee" → learner_prof_dev + clinician_educator @ level 3
insert into ontology_activity_mappings (activity_id, subcompetency_id, track_id, default_level_id, confidence_default, weight, active)
select 
  (select activity_id from ontology_invisible_work_activities where activity_key = 'mentored_trainee'),
  (select subcompetency_id from ontology_subcompetencies where subcompetency_key = 'learner_prof_dev'),
  (select track_id from ontology_career_tracks where track_key = 'clinician_educator'),
  (select level_id from ontology_development_levels where numeric_value = 3),
  0.95, 1.0, true
union all
select 
  (select activity_id from ontology_invisible_work_activities where activity_key = 'gave_feedback'),
  (select subcompetency_id from ontology_subcompetencies where subcompetency_key = 'feedback'),
  (select track_id from ontology_career_tracks where track_key = 'clinician_educator'),
  (select level_id from ontology_development_levels where numeric_value = 3),
  0.92, 1.0, true
union all
select 
  (select activity_id from ontology_invisible_work_activities where activity_key = 'supported_distressed_learner'),
  (select subcompetency_id from ontology_subcompetencies where subcompetency_key = 'learner_colleague_wellbeing'),
  (select track_id from ontology_career_tracks where track_key = 'program_leader'),
  (select level_id from ontology_development_levels where numeric_value = 3),
  0.88, 1.0, true
union all
select 
  (select activity_id from ontology_invisible_work_activities where activity_key = 'improved_workflow'),
  (select subcompetency_id from ontology_subcompetencies where subcompetency_key = 'program_eval'),
  (select track_id from ontology_career_tracks where track_key = 'systems_leader'),
  (select level_id from ontology_development_levels where numeric_value = 3),
  0.80, 1.0, true
union all
select 
  (select activity_id from ontology_invisible_work_activities where activity_key = 'created_curriculum'),
  (select subcompetency_id from ontology_subcompetencies where subcompetency_key = 'curriculum'),
  (select track_id from ontology_career_tracks where track_key = 'clinician_educator'),
  (select level_id from ontology_development_levels where numeric_value = 3),
  0.90, 1.0, true
union all
select 
  (select activity_id from ontology_invisible_work_activities where activity_key = 'led_meeting'),
  (select subcompetency_id from ontology_subcompetencies where subcompetency_key = 'leadership_skills'),
  (select track_id from ontology_career_tracks where track_key = 'program_leader'),
  (select level_id from ontology_development_levels where numeric_value = 3),
  0.85, 1.0, true
union all
select 
  (select activity_id from ontology_invisible_work_activities where activity_key = 'presented_scholarship'),
  (select subcompetency_id from ontology_subcompetencies where subcompetency_key = 'med_ed_scholarship'),
  (select track_id from ontology_career_tracks where track_key = 'researcher'),
  (select level_id from ontology_development_levels where numeric_value = 3),
  0.88, 1.0, true
union all
select 
  (select activity_id from ontology_invisible_work_activities where activity_key = 'handled_conflict'),
  (select subcompetency_id from ontology_subcompetencies where subcompetency_key = 'leadership_skills'),
  (select track_id from ontology_career_tracks where track_key = 'program_leader'),
  (select level_id from ontology_development_levels where numeric_value = 2),
  0.82, 1.0, true
union all
select 
  (select activity_id from ontology_invisible_work_activities where activity_key = 'built_tool'),
  (select subcompetency_id from ontology_subcompetencies where subcompetency_key = 'admin_skills'),
  (select track_id from ontology_career_tracks where track_key = 'innovator'),
  (select level_id from ontology_development_levels where numeric_value = 3),
  0.85, 1.0, true
on conflict (activity_id, subcompetency_id, track_id) do nothing;

-- ============================================================================
-- TABLE 11: ontology_output_templates
-- ============================================================================
-- Translates activity → CV bullet / promotion language / annual review

create table if not exists ontology_output_templates (
  template_id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references ontology_invisible_work_activities(activity_id),
  output_type text not null, -- 'cv_bullet', 'annual_review', 'promotion_packet', 'teaching_portfolio', 'fellowship_narrative'
  template_text text not null, -- The actual language template (may contain {placeholders})
  confidence_default numeric(3,2) default 0.75,
  active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique (activity_id, output_type)
);

comment on table ontology_output_templates is 'Templates that translate activities into CV, promotion, and annual review language';
create index if not exists idx_templates_activity on ontology_output_templates(activity_id);
create index if not exists idx_templates_output_type on ontology_output_templates(output_type);

-- Seed output templates
insert into ontology_output_templates (activity_id, output_type, template_text, confidence_default, active)
select 
  (select activity_id from ontology_invisible_work_activities where activity_key = 'mentored_trainee'),
  'cv_bullet',
  'Mentored trainees in career development, professional identity formation, and clinical growth through individualized coaching and longitudinal support.',
  0.85, true
union all
select 
  (select activity_id from ontology_invisible_work_activities where activity_key = 'mentored_trainee'),
  'annual_review',
  'Demonstrated commitment to learner development and professional identity formation through longitudinal mentoring and personalized guidance.',
  0.82, true
union all
select 
  (select activity_id from ontology_invisible_work_activities where activity_key = 'gave_feedback'),
  'cv_bullet',
  'Provided effective formative and summative feedback to learners to support ongoing professional development and performance improvement.',
  0.88, true
union all
select 
  (select activity_id from ontology_invisible_work_activities where activity_key = 'created_curriculum'),
  'cv_bullet',
  'Designed and implemented educational resources and curriculum materials to support learner development and clinical education.',
  0.86, true
union all
select 
  (select activity_id from ontology_invisible_work_activities where activity_key = 'created_curriculum'),
  'teaching_portfolio',
  'Curriculum development: Created {artifact_type} to teach {topic}, reaching {audience_size} learners and receiving positive feedback on {metric}.',
  0.80, true
union all
select 
  (select activity_id from ontology_invisible_work_activities where activity_key = 'improved_workflow'),
  'annual_review',
  'Identified process improvement opportunities and led implementation of changes that enhanced efficiency, safety, or educational value.',
  0.80, true
union all
select 
  (select activity_id from ontology_invisible_work_activities where activity_key = 'led_meeting'),
  'cv_bullet',
  'Led workgroups, committees, and meetings to advance educational initiatives, quality improvement, and program development.',
  0.83, true
union all
select 
  (select activity_id from ontology_invisible_work_activities where activity_key = 'presented_scholarship'),
  'cv_bullet',
  'Disseminated scholarly work through {format}: {title}, presented at {venue} to advance {field} knowledge.',
  0.82, true
on conflict (activity_id, output_type) do nothing;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================
-- All ontology tables are reference/read-only, so public read access

alter table ontology_sources enable row level security;
create policy "ontology_sources_public_read" on ontology_sources for select using (true);

alter table ontology_specialties enable row level security;
create policy "ontology_specialties_public_read" on ontology_specialties for select using (true);

alter table ontology_subspecialties enable row level security;
create policy "ontology_subspecialties_public_read" on ontology_subspecialties for select using (true);

alter table ontology_competency_domains enable row level security;
create policy "ontology_competency_domains_public_read" on ontology_competency_domains for select using (true);

alter table ontology_subcompetencies enable row level security;
create policy "ontology_subcompetencies_public_read" on ontology_subcompetencies for select using (true);

alter table ontology_development_levels enable row level security;
create policy "ontology_development_levels_public_read" on ontology_development_levels for select using (true);

alter table ontology_career_tracks enable row level security;
create policy "ontology_career_tracks_public_read" on ontology_career_tracks for select using (true);

alter table ontology_activity_categories enable row level security;
create policy "ontology_activity_categories_public_read" on ontology_activity_categories for select using (true);

alter table ontology_invisible_work_activities enable row level security;
create policy "ontology_invisible_work_activities_public_read" on ontology_invisible_work_activities for select using (true);

alter table ontology_activity_mappings enable row level security;
create policy "ontology_activity_mappings_public_read" on ontology_activity_mappings for select using (true);

alter table ontology_output_templates enable row level security;
create policy "ontology_output_templates_public_read" on ontology_output_templates for select using (true);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
-- Already created above, but summarizing here for reference

-- Already indexed:
-- - ontology_specialties(specialty_key)
-- - ontology_subspecialties(specialty_id, subspecialty_key)
-- - ontology_competency_domains(domain_key, framework)
-- - ontology_subcompetencies(domain_id, subcompetency_key)
-- - ontology_development_levels(numeric_value)
-- - ontology_career_tracks(track_key)
-- - ontology_activity_categories(category_key)
-- - ontology_invisible_work_activities(activity_key, category_id)
-- - ontology_activity_mappings(activity_id, subcompetency_id, track_id, unique constraint)
-- - ontology_output_templates(activity_id, output_type)

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================


-- ========================================================================
-- FILE: docs/migrations/20260523_signal_detection.sql
-- ========================================================================

-- FISCMAK Signal Detection Layer
-- Created: 2026-05-23
-- Purpose: Define patterns, keywords, and signals that Coach Mak listens for in user conversations
-- This layer enables intelligent routing, pattern recognition, and context-aware follow-up questions

-- ============================================================================
-- TABLE 1: signal_detection_sources
-- ============================================================================
-- Tracks where signal definitions came from

create table if not exists signal_detection_sources (
  source_id uuid primary key default gen_random_uuid(),
  source_name text not null unique,
  source_type text, -- 'FISCMAK Proprietary', 'Clinician Educator Milestones', 'Burnout Research', 'Career Development'
  description text,
  active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

comment on table signal_detection_sources is 'Where signal definitions originated';

insert into signal_detection_sources (source_name, source_type, description, active) values
  ('FISCMAK Signal Research', 'FISCMAK Proprietary', 'Signals derived from physician narrative analysis and coaching experience', true),
  ('Clinician Educator Milestones', 'Clinician Educator Milestones', 'Signals extracted from CE milestone descriptors and behaviors', true),
  ('Well-Being Literature', 'Burnout Research', 'Signals from well-being, burnout, and resilience research', true),
  ('Career Development Theory', 'Career Development', 'Signals from career trajectory and identity formation theory', true)
on conflict (source_name) do nothing;

-- ============================================================================
-- TABLE 2: signal_categories
-- ============================================================================
-- Broad signal families that Mak listens for

create table if not exists signal_categories (
  category_id uuid primary key default gen_random_uuid(),
  category_key text not null unique,
  name text not null,
  description text,
  order_priority integer default 100, -- Mak checks higher priority first
  active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

comment on table signal_categories is 'Broad signal families (leadership, mentorship, systems-thinking, etc.)';
create index if not exists idx_signal_categories_key on signal_categories(category_key);
create index if not exists idx_signal_categories_priority on signal_categories(order_priority);

insert into signal_categories (category_key, name, description, order_priority, active) values
  ('mentorship', 'Mentorship & Sponsorship', 'Patterns of coaching, guiding, and sponsoring others', 10, true),
  ('leadership', 'Leadership & Influence', 'Patterns of leading teams, making decisions, influencing outcomes', 20, true),
  ('systems_thinking', 'Systems Thinking & Improvement', 'Patterns of identifying problems, proposing changes, improving processes', 30, true),
  ('advocacy', 'Advocacy & Speaking Up', 'Patterns of advocating for people, resources, or change', 40, true),
  ('emotional_labor', 'Emotional Labor & Support', 'Patterns of emotional work, supporting others, holding space for struggle', 50, true),
  ('teaching', 'Teaching & Facilitation', 'Patterns of formal and informal teaching, learning design', 60, true),
  ('feedback', 'Feedback & Reflection', 'Patterns of giving/receiving feedback, reflecting on experience', 70, true),
  ('scholarship', 'Scholarship & Dissemination', 'Patterns of research, presenting, publishing, creating knowledge', 80, true),
  ('innovation', 'Innovation & Technology', 'Patterns of building tools, improving workflows with technology', 90, true),
  ('wellbeing', 'Well-Being Awareness', 'Patterns indicating burnout, resilience, or well-being attention', 100, true),
  ('role_clarity', 'Role & Identity Clarity', 'Patterns indicating clarity or confusion about professional role/identity', 110, true),
  ('skill_domain_gap', 'Skill Domain Gap', 'Patterns indicating skill gaps or development needs', 120, true)
on conflict (category_key) do nothing;

-- ============================================================================
-- TABLE 3: signal_indicators
-- ============================================================================
-- The actual signals: keywords, phrases, patterns Mak listens for

create table if not exists signal_indicators (
  indicator_id uuid primary key default gen_random_uuid(),
  category_id uuid not null references signal_categories(category_id),
  indicator_key text not null unique,
  indicator_name text not null,
  indicator_type text default 'keyword', -- 'keyword', 'phrase', 'pattern', 'question_trigger', 'behavioral'
  keywords text[], -- exact words/phrases to match
  regex_pattern text, -- optional regex for complex matches
  description text, -- what this signal means
  confidence_default numeric(3,2) default 0.70, -- base confidence 0.0-1.0
  source_id uuid references signal_detection_sources(source_id),
  related_activities text[], -- activity_keys this signal maps to
  related_competencies text[], -- competency_keys this signals
  followup_question text, -- coaching question to ask when detected
  active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

comment on table signal_indicators is 'Individual signals: keywords, phrases, and patterns Mak listens for';
create index if not exists idx_indicators_category on signal_indicators(category_id);
create index if not exists idx_indicators_key on signal_indicators(indicator_key);
create index if not exists idx_indicators_type on signal_indicators(indicator_type);

-- ============================================================================
-- SIGNAL DATA: MENTORSHIP SIGNALS
-- ============================================================================

insert into signal_indicators (
  category_id, indicator_key, indicator_name, indicator_type, keywords, description, 
  confidence_default, source_id, related_activities, related_competencies, followup_question, active
)
select 
  (select category_id from signal_categories where category_key = 'mentorship'),
  'mentorship_coaching_conversation',
  'Coaching junior on career/identity',
  'keyword',
  '{mentored, mentoring, coached, coaching, career conversation, career planning, next steps, trajectory}'::text[],
  'User is guiding someone through career thinking, identity formation, or professional development',
  0.85,
  (select source_id from signal_detection_sources where source_name = 'FISCMAK Signal Research'),
  '{mentored_trainee, learner_prof_dev}'::text[],
  '{mentorship, learner_prof_dev, identity}'::text[],
  'Was this a one-time conversation or part of an ongoing mentoring relationship?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'mentorship'),
  'mentorship_helping_junior',
  'Helping junior navigate a challenge',
  'keyword',
  '{helped junior, supported junior, guided trainee, junior colleague, helping resident, helping fellow}'::text[],
  'User is providing support and guidance to a less experienced colleague',
  0.80,
  (select source_id from signal_detection_sources where source_name = 'FISCMAK Signal Research'),
  '{mentored_trainee, supported_distressed_learner}'::text[],
  '{mentorship, learner_prof_dev}'::text[],
  'What specifically did you help them understand or navigate?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'mentorship'),
  'mentorship_sponsoring',
  'Advocating for someone''s advancement',
  'keyword',
  '{sponsored, advocating for, put their name forward, recommended for, championed, supported their application}'::text[],
  'User is actively supporting someone''s career advancement or opportunity',
  0.82,
  (select source_id from signal_detection_sources where source_name = 'Clinician Educator Milestones'),
  '{mentored_trainee, advocated_for_change}'::text[],
  '{mentorship, advocacy, leadership}'::text[],
  'What made you want to advocate for this person?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'mentorship'),
  'mentorship_professional_development',
  'Supporting professional identity formation',
  'phrase',
  '{professional identity, who they want to be, finding their voice, defining themselves, becoming a clinician educator, becoming a leader, role identity}'::text[],
  'User is helping someone develop or clarify professional identity',
  0.78,
  (select source_id from signal_detection_sources where source_name = 'Clinician Educator Milestones'),
  '{mentored_trainee, learner_prof_dev}'::text[],
  '{mentorship, identity, leadership}'::text[],
  'How is their professional identity formation going?',
  true
on conflict (indicator_key) do nothing;

-- ============================================================================
-- SIGNAL DATA: LEADERSHIP SIGNALS
-- ============================================================================

insert into signal_indicators (
  category_id, indicator_key, indicator_name, indicator_type, keywords, description, 
  confidence_default, source_id, related_activities, related_competencies, followup_question, active
)
select 
  (select category_id from signal_categories where category_key = 'leadership'),
  'leadership_leading_meeting',
  'Led meeting or workgroup',
  'keyword',
  '{led meeting, ran meeting, facilitated meeting, led workgroup, led team, chaired, ran session, hosted discussion}'::text[],
  'User organized and directed a meeting or group discussion',
  0.88,
  (select source_id from signal_detection_sources where source_name = 'FISCMAK Signal Research'),
  '{led_meeting}'::text[],
  '{leadership_skills, program_eval}'::text[],
  'What was the outcome or decision from that meeting?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'leadership'),
  'leadership_managing_conflict',
  'Addressed interpersonal or team conflict',
  'keyword',
  '{conflict, difficult conversation, addressed tension, mediated, resolved disagreement, helped them work it out, tension between}'::text[],
  'User navigated interpersonal conflict or helped others resolve it',
  0.82,
  (select source_id from signal_detection_sources where source_name = 'FISCMAK Signal Research'),
  '{handled_conflict}'::text[],
  '{leadership_skills, ics}'::text[],
  'How did you approach the conflict? What did you learn?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'leadership'),
  'leadership_influencing_decision',
  'Influenced an important decision',
  'keyword',
  '{influenced, swayed, persuaded, pushed for, advocated for decision, made the case for, convinced leadership, decision was made}'::text[],
  'User shaped a significant decision or outcome through influence',
  0.80,
  (select source_id from signal_detection_sources where source_name = 'FISCMAK Signal Research'),
  '{led_meeting}'::text[],
  '{leadership_skills, sbp}'::text[],
  'What was the decision and how did your influence matter?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'leadership'),
  'leadership_managing_team',
  'Managing or overseeing a team',
  'keyword',
  '{managing team, supervise, oversee, directing people, team lead, program manager, department chair, director of}'::text[],
  'User is in a formal or informal leadership role managing others',
  0.85,
  (select source_id from signal_detection_sources where source_name = 'FISCMAK Signal Research'),
  '{led_meeting}'::text[],
  '{leadership_skills, admin_skills}'::text[],
  'What''s the size of your team and what''s been most challenging?',
  true
on conflict (indicator_key) do nothing;

-- ============================================================================
-- SIGNAL DATA: SYSTEMS THINKING SIGNALS
-- ============================================================================

insert into signal_indicators (
  category_id, indicator_key, indicator_name, indicator_type, keywords, description, 
  confidence_default, source_id, related_activities, related_competencies, followup_question, active
)
select 
  (select category_id from signal_categories where category_key = 'systems_thinking'),
  'systems_identified_inefficiency',
  'Identified a broken process',
  'keyword',
  '{inefficient, broken, bottleneck, waste, unnecessary step, takes too long, frustration with process, problem with workflow}'::text[],
  'User recognized a process or system inefficiency',
  0.78,
  (select source_id from signal_detection_sources where source_name = 'FISCMAK Signal Research'),
  '{improved_workflow}'::text[],
  '{sbp, program_eval}'::text[],
  'Did you propose a fix or change? What would improve it?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'systems_thinking'),
  'systems_proposed_change',
  'Proposed or implemented a process change',
  'keyword',
  '{proposed, changed, implemented, improved, streamlined, reduced, eliminated, fixed, restructured, automated}'::text[],
  'User suggested or enacted a process improvement',
  0.85,
  (select source_id from signal_detection_sources where source_name = 'FISCMAK Signal Research'),
  '{improved_workflow, coordinated_complex_care}'::text[],
  '{sbp, program_eval, leadership_skills}'::text[],
  'What was the impact of that change? How did people respond?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'systems_thinking'),
  'systems_connecting_pieces',
  'Aligning or coordinating across silos',
  'keyword',
  '{aligned, coordinated, brought together, connected, cross-departmental, interdepartmental, bridging, liaison, communication between}'::text[],
  'User worked to connect or integrate separate parts of a system',
  0.80,
  (select source_id from signal_detection_sources where source_name = 'FISCMAK Signal Research'),
  '{coordinated_complex_care, led_meeting}'::text[],
  '{sbp, ics, leadership_skills}'::text[],
  'What barriers did you have to overcome to coordinate that?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'systems_thinking'),
  'systems_reducing_friction',
  'Reduced handoff friction or communication gaps',
  'keyword',
  '{handoff, handoff improved, communication gap, better coordination, smoother process, reduced errors, fewer miscommunications}'::text[],
  'User improved transitions or communication between steps in a process',
  0.76,
  (select source_id from signal_detection_sources where source_name = 'FISCMAK Signal Research'),
  '{improved_workflow, coordinated_complex_care}'::text[],
  '{sbp, ics}'::text[],
  'How did the handoff improvement happen? What made it work?',
  true
on conflict (indicator_key) do nothing;

-- ============================================================================
-- SIGNAL DATA: ADVOCACY SIGNALS
-- ============================================================================

insert into signal_indicators (
  category_id, indicator_key, indicator_name, indicator_type, keywords, description, 
  confidence_default, source_id, related_activities, related_competencies, followup_question, active
)
select 
  (select category_id from signal_categories where category_key = 'advocacy'),
  'advocacy_speaking_up',
  'Spoke up about an unfair or wrong situation',
  'keyword',
  '{spoke up, spoke out, said something, pushed back, raised concern, didn''t stay quiet, called out, addressed}'::text[],
  'User took a stand or voiced a concern about something wrong',
  0.82,
  (select source_id from signal_detection_sources where source_name = 'FISCMAK Signal Research'),
  '{advocated_for_change}'::text[],
  '{advocacy, prof}'::text[],
  'What made you feel like you had to speak up?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'advocacy'),
  'advocacy_addressing_bias',
  'Addressed bias, inequity, or discrimination',
  'keyword',
  '{bias, discrimination, inequity, unfair, stereotyping, spoke against bias, diversity, inclusion, addressed bias}'::text[],
  'User actively worked against bias or unfair treatment',
  0.85,
  (select source_id from signal_detection_sources where source_name = 'FISCMAK Signal Research'),
  '{advocated_for_change}'::text[],
  '{advocacy, prof, ics}'::text[],
  'What was the situation and what did you do?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'advocacy'),
  'advocacy_fighting_for_resources',
  'Advocated for resources, support, or policy change',
  'keyword',
  '{fought for, advocated for, asked for, requested, proposed policy change, asked administration, needed more, needed support}'::text[],
  'User pushed for institutional resources or changes in support of people or mission',
  0.78,
  (select source_id from signal_detection_sources where source_name = 'FISCMAK Signal Research'),
  '{advocated_for_change, led_meeting}'::text[],
  '{advocacy, sbp, leadership_skills}'::text[],
  'What did you ask for and did you get it?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'advocacy'),
  'advocacy_protecting_someone',
  'Advocated for or protected a person',
  'keyword',
  '{stood up for, protected, defended, advocated for them, their corner, fought for them, had their back, protected from}'::text[],
  'User actively advocated for or protected an individual',
  0.80,
  (select source_id from signal_detection_sources where source_name = 'FISCMAK Signal Research'),
  '{advocated_for_change}'::text[],
  '{advocacy, mentorship, prof}'::text[],
  'What were the stakes? Why was it important to advocate for them?',
  true
on conflict (indicator_key) do nothing;

-- ============================================================================
-- SIGNAL DATA: EMOTIONAL LABOR SIGNALS
-- ============================================================================

insert into signal_indicators (
  category_id, indicator_key, indicator_name, indicator_type, keywords, description, 
  confidence_default, source_id, related_activities, related_competencies, followup_question, active
)
select 
  (select category_id from signal_categories where category_key = 'emotional_labor'),
  'emotional_labor_supporting_distress',
  'Supported colleague through distress or struggle',
  'keyword',
  '{struggling, distressed, overwhelmed, having a hard time, difficult time, took time to listen, sat with, held space}'::text[],
  'User provided emotional support to someone in distress',
  0.85,
  (select source_id from signal_detection_sources where source_name = 'FISCMAK Signal Research'),
  '{supported_distressed_learner, recognized_burnout}'::text[],
  '{learner_colleague_wellbeing, ics}'::text[],
  'What did supporting them look like? How are they doing now?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'emotional_labor'),
  'emotional_labor_recognizing_burnout',
  'Recognized burnout or well-being concern in self or others',
  'keyword',
  '{burnout, burned out, exhausted, not themselves, struggling with balance, work-life, tired, stressed, overwhelmed, unsustainable}'::text[],
  'User recognized signs of burnout or well-being crisis',
  0.82,
  (select source_id from signal_detection_sources where source_name = 'Well-Being Literature'),
  '{recognized_burnout}'::text[],
  '{learner_colleague_wellbeing, personal_wellbeing, wellbeing}'::text[],
  'What made you notice the burnout? What helped or could help?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'emotional_labor'),
  'emotional_labor_processing_emotion',
  'Helped someone process difficult emotions or experience',
  'keyword',
  '{helped them process, talked through, worked through emotion, grieving, anger, guilt, fear, talked about how they felt}'::text[],
  'User provided space and support for emotional processing',
  0.78,
  (select source_id from signal_detection_sources where source_name = 'Well-Being Literature'),
  '{supported_distressed_learner}'::text[],
  '{learner_colleague_wellbeing, ics}'::text[],
  'What was the emotion or experience they were processing?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'emotional_labor'),
  'emotional_labor_connecting_resources',
  'Connected someone to support or resources',
  'keyword',
  '{referred to, connected to, resources, counseling, EAP, therapy, support group, chaplain, mentor, crisis line}'::text[],
  'User helped someone access formal or informal support',
  0.80,
  (select source_id from signal_detection_sources where source_name = 'Well-Being Literature'),
  '{recognized_burnout, supported_distressed_learner}'::text[],
  '{learner_colleague_wellbeing, sbp}'::text[],
  'Were they able to access the resource? Did it help?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'emotional_labor'),
  'emotional_labor_boundary_holding',
  'Maintained professional boundaries while supporting',
  'keyword',
  '{boundaries, appropriate distance, professional relationship, knew when to refer, didn''t become a therapist, recognized limits}'::text[],
  'User showed awareness of appropriate boundaries in support',
  0.72,
  (select source_id from signal_detection_sources where source_name = 'Well-Being Literature'),
  '{supported_distressed_learner}'::text[],
  '{prof, learner_colleague_wellbeing}'::text[],
  'How do you navigate the balance between support and boundaries?',
  true
on conflict (indicator_key) do nothing;

-- ============================================================================
-- SIGNAL DATA: TEACHING SIGNALS
-- ============================================================================

insert into signal_indicators (
  category_id, indicator_key, indicator_name, indicator_type, keywords, description, 
  confidence_default, source_id, related_activities, related_competencies, followup_question, active
)
select 
  (select category_id from signal_categories where category_key = 'teaching'),
  'teaching_informal_teaching',
  'Taught during rounds, supervision, or clinical care',
  'keyword',
  '{taught, teaching, rounds, bedside teaching, supervision, clinical teaching, explained, demonstrated}'::text[],
  'User engaged in opportunistic clinical teaching',
  0.83,
  (select source_id from signal_detection_sources where source_name = 'Clinician Educator Milestones'),
  '{gave_informal_teaching}'::text[],
  '{teaching_learning, pc}'::text[],
  'What clinical topic did you teach? How did the learner respond?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'teaching'),
  'teaching_creating_resource',
  'Created curriculum, slides, handout, or teaching tool',
  'keyword',
  '{created slides, made handout, wrote guide, built curriculum, designed module, lecture, video, teaching tool, checklist}'::text[],
  'User developed educational content or materials',
  0.88,
  (select source_id from signal_detection_sources where source_name = 'Clinician Educator Milestones'),
  '{created_curriculum, created_resource}'::text[],
  '{curriculum, teaching_learning}'::text[],
  'Who used this resource and was it effective?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'teaching'),
  'teaching_facilitating_learning',
  'Facilitated a learning discussion or case conference',
  'keyword',
  '{facilitated, led discussion, case conference, journal club, M&M, seminar, learning activity, discussion session}'::text[],
  'User designed and led a structured learning experience',
  0.84,
  (select source_id from signal_detection_sources where source_name = 'Clinician Educator Milestones'),
  '{led_meeting, gave_informal_teaching}'::text[],
  '{teaching_learning, learning_environment}'::text[],
  'How did learners engage with that learning activity?',
  true
on conflict (indicator_key) do nothing;

-- ============================================================================
-- SIGNAL DATA: FEEDBACK SIGNALS
-- ============================================================================

insert into signal_indicators (
  category_id, indicator_key, indicator_name, indicator_type, keywords, description, 
  confidence_default, source_id, related_activities, related_competencies, followup_question, active
)
select 
  (select category_id from signal_categories where category_key = 'feedback'),
  'feedback_giving_feedback',
  'Gave formative or corrective feedback',
  'keyword',
  '{gave feedback, provided feedback, told them, corrected, reinforced strength, constructive feedback, formative feedback}'::text[],
  'User delivered performance or learning feedback',
  0.87,
  (select source_id from signal_detection_sources where source_name = 'Clinician Educator Milestones'),
  '{gave_feedback}'::text[],
  '{feedback, teaching_learning}'::text[],
  'How did they receive the feedback? Did they change?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'feedback'),
  'feedback_receiving_feedback',
  'Received and acted on feedback',
  'keyword',
  '{got feedback, was told, learned that, changed because of feedback, took that feedback seriously, incorporated, adjusted}'::text[],
  'User demonstrated openness to and integration of feedback',
  0.82,
  (select source_id from signal_detection_sources where source_name = 'Clinician Educator Milestones'),
  '{received_feedback}'::text[],
  '{reflective_practice, feedback}'::text[],
  'What feedback did you get and how did it change your practice?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'feedback'),
  'feedback_reflection',
  'Reflected on experience or practice',
  'keyword',
  '{reflected, learned from, realized, thinking back, hindsight, what I''d do differently, could have done better}'::text[],
  'User engaged in reflective practice or learning from experience',
  0.80,
  (select source_id from signal_detection_sources where source_name = 'Clinician Educator Milestones'),
  '{received_feedback}'::text[],
  '{reflective_practice}'::text[],
  'What was the biggest lesson from that reflection?',
  true
on conflict (indicator_key) do nothing;

-- ============================================================================
-- SIGNAL DATA: SCHOLARSHIP SIGNALS
-- ============================================================================

insert into signal_indicators (
  category_id, indicator_key, indicator_name, indicator_type, keywords, description, 
  confidence_default, source_id, related_activities, related_competencies, followup_question, active
)
select 
  (select category_id from signal_categories where category_key = 'scholarship'),
  'scholarship_presenting',
  'Presented work at conference or forum',
  'keyword',
  '{presented, poster, talk, conference, presented at, abstract, grand rounds, seminar presentation, scholarly presentation}'::text[],
  'User disseminated work through presentation',
  0.88,
  (select source_id from signal_detection_sources where source_name = 'Clinician Educator Milestones'),
  '{presented_scholarship}'::text[],
  '{med_ed_scholarship, scholarship}'::text[],
  'What was the response? What next for this work?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'scholarship'),
  'scholarship_published',
  'Published or submitted for publication',
  'keyword',
  '{published, journal, paper, manuscript, submitted, accepted, in press, wrote article}'::text[],
  'User published or is publishing scholarly work',
  0.90,
  (select source_id from signal_detection_sources where source_name = 'Clinician Educator Milestones'),
  '{presented_scholarship}'::text[],
  '{med_ed_scholarship, scholarship}'::text[],
  'What is the paper/publication about? What''s the impact?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'scholarship'),
  'scholarship_research_project',
  'Conducted or leading research or QI project',
  'keyword',
  '{research, QI project, quality improvement, IRB, data collection, literature review, project, grant, funded}'::text[],
  'User is engaged in research or systematic improvement work',
  0.85,
  (select source_id from signal_detection_sources where source_name = 'Clinician Educator Milestones'),
  '{presented_scholarship}'::text[],
  '{med_ed_scholarship, scholarship, pbli}'::text[],
  'What''s the research question or improvement goal?',
  true
on conflict (indicator_key) do nothing;

-- ============================================================================
-- SIGNAL DATA: INNOVATION SIGNALS
-- ============================================================================

insert into signal_indicators (
  category_id, indicator_key, indicator_name, indicator_type, keywords, description, 
  confidence_default, source_id, related_activities, related_competencies, followup_question, active
)
select 
  (select category_id from signal_categories where category_key = 'innovation'),
  'innovation_building_tool',
  'Built dashboard, spreadsheet, or data system',
  'keyword',
  '{built dashboard, created spreadsheet, automated, database, tool, system, data tracker, software, app, built system}'::text[],
  'User created technology or data infrastructure',
  0.86,
  (select source_id from signal_detection_sources where source_name = 'FISCMAK Signal Research'),
  '{built_tool}'::text[],
  '{innovation, sbp, admin_skills}'::text[],
  'What problem did that tool solve? Who uses it?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'innovation'),
  'innovation_improving_technology',
  'Improved EHR workflow or clinical informatics',
  'keyword',
  '{EHR, electronic health record, workflow improved, informatics, structured data, alert, documentation, template}'::text[],
  'User worked with technology to improve clinical or administrative work',
  0.80,
  (select source_id from signal_detection_sources where source_name = 'FISCMAK Signal Research'),
  '{built_tool, improved_workflow}'::text[],
  '{innovation, sbp}'::text[],
  'How did EHR improvement help? What''s the impact?',
  true
on conflict (indicator_key) do nothing;

-- ============================================================================
-- SIGNAL DATA: WELL-BEING SIGNALS
-- ============================================================================

insert into signal_indicators (
  category_id, indicator_key, indicator_name, indicator_type, keywords, description, 
  confidence_default, source_id, related_activities, related_competencies, followup_question, active
)
select 
  (select category_id from signal_categories where category_key = 'wellbeing'),
  'wellbeing_energy_decline',
  'Expressing declining energy or motivation',
  'keyword',
  '{tired, exhausted, not sure why I''m doing this, losing passion, energy down, not excited, dragging, burnt out}'::text[],
  'User is expressing signs of energy depletion or burnout',
  0.76,
  (select source_id from signal_detection_sources where source_name = 'Well-Being Literature'),
  '{recognized_burnout}'::text[],
  '{personal_wellbeing, wellbeing}'::text[],
  'What''s been draining your energy most lately?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'wellbeing'),
  'wellbeing_finding_meaning',
  'Finding meaning, fulfillment, or purpose in work',
  'keyword',
  '{fulfilling, meaningful work, purpose, makes sense, why I do this, energizes me, excited about, gives me energy}'::text[],
  'User is experiencing meaning or satisfaction in their work',
  0.82,
  (select source_id from signal_detection_sources where source_name = 'Well-Being Literature'),
  '{mentored_trainee, gave_informal_teaching}'::text[],
  '{identity, personal_wellbeing}'::text[],
  'What aspect of your work feels most meaningful right now?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'wellbeing'),
  'wellbeing_seeking_balance',
  'Struggling with work-life balance or boundaries',
  'keyword',
  '{balance, boundaries, work-life, too much, can''t keep up, weekends, time off, need a break, not sustainable}'::text[],
  'User is aware of work-life balance challenges',
  0.80,
  (select source_id from signal_detection_sources where source_name = 'Well-Being Literature'),
  '{recognized_burnout}'::text[],
  '{personal_wellbeing, wellbeing}'::text[],
  'What would help you achieve better balance?',
  true
on conflict (indicator_key) do nothing;

-- ============================================================================
-- SIGNAL DATA: ROLE & IDENTITY CLARITY SIGNALS
-- ============================================================================

insert into signal_indicators (
  category_id, indicator_key, indicator_name, indicator_type, keywords, description, 
  confidence_default, source_id, related_activities, related_competencies, followup_question, active
)
select 
  (select category_id from signal_categories where category_key = 'role_clarity'),
  'role_clarity_exploring_identity',
  'Exploring professional identity or role transition',
  'keyword',
  '{who am I, who do I want to be, becoming, identity, transitioning to, shift towards, less clinician more, wondering if}'::text[],
  'User is actively exploring or transitioning professional identity',
  0.75,
  (select source_id from signal_detection_sources where source_name = 'Career Development Theory'),
  '{mentored_trainee}'::text[],
  '{identity, learner_prof_dev}'::text[],
  'Tell me more about the professional identity you''re developing or exploring.',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'role_clarity'),
  'role_clarity_unclear_career_path',
  'Uncertainty about career direction or next steps',
  'keyword',
  '{not sure, unclear, torn between, what comes next, next steps, direction, what''s next, unsure of path, confused about}'::text[],
  'User is uncertain about career trajectory or options',
  0.72,
  (select source_id from signal_detection_sources where source_name = 'Career Development Theory'),
  '{}'::text[],
  '{identity}'::text[],
  'What are the options you''re considering?',
  true
on conflict (indicator_key) do nothing;

-- ============================================================================
-- SIGNAL DATA: SKILL DOMAIN GAP SIGNALS
-- ============================================================================

insert into signal_indicators (
  category_id, indicator_key, indicator_name, indicator_type, keywords, description, 
  confidence_default, source_id, related_activities, related_competencies, followup_question, active
)
select 
  (select category_id from signal_categories where category_key = 'skill_domain_gap'),
  'skill_gap_teaching_administration',
  'Lacking confidence or development in teaching/admin',
  'keyword',
  '{don''t know how to teach, never been trained in, no background in, not an educator, teaching isn''t my strength, admin skills}'::text[],
  'User identifies a gap in teaching or administration skills',
  0.70,
  (select source_id from signal_detection_sources where source_name = 'Clinician Educator Milestones'),
  '{}'::text[],
  '{teaching, admin}'::text[],
  'What aspect of teaching or administration would you most like to develop?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'skill_domain_gap'),
  'skill_gap_research_scholarship',
  'Lacking confidence or development in research/scholarship',
  'keyword',
  '{not a researcher, never done research, don''t know how to publish, scared of research, no scholarly output, not academic}'::text[],
  'User identifies a gap in research or scholarship skills',
  0.68,
  (select source_id from signal_detection_sources where source_name = 'Career Development Theory'),
  '{}'::text[],
  '{scholarship, med_ed_scholarship}'::text[],
  'What would scholarly work or research look like for you?',
  true
on conflict (indicator_key) do nothing;

-- ============================================================================
-- TABLE 4: signal_conversational_routes
-- ============================================================================
-- Maps detected signals to coaching routes: what Mak asks or does next

create table if not exists signal_conversational_routes (
  route_id uuid primary key default gen_random_uuid(),
  indicator_id uuid not null references signal_indicators(indicator_id),
  route_name text not null,
  route_type text default 'followup_question', -- 'followup_question', 'reflection_prompt', 'resource_offer', 'validation'
  route_template text not null, -- The actual language Mak uses (can include {placeholders})
  conditional_logic text, -- e.g. "if user_career_track = 'educator'" 
  confidence_adjustment numeric(3,2) default 0.0, -- adjust signal confidence based on context
  active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique (indicator_id, route_name)
);
create index if not exists idx_routes_indicator on signal_conversational_routes(indicator_id);

-- Example routes
insert into signal_conversational_routes (indicator_id, route_name, route_type, route_template, conditional_logic, active)
select 
  (select indicator_id from signal_indicators where indicator_key = 'mentorship_coaching_conversation'),
  'Mentorship followup',
  'followup_question',
  'That mentoring work is meaningful. Was this a one-time conversation or part of a longer relationship you''re building with them?',
  null,
  true
union all
select 
  (select indicator_id from signal_indicators where indicator_key = 'leadership_leading_meeting'),
  'Leadership impact check',
  'followup_question',
  'Leading that took vision and presence. What was the outcome? Did the group move forward?',
  null,
  true
union all
select 
  (select indicator_id from signal_indicators where indicator_key = 'systems_proposed_change'),
  'Systems thinking deepening',
  'reflection_prompt',
  'You identified something broken and fixed it—that''s systems thinking in action. Do you see yourself in a systems-leader role?',
  null,
  true
union all
select 
  (select indicator_id from signal_indicators where indicator_key = 'advocacy_speaking_up'),
  'Advocacy affirmation',
  'validation',
  'Speaking up for what''s right takes courage. I want to honor that you did.',
  null,
  true
union all
select 
  (select indicator_id from signal_indicators where indicator_key = 'emotional_labor_supporting_distress'),
  'Emotional labor recognition',
  'validation',
  'Holding space for someone in distress is real work and it matters. How are *you* doing with this?',
  null,
  true
on conflict (indicator_id, route_name) do nothing;
-- ============================================================================
-- Stores detected signals and context from user interactions for pattern recognition

create table if not exists signal_user_context (
  context_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  indicator_id uuid not null references signal_indicators(indicator_id),
  detected_at timestamp with time zone default now(),
  raw_text text, -- the user's actual text
  confidence_score numeric(3,2), -- the actual confidence (0.0-1.0)
  context_data jsonb, -- extracted context: who, what, scope, etc.
  mak_response text, -- what Mak said in response
  user_reception text, -- how user responded (positive, receptive, dismissed, etc.)
  activity_inferred_id uuid references ontology_invisible_work_activities(activity_id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

comment on table signal_user_context is 'Records of signals detected in user interactions for pattern learning';
create index if not exists idx_signal_context_user on signal_user_context(user_id);
create index if not exists idx_signal_context_indicator on signal_user_context(indicator_id);
create index if not exists idx_signal_context_time on signal_user_context(detected_at);

-- RLS
alter table signal_user_context enable row level security;
create policy "signal_context_user_scoped" on signal_user_context for all using (auth.uid() = user_id);

-- ============================================================================
-- TABLE 6: signal_pattern_summaries
-- ============================================================================
-- Aggregate patterns: "this user shows strong mentorship signals" or "increasing burnout signals"

create table if not exists signal_pattern_summaries (
  pattern_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  category_id uuid not null references signal_categories(category_id),
  signal_frequency integer default 0, -- how many times detected in window
  trend text default 'stable', -- 'increasing', 'decreasing', 'stable', 'emerging'
  time_window text default '30_days', -- '7_days', '30_days', '90_days', 'all_time'
  pattern_strength numeric(3,2), -- 0.0-1.0
  last_detected_at timestamp with time zone,
  coaching_focus text, -- suggested coaching direction based on pattern
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

comment on table signal_pattern_summaries is 'Aggregated signal patterns over time for user insights';
create index if not exists idx_patterns_user on signal_pattern_summaries(user_id);
create index if not exists idx_patterns_category on signal_pattern_summaries(category_id);

-- RLS
alter table signal_pattern_summaries enable row level security;
create policy "patterns_user_scoped" on signal_pattern_summaries for all using (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES FOR SIGNAL REFERENCE TABLES
-- ============================================================================
-- Signal definitions are reference/read-only, public access

alter table signal_detection_sources enable row level security;
create policy "sources_public_read" on signal_detection_sources for select using (true);

alter table signal_categories enable row level security;
create policy "categories_public_read" on signal_categories for select using (true);

alter table signal_indicators enable row level security;
create policy "indicators_public_read" on signal_indicators for select using (true);

alter table signal_conversational_routes enable row level security;
create policy "routes_public_read" on signal_conversational_routes for select using (true);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
-- Signal detection relies on fast keyword/pattern matching

create index if not exists idx_indicators_keywords on signal_indicators using gin(keywords);
create index if not exists idx_context_detected_at on signal_user_context(detected_at desc);
create index if not exists idx_context_activity on signal_user_context(activity_inferred_id);
create index if not exists idx_patterns_updated on signal_pattern_summaries(updated_at desc);

-- ============================================================================
-- END OF SIGNAL DETECTION MIGRATION
-- ============================================================================


-- ========================================================================
-- FILE: docs/migrations/20260523_activity_entries_extended.sql
-- ========================================================================

-- FISCMAK Activity Entries Schema Extension
-- Created: 2026-05-23
-- Purpose: Wire Layer 3 (Signal Detection) → Layer 4 (Activity Capture) → Layer 5 (Core Ontology)
-- This table is the heart of FISCMAK: raw events → detected signals → formal career evidence

-- ============================================================================
-- TABLE: activity_entries (EXTENDED VERSION)
-- ============================================================================
-- Extends the existing V2 activity_entries table (PK: id) to capture:
-- - Raw user input (what they said)
-- - Detected signals (what Mak heard)
-- - Inferred activity (what it means professionally)
-- - Ontology mapping (competencies, tracks, levels)
-- - Classification metadata (confidence, routing, follow-up)

alter table activity_entries add column if not exists raw_text_tokens integer;
alter table activity_entries add column if not exists input_timestamp timestamp with time zone default now();
alter table activity_entries add column if not exists detected_signals uuid[] default array[]::uuid[];
alter table activity_entries add column if not exists detected_signal_keys text[] default array[]::text[];
alter table activity_entries add column if not exists detected_signal_confidence numeric(3,2);
alter table activity_entries add column if not exists signal_detection_metadata jsonb;
alter table activity_entries add column if not exists user_specialty_id uuid references ontology_specialties(specialty_id);
alter table activity_entries add column if not exists user_subspecialty_id uuid references ontology_subspecialties(subspecialty_id);
alter table activity_entries add column if not exists user_role text;
alter table activity_entries add column if not exists user_career_track_id uuid references ontology_career_tracks(track_id);
alter table activity_entries add column if not exists entry_setting text;
alter table activity_entries add column if not exists entry_energy text;
alter table activity_entries add column if not exists activity_category text;
alter table activity_entries add column if not exists people_involved text[];
alter table activity_entries add column if not exists duration_minutes integer;
alter table activity_entries add column if not exists evidence_artifacts text[];
alter table activity_entries add column if not exists additional_context jsonb;
alter table activity_entries add column if not exists inferred_activity_id uuid references ontology_invisible_work_activities(activity_id);
alter table activity_entries add column if not exists inferred_activity_key text;
alter table activity_entries add column if not exists related_activity_ids uuid[] default array[]::uuid[];
alter table activity_entries add column if not exists related_activity_keys text[] default array[]::text[];
alter table activity_entries add column if not exists inferred_competency_domain_ids uuid[] default array[]::uuid[];
alter table activity_entries add column if not exists inferred_subcompetency_ids uuid[] default array[]::uuid[];
alter table activity_entries add column if not exists inferred_subcompetency_keys text[] default array[]::text[];
alter table activity_entries add column if not exists inferred_career_track_ids uuid[] default array[]::uuid[];
alter table activity_entries add column if not exists inferred_career_track_keys text[] default array[]::text[];
alter table activity_entries add column if not exists inferred_development_level_id uuid references ontology_development_levels(level_id);
alter table activity_entries add column if not exists inferred_development_level numeric;
alter table activity_entries add column if not exists development_level_reasoning text;
alter table activity_entries add column if not exists overall_confidence numeric(3,2) default 0.75;
alter table activity_entries add column if not exists classification_source text default 'ai';
alter table activity_entries add column if not exists is_user_corrected boolean default false;
alter table activity_entries add column if not exists user_correction_notes text;
alter table activity_entries add column if not exists mak_detected_at timestamp with time zone;
alter table activity_entries add column if not exists mak_primary_response text;
alter table activity_entries add column if not exists mak_suggested_followup text;
alter table activity_entries add column if not exists mak_routing_category text;
alter table activity_entries add column if not exists mak_coaching_prompt text;
alter table activity_entries add column if not exists user_response_to_mak text;
alter table activity_entries add column if not exists followup_needed boolean default true;
alter table activity_entries add column if not exists output_cv_bullet text;
alter table activity_entries add column if not exists output_annual_review text;
alter table activity_entries add column if not exists output_promotion_language text;
alter table activity_entries add column if not exists output_teaching_portfolio text;
alter table activity_entries add column if not exists output_fellowship_narrative text;
alter table activity_entries add column if not exists updated_at timestamp with time zone default now();
alter table activity_entries add column if not exists processed_at timestamp with time zone;
alter table activity_entries add column if not exists version integer default 1;

comment on table activity_entries is 'Core event table: captures user activity + detected signals + ontology mapping';

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
-- Query patterns: find activities by user/time, by signal, by activity type, by competency

create index if not exists idx_activity_entries_user on activity_entries(user_id);
create index if not exists idx_activity_entries_user_time on activity_entries(user_id, created_at desc);
create index if not exists idx_activity_entries_created on activity_entries(created_at desc);
create index if not exists idx_activity_entries_activity on activity_entries(inferred_activity_id);
create index if not exists idx_activity_entries_activity_key on activity_entries(inferred_activity_key);
create index if not exists idx_activity_entries_specialty on activity_entries(user_specialty_id);
create index if not exists idx_activity_entries_track on activity_entries using gin (inferred_career_track_ids);
create index if not exists idx_activity_entries_signals on activity_entries using gin (detected_signals);
create index if not exists idx_activity_entries_competencies on activity_entries using gin (inferred_subcompetency_ids);
create index if not exists idx_activity_entries_confidence on activity_entries(overall_confidence);
create index if not exists idx_activity_entries_processed on activity_entries(processed_at);
create index if not exists idx_activity_entries_energy on activity_entries(entry_energy);

-- ============================================================================
-- ROW-LEVEL SECURITY
-- ============================================================================
-- Each user can only see their own entries

alter table activity_entries enable row level security;

drop policy if exists "activity_entries_user_scoped" on activity_entries;
create policy "activity_entries_user_scoped" on activity_entries 
  for all using (auth.uid() = user_id);

-- ============================================================================
-- TABLE: activity_classification_audit
-- ============================================================================
-- Tracks corrections and confidence adjustments for learning

create table if not exists activity_classification_audit (
  audit_id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references activity_entries(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  
  -- What was changed
  original_inferred_activity_id uuid,
  corrected_inferred_activity_id uuid references ontology_invisible_work_activities(activity_id),
  
  original_confidence numeric(3,2),
  corrected_confidence numeric(3,2),
  
  correction_reason text, -- "activity was different", "confidence was too high", etc.
  user_notes text, -- user explanation
  
  created_at timestamp with time zone default now()
);

comment on table activity_classification_audit is 'Tracks user corrections to improve classification over time';

create index if not exists idx_audit_entry on activity_classification_audit(entry_id);
create index if not exists idx_audit_user on activity_classification_audit(user_id);
create index if not exists idx_audit_time on activity_classification_audit(created_at desc);

alter table activity_classification_audit enable row level security;
create policy "audit_user_scoped" on activity_classification_audit 
  for all using (auth.uid() = user_id);

-- ============================================================================
-- TABLE: activity_signal_context
-- ============================================================================
-- Detailed signal detection results for debugging & learning

create table if not exists activity_signal_context (
  context_id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references activity_entries(id) on delete cascade,
  
  -- Signal that was detected
  indicator_id uuid not null references signal_indicators(indicator_id),
  indicator_key text not null,
  indicator_name text,
  category_id uuid references signal_categories(category_id),
  
  -- How it was detected
  matched_keywords text[], -- which keywords actually matched
  regex_match_positions int4range, -- where in the text
  
  -- Confidence & routing
  signal_confidence numeric(3,2),
  suggested_routing_category text,
  
  created_at timestamp with time zone default now()
);

comment on table activity_signal_context is 'Detailed signal match records for audit & learning';

create index if not exists idx_signal_context_entry on activity_signal_context(entry_id);
create index if not exists idx_signal_context_indicator on activity_signal_context(indicator_id);

alter table activity_signal_context enable row level security;
create policy "signal_context_user_scoped" on activity_signal_context 
  for all using (
    auth.uid() = (select user_id from activity_entries where id = activity_signal_context.entry_id)
  );

-- ============================================================================
-- TABLE: activity_patterns
-- ============================================================================
-- Aggregated user patterns over time for coaching insights

create table if not exists activity_patterns (
  pattern_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  
  -- What pattern was detected
  pattern_type text, -- 'activity_frequency', 'signal_trend', 'energy_trend', 'competency_growth', 'track_alignment'
  pattern_key text, -- e.g., 'mentorship_increasing', 'burnout_signals_rising', 'leadership_emerging'
  
  -- Time window
  window_days integer default 30, -- calculated over 7, 30, 90, or 365 days
  window_start_date date,
  window_end_date date,
  
  -- The pattern
  subject_id uuid, -- activity_id, signal_indicator_id, competency_id, or track_id
  subject_key text, -- activity_key, signal_key, competency_key, or track_key
  frequency integer, -- how many times detected
  trend text default 'stable', -- 'increasing', 'decreasing', 'stable', 'emerging'
  trend_magnitude numeric(3,2), -- strength from 0.0-1.0
  
  -- Coaching insight
  coaching_direction text, -- suggested coaching focus
  insight_narrative text, -- human-readable insight
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

comment on table activity_patterns is 'Detected patterns in user activities for longitudinal coaching insights';

create index if not exists idx_patterns_user on activity_patterns(user_id);
create index if not exists idx_patterns_pattern_key on activity_patterns(pattern_key);
create index if not exists idx_patterns_window on activity_patterns(window_start_date, window_end_date);
create index if not exists idx_patterns_updated on activity_patterns(updated_at desc);

alter table activity_patterns enable row level security;
create policy "patterns_user_scoped" on activity_patterns 
  for all using (auth.uid() = user_id);

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Recent user activities with full context
create or replace view user_recent_activities as
select 
  ae.id as entry_id,
  ae.user_id,
  ae.raw_text,
  ae.inferred_activity_key,
  ae.detected_signal_keys,
  ae.inferred_subcompetency_keys,
  ae.inferred_career_track_keys,
  ae.inferred_development_level,
  ae.overall_confidence,
  ae.entry_energy,
  ae.created_at,
  ae.mak_coaching_prompt
from activity_entries ae
where ae.processed_at is not null
order by ae.created_at desc;

-- Activities by signal detected
create or replace view activities_by_signal as
select 
  unnest(ae.detected_signal_keys) as signal_key,
  count(*) as count,
  count(distinct ae.user_id) as user_count,
  avg(ae.overall_confidence) as avg_confidence
from activity_entries ae
where ae.processed_at is not null
group by signal_key
order by count desc;

-- User activity summary
create or replace view user_activity_summary as
select 
  ae.user_id,
  count(distinct ae.id) as total_activities,
  count(distinct ae.inferred_activity_key) as unique_activities,
  count(distinct ae.inferred_career_track_ids) as tracks_represented,
  avg(ae.overall_confidence) as avg_classification_confidence,
  max(ae.created_at) as last_activity_date,
  count(distinct case when ae.entry_energy = 'draining' then ae.id end) as draining_activities,
  count(distinct case when ae.entry_energy = 'fulfilling' then ae.id end) as fulfilling_activities
from activity_entries ae
where ae.processed_at is not null
group by ae.user_id;

-- ============================================================================
-- HELPER FUNCTION: Calculate development level from context
-- ============================================================================
-- Maps scope + repetition indicators to level 1-5

create or replace function infer_development_level(
  p_scope text,
  p_doing_independently boolean,
  p_led_others boolean,
  p_systematized boolean
) returns integer as $$
begin
  -- Level 5: Builds systems, teaches others
  if p_systematized then
    return 5;
  end if;
  
  -- Level 4: Leads others, adapts across complexity
  if p_led_others then
    return 4;
  end if;
  
  -- Level 3: Performs independently in routine contexts
  if p_doing_independently then
    return 3;
  end if;
  
  -- Level 2: Participates with guidance
  if p_scope = 'local' then
    return 2;
  end if;
  
  -- Level 1: Recognizes
  return 1;
end;
$$ language plpgsql immutable;

-- ============================================================================
-- HELPER FUNCTION: Update activity patterns
-- ============================================================================
-- Called periodically (e.g., nightly) to recalculate user patterns

create or replace function update_activity_patterns(p_user_id uuid default null) returns void as $$
declare
  v_user_id uuid;
  v_window_days integer;
  v_window_start date;
begin
  -- If no user specified, update all users with recent activity
  if p_user_id is null then
    for v_user_id in
      select distinct user_id from activity_entries 
      where processed_at > now() - interval '90 days'
    loop
      perform update_activity_patterns(v_user_id);
    end loop;
    return;
  end if;

  -- For this user, calculate patterns over 7, 30, and 90 day windows
  for v_window_days in array[7, 30, 90] loop
    v_window_start := (now() - (v_window_days || ' days')::interval)::date;

    -- Activity frequency patterns
    insert into activity_patterns (
      user_id, pattern_type, pattern_key, window_days, window_start_date, window_end_date,
      subject_id, subject_key, frequency, trend_magnitude, coaching_direction
    )
    select 
      p_user_id,
      'activity_frequency',
      'activity_' || coalesce(ae.inferred_activity_key, 'unknown'),
      v_window_days,
      v_window_start,
      current_date,
      ae.inferred_activity_id,
      ae.inferred_activity_key,
      count(*),
      least(1.0, count(*) / 5.0)::numeric(3,2), -- normalize: 5+ = strength 1.0
      case 
        when count(*) > 10 then 'This is becoming a strength—deepen expertise or mentor others'
        when count(*) > 5 then 'Growing competency—continue developing'
        when count(*) > 0 then 'Emerging pattern—explore further'
      end
    from activity_entries ae
    where ae.user_id = p_user_id
      and ae.processed_at::date >= v_window_start
      and ae.inferred_activity_id is not null
    group by ae.inferred_activity_id, ae.inferred_activity_key
    on conflict (pattern_id) do update set
      frequency = excluded.frequency,
      trend_magnitude = excluded.trend_magnitude,
      coaching_direction = excluded.coaching_direction,
      updated_at = now();

    -- Signal frequency patterns
    insert into activity_patterns (
      user_id, pattern_type, pattern_key, window_days, window_start_date, window_end_date,
      subject_key, frequency, trend_magnitude
    )
    select 
      p_user_id,
      'signal_frequency',
      'signal_' || coalesce(unnest(ae.detected_signal_keys), 'unknown'),
      v_window_days,
      v_window_start,
      current_date,
      unnest(ae.detected_signal_keys),
      count(*),
      least(1.0, count(*) / 5.0)::numeric(3,2)
    from activity_entries ae
    where ae.user_id = p_user_id
      and ae.processed_at::date >= v_window_start
      and ae.detected_signal_keys is not null
      and array_length(ae.detected_signal_keys, 1) > 0
    group by unnest(ae.detected_signal_keys)
    on conflict (pattern_id) do update set
      frequency = excluded.frequency,
      trend_magnitude = excluded.trend_magnitude,
      updated_at = now();

  end loop;

end;
$$ language plpgsql;

-- ============================================================================
-- END OF ACTIVITY ENTRIES EXTENSION
-- ============================================================================


-- ========================================================================
-- FILE: docs/migrations/20260523_career_fit_engine.sql
-- ========================================================================

-- FISCMAK Career Fit Engine
-- Created: 2026-05-23
-- Purpose: Match jobs to users based on specialty, evidence, goals, and career trajectory
-- Not a job board—a career fit analyzer

-- ============================================================================
-- TABLE 1: job_sources
-- ============================================================================
-- Approved job sources (APIs, feeds, manual curations)

create table if not exists job_sources (
  source_id uuid primary key default gen_random_uuid(),
  source_name text not null unique, -- "NEJM Career Center", "PracticeLink", "Greenhouse API", "Manual Curation"
  source_type text not null, -- 'api', 'feed', 'manual', 'partnership'
  api_endpoint text, -- if API-based
  api_key_ref text, -- reference to secrets manager, not stored here
  last_synced_at timestamp with time zone,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

comment on table job_sources is 'Approved job sources—APIs, feeds, manual curations only. No scrapers.';

insert into job_sources (source_name, source_type, is_active) values
  ('NEJM Career Center', 'partnership', true),
  ('JAMA Career Center', 'partnership', true),
  ('PracticeLink', 'partnership', true),
  ('PracticeMatch', 'partnership', true),
  ('Greenhouse API (Partner Companies)', 'api', true),
  ('Manual Curation', 'manual', true),
  ('Indeed Partner API', 'api', true)
on conflict (source_name) do nothing;

-- ============================================================================
-- TABLE 2: jobs (extends existing V2 jobs table)
-- ============================================================================
-- Normalized job postings in FISCMAK schema

alter table jobs add column if not exists source_id uuid references job_sources(source_id);
alter table jobs add column if not exists source_job_id text;
alter table jobs add column if not exists employer text;
alter table jobs add column if not exists employer_type text;
alter table jobs add column if not exists location_city text;
alter table jobs add column if not exists location_state text;
alter table jobs add column if not exists location_country text default 'USA';
alter table jobs add column if not exists location_region text;
alter table jobs add column if not exists remote_type text default 'on-site';
alter table jobs add column if not exists specialty_id uuid references ontology_specialties(specialty_id);
alter table jobs add column if not exists specialty_key text;
alter table jobs add column if not exists subspecialty_id uuid references ontology_subspecialties(subspecialty_id);
alter table jobs add column if not exists subspecialty_key text;
alter table jobs add column if not exists role_level text;
alter table jobs add column if not exists setting text;
alter table jobs add column if not exists clinical_percent integer;
alter table jobs add column if not exists teaching_percent integer;
alter table jobs add column if not exists research_percent integer;
alter table jobs add column if not exists leadership_percent integer;
alter table jobs add column if not exists admin_percent integer;
alter table jobs add column if not exists call_burden text;
alter table jobs add column if not exists call_frequency text;
alter table jobs add column if not exists inpatient_days_month integer;
alter table jobs add column if not exists outpatient_hours_week integer;
alter table jobs add column if not exists salary_min integer;
alter table jobs add column if not exists salary_max integer;
alter table jobs add column if not exists salary_currency text default 'USD';
alter table jobs add column if not exists signing_bonus integer;
alter table jobs add column if not exists relocation_package boolean default false;
alter table jobs add column if not exists benefits_notes text;
alter table jobs add column if not exists visa_sponsorship_available boolean default false;
alter table jobs add column if not exists visa_types_supported text[];
alter table jobs add column if not exists tail_coverage_provided boolean;
alter table jobs add column if not exists protected_time_admin boolean;
alter table jobs add column if not exists protected_time_research boolean;
alter table jobs add column if not exists protected_time_teaching boolean;
alter table jobs add column if not exists required_board_certification text[];
alter table jobs add column if not exists required_licenses text[];
alter table jobs add column if not exists preferred_credentials text[];
alter table jobs add column if not exists culture_notes text;
alter table jobs add column if not exists team_size integer;
alter table jobs add column if not exists leadership_track boolean;
alter table jobs add column if not exists research_track boolean;
alter table jobs add column if not exists teaching_track boolean;
alter table jobs add column if not exists academic_affiliation boolean;
alter table jobs add column if not exists raw_description text;
alter table jobs add column if not exists key_responsibilities text[];
alter table jobs add column if not exists requirements_raw text;
alter table jobs add column if not exists source_url text;
alter table jobs add column if not exists deadline_apply date;
alter table jobs add column if not exists last_seen date;
alter table jobs add column if not exists expires_at timestamp with time zone;
alter table jobs add column if not exists updated_at timestamp with time zone default now();
alter table jobs add column if not exists is_active boolean default true;

comment on table jobs is 'Normalized job postings in FISCMAK career-fit schema';

create index if not exists idx_jobs_specialty on jobs(specialty_id);
create index if not exists idx_jobs_subspecialty on jobs(subspecialty_id);
create index if not exists idx_jobs_location on jobs(location_state);
create index if not exists idx_jobs_setting on jobs(setting);
create index if not exists idx_jobs_active on jobs(is_active);
create index if not exists idx_jobs_expires on jobs(expires_at);
create index if not exists idx_jobs_source on jobs(source_id);

-- ============================================================================
-- TABLE 3: user_career_preferences
-- ============================================================================
-- What each user is looking for in their next role

create table if not exists user_career_preferences (
  pref_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  
  -- Career direction
  target_career_tracks uuid[] default array[]::uuid[], -- which tracks? ['clinician_educator', 'systems_leader']
  target_career_track_keys text[],
  
  -- Location & setting preferences
  preferred_locations text[], -- cities or regions: ['Boston', 'San Francisco', 'Remote']
  willing_to_relocate boolean default false,
  location_flexibility text, -- 'anywhere', 'region', 'city', 'state', 'specific_only'
  
  -- Work-life preferences
  preferred_remote_type text, -- 'on-site', 'hybrid', 'remote', 'any'
  max_call_burden text, -- 'none', 'light', 'moderate', 'heavy', 'flexible'
  min_protected_time_percent integer default 20, -- minimum admin/research/teaching time
  preferred_clinical_percent integer default 60, -- ideal balance
  
  -- Compensation
  salary_target_min integer,
  salary_target_max integer,
  signing_bonus_important boolean default false,
  
  -- Career goals (open-ended)
  next_role_goals text[], -- ['academic_position', 'leadership', 'research_time', 'work_life_balance']
  visa_sponsorship_needed boolean default false,
  
  -- What they value most (ranked)
  value_priorities text[], -- ['autonomy', 'mentorship', 'growth', 'stability', 'family_time', 'research']
  
  -- Red flags / deal-breakers
  deal_breakers text[], -- ['excessive_call', 'no_research_support', 'poor_culture']
  
  -- Timeline
  job_search_timeline text, -- 'immediate', '3_months', '6_months', '12_months', 'exploring'
  start_date_target date,
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

comment on table user_career_preferences is 'User career preferences for job matching';

create index if not exists idx_prefs_user on user_career_preferences(user_id);

alter table user_career_preferences enable row level security;
create policy "prefs_user_scoped" on user_career_preferences 
  for all using (auth.uid() = user_id);

-- ============================================================================
-- TABLE 4: job_matches
-- ============================================================================
-- Cached job-to-user match scores

create table if not exists job_matches (
  match_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references jobs(job_id) on delete cascade,
  
  -- Match score components (each 0-100)
  specialty_fit integer,
  subspecialty_fit integer,
  career_track_fit integer,
  evidence_fit integer, -- how much user's FISCMAK evidence aligns
  lifestyle_fit integer, -- location, remote, call burden, time
  growth_fit integer, -- learning, advancement potential
  
  -- Overall score
  overall_fit_score integer, -- weighted average (0-100)
  confidence_level numeric(3,2), -- how confident in this score (0.0-1.0)
  
  -- Risk flags & gaps
  risk_flags text[], -- ['unclear_protected_time', 'visa_uncertain', 'high_call']
  major_gaps text[], -- what's missing from job description
  strengths_for_role text[], -- why this user fits
  
  -- Career narrative angle
  positioning_angle text, -- how to position in CV/cover letter for this role
  cover_letter_draft text, -- suggested talking points
  
  -- User interaction
  user_viewed_at timestamp with time zone,
  user_bookmarked_at timestamp with time zone,
  user_saved_job_id uuid, -- if saved to user_saved_jobs
  user_notes text, -- user's private notes on this match
  
  -- Admin flags
  is_flagged_for_review boolean default false, -- liability review
  flag_reason text,
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  unique(user_id, job_id)
);

comment on table job_matches is 'Match scores between users and jobs';

create index if not exists idx_matches_user on job_matches(user_id);
create index if not exists idx_matches_job on job_matches(job_id);
create index if not exists idx_matches_score on job_matches(overall_fit_score desc);
create index if not exists idx_matches_viewed on job_matches(user_viewed_at);

alter table job_matches enable row level security;
create policy "matches_user_scoped" on job_matches 
  for all using (auth.uid() = user_id);

-- ============================================================================
-- TABLE 5: user_saved_jobs
-- ============================================================================
-- User's saved/liked/bookmarked jobs

create table if not exists user_saved_jobs (
  saved_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references jobs(job_id) on delete cascade,
  
  -- User action
  action_type text default 'saved', -- 'saved', 'liked', 'shared', 'applied'
  notes text, -- user's private notes: "follow up in June", "discussed with mentor"
  tags text[], -- user's tags: ['teaching_heavy', 'good_culture']
  
  -- Application tracking
  applied_at timestamp with time zone,
  application_status text, -- 'not_applied', 'interested', 'applied', 'rejected', 'interview', 'offer'
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  unique(user_id, job_id)
);

comment on table user_saved_jobs is 'Jobs users have saved or applied to';

create index if not exists idx_saved_user on user_saved_jobs(user_id);
create index if not exists idx_saved_applied on user_saved_jobs(applied_at);

alter table user_saved_jobs enable row level security;
create policy "saved_user_scoped" on user_saved_jobs 
  for all using (auth.uid() = user_id);

-- ============================================================================
-- VIEWS FOR JOB SEARCH UI
-- ============================================================================

-- User's job matches, ranked by fit
create or replace view user_job_matches_ranked as
select 
  jm.match_id,
  jm.user_id,
  j.job_id,
  j.title,
  j.employer,
  j.location_city,
  j.location_state,
  j.specialty_key,
  j.subspecialty_key,
  j.setting,
  j.salary_min,
  j.salary_max,
  jm.overall_fit_score,
  jm.specialty_fit,
  jm.career_track_fit,
  jm.evidence_fit,
  jm.lifestyle_fit,
  jm.risk_flags,
  jm.positioning_angle,
  usj.saved_id is not null as is_saved,
  usj.application_status,
  jm.created_at
from job_matches jm
join jobs j on jm.job_id = j.job_id
left join user_saved_jobs usj on jm.user_id = usj.user_id and jm.job_id = usj.job_id
where j.is_active = true
order by jm.overall_fit_score desc;

-- Jobs by specialty + filter
create or replace view jobs_by_specialty as
select 
  j.job_id,
  j.title,
  j.employer,
  j.specialty_key,
  j.subspecialty_key,
  j.location_city,
  j.location_state,
  j.setting,
  j.clinical_percent,
  j.teaching_percent,
  j.research_percent,
  j.call_burden,
  j.salary_min,
  j.salary_max,
  count(*) over (partition by j.specialty_key) as jobs_in_specialty
from jobs j
where j.is_active = true;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Calculate specialty fit (simple version)
create or replace function calc_specialty_fit(
  p_user_specialty_id uuid,
  p_job_specialty_id uuid
) returns integer as $$
begin
  if p_user_specialty_id = p_job_specialty_id then
    return 100;
  else
    return 50; -- some cross-specialty fit
  end if;
end;
$$ language plpgsql immutable;

-- Calculate lifestyle fit based on preferences + job conditions
create or replace function calc_lifestyle_fit(
  p_user_id uuid,
  p_job_id uuid
) returns integer as $$
declare
  v_pref record;
  v_job record;
  v_score integer := 0;
  v_max_score integer := 0;
begin
  select * into v_pref from user_career_preferences where user_id = p_user_id;
  select * into v_job from jobs where job_id = p_job_id;
  
  if v_pref is null or v_job is null then
    return 50;
  end if;
  
  -- Location fit
  if v_pref.preferred_locations && array[coalesce(v_job.location_city, ''), coalesce(v_job.location_state, '')] then
    v_score := v_score + 30;
  elsif v_pref.willing_to_relocate then
    v_score := v_score + 15;
  end if;
  v_max_score := v_max_score + 30;
  
  -- Remote fit
  if v_pref.preferred_remote_type = 'any' or v_pref.preferred_remote_type = v_job.remote_type then
    v_score := v_score + 20;
  end if;
  v_max_score := v_max_score + 20;
  
  -- Call burden fit
  if v_pref.max_call_burden = 'flexible' or v_pref.max_call_burden = v_job.call_burden then
    v_score := v_score + 25;
  end if;
  v_max_score := v_max_score + 25;
  
  -- Protected time fit
  if (v_job.protected_time_admin or v_job.protected_time_research or v_job.protected_time_teaching) then
    v_score := v_score + 25;
  end if;
  v_max_score := v_max_score + 25;
  
  if v_max_score = 0 then
    return 50;
  end if;
  
  return (v_score::numeric / v_max_score::numeric * 100)::integer;
end;
$$ language plpgsql stable;

-- Update all job matches for a user (run nightly)
create or replace function update_job_matches_for_user(p_user_id uuid) returns void as $$
declare
  v_user_specialty_id uuid;
  v_job record;
begin
  -- Get user's specialty
  select user_specialty_id into v_user_specialty_id from app_users where user_id = p_user_id;
  
  -- Recalculate matches for all active jobs
  for v_job in select job_id from jobs where is_active = true and expires_at > now()
  loop
    insert into job_matches (
      user_id, job_id,
      specialty_fit,
      lifestyle_fit,
      overall_fit_score,
      confidence_level
    ) values (
      p_user_id, v_job.job_id,
      calc_specialty_fit(v_user_specialty_id, (select specialty_id from jobs where job_id = v_job.job_id)),
      calc_lifestyle_fit(p_user_id, v_job.job_id),
      (
        calc_specialty_fit(v_user_specialty_id, (select specialty_id from jobs where job_id = v_job.job_id)) * 0.2 +
        calc_lifestyle_fit(p_user_id, v_job.job_id) * 0.3 +
        70 -- placeholder for evidence_fit + career_track_fit
      )::integer,
      0.75
    )
    on conflict (user_id, job_id) do update set
      specialty_fit = excluded.specialty_fit,
      lifestyle_fit = excluded.lifestyle_fit,
      overall_fit_score = excluded.overall_fit_score,
      updated_at = now();
  end loop;
end;
$$ language plpgsql;

-- ============================================================================
-- END OF CAREER FIT ENGINE SCHEMA
-- ============================================================================


-- ========================================================================
-- FILE: docs/migrations/20260524_user_subscriptions.sql
-- ========================================================================

-- User subscriptions for Stripe premium billing

CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES app_users(user_id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT DEFAULT 'inactive',
  plan_type TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('active', 'past_due', 'cancelled', 'paused', 'inactive'))
);

CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer ON user_subscriptions(stripe_customer_id);

ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see only their subscription" ON user_subscriptions;
CREATE POLICY "Users see only their subscription" ON user_subscriptions
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their subscription" ON user_subscriptions;
CREATE POLICY "Users can update their subscription" ON user_subscriptions
  FOR UPDATE USING (user_id = auth.uid());

COMMENT ON TABLE user_subscriptions IS 'Tracks user premium subscription status via Stripe';


-- ========================================================================
-- FILE: docs/supabase-auth-bridge.sql
-- ========================================================================

-- Run AFTER FISCMAK_SUPABASE_SCHEMA.sql in Supabase SQL Editor
-- Links Supabase Auth (auth.users) to FISCMAK users + profiles tables

DROP POLICY IF EXISTS users_insert ON users;
CREATE POLICY users_insert ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS profiles_insert ON profiles;
CREATE POLICY profiles_insert ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (id) DO UPDATE SET email = excluded.email, updated_at = NOW();

  INSERT INTO public.profiles (id)
  VALUES (new.id)
  ON CONFLICT (id) DO NOTHING;

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ========================================================================
-- FILE: docs/supabase-finish-setup.sql
-- ========================================================================

-- Run when tables ALREADY EXIST but seed / RLS failed (do NOT run full schema again).
-- Safe to run multiple times.

-- Seed: career phases (fixed ARRAY syntax)
INSERT INTO career_phases (name, definition, identity_task, key_challenges, default_instruments, mak_mode_priority) VALUES
('Medical Student', 'Medical school enrollment', 'Am I becoming a physician?', 'Mistreatment, learning environment, burnout risk', '["PFI", "UWES-3"]', ARRAY['Coach']),
('Resident/Fellow', 'Residency or fellowship training', 'What kind of physician am I becoming?', 'Dual status, intense learning, identity formation', '["PFI", "UWES-9", "Career Fit", "PIF"]', ARRAY['Coach', 'Mentor']),
('Early Career Attending', 'First attending role (0-5 years)', 'How do I establish myself?', 'Novel practice setting, autonomy, work-life integration', '["PFI", "UWES-9", "Career Fit", "JeffSPLL", "PIF"]', ARRAY['Coach', 'Mentor', 'Analyst']),
('Mid-Career Attending', 'Established attending (10-20 years)', 'How do I sustain meaning while managing demands?', 'Highest burnout risk, admin burden, isolation', '["PFI", "UWES-9", "Career Fit", "JeffSPLL", "PIF", "Mini-Z"]', ARRAY['Analyst', 'Sponsor-Prep']),
('Late Career Attending', 'Senior attending (20+ years)', 'How do I finish well and prepare for transition?', 'Competency maintenance, finishing well, succession', '["PFI", "Career Fit", "PIF"]', ARRAY['Mentor']),
('Transitioning', 'Career change or major shift', 'Who am I becoming next?', 'Identity reconstruction, support needs', '["PFI", "UWES-9", "Career Fit", "PIF"]', ARRAY['Coach', 'Mentor']),
('Nonclinical', 'Non-clinical physician roles', 'How do I contribute outside clinical care?', 'Role clarity, visibility, impact measurement', '["PFI", "UWES-9", "Career Fit"]', ARRAY['Coach', 'Analyst']),
('Retired', 'Post-practice physician', 'Who am I without my white coat?', 'Identity transition, purpose, continued contribution', '["PFI"]', ARRAY['Mentor'])
ON CONFLICT (name) DO NOTHING;

INSERT INTO career_states (name, definition, developmental_task, duration_years) VALUES
('Formation', 'Building foundational professional identity', 'Establish core values and competencies', 4),
('Expansion', 'Exploring multiple roles and tracks', 'Develop breadth across domains and tracks', 3),
('Differentiation', 'Specializing in preferred areas', 'Deepen expertise, build identity', 5),
('Leadership', 'Taking on formal leadership roles', 'Develop systems thinking and influence', 5),
('Integration', 'Bringing coherence to complex career', 'Integrate multiple roles into cohesive identity', 10),
('Reinvention', 'Major career transition', 'Navigate identity shift, rebuild in new domain', 2),
('Sustainability', 'Maintaining long-term engagement', 'Sustain meaning amidst complexity', 10),
('Legacy', 'Focusing on mentorship and impact', 'Transfer knowledge, shape next generation', 10)
ON CONFLICT (name) DO NOTHING;

INSERT INTO specialty_groups (name, included_specialties, description) VALUES
('Psychiatry / Behavioral Health', ARRAY['Psychiatry', 'Addiction Medicine', 'Psychosomatic Medicine'], 'Mental health specialists'),
('Primary Care', ARRAY['Internal Medicine', 'Family Medicine', 'General Practice'], 'First-line care providers'),
('Hospital-Based Medicine', ARRAY['Hospitalist', 'Internal Medicine', 'Pediatrics'], 'Hospital inpatient care'),
('Surgical / Procedural', ARRAY['General Surgery', 'Orthopedic Surgery', 'Neurosurgery', 'Ophthalmology'], 'Surgical specialists'),
('Emergency / Acute Care', ARRAY['Emergency Medicine', 'Trauma Surgery', 'Critical Care'], 'Acute and emergency medicine'),
('Pediatrics', ARRAY['Pediatrics', 'Neonatal-Perinatal Medicine', 'Pediatric Surgery'], 'Children''s medicine'),
('Diagnostic Specialties', ARRAY['Radiology', 'Pathology', 'Laboratory Medicine'], 'Diagnostic and image-based specialties'),
('Academic Research-Heavy', ARRAY['Oncology', 'Infectious Disease', 'Nephrology'], 'Research-focused specialties'),
('Administrative / Executive', ARRAY['Chief Medical Officer', 'Medical Director', 'Dean'], 'Administrative physician roles'),
('Nonclinical / Industry', ARRAY['Medical Informatics', 'Health Policy', 'Industry Medicine'], 'Non-clinical physician roles')
ON CONFLICT (name) DO NOTHING;

INSERT INTO templates (template_type, name, description, word_limit, is_default)
SELECT v.template_type, v.name, v.description, v.word_limit, v.is_default
FROM (VALUES
  ('cv_bullets', 'CV Bullets', '5 professional accomplishments for your CV', 150, TRUE),
  ('annual_review', 'Annual Review', 'Comprehensive annual reflection', 750, TRUE),
  ('promotion_narrative', 'Promotion Narrative', 'Case for advancement', 1500, TRUE),
  ('teaching_statement', 'Teaching Statement', 'Philosophy of teaching', 500, TRUE),
  ('leadership_summary', 'Leadership Summary', 'Leadership credentials', 500, TRUE),
  ('professional_bio', 'Professional Bio', 'Third-person professional biography', 200, TRUE),
  ('cover_letter', 'Cover Letter', 'Job or fellowship application', 400, TRUE),
  ('invisible_work_summary', 'Invisible Work Summary', 'Document unrecognized work', 500, TRUE),
  ('career_snapshot', 'Career Snapshot', 'Quick career summary', 300, TRUE)
) AS v(template_type, name, description, word_limit, is_default)
WHERE NOT EXISTS (SELECT 1 FROM templates t WHERE t.template_type = v.template_type);

-- RLS (idempotent)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE lattice_cells ENABLE ROW LEVEL SECURITY;
ALTER TABLE mak_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS users_select ON users;
CREATE POLICY users_select ON users FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS users_update ON users;
CREATE POLICY users_update ON users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS profiles_select ON profiles;
CREATE POLICY profiles_select ON profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS profiles_insert ON profiles;
CREATE POLICY profiles_insert ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS profiles_update ON profiles;
CREATE POLICY profiles_update ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS activity_entries_select ON activity_entries;
CREATE POLICY activity_entries_select ON activity_entries FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS activity_entries_insert ON activity_entries;
CREATE POLICY activity_entries_insert ON activity_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS activity_entries_update ON activity_entries;
CREATE POLICY activity_entries_update ON activity_entries FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS evidence_items_select ON evidence_items;
CREATE POLICY evidence_items_select ON evidence_items FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS evidence_items_insert ON evidence_items;
CREATE POLICY evidence_items_insert ON evidence_items FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS evidence_items_update ON evidence_items;
CREATE POLICY evidence_items_update ON evidence_items FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS lattice_cells_select ON lattice_cells;
CREATE POLICY lattice_cells_select ON lattice_cells FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS lattice_cells_insert ON lattice_cells;
CREATE POLICY lattice_cells_insert ON lattice_cells FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS lattice_cells_update ON lattice_cells;
CREATE POLICY lattice_cells_update ON lattice_cells FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS mak_conversations_select ON mak_conversations;
CREATE POLICY mak_conversations_select ON mak_conversations FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS mak_conversations_insert ON mak_conversations;
CREATE POLICY mak_conversations_insert ON mak_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS generated_documents_select ON generated_documents;
CREATE POLICY generated_documents_select ON generated_documents FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS generated_documents_insert ON generated_documents;
CREATE POLICY generated_documents_insert ON generated_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS generated_documents_update ON generated_documents;
CREATE POLICY generated_documents_update ON generated_documents FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS career_goals_select ON career_goals;
CREATE POLICY career_goals_select ON career_goals FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS career_goals_insert ON career_goals;
CREATE POLICY career_goals_insert ON career_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS career_goals_update ON career_goals;
CREATE POLICY career_goals_update ON career_goals FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE career_phases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS career_phases_select ON career_phases;
CREATE POLICY career_phases_select ON career_phases FOR SELECT USING (TRUE);

ALTER TABLE specialty_groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS specialty_groups_select ON specialty_groups;
CREATE POLICY specialty_groups_select ON specialty_groups FOR SELECT USING (TRUE);

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS templates_select ON templates;
CREATE POLICY templates_select ON templates FOR SELECT USING (TRUE);

CREATE INDEX IF NOT EXISTS idx_activity_entries_user_energy ON activity_entries(user_id, energy_valence);
CREATE INDEX IF NOT EXISTS idx_activity_entries_user_domain_track ON activity_entries(user_id, primary_domain, primary_track);
CREATE INDEX IF NOT EXISTS idx_evidence_items_domain_track ON evidence_items(domains, tracks);
CREATE INDEX IF NOT EXISTS idx_generated_documents_type ON generated_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_mak_conversations_type ON mak_conversations(conversation_type);
CREATE INDEX IF NOT EXISTS idx_activity_user_date_domain ON activity_entries(user_id, activity_date DESC, primary_domain);
CREATE INDEX IF NOT EXISTS idx_lattice_user_active ON lattice_cells(user_id, is_active);

CREATE TABLE IF NOT EXISTS schema_version (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version VARCHAR(10),
  description TEXT,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO schema_version (version, description)
SELECT '1.0', 'Initial complete schema with 40+ tables, RLS, and seed data'
WHERE NOT EXISTS (SELECT 1 FROM schema_version WHERE version = '1.0');

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
    'Early Attending', 'Mid-Career Attending', 'Senior Attending', 'Retired'
  )),
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

-- GME programs + memberships (H1) — UH Psychiatry pilot seed
-- Run after 20260521_touchpoint1_onboarding.sql

CREATE TABLE IF NOT EXISTS programs (
  program_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE,
  institution_name TEXT NOT NULL,
  program_name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  acgme_program_code TEXT,
  medhub_institution TEXT,
  medhub_program_id INTEGER,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS program_memberships (
  membership_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(program_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES app_users(user_id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN (
    'trainee',
    'program_director',
    'ccc_chair',
    'program_coordinator',
    'faculty_mentor',
    'dio_viewer'
  )),
  pgy_level TEXT,
  training_track TEXT,
  cohort_start_date DATE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (program_id, user_id)
);

ALTER TABLE app_users ADD COLUMN IF NOT EXISTS pgy_level TEXT;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS current_rotation TEXT;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS specialty_origin TEXT;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS content_pack TEXT
  CHECK (content_pack IS NULL OR content_pack IN ('trainee', 'early_attending', 'mid_career', 'non_traditional', 'default'));
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS primary_program_id UUID REFERENCES programs(program_id);

CREATE INDEX IF NOT EXISTS idx_program_memberships_user ON program_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_program_memberships_program ON program_memberships(program_id);

-- UH Cleveland Psychiatry Residency (pilot) — id matches src/lib/v2/programs/registry.ts
INSERT INTO programs (
  program_id,
  slug,
  institution_name,
  program_name,
  specialty,
  settings
) VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890'::uuid,
  'uh-psych-cmc',
  'University Hospitals Cleveland Medical Center',
  'Psychiatry Residency',
  'Psychiatry',
  '{"academic_year":"2026-2027","schedule_seed":"psychiatry_uh_2026_2027_block_schedule.json"}'::jsonb
) ON CONFLICT (slug) DO UPDATE SET
  institution_name = EXCLUDED.institution_name,
  program_name = EXCLUDED.program_name,
  specialty = EXCLUDED.specialty,
  settings = EXCLUDED.settings;

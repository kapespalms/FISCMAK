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

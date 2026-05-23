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

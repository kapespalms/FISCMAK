-- Onboarding progress tracking (app_users — primary onboarding state table)
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS onboarding_status TEXT NOT NULL DEFAULT 'NOT_STARTED'
  CHECK (onboarding_status IN ('NOT_STARTED', 'STEP_1_COMPLETE', 'STEP_2_COMPLETE', 'FULLY_ONBOARDED'));

ALTER TABLE app_users ADD COLUMN IF NOT EXISTS current_onboarding_step INTEGER
  CHECK (current_onboarding_step IS NULL OR current_onboarding_step BETWEEN 1 AND 3);

ALTER TABLE app_users ADD COLUMN IF NOT EXISTS coach_mak_conversation_id TEXT;

COMMENT ON COLUMN app_users.onboarding_status IS 'Highest completed onboarding milestone';
COMMENT ON COLUMN app_users.current_onboarding_step IS 'Active wizard step (1=profile, 2=documents, 3=inventory)';
COMMENT ON COLUMN app_users.coach_mak_conversation_id IS 'Active Coach Mak onboarding chat session reference';

-- Backfill from legacy tier flags
UPDATE app_users
SET onboarding_status = 'FULLY_ONBOARDED',
    current_onboarding_step = NULL
WHERE tier3_complete = TRUE AND onboarding_status = 'NOT_STARTED';

UPDATE app_users
SET onboarding_status = 'STEP_2_COMPLETE',
    current_onboarding_step = COALESCE(current_onboarding_step, 3)
WHERE tier2_complete = TRUE AND tier3_complete = FALSE AND onboarding_status = 'NOT_STARTED';

UPDATE app_users
SET onboarding_status = 'STEP_1_COMPLETE',
    current_onboarding_step = COALESCE(current_onboarding_step, 2)
WHERE tier1_complete = TRUE AND tier2_complete = FALSE AND onboarding_status = 'NOT_STARTED';

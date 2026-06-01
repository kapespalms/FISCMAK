-- FISCMAK v3: Add "Government" to app_users.practice_setting CHECK constraint
-- The TypeScript PRACTICE_SETTINGS constant was extended to include "Government"
-- (VA, DoD, IHS, public health) in BUILD_ORDER 2.2. This migration updates the
-- DB-level CHECK constraint to accept it. Do NOT edit the original schema file.

ALTER TABLE app_users
  DROP CONSTRAINT IF EXISTS app_users_practice_setting_check;

ALTER TABLE app_users
  ADD CONSTRAINT app_users_practice_setting_check
    CHECK (practice_setting IN ('Academic', 'Community', 'Industry', 'Hybrid', 'Government'));

COMMENT ON COLUMN app_users.practice_setting IS
  'Primary practice setting: Academic, Community, Hybrid, Government (VA/DoD/IHS), or Industry';

-- FISCMAK v3: Physician profile additions on app_users
-- Adds O*NET SOC code, FTE allocation (expected/perceived/actual),
-- and Mak memory summary for coaching context

ALTER TABLE app_users
  ADD COLUMN IF NOT EXISTS onet_soc_code VARCHAR(10),
  ADD COLUMN IF NOT EXISTS onet_profile_json JSONB,
  ADD COLUMN IF NOT EXISTS fte_expected JSONB,
  ADD COLUMN IF NOT EXISTS fte_perceived JSONB,
  ADD COLUMN IF NOT EXISTS fte_actual JSONB,
  ADD COLUMN IF NOT EXISTS mak_memory_summary TEXT;

COMMENT ON COLUMN app_users.onet_soc_code IS
  'O*NET Standard Occupational Classification code (e.g. 29-1223 for Psychiatrists)';
COMMENT ON COLUMN app_users.onet_profile_json IS
  'Cached O*NET Work Activities, Skills, and Knowledge profile for this SOC code';
COMMENT ON COLUMN app_users.fte_expected IS
  'Institutional FTE allocation as reported by physician (e.g. {"clinical":0.6,"teaching":0.2,"research":0.1,"admin":0.1})';
COMMENT ON COLUMN app_users.fte_perceived IS
  'What the physician believes the institution expects (8-item structured self-report)';
COMMENT ON COLUMN app_users.fte_actual IS
  'Self-reported actual FTE effort from structured Mak prompts + annual effort report';
COMMENT ON COLUMN app_users.mak_memory_summary IS
  'Coaching theme summary from Mak sessions — never raw transcripts, never institution-facing';

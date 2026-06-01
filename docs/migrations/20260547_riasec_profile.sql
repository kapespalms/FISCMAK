-- FISCMAK v3: RIASEC profile (O*NET Interest Profiler scores per physician)
-- One row per assessment; allows multiple rows per user so changes over time
-- are tracked. Most recent assessed_at is the current profile. Feeds F6
-- Person-Occupation Fit (cosine similarity vs specialty vector) and Coach Mak
-- domain probe ordering. Per Part XXIV + Part V (SOC process).

CREATE TABLE IF NOT EXISTS riasec_profile (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Holland RIASEC scores (O*NET Interest Profiler; range depends on version)
  riasec_r     SMALLINT    NOT NULL CHECK (riasec_r >= 0),
  riasec_i     SMALLINT    NOT NULL CHECK (riasec_i >= 0),
  riasec_a     SMALLINT    NOT NULL CHECK (riasec_a >= 0),
  riasec_s     SMALLINT    NOT NULL CHECK (riasec_s >= 0),
  riasec_e     SMALLINT    NOT NULL CHECK (riasec_e >= 0),
  riasec_c     SMALLINT    NOT NULL CHECK (riasec_c >= 0),

  -- Source distinguishes onboarding Interest Profiler from manual entry
  source       VARCHAR(30) NOT NULL DEFAULT 'onet_interest_profiler'
                 CHECK (source IN ('onet_interest_profiler', 'self_reported', 'imported')),

  assessed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_riasec_profile_user
  ON riasec_profile(user_id);
CREATE INDEX IF NOT EXISTS idx_riasec_profile_user_time
  ON riasec_profile(user_id, assessed_at DESC);

ALTER TABLE riasec_profile ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS riasec_profile_select ON riasec_profile;
DROP POLICY IF EXISTS riasec_profile_insert ON riasec_profile;
DROP POLICY IF EXISTS riasec_profile_update ON riasec_profile;
DROP POLICY IF EXISTS riasec_profile_delete ON riasec_profile;

CREATE POLICY riasec_profile_select ON riasec_profile
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY riasec_profile_insert ON riasec_profile
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY riasec_profile_update ON riasec_profile
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY riasec_profile_delete ON riasec_profile
  FOR DELETE USING (auth.uid() = user_id);

COMMENT ON TABLE riasec_profile IS
  'RIASEC scores per physician from O*NET Interest Profiler. Multiple rows allowed; most recent assessed_at is current.';
COMMENT ON COLUMN riasec_profile.riasec_r IS 'Realistic score (O*NET Interest Profiler)';
COMMENT ON COLUMN riasec_profile.riasec_i IS 'Investigative score';
COMMENT ON COLUMN riasec_profile.riasec_a IS 'Artistic score';
COMMENT ON COLUMN riasec_profile.riasec_s IS 'Social score';
COMMENT ON COLUMN riasec_profile.riasec_e IS 'Enterprising score';
COMMENT ON COLUMN riasec_profile.riasec_c IS 'Conventional score';
COMMENT ON COLUMN riasec_profile.source IS
  'How the profile was obtained: onet_interest_profiler=in-app 60-item form, self_reported=manual, imported=external';

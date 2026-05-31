-- FISCMAK v3: Domain energy rankings
-- One row per user per domain; rank 1 = most energizing, rank 8 = least energizing.
-- Captured during onboarding and updated via Coach Mak. Drives probe order and
-- coaching design (F1 weight = 0.60 per evidence density formula).

CREATE TABLE IF NOT EXISTS energy_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  domain_index SMALLINT NOT NULL CHECK (domain_index BETWEEN 0 AND 7),
  rank SMALLINT NOT NULL CHECK (rank BETWEEN 1 AND 8),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, domain_index)
);

CREATE INDEX IF NOT EXISTS idx_energy_rankings_user
  ON energy_rankings(user_id);

ALTER TABLE energy_rankings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS energy_rankings_select ON energy_rankings;
DROP POLICY IF EXISTS energy_rankings_insert ON energy_rankings;
DROP POLICY IF EXISTS energy_rankings_update ON energy_rankings;
DROP POLICY IF EXISTS energy_rankings_delete ON energy_rankings;

CREATE POLICY energy_rankings_select ON energy_rankings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY energy_rankings_insert ON energy_rankings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY energy_rankings_update ON energy_rankings
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY energy_rankings_delete ON energy_rankings
  FOR DELETE USING (auth.uid() = user_id);

COMMENT ON TABLE energy_rankings IS
  'Physician domain energy rankings (1=most energizing, 8=least). One row per domain per user.';

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

-- FISCMAK v3: Goal records (WOOP + SMART + Implementation Intentions)
-- Separate from ilp_goals (GME-specific). This table serves attending career planning.
-- Three horizon types: 6-month SMART, 1-year SMART+II, 5-year WOOP.

CREATE TABLE IF NOT EXISTS goal_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  horizon VARCHAR(3) NOT NULL CHECK (horizon IN ('6mo', '1yr', '5yr')),
  framework VARCHAR(10) NOT NULL CHECK (framework IN ('SMART', 'SMART_II', 'WOOP')),
  domain_index SMALLINT CHECK (domain_index BETWEEN 0 AND 7),
  track_index SMALLINT CHECK (track_index BETWEEN 0 AND 7),

  -- WOOP fields (5yr goals)
  wish TEXT,
  outcome TEXT,
  obstacle TEXT,
  plan TEXT,

  -- SMART fields (6mo and 1yr goals)
  specific TEXT,
  measurable TEXT,
  achievable TEXT,
  relevant TEXT,
  time_bound TEXT,

  -- Implementation Intention (1yr SMART+II goals)
  implementation_intention TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_goal_records_user
  ON goal_records(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_records_user_horizon
  ON goal_records(user_id, horizon);

ALTER TABLE goal_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS goal_records_select ON goal_records;
DROP POLICY IF EXISTS goal_records_insert ON goal_records;
DROP POLICY IF EXISTS goal_records_update ON goal_records;
DROP POLICY IF EXISTS goal_records_delete ON goal_records;

CREATE POLICY goal_records_select ON goal_records
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY goal_records_insert ON goal_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY goal_records_update ON goal_records
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY goal_records_delete ON goal_records
  FOR DELETE USING (auth.uid() = user_id);

COMMENT ON TABLE goal_records IS
  'Attending career goals: 6mo SMART, 1yr SMART+II, 5yr WOOP. Not GME ILP goals (see ilp_goals).';

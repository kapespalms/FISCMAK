-- GME milestone self-ratings + ILP goals (H3/H6 pilot foundation)
-- Run after 20260530_gme_evaluation_imports.sql

CREATE TABLE IF NOT EXISTS milestone_self_ratings (
  rating_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_users(user_id) ON DELETE CASCADE,
  reporting_period TEXT NOT NULL DEFAULT 'current',
  subcompetency_id TEXT NOT NULL,
  self_level SMALLINT CHECK (self_level BETWEEN 1 AND 5),
  narrative_reflection TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, reporting_period, subcompetency_id)
);

CREATE TABLE IF NOT EXISTS ilp_goals (
  goal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_users(user_id) ON DELETE CASCADE,
  reporting_period TEXT NOT NULL DEFAULT 'current',
  subcompetency_id TEXT,
  goal_text TEXT NOT NULL,
  resources TEXT,
  target_date DATE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'deferred')),
  source TEXT CHECK (source IN ('trainee', 'pd', 'system_draft')),
  created_at TIMESTAMPTZ DEFAULT now(),
  locked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_milestone_self_ratings_user ON milestone_self_ratings(user_id, reporting_period);
CREATE INDEX IF NOT EXISTS idx_ilp_goals_user ON ilp_goals(user_id, reporting_period);

ALTER TABLE milestone_self_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ilp_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS milestone_self_ratings_own ON milestone_self_ratings;
CREATE POLICY milestone_self_ratings_own ON milestone_self_ratings
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS ilp_goals_own ON ilp_goals;
CREATE POLICY ilp_goals_own ON ilp_goals
  FOR ALL USING (auth.uid() = user_id);

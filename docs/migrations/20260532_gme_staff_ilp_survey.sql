-- GME staff ILP policies + pilot coordinator survey
-- Run after 20260531_gme_milestone_ilp.sql

DROP POLICY IF EXISTS ilp_goals_staff_select ON ilp_goals;
CREATE POLICY ilp_goals_staff_select ON ilp_goals
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1
      FROM program_memberships staff
      JOIN app_users trainee ON trainee.user_id = ilp_goals.user_id
      WHERE staff.user_id = auth.uid()
        AND staff.program_id = trainee.primary_program_id
        AND staff.active = true
        AND staff.role IN (
          'program_director',
          'program_coordinator',
          'ccc_chair',
          'dio_viewer'
        )
    )
  );

DROP POLICY IF EXISTS ilp_goals_staff_update ON ilp_goals;
CREATE POLICY ilp_goals_staff_update ON ilp_goals
  FOR UPDATE USING (
    EXISTS (
      SELECT 1
      FROM program_memberships staff
      JOIN app_users trainee ON trainee.user_id = ilp_goals.user_id
      WHERE staff.user_id = auth.uid()
        AND staff.program_id = trainee.primary_program_id
        AND staff.active = true
        AND staff.role IN (
          'program_director',
          'program_coordinator',
          'ccc_chair',
          'dio_viewer'
        )
    )
  );

CREATE TABLE IF NOT EXISTS pilot_coordinator_surveys (
  survey_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(program_id) ON DELETE CASCADE,
  submitted_by UUID REFERENCES app_users(user_id) ON DELETE SET NULL,
  prep_minutes_manual SMALLINT CHECK (prep_minutes_manual >= 0),
  prep_minutes_fiscmak SMALLINT CHECK (prep_minutes_fiscmak >= 0),
  percent_time_saved SMALLINT CHECK (percent_time_saved BETWEEN 0 AND 100),
  would_recommend BOOLEAN,
  notes TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pilot_coordinator_surveys_program
  ON pilot_coordinator_surveys(program_id, submitted_at DESC);

ALTER TABLE pilot_coordinator_surveys ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS pilot_coordinator_surveys_staff ON pilot_coordinator_surveys;
CREATE POLICY pilot_coordinator_surveys_staff ON pilot_coordinator_surveys
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM program_memberships pm
      WHERE pm.user_id = auth.uid()
        AND pm.program_id = pilot_coordinator_surveys.program_id
        AND pm.active = true
        AND pm.role IN (
          'program_director',
          'program_coordinator',
          'ccc_chair',
          'dio_viewer'
        )
    )
  );

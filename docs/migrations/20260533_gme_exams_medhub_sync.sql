-- In-training exams (PRITE pilot) + MedHub sync status log
-- Run after 20260532_gme_staff_ilp_survey.sql

CREATE TABLE IF NOT EXISTS in_training_exams (
  exam_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES programs(program_id) ON DELETE CASCADE,
  trainee_user_id UUID NOT NULL REFERENCES app_users(user_id) ON DELETE CASCADE,
  exam_type TEXT NOT NULL DEFAULT 'PRITE',
  exam_year INT NOT NULL,
  overall_percentile SMALLINT CHECK (overall_percentile BETWEEN 0 AND 99),
  domain_scores JSONB DEFAULT '{}'::jsonb,
  imported_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (trainee_user_id, exam_type, exam_year)
);

CREATE TABLE IF NOT EXISTS medhub_sync_runs (
  sync_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(program_id) ON DELETE CASCADE,
  triggered_by UUID REFERENCES app_users(user_id),
  status TEXT NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed', 'not_configured')),
  detail JSONB DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ DEFAULT now(),
  finished_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_in_training_exams_program ON in_training_exams(program_id, exam_year DESC);
CREATE INDEX IF NOT EXISTS idx_medhub_sync_runs_program ON medhub_sync_runs(program_id, started_at DESC);

ALTER TABLE in_training_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE medhub_sync_runs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS in_training_exams_own ON in_training_exams;
CREATE POLICY in_training_exams_own ON in_training_exams
  FOR SELECT USING (auth.uid() = trainee_user_id);

DROP POLICY IF EXISTS in_training_exams_staff ON in_training_exams;
CREATE POLICY in_training_exams_staff ON in_training_exams
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM program_memberships pm
      WHERE pm.user_id = auth.uid()
        AND pm.program_id = in_training_exams.program_id
        AND pm.active = true
        AND pm.role IN (
          'program_director',
          'program_coordinator',
          'ccc_chair',
          'dio_viewer'
        )
    )
  );

DROP POLICY IF EXISTS medhub_sync_runs_staff ON medhub_sync_runs;
CREATE POLICY medhub_sync_runs_staff ON medhub_sync_runs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM program_memberships pm
      WHERE pm.user_id = auth.uid()
        AND pm.program_id = medhub_sync_runs.program_id
        AND pm.active = true
        AND pm.role IN (
          'program_director',
          'program_coordinator',
          'ccc_chair',
          'dio_viewer'
        )
    )
  );

-- GME evaluation imports + rotation evaluations (H4 pilot foundation)
-- Run after 20260525_gme_programs.sql

CREATE TABLE IF NOT EXISTS evaluation_imports (
  import_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(program_id) ON DELETE CASCADE,
  source TEXT NOT NULL CHECK (source IN ('medhub_api', 'medhub_csv', 'new_innovations_csv', 'ads_csv', 'simpl_csv', 'manual')),
  uploaded_by UUID REFERENCES app_users(user_id),
  file_name TEXT,
  row_count INT,
  mapping_snapshot JSONB DEFAULT '{}'::jsonb,
  quality_report JSONB DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  imported_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS rotation_evaluations (
  eval_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_id UUID REFERENCES evaluation_imports(import_id) ON DELETE SET NULL,
  program_id UUID NOT NULL REFERENCES programs(program_id) ON DELETE CASCADE,
  trainee_user_id UUID REFERENCES app_users(user_id) ON DELETE SET NULL,
  resident_external_id TEXT,
  trainee_initials TEXT,
  form_name TEXT,
  form_version TEXT,
  rotation_name TEXT,
  pgy_level TEXT,
  eval_date DATE,
  supervisor_name TEXT,
  numeric_scores JSONB DEFAULT '{}'::jsonb,
  narrative_text TEXT,
  raw_row JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_evaluation_imports_program ON evaluation_imports(program_id, imported_at DESC);
CREATE INDEX IF NOT EXISTS idx_rotation_evaluations_program ON rotation_evaluations(program_id, eval_date DESC);
CREATE INDEX IF NOT EXISTS idx_rotation_evaluations_trainee ON rotation_evaluations(trainee_user_id, eval_date DESC);
CREATE INDEX IF NOT EXISTS idx_rotation_evaluations_initials ON rotation_evaluations(program_id, trainee_initials);

ALTER TABLE evaluation_imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE rotation_evaluations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS rotation_evaluations_select_own ON rotation_evaluations;
CREATE POLICY rotation_evaluations_select_own ON rotation_evaluations
  FOR SELECT USING (auth.uid() = trainee_user_id);

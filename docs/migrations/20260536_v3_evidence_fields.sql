-- FISCMAK v3: Evidence unit fields on activity_entries
-- Adds recognition_quadrant (OV/OI/SV/SI), energy_score (1-5), sentiment (NLP),
-- transfer_targets (artifact suggestions), and time_class (past/current/scheduled)

ALTER TABLE activity_entries
  ADD COLUMN IF NOT EXISTS recognition_quadrant VARCHAR(2)
    CHECK (recognition_quadrant IN ('OV', 'OI', 'SV', 'SI')),
  ADD COLUMN IF NOT EXISTS energy_score SMALLINT
    CHECK (energy_score BETWEEN 1 AND 5),
  ADD COLUMN IF NOT EXISTS sentiment FLOAT
    CHECK (sentiment BETWEEN -1 AND 1),
  ADD COLUMN IF NOT EXISTS transfer_targets JSONB,
  ADD COLUMN IF NOT EXISTS time_class VARCHAR(10)
    CHECK (time_class IN ('past', 'current', 'scheduled'));

CREATE INDEX IF NOT EXISTS idx_activity_entries_recognition_quadrant
  ON activity_entries(user_id, recognition_quadrant);

CREATE INDEX IF NOT EXISTS idx_activity_entries_time_class
  ON activity_entries(user_id, time_class);

COMMENT ON COLUMN activity_entries.recognition_quadrant IS
  'OV=Objective-Visible, OI=Objective-Invisible, SV=Subjective-Visible, SI=Subjective-Invisible';
COMMENT ON COLUMN activity_entries.energy_score IS
  'Domain energy rating from physician ranking (1=very draining, 5=very energizing)';
COMMENT ON COLUMN activity_entries.sentiment IS
  'NLP-derived sentiment [-1, +1]; null until processed';
COMMENT ON COLUMN activity_entries.transfer_targets IS
  'Array of suggested artifact types this evidence could populate (e.g. ["cv","promotion_dossier"])';
COMMENT ON COLUMN activity_entries.time_class IS
  'Temporal classification: past=historical, current=ongoing, scheduled=future';

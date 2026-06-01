-- FISCMAK v3: Evidence unit (canonical v3 evidence store)
-- Standalone table per Part XXIV schema. Captures parsed CV lines, Mak probe
-- responses, and manual entries after physician confirmation. Drives F1
-- (Evidence Density), the 8×8 lattice heat map, and the 2×2 quadrant summary.
-- Does NOT replace activity_entries — that table continues to serve Mak capture
-- and the v2 pipeline. evidence_unit is the confirmed, lattice-ready layer.

CREATE TABLE IF NOT EXISTS evidence_unit (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Lattice coordinates (domain 0–7, track 0–7 per Part IV)
  domain_index         SMALLINT    NOT NULL CHECK (domain_index BETWEEN 0 AND 7),
  track_index          SMALLINT    CHECK (track_index BETWEEN 0 AND 7),

  -- Core classification (Part XXIV)
  recognition_quadrant VARCHAR(2)  NOT NULL CHECK (recognition_quadrant IN ('OV', 'OI', 'SV', 'SI')),
  energy_score         SMALLINT    CHECK (energy_score BETWEEN 1 AND 5),
  sentiment            FLOAT       CHECK (sentiment BETWEEN -1 AND 1),
  transfer_targets     JSONB,
  time_class           VARCHAR(10) CHECK (time_class IN ('past', 'current', 'scheduled')),

  -- Evidence content
  raw_text             TEXT,
  physician_confirmed  BOOLEAN     NOT NULL DEFAULT FALSE,

  -- Optional back-link to CV-pipeline source (activity_entries exists prior to this migration)
  source_activity_id   UUID        REFERENCES activity_entries(id) ON DELETE SET NULL,
  -- source_narrative_id deferred: FK to narrative_evidence added in a later migration
  -- once that table is confirmed present in the target database.

  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evidence_unit_user
  ON evidence_unit(user_id);
CREATE INDEX IF NOT EXISTS idx_evidence_unit_user_quadrant
  ON evidence_unit(user_id, recognition_quadrant);
CREATE INDEX IF NOT EXISTS idx_evidence_unit_user_domain
  ON evidence_unit(user_id, domain_index);
CREATE INDEX IF NOT EXISTS idx_evidence_unit_user_confirmed
  ON evidence_unit(user_id, physician_confirmed);

ALTER TABLE evidence_unit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS evidence_unit_select ON evidence_unit;
DROP POLICY IF EXISTS evidence_unit_insert ON evidence_unit;
DROP POLICY IF EXISTS evidence_unit_update ON evidence_unit;
DROP POLICY IF EXISTS evidence_unit_delete ON evidence_unit;

CREATE POLICY evidence_unit_select ON evidence_unit
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY evidence_unit_insert ON evidence_unit
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY evidence_unit_update ON evidence_unit
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY evidence_unit_delete ON evidence_unit
  FOR DELETE USING (auth.uid() = user_id);

COMMENT ON TABLE evidence_unit IS
  'Canonical v3 evidence store. Confirmed, lattice-ready evidence rows per Part XXIV.';
COMMENT ON COLUMN evidence_unit.recognition_quadrant IS
  'OV=Objective-Visible, OI=Objective-Invisible, SV=Subjective-Visible, SI=Subjective-Invisible';
COMMENT ON COLUMN evidence_unit.energy_score IS
  'Physician domain energy rating (1=very draining, 5=very energizing)';
COMMENT ON COLUMN evidence_unit.sentiment IS
  'NLP-derived sentiment [-1, +1]; null until pipeline processes raw_text';
COMMENT ON COLUMN evidence_unit.transfer_targets IS
  'Suggested artifact types this evidence could populate (e.g. ["cv","promotion_dossier"])';
COMMENT ON COLUMN evidence_unit.time_class IS
  'Temporal class: past=historical, current=ongoing, scheduled=future';
COMMENT ON COLUMN evidence_unit.physician_confirmed IS
  'True once the physician has reviewed and accepted this evidence unit';
COMMENT ON COLUMN evidence_unit.source_activity_id IS
  'Back-link to activity_entries if originated from CV pipeline';

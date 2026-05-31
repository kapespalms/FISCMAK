-- FISCMAK v3: Narrative evidence (Coach Mak SI probe responses)
-- Stores physician responses to adaptive Subjective-Invisible probes.
-- Never institution-facing. distress_flag triggers resource link only — never auto-report.

CREATE TABLE IF NOT EXISTS narrative_evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  domain_index SMALLINT NOT NULL CHECK (domain_index BETWEEN 0 AND 7),
  question_index SMALLINT NOT NULL CHECK (question_index BETWEEN 0 AND 7),
  response_text TEXT NOT NULL,
  distress_flag BOOLEAN NOT NULL DEFAULT FALSE,
  energy_signal SMALLINT CHECK (energy_signal BETWEEN 1 AND 5),
  invisible_work_flag BOOLEAN NOT NULL DEFAULT FALSE,
  mak_session_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_narrative_evidence_user
  ON narrative_evidence(user_id);
CREATE INDEX IF NOT EXISTS idx_narrative_evidence_user_domain
  ON narrative_evidence(user_id, domain_index);
CREATE INDEX IF NOT EXISTS idx_narrative_evidence_distress
  ON narrative_evidence(user_id, distress_flag) WHERE distress_flag = TRUE;

ALTER TABLE narrative_evidence ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS narrative_evidence_select ON narrative_evidence;
DROP POLICY IF EXISTS narrative_evidence_insert ON narrative_evidence;
DROP POLICY IF EXISTS narrative_evidence_update ON narrative_evidence;
DROP POLICY IF EXISTS narrative_evidence_delete ON narrative_evidence;

CREATE POLICY narrative_evidence_select ON narrative_evidence
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY narrative_evidence_insert ON narrative_evidence
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY narrative_evidence_update ON narrative_evidence
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY narrative_evidence_delete ON narrative_evidence
  FOR DELETE USING (auth.uid() = user_id);

COMMENT ON TABLE narrative_evidence IS
  'Coach Mak SI probe responses. Never institution-facing. distress_flag=true shows resource link only.';
COMMENT ON COLUMN narrative_evidence.distress_flag IS
  'Set when response signals distress (MDT threshold or keyword pattern). Triggers resource link — never auto-reported.';
COMMENT ON COLUMN narrative_evidence.energy_signal IS
  'Physician-rated energy for this response (1=very draining, 5=very energizing)';
COMMENT ON COLUMN narrative_evidence.invisible_work_flag IS
  'Set when response describes work that is not captured in any institutional system';

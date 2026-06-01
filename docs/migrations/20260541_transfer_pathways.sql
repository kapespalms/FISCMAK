-- FISCMAK v3: Transfer pathways
-- Routes invisible/unrecognized work (SI/OI cells) toward visible career artifacts.
-- Implements Formula 7 (Transfer Potential). Depends on narrative_evidence (20260540).

CREATE TABLE IF NOT EXISTS transfer_pathways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_narrative_id UUID REFERENCES narrative_evidence(id) ON DELETE SET NULL,
  finding TEXT NOT NULL,
  target_quadrant SMALLINT CHECK (target_quadrant BETWEEN 1 AND 4),
  suggested_artifact VARCHAR(50),
  action TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'proposed'
    CHECK (status IN ('proposed', 'in_progress', 'complete', 'dismissed')),
  priority SMALLINT NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transfer_pathways_user
  ON transfer_pathways(user_id);
CREATE INDEX IF NOT EXISTS idx_transfer_pathways_user_status
  ON transfer_pathways(user_id, status);
CREATE INDEX IF NOT EXISTS idx_transfer_pathways_source
  ON transfer_pathways(source_narrative_id);

ALTER TABLE transfer_pathways ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS transfer_pathways_select ON transfer_pathways;
DROP POLICY IF EXISTS transfer_pathways_insert ON transfer_pathways;
DROP POLICY IF EXISTS transfer_pathways_update ON transfer_pathways;
DROP POLICY IF EXISTS transfer_pathways_delete ON transfer_pathways;

CREATE POLICY transfer_pathways_select ON transfer_pathways
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY transfer_pathways_insert ON transfer_pathways
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY transfer_pathways_update ON transfer_pathways
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY transfer_pathways_delete ON transfer_pathways
  FOR DELETE USING (auth.uid() = user_id);

COMMENT ON TABLE transfer_pathways IS
  'F7 Transfer Potential: routes SI/OI evidence toward visible career artifacts. Physician-initiated only.';
COMMENT ON COLUMN transfer_pathways.target_quadrant IS
  '1=OV, 2=OI, 3=SV, 4=SI — target recognition quadrant for this transfer';
COMMENT ON COLUMN transfer_pathways.suggested_artifact IS
  'Output type suggestion (e.g. cv_bullet, promotion_narrative, teaching_portfolio_entry)';

-- FISCMAK v3: evidence_cell_weights — multi-domain lattice distribution
-- Stores the per-cell weight distribution for each evidence_unit.
-- One row per cell an item touches; weights normalize to 1.0 per item.
-- Cap rule (application layer): top ~3 cells, min weight 0.15.
-- evidence_unit keeps its primary domain_index/track_index; this table holds
-- the full distribution for F1 density and lattice rendering.
-- Per §8.2 of FISCMAK_Invisible_Work_Capture_Spec.md (resolved 2026-06-01).
-- Founder-gated migration. Do NOT run directly.

CREATE TABLE IF NOT EXISTS evidence_cell_weights (
  id                   UUID       PRIMARY KEY DEFAULT gen_random_uuid(),
  evidence_unit_id     UUID       NOT NULL REFERENCES evidence_unit(id) ON DELETE CASCADE,
  -- user_id denormalized from evidence_unit for fast RLS and F1 GROUP BY
  user_id              UUID       NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  domain_index         SMALLINT   NOT NULL CHECK (domain_index BETWEEN 0 AND 7),
  track_index          SMALLINT   NOT NULL CHECK (track_index BETWEEN 0 AND 7),
  -- weight ∈ (0, 1]; all weights for one evidence_unit normalize to 1.0
  weight               FLOAT      NOT NULL CHECK (weight > 0 AND weight <= 1),
  recognition_quadrant VARCHAR(2) NOT NULL CHECK (recognition_quadrant IN ('OV', 'OI', 'SV', 'SI')),

  -- one row per (evidence_unit, cell)
  UNIQUE (evidence_unit_id, domain_index, track_index)
);

-- F1 density query: SELECT domain_index, track_index, SUM(weight)
--   FROM evidence_cell_weights WHERE user_id = $1
--   GROUP BY domain_index, track_index
CREATE INDEX IF NOT EXISTS idx_ecw_f1_density
  ON evidence_cell_weights(user_id, domain_index, track_index);

-- Integrity / cascade-delete lookups
CREATE INDEX IF NOT EXISTS idx_ecw_evidence_unit
  ON evidence_cell_weights(evidence_unit_id);

ALTER TABLE evidence_cell_weights ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ecw_select ON evidence_cell_weights;
DROP POLICY IF EXISTS ecw_insert ON evidence_cell_weights;
DROP POLICY IF EXISTS ecw_update ON evidence_cell_weights;
DROP POLICY IF EXISTS ecw_delete ON evidence_cell_weights;

CREATE POLICY ecw_select ON evidence_cell_weights
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY ecw_insert ON evidence_cell_weights
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY ecw_update ON evidence_cell_weights
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY ecw_delete ON evidence_cell_weights
  FOR DELETE USING (auth.uid() = user_id);

COMMENT ON TABLE evidence_cell_weights IS
  'Per-cell weight distribution for each evidence_unit. F1 density = SUM(weight) GROUP BY domain/track per user. Weights normalize to 1.0 per evidence_unit; cap ~3 cells, min weight 0.15 enforced at application layer.';
COMMENT ON COLUMN evidence_cell_weights.weight IS
  'Fractional weight of this cell in the evidence_unit distribution (0 < weight ≤ 1; all rows for one unit sum to 1.0)';
COMMENT ON COLUMN evidence_cell_weights.recognition_quadrant IS
  'OV=Objective-Visible, OI=Objective-Invisible, SV=Subjective-Visible, SI=Subjective-Invisible';
COMMENT ON COLUMN evidence_cell_weights.user_id IS
  'Denormalized from evidence_unit for RLS and F1 GROUP BY performance; must equal evidence_unit.user_id';

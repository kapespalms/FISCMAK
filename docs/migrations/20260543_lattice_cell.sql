-- FISCMAK v3: Lattice cell (8×8 career lattice per physician)
-- One row per (user, domain, track) intersection. Stores computed flags and
-- scores that drive the heat-map visualization (Part XVII) and Formula 7
-- (Transfer Potential). Populated by the intelligence layer after evidence_unit
-- rows are confirmed — not written directly by the physician.
-- Depends on evidence_unit (20260542).

CREATE TABLE IF NOT EXISTS lattice_cell (
  id                       UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                  UUID     NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Lattice coordinates (domain 0–7, track 0–7 per Part IV)
  domain_index             SMALLINT NOT NULL CHECK (domain_index BETWEEN 0 AND 7),
  track_index              SMALLINT NOT NULL CHECK (track_index BETWEEN 0 AND 7),

  -- Computed fields (Part XXIV)
  fte_discrepancy_flag     BOOLEAN  NOT NULL DEFAULT FALSE,
  transfer_potential_score FLOAT    CHECK (transfer_potential_score BETWEEN 0 AND 1),

  updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (user_id, domain_index, track_index)
);

CREATE INDEX IF NOT EXISTS idx_lattice_cell_user
  ON lattice_cell(user_id);
CREATE INDEX IF NOT EXISTS idx_lattice_cell_user_domain
  ON lattice_cell(user_id, domain_index);
CREATE INDEX IF NOT EXISTS idx_lattice_cell_fte_flag
  ON lattice_cell(user_id, fte_discrepancy_flag) WHERE fte_discrepancy_flag = TRUE;

ALTER TABLE lattice_cell ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS lattice_cell_select ON lattice_cell;
DROP POLICY IF EXISTS lattice_cell_insert ON lattice_cell;
DROP POLICY IF EXISTS lattice_cell_update ON lattice_cell;
DROP POLICY IF EXISTS lattice_cell_delete ON lattice_cell;

CREATE POLICY lattice_cell_select ON lattice_cell
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY lattice_cell_insert ON lattice_cell
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY lattice_cell_update ON lattice_cell
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY lattice_cell_delete ON lattice_cell
  FOR DELETE USING (auth.uid() = user_id);

COMMENT ON TABLE lattice_cell IS
  '8×8 career lattice cells per physician. Computed by the intelligence layer; not physician-entered.';
COMMENT ON COLUMN lattice_cell.fte_discrepancy_flag IS
  'True when actual FTE in this cell deviates from setting-normed expectation (F3 Structural Discrepancy)';
COMMENT ON COLUMN lattice_cell.transfer_potential_score IS
  'F7 Transfer Potential score [0, 1] — likelihood this SI/OI cell can be routed to a visible artifact';

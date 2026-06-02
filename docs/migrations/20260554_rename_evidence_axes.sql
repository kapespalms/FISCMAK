-- FISCMAK v3: Rename evidence-table axes to match canonical vocabulary
-- BEFORE: domain_index = skill axis (Clinical Expertise…); track_index = identity axis (Clinician…)
-- AFTER:  skill_index  = skill axis; domain_index = identity axis (Clinician…)
--
-- evidence_unit, evidence_cell_weights, lattice_cell only.
-- energy_rankings, narrative_evidence, goal_records keep domain_index unchanged —
-- those tables always used the identity ordering and are already correct.
--
-- Founder-gated. Do NOT run directly — apply via npm run db:migrate.
-- This rename is safe on v3-build: none of these tables exist on origin/main.

-- evidence_unit
ALTER TABLE evidence_unit RENAME COLUMN domain_index TO skill_index;
ALTER TABLE evidence_unit RENAME COLUMN track_index  TO domain_index;

-- Update CHECK constraints (Postgres names them by table+column automatically)
ALTER TABLE evidence_unit DROP CONSTRAINT IF EXISTS evidence_unit_skill_index_check;
ALTER TABLE evidence_unit DROP CONSTRAINT IF EXISTS evidence_unit_domain_index_check;
ALTER TABLE evidence_unit
  ADD CONSTRAINT evidence_unit_skill_index_check  CHECK (skill_index  BETWEEN 0 AND 7),
  ADD CONSTRAINT evidence_unit_domain_index_check CHECK (domain_index BETWEEN 0 AND 7);

-- Update indexes
DROP INDEX IF EXISTS idx_evidence_unit_user_domain;
CREATE INDEX IF NOT EXISTS idx_evidence_unit_user_skill
  ON evidence_unit(user_id, skill_index);
CREATE INDEX IF NOT EXISTS idx_evidence_unit_user_domain
  ON evidence_unit(user_id, domain_index);

-- Update comments
COMMENT ON COLUMN evidence_unit.skill_index  IS
  'Skill/task axis (0–7): indexes SKILLS array (Clinical Expertise…Personal & Prof. Dev.)';
COMMENT ON COLUMN evidence_unit.domain_index IS
  'Domain identity axis (0–7): indexes DOMAINS array (Clinician…Wellness Champion)';

-- evidence_cell_weights
ALTER TABLE evidence_cell_weights RENAME COLUMN domain_index TO skill_index;
ALTER TABLE evidence_cell_weights RENAME COLUMN track_index  TO domain_index;

ALTER TABLE evidence_cell_weights DROP CONSTRAINT IF EXISTS evidence_cell_weights_skill_index_check;
ALTER TABLE evidence_cell_weights DROP CONSTRAINT IF EXISTS evidence_cell_weights_domain_index_check;
ALTER TABLE evidence_cell_weights
  ADD CONSTRAINT evidence_cell_weights_skill_index_check  CHECK (skill_index  BETWEEN 0 AND 7),
  ADD CONSTRAINT evidence_cell_weights_domain_index_check CHECK (domain_index BETWEEN 0 AND 7);

DROP INDEX IF EXISTS idx_ecw_f1_density;
DROP INDEX IF EXISTS idx_ecw_evidence_unit;
CREATE INDEX IF NOT EXISTS idx_ecw_f1_density
  ON evidence_cell_weights(user_id, domain_index, skill_index);
CREATE INDEX IF NOT EXISTS idx_ecw_evidence_unit
  ON evidence_cell_weights(evidence_unit_id);
CREATE UNIQUE INDEX IF NOT EXISTS evidence_cell_weights_evidence_unit_id_domain_index_skill_index_key
  ON evidence_cell_weights(evidence_unit_id, domain_index, skill_index);

COMMENT ON COLUMN evidence_cell_weights.skill_index  IS
  'Skill/task axis (0–7): indexes SKILLS array';
COMMENT ON COLUMN evidence_cell_weights.domain_index IS
  'Domain identity axis (0–7): indexes DOMAINS array';

-- lattice_cell
ALTER TABLE lattice_cell RENAME COLUMN domain_index TO skill_index;
ALTER TABLE lattice_cell RENAME COLUMN track_index  TO domain_index;

ALTER TABLE lattice_cell DROP CONSTRAINT IF EXISTS lattice_cell_skill_index_check;
ALTER TABLE lattice_cell DROP CONSTRAINT IF EXISTS lattice_cell_domain_index_check;
ALTER TABLE lattice_cell
  ADD CONSTRAINT lattice_cell_skill_index_check  CHECK (skill_index  BETWEEN 0 AND 7),
  ADD CONSTRAINT lattice_cell_domain_index_check CHECK (domain_index BETWEEN 0 AND 7);

DROP INDEX IF EXISTS idx_lattice_cell_user_domain;
CREATE INDEX IF NOT EXISTS idx_lattice_cell_user_skill
  ON lattice_cell(user_id, skill_index);
CREATE INDEX IF NOT EXISTS idx_lattice_cell_user_domain
  ON lattice_cell(user_id, domain_index);

COMMENT ON COLUMN lattice_cell.skill_index  IS
  'Skill/task axis (0–7): indexes SKILLS array';
COMMENT ON COLUMN lattice_cell.domain_index IS
  'Domain identity axis (0–7): indexes DOMAINS array';

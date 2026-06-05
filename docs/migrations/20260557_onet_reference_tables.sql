-- ⚠️  FLAG — FOUNDER APPROVAL REQUIRED BEFORE RUNNING
-- These tables are optional reference storage for the full O*NET 30.3 database.
-- The O*NET Engine (src/lib/v2/onet-engine.ts) works from precomputed TypeScript
-- seed constants without needing these tables. Create them if you want to query
-- raw O*NET data from Supabase or load specialty_config.onet_descriptors at scale.
--
-- Attribution: O*NET 30.3 Database, U.S. DOL/ETA, CC-BY 4.0.
-- https://www.onetcenter.org/license_db.html

-- O*NET descriptor catalog (243 descriptors in FISCMAK 30.3 build)
CREATE TABLE IF NOT EXISTS onet_descriptor (
  idx         SMALLINT    PRIMARY KEY,
  element_id  VARCHAR(20) NOT NULL UNIQUE,
  title       TEXT        NOT NULL,
  category    VARCHAR(30) NOT NULL
    CHECK (category IN ('Abilities','Knowledge','WorkActivities','WorkContext',
                        'WorkStyles','EssentialSkills','TransferableSkills','RIASEC'))
);

COMMENT ON TABLE onet_descriptor IS
  'O*NET 30.3 descriptor catalog (243 items). Indexed 0–242 in fixed category order.';

-- Per-SOC normalized descriptor vectors (optional; seed data lives in TS constants)
CREATE TABLE IF NOT EXISTS onet_occupation (
  soc_code         VARCHAR(12) PRIMARY KEY,
  title            TEXT        NOT NULL,
  job_zone         SMALLINT    NOT NULL CHECK (job_zone BETWEEN 1 AND 5),
  descriptor_vector FLOAT[],   -- length = 243, normalized 0–1, same index as onet_descriptor.idx
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE onet_occupation IS
  'O*NET 30.3 per-SOC normalized descriptor vectors. Populated via load-onet-seed script.';
COMMENT ON COLUMN onet_occupation.descriptor_vector IS
  '243-element normalized O*NET descriptor vector (0–1). NULL until seed is loaded.';

-- RLS: authenticated read only; writes via service role
ALTER TABLE onet_descriptor ENABLE ROW LEVEL SECURITY;
ALTER TABLE onet_occupation  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS onet_descriptor_select ON onet_descriptor;
DROP POLICY IF EXISTS onet_occupation_select  ON onet_occupation;

CREATE POLICY onet_descriptor_select ON onet_descriptor
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY onet_occupation_select ON onet_occupation
  FOR SELECT USING (auth.role() = 'authenticated');

-- NOT registered in apply-supabase-migrations.mjs — apply only after founder review.

-- ACGME milestone taxonomy: frameworks, subcompetencies, MedHub crosswalk
-- Run after 20260531_gme_milestone_ilp.sql (creates milestone_self_ratings)
-- Data is loaded separately by scripts/seed-acgme-taxonomy.mjs (founder-gated)

-- ---------------------------------------------------------------------------
-- 1. acgme_frameworks
--    One row per ACGME specialty/subspecialty program.
--    Status: seeded = full subcompetency data present
--            catalog_only = framework metadata only, no subcompetency rows
--            universal_only = only the 6 core competencies apply
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS acgme_frameworks (
  framework_id           UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                   TEXT  UNIQUE NOT NULL,
  name                   TEXT  NOT NULL,
  program_type           TEXT  NOT NULL CHECK (program_type IN ('primary','subspecialty')),
  parent_slug            TEXT,
  status                 TEXT  NOT NULL
    CHECK (status IN ('seeded','catalog_only','universal_only')),
  milestone_version      TEXT,
  citation_url           TEXT,
  supplemental_guide_url TEXT,
  created_at             TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_acgme_frameworks_status
  ON acgme_frameworks(status);

CREATE INDEX IF NOT EXISTS idx_acgme_frameworks_parent
  ON acgme_frameworks(parent_slug);

-- Shared read-only reference data — no per-user rows
ALTER TABLE acgme_frameworks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS acgme_frameworks_authenticated_read ON acgme_frameworks;
CREATE POLICY acgme_frameworks_authenticated_read ON acgme_frameworks
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- 2. acgme_subcompetencies
--    One row per subcompetency per framework. TEXT PK matches the string keys
--    already stored in milestone_self_ratings.subcompetency_id.
--    lattice_skill_index: maps acgme_competency_key to the 8 FISCMAK SKILLS
--      pc=0 mk=1 pbli=2 ics=3(comm)/6(collab) prof=4(ethics)/7(ppd) sbp=5
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS acgme_subcompetencies (
  subcompetency_id      TEXT     PRIMARY KEY,
  framework_slug        TEXT     NOT NULL REFERENCES acgme_frameworks(slug),
  number                SMALLINT NOT NULL,
  name                  TEXT     NOT NULL,
  acgme_competency_key  TEXT     NOT NULL
    CHECK (acgme_competency_key IN ('pc','mk','pbli','ics','prof','sbp')),
  lattice_skill_index   SMALLINT NOT NULL
    CHECK (lattice_skill_index BETWEEN 0 AND 7),
  level_anchors         JSONB,
  medhub_form_flag      BOOLEAN  NOT NULL DEFAULT false,
  created_at            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_acgme_subcomp_framework
  ON acgme_subcompetencies(framework_slug);

CREATE INDEX IF NOT EXISTS idx_acgme_subcomp_skill
  ON acgme_subcompetencies(lattice_skill_index);

CREATE INDEX IF NOT EXISTS idx_acgme_subcomp_competency
  ON acgme_subcompetencies(acgme_competency_key);

ALTER TABLE acgme_subcompetencies ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS acgme_subcompetencies_authenticated_read ON acgme_subcompetencies;
CREATE POLICY acgme_subcompetencies_authenticated_read ON acgme_subcompetencies
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- 3. medhub_milestone_crosswalk
--    Maps MedHub CSV column keys to subcompetency IDs.
--    Psychiatry (14 rows) is seeded; scaffold for future specialties.
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS medhub_milestone_crosswalk (
  crosswalk_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_slug     TEXT NOT NULL REFERENCES acgme_frameworks(slug),
  medhub_column_key  TEXT NOT NULL,
  subcompetency_id   TEXT NOT NULL REFERENCES acgme_subcompetencies(subcompetency_id),
  UNIQUE (framework_slug, medhub_column_key)
);

CREATE INDEX IF NOT EXISTS idx_medhub_crosswalk_framework
  ON medhub_milestone_crosswalk(framework_slug);

ALTER TABLE medhub_milestone_crosswalk ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS medhub_crosswalk_authenticated_read ON medhub_milestone_crosswalk;
CREATE POLICY medhub_crosswalk_authenticated_read ON medhub_milestone_crosswalk
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- 4. Add lattice_skill_index to milestone_self_ratings
--    Enables direct JOIN-free rollup from ratings to the 8×8 lattice.
--    Backfilled by seed script after acgme_subcompetencies is populated.
-- ---------------------------------------------------------------------------

ALTER TABLE milestone_self_ratings
  ADD COLUMN IF NOT EXISTS lattice_skill_index SMALLINT
    CHECK (lattice_skill_index BETWEEN 0 AND 7);

CREATE INDEX IF NOT EXISTS idx_msr_lattice_skill
  ON milestone_self_ratings(user_id, lattice_skill_index)
  WHERE lattice_skill_index IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Comments
-- ---------------------------------------------------------------------------

COMMENT ON TABLE acgme_frameworks IS
  'ACGME specialty/subspecialty framework registry (Appendix B 2024-2025). '
  'Seeded from docs/seeds/acgme/milestone_frameworks.json + program_milestones_index.json. '
  'Loaded by scripts/seed-acgme-taxonomy.mjs.';

COMMENT ON TABLE acgme_subcompetencies IS
  'ACGME Milestones 2.0 subcompetency definitions. '
  'lattice_skill_index maps each subcompetency to FISCMAK SKILLS (0–7). '
  'level_anchors JSONB: {level_1:[...], ..., level_5:[...]}. '
  'Loaded by scripts/seed-acgme-taxonomy.mjs.';

COMMENT ON TABLE medhub_milestone_crosswalk IS
  'Maps MedHub CSV milestone column keys (e.g. psych_milestone_01) to subcompetency_id. '
  'Psychiatry seeded (14 rows); extend per specialty as MedHub forms are mapped.';

COMMENT ON COLUMN milestone_self_ratings.lattice_skill_index IS
  'Denormalized from acgme_subcompetencies.lattice_skill_index for fast lattice rollup. '
  'NULL on pre-migration rows; backfilled by seed script.';

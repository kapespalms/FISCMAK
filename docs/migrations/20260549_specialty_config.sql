-- FISCMAK v3: Specialty config (per-SOC reference data)
-- One row per physician specialty (SOC code). Admin-loaded via service role;
-- not physician-editable. Stores the 6 JSON config artifacts per Part XII:
-- onet_descriptors, acgme_milestones, crosswalk, adjacent_socs,
-- activity_ontology, setting_modifiers.
-- RLS: authenticated users may SELECT; writes require service role (no user
-- write policies). Per Part XXIV + Part XII.

CREATE TABLE IF NOT EXISTS specialty_config (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  soc_code            VARCHAR(10) NOT NULL UNIQUE,

  -- Human-readable label (e.g. "General Psychiatry")
  specialty_name      VARCHAR(100),

  -- 6 JSON config cols per Part XII
  onet_descriptors    JSONB,  -- O*NET descriptor weights for this specialty
  acgme_milestones    JSONB,  -- ACGME milestone set mapped to domains/tracks
  crosswalk           JSONB,  -- FISCMAK ↔ O*NET ↔ ACGME ↔ Rosetta crosswalk
  adjacent_socs       JSONB,  -- Adjacent SOC codes + similarity weights
  activity_ontology   JSONB,  -- Specialty-specific activity ontology (~200 entries)
  setting_modifiers   JSONB,  -- Clinical-setting FTE modifier table (Part XVI)

  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_specialty_config_soc
  ON specialty_config(soc_code);

ALTER TABLE specialty_config ENABLE ROW LEVEL SECURITY;

-- Physicians can read any specialty config; only service role may write.
DROP POLICY IF EXISTS specialty_config_select ON specialty_config;
CREATE POLICY specialty_config_select ON specialty_config
  FOR SELECT USING (auth.role() = 'authenticated');

COMMENT ON TABLE specialty_config IS
  'Per-SOC specialty config (admin-loaded). 6 JSON cols per Part XII. SELECT for authenticated; writes via service role only.';
COMMENT ON COLUMN specialty_config.soc_code IS
  'O*NET SOC code, e.g. 29-1223 (Psychiatrists). Primary lookup key.';
COMMENT ON COLUMN specialty_config.onet_descriptors IS
  'O*NET descriptor weight vector for this specialty (277 descriptors)';
COMMENT ON COLUMN specialty_config.acgme_milestones IS
  'ACGME milestone set for this specialty, mapped to FISCMAK domains and tracks';
COMMENT ON COLUMN specialty_config.crosswalk IS
  'FISCMAK ↔ O*NET ↔ ACGME ↔ Rosetta cross-taxonomy map; publishable artifact per R3';
COMMENT ON COLUMN specialty_config.adjacent_socs IS
  'Adjacent SOC codes and similarity weights for career transition modeling';
COMMENT ON COLUMN specialty_config.activity_ontology IS
  'Specialty-specific activity ontology (~200+ entries) for NLP classification (L2 layer, Part XIII)';
COMMENT ON COLUMN specialty_config.setting_modifiers IS
  'FTE modifier table by clinical setting (inpatient/outpatient/hybrid/non-clinical) per Part XVI';

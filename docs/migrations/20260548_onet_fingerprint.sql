-- FISCMAK v3: O*NET fingerprint per physician
-- Stores the physician's personalized O*NET descriptor vector and adjacent-SOC
-- weights, computed from their specialty + RIASEC + FTE allocation. Drives
-- F6 Person-Occupation Fit (Phase 2+) and F8 Hobby-Profession Bridge (Phase 2+).
-- Per Part XXIV + Part V (SOC process). Depends on riasec_profile (20260547).

CREATE TABLE IF NOT EXISTS onet_fingerprint (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Physician's O*NET descriptor vector (one float per descriptor; 277 standard descriptors)
  descriptor_vector     FLOAT[],

  -- Adjacent SOC codes and their fit weights: {"29-1211": 0.87, "29-1221": 0.74, ...}
  adjacent_soc_weights  JSONB,

  computed_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_onet_fingerprint_user
  ON onet_fingerprint(user_id);
CREATE INDEX IF NOT EXISTS idx_onet_fingerprint_user_time
  ON onet_fingerprint(user_id, computed_at DESC);

ALTER TABLE onet_fingerprint ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS onet_fingerprint_select ON onet_fingerprint;
DROP POLICY IF EXISTS onet_fingerprint_insert ON onet_fingerprint;
DROP POLICY IF EXISTS onet_fingerprint_update ON onet_fingerprint;
DROP POLICY IF EXISTS onet_fingerprint_delete ON onet_fingerprint;

CREATE POLICY onet_fingerprint_select ON onet_fingerprint
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY onet_fingerprint_insert ON onet_fingerprint
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY onet_fingerprint_update ON onet_fingerprint
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY onet_fingerprint_delete ON onet_fingerprint
  FOR DELETE USING (auth.uid() = user_id);

COMMENT ON TABLE onet_fingerprint IS
  'Personalized O*NET descriptor vector per physician. Recomputed when specialty, FTE, or RIASEC changes.';
COMMENT ON COLUMN onet_fingerprint.descriptor_vector IS
  'Float array of O*NET descriptor scores (277 standard descriptors); null until O*NET import is complete (Phase 2+)';
COMMENT ON COLUMN onet_fingerprint.adjacent_soc_weights IS
  'Map of adjacent SOC codes to fit weights, e.g. {"29-1211": 0.87}. Used for F6/F8 (Phase 2+).';

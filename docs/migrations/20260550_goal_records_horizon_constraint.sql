-- FISCMAK v3: Fix goal_records horizon CHECK (3 values → 4 values)
-- 20260539 created goal_records with horizon IN ('6mo', '1yr', '5yr').
-- Founder decision 2026-06-01: Part X specifies 4 horizons:
--   3mo  SMART        (OV/OI → OV, short-term actionable)
--   1yr  SMART + II   (OV + OI, implementation intentions)
--   5yr  WOOP         (SI → all, obstacle-aware)
--   10yr Legacy       (SI, long-horizon identity goal)
-- '6mo' was wrong (spec always said 3mo); '10yr' was missing entirely.
-- Do NOT edit 20260539 — it may already be applied.

ALTER TABLE goal_records
  DROP CONSTRAINT IF EXISTS goal_records_horizon_check;

ALTER TABLE goal_records
  ADD CONSTRAINT goal_records_horizon_check
    CHECK (horizon IN ('3mo', '1yr', '5yr', '10yr'));

COMMENT ON COLUMN goal_records.horizon IS
  '3mo=SMART short-term, 1yr=SMART+II, 5yr=WOOP obstacle-aware, 10yr=legacy identity goal (Part X)';

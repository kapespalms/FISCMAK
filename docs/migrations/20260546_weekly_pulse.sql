-- FISCMAK v3: Weekly pulse (burnout pulse + distress trigger)
-- 4 single-item measures + 2 free-text energy prompts + invisible work flag.
-- Takes ~1 min. EE/DP/QoL: 0–4 Likert (r=0.76–0.83 vs MBI-EE [R16][R17]).
-- MDT: 0–10 Moral Distress Thermometer [R18]; MDT ≥4 triggers resource link
-- and Mak pause — never auto-reported to any institution.
-- EE, DP, MDT feed the 7-axis well-being origami plot (Part XVII.4).

CREATE TABLE IF NOT EXISTS weekly_pulse (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recorded_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Single-item burnout measures (0–4 Likert per R16/R17)
  ee                  SMALLINT    NOT NULL CHECK (ee BETWEEN 0 AND 4),
  dp                  SMALLINT    NOT NULL CHECK (dp BETWEEN 0 AND 4),
  qol                 SMALLINT    NOT NULL CHECK (qol BETWEEN 0 AND 4),

  -- Moral Distress Thermometer (0–10 per R18); ≥4 triggers resource link
  mdt                 SMALLINT    NOT NULL CHECK (mdt BETWEEN 0 AND 10),

  -- Free-text energy prompts (optional; drive evidence_unit routing)
  energy_boost_task   TEXT,
  energy_drain_task   TEXT,

  -- Set when free-text describes work not captured in any institutional system
  invisible_flag      BOOLEAN     NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_weekly_pulse_user
  ON weekly_pulse(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_pulse_user_time
  ON weekly_pulse(user_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_weekly_pulse_mdt_trigger
  ON weekly_pulse(user_id, mdt) WHERE mdt >= 4;

ALTER TABLE weekly_pulse ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS weekly_pulse_select ON weekly_pulse;
DROP POLICY IF EXISTS weekly_pulse_insert ON weekly_pulse;
DROP POLICY IF EXISTS weekly_pulse_update ON weekly_pulse;
DROP POLICY IF EXISTS weekly_pulse_delete ON weekly_pulse;

CREATE POLICY weekly_pulse_select ON weekly_pulse
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY weekly_pulse_insert ON weekly_pulse
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY weekly_pulse_update ON weekly_pulse
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY weekly_pulse_delete ON weekly_pulse
  FOR DELETE USING (auth.uid() = user_id);

COMMENT ON TABLE weekly_pulse IS
  'Weekly burnout pulse. 4 single-item measures + 2 free-text prompts. MDT ≥4 triggers resource link — never auto-reported.';
COMMENT ON COLUMN weekly_pulse.ee IS
  'Emotional Exhaustion single-item, 0–4 (0=never, 4=always); r=0.76–0.83 vs MBI-EE [R16][R17]';
COMMENT ON COLUMN weekly_pulse.dp IS
  'Depersonalization single-item, 0–4 [R16][R17]';
COMMENT ON COLUMN weekly_pulse.qol IS
  'Quality of Life single-item, 0–4';
COMMENT ON COLUMN weekly_pulse.mdt IS
  'Moral Distress Thermometer, 0–10 [R18]; values ≥4 trigger resource link + Mak pause, no auto-report';
COMMENT ON COLUMN weekly_pulse.energy_boost_task IS
  'Free-text: task that gave the physician energy this week; routes to evidence_unit';
COMMENT ON COLUMN weekly_pulse.energy_drain_task IS
  'Free-text: task that drained energy this week; routes to evidence_unit';
COMMENT ON COLUMN weekly_pulse.invisible_flag IS
  'Set when free-text describes work not captured in any institutional system (invisible work signal)';

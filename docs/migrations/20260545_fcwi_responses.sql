-- FISCMAK v3: FCWI responses (monthly career-integrated well-being)
-- 9-item instrument, 0–4 Likert per item, ~2 min to complete. Governance rule
-- (Part XIX): NO composite score stored or displayed — items only. frequency_tier
-- records the assessment cadence context (onboarding baseline, monthly, etc.).
-- Item constructs per Part VIII: 1=Work Exhaustion, 2=Interpersonal Disengagement,
-- 3=Meaningfulness, 4=Satisfaction, 5=Autonomy/Control, 6=Domain-Specific Energy,
-- 7=Recognition, 8=Growth Mindset, 9=Self-Care.

CREATE TABLE IF NOT EXISTS fcwi_responses (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recorded_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- 9 FCWI items (0=never, 1=rarely, 2=sometimes, 3=often, 4=always)
  item_1          SMALLINT    NOT NULL CHECK (item_1 BETWEEN 0 AND 4),
  item_2          SMALLINT    NOT NULL CHECK (item_2 BETWEEN 0 AND 4),
  item_3          SMALLINT    NOT NULL CHECK (item_3 BETWEEN 0 AND 4),
  item_4          SMALLINT    NOT NULL CHECK (item_4 BETWEEN 0 AND 4),
  item_5          SMALLINT    NOT NULL CHECK (item_5 BETWEEN 0 AND 4),
  item_6          SMALLINT    NOT NULL CHECK (item_6 BETWEEN 0 AND 4),
  item_7          SMALLINT    NOT NULL CHECK (item_7 BETWEEN 0 AND 4),
  item_8          SMALLINT    NOT NULL CHECK (item_8 BETWEEN 0 AND 4),
  item_9          SMALLINT    NOT NULL CHECK (item_9 BETWEEN 0 AND 4),

  -- Assessment cadence context (not a derived score)
  frequency_tier  VARCHAR(20) NOT NULL DEFAULT 'monthly'
                    CHECK (frequency_tier IN ('onboarding', 'monthly', 'quarterly', 'annual', 'ad_hoc'))
);

CREATE INDEX IF NOT EXISTS idx_fcwi_responses_user
  ON fcwi_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_fcwi_responses_user_time
  ON fcwi_responses(user_id, recorded_at DESC);

ALTER TABLE fcwi_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS fcwi_responses_select ON fcwi_responses;
DROP POLICY IF EXISTS fcwi_responses_insert ON fcwi_responses;
DROP POLICY IF EXISTS fcwi_responses_update ON fcwi_responses;
DROP POLICY IF EXISTS fcwi_responses_delete ON fcwi_responses;

CREATE POLICY fcwi_responses_select ON fcwi_responses
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY fcwi_responses_insert ON fcwi_responses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY fcwi_responses_update ON fcwi_responses
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY fcwi_responses_delete ON fcwi_responses
  FOR DELETE USING (auth.uid() = user_id);

COMMENT ON TABLE fcwi_responses IS
  'Monthly FCWI responses. 9 items, 0–4 Likert. No composite score stored (Part XIX governance).';
COMMENT ON COLUMN fcwi_responses.item_1 IS 'Work Exhaustion: "work I spend most time on depletes my energy"';
COMMENT ON COLUMN fcwi_responses.item_2 IS 'Interpersonal Disengagement: "disconnected from people I work with/care for"';
COMMENT ON COLUMN fcwi_responses.item_3 IS 'Meaningfulness: "work feels meaningful, aligned with why I entered medicine"';
COMMENT ON COLUMN fcwi_responses.item_4 IS 'Satisfaction: "satisfied with what I''ve accomplished"';
COMMENT ON COLUMN fcwi_responses.item_5 IS 'Autonomy/Control: "in control of my professional direction"';
COMMENT ON COLUMN fcwi_responses.item_6 IS 'Domain-Specific Energy: "work I spend most time on gives me energy"';
COMMENT ON COLUMN fcwi_responses.item_7 IS 'Recognition: "work that matters most is recognized by my institution"';
COMMENT ON COLUMN fcwi_responses.item_8 IS 'Growth Mindset: "after a mistake I learn rather than feel shame"';
COMMENT ON COLUMN fcwi_responses.item_9 IS 'Self-Care: "I prioritize my health under high demand"';
COMMENT ON COLUMN fcwi_responses.frequency_tier IS
  'Assessment cadence context: onboarding=baseline, monthly=standard, quarterly=snapshot, annual=comprehensive, ad_hoc=physician-initiated';

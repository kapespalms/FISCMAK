-- Free-tier message credits and Mak chat feedback

ALTER TABLE app_users ADD COLUMN IF NOT EXISTS message_balance INTEGER DEFAULT 25;

CREATE TABLE IF NOT EXISTS chat_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_users(user_id) ON DELETE CASCADE,
  section TEXT,
  message_content TEXT NOT NULL,
  rating TEXT NOT NULL CHECK (rating IN ('up', 'down')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_feedback_user_id ON chat_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_feedback_created_at ON chat_feedback(created_at DESC);

ALTER TABLE chat_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users insert own chat feedback" ON chat_feedback;
CREATE POLICY "Users insert own chat feedback" ON chat_feedback
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users read own chat feedback" ON chat_feedback;
CREATE POLICY "Users read own chat feedback" ON chat_feedback
  FOR SELECT USING (user_id = auth.uid());

COMMENT ON TABLE chat_feedback IS 'Thumbs up/down on Coach Mak assistant messages';
COMMENT ON COLUMN app_users.message_balance IS 'Remaining free AI messages when not on Premium';

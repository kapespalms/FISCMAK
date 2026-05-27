-- Program invite tokens + blank pathway programs (5 programs × 60 resident slots)
-- Run after 20260525_gme_programs.sql

ALTER TABLE programs ADD COLUMN IF NOT EXISTS content_tier TEXT
  CHECK (content_tier IS NULL OR content_tier IN ('full', 'blank'));
ALTER TABLE programs ADD COLUMN IF NOT EXISTS invite_slot_capacity INTEGER DEFAULT 60;

UPDATE programs SET content_tier = 'full', invite_slot_capacity = 60
WHERE slug = 'uh-psych-cmc';

CREATE TABLE IF NOT EXISTS program_invite_tokens (
  token_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT UNIQUE NOT NULL,
  program_id UUID NOT NULL REFERENCES programs(program_id) ON DELETE CASCADE,
  slot_number INTEGER NOT NULL CHECK (slot_number >= 1 AND slot_number <= 999),
  label TEXT,
  trainee_initials TEXT,
  roster_email TEXT,
  used_by UUID REFERENCES app_users(user_id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (program_id, slot_number)
);

CREATE INDEX IF NOT EXISTS idx_program_invite_tokens_token ON program_invite_tokens(token);
CREATE INDEX IF NOT EXISTS idx_program_invite_tokens_program ON program_invite_tokens(program_id);
CREATE INDEX IF NOT EXISTS idx_program_invite_tokens_used ON program_invite_tokens(used_by)
  WHERE used_by IS NOT NULL;

-- Blank pathway programs (no UH rotation seeds — add documents later via program settings)
INSERT INTO programs (
  program_id, slug, institution_name, program_name, specialty, content_tier, invite_slot_capacity, settings
) VALUES
  (
    'b2c3d4e5-f6a7-8901-bcde-f12345678901'::uuid,
    'pathway-internal-medicine',
    'University Hospitals Cleveland Medical Center',
    'Internal Medicine Residency',
    'Internal Medicine',
    'blank',
    60,
    '{"pathway_type":"blank","document_seeds":[]}'::jsonb
  ),
  (
    'c3d4e5f6-a7b8-9012-cdef-123456789012'::uuid,
    'pathway-family-medicine',
    'University Hospitals Cleveland Medical Center',
    'Family Medicine Residency',
    'Family Medicine',
    'blank',
    60,
    '{"pathway_type":"blank","document_seeds":[]}'::jsonb
  ),
  (
    'd4e5f6a7-b8c9-0123-def0-234567890123'::uuid,
    'pathway-pediatrics',
    'University Hospitals Cleveland Medical Center',
    'Pediatrics Residency',
    'Pediatrics',
    'blank',
    60,
    '{"pathway_type":"blank","document_seeds":[]}'::jsonb
  ),
  (
    'e5f6a7b8-c9d0-1234-ef01-345678901234'::uuid,
    'pathway-surgery',
    'University Hospitals Cleveland Medical Center',
    'General Surgery Residency',
    'Surgery',
    'blank',
    60,
    '{"pathway_type":"blank","document_seeds":[]}'::jsonb
  )
ON CONFLICT (slug) DO UPDATE SET
  institution_name = EXCLUDED.institution_name,
  program_name = EXCLUDED.program_name,
  specialty = EXCLUDED.specialty,
  content_tier = EXCLUDED.content_tier,
  invite_slot_capacity = EXCLUDED.invite_slot_capacity,
  settings = EXCLUDED.settings;

-- FISCMAK v3: CV-pipeline columns on activity_entries
-- Enables the CV parse → physician confirm → evidence_unit flow (BUILD_ORDER 4.1).
-- source_document_id: FK back to the document that produced this row.
-- user_confirmed: false = not yet reviewed; true = physician has seen this line
--   (regardless of accept/reject — accepted lines also get an evidence_unit row).

ALTER TABLE activity_entries
  ADD COLUMN IF NOT EXISTS source_document_id UUID,
  ADD COLUMN IF NOT EXISTS user_confirmed     BOOLEAN NOT NULL DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_activity_entries_cv_triage
  ON activity_entries(user_id, source_document_id, user_confirmed)
  WHERE source_document_id IS NOT NULL;

COMMENT ON COLUMN activity_entries.source_document_id IS
  'Document that produced this row (cv_document pipeline). Null for Mak-captured entries.';
COMMENT ON COLUMN activity_entries.user_confirmed IS
  'True once the physician has reviewed this line (accept or reject). Used for triage pagination.';

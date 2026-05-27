-- Reconciliation confidence tier for auto-confirm vs manual review (H5 pilot)

ALTER TABLE reconciliation_items
  ADD COLUMN IF NOT EXISTS confidence TEXT
  CHECK (confidence IN ('exact_match', 'manual_review', 'verified_registry'));

UPDATE reconciliation_items
SET confidence = 'manual_review'
WHERE confidence IS NULL;

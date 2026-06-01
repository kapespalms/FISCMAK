-- FISCMAK v3: Fix energy_rankings rank constraint (1–8 → 1–5)
-- 20260538 created energy_rankings with rank BETWEEN 1 AND 8 (ordinal).
-- Founder decision 2026-06-01: energy_rankings uses a 1–5 Likert scale per
-- domain (1=very draining, 5=very energizing), rated independently for each
-- domain. The 1–8 force-ranking concept belongs to a separate table
-- (domain_priority_order) that will be built with F6 Person-Occupation Fit.
-- This migration corrects the CHECK constraint without touching existing rows.

ALTER TABLE energy_rankings
  DROP CONSTRAINT IF EXISTS energy_rankings_rank_check;

ALTER TABLE energy_rankings
  ADD CONSTRAINT energy_rankings_rank_check
    CHECK (rank BETWEEN 1 AND 5);

COMMENT ON COLUMN energy_rankings.rank IS
  'Domain energy rating: 1=very draining, 5=very energizing (Likert per domain, rated independently)';

COMMENT ON TABLE energy_rankings IS
  'Physician domain energy ratings (1=very draining, 5=very energizing). One row per domain per user. '
  'Not an ordinal force-rank — each domain is scored independently on a 1–5 Likert scale.';

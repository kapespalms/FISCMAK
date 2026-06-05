-- Migration: Add Quality/Safety track and align career tracks to the v3 8-track model
-- Author: FISCMAK (founder-approved 2026-05-31)
-- Purpose:
--   The v3 spec (§2.3) defines exactly 8 career tracks. The ontology had no
--   "quality_safety" track, so QI/quality work had nowhere to land. This adds it
--   and re-points the one QI activity ("improved_workflow") to it.
--
-- Decisions captured (founder):
--   1. improved_workflow  -> Quality/Safety (lattice index 6)
--   2. administrator / executive / consultant -> Administrator/Leader (index 3)
--      (handled in code via TRACK_KEY_TO_INDEX; no data change needed since those
--       tracks currently have zero activity mappings)
--
-- Safety: additive + a single UPDATE. Idempotent. No drops. No row deletions.

begin;

-- 1) Create the Quality/Safety track if it does not already exist.
--    Fixed track_id to match the committed JSON snapshot
--    (docs/exports/ontology-full-export.json) so DB and app stay in sync.
insert into ontology_career_tracks (track_id, track_key, name, description, display_order)
select 'c7f3a2b1-9d4e-4a6f-8b21-0c1d2e3f4a5b',
       'quality_safety',
       'Quality / Safety',
       'Patient safety, quality improvement, systems analysis, and protocol maintenance',
       6
where not exists (
  select 1 from ontology_career_tracks where track_key = 'quality_safety'
);

-- 2) Re-point the QI activity "improved_workflow" from systems_leader to quality_safety.
--    Only the active mapping(s) for that activity are moved.
update ontology_activity_mappings m
set track_id = (select track_id from ontology_career_tracks where track_key = 'quality_safety')
where m.active = true
  and m.activity_id = (
    select activity_id from ontology_invisible_work_activities
    where activity_key = 'improved_workflow'
  )
  and m.track_id = (
    select track_id from ontology_career_tracks where track_key = 'systems_leader'
  );

commit;

-- Verification (run manually after applying):
--   select t.track_key, a.activity_key
--   from ontology_activity_mappings m
--   join ontology_career_tracks t on t.track_id = m.track_id
--   join ontology_invisible_work_activities a on a.activity_id = m.activity_id
--   where a.activity_key = 'improved_workflow';
--   -- expect: quality_safety | improved_workflow

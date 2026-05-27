-- FISCMAK Activity Entries Schema Extension
-- Created: 2026-05-23
-- Purpose: Wire Layer 3 (Signal Detection) → Layer 4 (Activity Capture) → Layer 5 (Core Ontology)
-- This table is the heart of FISCMAK: raw events → detected signals → formal career evidence

-- ============================================================================
-- TABLE: activity_entries (EXTENDED VERSION)
-- ============================================================================
-- Extends the existing V2 activity_entries table (PK: id) to capture:
-- - Raw user input (what they said)
-- - Detected signals (what Mak heard)
-- - Inferred activity (what it means professionally)
-- - Ontology mapping (competencies, tracks, levels)
-- - Classification metadata (confidence, routing, follow-up)

alter table activity_entries add column if not exists raw_text_tokens integer;
alter table activity_entries add column if not exists input_timestamp timestamp with time zone default now();
alter table activity_entries add column if not exists detected_signals uuid[] default array[]::uuid[];
alter table activity_entries add column if not exists detected_signal_keys text[] default array[]::text[];
alter table activity_entries add column if not exists detected_signal_confidence numeric(3,2);
alter table activity_entries add column if not exists signal_detection_metadata jsonb;
alter table activity_entries add column if not exists user_specialty_id uuid references ontology_specialties(specialty_id);
alter table activity_entries add column if not exists user_subspecialty_id uuid references ontology_subspecialties(subspecialty_id);
alter table activity_entries add column if not exists user_role text;
alter table activity_entries add column if not exists user_career_track_id uuid references ontology_career_tracks(track_id);
alter table activity_entries add column if not exists entry_setting text;
alter table activity_entries add column if not exists entry_energy text;
alter table activity_entries add column if not exists activity_category text;
alter table activity_entries add column if not exists people_involved text[];
alter table activity_entries add column if not exists duration_minutes integer;
alter table activity_entries add column if not exists evidence_artifacts text[];
alter table activity_entries add column if not exists additional_context jsonb;
alter table activity_entries add column if not exists inferred_activity_id uuid references ontology_invisible_work_activities(activity_id);
alter table activity_entries add column if not exists inferred_activity_key text;
alter table activity_entries add column if not exists related_activity_ids uuid[] default array[]::uuid[];
alter table activity_entries add column if not exists related_activity_keys text[] default array[]::text[];
alter table activity_entries add column if not exists inferred_competency_domain_ids uuid[] default array[]::uuid[];
alter table activity_entries add column if not exists inferred_subcompetency_ids uuid[] default array[]::uuid[];
alter table activity_entries add column if not exists inferred_subcompetency_keys text[] default array[]::text[];
alter table activity_entries add column if not exists inferred_career_track_ids uuid[] default array[]::uuid[];
alter table activity_entries add column if not exists inferred_career_track_keys text[] default array[]::text[];
alter table activity_entries add column if not exists inferred_development_level_id uuid references ontology_development_levels(level_id);
alter table activity_entries add column if not exists inferred_development_level numeric;
alter table activity_entries add column if not exists development_level_reasoning text;
alter table activity_entries add column if not exists overall_confidence numeric(3,2) default 0.75;
alter table activity_entries add column if not exists classification_source text default 'ai';
alter table activity_entries add column if not exists is_user_corrected boolean default false;
alter table activity_entries add column if not exists user_correction_notes text;
alter table activity_entries add column if not exists mak_detected_at timestamp with time zone;
alter table activity_entries add column if not exists mak_primary_response text;
alter table activity_entries add column if not exists mak_suggested_followup text;
alter table activity_entries add column if not exists mak_routing_category text;
alter table activity_entries add column if not exists mak_coaching_prompt text;
alter table activity_entries add column if not exists user_response_to_mak text;
alter table activity_entries add column if not exists followup_needed boolean default true;
alter table activity_entries add column if not exists output_cv_bullet text;
alter table activity_entries add column if not exists output_annual_review text;
alter table activity_entries add column if not exists output_promotion_language text;
alter table activity_entries add column if not exists output_teaching_portfolio text;
alter table activity_entries add column if not exists output_fellowship_narrative text;
alter table activity_entries add column if not exists updated_at timestamp with time zone default now();
alter table activity_entries add column if not exists processed_at timestamp with time zone;
alter table activity_entries add column if not exists version integer default 1;

comment on table activity_entries is 'Core event table: captures user activity + detected signals + ontology mapping';

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
-- Query patterns: find activities by user/time, by signal, by activity type, by competency

create index if not exists idx_activity_entries_user on activity_entries(user_id);
create index if not exists idx_activity_entries_user_time on activity_entries(user_id, created_at desc);
create index if not exists idx_activity_entries_created on activity_entries(created_at desc);
create index if not exists idx_activity_entries_activity on activity_entries(inferred_activity_id);
create index if not exists idx_activity_entries_activity_key on activity_entries(inferred_activity_key);
create index if not exists idx_activity_entries_specialty on activity_entries(user_specialty_id);
create index if not exists idx_activity_entries_track on activity_entries using gin (inferred_career_track_ids);
create index if not exists idx_activity_entries_signals on activity_entries using gin (detected_signals);
create index if not exists idx_activity_entries_competencies on activity_entries using gin (inferred_subcompetency_ids);
create index if not exists idx_activity_entries_confidence on activity_entries(overall_confidence);
create index if not exists idx_activity_entries_processed on activity_entries(processed_at);
create index if not exists idx_activity_entries_energy on activity_entries(entry_energy);

-- ============================================================================
-- ROW-LEVEL SECURITY
-- ============================================================================
-- Each user can only see their own entries

alter table activity_entries enable row level security;

drop policy if exists "activity_entries_user_scoped" on activity_entries;
create policy "activity_entries_user_scoped" on activity_entries 
  for all using (auth.uid() = user_id);

-- ============================================================================
-- TABLE: activity_classification_audit
-- ============================================================================
-- Tracks corrections and confidence adjustments for learning

create table if not exists activity_classification_audit (
  audit_id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references activity_entries(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  
  -- What was changed
  original_inferred_activity_id uuid,
  corrected_inferred_activity_id uuid references ontology_invisible_work_activities(activity_id),
  
  original_confidence numeric(3,2),
  corrected_confidence numeric(3,2),
  
  correction_reason text, -- "activity was different", "confidence was too high", etc.
  user_notes text, -- user explanation
  
  created_at timestamp with time zone default now()
);

comment on table activity_classification_audit is 'Tracks user corrections to improve classification over time';

create index if not exists idx_audit_entry on activity_classification_audit(entry_id);
create index if not exists idx_audit_user on activity_classification_audit(user_id);
create index if not exists idx_audit_time on activity_classification_audit(created_at desc);

alter table activity_classification_audit enable row level security;
create policy "audit_user_scoped" on activity_classification_audit 
  for all using (auth.uid() = user_id);

-- ============================================================================
-- TABLE: activity_signal_context
-- ============================================================================
-- Detailed signal detection results for debugging & learning

create table if not exists activity_signal_context (
  context_id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references activity_entries(id) on delete cascade,
  
  -- Signal that was detected
  indicator_id uuid not null references signal_indicators(indicator_id),
  indicator_key text not null,
  indicator_name text,
  category_id uuid references signal_categories(category_id),
  
  -- How it was detected
  matched_keywords text[], -- which keywords actually matched
  regex_match_positions int4range, -- where in the text
  
  -- Confidence & routing
  signal_confidence numeric(3,2),
  suggested_routing_category text,
  
  created_at timestamp with time zone default now()
);

comment on table activity_signal_context is 'Detailed signal match records for audit & learning';

create index if not exists idx_signal_context_entry on activity_signal_context(entry_id);
create index if not exists idx_signal_context_indicator on activity_signal_context(indicator_id);

alter table activity_signal_context enable row level security;
create policy "signal_context_user_scoped" on activity_signal_context 
  for all using (
    auth.uid() = (select user_id from activity_entries where id = activity_signal_context.entry_id)
  );

-- ============================================================================
-- TABLE: activity_patterns
-- ============================================================================
-- Aggregated user patterns over time for coaching insights

create table if not exists activity_patterns (
  pattern_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  
  -- What pattern was detected
  pattern_type text, -- 'activity_frequency', 'signal_trend', 'energy_trend', 'competency_growth', 'track_alignment'
  pattern_key text, -- e.g., 'mentorship_increasing', 'burnout_signals_rising', 'leadership_emerging'
  
  -- Time window
  window_days integer default 30, -- calculated over 7, 30, 90, or 365 days
  window_start_date date,
  window_end_date date,
  
  -- The pattern
  subject_id uuid, -- activity_id, signal_indicator_id, competency_id, or track_id
  subject_key text, -- activity_key, signal_key, competency_key, or track_key
  frequency integer, -- how many times detected
  trend text default 'stable', -- 'increasing', 'decreasing', 'stable', 'emerging'
  trend_magnitude numeric(3,2), -- strength from 0.0-1.0
  
  -- Coaching insight
  coaching_direction text, -- suggested coaching focus
  insight_narrative text, -- human-readable insight
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

comment on table activity_patterns is 'Detected patterns in user activities for longitudinal coaching insights';

create index if not exists idx_patterns_user on activity_patterns(user_id);
create index if not exists idx_patterns_pattern_key on activity_patterns(pattern_key);
create index if not exists idx_patterns_window on activity_patterns(window_start_date, window_end_date);
create index if not exists idx_patterns_updated on activity_patterns(updated_at desc);

alter table activity_patterns enable row level security;
create policy "patterns_user_scoped" on activity_patterns 
  for all using (auth.uid() = user_id);

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Recent user activities with full context
create or replace view user_recent_activities as
select 
  ae.id as entry_id,
  ae.user_id,
  ae.raw_text,
  ae.inferred_activity_key,
  ae.detected_signal_keys,
  ae.inferred_subcompetency_keys,
  ae.inferred_career_track_keys,
  ae.inferred_development_level,
  ae.overall_confidence,
  ae.entry_energy,
  ae.created_at,
  ae.mak_coaching_prompt
from activity_entries ae
where ae.processed_at is not null
order by ae.created_at desc;

-- Activities by signal detected
create or replace view activities_by_signal as
select 
  unnest(ae.detected_signal_keys) as signal_key,
  count(*) as count,
  count(distinct ae.user_id) as user_count,
  avg(ae.overall_confidence) as avg_confidence
from activity_entries ae
where ae.processed_at is not null
group by signal_key
order by count desc;

-- User activity summary
create or replace view user_activity_summary as
select 
  ae.user_id,
  count(distinct ae.id) as total_activities,
  count(distinct ae.inferred_activity_key) as unique_activities,
  count(distinct ae.inferred_career_track_ids) as tracks_represented,
  avg(ae.overall_confidence) as avg_classification_confidence,
  max(ae.created_at) as last_activity_date,
  count(distinct case when ae.entry_energy = 'draining' then ae.id end) as draining_activities,
  count(distinct case when ae.entry_energy = 'fulfilling' then ae.id end) as fulfilling_activities
from activity_entries ae
where ae.processed_at is not null
group by ae.user_id;

-- ============================================================================
-- HELPER FUNCTION: Calculate development level from context
-- ============================================================================
-- Maps scope + repetition indicators to level 1-5

create or replace function infer_development_level(
  p_scope text,
  p_doing_independently boolean,
  p_led_others boolean,
  p_systematized boolean
) returns integer as $$
begin
  -- Level 5: Builds systems, teaches others
  if p_systematized then
    return 5;
  end if;
  
  -- Level 4: Leads others, adapts across complexity
  if p_led_others then
    return 4;
  end if;
  
  -- Level 3: Performs independently in routine contexts
  if p_doing_independently then
    return 3;
  end if;
  
  -- Level 2: Participates with guidance
  if p_scope = 'local' then
    return 2;
  end if;
  
  -- Level 1: Recognizes
  return 1;
end;
$$ language plpgsql immutable;

-- ============================================================================
-- HELPER FUNCTION: Update activity patterns
-- ============================================================================
-- Called periodically (e.g., nightly) to recalculate user patterns

create or replace function update_activity_patterns(p_user_id uuid default null) returns void as $$
declare
  v_user_id uuid;
  v_window_days integer;
  v_window_start date;
begin
  -- If no user specified, update all users with recent activity
  if p_user_id is null then
    for v_user_id in
      select distinct user_id from activity_entries 
      where processed_at > now() - interval '90 days'
    loop
      perform update_activity_patterns(v_user_id);
    end loop;
    return;
  end if;

  -- For this user, calculate patterns over 7, 30, and 90 day windows
  for v_window_days in array[7, 30, 90] loop
    v_window_start := (now() - (v_window_days || ' days')::interval)::date;

    -- Activity frequency patterns
    insert into activity_patterns (
      user_id, pattern_type, pattern_key, window_days, window_start_date, window_end_date,
      subject_id, subject_key, frequency, trend_magnitude, coaching_direction
    )
    select 
      p_user_id,
      'activity_frequency',
      'activity_' || coalesce(ae.inferred_activity_key, 'unknown'),
      v_window_days,
      v_window_start,
      current_date,
      ae.inferred_activity_id,
      ae.inferred_activity_key,
      count(*),
      least(1.0, count(*) / 5.0)::numeric(3,2), -- normalize: 5+ = strength 1.0
      case 
        when count(*) > 10 then 'This is becoming a strength—deepen expertise or mentor others'
        when count(*) > 5 then 'Growing competency—continue developing'
        when count(*) > 0 then 'Emerging pattern—explore further'
      end
    from activity_entries ae
    where ae.user_id = p_user_id
      and ae.processed_at::date >= v_window_start
      and ae.inferred_activity_id is not null
    group by ae.inferred_activity_id, ae.inferred_activity_key
    on conflict (pattern_id) do update set
      frequency = excluded.frequency,
      trend_magnitude = excluded.trend_magnitude,
      coaching_direction = excluded.coaching_direction,
      updated_at = now();

    -- Signal frequency patterns
    insert into activity_patterns (
      user_id, pattern_type, pattern_key, window_days, window_start_date, window_end_date,
      subject_key, frequency, trend_magnitude
    )
    select 
      p_user_id,
      'signal_frequency',
      'signal_' || coalesce(unnest(ae.detected_signal_keys), 'unknown'),
      v_window_days,
      v_window_start,
      current_date,
      unnest(ae.detected_signal_keys),
      count(*),
      least(1.0, count(*) / 5.0)::numeric(3,2)
    from activity_entries ae
    where ae.user_id = p_user_id
      and ae.processed_at::date >= v_window_start
      and ae.detected_signal_keys is not null
      and array_length(ae.detected_signal_keys, 1) > 0
    group by unnest(ae.detected_signal_keys)
    on conflict (pattern_id) do update set
      frequency = excluded.frequency,
      trend_magnitude = excluded.trend_magnitude,
      updated_at = now();

  end loop;

end;
$$ language plpgsql;

-- ============================================================================
-- END OF ACTIVITY ENTRIES EXTENSION
-- ============================================================================

-- FISCMAK Career Fit Engine
-- Created: 2026-05-23
-- Purpose: Match jobs to users based on specialty, evidence, goals, and career trajectory
-- Not a job board—a career fit analyzer

-- ============================================================================
-- TABLE 1: job_sources
-- ============================================================================
-- Approved job sources (APIs, feeds, manual curations)

create table if not exists job_sources (
  source_id uuid primary key default gen_random_uuid(),
  source_name text not null unique, -- "NEJM Career Center", "PracticeLink", "Greenhouse API", "Manual Curation"
  source_type text not null, -- 'api', 'feed', 'manual', 'partnership'
  api_endpoint text, -- if API-based
  api_key_ref text, -- reference to secrets manager, not stored here
  last_synced_at timestamp with time zone,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

comment on table job_sources is 'Approved job sources—APIs, feeds, manual curations only. No scrapers.';

insert into job_sources (source_name, source_type, is_active) values
  ('NEJM Career Center', 'partnership', true),
  ('JAMA Career Center', 'partnership', true),
  ('PracticeLink', 'partnership', true),
  ('PracticeMatch', 'partnership', true),
  ('Greenhouse API (Partner Companies)', 'api', true),
  ('Manual Curation', 'manual', true),
  ('Indeed Partner API', 'api', true)
on conflict (source_name) do nothing;

-- ============================================================================
-- TABLE 2: jobs
-- ============================================================================
-- Normalized job postings in FISCMAK schema

create table if not exists jobs (
  job_id uuid primary key default gen_random_uuid(),
  
  -- Basic job info
  source_id uuid not null references job_sources(source_id),
  source_job_id text not null, -- employer's job ID
  title text not null,
  employer text not null,
  employer_type text, -- 'hospital', 'private_practice', 'academia', 'corporate', 'telehealth', 'government'
  
  -- Location & setting
  location_city text,
  location_state text,
  location_country text default 'USA',
  location_region text, -- 'Northeast', 'Midwest', 'South', 'West'
  remote_type text, 'on-site', -- 'on-site', 'hybrid', 'remote'
  
  -- Medical specialty alignment
  specialty_id uuid references ontology_specialties(specialty_id),
  specialty_key text, -- denormalized: 'psych', 'im', etc.
  subspecialty_id uuid references ontology_subspecialties(subspecialty_id),
  subspecialty_key text, -- denormalized: 'psych_cl', etc.
  
  -- Role profile
  role_level text, -- 'resident', 'fellow', 'early_career', 'established', 'senior', 'leadership'
  setting text, -- 'inpatient', 'outpatient', 'mixed', 'telehealth', 'admin', 'research'
  clinical_percent integer, -- 0-100: what % is patient care
  teaching_percent integer, -- 0-100
  research_percent integer, -- 0-100
  leadership_percent integer, -- 0-100
  admin_percent integer, -- 0-100
  
  -- Work conditions
  call_burden text, -- 'none', 'light', 'moderate', 'heavy', 'variable'
  call_frequency text, -- 'none', 'monthly', 'weekly', 'continuous'
  inpatient_days_month integer, -- if applicable
  outpatient_hours_week integer, -- if applicable
  
  -- Compensation & benefits
  salary_min integer,
  salary_max integer,
  salary_currency text default 'USD',
  signing_bonus integer,
  relocation_package boolean default false,
  benefits_notes text, -- health, retirement, CME, etc.
  
  -- Career context
  visa_sponsorship_available boolean default false,
  visa_types_supported text[], -- H1B, EB3, etc.
  tail_coverage_provided boolean,
  protected_time_admin boolean,
  protected_time_research boolean,
  protected_time_teaching boolean,
  
  -- Job requirements & culture
  required_board_certification text[], -- board names
  required_licenses text[], -- state licenses
  preferred_credentials text[],
  culture_notes text,
  team_size integer,
  
  -- Opportunity indicators
  leadership_track boolean, -- leadership growth potential
  research_track boolean, -- research support / track
  teaching_track boolean, -- teaching/education track
  academic_affiliation boolean, -- academic med center
  
  -- Job description & raw data
  raw_description text,
  key_responsibilities text[],
  requirements_raw text,
  
  -- Source tracking
  source_url text,
  posted_date date,
  deadline_apply date,
  last_seen date,
  expires_at timestamp with time zone,
  
  -- Metadata
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  is_active boolean default true
);

comment on table jobs is 'Normalized job postings in FISCMAK career-fit schema';

create index if not exists idx_jobs_specialty on jobs(specialty_id);
create index if not exists idx_jobs_subspecialty on jobs(subspecialty_id);
create index if not exists idx_jobs_location on jobs(location_state);
create index if not exists idx_jobs_setting on jobs(setting);
create index if not exists idx_jobs_active on jobs(is_active);
create index if not exists idx_jobs_expires on jobs(expires_at);
create index if not exists idx_jobs_source on jobs(source_id);

-- ============================================================================
-- TABLE 3: user_career_preferences
-- ============================================================================
-- What each user is looking for in their next role

create table if not exists user_career_preferences (
  pref_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  
  -- Career direction
  target_career_tracks uuid[] default array[]::uuid[], -- which tracks? ['clinician_educator', 'systems_leader']
  target_career_track_keys text[],
  
  -- Location & setting preferences
  preferred_locations text[], -- cities or regions: ['Boston', 'San Francisco', 'Remote']
  willing_to_relocate boolean default false,
  location_flexibility text, -- 'anywhere', 'region', 'city', 'state', 'specific_only'
  
  -- Work-life preferences
  preferred_remote_type text, -- 'on-site', 'hybrid', 'remote', 'any'
  max_call_burden text, -- 'none', 'light', 'moderate', 'heavy', 'flexible'
  min_protected_time_percent integer default 20, -- minimum admin/research/teaching time
  preferred_clinical_percent integer default 60, -- ideal balance
  
  -- Compensation
  salary_target_min integer,
  salary_target_max integer,
  signing_bonus_important boolean default false,
  
  -- Career goals (open-ended)
  next_role_goals text[], -- ['academic_position', 'leadership', 'research_time', 'work_life_balance']
  visa_sponsorship_needed boolean default false,
  
  -- What they value most (ranked)
  value_priorities text[], -- ['autonomy', 'mentorship', 'growth', 'stability', 'family_time', 'research']
  
  -- Red flags / deal-breakers
  deal_breakers text[], -- ['excessive_call', 'no_research_support', 'poor_culture']
  
  -- Timeline
  job_search_timeline text, -- 'immediate', '3_months', '6_months', '12_months', 'exploring'
  start_date_target date,
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

comment on table user_career_preferences is 'User career preferences for job matching';

create index if not exists idx_prefs_user on user_career_preferences(user_id);

alter table user_career_preferences enable row level security;
create policy "prefs_user_scoped" on user_career_preferences 
  for all using (auth.uid() = user_id);

-- ============================================================================
-- TABLE 4: job_matches
-- ============================================================================
-- Cached job-to-user match scores

create table if not exists job_matches (
  match_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references jobs(job_id) on delete cascade,
  
  -- Match score components (each 0-100)
  specialty_fit integer,
  subspecialty_fit integer,
  career_track_fit integer,
  evidence_fit integer, -- how much user's FISCMAK evidence aligns
  lifestyle_fit integer, -- location, remote, call burden, time
  growth_fit integer, -- learning, advancement potential
  
  -- Overall score
  overall_fit_score integer, -- weighted average (0-100)
  confidence_level numeric(3,2), -- how confident in this score (0.0-1.0)
  
  -- Risk flags & gaps
  risk_flags text[], -- ['unclear_protected_time', 'visa_uncertain', 'high_call']
  major_gaps text[], -- what's missing from job description
  strengths_for_role text[], -- why this user fits
  
  -- Career narrative angle
  positioning_angle text, -- how to position in CV/cover letter for this role
  cover_letter_draft text, -- suggested talking points
  
  -- User interaction
  user_viewed_at timestamp with time zone,
  user_bookmarked_at timestamp with time zone,
  user_saved_job_id uuid, -- if saved to user_saved_jobs
  user_notes text, -- user's private notes on this match
  
  -- Admin flags
  is_flagged_for_review boolean default false, -- liability review
  flag_reason text,
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  unique(user_id, job_id)
);

comment on table job_matches is 'Match scores between users and jobs';

create index if not exists idx_matches_user on job_matches(user_id);
create index if not exists idx_matches_job on job_matches(job_id);
create index if not exists idx_matches_score on job_matches(overall_fit_score desc);
create index if not exists idx_matches_viewed on job_matches(user_viewed_at);

alter table job_matches enable row level security;
create policy "matches_user_scoped" on job_matches 
  for all using (auth.uid() = user_id);

-- ============================================================================
-- TABLE 5: user_saved_jobs
-- ============================================================================
-- User's saved/liked/bookmarked jobs

create table if not exists user_saved_jobs (
  saved_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references jobs(job_id) on delete cascade,
  
  -- User action
  action_type text default 'saved', -- 'saved', 'liked', 'shared', 'applied'
  notes text, -- user's private notes: "follow up in June", "discussed with mentor"
  tags text[], -- user's tags: ['teaching_heavy', 'good_culture']
  
  -- Application tracking
  applied_at timestamp with time zone,
  application_status text, -- 'not_applied', 'interested', 'applied', 'rejected', 'interview', 'offer'
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  
  unique(user_id, job_id)
);

comment on table user_saved_jobs is 'Jobs users have saved or applied to';

create index if not exists idx_saved_user on user_saved_jobs(user_id);
create index if not exists idx_saved_applied on user_saved_jobs(applied_at);

alter table user_saved_jobs enable row level security;
create policy "saved_user_scoped" on user_saved_jobs 
  for all using (auth.uid() = user_id);

-- ============================================================================
-- VIEWS FOR JOB SEARCH UI
-- ============================================================================

-- User's job matches, ranked by fit
create or replace view user_job_matches_ranked as
select 
  jm.match_id,
  jm.user_id,
  j.job_id,
  j.title,
  j.employer,
  j.location_city,
  j.location_state,
  j.specialty_key,
  j.subspecialty_key,
  j.setting,
  j.salary_min,
  j.salary_max,
  jm.overall_fit_score,
  jm.specialty_fit,
  jm.career_track_fit,
  jm.evidence_fit,
  jm.lifestyle_fit,
  jm.risk_flags,
  jm.positioning_angle,
  usj.saved_id is not null as is_saved,
  usj.application_status,
  jm.created_at
from job_matches jm
join jobs j on jm.job_id = j.job_id
left join user_saved_jobs usj on jm.user_id = usj.user_id and jm.job_id = usj.job_id
where j.is_active = true
order by jm.overall_fit_score desc;

-- Jobs by specialty + filter
create or replace view jobs_by_specialty as
select 
  j.job_id,
  j.title,
  j.employer,
  j.specialty_key,
  j.subspecialty_key,
  j.location_city,
  j.location_state,
  j.setting,
  j.clinical_percent,
  j.teaching_percent,
  j.research_percent,
  j.call_burden,
  j.salary_min,
  j.salary_max,
  count(*) over (partition by j.specialty_key) as jobs_in_specialty
from jobs j
where j.is_active = true;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Calculate specialty fit (simple version)
create or replace function calc_specialty_fit(
  p_user_specialty_id uuid,
  p_job_specialty_id uuid
) returns integer as $$
begin
  if p_user_specialty_id = p_job_specialty_id then
    return 100;
  else
    return 50; -- some cross-specialty fit
  end if;
end;
$$ language plpgsql immutable;

-- Calculate lifestyle fit based on preferences + job conditions
create or replace function calc_lifestyle_fit(
  p_user_id uuid,
  p_job_id uuid
) returns integer as $$
declare
  v_pref record;
  v_job record;
  v_score integer := 0;
  v_max_score integer := 0;
begin
  select * into v_pref from user_career_preferences where user_id = p_user_id;
  select * into v_job from jobs where job_id = p_job_id;
  
  if v_pref is null or v_job is null then
    return 50;
  end if;
  
  -- Location fit
  if v_pref.preferred_locations && array[coalesce(v_job.location_city, ''), coalesce(v_job.location_state, '')] then
    v_score := v_score + 30;
  elsif v_pref.willing_to_relocate then
    v_score := v_score + 15;
  end if;
  v_max_score := v_max_score + 30;
  
  -- Remote fit
  if v_pref.preferred_remote_type = 'any' or v_pref.preferred_remote_type = v_job.remote_type then
    v_score := v_score + 20;
  end if;
  v_max_score := v_max_score + 20;
  
  -- Call burden fit
  if v_pref.max_call_burden = 'flexible' or v_pref.max_call_burden = v_job.call_burden then
    v_score := v_score + 25;
  end if;
  v_max_score := v_max_score + 25;
  
  -- Protected time fit
  if (v_job.protected_time_admin or v_job.protected_time_research or v_job.protected_time_teaching) then
    v_score := v_score + 25;
  end if;
  v_max_score := v_max_score + 25;
  
  if v_max_score = 0 then
    return 50;
  end if;
  
  return (v_score::numeric / v_max_score::numeric * 100)::integer;
end;
$$ language plpgsql stable;

-- Update all job matches for a user (run nightly)
create or replace function update_job_matches_for_user(p_user_id uuid) returns void as $$
declare
  v_user_specialty_id uuid;
  v_job record;
begin
  -- Get user's specialty
  select user_specialty_id into v_user_specialty_id from app_users where user_id = p_user_id;
  
  -- Recalculate matches for all active jobs
  for v_job in select job_id from jobs where is_active = true and expires_at > now()
  loop
    insert into job_matches (
      user_id, job_id,
      specialty_fit,
      lifestyle_fit,
      overall_fit_score,
      confidence_level
    ) values (
      p_user_id, v_job.job_id,
      calc_specialty_fit(v_user_specialty_id, (select specialty_id from jobs where job_id = v_job.job_id)),
      calc_lifestyle_fit(p_user_id, v_job.job_id),
      (
        calc_specialty_fit(v_user_specialty_id, (select specialty_id from jobs where job_id = v_job.job_id)) * 0.2 +
        calc_lifestyle_fit(p_user_id, v_job.job_id) * 0.3 +
        70 -- placeholder for evidence_fit + career_track_fit
      )::integer,
      0.75
    )
    on conflict (user_id, job_id) do update set
      specialty_fit = excluded.specialty_fit,
      lifestyle_fit = excluded.lifestyle_fit,
      overall_fit_score = excluded.overall_fit_score,
      updated_at = now();
  end loop;
end;
$$ language plpgsql;

-- ============================================================================
-- END OF CAREER FIT ENGINE SCHEMA
-- ============================================================================

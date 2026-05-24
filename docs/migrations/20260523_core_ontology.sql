-- FISCMAK Core Ontology Layer
-- Created: 2026-05-23
-- Purpose: Reference tables that define what activities mean and how they map to competencies, tracks, levels, and outputs
-- Dependencies: Requires app_users and auth schema to exist (RLS references)

-- ============================================================================
-- TABLE 1: ontology_sources
-- ============================================================================
-- Tracks where each concept came from (ACGME, Clinician Educator, proprietary, etc.)

create table if not exists ontology_sources (
  source_id uuid primary key default gen_random_uuid(),
  source_name text not null unique,
  source_type text, -- 'ACGME', 'Clinician Educator Milestones', 'FISCMAK Proprietary', 'AAMC', 'CanMEDS', 'Dreyfus', etc.
  url text,
  citation_note text,
  version text,
  active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

comment on table ontology_sources is 'Tracks the source and citation for all ontology concepts';

-- Seed sources
insert into ontology_sources (source_name, source_type, url, citation_note, version, active) values
  ('ACGME', 'ACGME', 'https://www.acgme.org', 'Accreditation Council for Graduate Medical Education', '2024', true),
  ('Clinician Educator Milestones', 'ACGME', 'https://www.acgme.org/globalassets/pfassets/programresources/clinicianeducator.pdf', 'ACGME Clinician-Educator Track Milestones', '2024', true),
  ('FISCMAK Proprietary', 'FISCMAK Proprietary', null, 'Invisible work activities and mappings developed for FISCMAK', '1.0', true)
on conflict (source_name) do nothing;

-- ============================================================================
-- TABLE 2: ontology_specialties
-- ============================================================================
-- Canonical list of medical specialties

create table if not exists ontology_specialties (
  specialty_id uuid primary key default gen_random_uuid(),
  specialty_key text not null unique, -- stable key: 'psych', 'im', 'em', etc.
  name text not null,
  acgme_review_committee text,
  aliases text[], -- alternative names
  active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

comment on table ontology_specialties is 'Canonical specialty reference list from ACGME';
create index if not exists idx_specialties_key on ontology_specialties(specialty_key);

-- Seed specialties (start with core ones, can expand)
insert into ontology_specialties (specialty_key, name, acgme_review_committee, aliases, active) values
  ('psych', 'Psychiatry', 'Psychiatry', '{"Psychiatry", "Psych", "Psychiatric Medicine"}', true),
  ('im', 'Internal Medicine', 'Internal Medicine', '{"Internal Medicine", "Medicine", "IM"}', true),
  ('em', 'Emergency Medicine', 'Emergency Medicine', '{"Emergency Medicine", "EM", "Emergency"}', true),
  ('surgery', 'General Surgery', 'Surgery', '{"General Surgery", "Surgery", "Gen Surg"}', true),
  ('peds', 'Pediatrics', 'Pediatrics', '{"Pediatrics", "Peds", "Child Medicine"}', true),
  ('fm', 'Family Medicine', 'Family Medicine', '{"Family Medicine", "FM", "Family Practice"}', true),
  ('ob', 'Obstetrics and Gynecology', 'Obstetrics and Gynecology', '{"Obstetrics and Gynecology", "OB/GYN", "OBGYN"}', true),
  ('neuro', 'Neurology', 'Neurology', '{"Neurology", "Neuro"}', true),
  ('pathology', 'Pathology', 'Pathology', '{"Pathology", "Anatomic Pathology", "Clinical Pathology"}', true),
  ('radiology', 'Radiology', 'Radiology', '{"Radiology", "Diagnostic Radiology"}', true)
on conflict (specialty_key) do nothing;

-- ============================================================================
-- TABLE 3: ontology_subspecialties
-- ============================================================================
-- Fellowship types and specialty branches

create table if not exists ontology_subspecialties (
  subspecialty_id uuid primary key default gen_random_uuid(),
  subspecialty_key text not null unique,
  specialty_id uuid not null references ontology_specialties(specialty_id),
  name text not null,
  acgme_accredited boolean default true,
  residency_dependency_status text, -- 'Yes, Always' | 'Yes, With Exceptions' | 'No'
  aliases text[],
  active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

comment on table ontology_subspecialties is 'Fellowship programs and specialty branches';
create index if not exists idx_subspecialties_specialty on ontology_subspecialties(specialty_id);
create index if not exists idx_subspecialties_key on ontology_subspecialties(subspecialty_key);

-- Seed psychiatry fellowships
insert into ontology_subspecialties (subspecialty_key, specialty_id, name, acgme_accredited, residency_dependency_status, aliases, active)
select 'psych_child_adolescent', specialty_id, 'Child and Adolescent Psychiatry', true, 'Yes, Always', '{"CAP", "Child Psych"}', true from ontology_specialties where specialty_key = 'psych'
union all
select 'psych_forensic', specialty_id, 'Forensic Psychiatry', true, 'Yes, With Exceptions', '{"Forensic Psych"}', true from ontology_specialties where specialty_key = 'psych'
union all
select 'psych_geriatric', specialty_id, 'Geriatric Psychiatry', true, 'Yes, With Exceptions', '{"Geriatric Psych"}', true from ontology_specialties where specialty_key = 'psych'
union all
select 'psych_addiction', specialty_id, 'Addiction Psychiatry', true, 'Yes, With Exceptions', '{"Addiction Psych"}', true from ontology_specialties where specialty_key = 'psych'
union all
select 'psych_cl', specialty_id, 'Consultation-Liaison Psychiatry', true, 'Yes, With Exceptions', '{"CL Psych", "Psychosomatic Medicine"}', true from ontology_specialties where specialty_key = 'psych'
union all
select 'psych_sleep', specialty_id, 'Sleep Medicine', true, 'No', '{"Sleep"}', true from ontology_specialties where specialty_key = 'psych'
on conflict (subspecialty_key) do nothing;

-- ============================================================================
-- TABLE 4: ontology_competency_domains
-- ============================================================================
-- Broad competency buckets (ACGME 6 + FISCMAK domains)

create table if not exists ontology_competency_domains (
  domain_id uuid primary key default gen_random_uuid(),
  domain_key text not null unique, -- 'pc', 'mk', 'prof', 'teaching', etc.
  name text not null,
  framework text, -- 'ACGME', 'Clinician Educator', 'FISCMAK'
  description text,
  source_id uuid references ontology_sources(source_id),
  active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

comment on table ontology_competency_domains is 'Broad competency domains (ACGME 6 + FISCMAK native)';
create index if not exists idx_domains_key on ontology_competency_domains(domain_key);
create index if not exists idx_domains_framework on ontology_competency_domains(framework);

-- Seed domains
insert into ontology_competency_domains (domain_key, name, framework, description, source_id, active)
select 
  'pc', 'Patient Care', 'ACGME', 
  'Ability to provide patient care that is compassionate, appropriate, and effective for the treatment of health problems and the promotion of health.',
  source_id, true
from ontology_sources where source_name = 'ACGME'
union all
select 
  'mk', 'Medical Knowledge', 'ACGME',
  'Demonstration of knowledge of established and evolving biomedical, clinical, and cognate sciences and the application of this knowledge to patient care.',
  source_id, true
from ontology_sources where source_name = 'ACGME'
union all
select 
  'pbli', 'Practice-Based Learning and Improvement', 'ACGME',
  'Ability to investigate and evaluate their patient care practices, appraise and assimilate scientific evidence, and improve their patient care practices.',
  source_id, true
from ontology_sources where source_name = 'ACGME'
union all
select 
  'ics', 'Interpersonal and Communication Skills', 'ACGME',
  'Ability to demonstrate interpersonal and communication skills that result in effective information exchange and collaboration.',
  source_id, true
from ontology_sources where source_name = 'ACGME'
union all
select 
  'prof', 'Professionalism', 'ACGME',
  'Demonstration of a commitment to carrying out professional responsibilities and an adherence to ethical principles.',
  source_id, true
from ontology_sources where source_name = 'ACGME'
union all
select 
  'sbp', 'Systems-Based Practice', 'ACGME',
  'Ability to work effectively in various health care settings and to manage system resources to provide care that is safe, timely, efficient, effective, and equitable.',
  source_id, true
from ontology_sources where source_name = 'ACGME'
union all
select 
  'teaching', 'Teaching and Facilitation', 'FISCMAK',
  'Ability to teach, facilitate learning, and assess learners',
  source_id, true
from ontology_sources where source_name = 'Clinician Educator Milestones'
union all
select 
  'mentorship', 'Mentorship and Sponsorship', 'FISCMAK',
  'Ability to mentor, coach, and sponsor learners and colleagues through career development',
  source_id, true
from ontology_sources where source_name = 'Clinician Educator Milestones'
union all
select 
  'leadership', 'Leadership', 'FISCMAK',
  'Ability to lead, influence, and manage teams and initiatives',
  source_id, true
from ontology_sources where source_name = 'Clinician Educator Milestones'
union all
select 
  'admin', 'Administration', 'FISCMAK',
  'Ability to manage administrative responsibilities and programs',
  source_id, true
from ontology_sources where source_name = 'Clinician Educator Milestones'
union all
select 
  'wellbeing', 'Well-Being', 'FISCMAK',
  'Commitment to personal well-being and support of others''s well-being',
  source_id, true
from ontology_sources where source_name = 'Clinician Educator Milestones'
union all
select 
  'scholarship', 'Scholarship and Dissemination', 'FISCMAK',
  'Ability to conduct, evaluate, and disseminate scholarship',
  source_id, true
from ontology_sources where source_name = 'Clinician Educator Milestones'
union all
select 
  'innovation', 'Innovation and Informatics', 'FISCMAK',
  'Ability to innovate and use technology to improve care and education',
  source_id, true
from ontology_sources where source_name = 'FISCMAK Proprietary'
union all
select 
  'advocacy', 'Advocacy', 'FISCMAK',
  'Ability to advocate for learners, patients, and systems',
  source_id, true
from ontology_sources where source_name = 'FISCMAK Proprietary'
union all
select 
  'identity', 'Professional Identity Formation', 'FISCMAK',
  'Ability to support development of professional identity in self and others',
  source_id, true
from ontology_sources where source_name = 'Clinician Educator Milestones'
on conflict (domain_key) do nothing;

-- ============================================================================
-- TABLE 5: ontology_subcompetencies
-- ============================================================================
-- Granular competency behaviors (seeded from Clinician Educator Milestones)

create table if not exists ontology_subcompetencies (
  subcompetency_id uuid primary key default gen_random_uuid(),
  subcompetency_key text not null unique,
  domain_id uuid not null references ontology_competency_domains(domain_id),
  name text not null,
  description text,
  source_id uuid references ontology_sources(source_id),
  acgme_milestone_reference text, -- e.g., "Clinician Educator Milestones - Educational Theory and Practice 4"
  active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

comment on table ontology_subcompetencies is 'Granular competency behaviors (Clinician Educator Milestones primary source)';
create index if not exists idx_subcompetencies_domain on ontology_subcompetencies(domain_id);
create index if not exists idx_subcompetencies_key on ontology_subcompetencies(subcompetency_key);

-- Seed subcompetencies from Clinician Educator Milestones
insert into ontology_subcompetencies (subcompetency_key, domain_id, name, description, source_id, acgme_milestone_reference, active)
select 'reflective_practice', domain_id, 'Reflective Practice and Commitment to Personal Growth', 'Engages in ongoing self-reflection regarding personal strengths, limitations, and practice patterns', source_id, 'Clinician Educator Milestones - Universal Pillars 1', true from ontology_competency_domains where domain_key = 'mentorship' limit 1
union all
select 'personal_wellbeing', (select domain_id from ontology_competency_domains where domain_key = 'wellbeing'), 'Personal Well-Being', 'Demonstrates personal strategies for well-being and self-care', (select source_id from ontology_sources where source_name = 'Clinician Educator Milestones'), 'Clinician Educator Milestones - Universal Pillars 2', true
union all
select 'bias_assumptions', (select domain_id from ontology_competency_domains where domain_key = 'prof'), 'Recognition and Mitigation of Personal Perspectives and Assumptions', 'Identifies and addresses personal biases and their impact on patients, learners, and colleagues', (select source_id from ontology_sources where source_name = 'Clinician Educator Milestones'), 'Clinician Educator Milestones - Universal Pillars 3', true
union all
select 'professional_responsibility', (select domain_id from ontology_competency_domains where domain_key = 'prof'), 'Commitment to Professional Responsibilities', 'Fulfills professional obligations and maintains accountability', (select source_id from ontology_sources where source_name = 'Clinician Educator Milestones'), 'Clinician Educator Milestones - Universal Pillars 4', true
union all
select 'teaching_learning', (select domain_id from ontology_competency_domains where domain_key = 'teaching'), 'Teaching and Facilitating Learning', 'Facilitates learning through skilled instruction and creation of supportive learning environments', (select source_id from ontology_sources where source_name = 'Clinician Educator Milestones'), 'Clinician Educator Milestones - Educational Theory and Practice 1', true
union all
select 'learning_environment_prof', (select domain_id from ontology_competency_domains where domain_key = 'teaching'), 'Professionalism in the Learning Environment', 'Establishes a professional, ethical, and inclusive learning environment', (select source_id from ontology_sources where source_name = 'Clinician Educator Milestones'), 'Clinician Educator Milestones - Educational Theory and Practice 2', true
union all
select 'learner_assessment', (select domain_id from ontology_competency_domains where domain_key = 'teaching'), 'Learner Assessment', 'Selects and uses assessment methods appropriate for educational context and learner needs', (select source_id from ontology_sources where source_name = 'Clinician Educator Milestones'), 'Clinician Educator Milestones - Educational Theory and Practice 3', true
union all
select 'feedback', (select domain_id from ontology_competency_domains where domain_key = 'teaching'), 'Feedback', 'Fosters conversations that motivate learners to incorporate feedback and improve performance', (select source_id from ontology_sources where source_name = 'Clinician Educator Milestones'), 'Clinician Educator Milestones - Educational Theory and Practice 4', true
union all
select 'remediation', (select domain_id from ontology_competency_domains where domain_key = 'teaching'), 'Performance Improvement and Remediation', 'Identifies struggling learners and supports their improvement through tailored interventions', (select source_id from ontology_sources where source_name = 'Clinician Educator Milestones'), 'Clinician Educator Milestones - Educational Theory and Practice 5', true
union all
select 'program_eval', (select domain_id from ontology_competency_domains where domain_key = 'leadership'), 'Programmatic Evaluation', 'Participates in evaluation of educational programs and learner outcomes', (select source_id from ontology_sources where source_name = 'Clinician Educator Milestones'), 'Clinician Educator Milestones - Educational Theory and Practice 6', true
union all
select 'learner_prof_dev', (select domain_id from ontology_competency_domains where domain_key = 'mentorship'), 'Learner Professional Development', 'Supports learners in professional identity formation and career development', (select source_id from ontology_sources where source_name = 'Clinician Educator Milestones'), 'Clinician Educator Milestones - Educational Theory and Practice 7', true
union all
select 'science_learning', (select domain_id from ontology_competency_domains where domain_key = 'teaching'), 'Science of Learning', 'Incorporates best practices from learning sciences into teaching', (select source_id from ontology_sources where source_name = 'Clinician Educator Milestones'), 'Clinician Educator Milestones - Educational Theory and Practice 8', true
union all
select 'med_ed_scholarship', (select domain_id from ontology_competency_domains where domain_key = 'scholarship'), 'Medical Education Scholarship', 'Conducts and disseminates medical education scholarship', (select source_id from ontology_sources where source_name = 'Clinician Educator Milestones'), 'Clinician Educator Milestones - Educational Theory and Practice 9', true
union all
select 'learning_environment', (select domain_id from ontology_competency_domains where domain_key = 'leadership'), 'Learning Environment', 'Fosters a learning environment that supports educational mission and learner development', (select source_id from ontology_sources where source_name = 'Clinician Educator Milestones'), 'Clinician Educator Milestones - Educational Theory and Practice 10', true
union all
select 'curriculum', (select domain_id from ontology_competency_domains where domain_key = 'teaching'), 'Curriculum Design and Adaptation', 'Designs and adapts curriculum to meet learner and program needs', (select source_id from ontology_sources where source_name = 'Clinician Educator Milestones'), 'Clinician Educator Milestones - Educational Theory and Practice 11', true
union all
select 'learner_colleague_wellbeing', (select domain_id from ontology_competency_domains where domain_key = 'wellbeing'), 'Well-Being of Learners and Colleagues', 'Promotes well-being and resilience in learners and colleagues', (select source_id from ontology_sources where source_name = 'Clinician Educator Milestones'), 'Clinician Educator Milestones - Well-Being 1', true
union all
select 'admin_skills', (select domain_id from ontology_competency_domains where domain_key = 'admin'), 'Administration Skills', 'Manages administrative and operational responsibilities effectively', (select source_id from ontology_sources where source_name = 'Clinician Educator Milestones'), 'Clinician Educator Milestones - Administration 1', true
union all
select 'leadership_skills', (select domain_id from ontology_competency_domains where domain_key = 'leadership'), 'Leadership Skills', 'Demonstrates effective leadership and influence', (select source_id from ontology_sources where source_name = 'Clinician Educator Milestones'), 'Clinician Educator Milestones - Administration 2', true
union all
select 'change_management', (select domain_id from ontology_competency_domains where domain_key = 'leadership'), 'Change Management', 'Leads and manages organizational change effectively', (select source_id from ontology_sources where source_name = 'Clinician Educator Milestones'), 'Clinician Educator Milestones - Administration 3', true
on conflict (subcompetency_key) do nothing;

-- ============================================================================
-- TABLE 6: ontology_development_levels
-- ============================================================================
-- 1-5 scale from recognition through system-building

create table if not exists ontology_development_levels (
  level_id uuid primary key default gen_random_uuid(),
  level_key text not null unique, -- 'level_1', 'level_2', etc.
  numeric_value integer not null unique,
  name text not null,
  description text,
  active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

comment on table ontology_development_levels is 'Developmental progression from novice to expert/system-builder';
create index if not exists idx_levels_numeric on ontology_development_levels(numeric_value);

-- Seed levels
insert into ontology_development_levels (level_key, numeric_value, name, description, active) values
  ('level_1', 1, 'Recognizes', 'Can identify, name, or describe the competency or skill', true),
  ('level_2', 2, 'Participates', 'Helps with or applies under guidance; developing independence', true),
  ('level_3', 3, 'Performs', 'Independently applies skill in routine contexts', true),
  ('level_4', 4, 'Leads', 'Leads others; adapts across complex contexts', true),
  ('level_5', 5, 'Builds Systems', 'Creates systems, teaches others, disseminates, changes practice', true)
on conflict (level_key) do nothing;

-- ============================================================================
-- TABLE 7: ontology_career_tracks
-- ============================================================================
-- Canonical career pathways

create table if not exists ontology_career_tracks (
  track_id uuid primary key default gen_random_uuid(),
  track_key text not null unique, -- 'clinician', 'clinician_educator', etc.
  name text not null,
  description text,
  active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

comment on table ontology_career_tracks is 'Canonical career pathway options';
create index if not exists idx_tracks_key on ontology_career_tracks(track_key);

-- Seed career tracks
insert into ontology_career_tracks (track_key, name, description, active) values
  ('clinician', 'Clinician', 'Clinical practice and direct patient care', true),
  ('clinician_educator', 'Clinician Educator', 'Teaching, mentoring, and learner development', true),
  ('researcher', 'Researcher / Scholar', 'Research, scholarship, and dissemination', true),
  ('program_leader', 'Program Leader', 'Program direction and educational leadership', true),
  ('systems_leader', 'Systems Leader', 'System-level change and improvement', true),
  ('administrator', 'Administrator', 'Administrative and operational leadership', true),
  ('innovator', 'Innovator / Informaticist', 'Innovation, technology, and informatics', true),
  ('advocate', 'Advocate', 'Advocacy, social responsibility, and equity', true),
  ('wellness_champion', 'Wellness Champion', 'Well-being, resilience, and burnout prevention', true),
  ('consultant', 'Consultant', 'Consulting and expertise sharing', true),
  ('executive', 'Executive Leader', 'Executive and organizational leadership', true)
on conflict (track_key) do nothing;

-- ============================================================================
-- TABLE 8: ontology_activity_categories
-- ============================================================================
-- Broad types of invisible work

create table if not exists ontology_activity_categories (
  category_id uuid primary key default gen_random_uuid(),
  category_key text not null unique,
  name text not null,
  description text,
  active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

comment on table ontology_activity_categories is 'Categories of invisible work activities';
create index if not exists idx_categories_key on ontology_activity_categories(category_key);

-- Seed activity categories
insert into ontology_activity_categories (category_key, name, description, active) values
  ('teaching', 'Teaching', 'Formal and informal teaching activities', true),
  ('mentorship', 'Mentorship', 'Mentoring, coaching, and sponsorship activities', true),
  ('feedback', 'Feedback', 'Giving and receiving feedback', true),
  ('remediation', 'Remediation', 'Supporting struggling learners and performance improvement', true),
  ('leadership', 'Leadership', 'Leading meetings, teams, and initiatives', true),
  ('admin', 'Administration', 'Administrative and operational work', true),
  ('systems_improvement', 'Systems Improvement', 'Identifying and implementing workflow/process improvements', true),
  ('advocacy', 'Advocacy', 'Speaking up and advocating for change', true),
  ('wellbeing', 'Well-Being', 'Recognizing and supporting well-being in self and others', true),
  ('scholarship', 'Scholarship', 'Research, presentation, and dissemination activities', true),
  ('curriculum', 'Curriculum', 'Creating educational content and curriculum design', true),
  ('informatics', 'Informatics', 'Technology, tools, and data management', true),
  ('identity', 'Professional Identity', 'Supporting professional identity formation and career planning', true),
  ('coordination', 'Invisible Coordination', 'Behind-the-scenes alignment and coordination work', true)
on conflict (category_key) do nothing;

-- ============================================================================
-- TABLE 9: ontology_invisible_work_activities
-- ============================================================================
-- Proprietary core: the actual activities users log

create table if not exists ontology_invisible_work_activities (
  activity_id uuid primary key default gen_random_uuid(),
  activity_key text not null unique, -- 'gave_feedback', 'mentored_trainee', etc.
  activity_name text not null,
  category_id uuid not null references ontology_activity_categories(category_id),
  plain_language_description text, -- What does this activity mean in human terms?
  context_examples text[], -- ["Helped during rounds", "During supervision", "In team meeting"]
  default_scope text default 'local', -- 'local' (one person), 'team', 'program', 'system'
  default_evidence_type text default 'narrative', -- 'narrative', 'email', 'feedback', 'leadership', 'metrics'
  is_proprietary boolean default true,
  active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

comment on table ontology_invisible_work_activities is 'Canonical invisible work activities—the proprietary heart of FISCMAK';
create index if not exists idx_activities_key on ontology_invisible_work_activities(activity_key);
create index if not exists idx_activities_category on ontology_invisible_work_activities(category_id);

-- Seed initial invisible work activities
insert into ontology_invisible_work_activities (activity_key, activity_name, category_id, plain_language_description, context_examples, default_scope, default_evidence_type, is_proprietary, active)
select 'gave_feedback', 'Gave feedback', category_id, 'Provided reinforcing or corrective feedback to a learner or colleague to improve performance', '{"During rounds", "In supervision", "After presentation", "In one-on-one meeting"}', 'local', 'narrative', true, true from ontology_activity_categories where category_key = 'feedback'
union all
select 'mentored_trainee', 'Mentored trainee', (select category_id from ontology_activity_categories where category_key = 'mentorship'), 'Helped a learner or junior colleague think through career, performance, identity, or next steps', '{"Career planning conversation", "Professional development", "Identity formation", "Navigating challenges"}', 'local', 'narrative', true, true
union all
select 'supported_distressed_learner', 'Supported distressed learner/colleague', (select category_id from ontology_activity_categories where category_key = 'wellbeing'), 'Recognized distress, burnout, or overwhelm in a colleague and responded supportively', '{"Checked in after difficult case", "Helped process emotions", "Connected to resources", "Offered perspective"}', 'local', 'narrative', true, true
union all
select 'created_curriculum', 'Created curriculum or educational resource', (select category_id from ontology_activity_categories where category_key = 'curriculum'), 'Made an educational handout, guide, lecture, checklist, or teaching tool', '{"Created teaching script", "Built lecture slides", "Made checklist", "Designed module"}', 'team', 'artifact', true, true
union all
select 'led_meeting', 'Led meeting or workgroup', (select category_id from ontology_activity_categories where category_key = 'leadership'), 'Organized people around a decision, project, or improvement; facilitated discussion', '{"Faculty meeting", "QI workgroup", "Committee meeting", "Team huddle"}', 'team', 'narrative', true, true
union all
select 'improved_workflow', 'Improved workflow or process', (select category_id from ontology_activity_categories where category_key = 'systems_improvement'), 'Identified a broken process and changed or improved it', '{"Streamlined handoff", "Reduced bottleneck", "Changed documentation flow", "Improved scheduling"}', 'team', 'narrative', true, true
union all
select 'coordinated_complex_care', 'Coordinated complex care or services', (select category_id from ontology_activity_categories where category_key = 'coordination'), 'Aligned multiple people, services, or stakeholders around patient or program needs', '{"Family meeting coordination", "Interdepartmental alignment", "Care team alignment", "Service coordination"}', 'team', 'narrative', true, true
union all
select 'gave_informal_teaching', 'Gave informal teaching', (select category_id from ontology_activity_categories where category_key = 'teaching'), 'Taught a clinical concept during rounds, supervision, or patient care', '{"Clinical teaching", "Bedside teaching", "Case-based teaching", "Opportunistic teaching"}', 'local', 'narrative', true, true
union all
select 'recognized_burnout', 'Recognized and supported burnout', (select category_id from ontology_activity_categories where category_key = 'wellbeing'), 'Noticed a colleague or learner struggling with burnout and took supportive action', '{"Offered resources", "Checked in", "Listened without judgment", "Advocated for support"}', 'local', 'narrative', true, true
union all
select 'presented_scholarship', 'Presented scholarship or QI work', (select category_id from ontology_activity_categories where category_key = 'scholarship'), 'Shared academic, educational, or quality improvement work through poster, talk, or abstract', '{"Conference presentation", "Poster presentation", "Local teaching", "Journal publication"}', 'program', 'artifact', true, true
union all
select 'received_feedback', 'Received and acted on feedback', (select category_id from ontology_activity_categories where category_key = 'feedback'), 'Used feedback from others to change behavior or improve performance', '{"Incorporated supervisor feedback", "Changed approach based on input", "Reflected and grew", "Acknowledged and corrected"}', 'local', 'narrative', true, true
union all
select 'handled_conflict', 'Managed difficult conversation or conflict', (select category_id from ontology_activity_categories where category_key = 'leadership'), 'Addressed interpersonal or workflow conflict; helped resolve tension between people or teams', '{"Mediated disagreement", "Addressed conduct issue", "Resolved team tension", "Gave difficult feedback"}', 'team', 'narrative', true, true
union all
select 'built_tool', 'Built tool, dashboard, or structured data system', (select category_id from ontology_activity_categories where category_key = 'informatics'), 'Created a dashboard, spreadsheet, or data system to track or improve something', '{"Built evaluation tracker", "Created dashboard", "Structured data collection", "Automated reporting"}', 'team', 'artifact', true, true
union all
select 'advocated_for_change', 'Advocated for learner, patient, or system change', (select category_id from ontology_activity_categories where category_key = 'advocacy'), 'Spoke up to address unfairness, bias, or barriers; advocated for change', '{"Addressed bias", "Advocated for resource", "Pushed back on policy", "Spoke up for learner"}', 'program', 'narrative', true, true
on conflict (activity_key) do nothing;

-- ============================================================================
-- TABLE 10: ontology_activity_mappings
-- ============================================================================
-- The translation engine: activity → competency → track → level → output

create table if not exists ontology_activity_mappings (
  mapping_id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references ontology_invisible_work_activities(activity_id),
  subcompetency_id uuid not null references ontology_subcompetencies(subcompetency_id),
  track_id uuid not null references ontology_career_tracks(track_id),
  default_level_id uuid references ontology_development_levels(level_id),
  confidence_default numeric(3,2) default 0.75, -- 0.00-1.00 confidence in this mapping
  weight numeric(3,2) default 1.0, -- relative strength of this mapping
  active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

comment on table ontology_activity_mappings is 'Translation engine: maps activity → subcompetency → track → level with confidence scores';
create index if not exists idx_mappings_activity on ontology_activity_mappings(activity_id);
create index if not exists idx_mappings_subcompetency on ontology_activity_mappings(subcompetency_id);
create index if not exists idx_mappings_track on ontology_activity_mappings(track_id);
create unique index if not exists idx_mappings_unique on ontology_activity_mappings(activity_id, subcompetency_id, track_id) where active = true;

-- Seed mappings: each activity connects to multiple competencies/tracks
-- Example: "mentored trainee" → learner_prof_dev + clinician_educator @ level 3
insert into ontology_activity_mappings (activity_id, subcompetency_id, track_id, default_level_id, confidence_default, weight, active)
select 
  (select activity_id from ontology_invisible_work_activities where activity_key = 'mentored_trainee'),
  (select subcompetency_id from ontology_subcompetencies where subcompetency_key = 'learner_prof_dev'),
  (select track_id from ontology_career_tracks where track_key = 'clinician_educator'),
  (select level_id from ontology_development_levels where numeric_value = 3),
  0.95, 1.0, true
union all
select 
  (select activity_id from ontology_invisible_work_activities where activity_key = 'gave_feedback'),
  (select subcompetency_id from ontology_subcompetencies where subcompetency_key = 'feedback'),
  (select track_id from ontology_career_tracks where track_key = 'clinician_educator'),
  (select level_id from ontology_development_levels where numeric_value = 3),
  0.92, 1.0, true
union all
select 
  (select activity_id from ontology_invisible_work_activities where activity_key = 'supported_distressed_learner'),
  (select subcompetency_id from ontology_subcompetencies where subcompetency_key = 'learner_colleague_wellbeing'),
  (select track_id from ontology_career_tracks where track_key = 'program_leader'),
  (select level_id from ontology_development_levels where numeric_value = 3),
  0.88, 1.0, true
union all
select 
  (select activity_id from ontology_invisible_work_activities where activity_key = 'improved_workflow'),
  (select subcompetency_id from ontology_subcompetencies where subcompetency_key = 'program_eval'),
  (select track_id from ontology_career_tracks where track_key = 'systems_leader'),
  (select level_id from ontology_development_levels where numeric_value = 3),
  0.80, 1.0, true
union all
select 
  (select activity_id from ontology_invisible_work_activities where activity_key = 'created_curriculum'),
  (select subcompetency_id from ontology_subcompetencies where subcompetency_key = 'curriculum'),
  (select track_id from ontology_career_tracks where track_key = 'clinician_educator'),
  (select level_id from ontology_development_levels where numeric_value = 3),
  0.90, 1.0, true
union all
select 
  (select activity_id from ontology_invisible_work_activities where activity_key = 'led_meeting'),
  (select subcompetency_id from ontology_subcompetencies where subcompetency_key = 'leadership_skills'),
  (select track_id from ontology_career_tracks where track_key = 'program_leader'),
  (select level_id from ontology_development_levels where numeric_value = 3),
  0.85, 1.0, true
union all
select 
  (select activity_id from ontology_invisible_work_activities where activity_key = 'presented_scholarship'),
  (select subcompetency_id from ontology_subcompetencies where subcompetency_key = 'med_ed_scholarship'),
  (select track_id from ontology_career_tracks where track_key = 'researcher'),
  (select level_id from ontology_development_levels where numeric_value = 3),
  0.88, 1.0, true
union all
select 
  (select activity_id from ontology_invisible_work_activities where activity_key = 'handled_conflict'),
  (select subcompetency_id from ontology_subcompetencies where subcompetency_key = 'leadership_skills'),
  (select track_id from ontology_career_tracks where track_key = 'program_leader'),
  (select level_id from ontology_development_levels where numeric_value = 2),
  0.82, 1.0, true
union all
select 
  (select activity_id from ontology_invisible_work_activities where activity_key = 'built_tool'),
  (select subcompetency_id from ontology_subcompetencies where subcompetency_key = 'admin_skills'),
  (select track_id from ontology_career_tracks where track_key = 'innovator'),
  (select level_id from ontology_development_levels where numeric_value = 3),
  0.85, 1.0, true
on conflict (activity_id, subcompetency_id, track_id) do nothing;

-- ============================================================================
-- TABLE 11: ontology_output_templates
-- ============================================================================
-- Translates activity → CV bullet / promotion language / annual review

create table if not exists ontology_output_templates (
  template_id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references ontology_invisible_work_activities(activity_id),
  output_type text not null, -- 'cv_bullet', 'annual_review', 'promotion_packet', 'teaching_portfolio', 'fellowship_narrative'
  template_text text not null, -- The actual language template (may contain {placeholders})
  confidence_default numeric(3,2) default 0.75,
  active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

comment on table ontology_output_templates is 'Templates that translate activities into CV, promotion, and annual review language';
create index if not exists idx_templates_activity on ontology_output_templates(activity_id);
create index if not exists idx_templates_output_type on ontology_output_templates(output_type);

-- Seed output templates
insert into ontology_output_templates (activity_id, output_type, template_text, confidence_default, active)
select 
  (select activity_id from ontology_invisible_work_activities where activity_key = 'mentored_trainee'),
  'cv_bullet',
  'Mentored trainees in career development, professional identity formation, and clinical growth through individualized coaching and longitudinal support.',
  0.85, true
union all
select 
  (select activity_id from ontology_invisible_work_activities where activity_key = 'mentored_trainee'),
  'annual_review',
  'Demonstrated commitment to learner development and professional identity formation through longitudinal mentoring and personalized guidance.',
  0.82, true
union all
select 
  (select activity_id from ontology_invisible_work_activities where activity_key = 'gave_feedback'),
  'cv_bullet',
  'Provided effective formative and summative feedback to learners to support ongoing professional development and performance improvement.',
  0.88, true
union all
select 
  (select activity_id from ontology_invisible_work_activities where activity_key = 'created_curriculum'),
  'cv_bullet',
  'Designed and implemented educational resources and curriculum materials to support learner development and clinical education.',
  0.86, true
union all
select 
  (select activity_id from ontology_invisible_work_activities where activity_key = 'created_curriculum'),
  'teaching_portfolio',
  'Curriculum development: Created {artifact_type} to teach {topic}, reaching {audience_size} learners and receiving positive feedback on {metric}.',
  0.80, true
union all
select 
  (select activity_id from ontology_invisible_work_activities where activity_key = 'improved_workflow'),
  'annual_review',
  'Identified process improvement opportunities and led implementation of changes that enhanced efficiency, safety, or educational value.',
  0.80, true
union all
select 
  (select activity_id from ontology_invisible_work_activities where activity_key = 'led_meeting'),
  'cv_bullet',
  'Led workgroups, committees, and meetings to advance educational initiatives, quality improvement, and program development.',
  0.83, true
union all
select 
  (select activity_id from ontology_invisible_work_activities where activity_key = 'presented_scholarship'),
  'cv_bullet',
  'Disseminated scholarly work through {format}: {title}, presented at {venue} to advance {field} knowledge.',
  0.82, true
on conflict do nothing;

-- ============================================================================
-- RLS POLICIES
-- ============================================================================
-- All ontology tables are reference/read-only, so public read access

alter table ontology_sources enable row level security;
create policy "ontology_sources_public_read" on ontology_sources for select using (true);

alter table ontology_specialties enable row level security;
create policy "ontology_specialties_public_read" on ontology_specialties for select using (true);

alter table ontology_subspecialties enable row level security;
create policy "ontology_subspecialties_public_read" on ontology_subspecialties for select using (true);

alter table ontology_competency_domains enable row level security;
create policy "ontology_competency_domains_public_read" on ontology_competency_domains for select using (true);

alter table ontology_subcompetencies enable row level security;
create policy "ontology_subcompetencies_public_read" on ontology_subcompetencies for select using (true);

alter table ontology_development_levels enable row level security;
create policy "ontology_development_levels_public_read" on ontology_development_levels for select using (true);

alter table ontology_career_tracks enable row level security;
create policy "ontology_career_tracks_public_read" on ontology_career_tracks for select using (true);

alter table ontology_activity_categories enable row level security;
create policy "ontology_activity_categories_public_read" on ontology_activity_categories for select using (true);

alter table ontology_invisible_work_activities enable row level security;
create policy "ontology_invisible_work_activities_public_read" on ontology_invisible_work_activities for select using (true);

alter table ontology_activity_mappings enable row level security;
create policy "ontology_activity_mappings_public_read" on ontology_activity_mappings for select using (true);

alter table ontology_output_templates enable row level security;
create policy "ontology_output_templates_public_read" on ontology_output_templates for select using (true);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
-- Already created above, but summarizing here for reference

-- Already indexed:
-- - ontology_specialties(specialty_key)
-- - ontology_subspecialties(specialty_id, subspecialty_key)
-- - ontology_competency_domains(domain_key, framework)
-- - ontology_subcompetencies(domain_id, subcompetency_key)
-- - ontology_development_levels(numeric_value)
-- - ontology_career_tracks(track_key)
-- - ontology_activity_categories(category_key)
-- - ontology_invisible_work_activities(activity_key, category_id)
-- - ontology_activity_mappings(activity_id, subcompetency_id, track_id, unique constraint)
-- - ontology_output_templates(activity_id, output_type)

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

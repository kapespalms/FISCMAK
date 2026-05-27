-- FISCMAK Signal Detection Layer
-- Created: 2026-05-23
-- Purpose: Define patterns, keywords, and signals that Coach Mak listens for in user conversations
-- This layer enables intelligent routing, pattern recognition, and context-aware follow-up questions

-- ============================================================================
-- TABLE 1: signal_detection_sources
-- ============================================================================
-- Tracks where signal definitions came from

create table if not exists signal_detection_sources (
  source_id uuid primary key default gen_random_uuid(),
  source_name text not null unique,
  source_type text, -- 'FISCMAK Proprietary', 'Clinician Educator Milestones', 'Burnout Research', 'Career Development'
  description text,
  active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

comment on table signal_detection_sources is 'Where signal definitions originated';

insert into signal_detection_sources (source_name, source_type, description, active) values
  ('FISCMAK Signal Research', 'FISCMAK Proprietary', 'Signals derived from physician narrative analysis and coaching experience', true),
  ('Clinician Educator Milestones', 'Clinician Educator Milestones', 'Signals extracted from CE milestone descriptors and behaviors', true),
  ('Well-Being Literature', 'Burnout Research', 'Signals from well-being, burnout, and resilience research', true),
  ('Career Development Theory', 'Career Development', 'Signals from career trajectory and identity formation theory', true)
on conflict (source_name) do nothing;

-- ============================================================================
-- TABLE 2: signal_categories
-- ============================================================================
-- Broad signal families that Mak listens for

create table if not exists signal_categories (
  category_id uuid primary key default gen_random_uuid(),
  category_key text not null unique,
  name text not null,
  description text,
  order_priority integer default 100, -- Mak checks higher priority first
  active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

comment on table signal_categories is 'Broad signal families (leadership, mentorship, systems-thinking, etc.)';
create index if not exists idx_signal_categories_key on signal_categories(category_key);
create index if not exists idx_signal_categories_priority on signal_categories(order_priority);

insert into signal_categories (category_key, name, description, order_priority, active) values
  ('mentorship', 'Mentorship & Sponsorship', 'Patterns of coaching, guiding, and sponsoring others', 10, true),
  ('leadership', 'Leadership & Influence', 'Patterns of leading teams, making decisions, influencing outcomes', 20, true),
  ('systems_thinking', 'Systems Thinking & Improvement', 'Patterns of identifying problems, proposing changes, improving processes', 30, true),
  ('advocacy', 'Advocacy & Speaking Up', 'Patterns of advocating for people, resources, or change', 40, true),
  ('emotional_labor', 'Emotional Labor & Support', 'Patterns of emotional work, supporting others, holding space for struggle', 50, true),
  ('teaching', 'Teaching & Facilitation', 'Patterns of formal and informal teaching, learning design', 60, true),
  ('feedback', 'Feedback & Reflection', 'Patterns of giving/receiving feedback, reflecting on experience', 70, true),
  ('scholarship', 'Scholarship & Dissemination', 'Patterns of research, presenting, publishing, creating knowledge', 80, true),
  ('innovation', 'Innovation & Technology', 'Patterns of building tools, improving workflows with technology', 90, true),
  ('wellbeing', 'Well-Being Awareness', 'Patterns indicating burnout, resilience, or well-being attention', 100, true),
  ('role_clarity', 'Role & Identity Clarity', 'Patterns indicating clarity or confusion about professional role/identity', 110, true),
  ('skill_domain_gap', 'Skill Domain Gap', 'Patterns indicating skill gaps or development needs', 120, true)
on conflict (category_key) do nothing;

-- ============================================================================
-- TABLE 3: signal_indicators
-- ============================================================================
-- The actual signals: keywords, phrases, patterns Mak listens for

create table if not exists signal_indicators (
  indicator_id uuid primary key default gen_random_uuid(),
  category_id uuid not null references signal_categories(category_id),
  indicator_key text not null unique,
  indicator_name text not null,
  indicator_type text default 'keyword', -- 'keyword', 'phrase', 'pattern', 'question_trigger', 'behavioral'
  keywords text[], -- exact words/phrases to match
  regex_pattern text, -- optional regex for complex matches
  description text, -- what this signal means
  confidence_default numeric(3,2) default 0.70, -- base confidence 0.0-1.0
  source_id uuid references signal_detection_sources(source_id),
  related_activities text[], -- activity_keys this signal maps to
  related_competencies text[], -- competency_keys this signals
  followup_question text, -- coaching question to ask when detected
  active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

comment on table signal_indicators is 'Individual signals: keywords, phrases, and patterns Mak listens for';
create index if not exists idx_indicators_category on signal_indicators(category_id);
create index if not exists idx_indicators_key on signal_indicators(indicator_key);
create index if not exists idx_indicators_type on signal_indicators(indicator_type);

-- ============================================================================
-- SIGNAL DATA: MENTORSHIP SIGNALS
-- ============================================================================

insert into signal_indicators (
  category_id, indicator_key, indicator_name, indicator_type, keywords, description, 
  confidence_default, source_id, related_activities, related_competencies, followup_question, active
)
select 
  (select category_id from signal_categories where category_key = 'mentorship'),
  'mentorship_coaching_conversation',
  'Coaching junior on career/identity',
  'keyword',
  '{mentored, mentoring, coached, coaching, career conversation, career planning, next steps, trajectory}'::text[],
  'User is guiding someone through career thinking, identity formation, or professional development',
  0.85,
  (select source_id from signal_detection_sources where source_name = 'FISCMAK Signal Research'),
  '{mentored_trainee, learner_prof_dev}'::text[],
  '{mentorship, learner_prof_dev, identity}'::text[],
  'Was this a one-time conversation or part of an ongoing mentoring relationship?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'mentorship'),
  'mentorship_helping_junior',
  'Helping junior navigate a challenge',
  'keyword',
  '{helped junior, supported junior, guided trainee, junior colleague, helping resident, helping fellow}'::text[],
  'User is providing support and guidance to a less experienced colleague',
  0.80,
  (select source_id from signal_detection_sources where source_name = 'FISCMAK Signal Research'),
  '{mentored_trainee, supported_distressed_learner}'::text[],
  '{mentorship, learner_prof_dev}'::text[],
  'What specifically did you help them understand or navigate?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'mentorship'),
  'mentorship_sponsoring',
  'Advocating for someone''s advancement',
  'keyword',
  '{sponsored, advocating for, put their name forward, recommended for, championed, supported their application}'::text[],
  'User is actively supporting someone''s career advancement or opportunity',
  0.82,
  (select source_id from signal_detection_sources where source_name = 'Clinician Educator Milestones'),
  '{mentored_trainee, advocated_for_change}'::text[],
  '{mentorship, advocacy, leadership}'::text[],
  'What made you want to advocate for this person?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'mentorship'),
  'mentorship_professional_development',
  'Supporting professional identity formation',
  'phrase',
  '{professional identity, who they want to be, finding their voice, defining themselves, becoming a clinician educator, becoming a leader, role identity}'::text[],
  'User is helping someone develop or clarify professional identity',
  0.78,
  (select source_id from signal_detection_sources where source_name = 'Clinician Educator Milestones'),
  '{mentored_trainee, learner_prof_dev}'::text[],
  '{mentorship, identity, leadership}'::text[],
  'How is their professional identity formation going?',
  true
on conflict (indicator_key) do nothing;

-- ============================================================================
-- SIGNAL DATA: LEADERSHIP SIGNALS
-- ============================================================================

insert into signal_indicators (
  category_id, indicator_key, indicator_name, indicator_type, keywords, description, 
  confidence_default, source_id, related_activities, related_competencies, followup_question, active
)
select 
  (select category_id from signal_categories where category_key = 'leadership'),
  'leadership_leading_meeting',
  'Led meeting or workgroup',
  'keyword',
  '{led meeting, ran meeting, facilitated meeting, led workgroup, led team, chaired, ran session, hosted discussion}'::text[],
  'User organized and directed a meeting or group discussion',
  0.88,
  (select source_id from signal_detection_sources where source_name = 'FISCMAK Signal Research'),
  '{led_meeting}'::text[],
  '{leadership_skills, program_eval}'::text[],
  'What was the outcome or decision from that meeting?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'leadership'),
  'leadership_managing_conflict',
  'Addressed interpersonal or team conflict',
  'keyword',
  '{conflict, difficult conversation, addressed tension, mediated, resolved disagreement, helped them work it out, tension between}'::text[],
  'User navigated interpersonal conflict or helped others resolve it',
  0.82,
  (select source_id from signal_detection_sources where source_name = 'FISCMAK Signal Research'),
  '{handled_conflict}'::text[],
  '{leadership_skills, ics}'::text[],
  'How did you approach the conflict? What did you learn?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'leadership'),
  'leadership_influencing_decision',
  'Influenced an important decision',
  'keyword',
  '{influenced, swayed, persuaded, pushed for, advocated for decision, made the case for, convinced leadership, decision was made}'::text[],
  'User shaped a significant decision or outcome through influence',
  0.80,
  (select source_id from signal_detection_sources where source_name = 'FISCMAK Signal Research'),
  '{led_meeting}'::text[],
  '{leadership_skills, sbp}'::text[],
  'What was the decision and how did your influence matter?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'leadership'),
  'leadership_managing_team',
  'Managing or overseeing a team',
  'keyword',
  '{managing team, supervise, oversee, directing people, team lead, program manager, department chair, director of}'::text[],
  'User is in a formal or informal leadership role managing others',
  0.85,
  (select source_id from signal_detection_sources where source_name = 'FISCMAK Signal Research'),
  '{led_meeting}'::text[],
  '{leadership_skills, admin_skills}'::text[],
  'What''s the size of your team and what''s been most challenging?',
  true
on conflict (indicator_key) do nothing;

-- ============================================================================
-- SIGNAL DATA: SYSTEMS THINKING SIGNALS
-- ============================================================================

insert into signal_indicators (
  category_id, indicator_key, indicator_name, indicator_type, keywords, description, 
  confidence_default, source_id, related_activities, related_competencies, followup_question, active
)
select 
  (select category_id from signal_categories where category_key = 'systems_thinking'),
  'systems_identified_inefficiency',
  'Identified a broken process',
  'keyword',
  '{inefficient, broken, bottleneck, waste, unnecessary step, takes too long, frustration with process, problem with workflow}'::text[],
  'User recognized a process or system inefficiency',
  0.78,
  (select source_id from signal_detection_sources where source_name = 'FISCMAK Signal Research'),
  '{improved_workflow}'::text[],
  '{sbp, program_eval}'::text[],
  'Did you propose a fix or change? What would improve it?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'systems_thinking'),
  'systems_proposed_change',
  'Proposed or implemented a process change',
  'keyword',
  '{proposed, changed, implemented, improved, streamlined, reduced, eliminated, fixed, restructured, automated}'::text[],
  'User suggested or enacted a process improvement',
  0.85,
  (select source_id from signal_detection_sources where source_name = 'FISCMAK Signal Research'),
  '{improved_workflow, coordinated_complex_care}'::text[],
  '{sbp, program_eval, leadership_skills}'::text[],
  'What was the impact of that change? How did people respond?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'systems_thinking'),
  'systems_connecting_pieces',
  'Aligning or coordinating across silos',
  'keyword',
  '{aligned, coordinated, brought together, connected, cross-departmental, interdepartmental, bridging, liaison, communication between}'::text[],
  'User worked to connect or integrate separate parts of a system',
  0.80,
  (select source_id from signal_detection_sources where source_name = 'FISCMAK Signal Research'),
  '{coordinated_complex_care, led_meeting}'::text[],
  '{sbp, ics, leadership_skills}'::text[],
  'What barriers did you have to overcome to coordinate that?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'systems_thinking'),
  'systems_reducing_friction',
  'Reduced handoff friction or communication gaps',
  'keyword',
  '{handoff, handoff improved, communication gap, better coordination, smoother process, reduced errors, fewer miscommunications}'::text[],
  'User improved transitions or communication between steps in a process',
  0.76,
  (select source_id from signal_detection_sources where source_name = 'FISCMAK Signal Research'),
  '{improved_workflow, coordinated_complex_care}'::text[],
  '{sbp, ics}'::text[],
  'How did the handoff improvement happen? What made it work?',
  true
on conflict (indicator_key) do nothing;

-- ============================================================================
-- SIGNAL DATA: ADVOCACY SIGNALS
-- ============================================================================

insert into signal_indicators (
  category_id, indicator_key, indicator_name, indicator_type, keywords, description, 
  confidence_default, source_id, related_activities, related_competencies, followup_question, active
)
select 
  (select category_id from signal_categories where category_key = 'advocacy'),
  'advocacy_speaking_up',
  'Spoke up about an unfair or wrong situation',
  'keyword',
  '{spoke up, spoke out, said something, pushed back, raised concern, didn''t stay quiet, called out, addressed}'::text[],
  'User took a stand or voiced a concern about something wrong',
  0.82,
  (select source_id from signal_detection_sources where source_name = 'FISCMAK Signal Research'),
  '{advocated_for_change}'::text[],
  '{advocacy, prof}'::text[],
  'What made you feel like you had to speak up?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'advocacy'),
  'advocacy_addressing_bias',
  'Addressed bias, inequity, or discrimination',
  'keyword',
  '{bias, discrimination, inequity, unfair, stereotyping, spoke against bias, diversity, inclusion, addressed bias}'::text[],
  'User actively worked against bias or unfair treatment',
  0.85,
  (select source_id from signal_detection_sources where source_name = 'FISCMAK Signal Research'),
  '{advocated_for_change}'::text[],
  '{advocacy, prof, ics}'::text[],
  'What was the situation and what did you do?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'advocacy'),
  'advocacy_fighting_for_resources',
  'Advocated for resources, support, or policy change',
  'keyword',
  '{fought for, advocated for, asked for, requested, proposed policy change, asked administration, needed more, needed support}'::text[],
  'User pushed for institutional resources or changes in support of people or mission',
  0.78,
  (select source_id from signal_detection_sources where source_name = 'FISCMAK Signal Research'),
  '{advocated_for_change, led_meeting}'::text[],
  '{advocacy, sbp, leadership_skills}'::text[],
  'What did you ask for and did you get it?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'advocacy'),
  'advocacy_protecting_someone',
  'Advocated for or protected a person',
  'keyword',
  '{stood up for, protected, defended, advocated for them, their corner, fought for them, had their back, protected from}'::text[],
  'User actively advocated for or protected an individual',
  0.80,
  (select source_id from signal_detection_sources where source_name = 'FISCMAK Signal Research'),
  '{advocated_for_change}'::text[],
  '{advocacy, mentorship, prof}'::text[],
  'What were the stakes? Why was it important to advocate for them?',
  true
on conflict (indicator_key) do nothing;

-- ============================================================================
-- SIGNAL DATA: EMOTIONAL LABOR SIGNALS
-- ============================================================================

insert into signal_indicators (
  category_id, indicator_key, indicator_name, indicator_type, keywords, description, 
  confidence_default, source_id, related_activities, related_competencies, followup_question, active
)
select 
  (select category_id from signal_categories where category_key = 'emotional_labor'),
  'emotional_labor_supporting_distress',
  'Supported colleague through distress or struggle',
  'keyword',
  '{struggling, distressed, overwhelmed, having a hard time, difficult time, took time to listen, sat with, held space}'::text[],
  'User provided emotional support to someone in distress',
  0.85,
  (select source_id from signal_detection_sources where source_name = 'FISCMAK Signal Research'),
  '{supported_distressed_learner, recognized_burnout}'::text[],
  '{learner_colleague_wellbeing, ics}'::text[],
  'What did supporting them look like? How are they doing now?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'emotional_labor'),
  'emotional_labor_recognizing_burnout',
  'Recognized burnout or well-being concern in self or others',
  'keyword',
  '{burnout, burned out, exhausted, not themselves, struggling with balance, work-life, tired, stressed, overwhelmed, unsustainable}'::text[],
  'User recognized signs of burnout or well-being crisis',
  0.82,
  (select source_id from signal_detection_sources where source_name = 'Well-Being Literature'),
  '{recognized_burnout}'::text[],
  '{learner_colleague_wellbeing, personal_wellbeing, wellbeing}'::text[],
  'What made you notice the burnout? What helped or could help?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'emotional_labor'),
  'emotional_labor_processing_emotion',
  'Helped someone process difficult emotions or experience',
  'keyword',
  '{helped them process, talked through, worked through emotion, grieving, anger, guilt, fear, talked about how they felt}'::text[],
  'User provided space and support for emotional processing',
  0.78,
  (select source_id from signal_detection_sources where source_name = 'Well-Being Literature'),
  '{supported_distressed_learner}'::text[],
  '{learner_colleague_wellbeing, ics}'::text[],
  'What was the emotion or experience they were processing?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'emotional_labor'),
  'emotional_labor_connecting_resources',
  'Connected someone to support or resources',
  'keyword',
  '{referred to, connected to, resources, counseling, EAP, therapy, support group, chaplain, mentor, crisis line}'::text[],
  'User helped someone access formal or informal support',
  0.80,
  (select source_id from signal_detection_sources where source_name = 'Well-Being Literature'),
  '{recognized_burnout, supported_distressed_learner}'::text[],
  '{learner_colleague_wellbeing, sbp}'::text[],
  'Were they able to access the resource? Did it help?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'emotional_labor'),
  'emotional_labor_boundary_holding',
  'Maintained professional boundaries while supporting',
  'keyword',
  '{boundaries, appropriate distance, professional relationship, knew when to refer, didn''t become a therapist, recognized limits}'::text[],
  'User showed awareness of appropriate boundaries in support',
  0.72,
  (select source_id from signal_detection_sources where source_name = 'Well-Being Literature'),
  '{supported_distressed_learner}'::text[],
  '{prof, learner_colleague_wellbeing}'::text[],
  'How do you navigate the balance between support and boundaries?',
  true
on conflict (indicator_key) do nothing;

-- ============================================================================
-- SIGNAL DATA: TEACHING SIGNALS
-- ============================================================================

insert into signal_indicators (
  category_id, indicator_key, indicator_name, indicator_type, keywords, description, 
  confidence_default, source_id, related_activities, related_competencies, followup_question, active
)
select 
  (select category_id from signal_categories where category_key = 'teaching'),
  'teaching_informal_teaching',
  'Taught during rounds, supervision, or clinical care',
  'keyword',
  '{taught, teaching, rounds, bedside teaching, supervision, clinical teaching, explained, demonstrated}'::text[],
  'User engaged in opportunistic clinical teaching',
  0.83,
  (select source_id from signal_detection_sources where source_name = 'Clinician Educator Milestones'),
  '{gave_informal_teaching}'::text[],
  '{teaching_learning, pc}'::text[],
  'What clinical topic did you teach? How did the learner respond?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'teaching'),
  'teaching_creating_resource',
  'Created curriculum, slides, handout, or teaching tool',
  'keyword',
  '{created slides, made handout, wrote guide, built curriculum, designed module, lecture, video, teaching tool, checklist}'::text[],
  'User developed educational content or materials',
  0.88,
  (select source_id from signal_detection_sources where source_name = 'Clinician Educator Milestones'),
  '{created_curriculum, created_resource}'::text[],
  '{curriculum, teaching_learning}'::text[],
  'Who used this resource and was it effective?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'teaching'),
  'teaching_facilitating_learning',
  'Facilitated a learning discussion or case conference',
  'keyword',
  '{facilitated, led discussion, case conference, journal club, M&M, seminar, learning activity, discussion session}'::text[],
  'User designed and led a structured learning experience',
  0.84,
  (select source_id from signal_detection_sources where source_name = 'Clinician Educator Milestones'),
  '{led_meeting, gave_informal_teaching}'::text[],
  '{teaching_learning, learning_environment}'::text[],
  'How did learners engage with that learning activity?',
  true
on conflict (indicator_key) do nothing;

-- ============================================================================
-- SIGNAL DATA: FEEDBACK SIGNALS
-- ============================================================================

insert into signal_indicators (
  category_id, indicator_key, indicator_name, indicator_type, keywords, description, 
  confidence_default, source_id, related_activities, related_competencies, followup_question, active
)
select 
  (select category_id from signal_categories where category_key = 'feedback'),
  'feedback_giving_feedback',
  'Gave formative or corrective feedback',
  'keyword',
  '{gave feedback, provided feedback, told them, corrected, reinforced strength, constructive feedback, formative feedback}'::text[],
  'User delivered performance or learning feedback',
  0.87,
  (select source_id from signal_detection_sources where source_name = 'Clinician Educator Milestones'),
  '{gave_feedback}'::text[],
  '{feedback, teaching_learning}'::text[],
  'How did they receive the feedback? Did they change?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'feedback'),
  'feedback_receiving_feedback',
  'Received and acted on feedback',
  'keyword',
  '{got feedback, was told, learned that, changed because of feedback, took that feedback seriously, incorporated, adjusted}'::text[],
  'User demonstrated openness to and integration of feedback',
  0.82,
  (select source_id from signal_detection_sources where source_name = 'Clinician Educator Milestones'),
  '{received_feedback}'::text[],
  '{reflective_practice, feedback}'::text[],
  'What feedback did you get and how did it change your practice?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'feedback'),
  'feedback_reflection',
  'Reflected on experience or practice',
  'keyword',
  '{reflected, learned from, realized, thinking back, hindsight, what I''d do differently, could have done better}'::text[],
  'User engaged in reflective practice or learning from experience',
  0.80,
  (select source_id from signal_detection_sources where source_name = 'Clinician Educator Milestones'),
  '{received_feedback}'::text[],
  '{reflective_practice}'::text[],
  'What was the biggest lesson from that reflection?',
  true
on conflict (indicator_key) do nothing;

-- ============================================================================
-- SIGNAL DATA: SCHOLARSHIP SIGNALS
-- ============================================================================

insert into signal_indicators (
  category_id, indicator_key, indicator_name, indicator_type, keywords, description, 
  confidence_default, source_id, related_activities, related_competencies, followup_question, active
)
select 
  (select category_id from signal_categories where category_key = 'scholarship'),
  'scholarship_presenting',
  'Presented work at conference or forum',
  'keyword',
  '{presented, poster, talk, conference, presented at, abstract, grand rounds, seminar presentation, scholarly presentation}'::text[],
  'User disseminated work through presentation',
  0.88,
  (select source_id from signal_detection_sources where source_name = 'Clinician Educator Milestones'),
  '{presented_scholarship}'::text[],
  '{med_ed_scholarship, scholarship}'::text[],
  'What was the response? What next for this work?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'scholarship'),
  'scholarship_published',
  'Published or submitted for publication',
  'keyword',
  '{published, journal, paper, manuscript, submitted, accepted, in press, wrote article}'::text[],
  'User published or is publishing scholarly work',
  0.90,
  (select source_id from signal_detection_sources where source_name = 'Clinician Educator Milestones'),
  '{presented_scholarship}'::text[],
  '{med_ed_scholarship, scholarship}'::text[],
  'What is the paper/publication about? What''s the impact?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'scholarship'),
  'scholarship_research_project',
  'Conducted or leading research or QI project',
  'keyword',
  '{research, QI project, quality improvement, IRB, data collection, literature review, project, grant, funded}'::text[],
  'User is engaged in research or systematic improvement work',
  0.85,
  (select source_id from signal_detection_sources where source_name = 'Clinician Educator Milestones'),
  '{presented_scholarship}'::text[],
  '{med_ed_scholarship, scholarship, pbli}'::text[],
  'What''s the research question or improvement goal?',
  true
on conflict (indicator_key) do nothing;

-- ============================================================================
-- SIGNAL DATA: INNOVATION SIGNALS
-- ============================================================================

insert into signal_indicators (
  category_id, indicator_key, indicator_name, indicator_type, keywords, description, 
  confidence_default, source_id, related_activities, related_competencies, followup_question, active
)
select 
  (select category_id from signal_categories where category_key = 'innovation'),
  'innovation_building_tool',
  'Built dashboard, spreadsheet, or data system',
  'keyword',
  '{built dashboard, created spreadsheet, automated, database, tool, system, data tracker, software, app, built system}'::text[],
  'User created technology or data infrastructure',
  0.86,
  (select source_id from signal_detection_sources where source_name = 'FISCMAK Signal Research'),
  '{built_tool}'::text[],
  '{innovation, sbp, admin_skills}'::text[],
  'What problem did that tool solve? Who uses it?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'innovation'),
  'innovation_improving_technology',
  'Improved EHR workflow or clinical informatics',
  'keyword',
  '{EHR, electronic health record, workflow improved, informatics, structured data, alert, documentation, template}'::text[],
  'User worked with technology to improve clinical or administrative work',
  0.80,
  (select source_id from signal_detection_sources where source_name = 'FISCMAK Signal Research'),
  '{built_tool, improved_workflow}'::text[],
  '{innovation, sbp}'::text[],
  'How did EHR improvement help? What''s the impact?',
  true
on conflict (indicator_key) do nothing;

-- ============================================================================
-- SIGNAL DATA: WELL-BEING SIGNALS
-- ============================================================================

insert into signal_indicators (
  category_id, indicator_key, indicator_name, indicator_type, keywords, description, 
  confidence_default, source_id, related_activities, related_competencies, followup_question, active
)
select 
  (select category_id from signal_categories where category_key = 'wellbeing'),
  'wellbeing_energy_decline',
  'Expressing declining energy or motivation',
  'keyword',
  '{tired, exhausted, not sure why I''m doing this, losing passion, energy down, not excited, dragging, burnt out}'::text[],
  'User is expressing signs of energy depletion or burnout',
  0.76,
  (select source_id from signal_detection_sources where source_name = 'Well-Being Literature'),
  '{recognized_burnout}'::text[],
  '{personal_wellbeing, wellbeing}'::text[],
  'What''s been draining your energy most lately?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'wellbeing'),
  'wellbeing_finding_meaning',
  'Finding meaning, fulfillment, or purpose in work',
  'keyword',
  '{fulfilling, meaningful work, purpose, makes sense, why I do this, energizes me, excited about, gives me energy}'::text[],
  'User is experiencing meaning or satisfaction in their work',
  0.82,
  (select source_id from signal_detection_sources where source_name = 'Well-Being Literature'),
  '{mentored_trainee, gave_informal_teaching}'::text[],
  '{identity, personal_wellbeing}'::text[],
  'What aspect of your work feels most meaningful right now?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'wellbeing'),
  'wellbeing_seeking_balance',
  'Struggling with work-life balance or boundaries',
  'keyword',
  '{balance, boundaries, work-life, too much, can''t keep up, weekends, time off, need a break, not sustainable}'::text[],
  'User is aware of work-life balance challenges',
  0.80,
  (select source_id from signal_detection_sources where source_name = 'Well-Being Literature'),
  '{recognized_burnout}'::text[],
  '{personal_wellbeing, wellbeing}'::text[],
  'What would help you achieve better balance?',
  true
on conflict (indicator_key) do nothing;

-- ============================================================================
-- SIGNAL DATA: ROLE & IDENTITY CLARITY SIGNALS
-- ============================================================================

insert into signal_indicators (
  category_id, indicator_key, indicator_name, indicator_type, keywords, description, 
  confidence_default, source_id, related_activities, related_competencies, followup_question, active
)
select 
  (select category_id from signal_categories where category_key = 'role_clarity'),
  'role_clarity_exploring_identity',
  'Exploring professional identity or role transition',
  'keyword',
  '{who am I, who do I want to be, becoming, identity, transitioning to, shift towards, less clinician more, wondering if}'::text[],
  'User is actively exploring or transitioning professional identity',
  0.75,
  (select source_id from signal_detection_sources where source_name = 'Career Development Theory'),
  '{mentored_trainee}'::text[],
  '{identity, learner_prof_dev}'::text[],
  'Tell me more about the professional identity you''re developing or exploring.',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'role_clarity'),
  'role_clarity_unclear_career_path',
  'Uncertainty about career direction or next steps',
  'keyword',
  '{not sure, unclear, torn between, what comes next, next steps, direction, what''s next, unsure of path, confused about}'::text[],
  'User is uncertain about career trajectory or options',
  0.72,
  (select source_id from signal_detection_sources where source_name = 'Career Development Theory'),
  '{}'::text[],
  '{identity}'::text[],
  'What are the options you''re considering?',
  true
on conflict (indicator_key) do nothing;

-- ============================================================================
-- SIGNAL DATA: SKILL DOMAIN GAP SIGNALS
-- ============================================================================

insert into signal_indicators (
  category_id, indicator_key, indicator_name, indicator_type, keywords, description, 
  confidence_default, source_id, related_activities, related_competencies, followup_question, active
)
select 
  (select category_id from signal_categories where category_key = 'skill_domain_gap'),
  'skill_gap_teaching_administration',
  'Lacking confidence or development in teaching/admin',
  'keyword',
  '{don''t know how to teach, never been trained in, no background in, not an educator, teaching isn''t my strength, admin skills}'::text[],
  'User identifies a gap in teaching or administration skills',
  0.70,
  (select source_id from signal_detection_sources where source_name = 'Clinician Educator Milestones'),
  '{}'::text[],
  '{teaching, admin}'::text[],
  'What aspect of teaching or administration would you most like to develop?',
  true
union all
select 
  (select category_id from signal_categories where category_key = 'skill_domain_gap'),
  'skill_gap_research_scholarship',
  'Lacking confidence or development in research/scholarship',
  'keyword',
  '{not a researcher, never done research, don''t know how to publish, scared of research, no scholarly output, not academic}'::text[],
  'User identifies a gap in research or scholarship skills',
  0.68,
  (select source_id from signal_detection_sources where source_name = 'Career Development Theory'),
  '{}'::text[],
  '{scholarship, med_ed_scholarship}'::text[],
  'What would scholarly work or research look like for you?',
  true
on conflict (indicator_key) do nothing;

-- ============================================================================
-- TABLE 4: signal_conversational_routes
-- ============================================================================
-- Maps detected signals to coaching routes: what Mak asks or does next

create table if not exists signal_conversational_routes (
  route_id uuid primary key default gen_random_uuid(),
  indicator_id uuid not null references signal_indicators(indicator_id),
  route_name text not null,
  route_type text default 'followup_question', -- 'followup_question', 'reflection_prompt', 'resource_offer', 'validation'
  route_template text not null, -- The actual language Mak uses (can include {placeholders})
  conditional_logic text, -- e.g. "if user_career_track = 'educator'" 
  confidence_adjustment numeric(3,2) default 0.0, -- adjust signal confidence based on context
  active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique (indicator_id, route_name)
);
create index if not exists idx_routes_indicator on signal_conversational_routes(indicator_id);

-- Example routes
insert into signal_conversational_routes (indicator_id, route_name, route_type, route_template, conditional_logic, active)
select 
  (select indicator_id from signal_indicators where indicator_key = 'mentorship_coaching_conversation'),
  'Mentorship followup',
  'followup_question',
  'That mentoring work is meaningful. Was this a one-time conversation or part of a longer relationship you''re building with them?',
  null,
  true
union all
select 
  (select indicator_id from signal_indicators where indicator_key = 'leadership_leading_meeting'),
  'Leadership impact check',
  'followup_question',
  'Leading that took vision and presence. What was the outcome? Did the group move forward?',
  null,
  true
union all
select 
  (select indicator_id from signal_indicators where indicator_key = 'systems_proposed_change'),
  'Systems thinking deepening',
  'reflection_prompt',
  'You identified something broken and fixed it—that''s systems thinking in action. Do you see yourself in a systems-leader role?',
  null,
  true
union all
select 
  (select indicator_id from signal_indicators where indicator_key = 'advocacy_speaking_up'),
  'Advocacy affirmation',
  'validation',
  'Speaking up for what''s right takes courage. I want to honor that you did.',
  null,
  true
union all
select 
  (select indicator_id from signal_indicators where indicator_key = 'emotional_labor_supporting_distress'),
  'Emotional labor recognition',
  'validation',
  'Holding space for someone in distress is real work and it matters. How are *you* doing with this?',
  null,
  true
on conflict (indicator_id, route_name) do nothing;
-- ============================================================================
-- Stores detected signals and context from user interactions for pattern recognition

create table if not exists signal_user_context (
  context_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  indicator_id uuid not null references signal_indicators(indicator_id),
  detected_at timestamp with time zone default now(),
  raw_text text, -- the user's actual text
  confidence_score numeric(3,2), -- the actual confidence (0.0-1.0)
  context_data jsonb, -- extracted context: who, what, scope, etc.
  mak_response text, -- what Mak said in response
  user_reception text, -- how user responded (positive, receptive, dismissed, etc.)
  activity_inferred_id uuid references ontology_invisible_work_activities(activity_id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

comment on table signal_user_context is 'Records of signals detected in user interactions for pattern learning';
create index if not exists idx_signal_context_user on signal_user_context(user_id);
create index if not exists idx_signal_context_indicator on signal_user_context(indicator_id);
create index if not exists idx_signal_context_time on signal_user_context(detected_at);

-- RLS
alter table signal_user_context enable row level security;
create policy "signal_context_user_scoped" on signal_user_context for all using (auth.uid() = user_id);

-- ============================================================================
-- TABLE 6: signal_pattern_summaries
-- ============================================================================
-- Aggregate patterns: "this user shows strong mentorship signals" or "increasing burnout signals"

create table if not exists signal_pattern_summaries (
  pattern_id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  category_id uuid not null references signal_categories(category_id),
  signal_frequency integer default 0, -- how many times detected in window
  trend text default 'stable', -- 'increasing', 'decreasing', 'stable', 'emerging'
  time_window text default '30_days', -- '7_days', '30_days', '90_days', 'all_time'
  pattern_strength numeric(3,2), -- 0.0-1.0
  last_detected_at timestamp with time zone,
  coaching_focus text, -- suggested coaching direction based on pattern
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

comment on table signal_pattern_summaries is 'Aggregated signal patterns over time for user insights';
create index if not exists idx_patterns_user on signal_pattern_summaries(user_id);
create index if not exists idx_patterns_category on signal_pattern_summaries(category_id);

-- RLS
alter table signal_pattern_summaries enable row level security;
create policy "patterns_user_scoped" on signal_pattern_summaries for all using (auth.uid() = user_id);

-- ============================================================================
-- RLS POLICIES FOR SIGNAL REFERENCE TABLES
-- ============================================================================
-- Signal definitions are reference/read-only, public access

alter table signal_detection_sources enable row level security;
create policy "sources_public_read" on signal_detection_sources for select using (true);

alter table signal_categories enable row level security;
create policy "categories_public_read" on signal_categories for select using (true);

alter table signal_indicators enable row level security;
create policy "indicators_public_read" on signal_indicators for select using (true);

alter table signal_conversational_routes enable row level security;
create policy "routes_public_read" on signal_conversational_routes for select using (true);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
-- Signal detection relies on fast keyword/pattern matching

create index if not exists idx_indicators_keywords on signal_indicators using gin(keywords);
create index if not exists idx_context_detected_at on signal_user_context(detected_at desc);
create index if not exists idx_context_activity on signal_user_context(activity_inferred_id);
create index if not exists idx_patterns_updated on signal_pattern_summaries(updated_at desc);

-- ============================================================================
-- END OF SIGNAL DETECTION MIGRATION
-- ============================================================================

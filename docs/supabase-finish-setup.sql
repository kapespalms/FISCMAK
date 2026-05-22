-- Run when tables ALREADY EXIST but seed / RLS failed (do NOT run full schema again).
-- Safe to run multiple times.

-- Seed: career phases (fixed ARRAY syntax)
INSERT INTO career_phases (name, definition, identity_task, key_challenges, default_instruments, mak_mode_priority) VALUES
('Medical Student', 'Medical school enrollment', 'Am I becoming a physician?', 'Mistreatment, learning environment, burnout risk', '["PFI", "UWES-3"]', ARRAY['Coach']),
('Resident/Fellow', 'Residency or fellowship training', 'What kind of physician am I becoming?', 'Dual status, intense learning, identity formation', '["PFI", "UWES-9", "Career Fit", "PIF"]', ARRAY['Coach', 'Mentor']),
('Early Career Attending', 'First attending role (0-5 years)', 'How do I establish myself?', 'Novel practice setting, autonomy, work-life integration', '["PFI", "UWES-9", "Career Fit", "JeffSPLL", "PIF"]', ARRAY['Coach', 'Mentor', 'Analyst']),
('Mid-Career Attending', 'Established attending (10-20 years)', 'How do I sustain meaning while managing demands?', 'Highest burnout risk, admin burden, isolation', '["PFI", "UWES-9", "Career Fit", "JeffSPLL", "PIF", "Mini-Z"]', ARRAY['Analyst', 'Sponsor-Prep']),
('Late Career Attending', 'Senior attending (20+ years)', 'How do I finish well and prepare for transition?', 'Competency maintenance, finishing well, succession', '["PFI", "Career Fit", "PIF"]', ARRAY['Mentor']),
('Transitioning', 'Career change or major shift', 'Who am I becoming next?', 'Identity reconstruction, support needs', '["PFI", "UWES-9", "Career Fit", "PIF"]', ARRAY['Coach', 'Mentor']),
('Nonclinical', 'Non-clinical physician roles', 'How do I contribute outside clinical care?', 'Role clarity, visibility, impact measurement', '["PFI", "UWES-9", "Career Fit"]', ARRAY['Coach', 'Analyst']),
('Retired', 'Post-practice physician', 'Who am I without my white coat?', 'Identity transition, purpose, continued contribution', '["PFI"]', ARRAY['Mentor'])
ON CONFLICT (name) DO NOTHING;

INSERT INTO career_states (name, definition, developmental_task, duration_years) VALUES
('Formation', 'Building foundational professional identity', 'Establish core values and competencies', 4),
('Expansion', 'Exploring multiple roles and tracks', 'Develop breadth across domains and tracks', 3),
('Differentiation', 'Specializing in preferred areas', 'Deepen expertise, build identity', 5),
('Leadership', 'Taking on formal leadership roles', 'Develop systems thinking and influence', 5),
('Integration', 'Bringing coherence to complex career', 'Integrate multiple roles into cohesive identity', 10),
('Reinvention', 'Major career transition', 'Navigate identity shift, rebuild in new domain', 2),
('Sustainability', 'Maintaining long-term engagement', 'Sustain meaning amidst complexity', 10),
('Legacy', 'Focusing on mentorship and impact', 'Transfer knowledge, shape next generation', 10)
ON CONFLICT (name) DO NOTHING;

INSERT INTO specialty_groups (name, included_specialties, description) VALUES
('Psychiatry / Behavioral Health', ARRAY['Psychiatry', 'Addiction Medicine', 'Psychosomatic Medicine'], 'Mental health specialists'),
('Primary Care', ARRAY['Internal Medicine', 'Family Medicine', 'General Practice'], 'First-line care providers'),
('Hospital-Based Medicine', ARRAY['Hospitalist', 'Internal Medicine', 'Pediatrics'], 'Hospital inpatient care'),
('Surgical / Procedural', ARRAY['General Surgery', 'Orthopedic Surgery', 'Neurosurgery', 'Ophthalmology'], 'Surgical specialists'),
('Emergency / Acute Care', ARRAY['Emergency Medicine', 'Trauma Surgery', 'Critical Care'], 'Acute and emergency medicine'),
('Pediatrics', ARRAY['Pediatrics', 'Neonatal-Perinatal Medicine', 'Pediatric Surgery'], 'Children''s medicine'),
('Diagnostic Specialties', ARRAY['Radiology', 'Pathology', 'Laboratory Medicine'], 'Diagnostic and image-based specialties'),
('Academic Research-Heavy', ARRAY['Oncology', 'Infectious Disease', 'Nephrology'], 'Research-focused specialties'),
('Administrative / Executive', ARRAY['Chief Medical Officer', 'Medical Director', 'Dean'], 'Administrative physician roles'),
('Nonclinical / Industry', ARRAY['Medical Informatics', 'Health Policy', 'Industry Medicine'], 'Non-clinical physician roles')
ON CONFLICT (name) DO NOTHING;

INSERT INTO templates (template_type, name, description, word_limit, is_default)
SELECT v.template_type, v.name, v.description, v.word_limit, v.is_default
FROM (VALUES
  ('cv_bullets', 'CV Bullets', '5 professional accomplishments for your CV', 150, TRUE),
  ('annual_review', 'Annual Review', 'Comprehensive annual reflection', 750, TRUE),
  ('promotion_narrative', 'Promotion Narrative', 'Case for advancement', 1500, TRUE),
  ('teaching_statement', 'Teaching Statement', 'Philosophy of teaching', 500, TRUE),
  ('leadership_summary', 'Leadership Summary', 'Leadership credentials', 500, TRUE),
  ('professional_bio', 'Professional Bio', 'Third-person professional biography', 200, TRUE),
  ('cover_letter', 'Cover Letter', 'Job or fellowship application', 400, TRUE),
  ('invisible_work_summary', 'Invisible Work Summary', 'Document unrecognized work', 500, TRUE),
  ('career_snapshot', 'Career Snapshot', 'Quick career summary', 300, TRUE)
) AS v(template_type, name, description, word_limit, is_default)
WHERE NOT EXISTS (SELECT 1 FROM templates t WHERE t.template_type = v.template_type);

-- RLS (idempotent)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE lattice_cells ENABLE ROW LEVEL SECURITY;
ALTER TABLE mak_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS users_select ON users;
CREATE POLICY users_select ON users FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS users_update ON users;
CREATE POLICY users_update ON users FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS profiles_select ON profiles;
CREATE POLICY profiles_select ON profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS profiles_insert ON profiles;
CREATE POLICY profiles_insert ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS profiles_update ON profiles;
CREATE POLICY profiles_update ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS activity_entries_select ON activity_entries;
CREATE POLICY activity_entries_select ON activity_entries FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS activity_entries_insert ON activity_entries;
CREATE POLICY activity_entries_insert ON activity_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS activity_entries_update ON activity_entries;
CREATE POLICY activity_entries_update ON activity_entries FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS evidence_items_select ON evidence_items;
CREATE POLICY evidence_items_select ON evidence_items FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS evidence_items_insert ON evidence_items;
CREATE POLICY evidence_items_insert ON evidence_items FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS evidence_items_update ON evidence_items;
CREATE POLICY evidence_items_update ON evidence_items FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS lattice_cells_select ON lattice_cells;
CREATE POLICY lattice_cells_select ON lattice_cells FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS lattice_cells_insert ON lattice_cells;
CREATE POLICY lattice_cells_insert ON lattice_cells FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS lattice_cells_update ON lattice_cells;
CREATE POLICY lattice_cells_update ON lattice_cells FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS mak_conversations_select ON mak_conversations;
CREATE POLICY mak_conversations_select ON mak_conversations FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS mak_conversations_insert ON mak_conversations;
CREATE POLICY mak_conversations_insert ON mak_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS generated_documents_select ON generated_documents;
CREATE POLICY generated_documents_select ON generated_documents FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS generated_documents_insert ON generated_documents;
CREATE POLICY generated_documents_insert ON generated_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS generated_documents_update ON generated_documents;
CREATE POLICY generated_documents_update ON generated_documents FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS career_goals_select ON career_goals;
CREATE POLICY career_goals_select ON career_goals FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS career_goals_insert ON career_goals;
CREATE POLICY career_goals_insert ON career_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS career_goals_update ON career_goals;
CREATE POLICY career_goals_update ON career_goals FOR UPDATE USING (auth.uid() = user_id);

ALTER TABLE career_phases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS career_phases_select ON career_phases;
CREATE POLICY career_phases_select ON career_phases FOR SELECT USING (TRUE);

ALTER TABLE specialty_groups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS specialty_groups_select ON specialty_groups;
CREATE POLICY specialty_groups_select ON specialty_groups FOR SELECT USING (TRUE);

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS templates_select ON templates;
CREATE POLICY templates_select ON templates FOR SELECT USING (TRUE);

CREATE INDEX IF NOT EXISTS idx_activity_entries_user_energy ON activity_entries(user_id, energy_valence);
CREATE INDEX IF NOT EXISTS idx_activity_entries_user_domain_track ON activity_entries(user_id, primary_domain, primary_track);
CREATE INDEX IF NOT EXISTS idx_evidence_items_domain_track ON evidence_items(domains, tracks);
CREATE INDEX IF NOT EXISTS idx_generated_documents_type ON generated_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_mak_conversations_type ON mak_conversations(conversation_type);
CREATE INDEX IF NOT EXISTS idx_activity_user_date_domain ON activity_entries(user_id, activity_date DESC, primary_domain);
CREATE INDEX IF NOT EXISTS idx_lattice_user_active ON lattice_cells(user_id, is_active);

CREATE TABLE IF NOT EXISTS schema_version (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version VARCHAR(10),
  description TEXT,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO schema_version (version, description)
SELECT '1.0', 'Initial complete schema with 40+ tables, RLS, and seed data'
WHERE NOT EXISTS (SELECT 1 FROM schema_version WHERE version = '1.0');

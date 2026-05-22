-- FISCMAK COMPLETE SUPABASE SCHEMA
-- Version 1.0
-- Status: Production-ready
-- Platform: Supabase PostgreSQL (Strongest Tier)
-- Dependencies: All tables created in dependency order

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- USERS & IDENTITY
-- ============================================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_users_email ON users(email);

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  specialty VARCHAR(100),
  specialty_group_id UUID,
  practice_setting VARCHAR(50),
  fte_status VARCHAR(50),
  career_phase VARCHAR(50),
  career_state VARCHAR(50),
  years_post_training INTEGER,
  institution_name VARCHAR(255),
  department_name VARCHAR(255),
  goals TEXT,
  biography TEXT,
  photo_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE career_phases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  definition TEXT,
  identity_task TEXT,
  key_challenges TEXT,
  default_instruments JSONB,
  mak_mode_priority VARCHAR[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE career_states (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  definition TEXT,
  developmental_task TEXT,
  duration_years INTEGER,
  lattice_interpretation_guidance TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE specialty_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  included_specialties TEXT[],
  description TEXT,
  domain_modifier_profile JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_specialty_groups_name ON specialty_groups(name);

-- ============================================================================
-- ACTIVITIES & EVIDENCE
-- ============================================================================

CREATE TABLE activity_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  activity_date DATE,
  
  raw_text TEXT,
  input_source VARCHAR(50),
  source_document_id UUID,
  
  duration_minutes INTEGER,
  energy_valence VARCHAR(50),
  meaningfulness_score INTEGER CHECK (meaningfulness_score >= 0 AND meaningfulness_score <= 10),
  alignment_score INTEGER CHECK (alignment_score >= 0 AND alignment_score <= 10),
  visibility_status VARCHAR(50),
  
  primary_activity_type VARCHAR(50),
  primary_domain VARCHAR(50),
  primary_domain_confidence FLOAT CHECK (primary_domain_confidence >= 0 AND primary_domain_confidence <= 1),
  secondary_domains JSONB,
  primary_track VARCHAR(50),
  primary_track_confidence FLOAT CHECK (primary_track_confidence >= 0 AND primary_track_confidence <= 1),
  secondary_tracks JSONB,
  scope VARCHAR(50),
  scope_multiplier FLOAT CHECK (scope_multiplier >= 1 AND scope_multiplier <= 4),
  evidence_strength VARCHAR(50),
  
  specialty_group_id UUID REFERENCES specialty_groups(id),
  specialty_adjusted_domains JSONB,
  
  is_invisible_work BOOLEAN DEFAULT FALSE,
  is_recognition_gap BOOLEAN DEFAULT FALSE,
  output_opportunity_flags TEXT[],
  
  user_confirmed BOOLEAN DEFAULT FALSE,
  user_correction_notes TEXT,
  
  confidence_score FLOAT CHECK (confidence_score >= 0 AND confidence_score <= 1),
  mak_rationale TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_entries_user_id ON activity_entries(user_id);
CREATE INDEX idx_activity_entries_activity_date ON activity_entries(activity_date);
CREATE INDEX idx_activity_entries_primary_domain ON activity_entries(primary_domain);
CREATE INDEX idx_activity_entries_primary_track ON activity_entries(primary_track);

CREATE TABLE evidence_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_entry_id UUID REFERENCES activity_entries(id) ON DELETE SET NULL,
  
  title VARCHAR(255),
  summary TEXT,
  full_text TEXT,
  
  activity_type VARCHAR(50),
  domains JSONB,
  tracks JSONB,
  scope VARCHAR(50),
  evidence_strength VARCHAR(50),
  
  energy_valence VARCHAR(50),
  visibility_status VARCHAR(50),
  
  date_range_start DATE,
  date_range_end DATE,
  
  is_featured BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_evidence_items_user_id ON evidence_items(user_id);

CREATE TABLE classification_overrides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_entry_id UUID REFERENCES activity_entries(id) ON DELETE SET NULL,
  
  field_name VARCHAR(50),
  original_value VARCHAR(255),
  corrected_value VARCHAR(255),
  
  reason TEXT,
  model_version VARCHAR(50),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_classification_overrides_user_id ON classification_overrides(user_id);

CREATE TABLE uploaded_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  file_name VARCHAR(255),
  file_type VARCHAR(50),
  file_size_bytes INTEGER,
  s3_path VARCHAR(500),
  
  parsed_text TEXT,
  detected_document_type VARCHAR(50),
  detected_sections JSONB,
  extracted_entities JSONB,
  
  inferred_career_phase VARCHAR(50),
  inferred_career_state VARCHAR(50),
  inferred_active_tracks TEXT[],
  inferred_domain_emphasis JSONB,
  
  created_activity_ids UUID[],
  
  user_confirmed BOOLEAN DEFAULT FALSE,
  user_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  processed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_uploaded_documents_user_id ON uploaded_documents(user_id);

CREATE TABLE template_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uploaded_document_id UUID REFERENCES uploaded_documents(id) ON DELETE CASCADE,
  
  section_name VARCHAR(255),
  section_text TEXT,
  section_order INTEGER,
  
  detected_instructions TEXT,
  word_limit INTEGER,
  
  mapped_domains VARCHAR[],
  mapped_tracks VARCHAR[],
  mapped_activity_types VARCHAR[],
  
  user_confirmed BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_template_sections_document_id ON template_sections(uploaded_document_id);

-- ============================================================================
-- LATTICE & SIGNALS
-- ============================================================================

CREATE TABLE lattice_cells (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  domain_index INTEGER CHECK (domain_index >= 0 AND domain_index < 8),
  track_index INTEGER CHECK (track_index >= 0 AND track_index < 8),
  
  activity_count INTEGER DEFAULT 0,
  weighted_activity_score FLOAT DEFAULT 0,
  documented_evidence_count INTEGER DEFAULT 0,
  self_reported_count INTEGER DEFAULT 0,
  
  energy_average FLOAT,
  energy_energizing_count INTEGER DEFAULT 0,
  energy_draining_count INTEGER DEFAULT 0,
  
  is_active BOOLEAN DEFAULT FALSE,
  development_status VARCHAR(50),
  trajectory VARCHAR(50),
  
  documented_percentage FLOAT,
  recognition_gap_score FLOAT,
  
  first_activity_date DATE,
  last_activity_date DATE,
  
  confidence_level VARCHAR(50),
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(user_id, domain_index, track_index)
);

CREATE INDEX idx_lattice_cells_user_id ON lattice_cells(user_id);

CREATE TABLE lattice_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  snapshot_date DATE,
  lattice_state JSONB,
  career_pattern_label VARCHAR(255),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lattice_snapshots_user_id ON lattice_snapshots(user_id);

CREATE TABLE career_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  pattern_name VARCHAR(255),
  dominant_tracks VARCHAR[],
  secondary_tracks VARCHAR[],
  dominant_domains VARCHAR[],
  
  coherence_score FLOAT,
  fragmentation_score FLOAT,
  
  generated_narrative TEXT,
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_career_patterns_user_id ON career_patterns(user_id);

CREATE TABLE career_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  recognition_gap_percentage FLOAT,
  identity_drift_signal FLOAT,
  alignment_signal FLOAT,
  engagement_trend VARCHAR(50),
  momentum FLOAT,
  
  has_high_recognition_gap BOOLEAN DEFAULT FALSE,
  has_identity_drift BOOLEAN DEFAULT FALSE,
  has_low_alignment BOOLEAN DEFAULT FALSE,
  has_overextension BOOLEAN DEFAULT FALSE,
  
  interpretation TEXT,
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_career_signals_user_id ON career_signals(user_id);

CREATE TABLE lattice_cell_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lattice_cell_id UUID REFERENCES lattice_cells(id) ON DELETE SET NULL,
  
  event_type VARCHAR(50),
  event_data JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_lattice_cell_events_user_id ON lattice_cell_events(user_id);

CREATE TABLE identity_trajectory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  month DATE,
  career_pattern TEXT,
  dominant_tracks VARCHAR[],
  identity_claims TEXT[],
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_identity_trajectory_user_id ON identity_trajectory(user_id);

CREATE TABLE energy_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  signal_date DATE,
  overall_energy_valence FLOAT,
  energizing_activities TEXT[],
  draining_activities TEXT[],
  
  most_energizing_cell VARCHAR(50),
  most_draining_cell VARCHAR(50),
  
  interpretation TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_energy_signals_user_id ON energy_signals(user_id);

-- ============================================================================
-- DOCUMENTS & OUTPUTS
-- ============================================================================

CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  template_type VARCHAR(50),
  name VARCHAR(255),
  description TEXT,
  
  prompt TEXT,
  
  field_mappings JSONB,
  
  word_limit INTEGER,
  style_guidance TEXT,
  example_output TEXT,
  
  is_default BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_templates_type ON templates(template_type);

CREATE TABLE generated_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  document_type VARCHAR(50),
  title VARCHAR(255),
  
  template_id UUID REFERENCES templates(id),
  template_section_id UUID,
  
  generated_content TEXT,
  generated_at TIMESTAMP WITH TIME ZONE,
  
  used_evidence_items UUID[],
  used_activities UUID[],
  used_lattice_cells VARCHAR[],
  
  user_edited_content TEXT,
  is_finalized BOOLEAN DEFAULT FALSE,
  
  version INTEGER DEFAULT 1,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_generated_documents_user_id ON generated_documents(user_id);

CREATE TABLE evidence_links (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  generated_document_id UUID REFERENCES generated_documents(id) ON DELETE CASCADE,
  evidence_item_id UUID REFERENCES evidence_items(id) ON DELETE SET NULL,
  
  evidence_text TEXT,
  generated_text TEXT,
  link_type VARCHAR(50),
  confidence FLOAT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_evidence_links_document_id ON evidence_links(generated_document_id);

CREATE TABLE document_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  generated_document_id UUID REFERENCES generated_documents(id) ON DELETE CASCADE,
  
  version_number INTEGER,
  content TEXT,
  created_by VARCHAR(50),
  change_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_document_versions_document_id ON document_versions(generated_document_id);

CREATE TABLE output_templates_user_uploaded (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  original_file_id UUID REFERENCES uploaded_documents(id),
  
  template_sections UUID[],
  
  institution_name VARCHAR(255),
  template_name VARCHAR(255),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_output_templates_user_id ON output_templates_user_uploaded(user_id);

CREATE TABLE export_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  export_type VARCHAR(50),
  documents_to_export UUID[],
  
  status VARCHAR(50),
  output_path VARCHAR(500),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_export_jobs_user_id ON export_jobs(user_id);

CREATE TABLE evidence_gallery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  title VARCHAR(255),
  evidence_items UUID[],
  
  domain_filter VARCHAR(50),
  track_filter VARCHAR(50),
  activity_type_filter VARCHAR(50),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_evidence_gallery_user_id ON evidence_gallery(user_id);

CREATE TABLE output_readiness (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  output_type VARCHAR(50),
  
  evidence_count INTEGER,
  evidence_confidence_average FLOAT,
  relevant_cells_active INTEGER,
  
  readiness_score FLOAT,
  missing_evidence TEXT[],
  
  calculated_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_output_readiness_user_id ON output_readiness(user_id);

-- ============================================================================
-- MAK & CONVERSATIONS
-- ============================================================================

CREATE TABLE mak_conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  conversation_type VARCHAR(50),
  
  mak_mode VARCHAR(50),
  
  context_json JSONB,
  
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  
  completed BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mak_conversations_user_id ON mak_conversations(user_id);

CREATE TABLE mak_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES mak_conversations(id) ON DELETE CASCADE,
  
  role VARCHAR(50),
  content TEXT,
  
  intent VARCHAR(100),
  filled_slots JSONB,
  confidence FLOAT,
  
  prior_messages_count INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mak_messages_conversation_id ON mak_messages(conversation_id);

CREATE TABLE mak_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  insight_type VARCHAR(50),
  
  content TEXT,
  
  extracted_from_conversation_id UUID REFERENCES mak_conversations(id),
  
  linked_to_lattice VARCHAR(50),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_mak_insights_user_id ON mak_insights(user_id);

CREATE TABLE mak_action_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  from_conversation_id UUID REFERENCES mak_conversations(id),
  
  action_description TEXT,
  action_category VARCHAR(50),
  
  status VARCHAR(50),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_mak_action_items_user_id ON mak_action_items(user_id);

-- ============================================================================
-- GOALS & STRATEGY
-- ============================================================================

CREATE TABLE career_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  goal_title VARCHAR(255),
  goal_description TEXT,
  goal_type VARCHAR(50),
  
  why_this_fits TEXT,
  
  evidence_already_present TEXT[],
  missing_evidence TEXT[],
  
  recommended_actions TEXT[],
  outputs_to_generate VARCHAR[],
  
  target_date DATE,
  
  relevant_cells VARCHAR[],
  
  priority INTEGER CHECK (priority >= 1 AND priority <= 5),
  
  status VARCHAR(50),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_career_goals_user_id ON career_goals(user_id);

CREATE TABLE next_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  step_title VARCHAR(255),
  step_description TEXT,
  
  linked_goal_id UUID REFERENCES career_goals(id),
  
  category VARCHAR(50),
  
  priority INTEGER,
  suggested_date DATE,
  
  status VARCHAR(50),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_next_steps_user_id ON next_steps(user_id);

CREATE TABLE career_aspirations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  aspiration_text TEXT,
  
  extracted_role VARCHAR(255),
  extracted_tracks VARCHAR[],
  extracted_domains VARCHAR[],
  
  timeline_years INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_career_aspirations_user_id ON career_aspirations(user_id);

-- ============================================================================
-- SPECIALTY CALIBRATION
-- ============================================================================

CREATE TABLE specialty_domain_modifiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  specialty_group_id UUID REFERENCES specialty_groups(id),
  
  domain VARCHAR(100),
  
  emphasis_multiplier FLOAT,
  common_activities TEXT[],
  
  interpretation_guidance TEXT,
  example_evidence TEXT,
  
  evidence_level VARCHAR(50),
  source_rationale TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_specialty_domain_modifiers_specialty ON specialty_domain_modifiers(specialty_group_id);

CREATE TABLE specialty_setting_modifiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  setting_type VARCHAR(50),
  domain VARCHAR(100),
  
  modifier_value FLOAT,
  rationale TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE specialty_role_modifiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  role_type VARCHAR(100),
  domain VARCHAR(100),
  track VARCHAR(100),
  
  modifier_value FLOAT,
  rationale TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE calibration_corrections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  specialty_group_id UUID REFERENCES specialty_groups(id),
  domain VARCHAR(100),
  
  user_correction_count INTEGER,
  
  original_modifier_value FLOAT,
  corrected_modifier_value FLOAT,
  
  triggered_retraining BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE specialty_norm_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  specialty_group_id UUID REFERENCES specialty_groups(id),
  
  domain VARCHAR(100),
  track VARCHAR(100),
  
  average_activity_count FLOAT,
  median_energy_valence FLOAT,
  common_career_patterns TEXT[],
  
  n_physicians INTEGER,
  last_updated TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PRIVACY & CONSENT
-- ============================================================================

CREATE TABLE user_consent_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  consent_type VARCHAR(100),
  
  consent_given BOOLEAN,
  consent_version VARCHAR(50),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_consent_user_id ON user_consent_records(user_id);

CREATE TABLE data_sharing_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  share_with_institution BOOLEAN DEFAULT FALSE,
  institution_name VARCHAR(255),
  
  institutional_can_see VARCHAR(50),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_data_sharing_user_id ON data_sharing_preferences(user_id);

CREATE TABLE data_deletion_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  requested_at TIMESTAMP WITH TIME ZONE,
  scheduled_deletion_date DATE,
  
  deletion_scope VARCHAR(50),
  
  status VARCHAR(50),
  
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_data_deletion_user_id ON data_deletion_requests(user_id);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  
  action VARCHAR(100),
  
  resource_type VARCHAR(50),
  resource_id UUID,
  
  action_details JSONB,
  
  ip_address VARCHAR(45),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- ============================================================================
-- SEED DATA: CAREER PHASES
-- ============================================================================

INSERT INTO career_phases (name, definition, identity_task, key_challenges, default_instruments, mak_mode_priority) VALUES
('Medical Student', 'Medical school enrollment', 'Am I becoming a physician?', 'Mistreatment, learning environment, burnout risk', '["PFI", "UWES-3"]', ARRAY['Coach']),
('Resident/Fellow', 'Residency or fellowship training', 'What kind of physician am I becoming?', 'Dual status, intense learning, identity formation', '["PFI", "UWES-9", "Career Fit", "PIF"]', ARRAY['Coach', 'Mentor']),
('Early Career Attending', 'First attending role (0-5 years)', 'How do I establish myself?', 'Novel practice setting, autonomy, work-life integration', '["PFI", "UWES-9", "Career Fit", "JeffSPLL", "PIF"]', ARRAY['Coach', 'Mentor', 'Analyst']),
('Mid-Career Attending', 'Established attending (10-20 years)', 'How do I sustain meaning while managing demands?', 'Highest burnout risk, admin burden, isolation', '["PFI", "UWES-9", "Career Fit", "JeffSPLL", "PIF", "Mini-Z"]', ARRAY['Analyst', 'Sponsor-Prep']),
('Late Career Attending', 'Senior attending (20+ years)', 'How do I finish well and prepare for transition?', 'Competency maintenance, finishing well, succession', '["PFI", "Career Fit", "PIF"]', ARRAY['Mentor']),
('Transitioning', 'Career change or major shift', 'Who am I becoming next?', 'Identity reconstruction, support needs', '["PFI", "UWES-9", "Career Fit", "PIF"]', ARRAY['Coach', 'Mentor']),
('Nonclinical', 'Non-clinical physician roles', 'How do I contribute outside clinical care?', 'Role clarity, visibility, impact measurement', '["PFI", "UWES-9", "Career Fit"]', ARRAY['Coach', 'Analyst']),
('Retired', 'Post-practice physician', 'Who am I without my white coat?', 'Identity transition, purpose, continued contribution', '["PFI"]', ARRAY['Mentor']);

-- ============================================================================
-- SEED DATA: CAREER STATES
-- ============================================================================

INSERT INTO career_states (name, definition, developmental_task, duration_years) VALUES
('Formation', 'Building foundational professional identity', 'Establish core values and competencies', 4),
('Expansion', 'Exploring multiple roles and tracks', 'Develop breadth across domains and tracks', 3),
('Differentiation', 'Specializing in preferred areas', 'Deepen expertise, build identity', 5),
('Leadership', 'Taking on formal leadership roles', 'Develop systems thinking and influence', 5),
('Integration', 'Bringing coherence to complex career', 'Integrate multiple roles into cohesive identity', 10),
('Reinvention', 'Major career transition', 'Navigate identity shift, rebuild in new domain', 2),
('Sustainability', 'Maintaining long-term engagement', 'Sustain meaning amidst complexity', 10),
('Legacy', 'Focusing on mentorship and impact', 'Transfer knowledge, shape next generation', 10);

-- ============================================================================
-- SEED DATA: SPECIALTY GROUPS
-- ============================================================================

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
('Nonclinical / Industry', ARRAY['Medical Informatics', 'Health Policy', 'Industry Medicine'], 'Non-clinical physician roles');

-- ============================================================================
-- SEED DATA: TEMPLATES
-- ============================================================================

INSERT INTO templates (template_type, name, description, word_limit, is_default) VALUES
('cv_bullets', 'CV Bullets', '5 professional accomplishments for your CV', 150, TRUE),
('annual_review', 'Annual Review', 'Comprehensive annual reflection', 750, TRUE),
('promotion_narrative', 'Promotion Narrative', 'Case for advancement', 1500, TRUE),
('teaching_statement', 'Teaching Statement', 'Philosophy of teaching', 500, TRUE),
('leadership_summary', 'Leadership Summary', 'Leadership credentials', 500, TRUE),
('professional_bio', 'Professional Bio', 'Third-person professional biography', 200, TRUE),
('cover_letter', 'Cover Letter', 'Job or fellowship application', 400, TRUE),
('invisible_work_summary', 'Invisible Work Summary', 'Document unrecognized work', 500, TRUE),
('career_snapshot', 'Career Snapshot', 'Quick career summary', 300, TRUE);

-- ============================================================================
-- RLS POLICIES (Row-Level Security)
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE evidence_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE lattice_cells ENABLE ROW LEVEL SECURITY;
ALTER TABLE mak_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_goals ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY users_select ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY users_update ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY profiles_select ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY profiles_insert ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY profiles_update ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY activity_entries_select ON activity_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY activity_entries_insert ON activity_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY activity_entries_update ON activity_entries FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY evidence_items_select ON evidence_items FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY evidence_items_insert ON evidence_items FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY evidence_items_update ON evidence_items FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY lattice_cells_select ON lattice_cells FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY lattice_cells_insert ON lattice_cells FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY lattice_cells_update ON lattice_cells FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY mak_conversations_select ON mak_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY mak_conversations_insert ON mak_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY generated_documents_select ON generated_documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY generated_documents_insert ON generated_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY generated_documents_update ON generated_documents FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY career_goals_select ON career_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY career_goals_insert ON career_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY career_goals_update ON career_goals FOR UPDATE USING (auth.uid() = user_id);

-- Reference tables (career_phases, specialty_groups, templates) are readable by all
ALTER TABLE career_phases ENABLE ROW LEVEL SECURITY;
CREATE POLICY career_phases_select ON career_phases FOR SELECT USING (TRUE);

ALTER TABLE specialty_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY specialty_groups_select ON specialty_groups FOR SELECT USING (TRUE);

ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY templates_select ON templates FOR SELECT USING (TRUE);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Common queries
CREATE INDEX idx_activity_entries_user_energy ON activity_entries(user_id, energy_valence);
CREATE INDEX idx_activity_entries_user_domain_track ON activity_entries(user_id, primary_domain, primary_track);
CREATE INDEX idx_evidence_items_domain_track ON evidence_items(domains, tracks);
CREATE INDEX idx_generated_documents_type ON generated_documents(document_type);
CREATE INDEX idx_mak_conversations_type ON mak_conversations(conversation_type);

-- Composite indexes for common filtering
CREATE INDEX idx_activity_user_date_domain ON activity_entries(user_id, activity_date DESC, primary_domain);
CREATE INDEX idx_lattice_user_active ON lattice_cells(user_id, is_active);

-- ============================================================================
-- SCHEMA VERSION
-- ============================================================================

CREATE TABLE schema_version (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  version VARCHAR(10),
  description TEXT,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO schema_version (version, description) VALUES
('1.0', 'Initial complete schema with 40+ tables, RLS, and seed data');


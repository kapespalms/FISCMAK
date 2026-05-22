-- Run this ONLY if a previous schema run failed partway through.
-- WARNING: Deletes all FISCMAK public tables. Does not touch auth.users.

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

DROP TABLE IF EXISTS schema_version CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS data_deletion_requests CASCADE;
DROP TABLE IF EXISTS data_sharing_preferences CASCADE;
DROP TABLE IF EXISTS user_consent_records CASCADE;
DROP TABLE IF EXISTS specialty_norm_data CASCADE;
DROP TABLE IF EXISTS calibration_corrections CASCADE;
DROP TABLE IF EXISTS specialty_role_modifiers CASCADE;
DROP TABLE IF EXISTS specialty_setting_modifiers CASCADE;
DROP TABLE IF EXISTS specialty_domain_modifiers CASCADE;
DROP TABLE IF EXISTS career_aspirations CASCADE;
DROP TABLE IF EXISTS next_steps CASCADE;
DROP TABLE IF EXISTS career_goals CASCADE;
DROP TABLE IF EXISTS mak_action_items CASCADE;
DROP TABLE IF EXISTS mak_insights CASCADE;
DROP TABLE IF EXISTS mak_messages CASCADE;
DROP TABLE IF EXISTS mak_conversations CASCADE;
DROP TABLE IF EXISTS output_readiness CASCADE;
DROP TABLE IF EXISTS evidence_gallery CASCADE;
DROP TABLE IF EXISTS export_jobs CASCADE;
DROP TABLE IF EXISTS output_templates_user_uploaded CASCADE;
DROP TABLE IF EXISTS document_versions CASCADE;
DROP TABLE IF EXISTS evidence_links CASCADE;
DROP TABLE IF EXISTS generated_documents CASCADE;
DROP TABLE IF EXISTS templates CASCADE;
DROP TABLE IF EXISTS energy_signals CASCADE;
DROP TABLE IF EXISTS identity_trajectory CASCADE;
DROP TABLE IF EXISTS lattice_cell_events CASCADE;
DROP TABLE IF EXISTS career_signals CASCADE;
DROP TABLE IF EXISTS career_patterns CASCADE;
DROP TABLE IF EXISTS lattice_snapshots CASCADE;
DROP TABLE IF EXISTS lattice_cells CASCADE;
DROP TABLE IF EXISTS template_sections CASCADE;
DROP TABLE IF EXISTS uploaded_documents CASCADE;
DROP TABLE IF EXISTS classification_overrides CASCADE;
DROP TABLE IF EXISTS evidence_items CASCADE;
DROP TABLE IF EXISTS activity_entries CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS specialty_groups CASCADE;
DROP TABLE IF EXISTS career_states CASCADE;
DROP TABLE IF EXISTS career_phases CASCADE;

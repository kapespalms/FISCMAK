-- FISCMAK v3: Output Studio — Wave 1
-- Tables: cv_item_metadata + output_documents
--
-- Pre-conditions (apply in order before using these tables end-to-end):
--   1. Migration 20260554 (evidence axis rename) — RENAME COLUMN is non-destructive,
--      preserves all rows. Must run so that evidence_unit uses skill_index / domain_index.
--   2. evidence_unit table must exist (migration 20260553).
--
-- Wave 2 tables (institution_profiles, institution_routes, institution_memberships,
-- document_template_prefs) are in a separate migration — do not create them here.
--
-- Founder-gated. Do NOT run directly — apply via npm run db:migrate.

-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE 1: cv_item_metadata
--
-- Structured CV item metadata layered atop confirmed evidence_unit rows.
-- One row per evidence_unit (UNIQUE FK). No change to evidence_unit schema.
--
-- CV Item Type IDs: 32 canonical items.
--   31 from FISCMAK_Psychiatry_Dictionary.xlsx (CV Item Types tab).
--   + CV-CURR-MAT (Teaching material produced) from FISCMAK_Dossier_Blueprint_ClinEd.xlsx;
--     absent from the Dictionary tab — reconcile with founder before adding types.
--
-- Physician-owned (RLS: auth.uid() = user_id).
-- Institution NEVER reads individual rows.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS cv_item_metadata (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- 1:1 with a confirmed evidence_unit row.
  -- ON DELETE CASCADE: removing the evidence_unit removes the metadata too.
  evidence_unit_id UUID        UNIQUE NOT NULL REFERENCES evidence_unit(id) ON DELETE CASCADE,

  -- Canonical CV Item Type ID from the FISCMAK Psychiatry Dictionary.
  -- CHECK enforces the 32-item pilot set; extend via ALTER TABLE when the dictionary grows.
  -- Future path: replace CHECK with FK to a cv_item_types lookup table (INSERT, not ALTER).
  item_type        VARCHAR(20) NOT NULL
    CHECK (item_type IN (
      -- Education & credentials (4)
      'CV-DEG', 'CV-LIC', 'CV-CERT', 'CV-SKILL',
      -- Publications (6)
      'CV-PUB-ORIG', 'CV-PUB-REV', 'CV-PUB-CASE',
      'CV-PUB-CHAP', 'CV-PUB-EDIT', 'CV-PUB-ABS',
      -- Presentations (5)
      'CV-PRES-NATL', 'CV-PRES-REG', 'CV-PRES-INST',
      'CV-PRES-POST', 'CV-PRES-INV',
      -- Teaching & education (6)
      'CV-TEACH-UME', 'CV-TEACH-GME', 'CV-TEACH-CME',
      'CV-CURR', 'CV-CURR-MAT', 'CV-MENTOR',
      -- Research & funding (3)
      'CV-RES-PROJ', 'CV-GRANT', 'CV-QI',
      -- Service, leadership, professional (8)
      'CV-COMM-INST', 'CV-COMM-NATL', 'CV-PEER',
      'CV-LEAD', 'CV-ADVOCACY', 'CV-MEDIA',
      'CV-AWARD', 'CV-MEM'
    )),

  -- Type-specific structured fields.
  -- Per-type shapes (enforced by application layer, not DB):
  --
  --   CV-PUB-ORIG / CV-PUB-REV / CV-PUB-CASE / CV-PUB-CHAP / CV-PUB-EDIT / CV-PUB-ABS:
  --     { title, journal_or_book, year, authors: string[],
  --       doi, pmid, volume, issue, pages, pub_type }
  --
  --   CV-PRES-NATL / CV-PRES-REG / CV-PRES-INST / CV-PRES-POST / CV-PRES-INV:
  --     { venue, city, year, reach_level, presentation_type, inviting_body }
  --
  --   CV-TEACH-UME / CV-TEACH-GME / CV-TEACH-CME:
  --     { learners_count, level, setting_id, hours, reach, eval_available }
  --
  --   CV-CURR:
  --     { course_name, institution, year_start, year_end,
  --       learner_level, disseminated, adoption_scope }
  --
  --   CV-CURR-MAT:
  --     { material_type, title, used_where, disseminated, reach }
  --
  --   CV-MENTOR:
  --     { mentee_name_or_anon, mentee_level, your_role, outcomes }
  --
  --   CV-GRANT:
  --     { title, agency, award_number, role, period_start, period_end,
  --       direct_cost_usd, total_cost_usd, effort_pct, status }
  --
  --   CV-QI:
  --     { project_title, intervention, outcome_metric, scope,
  --       your_role, disseminated, period_start, period_end }
  --
  --   CV-COMM-INST / CV-COMM-NATL:
  --     { committee_name, institution_or_org, your_role,
  --       reach_level, start_date, end_date }
  --
  --   CV-LEAD:
  --     { role_title, institution, scope_description,
  --       n_faculty, n_learners, budget_usd, start_date, end_date }
  --
  --   CV-AWARD / CV-CERT / CV-SKILL:
  --     { name, granting_body, year, reach_level }
  --
  --   CV-DEG / CV-LIC / CV-MEM / CV-PEER / CV-ADVOCACY / CV-MEDIA:
  --     { name_or_title, institution_or_org, year_or_dates, notes }
  structured_data  JSONB       NOT NULL DEFAULT '{}',

  -- Physician-confirmed display-ready CV line (the "final form" shown as a bullet).
  -- null until physician confirms the text; generation uses structured_data until then.
  display_label    TEXT,

  -- CWRU 2025 APT annotation — three mandatory sub-fields per the literal CWRU rule:
  -- "every entry should convey ROLE (authorship / contribution),
  --  SCHOLARSHIP (significance), and IMPACT (effect)."
  -- Stored separately so each can be drafted / edited independently by Mak.
  apt_role         TEXT,        -- authorship position / your specific contribution
  apt_scholarship  TEXT,        -- scholarly significance of this entry
  apt_impact       TEXT,        -- measurable effect, reach, or outcome

  -- CWRU: marks one of the 3 representative publications (asterisk on CV;
  -- copies sent to external reviewers). "Exactly 3" is enforced by the
  -- application layer, not here.
  is_representative BOOLEAN     NOT NULL DEFAULT false,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cv_item_metadata_user
  ON cv_item_metadata(user_id);

CREATE INDEX IF NOT EXISTS idx_cv_item_metadata_evidence_unit
  ON cv_item_metadata(evidence_unit_id);

CREATE INDEX IF NOT EXISTS idx_cv_item_metadata_user_type
  ON cv_item_metadata(user_id, item_type);

-- Fast lookup for the "which entries are representative publications" query
CREATE INDEX IF NOT EXISTS idx_cv_item_metadata_representative
  ON cv_item_metadata(user_id, is_representative)
  WHERE is_representative = true;

ALTER TABLE cv_item_metadata ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS cv_item_metadata_select ON cv_item_metadata;
DROP POLICY IF EXISTS cv_item_metadata_insert ON cv_item_metadata;
DROP POLICY IF EXISTS cv_item_metadata_update ON cv_item_metadata;
DROP POLICY IF EXISTS cv_item_metadata_delete ON cv_item_metadata;

-- Physician-owned: every operation scoped to auth.uid() = user_id.
-- Institution analytics are computed server-side; never query this table directly
-- for institution-facing views at the individual level.
CREATE POLICY cv_item_metadata_select ON cv_item_metadata
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY cv_item_metadata_insert ON cv_item_metadata
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY cv_item_metadata_update ON cv_item_metadata
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY cv_item_metadata_delete ON cv_item_metadata
  FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE cv_item_metadata IS
  'Structured CV item metadata layered atop confirmed evidence_unit rows. '
  '32 item types from FISCMAK Psychiatry Dictionary (pilot set). '
  'Physician-owned; institution never reads individual rows. '
  'apt_role / apt_scholarship / apt_impact implement the CWRU 2025 APT annotation rule.';

COMMENT ON COLUMN cv_item_metadata.evidence_unit_id IS
  'FK to a single confirmed evidence_unit. UNIQUE — one metadata row per evidence unit.';

COMMENT ON COLUMN cv_item_metadata.item_type IS
  '32 canonical CV Item Type IDs from FISCMAK_Psychiatry_Dictionary (CV Item Types tab) '
  '+ CV-CURR-MAT (Dossier Blueprint; confirm with founder). '
  'Use ALTER TABLE to add types (pilot); migrate to FK on cv_item_types lookup for scale.';

COMMENT ON COLUMN cv_item_metadata.structured_data IS
  'Type-specific structured fields. Shapes documented inline above and in '
  'docs/output-studio/FISCMAK_Psychiatry_Dictionary.xlsx. Enforced by application layer.';

COMMENT ON COLUMN cv_item_metadata.display_label IS
  'Physician-confirmed display-ready CV bullet. Null until confirmed; '
  'generation uses structured_data until then.';

COMMENT ON COLUMN cv_item_metadata.apt_role IS
  'CWRU 2025 APT: your authorship position or specific contribution to this entry.';

COMMENT ON COLUMN cv_item_metadata.apt_scholarship IS
  'CWRU 2025 APT: scholarly significance — why this entry matters.';

COMMENT ON COLUMN cv_item_metadata.apt_impact IS
  'CWRU 2025 APT: measurable effect, reach, or outcome of this entry.';

COMMENT ON COLUMN cv_item_metadata.is_representative IS
  'CWRU: one of 3 representative publications marked with asterisk on CV. '
  'Enforce exactly-3 at application layer (not DB constraint).';


-- ═══════════════════════════════════════════════════════════════════════════
-- TABLE 2: output_documents
--
-- Snapshot-based career documents generated from confirmed evidence.
-- Physician edits the TipTap JSON sections; changes to underlying evidence
-- do NOT auto-update an existing document (snapshot semantics).
--
-- institution_route_id is a plain UUID column here (no FK constraint).
-- The FK to institution_routes is added in the Wave 2 migration when that
-- table exists. Wave 1 documents always use the Standard route (null).
--
-- Physician-owned (RLS: auth.uid() = user_id).
-- Institution NEVER reads individual documents.
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS output_documents (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Document type. No _cwru variants — institution formatting is driven by
  -- institution_route_id; the type describes the document's purpose, not its format.
  document_type         VARCHAR(30) NOT NULL
    CHECK (document_type IN (
      'cv',                      -- full academic CV (AAMC-style; CWRU-formatted via route)
      'resume_industry',         -- 1-2 page industry/non-clinical resume
      'cover_letter',            -- academic / community-clinical / industry (see audience_context)
      'biosketch_nih',           -- NIH biographical sketch (≤5 pages)
      'biosketch_institutional', -- institutional biosketch
      'promotion_dossier',       -- full P&T dossier package
      'personal_statement',      -- career / personal narrative
      'teaching_narrative',      -- teaching philosophy + contributions (≤2 pp)
      'research_narrative',      -- research contributions + funding history (≤2 pp)
      'service_narrative',       -- service description (≤2 pp)
      'career_snapshot',         -- one-page lattice + well-being + goals summary
      'invisible_work_summary',  -- OI+SI evidence narrative
      'educator_portfolio',      -- teaching portfolio (CWRU guidelines)
      'quality_portfolio',       -- quality improvement portfolio
      'career_narrative',        -- full career narrative
      'annual_review',           -- annual review document
      'professional_bio'         -- short professional biography
    )),

  title                 TEXT        NOT NULL,

  -- Determines document variant: cover-letter (academic/community_clinical/industry);
  -- dossier track; biosketch audience; resume target.
  audience_context      VARCHAR(25)
    CHECK (audience_context IN (
      'academic_promotion',  -- promotion / tenure dossier; CWRU-routed CV
      'academic',            -- academic job application; academic cover letter
      'community_clinical',  -- community / clinical position
      'industry',            -- non-clinical / industry (resume, cover letter, pivot)
      'grant',               -- biosketch for grant application
      'standalone'           -- no specific audience context
    )),

  -- Institution route applied at generation time.
  -- null = Standard route (generic AAMC defaults; no institution overlay).
  -- Wave 1: always null (Wave 2 adds FK and populates institution routes).
  -- FK to institution_routes added in Wave 2 migration.
  institution_route_id  UUID,

  -- Workflow state
  status                VARCHAR(20) NOT NULL DEFAULT 'draft'
    CHECK (status IN (
      'draft',         -- in progress; not ready for review
      'review_ready',  -- physician has reviewed; ready to share / export
      'exported',      -- exported to .docx or PDF
      'archived'       -- no longer active; retained for history
    )),

  -- ── Section snapshot (TipTap ProseMirror JSON) ───────────────────────────
  --
  -- Ordered array of section objects. Never auto-updated from evidence changes.
  -- Each element shape:
  --
  --   type             TEXT     — section slug matching the institution route
  --                               (e.g. 'bibliography', 'teaching_activities',
  --                               'personal_statement', 'referee_list')
  --   label            TEXT     — display label; may be institution-overridden
  --   enabled          BOOLEAN  — included in this render (false = toggled off)
  --   order            INTEGER  — display position (1-indexed)
  --   mak_role         TEXT     — 'assemble' | 'draft' | 'draft_and_assemble'
  --                               assemble: Mak pulls bank entries, renders structured
  --                               draft:    Mak writes grounded prose from bank evidence
  --                               draft_and_assemble: narrative + assembled evidence
  --   tiptap_content   OBJECT   — TipTap document JSON; null until generated
  --   provenance_ids   UUID[]   — evidence_unit IDs cited in this section
  --   reach_subheadings BOOLEAN — organize entries by reach (CWRU rule:
  --                               International / National / Regional / Local / Institutional)
  --
  sections              JSONB       NOT NULL DEFAULT '[]',

  -- Evidence frozen at generation time.
  -- Application layer validates the no-invention rule:
  --   "every bullet must cite one of these IDs or be marked [needs source]."
  -- Array; no FK constraint — validated in application layer.
  evidence_snapshot_ids UUID[]      NOT NULL DEFAULT '{}',

  generated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_edited_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  exported_at           TIMESTAMPTZ,

  -- LLM model that generated the initial draft (for audit / quality tracking)
  generation_model      VARCHAR(80)
);

CREATE INDEX IF NOT EXISTS idx_output_documents_user
  ON output_documents(user_id);

CREATE INDEX IF NOT EXISTS idx_output_documents_user_type
  ON output_documents(user_id, document_type);

CREATE INDEX IF NOT EXISTS idx_output_documents_user_status
  ON output_documents(user_id, status);

-- Most-recently-edited first (the default sort in the document list UI)
CREATE INDEX IF NOT EXISTS idx_output_documents_user_recent
  ON output_documents(user_id, last_edited_at DESC);

ALTER TABLE output_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS output_documents_select ON output_documents;
DROP POLICY IF EXISTS output_documents_insert ON output_documents;
DROP POLICY IF EXISTS output_documents_update ON output_documents;
DROP POLICY IF EXISTS output_documents_delete ON output_documents;

-- Physician-owned: every operation scoped to auth.uid() = user_id.
-- Institution analytics are computed server-side from evidence_unit (not from here).
CREATE POLICY output_documents_select ON output_documents
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY output_documents_insert ON output_documents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY output_documents_update ON output_documents
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY output_documents_delete ON output_documents
  FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE output_documents IS
  'Snapshot-based career documents generated from confirmed evidence. '
  'Physician edits TipTap JSON sections; evidence changes do not auto-update '
  'existing documents (snapshot semantics). Physician-owned. '
  'Institution never reads individual documents.';

COMMENT ON COLUMN output_documents.institution_route_id IS
  'Wave 1: plain UUID, no FK constraint. '
  'Wave 2 migration adds: ALTER TABLE output_documents '
  'ADD CONSTRAINT output_documents_institution_route_fk '
  'FOREIGN KEY (institution_route_id) REFERENCES institution_routes(id) ON DELETE SET NULL. '
  'null = Standard route (generic AAMC defaults).';

COMMENT ON COLUMN output_documents.sections IS
  'Ordered section array (TipTap JSON per section). '
  'Per-element keys: type, label, enabled, order, mak_role '
  '(assemble|draft|draft_and_assemble), tiptap_content, provenance_ids, '
  'reach_subheadings. Snapshot — never auto-refreshed. '
  'See docs/output-studio/ for section type vocabulary.';

COMMENT ON COLUMN output_documents.evidence_snapshot_ids IS
  'evidence_unit IDs included at generation time. Frozen. '
  'No FK (array); application layer enforces the no-invention rule: '
  'every bullet cites one of these IDs or is marked [needs source].';

COMMENT ON COLUMN output_documents.generation_model IS
  'Claude model ID used for the initial draft (e.g. claude-sonnet-4-6). '
  'Audit trail; not shown in physician UI.';

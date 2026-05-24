# FISCMAK Project Inventory

**Branch:** `cursor/mvp-app-foundation`  
**Generated:** May 2026  
**Repo:** `/Users/kristenpalmer/fiscmak`

This document inventories database migrations, TypeScript source, React components, external integrations, and gaps against the **7-Touchpoint Coaching Cadence** (the product’s canonical “7-layer” engagement system per `docs/spec-v2/FISCMAK_QUICK_REFERENCE.md`).

---

## Summary counts

| Category | Count |
|----------|------:|
| SQL migration / schema files | 11 |
| Active V2 database tables | 49 |
| Legacy V1 database tables | 37 |
| TypeScript files (`src/**/*.ts`, `src/**/*.tsx`) | 242 |
| — `src/lib/` | 92 |
| — `src/components/` | 74 |
| — `src/app/` (pages + API routes) | 75 |
| — `src/middleware.ts` | 1 |
| React components (`src/components/**/*.tsx`) | 74 |
| API route handlers | 52 |
| App pages | 23 |

---

## Database migrations

Migrations live under `docs/` (no Supabase CLI `supabase/migrations/` folder). Apply via `npm run db:migrate` or Supabase SQL Editor.

### Automated apply order (`scripts/apply-supabase-migrations.mjs`)

| # | File | Notes |
|---|------|-------|
| 1 | `docs/FISCMAK_V2_SCHEMA.sql` | Skipped if `app_users` exists |
| 2 | `docs/migrations/20260521_touchpoint1_onboarding.sql` | Always applied (idempotent ALTERs) |
| 3 | `docs/migrations/20260522_activity_entries_v2.sql` | Skipped if `activity_entries` exists |
| 4 | `docs/migrations/20260521_career_data_schema.sql` | Skipped if `physicians` exists |

Post-migrate: backfill `app_users` from `auth.users`.

### Manual / incremental (not in `db:migrate`)

| File | Purpose |
|------|---------|
| `docs/migrations/20260523_specialty_hierarchy.sql` | `base_specialty`, `subspecialty`, `subspecialty_training_complete` on `app_users` |

### Legacy / setup utilities

| File | Purpose |
|------|---------|
| `docs/FISCMAK_SUPABASE_SCHEMA.sql` | V1 SOAP/lattice MVP schema (**deprecated**) |
| `docs/archive/FISCMAK_V1_SCHEMA.sql` | Archived V1 copy |
| `docs/supabase-auth-bridge.sql` | V1 `auth.users` → `users` + `profiles` trigger |
| `docs/supabase-finish-setup.sql` | Seed lookup data on partial V1 installs |
| `docs/supabase-reset.sql` | Drop V1 tables for clean slate |

---

## Database tables

### V2 platform core (`FISCMAK_V2_SCHEMA.sql`)

| Table | Purpose |
|-------|---------|
| `app_users` | Profile hub (1:1 with `auth.users`); onboarding tiers, specialty, career metadata |
| `career_assessments` | 7-touchpoint assessment records (`touchpoint_number` 1–7) |
| `documents` | CV/resume uploads + extraction status |
| `pathways` | Specialty career tracks (public read) |
| `jobs` | Job listings (public read) |
| `user_job_matches` | Per-user match scores, viewed/saved timestamps |
| `mempalace_exports` | Coach Mak memory snapshots |
| `user_settings` | Goals JSONB, salary prefs, notifications |
| `chat_messages` | Mak conversation history |
| `promotion_dossier` | Promotion packet + narrative draft |
| `narrative_progress` | Per-section promotion narrative progress |

**Auth:** trigger `on_auth_user_created_v2` creates `app_users` + `user_settings` on signup.

### Onboarding extension (`20260521_touchpoint1_onboarding.sql`)

Alters `app_users` only — expands `career_stage` enum; adds `practice_setting`, `academic_rank`, `primary_career_track`, `onboarding_metadata`.

### Specialty hierarchy (`20260523_specialty_hierarchy.sql`)

Alters `app_users` — adds `base_specialty`, `subspecialty`, `subspecialty_training_complete`.

### Activity capture (`20260522_activity_entries_v2.sql`)

| Table | Purpose |
|-------|---------|
| `activity_entries` | Mak-captured activities → domain/track classification, energy, confidence |

FK: `user_id` → `auth.users`. RLS per user.

> **Note:** V1 schema also defines `activity_entries` with a different shape. Only one version should be authoritative per database.

### Career Data vault (`20260521_career_data_schema.sql`)

**Model:** People → Activities → Metrics → Composites  
**Key:** `physicians.physician_id` = `app_users.user_id`

#### Identity (4)

| Table |
|-------|
| `physicians` |
| `specialty_certifications` |
| `career_setting` |
| `identity_verification` |

#### Scholarly (4)

| Table |
|-------|
| `publications` |
| `grants` |
| `presentations` |
| `scholarly_metrics` |

#### Clinical (3)

| Table |
|-------|
| `clinical_productivity` |
| `scope_of_practice` |
| `compensation` |

#### Service / education / invisible work (5)

| Table |
|-------|
| `service_activities` |
| `educational_activities` |
| `leadership_positions` |
| `invisible_work_log` |
| `invisible_work_questionnaire` |

#### Well-being (3)

| Table |
|-------|
| `wellbeing_assessments` |
| `professional_identity` |
| `career_aspirations` |

#### Industry (2)

| Table |
|-------|
| `industry_payments` |
| `industry_positions` |

#### Composites (6)

| Table |
|-------|
| `career_development_index` |
| `invisible_work_quotient` |
| `lattice_positioning` |
| `benchmarking_snapshots` |
| `career_recommendations` |
| `career_documents` |

#### Enrichment pipeline (2)

| Table |
|-------|
| `api_enrichment_runs` |
| `reconciliation_items` |

#### Normative lookup — seeded, read-only (8)

| Table |
|-------|
| `h_index_norms` |
| `wrvu_norms` |
| `compensation_norms` |
| `promotion_rate_norms` |
| `burnout_prevalence_norms` |
| `sop_score_norms` |
| `em_percentile_rulers` |
| `cdi_weight_templates` |

TypeScript mirror: `src/lib/v2/career-data-schema.ts`

### Legacy V1 (`FISCMAK_SUPABASE_SCHEMA.sql`) — deprecated

| Domain | Tables |
|--------|--------|
| Auth / profile | `users`, `profiles` |
| Career taxonomy | `career_phases`, `career_states`, `specialty_groups` |
| Lattice / evidence | `activity_entries`, `evidence_items`, `classification_overrides`, `uploaded_documents`, `template_sections`, `lattice_cells`, `lattice_snapshots`, `career_patterns`, `career_signals`, `lattice_cell_events`, `identity_trajectory`, `energy_signals` |
| Output studio | `templates`, `generated_documents`, `evidence_links`, `document_versions`, `output_templates_user_uploaded`, `export_jobs`, `evidence_gallery`, `output_readiness` |
| Mak (V1) | `mak_conversations`, `mak_messages`, `mak_insights`, `mak_action_items` |
| Goals | `career_goals`, `next_steps`, `career_aspirations` |
| Calibration | `specialty_domain_modifiers`, `specialty_setting_modifiers`, `specialty_role_modifiers`, `calibration_corrections`, `specialty_norm_data` |
| Privacy / audit | `user_consent_records`, `data_sharing_preferences`, `data_deletion_requests`, `audit_logs` |
| Meta | `schema_version` |

---

## TypeScript files

### Root / middleware

| File |
|------|
| `src/middleware.ts` |

### `src/lib/` — shared libraries (92 files)

#### Core / legacy

| File | Role |
|------|------|
| `activities-storage.ts` | Client activity persistence |
| `annual-mak-client.ts` | Annual touchpoint Mak client |
| `card-mak-prompts.ts` | Mak discuss configs per card/section |
| `classify.ts` | Activity classification fallback |
| `constants.ts` | App constants, output templates |
| `dashboard-metrics.ts` | Dashboard metric helpers |
| `demo-data.ts` | Static demo seed data |
| `demo-mode.ts` | Demo vs Supabase detection |
| `design-system.ts` | Design tokens |
| `documents.ts` | Document helpers |
| `goals.ts` | Goal CRUD + persistence |
| `lattice.ts` | 8×8 lattice computation |
| `mak-chatbot-states.ts` | Mak greeting / state copy |
| `mak-conversations.ts` | Legacy Mak conversation storage |
| `mak-demo-replies.ts` | Demo-mode Mak replies |
| `mak-greeting.ts` | Display name formatting |
| `mak-panel-preference.ts` | Mak panel open/close preference |
| `mak-sections.ts` | Section → Mak intent mapping |
| `profile-avatar.ts` | Avatar initials/colors |
| `quarterly-mak-client.ts` | Quarterly touchpoint Mak client |
| `studio-export.ts` | DOCX/PDF export |
| `studio-versions.ts` | Document version history |
| `subjective-storage.ts` | Legacy subjective localStorage |
| `theme-preference.ts` | Light/dark theme |
| `use-media-query.ts` | Responsive hooks |
| `utils.ts` | `cn()` and utilities |

#### `src/lib/supabase/`

| File |
|------|
| `client.ts` |
| `ensure-user.ts` |
| `middleware.ts` |
| `server.ts` |

#### `src/lib/types/`

| File |
|------|
| `database.ts` |

#### `src/lib/v2/` — domain layer (66 files)

| File | Role |
|------|------|
| `academic-profiles.ts` | Academic rank/track profiles |
| `activity-capture.ts` | Activity entry API persistence |
| `annual-mak-flow.ts` | Annual refresh Mak orchestration |
| `annual-refresh.ts` | Annual touchpoint eligibility/status |
| `api-enrichment.ts` | CV → OpenAlex/PubMed/NPI/ORCID/NIH cascade |
| `api-helpers.ts` | API auth, JSON helpers, user upsert |
| `assessment-insights.ts` | Insights page synthesis (7 TP status) |
| `career-alignment-tracking.ts` | Alignment metric tracking |
| `career-data-repo.ts` | Dual-write enrichment to Supabase |
| `career-data-schema.ts` | Career Data TypeScript types |
| `career-health-view.ts` | Dashboard health score model |
| `career-language.ts` | Formula → user-facing label translation |
| `career-recommendations.ts` | Coaching recommendation engine |
| `career-vault.ts` | Career Data vault view model |
| `cdi-weights.ts` | CDI component weights |
| `conversational-assessment-service.ts` | Mak ↔ assessment answer persistence |
| `conversational-assessment.ts` | Conversational assessment prompts |
| `cv-metrics.ts` | CV-derived metrics (h-index proxy, BITS) |
| `dashboard-architecture.ts` | Dashboard header / health architecture |
| `dashboard-data.ts` | Dashboard data builders |
| `dashboard-mak-menu.ts` | Dashboard MECE Mak menu (4 actions) |
| `dashboard-redesign.ts` | Command-center dashboard builders |
| `dashboard-snapshot.ts` | SOAP dashboard band snapshots |
| `db.ts` | Supabase fetch layer + analytics assembly |
| `demo-store.ts` | Server demo/localStorage fallback |
| `document-upload.ts` | Document upload helpers |
| `engagement-tracking.ts` | Streak / engagement hooks |
| `ensure-app-user.ts` | Ensure app_users row exists |
| `escalation-protocols.ts` | Crisis escalation copy/routing |
| `formulas.ts` | CRI, pathway clarity, TP meta, scores |
| `goal-framework.ts` | Development/Maintenance/Sustainability goals |
| `goal-milestone-actions.ts` | Milestone status updates |
| `goal-milestone-tracking.ts` | Milestone progress tracking |
| `goal-setting-mak-flow.ts` | Mak goal-setting conversation |
| `instrument-conversation-service.ts` | Validated instrument capture via Mak |
| `invisible-work-taxonomy.ts` | Invisible work categories by level |
| `mak-state-machine.ts` | Mak global state machine |
| `metric-decline-tracking.ts` | Longitudinal metric decline |
| `onboarding-compute.ts` | Onboarding metadata + CDI compute |
| `onboarding-flow.ts` | Onboarding step routing |
| `onboarding-instruments.ts` | PFI/MBI/etc. instrument defs |
| `onboarding-options.ts` | Specialty, stage, setting enums |
| `onboarding-touchpoint1.ts` | TP1 document/instrument requirements |
| `output-generation.ts` | Claude output prefill/generation |
| `promotion-narrative-sections.ts` | 6-section promotion narrative |
| `quarterly-mak-flow.ts` | Quarterly pulse Mak orchestration |
| `quarterly-pulse.ts` | Quarterly touchpoint eligibility |
| `question-bank.ts` | 50-question bank across 7 touchpoints |
| `reconcile-mak-flow.ts` | Enrichment reconcile via Mak |
| `reconcile-mak-helpers.ts` | Reconcile helpers |
| `section-mak-routes.ts` | Section quick-pill Mak routing |
| `soap-tab-spec.ts` | SOAP tab labels, nav, ownership |
| `spec-table-inventory.ts` | Spec cross-reference inventory |
| `specialty-hierarchy.ts` | Base specialty / subspecialty logic |
| `touchpoint-eligibility.ts` | Which touchpoints are due |
| `touchpoint-fetch.ts` | Analytics + touchpoint fetch |
| `touchpoint-mak-capture.ts` | Mak answer capture for TPs |
| `touchpoint-mak-orchestrator.ts` | Annual/quarterly Mak turn processing |
| `touchpoint-side-effects.ts` | Post-touchpoint side effects |
| `touchpoint-submit.ts` | Touchpoint submission results |
| `types.ts` | V2 shared types |

### `src/app/` — pages & API routes (75 files)

#### Pages

| Route | File |
|-------|------|
| `/` | `app/page.tsx` |
| `/login` | `app/login/page.tsx` |
| `/signup` | `app/signup/page.tsx` |
| `/app` | `app/app/page.tsx` |
| `/app/dashboard` | `app/app/dashboard/page.tsx` |
| `/app/subjective` | `app/app/subjective/page.tsx` |
| `/app/objective` | `app/app/objective/page.tsx` |
| `/app/assessment` | `app/app/assessment/page.tsx` |
| `/app/plan` | `app/app/plan/page.tsx` |
| `/app/output` | `app/app/output/page.tsx` |
| `/app/profile` | `app/app/profile/page.tsx` |
| `/app/settings` | `app/app/settings/page.tsx` |
| `/app/onboarding` | `app/app/onboarding/page.tsx` |
| `/app/onboarding/tier2` | `app/app/onboarding/tier2/page.tsx` |
| `/app/mak` | `app/app/mak/page.tsx` (redirects to dashboard) |
| **Legacy redirects** | |
| `/app/goals` | `app/app/goals/page.tsx` |
| `/app/jobs` | `app/app/jobs/page.tsx` |
| `/app/studio` | `app/app/studio/page.tsx` |
| `/app/lattice` | `app/app/lattice/page.tsx` |
| `/app/activities` | `app/app/activities/page.tsx` |
| `/app/documents` | `app/app/documents/page.tsx` |

#### API routes (`/api/v1/*` + legacy)

| Route | File |
|-------|------|
| `POST /api/v1/auth/login` | `api/v1/auth/login/route.ts` |
| `POST /api/v1/auth/register` | `api/v1/auth/register/route.ts` |
| `GET/PUT /api/v1/users/me` | `api/v1/users/me/route.ts` |
| `GET /api/v1/onboarding/status` | `api/v1/onboarding/status/route.ts` |
| `GET /api/v1/onboarding/touchpoint1` | `api/v1/onboarding/touchpoint1/route.ts` |
| `POST /api/v1/onboarding/profile` | `api/v1/onboarding/profile/route.ts` |
| `POST /api/v1/onboarding/compute` | `api/v1/onboarding/compute/route.ts` |
| `GET/POST /api/v1/onboarding/reconciliation` | `api/v1/onboarding/reconciliation/route.ts` |
| `POST /api/v1/onboarding/tier1/specialty` | `api/v1/onboarding/tier1/specialty/route.ts` |
| `POST /api/v1/onboarding/tier1/career-stage` | `api/v1/onboarding/tier1/career-stage/route.ts` |
| `GET/POST /api/v1/assessments/*` | `api/v1/assessments/**/route.ts` (5 routes) |
| `GET/POST /api/v1/documents` | `api/v1/documents/route.ts` |
| `POST /api/v1/enrichment/run` | `api/v1/enrichment/run/route.ts` |
| `GET/POST /api/v1/chat/*` | `api/v1/chat/message`, `history` |
| `GET /api/v1/analytics/dashboard` | `api/v1/analytics/dashboard/route.ts` |
| `GET/POST /api/v1/goals/*` | `api/v1/goals/**/route.ts` (3 routes) |
| `GET /api/v1/pathways` | `api/v1/pathways/route.ts` |
| `GET /api/v1/pathways/[id]` | `api/v1/pathways/[id]/route.ts` |
| `GET /api/v1/jobs/*` | `api/v1/jobs/**/route.ts` (5 routes) |
| `GET/POST /api/v1/mempalace/*` | `api/v1/mempalace/context`, `sync` |
| `GET/POST /api/v1/touchpoints/*` | `api/v1/touchpoints/**/route.ts` (4 routes) |
| `GET/POST /api/v1/promotion/*` | `api/v1/promotion/**/route.ts` (6 routes) |
| `GET /api/v1/templates` | `api/v1/templates/route.ts` |
| `POST /api/v1/output/generate` | `api/v1/output/generate/route.ts` |
| `GET /api/v1/coaching/recommendations` | `api/v1/coaching/recommendations/route.ts` |
| `GET/POST /api/v1/activities` | `api/v1/activities/route.ts` |
| **Legacy (deprecated)** | |
| `POST /api/classify/activity` | `api/classify/activity/route.ts` |
| `POST /api/documents/parse` | `api/documents/parse/route.ts` |
| `POST /api/mak/message` | `api/mak/message/route.ts` |
| `POST /api/output/generate` | `api/output/generate/route.ts` |
| `GET /auth/callback` | `auth/callback/route.ts` |

---

## React components (`src/components/` — 74 files)

### `auth/` (2)

| Component | File |
|-----------|------|
| `AuthGuard` | `auth/AuthGuard.tsx` |
| `GoogleSignInButton` | `auth/GoogleSignInButton.tsx` |

### `brand/` (5)

| Component | File |
|-----------|------|
| `CoachMakAvatar` | `brand/CoachMakAvatar.tsx` |
| `CoachMakMark` | `brand/CoachMakMark.tsx` |
| `MakHexMicButton` | `brand/MakHexMicButton.tsx` |
| `NavIcon` | `brand/NavIcon.tsx` |
| `SidebarDecoyIcon` | `brand/SidebarDecoyIcon.tsx` |

### `dashboard/` (9)

| Component | File |
|-----------|------|
| `DashboardAlerts` | `dashboard/DashboardAlerts.tsx` |
| `DashboardDueNow` | `dashboard/DashboardDueNow.tsx` |
| `DashboardGoalsGrid` | `dashboard/DashboardGoalsGrid.tsx` |
| `DashboardMakButton` | `dashboard/DashboardMakButton.tsx` |
| `DashboardWelcome` | `dashboard/DashboardWelcome.tsx` |
| `HealthScoreCard` | `dashboard/HealthScoreCard.tsx` |
| `MiniLattice` | `dashboard/MiniLattice.tsx` |
| `ProfileSummaryCard` | `dashboard/ProfileSummaryCard.tsx` |
| `TouchpointProgressStrip` | `dashboard/TouchpointProgressStrip.tsx` |

### `layout/` (10)

| Component | File |
|-----------|------|
| `AcademicSoapSectionGate` | `layout/AcademicSoapSectionGate.tsx` |
| `AnalyticsProvider` | `layout/AnalyticsProvider.tsx` |
| `AppShell` | `layout/AppShell.tsx` |
| `EscalationResourcesPanel` | `layout/EscalationResourcesPanel.tsx` |
| `IconSidebar` | `layout/IconSidebar.tsx` |
| `MakPanel` | `layout/MakPanel.tsx` |
| `PageShell` | `layout/PageShell.tsx` |
| `SectionGateEntry` | `layout/SectionGateEntry.tsx` |
| `ThemeProvider` | `layout/ThemeProvider.tsx` |
| `TopNavBar` | `layout/TopNavBar.tsx` |

### `mak/` (1)

| Component | File |
|-----------|------|
| `MakChat` | `mak/MakChat.tsx` |

### `onboarding/` (9)

| Component | File |
|-----------|------|
| `DashboardRevealOverlay` | `onboarding/DashboardRevealOverlay.tsx` |
| `GoalSettingPanel` | `onboarding/GoalSettingPanel.tsx` |
| `LayOfTheLandTour` | `onboarding/LayOfTheLandTour.tsx` |
| `OnboardingGuard` | `onboarding/OnboardingGuard.tsx` |
| `OnboardingWelcome` | `onboarding/OnboardingWelcome.tsx` |
| `SpecialtyIntakeFields` | `onboarding/SpecialtyIntakeFields.tsx` |
| `Tier1Onboarding` | `onboarding/Tier1Onboarding.tsx` |
| `Tier2Onboarding` | `onboarding/Tier2Onboarding.tsx` |
| `Touchpoint1Onboarding` | `onboarding/Touchpoint1Onboarding.tsx` |

### `profile/` (2)

| Component | File |
|-----------|------|
| `ProfileMenu` | `profile/ProfileMenu.tsx` |
| `UserAvatar` | `profile/UserAvatar.tsx` |

### `studio/` (4)

| Component | File |
|-----------|------|
| `EvidenceChipNode` | `studio/EvidenceChipNode.tsx` |
| `EvidenceDrawer` | `studio/EvidenceDrawer.tsx` |
| `StudioLexicalEditor` | `studio/StudioLexicalEditor.tsx` |
| `VersionHistoryPanel` | `studio/VersionHistoryPanel.tsx` |

### `lattice/` (1)

| Component | File |
|-----------|------|
| `LatticeGrid` | `lattice/LatticeGrid.tsx` |

### `ui/` (14)

| Component | File |
|-----------|------|
| `Badge` | `ui/Badge.tsx` |
| `Button` | `ui/Button.tsx` |
| `Card` | `ui/Card.tsx` |
| `CardSection` | `ui/CardSection.tsx` |
| `EmptyState` | `ui/EmptyState.tsx` |
| `Input` | `ui/Input.tsx` |
| `LoadingSteps` | `ui/LoadingSteps.tsx` |
| `MakDiscussLink` | `ui/MakDiscussLink.tsx` |
| `MetricRow` | `ui/MetricRow.tsx` |
| `ScoreDisplay` | `ui/ScoreDisplay.tsx` |
| `StatusChip` | `ui/StatusChip.tsx` |
| `StatusIndicator` | `ui/StatusIndicator.tsx` |
| `TechnicalDetailToggle` | `ui/TechnicalDetailToggle.tsx` |

### `workspace/` (17)

| Component | File |
|-----------|------|
| `ActivitiesView` | `workspace/ActivitiesView.tsx` |
| `AnnualRefreshPanel` | `workspace/AnnualRefreshPanel.tsx` |
| `AssessmentInsightsWorkspace` | `workspace/AssessmentInsightsWorkspace.tsx` |
| `CareerDataReconcilePanel` | `workspace/CareerDataReconcilePanel.tsx` |
| `CareerDataVaultPanel` | `workspace/CareerDataVaultPanel.tsx` |
| `CareerStrategyGoalCard` | `workspace/CareerStrategyGoalCard.tsx` |
| `DashboardWorkspace` | `workspace/DashboardWorkspace.tsx` |
| `DocumentsView` | `workspace/DocumentsView.tsx` |
| `GoalsWorkspace` | `workspace/GoalsWorkspace.tsx` |
| `JobsWorkspace` | `workspace/JobsWorkspace.tsx` |
| `LatticeView` | `workspace/LatticeView.tsx` |
| `ObjectiveWorkspace` | `workspace/ObjectiveWorkspace.tsx` |
| `OutputStudioWorkspace` | `workspace/OutputStudioWorkspace.tsx` |
| `PathwaysExplorer` | `workspace/PathwaysExplorer.tsx` |
| `PromotionNarrativeWizard` | `workspace/PromotionNarrativeWizard.tsx` |
| `QuarterlyPulsePanel` | `workspace/QuarterlyPulsePanel.tsx` |
| `StrategyWorkspace` | `workspace/StrategyWorkspace.tsx` |
| `SubjectiveWorkspace` | `workspace/SubjectiveWorkspace.tsx` |

---

## External services connected

| Service | Env var | Used for | Integration files |
|---------|---------|----------|-------------------|
| **Supabase** | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SESSION_POOLER_URL` / `DATABASE_URL` | Auth (email + Google OAuth), Postgres, RLS | `src/lib/supabase/*`, `src/lib/v2/db.ts`, API routes |
| **Anthropic Claude** | `ANTHROPIC_API_KEY` | Coach Mak chat, CV parse (legacy), output generation | `api/v1/chat/message`, `api/documents/parse`, `api/v1/output/generate`, `api/mak/message` |
| **OpenAI** | `OPENAI_API_KEY` (optional) | Activity classification (GPT-4o-mini); keyword fallback if missing | `api/classify/activity` |
| **OpenAlex** | — (public API) | Publication metadata + citations from DOI | `src/lib/v2/api-enrichment.ts` |
| **PubMed / NCBI eUtils** | — (public API) | PMID summaries | `src/lib/v2/api-enrichment.ts` |
| **NPI Registry (CMS)** | — (public API) | Physician identity verification | `src/lib/v2/api-enrichment.ts` |
| **ORCID** | — (public API) | Works count from ORCID ID | `src/lib/v2/api-enrichment.ts` |
| **NIH RePORTER** | — (public API) | Grant search | `src/lib/v2/api-enrichment.ts` |

### Specified but not wired

| Service | Spec reference | Status |
|---------|----------------|--------|
| OpenAI Whisper | Voice-to-text in Mak | Not implemented |
| LinkedIn / Indeed / MedJobs | Live job ingestion | Demo seed data only in `jobs` table |
| Google Scholar / iCite / Crossref | Full enrichment cascade | Partial (OpenAlex + PubMed only) |
| CMS Open Payments / Medicare | Industry/clinical signals | Parsed in enrichment metadata; limited DB dual-write |
| ABMS board certification API | Identity verification | Schema ready; no live API |
| S3 / blob storage | Document file storage | `file_url` column; upload flow uses Supabase storage pattern |

### Demo fallback

When Supabase is unconfigured (`src/lib/demo-mode.ts`), the app uses `src/lib/v2/demo-store.ts` and browser localStorage — no external persistence.

---

## 7-Touchpoint Coaching Cadence — implementation status

The product spec defines **7 scheduled coaching touchpoints** (`TOUCHPOINT_META` in `src/lib/v2/formulas.ts`). This is the canonical “7-layer” engagement system.

| TP | Title | Spec timing | Question bank | Primary UI / API | Status |
|----|-------|-------------|---------------|------------------|--------|
| **1** | Professional Identity | Day 0 | 8 Qs (Q1.x) | Tier 1 onboarding, `Touchpoint1Onboarding`, Mak intro | **Partial** — onboarding gates work; full TP1 assessment wizard removed |
| **2** | Career Inventory | Day 3 | 6 Qs (Q2.x) | CV upload (`Tier2Onboarding`), `/api/v1/enrichment/run`, Vault | **Partial** — enrichment runs; inventory Qs mostly via Mak chat, not dedicated UI |
| **3** | Energy & Invisible Work | Week 1 | 8 Qs (Q3.x) | `SubjectiveWorkspace`, quarterly pulse, validated instruments | **Partial** — quarterly/annual panels exist; full MBI/PFI instrument UI incomplete |
| **4** | Values & Narrative | Week 2 | 6 Qs (Q4.x) | Mak conversational capture, Insights synthesis | **Partial** — questions in bank; no dedicated Values workspace |
| **5** | Promotion Readiness | Week 3 | 8 Qs (Q5.x) | `/api/v1/promotion/readiness`, Insights gap cards | **Partial** — readiness API exists; TP5-driven promotion checklist UI thin |
| **6** | Job Market Fit | Month 2 | 6 Qs (Q6.x) | `StrategyWorkspace` (Pathways + Jobs tabs) | **Mostly done** — pathways explorer restored; job feed is seeded/demo |
| **7** | Progress Review | Month 3+ | 8 Qs (Q7.x) | Goal milestones, Insights accountability cards | **Partial** — milestone tracking works; no TP7 accountability scheduler |

**Question bank:** 50 questions deployed in `src/lib/v2/question-bank.ts` (spec calls for 60).

**Cross-cutting gaps for the 7-TP system:**

| Gap | Detail |
|-----|--------|
| Scheduled cadence engine | `daysFromStart` in `TOUCHPOINT_META` is not enforced — no cron/job pushes users into TPs 2–7 on schedule |
| Assessment wizard UI | `AssessmentWizard` component removed; flow is Mak-conversational + `/app/assessment` insights view |
| Touchpoint completion UX | Seven TP status cards on Insights (`AssessmentInsightsWorkspace`) — read-only synthesis; limited “start TP N” affordances |
| Full question bank | 10 questions short of 60-Q spec; some categories under-sampled |
| Career Data dual-write | Enrichment writes `api_enrichment_runs` + `reconciliation_items`; most domain tables (`publications`, `grants`, etc.) not populated from live API cascade |
| Production migrations | `20260523_specialty_hierarchy.sql` not in `npm run db:migrate`; Career Data schema may be unapplied in prod |
| Gamification / streaks | Engagement streak counter spec’d; `engagement-tracking.ts` exists but dashboard badges not shipped |
| Notifications | Quarterly/annual due reminders — in-app only; no email/push |
| MemPalace sync | Table + API exist; external MemPalace service not connected |
| Voice input | Whisper pipeline spec’d; not built |
| V1 API retirement | Legacy `/api/classify`, `/api/documents/parse`, `/api/mak/message` still present |
| Live job marketplace | `jobs` table seeded; no external job board ingestion |

---

## Related documentation

| Doc | Purpose |
|-----|---------|
| `docs/page-ownership.md` | MECE page ownership spec |
| `docs/MIGRATION_V1_TO_V2.md` | V1 → V2 migration guide |
| `docs/SUPABASE_SETUP.md` | Supabase setup + migrate instructions |
| `docs/spec-v2/FISCMAK_QUICK_REFERENCE.md` | Product spec quick reference |
| `docs/spec-v2/FISCMAK_API_Contract.md` | REST API contract |
| `src/lib/v2/career-data-schema.ts` | Career Data TypeScript types |

---

## Verify live database

```bash
npm run db:verify
```

Checks: `app_users`, `career_assessments`, `documents`, `chat_messages`, `activity_entries`, `physicians`, `publications`, `api_enrichment_runs`, `reconciliation_items`, `mempalace_exports`.

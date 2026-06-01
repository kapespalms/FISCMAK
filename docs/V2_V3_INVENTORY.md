# FISCMAK — V2 / V3 Table & Module Inventory

**Date:** 2026-06-01 · **Branch:** v3-build · **Status:** Reference only — no code changes.
**Purpose:** Authoritative boundary map for agents and the founder. Use this to decide
which table/module to wire before writing any v3 feature.

---

## SECTION 1 — V3 TABLES (canonical new layer)

All 11 tables defined in migrations 20260538–20260550. None applied to the database yet
(founder-gated). Master Review Part XXIV is the schema source of truth for all of them.

| Table | Stores | Defined by |
|---|---|---|
| `evidence_unit` | Confirmed, lattice-ready evidence rows (domain × track × quadrant OV/OI/SV/SI, energy score, sentiment, time class). The single source of truth for F1 Evidence Density. | Part XXIV · Part IX (F1) |
| `lattice_cell` | One row per (user, domain, track) intersection — computed FTE discrepancy flag and F7 Transfer Potential score. Drives the 8×8 heat map. | Part XXIV · Part IV · Part XVII |
| `energy_rankings` | Physician's 1–5 Likert energy rating per domain (independent, not ordinal). One row per (user, domain). | Part XXIV · Part VIII |
| `goal_records` | Attending career goals across 4 horizons: 3mo SMART, 1yr SMART+II, 5yr WOOP, 10yr legacy. Separate from GME `ilp_goals`. | Part XXIV · Part X |
| `narrative_evidence` | Coach Mak SI probe responses — physician-only, never institution-facing. distress_flag triggers resource link only. | Part XXIV · Part X |
| `transfer_pathways` | F7 Transfer Potential routing: maps SI/OI evidence toward visible career artifacts. Physician-initiated only. | Part XXIV · Part IX (F7) |
| `fcwi_responses` | Monthly FCWI 9-item responses (0–4 Likert). No composite score stored — items only (Part XIX governance). | Part XXIV · Part VIII · Part XXIII |
| `weekly_pulse` | Weekly single-item EE + DP + QoL + MDT (0–10) + 2 free-text energy prompts + invisible flag. | Part XXIV · Part VIII |
| `riasec_profile` | O*NET Interest Profiler RIASEC scores per physician. Multiple rows allowed to track changes over time. | Part XXIV · Part V |
| `onet_fingerprint` | Personalized O*NET descriptor vector (FLOAT[]) + adjacent SOC weights (JSONB). Powers F6/F8 (Phase 2+). | Part XXIV · Part V |
| `specialty_config` | Per-SOC reference config (admin-loaded): onet_descriptors, acgme_milestones, crosswalk, adjacent_socs, activity_ontology, setting_modifiers. | Part XXIV · Part XII |

---

## SECTION 2 — V2 TABLES / MODULES INTENTIONALLY REUSED BY V3

These are pre-v3 components that v3 still depends on deliberately. **Do not remove or bypass
these unless a ticket explicitly says to migrate away.**

### `auth.users` + `app_users`
**What:** Supabase auth identity (`auth.users`) and the FISCMAK application user record
(`app_users` — name, email, onboarding_status, message_balance, specialty, base_specialty).
**Why v3 still uses it:** Every v3 table's RLS policy is `auth.uid() = user_id`; `app_users`
is the anchor for onboarding state, message credits, and specialty context. There is no v3
replacement — it's shared infrastructure, not a v2 concept.
**What depends on it:** All 11 v3 tables FK to `auth.users(id)`; `ensure-app-user.ts` syncs
auth sign-in to `app_users` for all flows.

### `activity_entries`
**What:** The v2 activity event stream — every user-logged activity, CV-parsed line, and
Mak-captured snippet. Extended with v3 coordinates (`recognition_quadrant`, `energy_score`,
`sentiment`, `transfer_targets`, `time_class`) via migration 20260536.
**Why v3 still uses it:** The CV upload pipeline (Part XXIV "Evidence Vault") routes
parsed CV lines through `activity_entries` first, then confirms them into `evidence_unit`
(`evidence_unit.source_activity_id` FKs back here). This is an explicit deliberate reuse
per the ticket and the pipeline spec — `activity_entries` is the staging layer; `evidence_unit`
is the confirmed layer.
**What depends on it:** `evidence_unit.source_activity_id`, `src/lib/v2/lattice/` NLP pipeline,
`runCvEnrichmentAfterUpload`.

### `user-documents` storage bucket
**What:** Supabase Storage bucket for CV and document uploads (`PDF`/`DOCX`).
**Why v3 still uses it:** The Evidence Vault pipeline (`POST /api/v1/documents/init` →
browser pdf.js → `POST /api/v1/documents/{id}/process`) uses this bucket. There is no v3
replacement bucket — same bucket, v3 just adds the downstream `evidence_unit` creation step.
**What depends on it:** CV upload flow → `activity_entries` staging → `evidence_unit` confirmation.

### `ontology_*` tables (11 tables, migration 20260523)
**What:** `ontology_sources`, `ontology_specialties`, `ontology_subspecialties`,
`ontology_competency_domains`, `ontology_subcompetencies`, `ontology_development_levels`,
`ontology_career_tracks`, `ontology_activity_categories`, `ontology_invisible_work_activities`,
`ontology_activity_mappings`, `ontology_output_templates`.
**Why v3 still uses it:** The v3 NLP pipeline (Part XIII, Layer L2) reads
`ontology_invisible_work_activities` and `ontology_activity_mappings` to route parsed CV
lines to the correct `domain_index` / `track_index` before inserting into `evidence_unit`.
These are read-only reference tables (public SELECT RLS); v3 does not write to them.
**What depends on it:** CV parser classification step; `evidence_unit.domain_index` and
`track_index` assignments; `specialty_config.activity_ontology` will eventually supersede
some of these per specialty — but the base tables remain until that migration is built.

### `signal_*` tables (6 tables, migration 20260523)
**What:** `signal_detection_sources`, `signal_categories`, `signal_indicators`,
`signal_conversational_routes`, `signal_user_context`, `signal_pattern_summaries`.
**Why v3 still uses it:** Signal detection feeds the activity classifier that populates
`activity_entries.detected_signal_keys`. These signals are the upstream input that drives
`energy_score` and `recognition_quadrant` assignment for eventual `evidence_unit` rows.
**What depends on it:** `activity_entries` enrichment → `evidence_unit` staging.

### `programs` / GME tables (migrations 20260525–20260535)
**What:** `programs`, `program_memberships`, `program_invite_tokens`, `evaluation_imports`,
`rotation_evaluations`, `milestone_self_ratings`, `ilp_goals`, `in_training_exams`,
`medhub_sync_runs`, and related GME infrastructure.
**Why v3 still uses it:** The UH Psychiatry GME pilot is the current launch priority. The
entire GME layer (resident onboarding, eval imports, milestone heatmap, pre-CCC) runs on
these v2 tables. AGENTS.md is explicit: "Do not break attending flows while fixing GME."
The GME tables are not superseded — they serve a different population (trainees, PDs) than
the v3 attending tables.
**What depends on it:** `/app/residency`, `/app/kp-admin`, `/app/output` pilot routes;
`fiscmak-gme-domain` subagent.

### `src/lib/supabase/` client layer
**What:** `client.ts`, `server.ts`, `admin.ts`, `env.ts`, `ensure-user.ts`, `middleware.ts`.
**Why v3 still uses it:** Single Supabase client shared by all tables. No v2/v3 split needed
at the auth/connection level — RLS policies on individual tables do the boundary enforcement.
**What depends on it:** Every API route and server component.

### `physicians` (enrichment-artifact store — *not* a profile table)
**What:** NPI, ORCID, demographic fields (gender, race/ethnicity, year of birth, terminal degree,
medical school), name variants for publication matching. 14 columns; PK = `app_users.user_id`.
**Why v3 still uses it:** The API enrichment pipeline (`persistEnrichmentSnapshot` in
`career-data-repo.ts`) writes verified NPI and ORCID here after external API lookups. Only
2 code call sites, both in the enrichment pipeline — v3 profile code never reads this table.
**Scope boundary:** `app_users` is the canonical v3 profile (SOC, FTE, Mak memory — all on
`app_users` per 20260537). `physicians` = enrichment-artifact store only. V3 feature code
must not read `physicians` for profile context.
**What depends on it:** `career-data-repo.ts` enrichment path only.

### Enrichment pipeline tables (`publications`, `grants`, `presentations`, `scholarly_metrics`, `clinical_productivity`, `scope_of_practice`, `compensation`, `api_enrichment_runs`, `reconciliation_items`)
**What:** Structured career history populated by the API enrichment pipeline (PubMed, NIH
Reporter, ORCID, Open Payments, NPPES). `api_enrichment_runs` logs pipeline executions;
`reconciliation_items` holds pending/confirmed/rejected items awaiting physician review.
**Why v3 still uses it:** The enrichment pipeline is still active and feeds confirmed career
data into `reconciliation_items`. Founder decision 2026-06-01: keep these tables live; they
will eventually feed `evidence_unit` via source FK columns added in a later migration.
V3 code must not bypass the physician-confirmation step before writing to `evidence_unit`.
**What depends on it:** `career-data-repo.ts`, `/api/v1/enrichment/run`, `/api/v1/onboarding/reconciliation`.

### `activity_patterns`
**What:** Pre-aggregated user activity patterns (activity_frequency, signal_trend, energy_trend,
competency_growth, track_alignment) over 7/30/90-day rolling windows. Computed from
`activity_entries`.
**Why v3 still uses it:** Founder decision 2026-06-01: keep as live reused infrastructure.
Feeds Mak context window and resident heatmap until the v3 intelligence layer (Phase 5,
F1–F7 formulas) can replace it. V3 code may read but should not write to this table.
**What depends on it:** Mak context assembly; resident heatmap (GME pilot).

### `chat_feedback`
**What:** Thumbs up/down log on individual Mak messages (message_id, user_id, rating, optional note).
**Why v3 still uses it:** Founder decision 2026-06-01: keep. Lightweight quality signal for
Mak response improvement. No v3 replacement needed — it is not superseded by `narrative_evidence`.
**What depends on it:** Mak message rating UI.

---

## SECTION 3 — V2 TABLES / MODULES SUPERSEDED BY V3

These served purposes now covered by v3 tables or the v3 spec. **V3 code should not write
to these; read access for migration/backfill only, and only when a ticket explicitly permits.**

| V2 Table / Module | What it did | V3 replacement |
|---|---|---|
| `lattice_positioning` | Stored computed lattice coordinates, primary/secondary track, alignment score, burnout/growth cell flags | `lattice_cell` (canonical 8×8 grid with FTE discrepancy and Transfer Potential per cell) |
| `career_development_index` (CDI) | Composite 0–100 score with component weights and percentile | v3 formula system F1–F7 (evidence density, discrepancy, perception gap, recognition gap, transfer potential). No composite score in v3 — by design. |
| `benchmarking_snapshots` | Metric snapshots at raw / specialty percentile / setting percentile | `lattice_cell` + `energy_rankings` (ipsative model, no external benchmarking in v3 by design — Part XIX) |
| `career_recommendations` | AI-generated strength / gap / risk / opportunity recommendations | `transfer_pathways` (physician-initiated F7 routing; no AI-generated recommendations in v3 without physician confirmation) |
| `wellbeing_assessments` | PFI, mMBI, burnout classification, fulfillment, work-life satisfaction scores | `fcwi_responses` + `weekly_pulse` (FCWI replaces PFI/MBI per Part VIII — "no PFI/SVS/MBI/UWES") |
| `invisible_work_log` + `invisible_work_questionnaire` | After-hours EHR, prior auth, BITS scores, IWQ composite | `evidence_unit` (OI/SI quadrant rows); `weekly_pulse.invisible_flag`; `narrative_evidence` (SI probe responses) |
| `career_aspirations` | Desired tracks, domains, barriers, energizers, setting-change interest | `goal_records` (structured 4-horizon goals) + `energy_rankings` (domain energy) |
| `invisible_work_quotient` (IWQ) | BITS composite + logged hours component + minority tax flag | Replaced by v3 Recognition Gap (F5, internal only — never shown as a number per Part IX); `evidence_unit` OI/SI quadrant density |
| `professional_identity` | PIF stage, identity clarity, career satisfaction 1–10 | `narrative_evidence` (SI probe responses capture identity themes via Coach Mak) + `goal_records` 10yr legacy horizon |
| `src/lib/v2/lattice/` modules (domain scoring, track alignment, lattice views) | Computed lattice scores from `activity_entries` → `lattice_positioning` | v3 intelligence layer (F1–F7 formulas, Part IX) writing to `lattice_cell` and `evidence_unit` — not yet built (Phase 5) |
| `career_assessments` | Generic conversational assessment records from pre-v3 Mak (structured instrument Q&A) | `narrative_evidence` (SI probe responses) + `goal_records` (structured goals). Founder decision 2026-06-01: superseded. |
| `jobs` / `job_sources` / `user_career_preferences` / `job_matches` / `user_saved_jobs` | Full v2 job-search and career-fit matching engine | **PARKED** — v2 out of scope for v3 core. Wire nothing to it. No v3 equivalent planned. Do not reference from v3 code. |

---

## SECTION 4 — NEEDS FOUNDER DECISION

*All items resolved 2026-06-01. See decisions recorded below in Sections 2 and 3.*

| Item | Resolution | Now in |
|---|---|---|
| `physicians` vs `app_users` profile split | `app_users` is canonical v3 profile (SOC, FTE, Mak memory). `physicians` = enrichment-artifact store (NPI/ORCID), 2 code touches, v3 never reads it. | Section 2 |
| Enrichment tables (`publications`, `grants`, etc.) | Keep live + will feed `evidence_unit` via source FK columns in a later migration. Physician confirmation step required before writing to `evidence_unit`. | Section 2 |
| `career_assessments` | Superseded by `narrative_evidence` + `goal_records`. | Section 3 |
| `activity_patterns` | Keep as reused infra until Phase 5 intelligence layer replaces it. | Section 2 |
| `jobs` layer | PARKED — v2 out of scope for v3 core. Wire nothing to it. | Section 3 |
| `chat_feedback` | Keep — lightweight Mak quality signal, not superseded. | Section 2 |

---

## Quick-reference: "which table do I use?"

| I need to store… | Use this |
|---|---|
| A confirmed piece of physician evidence (CV line, Mak response) | `evidence_unit` |
| A raw, unconfirmed activity captured from Mak chat or CV staging | `activity_entries` (v2, deliberate reuse) |
| Domain energy rating | `energy_rankings` |
| A career goal | `goal_records` (attending) or `ilp_goals` (GME trainee) |
| A Mak SI probe response | `narrative_evidence` |
| A monthly well-being check | `fcwi_responses` |
| A weekly burnout pulse | `weekly_pulse` |
| Lattice cell scores (FTE flag, transfer potential) | `lattice_cell` |
| A transfer/bridge plan for invisible work | `transfer_pathways` |
| RIASEC interest scores | `riasec_profile` |
| O*NET fit vector | `onet_fingerprint` |
| Specialty reference data | `specialty_config` |
| User identity / auth | `auth.users` + `app_users` |
| GME program / resident data | `programs`, `program_memberships`, `evaluation_imports`, etc. |

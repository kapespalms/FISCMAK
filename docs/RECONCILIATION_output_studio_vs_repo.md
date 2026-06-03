# Output Studio vs Repo — Reconciliation Map
*Audit date: 2026-06-02 | Branch: v3-build | Read-only pass*

---

## Interpretation

This audit maps the design artifacts in `docs/output-studio/` against what is actually built in the codebase. The Output Studio is the most document-rich design area in the repo and also the one with the most active construction — two parallel editor surfaces (v2 Lexical, v3 TipTap) exist simultaneously, Wave 1 of the v3 bank is newly wired, and the CWRU institution overlay and the Psychiatry Dictionary are spec-complete but not yet wired to any UI. The risk is building more on top of a foundation that hasn't been reconciled; this document creates that map.

---

## 1. Existing App Surfaces

| Route | What it does | Primary data source | Status |
|---|---|---|---|
| `/app/residency` | Redirects to `/app/uh-psych` | — | REDIRECT ONLY |
| `/app/uh-psych` | UH Psych Hub: rotation grid, enrichment tracks, semi-annual review, content gaps, schedule banner | `uh-residency-content.ts` (static content), `programs` table, `block_schedule` | BUILT — UH-specific content layer only |
| `/app/uh-psych/electives` | Redirects to `/app/residency/electives` | — | REDIRECT ONLY |
| `/app/residency/[slug]` | Rotation detail page with curriculum, related readings, MedHub section, elective catalog | `uh-residency-content.ts` (static), `rotation-curriculum.ts`, `elective-catalog.ts` | BUILT — static content, UH-specific |
| `/app/residency/call-schedule` | Call schedule view | `call-schedule.ts` | BUILT |
| `/app/rotations` | Redirects to `/app/uh-psych` | — | REDIRECT ONLY |
| `/app/assessment` | Insights from Mak conversations: career pattern, touchpoints, strengths | `/api/v1/assessments/insights`, `assessment_insights` | BUILT (attending platform) |
| `/app/education` | Education hub: articles, landmark readings, handouts | `uh-residency-content.ts` (EDUCATION_CATEGORIES, static) | BUILT — UH-specific static content |
| `/app/lattice` | Redirects to `/app/objective?tab=lattice` | — | REDIRECT ONLY |
| `/app/objective` | Tabs: Lattice, Vault, Reconcile, Activities, Documents | `evidence_unit`, `lattice_cell`, `activity_entries`, `documents` | BUILT — all tabs wired; FTE border + transfer stars deferred |
| `/app/wellbeing` | Weekly pulse, monthly FCWI, quarterly snapshot, origami plot | `fcwi_responses`, `weekly_pulse`, `/api/v1/wellbeing/*` | BUILT — all instruments live, origami plot complete (Phase 5.6 done) |
| `/app/mak` | Redirects to `/app/dashboard` | — | REDIRECT ONLY |
| `/app/goals` | Redirects to `/app/plan` | — | REDIRECT ONLY |
| `/app/studio` | Redirects to `/app/output` | — | REDIRECT ONLY |
| `/app/output` | Output Studio: view switcher (v3 "CV Studio" / v2 "Document Library") | `cv_item_metadata`, `evidence_unit`, `output_documents`; v2 path also calls `/api/v1/output/generate`, `activity_entries` | PARTIALLY BUILT — see Section 5 |

**Notes on `/app/output`:**
- The page has two modes behind a toggle: "CV Studio" (v3, TipTap, OutputStudioV3) and "Document Library" (v2, Lexical, wizards, original templates).
- V3 CV Studio is the default and is the focus of Wave 1.
- V2 Document Library remains live and contains the full wizard set (PromotionNarrativeWizard, CareerNarrativeWizard, AcademicCoreDocumentWizard, CoverLetterWizard, IndustryCareerWizard) plus the Lexical editor with Evidence Drawer.
- GME trainee cards (TraineePreCccCard, TraineeRotationLogCard, TraineeMilestoneHeatmapCard, TraineeMilestoneCard) appear in the v2 Document Library view.

---

## 2. Component Inventory

| Directory | Key components | Status |
|---|---|---|
| `src/components/gme/` | CohortHeatmapPanel, MilestoneSelfRatingPanel, PreCccSummaryPanel, RotationLogPanel, TraineeMilestoneCard, TraineeMilestoneHeatmapCard, TraineePreCccCard, TraineeRotationLogCard | BUILT — all wired to `/api/v1/trainee/milestones/*`, `/api/v1/ilp*`; gated by profile_contract persona check |
| `src/components/uh-psych/` | BlockScheduleLegend, CallScheduleView, CatalogMatchSection, CollapsibleSection, ContentGapsSection, ElectiveCatalogSection, EnrichmentTracksSection, HubSearch, InstitutionalStaffDirectory, MakHelpChip, MedHubCurriculumPathSection, RelatedReadingSection, RotationCurriculumSection, SemiAnnualReviewSection, UhProgramGate, UhProgramServerGate, UhProgramUnauthorized | BUILT — UH program layer only; gated by UhProgramGate |
| `src/components/lattice/` | DualLatticeGrid, LatticeCellDetailCard, LatticeGrid, LatticeHeatmapV3, QuadrantSummaryV3 | BUILT — 8×8 heatmap and 2×2 quadrant; FTE border and transfer stars DEFERRED |
| `src/components/wellbeing/` | FcwiForm, QuarterlySnapshotForm, WeeklyPulseForm, WellbeingOrigamiPlot, WellbeingWorkspace | BUILT and complete per Phase 5.6 spec |
| `src/components/studio/` | EvidenceChipNode, EvidenceDrawer, StudioLexicalEditor, VersionHistoryPanel | BUILT — v2 Lexical editor path; used by Document Library mode only |
| `src/components/output-studio/` | OutputStudioV3, StudioDocumentList, StudioSectionBlock, StudioTipTapEditor, StudioToolbar | PARTIALLY BUILT — Wave 1 (assembly only); see deferred list below |
| `src/components/workspace/OutputStudioWorkspace.tsx` | Shell that mounts both v2 and v3 views | BUILT — orchestration layer; thin |

**`src/components/output-studio/` — what is built vs. deferred:**

BUILT in Wave 1:
- Document list with status chips (draft / ready / exported / archived)
- "Generate Full CV" and "Generate Monthly Bullets" actions → POST to `/api/v1/output/studio/generate`
- TipTap section editor with collapse/expand, enable/disable toggle, provenance count
- Toolbar: bold, italic, underline, H1–H3, bullet/numbered list, undo/redo, clear formatting

ABSENT from Wave 1 (documented as deferred inside the component):
- "Edit with Mak" — LLM revision per block
- Export to .docx / PDF from the v3 editor (export exists in v2 Lexical path only)
- Representative publication asterisk UI
- APT annotation fields (apt_role, apt_scholarship, apt_impact) — schema columns exist, UI absent
- Bank insert / "Insert from bank" inside the editor
- "Regenerate section from bank" (snapshot refresh)
- Reach grouping subheadings in rendered section content
- Compliance helpers (length meter per template, date formatter, spell-out check, section presence check)
- Link, superscript/subscript, table extensions — not in current TipTap extension list
- Institution route selector (Wave 2)
- Track-changes / comments (explicitly deferred to TipTap Pro or later)

---

## 3. ACGME Grounding — Where It Stands

### (a) Institution/Program Layer — UH-specific

This layer is BUILT and well-grounded. It is UH CMC psychiatry content and lives entirely in:

- `src/lib/v2/programs/uh-residency-content.ts` — static rotation pages, PGY-level content, education categories, search index
- `src/lib/v2/programs/uh-psych-hub-sections.ts` — PGY1/2 and PGY3/4 hub section definitions
- `src/lib/v2/programs/rotation-catalog.ts`, `rotation-curriculum.ts`, `elective-catalog.ts` — UH rotation structure
- `src/lib/v2/programs/call-schedule.ts`, `block-schedule.ts` — UH schedule data
- `src/lib/v2/programs/institutional-staff-directory.ts` — UH staff

This layer reflects UH program structure, not ACGME national requirements. It includes rotation names, block schedule, call structure, elective catalog, and curriculum links. It does NOT contain ACGME milestone text.

### (b) ACGME National Standard Layer — Milestones, Competencies, Subspecialty Registry

This layer is PARTIAL — seeded for psychiatry, schema-wired, but the population gap for most specialties is clear.

**What exists:**

- `docs/seeds/acgme/` — 6 seed JSON files: `appendix_b_2024_2025.json` (specialty/subspecialty registry), `universal_core_competencies.json`, `milestone_frameworks.json`, `milestone_catalog.json`, `all_program_milestones.json`, `psychiatry_milestones_v2.json`. Additionally, 229 specialty-specific milestone JSON files in `docs/seeds/acgme/programs/` (e.g., `psychiatry_milestones_v2.json`, `anesthesiology_milestones_v2.json`, etc.).
- `src/lib/v2/gme/acgme-specialty-registry.ts` — runtime registry: resolves specialty → primary, subspecialty → sponsor primary, fetches subcompetencies for a given specialty slug. Types are fully defined.
- `src/lib/v2/gme/trainee-evaluation-framework.ts` — resolves `TraineeEvaluationFramework` for a trainee: given career_stage + base_specialty + subspecialty → returns universal competencies + specialty-specific subcompetencies + milestone framework metadata. This is the wire between user profile and ACGME milestone data.
- `src/lib/v2/gme/medhub-milestone-map.ts` — maps MedHub CSV column keys to psychiatry subcompetency IDs via `psychiatry_milestones_v2.json.medhub_form_crosswalk`.
- `docs/migrations/20260531_gme_milestone_ilp.sql` — `milestone_self_ratings` table (user_id, subcompetency_id, self_level 1–5, narrative_reflection) and `ilp_goals` table.
- `docs/migrations/20260530_gme_evaluation_imports.sql` — `evaluation_imports` + `rotation_evaluations` tables.
- API routes wired: `/api/v1/trainee/milestones/definitions` (returns subcompetencies for authed trainee), `/api/v1/trainee/milestones/heatmap`, `/api/v1/trainee/milestones/discrepancy`, `/api/v1/trainee/milestones/longitudinal`, `/api/v1/trainee/milestones/self-ratings`, `/api/v1/trainee/ilp/*`, `/api/v1/programs/[programId]/cohort-heatmap`.
- UI components in `src/components/gme/`: MilestoneSelfRatingPanel, TraineeMilestoneCard, CohortHeatmapPanel, PreCccSummaryPanel — all wired to above APIs and gated by trainee persona check.

**What is ABSENT or STUB:**

- Milestone data for specialties other than psychiatry is seeded as JSON but the MedHub column-crosswalk (`medhub_form_crosswalk`) only exists in `psychiatry_milestones_v2.json`. Other specialties' JSON files have milestone definitions but no MedHub mapping, meaning `medhubColumnToSubcompetencyId` only works for psychiatry.
- The migration `20260531_gme_milestone_ilp.sql` is written but FOUNDER-GATED (not applied). The ACGME milestone tables therefore do not exist in the live database yet.
- MedHub API sync (`/api/v1/programs/[programId]/imports/medhub/sync`) exists as a route directory but BUILD_ORDER Phase 8.1 is unchecked — MedHub import is not complete.
- The `milestone_status` field in the framework registry distinguishes `"seeded"` (full subcompetency data), `"catalog_only"` (metadata only, no subcompetency detail), and `"universal_only"` (no specialty milestones). For most specialties only catalog-level metadata exists; the 229 JSON files in `programs/` carry milestone text but the registry lookup for non-psychiatry specialties may return `catalog_only` status.
- BUILD_ORDER Phase 8.2 (Trainee milestone heatmap + graduation handoff) is unchecked.
- BUILD_ORDER Phase 8.3 (Aggregate dashboard) is unchecked.
- BUILD_ORDER Phase 8.4 (Governance: consent flow, IRB determination) is unchecked.

**Summary verdict:** ACGME national standard data is seeded and partially wired for psychiatry. For the pilot (UH psychiatry), the data path is functional pending migration application. For other specialties, milestone subcompetency detail is absent from the active code paths (crosswalk is psychiatry-only). The GME schema has not been applied to the database yet.

---

## 4. Design Artifacts in `docs/output-studio/`

| File | Describes | Tag | Notes |
|---|---|---|---|
| `FISCMAK_OutputStudio_System_Index.md` | System index tying all output-studio artifacts together: spine ("one bank, many outputs"), file map, data flow diagram, engine stack, pilot scope vs. deferred, open threads | CONNECTS | Data flow diagram matches what Wave 1 implements; engine stack (TipTap + Supabase) is live. Open threads (affiliate routes, other specialty dictionaries) are genuinely open. |
| `FISCMAK_Output_Studio_Editor_Spec.md` | TipTap editor engine decision + full toolbar and tool inventory: Format, Structure/Sections, Bank & Evidence, Mak, Compliance, Output | CONNECTS (partial) | Format toolbar (bold/italic/underline/headings/lists/undo-redo) built. Section block (toggle on/off, collapse) built. Bank insert, Mak revision, compliance helpers, export, superscript/subscript, table, representative asterisk, APT annotation, reach grouping — all ABSENT. |
| `FISCMAK_Origami_Plot_5.6_Spec.md` | 7-axis well-being origami plot spec: axes, governance rules, physician-facing vs. internal data, build checklist | CONNECTS | Fully implemented in `WellbeingOrigamiPlot.tsx` per spec (7 independent axes, no composite, plain-language labels, MDT resource link, trend sparklines, no instrument acronyms). This spec is complete and the build matches it. |
| `FISCMAK_Institutional_Value_DayOne.md` | B2B story: 5 day-one institution benefits from physician self-report; role-energy fit / leadership pipeline signal; ethical aggregation rules (7 rules); what is NOT day-one | MISSING | No institution-facing aggregate dashboard, no de-identified roll-up pipeline, no k≥5 suppression logic, no threshold-triggered pattern alerts. This is BUILD_ORDER Phase 8.3 (unchecked). The data tagged to domains flows through evidence_unit but is not yet aggregated for institution view. |
| `FISCMAK_Output_Studio_Templates.xlsx` | General CV, industry resume, and cover letter templates: toggleable sections mapped to Psychiatry Dictionary CV Item IDs | CONNECTS (partial) | CV section definitions (CV-DEG, CV-PUB-ORIG, etc.) are implemented in `output-studio-bank.ts` (32 CV Item Types) and `output-studio-generate.ts` (CV_SECTIONS). The toggleable section model is built (enabled/disabled per section). What is NOT built: reach subheadings rendered in content, representative publication asterisk, APT annotation in UI, and no "industry resume" or "cover letter" template paths in v3 CV Studio (those exist in v2 wizard path only). |
| `FISCMAK_Dossier_Blueprint_ClinEd.xlsx` | Clinician-educator dossier: capture → CV-section → dossier-component map; what Mak drafts vs. assembles; impact-prompt bank (role/scholarship/impact) | MISSING | The `output_documents` table includes `educator_portfolio` and `promotion_dossier` as valid document_type values. The APT annotation columns (apt_role, apt_scholarship, apt_impact) exist in cv_item_metadata schema. But: the dossier assembly logic for clinician-educator (section-by-section, Mak drafts teaching philosophy, impact-prompt bank) is ABSENT. The v2 AcademicCoreDocumentWizard touches "teaching_portfolio" type but is in the Lexical path and does not use the v3 bank. |
| `FISCMAK_Promotion_Reference_CWRU.xlsx` | CWRU institution overlay: tracks & standards, evidence-of-excellence rubric, P&T pipeline, required documents, CV structure + formatting, candidate guidance, CAPT tips, dossier templates | MISSING | `institution_route_id` is a null column on `output_documents` (Wave 1). No `institution_routes`, `institution_profiles`, or `institution_memberships` tables exist yet (Wave 2 migration). The CWRU overlay — reach grouping enforcement, representative publication (exactly 3), APT annotation requirement, date formatter rule, footer format — is spec'd in the schema comments but not active in any UI or generation path. |
| `FISCMAK_Route_Standard.xlsx` | Base institution route every institution inherits: routing model, institution registry, profile slots, intake checklist, generic tracks + evidence rubric | MISSING | Same situation as CWRU overlay. Institution routing infrastructure (Wave 2) is absent. Standard route = null institution_route_id in Wave 1; no route-specific logic fires. |
| `FISCMAK_Psychiatry_Dictionary.xlsx` | Controlled vocabulary: clinical capture settings/encounters/diagnoses/procedures + 32 CV Item Type IDs | CONNECTS (partial) | The 32 CV Item Type IDs are implemented verbatim in `output-studio-bank.ts` and enforced in the `cv_item_metadata` schema CHECK constraint. The clinical capture vocabulary (settings, encounters, diagnoses, procedures) is NOT wired — no lookup, no typeahead, no LLM → dictionary term mapping. This mapping is described in the system index as "the LLM maps language → these terms" but that pipeline is not built. |
| `FISCMAK_Credential_Requirements.xlsx` | (Binary — not readable) | UNKNOWN | Cannot audit. Based on context it likely contains credential/licensure requirements by specialty or institution. No file references found in src/. Treat as MISSING from code. |

---

## 5. CONNECTS / DUPLICATES / MISSING Summary

### What CONNECTS (spec has a built counterpart)

| Finding | Status |
|---|---|
| 32 CV Item Types from Psychiatry Dictionary | Implemented in bank and schema |
| TipTap editor with section blocks, toggle, collapse | Built in `output-studio/` |
| Basic toolbar (bold/italic/underline, headings, lists, undo-redo) | Built in StudioToolbar |
| Document list with status, section count, last-edited date | Built in StudioDocumentList |
| Full CV assembly and Monthly Bullets mode | Built in generate API + generate lib |
| Evidence snapshot IDs frozen at generation (no-invention rule) | Implemented in output_documents.evidence_snapshot_ids |
| Origami plot 7-axis spec with all governance rules | Fully implemented; spec and code agree |
| ACGME specialty registry (Appendix B) + psychiatry milestones | Seeded and wired for psychiatry; pending migration application |
| Trainee milestone self-rating + ILP + cohort heatmap | Built; gated by persona; pending migration application |
| MedHub CSV import crosswalk (psychiatry) | Built for psychiatry only |
| UH program/rotation/schedule/education layer | Fully built as static content |

### What is DUPLICATED (two implementations doing same thing)

| Finding | Risk |
|---|---|
| Two parallel editors at `/app/output`: v3 TipTap (OutputStudioV3) and v2 Lexical (StudioLexicalEditor) | User sees a toggle ("CV Studio" / "Document Library"). Long-term these need to merge or the v2 path needs an explicit sunset date. No debt tracker for this. |
| Export (.docx / PDF) exists in v2 Lexical path (`studio-export.ts`) but is ABSENT in v3 TipTap path | Users can export from Document Library but not from CV Studio. The spec says export is in the v3 tool; the code puts it only in v2. |
| Template/wizard system (OUTPUT_TEMPLATES in constants.ts + wizard components) vs. output_documents system (Wave 1 bank assembly) | Two generation paths: wizard/Lexical for promotion narratives, biosketch, etc.; TipTap assembly for CV and monthly bullets. Templates in OUTPUT_TEMPLATES (17 items) are not the same as document_type enum in output_documents. |

### What is MISSING (spec artifact with no code counterpart)

| Missing item | Spec source | Priority per BUILD_ORDER |
|---|---|---|
| Institution routing layer (institution_routes, institution_profiles, Wave 2 tables) | Route_Standard.xlsx, Promotion_Reference_CWRU.xlsx | Not in BUILD_ORDER phases (Wave 2) |
| CWRU overlay logic (reach grouping in rendered output, exactly-3 representative publications, APT annotation UI, date formatter, footer format) | Promotion_Reference_CWRU.xlsx, Editor_Spec.md | Not in BUILD_ORDER phases |
| APT annotation UI (apt_role, apt_scholarship, apt_impact fields on cv_item_metadata) | Dossier_Blueprint_ClinEd.xlsx | In StudioTipTapEditor as "Deferred" |
| Representative publication asterisk UI (is_representative) | Editor_Spec.md, Dossier_Blueprint | In StudioTipTapEditor as "Deferred" |
| "Insert from bank" in TipTap editor | Editor_Spec.md §3 | In OutputStudioV3 as "Deferred" |
| "Regenerate section from bank" (snapshot refresh) | Editor_Spec.md §3 | Not documented as deferred but absent |
| "Edit with Mak" LLM revision per block | Editor_Spec.md §4 | In OutputStudioV3 and StudioTipTapEditor as "Deferred" |
| Compliance helpers (length meter, date formatter, spell-out check, section presence vs. template) | Editor_Spec.md §5 | Not in BUILD_ORDER; absent |
| LLM → Psychiatry Dictionary term mapping (clinical capture vocabulary) | System_Index.md, Psychiatry_Dictionary | Not in BUILD_ORDER phases |
| De-identified institution aggregate dashboard | Institutional_Value_DayOne.md | BUILD_ORDER Phase 8.3 (unchecked) |
| Ethical aggregation rules enforced in code (k≥5 suppression, no drill-to-one, ranges not precision) | Institutional_Value_DayOne.md | BUILD_ORDER Phase 8.3 (unchecked) |
| Coach Mak goal architecture and conversational engine | BUILD_ORDER Phase 6 | BUILD_ORDER Phases 6.1–6.4 (all unchecked) |
| GME aggregate output + governance | BUILD_ORDER Phase 8 | BUILD_ORDER Phases 8.1–8.4 (all unchecked) |
| FISCMAK_Credential_Requirements.xlsx content | Credential_Requirements.xlsx | UNKNOWN — no src references |

---

## 6. Recommended Next Steps

These are ordered by dependency and pilot risk. No implementation — decisions and reconciliation only.

**1. Resolve the two-editor situation before building more on top of it.**
The v2 Lexical path (Document Library + wizards) and v3 TipTap path (CV Studio) both live at `/app/output`. They use different evidence sources (v2 draws from `activity_entries` via `fetchActivities()`; v3 draws from `cv_item_metadata` + `evidence_unit`). Before adding any new generation logic, the founder needs to decide: is v2 Lexical being sunset, maintained in parallel, or merged? That answer gates whether build time should go into v2 wizards or exclusively into v3 TipTap.

**2. Apply the Output Studio Wave 1 migration before continuing v3 build.**
Migration `20260555_output_studio_wave1.sql` creates `cv_item_metadata` and `output_documents`. The v3 CV Studio (StudioDocumentList → generate → StudioTipTapEditor) requires both tables. Until this migration runs, the v3 "CV Studio" is non-functional in production. This is founder-gated.

**3. Define the Wave 2 scope before adding institution-facing features.**
The CWRU promotion overlay, the route-standard inheritance, and `institution_routes` / `institution_profiles` / `institution_memberships` tables are all Wave 2. Nothing in Wave 1 code reads a route. But the spec (Promotion_Reference_CWRU.xlsx, Route_Standard.xlsx) is fully designed. Before any builder tries to implement CWRU-specific logic, the Wave 2 migration must be written and approved. Do not let individual features (reach grouping, APT annotations, representative asterisk) be added ad-hoc without the route infrastructure underneath them.

**4. Clarify FISCMAK_Credential_Requirements.xlsx.**
No code references this file. It needs to be read by the founder and classified: is it content for a future credential-tracking feature, data for the institution route, or superseded by something already in the schema? If it defines something buildable, it should be added to BUILD_ORDER.

**5. Confirm the clinician-educator dossier path before building.**
The `FISCMAK_Dossier_Blueprint_ClinEd.xlsx` is the most detailed output specification. It maps capture → CV section → dossier component → Mak role (assemble vs. draft). The code has the `educator_portfolio` document_type slot and the APT schema columns, but the assembly logic (which bank items go where, what Mak drafts vs. assembles, impact-prompt bank) is absent. This cannot be built correctly from the migration alone — the Blueprint needs to be translated into explicit assembly rules, then a BUILD_ORDER ticket written.

**6. Establish the cv_item_metadata population path.**
The bank (`cv_item_metadata`) is the data source for v3 document generation. But no user-facing flow currently writes structured `cv_item_metadata` rows. The clinical capture vocabulary (Psychiatry Dictionary settings/encounters/diagnoses/procedures) is not wired — no LLM mapping, no typeahead, no "log a CV item" flow distinct from logging an activity. This is the most critical plumbing gap: the v3 generate API returns empty sections if cv_item_metadata has no rows. The founder needs to decide whether CV upload (existing document-pdf pipeline) should auto-populate cv_item_metadata, or whether there is a separate capture step.

**7. Keep the origami plot spec closed.**
The `FISCMAK_Origami_Plot_5.6_Spec.md` is complete and the implementation matches it. Do not revisit unless governance rules change. Mark it done.

**8. Do not start Phase 8 (institutional layer) until Phase 6 (Mak) is scoped.**
The institutional aggregate dashboard (Phase 8.3) shows aggregated signals from physician capture. But Phase 6 (Coach Mak conversational engine, goal architecture, adaptive SI probes) is also unchecked and is the primary source of the signal data the institution dashboard would aggregate. Building the institution-facing layer without the underlying capture producing meaningful data is premature.

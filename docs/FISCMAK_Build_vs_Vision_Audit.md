# FISCMAK — Build vs. Vision Audit

**Date:** 2026-06-02 · **Branch:** v3-build · **Owner:** Kristen Palmer, MD
**Status:** Findings only — read-only audit, no code changed. Flags for founder decision (per charter: flag, don't auto-fix).
**Method:** Three parallel code surveys across all surfaces, mapped against `V2_V3_INVENTORY.md` (the v2/v3 boundary), the locked decisions, and the §C2 well-being-separation rule.

---

## The one-line finding

The v3 spine is built correctly and is *usually the default* — but the **old v2 systems were demoted, not removed.** Both versions coexist in the live app via toggles, stacked renders, parallel document builders, and **superseded tables that are still being written to.** That's the "chunks from old versions" problem, confirmed.

---

## What is CLEAN (v3-aligned — leave alone)

These are correctly on the canonical v3 layer:

- **CV upload pipeline** — `documents/init → process → confirm-lines`: stages to `activity_entries`, confirms into `evidence_unit` + `evidence_cell_weights`. Textbook v3. ✅
- **Output Studio v3 ("CV Studio")** — the default view; reads the `evidence_unit` bank. The "one bank → many docs" vision *exists and is default*. ✅
- **Well-being** (`/app/wellbeing`, origami) — touches only `fcwi_responses`, `weekly_pulse`, `energy_rankings`, `goal_records`. No merge with the lattice. **§C2-compliant.** ✅
- **Goals** (`goal_records`), **Intelligence summary** (F3/F4/F5 on `evidence_unit`), **v3 heatmap path** (`/lattice/heatmap`, `/density`). ✅
- **`energy_rankings`** — correctly shared across onboarding, heatmap hue, quarterly snapshot, and the F-formulas. ✅
- **GME pilot layer** — `/app/uh-psych`, `/schedule`, programs/trainee/ilp routes use exactly the Section-2 reused tables; old `/residency`,`/rotations`,`/calendar` are tidy redirect shims. **Legitimate reuse — do not touch.** ✅

---

## CRITICAL — vision-contradicting, user-facing or data-integrity

### C1. Two lattices render on the same screen
`LatticeView` (the live `/app/objective?tab=lattice`) renders **both** `LatticeHeatmapV3` (v3: confirmed `evidence_unit` + `evidence_cell_weights`) **and** `DualLatticeGrid` (v2: `activity_entries` + the superseded `career_assessments`) stacked together. A physician sees **two 8×8 grids of the same thing that can disagree**, because one counts confirmed v3 evidence and the other counts raw v2 activity. The lower one reads a retired table.
**Action (founder decision):** retire `DualLatticeGrid` + `/api/v1/lattice/route.ts`, or scope it explicitly (e.g. GME-only). One bank → one lattice.

### C2. The superseded `career_assessments` table is still actively WRITTEN by 3 live paths
Per inventory §3 it's replaced by `narrative_evidence` + `goal_records`. But it's still written/read by: (a) the whole `/app/assessment` + `/v1/assessments/*` chain (`start` inserts, `answer`/`complete` mutate), (b) **Coach Mak** (`conversational-assessment-service`), and (c) the v2 lattice path. New evidence is accruing in a dead-end table.
**Action:** stop new writes; route conversational/assessment capture to `narrative_evidence` + `goal_records`. Decide migration/backfill of existing rows.

### C3. Output Studio is fragmented into 7 parallel document silos
The v3 bank exists and is default — but **seven doc-family builders each persist to a separate `app_users.onboarding_metadata` JSON key**, *not* the evidence bank: `academic_core_documents`, `academic_dossier`, `career_narrative`, `career_portfolio`, `cover_letter`, `industry_career_documents`, `promotion_context`. Each has its own template library under `src/lib/v2/`. Edits don't write back to `evidence_unit`. Plus a v2 "Document Library" view is **one toggle click away** in production. This is the exact opposite of "one capture, stored once, rendered into any document."
**Action:** decide the consolidation path — migrate the doc builders onto the `evidence_unit` bank, and remove or hard-gate the v2 "Document Library" toggle.

### C4. Coach Mak's capture pipeline is essentially unbuilt at the v3 layer
Mak chat works and classifies messages — but only into `activity_entries` (v2 staging) and the superseded `career_assessments`. It **never** writes `evidence_unit`, **never** writes `narrative_evidence** (that table has *zero* application code — migration only), and never touches energy/pulse. So **nothing Mak captures ever reaches the lattice** (only CV uploads get promoted to `evidence_unit`). The "Mak = daily capture router" vision is ~0% built at the evidence layer.
**Action:** this is the big build gap, not just a cleanup — it's the capture architecture we discussed (pulse/Mak → classify → energy-tagged invisible cell → confirm → lattice). Spec it, then build.

---

## HIGH — superseded models running / out-of-scope still shipped

### H1. Quarterly/annual touchpoints run the *superseded* CDI + PFI model
`touchpoint-submit.ts` computes a composite `cdi.score` and **PFI-based burnout** — both explicitly killed in v3 ("no composite score by design"; "FCWI replaces PFI/MBI"). Stored in `onboarding_metadata`. So the old scoring engine runs in parallel with the v3 FCWI/pulse capture.
**Action:** retire the CDI/PFI computation; route touchpoint well-being through `fcwi_responses`/`weekly_pulse`.

### H2. PARKED jobs subsystem is fully shipped and clickable
Inventory §3 says "PARKED — wire nothing to it." Reality: `/app/jobs` → `/app/plan?tab=jobs` → `JobsWorkspace` → 6 live `/api/v1/jobs/*` routes writing `user_job_matches`. A visible nav tab.
**Action:** remove or feature-flag off for the pilot.

### H3. Deferred-scope "industry-career" is fully built and wired
CLAUDE.md lists industry-pivot docs as deferred — yet there's a complete API family, template lib, and mounted wizard. Scope creep already shipped.
**Action:** confirm whether to keep (it's harmless if gated) or hide for pilot.

---

## MEDIUM — hygiene, orphans, split-brain

- **M1. Profile writes to legacy v1 `profiles`, not canonical `app_users`** — a direct browser-client `upsert` to an auth-adjacent table, bypassing the v3 profile. Split-brain profile data. *Touches user data — flag, do not auto-fix.*
- **M2. Dead Mak code** — `components/mak/MakChat.tsx` (imported by nobody) points at the deprecated, capture-less `/api/mak/message`. The real dock is `components/layout/MakPanel.tsx`. Risk: misleads a future builder. *Remove.*
- **M3. Document-builder panels mounted on the Profile (Account) page** (`CareerPortfolioPanel`, `AcademicDossierPanel`) — violates page-ownership (docs belong to Output). Two of the seven doc families are only reachable from Account.
- **M4. `/app/documents` renders a full workspace instead of redirecting** to the Objective Documents tab as page-ownership specifies. Duplicate surface.
- **M5. Possible orphan endpoint** — `/api/v1/lattice/quadrant-summary` (v3-correct) has no UI consumer found. Verify it's wired (it's BUILD_ORDER 4.4) or it's dead.

---

## INVENTORY GAP — the boundary map itself is incomplete

These tables are referenced by **live code** but appear in **neither** Section 1 (v3 canonical) nor Section 3 (superseded) of `V2_V3_INVENTORY.md`:
`output_documents`, `cv_item_metadata`, `promotion_dossier`, `narrative_progress`, `mempalace_exports`, `user_job_matches`, `profiles` (v1).
**Action:** classify each before more building — you can't say which document-storage layer is canonical until these are placed. (Note: the document fragmentation in C3 is *why* there are so many uncatalogued storage tables.)

---

## Recommended order of remediation

1. **C2 + C1** first — stop writing the superseded `career_assessments`, and resolve the double-lattice. These are data-integrity + user-facing confusion, and they're contained.
2. **C4** — the Mak capture pipeline. This is the biggest *vision* gap and overlaps the energy/invisible-work capture you're already designing. Spec it before building.
3. **C3** — Output Studio consolidation. Larger; decide the one-bank migration path.
4. **H1–H3** — retire CDI/PFI, gate jobs + industry-career for pilot.
5. **M + inventory gap** — hygiene pass + update `V2_V3_INVENTORY` with the uncatalogued tables.

---

## What this audit did NOT cover (honest scope)

- **Runtime behavior across personas** — this is a *static* alignment audit (what's wired to what). It does not verify each surface renders correctly for a zero-entry student vs. a full-history attending. That's a separate runtime pass (Claude Code + the app running).
- **Today's not-yet-written decisions** — Mak-as-capture-router, the layered energy model (domain + skill + evidence), hours-on-the-visible-side. These aren't specced yet, so they're flagged as "to build/spec," not "misaligned." Worth capturing into a spec so the *next* audit has a baseline.

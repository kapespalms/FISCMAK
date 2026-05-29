# FISCMAK system map (internal)

**Audience:** Product, engineering, research collaborators, AI handoff  
**Status:** Planning reference — May 2026  
**Related:** [NORTH_STAR.md](./NORTH_STAR.md), [FISCMAK_RESEARCH_CROSSWALK.md](./FISCMAK_RESEARCH_CROSSWALK.md), [MVP_GME_BACKEND_SPEC.md](./MVP_GME_BACKEND_SPEC.md), [page-ownership.md](./page-ownership.md)

This document describes **what occurs at each point in the system** across **User**, **Coach Mak**, **Lattice**, **Institution**, and **Output Studio**.

---

## Core object (everything flows through this)

Every input becomes an **evidence unit**:

| Field | Meaning |
|-------|---------|
| `what` | Activity, instrument answer, eval line, CV fact, goal, document claim |
| `where` | Lattice cell and/or ACGME subcompetency |
| `source` | `mak` · `cv` · `schedule` · `instrument` · `manual` · `institutional` |
| `status` | **proposed** → **confirmed** / **dismissed** |
| `time_class` | `past` · `current` · **scheduled** |
| `energy` | energizing · draining · neutral (user-tagged or inferred) |
| `when` | Date or reporting period |

**Rules:**

- Lattice and Output consume **confirmed** evidence.
- Mak reads **proposed + confirmed**.
- Institution reads **aggregates + training imports** — not private Mak chat or individual psychometrics.

**Code anchors:** `src/lib/v2/career-data-schema.ts`, `reconciliation_items`, `activity_entries`, `onboarding_metadata.instrument_answers`

---

## Three products, one engine

| Lens | Question it answers |
|------|---------------------|
| **User** | Where am I, where am I going, am I sustainable? |
| **Mak** | What do I need to ask, remember, and cite next? |
| **Lattice** | Where is my professional energy and evidence concentrated? |
| **Institution** | Is the program on track; what does CCC need? |
| **Output** | What document can I produce from verified facts? |

---

## Lifecycle overview

```
ONBOARDING (baseline instruments + validate)
    ↓
DAILY CAPTURE (ledger grows)
    ↓
QUARTERLY sit-down → validate
    ↓
SEMIANNUAL sit-down (+ trainee CCC alignment)
    ↓
ANNUAL deep refresh + year in review
    ↓
[Trainee: CCC assigns milestones] / [Attending: promotion cycles]
    ↓
GRADUATION → narrow seed into attending map (ADR-001)
    ↓
ATTENDING longitudinal (same loop, different lattice)
```

---

# Phase 1 — Onboarding (initial set)

| | **User** | **Mak** | **Lattice** | **Institution** | **Output** |
|--|----------|---------|-------------|-----------------|------------|
| **Tier 1–2** | Specialty, stage, setting, program join (trainee) | Context only | Empty or placeholder | Program link, roster | None |
| **Instrument sit-down** | ~12 min conversation; **no scores shown** | Walks PFI, BITS, aspirations, PIF, UWES, invisible work (`deployedInstruments()`); scores **internally** | No map change yet | “Baseline incomplete/complete” aggregate only | None |
| **Validation card** | Reviews narrative summary; **Confirm / Edit / Off** | Re-prompts if edit | Nothing until confirm | — | None |
| **On confirm** | Baseline saved; capacity weather (qualitative) | MemPalace: themes, thresholds, horizon seed | **Proposed** profile evidence may seed lattice preview | — | None |
| **CV upload** | Upload/paste CV | Encourages upload; explains reconcile | Parser → **proposed** cells | — | None |
| **Reconcile** | Confirm/dismiss each CV suggestion | `reconcile-mak-flow` | **Confirmed** items populate counts | — | Future doc sources |
| **Goals / horizon** | 1–5 yr direction sketch | `goal-setting-mak-flow` | **★ horizon markers** on target intersections | — | Template prefs |
| **Complete** | Dashboard unlock | Full coach mode | Map reflects **confirmed** only | Import evals if linked | Empty studio |

**Gate (north star):** `tier3_complete` only after instruments **confirmed** (+ reconcile if CV uploaded).

**Code:** `Touchpoint1Onboarding.tsx`, `instrument-conversation-service.ts`, `onboarding/compute/route.ts` (drift: may set tier3 early — fix toward gate)

**Instrument set by persona:** `onboarding-touchpoint1.ts` → `deployedInstruments()`

---

# Phase 2 — Daily / weekly (capture loop)

| | **User** | **Mak** | **Lattice** | **Institution** | **Output** |
|--|----------|---------|-------------|-----------------|------------|
| **Chat / voice log** | Informal capture | Miner → structured activity; invisible-work dimensions | **Proposed** until confirm | — | Evidence row |
| **Activities tab** | Structured log | Same | Same | — | Same |
| **Documents** | Upload eval PDF, etc. | Parse; reconcile prompts | Proposed | Eval import (trainee) | Vault |
| **Schedule** | Rotation calendar | Schedule memory | **Scheduled** visible; **zero count** until past | Cohort schedule aggregate | — |
| **Dashboard** | Due-now, weather, mini map | MECE entry actions | Mini lattice | — | Link to studio |

**Mak context each turn (target):** profile, confirmed + pending evidence, internal PFI/BITS **themes**, top lattice cells with IDs — **not** raw CDI/S-Index/IWQ in chat.

**Code:** `chat/message/route.ts`, `activity-capture.ts`, `classify-chat-message.ts`

---

# Phase 3 — Quarterly sit-down (~90 days)

| | **User** | **Mak** | **Lattice** | **Institution** | **Output** |
|--|----------|---------|-------------|-----------------|------------|
| **Invite** | Dashboard: “Quarterly sit-down ~8 min” | Cadence due | — | Optional cohort completion % | — |
| **Session** | Dedicated Mak mode | PFI + BITS + 3 aspiration prompts; uses **prior quarter internally** | — | — | — |
| **Behind scenes** | No numbers shown | `scorePfi()`, `scoreBits()`, trend vs onboarding | — | — | — |
| **Validation** | Narrative card: fulfillment, strain, horizon | Edit loop | On confirm: energy borders, density refresh | **No** individual wellbeing export | Plan may adjust |
| **After confirm** | Insights update; Perspective marked done | Coaching brief update | Instrument → lattice annotations | Aggregate only (consent, n≥5) | — |

**Core set:** PFI, BITS, short aspirations pulse.

**Code:** `quarterly-mak-flow.ts`, `quarterly-pulse.ts`, `touchpoint-eligibility.ts`

---

# Phase 4 — Semiannual (~6 months; trainee ↔ CCC)

| | **User** | **Mak** | **Lattice** | **Institution** | **Output** |
|--|----------|---------|-------------|-----------------|------------|
| **Sit-down** | Deeper: + UWES, PIF pulse, invisible work | Same validate model | — | — | — |
| **Trainee self-rating** | ACGME 1–5 per subcompetency | CCC prep coaching | Heatmap self layer | — | — |
| **Discrepancy** | watch / discuss vs imported evals | Plain-language explain | Overlay on heatmap | PD pre-CCC view | — |
| **Pre-CCC packet** | Optional logs chosen by resident | Talking points | Heatmap + themes | **Pre-CCC summary** | Resident export PDF |
| **Institution batch** | — | — | Cohort heatmap (one period) | Coordinator batch | — |
| **CCC meeting** | Meets committee | — | Official levels assigned by committee | Decision recorded | — |
| **Post-CCC** | Updated imported milestones | — | Criterion colors update | Program systems | — |

**Never:** AI auto-assigns milestone levels. NLP = themes + quotes (`ai_generated: true`).

**Code:** `pre-ccc-summary.ts`, `milestone-discrepancy.ts`, `TraineeMilestoneHeatmapCard.tsx`, `CohortHeatmapPanel.tsx`

---

# Phase 5 — Annual (year in review)

| | **User** | **Mak** | **Lattice** | **Institution** | **Output** |
|--|----------|---------|-------------|-----------------|------------|
| **Deep sit-down** | Full aspirations + one touchpoint block | `annual-mak-flow.ts` | — | — | — |
| **User year in review** | Anchors, energy arc, evidence highlights | Co-written narrative | Longitudinal view | Not auto-shared | PDF export |
| **Program year in review** | — | — | Cohort longitudinal | PD/GME trends report | Program deck |
| **Plan** | 5-yr horizon rewrite; 1-yr goals | Capacity-gated | ★ markers updated | — | — |

---

# Surfaces — steady state

## Dashboard (`/app/dashboard`) — Compass

| Actor | Occurring |
|-------|-----------|
| **User** | Greeting, capacity weather, due-now, mini map, Mak entry |
| **Mak** | 4 MECE actions: capture, continue check-in, discuss map, prep document |
| **Lattice** | `MiniLattice` (attending) or milestone glance (trainee) |
| **Institution** | — |
| **Output** | CTA to studio |

## Perspective (`/app/subjective`)

| Actor | Occurring |
|-------|-----------|
| **User** | Wellbeing **inputs** when due; post sit-down **validation cards** |
| **Mak** | Instrument cluster continuation |
| **Lattice** | — |
| **Institution** | — |
| **Output** | — |

## Objective (`/app/objective`) — Ledger + map

| Tab | User | Mak | Lattice | Institution | Output |
|-----|------|-----|---------|-------------|--------|
| **Lattice** | Pan/zoom; micro-cards; ★ horizons | Cite cells (target) | See [Lattice systems](#lattice-two-systems) | Staff: individual heatmap (role); GME: cohort | Evidence IDs |
| **Vault** | Verified facts | Retrieval | — | Reconciled counts only | RAG source |
| **Reconcile** | Confirm/dismiss | Reconcile flow | Counts on confirm | — | Unlocks claims |
| **Activities** | Log/review | Capture | Density | — | Citations |
| **Documents** | CV, uploads | Parse | Proposed | Import rail | Source files |

## Insights (`/app/assessment`)

| Actor | Occurring |
|-------|-----------|
| **User** | Career pattern, touchpoint status, strengths — **no** CRI/coherence/S-Index |
| **Mak** | Server-side themes |
| **Lattice** | Read-only drill-down |
| **Institution** | — |
| **Output** | Narrative tone hints |

## Plan (`/app/plan`)

| Actor | Occurring |
|-------|-----------|
| **User** | Goals, pathways, jobs — qualitative fit |
| **Mak** | Goal-setting; capacity-gated suggestions |
| **Lattice** | ★ targets = bridge |
| **Institution** | — |
| **Output** | — |

## Output Studio (`/app/output`)

| Actor | Occurring |
|-------|-----------|
| **User** | Templates, Lexical editor, evidence drawer, export |
| **Mak** | Explain draft; section help |
| **Lattice** | Confirmed cell evidence |
| **Institution** | Only user-shared exports |
| **Output** | Strict RAG; energy-alignment filter; workpaper vs memo |

---

# Lattice — two systems

## System 1 — Trainee (ACGME)

| Element | Occurring |
|---------|-----------|
| **Rows** | ACGME subcompetencies (specialty-specific) |
| **Columns** | Semiannual reporting periods |
| **Cells** | Milestone level 1–5 vs PGY benchmark (criterion color) |
| **Overlay** | Ipsative growth vs own prior period — **never overrides** summative CCC color |
| **Inputs** | MedHub import, self-rating, `ccc_assigned` levels |
| **User** | Own heatmap |
| **Staff** | Same + discrepancy + pre-CCC |
| **GME** | Cohort heatmap; year-to-year longitudinal (k-anonymity) |
| **Not** | 8×8 competency grade; radar plots (ADR-001) |

**Code:** `TraineeMilestoneHeatmapCard.tsx`, `gme/trainee-evaluation-framework.ts`, `gme/reporting-periods.ts`

## System 2 — Attending (8×8 FISCMAK)

| Element | Occurring |
|---------|-----------|
| **Grid** | 8 career tracks × 8 skill domains (64 cells) |
| **Density** | Confirmed evidence volume + recency → opacity (**ipsative** vs self) |
| **Tiers (user-facing)** | Latent / Emerging / Anchored — not numeric levels |
| **Energy** | Draining cluster → soft amber border |
| **Horizon** | User ★ on targets; organic fill as evidence accrues |
| **Development level** | Must be hidden or “suggested” — **not** entrustment |
| **Inputs** | Confirmed CV, activities, instruments (themes), past schedule only |
| **Graduation seed** | Final milestones → **Clinician × Clinical Expertise** band only (ADR-001) |

**Code:** `lattice/aggregate.ts`, `DualLatticeGrid.tsx`, `LatticeView.tsx`

---

# Coach Mak — behavior map

| Mode | Trigger | Backend | User sees |
|------|---------|---------|-----------|
| Onboarding battery | Tier 2 done | `instrument-conversation-service.ts` | Cluster conversation |
| Daily capture | Chat | `classify-chat-message.ts`, activities | Natural reply |
| Reconcile | CV/enrichment | `reconcile-mak-flow.ts` | Confirm prompts |
| Quarterly / annual | Cadence | `quarterly-mak-flow.ts`, `annual-mak-flow.ts` | Sit-down + validation |
| CCC prep | Trainee pre-CCC | discrepancy + themes | Talking points |
| Goals / pivot | Plan | `goal-setting-mak-flow.ts`, pivot flows | SDT invitations |
| Output help | Studio | RAG context | Cited explanations |
| Escalation | Crisis language | `escalation-protocols.ts` | Resources |

**Internal only:** PFI/BITS scores, S-Index, IWQ, CDI → themes via `internal-coaching-signals.ts`, `mak-coaching-engine.ts`; `auditContextBlockForMetricLeakage()`.

**Anti-patterns (north star):** gate greeting wiping history; tier3 before data; context without lattice while UI shows hot cells.

---

# Institution — behavior map

| Function | Occurring | Individual vs aggregate |
|----------|-----------|------------------------|
| MedHub/CSV import | `rotation_evaluations`, milestone maps | Per trainee in DB |
| Pre-CCC summary | Themes, quotes, sufficiency, discrepancy, ILP | **Named** trainee |
| Pre-CCC batch | All residents, one period | Coordinator |
| Cohort heatmap | Subcompetency × period | **Aggregate** |
| Cohort longitudinal | Year-over-year by PGY | **Aggregate**, k-anonymity |
| Program year in review | Trends, rotation/system actions | No names in system deck |
| ILP approval | Staff workflow | Named |

**Forbidden** (`gme-program-access.ts`): Mak transcripts, individual PFI/BITS, S-Index, IWQ, raw CV text, mempalace, unreconciled enrichment as official record.

**Zoom levels:**

1. **Individual (named)** — PD/CCC/coordinator for training decisions  
2. **Cohort** — program QI  
3. **System** — GME office longitudinal  

---

# Output — document types

| Document | Evidence sources | Notes |
|----------|------------------|-------|
| Promotion narrative | Confirmed lattice, vault, activities | Per-claim citations |
| Academic dossier | Vault, publications, grants | Section save |
| Pre-CCC portfolio | Eval themes, self-rating, optional logs | Trainee-owned export |
| CV / resume | Vault + energy-alignment filter | Horizon-aligned |
| Cover letter / pivot | Ledger + internal O\*NET translation | Strict RAG |
| Year in review PDF | Quarterly validates + highlights | Post user confirm |

**Pattern:** Workpaper (all sources + audit trail) → user-edited memo (Big 4 model).

**Code:** `output-generation.ts`, `promotion-narrative-sections.ts`, `OutputStudioWorkspace.tsx`, `EvidenceDrawer.tsx`

---

# Standardized questionnaires — cadence

| When | Instruments | User experience | After |
|------|-------------|-----------------|-------|
| **Onboarding** | Full `deployedInstruments()` set | Mak sit-down + **validation card** | Baseline; unlock app |
| **Quarterly** | PFI, BITS, 3 aspiration prompts | Sit-down + validate | Insights, Plan, weather |
| **Semiannual** | + UWES, PIF pulse, invisible work; trainee self-rating | Align with CCC period | Pre-CCC, discrepancy |
| **Annual** | Full aspiration refresh, one touchpoint block | Deep sit-down + year in review | 5-yr horizon |

**Rule:** Instruments inform Mak **behind the scenes**; user sees **states and narrative**, not scores.

**Code:** `onboarding-instruments.ts`, `user-facing-analytics.ts`, `profile-contract.ts` (`INTERNAL_METRICS`)

---

# Internal engine room (never user-facing)

| Component | Role |
|-----------|------|
| `scorePfi()`, `scoreBits()`, `computeIwq()` | Instrument scoring |
| `buildCareerHealthView()`, `cdi-weights.ts` | CDI composite (retire from UI) |
| `formulas.ts` CRI, job match | Internal |
| `cv-metrics.ts`, S-Index | Mak hints only |
| `kp-admin-tracking.ts` | Dev/coordinator mirror |

---

# Implementation drift (bugs vs this map)

| Area | Target (this doc) | Current drift |
|------|-------------------|---------------|
| Onboarding instruments | Sit-down + validate + gate tier3 | Compute may skip battery |
| Quarterly validate | Confirm before Insights update | Partially designed |
| Lattice | Confirmed evidence only | CV keywords may count |
| Mak | One thread + lattice context | Section silos; thin context |
| Output | Cited RAG | Weak citations |
| User UI | No composite scores | Domain scores may leak |

See [NORTH_STAR.md](./NORTH_STAR.md) § Known implementation drift.

---

# One-page mental model

```
         USER                    MAK                 INSTITUTION
          │                      │                        │
   sit-down & confirm ──────────►│◄── themes only ────────┤ import evals
          │                      │                        │
          ▼                      ▼                        ▼
     EVIDENCE LEDGER ◄───────────┴──────────► rotation_evaluations
     (proposed/confirmed)              milestone ratings (trainee)
          │
          ├────────► LATTICE (confirmed density / trainee heatmap)
          ├────────► INSIGHTS (patterns)
          ├────────► PLAN (horizon, capacity-gated goals)
          └────────► OUTPUT (traceable documents)
```

---

*Internal — align implementation PRs with this map when touching onboarding, Mak, lattice, instruments, GME, or Output.*

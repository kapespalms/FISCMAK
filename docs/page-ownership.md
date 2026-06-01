# FISCMAK page ownership (MECE)

Each page answers **one primary question**. Edit data in one place; other pages show read-only summaries and link out.

## Zones

| Zone | Route | Primary question |
|------|-------|------------------|
| Command center | `/app/dashboard` | What's my status and what's due now? |
| Perspective | `/app/subjective` | How am I doing subjectively? |
| Evidence | `/app/objective` | What verified career data do I have? |
| Insights | `/app/assessment` | What does my data mean? |
| Strategy | `/app/plan` | What am I working toward? |
| Outputs | `/app/output` | What documents do I produce? |
| Account | `/app/profile`, `/app/settings` | Who am I in the system? |
| Well-Being | `/app/wellbeing` | What do my check-ins show? |
| Onboarding | `/app/onboarding` | First-time setup only |

Satellite: `/app/jobs` → `/app/plan?tab=jobs` (linked from Strategy, not top nav).

---

## Dashboard

**Owns:** greeting, mini lattice, goal snapshot, due-now banner (e.g. “Quarterly check-in due”), touchpoint progress strip, single Mak entry (`DASHBOARD_MECE_OPTIONS`).

**Shows read-only:** lattice heatmap (confirmed), goal progress bars, track, next milestone.

**Target (north star):** no Career Health Score or numeric wellbeing gauge on dashboard — see [FISCMAK_UI_COPY_CONTRACT.md](./FISCMAK_UI_COPY_CONTRACT.md).

**Links out:** Strategy (goals), Career Data (lattice), Insights (interpretation), Perspective (last check-in summary).

**Never:** goal CRUD, document upload UI, activity forms, check-in question forms (check-ins live in Coach Mak).

---

## Perspective (`/app/subjective`)

**Owns:** link/CTA when a check-in is due; **last saved check-in summary** (plain bullets, read-only); optional yearly review status.

**Never:** numeric wellbeing scores, career pattern synthesis (Insights), vault/documents, goal editing. Check-in **questions** happen in Coach Mak, not forms on this page.

---

## Objective (`/app/objective`)

**Sub-tabs (mutually exclusive):**

| Tab | Owns |
|-----|------|
| Lattice | 8×8 activity map |
| Vault | Verified career facts |
| Reconcile | Confirm/dispute enrichment |
| Activities | Structured invisible-work capture |
| Documents | File upload and paste |

**Never:** insights narrative, goal CRUD.

**Mak routing:** capture → Activities; upload → Documents (`?upload=1`).

---

## Insights (`/app/assessment`)

**Owns:** career pattern, coherence, recognition gaps, touchpoint **status** (conversation-derived).

**Never:** forms, uploads, goal editing, metric entry (that's Perspective).

---

## Strategy (`/app/plan`)

**Sub-tabs (mutually exclusive):**

| Tab | Route | Owns |
|-----|-------|------|
| Goals | `/app/plan` or `?tab=goals` | Development / Maintenance / Sustainability goals (CRUD), milestones, quarterly/annual goal reviews |
| Pathways | `/app/plan?tab=pathways` | Specialty career tracks, market demand, salary ranges |
| Jobs | `/app/plan?tab=jobs` | Position match feed, saved roles, Mak commentary on fit |

**Owns:** goal CRUD, milestone tracking, job match exploration (within Strategy zone).

**Never:** dashboard summaries with edit affordances, document generation.

**Legacy:** `/app/jobs` redirects to `/app/plan?tab=jobs`.

---

## Output Studio (`/app/output`)

**Owns:** templates, Lexical editor, evidence drawer, export.

**Never:** raw data entry, assessment interpretation.

---

## Mak entry points

| Context | Registry |
|---------|----------|
| Dashboard | `DASHBOARD_MECE_OPTIONS` (4 actions) |
| Section pills | `resolveSectionQuickAction()` in `section-mak-routes.ts` |
| Card-level | `MakDiscussLink` + `card-mak-prompts.ts` |

---

## Touchpoints (MECE split)

| Surface | Role |
|---------|------|
| Dashboard due-now + strip | Orient + CTA to continue |
| Perspective | Annual/quarterly **input** |
| Insights | Seven touchpoint **status** cards |

---

## Well-Being (`/app/wellbeing`)

**Owns:** monthly check-in form (FCWI); weekly pulse form; well-being origami plot + trend lines (Phase 5); "what's due now" banner for well-being instruments.

**Never:** composite scores, instrument names (no "FCWI", "MDT", "MBI" in physician UI), career pattern analysis (Insights), goal editing. MDT ≥4 → resource link only, never auto-reported.

**Architectural decision (2026-06-01):** dedicated zone because FCWI/pulse are standardized instruments, not Mak conversations. Distinct from `/app/subjective` (conversational) by design.

---

## Legacy redirects

`/app/lattice`, `/app/activities`, `/app/documents` → Objective tabs  
`/app/goals`, `/app/jobs` → Plan  
`/app/studio` → Output  
`/app/mak` → `/app/dashboard` (Mak is the global panel)

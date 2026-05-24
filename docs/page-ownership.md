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
| Onboarding | `/app/onboarding` | First-time setup only |

Satellite: `/app/jobs` → `/app/plan?tab=jobs` (linked from Strategy, not top nav).

---

## Dashboard

**Owns:** greeting, profile metrics glance, health score gauge, mini lattice, goal snapshot, due-now banner, touchpoint progress strip, single Mak entry (`DASHBOARD_MECE_OPTIONS`).

**Shows read-only:** health score, lattice heatmap, goal progress bars, track, next milestone.

**Links out:** Strategy (goals), Objective (lattice), Insights (interpretation), Perspective (check-ins).

**Never:** goal CRUD, document upload UI, activity forms, touchpoint input forms.

---

## Perspective (`/app/subjective`)

**Owns:** wellbeing metrics (direction, fulfillment, strain, alignment, engagement, unrecognized work), annual/quarterly **input** when due.

**Never:** career pattern synthesis (Insights), vault/documents, goal editing.

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

## Legacy redirects

`/app/lattice`, `/app/activities`, `/app/documents` → Objective tabs  
`/app/goals`, `/app/jobs` → Plan  
`/app/studio` → Output  
`/app/mak` → `/app/dashboard` (Mak is the global panel)

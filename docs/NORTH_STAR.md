# FISCMAK north star

**One line:** Make invisible physician work visible, turn it into career intelligence, and give physicians agency over their trajectory — with Coach Mak as the guide, not the product.

**Public tagline:** Understand your career.

Use this doc to decide whether a feature, copy change, or refactor moves toward or away from the mission. For route-level ownership, see [page-ownership.md](./page-ownership.md).

---

## Founding intent

We built FISCMAK because brilliant physicians repeatedly do work that never appears in advancement decisions: teaching without documentation, mentorship without recognition, emotional labor that sustains programs but stays invisible.

**Founding question:** What if every activity a physician logs becomes insight about their career trajectory?

**Category:** Career intelligence — not a generic coaching app, not a job board, not a wellness-only tool.

**Closing intent:** Make invisible work visible, honor the treasures physicians carry, and build the career clarity they deserve.

---

## The name is the strategy

Pronounced **FIZ-MAK** (the **C** in FISC is silent — the invisible letter is the point).

| Pillar | Meaning | Product job |
|--------|---------|-------------|
| **FISC** (treasury) | Expertise, dedication, time — hidden value already present | Capture and structure **evidence** |
| **Silent C** | Invisible work — essential, dynamic, unrecognized | Surface and name what systems ignore |
| **MAK** (maximus) | Professional agency — deliberate career moves | Coach, plan, and **generate outputs** |

---

## The core loop

Everything in the product should serve one loop:

```
Capture evidence → See the pattern → Understand trajectory → Act (plan + documents)
         ↑                                                    │
         └──────────── Coach Mak (continuous, remembering) ───┘
```

| Stage | User-facing idea | Primary surfaces |
|-------|------------------|------------------|
| **Capture** | Add what I do (talk, upload, schedule) | Mak panel, Objective (documents/activities), onboarding |
| **See** | Map and vault show my career shape | Objective (lattice, vault, reconcile) |
| **Understand** | What does this mean for me? | Insights, dashboard health/patterns |
| **Act** | Goals, paths, jobs, documents | Plan, Output |

Mak is the **continuous coach layer** across all stages. Pages hold **data and tools**; Mak holds **conversation and memory**.

---

## What we are / what we are not

| We are | We are not |
|--------|------------|
| Longitudinal career intelligence from everyday work | One-off chat or generic AI assistant |
| Evidence-backed career map and outputs | Keyword-stuffed lattice with no user trust |
| Conversational capture (Mak), minimal forms | Long questionnaires masquerading as “assessment” |
| Physician agency (plan, narrative, promotion) | Institution surveillance of individual conversations |
| Trainee competency views **and** attending portfolio growth | A single “score” that judges worth |

**Privacy line:** Individual Mak conversations and private reflections are not institution-facing. Aggregate trends require opt-in and appropriate minimum group size (see product privacy copy).

---

## Evidence is the foundation

Industry-standard pattern (clinical records, CRM, grounded AI): **one evidence layer** that every consumer reads.

**Target model (logical unit):**

- **Capture** — Mak chat, CV upload, calendar, program schedule, assessments  
- **Extract & map** — structured facts + provisional ontology placement  
- **Review** — user confirms, fixes, or dismisses (reconcile / evidence inbox)  
- **Consume** — lattice, Insights, Output, Mak context (same source)

**Principles:**

1. **Provisional by default** — CV and schedule *suggest*; user confirmation (or high-confidence auto-confirm) makes truth.  
2. **Provenance always** — source, date, status (proposed / confirmed / dismissed), time class (past / current / scheduled).  
3. **Scheduled ≠ completed** — future rotations must not inflate experience counts or levels.  
4. **Levels are suggestions until confirmed** — lattice levels are not ACGME entrustment decisions unless explicitly labeled and validated.  
5. **Mak explains the map** — if the user cannot ask “why is this cell hot?” and get a cited answer, the loop is broken.

---

## Coach Mak (one entity)

**Role:** Guide through capture, interpretation, planning, and document prep — **one integrated coach**, not a new bot per page. Perspective, Career Data, Insights, Strategy, and Output Studio are **places in the app**; Mak remembers the thread. Check-ins are **something Mak does with you**, not a separate product.

**Target behavior:**

- One primary conversation thread — not history siloed per section  
- Memory summary + retrieval over confirmed evidence  
- Section changes = context shift in the same thread, not a cold restart  
- Onboarding = baseline check-in with Mak (not a static form grid)  
- Document generation = Output Studio pulls **confirmed evidence**; Mak can explain the draft  

**User-facing language:** plain English only — [FISCMAK_MAK_LANGUAGE_GUIDE.md](./FISCMAK_MAK_LANGUAGE_GUIDE.md). No scores, SOAP/SOAPO, tier numbers, or instrument names in the UI.

**Anti-patterns:**

- Gate greeting that wipes visible history on every workspace visit  
- Onboarding flags that mark “complete” before check-in summary is saved  
- Chat context that omits lattice/CV evidence while the UI shows strong map signals  

---

## Anti-gamification & ethics

- No Career Health Score, percentiles, peer rank, or composite grades for physicians.  
- Wellbeing instruments inform Mak **internally**; users see **summaries they confirm** (“Does this sound right?”).  
- Coaching helps individuals navigate; **organizations** must still address workload and system drivers (Dyrbye et al.) — institution plane is aggregate signal, not a substitute.  
- **No new validated instruments** for MVP unless one is removed with equal or lower burden.

---

## Career map (lattice)

**North star for the map:** A **growth and identity portrait**, not a grade.

| Audience | Primary lens |
|----------|--------------|
| **Trainee** | Milestone / competency heatmap where criterion-referenced views apply; growth overlay over time |
| **Attending** | 8×8 FISCMAK lattice — **ipsative** intensity (relative to self), not “bright = good physician” |

Cell counts should reflect **confirmed evidence** the user trusts. Parser output alone is insufficient for production truth.

See [MVP_GME_BACKEND_SPEC.md](./MVP_GME_BACKEND_SPEC.md) (ADR-001 two-lattice model, ADR-002 intensity) for architecture detail.

---

## Decision filter

Before shipping a feature, ask:

1. Does it make **invisible work more visible**?  
2. Does it increase **career understanding** (not just data volume)?  
3. Does it increase **agency** (plan, narrative, promotion, path)?  
4. Does **Mak remember and connect** — or add another silo?  
5. Does it respect **provisional → confirmed** evidence?

If most answers are no, deprioritize or redesign.

---

## How surfaces map to the north star

| Zone | North star contribution |
|------|-------------------------|
| **Dashboard** | Orient: status, due now, entry to Mak |
| **Perspective** | Subjective wellbeing input (not pattern synthesis) |
| **Objective** | Evidence home: capture artifacts, map, vault, reconcile |
| **Insights** | Interpret patterns and gaps (read-only, conversation-derived) |
| **Plan** | Strategy: goals, pathways, jobs |
| **Output** | Produce documents from career evidence |
| **Onboarding** | First capture + first conversation; must **complete** real setup |

Detailed MECE rules: [page-ownership.md](./page-ownership.md).  
Post-login UX intent: [FISCMAK_REFINED_POSTLOGIN_FLOW.md](./FISCMAK_REFINED_POSTLOGIN_FLOW.md).

---

## Known implementation drift (fix toward north star)

These are **bugs against the north star**, not alternate visions:

| Drift | Target state |
|-------|--------------|
| Self-assessment step lists instruments then skips them | Mak runs baseline check-in; complete only when summary saved |
| Mak history siloed per section; gate resets thread | One thread + memory; contextual nudges only |
| CV/lattice/Mak use different pipelines | Single evidence API; map and chat agree |
| Lattice counts raw parser snippets | Confirmed evidence only; scheduled items visually distinct |
| Output generate weakly grounded in CV/lattice | Retrieve confirmed evidence with citations |

---

## Related docs

| Doc | Purpose |
|-----|---------|
| [FISCMAK_INTEGRATED_ARCHITECTURE.md](./FISCMAK_INTEGRATED_ARCHITECTURE.md) | Index: layers, audiences, priorities |
| [FISCMAK_MAK_LANGUAGE_GUIDE.md](./FISCMAK_MAK_LANGUAGE_GUIDE.md) | How Mak speaks; user vs backend words |
| [FISCMAK_CHECKIN_FLOW.md](./FISCMAK_CHECKIN_FLOW.md) | Baseline / quarterly flow and summary confirm |
| [FISCMAK_UI_COPY_CONTRACT.md](./FISCMAK_UI_COPY_CONTRACT.md) | Per-page allowed copy (in-app only) |
| [FISCMAK_OUTPUT_STUDIO_SPEC.md](./FISCMAK_OUTPUT_STUDIO_SPEC.md) | Documents from confirmed facts |
| [FISCMAK_OPENEVIDENCE_HANDOFF.md](./FISCMAK_OPENEVIDENCE_HANDOFF.md) | External AI + validation roadmap |
| [FISCMAK_MAK_QUESTION_CADENCE.md](./FISCMAK_MAK_QUESTION_CADENCE.md) | Phase-by-phase Mak questions (internal detail) |
| [FISCMAK_MEETING_OVERVIEW.md](./FISCMAK_MEETING_OVERVIEW.md) | Short overview for stakeholder meetings |
| [FISCMAK_SYSTEM_MAP.md](./FISCMAK_SYSTEM_MAP.md) | Internal: User / Mak / lattice / institution / Output at each lifecycle phase |
| [page-ownership.md](./page-ownership.md) | Which page owns which question |
| [FISCMAK_REFINED_POSTLOGIN_FLOW.md](./FISCMAK_REFINED_POSTLOGIN_FLOW.md) | Dashboard-centric + docked Mak |
| [MVP_GME_BACKEND_SPEC.md](./MVP_GME_BACKEND_SPEC.md) | Trainee vs attending lattice ADRs |
| [spec-v2/FISCMAK_Promotion_Integration.md](./spec-v2/FISCMAK_Promotion_Integration.md) | Promotion narrative ↔ career intelligence |
| `/our-narrative` (marketing) | Founders’ narrative (public) |

---

*Last updated: May 2026 — align implementation PRs with this doc when touching onboarding, Mak, lattice, or evidence.*

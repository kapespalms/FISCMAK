# FISCMAK — meeting overview

**One line:** Career intelligence for physicians — make invisible work visible, build a evidence-backed career map, and support sustainable direction with Coach Mak.

**Tagline:** Understand your career.

**Category:** Not a job board, not wellness-only, not ATS optimization (unlike OwlApply/Teal/Jobscan).

---

## The problem

Physicians do essential work that rarely counts in advancement: teaching, mentorship, emotional labor, systems navigation. Evaluations sit in MedHub silos. Job tools reduce people to keywords. Nothing connects **institutional training data**, **wellbeing**, **invisible work**, and **career narrative** in one place the **physician owns**.

---

## The solution (core loop)

```
Capture evidence → See the pattern → Understand trajectory → Act (plan + documents)
         ↑                                                    │
         └──────────── Coach Mak (continuous, remembering) ───┘
```

| Stage | User experience |
|-------|-----------------|
| **Capture** | Talk to Mak, upload CV, log activities, quarterly sit-downs |
| **See** | Career map (lattice or milestone heatmap) + evidence vault |
| **Understand** | Insights (patterns, not scores) |
| **Act** | Goals, horizons, promotion/CV documents with citations |

---

## FISC + silent C + MAK

| Pillar | Meaning |
|--------|---------|
| **FISC** (treasury) | Hidden expertise and time → structured **evidence** |
| **Silent C** | Invisible work → named and counted when **confirmed** |
| **MAK** | Agency → coach, plan, **outputs** |

---

## Three audiences (one engine, different contracts)

| Audience | Gets | Does not get |
|----------|------|--------------|
| **Physician** | Narrative, map, agency, private Mak | Composite grades, peer rank, surveillance |
| **Coach Mak** | Full structured corpus; speaks in themes | Dumping psychometric scores in chat |
| **Institution** | Cohort trends, pre-CCC synthesis, eval import | Individual Mak chat, individual PFI/BITS |

**Privacy line:** Training and eval data flow in; private reflection and wellbeing stay with the physician unless they choose to share (e.g. CCC packet).

---

## Evidence model (everything runs on this)

Each fact: **what · where · source · status · when**

- **Proposed** (CV parse, AI suggestion) → user **confirms or dismisses**
- **Confirmed** → map, documents, and insights
- **Scheduled** (future rotations) → visible but does **not** inflate experience

---

## Standardized questionnaires (narrative fuel, not dashboards)

| When | What | User experience |
|------|------|-----------------|
| **Onboarding** | PFI, BITS, aspirations, PIF, UWES, invisible work (~12 min) | Mak sit-down → **validation card** → unlock app |
| **Quarterly** | PFI + BITS + short aspirations (~8 min) | Same: sit-down → confirm → updates Plan/Insights |
| **Every 6 months** | Deeper pulse + trainee milestone self-rating | Aligns with CCC cycle |
| **Annual** | Horizon refresh + year in review | Narrative PDF, not score report |

**Rule:** Instruments inform Mak **behind the scenes**. Users see **capacity weather** (Clear / Variable / Overcast) and themes — not PFI numbers or career health %.

---

## Two maps (trainee vs attending)

| | **Trainee** | **Attending** |
|--|-------------|---------------|
| **Question** | Am I developing toward entrustment? | Where is my career concentrated vs my goals? |
| **View** | ACGME subcompetency × time **heatmap** | 8×8 **career lattice** (tracks × skills) |
| **Reference** | Criterion (vs PGY benchmark) | **Ipsative** (vs your own past) |
| **Data** | MedHub evals, CCC milestones | CV, activities, confirmed evidence |
| **Not** | 8×8 competency grade | Keyword “Level 4” as entrustment |

At graduation: **narrow seed** from final milestones into attending map — not a unified 64-cell training score.

---

## Coach Mak

- One integrated coach (not a new bot per page)
- Onboarding and quarterly = **conversational** instruments, not form grids
- Explains the map with **cited evidence** (“why is this cell active?”)
- **Co-investigator** (SDT): invites exploration; does not dictate career moves
- Crisis → resources; not HR auto-surveillance

---

## Institution / GME (pilot-ready)

| Capability | Purpose |
|------------|---------|
| MedHub / CSV import | Rotation evals + milestone fields |
| Pre-CCC summary | Themes, discrepancy, ILP status — **per resident** for CCC |
| Pre-CCC batch | Coordinator view for one reporting period |
| Cohort heatmap | Aggregate milestone patterns |
| Cohort year-to-year | Program QI longitudinal trends |
| Program year in review | Systems trends — not resident report cards |

**CCC principle:** AI prepares **dossier of themes**; committee **assigns** official milestone levels — no auto-promotion math.

---

## Output Studio

- Promotion narratives, dossiers, pre-CCC exports, CV variants
- Every claim **traceable** to confirmed evidence
- **Energy-alignment filter:** pivot documents emphasize energizing, horizon-aligned work
- Workpaper (all sources) → user-edited memo (professional narrative)

---

## Product surfaces (SOAP)

| Zone | Route | Job |
|------|-------|-----|
| Dashboard | `/app/dashboard` | Orient, due-now, Mak entry |
| Perspective | `/app/subjective` | Wellbeing inputs + sit-down validation |
| Objective | `/app/objective` | Map, vault, reconcile, activities, documents |
| Insights | `/app/assessment` | Patterns (read-only) |
| Plan | `/app/plan` | Goals, pathways, jobs |
| Output | `/app/output` | Documents |

---

## vs existing tools

| Tool | Role | FISCMAK difference |
|------|------|-------------------|
| **MedHub / New Innovations** | GME compliance | We integrate import; add **physician-owned** intelligence + narrative |
| **OwlApply / Teal / Jobscan** | ATS / job hunt | We optimize **identity and sustainability**, not keyword scores |
| **Doximity** | Public profile | Private **longitudinal ledger** with confirmation control |
| **Wellness apps** | Mood/burnout check | Wellbeing **embedded in career loop**, not isolated |

---

## Research grounding (honest framing)

**Validated inputs:** Stanford PFI, BITS, UWES, PIF; ACGME milestones (trainees); programmatic assessment ethics.

**Design principles:** Self-Determination Theory (autonomy), cognitive load reduction (one input → many surfaces), ipsative growth (attending), psychological safety (no surveillance).

**The 8×8 lattice opacity tiers** = evidence-informed **design** — usability studies needed; not a validated psychometric test.

---

## Current state (May 2026)

**Built:** Instrument battery, Mak flows, trainee heatmap, cohort heatmap, pre-CCC summary, MedHub import path, Output Studio, 8×8 lattice, onboarding tiers.

**Aligning toward north star:** Instrument gate before onboarding complete; confirmed-only map counts; Mak/lattice context unity; remove user-facing composite scores; Output citation grounding.

**Pilot:** Psychiatry / UH GME path documented in `MVP_PILOT_STATUS.md`.

---

## Decision filter (for any feature)

1. More invisible work visible?
2. More **understanding** (not just data)?
3. More **agency**?
4. Mak **remembers** — or new silo?
5. Respects **proposed → confirmed**?

---

## Full internal docs (repo)

| Doc | Use |
|-----|-----|
| [NORTH_STAR.md](./NORTH_STAR.md) | Mission and decision filter |
| [FISCMAK_SYSTEM_MAP.md](./FISCMAK_SYSTEM_MAP.md) | Phase-by-phase User / Mak / lattice / institution / Output |
| [FISCMAK_RESEARCH_CROSSWALK.md](./FISCMAK_RESEARCH_CROSSWALK.md) | Research AI + implementation crosswalk |
| [MVP_GME_BACKEND_SPEC.md](./MVP_GME_BACKEND_SPEC.md) | Trainee vs attending ADRs, GME API |

---

*Meeting overview — May 2026. For detailed lifecycle tables see FISCMAK_SYSTEM_MAP.md.*

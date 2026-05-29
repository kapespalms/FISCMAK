# FISCMAK Complete External Handoff

**Send this entire document** to OpenEvidence, a research-database AI, an academic collaborator, or any external system cross-referencing FISCMAK against physician career development research.

**Self-contained:** product intent, evidence model, implementation crosswalk, visibility rules, drift list, and full file inventories — no other repo files required.

**Repo:** `/Users/kristenpalmer/fiscmak`  
**Generated:** May 2026

---

## How to use (copy-paste workflow)

**Step 1.** Paste this entire file into the external AI.

**Step 2.** Append your research framework (4 layers, theory stack, instruments, visualizations, formulas, lifecycle data sources, citations).

**Step 3.** End with this instruction:

```text
Cross-reference FISCMAK (above) against my research framework (above).

For each research concept:
- Map to: component name, file path, DB table/field, user surface
- Status: built | partial | missing | drift
- Visibility: user | Mak-backend | institution
- Flag contradictions with north star, SDT anti-gamification, or surveillance ethics

Output filled crosswalk tables. Do not invent components not listed in this handoff.
Prioritize drift items in Section 10 and Section 0.3.
```

---

## Section 0 — Minimum context (read first)

### 0.1 Product in one paragraph

FISCMAK is **physician career intelligence**: it makes invisible work (teaching, mentorship, emotional labor) visible through conversational capture (Coach Mak), stores it as **confirmed evidence**, maps it on a **career lattice** (trainee ACGME heatmap or attending 8×8 identity portrait), interprets **patterns not scores**, and generates **promotion documents** from cited evidence. Institutions see **cohort aggregates only** — not individual Mak chat or psychometrics.

**Tagline:** Understand your career. **Category:** Not wellness-only, not job board, not generic chatbot.

### 0.2 Evidence unit (minimum schema)

Every professional fact in FISCMAK should be one evidence record:

| Field | Required | Values / notes |
|-------|----------|----------------|
| `what` | yes | Activity, instrument answer, CV line, rotation, publication, etc. |
| `where` | yes | Lattice cell, milestone subcompetency, or domain |
| `source` | yes | `mak` \| `cv` \| `schedule` \| `instrument` \| `manual` \| `institutional` |
| `status` | yes | `proposed` → `confirmed` \| `dismissed` |
| `time_class` | yes | `past` \| `current` \| `scheduled` (scheduled must not inflate counts) |
| `when` | yes | Date or reporting period |
| `confidence` | optional | Parser or self-report weight |
| `snippet` | optional | ≤500 chars for external export; no full CV by default |

**Storage today (partial unification):** `activity_entries`, `reconciliation_items`, `onboarding_metadata.instrument_answers`, `career_assessments.questions_answered`, `documents` + lattice parsers.  
**TypeScript schema:** `src/lib/v2/career-data-schema.ts`

### 0.3 Built vs drift (quick reference)

| Built | Partial / drift |
|-------|-----------------|
| PFI, BITS, UWES, PIF (Tagawa), invisible work, career aspirations instruments | `tier3_complete` can fire before instruments saved |
| 7-touchpoint conversational Q-bank | Mak context omits lattice + full evidence |
| CV upload, parse, enrichment, reconcile inbox | Lattice counts unconfirmed CV keywords |
| Activity capture via Mak | Three pipelines (CDI, lattice, Mak) not one API |
| Trainee ACGME milestone heatmap + MedHub import | Attending "Level 4" from CV verbs — not entrustment |
| Attending 8×8 lattice (ipsative intensity proxy) | Future rotations can inflate map |
| Cohort heatmap, pre-CCC, ILP (GME) | Output weak per-claim citations |
| Output Studio, promotion narrative | Domain scores still in sanitized health view |
| Internal metrics hidden (S-Index, IWQ, CRI) | CDI composite still computed for Mak |

### 0.4 Three-audience contract

| Audience | Gets | Never gets |
|----------|------|------------|
| **User** | Patterns, narratives, confirmed map, agency (plan, output) | CRI, S-Index, IWQ, headline composite %, peer rank |
| **Mak backend** | Full structured corpus; speaks in themes | Dumping internal scores in chat (unless user asks) |
| **Institution** | Cohort milestones, pre-CCC batch, aggregates (k-anonymity) | Mak transcripts, individual PFI, raw CV text, S-Index |

**Enforcement:** `src/lib/v2/profile-contract.ts`, `src/lib/v2/gme/gme-program-access.ts`

### 0.5 Research concepts to crosswalk

**Layers:** Signal · Interpretation · Career Lattice · Translation · Coach Mak

**Instruments:** Stanford PFI · BITS · invisible work · UWES-9 · PIF/Tagawa · career aspirations · 60-Q touchpoint bank · ACGME milestones

**Theories:** Cruess PIF · Wenger CoP · Kegan · JD-R · SDT (anti-gamification) · protean/boundaryless career · job crafting · psychological safety · programmatic assessment · CanMEDS · Shanafelt organizational drivers

**Visualizations:** milestone heatmap · 8×8 lattice · ePortfolio timeline · cohort heatmap · Sankey/network (planned) — **not** radar/spider (explicitly rejected ADR-001)

**Differentiation:** MedHub/New Innovations = GME compliance; Doximity = public profile; FISCMAK = private evidence corpus + Mak sensemaking + ipsative growth map

---

## Repo scale (May 2026)

| Category | Count |
|----------|------:|
| `src/lib/v2/**/*.ts` | 182 |
| `src/components/**/*.tsx` | 168 |
| `src/app/api/v1/**/route.ts` | 112 |
| Active V2 DB tables | ~49 core + career data vault |
| Docs markdown files | 40 |

---

## 1. North star (full product intent)

**One line:** Make invisible physician work visible, turn it into career intelligence, and give physicians agency over their trajectory — with Coach Mak as the guide, not the product.

### Founding intent

Brilliant physicians do work that never appears in advancement decisions: teaching without documentation, mentorship without recognition, emotional labor that sustains programs but stays invisible.

**Founding question:** What if every activity a physician logs becomes insight about their career trajectory?

### The name is the strategy

Pronounced **FIZ-MAK** (silent **C** = invisible work).

| Pillar | Meaning | Product job |
|--------|---------|-------------|
| **FISC** (treasury) | Hidden expertise, time, dedication | Capture and structure **evidence** |
| **Silent C** | Invisible, essential, unrecognized work | Surface what systems ignore |
| **MAK** (maximus) | Professional agency | Coach, plan, **generate outputs** |

### Core loop

```
Capture evidence → See the pattern → Understand trajectory → Act (plan + documents)
         ↑                                                    │
         └──────────── Coach Mak (continuous, remembering) ───┘
```

| Stage | User idea | Surfaces |
|-------|-----------|----------|
| Capture | Add what I do | Mak, Objective, onboarding |
| See | Map + vault show career shape | Objective (lattice, vault, reconcile) |
| Understand | What does this mean? | Insights, dashboard patterns |
| Act | Goals, paths, documents | Plan, Output |

### What we are / what we are not

| We are | We are not |
|--------|------------|
| Longitudinal career intelligence from everyday work | One-off chat or generic AI |
| Evidence-backed map and outputs | Keyword lattice with no user trust |
| Conversational capture (Mak), minimal forms | Long questionnaires as "assessment" |
| Physician agency | Institution surveillance of Mak chat |
| Trainee competency + attending portfolio growth | A single score that judges worth |

### Evidence foundation

**One evidence layer** every consumer reads: Capture → Extract & map → Review (reconcile) → Consume (lattice, Insights, Output, Mak).

1. **Provisional by default** — CV/schedule suggest; user confirms.
2. **Provenance always** — source, date, status, time class.
3. **Scheduled ≠ completed** — future work must not inflate counts.
4. **Levels are suggestions** — not ACGME entrustment unless labeled.
5. **Mak explains the map** — cited answer to "why is this cell hot?"

### Coach Mak

- One integrated coach across capture, interpretation, planning, documents
- Target: one thread + memory; instrument battery via conversation; output from **confirmed** evidence
- Anti-patterns: gate greeting wiping history; tier complete before data; context without lattice while UI shows hot cells

### Career map (lattice)

| Audience | Lens |
|----------|------|
| **Trainee** | ACGME subcompetency × time heatmap (criterion); growth overlay |
| **Attending** | 8×8 FISCMAK lattice — **ipsative** intensity (relative to self) |

Cell counts = **confirmed evidence** only. Parser alone is not production truth.

### Decision filter (ship test)

1. More invisible work visible?  
2. More career **understanding** (not just data)?  
3. More **agency**?  
4. Mak **remembers** — or new silo?  
5. Respects provisional → confirmed?

### Privacy line

Individual Mak conversations and private reflections are **not** institution-facing. Aggregates require opt-in and minimum group size.

**Canonical source:** `docs/NORTH_STAR.md`

---

## 1b. Page ownership (MECE)

Each page answers **one primary question**. Edit in one place; others read-only + link out.

| Zone | Route | Primary question | Owns | Never |
|------|-------|------------------|------|-------|
| Command center | `/app/dashboard` | Status + due now? | greeting, mini lattice, Mak entry, touchpoint strip | goal CRUD, uploads, forms |
| Perspective | `/app/subjective` | How am I subjectively? | wellbeing inputs, quarterly/annual input | pattern synthesis |
| Objective | `/app/objective` | What verified data? | lattice, vault, reconcile, activities, documents | insights narrative |
| Insights | `/app/assessment` | What does data mean? | career pattern, touchpoint status | forms, metric entry |
| Strategy | `/app/plan` | What am I toward? | goals, pathways, jobs | document generation |
| Output | `/app/output` | What documents? | templates, editor, export | raw data entry |
| Onboarding | `/app/onboarding` | First setup | tier1/2, instruments, documents | — |

**Objective sub-tabs:** Lattice | Vault | Reconcile | Activities | Documents

**Source:** `docs/page-ownership.md`

---

## 2. Research framework (target architecture)

Four layers from the FISCMAK conceptual paper:

| Layer | Research role |
|-------|---------------|
| **Signal** | Aggregate raw professional data: evaluations, RVUs, reflective entries, invisible work logs, instruments |
| **Interpretation** | Probabilistic pattern recognition: leadership emergence, burnout risk, identity themes — not single scores |
| **Career Lattice** | Multidimensional trajectories (not linear ladder); trainee milestone heatmap + attending 8×8 identity map |
| **Translation** | Tailored outputs: physician (reflective summaries, CV/promotion) + institution (workforce trends, cohort heatmaps) |

**Coach Mak:** AI-assisted professional sensemaking — not evaluator, not therapist.

**Primary theory anchors (research):**

| Theory | Research use |
|--------|--------------|
| Cruess PIF + Wenger CoP | Identity formation; communities of practice; reflective sensemaking |
| Kegan constructive-development | Developmental stage profile (Tagawa instrument) |
| JD-R | Demands/resources → burnout vs engagement patterns |
| SDT | Anti-gamification; autonomy, competence, relatedness |
| Protean / job crafting | Lattice > ladder; self-directed career reallocation |
| Psychological safety (Edmondson) | No surveillance; physician-owned data |
| Programmatic assessment (van der Vleuten) | Triangulation across methods — no single composite decision |
| CanMEDS / ACGME milestones | Domain map; trainee criterion-referenced views |
| Shanafelt organizational drivers | Institutional translation layer |

---

## 3. Four-layer crosswalk (implementation status)

| Research layer | Research concept | FISCMAK component | Primary paths / tables | Status | User | Mak | Institution |
|----------------|------------------|-------------------|------------------------|--------|------|-----|-------------|
| **Signal** | Stanford PFI | Instrument battery + scoring | `onboarding-instruments.ts`, `instrument-conversation-service.ts`; `app_users.onboarding_metadata.instrument_answers` | partial | Perspective summaries | themes + raw server-side | no |
| **Signal** | BITS (illegitimate tasks) | Same | `onboarding-instruments.ts` | partial | strain narrative | themes | no |
| **Signal** | Invisible work log | IWQ + taxonomy | `invisible-work-taxonomy.ts`, `invisible_work` instrument; `invisible_work_log` table | partial | Perspective | internal IWQ | no |
| **Signal** | UWES-9 engagement | Instrument | `onboarding-instruments.ts` | partial | engagement slice | themes | no |
| **Signal** | PIF / Kegan stage (Tagawa) | PIF clusters | `onboarding-instruments.ts` PIF_CLUSTERS | partial | none direct | indirect | no |
| **Signal** | Career aspirations | Instrument + goals | `onboarding-instruments.ts`, `goal-framework.ts` | built | Plan/Goals | yes | no |
| **Signal** | 60-Q touchpoint bank | Conversational assessment | `question-bank.ts`, `conversational-assessment-service.ts`; `career_assessments.questions_answered` | partial | Insights status | pending Q IDs | no |
| **Signal** | CV / document upload | Parse + enrichment | `document-upload.ts`, `lattice/document-parser.ts`, `api-enrichment.ts`; `documents` | built | Objective/Documents | count + excerpt | no raw text |
| **Signal** | Activity capture | Mak → activities | `activity-capture.ts`, `classify-chat-message.ts`; `activity_entries` | built | Objective/Activities | yes | aggregate only |
| **Signal** | Schedule / rotations | Block schedule evidence | `schedule-lattice-evidence.ts`, `programs/block-schedule.ts` | partial | Objective/Schedule | schedule memory | cohort schedule |
| **Signal** | ACGME milestones (trainee) | MedHub import + heatmap | `gme/medhub-*.ts`, `trainee-gme-data.ts`; `rotation_evaluations` | built | milestone heatmap | no | cohort heatmap |
| **Signal** | Reconciliation / provenance | Enrichment inbox | `reconcile-mak-flow.ts`, `reconciliation_items` | partial | Objective/Reconcile | reconcile flow | reconciled counts only |
| **Interpretation** | JD-R burnout pattern | Career health + wellbeing | `career-health-view.ts`, `internal-coaching-signals.ts` | partial | wellbeing narratives | themes | no |
| **Interpretation** | Career pattern synthesis | Insights page | `assessment-insights.ts`, `AssessmentInsightsWorkspace.tsx` | built | Insights | partial | no |
| **Interpretation** | Trajectory / ΔV | Trajectory state stub | `trajectory-state.ts` | missing | — | partial | no |
| **Interpretation** | Programmatic triangulation | Multiple pipelines | milestones + instruments + CV + touchpoints | drift | mixed | under-fed | partial GME |
| **Interpretation** | CDI composite | Weighted career health | `career-health-view.ts`, `cdi-weights.ts` | drift | domains still scored | used internally | no |
| **Career lattice** | Attending 8×8 ipsative map | Dual lattice | `lattice/aggregate.ts`, `DualLatticeGrid.tsx`, `LatticeView.tsx` | partial | Objective/Lattice | under-fed | no individual |
| **Career lattice** | Trainee milestone heatmap | ACGME subcomp × time | `TraineeMilestoneHeatmapCard.tsx`, `gme/reporting-periods.ts` | built | trainee surface | no | cohort |
| **Career lattice** | CanMEDS / 8 domains | Ontology registry | `lattice/ontology-registry.ts`, `ontology-bridge.ts` | built | map axes | partial | — |
| **Career lattice** | Development level | Keyword inference | `aggregate.ts` maxDevelopmentLevel | drift | shown | hidden | no |
| **Career lattice** | Relative intensity | count/max ipsative proxy | `aggregate.ts` applyRelativeIntensity | partial | yes | no | — |
| **Career lattice** | Energy overlay | energizing/draining counts | `aggregate.ts` | partial | cell detail | no | — |
| **Career lattice** | ePortfolio timeline | Portfolio templates | `career-portfolio-templates.ts`, `CareerPortfolioPanel.tsx` | partial | profile | no | no |
| **Career lattice** | Network graph (mentorship) | Board of directors stub | `BoardOfDirectorsPanel.tsx`, `career-board-mak-flow.ts` | missing | manual | flow exists | no |
| **Career lattice** | Sankey energy flow | — | — | missing | — | — | — |
| **Translation** | Promotion narrative | Output Studio | `output-generation.ts`, `promotion-narrative-sections.ts`, `OutputStudioWorkspace.tsx` | partial | Output | yes | user-shared only |
| **Translation** | Pre-CCC / ILP (GME) | Trainee + staff tools | `gme/pre-ccc-*.ts`, `PreCccSummaryPanel.tsx` | built | trainee | no | staff batch |
| **Translation** | Cohort heatmap | Institutional aggregate | `CohortHeatmapPanel.tsx`, `cohort-dashboard.ts` | built | own trainee view | no | yes |
| **Translation** | Workforce / retention intel | Pilot survey + aggregates | `programs/.../pilot-survey`, `kp-admin-tracking.ts` | partial | no | no | aggregate |
| **Coach Mak** | Reflective sensemaking | Chat orchestration | `chat/message/route.ts`, `mak-coaching-engine.ts` | partial | Mak panel | full thread | no |
| **Coach Mak** | Instrument battery via conversation | Instrument turns | `instrument-conversation-service.ts` | drift | blocked by tier3 bug | yes | no |
| **Coach Mak** | Memory / continuity | MemPalace | `mempalace_exports`, `mempalace-external.ts` | partial | — | yes | no |
| **Ethics** | Psychological safety | Privacy + confirm/dismiss | `profile-contract.ts`, `gme-program-access.ts` | partial | control exists | non-judgmental prompts | deny-list enforced |
| **Ethics** | Anti-surveillance | Institution boundary | `gme-program-access.ts` L6–19 | built | private Mak | — | aggregates only |

---

## 4. Theory → product crosswalk

| Theory | Research claim | Product rule | Implemented in | Status |
|--------|----------------|--------------|----------------|--------|
| **SDT** | No extrinsic gamification | No user-facing CRI/CHS/S-Index; ipsative lattice | `profile-contract.ts` INTERNAL_METRICS, `user-facing-analytics.ts` | drift — domain scores still exposed |
| **Cruess PIF** | Identity formation, not competency score | Mak-led reflection; lattice as identity portrait | `onboarding-instruments.ts` PIF, Mak flows | partial — PIF optional, not gated |
| **JD-R** | Separate demands from resources | PFI/BITS/invisible separate from portfolio domains | `career-health-view.ts` wellbeing_metrics | partial — still blended in CDI |
| **Protean career** | Self-directed, values-driven paths | Career aspirations, pivot flows, pathways | `non-traditional-career-mak-flow.ts`, `PathwaysExplorer.tsx` | built |
| **Job crafting** | Task/relational/cognitive crafting | Activity capture + energy valence | `activity-capture.ts`, lattice energy counts | partial |
| **Psychological safety** | No punitive surveillance | Mak private; institution deny-list | `gme-program-access.ts` | built (policy); drift (unconfirmed map) |
| **Programmatic assessment** | Triangulation, not one score | Multiple inputs → pattern matrix | scattered pipelines | drift — CDI composite exists |
| **Edmondson** | Safe interpersonal risk | Invitational coaching, escalation without HR auto-flag | `escalation-protocols.ts`, `mak-coaching-prompts.ts` | built |
| **Wenger CoP** | Legitimate peripheral participation | Trainee heatmap + milestone infrastructure | GME module | built for trainees |
| **Complex adaptive systems** | Probabilistic, emergent | North star “patterns not grades” | stated, not fully implemented | drift |

---

## 5. Validated instruments crosswalk

Deployed via `deployedInstruments()` in `onboarding-touchpoint1.ts`:

| Instrument ID | Research name | Items | Scoring | Storage | UI surface | Mak capture |
|---------------|---------------|------:|---------|---------|------------|-------------|
| `pfi` | Stanford Professional Fulfillment Index | 16 | `scorePfi()` — fulfillment/burnout/self-valuation means; burnout screen ≥1.33 | `onboarding_metadata.instrument_answers`, `instrument_scores` | Perspective wellbeing | `instrument-conversation-service.ts` |
| `bits` | Burden of Illegitimate Tasks | 8 | `scoreBits()` | same | Perspective strain | same |
| `career_aspirations` | Career aspirations / track energy | 10 | cluster means | same | Plan, dashboard prompt | same |
| `pif` | Tagawa PIF / Kegan-style stage | 15 | stage profile vector | same | none direct | same |
| `uwes` | Utrecht Work Engagement Scale-9 | 9 | engagement subscales | same | engagement slice | same |
| `invisible_work` | Invisible work hours | 5 | `scoreInvisibleWork()`, `computeIwq()` | same + `invisible_work_log` table | Perspective | same |
| `sop` | Scope of Practice (FM only) | 32 | SOP composite | same | conditional | same |

**Separate system — 7 touchpoint question bank:**

| System | File | Storage | Scoring |
|--------|------|---------|---------|
| 60 conversational questions (7 touchpoints) | `question-bank.ts` | `career_assessments.questions_answered` | `computeAssessmentScore()` Likert 1–5 → 0–100 |

---

## 6. Formula / scoring crosswalk

| Formula | File | Inputs | User-facing? | Research alignment |
|---------|------|--------|--------------|-------------------|
| **Career Health Score (CDI)** | `career-health-view.ts`, `cdi-weights.ts` | CV regex + PFI + aspirations + specialty weights | partial — domains[].score exposed via `sanitizeCareerHealthForUser()` | **drift** — research says no single composite |
| **CRI** | `formulas.ts` L15–25 | Assessment×0.4 + CV×0.3 + pathway×0.3 | no — `INTERNAL_METRICS` | internal only |
| **Assessment score** | `formulas.ts` L4–13 | Touchpoint Likert answers | indirect via touchpoints | OK for touchpoint rollup |
| **IWQ** | `onboarding-instruments.ts` `computeIwq()` | BITS + invisible work | no — internal | Mak themes only |
| **S-Index** | `cv-metrics.ts`, `kp-admin-tracking.ts` | CV keyword metrics | never | ADR-003 |
| **Job match %** | `formulas.ts` L37–67 | specialty, salary, location, growth | Plan/jobs | consider qualitative fit |
| **Lattice cell count** | `lattice/aggregate.ts` | CV snippets, activities, schedule, instruments | yes | **drift** if unconfirmed |
| **maxDevelopmentLevel** | `lattice/aggregate.ts` | CV keyword regex ("led", "taught") | cell detail | **drift** — not entrustment |
| **Relative intensity** | `lattice/aggregate.ts` | count/max per user | yes (color) | ipsative proxy — OK per ADR-002 Phase 1 |
| **Recognition gap** | `formulas.ts`, `assessment-insights.ts` | burnout touchpoint scores | stripped from user API | internal |

**Internal metrics never in user UI** (`profile-contract.ts`):

`career_health_score`, `career_readiness_index`, `s_index`, `iwq`, `coherence_score`, `internal_coaching_signals`, `recognition_gaps`, `cv_regex_metrics`, `cohort_individual_rank`

---

## 7. Visualization crosswalk

| Research visualization | Purpose | FISCMAK component | Path | Status |
|------------------------|---------|-------------------|------|--------|
| Radar / spie chart | Domain snapshot | **Explicitly rejected** ADR-001 | — | intentionally absent |
| Milestone heatmap | Trainee criterion view | `TraineeMilestoneHeatmapCard` | `src/components/gme/` | built |
| 8×8 lattice grid | Attending identity map | `DualLatticeGrid`, `LatticeView` | `src/components/lattice/`, `workspace/` | partial |
| Mini lattice | Dashboard orient | `MiniLattice` | `src/components/dashboard/` | built |
| Cohort heatmap | Institutional aggregate | `CohortHeatmapPanel` | `src/components/gme/` | built |
| ePortfolio timeline | Longitudinal record | `CareerPortfolioPanel`, portfolio templates | `src/components/profile/` | partial |
| Trajectory ribbons | Longitudinal identity shift | trainee longitudinal API | `trainee/milestones/longitudinal` | partial |
| Network graph | Mentorship relations | `BoardOfDirectorsPanel` | manual only | missing |
| Sankey | Energy/time flow across domains | — | — | missing |
| Evidence drawer | Workpaper → memo | `EvidenceDrawer`, `OutputStudioWorkspace` | `src/components/studio/` | partial |

---

## 8. Three-audience visibility contract

### User (physician)

| Allowed | Surfaces | Files |
|---------|----------|-------|
| Wellbeing narratives (no composite) | Dashboard, Perspective | `user-facing-analytics.ts`, `SubjectiveWorkspace.tsx` |
| Lattice map (ipsative) | Objective | `LatticeView.tsx` |
| Insights patterns | Assessment | `AssessmentInsightsWorkspace.tsx` |
| Goals, pathways, jobs | Plan | `GoalsWorkspace.tsx`, `PathwaysExplorer.tsx` |
| Documents / output | Output | `OutputStudioWorkspace.tsx` |
| Confirm/dismiss evidence | Objective/Reconcile | `CareerDataReconcilePanel.tsx` |

| Forbidden | Enforced by |
|-----------|-----------|
| CRI, S-Index, IWQ, coherence, recognition gaps | `sanitizeAssessmentInsightsForUser()`, `INTERNAL_METRICS` |
| Individual peer ranking | `profile-contract.ts` |
| Institution seeing Mak chat | privacy policy + RLS |

### Mak backend

| Allowed | Source |
|---------|--------|
| Full instrument raw scores | `onboarding_metadata` |
| Internal coaching signals | `internal-coaching-signals.ts`, `mak-coaching-engine.ts` |
| Chat history (last N turns) | `chat_messages`, `chat/message/route.ts` |
| MemPalace summary | `mempalace_exports` |
| Pending reconcile + instrument clusters | chat context block |

| Forbidden in user-facing chat output | Enforced by |
|--------------------------------------|-------------|
| S-Index, IWQ, numeric composites verbatim | `auditContextBlockForMetricLeakage()`, coaching prompt rules |

| Gap today | Target |
|-----------|--------|
| Lattice top cells + evidence IDs not in context | inject via `lattice-mak-context` helper |

### Institution (PD / GME / staff)

| Allowed | API / component |
|---------|-----------------|
| Cohort milestone heatmap | `GET .../cohort-heatmap`, `CohortHeatmapPanel` |
| Pre-CCC batch, ILP approval | `programs/.../pre-ccc`, staff surfaces |
| MedHub import | `programs/.../imports/medhub/sync` |
| Derived aggregates | `cohort-dashboard.ts`, `narrative-synthesis.ts` |

| Forbidden (explicit) | Source |
|---------------------|--------|
| `documents.extracted_text` | `gme-program-access.ts` |
| s_index, iwq, internal coaching | ADR-003, `kp-admin-tracking.ts` |
| `reconciliation_items`, `mempalace_exports` | user-scoped RLS |
| Individual Mak transcripts | not in GME API surface |

---

## 9. Page / surface map (MECE)

| Route | Primary question | Owns | Key components |
|-------|------------------|------|----------------|
| `/app/dashboard` | Status + due now? | orient, Mak entry | `DashboardWorkspace.tsx`, `MiniLattice`, `TouchpointProgressStrip` |
| `/app/subjective` | How am I doing subjectively? | wellbeing inputs | `SubjectiveWorkspace.tsx`, `QuarterlyPulsePanel`, `AnnualRefreshPanel` |
| `/app/objective` | What verified data do I have? | lattice, vault, reconcile, activities, documents | `ObjectiveWorkspace.tsx`, `LatticeView`, `CareerDataReconcilePanel` |
| `/app/assessment` | What does my data mean? | patterns, touchpoint status | `AssessmentInsightsWorkspace.tsx` |
| `/app/plan` | What am I working toward? | goals, pathways, jobs | `StrategyWorkspace.tsx`, `GoalsWorkspace.tsx`, `JobsWorkspace` |
| `/app/output` | What documents do I produce? | templates, editor, export | `OutputStudioWorkspace.tsx`, `StudioLexicalEditor` |
| `/app/onboarding` | First-time setup | tier1/2, instruments, documents | `Touchpoint1Onboarding.tsx`, `Tier2Onboarding.tsx` |
| `/app/kp-admin` | Dev/coordinator mirror | internal tracking | `KpAdminDashboard.tsx` |

**Source:** `docs/page-ownership.md`

---

## 10. Known implementation drift (bugs vs north star)

| Drift | Current behavior | Target | Key files |
|-------|------------------|--------|-----------|
| **Tier3 bypass** | `POST /api/v1/onboarding/compute` sets `tier3_complete: true` without instrument answers | Gate on `instrumentProgress()` complete | `onboarding/compute/route.ts`, `Touchpoint1Onboarding.tsx` |
| **Instrument step skip** | UI lists battery then "Go to dashboard" | Mak-led battery with progress | `Touchpoint1Onboarding.tsx`, `instrument-conversation-service.ts` |
| **Lattice unconfirmed** | CV keywords populate counts without reconcile | confirmed-only counts | `lattice/aggregate.ts`, `document-cache.ts` |
| **Level inflation** | "Level 4" from CV verbs | hide or label "suggested" | `lattice/aggregate.ts` |
| **Mak/map disconnect** | Mak lacks lattice context | cited evidence in context | `chat/message/route.ts` |
| **History silo** | Per-section chat, last 8 turns | one thread + memory | `chat/message/route.ts`, `AppShell.tsx` |
| **CDI in UI** | Domain scores still exposed | patterns + bands only | `user-facing-analytics.ts`, `career-health-view.ts` |
| **Output grounding** | Weak per-claim citations | evidence drawer per sentence | `output-generation.ts` |

---

## 11. Differentiation vs existing systems

| System | Role | FISCMAK difference |
|--------|------|-------------------|
| **MedHub / New Innovations** | GME compliance: evals, schedules, milestones | FISCMAK adds physician-owned career intelligence, invisible work capture, Mak sensemaking — integrates via import, does not replace |
| **Doximity** | Public professional profile + network | FISCMAK is private longitudinal record + evidence confirmation, not social marketing |
| **Wellness apps** | Episodic burnout screens | FISCMAK embeds PFI/BITS in career loop with portfolio + lattice + documents |
| **ePortfolio (MAINPORT)** | CPD documentation | FISCMAK combines ePortfolio timeline + AI coach + ipsative lattice + GME heatmap |

---

## 12. Architecture ADRs (summary)

From `docs/MVP_GME_BACKEND_SPEC.md`:

| ADR | Decision |
|-----|----------|
| **ADR-001** | Two-lattice model: trainees = ACGME milestone heatmap; attendings = 8×8 FISCMAK lattice. No radar plots. Graduation = narrow evidence seed, not unified 64-cell score. |
| **ADR-002** | Ipsative intensity for attendings (A, R, H, reflection depth, ΔV). Growth prompts, not deficiency framing. |
| **ADR-003** | S-Index, IWQ, internal coaching signals: never user- or institution-facing. |

---

## 13. Database tables (V2)

### Platform core (`docs/FISCMAK_V2_SCHEMA.sql`)

`app_users`, `career_assessments`, `documents`, `pathways`, `jobs`, `user_job_matches`, `mempalace_exports`, `user_settings`, `chat_messages`, `promotion_dossier`, `narrative_progress`

### Onboarding extensions

`app_users.onboarding_metadata` (JSONB): `instrument_answers`, `instrument_scores`, `instrument_ids`, reconciliation state

### Activity capture (`docs/migrations/20260522_activity_entries_v2.sql`)

`activity_entries` — Mak-captured activities → domain/track, energy, confidence

### Career data vault (`docs/migrations/20260521_career_data_schema.sql`)

**Identity:** `physicians`, `specialty_certifications`, `career_setting`, `identity_verification`  
**Scholarly:** `publications`, `grants`, `presentations`, `scholarly_metrics`  
**Clinical:** `clinical_productivity`, `scope_of_practice`, `compensation`  
**Service/education/invisible:** `service_activities`, `educational_activities`, `leadership_positions`, `invisible_work_log`, `invisible_work_questionnaire`  
**Wellbeing:** `wellbeing_assessments`, `professional_identity`, `career_aspirations`  
**Composites:** `career_development_index`, `invisible_work_quotient`, `lattice_positioning`, `benchmarking_snapshots`, `career_recommendations`, `career_documents`  
**Enrichment:** `api_enrichment_runs`, `reconciliation_items`

**TypeScript mirror:** `src/lib/v2/career-data-schema.ts`

### GME / programs

`programs`, `program_memberships`, `program_invite_tokens`, `rotation_evaluations`, `ilp_goals`, `in_training_exams`, `job_sources`

---

## 14. Key component registry (by domain)

### Signal / capture

| Component | Path |
|-----------|------|
| Instrument definitions + scoring | `src/lib/v2/onboarding-instruments.ts` |
| Instrument Mak turns | `src/lib/v2/instrument-conversation-service.ts` |
| Touchpoint question bank | `src/lib/v2/question-bank.ts` |
| Conversational assessment | `src/lib/v2/conversational-assessment-service.ts` |
| Activity capture | `src/lib/v2/activity-capture.ts` |
| CV parse | `src/lib/v2/lattice/document-parser.ts` |
| API enrichment | `src/lib/v2/api-enrichment.ts` |
| Reconcile flow | `src/lib/v2/reconcile-mak-flow.ts`, `reconcile-mak-helpers.ts` |
| Onboarding compute | `src/lib/v2/onboarding-compute.ts` |
| Onboarding UI | `src/components/onboarding/Touchpoint1Onboarding.tsx` |

### Interpretation

| Component | Path |
|-----------|------|
| Career health / CDI | `src/lib/v2/career-health-view.ts`, `cdi-weights.ts` |
| Assessment insights | `src/lib/v2/assessment-insights.ts` |
| Internal coaching signals | `src/lib/v2/internal-coaching-signals.ts` |
| Mak coaching engine | `src/lib/v2/mak-coaching-engine.ts`, `mak-coaching-prompts.ts` |
| Trajectory stub | `src/lib/v2/trajectory-state.ts` |
| User metric sanitization | `src/lib/v2/user-facing-analytics.ts` |

### Career lattice

| Component | Path |
|-----------|------|
| Lattice aggregation | `src/lib/v2/lattice/aggregate.ts` |
| Schedule evidence | `src/lib/v2/lattice/schedule-lattice-evidence.ts` |
| Profile/instrument evidence | `src/lib/v2/lattice/profile-lattice-evidence.ts` |
| Document cache | `src/lib/v2/lattice/document-cache.ts` |
| Ontology | `src/lib/v2/lattice/ontology-registry.ts`, `ontology-bridge.ts` |
| Lattice UI | `src/components/lattice/DualLatticeGrid.tsx`, `LatticeView.tsx` |
| Trainee heatmap | `src/components/gme/TraineeMilestoneHeatmapCard.tsx` |

### Translation / output

| Component | Path |
|-----------|------|
| Output generation | `src/lib/v2/output-generation.ts` |
| Promotion sections | `src/lib/v2/promotion-narrative-sections.ts` |
| Output UI | `src/components/workspace/OutputStudioWorkspace.tsx` |
| Evidence drawer | `src/components/studio/EvidenceDrawer.tsx` |
| Pre-CCC | `src/lib/v2/gme/pre-ccc-service.ts`, `PreCccSummaryPanel.tsx` |
| Cohort dashboard | `src/lib/v2/gme/cohort-dashboard.ts`, `CohortHeatmapPanel.tsx` |

### Coach Mak

| Component | Path |
|-----------|------|
| Chat API (orchestrator) | `src/app/api/v1/chat/message/route.ts` |
| Mak panel UI | `src/components/layout/MakPanel.tsx`, `mak/MakChat.tsx` |
| Mak flows (sample) | `quarterly-mak-flow.ts`, `annual-mak-flow.ts`, `goal-setting-mak-flow.ts`, `reconcile-mak-flow.ts`, `rotation-debrief-mak-flow.ts`, `non-traditional-career-mak-flow.ts` |
| MemPalace | `src/lib/v2/mempalace-external.ts`, `api/v1/mempalace/*` |
| State machine | `src/lib/v2/mak-state-machine.ts` |

### Institution / GME

| Component | Path |
|-----------|------|
| Program access boundary | `src/lib/v2/gme/gme-program-access.ts` |
| MedHub import | `src/lib/v2/gme/medhub-csv-import.ts`, `medhub-sync-client.ts` |
| Trainee evaluation framework | `src/lib/v2/gme/trainee-evaluation-framework.ts` |
| KP admin tracking | `src/lib/v2/kp-admin-tracking.ts`, `KpAdminDashboard.tsx` |
| Persona / surface gating | `src/lib/v2/profile-contract.ts`, `profile-persona.ts` |

---

## Appendix A — All documentation files

```
docs/COACH_MAK_CONVERSATION_EXAMPLES.md
docs/COMPLETE_BUILD_MANIFEST.md
docs/DEPLOY_PILOT.md
docs/FISCMAK_BRAND_IDENTITY_GUIDE.md
docs/FISCMAK_DESIGN_DECISIONS.md
docs/FISCMAK_IMPLEMENTATION_SUMMARY.md
docs/FISCMAK_POST_ONBOARDING_FLOW_PLAN.md
docs/FISCMAK_PRODUCT_REVIEW_MASTER.md
docs/FISCMAK_PROJECT_INVENTORY.md
docs/FISCMAK_REFINED_POSTLOGIN_FLOW.md
docs/FISCMAK_VISUAL_ARCHITECTURE_SPEC.md
docs/FIVE_OPTIONS_NAMING_CONVENTION.md
docs/MIGRATION_V1_TO_V2.md
docs/MVP_GME_BACKEND_SPEC.md
docs/MVP_PILOT_STATUS.md
docs/NORTH_STAR.md
docs/PLATFORM_STATUS.md
docs/SUPABASE_SETUP.md
docs/page-ownership.md
docs/canva-exports/README.md
docs/exports/all-function-components.md
docs/exports/marketing-landing-full-code.md
docs/exports/supabase-reference.md
docs/seeds/ABPN_CSV_V1_V2_MAPPING.md
docs/seeds/MEDHUB_FACULTY_GUIDE_MAPPING.md
docs/seeds/MEDHUB_GOALS_OBJECTIVES_EXAMPLES.md
docs/seeds/MEDHUB_PORTFOLIO_CSV_LINKED_EXAMPLE.md
docs/seeds/MEDHUB_PORTFOLIO_ENTRY_EXAMPLES.md
docs/seeds/MEDHUB_UH_EVAL_MAPPING.md
docs/seeds/MULTI_PROGRAM_SCHEDULE_ARCHITECTURE.md
docs/seeds/PILOT_RESIDENT_SETUP.md
docs/seeds/PSYCHIATRY_UH_SCHEDULE_INTEGRATION.md
docs/seeds/UH_ILP_TEMPLATE_MAPPING.md
docs/seeds/UH_INSTITUTIONAL_ONBOARDING_STAFF.md
docs/seeds/UH_PROGRAM_ARTIFACTS_INDEX.md
docs/seeds/UH_ROTATION_ORIENTATION_INDEX.md
docs/seeds/examples/README_CSV_EXAMPLES.md
docs/spec-v2/FISCMAK_API_Contract.md
docs/spec-v2/FISCMAK_Promotion_Integration.md
docs/spec-v2/FISCMAK_QUICK_REFERENCE.md
docs/FISCMAK_RESEARCH_CROSSWALK.md  (this file)
```

### SQL schema / migrations

```
docs/FISCMAK_V2_SCHEMA.sql
docs/FISCMAK_SUPABASE_SCHEMA.sql          (V1 deprecated)
docs/migrations/20260521_touchpoint1_onboarding.sql
docs/migrations/20260521_career_data_schema.sql
docs/migrations/20260522_activity_entries_v2.sql
docs/migrations/20260523_specialty_hierarchy.sql
docs/migrations/20260533_reconciliation_confidence.sql  (if present)
scripts/apply-supabase-migrations.mjs
```

---

## Appendix B — All `src/lib/v2/**/*.ts` files (182)

```
src/lib/v2/FISCMAKClassifier.ts
src/lib/v2/academic-core-document-templates.ts
src/lib/v2/academic-dossier-templates.ts
src/lib/v2/academic-profiles.ts
src/lib/v2/activity-capture.ts
src/lib/v2/annual-mak-flow.ts
src/lib/v2/annual-refresh.ts
src/lib/v2/api-enrichment.ts
src/lib/v2/api-helpers.ts
src/lib/v2/app-user-server.ts
src/lib/v2/assessment-insights.ts
src/lib/v2/career-alignment-tracking.ts
src/lib/v2/career-board-mak-flow.ts
src/lib/v2/career-board-models.ts
src/lib/v2/career-coaching-frameworks.ts
src/lib/v2/career-data-repo.ts
src/lib/v2/career-data-schema.ts
src/lib/v2/career-health-view.ts
src/lib/v2/career-language.ts
src/lib/v2/career-narrative-templates.ts
src/lib/v2/career-portfolio-templates.ts
src/lib/v2/career-recommendations.ts
src/lib/v2/career-vault.ts
src/lib/v2/cdi-weights.ts
src/lib/v2/chat-feedback-admin.ts
src/lib/v2/classifier-v2.ts
src/lib/v2/classify-chat-message.ts
src/lib/v2/coaching-cadence.ts
src/lib/v2/conversational-assessment-service.ts
src/lib/v2/conversational-assessment.ts
src/lib/v2/cover-letter-guide.ts
src/lib/v2/cover-letter-templates.ts
src/lib/v2/crisis-resources.ts
src/lib/v2/cv-metrics.ts
src/lib/v2/dashboard-architecture.ts
src/lib/v2/dashboard-data.ts
src/lib/v2/dashboard-mak-menu.ts
src/lib/v2/dashboard-redesign.ts
src/lib/v2/dashboard-snapshot.ts
src/lib/v2/db.ts
src/lib/v2/demo-store.ts
src/lib/v2/document-upload.ts
src/lib/v2/documents-mak-context.ts
src/lib/v2/documents-workspace.ts
src/lib/v2/early-attending-mak-flow.ts
src/lib/v2/engagement-tracking.ts
src/lib/v2/ensure-app-user.ts
src/lib/v2/escalation-protocols.ts
src/lib/v2/formulas.ts
src/lib/v2/free-classifier.ts
src/lib/v2/gme/acgme-specialty-registry.test.ts
src/lib/v2/gme/acgme-specialty-registry.ts
src/lib/v2/gme/cohort-dashboard-service.ts
src/lib/v2/gme/cohort-dashboard.ts
src/lib/v2/gme/gme-program-access.ts
src/lib/v2/gme/medhub-csv-import.ts
src/lib/v2/gme/medhub-milestone-map.ts
src/lib/v2/gme/medhub-sync-client.ts
src/lib/v2/gme/milestone-discrepancy.ts
src/lib/v2/gme/narrative-synthesis.ts
src/lib/v2/gme/pgy-milestone-benchmarks.ts
src/lib/v2/gme/pre-ccc-export.ts
src/lib/v2/gme/pre-ccc-service.ts
src/lib/v2/gme/pre-ccc-summary.ts
src/lib/v2/gme/prite-csv-import.ts
src/lib/v2/gme/reporting-periods.ts
src/lib/v2/gme/trainee-evaluation-framework.ts
src/lib/v2/gme/trainee-gme-data.ts
src/lib/v2/goal-archetype-templates.ts
src/lib/v2/goal-framework.ts
src/lib/v2/goal-milestone-actions.ts
src/lib/v2/goal-milestone-tracking.ts
src/lib/v2/goal-setting-mak-flow.ts
src/lib/v2/grow-exploration-mak-flow.ts
src/lib/v2/industry-career-templates.ts
src/lib/v2/instrument-conversation-prompts.ts
src/lib/v2/instrument-conversation-service.ts
src/lib/v2/internal-coaching-signals.ts
src/lib/v2/invisible-work-taxonomy.ts
src/lib/v2/job-ingestion.ts
src/lib/v2/kp-admin-tracking.ts
src/lib/v2/kp-admin.ts
src/lib/v2/lattice/activity-normalize.ts
src/lib/v2/lattice/aggregate.ts
src/lib/v2/lattice/cell-styles.ts
src/lib/v2/lattice/document-cache.ts
src/lib/v2/lattice/document-parser.ts
src/lib/v2/lattice/evidence-dedup.test.ts
src/lib/v2/lattice/evidence-dedup.ts
src/lib/v2/lattice/index.ts
src/lib/v2/lattice/invalidate-cache.ts
src/lib/v2/lattice/ontology-bridge.ts
src/lib/v2/lattice/ontology-registry.ts
src/lib/v2/lattice/profile-lattice-evidence.ts
src/lib/v2/lattice/schedule-lattice-evidence.ts
src/lib/v2/lattice/types.ts
src/lib/v2/mak-coaching-engine.ts
src/lib/v2/mak-coaching-prompts.ts
src/lib/v2/mak-conversation-models.ts
src/lib/v2/mak-state-machine.ts
src/lib/v2/mempalace-external.ts
src/lib/v2/mempalace-key-facts.ts
src/lib/v2/merge-cvs.ts
src/lib/v2/merge-flag-labels.ts
src/lib/v2/message-credits.ts
src/lib/v2/metric-decline-tracking.ts
src/lib/v2/non-traditional-career-mak-flow.ts
src/lib/v2/non-traditional-career-models.ts
src/lib/v2/notification-service.ts
src/lib/v2/npi-registry.ts
src/lib/v2/onboarding-compute.ts
src/lib/v2/onboarding-document-types.ts
src/lib/v2/onboarding-flow.ts
src/lib/v2/onboarding-instruments.ts
src/lib/v2/onboarding-options.ts
src/lib/v2/onboarding-path.ts
src/lib/v2/onboarding-touchpoint1.ts
src/lib/v2/output-generation.ts
src/lib/v2/output-user-templates.ts
src/lib/v2/personal-statement-templates.ts
src/lib/v2/profile-contract.ts
src/lib/v2/profile-persona.ts
src/lib/v2/profile-scenario-audit.ts
src/lib/v2/programs/blank-pathway.ts
src/lib/v2/programs/block-phase.ts
src/lib/v2/programs/block-schedule.ts
src/lib/v2/programs/call-schedule.ts
src/lib/v2/programs/elective-catalog.ts
src/lib/v2/programs/institution-brand.ts
src/lib/v2/programs/institutional-staff-directory.ts
src/lib/v2/programs/invite-tokens.ts
src/lib/v2/programs/program-clinical-guides.ts
src/lib/v2/programs/program-join-display.ts
src/lib/v2/programs/program-membership.ts
src/lib/v2/programs/registry.ts
src/lib/v2/programs/rotation-catalog.ts
src/lib/v2/programs/rotation-orientation.ts
src/lib/v2/programs/sync-program-membership.ts
src/lib/v2/programs/uh-education-manifest.ts
src/lib/v2/programs/uh-program-access-server.ts
src/lib/v2/programs/uh-program-access.ts
src/lib/v2/programs/uh-psych-enrichment-tracks.ts
src/lib/v2/programs/uh-residency-content.ts
src/lib/v2/promotion-narrative-sections.ts
src/lib/v2/quarterly-mak-flow.ts
src/lib/v2/quarterly-pulse.ts
src/lib/v2/question-bank.ts
src/lib/v2/reconcile-auto-confirm.test.ts
src/lib/v2/reconcile-auto-confirm.ts
src/lib/v2/reconcile-mak-flow.ts
src/lib/v2/reconcile-mak-helpers.ts
src/lib/v2/resume-content.ts
src/lib/v2/retired-surfaces.ts
src/lib/v2/rotation-debrief-mak-flow.ts
src/lib/v2/schedule-calendar/assignments.ts
src/lib/v2/schedule-calendar/colors.ts
src/lib/v2/schedule-calendar/event-expansion.ts
src/lib/v2/schedule-calendar/ics.ts
src/lib/v2/schedule-calendar/month-grid.ts
src/lib/v2/schedule-calendar/preferences-storage.ts
src/lib/v2/schedule-calendar/types.ts
src/lib/v2/schedule-mak-flow.ts
src/lib/v2/schedule-review-mak-flow.ts
src/lib/v2/section-mak-routes.ts
src/lib/v2/soap-tab-spec.ts
src/lib/v2/spec-table-inventory.ts
src/lib/v2/specialty-display-label.ts
src/lib/v2/specialty-hierarchy.ts
src/lib/v2/stripe-config.ts
src/lib/v2/touchpoint-cadence.ts
src/lib/v2/touchpoint-eligibility.ts
src/lib/v2/touchpoint-fetch.ts
src/lib/v2/touchpoint-mak-capture.ts
src/lib/v2/touchpoint-mak-orchestrator.ts
src/lib/v2/touchpoint-side-effects.ts
src/lib/v2/touchpoint-submit.ts
src/lib/v2/trainee-origin.ts
src/lib/v2/trajectory-state.ts
src/lib/v2/types.ts
src/lib/v2/uh-residency-mak-context.ts
src/lib/v2/user-facing-analytics.ts
src/lib/v2/voice-transcription.ts
```

---

## Appendix C — All API routes (`src/app/api/v1/**/route.ts`, 112)

```
src/app/api/v1/academic-documents/[documentId]/current/route.ts
src/app/api/v1/academic-documents/[documentId]/section/[sectionId]/save/route.ts
src/app/api/v1/academic-dossier/current/route.ts
src/app/api/v1/academic-dossier/item/[itemId]/save/route.ts
src/app/api/v1/activities/route.ts
src/app/api/v1/admin/kp-access/route.ts
src/app/api/v1/admin/program-invites/route.ts
src/app/api/v1/analytics/dashboard/route.ts
src/app/api/v1/assessments/[id]/answer/route.ts
src/app/api/v1/assessments/[id]/complete/route.ts
src/app/api/v1/assessments/current/route.ts
src/app/api/v1/assessments/history/route.ts
src/app/api/v1/assessments/insights/route.ts
src/app/api/v1/assessments/start/route.ts
src/app/api/v1/auth/login/route.ts
src/app/api/v1/auth/register/route.ts
src/app/api/v1/career-board/route.ts
src/app/api/v1/career-narrative/current/route.ts
src/app/api/v1/career-narrative/section/[sectionId]/save/route.ts
src/app/api/v1/career-portfolio/current/route.ts
src/app/api/v1/career-portfolio/item/[itemId]/save/route.ts
src/app/api/v1/chat/feedback/route.ts
src/app/api/v1/chat/history/route.ts
src/app/api/v1/chat/message/route.ts
src/app/api/v1/coaching/cadence/route.ts
src/app/api/v1/coaching/recommendations/route.ts
src/app/api/v1/contact/route.ts
src/app/api/v1/cover-letter/current/route.ts
src/app/api/v1/cover-letter/section/[sectionId]/save/route.ts
src/app/api/v1/documents/[documentId]/route.ts
src/app/api/v1/documents/draft/route.ts
src/app/api/v1/documents/merge-cvs/route.ts
src/app/api/v1/documents/route.ts
src/app/api/v1/enrichment/run/route.ts
src/app/api/v1/gme/evaluation-framework/route.ts
src/app/api/v1/gme/specialty-audit/route.ts
src/app/api/v1/goals/confirm/route.ts
src/app/api/v1/goals/milestone/route.ts
src/app/api/v1/goals/route.ts
src/app/api/v1/ilp-goals/route.ts
src/app/api/v1/industry-career/[documentType]/current/route.ts
src/app/api/v1/industry-career/[documentType]/section/[sectionId]/save/route.ts
src/app/api/v1/jobs/[id]/save/route.ts
src/app/api/v1/jobs/[id]/view/route.ts
src/app/api/v1/jobs/activate/route.ts
src/app/api/v1/jobs/matches/route.ts
src/app/api/v1/jobs/saved/route.ts
src/app/api/v1/jobs/sync/route.ts
src/app/api/v1/join/[token]/route.ts
src/app/api/v1/kp-admin/feedback/route.ts
src/app/api/v1/kp-admin/tracking/route.ts
src/app/api/v1/lattice/route.ts
src/app/api/v1/mempalace/context/route.ts
src/app/api/v1/mempalace/sync/route.ts
src/app/api/v1/notifications/digest/route.ts
src/app/api/v1/npi/route.ts
src/app/api/v1/npi/skip/route.ts
src/app/api/v1/npi/verify/route.ts
src/app/api/v1/onboarding/block-lookup/route.ts
src/app/api/v1/onboarding/compute/route.ts
src/app/api/v1/onboarding/path/route.ts
src/app/api/v1/onboarding/profile/route.ts
src/app/api/v1/onboarding/reconciliation/route.ts
src/app/api/v1/onboarding/schedule/export/route.ts
src/app/api/v1/onboarding/schedule/preferences/route.ts
src/app/api/v1/onboarding/schedule/route.ts
src/app/api/v1/onboarding/status/route.ts
src/app/api/v1/onboarding/tier1/career-stage/route.ts
src/app/api/v1/onboarding/tier1/specialty/route.ts
src/app/api/v1/onboarding/touchpoint1/route.ts
src/app/api/v1/output/generate/route.ts
src/app/api/v1/output/user-template/route.ts
src/app/api/v1/pathways/[id]/route.ts
src/app/api/v1/pathways/route.ts
src/app/api/v1/profile/avatar/route.ts
src/app/api/v1/programs/[programId]/cohort-heatmap/route.ts
src/app/api/v1/programs/[programId]/cohort/dashboard/route.ts
src/app/api/v1/programs/[programId]/exams/import/route.ts
src/app/api/v1/programs/[programId]/ilp/[goalId]/approve/route.ts
src/app/api/v1/programs/[programId]/imports/csv/route.ts
src/app/api/v1/programs/[programId]/imports/medhub/sync/route.ts
src/app/api/v1/programs/[programId]/imports/route.ts
src/app/api/v1/programs/[programId]/nlp/synthesize/route.ts
src/app/api/v1/programs/[programId]/pilot-survey/route.ts
src/app/api/v1/programs/[programId]/pre-ccc-cohort/route.ts
src/app/api/v1/programs/[programId]/pre-ccc/batch/route.ts
src/app/api/v1/programs/[programId]/residents/[userId]/ilp/route.ts
src/app/api/v1/programs/[programId]/residents/[userId]/pre-ccc/route.ts
src/app/api/v1/promotion/checklist/route.ts
src/app/api/v1/promotion/dossier/[id]/route.ts
src/app/api/v1/promotion/dossier/create/route.ts
src/app/api/v1/promotion/dossier/current/route.ts
src/app/api/v1/promotion/narrative/[sectionId]/save/route.ts
src/app/api/v1/promotion/readiness/route.ts
src/app/api/v1/rotation-entries/route.ts
src/app/api/v1/self/pre-ccc-summary/route.ts
src/app/api/v1/subscription/route.ts
src/app/api/v1/templates/route.ts
src/app/api/v1/touchpoints/annual/route.ts
src/app/api/v1/touchpoints/annual/session/route.ts
src/app/api/v1/touchpoints/quarterly/route.ts
src/app/api/v1/touchpoints/quarterly/session/route.ts
src/app/api/v1/trainee/ilp/[goalId]/route.ts
src/app/api/v1/trainee/ilp/draft-from-gaps/route.ts
src/app/api/v1/trainee/ilp/route.ts
src/app/api/v1/trainee/milestones/definitions/route.ts
src/app/api/v1/trainee/milestones/discrepancy/route.ts
src/app/api/v1/trainee/milestones/heatmap/route.ts
src/app/api/v1/trainee/milestones/longitudinal/route.ts
src/app/api/v1/trainee/milestones/self-ratings/route.ts
src/app/api/v1/users/me/route.ts
src/app/api/v1/voice/transcribe/route.ts
```

---

## Appendix D — React components (`src/components/**/*.tsx`, 168)

Grouped by folder:

**admin/** — `KpAdminDashboard`, `KpAdminFeedbackPanel`, `KpAdminGmePanel`, `KpAdminProgramInvitesPanel`, `KpAdminSettingsLink`

**auth/** — `AppleSignInButton`, `AuthGuard`, `GoogleSignInButton`, `MarketingAuthInput`

**brand/** — `CoachMakAvatar`, `CoachMakMark`, `CoachMakVoiceIcon`, `MakHexMicButton`, `NavIcon`, `SidebarDecoyIcon`

**calendar/** — `ScheduleCalendarView`, `ScheduleKey`

**dashboard/** — `CoachingCadencePanel`, `DashboardAlerts`, `DashboardDueNow`, `DashboardGoalsGrid`, `DashboardMakButton`, `DashboardWelcome`, `HealthScoreCard`, `MiniLattice`, `ProfileSummaryCard`, `ResidentScheduleCalendar`, `TouchpointProgressStrip`

**documents/** — `CvDraftWorkspace`, `ResumeBlockEditor`, `ResumePreview`

**gme/** — `CohortHeatmapPanel`, `MilestoneSelfRatingPanel`, `PreCccSummaryPanel`, `RotationLogPanel`, `TraineeMilestoneCard`, `TraineeMilestoneHeatmapCard`, `TraineePreCccCard`, `TraineeRotationLogCard`

**lattice/** — `DualLatticeGrid`, `LatticeCellDetailCard`, `LatticeGrid`

**layout/** — `AcademicSoapSectionGate`, `AnalyticsProvider`, `AppShell`, `CreditLimitModal`, `EscalationResourcesPanel`, `IconSidebar`, `MakMessageActions`, `MakPanel`, `MakPlusActionMenu`, `PageShell`, `SectionGateEntry`, `ThemeProvider`, `TopNavBar`, `WellnessResourcesSection`

**mak/** — `MakChat`, `MakMessageBubble`

**marketing/** — (28 landing/marketing components — see repo)

**onboarding/** — `CareerTrackRankingFields`, `DashboardRevealOverlay`, `GoalSettingPanel`, `InstitutionLabel`, `InstitutionalOnboardingWelcome`, `LayOfTheLandTour`, `OnboardingDocumentsStep`, `OnboardingGuard`, `OnboardingInterestsBlock`, `OnboardingPathSelect`, `OnboardingProfileSection`, `OnboardingWelcome`, `ProgramJoinHeadline`, `ProgramJoinSection`, `ReconciliationItemCard`, `RotationSelectFields`, `SpecialtyIntakeFields`, `SubspecialtyInterestsFields`, `Tier2Onboarding`, `Touchpoint1Onboarding`, `UhPsychEnrichmentTracksFields`

**profile/** — `AcademicDossierPanel`, `BoardOfDirectorsPanel`, `CareerPortfolioPanel`, `NpiRegistryPanel`, `ProfileMenu`, `UserAvatar`

**settings/** — `PremiumUpgradePanel`

**studio/** — `EvidenceChipNode`, `EvidenceDrawer`, `StudioLexicalEditor`, `VersionHistoryPanel`

**uh-psych/** — `CallScheduleView`, `CollapsibleSection`, `HubSearch`, `InstitutionalStaffDirectory`, `MakHelpChip`, `UhProgramGate`, `UhProgramServerGate`, `UhProgramUnauthorized`

**ui/** — `Badge`, `Button`, `Card`, `CardSection`, `EmptyState`, `Input`, `LoadingSteps`, `MakDiscussLink`, `MetricRow`, `ScoreDisplay`, `StatusChip`, `StatusIndicator`, `TechnicalDetailToggle`

**workspace/** — `AcademicCoreDocumentWizard`, `ActivitiesView`, `AnnualRefreshPanel`, `AssessmentInsightsWorkspace`, `CareerDataReconcilePanel`, `CareerDataVaultPanel`, `CareerNarrativeWizard`, `CareerStrategyGoalCard`, `CoverLetterWizard`, `DashboardWorkspace`, `DocumentsView`, `DocumentsWorkspace`, `EducationHubWorkspace`, `GoalsWorkspace`, `IndustryCareerWizard`, `JobsWorkspace`, `LatticeView`, `ObjectiveWorkspace`, `OutputStudioWorkspace`, `OutputUserTemplatePanel`, `PathwaysExplorer`, `PromotionNarrativeWizard`, `QuarterlyPulsePanel`, `ResidencyHubWorkspace`, `ResidencyRotationWorkspace`, `RotationsCatalogWorkspace`, `ScheduleCalendarWorkspace`, `StrategyWorkspace`, `SubjectiveWorkspace`, `retired/AssessmentInsightsCompositePanel`

Full paths: prefix each with `src/components/`

---

## Appendix E — App pages

```
src/app/page.tsx                                    /
src/app/login/page.tsx                              /login
src/app/signup/page.tsx                             /signup
src/app/app/page.tsx                                /app
src/app/app/dashboard/page.tsx                      /app/dashboard
src/app/app/subjective/page.tsx                     /app/subjective
src/app/app/objective/page.tsx                      /app/objective
src/app/app/assessment/page.tsx                     /app/assessment
src/app/app/plan/page.tsx                           /app/plan
src/app/app/output/page.tsx                         /app/output
src/app/app/profile/page.tsx                        /app/profile
src/app/app/settings/page.tsx                       /app/settings
src/app/app/onboarding/page.tsx                     /app/onboarding
src/app/app/onboarding/tier2/page.tsx               /app/onboarding/tier2
src/app/app/mak/page.tsx                            /app/mak (redirects)
src/app/app/goals/page.tsx                          legacy → plan
src/app/app/jobs/page.tsx                           legacy → plan
src/app/app/studio/page.tsx                         legacy → output
src/app/app/lattice/page.tsx                        legacy → objective
src/app/app/activities/page.tsx                     legacy → objective
src/app/app/documents/page.tsx                      legacy → objective
```

---

---

## Appendix F — Research framework template (fill by external AI)

Paste your framework above this section, or ask the AI to populate:

| Research layer | Concept | Fiscmak mapping | Status | User | Mak | Institution |
|----------------|---------|-----------------|--------|------|-----|-------------|
| Signal | | | | | | |
| Interpretation | | | | | | |
| Career Lattice | | | | | | |
| Translation | | | | | | |
| Coach Mak | | | | | | |

---

**End of handoff.** Append your research framework text after this document, then run the instruction in "How to use" above. No other FISCMAK files required for cross-reference.

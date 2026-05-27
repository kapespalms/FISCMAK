# FISCMAK Backend Changes — GME Pivot (All Physicians + Psychiatry First)

**Status:** Planning spec (not implemented)  
**Branch target:** `cursor/mvp-app-foundation` → GME feature branch  
**Companion:** `fiscmak-admin/server.js` (MedHub ingest rail)

---

## Executive summary

The backend pivot adds **three layers** without replacing the existing physician product:

| Layer | Who | What changes |
|-------|-----|--------------|
| **A. Platform** | All users | Roles, evidence tiers, content packs by `career_stage`, internal vs user metrics |
| **B. Trainee (resident/fellow)** | Residents, fellows, med students | ACGME **subcompetency × time** milestone heatmap (not 8×8); ILP, CCC prep, MedHub import |
| **C. Institutional (PD/GME)** | Program directors, coordinators, CCC | Program tenant, cohort milestone heatmap, pre-CCC summaries |

**Psychiatry first:** Seed ACGME Psychiatry Milestones 2.0 (21 subcompetencies in official PDF; 14 on UH MedHub outpatient form), PRITE, psych rotation taxonomy, and MedHub field mappings from `fiscmak-admin` psychiatry competency list.

---

## Trainee evaluation framework (residents & fellows)

**Hierarchy (not a single grid size for all programs):**

| Layer | Scope | Source |
|-------|--------|--------|
| **Universal 6** | All trainees | ACGME core competencies (`docs/seeds/acgme/universal_core_competencies.json`) |
| **Specialty milestones** | Per primary specialty | ACGME Milestones 2.0 seeds (e.g. psychiatry 21 subcompetencies) |
| **Fellowship subspecialty** | Fellows | Appendix B subspecialty program + form-specific eval crosswalk on import |

**Onboarding:** All **40 ACGME Appendix B primary specialties** (2024–2025 Data Resource Book) are selectable for residents. Fellows must select an ACGME-mapped fellowship subspecialty under their primary.

**Code:**
- Registry: `src/lib/v2/gme/acgme-specialty-registry.ts` + `docs/seeds/acgme/appendix_b_2024_2025.json`
- Resolver: `src/lib/v2/gme/trainee-evaluation-framework.ts`
- Audit API: `GET /api/v1/gme/specialty-audit` (gaps visible to KP admin)
- User framework: `GET /api/v1/gme/evaluation-framework`
- CLI: `node scripts/audit-acgme-onboarding.mjs`

**Note:** Psychiatry is **not** 4×12 or 4×14 — UH MedHub outpatient forms use **14 milestone rows**; the full ACGME Psychiatry Milestones 2.0 set is **21 subcompetencies**. Other specialties remain **universal six only** until their milestone JSON seeds are added.

---

## Architecture decision: Two-lattice model (ADR-001)

**Status:** Accepted (evidence review, May 2026)  
**Decision:** Residents/fellows and attendings use **different visualization and assessment systems**. They connect at graduation through a **narrow, evidence-tagged seed** — not a unified 64-cell competency score.

### Why two systems

| | **Trainee lattice (System 1)** | **Attending lattice (System 2)** |
|--|-------------------------------|----------------------------------|
| **Question** | Is this learner developing toward entrustment? | Where is my career concentrated, and does it match my stated track? |
| **Framework** | ACGME Milestones 2.0 (6 domains → subcompetencies) | FISCMAK 8 skill domains × 8 career tracks |
| **Driver** | CCC synthesis (external, mandatory, semiannual) | Portfolio + activity capture + optional institutional data |
| **Stakes** | Formative + summative (advancement, graduation) | Primarily formative; summative only at promotion |
| **Evidence** | Strong — mandated GME infrastructure | Taxonomy strong; **64-cell 0–5 scoring unvalidated** |

ACGME milestones end at graduation (Nasca et al.). Attending practice requires career navigation, context, and track differentiation (CanMEDS, AAMC PCRS, Bacchus attending-work observation) that the 6 ACGME trainee domains alone do not capture. **Do not extend the trainee heat map into an 8×8 for residents.**

### System 1 — Trainee milestone heatmap (not 8×8, not radar)

**Structure:**

```
Rows:    subcompetencies (~15–31 by specialty)
         • 4 harmonized domains (ICS, PBLI, PROF, SBP) — identical across specialties
         • + Patient Care & Medical Knowledge — specialty-specific
Columns: semiannual CCC reporting periods (6–10 residency + 2–6 fellowship)
Cells:   milestone level 1–5; color vs expected-for-PGY benchmark (criterion channel)
Overlay: discrepancy flags (imported vs self vs external)
         + ipsative growth indicators (velocity vs own prior periods — ADR-002)
```

**Visualization:** rectangular **subcompetency × time heatmap** only. **No radar/spider plots** — order sensitivity, equal-weight assumption, and mixed clinician interpretability (Stafoggia, Allwood) outweigh marginal CCC-meeting utility; Harrington surgery evidence does not generalize to psychiatry or multi-specialty product scope.

**Three data layers (trainee):**

| Layer | Source | Tier | Rule |
|-------|--------|------|------|
| A — Structured import | MedHub/CSV, PRITE, procedure logs, WebADS | 1 | Pre-populates cells |
| B — Workplace assessment | Faculty evals, EPA entrustment, multisource feedback | 1–2 | Feeds discrepancy view |
| C — Informed self-rating | Resident reviews anchors, adjusts where data incomplete | 3 | **Never sets final cell alone** (Davis et al.) |

CCC consensus remains the authoritative synthesis (Ekpenyong weighting: rotation ratings 37%, narratives 27%). NLP on narratives extracts themes; **never auto-assigns milestone levels**.

**Psychiatry pilot rows:** 21 subcompetencies (seed); 14 map to UH MedHub outpatient form via crosswalk.

### System 2 — Attending 8×8 FISCMAK lattice

**Purpose:** Career **growth mirror** — where professional energy flows and how it changes over time. Not developmental milestone assessment and not norm-referenced ranking by default (ADR-002).

**Primary visualization:** **ipsative intensity** — cell color depth = engagement density relative to the physician's **own** lattice (artifact count, recency, reflection depth, logged hours, Mak conversation tags, growth velocity). Bright ≠ "good"; dim ≠ "bad". A focused clinician with a bright Clinician row and dim Researcher row is a valid identity portrait.

**Secondary overlay (optional toggle):** energy/fulfillment valence (energizing vs draining) from activity capture — answers "of what I do, what fuels vs drains me?"

**What the 8×8 shows today (`lattice.ts`):** activity count + energy valence per cell — **Phase 1 ipsative inputs**. Full intensity algorithm and ΔV engine are ADR-002 backlog.

**What the 8×8 must not claim (evidence limits):**

- Universal 0–5 scoring across all 64 cells (384 data points) — **no psychometric validation**
- Norm-referenced peer ranking as the **default** view (Ryan et al.: CBME trapped in norm-referenced world for selection)
- NLP-from-CV as primary population without human validation (Dias et al.)
- Composite fitness/coherence indices — **retired** from user flows (Career Health, user-facing s-index, recognition gaps)
- Absolute self-assessment of competence level (Davis et al.) — ipsative **activity tracking** is allowed; "how good am I?" prompts are not

**Three data layers (attending):**

| Layer | Role |
|-------|------|
| 1 — Extracted | CV/dossier/institutional metrics where verifiable (publications, grants, MOC, teaching evals) |
| 2 — Calibrated self | User reviews pre-populated cells against explicit track×domain anchors; discrepancies flagged |
| 3 — External | Promotion committee, 360°, learner evals, CAHPS — where institution provides |

**Skill domain evidence tier (FISCMAK columns):**

| Domains | Evidence |
|---------|----------|
| 1–5 (Clinical, Communication, Professionalism, Systems, Scholarship) | Consensus — standalone in ACGME, AAMC PCRS, CanMEDS |
| 6 (Collaboration/Teamwork) | Supported; embedded in ACGME (weaker independent validation) |
| 7 (Leadership/Management) | CanMEDS role + leadership literature; not standalone ACGME/AAMC domain |
| 8 (Personal/Professional Development) | Weakest cross-framework support; organizational priority > individual competency metric |

**Career track evidence tier (FISCMAK rows):**

| Tracks | Product treatment |
|--------|-----------------|
| Clinician, Educator, Researcher | **Core** — full UI, portfolio tools, promotion crosswalks |
| Administrator/Leader, Advocate | **Supported** — lighter instrumentation |
| Innovator, Quality/Safety, Wellness Champion | **Emerging** — visible, labeled exploratory; no pseudo-precision scoring |

**Consolidation:** "Innovator" and "Innovation/Entrepreneurship" are one track with optional sub-tags — not two parallel rows.

**Methodological caveat:** AAMC PCRS partially derives from ACGME; true independent convergent validation is CanMEDS + supplementary frameworks (Ogden, Epstein & Hundert), not triple-counting ACGME + PCRS + ACGME-derived lists.

### Handoff at graduation (trainee → attending)

Carraccio/Ten Cate three-layer competence model:

1. **Canonical** (board exams) — least dynamic post-training  
2. **Contextual** (milestones, EPAs) — dominant in training; **trainee heatmap**  
3. **Personalized** (career differentiation) — dominant in practice; **8×8 lattice**

**Seed rules (narrow — do not over-map):**

| At graduation | Attending lattice action |
|---------------|-------------------------|
| Final PC/MK milestone profile | Seed **Clinician × Clinical Expertise** band only (ACGME L4 ≈ FISCMAK L3 "competent for independent practice", not L4 "proficient/leading") |
| Final harmonized domain levels (ICS, PBLI, PROF, SBP) | Map to corresponding FISCMAK skill columns on **Clinician row** |
| EPAs entrusted in training | Metadata + Clinician-track hints; dynamic EPA portfolio in career data (Ten Cate & Carraccio) |
| Collaboration, Leadership columns | Start lower — underrepresented in ACGME trainee framework (Englander PCRS rationale) |
| Educator / Researcher / Admin rows | **Empty until post-training evidence** — do not infer from trainee milestones |

Gray et al. (JAMA 2024) supports carrying forward trainee assessment data (predictive for outcomes); FISCMAK stores final milestone snapshot in `onboarding_metadata.evaluation_framework` and `graduation_milestone_snapshot` (planned) for seeding — not discarding at the training cliff.

### Content-pack routing

| `content_pack` | Objective primary view | Hidden |
|----------------|------------------------|--------|
| `trainee` | Milestone heatmap (subcompetency × time) | 8×8 career lattice as competency instrument |
| `early_attending`, `mid_career`, `default` | 8×8 activity/portfolio lattice | Milestone heatmap (unless faculty role with trainee access) |

### Phased implementation (evidence-aligned)

| Tier | Scope | Population |
|------|-------|------------|
| **1** | Subcompetency × time heatmap from imported CCC/MedHub + discrepancy overlay | Trainee (UH psych pilot) |
| **2** | Longitudinal trajectory vs PGY benchmarks; cohort heatmap for PD | Trainee + institutional |
| **3** | NLP theme extraction from narratives → subcompetency tags (no auto-levels) | Institutional |
| **4** | Attending 8×8 **ipsative intensity** + energy overlay; opt-in peer context for promotion | Attending |
| **5** | Growth velocity (ΔV) engine → Mak coaching prompts; adaptive nudge frequency | All (Mak) |
| **6** | Rasch/G-theory validation study if criterion attending scores ever pursued | Research — not product default |

Each heatmap cell links to an **action**, not just color: green → reinforce/mentor; yellow → ILP target; red → remediation path; discrepancy → coached reflection or CCC review.

### Explicit non-goals

- Radar/spider plots for trainee or attending competency views  
- 8×8 grid for residents/fellows as competency assessment  
- Auto-populated 0–5 scores across all 64 attending cells  
- User-facing composite indices (Career Health, coherence, CV s-index, recognition gaps)  
- **S-Index / Service Citizenship** in any user API, UI, or Mak prompt — **KP Admin tracking only** (`GET /api/v1/kp-admin/tracking`)
- Wellness assessed as a scored competency domain (organizational support ≠ individual metric)
- Surveillance framing — learning analytics must support development, not monitoring (Thoma et al.)

---

## Architecture decision: Ipsative intensity & growth velocity (ADR-002)

**Status:** Accepted (evidence review, May 2026)  
**Decision:** Transform the lattice from an **assessment** metaphor to a **growth** metaphor by deploying **different referencing frameworks by career stage**. Intensity is **self-referenced** for attendings; trainees retain **criterion-referenced** milestone color with an **ipsative growth overlay**.

### Three referencing frameworks (when each applies)

| Framework | Question | Primary use in FISCMAK |
|-----------|----------|------------------------|
| **Norm-referenced** | How do I compare to peers? | **Opt-in only** (attending promotion prep); never default |
| **Criterion-referenced** | Have I met an external standard? | **Trainee milestone heatmap** (ACGME 1–5 vs PGY benchmark) |
| **Ipsative / self-referenced** | How have I changed vs my own baseline? | **Attending lattice intensity**; **trainee growth overlay** |

Ryan et al. (2023): medical education remains norm-referenced for selection stratification despite CBME's criterion intent. FISCMAK breaks the trap for **attending career development** by defaulting to ipsative display. Trainees still need criterion color for CCC accountability.

### Trainees: criterion primary + ipsative overlay (dual channel)

**Channel A (primary):** subcompetency cell fill = milestone level vs expected-for-PGY (unchanged from ADR-001).

**Channel B (overlay):** growth indicator per cell — rate of change vs the trainee's **own prior periods**, not vs peers.

| Ipsative signal | Source | Example |
|-----------------|--------|---------|
| Milestone velocity | Δ level over semiannual periods | L1→L3 in 6 mo vs flat at L3 for 18 mo |
| Reflection density | AI-guided reflections tagged to subcompetency | Increasing QI reflections in SBP cells |
| Activity emergence | Logged teaching, committee, mentoring → crosswalk hints | Educator-adjacent growth before formal eval catches it |
| Conversation complexity | Mak NLP tags (Tier 3) | Reasoning depth shift in PC-tagged threads |

Two residents both at Milestone Level 3 in Patient Care can show **different overlay glyphs**: accelerating vs plateau. CCC and coaches use overlay for **coaching**, not advancement decisions alone (Cooper & Holmboe 2025; Richardson growth mindset).

**Rule:** ipsative overlay **never overrides** criterion milestone color for summative CCC reporting.

### Attendings: purely ipsative intensity (default view)

No accreditation body defines "Level 4 Innovator × Leadership" for a mid-career hospitalist. The meaningful question is: **"Am I growing in directions I care about?"** (Triola & Burk-Rafel precision medical education; Drake SDT framing).

**Intensity inputs (all self-normalized to physician's own max across cells):**

| Input | Symbol | Notes |
|-------|--------|-------|
| Artifact count | A | Reflections, portfolio items, logged activities |
| Recency | R | Exponential decay from last activity |
| Hours logged | H | Visible + uncompensated time (Mannix-style internal weighting; **not** user-facing "s-index" branding) |
| Reflection depth | — | NLP complexity tier (Tier 3); human-readable, not competence score |
| Mak engagement | — | Conversation frequency/depth tagged to cell |
| Growth velocity | ΔV | Rate of change in A, R, H over rolling window |

**Self-referenced intensity (conceptual):**

```
I_cell = w1·(A_cell / A_max_self) + w2·(R_cell / R_max_self) + w3·(H_cell / H_max_self) + w4·ΔV_cell
```

- `A_max_self`, `R_max_self`, `H_max_self` = physician's own max across all 64 cells  
- Weights `w1–w4` = sensible defaults; physician-adjustable  
- **Brightest cell = their most engaged area**; others scale relative to it  

This sidesteps Davis et al.'s absolute self-assessment problem: the system tracks **what they do**, not "how good they rate themselves."

**Dynamic baseline:**

| Phase | Behavior |
|-------|----------|
| **T₀** | CV/doc parse + initial activities establish first baseline at lattice creation |
| **Rolling** | Recalculate every 6–12 mo vs 24-month window — dormant cells fade (competence as habit, Epstein & Hundert) |
| **Reset** | User-initiated at promotion, role change, sabbatical — new T₀ for next career phase |

**Opt-in peer context (promotion / curiosity only):**

Descriptive, not evaluative: *"Educator track intensity ~60th percentile for associate professors in your specialty"* — toggle off by default. Never *"you should do more research."*

### Growth velocity engine (ΔV) → Mak coaching

Detect **five trajectory states** per cell (Park GMM / Donner & Hardy piecewise learning curves):

| State | Signature | Mak prompt type |
|-------|-----------|-----------------|
| **Acceleration** | Positive slope increasing | Momentum — "what's driving this?" |
| **Steady growth** | Positive constant slope | Acknowledgment |
| **Plateau** | Near-zero slope after prior growth | Exploration — cross-ref **energy overlay**: mastery (gold) vs ceiling (gray) vs stagnation (purple) |
| **Transition dip** | Brief drop then recovery | Normalization — role transition, not failure |
| **Sustained decline** | Negative slope ≥2 periods | Wellness/alignment explore — non-judgmental; not diagnostic |

**Prompt delivery (nudge science):**

- **Synchronous:** woven into Mak when user mentions a cell with active trajectory  
- **Asynchronous:** opt-in lattice digest (weekly/monthly); adaptive frequency to avoid alert fatigue  
- **Framing:** observation + invitation, never directive (Atkinson feedback/coaching; Neufeld autonomous growth)  
- **Feedback loop:** engage / dismiss / correct intention / ignore → retrain prompt timing and classification  

**Wellness alerts:** sustained decline + draining energy → exploratory prompt only; **not** automated HR flagging without explicit institutional policy (Thoma dystopian guardrail).

**Coaching narrative output:** longitudinal story of inflection points for promotion dossier *reflection section* — Tier 3, physician-edited; never auto-submitted as competence evidence.

### Visual language (attending)

| Pattern | Meaning (ipsative) |
|---------|-------------------|
| Bright Clinician row, dim others | Focused clinician identity |
| Educator row brightening, Researcher fading | Clinician→clinician-educator transition |
| Many rows moderate + Wellness×Personal purple | Spread + drain — sustainability question |
| High H in cells, low formal portfolio | Invisible work made visible |

Energy overlay remains **orthogonal** to intensity: intensity = *where time goes*; energy = *how it feels*.

### Planned services

| Service | Role |
|---------|------|
| `src/lib/v2/lattice-intensity.ts` | Self-normalized I_cell; rolling baseline |
| `src/lib/v2/lattice-velocity.ts` | ΔV trajectory classification (5 states) |
| `src/lib/v2/mak-coaching-prompts.ts` | Prompt templates + nudge queue |
| `lattice_cells` / snapshots | Store intensity + velocity per cell per period |

### ADR-002 non-goals

- Default peer ranking or leaderboard views  
- Ipsative overlay replacing CCC criterion color for trainees  
- Automated burnout diagnosis or HR escalation from lattice patterns  
- User-facing composite scores derived from intensity (no new "Career Health")  
- Presenting intensity as competence level or promotion readiness score  

---

## Architecture decision: Invisible S-Index (ADR-003)

**Status:** Accepted (evidence review, May 2026)  
**Decision:** S-Index (CV-regex service citizenship) is **never user-facing or institution-facing**. It operates as a **silent Mak coaching input** only. Visible to **KP Admin dev console** for formula review during build.

### Rationale

- **Invisibility work:** Making s-index visible may cause physicians to hide uncompensated work from the system (Petersson & Backman; Barnard et al.).
- **Trust:** Passive analytics are ethical when they serve the user without surveillance burden (Maher et al.; Ten Cate learning analytics caveats).
- **Self-assessment failure:** Davis et al. applies to absolute competence ratings — not to silent activity-informed coaching questions.

### Data flow

```
CV + activities + pulses
        ↓
computeInternalCoachingSignals()  [server only]
        ↓
buildMakDiscrepancyCoachingHints() → Mak system context (questions, never scores)
        ↓
Physician experiences attuned coaching — never sees S-Index
```

### What uses S-Index internally

| Consumer | Use |
|----------|-----|
| **Mak chat** | Escalation ladder + 5 nudge techniques (reflective mirror, portfolio gap, energy alignment, peer narrative, Socratic trajectory) |
| **Burnout modeling** | Weight wellness prompts when elevated invisible load + draining energy |
| **KP Admin** | `/api/v1/kp-admin/tracking` — founder dev mirror only |

### What does NOT use S-Index

| Surface | Rule |
|---------|------|
| User UI / APIs | Never |
| Institution / PD dashboards | Never |
| 8×8 lattice intensity (ADR-002) | Visible artifacts + energy only — not s-index |
| Promotion narratives auto-gen | No "invisible work summary" from s-index |
| Peer benchmarking | Never |
| MemPalace external sync | Stripped via `sanitizeMemPalaceKeyFacts()` |

### Mak boundaries (absolute)

- Never name S-Index, IWQ, or Service Citizenship to the physician  
- Never say they do "too much" invisible work  
- Never share signals with institutions  
- Never use for evaluative / promotion decisions  

### Privacy copy (onboarding / policy)

*"Your interactions with Coach Mak personalize your coaching experience. Aggregate, anonymized patterns may improve the platform. Internal signals are not shared with your institution and are not displayed as scores."*

### Services

| File | Role |
|------|------|
| `internal-coaching-signals.ts` | Compute signals + metadata bands |
| `mak-coaching-prompts.ts` | Discrepancy hints + context formatter |
| `mak-coaching-engine.ts` | Bundle for chat + KP admin |
| `mempalace-key-facts.ts` | Strip metrics before external sync |

---

## A. Cross-cutting platform changes (all physicians)

### A1. Role-based access control (RBAC)

**Today:** Single `app_users` row per auth user; no program affiliation.

**Add:**

```sql
-- New enum-like checks via TEXT + CHECK
CREATE TABLE programs (
  program_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_name TEXT NOT NULL,
  program_name TEXT NOT NULL,
  specialty TEXT NOT NULL,              -- 'Psychiatry' first
  acgme_program_code TEXT,
  medhub_institution TEXT,
  medhub_program_id INTEGER,
  medhub_client_id_encrypted TEXT,      -- use ENCRYPTION_KEY from admin server
  medhub_private_key_encrypted TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE program_memberships (
  membership_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(program_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES app_users(user_id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN (
    'trainee',           -- resident/fellow/med student in program
    'program_director',
    'ccc_chair',
    'program_coordinator',
    'faculty_mentor',
    'dio_viewer'         -- institution read-only
  )),
  pgy_level TEXT,                      -- 'PGY-1'..'PGY-4', 'PGY-5+', NULL for faculty
  training_track TEXT,                 -- 'categorical', 'research', 'combined', etc.
  cohort_start_date DATE,
  active BOOLEAN DEFAULT true,
  UNIQUE (program_id, user_id)
);
```

**API middleware:** `requireProgramRole(programId, roles[])` on all `/api/v1/programs/*` routes.

**`app_users` extensions (all physicians):**

```sql
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS content_pack TEXT
  CHECK (content_pack IN ('trainee', 'early_attending', 'mid_career', 'default'));
-- Derived on write from career_stage + program membership
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS pgy_level TEXT;
ALTER TABLE app_users ADD COLUMN IF NOT EXISTS primary_program_id UUID REFERENCES programs(program_id);
```

**Content pack routing:** One codebase; `content_pack` drives onboarding steps, document templates, lattice mapping, and Mak system prompts.

---

### A2. Evidence tier enforcement (backend)

**Today:** Formulas (CRI, CDI, career health) leak into dashboard APIs and Mak context.

**Add:**

```sql
CREATE TABLE internal_user_metrics (
  metric_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_users(user_id) ON DELETE CASCADE,
  metric_key TEXT NOT NULL,   -- 'cri', 'cdi', 'iwq', 'career_health_score', 'job_match_pct'
  metric_value JSONB NOT NULL,
  computed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, metric_key)
);
```

**API changes:**

| Route | Change |
|-------|--------|
| `GET /api/v1/users/me` | Remove CDI/CRI/career health from response |
| `GET /api/v1/analytics/dashboard` | Return Tier 1/2 only; no composites |
| `POST /api/v1/chat/message` | Strip `career-health-view.ts` from context assembly |
| `GET /api/v1/admin/metrics/:userId` | New — internal only, service role |

**Document generation (`output-generation.ts`):** Every field tagged `evidence_tier: 1|2|3`; Tier 3 never auto-included in export payload unless `?include_reflection=true`.

---

### A3. Activity model (all physicians — enhanced)

**Today:** `activity_entries` → 8×8 domain/track (lattice).

**Extend (backward compatible):**

```sql
ALTER TABLE activity_entries ADD COLUMN IF NOT EXISTS acgme_competency TEXT;
ALTER TABLE activity_entries ADD COLUMN IF NOT EXISTS acgme_subcompetency TEXT;
ALTER TABLE activity_entries ADD COLUMN IF NOT EXISTS epa_id TEXT;
ALTER TABLE activity_entries ADD COLUMN IF NOT EXISTS hours NUMERIC(5,2);
ALTER TABLE activity_entries ADD COLUMN IF NOT EXISTS role TEXT
  CHECK (role IN ('lead', 'co-lead', 'participant', 'supervisor', 'learner'));
ALTER TABLE activity_entries ADD COLUMN IF NOT EXISTS s_index_points NUMERIC(6,2);
ALTER TABLE activity_entries ADD COLUMN IF NOT EXISTS reporting_period_id UUID;
```

**New service:** `src/lib/v2/s-index.ts` — Mannix & Bell 2025 contribution scoring from activity fields (scope, role, hours, uncompensated flag). **Not** CV regex (`cv-metrics.ts`).

**Classifier update:** After domain/track classification, map to ACGME subcompetency via `acgme_subcompetency_map` lookup table (psychiatry seed first).

---

### A4. Assessments (all physicians)

**Today:** Touchpoint assessments + PFI clusters in `onboarding-instruments.ts`.

**Add formal instruments table:**

```sql
CREATE TABLE instrument_definitions (
  instrument_id TEXT PRIMARY KEY,  -- 'pfi_16', 'uwes_9', 'milestone_self_psych'
  version TEXT NOT NULL,
  items JSONB NOT NULL,
  scoring_rules JSONB NOT NULL,
  evidence_tier SMALLINT NOT NULL CHECK (evidence_tier IN (1, 2, 3))
);

CREATE TABLE instrument_responses (
  response_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_users(user_id),
  instrument_id TEXT NOT NULL REFERENCES instrument_definitions(instrument_id),
  reporting_period_id UUID,
  answers JSONB NOT NULL,
  subscale_scores JSONB,
  completed_at TIMESTAMPTZ,
  shared_with_program BOOLEAN DEFAULT false
);
```

**Routes:**

- `POST /api/v1/instruments/:id/start|answer|complete` — replace ad-hoc assessment routes over time
- PFI-16 and UWES-9 as Tier 2; milestone self-rating as Tier 3 (reflection)

---

### A5. Documents / output (all physicians)

**Add document types by content pack:**

| `document_type` | Trainee | Attending |
|-----------------|---------|-----------|
| `ccc_portfolio` | ✓ | — |
| `ilp_draft` | ✓ | — |
| `career_narrative` | ✓ | ✓ |
| `cv_delta` | ✓ | ✓ |
| `teaching_statement` | fellowship+ | ✓ |
| `promotion_support` | — | ✓ |

**Backend:** `output-generation.ts` reads `content_pack` + `evidence_tier` filters; structured JSON prefill before Claude Haiku prose.

---

## B. Trainee-side backend (residents, fellows, med students)

### B1. Reporting periods (ACGME semiannual cycle)

```sql
CREATE TABLE reporting_periods (
  reporting_period_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(program_id),
  label TEXT NOT NULL,              -- '2025-H1', '2025-H2'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  ccc_meeting_date DATE,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'locked', 'archived'))
);
```

Trainee APIs scoped to active `reporting_period_id`.

---

### B2. Milestone self-assessment (Tier 3 — reflection)

```sql
CREATE TABLE acgme_subcompetency_definitions (
  subcompetency_id TEXT PRIMARY KEY,  -- e.g. 'psych_pc1_patient_care'
  specialty TEXT NOT NULL,
  competency_domain TEXT NOT NULL,    -- 6 core + specialty-specific grouping
  label TEXT NOT NULL,
  description TEXT,
  sort_order INT
);

CREATE TABLE milestone_self_ratings (
  rating_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_users(user_id),
  reporting_period_id UUID NOT NULL REFERENCES reporting_periods(reporting_period_id),
  subcompetency_id TEXT NOT NULL REFERENCES acgme_subcompetency_definitions(subcompetency_id),
  self_level SMALLINT CHECK (self_level BETWEEN 1 AND 5),  -- ACGME milestone scale
  narrative_reflection TEXT,
  UNIQUE (user_id, reporting_period_id, subcompetency_id)
);
```

**Routes:**

- `GET /api/v1/trainee/milestones/definitions?specialty=Psychiatry`
- `GET|PUT /api/v1/trainee/milestones/self-ratings?period=:id`
- `GET /api/v1/trainee/milestones/discrepancy?period=:id` — joins external ratings when imported

---

### B3. Individualized Learning Plans (ILP)

```sql
CREATE TABLE ilp_goals (
  goal_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES app_users(user_id),
  reporting_period_id UUID NOT NULL REFERENCES reporting_periods(reporting_period_id),
  subcompetency_id TEXT REFERENCES acgme_subcompetency_definitions(subcompetency_id),
  goal_text TEXT NOT NULL,
  resources TEXT,
  target_date DATE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'deferred')),
  source TEXT CHECK (source IN ('trainee', 'pd', 'system_draft')),
  linked_activity_ids UUID[],
  created_at TIMESTAMPTZ DEFAULT now(),
  locked_at TIMESTAMPTZ
);
```

**Routes:**

- `GET /api/v1/trainee/ilp?period=:id`
- `POST /api/v1/trainee/ilp/draft-from-gaps` — system draft from milestone gaps + NLP themes (Tier 3 source tagged)
- `PATCH /api/v1/trainee/ilp/:goalId`
- `POST /api/v1/programs/:id/ilp/:goalId/approve` — PD co-production at CCC

---

### B4. Trainee discrepancy view

**Service:** `src/lib/v2/milestone-discrepancy.ts`

```typescript
type DiscrepancyRow = {
  subcompetency_id: string;
  self_level: number | null;
  external_level: number | null;   // from ADS import or rotation eval aggregate
  delta: number | null;
  flag: 'none' | 'watch' | 'discuss';  // |delta| >= 2 → discuss
};
```

**Route:** `GET /api/v1/trainee/milestones/discrepancy` — trainee sees own data only.

---

### B5. Faculty pulse (low-burden attestation — optional Tier 1)

Not full MSF; 3–5 items per activity attestation request.

```sql
CREATE TABLE faculty_pulse_requests (
  request_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainee_user_id UUID NOT NULL REFERENCES app_users(user_id),
  activity_entry_id UUID REFERENCES activity_entries(id),
  supervisor_email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending',
  expires_at TIMESTAMPTZ
);

CREATE TABLE faculty_pulse_responses (
  response_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES faculty_pulse_requests(request_id),
  collaboration_rating SMALLINT,
  professionalism_rating SMALLINT,
  teaching_rating SMALLINT,
  comment TEXT,
  submitted_at TIMESTAMPTZ DEFAULT now()
);
```

**Public route (token auth):** `POST /api/v1/public/faculty-pulse/:token` — no login required.

---

### B6. Trainee CCC prep export

**Route:** `POST /api/v1/trainee/ccc-portfolio/generate?period=:id`

**Inputs (Tier 1 only by default):** activities, s-index, imported eval summary, optional faculty pulse, optional self-ratings (labeled Tier 3).

**Output:** Structured JSON → PDF via existing output pipeline; disclaimer footer required.

---

## C. Institutional-side backend (PD / CCC / GME)

### C1. Data import pipeline

Bridges `fiscmak-admin` → Supabase.

```sql
CREATE TABLE evaluation_imports (
  import_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID NOT NULL REFERENCES programs(program_id),
  source TEXT NOT NULL CHECK (source IN ('medhub_api', 'medhub_csv', 'new_innovations_csv', 'ads_csv', 'simpl_csv', 'manual')),
  uploaded_by UUID REFERENCES app_users(user_id),
  file_name TEXT,
  row_count INT,
  mapping_snapshot JSONB,
  quality_report JSONB,
  status TEXT DEFAULT 'pending',
  imported_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE rotation_evaluations (
  eval_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_id UUID REFERENCES evaluation_imports(import_id),
  program_id UUID NOT NULL REFERENCES programs(program_id),
  trainee_user_id UUID REFERENCES app_users(user_id),
  resident_external_id TEXT,
  rotation_name TEXT,
  eval_date DATE,
  supervisor_name TEXT,
  numeric_scores JSONB,
  narrative_text TEXT,
  nlp_themes JSONB,           -- AI synthesis with source quotes
  nlp_quality_flag TEXT,      -- 'high' | 'low' | 'concern'
  raw_row JSONB
);

CREATE TABLE milestone_external_ratings (
  rating_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainee_user_id UUID NOT NULL REFERENCES app_users(user_id),
  reporting_period_id UUID NOT NULL REFERENCES reporting_periods(reporting_period_id),
  subcompetency_id TEXT NOT NULL,
  external_level SMALLINT CHECK (external_level BETWEEN 1 AND 9),
  source TEXT NOT NULL CHECK (source IN ('ads', 'ccc_assigned', 'rotation_aggregate')),
  assigned_at TIMESTAMPTZ,
  UNIQUE (trainee_user_id, reporting_period_id, subcompetency_id, source)
);
```

**Routes (PD/coordinator only):**

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/v1/programs/:id/imports/csv` | Proxy to fiscmak-admin or inline parser |
| POST | `/api/v1/programs/:id/imports/medhub/sync` | Pull via stored credentials |
| GET | `/api/v1/programs/:id/imports` | Import history |
| POST | `/api/v1/programs/:id/mappings` | Save field mapping |
| POST | `/api/v1/programs/:id/trainees/link` | Map MedHub resident ID → FISCMAK user |

---

### C2. Pre-CCC summary (core PD deliverable)

**Service:** `src/lib/v2/pre-ccc-summary.ts`

**Route:** `GET /api/v1/programs/:id/residents/:userId/pre-ccc?period=:id`

**Response sections (in order):**

0. **Data sufficiency** — eval count vs expected, narrative quality flags  
1. **Milestone trajectory** — external ratings + PGY expected curve  
2. **Assessment summary** — rotation averages, EPA counts, NLP themes w/ quotes  
3. **Self-external discrepancy** — from `milestone-discrepancy.ts`  
4. **ILP status** — goals + activity progress  
5. **Equity flag (PD-only)** — aggregate divergence alert, no demographics on PDF  

**Batch route:** `GET /api/v1/programs/:id/pre-ccc/batch?period=:id` — all trainees for coordinator.

---

### C3. NLP narrative synthesis (Phase 2)

**Service:** `src/lib/v2/narrative-synthesis.ts`

- Input: `rotation_evaluations.narrative_text[]` for trainee+period  
- Output: `{ strengths[], areas_for_growth[], concerns[], quotes[], subcompetency_tags[], low_quality_eval_ids[] }`  
- Store in `nlp_themes`; label `ai_generated: true`  
- **Never** auto-set milestone levels  

**Route:** `POST /api/v1/programs/:id/nlp/synthesize?trainee=:userId&period=:id`

---

### C4. Cohort dashboard aggregates

**Route:** `GET /api/v1/programs/:id/cohort/dashboard?period=:id`

```typescript
type CohortDashboard = {
  milestone_heatmap: { trainee_id; subcompetency_id; level }[];
  assessment_volume: { trainee_id; eval_count; expected; sufficient: boolean }[];
  epa_counts?: { trainee_id; epa_id; count; ccc_confidence: 'low'|'high' }[];
  narrative_quality_pct: number;
  equity_alerts: { metric; group_delta; min_cell_suppressed: boolean }[];  // PD only
};
```

**Equity guardrail:** Minimum cell size n≥5; no individual demographics in response.

---

### C5. PRITE / in-training exams (psychiatry)

```sql
CREATE TABLE in_training_exams (
  exam_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trainee_user_id UUID NOT NULL REFERENCES app_users(user_id),
  exam_type TEXT NOT NULL,   -- 'PRITE' for psych; 'ITE' for IM; etc.
  exam_year INT NOT NULL,
  overall_percentile SMALLINT,
  domain_scores JSONB,       -- PRITE subscores
  UNIQUE (trainee_user_id, exam_type, exam_year)
);
```

**Route:** `POST /api/v1/programs/:id/exams/import` — CSV or manual PD entry.

---

## D. Psychiatry-specific seed data (first specialty)

### D1. ACGME Psychiatry Milestones 2.0 — 22 subcompetencies

Seed `acgme_subcompetency_definitions` for `specialty = 'Psychiatry'`.

Group under 6 core competencies + psychiatry-specific domains:

| Competency domain | Example subcompetencies (psych) |
|-------------------|--------------------------------|
| Patient Care (PC) | Psychiatric assessment; diagnostic formulation; treatment planning; psychotherapy; pharmacotherapy; crisis/risk management |
| Medical Knowledge (MK) | Evidence-based psychiatry; neuroscience/behavioral science |
| Practice-Based Learning (PBLI) | QI; scholarly activity; self-improvement |
| Interpersonal & Communication (ICS) | Therapeutic communication; team communication; difficult conversations |
| Professionalism (PROF) | Ethics; boundaries; accountability; sensitivity to diverse populations |
| Systems-Based Practice (SBP) | Healthcare systems; transitions of care; resource stewardship |

**Implementation:** JSON seed file `docs/seeds/acgme_psychiatry_milestones.json` → migration insert.

**PGY expected curves:** `docs/seeds/acgme_psychiatry_pgy_norms.json` — median level per subcompetency per PGY (from published ACGME milestone reports).

---

### D2. Psychiatry rotation taxonomy

Seed for MedHub CSV auto-mapper and rotation_eval aggregation:

```sql
CREATE TABLE program_rotation_catalog (
  rotation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES programs(program_id),
  rotation_name TEXT NOT NULL,
  rotation_category TEXT,  -- 'inpatient', 'consult', 'emergency', 'outpatient', 'child', 'addiction', 'research', 'admin'
  typical_pgy TEXT[]
);
```

Default psych catalog (program can override): Inpatient Psychiatry, Psychiatric Emergency, Consult-Liaison, Outpatient Continuity, Child/Adolescent, Addiction, Neurology (PGY-1), Internal Medicine (PGY-1), Night Float, Research/Elective, VA rotation, Forensic (elective).

---

### D3. Map fiscmak-admin psychiatry competencies → ACGME subcompetencies

**Today (`fiscmak-admin/server.js`):** 14 custom fields (`diagnostic_formulation`, `therapeutic_alliance`, etc.).

**Add mapping table:**

```sql
CREATE TABLE competency_crosswalk (
  source_system TEXT,       -- 'fiscmak_admin_psych', 'medhub_form_x'
  source_field TEXT,
  subcompetency_id TEXT REFERENCES acgme_subcompetency_definitions(subcompetency_id),
  confidence TEXT
);
```

Used by auto-mapper post-processing and CSV import normalization.

---

### D4. Psychiatry EPA set (Phase 2)

Seed `epa_definitions` for psychiatry EPAs (e.g., gather history, perform MSE, develop differential, develop treatment plan, risk assessment, psychotherapy session, handoff, etc.).

Link `activity_entries.epa_id` and SIMPL import when available.

---

## E. API route map (new + modified)

### New route groups

```
/api/v1/programs/:programId/                    # PD institutional
/api/v1/programs/:programId/residents/
/api/v1/programs/:programId/imports/
/api/v1/programs/:programId/pre-ccc/
/api/v1/programs/:programId/cohort/
/api/v1/trainee/milestones/
/api/v1/trainee/ilp/
/api/v1/trainee/ccc-portfolio/
/api/v1/instruments/
/api/v1/public/faculty-pulse/:token
```

### Modified existing routes

| Route | Change |
|-------|--------|
| `PATCH /api/v1/users/me` | Accept `pgy_level`, `primary_program_id` |
| `POST /api/v1/onboarding/touchpoint1` | Branch on `career_stage`: trainee vs attending field sets |
| `POST /api/v1/activities` | Write ACGME subcompetency + s_index |
| `POST /api/v1/chat/message` | Trainee Mak: CCC/ILP context; strip career health |
| `POST /api/v1/output/generate` | `document_type` + `content_pack` + tier filters |
| `GET /api/v1/analytics/dashboard` | Trainee vs attending dashboard payloads |

### Deprecate / internalize (not removed day 1)

| Route | Action |
|-------|--------|
| `GET /api/v1/promotion/readiness` | Attending only; hidden for trainees |
| `GET /api/v1/coaching/recommendations` | Remove composite scores from response |
| `GET /api/v1/jobs/matches` | Hidden for active trainees in program license |

---

## F. Services to refactor

| Current file | Action |
|--------------|--------|
| `career-health-view.ts` | Move compute to `internal_user_metrics`; remove from user APIs |
| `formulas.ts` (CRI, job match) | Internal only |
| `cv-metrics.ts` (regex s-index, IWQ) | Deprecate user-facing; keep internal or delete |
| `cdi-weights.ts` | Internal only |
| `lattice.ts` | **`activitiesToLatticeCells()`** — attending activity + energy; extend with **`lattice-intensity.ts`** (ADR-002 ipsative I_cell) and **`acgmeHeatmap()`** for trainee subcompetency×time |
| `mak-coaching-prompts.ts` | **New** — ΔV-triggered coaching prompts (ADR-002) |
| `onboarding-instruments.ts` | Split into `instrument_definitions` DB rows |
| `output-generation.ts` | Structured fields + source tags + content_pack |
| `activity-capture.ts` | Add subcompetency mapping post-classify |
| `FISCMAKClassifier.ts` | Add psych subcompetency output (Pro) |
| `free-classifier.ts` | Hardcoded psych subcompetency map (Free) |

---

## G. fiscmak-admin integration

| Admin endpoint | Main app backend |
|----------------|------------------|
| `POST /api/auto-mapper/analyze` | Called from PD UI; save result to `program_mappings` |
| `POST /api/quality-checker/report` | Gate before `evaluation_imports` insert |
| `POST /api/medhub/validate` | On program setup; store encrypted creds in `programs` |
| `POST /api/programs/:id/evaluations/import-csv` | Replace stub with Supabase write to `rotation_evaluations` |

**Option A (short term):** Next.js API routes proxy to admin server on `:3001`.  
**Option B (medium term):** Move `MedHubClient` + CSV parsers into `fiscmak/src/lib/gme/`.

---

## H. Build order (psychiatry pilot)

| Phase | Weeks | Deliverable |
|-------|-------|-------------|
| **H1** | 1–2 | RBAC tables, `programs`, `program_memberships`, content_pack derivation |
| **H2** | 2–3 | Strip internal metrics from user APIs; `internal_user_metrics` |
| **H3** | 3–4 | Psychiatry milestone seed + self-rating APIs |
| **H4** | 4–5 | CSV import → `rotation_evaluations`; admin integration |
| **H5** | 5–6 | Pre-CCC summary v1 (no NLP) |
| **H6** | 6–7 | ILP + discrepancy views |
| **H7** | 7–8 | NLP narrative synthesis + cohort dashboard |
| **H8** | 8+ | MedHub live sync, PRITE import, EPA/SIMPL |

---

## I. What stays the same (all physicians)

- Supabase auth + `app_users` core profile  
- CV upload + enrichment cascade (`api-enrichment.ts`)  
- Activity capture via Mak (enhanced, not replaced)  
- PFI/UWES instruments (formalized)  
- Output Studio pipeline (with tier discipline)  
- Ontology classifier for Pro tier  

---

## J. Psychiatry pilot acceptance criteria

- [ ] PD can import MedHub psych rotation eval CSV and see quality report  
- [ ] All PGY-1–4 residents have pre-CCC summary PDF before mock CCC  
- [ ] Trainee completes 22-subcompetency self-rating; discrepancy visible vs imported evals  
- [ ] ILP drafted from gaps; PD approves at least one goal per resident  
- [ ] No Career Health Score, CRI, or regex s-index in any trainee API response  
- [ ] Coordinator reports ≥50% prep time reduction vs manual synthesis (pilot survey)  

---

*Next doc: `docs/seeds/acgme_psychiatry_milestones.json` + SQL migration `20260601_gme_program_core.sql`*

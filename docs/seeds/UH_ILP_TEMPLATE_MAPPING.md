# UH Individualized Learning Plan (ILP) — v10/2021

**Source:** `12325_resident_individualized_learn.doc`  
**Program:** CWRU / University Hospitals General Psychiatry  
**Template version:** v10/2021 (6 pages)  
**Structured template:** `uh_ilp_template_v10_2021.json`

---

## How this fits FISCMAK

| Document | Role |
|----------|------|
| **Word ILP (this doc)** | Official semiannual resident + PD co-production |
| **MedHub Goals** (5 fields) | Lightweight log; can hold one SMART goal (e.g. PocketTalker) |
| **MedHub outpatient eval** | External milestone ratings + narrative |
| **FISCMAK** | Drafts ILP from eval gaps + career goals; tracks progress; exports to Word/MedHub |

```
Evals (Rail A)  ──┐
Self-assessment   ├──→ FISCMAK ILP draft ──→ Word ILP + MedHub Goals
Career capture    ──┘         ↓
                        Discrepancy view (self vs faculty vs CCC)
```

---

## Document structure (all sections)

### 1. Header
- Name  
- Date Finalized  
- Next Review  

### 2. Career planning (career engine — your thesis)
| Prompt | FISCMAK use |
|--------|-------------|
| What are your current career goals? (1–3) | Career track signals (CL, psychotherapy, academic, etc.) |
| What electives will help? | Link to block schedule + elective catalog |
| What scholarly work will help? | Portfolio: QI, abstracts, research |
| What else could help? | Mentorship, coaching, wellness |
| Obstacles/challenges | Private or shareable at review |
| Steps next **4–6 months** | Aligns with **semiannual** CCC cycle |
| Who in program can help? | Mentor matching |

### 3. Self-assess competencies (21 subcompetencies)

Full **Psychiatry Milestones 2.0** grid — 0.5 to 5.0 scale.

| Domain | Subcompetencies |
|--------|-----------------|
| **Patient Care** | PC1 Evaluation · PC2 Formulation · PC3 Treatment planning · PC4 Psychotherapy · PC5 Somatic · PC6 Clinical consultation |
| **Medical Knowledge** | MK1 Lifecycle · MK2 Psychopathology · MK3 Neuroscience · MK4 Psychotherapy |
| **Systems-Based Practice** | SBP1 QI/Patient safety · SBP2 System navigation · SBP3 Physician role in systems |
| **PBLI** | PBLI1 EBM · PBLI2 Reflective practice |
| **Professionalism** | PROF1 Behavior/ethics · PROF2 Accountability · PROF3 Well-being |
| **ICS** | ICS1 Patient/family · ICS2 Interprofessional · ICS3 Health systems |

**PGY guidance (from template):**
- PGY-1 / Portal 1: target **1–2** by year end for most  
- Level **4** = graduation target (not required in every competency)  
- Level **5** = aspirational  
- Psychotherapy clinic: PGY-2/3 · Class IQ project: PGY-3  

**FISCMAK tier:** **3** (self-reflection) — pair with MedHub/CCC external ratings for discrepancy.

### 4. Personal attributes (pick 3)

Response to feedback · Scholarship · Time management · Perseverance · Attention to detail · Confidence · Communication · Teamwork · Recognize limitations · Wellness · Medical knowledge · Other  

+ **Why** you need to work on these areas  

### 5. Two SMART goals

Each goal includes:
- Goal text (SMART)  
- Long or short-term  
- Projected completion date  
- Strategies  
- Competencies aligned  
- Personal attributes aligned  

*(Template typo: second block labeled "Goal 1" — use as Goal 2.)*

### 6. Closing
- Resident other comments  
- **PD/APD comments and suggestions** (program-visible)

---

## Example filled ILP (illustrative — KP, PGY-3)

*Synthesized from your Walker OP eval, clinical skills CSV, PocketTalker goal — for product design only.*

### Career goals
1. Build outpatient psychotherapy and medication management identity at Walker continuity clinic.  
2. Develop CL/systems interest through QI (PocketTalker) and possible abstract.  
3. Prepare fellowship/application materials with strong clinical narrative.

### Steps (next 4–6 months)
- Weekly note review with Dr. Musso on formulation concision.  
- Complete PocketTalker pilot data collection by Jan 2026.  
- Capture 2 interview stories in FISCMAK vault for letter writers.

### Self-assessment (sample — discrepancy targets)
| Subcompetency | Self | MedHub ext (Musso) | Flag |
|---------------|------|-------------------|------|
| PC2 Formulation | 3.5 | 3.5 | Aligned |
| PC3 Treatment planning | 3.5 | 3.5 | Aligned |
| PBLI1 EBM | 3.0 | 3.5 | Self lower |
| ICS1 Patient/family comm | 4.0 | 4.0 | Aligned |

### Personal attributes (3)
1. Response to feedback  
2. Attention to detail  
3. Scholarship  

**Why:** OP eval cited note redundancy and diagnostic precision; QI project supports scholarship.

### SMART Goal 1 (clinical — maps to MedHub *notes* field partially)
**Specific:** Improve outpatient psychiatric formulation and note concision.  
**Measurable:** Biweekly supervised note review; faculty feedback theme tracked.  
**Achievable:** With Dr. Musso during Walker assignment.  
**Relevant:** PC2, PC3, ICS3.  
**Time-limited:** Next semiannual review.  
**Competencies:** PC2, PC3, ICS3 · **Attributes:** Response to feedback, Attention to detail  

### SMART Goal 2 (scholarly — maps to MedHub PocketTalker goal)
**Specific:** Complete PocketTalker CL QI pilot and submit abstract.  
**Measurable:** Encounters tracked; MoCA/CAM rates; abstract by Feb 2026.  
**Strategies:** See MedHub Goals entry; Dr. Shah mentorship.  
**Competencies:** SBP1, SBP2, PC6 · **Attributes:** Scholarship, Collaboration  

---

## MedHub ↔ Word ILP mapping

| Word ILP section | MedHub destination |
|------------------|-------------------|
| SMART Goal 2 (PocketTalker) | **Goals & Objectives** (5 fields) |
| SMART goals summary | **Learning Plan** portfolio type |
| Milestone self-assessment | Not in MedHub — FISCMAK + Word only |
| PD/APD comments | MedHub **Mentor Notes** / semiannual record |
| Career goals | **General Entry** or FISCMAK-only until export |

---

## FISCMAK database schema (extends MVP_GME_BACKEND_SPEC)

```sql
CREATE TABLE ilp_documents (
  ilp_id UUID PRIMARY KEY,
  user_id UUID REFERENCES app_users(user_id),
  reporting_period_id UUID,
  template_version TEXT DEFAULT 'uh_ilp_v10_2021',
  date_finalized DATE,
  next_review_date DATE,
  career_goals JSONB,
  career_planning JSONB,
  milestone_self_ratings JSONB,  -- 21 keys PC1..ICS3
  personal_attributes JSONB,
  smart_goals JSONB,             -- array of 2 goals
  resident_comments TEXT,
  pd_apd_comments TEXT,
  status TEXT CHECK (status IN ('draft','finalized')),
  exported_doc_url TEXT
);
```

---

## CSV import template

**File:** `examples/uh_ilp_milestone_self_assessment_long.csv`

One row per subcompetency self-rating per reporting period.

**File:** `examples/uh_ilp_smart_goals_wide.csv`

One row per ILP with two SMART goals as columns.

---

## Build priority

1. **ILP wizard in FISCMAK** mirroring Word section order  
2. **Pre-fill** milestone self-ratings suggestion from latest MedHub eval (resident confirms)  
3. **Discrepancy panel** after self-assess (Tier 3 vs Tier 1 external)  
4. **Export** to Word-compatible JSON → doc merge (phase 2)  
5. **Sync** SMART goal 2 → MedHub Goals form (copy/paste assist)

---

## One-line

> The UH Word ILP is the **semiannual career + milestone contract**; FISCMAK drafts it from evidence you already generate — evals, captures, QI goals — so residents stop facing a blank 6-page form.

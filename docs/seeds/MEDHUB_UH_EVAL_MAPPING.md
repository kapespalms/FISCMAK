# MedHub UH Evaluation → FISCMAK Mapping

**Example form:** Outpatient Psychiatry Evaluation — ALL PURPOSE v101521  
**Parsed example:** `medhub_uh_outpatient_eval_example.json`  
**Screenshot reference:** MedHub View Evaluation (Walker Med Clinic, 12/15/25–03/08/26)

---

## What this evaluation contains (3 data layers)

| Layer | MedHub fields | FISCMAK use | Tier |
|-------|---------------|-------------|------|
| **A. Metadata** | Service, rotation dates, evaluator, completed date | Link to block schedule + pre-CCC timeline | 1 |
| **B. Narrative** | Strengths (2–3), improvements (2–3), additional comments | Career vault, ILP hints, NLP themes | 1 (imported text) |
| **C. Milestone grid** | 14 subcompetencies × 0.5–5.0 scale | Trajectory, discrepancy vs self-rating, PD summary | 1 |

**Not in this form:** Full 22 psychiatry subcompetencies (inpatient/CL forms add others). Import must be **form-type aware**.

---

## Form-specific context (from MedHub instructions)

| Level | Program expectation |
|-------|---------------------|
| **3** | Target for **PGY-3 / Portal 2** by end of academic year |
| **4** | **Graduation target** for PGY-4 / Portal 3 |
| **5** | Aspirational |

FISCMAK must store `expected_level_for_pgy` when comparing ratings — not a universal "4 is good."

---

## Example parsed ratings (Dr. Palmer — outpatient, Walker Med Clinic)

| # | Subcompetency | Rating | FISCMAK career domain |
|---|---------------|--------|------------------------|
| 1 | Patient- and Family-Centered Communication | **4.0** | Relational Leadership |
| 2 | Interprofessional and Team Communication | **4.0** | Relational Leadership |
| 3 | Communication within Health Care Systems | **4.0** | Systems Impact |
| 4 | Professional Behavior and Ethical Principles | **4.0** | Trust & Identity |
| 5 | Accountability/Conscientiousness | **4.0** | Trust & Identity |
| 6 | Psychiatric Evaluation | **4.0** | Clinical Craft |
| 7 | Formulation & Differential Diagnosis | **3.5** | Clinical Craft ⚠ growth |
| 8 | Treatment Planning and Management | **3.5** | Clinical Craft ⚠ growth |
| 9 | Somatic Therapies | **4.0** | Clinical Craft |
| 10 | Psychopathology | **4.0** | Knowledge Base |
| 11 | Evidence-Based Practice | **3.5** | Growth Engine ⚠ growth |
| 12 | Reflective Practice / Personal Growth | **4.0** | Growth Engine |
| 13 | System Navigation | **4.0** | Systems Impact |
| 14 | Physician Role in Health Care Systems | **4.0** | Systems Impact |

**Narrative strengths:** rapport, appropriate treatment plans, non-pharmacologic interventions  
**Narrative growth:** note concision, diagnostic accuracy/precision

---

## Dual-rail: how FISCMAK uses this eval

### Rail A — Program / CCC (imported formal data)

```
MedHub eval → rotation_evaluations row
            → milestone_external_ratings (14 rows)
            → pre-CCC summary section "Assessment data"
            → discrepancy vs trainee self-rating (if present)
```

**PD pre-CCC snippet (generated, not auto-decided):**

> **Walker Med Clinic OP (12/15–3/08/26)** — Musso  
> **Strengths (faculty):** rapport, treatment planning, psychosocial interventions  
> **Growth:** documentation concision, diagnostic precision  
> **Milestone highlights:** 11/14 at ≥4.0; lowest: Formulation (3.5), Treatment Planning (3.5), EBM (3.5)  
> *AI synthesis — verify against MedHub original*

### Rail B — Resident career engine (derived, motivating)

| Imported fact | Career translation |
|---------------|-------------------|
| Rapport + non-pharm interventions | CV bullet: *Provided outpatient psychiatric care emphasizing therapeutic alliance and biopsychosocial treatment planning* |
| Level 4 communication milestones | Interview story theme: **Relational Leadership** |
| Formulation 3.5 + faculty "diagnostic precision" | **Growth Engine** ILP goal — not a deficit label |
| Outpatient continuity Dec–Mar | Rotation debrief: *outpatient psychotherapy/medication identity* |

**Resident sees:** "Your outpatient block generated strong **Relational Leadership** and **Clinical Craft** evidence. Consider capturing one formulation case for your growth narrative."

**Resident does NOT see:** composite scores or cohort rank.

---

## Database schema (import target)

```sql
-- One row per completed MedHub form
INSERT INTO rotation_evaluations (
  program_id, trainee_user_id,
  form_name, form_version, form_type,
  service_name, rotation_start, rotation_end,
  evaluator_name, completed_at,
  narrative_strengths, narrative_improvements, narrative_comments,
  raw_export JSONB
);

-- One row per subcompetency rating on form
INSERT INTO milestone_external_ratings (
  trainee_user_id, reporting_period_id,
  subcompetency_id, external_level,  -- store 3.5 as numeric; ADS uses 1-9 separately
  source, source_eval_id
) VALUES (..., 'psych_milestone_07', 3.5, 'medhub_eval', ...);
```

**Scale note:** MedHub outpatient form uses **0.5–5.0**. ACGME ADS reporting uses **1–9**. FISCMAK stores native scale + conversion table; never overwrite ADS official ratings.

---

## MedHub CSV / API field mapping (for auto-mapper)

| MedHub export column (expected) | FISCMAK field |
|---------------------------------|---------------|
| Evaluatee Name / ID | `trainee_user_id` via roster |
| Evaluator | `evaluator_name` |
| Service | `service_name` → map to `outpatient`, `walker_med_clinic` |
| Rotation Start / End | `rotation_start`, `rotation_end` |
| Form Name | `form_type` = `outpatient_all_purpose` |
| Strengths text | `narrative_strengths[]` |
| Improvements text | `narrative_improvements[]` |
| `Milestone_01_Rating` … `Milestone_14_Rating` | `milestone_external_ratings` |
| Completed Date | `completed_at` |

Train `fiscmak-admin` auto-mapper on **this form's header row** when UH exports batch evals.

---

## NLP value (Phase 2)

From this eval alone, NLP can extract:

| Theme | Source |
|-------|--------|
| **Strengths:** rapport, treatment planning, psychosocial care | Narrative |
| **Growth:** documentation, diagnostic precision | Narrative |
| **Subcompetency tags:** ICS, Patient Care, PBLI | Milestone names + ratings |

**Cross-check:** Narrative "diagnostic accuracy/precision" aligns with Milestone 7 at 3.5 → coherent growth story for ILP (not contradictory).

---

## Link to block schedule

Rotation **12/15/2025 – 03/08/2026** spans multiple 2-week blocks on the UH sheet. FISCMAK should:

1. Match date range → overlapping blocks (likely **PPY-3/PPP outpatient** or dedicated clinic assignment — not always identical to inpatient block label)
2. Attach eval to `reporting_period` H2 2025–26
3. Show on pre-CCC as **outpatient clinic eval**, distinct from inpatient MedHub forms

---

## Privacy

- Eval text is **Tier 1 formal** — trainee can see their own MedHub eval (already in MedHub)
- FISCMAK **never** exposes one resident's narrative to other residents
- PD cohort view: aggregated milestone means only

---

## Form variants to expect at UH (build parser per type)

| Form | Milestones | When used |
|------|------------|-----------|
| Outpatient ALL PURPOSE v101521 | 14 | Clinic / continuity |
| Inpatient psychiatry eval | Different set | VA CT6, Concord, SWG, etc. |
| CL eval | CL-specific | CL blocks |
| Psych ED eval | Emergency-specific | ED blocks |

**Do not** merge ratings across form types without labeling source.

---

## Immediate FISCMAK actions from this example

1. Add `medhub_form_types` seed with outpatient v101521 subcompetency list  
2. Extend `competency_crosswalk` → FISCMAK 6 career domains  
3. Sample import script using this JSON as fixture test  
4. Rotation debrief prompt for outpatient: *"Turn faculty strengths into a CV bullet"*  
5. ILP draft from Milestones 7, 8, 11 + narrative improvements  

---

## Career outputs this single eval could generate

**CV bullet (shareable):**
> Provided longitudinal outpatient psychiatric care at Walker Med Clinic with emphasis on therapeutic rapport, biopsychosocial treatment planning, and non-pharmacologic interventions.

**Growth goal (private → shareable at semiannual):**
> Refine diagnostic formulation and documentation efficiency; apply EBM resources to complex cases.

**Letter writer note for Dr. Musso:**
> Please comment on my outpatient rapport and biopsychosocial treatment approach; optional note on my progress on formulation precision.

This is the **ACGME → career engine** loop on one real document.

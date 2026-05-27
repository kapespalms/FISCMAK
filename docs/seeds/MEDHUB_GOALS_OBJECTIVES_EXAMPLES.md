# MedHub Goals & Objectives — UH Psychiatry Examples

**Form fields (MedHub):** Goal/Objective · Methods/Strategies · Timeframe · Outcome/Results · Mentor Notes  
**Example source:** Resident QI goal — PocketTalker on CL service (screenshot May 2026)

---

## Canonical example (from your screenshot)

### Goal/Objective
> Implement and evaluate the use of PocketTalker devices to improve psychiatric evaluations for patients with hearing impairment, particularly those with delirium, on the CL service.

### Methods/Strategies
> Track number of patient encounters using PocketTalker, completion rates of cognitive screening tools (e.g., MoCA, CAM), and provider feedback over a 3-month pilot period. Train CL team and nursing staff on use within one month of launch.

### Timeframe
> Secure devices and staff training by October 1; launch pilot by October 15; complete data collection by January 15, 2026; analyze results and prepare abstract by February 2026. Sent QI proposal to Dr. Shah 8/1/25.

### Outcome/Results
> Addresses a known barrier to accurate psychiatric assessment, aligns with program goals for patient-centered care, and supports scholarly output through possible publication or poster.

### Mentor Notes
> *(empty in screenshot — PD/mentor adds at review)*

---

## Why this is an excellent FISCMAK exemplar

| Dimension | How this goal scores |
|-----------|---------------------|
| **ACGME** | SBP (systems), Patient Care (assessment), ICS (communication), PBLI (QI) |
| **FISCMAK career domain** | **Systems Impact** (primary) + **Clinical Craft** + **Relational Leadership** |
| **Career track signal** | CL psychiatry, QI/systems leadership, academic/scholarly |
| **Evidence types** | QI project → MedHub **Quality Improvement Project** + possible **Presentation** / **Publication - Abstract** |
| **MedHub portfolio link** | Learning Plan, QI Project, Safety Improvement (if patient safety angle) |
| **Tier** | Tier 1 when outcomes documented; methods/reflection Tier 2/3 |

---

## FISCMAK mapping for this goal

```json
{
  "goal_id": "example_pockettalker_cl",
  "source": "medhub_goals_objectives",
  "pgy_level": "PGY-2",
  "rotation_context": "cl",
  "acgme_subcompetencies": [
    "psych_milestone_03_communication_systems",
    "psych_milestone_06_psychiatric_evaluation",
    "psych_milestone_13_system_navigation"
  ],
  "fiscmak_career_domains": ["systems_impact", "clinical_craft", "relational_leadership"],
  "career_track_tags": ["consultation_liaison", "qi_systems_leadership", "academic_psychiatry"],
  "medhub_fields": {
    "goal_objective": "...",
    "methods_strategies": "...",
    "timeframe": "...",
    "outcome_results": "...",
    "mentor_notes": null
  },
  "ilp_status": "active",
  "milestones_linked": [
    { "type": "progress_indicator", "label": "QI proposal submitted Dr. Shah 8/1/25" },
    { "type": "activity_log", "label": "Track PocketTalker encounters" }
  ],
  "output_potential": [
    "cv_bullet",
    "presentation_local",
    "presentation_national",
    "publication_abstract",
    "promotion_qi_portfolio",
    "fellowship_cl_narrative"
  ]
}
```

---

## MedHub form → FISCMAK ILP schema

| MedHub field | FISCMAK `ilp_goals` column | Notes |
|--------------|---------------------------|--------|
| Goal/Objective | `goal_text` | SMART headline |
| Methods/Strategies | `resources` + `progress_indicators` | Split actionable steps |
| Timeframe | `target_date` + `milestones_json` | Parse dates → reminders |
| Outcome/Results | `expected_outcome` | Career + program alignment |
| Mentor Notes | `mentor_comment` | PD/coach only; set at CCC |

**Co-production flow:**
1. FISCMAK drafts from milestone gaps + eval narrative (e.g., Walker OP formulation 3.5)  
2. Resident edits (this PocketTalker goal is resident-initiated QI — even better)  
3. Mentor adds **Mentor Notes** at semiannual review  
4. Optional: copy final version into MedHub Goals & Objectives  

---

## More psychiatry goal examples (by PGY & domain)

### PGY-1 — Clinical Craft / Growth Engine

**Goal:** Perform independent suicide risk assessments on Psych ED rotation with supervisor sign-off on 5 consecutive cases.  
**Methods:** Use Columbia protocol; review each case in supervision within 24 hours.  
**Timeframe:** Block 9A–10B (Psych ED blocks).  
**Outcome:** Builds crisis evaluation competence; evidence for Milestone 6C.

---

### PGY-1 — Knowledge Base

**Goal:** Complete structured neurology rotation learning plan — localize 10 neuropsychiatric presentations.  
**Methods:** Daily case log; one chalk talk for team.  
**Timeframe:** Neuro blocks per schedule.  
**Outcome:** Med-psych interface foundation.

---

### PGY-2 — Clinical Craft (after OP eval feedback)

**Goal:** Improve diagnostic formulation and note concision in outpatient continuity clinic.  
**Methods:** Weekly review of one note with Dr. Musso; use formulation template; track faculty feedback themes.  
**Timeframe:** Ongoing during Walker/clinic assignment; review at semiannual.  
**Outcome:** Directly addresses MedHub eval: formulation 3.5, "diagnostic precision," note redundancy.

*This pairs with the PocketTalker QI goal — one **clinical**, one **systems**.*

---

### PGY-2 — Relational Leadership / Teaching

**Goal:** Lead 4 med student teaching sessions on psychiatric interview skills.  
**Methods:** Request med students on CL rotation; use standardized mini-lecture + observed interview.  
**Timeframe:** During CL blocks 3–5.  
**Outcome:** Teaching portfolio; Teaching Skills Assessment in MedHub.

---

### PGY-2 — Systems Impact (another QI-style)

**Goal:** Reduce average CL consult response time for delirium cases on AM rounds.  
**Methods:** Baseline audit; stakeholder meetings with nursing; PDSA cycle.  
**Timeframe:** 3-month project during CL month.  
**Outcome:** MedHub QI Project; fellowship in CL/administrative psychiatry signal.

---

### PGY-3 / PPP — Psychotherapy identity

**Goal:** Carry 2 long-term psychotherapy patients with weekly supervision and document modality progression.  
**Methods:** Protected clinic time; video/audio review with supervisor (per program policy).  
**Timeframe:** Academic year.  
**Outcome:** Outpatient/therapy fellowship narrative; Continuity Clinic Log.

---

### PGY-3 — Scholarship

**Goal:** Submit one abstract from residency QI (PocketTalker pilot) to regional meeting.  
**Methods:** Complete data analysis by Jan 15; draft abstract with Dr. Shah by Feb 2026.  
**Timeframe:** Per PocketTalker goal above.  
**Outcome:** Presentation — National/Regional in MedHub portfolio.

---

### PGY-4 / Chief — Systems / Leadership

**Goal:** Co-lead resident QI council project on handoff safety between Psych ED and inpatient.  
**Methods:** Monthly council; root cause analysis; present to CCC.  
**Timeframe:** Full academic year.  
**Outcome:** Admin psychiatry selective; job/academic leadership CV.

---

## Goal types: program-required vs resident-initiated

| Type | Who drives | FISCMAK behavior |
|------|------------|------------------|
| **Remediation** | PD after CCC concern | Private Tier 3 + shared ILP; sensitive UX |
| **Semiannual ILP** | Co-produced at review | Draft from milestone gaps + eval narrative |
| **Scholarly/QI** | Resident (PocketTalker) | Celebrate; link to portfolio exports |
| **Career exploration** | Resident PGY-2+ | Track signals (forensic, CAP, CL) without prescribing path |
| **Wellbeing** | Resident opt-in | PFI/UWES Tier 2; not in MedHub unless program requires |

---

## Semiannual review: how goals connect eval + schedule + portfolio

For a **PGY-2 on CL** with:
- **Block schedule:** CL blocks 3–5 (from UH 2026 sheet)
- **MedHub eval:** (future CL end-of-rotation form)
- **Goal:** PocketTalker QI
- **Portfolio:** QI Project entry when complete

**FISCMAK semiannual prep shows:**

> **Active goals:** PocketTalker QI (on track — proposal submitted 8/1)  
> **Eval themes:** [from latest form]  
> **Evidence logged:** 12 CL activities, 1 QI milestone  
> **Suggested MedHub updates:** Learning Plan refresh, QI portfolio entry when pilot ends  
> **Questions for mentor:** Device approval status; abstract target meeting  

---

## Mentor Notes — what PD/APD should add (example for PocketTalker)

> Approved QI proposal 8/15/25. Connect with nursing leadership before October launch. Consider pairing with CAM documentation audit for abstract. Present interim update at CL QA meeting in December.

**FISCMAK:** Mentor Notes field = **program-visible**; distinct from resident private reflection vault.

---

## What FISCMAK generates vs what goes in MedHub

| FISCMAK generates | Resident copies to MedHub? |
|-------------------|---------------------------|
| ILP draft (4 fields) | Yes — Goals & Objectives form |
| Progress check-ins | Optional — Learning Plan portfolio entry |
| CV bullet from completed goal | No — export only |
| Letter writer talking point | No |

---

## One-line for residents

> **A good goal names the problem, the plan, the dates, and the career payoff** — like PocketTalker: patient barrier → QI pilot → abstract → CL/systems identity.

---

## Database (extends MVP_GME_BACKEND_SPEC)

```sql
ALTER TABLE ilp_goals ADD COLUMN IF NOT EXISTS methods_strategies TEXT;
ALTER TABLE ilp_goals ADD COLUMN IF NOT EXISTS timeframe_text TEXT;
ALTER TABLE ilp_goals ADD COLUMN IF NOT EXISTS expected_outcome TEXT;
ALTER TABLE ilp_goals ADD COLUMN IF NOT EXISTS mentor_notes TEXT;
ALTER TABLE ilp_goals ADD COLUMN IF NOT EXISTS medhub_synced_at TIMESTAMPTZ;
ALTER TABLE ilp_goals ADD COLUMN IF NOT EXISTS linked_portfolio_types TEXT[];
-- e.g. ['quality_improvement_project', 'presentation_national']
```

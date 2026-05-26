# UH Psychiatry Program Artifacts — Master Index

**Pilot program:** CWRU / University Hospitals General Psychiatry  
**Last updated:** From user document drop (May 2026 session)

---

## Document inventory

| File | Type | FISCMAK seed | Primary use |
|------|------|--------------|-------------|
| `12325_resident_individualized_learn.doc` | Word ILP template v10/2021 | `uh_ilp_template_v10_2021.json`, `UH_ILP_TEMPLATE_MAPPING.md` | Semiannual ILP wizard |
| `12325_psychiatry_annual_program_eva.docx` | APE Report Sep 2025 | `uh_ape_2025_summary.json` | PD dashboard context, program aims |
| `12325_faculty_guide_to_medhub_vmay2.docx` | Faculty how-to | `MEDHUB_FACULTY_GUIDE_MAPPING.md` | Eval cadence, privacy, import rules |
| `curriculum_cmcpsych_inpatient_psych.docx` | Rotation curriculum | `uh_curriculum_inpatient_psychiatry.json` | Rotation debrief prompts |
| MedHub Curriculum Objectives (screenshot) | Web UI index | This doc § Curriculum | Links rotation → goals docs |
| [Resident Recognition Google Form](https://docs.google.com/forms/d/e/1FAIpQLSesRCDkfbyOVmCX0taC9Sd8PhSpMhT5PX3CtRfmMoea8_GTJA/viewform) | Culture/wellness | § Recognition below | Optional peer kudos module |

---

## Annual Program Evaluation (APE) — key takeaways

**PEC meeting:** 9/5/2025 · **Distributed:** 9/12/2025 (Grand Rounds QR + MedHub Resources)

### Program aims (4 buckets)
1. **Excellence in Patient Care** — patient-centered care, professionalism, quality time, MOC, licensure  
2. **Humanism** — empathy, underserved populations, diversity-responsive care, work-life balance  
3. **Intellectual Engagement** — 100% ABPN first-time pass, scholarship, curiosity, alumni engagement  
4. **Community** — wellness practice, teamwork, APA membership, retain graduates on faculty  

### ACGME survey — resident deterioration (program vs specialty)
Highest-impact gaps for product design:

| Rank | Item | Compliance |
|------|------|------------|
| 1 | Satisfied with faculty feedback | **56%** |
| 2 | Interprofessional teamwork modeled | 65% |
| 3 | Four+ days free in 28 days | 65% |
| 4 | Environment of inquiry | 68% |
| 5 | Safety/health conditions | 68% |

### Action plans (FISCMAK relevance)

**Action #1 — Hero's Journey PID**  
Responsible: Cerny-Suelzer, Hunt, Chief Residents, **Kristen Palmer**  
Target: 6/30/2026 · Metrics: ACGME survey >70%, milestones, scholarly productivity  

→ FISCMAK **career lattice + narrative capture** aligns directly with PID framework.

**Action #2 — Bi-annual faculty feedback summaries**  
Jan/Feb + Jul/Aug reports · Target >70% faculty satisfaction with eval process  

→ FISCMAK can supply **structured resident feedback snippets** (opt-in) to supplement MedHub aggregate evals.

### ILP compliance
☑ All trainees received ILP at semiannual meeting (ACGME requirement met)

### QI curriculum change
Class QI project **moved PGY3 → PGY4** Walker Medication Management Clinic (2024–25 onward)

### Curriculum management
- Airtable 2024–25 (completed)  
- Airtable 2025–26 schedule (live)  
- Links in `uh_ape_2025_summary.json`

---

## Inpatient Psychiatry curriculum — structure

Three PGY bands in one document:

| Band | Milestone focus | Example other objectives |
|------|-----------------|--------------------------|
| **PGY-1** | Levels 1–2 across PC/MK/SBP/PBLI/PROF/ICS | PASS report, EMR handoff, empathic interviewing |
| **PGY-2** | Level 2–3 progression | Advanced interview flow |
| **PGY-4 acting attending** | Levels 4–5 | MI techniques, teach juniors on meds |

Each band includes full **ACGME competency goal prose** (Patient Care, MK, PBLI, ICS, PROF, SBP).

**FISCMAK:** Use as **rotation context pack** when trainee starts inpatient block — debrief checklist + capture tags.

---

## Resident Recognition form (Google)

**Purpose:** Faculty nominate one resident at a time with a short story.

**Fields:**
- Nominator name (required)  
- Nominee dropdown (~40 faculty names)  
- Why nominate (short story)  

**FISCMAK mapping:** Optional **House culture** feature (not compliance). Could live in Rail B as private kudos → aggregate wellness signal for PD (Tier 2 opt-in). **Not** a substitute for MedHub evals.

**Sample faculty in dropdown:** Musso, Makino, Brandstetter-relevant names, etc. — useful for **faculty roster seed** validation.

---

## MedHub navigation map (from faculty guide + screenshot)

```
MedHub (CMC Psychiatry)
├── Home
│   └── Curriculum Objectives  ← rotation goals docs
├── Portfolio (trainee)
│   ├── CV, CSE/CSV, ILP, Goals
│   └── General entries (linked evidence)
├── Schedules
├── Evaluations
│   ├── Incoming (faculty→resident)
│   ├── Initiate on-the-fly eval
│   └── Aggregate (faculty views own feedback, ≥3 rule)
├── Conferences (RedCap for didactics, not MedHub)
└── Resources
    ├── Faculty Guide
    ├── APE Report
    ├── Program Aims
    └── ILP template
```

---

## FISCMAK dual-rail placement

| Artifact | Rail A (Program) | Rail B (Resident) |
|----------|------------------|-------------------|
| APE / program aims | PD dashboard context | Career alignment (read-only) |
| Curriculum objectives | Rotation metadata import | Debrief prompts |
| Faculty guide cadence | Import schedule rules | Nudge timing |
| ILP Word template | Pre-CCC aggregate | ILP wizard + self-assessment |
| Evals / CSV / portfolio | Import + discrepancy | Vault + Output Studio |
| Recognition form | Optional aggregate wellness | Peer kudos capture |

---

## CSV examples (all in `docs/seeds/examples/`)

| File | Rows represent |
|------|----------------|
| `uh_ilp_milestone_self_assessment_long.csv` | ILP self-ratings |
| `uh_ilp_smart_goals_wide.csv` | ILP career + SMART goals |
| `uh_medhub_outpatient_eval_wide.csv` | Rotation eval |
| `uh_medhub_goals_wide.csv` | PocketTalker QI goal |
| `uh_medhub_portfolio_entry_long.csv` | Portfolio evidence |
| `uh_clinical_skills_eval_v1_long.csv` | ABPN CSV **v.1** (22 items) |
| `uh_clinical_skills_eval_long.csv` | ABPN CSV **v.2** (consolidated) |

---

## Next build hooks (when requested)

1. **`rotation_curriculum_packs` table** — ingest JSON like `uh_curriculum_inpatient_psychiatry.json`  
2. **APE survey items → PD dashboard widgets** (aggregate only, no individual Tier 3)  
3. **Eval cadence engine** — block-end nudges from faculty guide rules  
4. **Hero's Journey PID tags** — map captures to PID stages for Action #1 reporting  

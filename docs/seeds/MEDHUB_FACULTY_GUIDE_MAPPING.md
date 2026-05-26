# MedHub Faculty Guide (v.May 2023) — FISCMAK Mapping

**Source:** `12325_faculty_guide_to_medhub_vmay2.docx`  
**Program:** CMC Psychiatry, University Hospitals  
**URL:** https://universityhospitals.medhub.com/

---

## Why this matters for FISCMAK

MedHub is the **system of record** for compliance. FISCMAK sits **alongside** it — never replacing evals, duty hours, or official ILP storage. The faculty guide defines **cadence, visibility rules, and eval types** that FISCMAK must respect when importing and when prompting residents/faculty.

---

## MedHub contents (from guide)

| MedHub area | FISCMAK rail | Notes |
|-------------|--------------|-------|
| Resident evaluations | **Rail A import** | Trainees **see all faculty eval text** — no confidential faculty→trainee comments |
| Faculty evaluations | Resident→PD confidential option | Aggregate view needs **≥3 responses** |
| Block/clinic schedules | Rail A | Links to UH block schedule seeds |
| Duty hours / time away | Rail A (read) | PGY2 nightfloat timesheet issue noted in APE |
| Trainee portfolios | **Bridge** | CV, CSE/CSV, ILP, goals — FISCMAK vault + export |
| Program & service evaluations | Rail A | Feeds APE |
| Messages | — | PD broadcast; anonymous to PD |
| Resource documents | Reference | APE, aims, curriculum objectives, how-to guides |
| Curriculum Objectives | **Rotation context** | Per-service goals (see inpatient psych seed) |

---

## Evaluation cadence (critical for nudges)

| Trainee level | Faculty eval frequency | FISCMAK prompt |
|---------------|------------------------|----------------|
| PGY-1, PGY-2, Portal 1 | **End of each 4-week block** | Post-rotation debrief within 48h of block end |
| PGY-3, PGY-4, Portal 2-3 | **At least quarterly** | Quarterly capture + pre-CCC synthesis |
| Ambulatory longitudinal | Quarterly supervisor eval cycle | Align Walker OP debrief to Musso quarterly |

**Faculty feedback review (trainee evaluates faculty):**
- Block supervisors: check aggregate **2–3×/year** (Oct, Feb, Jun/Jul)
- Longitudinal ambulatory: **1–2×/year** (Jan, Jul) — wait until trainee completes time with supervisor

---

## On-the-fly (self-initiated) evaluations

**Path:** Evaluations → Initiate Performance Evaluation of a Resident

**Use cases FISCMAK should mirror with "Capture Moment → suggest MedHub export":**
- Mid-block feedback
- CSE/CSV documentation
- Observed handoff, medication consent, risk assessment
- **Faculty Feedback for Trainees – Free Text** — quick written feedback

**Available eval types (CMC Psychiatry):** Listed in guide appendix — import list from MedHub admin when building mapper.

---

## Privacy rules (non-negotiable)

```
Faculty → Trainee eval:     FULLY VISIBLE to trainee (no hidden comments)
Trainee → Faculty eval:     Can send CONFIDENTIAL comments to PD only
Trainee → Program eval:     Standard MedHub program evaluation forms
FISCMAK Tier 3 reflection:  NEVER auto-export to MedHub or CCC claims
```

---

## Curriculum Objectives (MedHub UI)

Screenshot confirms **Home → Curriculum Objectives** lists in-house services. Most rows show `(no files)`; downloadable examples:

| Service | Document | Updated |
|---------|----------|---------|
| Inpatient Child Psychiatry – CAP/UH CMC | CAP Goals and Objectives (June 2021) | 11/28/2022 |
| VAMC – Wade Park | Inpatient Psychiatry Goals and Objectives | 11/28/2022 |
| **Inpatient Psychiatry (general)** | `curriculum_cmcpsych_inpatient_psych.docx` | — |

FISCMAK should index rotation goals from these docs → **rotation debrief templates** and **activity→subcompetency** tagging.

---

## FISCMAK features implied by guide + APE

| Pain point (APE 2025) | MedHub reality | FISCMAK opportunity |
|------------------------|----------------|---------------------|
| 56% satisfied with faculty feedback | Evals visible but sparse/narrative | **Capture moments** → draft eval bullets for faculty to paste |
| Faculty unhappy with educator eval process | Aggregate needs 3+; hard to find in MedHub | Resident **structured feedback** → opt-in export to MedHub anonymous eval |
| ILP compliance checkbox | Word ILP + MedHub portfolio | **ILP wizard** (see `UH_ILP_TEMPLATE_MAPPING.md`) |
| QI moved to PGY4 clinic | Goals in MedHub | Link SMART goal 2 to Walker MM clinic QI |
| Bi-annual faculty feedback summaries (Action #2) | PD runs MedHub reports | FISCMAK **faculty teaching evidence** from resident captures (opt-in) |

---

## Admin contacts (for pilot)

- **Program coordinator:** Melvyna Williams — Melvyna.williams@uhhospitals.org (MedHub access, faculty adds)
- **PD:** Cathleen Cerny-Suelzer — Cathleen.cerny@uhhospitals.org

---

## One-line

> Faculty guide = **when and how feedback happens in MedHub**; FISCMAK = **help residents and faculty make that feedback richer without breaking visibility rules**.

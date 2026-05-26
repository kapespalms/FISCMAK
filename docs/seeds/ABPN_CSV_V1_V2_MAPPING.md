# ABPN Clinical Skills Verification — CSV v.1 vs v.2

**CSV** on the paper form = **Clinical Skills Verification** (ABPN), not comma-separated values.

| Version | Items | Structure | UH example in seeds |
|---------|-------|-----------|---------------------|
| **v.1** | 16 numbered items → **22 scorable fields** | Granular PPR (6) + interview (10) + presentation (6) | Schema: `abpn_csv_v1_form_schema.json` |
| **v.2** | 3 section overviews + **~12 consolidated sub-items** | Rolled-up labels (rapport, DSM data, cultural histories) | `uh_clinical_skills_eval_long.csv` (Wong 7/16/24) |

Both use **1–8 scale** with the same four bands: very unacceptable (1–2), unacceptable (3–4), acceptable (5–6), very acceptable (7–8).

---

## CSV v.1 — full item list (user-provided form)

### Header
Resident Name · Resident Signature · Level of Training · PG Date · Examiner Name · Examiner Signature · **Patient Type**

### Section 1 — Physician-Patient Relationship (6 items)

| # | Item | Low anchor | High anchor |
|---|------|------------|-------------|
| 1 | Opening and closing | Awkward strategies | Appropriate strategies |
| 2 | Informational cues | Ignored leads | Followed leads |
| 3 | Affective cues | Ignored / insensitivity | Explored appropriately |
| 4 | Communication style and rapport | Abrupt, forced choice | Adequate language sensitivity |
| 5 | Questioning techniques | Scattered, fragmented | Open-ended, structured |
| 6 | Control and direction | Scattered | Cohesive interview |

### Section 2 — Psychiatric Interview (10 scorable fields)

**Length of interview:** free text

| # | Item | Low anchor | High anchor |
|---|------|------------|-------------|
| 7 | HPI / presenting problems | Inadequate, vague | Adequate data |
| 8a | Past history: Psychiatric | Ignored major issues | Brief relevant data |
| 8b | Past history: Family | Ignored major issues | Brief relevant data |
| 8c | Past history: Medical | Ignored major issues | Brief relevant data |
| 8d | Past history: Social/educational/occupational | Ignored major issues | Brief relevant data |
| 9 | Developmental history | Ignored / too limited | Brief relevant data |
| 10 | Drug and alcohol history | Ignored / too limited | Sensitively gathered |
| 11 | Suicidal risk | Ignored / too limited | Sensitively explored |
| 12 | Homicidal risk | Omitted / too limited | Sensitively explored |
| 13 | Mental status exam (during interview) | Omitted / too limited | Organized, appropriate |

### Section 3 — Case Presentation (6 scorable fields)

| # | Item | Low anchor | High anchor |
|---|------|------------|-------------|
| 14 | Summary of important data | Disorganized | Cohesive, coherent |
| 15 | MSE (presentation) | Incomplete | Accurately summarized |
| 16a | Emergency: Suicide | Ignored | Considered |
| 16b | Emergency: Violence/abuse | Ignored | Considered |
| 16c | Emergency: Drugs/alcohol | Ignored | Considered |
| 17 | Additional history / collateral | Absent, no rationale | Appropriate |

### Footer
**Comments** (examiner narrative)

---

## CSV v.2 — consolidated structure (existing UH example)

Used in `uh_clinical_skills_eval_long.csv` for Wong 7/16/24:

| Section | v.2 item keys |
|---------|---------------|
| PPR | `overall`, `rapport`, `responds_appropriately`, `follows_cues` |
| Interview | `overall`, `dsm_differential_data`, `histories_core`, `histories_cultural`, `histories_gender_sexual`, `si_hi_screen`, `question_technique`, `mse` |
| Presentation | `overall`, `history_presentation`, `mse_presentation` |

**v.2 adds:** gender/sexual history as explicit item (not separate in v.1 — may fall under social history or comments).

---

## v.1 → v.2 normalization (import pipeline)

When FISCMAK receives **v.1** ratings, derive v.2-compatible aggregates for cohort dashboards:

| v.2 key | v.1 source (aggregation rule) |
|---------|-------------------------------|
| `ppr_rapport` | mean(items 1, 3, 4) |
| `ppr_responds` | item 2 |
| `ppr_follows_cues` | item 2 |
| `pi_dsm_data` | item 7 |
| `pi_histories_core` | mean(8a, 8b, 8c, 8d, 9) |
| `pi_histories_cultural` | *(no direct v.1 item — flag for manual tag or comments)* |
| `pi_histories_gender_sexual` | *(no direct v.1 item — use 8d or comments)* |
| `pi_si_hi` | mean(11, 12) |
| `pi_questions` | mean(5, 6) |
| `pi_mse` | item 13 |
| `cp_history` | item 14 |
| `cp_mse` | item 15 |

Store **raw v.1 item scores** always; computed v.2 aggregates are optional views.

---

## FISCMAK product use

### Rail B (resident)
- **Capture wizard:** 22-item checklist or photo → OCR → validate against schema  
- **Growth detection:** any item ≤4 → ILP personal attribute suggestion (e.g. item 8d → Time management / Attention to detail)  
- **Output Studio:** items 1–6 + comments → Relational Leadership CV bullets  

### Rail A (program)
- Pre-CCC: section means (PPR / Interview / Presentation)  
- Not a milestone grid — keep separate from MedHub outpatient 14-milestone eval  
- Link portfolio scans via `eval_id` (see `MEDHUB_PORTFOLIO_CSV_LINKED_EXAMPLE.md`)

### MedHub workflow (from faculty guide)
- Examiner completes paper form  
- Resident uploads scan to Portfolio (**General Entry**)  
- Optional: faculty **Initiate Performance Evaluation** for CSE in MedHub  
- FISCMAK structured import supplements JPG-only portfolio entries  

---

## ACGME Psychiatry Milestones 2.0 crosswalk (selected)

| CSV v.1 items | Subcompetencies |
|---------------|-----------------|
| 1–6 (PPR) | ICS1, ICS2 |
| 7, 8a–d, 9, 13 | PC1, PC2, MK2 |
| 10–12 | PC1, PC3, PROF1 |
| 14–17 | PC2, ICS3, SBP2 |

---

## Files

| File | Purpose |
|------|---------|
| `abpn_csv_v1_form_schema.json` | Machine-readable v.1 schema (22 fields) |
| `examples/uh_clinical_skills_eval_v1_long.csv` | v.1 long-format example (illustrative scores) |
| `examples/uh_clinical_skills_eval_v1_wide.csv` | v.1 wide-format example |
| `examples/uh_clinical_skills_eval_long.csv` | Existing **v.2** example (Wong) |
| `MEDHUB_PORTFOLIO_CSV_LINKED_EXAMPLE.md` | Portfolio JPG + eval linking |

---

## Rating band helper (both versions)

```javascript
function ratingBand(score) {
  if (score <= 2) return 'very_unacceptable';
  if (score <= 4) return 'unacceptable';
  if (score <= 6) return 'acceptable';
  return 'very_acceptable';
}
```

**Program interpretation (typical):** 5–6 = meets expectation for level; 7–8 = strengths for letter writers; ≤4 = CCC discussion / ILP growth area.

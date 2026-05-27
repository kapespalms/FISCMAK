# Example CSV Formats — UH Psychiatry Evaluations

**Fixtures:** `docs/seeds/examples/`  
**Use with:** `fiscmak-admin` auto-mapper, quality checker, FISCMAK import pipeline

---

## 1. Clinical Skills Evaluation (ABPN CSV) — paper form

**Note:** "CSV" on the paper form = **Clinical Skills Verification** (ABPN), not comma-separated values. FISCMAK normalizes ratings to CSV on import (scan/OCR or manual entry).

**Two ABPN form versions:**

| Version | Scorable fields | Schema | Example CSV |
|---------|-----------------|--------|-------------|
| **v.1** | 22 items (16 numbered; item 8 ×4, item 16 ×3) | `abpn_csv_v1_form_schema.json` | `uh_clinical_skills_eval_v1_long.csv` |
| **v.2** | ~12 consolidated sub-items | — | `uh_clinical_skills_eval_long.csv` |

**Mapping doc:** `ABPN_CSV_V1_V2_MAPPING.md`

**Source example (both versions):** PGY-3 clinical skills eval, examiner Alex Wong, 7/16/24, outpatient, 60-min interview. v.2 uses `eval_id = uh-csv-2024-0716-001`; v.1 uses `uh-csv-v1-2024-0716-001` with `linked_portfolio_eval_id` pointing to v.2 bundle.

### Long format (recommended for database import)

**File:** `uh_clinical_skills_eval_long.csv`  
**One row per rated item** — 15 data rows + 1 comments row per evaluation.

| Column | Example |
|--------|---------|
| `eval_id` | `uh-csv-2024-0716-001` |
| `trainee_initials` | `KP` |
| `pgy_level` | `PGY-3` |
| `section` | `psychiatric_interview` |
| `item_key` | `histories_cultural_racial_ethnic` |
| `rating_value` | `6` |
| `rating_band` | `acceptable` (5–6) or `very_acceptable` (7–8) |

**Rating bands (from form):**
| Score | Band |
|-------|------|
| 1–2 | Very unacceptable |
| 3–4 | Unacceptable |
| 5–6 | Acceptable |
| 7–8 | Very acceptable |

### Wide format (MedHub-style export)

**File:** `uh_clinical_skills_eval_wide.csv`  
**One row per evaluation** — all item scores as columns.

---

## 2. MedHub Outpatient Evaluation (ALL PURPOSE v101521)

**File:** `examples/uh_medhub_outpatient_eval_wide.csv` (see below)

One row per completed form; milestone columns `milestone_01_rating` … `milestone_14_rating` on **0.5–5.0** scale.

---

## 3. Block schedule import

**File:** `../uh_2026_2027_block_assignments_import.csv`  
`trainee_initials,pgy_level,block_id,rotation_code,start_date,end_date`

---

## 4. Goals & Objectives

**File:** `examples/uh_medhub_goals_wide.csv`

---

## 5. Portfolio entry + Clinical Skills (CSV v.2) bundle

**Scenario:** General Entry "CSV 1 by Dr. Wang" with JPG scans of paper form.

| File | Format |
|------|--------|
| `uh_medhub_portfolio_entry_wide.csv` | One row per portfolio entry |
| `uh_medhub_portfolio_entry_long.csv` | One row per attachment |
| `uh_clinical_skills_eval_long.csv` | Linked via `eval_id` |

**Doc:** `../MEDHUB_PORTFOLIO_CSV_LINKED_EXAMPLE.md`

---

## FISCMAK career mapping (Clinical Skills → domains)

| Section / item | FISCMAK career domain |
|----------------|----------------------|
| Physician-Patient Relationship | Relational Leadership |
| Psychiatric Interview (clinical) | Clinical Craft |
| Histories (cultural, gender) | Trust & Identity |
| SI/HI screen | Clinical Craft |
| Case Presentation | Relational Leadership + Clinical Craft |
| Narrative: teach-back, empathy | Relational Leadership → **letter writer / CV bullet** |

**Growth items (score 6 in example):** core histories, cultural histories, gender/sexual histories → ILP suggestion for PGY-3+.

---

## Test auto-mapper

```bash
curl -X POST http://localhost:3001/api/auto-mapper/analyze \
  -F "file=@docs/seeds/examples/uh_clinical_skills_eval_long.csv" \
  -F "programId=uh_psych"
```

```bash
curl -X POST http://localhost:3001/api/quality-checker/report \
  -F "file=@docs/seeds/examples/uh_clinical_skills_eval_long.csv" \
  -F 'mapping={"field_mappings":{"trainee_initials":"trainee_initials","rating_value":"rating_value"},"validation_rules":{"required_fields":["trainee_initials","eval_date","rating_value"],"score_range":[1,8]}}'
```

---

## Privacy

Public fixtures use **trainee_initials** only. Production import maps initials → `user_id` via program roster.

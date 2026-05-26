# Multi-Program Schedule Architecture — UH vs Baylor (BCM)

FISCMAK must support **multiple psychiatry programs** with different block structures—not one hardcoded calendar.

| | **University Hospitals** (Cleveland) | **Baylor College of Medicine** (Houston) |
|--|--------------------------------------|------------------------------------------|
| **Seed file** | `psychiatry_uh_va_2025_2026_block_schedule.json` | `psychiatry_bcm_houston_block_diagram.json` |
| **Source** | 2025–26 block schedule PDF | [BCM block diagram 2022 PDF](https://www.bcm.edu/sites/default/files/general-psychiatry-block-diagram-2022.pdf) |
| **Block unit** | **2 weeks** | **~4 weeks (1 month)** |
| **Blocks / PGY year** | **26** (1A–13B) | **13** (1–13) |
| **PGY-1 arc** | Rapid rotation churn; psych ED, IM, peds, neuro, inpatient | CL → addiction → geriatric → neuro OP → psych ED → 3× inpatient → primary care electives → medicine → urgent care |
| **PGY-2 arc** | CL-heavy, CAPU, geriatric, addiction, NF | 2× psych ED → 3× CL → inpatient → psych ED → **elective** → CL → Methodist IP → **forensic** → **CAP** → Menninger IP |
| **PGY-3** | PPP-1 track on sheet (map to PGY-3) | **12-month continuous outpatient** (75–100% OP) |
| **PGY-4** | Not on UH pilot sheet | **Admin selective** + 10% continuity clinic |
| **Parallel track** | BHI/Access `#` overlay | **Psychotherapy continuity** PGY-2+ (2–4 hr/wk) |
| **# of sites** | UH, VA, SWG, Northcoast, Portals | **9 TMC sites** (VA, Ben Taub, TCH, Menninger, BCM Clinic, Methodist, Jail, Legacy, Women's Home) |
| **Vacation** | Pre-scheduled blocks + rotation-specific rules | **3 weeks/year** resident preference |

---

## BCM PGY-1 — canonical block template

One rotation per block (from official diagram):

| Block | Rotation | Site(s) |
|-------|----------|---------|
| 1 | Consult Liaison | 1 (VA) |
| 2 | Addiction Psychiatry | 1 |
| 3 | Geriatric Psychiatry | 1 |
| 4–5 | Neurology Outpatient | 1 |
| 6 | Emergency Psychiatry | 1 |
| 7–8 | Inpatient Psychiatry | 1 & 2 |
| 9 | Inpatient Psychiatry | 2 (Ben Taub) |
| 10–11 | Primary Care Elective 1 | 1 or 4 (Menninger peds) |
| 12 | General Medicine Wards | 1/2 |
| 13 | Urgent Care / ED | 1/2 |

**Primary care elective options:** geriatric medicine, women's primary care, endocrinology/IM CL (Site 1); peds IP/OP (Site 4).

---

## BCM PGY-2 — canonical block template

| Block | Rotation | Site(s) |
|-------|----------|---------|
| 1–2 | Emergency Psychiatry | 1 |
| 3–5 | Consult Liaison | 2 |
| 6 | Inpatient Psychiatry | 2 |
| 7 | Emergency Psychiatry | 2 |
| 8 | **Elective 2** | varies |
| 9 | Consult Liaison | 1 & 2 |
| 10 | Inpatient Psychiatry | 6 (Methodist) |
| 11 | Forensic Psychiatry | 1 & 7 (Jail) |
| 12 | Child & Adolescent Psychiatry | 3 (Texas Children's) |
| 13 | Inpatient Psychiatry | 4 (Menninger) |

**Parallel:** ≥2 long-term psychotherapy patients, 2–4 hr/wk (in addition to full-time blocks).

**Elective 2 options:** Forensic, Research, ACT, CAP, Reproductive mental health, ECT, Neuropsychiatry, Addiction, Geriatric, Pain, Sleep.

---

## BCM PGY-3 — continuous model (FISCMAK scheduling type: `continuous_year`)

- **12 months** outpatient psychiatry  
- Sites: 1, 2, 3, 5, 8, 9  
- Psychotherapy + med management in community, specialty (CAP, geriatric, addiction), and private settings  
- 75–100% outpatient; 0–25% research (up to 50% research track)

**FISCMAK implication:** No block-end debrief. Use **weekly psychotherapy/clinic capture** + **semiannual** review prep.

---

## BCM PGY-4 — split-year model (`split_year`)

| Segment | Months | Rotation | Outpatient % | Research % |
|---------|--------|----------|--------------|------------|
| A | 2–6 | Admin selective elective 2 | 10–100 | 0–25 |
| B | 6–10 | Admin selective elective 2 | 10–100 | 0–50 |

Plus **10% FTE continuity clinic** all year (usually PGY-3 clinic continuation).

Admin selective = inpatient, outpatient, or ER at sites 1–5 with **admin, QI/patient safety, teaching** components.

**FISCMAK implication:** Capture **QI/teaching/leadership** evidence monthly; job/fellowship launch outputs.

---

## Database: support three scheduling types

```sql
-- programs.scheduling_config JSONB example:
-- { "block_unit": "2_weeks", "blocks_per_year": 26 }  -- UH
-- { "block_unit": "1_month", "blocks_per_year": 13 } -- BCM PGY1/2
-- { "pgy3_model": "continuous_year" }               -- BCM

trainee_block_assignments     -- PGY-1, PGY-2 (both programs)
trainee_continuous_assignments -- PGY-3 BCM, PGY-4 segments
parallel_tracks               -- psychotherapy_continuity, research_track, bhi_overlay
```

---

## Career lattice columns — union of both programs

Use **superset catalog**; each program enables subset:

| Column | UH | BCM |
|--------|----|-----|
| Inpatient | VA CT6, UH Concord, SWG, Northcoast | Ben Taub, VA, Menninger, Methodist |
| Emergency | Psych ED UH/VA | Ben Taub psych ER |
| CL | CL, MPU-CL, Child CL | CL (multi-site) |
| Addiction | OP/VA/MAT | VA, Ben Taub, elective |
| CAP | CAPU, Child CL | Texas Children's block |
| Geriatric | Geriatric block | PGY-1 block + OP clinics |
| Forensic | — | Jail + forensic elective |
| Off-service | IM, Peds, Neuro, ED, MedTox | Medicine wards, urgent care, neuro OP, primary care electives |
| Outpatient longitudinal | — | **PGY-3 year (BCM signature)** |
| Admin/QI | — | **PGY-4 selective (BCM)** |
| Psychotherapy parallel | — | **PGY-2+ (BCM)** |
| Night float | NF | — |

---

## Capture moment differences

| Moment | UH (2-week blocks) | BCM (monthly blocks) |
|--------|--------------------|----------------------|
| Block transition | Every **2 weeks** — high frequency | Every **~4 weeks** |
| Rotation debrief | End of each 2-week block | End of each month block |
| Psychotherapy | Embedded in rotations | **Weekly** parallel track PGY-2+ |
| PGY-3 | Block-based (if PPP) | **Semiannual + weekly OP** |
| Semiannual CCC | ~Block 7B / 13B | ~Block 6 / 13 |

---

## Pilot recommendation

| Program | FISCMAK pilot role |
|---------|-------------------|
| **UH** | Block-native capture (2-week), NF, PPP-1, MedHub CSV |
| **BCM** | Monthly blocks, **PGY-3 continuous outpatient** module, psychotherapy parallel track, 9-site catalog |

Build **program config first**, then import each schedule as seed data—not separate codebases.

---

## Note on BCM diagram year

Source PDF is **2022**. Confirm with program whether block order unchanged before production import. Template sequence in JSON matches diagram; individual resident assignments may vary by cohort.

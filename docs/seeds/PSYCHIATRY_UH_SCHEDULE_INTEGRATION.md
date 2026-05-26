# FISCMAK Integration — UH/VA Psychiatry 2025–2026 Block Schedule

**Sources:**
- **Current (2026–27):** [Google Sheet](https://docs.google.com/spreadsheets/d/1Zx36dUH1JD8dMNySRJA7JjPIqm45YhH0muOZ6HAX1FM/edit) → `psychiatry_uh_2026_2027_block_schedule.json` (**initials only**)
- **Prior:** 2025–26 PDF → `psychiatry_uh_va_2025_2026_block_schedule.json`

**Import CSV:** `uh_2026_2027_block_assignments_import.csv` (520 rows = 20 trainees × 26 blocks)

---

## Schedule structure (what FISCMAK must model)

| Property | Value |
|----------|--------|
| Academic year | July 1, 2025 → June 28, 2026 |
| Block unit | **2 weeks** (26 blocks: 1A–13B) |
| Trainee levels on sheet | PGY-1 (8), PGY-2 (9), PPP-1 (2) |
| Block start | Monday (except NF) |

This is **not** a monthly rotation schedule. FISCMAK capture prompts, rotation debriefs, and “current rotation” context must key off **block ID + dates**, not generic “PGY-1 inpatient.”

---

## Rotation inventory (normalized for platform)

### Psychiatry core (career evidence — high capture value)

| Schedule label | FISCMAK code | Career lattice column |
|----------------|--------------|------------------------|
| VA CT6 | `va_ct6` | Inpatient |
| UH Concord | `uh_concord` | Inpatient |
| SWG | `swg` | Inpatient |
| Northcoast | `northcoast` | Inpatient |
| CAPU (Portals) | `capu` | Child inpatient |
| Psych ED - UH | `psych_ed_uh` | Emergency |
| Psych ED - UH/VA | `psych_ed_uh_va` | Emergency |
| CL | `cl` | CL |
| MPU-CL | `mpu_cl` | CL |
| Child CL | `child_cl` | CL |
| Outpatient Addiction | `outpatient_addiction` | Addiction |
| VA Addiction | `va_addiction` | Addiction |
| MAT Addiction | `mat_addiction` | Addiction |
| Geriatric Psychiatry | `geriatric_psychiatry` | Geriatric |

### Off-service (ACGME-required — moderate capture)

| Schedule label | FISCMAK code | Notes |
|----------------|--------------|--------|
| Neurology | `neurology` | Required; neuropsych interface evidence |
| VA IM | `va_im` | Required medicine month |
| VA ED for IM | `va_ed_im` | |
| UH ED | `uh_ed` | |
| Pediatrics | `pediatrics` | Required |
| Peds ED | `peds_ed` | |
| MedTox | `medtox` | 2-week block |

### Operational / non-evidence blocks

| Label | Code | FISCMAK behavior |
|-------|------|------------------|
| NF | `nf` | Night float — light prompts (autonomy/escalation), no debrief pressure |
| Elective | `elective` | Career exploration capture |
| Vacation | `vacation` | Silent |
| Leave | `leave` | PD visibility only |
| `#` suffix | `bhi_access` | BHI/Access overlay on base rotation |

### Special

| Label | Notes |
|-------|--------|
| UH Interventional | 2-week exposure; interventional psych career signal |
| MPU-CL (PGY-1 Block 1A Alice Hou) | Starts year — verify if typo vs MPU-CL |

---

## PGY patterns from this schedule

### PGY-1 (8 residents)

**Arc:** Heavy **inpatient (VA CT6, UH Concord, SWG)** + **Psych ED** + **off-service (IM, Peds, Neuro, ED, MedTox)** + early **CL/MAT** for some.

FISCMAK should assume PGY-1:
- Changes rotation every **2 weeks** (high churn → **block-start prompts** essential)
- First semiannual review ~**Block 7** (Jan 2026)
- Second ~**Block 13** (June 2026)

**Capture priority rotations:** Psych ED, first inpatient block, first CL (if assigned PGY-1), Neurology.

### PGY-2 (9 residents)

**Arc:** **CL-heavy** + **CAPU** + **Geriatric** + **Addiction** + **NF** + **Northcoast** + return to VA CT6 for some.

FISCMAK should assume PGY-2:
- **Rotation Debrief Builder** after every CL/CAPU/Addiction/Geriatric block
- **Career track signals** emerge (CL, CAP, addiction, geriatric)
- NF blocks: growth/autonomy prompts only

### PPP-1 (2 residents — map to PGY-3 in FISCMAK)

**Arc:** Advanced **CAPU**, **Child CL**, **Northcoast**, **Geriatric**, **Addiction**, **CL** — fellowship/job prep year.

FISCMAK `content_pack` + prompts = **PGY-3 differentiation** (letter writer packet, fellowship narrative).

---

## How this drives FISCMAK product

### 1. `trainee_block_assignments` table (new)

```sql
-- Per resident, per block
trainee_user_id, block_id (e.g. '8A'), rotation_code, overlay_codes[],
start_date, end_date, pgy_level, academic_year
```

Import from:
- Manual CSV export of this PDF/schedule spreadsheet
- Future: MedHub/New Innovations schedule API if available

### 2. Context-aware Mak prompts

When `current_block.rotation_code === 'cl'`:

> “You’re on CL this block (ends Feb 8). What consult this week showed interprofessional or capacity skills?”

When block ends in 3 days → trigger **Rotation Debrief Builder**.

### 3. Career lattice columns = this catalog

Use the **14 psych core + off-service + elective** columns from seed JSON — not generic “Inpatient / Outpatient” only.

### 4. PD dashboard

- **Who is on what block this week** (cohort grid)
- **Upcoming block transitions** (nudge residents to debrief)
- **Required exposure checklist** by PGY (e.g., PGY-1 completed Neurology? CL?)

### 5. Semiannual review timing

| Review | Approx blocks | Dates |
|--------|---------------|--------|
| H1 CCC / semiannual | Blocks 1–13 (~1A–6B) | July–Dec 2025 |
| H2 CCC / semiannual | Blocks 14–26 (~7A–13B) | Jan–June 2026 |

Align `reporting_periods` to these boundaries for this program.

---

## MedHub / eval mapping hint

Rotation names on eval forms likely match schedule labels (`CL`, `VA CT6`, `CAPU`, etc.). The `fiscmak-admin` auto-mapper should use this seed as **canonical rotation vocabulary** when parsing CSV headers and `rotation_name` fields.

---

## Privacy note

The PDF contains **resident names**. Do not import names into FISCMAK marketing or shared docs. Production import maps schedule rows to `user_id` via program roster, not public PDF paste.

---

## Next implementation steps

1. Add migration `trainee_block_assignments` + `rotation_catalog` (seed from JSON)
2. On login, resolve `current_rotation` from block calendar
3. Wire dashboard header: “Block 8A · CL · ends Feb 8”
4. Block-end cron → rotation debrief notification
5. PD cohort view: 26-column grid optional; default “this block” snapshot

---

## Example FISCMAK resident experience (PGY-2 on CL, Block 8A)

**Dashboard shows:**
- Block 8A (Jan 12–25, 2026) · CL · UH/VA
- Career domains this block builds: Clinical Craft, Relational Leadership, Systems Impact
- Suggested capture: capacity consult, family meeting, medicine team communication

**End of block:**
- Rotation Debrief → CV bullets + letter writer note
- Optional share to mentor for semiannual prep

**PD sees (aggregate):**
- % PGY-2s who completed CL debrief this block
- Not private reflection text

# FISCMAK — Mak question cadence (phase-by-phase)

**Audience:** Product, prompt engineering, clinical advisors  
**Status:** Internal spec — May 2026  
**Related:** [FISCMAK_SYSTEM_MAP.md](./FISCMAK_SYSTEM_MAP.md), [FISCMAK_MEETING_OVERVIEW.md](./FISCMAK_MEETING_OVERVIEW.md), `src/lib/v2/onboarding-instruments.ts`, `src/lib/v2/quarterly-pulse.ts`

This document defines **what Mak asks, when, and how validated instruments inform responses** — without user-facing scores.

---

## Design rules (every phase)

### Self-Determination Theory (co-investigator, not judge)

| Do | Don't |
|----|-------|
| "Would you like to explore…?" | "You should transition to…" |
| "Your logs and last check-in suggest…" | "Your score indicates…" |
| Offer 2–3 choices | Single algorithmic recommendation |
| Stop goal pressure when capacity is low | Assign homework when exhausted |

### Cognitive load (one input, many outputs)

- One **sit-down session** or one **voice log** → updates ledger, lattice placement (proposed), instrument storage, Plan hints.
- Never send user to a separate form grid after Mak already captured the answer.
- If exhausted (internal PFI/BITS trend): **shorten** session; skip optional modules.

### O\*NET (internal translation only)

After capture, backend may map text to cross-industry skill labels for **Output Studio pivot docs only**. Mak may say: *"That sounds like operational coordination and resource allocation — want that in your horizon language?"* — never dump O\*NET codes to the user.

### Validation gate (every sit-down)

End each onboarding / quarterly / semiannual / annual session with:

```
VALIDATION CARD (user-facing)
• Fulfillment / strain (qualitative)
• Horizon alignment (one sentence)
• Optional: one anchor theme for lattice

[ Confirm ]  [ Edit with Mak ]  [ Something's off ]
```

**Nothing updates Insights, Plan, or lattice density until Confirm.**

### Internal use of scores (Mak backend only)

| Internal signal | Mak behavior | User sees |
|-----------------|--------------|-----------|
| PFI burnout screen positive | Shorter session; no new goals; shelter language | "Overcast" / sustained burden |
| BITS elevated | Probe friction; suggest boundary topics | "Administrative friction" theme |
| Track energy ↓ vs baseline | Invite horizon review, not panic | "Horizon worth revisiting?" |
| Trend stable + fulfillment strong | Normal coaching depth | "Clear" capacity |

---

## Cadence summary

| Phase | When | Duration | Validated core | Validation |
|-------|------|----------|----------------|------------|
| **Onboarding baseline** | Once, tier 2→3 | ~12–15 min | PFI, BITS*, aspirations, PIF, UWES*, invisible* | Required before tier3 |
| **Quarterly sit-down** | ~every 12 weeks | ~8 min | PFI screen, invisible pulse, career momentum | Required |
| **Semiannual** | ~6 months; align CCC (trainees) | ~15 min | + BITS, PIF pulse, UWES; trainee milestone self-rating | Required |
| **Annual** | ~12 months | ~20 min | Full aspiration refresh, one touchpoint block, year-in-review | Required |
| **Daily / ad hoc** | Anytime | 1–3 min | None (narrative capture) | Per-item confirm optional |
| **CCC prep (trainee)** | Pre-CCC window | ~10 min | Discrepancy reflection (not new scales) | Optional export |

\*BITS, UWES, invisible work: residents, fellows, early/mid attendings — not med students/retired per `deployedInstruments()`.

---

# Phase 0 — First open (before instruments)

**When:** Tier 1 complete, entering instrument sit-down  
**Mak opens with:**

1. *"Welcome — I'm Coach Mak. Over the next ~12 minutes we'll capture a baseline so I can support your career without repeating the same questions. You can pause anytime. Ready?"*

**SDT:** autonomy (pause), competence (purpose explained).

---

# Phase 1 — Onboarding baseline (full instrument battery)

**When:** Onboarding, after tier 2  
**Code:** `instrument-conversation-service.ts`, clusters in `onboarding-instruments.ts`  
**Order:** Follow `clustersForInstruments(deployedInstruments(level, setting))`

### 1A — Stanford PFI (4 clusters)

| Cluster ID | Mak asks (canonical) |
|------------|-------------------|
| `pfi-fulfillment` | On a 0–4 scale where 4 is highest, how fulfilled do you feel in your work overall — including meaning, contribution, and satisfaction? |
| `pfi-burnout-exhaustion` | On a 0–4 scale, how often do you feel emotionally exhausted from your work? |
| `pfi-burnout-disengagement` | On a 0–4 scale, how detached or cynical do you feel toward patients, colleagues, or your organization? |
| `pfi-self-valuation` | On a 0–4 scale, how valued do you feel by your institution or organization for the work you do? |

**Follow-up (conversational, not scored):** *"What's one thing contributing most to that fulfillment — or draining it?"*

### 1B — BITS (2 clusters) — if deployed

| Cluster ID | Mak asks |
|------------|----------|
| `bits-unnecessary` | On a 1–5 scale, how much of your work feels unnecessary or could be eliminated without harming care? |
| `bits-unreasonable` | On a 1–5 scale, how often are you asked to do tasks that feel unreasonable given your role or training? |

**Follow-up:** *"What task this month felt most illegitimate?"* → maps to invisible-work dimension internally.

### 1C — Career aspirations (2 clusters)

| Cluster ID | Mak asks |
|------------|----------|
| `career-track-energy` | On a 1–10 scale, how energized do you feel about your primary career track right now? |
| `career-5yr-goal` | What is your most important career goal for the next five years? |

**Follow-up (SDT horizon, not prescription):** *"Which lattice directions interest you most — educator, clinician, researcher, systems leader, advocate, innovator, quality, or wellness champion — or several?"* → user selects ★ targets.

### 1D — PIF / identity (1 cluster)

| Cluster ID | Mak asks |
|------------|----------|
| `pif-stage` | Do you feel your professional identity is mostly shaped by others' expectations, authored by you, or transforming beyond either? (1 = others' expectations, 5 = self-transforming) |

**Follow-up:** *"In one sentence, how would you describe who you are as a physician right now?"* (feeds Q1.3 narrative)

### 1E — UWES-9 (1 cluster) — if deployed

| Cluster ID | Mak asks |
|------------|----------|
| `uwes-engagement` | On a 0–6 scale, how engaged do you feel at work — vigor, dedication, and absorption combined? |

### 1F — Invisible work (1 cluster) — if deployed

| Cluster ID | Mak asks |
|------------|----------|
| `iw-hours` | Roughly how many hours per week do you spend on invisible work — after-hours EHR, prior auth, care coordination, uncompensated call, informal mentoring? |

**Follow-up:** *"Which category weighs heaviest?"* → use `invisibleWorkPromptsForSetting()` categories.

### 1G — Onboarding validation card

**Mak summarizes (no numbers):**

- **Capacity weather:** Clear / Variable / Overcast (from internal PFI/BITS)
- **Fulfillment theme:** one line
- **Five-year horizon:** user's words
- **Identity anchor:** one line from PIF + narrative

*"Does this sound like you?"* → Confirm saves `instrument_answers`, `instrument_scores` (internal).

### 1H — Post-baseline (same onboarding)

| Step | Mak prompts |
|------|-------------|
| CV upload | *"Have a CV or resume? Uploading helps me map your career — you'll confirm every suggestion."* |
| Reconcile | Per item: *"I found [X] — map to [track × skill]?"* |
| Initial goals | *"What's one development goal and one sustainability goal for the next 90 days?"* |

---

# Phase 2 — Daily / ad hoc capture

**When:** Anytime via Mak panel  
**No validated scale** — single-input extraction.

### Opening (if no context)

*"What's on your mind — something you did, something draining, or something you're proud of?"*

### Mining follow-ups (pick 1–2, not all)

| Purpose | Mak asks |
|---------|----------|
| Structure | *"Roughly how long did that take?"* |
| Lattice | *"Does that feel more clinical, teaching, leadership, advocacy, or systems work?"* |
| Energy | *"Did that energize you, drain you, or neutral?"* |
| Evidence | *"Want me to save this to your ledger?"* |
| Horizon (SDT) | *"Does this connect to the [horizon they named], or is it separate?"* |

**Behind scenes:** classify → proposed evidence → user confirm in Activities or batch reconcile.

---

# Phase 3 — Quarterly sit-down (~12 weeks)

**When:** `quarterlyPulseStatus()` due (~84 days)  
**Code:** `QUARTERLY_MODULES`, `buildQuarterlyModulePrompt()` in `quarterly-mak-flow.ts`  
**Target duration:** ~8 minutes (may skip `cv_update` if low capacity)

### Session open

*"It's your quarterly sit-down — about 8 minutes. I'll ask a few validated check-in questions, then you confirm a short summary. We can skip anything today."*

**Internal:** compare to onboarding PFI/BITS/invisible baseline; if burnout screen was elevated last quarter, offer **full PFI** instead of 2-item screen only.

---

### Module 1 — Well-being screen (`pfi_screen`)

**Validated basis:** PFI exhaustion + depersonalization (short pulse)

**Mak asks:**

```
Rate emotional exhaustion from 0 (never) to 6 (every day).
Rate depersonalization / cynicism from 0 to 6.
Or describe in your own words how the quarter felt.
```

**Internal:** `parsePulseAnswers()` → `burnout_screen`; compare to prior quarter.

**Mak response style (no scores):**

- Improved → *"This quarter sounds a bit more sustainable than last — what's shifted?"*
- Worse → *"Sounds heavier than last quarter. Want to keep today's sit-down short and focus on preservation?"*
- Stable → proceed to module 2

---

### Module 2 — Unrecognized work pulse (`invisible_pulse`)

**Validated basis:** invisible work taxonomy + BITS-informed friction

**Mak asks:**

```
Estimate weekly hours for:
[list from invisibleWorkPromptsForSetting — documentation, coordination, teaching, admin, DEI, maintenance]

What changed most since last quarter?
```

**Internal:** `parseInvisibleWorkFromAnswers()`; flag if >25% above `pulse_baseline`.

**Mak response:** *"A lot of your energy this quarter seems tied to [category]. Want that reflected as a friction note on your map, or keep it private for now?"*

---

### Module 3 — Career momentum (`career_momentum`)

**Validated basis:** aspirations track energy (not full instrument)

**Mak asks (canonical from code):**

1. Progress on your active goals this quarter?
2. Any new achievements (publications, grants, roles, awards)?
3. Biggest barrier to progress?
4. Track energy (1–10)?
5. Any interest in changing setting or track?

**SDT follow-up on #5:** *"Would you like to explore that change, or just name it for now?"*

**Internal:** `track_energy` stored; semantic distance to 5-yr goal (future).

---

### Module 4 — Quick CV update (`cv_update`) — optional if capacity OK

**Mak asks:**

```
Any new publications, grants, committee roles, teaching assignments, or awards since your last update?
List briefly — we'll reconcile against enrichment.
```

**Skip if:** internal capacity Overcast or user declines.

---

### Quarterly validation card

**User sees:**

| Section | Example |
|---------|---------|
| **Capacity weather** | Variable — strain up, fulfillment steady |
| **Friction theme** | Care coordination and after-hours documentation |
| **Momentum** | Progress on [goal]; barrier: [user words] |
| **Horizon** | Still aligned with [5-yr goal] / worth revisiting |
| **Lattice hint** | Optional: *"Educator × Communication emerging"* |

**On confirm:** append `pulse_history`, update Insights themes, adjust Plan intensity, refresh capacity weather UI.

**User does NOT see:** Career Health Score /100 (retire from `buildQuarterlyPulseSummary` user paths).

---

# Phase 4 — Semiannual sit-down (~6 months)

**When:** Every 2 quarters OR aligned with trainee CCC reporting period  
**Duration:** ~15 min

### Add to quarterly core

| Block | Mak asks | Validated basis |
|-------|----------|-----------------|
| **Full BITS** | Same 2 questions as onboarding 1B | BITS |
| **PIF pulse** | Same as `pif-stage` + *"What's shifted in how you see yourself since onboarding?"* | PIF / Tagawa |
| **UWES pulse** | Same as onboarding 1E | UWES-9 |
| **Horizon check** | *"Still your five-year direction: [quote]? Anything to add or revise?"* | Aspirations |

### Trainee-only — CCC prep block

**When:** Pre-CCC window, evals imported

1. **Self-rating intro:** *"For each area on your milestone map, how would you rate your current development — and where do you and your evaluators seem to disagree?"*  
   (Structured self-rating per subcompetency — ACGME scale, criterion-referenced.)

2. **Discrepancy reflection (not excuse-making):**  
   *"I see a gap in [subcompetency]. What evidence supports your self-view? What do you want to ask your PD about in CCC?"*

3. **Optional packet:** *"Want to include any ledger items or talking points in your CCC export?"* — **user selects**

**Mak does NOT:** auto-pair milestone dips with workload as "shield" to CCC; may discuss sustainability **privately** if user raises it.

### Semiannual validation card

Same as quarterly + **Identity note** + **Trainee: CCC talking points (3 bullets)**

---

# Phase 5 — Annual sit-down (~12 months)

**When:** ~365 days from onboarding or last annual  
**Duration:** ~20 min

### Blocks

| Block | Content |
|-------|---------|
| **Full aspiration refresh** | Re-ask `career-5yr-goal`, track energy, *"What would you want your year-in-review to highlight?"* |
| **One touchpoint module** | Conversational subset from `question-bank.ts` — rotate annually: Y1 INVENTORY, Y2 VALUES, Y3 GAPS, etc. |
| **Year synthesis** | Mak drafts anchors + energy arc from 4 quarterly validates |
| **10-year north star** | *"Optional: one sentence about the kind of physician you want to be remembered as — no pressure to be precise."* |

### Suggested annual touchpoint questions (conversational, 4–6 per year)

**Year A — INVENTORY (from TP2):** Q2.1 teaching impact, Q2.6 non-billable time, Q2.10 QI leadership  
**Year B — VALUES (TP4):** Q4.1 top values, Q4.3 alignment, Q4.8 promotion story  
**Year C — GAPS (TP5):** Q5.5 strongest domain, Q5.6 development domain, Q5.7 promotion timeline discussed  
**Year D — ACCOUNTABILITY (TP7):** Q7.2 one commitment, Q7.3 progress on last commitment  

### Annual validation → Year in review PDF

User confirms narrative; generates export — **no score page**.

---

# Phase 6 — Ongoing touchpoint bank (background, not quarterly)

**When:** Between sit-downs if touchpoint due (`touchpoint-eligibility.ts`)  
**How:** Mak weaves **one question at a time** into conversation — not a form.

**Rule:** Prefer questions **not** already covered by instruments (avoid duplicate burnout Likert from Q3.x if PFI captured).

**Priority order for Mak:**

1. Identity / narrative (Q1.3, Q1.4, Q4.2, Q4.8)
2. Invisible work inventory (Q2.6, Q3.6)
3. Values / gaps (Q4.x, Q5.x) for attendings approaching promotion
4. Market / accountability (Q6.x, Q7.x) only if user invites career move talk

---

# Phase 7 — Reconcile & map (Objective)

**When:** After CV parse or enrichment  
**Mak asks per candidate:**

*"I read '[snippet]' from your CV — should I map this to **[Track × Skill]** as confirmed evidence, proposed, or dismiss?"*

**On confirm:** lattice cell density updates (ipsative); micro-card text available.

---

# Phase 8 — Plan & horizon (★ markers)

**When:** User sets/changes horizon in Plan  
**Mak asks:**

1. *"Which 2–3 intersections matter most for [horizon]?"* → ★ on lattice  
2. *"What would 'progress' look like in plain language — not a score?"*  
3. *"Want me to notice work that fills those intersections when you log it?"*

**SDT:** user chooses ★; Mak never auto-stamps targets.

---

# Phase 9 — Output Studio

**When:** User generates document  
**Mak asks:**

1. *"Which horizon is this document for?"*  
2. *"Include only confirmed evidence, or include proposed too?"* (default: confirmed)  
3. *"Apply energy-alignment filter — emphasize energizing, horizon-aligned bullets?"* (yes/no)

**During edit:** *"Click any sentence and I'll show the evidence behind it."*

---

# How instruments inform Mak responses (reference table)

| Internal reading | Mak coaching adjustment | Lattice / UI |
|------------------|-------------------------|--------------|
| PFI fulfillment strong, burnout low | Normal depth; explore growth | Anchored cells highlighted softly |
| Burnout screen positive | Short sessions; shelter mode; no new goals | Protective filter: dim grid, show energy givers |
| BITS unreasonable high | Name friction; invite boundary conversation | Amber border on draining cells |
| Invisible hours ↑25% | Probe categories; recognition narrative | Systems / admin cells density ↑ |
| Track energy ↓ | Invite horizon review | ★ bridge language in Plan |
| PIF stage low (externalized identity) | Relatedness prompts; mentor reflection | Identity anchor in Insights |
| Trainee discrepancy ≥2 | CCC prep; calibration language | Heatmap overlay only |

---

# Institution-facing (Mak does NOT ask residents these)

PD/coordinator workflows use **imports and batch summaries** — not Mak chat.

Residents never asked to justify milestone dips to the institution via Mak; **optional** CCC talking points are **user-selected**.

---

# Implementation notes

| Item | Code today | Target |
|------|------------|--------|
| Onboarding clusters | `onboarding-instruments.ts` | + validation gate before tier3 |
| Quarterly modules | `quarterly-pulse.ts`, `quarterly-mak-flow.ts` | + validation card; hide CHS in summary |
| Semiannual / annual | Partial (`annual-mak-flow.ts`) | Align to this spec |
| Touchpoint bank | `question-bank.ts`, `conversational-assessment-service.ts` | Sparse, dedupe vs PFI |
| BITS on quarterly | Not in QUARTERLY_MODULES yet | Add every 2nd quarter or semiannual |

---

# Quick reference — quarterly review contents

**What the quarterly sit-down includes:**

1. PFI screen (exhaustion + depersonalization)  
2. Invisible work hours by category + change since last quarter  
3. Career momentum (goals, achievements, barrier, track energy 1–10, setting/track interest)  
4. Optional CV delta  
5. **Validation card** (capacity weather, friction, momentum, horizon)  
6. **After confirm only:** Insights update, Plan adjustment, lattice energy notes  

**What quarterly does NOT include:** full 60-Q bank, UWES (semiannual), milestone self-rating (semiannual trainees), user-facing scores.

---

*Internal — align prompt changes with this cadence and SDT co-investigator tone.*

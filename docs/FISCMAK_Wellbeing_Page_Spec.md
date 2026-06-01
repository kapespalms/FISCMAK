# FISCMAK — Well-Being Surface Spec (`/app/wellbeing`)

**Version:** 1.0 · **Date:** 2026-06-01 · **Owner:** Kristen Palmer, MD
**Status:** Design reference for the well-being page + onboarding baselines. Build the page as a HOME that fills in over phases — not a one-off form. Source: Master Review Part VIII (battery), Part XI (lifecycle), Part XVII.4 (origami), Part XIX (governance).

> **Architectural decision (2026-06-01):** well-being gets its own MECE zone, `/app/wellbeing`. It is distinct from `/app/subjective` (conversational Mak) because the FCWI/pulse are *standardized instruments*, not conversations. Declare this in `docs/page-ownership.md`.

---

## A. ONBOARDING — baselines (captured once at signup)

Light touch. Sets the day-zero anchor so longitudinal change has a reference.

1. **FCWI baseline** — 9 items, 0–4, `frequency_tier='onboarding'` → `fcwi_responses`.
2. **Weekly pulse baseline** — EE/DP/QoL/MDT once → `weekly_pulse`, anchors the trend line.
3. **Domain energy ranking** — ✅ already built (Phase 2.4). A well-being signal too; lives in intake but belongs to the well-being story.
4. *(Deferred)* Hobbies/avocation prompt (Gap-2 engagement signal) — flag for later, not Phase 3.

---

## B. THE LONGITUDINAL PAGE (`/app/wellbeing`) — the home

Two halves: recurring inputs (filled on a cadence) + outputs (viewed, not filled).

### B1 — Recurring inputs (by cadence)

| Cadence | Instrument | Items | Table |
|---|---|---|---|
| Weekly | Weekly pulse | EE·DP·QoL·MDT + 2 free-text energy prompts + invisible flag | `weekly_pulse` |
| Monthly | FCWI | 9 items, 0–4 | `fcwi_responses` (`frequency_tier='monthly'`) |
| Quarterly | Snapshot recalibration | energy ranking re-do + FTE update + FCWI + MDT | multiple |
| Annual | Full reassessment | + Interest Profiler re-run | multiple |

Page shows **"what's due now"** so the physician knows what to fill without hunting (e.g. "Your weekly pulse is ready").

### B2 — Outputs (viewed, not filled — mostly Phase 5)

5. **Well-being origami plot** — 7 axes: EE · DP · FCWI-Meaningfulness · MDT · FCWI-Energy · FCWI-Recognition · FCWI-Self-Care. Each with its own threshold. **NO composite area score.**
6. **Longitudinal trend lines** — EE/DP/QoL/MDT over time (the payoff of weekly capture).
7. **Plain-language summaries** — never raw scores or instrument names; "Some responses suggest you may benefit from…" framing.
8. **Distress resource surfacing** — MDT ≥4 → gentle resource link + pause. Never auto-reported, never institution-facing.

---

## C. GOVERNANCE GUARDRAILS (hard rules, apply everywhere)

- **NO composite well-being score is ever shown.** (FCWI has no composite column by design.)
- **Plain language only** — "PFI," "MBI," "MDT," "FCWI" never appear in the physician UI.
- **MDT ≥4 → resource link + pause, never auto-reported.**
- **Physician-owned; never institution-facing** at the individual level.

---

## C2. WHERE WELL-BEING DATA APPEARS vs. FEEDS (critical separation)

Well-being is a **parallel layer**, not nested inside the lattice. Two surfaces are siblings:
- `/app/wellbeing` = how you *feel* (FCWI, pulse, origami, distress)
- `/app/lattice` (career) = who you *are / where you fit* (8×8 lattice, RIASEC circumplex, transfer pathways)

**Do NOT cross them.** The 8×8 lattice shows *evidence density × energy* — it does NOT display well-being scores. The RIASEC/Prediger circumplex is a CAREER-fit visualization → it belongs on the lattice/career surface, NOT on `/app/wellbeing`.

**Where each well-being signal is SHOWN vs. USED:**

| Well-being data | SHOWN to physician (where) | USED by formulas (input only) |
|---|---|---|
| FCWI items | origami plot (7 axes, each separate) | F5 Recognition Gap; energy-evidence cross-ref |
| Energy ranking | lattice cell **color (hue)** | F7 Transfer Potential; F5 |
| MDT | distress resource link only | trigger only (not a lattice input) |
| EE / DP / QoL | origami + longitudinal trend lines | well-being trend |
| FTE self-report | (not on well-being page) | F3 Structural; F4 Perception |

**The hard rule restated:** well-being numbers are *inputs to the intelligence* and a *separate visualization* (origami) for the physician — **never a headline/composite score, and never printed on the lattice.** The formulas consume the numbers internally; what surfaces to the physician is plain-language framing + the 7 separate origami axes.

---

## D. Build sequence (how the page fills in)

| Slice | Adds to the page |
|---|---|
| **3.1 (now)** | `/app/wellbeing` page shell + FCWI form (monthly + onboarding baseline) + page-ownership entry |
| **3.2** | Weekly pulse form + "what's due now" logic |
| **3.3 / later** | Quarterly snapshot flow |
| **Phase 5** | Origami plot + trend lines (need accumulated data + formulas) |

**Build the 3.1 shell to accommodate B1 + B2 later** — don't build a form-only page that needs retrofitting. The page is a home that grows; the FCWI is just its first resident.

---

## E. One UX decision (founder, pending)

Inputs (forms) and outputs (origami, trends) — **same page** (`/app/wellbeing` = one well-being home) **or split** (forms here, visualizations on dashboard)? Current intent: **one home.** Revisit when building Phase 5 visualizations.

*Companion: FISCMAK_Master_System_Review.md Part VIII/XI/XVII/XIX · BUILD_ORDER.md Phase 3.*

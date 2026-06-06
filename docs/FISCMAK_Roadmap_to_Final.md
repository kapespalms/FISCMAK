# FISCMAK — Roadmap to Final

**Version:** 1.0 · **Date:** 2026-06-02 · **Owner:** Kristen Palmer, MD
**Status:** Master sequence — retirement + consolidation + build, start to finish. Supersedes ad-hoc ordering; pulls execution detail from `FISCMAK_Build_vs_Vision_Audit.md`, `FISCMAK_Capture_Architecture_Spec.md`, `FISCMAK_Invisible_Work_Capture_Spec.md`, and `BUILD_ORDER.md` (formulas).

---

## The governing rule (the one test)

> **Does it land in `evidence_unit` with the three-layer tag (lattice now, + ACGME, + O*NET-slot reserved)?**
> **On-spine → keep. Bypasses the spine → rebuild onto it, or retire.**

This is both the conformance test and the retirement criterion. Every step below is sorted by it.

**Safe-execution principle:** *route-to-new before retire-old.* Never delete a capture path until its replacement exists, or you create a gap where nothing is captured.

**Status key:** ✅ done · 🟡 partial · ⬜ not started · 🔒 founder-gated decision

---

## PHASE A — Stop the bleeding & retire dead weight
*Low-risk, contained. Nothing here needs the new engine first, except A1.*

| # | Step | Status | Notes |
|---|---|---|---|
| A1 | Stop new writes to superseded `career_assessments` (Mak + `/app/assessment`). Re-point Mak capture to `activity_entries` staging (exists) until Phase B lands. | ⬜ | *Route-to-new first:* don't kill the surface until B is built; just stop the superseded write. |
| A2 | Retire dead Mak code — `components/mak/MakChat.tsx` + deprecated `/api/mak/message`. | ⬜ | Real dock is `MakPanel.tsx`. Pure delete. |
| A3 | Gate/retire **PARKED jobs** subsystem (`/app/jobs`, `/v1/jobs/*`, nav tab). | ⬜ 🔒 | Decision: remove vs. feature-flag off for pilot. |
| A4 | Gate/retire **deferred industry-career** builder. | ⬜ 🔒 | Decision: keep gated vs. hide for pilot. |
| A5 | Retire the second lattice — `DualLatticeGrid` + `/api/v1/lattice/route.ts` (reads dead `career_assessments`). | ⬜ | `LatticeHeatmapV3` is already mounted; this removes the duplicate. |
| A6 | Retire CDI/PFI touchpoint scoring (`touchpoint-submit.ts` composite + PFI burnout). | ⬜ | Superseded model; route touchpoint well-being to `fcwi_responses`/`weekly_pulse`. |
| A7 | Update `V2_V3_INVENTORY` with uncatalogued tables (`output_documents`, `cv_item_metadata`, `promotion_dossier`, `narrative_progress`, `mempalace_exports`, `user_job_matches`, `profiles`). | ⬜ | Can't say what's canonical until these are classified. |
| A8 | Hygiene: make `/app/documents` a redirect; move doc-builder panels off the Profile page; flag Profile→`profiles` split-brain (🔒 user-data); verify `/lattice/quadrant-summary` consumer. | ⬜ 🔒 | |

---

## PHASE B — Build the capture spine (the engine)
*This is the C4 gap — the biggest vision-vs-build delta. Everything downstream needs it.*

> **Sequencing (write-side vs. read-side):** **B1 is a PRE-CAPTURE GATE — it must ship before residents capture anything.** PHI is write-side: once unscrubbed text lands in the DB you can't un-store it cleanly (breach-class cleanup, not a refactor). **B2–B5 are read-side / enrichment and CAN be applied after launch** — captures taken under the simpler path reprocess cleanly through the classifier later, no migration pain.

| # | Step | Status | Notes |
|---|---|---|---|
| B1 | **PHI-strip guardrail (PRE-CAPTURE GATE)** — shared deterministic strip (regex → typed tokens: MRN / SSN / phone / email / DOB / name patterns) on every free-text turn, **before** classify/store; LLM is a second pass, **never LLM-only**. First reconcile with **Ticket 11** (verbatim-never-stored already shipped) — add the strip as defense-in-depth, don't rebuild. | ⬜ ✅ **decided** | **DECIDED: rules-first, LLM-backup.** A privacy office trusts a readable regex over a model. **Must land before any real resident capture.** Gate = standing Jane-Doe/MRN regression test (deterministic layer alone passes with model stubbed off). |
| B2 | Wire **`narrative_evidence`** (table exists, zero code) — physician-only SI/subjective store. | ⬜ | |
| B3 | **Pulse → pipeline.** Route weekly/monthly boost/drain free-text through the classifier (invisible-quadrant + energy-valence rules) → staging → confirm. | ⬜ | The free-text is already collected and currently dangling. |
| B4 | **Mak → capture router.** Mak extracts per-lane (career item / patient-care aggregate / invisible+energy / hours / goal / direction) → same staging → confirm; Mak runs the conversational confirmation. | ⬜ | The "Mak = daily capture" vision. |
| B5 | **Dedup/merge** — match new capture against existing `evidence_unit` so the same accomplishment isn't re-added or re-asked. | ⬜ | Prevents the "I already told you this" problem. |

---

## PHASE C — Confirmation & energy

| # | Step | Status | Notes |
|---|---|---|---|
| C1 | **Confidence-triage confirmation UI** — the shared human gate for ALL sources (auto-accept high, surface ~15%, one bulk-confirm). | ⬜ | Makes capture usable by a real physician; nothing enters the lattice unconfirmed. |
| C2 | **Skill energy ranking** + per-cell energy computation (predicted from domain+skill → observed from evidence). | ⬜ 🔒 | 🔒 decisions: blend rule; one dot vs two; `skill_index` on `energy_rankings` vs separate table. |
| C3 | **Lattice finalize** — 2×2 quadrant landing view (BUILD_ORDER 4.4); heat-map polish (density ramp 🔒 navy vs treasury-gold, energy glyphs, tooltip); one lattice only. | 🟡 | Heat map built + rendering; quadrant + final polish remain. |

---

## PHASE D — Output Studio consolidation (the C3 fragmentation fix)

| # | Step | Status | Notes |
|---|---|---|---|
| D1 | Migrate the 7 doc builders (academic core/dossier, narrative, portfolio, cover letter, industry, promotion) onto the **`evidence_unit` bank**, applying the §7 rule: **single primary placement + per-document dedup**. | ⬜ | The duplicate-bullet fix lives here. |
| D2 | Retire JSON-blob doc storage + the v2 "Document Library" toggle. | ⬜ | Route-to-new (D1) before retire-old. |
| D3 | Monthly CV bullets generated from the bank; edit-in-app or edit-with-Mak (snapshot editing, no write-back). | 🟡 | v3 CV Studio bank exists; bullets/monthly + edit-with-Mak to finish. |

---

## PHASE E — Intelligence layer (O*NET / fit) — *Phase 2+*

| # | Step | Status | Notes |
|---|---|---|---|
| E1 | F1 density ✅ · F3/F4/F5 ✅ · **F7 transfer potential** (BUILD_ORDER 5.4), **seven-gap** (5.5). | 🟡 | F1–F5 built; F7 + seven-gap remain. |
| E2 | **O*NET fit** — F6 person-occupation fit, F8 hobby-profession bridge, adjacent-SOC signals (career-direction). | ⬜ | The O*NET *home* (tables) exists; the *intelligence* is deferred. |
| E3 | Well-being origami plot (BUILD_ORDER 5.6) — 7 axes, FCWI-based, §C2-separate. | ⬜ | |

---

## PHASE F — Hours & institutional value

| # | Step | Status | Notes |
|---|---|---|---|
| F1 | **Hours tracking** (visible side only — duty-hours, MedHub replacement). | ⬜ 🔒 | 🔒 decision: where hours live + how they surface to trainee/institution. Never a weight on invisible work. |
| F2 | Institutional aggregates (de-identified, N≥5, ranges not precision, no drill-to-one). | ⬜ | Physician-owned; institution sees aggregates only. |

---

## FINAL STATE — what "done" means

A physician can:
1. **Onboard** → specialty/SOC, FTE, energy rankings (domain + skill), goals. ✅🟡
2. **Capture daily** by *talking to Mak* (or a 15-sec pulse) → routed, PHI-stripped, classified into cells, energy-tagged, staged. ⬜
3. **Confirm** a rolled-up picture that *rings true* (triage, not an audit log). ⬜
4. See a **single lattice** — density × energy × quadrant, drill into any cell's evidence. 🟡
5. **Generate any career document** from one bank — each accomplishment placed once, edited in-app or with Mak, no repetition. 🟡
6. Get **career-direction** insight (O*NET adjacency/fit). ⬜
7. Have **hours** tracked for them (trainees/institution). ⬜
8. The institution sees **de-identified aggregates only.** ⬜

Everything on-spine: one capture → `evidence_unit` (three-layer) → many outputs. Nothing bypasses it.

---

## Founder decisions that gate the build (🔒)

| Gate | Blocks | Question |
|---|---|---|
| Jobs / industry-career | A3, A4 | Remove, or feature-flag off for pilot? |
| ~~PHI-strip design~~ ✅ **RESOLVED** | B1 | **Rules-first (deterministic, always-on) + LLM second pass — never LLM-only.** Fail-safe = the deterministic layer alone must pass the PHI test with the model stubbed off. Pre-capture gate. |
| Energy model | C2 | Blend rule; one dot vs two; skill-energy storage location. |
| Heat-map ramp | C3 | Navy vs treasury-gold. |
| Hours home | F1 | Where stored; how surfaced to trainee/institution. |
| Profile split-brain | A8 | Migrate `profiles` → `app_users` (user-data, founder-gated). |

---

## Recommended start

**Phase A1–A2 + B1–B2** is the cleanest opening move: stop the superseded writes, delete dead code, build the PHI guardrail, and wire `narrative_evidence`. It's contained, it stops new data piling into the wrong place, and it lays the foundation for the capture engine — without touching anything load-bearing.

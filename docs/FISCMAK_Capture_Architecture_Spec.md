# FISCMAK — Capture Architecture Spec (Mak + Pulse → Evidence)

**Version:** 0.1 (draft for build) · **Date:** 2026-06-02 · **Owner:** Kristen Palmer, MD
**Status:** CANONICAL design for how *all* capture reaches the lattice. Resolves audit findings **C2** (superseded `career_assessments` still written) and **C4** (Mak capture unbuilt at the v3 layer), and operationalizes the layered energy model.
**Companions:** `FISCMAK_Invisible_Work_Capture_Spec.md` (the longitudinal energy/no-time model — this spec implements its capture path), `FISCMAK_Build_vs_Vision_Audit.md` (the gap this closes), `FISCMAK_Master_System_Review.md` (Part IX formulas, Part XIX governance).

---

## 1. The core principle — one classifier, many inputs, one bank

There is **one** classification engine and **one** confirmed evidence store. Every capture source feeds the same pipeline:

```
   INPUT SOURCES                 SHARED ENGINE                    STORES
 ┌───────────────┐
 │ CV / documents│──visible──┐
 ├───────────────┤           │   ┌──────────────┐   ┌────────────────────┐   ┌──────────────────────┐
 │ Weekly pulse  │──text─────┼──▶│  CLASSIFIER  │──▶│  activity_entries  │──▶│  CONFIRM (physician) │
 │ (boost/drain) │           │   │ text → cells │   │     (staging)      │   │  triage / "rings     │
 ├───────────────┤           │   │ + energy     │   └────────────────────┘   │  true?"              │
 │ Mak chat      │──text─────┘   │ + quadrant   │                            └──────────┬───────────┘
 └───────────────┘               └──────────────┘                                       │
                                                                                         ▼
                                                       ┌─────────────────────────────────────────────┐
                                                       │ evidence_unit + evidence_cell_weights        │
                                                       │ (confirmed, lattice-ready, energy-tagged)    │
                                                       │ narrative_evidence (SI / subjective probes)  │
                                                       └─────────────────────────────────────────────┘
```

**The only differences between sources are the *quadrant rule* and the *energy signal*** — not the engine. The classifier already exists (`parseDocumentToCvRows` + `keywordPlacement` + ontology matching). We point the other sources at it.

| Source | Quadrant it can produce | Energy signal | Status today |
|---|---|---|---|
| CV / documents | **Visible only** (OV / SV) | none (CVs don't carry energy) | ✅ built (the one working path) |
| Weekly/monthly pulse free-text | **Invisible-capable** (OI / SI) + visible | **carried** (boost = energizing, drain = draining) | ⚠️ text captured, goes nowhere |
| Mak chat | any, routed by lane (below) | **probed** (Mak asks) | ⚠️ classifies to v2 staging + a *superseded* table only |

---

## 2. Mak as the daily capture router

When a physician talks to Mak ("got a new publication," "did a bunch of prior auths and a tough psych eval"), Mak **routes each item into a lane**, then sends it through the shared classifier:

| You say | Lane | Quadrant / energy | Lands in |
|---|---|---|---|
| New publication / award / committee role | **Visible career item** | OV/SV, no energy | evidence bank → Output Studio |
| "6 new psych evals in the ED today" | **Patient-care volume** | aggregate counts + setting/dx *categories* | clinical cells + institutional aggregates |
| "Prior auths drained me / mediated a conflict" | **Invisible + energy** | OI/SI, energy = draining | invisible cells (the gap CVs can't fill) |
| "Worked a 14-hour shift" | **Hours** (visible only) | duty-hour tracking | hours log (MedHub replacement) |
| "Thinking about my 1-year goal" | **Goal** | — | `goal_records` (WOOP/SMART) |
| "Should I consider industry?" | **Career direction** | — | O*NET adjacency |

Mak can **probe the missing dimensions** rather than infer them — "did that energize or drain you?", "was that work recognized?" — producing cleaner energy valence and invisible/recognition signal than a form ever could. And Mak does the **confirmation conversationally** (§5): "sounds like coordination keeps draining you — does that ring true?"

---

## 3. The classification step (shared engine)

Each input string is classified into:

- **Cell distribution** — multi-cell weighted `(skill_index × domain_index)` per the existing model (top ~3 cells, min weight 0.15, normalized to 1.0). *Not single-tag.*
- **Recognition quadrant** — OV/OI/SV/SI. CV path = visible only; pulse/Mak path may assign **invisible** (OI/SI), using the "felt unrecognized" flag and drain context as signals.
- **Energy valence** — 1–5, from the source (boost/drain prompt, or Mak probe). Written to `evidence_unit.energy_score`.
- **Confidence** — drives the confirmation triage (§5).

> **Adaptation needed:** the classifier is tuned for CV lines ("Designed a 12-session curriculum"), not conversational text ("rough day with the EHR"). Pulse/Mak input needs either classifier tuning or an LLM-assisted extraction pass (Mak itself, since it's already an LLM in the loop). This is the main technical work.

---

## 4. The layered energy model (resolves per-cell energy)

Energy attaches to a **cell** as a blend of three signals — a prediction that converges to observed reality:

1. **Predicted (cold-start prior)** = `blend(domain_energy_rank[d], skill_energy_rank[s])`. Lets the lattice show energy from day one, before any evidence. *(Requires adding a skill-energy ranking — see §6; domain ranking already exists.)*
2. **Observed (ground truth)** = weighted aggregate of `evidence_unit.energy_score` for the evidence in that cell. What actually happened.
3. **Displayed cell energy** shifts **predicted → observed** as evidence accumulates (Bayesian-style: prior = rankings, data = evidence).

**The gap between predicted and observed is itself an insight** — same construct as the F4 perception gap. "You ranked Research energizing, but the evidence keeps coming back draining" is a real signal, surfaced gently by Mak.

The **visible/invisible split** on evidence energy gives the four-way map: invisible+energizing = *hidden gift / transfer candidate*; invisible+draining = *burnout danger zone*.

---

## 5. Confirmation & governance (nothing enters the lattice unconfirmed)

Per the invisible-work spec §8 and Part XIX governance:

- Captures land in **`activity_entries` (staging)**, never directly in the lattice.
- The physician confirms the **rolled-up picture** (daily → weekly → monthly "does this still ring true?"), not a 30-row audit log. Confidence-triage UI: auto-accept high-confidence, surface the uncertain ~15%, one bulk-confirm.
- Only on confirmation → write **`evidence_unit` + `evidence_cell_weights`** (and **`narrative_evidence`** for subjective/SI probe responses).
- **Reward recognition, never volume.** No streaks, no points, no "log more to fill faster." Naming the same work twice doesn't multiply it.

---

## 6. Storage map (what lands where)

| Data | Table | Status |
|---|---|---|
| Raw capture (CV line, pulse text, Mak utterance) | `activity_entries` (v2 staging, deliberate reuse) | ✅ exists |
| Confirmed evidence, primary cell | `evidence_unit` (+ `energy_score`, `recognition_quadrant`) | ✅ exists |
| Confirmed evidence, full cell distribution | `evidence_cell_weights` | ✅ exists |
| Subjective / SI probe responses (physician-only) | **`narrative_evidence`** | ⚠️ table exists, **zero code** — must be wired |
| Domain energy ranking | `energy_rankings` (domain_index) | ✅ exists |
| **Skill energy ranking** | needs `skill_index` on `energy_rankings` *or* a parallel table | ❌ **founder-gated schema change** |
| Hours (visible clinical time) | duty-hour store (visible side only) | ❌ to design |

---

## 7. From bank to document — multi-cell in, single placement out

The multi-cell model is the lattice's strength and the document's hazard: one accomplishment ("led a QI project, published it, taught it") spreads across several cells on the grid, but must appear in a career document **exactly once**. The bank stores the full distribution; each consumer renders its own shape:

- **Lattice** = the record spread across all cells it touches (weighted).
- **Document** = the record placed once, in one section.

Two generator rules enforce this:

1. **Primary cell determines the section.** Each `evidence_unit` stores its primary (highest-weight) cell. Document sections render from the **primary cell only**; lower-weight cell memberships count toward lattice density but never create extra bullets.
2. **Dedup per document.** The renderer tracks placed evidence_units — one `evidence_unit` → at most **one** bullet per document. No record appears twice.

**Placement is document-purpose-aware (still once).** Because the bank knows every domain a record touches, the same accomplishment can land in different sections depending on the document — under *Publications* in a research CV, under *Teaching/Quality* in a clinician-educator dossier — but exactly once in each. For the genuinely ambiguous handful, the **physician (or edit-with-Mak) chooses** the section; the system never guesses repeatedly.

This rides the locked **modular-sections** rule: every document is a list of toggleable sections mapped to CV item types; each evidence_unit has one primary item type; empty sections auto-hide.

> **Build note:** this rule lives in the **bank-driven** document generator. Most current doc builders write to JSON blobs and don't read `evidence_unit` at all (audit C3) — so single-placement + dedup must be baked in when document generation is consolidated onto the bank. Don't recreate the duplicate-bullet problem.

---

## 8. Hard constraints (non-negotiable guardrails)

- **PHI strip is mandatory on every conversational turn**, before storage. Conversational capture is the highest PHI-leak surface in the product ("this patient is really anxious" → store "psychiatric evaluation · anxiety presentation · [unit]", never the patient). Build this guardrail *first*.
- **No time on the invisible side, ever.** Hours track *visible* clinical work only (the institution's unit for visible effort) — never a weight on invisible work. Two halves, two units; don't let them bleed.
- **Controlled vocabulary, category-level** (~100–130 terms). Diagnoses and settings map to categories ("mood disorders," "inpatient psych," "ED," "MICU"), never ICD/CPT codes, never a 150k dictionary.
- **No invention.** Every generated CV bullet traces to a real capture; thin evidence → less text, never fabrication.
- **Physician-owned; institution sees de-identified aggregates only** (min cell size, ranges not precision, no drill-to-one).

---

## 9. Build sequence (proposed)

1. **Stop the bleeding (audit C2).** Halt new writes to the superseded `career_assessments` from Mak + assessments; route conversational capture toward `activity_entries` staging (then confirm).
2. **Wire `narrative_evidence`** — the SI/subjective probe store (currently zero code). This is the physician-only Mak capture home.
3. **Pulse → pipeline.** Route the weekly/monthly **boost/drain free-text** (already collected, currently dangling) through the classifier with the **invisible-quadrant + energy-valence** rules → staging → confirm.
4. **Mak → pipeline.** Mak extracts structured capture per lane (§2) → same staging/confirm path; Mak runs the conversational confirmation.
5. **Skill energy ranking** (founder-gated schema) + the **per-cell energy** computation (§4).
6. **Confidence-triage confirmation UI** (§5) — the shared human gate for all sources.

Steps 1–2 are cleanup + unblock; 3–4 are the capture build; 5–6 make energy and confirmation real.

---

## 10. Open decisions for the founder

1. **Energy blend rule** — how `predicted = blend(domain_rank, skill_rank)`, and how fast observed overtakes predicted as evidence accumulates.
2. **One energy dot or two per cell** — single blended dot, or split visible-energy vs invisible-energy.
3. **Skill-energy storage** — add `skill_index` to `energy_rankings`, or a separate table.
4. **Hours home** — where visible duty-hours live, and how they surface to trainee/institution (the MedHub-replacement value prop).
5. **PHI-strip aggressiveness** — rules-based detector vs. LLM pass vs. both, and the fail-safe (drop-on-doubt).

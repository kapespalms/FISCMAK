# FISCMAK — 5.6 Well-Being Origami Plot: Presentation & Guardrail Spec

*Builder-ready operationalization of the Wellbeing Page Spec (B2 §5 + governance §C) and Master Review Part XVII.4. For Claude Code, Phase 5.6.*

> **Disambiguation (read first):** this is the **well-being** origami — FCWI + pulse. It is **NOT** the career **seven-gap** (Skill/Knowledge/Credential/Language/Evidence/Network/Identity). Both happen to have seven elements; do not conflate them. The seven-gap is internal career math; the origami is a physician-facing well-being visualization.

---

## What it is

A **7-axis** well-being visualization. "Origami," **not** radar/spider — and the distinction is the whole point: each axis is its **own separate spoke with its own threshold, with NO connecting polygon and NO enclosed area.** A radar chart's filled area implies a composite total — which is **forbidden** here (FCWI has no composite by design). Origami = every axis read independently; nothing adds up to a single shape or score.

---

## The 7 axes — internal construct → physician-facing label

| # | Internal construct | Physician-facing label (use this) |
|---|---|---|
| 1 | EE (work exhaustion) | "Feeling depleted by work" |
| 2 | DP (interpersonal disengagement) | "Feeling disconnected" |
| 3 | FCWI Meaningfulness | "Meaning in your work" |
| 4 | MDT (moral distress) | "Moral distress" *(special handling — below)* |
| 5 | FCWI Energy | "What energizes you" |
| 6 | FCWI Recognition | "Feeling recognized" |
| 7 | FCWI Self-Care | "Prioritizing your well-being" |

Each axis carries **its own threshold** (a "watch" zone) shown as a marker/position on that axis — **never a number.**

---

## Hard rules (governance §C — apply without exception)

- **No composite / no area.** No filled polygon, no total, no single shape that reads as a score. Seven separate axes, full stop.
- **Plain language only.** The strings `EE`, `DP`, `MDT`, `FCWI`, `PFI`, `MBI` **never** appear in the physician UI. Use the plain-language labels above.
- **No raw scores or instrument names.** Beneath the plot, plain-language framing only: *"Some responses suggest you may benefit from…"*
- **MDT axis — safety handling.** If moral distress ≥ 4 → surface a **resource link + a pause**, gently. Never auto-report it, never make it the loudest spoke. Distress is a prompt to support, not a metric to display prominently.
- **Physician-owned; never institution-facing at the individual level.** Any institutional view is de-identified aggregate only, under the ethical aggregation rules.

---

## What the physician sees vs. what stays internal

**Sees (on the well-being page):**
- the 7 separate axes, each with its position + threshold and a plain-language label
- a plain-language summary
- longitudinal trend lines (EE/DP/QoL/MDT over time) — rendered **separately**, not as the plot

**Internal only — never on this plot:**
- the FCWI numbers feeding F5 Recognition Gap and the energy↔evidence cross-reference
- the career seven-gap and F1–F7
- any composite or headline number

---

## Build checklist for 5.6

- [ ] 7 independent axes — no connecting polygon, no area fill, no composite
- [ ] Plain-language labels only (zero instrument acronyms in the UI)
- [ ] Per-axis threshold marker; no numeric scores shown
- [ ] MDT ≥ 4 → resource link + pause; never auto-reported; not a dominant spoke
- [ ] Plain-language summary beneath the plot ("some responses suggest…")
- [ ] Trend lines rendered as a separate element, not the origami
- [ ] Nothing here surfaces to the institution at the individual level
- [ ] Confirm this reads as well-being, not career — it must not display any seven-gap or F-formula output

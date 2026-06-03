# FISCMAK — Dashboard & Data Vision (NORTH STAR, not built)

**Version:** 1.0 · **Date:** 2026-06-02 · **Owner:** Kristen Palmer, MD
**Status:** DESIGN VISION / reference. This is the aspirational target for the lattice visualization and data layer. It is **NOT the live schema** and must not be adopted wholesale. Harvest the *encoding* (Sections I–II) for Phase-5 heat-map work; treat the schema/pipeline sections as future-state ideas to reconcile, not migrations to run.

---

## ⚠️ RECONCILIATION HEADER — where this vision DIVERGES from what's built

Before using any part of this doc, know these five conflicts with the verified, live system. Do **not** let a future build silently adopt the vision's data model over the built one:

1. **Single-cell vs. multi-cell evidence.** This vision stores one `domainindex`/`trackindex` per evidence unit. The BUILT model is **multi-domain weighted** — one CV line distributes across cells via the `evidence_cell_weights` join table (the "isn't that the whole point of the lattice?" redesign). Do not regress to single-tag.
2. **Time.** The vision's `weeklycheckins.hoursworked` reintroduces time. The BUILT decision is **no time, ever** for invisible-work capture — energy is the weight.
3. **CV → invisible.** The vision's NLP pipeline assigns OV/OI/SV/SI straight from documents. The BUILT decision is **CV = visible only (OV/SV)**; invisible work is captured live. Tagging invisibility from a CV is a category error we removed.
4. **Vocabulary.** The vision is written in the old `domainindex`(=skill)/`trackindex`(=identity) convention. The BUILT system is post-un-flip: **DOMAINS = identities, SKILLS = tasks**, DB columns `skill_index`/`domain_index`.
5. **ML pipeline.** The vision assumes Stanza + BioBERT fine-tuned classifiers. The BUILT parser is keyword/rule-based. ML is a future, multi-month effort — not a pilot feature.

**Two reference lists** in the source spec ([1]–[14] viz + [1]–[12] schema) need reconciling if this is ever integrated into the Master Review.

---

## I. COLOR PALETTE — the encoding worth adopting (Phase 5)

**Cardinal rule: never use rainbow color maps.** They distort data through uneven gradients and are unreadable to the >4% with color-vision deficiency (CVD). Use perceptually-uniform sequential scales (cividis or single-hue) that stay legible under all CVD forms. Encode **two variables via two *separable* channels** — color for one, texture/glyph for another — never a bivariate 2D color scheme (Ware: accuracy is substantially higher with texture/color than bivariate color).

FISCMAK uses **four separable channels per cell:**

**Palette A — Evidence density → fill color (sequential).**

| Density | Meaning |
|---|---|
| 0 (empty) | no confirmed evidence |
| 1–2 | sparse |
| 3–5 | moderate |
| 6–10 | strong |
| 11+ | dense cluster |

Single-hue sequential ramp (white → deep/navy, or cividis). **For FISCMAK, pick a ramp that fits the restrained dark-luxury palette — NOT bright/neon.** Keep it sequential + CVD-safe whatever the hue.

**Palette B — Energy alignment → corner glyph (separate channel, NOT a second fill color).**

| Energy (1–5) | Glyph |
|---|---|
| Very energizing (5) | green dot, top-left, 6px |
| Energizing (4) | light-green dot, top-left, 4px |
| Neutral (3) | none |
| Draining (2) | orange dot, top-right, 4px |
| Very draining (1) | red dot, top-right, 6px |

**For FISCMAK: muted tones, not fluorescent** — match the luxury aesthetic. Fill = density only; energy lives in the glyph. This is the central, well-grounded move (separable channels stay independently readable).

**Palette C — FTE discrepancy (F3) → border style.** Solid = within 20% of expected; dashed = >20% over; dotted = >20% under. *(Needs F3 data; render solid/neutral until available.)*

**Palette D — Transfer potential (F7) → gold star, bottom-right.** High F7 + goal-aligned. The "opportunity" signal. *(Needs F7 data; render only when present.)*

**Four-channel summary:** fill color = density (F1) · corner glyph = energy · border = FTE discrepancy (F3) · star = transfer potential (F7). Each channel is pre-attentively separable.

---

## II. DUAL ENCODING IN ONE CELL — implementation

Do not encode more than one variable in the color channel. Cell anatomy (64×64 desktop / 48 tablet / 32 mobile):

- **Fill** = density (sequential color).
- **Top-left/top-right corner dot** = energy (green energizing / red draining).
- **Border style** = FTE discrepancy.
- **Bottom-right star** = transfer potential.

**Hover:** tooltip with Domain × Skill, confirmed-evidence count, energy (1–5 + label), FTE % (if flagged), transfer count (if starred), "click to explore."
**Click:** cell detail panel — all confirmed evidence items, quadrant mini-bar (OV/OI/SV/SI), linked transfer pathways.

**Accessibility (WCAG 2.1 AA):** every color encoding has a redundant non-color channel (position/shape/border) → fully interpretable without color. Text contrast ≥4.5:1. Keyboard: arrows traverse, Enter opens, Escape closes. Screen reader announces each cell's domain/skill/count/energy/FTE.

---

## III–onward (vision, not built — pointers only)

Progressive disclosure (2×2 overview → 8×8 heat map → cell detail), the well-being origami plot, responsive breakpoints, D3 implementation, the 28-table schema, RLS, NLP pipeline, institutional aggregates, and the full data-flow are captured in the source spec. **All subject to the reconciliation header above.** Adopt deliberately, never wholesale.

*Companion: FISCMAK_Master_System_Review.md (canonical built spec), FISCMAK_Domain_Skill_Rank_Matrix.md, FISCMAK_Invisible_Work_Capture_Spec.md (the no-time / CV-visible-only / multi-cell decisions this vision must respect).*

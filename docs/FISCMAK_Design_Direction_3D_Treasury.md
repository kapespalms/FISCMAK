# FISCMAK — Design Direction: "Treasury" voice + 3D lattice (Phase 5)

**Version:** 0.1 (vision capture) · **Date:** 2026-06-01 · **Owner:** Kristen Palmer, MD
**Status:** DESIGN DIRECTION — capture, not build. These are Phase 5 / polish ambitions. The functional well-being forms (3.1/3.2) already work and save correctly; this doc preserves the visual vision so it isn't lost, WITHOUT blocking the functional layer.

---

## 1. "Treasury" voice (branding for well-being check-ins)

Reframe well-being check-ins as banking something *valuable you've built*, not a burnout survey. Inverts the usual clinical-dread framing — on-brand for a "luxury academic operating system."

- **Monthly FCWI → "Treasury Sync"** — e.g. *"Welcome to your Treasury Sync. Let's harmonize your 30-day data, visualize your hidden contributions, and ensure you're steering toward fulfillment."*
- **Weekly pulse → "Treasury Pulse"** — e.g. *"Take your Treasury Pulse. Lock in your weekly baseline, protect your boundaries, and step away from the system."*

**Cautions (decide at build):**
- "Treasury" leans financial — ensure it reads as *career treasury / what you've built*, not money. A/B with pilot users.
- Plain instrument names still hidden underneath ("FCWI"/"MDT" never in UI — §C governance holds).
- The warm intro voice is the target tone; keep it.

---

## 2. 3D Apple-quality career lattice + slider-cube inputs

**The vision:** an Apple-inspired, Canva-3D-quality career lattice. Likert responses (EE/DP/QoL) rendered as a **cube that fills** never→always, via a **slider** where "never→always" lives on the track. Each item asked individually on its own cube. Responses both *input* and later *displayed as a tracker*.

**Why it's strong:** premium feel, not a survey tool; the slider-fills-a-cube pattern is a lovely input and resolves the Likert-label awkwardness (a slider can carry different anchor words per item without feeling like a different control).

**⚠️ Critical boundary (from Wellbeing Spec §C2):** the career lattice = career *evidence* (domain × track × quadrant). Well-being (EE/DP/QoL/FCWI) is a SEPARATE surface (origami). **Do NOT render well-being data onto the career-evidence lattice** — that merges two things the spec deliberately keeps apart. The *visual language* (3D cubes, fills, sliders) can be SHARED across both, but a well-being cube and a career-evidence cube are DIFFERENT lattices, not the same grid. Resolve this explicitly before wiring well-being onto any 3D grid.

**Scope discipline:** this is a deliberate Phase 5 design slice (Three.js/WebGL effort). Build the plumbing now (done — forms save correctly), make it beautiful later. Do NOT bolt 3D onto the working 3.1/3.2 forms.

---

## 3. Likert scale decision (carry into the slider design)

Open question from the wording review: FCWI currently uses one frequency scale (Never→Always) for all 9 items, but several items are *agreement* questions (meaningfulness, control, recognition) that read awkwardly on a frequency scale. The slider direction makes this easy to fix — per-item anchor words on the same control. **Decide per-item anchors when designing the slider.** Behavioral items (1,2,6) = frequency; attitudinal (3,4,5,7) = agreement; 8,9 = frequency-ish. Affects PFI validation cross-walk — keep defensible.

---

*Companion: FISCMAK_Wellbeing_Page_Spec.md (§C2 the separation rule), BUILD_ORDER.md Phase 5 (visualizations).*

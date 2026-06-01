# FISCMAK — Longitudinal Invisible-Work Capture (canonical model)

**Version:** 1.0 · **Date:** 2026-06-01 · **Owner:** Kristen Palmer, MD
**Status:** CANONICAL model for how the invisible half of the lattice (OI/SI) gets filled. Supersedes the earlier "parse everything from the CV" assumption in BUILD_ORDER 4.1. The CV captures *visible* work only; invisible work is captured *live, over time*. This doc is the source of truth for the evidence-capture architecture.

> **Why this exists:** invisible work is invisible *because it leaves no record* — so it cannot be reconstructed from a CV. It can only be caught as it happens. This reframes the evidence pipeline from a one-time parse into a longitudinal capture loop.

---

## 1. The three-stream evidence model

The lattice fills from three distinct streams — not one parse:

| Stream | When | Captures | Quadrants | Unit |
|---|---|---|---|---|
| **CV / documents** | once, onboarding (+ updates) | the *visible* scaffold | OV / SV | multi-domain weighted (see §5) |
| **Live invisible capture** | ongoing (daily/weekly) | invisible work *as it happens* | OI / SI | what happened + energy valence (NO time) |
| **Synthesis (Mak)** | periodic (weekly/monthly) | the *patterns* across the live stream | aggregate OI/SI | confirmed themes |

**Key consequence:** the CV does NOT attempt to tag OI/SI. Documents are inherently a record of *visible* work — anything on a CV was recognized enough to list. Forcing invisibility out of a CV is a category error. The visible half comes from documents; the invisible half comes from the human, live.

---

## 2. What is captured — NO TIME, energy-weighted

**Invisible work is never measured in hours or duration.** Time self-report is the most biased and most gameable dimension (49–66% variation by method; systematic under/over-estimation). It is removed entirely from invisible-work capture.

Instead, each piece of invisible work is captured as:
- **What happened** — named, in the physician's own words (free text + optional type tag)
- **Energy valence** — energizing ↔ draining (the weight)

**Energy is the weight, and it replaces both time and "significance."** Draining work weighs on you — that *is* its significance. Energy is also already instrumented (`evidence_unit.energy_score` exists; lattice colors cells by energy hue; domain energy ranking is 1–5; FCWI items 1/6 are energy). So invisible-work capture speaks the same energy language as the rest of the well-being layer — one consistent scale.

> **Scale decision (pending founder):** energy as 5-point (matches domain energy ranking, all energy data comparable) vs. 3-point (drained/neutral/energized — lighter, higher daily adherence). Leaning 5-point for consistency.

**The four-way insight this unlocks** (visible/invisible × energizing/draining):

| | Energizing | Draining |
|---|---|---|
| **Visible** | strength zone (protect/grow) | visible misalignment |
| **Invisible** | **hidden gift** → transfer-pathway candidate ("you light up doing this and no one sees it") | **danger zone** → burnout predictor ("uncredited AND draining — recognize or offload") |

This distinction only exists because energy is captured alongside invisibility. It tells you *what intervention each piece of invisible work needs* — the single most actionable output.

---

## 3. The capture cadence — daily → weekly → monthly roll-up-and-confirm

Each level rolls up the one below and asks **"does this still ring true?"** The system reflects the accumulated picture back; the physician validates it. This is recognition (showing them what they reported), never surveillance (telling them who they are).

| Level | Shows | Asks | Optional? |
|---|---|---|---|
| **Daily** | (logging surface) | "What did you do today that won't be counted? Energizing or draining?" | yes — light, ~15 sec, never required |
| **Weekly** | the week's **themes**, assembled from dailies (or a blank prompt if no dailies) | "This is your week — does it ring true?" (confirm / adjust / add) | the standing cadence |
| **Monthly** | the **patterns** across weeks (Mak synthesis) | "This keeps coming up — does it ring true?" | periodic |

**Daily engagement is rewarded with LESS work, not more:** a physician who logs daily gets a richer weekly picture to *confirm* (barely editing); one who skips gets a blank weekly prompt to fill fresh. The habit is pulled toward, never forced. (Missed daily/weekly → fall back to last confirmed snapshot, never zero.)

---

## 4. Validity — three stacked mechanisms (grounded, not invented)

Self-reported data is *consistent* but not *absolutely accurate* — so trust the **pattern and the cross-timeframe consistency**, never the raw number. Validity comes from three established methods stacking:

1. **EMA (Ecological Momentary Assessment)** — the daily catches invisible work *in the moment*, before recall decays. Highest accuracy layer.
2. **Member checking** — the weekly/monthly "does it ring true?" shows the physician the interpretation and asks if it's accurate. A recognized qualitative-validity method.
3. **Convergent consistency** — do the themes cohere across daily → weekly → monthly? A *type* of invisible work that recurs consistently (and is consistently draining) is strong signal; a one-off "rough Tuesday" is noise the confirmation step filters out.

**The discrepancy is itself a signal.** If dailies say "coordination drains me" but the monthly says "it wasn't that bad," the gap = lived-in-the-moment vs. remembered-in-hindsight (your spec's perceived-vs-actual construct). Surfaced gently by Mak as a conversation, never as an error.

> **Status:** the *methods* (EMA, member checking, convergent validity) are textbook. The *specific application* to physician invisible-work tracking is founder synthesis — face-valid, pilot-validated, NOT yet validated. Never over-claim. Defensible to an IRB as a novel application of established methods.

---

## 5. How it feeds the formulas

- **F1 (Evidence Density):** `D(q,d,t) = Σ wₛ · n(s,q,d,t)`. Invisible-work entries are evidence with source weight (live self-report ≈ 0.55) × cell weight, energy-tagged. They accumulate density in OI/SI cells over time.
- **F5 (Recognition Gap):** `G = Σ(OI+SI)/Σ(OV+SV)`. The OI/SI numerator fills from the live invisible stream; the OV/SV denominator from the CV. **F5 grows truer over time** — at onboarding the lattice is mostly visible (CV only); months of capture fill the invisible half, and the "55% invisible" aha lands harder because the physician *watched it accumulate from their own reports.*
- **Energy hue** colors invisible cells (draining vs. energizing) → the four-way insight (§2) renders directly on the lattice.

---

## 6. Governance / anti-gamification boundaries (hard rules)

- **No time/duration in invisible-work capture.** Ever. (FTE % on the *visible* side stays — that's the institution's own language for visible effort; the two halves use different units because they are different kinds of things.)
- **No quantity to inflate = structural anti-gaming.** You cannot "log more hours" to fill your lattice. Naming the same work twice doesn't multiply it.
- **Reward recognition, NEVER volume.** The reward for logging is *clarity about your own work* and invisible work *becoming usable evidence* (e.g. for a promotion packet) — never points, streaks, or a number going up. If the lattice fills faster the more you log, it's gamified — don't.
- **Show trends and ranges, never false precision.** Never "you did 14.5 hours of invisible work." Show "more than usual," "consistently draining," patterns. Same family as the no-composite-score rule.
- **Nothing enters the lattice as truth until the physician confirms the rolled-up picture rings true.** Physician-owned; never institution-facing at the individual level.
- **Synthesis, not playback.** The weekly/monthly confirm step shows the *pattern/insight*, not a 30-entry audit log — or it becomes a rubber-stamp. Ask them to confirm the insight, not audit the log. (This is Mak's real job.)

---

## 7. How this reshapes BUILD_ORDER 4.1

- **CV confirmation gets SIMPLER:** it only handles *visible* work — no agonizing over invisibility a document can't see. (Still needs the multi-domain weighted model + the confidence-triage confirmation UX — see the separate evidence-model decisions.)
- **Invisible capture is a LONGITUDINAL feature**, built on the weekly-pulse "what drained you / was it invisible?" field that already exists (3.2). Extend that, don't build a heavy one-time parse.
- **Sequencing:** visible pipeline (CV → OV/SV) and live invisible capture are *separate* builds. The synthesis/roll-up layer is Coach Mak work (Phase 6).

---

---

## 8. RESOLVED DECISIONS (founder, 2026-06-01) — these are now build instructions

1. **Energy scale = 5-point** (1=very draining … 5=very energizing). Used for invisible-work capture AND everywhere energy appears, so all energy data is comparable (matches domain energy ranking + lattice hue). Maps to `evidence_unit.energy_score`.

2. **Multi-domain storage = JOIN TABLE.** New table `evidence_cell_weights` (evidence_unit_id FK, domain_index 0–7, track_index 0–7, weight FLOAT, recognition_quadrant). One row per cell an item touches; weights normalize to 1.0 per item. Chosen because F1 density = `SELECT domain_index, track_index, SUM(weight) … GROUP BY` — fast for the most-run query (rendering the lattice). Cap: top ~3 cells, min weight 0.15, renormalize (avoid lattice mush). *Note: `evidence_unit` keeps its single domain_index/track_index as the PRIMARY cell; the join table holds the full distribution. Founder-gated migration.*

3. **CV confirmation UX = confidence-triage + bulk-confirm.** Parser confidence per item drives it: auto-accept high-confidence (pre-checked, ~85%+), surface only uncertain items for active review, ONE "confirm my evidence" action finalizes the batch, easy inline override, plus an "add invisible work we missed" path. Target physician actively reviews ~15%, framed as supervising exceptions. Nothing final until the one confirm action (satisfies physician-ownership governance). Surface the parser confidence score on the stored rows so the UI can triage.

---

*Companion: FISCMAK_Master_System_Review.md (Part III quadrants, Part IX formulas, Part XIX governance), FISCMAK_Wellbeing_Page_Spec.md (§C2 surface separation), BUILD_ORDER.md 4.1. All prior open decisions RESOLVED — see §8.*

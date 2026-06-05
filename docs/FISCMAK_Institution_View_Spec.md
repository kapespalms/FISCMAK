# FISCMAK — The Institution View (Joint Commission / Attending Aggregate)

*Companion spec to Master v1.3 Part XXVII, which describes this layer's **value and ethics** but not its **surface**. This defines what an institution sees beyond the program-director (GME) dashboard. **Status: design — Wave 4, unbuilt.** The data model and competency tagging already accrue (the ACGME↔Joint Commission bridge is live in the bank); the surface and the OPPE document type are the next build. Date: 2026-06-04.*

---

## The cardinal distinction (read this first)
There are **two** institution-facing surfaces, and they are governed differently:

- **PD / GME surface — IDENTIFIED.** A program director's oversight of *named residents* is the ACGME-mandated, consented relationship. (Built — Ticket 7.)
- **Institution / attending view — DE-IDENTIFIED by default.** Attendings have **not** consented to individual oversight the way trainees have. So the institution sees **patterns, never named individuals.** Individual OPPE documentation happens a different way — see Layer 2.

Conflating these breaks the ethic that makes honest data possible. The chief of psychiatry does **not** get a roster of "who's burning out." They get conditions-level signal, plus whatever a physician chooses to share.

## Audiences beyond the PD
- **Department chair / chief of service** (e.g., Chief of Psychiatry) — their division's attendings.
- **DIO / CMO / dean** — cross-department system leadership.
- **Credentialing / OPPE-FPPE owner** — the professional-practice-evaluation process.

---

## Layer 1 — The de-identified aggregate (the institution's own surface)
Everything here obeys the Part XXVII rules: **N≥5** minimum cell size (suppress below), **ranges/directions not precision**, **alerts not rosters**, **structured signal only — never narrative/semantic content**, **no drill-to-one**, **accept losing a signal rather than re-identify.**

Reports the chief / CMO sees:
- **Department competency coverage** — the 6 ACGME/Joint-Commission competencies × the division. *This is OPPE-shaped at the cohort level.*
- **Recognition-gap distribution** — what proportion of the department's work is invisible.
- **Energy–evidence misalignment** — the **draining-task heatmap**: where dense work meets low energy.
- **Well-being trends** — FCWI/pulse aggregate, direction over time (never an individual score).
- **The leadership-pipeline signal** (the sharpest value — below).
- **Retention-risk pattern alert** — a threshold crossing, not a watchlist.

## Layer 2 — The physician-generated OPPE summary (consent-shared)
OPPE/FPPE is inherently *per-named-physician* (it's a credentialing process), which seems to conflict with "de-identified only." The resolution:

**The physician generates their own OPPE-shaped competency summary** (an Output Studio document type — their captured work organized across the 6 competencies) and **shares it into the OPPE/FPPE process by consent.** The institution receives it *because the physician sent it*, not because the institution queried down to them. This is how individual-level documentation happens without the institution ever pulling a named record.

> **Aggregate is pulled-up-and-anonymized; individual insight is pushed-by-consent.** (Part XXVII, rule 6.) The Institution View is the literal implementation of that rule.

---

## The Joint Commission / OPPE-FPPE mapping
The 6 ACGME competencies *are* the 6 ABMS/Joint-Commission general competencies used for OPPE/FPPE. Every capture is already tagged to them, so:
- **Aggregate:** department competency coverage = OPPE-shaped at the cohort level (Layer 1).
- **Individual (consent):** the physician's competency summary = OPPE-shaped evidence for their credentialing file (Layer 2).

**Honest scope — say this to a CMO plainly:** FISCMAK supplies the **competency / professional-practice evidence from physician self-report** — *not* the EHR-derived clinical metrics (volumes, outcomes, complication rates) that also feed OPPE. It is a **complement** to the EHR OPPE data, packaged in the competency framework, with **no EHR integration required** (that's the day-one value — and the deferred "10× later" is auto-population *into* the institution's OPPE system).

## The leadership-pipeline signal
Cross **role × energy**: *energizing + strength* = protect and grow the pipeline; **draining + strength = the danger zone** — the physician who loves leadership but finds it draining is the one the department is about to lose *from leadership*, and the most valuable future leader. The reframe institutions need: **draining-on-a-strength is a conditions problem, not a fit problem** — fix the admin load / protected time / support; don't reassign the person. Surfaced **only** as an aggregate cohort alert + a **physician-owned** individual insight ("you light up about leadership but it's drained you three months — want to bring this to your chair?"). The institution never receives "Dr. X finds leadership draining."

## What the chief / CMO sees — and never sees
| Sees | Never sees |
|---|---|
| De-identified aggregate patterns (N≥5) | Any individual's well-being / energy score |
| OPPE-shaped department competency coverage | Anything a physician told Coach Mak |
| Threshold *alerts* (retention, well-being direction) | A named roster of who's burning out / draining |
| Physician-*shared* OPPE summaries (consent) | A query path that drills down to one person |

## Boundary vs. the GME surface
The PD sees the *training record* of *named residents* (identified, ACGME). The institution sees *de-identified patterns* of *attendings* (plus consent-shared summaries). Well-being, energy, and Mak content are **never** individual-institution-facing on either surface.

## The economics (why an institution pays)
$500K–$1M per physician departure; development opportunity outranks compensation as a retention driver; the institution buys **retention + accreditation (OPPE-shaped, no integration) + documentation-burden reduction** (one capture serves milestones, promotion, OPPE/FPPE, MOC). The ethic is the moat: honest data only flows because it's physician-owned, and that trust is what makes the aggregate worth anything.

---

## Build status & next steps
- **Live now:** the ACGME↔JC competency tagging accrues on every capture (the bridge is real in the bank); the PD/GME surface is built.
- **Unbuilt (this spec):** the de-identified aggregate dashboard (Layer 1) and the OPPE-shaped Output Studio document type (Layer 2). Requires the `institutional_aggregates` + `data_sharing_consents` model (spec'd in Part XXIV/XXVII, uncoded) and the N≥5 aggregation engine.
- **Sequence:** post-pilot. The pilot (GME) proves the capture→bank model and the identified-oversight surface; the Institution View is the B2B expansion that follows a cohort existing (you need ≥5 consenting attendings before any aggregate can render).

*One line for a CMO: "Your physicians log their own careers; you get a de-identified, OPPE-shaped read on competency coverage, where work is draining your best people, and who's at retention risk — at five-or-more, never one — with zero EHR integration and no surveillance."*

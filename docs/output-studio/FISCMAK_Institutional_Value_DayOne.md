# FISCMAK — Institutional Value, Day One

*No EHR integration. No enterprise IT project. No OPPE/MedHub/MIPS feeds.*
*Every benefit below comes from data physicians enter for their own careers.*

---

## The principle

The institution sees value the moment its physicians start capturing — because every capture is tagged to the **8 ACGME/AAMC competency domains**, which are the *same* domains the Joint Commission uses for OPPE/FPPE. The physician logs work for their own CV and dossier; the institution gets a de-identified roll-up of the same data. **One input, two audiences — no integration required.**

```
Physician logs work with Mak
   → tagged to competency domain + CV item type
        → (a) the physician's CV / dossier / promotion packet   [individual, private]
        → (b) de-identified aggregate roll-up                    [institution, day one]
```

---

## What the institution gets on day one (self-report only)

| Benefit | What it is | Source (all physician-entered) | Why it matters |
|---|---|---|---|
| **Competency documentation, OPPE-shaped** | Each physician's activity already organized across the six ACGME domains the Joint Commission uses for OPPE/FPPE | Daily capture + CV items | Review-ready evidence physicians generate themselves — no biannual chart-scramble |
| **Invisible work made visible (aggregate)** | The uncredited half of the work — mentoring, committee service, QI, care coordination — surfaced at the cohort level | Daily capture | Names the labor that drives departures; the core retention lever |
| **Draining / energizing heatmap (de-identified)** | Which task types drain which groups, by department and career stage | Weekly energy capture | Targets task redistribution — the single most evidence-based burnout intervention |
| **Retention & well-being signal (aggregate)** | De-identified trend of energy / engagement over time | Capture + a light periodic pulse | Early warning before a departure ($500K–$1M each) |
| **Reduced documentation redundancy** | One capture feeds the dossier, the annual review, and an OPPE-shaped summary | One input | Cuts the duplicate documentation that itself drives burnout |

All five are achievable with **zero integration** — they are roll-ups of what physicians already type into Mak.

---

## The sharpest signal: role–energy fit (leadership-pipeline protection)

Energy crossed with the lattice produces four cases — and one is a five-alarm fire most systems miss:

| | Their strength / aspiration | Not their strength |
|---|---|---|
| **Energizing** | Protect & grow — your pipeline | Development path / hidden interest |
| **Draining** | **Danger zone** — losing your best people *from the role they're meant for* | Redistribute / offload |

The reframe that makes this matter: **draining-on-a-strength is a *conditions* problem, not a *fit* problem.** Someone who loves leadership but finds it draining should not be moved *out* of leadership — that prunes the pipeline. Fix *why* it drains: admin load, no protected time, no support. Aggregated and de-identified, this is a leadership-pipeline early warning the department gets with zero integration — and it points at the conditions to fix, not the person to reassign.

---

## The hard guardrail (this is the asset, not a constraint)

Individual data is **physician-owned and never institution-facing at the individual level.** The institution sees **de-identified aggregates only.** This is what keeps physicians logging honestly — and honest data is the only data worth anything to the institution. Surveillance would poison the well. *(Matches the FISCMAK North Star: physician-owned, never institution-facing individually.)*

---

## Ethical Aggregation Rules (what makes the institution-facing side safe to ship)

The institution gets the **pattern**, never the **person or their words**. Seven rules enforce it:

1. **Structured signal only — never content.** Roll-ups compute on tags and scores (domain, energy trend, cohort size), never on what the physician wrote. The narrative never leaves the private layer; the institution cannot read any entry.
2. **Minimum cell size, or suppress.** Report a slice only when the group is large enough to hide the individual (floor: k ≥ 5, prefer ≥ 10). Below the floor, suppress the cell.
3. **Cap granularity — no drill to one.** No cross-filtering (domain × stage × gender × division) down to a single person. Department / cohort level only.
4. **Ranges and directions, not precision.** "Trending more draining," not "63.4%." Precise figures enable reconstruction.
5. **Alerts, not rosters.** Leadership gets a threshold-triggered pattern alert (*"leadership work trending draining — senior cohort, n = 14"*), never a browsable "who's draining" list.
6. **Consent bridge — physician pushes, institution never pulls.** An individual's situation reaches a chair only if the physician chooses to surface it. There is no query path from the institution to a named person.
7. **Suppression floor is non-negotiable.** In groups too small to anonymize, you lose the signal rather than identify someone — and that's fine, because the action you want is at the conditions level, which needs only the aggregate.

---

## Explicitly NOT day-one — deferred, integration-dependent (don't promise these yet)

- EHR audit-log workload metrics
- OPPE auto-population *into* the institution's own system
- MedHub / duty-hour sync
- MIPS / CMS quality reporting
- Time-driven activity-based cost (TDABC) financial modeling

These are the later B2B expansion. Because pilot capture already maps to the 8 domains, adopting any of them later requires **no rework** of the underlying data.

---

## The one-line pitch

> *Your faculty's real work — including the invisible half — made visible, review-ready, and retention-protective, from data they enter for their own careers. No IT project.*

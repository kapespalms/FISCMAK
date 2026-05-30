# FISCMAK — Integrated architecture

**Audience:** Founders, product, engineering, external research AI  
**Status:** May 2026  
**Scope:** Product logic and language rules. **Does not** change marketing pages or visual design.

**Related:** [NORTH_STAR.md](./NORTH_STAR.md), [FISCMAK_MAK_LANGUAGE_GUIDE.md](./FISCMAK_MAK_LANGUAGE_GUIDE.md), [FISCMAK_CHECKIN_FLOW.md](./FISCMAK_CHECKIN_FLOW.md), [FISCMAK_UI_COPY_CONTRACT.md](./FISCMAK_UI_COPY_CONTRACT.md), [FISCMAK_OPENEVIDENCE_HANDOFF.md](./FISCMAK_OPENEVIDENCE_HANDOFF.md)

---

## What the physician experiences (plain)

1. **Sign up** → **About you** → optional **Documents (CV)**  
2. **Baseline check-in with Coach Mak** (~12 min, standard questions, pause anytime)  
3. **Summary — does this sound right?** → save  
4. **Dashboard** — what’s due, talk to Mak, career map, goals, documents  
5. **Quarterly / six-month / yearly check-ins** with Mak (same coach, same thread)  
6. Anytime: **log work**, **confirm facts**, **generate documents** from what they confirmed  

**Coach Mak is one person** — not a different assistant per page. Pages (Perspective, Career Data, etc.) are **places in the app**; Mak remembers.

**No user-facing:** scores (/100), percentiles, SOAP/SOAPO, tier numbers, “weather,” instrument names (PFI/BITS), or peer rank.

---

## Seven layers (backend — MECE)

| Layer | Job |
|-------|-----|
| **1. Evidence** | Capture; proposed → confirmed / dismissed; provenance |
| **2. Signal** | Check-in questions, logs, CV, eval imports |
| **3. Interpretation** | Internal scoring → plain themes for Mak and summaries |
| **4. Career map** | Trainee milestone heatmap OR attending 8×8 lattice (confirmed only) |
| **5. Coach Mak** | One thread, one voice, context updates when user changes page |
| **6. Output Studio** | Documents from confirmed facts with traceability |
| **7. Institution** | Cohort aggregates, pre-CCC themes — never individual Mak chat |

---

## Evidence unit (single source of truth)

| Field | Values |
|-------|--------|
| `what` | Activity, answer, CV line, eval, goal claim |
| `where` | Map cell and/or ACGME subcompetency |
| `source` | mak · cv · schedule · instrument · manual · institutional |
| `status` | proposed → **confirmed** \| dismissed |
| `time_class` | past · current · scheduled (scheduled does not inflate counts) |
| `when` | Date or period |

**Lattice + Output** = confirmed only. **Mak** = proposed + confirmed + internal themes (not raw scores in chat). **Institution** = aggregates + imports only.

---

## Measurement (minimal stack)

| When | User label | Backend |
|------|------------|---------|
| Onboarding once | Baseline check-in | ~11 clusters (PFI, BITS*, aspirations, PIF, UWES*, invisible*) |
| ~Every 12 weeks | Quarterly check-in | PFI screen (2) + invisible pulse + career momentum |
| ~6 months | Six-month check-in | + BITS, PIF, UWES; trainee CCC prep optional |
| ~12 months | Yearly review | Horizon refresh + small narrative Q subset |
| Daily | Talk to Mak / log work | Proposed evidence → confirm |

\*BITS, UWES, invisible: not med student / retired per `deployedInstruments()`.

**No new instruments for MVP** (no CBI, IPIP, 88-dimension O\*NET fit, PROMIS replacement).

**PFI:** use published **0–4** anchors consistently (onboarding and quarterly).

---

## Three audiences

| Audience | Gets | Never |
|----------|------|-------|
| **Physician** | Plain summaries, map, goals, documents, one Mak | Scores, surveillance, instrument names in UI |
| **Mak (backend)** | Full corpus; speaks in normal English | Dumping numbers unless user asks for detail |
| **Institution** | Cohort trends, pre-CCC theme convergence | Individual check-ins, Mak transcripts, raw CV |

---

## Explicit rejections (do not build)

RTI composite, task-weighted S-Index as user metrics, O\*NET fit %, VOLCANO maps, parallel burnout batteries, Career Health Score on user UI, auto milestone assignment, using workload to excuse trainee dips to CCC.

---

## Implementation priority (code)

1. PFI 0–4 harmonized  
2. Onboarding complete only after **summary confirmed** (`tier3_complete` gate)  
3. Lattice confirmed + not scheduled only  
4. Remove user-facing CHS / percentiles / domain scores  
5. One Mak chat thread (not history siloed per section)  
6. Output generation cites confirmed evidence IDs  

---

## Doc map

| Doc | Purpose |
|-----|---------|
| [FISCMAK_MAK_LANGUAGE_GUIDE.md](./FISCMAK_MAK_LANGUAGE_GUIDE.md) | How Mak speaks |
| [FISCMAK_CHECKIN_FLOW.md](./FISCMAK_CHECKIN_FLOW.md) | Check-in steps and summary confirm |
| [FISCMAK_UI_COPY_CONTRACT.md](./FISCMAK_UI_COPY_CONTRACT.md) | Per-page allowed copy |
| [FISCMAK_OUTPUT_STUDIO_SPEC.md](./FISCMAK_OUTPUT_STUDIO_SPEC.md) | Documents from confirmed facts |
| [FISCMAK_MAK_QUESTION_CADENCE.md](./FISCMAK_MAK_QUESTION_CADENCE.md) | When/what questions (internal detail) |
| [FISCMAK_OPENEVIDENCE_HANDOFF.md](./FISCMAK_OPENEVIDENCE_HANDOFF.md) | External AI + validation roadmap |
| [FISCMAK_SYSTEM_MAP.md](./FISCMAK_SYSTEM_MAP.md) | Phase × audience matrix |
| [FISCMAK_RESEARCH_CROSSWALK.md](./FISCMAK_RESEARCH_CROSSWALK.md) | Research ↔ code inventory |

---

## Ethics (coaching vs organization)

Coach Mak helps the individual navigate. Aggregate institution views exist so programs can see patterns — **neither replaces** fixing workload, documentation burden, or compensation (Dyrbye et al.).

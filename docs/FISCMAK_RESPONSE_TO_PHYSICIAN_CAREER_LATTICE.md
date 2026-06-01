# FISCMAK: Response to the Physician Career Lattice Framework

**Document type:** Product alignment & implementation stance  
**Audience:** Steering committee, clinical partners, engineering, and research collaborators  
**Date:** May 2026  
**Status:** Authoritative for pilot scope; companion to [NORTH_STAR.md](./NORTH_STAR.md)

---

## 1. EXECUTIVE SUMMARY

FISCMAK shares the **moral and scientific premise** of the Physician Career Lattice: a substantial share of physician work is invisible to institutional measurement; fragmented systems (milestones, RVUs, promotion criteria, wellness surveys) each capture a slice; and **professional dissonance** follows when physicians cannot see their own whole career and choose what to make visible.

**Where we align:** Physician-owned data, evidence over verdict, validated well-being instruments used **internally** with plain-language confirmation, ACGME-aligned trainee views, document ingestion, gap language (especially unrecognized work), WOOP/SMART goal architecture, and AI bounded to coaching and pattern support—not promotion decisions or surveillance.

**Where we differ in v1:** FISCMAK ships a **pilot implementation** optimized for the **empowerment loop** (capture → confirm → map → articulate), not the full 8 domains × 8 tasks × 4 quadrants tensor, formula dashboard, O\*NET backbone, or institutional FTE reconciliation layer. The attending map uses **8 skill domains × 8 career tracks** (64 cells). Trainees use a **separate milestone heatmap** (ADR-001), not an extended 64-cell competency grid.

**Explicit exclusions (by product decision, not omission):** Compensation and productivity economics (wRVU, aRVU, EVU, panel models, fee-for-time); physician-facing composite scores or headline “recognition gap” indices; institution-mandatory individual Mak data sharing; and a 64×8 subjective-invisible question battery that would exceed our instrument burden cap.

**One line:** The Lattice describes the **category**; FISCMAK is the **first product** in that category—built for the physician to see themselves, with Coach Mak as guide.

---

## 2. SHARED PROBLEM STATEMENT

We accept the evidence base summarized in the Lattice framework:

- Invisible and after-hours work is real, unevenly distributed, and poorly reflected in advancement systems.
- Milestones, EPAs, and promotion dossiers skew toward **objective-visible** and **subjective-visible** evidence; moral distress, emotional labor, and coordination burden sit largely in **subjective-invisible** and **objective-invisible** quadrants.
- Person–environment and person–vocation misfit explain meaningful variance in satisfaction and burnout; coaching and implementation intentions have RCT support as **delivery mechanisms**, not as substitutes for system change.

**FISCMAK’s founding question:** What if everyday activities a physician already does could become **trusted career intelligence**—without turning the product into another evaluation system?

---

## 3. THEORETICAL ALIGNMENT

### 3.1 The Four-Quadrant Model — Adopted as Metadata, Not Primary UI

We treat OV / OI / SV / SI as **recognition language** for evidence and coaching, not as a second 256-cell visualization in v1.

| Quadrant | FISCMAK handling (pilot) |
|----------|-------------------------|
| **Objective-Visible** | Confirmed activities, publications, documented teaching, milestone ratings (trainee), CV lines after reconcile |
| **Objective-Invisible** | Named in copy and Mak prompts (EHR after-hours, coordination, unfunded service); capture via activities + narrative, not EHR feeds in pilot |
| **Subjective-Visible** | Check-in themes, 360-style imports when user uploads, MedHub narrative fields (GME) |
| **Subjective-Invisible** | Sparse Mak exploration (moral distress, meaning, identity)—**not** a 64-question module |

**Design rule:** Quadrants inform **what to ask next** and **what document to suggest**, not a traffic-light score on the home screen.

### 3.2 Domains — PCRS-Aligned in Spirit, FISCMAK-Labeled in Product

The attending lattice uses eight domains mapped to portfolio and promotion language:

1. Clinical Expertise  
2. Communication  
3. Professionalism & Ethics  
4. Systems Thinking  
5. Scholarship & Learning  
6. Collaboration & Teamwork  
7. Leadership & Management  
8. Personal & Professional Development  

These align to the AAMC PCRS eight-domain expansion without forcing identical naming in the UI.

### 3.3 The “Second Axis” — Tracks, Not Daily Tasks

The Lattice framework’s **eight core tasks** (clinical reasoning, documentation, care coordination, etc.) describe **how work is done**. FISCMAK’s eight **career tracks** (Clinician, Educator, Researcher, Administrator/Leader, Advocate, Innovator, Quality/Safety, Wellness Champion) describe **where identity and energy concentrate**.

**Resolution:** Both axes are useful. **Tracks remain the lattice columns** for attendings. **Tasks** may be added as optional tags on evidence records for analytics and Mak transfer suggestions—without replacing the 64-cell map.

| Lattice concept | FISCMAK v1 primary axis | v2 optional tag |
|-----------------|-------------------------|-----------------|
| 8 PCRS domains | 8 FISCMAK domains (rows) | Crosswalk table in ontology |
| 8 core tasks | — | `task` on evidence |
| 8 career tracks | 8 tracks (columns) | — |
| 4 quadrants | Implicit in coaching | `recognition_quadrant` on evidence |

### 3.4 Person–Environment Fit — Coaching, Not a Dashboard Score

We use fit constructs in **Mak’s internal reasoning** and pathway copy. We do **not** show O\*NET cosine similarity, hobby-bridge scores, or composite fit indices to physicians (north star: no black-box composites).

---

## 4. FISCMAK PLATFORM ARCHITECTURE (THREE LAYERS)

The Lattice’s three layers map cleanly to shipped and planned surfaces:

### Layer 1 — Intake, Narrative, and Continuous Coaching

**Coach Mak** (single entity across the app):

- Baseline check-in at onboarding (not a static form grid)
- Episodic flows: debrief, anchor, quarterly pulse, transition support
- Goals: SMART near-term + WOOP-style longer horizon in Plan
- Domain energy: five-point scale per domain (very energizing → very draining)
- Privacy: individual conversations are not institution-facing; aggregate GME views require role, tenant, and minimum-N rules

**Instrument policy (Tier 1–2 only for MVP):**

- Ultra-brief pulse aligned to PFI/MBI crosswalks and moral distress thermometer concepts
- **No new validated batteries** unless one is removed with equal or lower burden
- Users see **plain-language summaries they confirm**—never instrument names or tier numbers in UI

### Layer 2 — Career Intelligence & Gap Language

**Evidence layer (single source of truth):**

```
Capture → Extract/map (provisional) → Reconcile (confirm/dismiss) → Consume
```

Consumers: 8×8 lattice, Vault, Insights, Output Studio, Mak context.

**Attending visualization:** 8×8 heatmap — **ipsative** intensity (relative to self), not “bright cell = good physician.” Cell strength reflects **confirmed** evidence density and energy, not parser output alone.

**Trainee visualization (ADR-001):** Subcompetency × time milestone heatmap — ACGME Milestones 2.0, semiannual columns, PGY benchmarks. **Not** an 8×8 extension for residents.

**Gap detection (pilot language, not Formula 5 UI):**

- Empty or thin cells vs. stated primary track
- Mismatch between energizing domains and documented evidence
- “Unrecognized work” themes from invisible-work capture and Mak—not a global G ratio displayed to users

**Retired / internal-only metrics:** Coherence cards, CV-regex indices, and headline recognition-gap percentages are **not** physician-facing (see `retired-surfaces.ts`, KP Admin dev preview only).

### Layer 3 — Career Documents & Articulation

**Output Studio** generates drafts from **confirmed evidence** with provenance:

- CV updates, teaching portfolio, promotion narrative, personal statement, invisible work summary, career snapshot, and related templates

**AI role:** Draft, organize, remind, prepare talking points for human coaches—**does not** decide promotion, diagnose burnout, or share data without consent.

---

## 5. FORMULA SYSTEM — IMPLEMENTATION STANCE

The Lattice proposes ten formulas across four layers. FISCMAK adopts the **ideas** where they serve the physician mirror; we defer **institutional formula dashboards**.

| Lattice formula | FISCMAK stance |
|-----------------|----------------|
| **F1 Evidence density** | Implemented logically: confirmed activity counts per cell; no reliability-weighted multi-source formula in UI |
| **F2 Sentiment per cell** | Deferred (NLP pipeline not in pilot); energy from user input substitutes for hue |
| **F3 Structural discrepancy (FTE)** | Deferred — requires HR/EHR institutional feeds |
| **F4 Perception gap** | Partial — role composition and self-report in onboarding; no institution “expected FTE” bar chart |
| **F5 Recognition gap (global G)** | **Internal/coaching only** if used; never default headline score |
| **F6 Person–occupation fit (O\*NET)** | Research backlog; light job/pathway features only |
| **F7 Transfer potential** | Productize as **transfer pathways**: finding → suggested artifact → status |
| **F8 Hobby–profession bridge** | Deferred |
| **Well-being composite** | **Rejected for UI** — seven dimensions stay separate in reasoning; user sees confirmed summaries |

---

## 6. VALIDATED INSTRUMENTS — TIERED USE

| Tier | Lattice recommendation | FISCMAK pilot |
|------|------------------------|---------------|
| **Tier 1 pulse** | Single-item EE/DP, QoL analog | Embedded in check-in flows; internal mapping to PFI/MBI |
| **Tier 2 short** | PFI subscales, MDT | Selective use in quarterly flows; plain-language out |
| **Tier 3 full** | Full PFI, UWES-9, CD-RISC | Baseline/annual only where burden allows |
| **ACGME milestones / EPA** | Trainee plane | Seeded psychiatry + universal six; MedHub import rail |
| **Novel 64 SI questions** | Lattice Tier 4 | **Not implemented** — replaced by adaptive Mak prompts (8–12 deep probes per year per domain, max) |

---

## 7. ONTOLOGY & NLP — PILOT VS ROADMAP

### Implemented (open-source friendly)

- CV and document upload (PDF/DOCX/text) with server-side parsing
- Section-aware heading detection and psychiatry-oriented placement rules
- ACGME Appendix B specialty registry + milestone seeds (`docs/seeds/acgme/`)
- Phrase/ontology bridge (`ontology-full-export.json`, local vocabulary hints)
- Activity → domain × track mapping with user reconcile

### Roadmap (Lattice §10 — Phase 2+)

- Fine-tuned domain classifiers, sentiment, BERTopic-style themes
- Copy/paste artifact detection in evaluations
- Moral distress and identity marker classifiers (with validation plan)

### Known limitation (shared)

Narrative NLP is for **pattern detection and visualization**, not summative judgment of individuals—consistent with Lattice §10 and FISCMAK ethics.

### O\*NET

Acknowledged as valuable occupational backbone for **career mobility research**. Not integrated in pilot codebase. Crosswalk to tasks/quadrants is a **Phase 2+** decision gated on pathways product priority.

---

## 8. TRAINEE & INSTITUTIONAL INTEGRATION

| Capability | Status |
|------------|--------|
| MedHub evaluation import | Psychiatry pilot rail (`fiscmak-admin` + GME APIs) |
| CCC milestone overlay | Trainee heatmap + pre-CCC prep surfaces |
| EPA → milestone bridge | Follow Page/Choe-style mapping where seeded; not institution-wide automation |
| Cohort / PD views | Aggregate milestone heatmap; minimum-N privacy |
| Attending CCC / promotion committee feed | **Out of pilot** — individual Mak and lattice remain physician-owned |

**Graduation handoff:** Narrow evidence-tagged seed from trainee system to attending portfolio—not a unified 64-cell competency score (ADR-001).

---

## 9. VISUALIZATION SPECIFICATIONS

| Lattice spec | FISCMAK v1 |
|--------------|------------|
| 8×8 density heat map (domains × tasks) | 8×8 domains × **tracks**, confirmed evidence + energy |
| Quadrant-layer toggles | Coaching language only |
| Nested origami well-being plot | **Not shipped** — violates no-composite UI rule |
| 4×8 quadrant × domain heat map | Deferred |
| Radar / spider for competencies | **Rejected** for trainees (ADR-001 evidence review) |
| Progressive disclosure dashboards | Dashboard → Objective → Insights → Mak drill-down |

---

## 10. DATA MODEL — PHYSICIAN PROFILE & EVIDENCE (V2 DIRECTION)

**Physician profile (logical):** identity, career stage, setting, specialty/subspecialty, primary track, role composition, goals, domain energy, check-in history, documents, confirmed evidence set, Mak memory summary.

**Evidence unit (target extensions):**

```typescript
// Logical fields — implementation may vary by table
{
  domain: FiscmakDomain,
  track: CareerTrack,
  recognition_quadrant?: 'OV' | 'OI' | 'SV' | 'SI',
  task?: CoreTask,                    // optional Lattice axis
  time_class: 'past' | 'current' | 'scheduled',
  status: 'proposed' | 'confirmed' | 'dismissed',
  source: 'cv' | 'activity' | 'medhub' | 'milestone' | 'mak' | ...,
  transfer_targets?: ArtifactType[],  // F7 as product object, not formula UI
}
```

**Lattice cell:** activity count, energy, confirmed snippets (capped for Mak context), provisional vs confirmed distinction.

**Interoperability:** FHIR and institutional HR feeds are **institution-plane** backlog items, not pilot blockers for individual agency.

---

## 11. AI BOUNDARIES (ACCEPTED VERBATIM IN SPIRIT)

**AI does:** Parse documents, propose mappings, detect patterns, draft outputs, track goals, deliver micro-reflections, prepare coaching briefs, explain why a cell is populated.

**AI does not:** Make promotion decisions, diagnose burnout, prescribe treatment, share individual data without consent, replace human coaching relationships, or rank physicians against peers.

**The physician always:** Owns data, confirms evidence, edits every generated document, chooses what to share and with whom.

---

## 12. PHASED ROADMAP — FISCMAK RELATIVE TO LATTICE PHASES

| Lattice phase | FISCMAK equivalent | Timeframe (indicative) |
|---------------|-------------------|------------------------|
| **Phase 0** Foundation | North star, page MECE, evidence layer, privacy copy, open-source stack | Complete (ongoing governance) |
| **Phase 1** Single-department pilot | UH Psychiatry GME + attending volunteers; 15–20 users; intake, upload, lattice, Mak, Output | **Current** |
| **Phase 2** Refinement | Quadrant/task tags on evidence; transfer pathways UI; NLP v2; 2–3 departments | Months 10–18 |
| **Phase 3** Institutional | Opt-in FHIR/HR feeds; wellness infrastructure links; coach training | Months 19–30 |
| **Phase 4** Sustainability | Cross-site validation, longitudinal resident→attending arc, model retraining | 31+ |

**Pilot success metrics (aligned to Lattice Phase 1 evaluation):**

- Feasibility and acceptability (qualitative)
- Pre/post well-being pulse domains (not composite score)
- CV revision and goal achievement (self-report + artifact)
- Evidence confirmation rate and lattice coverage breadth
- Zero incidents of metric leakage to physician UI

---

## 13. COST & STACK (PILOT)

Consistent with Lattice §15 open-source posture:

- **App:** Next.js, PostgreSQL (Supabase), Vercel hosting  
- **NLP (pilot):** Node parsers + ontology; no standing GPU cluster  
- **Visualization:** In-app React heatmaps; no separate Streamlit product  
- **Validated instruments:** Free-for-research instruments only; burden-capped  
- **Year 1 pilot cost driver:** Personnel (clinical design, coaching partners, engineering)—not license fees  

---

## 14. EVIDENCE STRENGTH — WHAT WE SHIP VS WHAT WE VALIDATE

| Tier | Lattice | FISCMAK action |
|------|---------|----------------|
| **Tier 1** | PFI, single-item EE/DP, MDT, UWES | Use internally; plain-language confirmation |
| **Tier 2** | P-E fit, FTE discrepancy, O\*NET | Coaching copy; no O\*NET UI in pilot |
| **Tier 3** | NLP classification, coaching RCTs | Parser + Mak; full BERT pipeline later |
| **Tier 4** | 8×8×4 tensor, 64 SI module, Formula 5/7/8, local ontology layer as **integrated system** | **Original validation** required before institutional claims; pilot treats as formative mirror only |

---

## 15. ENGINEERING & AGENT STRUCTURE

To avoid building “two products,” one orchestration model:

| Agent / role | Responsibility |
|--------------|----------------|
| **Coach Mak** | Layer 1 + 3 — conversation, memory, check-ins, goals |
| **Evidence pipeline** | Layer 2 — upload, parse, reconcile, confirmed evidence API |
| **GME domain** | Trainee milestones, MedHub, pre-CCC, specialty seeds |
| **Document generator** | Output Studio grounded on confirmed evidence |
| **Pilot launch / verifier** | Deploy gates, no metric leakage, migration smoke tests |

**No separate agents** for individual formulas, quadrants, or O\*NET—context packs in one Mak thread.

**Target architecture debt (north star):** single primary Mak thread; `career_brief` memory over confirmed evidence; lattice/CV context in every coaching turn.

---

## 16. CORE INNOVATION — SHARED CLOSING

Every institutional system is designed for the **institution to see the physician**. FISCMAK and the Physician Career Lattice are designed for the **physician to see themselves**—then to choose what to make visible, to whom, and for what purpose.

The AI is a **mirror with memory**, not surveillance. The map shows **where work lives**; Insights and Mak help interpret **what it means**; Output Studio helps **articulate** it. The system offers organized evidence; **human judgment** (physician and, when chosen, coach or committee) supplies the conclusion.

The ultimate test—shared with the Lattice’s final question—is whether a physician can describe their **best-version career in five years as felt experience**, not only as CV lines, and whether FISCMAK helps them build credible evidence and language for that bridge.

---

## 17. DECISION LOG (FOR STEERING COMMITTEE)

| Question | Decision |
|----------|----------|
| Adopt 8×8×4 as primary UI? | **No** — 8×8 tracks + quadrant/task metadata |
| Ship Formula 5 (G) to users? | **No** — internal/plain language only |
| Build compensation layer? | **No** — out of scope |
| 64 SI questions? | **No** — sparse Mak probes |
| Two lattices for trainee vs attending? | **Yes** — ADR-001 |
| O\*NET in pilot? | **No** — Phase 2+ optional |
| Institution sees individual Mak chat? | **No** |

---

## 18. REFERENCES & INTERNAL DOCS

**FISCMAK canonical:**

- [NORTH_STAR.md](./NORTH_STAR.md)  
- [MVP_GME_BACKEND_SPEC.md](./MVP_GME_BACKEND_SPEC.md) (ADR-001, ADR-002)  
- [page-ownership.md](./page-ownership.md)  
- [FISCMAK_MAK_LANGUAGE_GUIDE.md](./FISCMAK_MAK_LANGUAGE_GUIDE.md)  

**Lattice framework:** Physician Career Lattice whitepaper (May 2026) — theoretical superset; sections 5–6, 10–11, and 14 inform Phase 2+ only where noted above.

**Suggested next artifact:** [CAREER_LATTICE_MODEL.md](./CAREER_LATTICE_MODEL.md) — PCRS↔FISCMAK crosswalk, quadrant enums, optional task tags (to be authored if steering approves).

---

*FISCMAK — Understand your career. The silent C is invisible work made visible.*

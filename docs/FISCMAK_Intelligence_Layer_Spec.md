# FISCMAK Intelligence Layer Specification

**Version:** 1.1 · **Owner:** Kristen Palmer, MD · **Date:** May 31, 2026
**Status:** 📘 **TECHNICAL ANNEX** — the deep reference behind `FISCMAK_Master_System_Review.md` (the canonical source of truth). Use this for the full math and pre-made SOC/specialty tables. **Where this annex and the Master Review differ, the Master Review wins.**

> ⚠️ **Superseded decision:** §0 below lists "PFI, MDT, SVS, UWES-9" as the subjective layer — that is an EARLY draft. The current decision (per the Master Review, Part VIII) is **FCWI-only in production**; PFI/SVS run only during the pilot for concurrent validation, then drop. Treat Appendix J's FCWI as the live instrument. Use the **Master Review's FCWI item wording** as canonical.

This document consolidates the full design chain for FISCMAK's intelligence layer: the lattice axes, the rank matrix, the O*NET competency mapping, the RIASEC interest mapping, the seven O*NET gaps, and the composite-vector fit formula. It is the deep technical brief the formula-building agent reaches into.

---

## 0. The unifying principle

**Every FISCMAK formula is a subtraction. O*NET (and external reference data) supplies the EXPECTED side; FISCMAK measures the ACTUAL side. The discrepancy is the product.**

The intelligence layer has three empirically grounded sub-layers:

1. **Interest** — RIASEC / Prediger circumplex (McManus n>6,000)
2. **Competency** — O*NET 277-descriptor profiles (federal data)
3. **Subjective experience** — validated instruments (PFI, MDT, SVS, UWES-9) + adaptive Mak probes — *the layer no external tool can reach.*

---

## 1. Lattice axes (with the code-naming warning)

The lattice is **8 Career Skills/Tasks (rows) × 8 Career Domains (columns)**.

> ⚠️ **Code uses FLIPPED variable names.** Founder's **Career Domains** (columns) = code `TRACKS`. Founder's **Career Skills/Tasks** (rows) = code `DOMAINS`. Positions in code are correct; only the names invert. Translate when reading code.

**Columns — 8 Career Domains (code: `TRACKS`):** Clinician · Educator · Researcher · Administrator/Leader · Advocate · Innovator · Quality/Safety · Wellness Champion

**Rows — 8 Career Skills/Tasks (code: `DOMAINS`):** Clinical Expertise · Medical Knowledge · Practice-Based Learning · Communication · Professionalism & Ethics · Systems Thinking · Collaboration & Teamwork · Personal & Professional Development

A cell = "this skill/task (row), exercised within this career domain (column)."

---

## 2. The full rank matrix (each domain ranks all 8 tasks 1→8)

| Rank | Clinician | Educator | Researcher | Admin/Leader | Advocate | Innovator | Quality/Safety | Wellness Champ. |
|---|---|---|---|---|---|---|---|---|
| 1 | Clinical Expertise | Communication | Medical Knowledge | Systems Thinking | Systems Thinking | Practice-Based Learning | Practice-Based Learning | Personal & Prof. Dev. |
| 2 | Medical Knowledge | Practice-Based Learning | Practice-Based Learning | Collaboration & Teamwork | Professionalism & Ethics | Systems Thinking | Systems Thinking | Collaboration & Teamwork |
| 3 | Communication | Collaboration & Teamwork | Personal & Prof. Dev. | Professionalism & Ethics | Communication | Medical Knowledge | Clinical Expertise | Professionalism & Ethics |
| 4 | Professionalism & Ethics | Personal & Prof. Dev. | Communication | Communication | Collaboration & Teamwork | Communication | Collaboration & Teamwork | Communication |
| 5 | Collaboration & Teamwork | Clinical Expertise | Clinical Expertise | Practice-Based Learning | Clinical Expertise | Clinical Expertise | Communication | Clinical Expertise |
| 6 | Practice-Based Learning | Medical Knowledge | Collaboration & Teamwork | Clinical Expertise | Medical Knowledge | Collaboration & Teamwork | Professionalism & Ethics | Practice-Based Learning |
| 7 | Systems Thinking | Professionalism & Ethics | Systems Thinking | Medical Knowledge | Practice-Based Learning | Professionalism & Ethics | Medical Knowledge | Systems Thinking |
| 8 | Personal & Prof. Dev. | Systems Thinking | Professionalism & Ethics | Personal & Prof. Dev. | Personal & Prof. Dev. | Personal & Prof. Dev. | Personal & Prof. Dev. | Medical Knowledge |

**Ranks 4–8 ordering principles (CanMEDS importance study):** (1) Criticality first — failure causing direct patient harm ranks higher (Clinical Expertise & Communication never fall below rank 5). (2) Frequency second — daily tasks above episodic. (3) Domain relevance third — conceptual overlap with domain identity.

**Three patterns:** (a) PPD ranks last in 6 of 8 domains — it is a *meta-competency*, foundational to identity but not a discrete skill within most domains. (b) Clinical Expertise never disappears (≥ rank 5 everywhere) — the "integrating role" anchor. (c) Systems Thinking (rank 1→7) and Practice-Based Learning (rank 1→7) are the most domain-variable tasks → the strongest differentiators → the most useful variables for the F6 fit vector.

**Design implication for F6:** weight the fit computation by *variance/discriminative power*, NOT raw importance. Clinical Expertise is high-importance but near-zero variance → it must barely count in the similarity score, or all physicians look alike. Systems Thinking and Practice-Based Learning should dominate.

**Statistical caution:** rank data is *ipsative* (each column sums to 36), introducing built-in negative dependence between dimensions. Convert ranks to normalized weights or otherwise account for this before feeding cosine similarity — do not treat the 8 ranks as independent coordinates.

---

## 3. Confirmed Career Domain → primary Skills/Tasks (top 3)

| Career Domain | Primary Skills/Tasks |
|---|---|
| Clinician | Clinical Expertise · Medical Knowledge · Communication |
| Educator | Communication · Practice-Based Learning · Collaboration & Teamwork |
| Researcher | Medical Knowledge · Practice-Based Learning · Personal & Professional Development |
| Administrator / Leader | Systems Thinking · Collaboration & Teamwork · Professionalism & Ethics |
| Advocate | Systems Thinking · Professionalism & Ethics · Communication |
| Innovator | Practice-Based Learning · Systems Thinking · Medical Knowledge |
| Quality / Safety | Practice-Based Learning · Systems Thinking · Clinical Expertise |
| Wellness Champion | Personal & Professional Development · Collaboration & Teamwork · Professionalism & Ethics |

---

## 4. O*NET competency mapping — three layers

**The O*NET Content Model:** ~974 occupations × 277 descriptors in 6 categories:

| Category | Measures | # | Scale | Source |
|---|---|---|---|---|
| Abilities | Enduring cognitive/physical/sensory capabilities | 52 | Imp (1–5) + Level (1–7) | Trained raters |
| Skills | Developed capacities (Active Listening, Critical Thinking) | 35 | Imp + Level | Trained raters |
| Knowledge | Principles & facts (Medicine, Psychology, Education) | 33 | Imp + Level | Trained raters |
| Work Activities | General job behaviors (Caring for Others, Teaching) | 41 | Imp + Level | Incumbents |
| Work Context | Physical/social conditions (Conflict, Responsibility) | 57 | Freq (1–5) | Incumbents |
| Work Styles | Personal characteristics (Integrity, Leadership) | 16 | Imp (1–5) | Incumbents |

Plus Interests (RIASEC), Work Values (6), Experience Requirements.

**Layer 1 — SOC → base physician profile (the anchor).** Every physician starts with a base SOC code (29-1210…29-1249), giving the 277-descriptor "generic physician" vector. Shared by all physicians regardless of domain.

**Layer 2 — Supplementary SOC → domain differentiation (the signal).** Each career domain blends in a *non-physician* SOC code capturing the work the base profile misses (Educator borrows Teacher; Innovator borrows Developer). Blended using the rank weights. This is where domains diverge.

**Layer 3 — Descriptor-to-task mapping (the connections).** Each of the 8 tasks wires to specific O*NET descriptors across multiple categories (never 1-to-1):

| Task | Knowledge | Skills | Work Activities | Work Styles | Work Context |
|---|---|---|---|---|---|
| Clinical Expertise | Medicine & Dentistry; Biology; Chemistry | Science; Critical Thinking; Judgment & Decision Making | Assisting & Caring for Others; Making Decisions; Updating Knowledge | Attention to Detail; Dependability; Stress Tolerance | Consequence of Error; Responsible for Others' Health; Physically Aggressive People |
| Medical Knowledge | Medicine & Dentistry; Biology; Math & Science | Active Learning; Reading Comprehension; Science | Updating Knowledge; Analyzing Data; Processing Information | Analytical Thinking; Achievement/Effort; Initiative | Importance of Being Exact/Accurate |
| Practice-Based Learning | Education & Training; English Language | Learning Strategies; Active Learning; Complex Problem Solving | Evaluating Info for Compliance; Judging Qualities; Monitoring | Achievement/Effort; Persistence; Initiative | Frequency of Decision Making |
| Communication | Psychology; Customer & Personal Service; English | Active Listening; Speaking; Social Perceptiveness | Communicating w/ Peers; Maintaining Relationships; Resolving Conflicts | Cooperation; Concern for Others; Social Orientation | Contact w/ Others; Face-to-Face; Angry People |
| Professionalism & Ethics | Philosophy & Theology; Law & Govt; Psychology | Judgment & Decision Making; Social Perceptiveness | Evaluating for Compliance; Resolving Conflicts | Integrity; Self-Control; Dependability | Consequence of Error; Responsible for Health |
| Systems Thinking | Administration & Mgmt; Public Safety; Law & Govt | Systems Analysis; Systems Evaluation; Mgmt of Personnel | Coordinating Others; Developing Strategies; Planning Work | Leadership; Adaptability; Initiative | Responsibility for Outcomes; Lead Others |
| Collaboration & Teamwork | Customer & Personal Service; Admin & Mgmt | Coordination; Persuasion; Negotiation | Communicating w/ Peers; Maintaining Relationships; Coordinating Others | Cooperation; Leadership; Social Orientation | Work w/ Team; Coordinate/Lead Others |
| Personal & Prof. Dev. | Psychology; Education & Training | Active Learning; Learning Strategies; *Self-Mgmt (not in O*NET)* | Thinking Creatively; Developing Strategies | Achievement/Effort; Independence; Innovation | *No strong match — the gap* |

**Composite vector formula (F6 input):**

`V_domain = 0.50 · V_base_physician + 0.50 · Σ(r=1→8) w_r · V_task_r_descriptors`

where `w_r` = normalized weight from rank position (rank 1 highest, rank 8 lowest).

**Worked example — Educator:** Base SOC 29-1216 (General Internist) + Supplementary SOC 25-1071 (Health Specialties Teachers). Rank 1 (Communication) → Active Listening, Speaking, Training & Teaching Others, Coaching → weight 0.25. Rank 2 (Practice-Based Learning) → Learning Strategies, Evaluating Information → 0.20. Rank 3 (Collaboration) → Coordination, Establishing Relationships → 0.15. Ranks 4–8 progressively lower. Result = the Educator domain's 277-element O*NET fingerprint. Physician's self-reported profile → same 277-space → cosine similarity = Person-Occupation Fit (F6).

**Critical rule:** PPD cannot be O*NET-mapped (no descriptor for identity/self-reflection/imposter/wellbeing). **Exclude PPD from the F6 cosine vector**; measure it entirely via FISCMAK instruments. Forcing it into the vector adds noise.

---

## 5. The seven O*NET gaps → FISCMAK components

| # | Gap | O*NET miss | FISCMAK fills with | Formula |
|---|---|---|---|---|
| 1 | Invisible work | No descriptor for after-hours/mentoring/prior-auth/emotional labor | OI/SI quadrants; self-reported FTE | **F5 Recognition Gap** |
| 2 | Within-occupation variation | One profile per SOC; all physicians coded ISR | 8×8 lattice; supplementary-SOC blend | the lattice itself |
| 3 | Work Values (underused) | 6 values exist but no API surfaces them | Map each value → energy ranking + discrepancies | F3/F4/F5 |
| 4 | Temporal/longitudinal | Static snapshot, no trajectory | Longitudinal overlay; graduation handoff | fit-over-time (derivative) |
| 5 | Emotional/psychological | No moral distress/identity/imposter; Work Styles too shallow | PFI, MDT, SVS, UWES-9, Mak probes | **pure signal — no anchor** |
| 6 | Need-supply vs demand-ability | Only "can you do the job?" never "does the job give what you need?" | Energy ranking + F4 + autonomy | **F4 Perception Gap** |
| 7 | Dimensionality/structure | 277 raw descriptors; PCA loses within-physician detail | Full vector for F6; VOLCANO 3-axis as onboarding map | F6 + intro visual |

**Work Values → FISCMAK mapping (Gap 3):** Achievement→energy ranking (Clinician/Researcher/Innovator); Working Conditions→F3 (all domains, the P-E fit signal); Recognition→F5 (Educator/Advocate/Wellness); Relationships→Communication/Collaboration rankings (Clinician/Educator/Wellness); Support→F4 (Admin/Leader, Quality/Safety); Independence→autonomy (all, esp. Researcher/Innovator). *Pressure-test: Achievement & Independence may be SI-quadrant (Gap-5 type) rather than true discrepancies.*

**Two gaps break the subtraction pattern (the strategic core):**
- **Gap 5** has NO expected side — pure FISCMAK signal. Strongest moat (un-replicable from public data) AND heaviest validation burden (no external benchmark).
- **Gap 6** reframes the market: every competitor computes demand-ability fit; FISCMAK is the only one computing need-supply fit. For physicians (who can almost always do the job), that is the entire question. **Headline thesis.**

**Moat note:** Gap 4 (longitudinal) may be the single most defensible asset — a 12-year career dataset cannot be fast-followed; it only accrues. The graduation handoff is the mechanism.

**Data-cost note:** O*NET is the static *scaffold* — pulled once, cached for all physicians. Only the "actual" half is per-user (cheap self-report). Near-zero marginal data cost for the intelligence layer.

---

## 6. RIASEC interest mapping (Petrides & McManus 2004; n>6,000)

Medical specialties map onto a 2-D space paralleling Holland's RIASEC, with Prediger's Things–People and Data–Ideas axes.

**McManus medical-RIASEC homology:** R=Surgery (Things+Data) · I=Hospital Medicine (Things+Ideas) · A=Psychiatry (People+Ideas) · S=Public Health (People+Ideas) · E=Administrative Medicine (People+Data) · C=Laboratory Medicine (Things+Data).

**FISCMAK domain RIASEC codes (primary·secondary·tertiary):**

| Domain | Code | Prediger position |
|---|---|---|
| Clinician | I·S·R | Center of circumplex |
| Educator | S·I·A | People + Ideas |
| Researcher | I·A·C | Things + Ideas |
| Admin/Leader | E·S·C | People + Data |
| Advocate | S·E·A | People + Ideas (+ enterprising) |
| Innovator | I·R·E | Things + Ideas → Data |
| Quality/Safety | C·I·S | Things + Data |
| Wellness Champion | S·A·I | People + Ideas |

**Anchor SOC codes (RIASEC source — to confirm):** Clinician 29-1216 · Educator 25-1071 · Researcher 19-1042 · Admin/Leader 11-9111 · Advocate 21-1094 · Innovator 15-2051 + 19-1042 (blend) · Quality/Safety 29-9021 · Wellness Champion 21-1014.

**Implementation:** use a continuous 6-element RIASEC vector, not a 3-letter code.
`RIASEC_domain = 0.50 · RIASEC_physician_SOC + 0.50 · RIASEC_anchor_SOC`
Physician completes O*NET Interest Profiler (60 items, free, ~10 min) → personal 6-vector → congruence with each domain via C-index (Iachan 1984) or cosine similarity.

**Geometry payoff:** distance on the circumplex = empirical basis for F7 (Transfer Potential). Near-neighbors (Educator·Wellness·Advocate in People+Ideas; Researcher·Innovator in Things+Ideas) = short, credible transfer pathways.

**Congruence paradox (and why it's a gift):** RIASEC-alone has modest predictive power (Nauta 50-yr review; Meir & Engel r=0.27–0.53). That ceiling is the argument FISCMAK's *multi-layer* stack is necessary — a single-layer competitor hits a hard ~0.5 wall. RIASEC is the interest layer only; O*NET descriptors = competency layer; FISCMAK instruments = subjective layer.

**Onboarding shortcut (Gennissen 2021, Q-methodology):** three career orientations — (1) lifelong self-development (I+A → Researcher/Educator), (2) work-life balance (S+C → Clinician/Quality/Safety), (3) achievement & recognition (E+I → Admin/Leader/Innovator). Use as a **3-question intake screen** to pre-position a physician on the circumplex before the full 60-item profiler. Fast path now, precise path later.

---

## 7. Formula register (the engine)

| F | Name | Computation | Notes |
|---|---|---|---|
| F1 | Evidence Density | Σ w_s · n(s,q,d,t) | source-reliability-weighted, physician-confirmed |
| F3 | Structural Discrepancy | (Actual − Expected)/(Expected + δ) | FTE self-report vs. institutional allocation |
| F4 | Perception Gap | Perceived − Expected | the need-supply-fit signal (Gap 6) |
| F5 | Recognition Gap | Σ(OI+SI)/Σ(OV+SV) | internal/coaching only, never a headline number |
| F6 | Person-Occupation Fit | cosine(physician vector, domain vector) | exclude PPD; weight by variance; mind ipsative ranks |
| F7 | Transfer Potential | D(q,d,t) · Relevance(→goal) · DirCost(from→to) | circumplex distance grounds "relevance"; **directional** — see note |

**F7 directionality correction (Dawson et al. 2021).** Occupational transitions are *asymmetric* — it is easier to move one direction than the reverse, and a recommender built on O*NET skill similarity hit 76% accuracy only after accounting for this. Circumplex distance alone is symmetric and therefore wrong. F7 must include a directional cost term `DirCost(from→to)`: the gap is computed as what the *target* basket requires that the *source* basket lacks (a set difference), not a symmetric distance. Moving Clinician→Innovator ≠ Innovator→Clinician.

---

## 7.5 Adjacent-SOC architecture — translation anchors, not destinations

This is the most strategically important decision in the O*NET integration. It supersedes the earlier "one supplementary SOC per domain" assumption (old §8.4).

**The hard product rule (identity-safety, not just accuracy):**

> **Adjacent SOCs are translation anchors, not destination recommendations. The physician stays the physician — the adjacent SOC names the hidden function.** Never output "you may enjoy becoming a radiologic technologist" — to a physician that reads as a demotion and causes instant churn. Output instead: "your work has a strong imaging-systems signature." This rule sits alongside the §9 validation posture as a hard constraint on every user-facing string.

**Architectural change — supplementary SOC is a weighted BASKET, not a single code.** Each career domain (and more precisely each *specialty/subspecialty*) blends in a weighted set of adjacent SOCs. A retina ophthalmologist and a cataract ophthalmologist share the base SOC (29-1241) but draw *different baskets* — imaging+data+device vs. surgical-tech+industrial-eng+management. The basket composition **is** the hidden lattice. The V_domain formula's supplementary term becomes `Σ_k β_k · V_adjacentSOC_k` where β_k are specialty-specific basket weights.

**The five operational uses of an adjacent SOC** (it is a descriptor library, queried five ways — never a job suggestion):

| # | Use | What FISCMAK does with the adjacent SOC |
|---|---|---|
| 1 | Skill extraction | Pull the adjacent SOC's Work Activities + Detailed Work Activities (DWAs) — the granular transferable skill clusters the base physician SOC omits |
| 2 | Task translation | Rewrite plain physician speech ("I read OCTs and fundus photos") into competency language ("high-volume visual pattern recognition using device-generated imaging data; supervises diagnostic acquisition workflows") for CVs, grants, dossiers, product/medtech narratives |
| 3 | Career-path inference | Read the *direction* a work pattern implies (loves imaging → ophthalmic AI / retina analytics), never a literal job title |
| 4 | Gap analysis | Compute current-basket vs. target-basket (NOT physician-vs-technician); output concrete gap *questions* ("Can you define labels, validation, bias, metrics?") + a bridge plan, never a career demotion |
| 5 | Hidden-role fingerprinting | The highest-value use: a specialty contains multiple "occupations inside it" — each subtype is a distinct adjacent-SOC blend (retina AI innovator = radiology-tech + data-scientist + biomedical-engineer). This is what makes the 8×8 lattice specialty-specific |

Phase 2+ uses build on these: (6) specialty modules — "which adjacent domain gives you energy?"; (7) non-clinical translation language; (8) institutional analytics — aggregate adjacent-SOC overlap across a department surfaces invisible labor (high Mediator-SOC overlap = a hidden conflict-containment function no RVU or milestone captures).

**The six universal hidden functions.** Six adjacent SOCs recur across nearly every specialty — they are candidate *latent axes* of physician work (the VOLCANO dimensionality insight made concrete: ~6 interpretable axes rather than 277 raw descriptors):

| Hidden function | Adjacent SOC | Signal | Recurs across |
|---|---|---|---|
| Device / Procedural | 17-2031 Biomedical Engineers | Device-mediated procedural work | Ophtho, Cardiology, Neurosurg, Vascular, CT, ENT, Urology, Ortho, Anesthesia, OB/GYN |
| Data / Pattern | 15-2051 Data Scientists | Image/data-intensive pattern recognition (AI-adjacent) | Radiology, Ophtho, Cardiology, Rheum, Endo, Neuro, Derm, Pathology |
| Logistics / Ops | 13-1082 Project Management Specialists | Crisis operations + systems coordination | EM, Hospitalist, Trauma, Neonatology, Peds EM, Transplant, Stroke, Neurocritical |
| Emotional Labor | 21-1022 Healthcare Social Workers | Psychosocial complexity + family systems | Palliative, Peds Onc, Gyn Onc, Transplant, Geri Psych, OB/GYN, Breast Imaging |
| Conflict / Containment | 23-1022 Arbitrators/Mediators | Conflict containment (most invisible function) | CL Psych, Emergency Psych, Forensic Psych, Palliative, Violence/Crisis, Peds EM |
| Imaging Interface | 29-2034 Radiologic Technologists | Imaging workflow dependence (tech-physician interface) | Radiology, Ophtho (retina), Stroke, Breast Imaging |

**Evidence base.** Aufiero et al. 2024 (Job & Skill Progression Networks): occupations link by statistically significant skill co-occurrence; "uncoherent"/diverse skill sets map to higher wages + greater mobility — validating that a multi-basket physician has a high-value skill set the single SOC cannot express. Dawson et al. 2021: O*NET-similarity transition recommender at 76% accuracy *with* transition asymmetry (→ F7 directionality). VOLCANO (Yu et al. 2024): occupations localize in a continuous multidimensional space from O*NET KSA ratings → the hidden-function axes above.

---

## 8. Open decisions (pending founder/research input)

1. **Domain renumber** — code DOMAINS array + routing must be aligned to the §1 order (separates Medical Knowledge from Practice-Based Learning). Spec'd ticket ready; touches ~6 source + 3 test files. Run on `v3-build`, code+tests only, no DB.
2. **Activity routing bug** — `coordinated_complex_care` stored under Professionalism → move to Clinical Expertise.
3. **Two judgment calls** — `handled_conflict` (Communication vs. Collaboration); `supported_distressed_learner` (Admin/Leader vs. Wellness Champion).
4. **Supplementary SOC codes** — ~~confirm the §4/§6 single SOC choices~~ **SUPERSEDED by §7.5**: supplementary SOC is now a weighted, specialty-specific *basket* of adjacent SOCs (Appendix B). Open work: confirm each adjacent SOC + assign basket weights β_k per specialty against live O*NET.
5. **RIASEC-vs-rank tension** — where a domain's RIASEC code (e.g. Quality/Safety = C) diverges from its top tasks (PBL/Systems = I/E), define which governs the fit score.
6. **Work Values pressure-test** — confirm each of the 6 values has a true "expected" side vs. being back-fit (Achievement, Independence suspect).

---

## 9. Validation posture

The principles are cited (CanMEDS, McManus, Prediger, O*NET, Liu, Gennissen). The specific 64-cell rankings, domain RIASEC codes, and SOC choices are **founder synthesis — face-valid, not yet empirically validated.** Per the v3 spec: validate before institutional claims. This engine drives internal coaching/structure; it must NOT surface to a physician as "you score low on X," and the pilot should be designed to test whether these mappings predict real outcomes.

---

*Design chain captured: axes → rank matrix → O*NET 3-layer → descriptor wiring → 7-gap architecture → RIASEC circumplex → composite fit formula → adjacent-SOC translation architecture. This is the spec the formula-building agent works from.*

---

## Appendix A — Universal non-physician SOC library (reusable "other field" anchors)

Every specialty may map to these. They are descriptor libraries, not destinations (§7.5).

| Field | SOC code | O*NET title | Why it matters for physicians |
|---|---|---|---|
| Medical leadership | 11-9111 | Medical and Health Services Managers | Medical director, program director, service-line lead |
| Consulting / strategy | 13-1111 | Management Analysts | Big 4-style physician strategy, operations consulting |
| Project execution | 13-1082 | Project Management Specialists | QI, workflow redesign, implementation |
| Education | 25-1071 | Health Specialties Teachers, Postsecondary | Med ed, residency teaching, curriculum |
| Instructional design | 25-9031 | Instructional Coordinators | Curriculum building, competency frameworks |
| Research | 19-1042 | Medical Scientists, Except Epidemiologists | Translational / clinical research |
| Epidemiology | 19-1041 | Epidemiologists | Population health, outcomes, public health |
| Data science | 15-2051 | Data Scientists | Analytics, AI, prediction, dashboards |
| Informatics / systems | 15-1211 | Computer Systems Analysts | EHR optimization, clinical informatics |
| Software / product | 15-1252 | Software Developers | Digital health, AI tools, platform build |
| UX / product research | 15-1255 | Web and Digital Interface Designers | Clinical product design, user workflows |
| Health records / data | 29-9021 | Health Information Technologists and Medical Registrars | Documentation, coding, quality metrics |
| Technical writing | 27-3042 | Technical Writers | Guidelines, protocols, grants, white papers |
| Communications | 27-3031 | Public Relations Specialists | Physician advocacy, institutional messaging |
| Law / policy | 23-1011 | Lawyers | Medicolegal, ethics, regulatory interface |
| Mediation | 23-1022 | Arbitrators, Mediators, and Conciliators | Conflict, family meetings, ethics disputes |
| Occupational safety | 19-5011 | Occupational Health and Safety Specialists | Workplace health, safety, return-to-work |
| Human capital | 13-1071 | Human Resources Specialists | Physician workforce, recruitment, retention |
| Organizational psychology | 19-3032 | Industrial-Organizational Psychologists | Physician culture, leadership, burnout systems |
| Clinical psychology | 19-3033 | Clinical and Counseling Psychologists | Assessment, behavior, therapy-adjacent work |
| Social work | 21-1022 / 21-1023 | Healthcare / Mental Health Social Workers | Discharge, psychosocial systems, crisis care |
| Biomedical engineering | 17-2031 | Bioengineers and Biomedical Engineers | Device, medtech, clinical engineering |
| Industrial engineering | 17-2112 | Industrial Engineers | Throughput, OR flow, ED flow, systems design |
| Genetic counseling | 29-9092 | Genetic Counselors | Genomics, counseling, risk communication |

---

## Appendix B — Specialty-by-specialty adjacency map

Each base clinical anchor (the physician's SOC) with the adjacent-SOC baskets per subspecialty/track. Basket weights (β_k) to be assigned against live O*NET.

### Psychiatry — base 29-1223.00 Psychiatrists

| Subspecialty / track | Adjacent non-physician SOCs |
|---|---|
| Consultation-liaison | 23-1022 Mediators; 21-1022 Healthcare Social Workers; 13-1111 Management Analysts; 29-9021 Health Information Technologists |
| Emergency psychiatry | 23-1022 Mediators; 33-3051 Police/Sheriff's Patrol Officers; 21-1023 Mental Health Social Workers; 13-1082 Project Management Specialists |
| Addiction psychiatry | 21-1011 Substance Abuse & Behavioral Disorder Counselors; 21-1023 Mental Health Social Workers; 19-1041 Epidemiologists |
| Child psychiatry | 21-1013 Marriage & Family Therapists; 21-1021 Child/Family/School Social Workers; 25-2055 Special Education Teachers |
| Forensic psychiatry | 23-1011 Lawyers; 23-1022 Mediators; 19-4092 Forensic Science Technicians; 33-1012 First-Line Supervisors of Police |
| Geriatric psychiatry | 21-1022 Healthcare Social Workers; 11-9111 Medical/Health Services Managers; 29-1141 Registered Nurses |
| Med-ed / residency leadership | 25-1071 Health Specialties Teachers; 25-9031 Instructional Coordinators; 11-9033 Education Administrators, Postsecondary |
| Digital mental health | 15-2051 Data Scientists; 15-1252 Software Developers; 15-1255 Web/Digital Interface Designers |

*FISCMAK interpretation: psychiatry often behaves like conflict mediation, systems navigation, identity work, crisis containment, leadership development, and narrative translation.*

### Internal Medicine — base 29-1216.00 General Internal Medicine Physicians

| Subspecialty | Adjacent SOCs |
|---|---|
| Hospital medicine | 11-9111 Medical Managers; 13-1082 Project Managers; 29-9021 Health Information Technologists; 13-1111 Management Analysts |
| Cardiology | 29-2031 Cardiovascular Technologists; 17-2031 Biomedical Engineers; 15-2051 Data Scientists |
| Gastroenterology | 29-2055 Surgical Technologists; 13-1082 Project Managers; 19-1042 Medical Scientists |
| Pulmonary / critical care | 29-1126 Respiratory Therapists; 29-1141.03 Critical Care Nurses; 17-2112 Industrial Engineers |
| Nephrology | 29-2099 Health Technologists; 11-9111 Medical Managers; 13-1111 Management Analysts |
| Hematology / oncology | 19-1042 Medical Scientists; 29-9092 Genetic Counselors; 21-1022 Healthcare Social Workers |
| Infectious disease | 19-1041 Epidemiologists; 19-5011 Occupational Health & Safety Specialists; 11-9111 Medical Managers |
| Rheumatology | 19-1042 Medical Scientists; 29-2011 Medical Lab Technologists; 15-2051 Data Scientists |
| Endocrinology | 29-2051 Dietetic Technicians; 29-1031 Dietitians/Nutritionists; 15-2051 Data Scientists |
| Allergy / immunology | 29-1229.01 Allergists/Immunologists; 19-1042 Medical Scientists; 29-2011 Lab Technologists |
| Preventive medicine | 29-1229.05 Preventive Medicine Physicians; 19-1041 Epidemiologists; 19-5011 Occupational Safety Specialists |
| Palliative care | 21-1022 Healthcare Social Workers; 23-1022 Mediators; 21-1013 Marriage & Family Therapists |

*FISCMAK interpretation: IM subspecialties split into diagnostics, chronic systems management, procedure/device interface, population health, risk, and complex-care navigation.*

### Family Medicine — base 29-1215.00 Family Medicine Physicians

| Track | Adjacent SOCs |
|---|---|
| Primary care leadership | 11-9111 Medical Managers; 13-1082 Project Managers; 13-1111 Management Analysts |
| Community health | 19-1041 Epidemiologists; 21-1094 Community Health Workers; 21-1091 Health Education Specialists |
| Sports medicine | 29-1229.06 Sports Medicine Physicians; 29-1128 Exercise Physiologists; 29-9091 Athletic Trainers |
| Addiction / behavioral primary care | 21-1011 Substance Abuse Counselors; 21-1023 Mental Health Social Workers; 19-3033 Clinical Psychologists |
| Rural medicine | 21-1094 Community Health Workers; 11-9111 Medical Managers; 13-1199 Business Operations Specialists |
| Women's health | 29-1161 Nurse Midwives; 21-1022 Healthcare Social Workers; 19-1041 Epidemiologists |
| Lifestyle medicine | 29-1031 Dietitians/Nutritionists; 29-1128 Exercise Physiologists; 21-1091 Health Education Specialists |

*FISCMAK interpretation: FM maps strongly to population health, community infrastructure, education, prevention, and longitudinal relationship management.*

### Emergency Medicine — base 29-1214.00 Emergency Medicine Physicians

| Track | Adjacent SOCs |
|---|---|
| ED operations | 13-1082 Project Managers; 17-2112 Industrial Engineers; 11-9111 Medical Managers |
| EMS / prehospital | 29-2042 EMTs; 29-2043 Paramedics; 33-3051 Police Officers |
| Disaster medicine | 19-5011 Occupational Safety Specialists; 13-1082 Project Managers; 33-2011 Firefighters |
| Toxicology | 19-4031 Chemical Technicians; 19-1042 Medical Scientists; 29-2011 Lab Technologists |
| Ultrasound | 29-2032 Diagnostic Medical Sonographers; 29-2034 Radiologic Technologists |
| Simulation education | 25-1071 Health Specialties Teachers; 25-9031 Instructional Coordinators |
| Violence / crisis work | 23-1022 Mediators; 21-1023 Mental Health Social Workers; 33-3051 Police Officers |

*FISCMAK interpretation: EM = physician + logistics + risk + operations + crisis systems.*

### Pediatrics — base 29-1221.00 Pediatricians, General

| Subspecialty | Adjacent SOCs |
|---|---|
| Developmental-behavioral | 19-3033 Clinical Psychologists; 21-1021 Child/Family/School Social Workers; 25-2055 Special Education Teachers |
| Pediatric hospital medicine | 11-9111 Medical Managers; 29-1141 Registered Nurses; 13-1082 Project Managers |
| Neonatology | 29-1141.03 Critical Care Nurses; 29-1126 Respiratory Therapists; 17-2031 Biomedical Engineers |
| Pediatric cardiology | 29-2031 Cardiovascular Technologists; 17-2031 Biomedical Engineers |
| Pediatric oncology | 19-1042 Medical Scientists; 29-9092 Genetic Counselors; 21-1022 Social Workers |
| Child abuse pediatrics | 23-1011 Lawyers; 21-1021 Child/Family Social Workers; 33-3021 Detectives/Criminal Investigators |
| Adolescent medicine | 21-1023 Mental Health Social Workers; 21-1091 Health Education Specialists |
| Pediatric emergency medicine | 29-2043 Paramedics; 23-1022 Mediators; 13-1082 Project Managers |

*FISCMAK interpretation: pediatrics blends medicine with family systems, education systems, advocacy, safeguarding, and developmental psychology.*

### OB/GYN — base 29-1218.00 Obstetricians and Gynecologists

| Subspecialty | Adjacent SOCs |
|---|---|
| General OB/GYN | 29-1161 Nurse Midwives; 21-1022 Healthcare Social Workers; 11-9111 Medical Managers |
| Maternal-fetal medicine | 29-9092 Genetic Counselors; 29-2032 Sonographers; 19-1042 Medical Scientists |
| Reproductive endocrinology / infertility | 29-9092 Genetic Counselors; 19-1042 Medical Scientists; 29-2011 Lab Technologists |
| Gynecologic oncology | 19-1042 Medical Scientists; 29-9092 Genetic Counselors; 21-1022 Social Workers |
| Urogynecology | 29-1123 Physical Therapists; 29-2091 Orthotists/Prosthetists; 17-2031 Biomedical Engineers |
| Family planning | 21-1091 Health Education Specialists; 19-1041 Epidemiologists; 23-1011 Lawyers |
| Menopause / gender health | 29-1031 Dietitians/Nutritionists; 19-3033 Clinical Psychologists; 21-1091 Health Educators |

*FISCMAK interpretation: OB/GYN maps to procedural care, counseling, reproductive ethics, device/technology, public health, and gendered policy systems.*

### Surgery — base 29-1249.00 Surgeons, All Other (plus specific surgical anchors)

| Surgical field | Adjacent SOCs |
|---|---|
| General surgery | 29-2055 Surgical Technologists; 17-2112 Industrial Engineers; 11-9111 Medical Managers |
| Trauma surgery | 29-2043 Paramedics; 33-2011 Firefighters; 13-1082 Project Managers |
| Vascular surgery | 29-2031 Cardiovascular Technologists; 17-2031 Biomedical Engineers |
| Cardiothoracic surgery | 29-2031 Cardiovascular Technologists; 17-2031 Biomedical Engineers; 29-1141.03 Critical Care Nurses |
| Neurosurgery | 29-2099.01 Neurodiagnostic Technologists; 17-2031 Biomedical Engineers; 15-2051 Data Scientists |
| Plastic surgery | 27-1011 Art Directors; 17-2031 Biomedical Engineers; 29-2091 Orthotists/Prosthetists |
| Transplant surgery | 11-9111 Medical Managers; 21-1022 Social Workers; 13-1082 Project Managers |
| Surgical oncology | 19-1042 Medical Scientists; 29-9092 Genetic Counselors; 21-1022 Social Workers |
| Colorectal surgery | 29-2055 Surgical Technologists; 29-2091 Orthotists/Prosthetists; 13-1082 Project Managers |
| ENT | 29-1181 Audiologists; 29-1127 Speech-Language Pathologists; 17-2031 Biomedical Engineers |
| Urology | 29-1229.03 Urologists; 17-2031 Biomedical Engineers; 29-2032 Sonographers |

*FISCMAK interpretation: surgery has huge adjacency to engineering, device design, OR operations, aesthetics, robotics, crisis leadership, and team choreography.*

### Orthopedic Surgery — base 29-1242.00 Orthopedic Surgeons

| Subspecialty | Adjacent SOCs |
|---|---|
| Sports orthopedics | 29-9091 Athletic Trainers; 29-1128 Exercise Physiologists; 29-1123 Physical Therapists |
| Spine | 29-1123 Physical Therapists; 17-2031 Biomedical Engineers; 29-2091 Orthotists/Prosthetists |
| Hand | 29-1122 Occupational Therapists; 29-2091 Orthotists/Prosthetists; 17-2031 Biomedical Engineers |
| Joint replacement | 17-2031 Biomedical Engineers; 17-2112 Industrial Engineers; 29-2091 Orthotists/Prosthetists |
| Pediatric ortho | 29-1123 Physical Therapists; 25-2055 Special Education Teachers; 21-1021 Child/Family Social Workers |
| Trauma ortho | 29-2043 Paramedics; 29-2055 Surgical Technologists; 13-1082 Project Managers |

*FISCMAK interpretation: ortho = medicine + biomechanics + rehab + device + performance optimization.*

### Neurology — base 29-1217.00 Neurologists

| Subspecialty | Adjacent SOCs |
|---|---|
| Stroke | 29-2099.01 Neurodiagnostic Technologists; 29-2034 Radiologic Technologists; 13-1082 Project Managers |
| Epilepsy | 29-2099.01 Neurodiagnostic Technologists; 15-2051 Data Scientists; 19-1042 Medical Scientists |
| Movement disorders | 29-1123 Physical Therapists; 29-1122 Occupational Therapists; 17-2031 Biomedical Engineers |
| Neuroimmunology | 19-1042 Medical Scientists; 29-2011 Lab Technologists; 15-2051 Data Scientists |
| Neurocritical care | 29-1141.03 Critical Care Nurses; 29-1126 Respiratory Therapists; 13-1082 Project Managers |
| Behavioral neurology | 19-3033 Clinical Psychologists; 21-1023 Mental Health Social Workers |
| Neuromuscular | 29-1123 Physical Therapists; 29-2091 Orthotists/Prosthetists; 29-2099.01 Neurodiagnostic Technologists |

*FISCMAK interpretation: neurology sits between diagnostics, cognition, rehab, devices, signal interpretation, and longitudinal disability systems.*

### Radiology — base 29-1224.00 Radiologists

| Subspecialty | Adjacent SOCs |
|---|---|
| Diagnostic radiology | 29-2034 Radiologic Technologists; 29-2035 MRI Technologists; 15-2051 Data Scientists |
| Interventional radiology | 29-2055 Surgical Technologists; 17-2031 Biomedical Engineers; 29-2031 Cardiovascular Technologists |
| Neuroradiology | 29-2099.01 Neurodiagnostic Technologists; 15-2051 Data Scientists |
| Breast imaging | 29-2034 Radiologic Technologists; 21-1022 Healthcare Social Workers; 13-1082 Project Managers |
| Nuclear medicine | 29-2033 Nuclear Medicine Technologists; 19-4051 Nuclear Technicians; 19-1042 Medical Scientists |
| AI / imaging informatics | 15-2051 Data Scientists; 15-1211 Systems Analysts; 15-1252 Software Developers |

*FISCMAK interpretation: radiology = diagnostic pattern recognition + imaging tech + AI/data + workflow throughput.*

### Pathology — base 29-1222.00 Pathologists

| Subspecialty | Adjacent SOCs |
|---|---|
| Anatomic pathology | 29-2011 Medical Lab Technologists; 19-4021 Biological Technicians; 19-1042 Medical Scientists |
| Clinical pathology | 29-2011 Lab Technologists; 11-9121 Natural Sciences Managers; 13-1082 Project Managers |
| Forensic pathology | 19-4092 Forensic Science Technicians; 23-1011 Lawyers; 33-3021 Detectives |
| Molecular / genomic pathology | 29-9092 Genetic Counselors; 19-4021 Biological Technicians; 15-2051 Data Scientists |
| Transfusion medicine | 11-9111 Medical Managers; 29-2011 Lab Technologists; 13-1082 Project Managers |
| Informatics pathology | 15-1211 Systems Analysts; 15-2051 Data Scientists; 29-9021 Health Information Technologists |

*FISCMAK interpretation: pathology bridges medicine, laboratory systems, quality control, forensic/legal systems, genomics, and informatics.*

### Dermatology — base 29-1213.00 Dermatologists

| Subspecialty | Adjacent SOCs |
|---|---|
| Medical dermatology | 29-2011 Lab Technologists; 19-1042 Medical Scientists |
| Procedural dermatology | 29-2055 Surgical Technologists; 17-2031 Biomedical Engineers |
| Dermatopathology | 29-2011 Lab Technologists; 19-4021 Biological Technicians |
| Cosmetic dermatology | 39-5091 Makeup Artists; 27-1013 Fine Artists; 11-2021 Marketing Managers |
| Pediatric dermatology | 21-1021 Child/Family Social Workers; 25-2055 Special Education Teachers |
| Teledermatology / AI | 15-2051 Data Scientists; 15-1255 Web/Digital Interface Designers; 15-1211 Systems Analysts |

*FISCMAK interpretation: derm spans diagnostic visual patterning, procedures, aesthetics, consumer medicine, AI triage, and brand/market dynamics.*

### Anesthesiology — base 29-1211.00 Anesthesiologists

| Subspecialty | Adjacent SOCs |
|---|---|
| OR anesthesia | 29-1151 Nurse Anesthetists; 29-2055 Surgical Technologists; 17-2112 Industrial Engineers |
| Critical care anesthesia | 29-1141.03 Critical Care Nurses; 29-1126 Respiratory Therapists; 13-1082 Project Managers |
| Pain medicine | 29-1123 Physical Therapists; 19-3033 Clinical Psychologists; 21-1015 Rehabilitation Counselors |
| Pediatric anesthesia | 29-1141 Registered Nurses; 21-1021 Child/Family Social Workers |
| Cardiac anesthesia | 29-2031 Cardiovascular Technologists; 17-2031 Biomedical Engineers |
| Perioperative medicine | 11-9111 Medical Managers; 13-1082 Project Managers; 17-2112 Industrial Engineers |

*FISCMAK interpretation: anesthesia = physiology + risk + calm under uncertainty + OR systems + perioperative operations.*

### PM&R — base 29-1229.04 Physical Medicine and Rehabilitation Physicians

| Subspecialty | Adjacent SOCs |
|---|---|
| General rehab | 29-1123 Physical Therapists; 29-1122 Occupational Therapists; 21-1015 Rehabilitation Counselors |
| Brain injury | 29-1127 Speech-Language Pathologists; 19-3033 Clinical Psychologists; 29-2099.01 Neurodiagnostic Technologists |
| Spinal cord injury | 29-2091 Orthotists/Prosthetists; 29-1123 Physical Therapists; 17-2031 Biomedical Engineers |
| Pain | 19-3033 Clinical Psychologists; 29-1123 Physical Therapists; 21-1015 Rehab Counselors |
| Sports medicine | 29-9091 Athletic Trainers; 29-1128 Exercise Physiologists; 29-1123 Physical Therapists |
| Prosthetics / orthotics | 29-2091 Orthotists/Prosthetists; 17-2031 Biomedical Engineers |

*FISCMAK interpretation: PM&R is one of the most lattice-friendly fields: function, identity, engineering, disability, coaching, performance, and systems of recovery.*

### Ophthalmology — base 29-1241.00 Ophthalmologists, Except Pediatric

| Subspecialty | Adjacent SOCs |
|---|---|
| Retina | 29-2034 Radiologic Technologists; 17-2031 Biomedical Engineers; 15-2051 Data Scientists |
| Glaucoma | 29-2057 Ophthalmic Medical Technicians; 17-2031 Biomedical Engineers |
| Cornea | 29-2057 Ophthalmic Medical Technicians; 19-1042 Medical Scientists |
| Oculoplastics | 29-2055 Surgical Technologists; 27-1013 Fine Artists; 17-2031 Biomedical Engineers |
| Pediatric ophthalmology | 29-1229.02 Orthoptists; 21-1021 Child/Family Social Workers |
| Vision tech / AI | 15-2051 Data Scientists; 15-1252 Software Developers; 17-2031 Biomedical Engineers |

*FISCMAK interpretation: ophthalmology blends microsurgery, imaging, device design, optics, aesthetics, pediatrics, and AI screening.*

**Worked hidden-role fingerprint (ophthalmology) — the §7.5 use-case-5 model output:**

| Subtype of ophthalmologist | Adjacent-SOC blend (the hidden role) |
|---|---|
| Retina AI innovator | radiologic tech + data scientist + biomedical engineer |
| High-volume cataract surgeon | surgical tech + industrial engineer + medical manager |
| Oculoplastics / cosmetic | fine artist + marketing manager + surgeon |
| Pediatric ophthalmologist | orthoptist + child social worker + teacher |
| Glaucoma device specialist | biomedical engineer + ophthalmic tech + data analyst |
| Academic ophthalmologist | health specialties teacher + medical scientist + grant writer |

Correct FISCMAK output (not "you may enjoy becoming a radiologic technologist"): *"Your work has a strong imaging-systems signature: device-mediated diagnostics, image-quality dependence, pattern recognition, technician workflow, and high-volume decision-making. This may translate well into ophthalmic AI, device innovation, retina screening programs, clinical operations, or imaging-based product strategy."*

---

## Appendix C — The composite Person–Domain Fit formula (the engine, unified)

Fit is not one construct. Cable & DeRue (2002): needs-supplies fit predicts satisfaction; person-org fit predicts identification/citizenship; demands-abilities fit predicts neither reliably. For physicians, **needs-supplies fit dominates** — not "can the physician do the work?" but "does the work provide what the physician needs?" Three layers combine per domain:

`F_composite(d) = w1·C_interest(d) + w2·C_competency(d) + w3·S_subjective(d)`

`S_subjective(d) = α·E_d + β·(1−|P_d|) + γ·(1−|Δ_struct,d|) − λ·G_d − μ·M_d`

**Two terms add fit (energy, perception, structure); two subtract it (recognition penalty, distress).** A physician can be interested in AND competent at a domain yet still misfit because the work is invisible or morally distressing — the mechanism no single-layer tool captures.

| Weight | Value | Layer / term | Represents | Citation basis |
|---|---|---|---|---|
| w1 | 0.25 | Interest | RIASEC fit via **C-index** (circumplex-aware, NOT cosine) | Nye meta-analysis: congruence–performance r=.33 |
| w2 | 0.30 | Competency | O*NET 277-descriptor fit via cosine | Liu 2025: knowledge+skills most predictive |
| w3 | 0.45 | Subjective | the five FISCMAK dimensions below | Cable & DeRue: needs-supplies → satisfaction |
| α | 0.35 (+) | Energy E_d | domain energy ranking, normalized −1 (drain) → +1 (energize) | Intrinsic motivation OR 5.28 for satisfaction |
| β | 0.20 (+) | Perception (1−|P_d|) | F4 perceived vs. actual institutional support | Pollart: intent-to-leave OR 2.12 at misalignment |
| γ | 0.20 (+) | Structural (1−|Δ_struct,d|) | F3 actual vs. expected FTE | OPWS misfit → depressiveness (longitudinal) |
| λ | 0.15 (−) | Recognition penalty G_d | F5 invisible-work load | Moral distress incremental validity (Baele) |
| μ | 0.10 (−) | Distress flag M_d | MDT ≥4 domain-tagged (binary) | MDT ≥4 → 75.1% burnout (Tutty) |

**Layer formulas:** Interest `C_interest(d) = C-index(RIASEC_physician, RIASEC_domain_d)` — C-index over cosine because RIASEC has circumplex structure (adjacent Holland types must count as more similar than opposite). Competency `C_competency(d) = cosine(V_physician_evidence, V_domain_d_descriptors)` — cosine valid, 277 descriptors have no circumplex. Energy normalization `E_d = (5 − EnergyRank_d)/2 − 1`.

**Directional fit constructs (Hardin & Donaldson 2014):** F3 Structural Discrepancy = *ideal-job actualization* (does environment match person?); F4 Perception Gap = *actual-job regard* (does person feel valued by environment?). FISCMAK already captures both directions.

**Hard constraint:** F_composite is NEVER shown to the physician as a single number. Mak uses it internally to prioritize coaching, flag misalignment zones, and rank transfer pathways. The physician sees only the component parts (energy ranking, FTE discrepancy, recognition-gap visualization). Preserves the no-composite-scores constraint. The weights are **face-valid hypotheses** — citations support direction, not the exact coefficient; calibrate against pilot data.

**Warr & Inceoglu caution:** engaged workers may report *poorer* fit because higher motivation raises wanted levels — high energy + high discrepancy can mean an engaged physician who wants MORE of a domain, not a misfit. Interpret energy × discrepancy jointly.

---

## Appendix D — The Rosetta Layer (multi-taxonomy translation)

**Architecture decision (correct):** a FISCMAK-native concept layer sits ABOVE all external taxonomies — none is chosen as primary. O*NET, ESCO, CIP, DOT, RAPIDS each capture different facets; none alone is sufficient. The FISCMAK concept layer is the critical intermediate: physicians don't speak in O*NET descriptors, so NLP maps **free text → FISCMAK concept → taxonomy codes** (two-step), never free text → O*NET directly.

**Evidence (CAPS-Canada crosswalk):** crosswalk assistants give useful info for 83–99% of jobs (median 95%); 18–81% (median 56%) fully auto-recodable. Healthcare roles need manual matching. → **The Rosetta Layer must be curated, not fully automated.**

| Taxonomy | FISCMAK role | Strength | Limitation | Priority |
|---|---|---|---|---|
| O*NET | Primary scaffold — skills, tasks, interests, activities, context | 277 descriptors/occ; free API; SOC-coded; RIASEC | Occupation-level averages; US only | Phase 1 — core |
| ESCO | International + transversal skills | Competence language; EU market | No RIASEC; less granular tasks | Phase 2 — global |
| CIP | Education/training pathway mapping | Degree/program taxonomy; credential links | Static; no work activities | Phase 1 — CV + gap |
| DOT | Legacy task language + physical/cognitive demands | Granular tasks; accommodation framing | Obsolete; not updated | Phase 2 — secondary ref |
| RAPIDS | Work-based learning pathways | Apprenticeship/earn-and-learn | Limited physician relevance | Phase 3 — institutional |

**Core data structure — every evidence unit carries 4 metadata tags:** domain index · skill/task code · quadrant (OV/OI/SV/SI) · taxonomy mapping array (O*NET + ESCO + CIP codes). The taxonomy array enables multi-audience translation: same work → O*NET task language (US institutions) / ESCO competence language (international) / CIP program language (credentials).

**Rosetta Registry (Supabase table) — example row:**

| Field | Type | Example |
|---|---|---|
| fiscmak_concept_id | string | "conflict_mediation" |
| display_label | string | "Conflict Mediation" |
| onet_descriptors | array | ["4.A.4.a.4 Resolving Conflicts", "2.B.1.a Social Perceptiveness", "4.A.4.b.4 Negotiation"] |
| esco_skills | array | ["mediate disputes", "manage conflict", "communicate with stakeholders"] |
| cip_codes | array | ["30.2801 Dispute Resolution", "51.0701 Health Care Administration"] |
| dot_tasks | array | ["people/judgment/interpersonal task language"] |
| rapids_pathways | array | ["communication", "supervision", "leadership"] |
| primary_domains | array | [3,4,5] |
| primary_quadrants | array | ["OI", "SI"] |
| energy_signal | string | "high_drain_risk" |

**Build target:** start with **50–75 core FISCMAK concepts** covering the most common physician work activities across all 8 domains; each gets a full Rosetta mapping. Grows as pilot data reveals concepts physicians describe that the registry lacks. This is the controlled vocabulary Mak uses for classification AND the revenue-generating translation engine (same evidence → academic promotion doc / consulting CV / institutional leadership narrative).

---

## Appendix E — The complete 12-phase process system + longitudinal cadence

The runtime flow (worked for Dr. A, consultation-liaison psychiatrist). O*NET = scaffold, NAICS = setting layer, FISCMAK = subjective layer. Every discrepancy = expected (O*NET/NAICS) − actual (FISCMAK).

| Phase | Step | Output | Timing |
|---|---|---|---|
| 1 | Specialty → SOC (auto) | 29-1223.00 → 277-descriptor base vector | Day 1, ~15 min total intake |
| 1 | Setting → NAICS (auto) | 622110 + 611310 → quadrant defaults | Day 1 |
| 1 | Subspecialty + career stage | CL psychiatry · Asst Prof PGY+4 → adjacency registry + stage-conditional probes | Day 1 |
| 2 | O*NET descriptor pull (auto) | 277 descriptors, 9 categories, 0–100 scale | ~2 sec |
| 3 | RIASEC profiling | occ ISA vs. personal IES → desire-fit; flags Admin/Innovator energy | Day 1, ~10 min |
| 4 | Adjacent SOC pull + overlap (auto) | 5 adjacent SOCs (mediator 0.85…); Jaccard overlap → shared/gap/unique-physician descriptors | ~2 sec |
| 5 | Career Changer Matrix (auto) | validates adjacency; asymmetry check (gap = language/credential, not capability) | ~1 sec |
| 6 | NAICS quadrant assignment (auto) | same work, different visibility by setting → default 35/30/10/25 OV/OI/SV/SI | ~1 sec |
| 7 | Domain energy ranking | 8 domains × 1–5 → strength / misalignment / latent zones | Day 1, ~5 min |
| 8 | CV upload + parse + confirm | Stanza + BioBERT → domain/track/quadrant + O*NET match; physician confirms, adds invisible work → F1 density | Day 1–7 |
| 9 | Skills gap (on goal) | target SOC blend; 7 gaps (Skill·Knowledge·Credential·Language·Evidence·Network·Identity) → bridge actions | when goal stated |
| 10 | Fingerprint vector (auto) | weighted adjacent-SOC blend (evidence × energy) → Mak narrative | auto |
| 11 | Work Values fit + composite F(d) | values-quadrant mismatch detection; composite never shown as number | auto |
| 12 | Outputs | 8×8 lattice · 2×2 quadrant · fingerprint narrative · bridge plan · Output Studio docs | ongoing |

**CV parsing — 3-layer dictionary:** Layer 1 O*NET descriptor dictionary (277) → Layer 2 FISCMAK Activity Ontology (~200+ curated, specialty-specific, domain/track/quadrant tagged) → Layer 3 Rosetta cross-taxonomy. Pipeline: upload → Stanza sentence segmentation → header-pattern section detection → BioBERT line classification (AUC 0.63–0.88 for ACGME subcompetency prediction, Booth et al.) → physician confirmation → evidence-unit creation (CV source weight 0.50).

**Clinical setting modifier** (distinct from NAICS): inpatient (weight Work Context: time pressure ΔR²=45% for exhaustion; shift/night flags; high-OI documentation) · outpatient (panel size as FTE proxy; high-OI coordination/inbox; more emotional exhaustion than inpatient per systematic review) · hybrid (split FTE tracked separately, F3 per setting) · non-clinical (Domain 1 deprioritized; Systems/Collab/PPD elevated; adjacent SOC weights shift to management/research/education).

**Longitudinal cadence:**

| Cycle | Length | Captures | Feeds |
|---|---|---|---|
| Weekly check-in | <3 min | hours · setting · single-item EE (r=.76–.83 vs MBI) · QoL · energy/drain free-text · "was it invisible?" | F3; burnout trend; F5; energy-evidence map |
| Quarterly snapshot | 15–20 min | full energy rank · FTE · PFI WE+ID · MDT · goal review · Mak coaching-prep brief | recalibration; career snapshot doc |
| Annual re-assessment | — | Interest Profiler re-run · trajectory overlay | posterior update (interests change, .26–.80 stability over 22 yrs) |

Missed weekly check-in → fall back to most recent quarterly baseline, not zero (prevents gap-distortion).

**Goal architecture — 4 horizons, each with a quadrant signature:** 3-mo SMART (OV / OI→OV; target smallest gap = quick win) · 1-yr SMART+Implementation Intentions (OV+OI) · 5-yr WOOP (SI→all; can target largest gap = identity transformation) · 10-yr legacy narrative (SI; Work Values alignment check). Goals themselves map to the 2×2: "publish paper" = OV; "be the go-to consultant" = SV; "reduce after-hours docs 30%" = OI→OV; "decide if I want academia" = SI.

**Energy vs. enjoyment (product decision):** capture **energy (1–5) as primary**; probe enjoyment only on divergence (Mak: "you rated Communication energizing but don't enjoy family meetings — what drains you there?"). Avoids doubling instrument burden. Operationalizes the Shanafelt 20%-meaningful-work threshold (burnout >50% at <10% meaningful → ~30% at >20%).

**Gennissen 3-orientation intake screen → Bayesian prior over 8 domains:** self-development (I+A → Researcher/Educator/Wellness; SI probe focus) · work-life balance (S+C → Clinician/Quality/Safety; OI focus) · achievement/recognition (E+I → Admin/Leader/Innovator/Advocate; OV focus). Prior, not label — each data input shifts the posterior.

**Institutional dashboard (aggregate, N≥5, de-identified; individual Mak chats NEVER institution-facing):** domain-coverage heat map · Recognition Gap distribution · energy-evidence misalignment prevalence (turnover *leading* indicator: burnout +1 → OR 1.52 intent-to-leave; values alignment +1 → OR 0.81 protective) · well-being aggregates · FTE discrepancy summary · trainee milestone trends. Admin data in: MedHub evals/duty-hours/CCC milestones (trainee-consented) + faculty activity reports + institutional well-being surveys.

---

*Spec now covers: static architecture (§§0–9, Appendices A–D) + runtime/longitudinal operation (Appendix E) + the setting parsing layer (Appendix F) + the SOC×NAICS code architecture (Appendix G). All weights/mappings are face-valid hypotheses pending pilot validation — never surface to a physician as "you score low on X."*

---

## Appendix G — The SOC × NAICS code architecture (specialty × setting)

**The core gap:** SOC/O*NET *does* have specified physician codes, but it does NOT differentiate by practice setting — it averages across all incumbents (dominated by the most common pattern, outpatient clinical care). The setting layer is invisible to the SOC taxonomy. **That is exactly the gap FISCMAK fills.** SOC tells the system *what specialty*; NAICS tells it *what setting*; the combination is the setting-aware base vector.

`Physician Profile = SOC_specialty × NAICS_setting × FISCMAK_(track + domain + energy)`

### G.1 — Complete physician SOC map (O*NET-SOC 29-1XXX, Healthcare Diagnosing/Treating)

| SOC code | Title | FISCMAK primary domain(s) | FISCMAK primary track(s) |
|---|---|---|---|
| 29-1211.00 | Anesthesiologists | 1 Clinical, 7 Collaboration | Clinician, Quality/Safety |
| 29-1212.00 | Cardiologists | 1, 2 Medical Knowledge | Clinician, Researcher |
| 29-1213.00 | Dermatologists | 1, 3 PBLI | Clinician, Innovator |
| 29-1214.00 | Emergency Medicine Physicians | 1, 6 Systems | Clinician, Admin/Leader |
| 29-1215.00 | Family Medicine Physicians | 1, 4 Communication | Clinician, Advocate |
| 29-1216.00 | General Internal Medicine Physicians | 1, 2 | Clinician, Educator |
| 29-1217.00 | Neurologists | 1, 2 | Clinician, Researcher |
| 29-1218.00 | Obstetricians and Gynecologists | 1, 4 | Clinician, Advocate |
| 29-1221.00 | Pediatricians, General | 1, 4 | Clinician, Advocate |
| 29-1222.00 | Physicians, Pathologists | 2, 3 | Researcher, Quality/Safety |
| 29-1223.00 | Psychiatrists | 1, 4, 5 Professionalism | Clinician, Educator, Advocate |
| 29-1224.00 | Radiologists | 1, 2 | Clinician, Innovator |
| 29-1229.01 | Allergists and Immunologists | 1, 2 | Clinician, Researcher |
| 29-1229.02 | Orthoptists | 1, 7 | Clinician |
| 29-1229.03 | Urologists | 1, 3 | Clinician, Innovator |
| 29-1229.04 | Physical Medicine and Rehabilitation Physicians | 1, 7 | Clinician, Wellness Champion |
| 29-1229.05 | Preventive Medicine Physicians | 6, 3 | Advocate, Quality/Safety |
| 29-1229.06 | Sports Medicine Physicians | 1, 8 PPD | Clinician, Wellness Champion |
| 29-1241.00 | Ophthalmologists, Except Pediatric | 1, 3 | Clinician, Innovator |
| 29-1242.00 | Orthopedic Surgeons, Except Pediatric | 1, 3 | Clinician, Innovator |
| 29-1243.00 | Pediatric Surgeons | 1, 4 | Clinician |
| 29-1249.00 | Surgeons, All Other | 1, 7 | Clinician, Quality/Safety |
| 29-1229.00 | Physicians, All Other (catch-all) | varies | varies |

O*NET-SOC extends base SOC (~840) to ~1,100+ via 7th/8th digit. ~22 specified physician codes — but all psychiatrists (academic, community, industry) share 29-1223.00; descriptors are a blended average.

### G.2 — NAICS setting codes (classifies the employer, not the worker)

| NAICS | Industry | FISCMAK setting mapping |
|---|---|---|
| 621111 | Offices of Physicians (except Mental Health) | Community |
| 621112 | Offices of Physicians, Mental Health Specialists | Community |
| 622110 | General Medical and Surgical Hospitals | Academic or Community (by affiliation) |
| 622210 | Psychiatric and Substance Abuse Hospitals | Community or Government |
| 622310 | Specialty (except Psych/SA) Hospitals | Academic or Community |
| 621420 | Outpatient Mental Health and Substance Abuse Centers | Community |
| 621498 | All Other Outpatient Care Centers | Community or Hybrid |
| 611310 | Colleges, Universities, and Professional Schools | Academic |
| 325411 | Medicinal and Botanical Manufacturing | Industry (Pharma) |
| 325412 | Pharmaceutical Preparation Manufacturing | Industry (Pharma) |
| 325414 | Biological Product Manufacturing | Industry (Biotech) |
| 334510 | Electromedical and Electrotherapeutic Apparatus Mfg | Industry (Device) |
| 541711 | R&D in Biotechnology | Industry (Biotech R&D) |
| 541712 | R&D in Physical, Engineering, Life Sciences | Industry (Research) |
| 524114 | Direct Health and Medical Insurance Carriers | Industry (Payer) |
| 921190 | Other General Government Support (VA, DoD, IHS) | Government |

### G.3 — SOC × NAICS worked examples (one specialty, three setting profiles)

| Combination | Profile | Quadrant parsing defaults |
|---|---|---|
| 29-1223.00 × 611310 | Academic psychiatrist | OV teaching · OI unfunded mentoring · SI rank-related distress |
| 29-1223.00 × 621112 | Community psychiatrist | OI teaching · OI care coordination · SI isolation |
| 29-1223.00 × 325412 | Industry psychiatrist (pharma) | OV medical-affairs deliverables · OI clinical translation · SI identity dissonance |

### G.4 — Universal adjacent (non-physician) SOC reference — all specified O*NET-SOC codes

| SOC | Title | FISCMAK function | Setting relevance |
|---|---|---|---|
| 11-9111.00 | Medical and Health Services Managers | Leadership, operations, medical director | All |
| 13-1082.00 | Project Management Specialists | QI, implementation, workflow redesign | All |
| 13-1111.00 | Management Analysts | Strategy, consulting, operations | Hybrid, Industry |
| 15-1211.00 | Computer Systems Analysts | Clinical informatics, EHR optimization | Academic, Industry |
| 15-1252.00 | Software Developers | Digital health, AI tools, platform build | Industry |
| 15-1255.00 | Web and Digital Interface Designers | Clinical product design, UX | Industry |
| 15-2051.00 | Data Scientists | Analytics, AI, prediction, dashboards | Academic, Industry |
| 17-2031.00 | Bioengineers and Biomedical Engineers | Device, medtech, clinical engineering | Academic, Industry |
| 17-2112.00 | Industrial Engineers | Throughput, OR/ED flow, systems design | All |
| 19-1041.00 | Epidemiologists | Population health, outcomes, public health | Academic, Government |
| 19-1042.00 | Medical Scientists, Except Epidemiologists | Translational/clinical research | Academic, Industry |
| 19-3032.00 | Industrial-Organizational Psychologists | Culture, leadership, burnout systems | Academic, Industry |
| 21-1022.00 | Healthcare Social Workers | Discharge, psychosocial, crisis care | All |
| 23-1022.00 | Arbitrators, Mediators, and Conciliators | Conflict, family meetings, ethics | All |
| 25-1071.00 | Health Specialties Teachers, Postsecondary | Med ed, residency teaching, curriculum | Academic |
| 25-9031.00 | Instructional Coordinators | Curriculum building, competency frameworks | Academic |
| 27-3042.00 | Technical Writers | Guidelines, protocols, grants | Academic, Industry |
| 29-9021.00 | Health Information Technologists | Documentation, coding, quality metrics | All |
| 29-9092.00 | Genetic Counselors | Genomics, counseling, risk communication | Academic |

### G.5 — O*NET base pull for 29-1223.00 (psychiatry) — the 6 descriptor categories

| O*NET category | # | Top descriptors for psychiatry | FISCMAK domain mapping |
|---|---|---|---|
| Knowledge | 33 | Psychology, Therapy & Counseling, Medicine & Dentistry, English Language, Sociology/Anthropology | Domains 1,2,4,5 |
| Skills | 35 | Active Listening, Social Perceptiveness, Reading Comprehension, Critical Thinking, Speaking | Domains 4,2,5 |
| Abilities | 52 | Oral Comprehension, Oral Expression, Problem Sensitivity, Written Comprehension, Inductive Reasoning | Domains 2,4 |
| Work Activities | 41 | Assisting & Caring for Others, Making Decisions, Documenting, Establishing Relationships, Getting Information | Domains 1,4,6 |
| Work Context | 57 | Face-to-Face, Contact w/ Others, Indoors/Controlled, Telephone, Freedom to Make Decisions | Setting-conditional |
| Work Values | 6 | Relationships, Independence, Achievement, Working Conditions, Recognition, Support | Energy ranking prior |

### G.6 — Setting-conditional descriptor → quadrant (academic CL psychiatrist worked example)

| O*NET descriptor | Raw score | Academic | Community | Industry |
|---|---|---|---|---|
| Assisting and Caring for Others | 88 | OV clinical FTE | OV patient volume | N/A |
| Training and Teaching Others | 72 | OV promotion-relevant | OI informal, uncredited | N/A |
| Documenting/Recording Information | 78 | OI after-hours, unmeasured | OI higher vol, no buffer | OV regulatory deliverable |
| Resolving Conflicts and Negotiating | 68 | OI invisible mediation | SI emotional containment, no debrief | OV stakeholder alignment |
| Coordinating Work of Others | 65 | OV if chief / OI if informal | OI managing without title | OV team lead, formalized |
| Making Decisions and Solving Problems | 85 | OV clinical, visible | OV clinical, visible | OV product decisions |

### G.7 — Intake collects TWO codes (implementation)

Specialty SOC (auto from specialty dropdown → pulls O*NET base descriptor profile) + Setting NAICS (from setting selection + employer type → activates setting-conditional parsing). SOC × NAICS = the base vector; physician's own data (energy, probes, FTE, CV) then individualizes it. *The SOC code tells the system what the physician **is**; FISCMAK tells the physician what their work **means**.*

---

## Appendix H — The seven-gap × O*NET boundary (where O*NET stops, FISCMAK begins)

The defensible claim, exactly bounded: `7-gap = [Skill + Knowledge + Credential]_O*NET-direct + [Language + Identity]_O*NET-partial-proxy + [Evidence + Network]_FISCMAK-only`. O*NET scaffolds 3 gaps, partially signals 2, and cannot touch 2. The seven-gap architecture is not a replacement for O*NET — it is **the completion of what O*NET started but was never designed to finish.**

| Gap | O*NET connection | O*NET source | What O*NET provides | What O*NET cannot provide | FISCMAK must build |
|---|---|---|---|---|---|
| **Skill** | ✅ Direct | Skills (35) + Abilities (52) | Importance + level per SOC; gap = target − current | Within-person variation (occupation avg, not this physician) | Physician self-assessment overlay |
| **Knowledge** | ✅ Direct | Knowledge (33) | 33 domains rated per SOC | Whether knowledge is current/deep/superficial | Mak probes + CV evidence for depth |
| **Credential** | ✅ Direct | Job Zones (1–5) + Experience + Certifications | Required education, training time, certs/licenses | Whether existing credentials *count* in target lane (does MD substitute for MBA?) | CIP crosswalk + equivalency logic |
| **Language** | ⚠️ Partial proxy | Work Activities + Skills (Speaking, Writing, Persuasion) | *How much* communication target requires + what kind | The *vocabulary* of the target field (roadmap, sprint, user story) | Rosetta Layer concept→field translation |
| **Identity** | ⚠️ Partial proxy | Work Styles (16) + Work Values (6) | Structural profile: Leadership, Initiative, Innovation; values alignment | "Am I *allowed* to claim this identity?" imposter, dissonance | SI-quadrant Mak probes; identity-formation lit |
| **Evidence** | ❌ None | — | — (describes occupations, not individuals) | Everything — no portfolio/artifact tracking | Lattice OV quadrant; CV parsing; Output Studio |
| **Network** | ❌ None | — | — (no relational/social-capital data) | Everything — no network structure | Mak probes: "know 3–5 in the target lane?" |

**Identity-gap nuance:** the strongest O*NET proxy is **Innovation** (Work Styles) — the structural identity signal for "does the target lane reward novel approaches?" Leadership/Initiative/Independence/Adaptability are moderate proxies; Dependability/Integrity/Attention-to-Detail are baseline (no signal — all physician lanes require them). But the *core* of the identity gap ("Am I allowed to call myself this?") is entirely SI-quadrant, invisible to O*NET. Work Values mismatch (e.g., physician values Recognition high but target lane ranks it low) is a values-identity signal predicting dissatisfaction even when skill/knowledge gaps are closed.

**Bridge actions (Dr. A → clinical informatics leadership worked example):** Skill → informatics elective + lead EHR optimization project · Knowledge → SQL/Python basics · Credential → AMIA 10×10 → board eligibility · Language → Mak generates informatics-translated CV bullets · Evidence → build + document an EHR dashboard project · Network → AMIA meeting + 3 informational interviews · Identity → Mak probe on the permission narrative.

**Sequencing rule (from Appendix E goals):** 3-month goal targets the *smallest* gap (quick win); 5-year goal can target the *largest* (identity transformation).

---

## Appendix I — Clinical-setting modifier + avocation layer (two additions to intake)

### I.1 — Clinical setting modifier (distinct from NAICS employer setting)

NAICS = employer (academic/community/industry). The **clinical setting modifier** = the care environment, a separate axis that reweights descriptors and quadrant defaults.

| Clinical setting | Variable | What changes | Evidence |
|---|---|---|---|
| Inpatient | clinical_setting="inpatient" | ↑ Work Context: time pressure, contact, consequence of error; shift/night/weekend flags; high-OI documentation | Time pressure = top predictor of EE (ΔR²=45%) |
| Outpatient | clinical_setting="outpatient" | ↑ patient volume, continuity, after-hours EHR; panel size as FTE proxy; high-OI coordination/prior-auth/inbox | Outpatient reports *more* EE than inpatient (contradicts the hospitalist-burnout assumption) |
| Hybrid | clinical_setting="hybrid" | split FTE tracked separately (e.g., 60/40); each applies its own quadrant defaults; F3 per setting | Shift workers struggle to find career-development time |
| Non-clinical | clinical_setting="non-clinical" | Domain 1 deprioritized; Systems(6)/Collaboration(7)/PPD(8) elevated; adjacent-SOC weights shift to mgmt/research/education | % clinical time inversely assoc. w/ profession satisfaction |

Set at onboarding; weekly check-in updates it (a wards month vs. a clinic month recomputes quadrant defaults).

### I.2 — Avocation layer (hobbies/interests = engagement signal, NOT burnout signal)

McManus (n=2,845): leisure activities correlate with professional *engagement* even after controlling 25 background variables — but do **not** correlate with burnout. Critical distinction: hobbies predict engagement, not absence of burnout. (Supporting: EM physicians with <2 major hobbies had higher burnout OR 4.70; humanities exposure → higher empathy/tolerance, lower burnout, effect 0.2–0.59.)

- **Onboarding:** Mak asks about hobbies as an energy + identity signal (not a wellness checklist). Each hobby tagged with its O*NET-adjacent descriptor profile (e.g., photography → visual pattern recognition, composition, digital tools → Artistic RIASEC, overlaps imaging adjacent SOCs).
- **F8 Hobby-Profession Bridge (Phase 2+):** cosine(hobby O*NET vector, specialty profile). High similarity = hobby reinforces professional identity; low = genuine recovery/contrast. Both valuable, different reasons.
- **Weekly check-in:** "Engage any hobbies this week?" (yes/no + tag) → feeds engagement signal, never the burnout signal.
- **Wellness-outside-work** (sleep/exercise/social/mindfulness) captured via validated instruments (PFI, UWES-9, SVS), not hobby tracking.

### I.3 — O*NET has NINE categories (the full pull), not six

The 6 richest descriptor categories drive mapping; the full pull is **9**: Knowledge (33), Skills (35), Abilities (52), Work Activities (41), Work Context (57), Work Styles (16), Work Values (6), Interests/RIASEC (6), Job Zones (1). Normalization: `[(raw mean − lowest)/(highest − lowest)] × 100`. Physicians = Job Zone 5 always → credential gaps to adjacent lanes are lateral/downward, never upward.

---

## Appendix J — FCWI: the FISCMAK Career Well-Being Index (9 items)

**Why a new instrument, not a shortened PFI.** Deleting items from the PFI/SVS destroys their psychometrics — the published cutoffs (PFI burnout ≥1.33, fulfillment ≥3.00, SVS ≤8) and the IRT crosswalk to MBI break. **Solution: build a new instrument that captures the same constructs through the career-lattice lens, then validate it against the original PFI/SVS in the pilot.** Each FCWI item triple-maps to (1) a PFI/SVS construct, (2) a FISCMAK career layer + quadrant, (3) an ACGME competency. The triple-map is what makes it FISCMAK-native, not a generic burnout screen. All 9 items: 5-point Likert (0 not at all true → 4 completely true), PFI scoring convention.

### J.1 — The 9 items

| # | FCWI item construct | PFI/SVS construct replaced | FISCMAK career layer | ACGME | Quadrant signal |
|---|---|---|---|---|---|
| 1 | Work Exhaustion — "physically and emotionally depleted by my work" | PFI Work Exhaustion (4→1 best item) | Domain Energy Ranking: which domain is most draining? | Patient Care | OI (invisible overload) |
| 2 | Interpersonal Disengagement — "less connected to patients and colleagues" | PFI Interpersonal Disengagement (6→1) | Track: disengagement differs Clinician vs. Educator vs. Leader | ICS | SV (visible relational withdrawal) |
| 3 | Fulfillment: Meaningfulness — "my work feels meaningful" | PFI Fulfillment: meaningfulness | F4 Perception Gap: work aligned with values? | PROF | SI (internal meaning) |
| 4 | Fulfillment: Satisfaction — "satisfied with my contributions" | PFI Fulfillment: satisfaction | F1 Evidence Density: contributions visible or invisible? | PBLI | OV (visible output satisfaction) |
| 5 | Fulfillment: Control — "in control of my professional direction" | PFI Fulfillment: feeling in control | F3 Structural Discrepancy: actual vs. expected FTE | SBP | OI (structural misalignment) |
| 6 | **Domain-Specific Energy — "the work I spend the most time on gives me energy"** | NEW — no PFI equivalent | Energy × Evidence cross-ref; the 20% meaningful-work threshold | PPD | SI (energy alignment) |
| 7 | **Recognition — "the work that matters most to me is recognized by my institution"** | NEW — no PFI equivalent | F5 Recognition Gap (OI+SI / OV+SV) | SBP + PROF | OI→OV (recognition transfer) |
| 8 | Growth Mindset — "after a mistake I learn rather than feel shame" | SVS growth mindset (2→1) | PBLI milestone trajectory: developing or stagnating? | PBLI | SI (internal response to error) |
| 9 | Self-Care Prioritization — "I prioritize my well-being even when work is demanding" | SVS self-care (2→1) | PPD domain energy: Domain 8 energizing or neglected? | PPD | SI (invisible self-care) |

**Items 6 & 7 are the differentiators** — constructs no existing instrument measures. Item 6 operationalizes Shanafelt's ≥20%-meaningful-work dose-response (→ Mak asks "which domain consumes the most time without giving energy?"). Item 7 operationalizes F5 + Pollart (n=8,349: "about right" → 5.6% intent-to-leave vs. 14.6% at misalignment). The critical pilot test is **discriminant validity for Items 6–7**: do they predict outcomes the PFI alone cannot? Yes → genuinely new instrument. No → redundant, revise.

### J.2 — ACGME Milestones 2.0 overlay (the developmental framework)

Milestones 2.0 harmonized 4 domains (ICS, PBLI, PROF, SBP) across specialties; PC + MK stay specialty-specific. Burnout ↔ milestones are bidirectional (Staples: burned-out PGY1 peds scored lower on PC 2.78 vs 2.98, SBP, PBLI, PROF, ICS — but NOT Medical Knowledge; Davis: burnout assoc. w/ failing professional-conduct milestone OR 1.41). FCWI + milestone data are mutually informative; FISCMAK detects the feedback loop.

| ACGME competency | Harmonized themes | FISCMAK domain | FCWI item connection |
|---|---|---|---|
| Patient Care (PC) | specialty-specific | Domain 1 Clinical Expertise | Item 1 (Work Exhaustion) |
| Medical Knowledge (MK) | specialty-specific | Domain 2 Medical Knowledge | Item 8 (Growth Mindset) |
| PBLI | EBM, reflective practice, QI, teaching | Domain 3 Practice-Based Learning | Items 4, 8 |
| ICS | patient comm, team comm, documentation | Domain 4 Communication | Item 2 (Interpersonal Disengagement) |
| PROF | conduct, well-being, ethics, accountability | Domain 5 Professionalism | Items 3, 9 |
| SBP | safety, QI, systems navigation, advocacy | Domain 6 Systems Thinking | Items 5, 7 |

**Well-being subcompetency (Psychiatry Milestones 2.0) maps to FCWI as a developmental trajectory:** Level 1–2 recognizing stressors → Items 1,2 · Level 3 implementing self-care → Item 9 · Level 4–5 modeling + advocating → Items 6,7. The FCWI is therefore not just a burnout screen but a *developmental assessment of career well-being competency* parallel to the milestone trajectory.

### J.3 — The complete well-being battery (cadence)

| Frequency | Instrument | Items | Time | Captures |
|---|---|---|---|---|
| Weekly | Single-item EE + DP + QoL + MDT | 4 | 1 min | burnout pulse + distress trigger + global QoL |
| Monthly | **FCWI** | 9 | 2 min | career-integrated well-being (the 9 constructs above) |
| Quarterly | Energy ranking (8) + FTE update + goal review | ~15 | 5 min | career lattice recalibration |
| Baseline/6-mo/Annual | Full PFI (16) + SVS (4) — **validation only during pilot** | 20 | 5 min | concurrent-validity check: does FCWI track PFI/SVS? |

Pilot (n=15–20): run full PFI/SVS alongside FCWI at baseline/6mo/12mo. If FCWI shows r≥0.80 with PFI burnout and r≥0.75 with SVS, drop the full PFI/SVS post-pilot.

### J.4 — Validation pathway

| Step | Method | Timeline | Success criterion |
|---|---|---|---|
| Content validity | Expert panel (5–7 well-being researchers) | pre-pilot | ≥80% agreement on item-construct mapping |
| Face validity | Pilot cohort feedback | Month 1 | ≥90% rate items "relevant to my experience" |
| Internal consistency | Cronbach's α (total + subscales) | Month 6 | α ≥ 0.80 |
| Concurrent validity | Pearson r: FCWI vs. PFI burnout, FCWI vs. SVS | Month 6 | r ≥ 0.75 |
| Criterion validity | FCWI predicts intent-to-leave, satisfaction, errors | Month 12 | AUC ≥ 0.80 for intent-to-leave |
| **Discriminant validity** | Items 6–7 predict beyond PFI alone | Month 12 | incremental R² ≥ 0.05 above PFI |
| Test-retest | ICC between monthly FCWI (stable period) | Month 6 | ICC ≥ 0.70 |

### J.5 — Three outputs the milestone–FCWI integration uniquely enables

1. **Competency–Well-Being Heat Map (trainees):** milestone level (color intensity) × FCWI domain score (border). Level 4 Patient Care + Item 1 exhaustion 3/4 = achieving competency at the cost of well-being → predicts post-grad burnout. Level 2 PBLI + Item 8 growth-mindset 4/4 = internal resources present, needs structural support.
2. **Domain-Specific Burnout Attribution (attendings):** not "you are burned out" but *"exhaustion concentrated in Domains 1 & 4 (energy 1/5, 2/5); fulfillment in Domains 3 & 8 (energy 5/5, 4/5); Recognition Gap 1.8 = 64% invisible; the specific invisible work driving exhaustion is after-hours documentation (OI) and informal team mediation (OI)."* Actionable in a way "MBI-EE = 32" is not.
3. **Institutional Competency–Well-Being Dashboard:** aggregate FCWI by ACGME domain. 60% of faculty low on Item 7 (recognition) in Domain 6 = a *structural* recognition problem in systems/advocacy work, not a burnout problem individual resilience training can fix → informs FTE reallocation, promotion criteria, leadership development.

---

## Appendix K — The triple-layer descriptor system (O*NET × ACGME Milestones × Career Lattice)

**The core architectural insight:** three layers, each capturing what the other two cannot. FISCMAK would be the **first to build an O*NET↔ACGME crosswalk** (none published). AAMC's PCRS (58 competencies across 8 domains, built by comparing 153 competency lists) is the bridging framework — FISCMAK's 8 domains already align with it.

| Layer | Describes | Misses | Source |
|---|---|---|---|
| O*NET (277 descriptors) | what the *occupation requires* | within-occupation variation; invisible work; subjective experience; trajectory | US DOL, 974 occupations, 0–100 |
| ACGME Milestones (22–36 subcomp/specialty) | what physician *should do* at each level (1–5) | non-clinical work; identity; energy; recognition; post-training | ACGME, specialty-specific, semiannual CCC |
| FISCMAK Lattice (8×8×4) | what physician *actually does*, how it feels, visibility, alignment | standardized language; labor-market comparability; benchmarks | FISCMAK-native: self-report + NLP + Mak |

### K.1 — O*NET's 9 categories → ACGME competency → Lattice domain

| O*NET category | Items | Scale | ACGME mapping | Lattice domain |
|---|---|---|---|---|
| Abilities | 52 | Imp 1–5 | PC (perceptual/psychomotor), MK (cognitive) | Domain 1, 2 |
| Interests (RIASEC) | 6 | 1–7 | none — the *desire* layer | all (energy proxy) |
| Knowledge | 33 | Imp 1–5 | MK (medicine, biology, psych), SBP (admin, law) | Domain 2, 6 |
| Skills | 35 | Imp 1–5 | ICS (listening, speaking), PBLI (critical thinking), SBP (systems analysis) | Domain 3, 4, 7 |
| Work Activities | 41 | Imp 1–5 | PC, ICS, PBLI, SBP — *richest mapping layer* | all 8 domains |
| Work Context | 57 | Freq 1–5 | PROF (consequence of error), SBP (time pressure) | Domain 5, 6 + setting modifier |
| Work Styles | 16 | Imp 1–5 | PROF (integrity, self-control), ICS (cooperation) | Domain 5, 8 |
| Work Values | 6 | Extent 1–7 | PPD (achievement, independence), PROF (relationships) | Domain 8 + P-E fit |
| Job Zones | 1 | 1–5 | training stage (PGY → job-zone progression) | career-stage modifier |

### K.2 — Psychiatry milestone → O*NET → lattice crosswalk (worked example, SOC 29-1223)

Psychiatry = 22 subcompetencies across 6 ACGME domains (incl. the unique well-being subcompetency under PROF). Crosswalk is **specialty-specific**: an ophthalmologist's Patient Care milestones map to different O*NET descriptors (Fine Motor Control, Near Vision) than a psychiatrist's (Active Listening, Social Perceptiveness) — but the *lattice domain* (Domain 1) stays constant; the O*NET fingerprint *within* the cell is specialty-specific.

| Milestone subcompetency | ACGME | O*NET top-3 | Lattice domain | Track(s) | Default quadrant |
|---|---|---|---|---|---|
| Psychiatric evaluation | PC | Active Listening, Social Perceptiveness, Psychology | 1 Clinical | Clinician | OV |
| Psychotherapy | PC | Therapy/Counseling, Active Listening, Social Perceptiveness | 1 + 4 | Clinician, Educator | OV / OI informal |
| Psychopharmacology | PC+MK | Medicine, Critical Thinking, Judgment | 1 + 2 | Clinician | OV |
| Emergency psychiatry | PC | Making Decisions, Time Pressure, Consequence of Errors | 1 + 6 | Clinician, Quality/Safety | OV |
| Consultation-liaison | PC+ICS | Establishing Relationships, Coordination, Resolving Conflicts | 4 + 7 | Clinician, Educator | OV consult / OI mediation |
| Patient communication | ICS | Speaking, Active Listening, Social Perceptiveness | 4 | Clinician, Educator | SV (perceived quality) |
| Team communication | ICS | Coordination, Communicating w/ Peers | 7 | all | OV documented / OI informal |
| Evidence-based practice | PBLI | Critical Thinking, Reading Comprehension, Analyzing Data | 3 + 2 | Researcher, Educator | OV publication / OI self-study |
| Reflective practice | PBLI | Learning Strategies, Self-Control | 3 + 8 | all | SI (internal reflection) |
| Quality improvement | PBLI+SBP | Systems Analysis, Monitoring, Organizing | 3 + 6 | Quality/Safety, Innovator | OV project / OI informal |
| Teaching | PBLI | Instructing, Learning Strategies, Coaching | 4 + 3 | Educator | OV formal / OI mentoring |
| Professional conduct | PROF | Integrity, Dependability, Self-Control | 5 | all | SV (perceived) |
| **Well-being** | PROF | Stress Tolerance, Self-Control, Adaptability | 8 + 5 | Wellness Champion | SI (internal experience) |
| Ethical principles | PROF | Integrity, Concern for Others, Social Orientation | 5 | all | SV ethical / SI moral distress |
| Patient safety | SBP | Consequence of Errors, Monitoring, Evaluating Info | 6 + 3 | Quality/Safety | OV reports / OI near-miss |
| Systems navigation | SBP | Systems Analysis, Coordination, Mgmt of Personnel | 6 | Admin/Leader, Advocate | OI (invisible systems work) |
| Advocacy | SBP | Social Orientation, Establishing Relationships, Persuasion | 6 + 5 | Advocate | OV policy / OI informal |

### K.3 — What the triple mapping enables

1. **Specialty-specific lattice calibration** — each specialty ships with O*NET weights + milestone anchors pre-loaded. "Mediated a family meeting about discharge" → O*NET Resolving Conflicts(85)/Establishing Relationships(80)/Coordination(78) → ACGME ICS+SBP → Lattice Domain 4 × Clinician × **OI** (won't appear on CV).
2. **Milestone-aware gap detection** — PGY-2 with Level 2 in CL but high evidence density in Domain 4×Clinician = has the experience, milestone hasn't caught up (*recognition gap*). Level 4 in Psychopharmacology + low energy in Domain 2 = competent in a draining domain (*misalignment zone* → predicts post-grad burnout).
3. **O*NET-powered career translation** — "Level 4 Consultation-Liaison" → "advanced competency in interdisciplinary conflict resolution, stakeholder alignment, and complex care coordination" (from the O*NET descriptors behind the milestone).
4. **Adjacent-SOC validation through milestones** — psychiatry's top O*NET descriptors overlapping heavily with 23-1022 (Mediators) and 21-1013 (Marriage & Family Therapists) *empirically grounds* the adjacency, beyond intuition.

### K.4 — Build implication: one config bundle per specialty (publishable artifact)

```
specialty_config/
  psychiatry_29-1223/
    onet_descriptors.json     # 277 descriptors + importance ratings
    acgme_milestones.json     # 22 subcompetencies + level definitions
    crosswalk.json            # milestone → O*NET → lattice-cell mapping
    adjacent_socs.json        # validated adjacent SOC codes
    activity_ontology.json    # specialty-specific activity dictionary
```

Each specialty crosswalk is itself a publishable contribution to the literature. **Note (decision logged):** the FCWI items in this turn revised the O*NET/ACGME anchors of Appendix J's items 1–9 — treat Appendix J.1 as the construct/quadrant source of truth and K-layer anchors as the O*NET/milestone enrichment; reconcile both before build.

### K.5 — Dropping PFI/SVS is defensible (the argument)

PFI/SVS measure well-being as a *standalone* construct — disconnected from career structure. FISCMAK's thesis: well-being is *inseparable* from career alignment. PFI asks "are you exhausted?" not "*which domain* exhausts you?"; SVS asks "can you self-care?" not "does your institution *recognize* the work that drains you?" The FCWI captures the same constructs but attributes them to specific domains/tracks/quadrants — actionable, not merely descriptive. Validation path unchanged: run PFI/SVS alongside in pilot → establish concurrent validity (r≥0.75) → drop permanently. Total annual structured-assessment burden post-removal ≈ **2 hours/year** (less than one faculty activity report).

---

## Appendix F — The practice-setting layer (parsing context, not FTE norms)

**Core principle:** physicians self-report FTE, so the setting layer is NOT normative benchmarks — it is **how FISCMAK interprets, classifies, and speaks back.** Setting does not change the 8 domains or 8 tracks. It changes the parsing language, the 2×2 quadrant routing, the invisible-work distribution, and the meaning of every cell. Same specialty + different setting = a fundamentally different lattice.

**What the 2×2 adds that no taxonomy can:** O*NET describes what work *is*; ESCO what competencies it *requires*; CIP what training it *needs*. None describe whether work was *seen, measured, felt, or valued*. The 2×2 captures the four things taxonomies collapse into one — and that collapse is exactly what makes invisible work invisible. Rosetta Layer = institutional language; 2×2 = human experience. Together: *"You performed uncredited stakeholder alignment (O*NET: resolving conflicts, social perceptiveness; ESCO: mediate disputes) that was invisible-objective (real, not counted) and invisible-subjective (emotionally costly, not acknowledged). Maps to Communication (Domain 4), Clinician track (Track 1). It consumed energy. It was not on your FTE. And it matters."* **That is the brand.**

### F.1 — The five-setting taxonomy

| Setting | Defining feature | Clinical FTE norm | Key satisfaction drivers | Burnout signal |
|---|---|---|---|---|
| Academic | University-affiliated; tiered care w/ trainees; up to 80% nonclinical | 20–60% | Teaching, research, variety, career development | Lower overall (OR 0.87 daily EE) but rank-dependent: instructor OR 1.72, asst prof 1.64, assoc 1.57 vs. full prof |
| Community | Non-university; majority clinical; direct attending care | 80–100% | Autonomy, physician-patient relationship, coworkers, location | Higher in private-practice surgeons; higher family-time satisfaction |
| Hybrid | Academic affiliation + community practice; ACO partnerships | 40–80% | Blends academic variety w/ community autonomy | Variable — depends which elements dominate |
| Government/VA | Integrated, salaried, structured hours, population-based | 60–90% | Job security, structured schedule, mission alignment | Lower than civilian: VA 17% vs. 40% civilian academic GIM |
| Industry/Non-clinical | Pharma, biotech, device, consulting, health tech, admin | 0–20% | Impact at scale, intellectual challenge, autonomy, compensation | Different construct — "career dissonance," not clinical burnout |

### F.2 — Same activity, different quadrant (the setting-conditional parsing ruleset)

The architectural crux: identical words route to different quadrants by setting.

| Activity | Academic 2×2 | Community 2×2 | Industry 2×2 |
|---|---|---|---|
| Teaching a resident | OV — counted, promotion-relevant | OI — informal, no FTE, no credit | N/A — no residents |
| After-hours EHR documentation | OI — real but unmeasured, 1–2 hrs/night | OI — same burden, no resident buffer, higher volume | N/A |
| Writing a grant | OV — core promotion metric | OI — rare, unrecognized, no infrastructure | OV — core clinical-development deliverable |
| Committee service | OV — expected for promotion | OI — happens, rarely credited | OV — governance, cross-functional |
| Mentoring a junior colleague | OI/SV — partially visible via evals | SI — entirely invisible, no structure | OV — formalized as "people management" |
| Navigating moral distress | SI | SI — fewer peer supports | SI — commercial-vs-clinical ethical tension |
| Prior authorizations | OI — real, not counted | OI — higher volume, no one to delegate to | N/A |
| Building a clinical program | OV — promotion-relevant | OV — revenue-relevant | OV — product/pipeline-relevant |
| Peer support / wellness work | OI — rarely credited | SI — often no formal structure | OV — sometimes a formalized "culture" role |

### F.3 — Setting-specific lexicons (same concept, different words)

NLP needs setting-specific lexicons — not different models, but different context windows weighting the same tokens differently.

| FISCMAK concept | Academic lexicon | Community lexicon | Industry lexicon |
|---|---|---|---|
| Invisible teaching | "informal mentoring," "hallway/bedside teaching" | "precepting students," "training my MA," "showing the new doc" | "onboarding," "knowledge transfer," "coaching direct reports" |
| Administrative burden | "committee work," "faculty governance," "promotion dossier" | "prior auths," "insurance calls," "charting after hours," "running the practice" | "regulatory submissions," "compliance docs," "cross-functional alignment" |
| Care coordination | "multidisciplinary conference," "tumor board," "care transitions" | "calling the specialist," "arranging home health," "ER follow-up" | "medical affairs liaison," "field medical insight," "site management" |
| Leadership | "division chief," "program director," "center director" | "managing partner," "medical director," "chief of staff" | "VP medical affairs," "head of clinical development," "CMO" |
| Research | "R01," "K award," "bench-to-bedside," "translational" | "practice-based research," "registry," "quality data" | "clinical trial design," "real-world evidence," "post-market surveillance" |
| Moral distress | "promotion pressure," "unfunded mandate," "publish or perish" | "can't spend enough time," "insurance denials," "no backup" | "commercial vs. clinical evidence," "label-expansion ethics" |

### F.4 — Setting-specific FTE norms (modifies F3, by AAMC mission area)

F3 becomes setting-aware: `Δ_struct,d = (Actual_d − Expected_d(setting)) / (Expected_d(setting) + δ)`. 60% clinical is "about right" in academia, severe underperformance in community. (Pollart n=8,349: perceived misalignment → intent-to-leave 14.6% vs. 5.6%.)

| Mission area | Academic | Community | Hybrid | VA | Industry |
|---|---|---|---|---|---|
| Clinical (Domain 1) | 20–60% | 80–100% | 40–80% | 60–90% | 0–20% |
| Teaching (Domains 2,4) | 10–30% | 0–5% | 5–20% | 5–15% | 0–5% |
| Research (Domains 2,3) | 10–50% | 0–5% | 0–20% | 5–20% | 10–40% |
| Administration (Domains 6,7) | 5–20% | 5–15% | 10–25% | 10–20% | 30–60% |

### F.5 — Setting-specific domain weight + track + adjacent-SOC profiles

| Setting | High-weight domains | Low-weight | Primary tracks | Adjacent SOC emphasis |
|---|---|---|---|---|
| Academic | Medical Knowledge (2), Practice-Based Learning (3), PPD (8) | — | Researcher, Educator, Innovator | 25-1071 teacher, 19-1042 scientist, 25-9031 instructional coord |
| Community | Clinical Expertise (1), Communication (4), Collaboration (7) | Research (unless hybrid) | Clinician, Quality/Safety | 11-9111 manager, 13-1082 PM, 29-9021 health info |
| Hybrid | Systems Thinking (6), Collaboration (7), Clinical Expertise (1) | Varies | Admin/Leader, Clinician, Educator | interpolated by blend ratio |
| VA/Government | Systems Thinking (6), Quality/Safety (7), Professionalism (5) | — | Quality/Safety, Admin/Leader, Clinician | systems/quality emphasis |
| Industry | Systems Thinking (6), Medical Knowledge (2), Practice-Based Learning (3) | Direct clinical | Innovator, Admin/Leader, Researcher | 15-2051 data sci, 13-1111 mgmt analyst, 15-1252 software dev |

### F.6 — The psychiatrist example: three different lattices

| | Academic psychiatrist | Community psychiatrist | Psychiatrist in AI development |
|---|---|---|---|
| High-weight domains | Medical Knowledge (2), Practice-Based Learning (3), Communication (4) | Clinical Expertise (1), Communication (4), Systems Thinking (6) | Medical Knowledge (2), Practice-Based Learning (3), Systems Thinking (6) |
| Primary tracks | Educator (2), Researcher (3) | Clinician (1), Advocate (5) | Innovator (6), Researcher (3) |
| Invisible work (OI) | unfunded mentoring, committee service, curriculum beyond FTE | care coordination w/o team, after-hours docs w/o resident buffer, crisis mgmt | translating clinical knowledge to product reqs, validating AI vs. clinical reality, regulatory ambiguity |
| Invisible work (SI) | imposter re: research productivity, rank-dependent burnout | emotional containment, isolation, absorbing chaos w/o debrief | identity dissonance ("am I still a doctor?"), commercial-vs-clinical ethics |
| Adjacent SOCs | 25-1071, 19-1042, 25-9031 | 23-1022 mediator, 21-1022 social worker, 11-9111 manager | 15-2051 data sci, 15-1252 software dev, 15-1211 systems analyst, 13-1111 mgmt analyst |
| Recognition system → Output Studio language | promotion dossier | patient outcomes + practice sustainability | product milestones, publications, business impact |

### F.7 — Industry setting: special architecture

Industry breaks the assumption that primary identity is clinical (only 27.7% of HBS physician-MBAs report clinical medicine as primary role). For industry physicians: (1) **shift primary axis from the 8 domains to the 8 tracks** (identity axis becomes primary since work is no longer structured by clinical FTE); (2) use the **adjacent-SOC fingerprint as the primary descriptor**, not the base physician SOC; (3) replace F3 (clinical-FTE discrepancy) with a **role-composition discrepancy** on the industry role taxonomy; (4) **retain the subjective layer** (energy, moral distress, recognition gap) — these apply regardless of setting.

### F.8 — Hybrid: blend ratio, not a binary

Fastest-growing category (74% of large practices now in health systems; academic health systems 43.4% Medicare ACO participation). Captured as a **self-reported blend ratio (0.0 pure community → 1.0 pure academic)** that interpolates FTE norms, domain weights, and adjacent-SOC profiles. A 0.7 physician gets mostly academic lexicon with community overrides for the 30% following community patterns. Worst-of-both-worlds risk: community-level volume + academic-level promotion expectations, neither recognition structure fully applying.

### F.9 — Schema additions

| Field | Type | Values | Modifies |
|---|---|---|---|
| practice_setting | enum | academic, community, hybrid, government, industry | FTE norm table, domain weight profile, adjacent-SOC weighting |
| hybrid_ratio | float (0–1) | 0.0 community → 1.0 academic | interpolates academic↔community norms |
| industry_role | enum (nullable) | medical_affairs, clinical_development, consulting, health_tech, device, administration, other | selects industry role taxonomy for F3 replacement |

Collected at intake, updatable anytime (physicians move between settings; longitudinal tracking should capture transitions). Graduation handoff (trainee→attending) prompts setting selection.

### F.10 — Rosetta Registry gets a setting dimension

Each of the 50–75 core concepts gains per-setting variants:

| Field | Type | Example |
|---|---|---|
| fiscmak_concept_id | string | "informal_teaching" |
| setting_lexicons | object | { academic: ["hallway teaching","bedside teaching"], community: ["precepting","training my MA"], industry: ["onboarding","knowledge transfer"] } |
| setting_quadrant_defaults | object | { academic: "OV", community: "OI", industry: "OV" } |
| setting_energy_prior | object | { academic: "neutral", community: "high_drain_risk", industry: "neutral" } |
| setting_mak_probes | object | { academic: "Is this teaching counted toward promotion?", community: "Does anyone know you do this?", industry: "Is this in your role description?" } |

→ ~225 lexicon entries + 225 quadrant defaults + 225 probe variants for the pilot (3 settings × ~75 concepts; hybrid interpolates academic↔community; government = academic variant w/ VA modifications). Manageable if prioritized by frequency in physician CVs and Mak conversations.

### F.11 — What this means for Coach Mak

Setting changes interpretation of every signal. Community physician with high Educator energy but zero teaching FTE = a *structural barrier*, not a simple misalignment → coaching differs ("explore adjunct appointments / preceptorship / simulation," not "advocate for protected time"). VA physician with low moral distress but moderate burnout → probe isolation/resource-constraint pathway, not the academic moral-distress pathway. **Setting is a parsing context that determines how FISCMAK understands, classifies, and speaks back — not a demographic variable.**

**Build note (F.2/F.3 are the priority curation task):** the same-activity-different-quadrant ruleset and the setting lexicons are what make parsing feel personal. Prioritize the first 10–15 concepts by highest-frequency invisible-work activities per setting; NLP pipeline needs setting-conditional routing (free text → setting lexicon → FISCMAK concept → quadrant + taxonomy codes).

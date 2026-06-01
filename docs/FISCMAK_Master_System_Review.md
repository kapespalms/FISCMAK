# FISCMAK — Master System Specification

**Version:** Throughput v1.1 (CANONICAL) · **Owner:** Kristen Palmer, MD · **Date:** May 31, 2026
**Status:** ✅ **SOURCE OF TRUTH.** Complete start-to-finish system vision, Parts I–XXIV. Build from THIS document. It carries the current decisions (FCWI-only well-being layer; reconciled citations R1–R25).

> **Companion deep-reference:** `FISCMAK_Intelligence_Layer_Spec.md` is the **technical annex** — the depth behind the brain of the system (rank matrix, composite fit formula with all weights, RIASEC circumplex, the 15-specialty SOC adjacency map, the triple-layer crosswalk, FCWI validation pathway). This document mentions every step; when you need the full math or a pre-made SOC/specialty table, the annex section is named inline as **→ [Annex: …]**. The annex is subordinate to this document — where they ever differ, **this document wins.**

> **Citation note:** the source material had two separately-numbered reference lists with inconsistent numbering (the mess). Merged below into one deduplicated master list **[R1]–[R25]**; all inline citations point to it. Reconciliation map at the bottom.

---

## MAP — where each Part's depth lives in the Annex

| Part (this doc) | Deeper detail in the Annex (`Intelligence_Layer_Spec.md`) |
|---|---|
| IV — 8×8 lattice | §1 axes + flipped-name warning; §2 **full rank matrix**; §3 domain→task map |
| V — O*NET / SOC process | §4 three-layer competency mapping; Appendix A **universal SOC library**; Appendix B **15-specialty adjacency map**; Appendix G **SOC×NAICS code map** |
| V / IX — fit & formulas | §7 formula register; Appendix C **composite Person–Domain Fit formula (all 8 weights, cited)** |
| VI — Rosetta Layer | Appendix D **Rosetta registry schema + 5 taxonomies** |
| VIII / XXIII — FCWI | Appendix J **9-item triple-map + validation pathway** |
| V / XII — milestone crosswalk | Appendix K **O*NET × ACGME × Lattice triple-layer crosswalk (psychiatry worked example)** |
| XV — seven-gap | Appendix H **gap × O*NET boundary (direct / proxy / none)** |
| XVI — setting modifier | Appendix F **setting-as-parsing-context (lexicons, quadrant routing)**; Appendix I clinical-setting modifier |
| (interest layer) | §6 **RIASEC / Prediger circumplex** + anchor SOCs |

*If a step here feels too thin to build from, its Annex section above has the full tables.*

---

## PART I — System Identity

FISCMAK is a physician-owned career intelligence platform mapping the full scope of physician work across **8 career domains × 8 career tracks × 4 experiential quadrants** (OV/OI/SV/SI). It integrates O*NET occupational data [R2], ACGME milestone frameworks [R3], a native well-being instrument (FCWI), NLP-driven narrative analysis, and self-reported FTE allocation into a unified system designed to **empower physicians — not evaluate them.**

**Core principle:** every existing institutional system (RVUs, milestones, promotion criteria, wellness surveys) is designed for the institution to *see the physician*. FISCMAK is designed for the physician to *see themselves*.

## PART II — The Triple-Layer Descriptor System

| Layer | Describes | Misses | Source |
|---|---|---|---|
| O*NET (277 descriptors) | what the occupation requires; rated 0–100 across 974 occupations | within-occupation variation; invisible work; subjective experience; trajectory | US DOL, public domain, REST API [R2] |
| ACGME Milestones (22–36 subcomp/specialty) | what physician should do at each level (1–5); semiannual CCC | non-clinical work; identity; energy; recognition; post-training | ACGME, specialty-specific [R3][R7] |
| FISCMAK Lattice (8×8×4) | what physician actually does, how it feels, visibility, alignment | standardized language; labor-market comparability; benchmarks | FISCMAK-native [R2][R3] |

## PART III — The 4-Quadrant Framework

| Quadrant | Definition | Captured by | FISCMAK role |
|---|---|---|---|
| Objective-Visible (OV) | countable outputs — publications, case volumes, milestone ratings, CV lines | RVU systems, promotion dossiers, MedHub | primary lattice evidence source |
| Objective-Invisible (OI) | real work, measurable but not tracked — after-hours docs, prior auths, informal mentoring | time-motion studies only | structured Mak prompts; FTE flags |
| Subjective-Visible (SV) | internal experiences externally expressed — empathy, teaching enthusiasm, leadership presence | milestones, EPAs, 360°, MedHub narratives | NLP-classified narrative evidence |
| Subjective-Invisible (SI) | internal experiences neither expressed nor recognized — moral distress, emotional labor, imposter | almost nothing systematically | adaptive Mak probes; FCWI |

## PART IV — The 8×8 Career Lattice

**8 Career Domains (columns, identity-based):**

| # | Domain | Identity | Primary evidence tasks | Invisible work | Primary SOC |
|---|---|---|---|---|---|
| 1 | Clinician | clinical care provider | Clinical Expertise, Medical Knowledge, Communication | after-hours EHR, care coordination, patient advocacy | 29-12XX |
| 2 | Educator | teacher/mentor | Communication, Practice-Based Learning, Collaboration | informal teaching, curriculum, mentoring | 25-1071 |
| 3 | Researcher | investigator/scholar | Medical Knowledge, Practice-Based Learning, PPD | grant writing, literature synthesis, mentoring | 19-1042 |
| 4 | Administrator/Leader | organizational leader | Systems Thinking, Collaboration, Professionalism | committee work, policy, crisis management | 11-9111 |
| 5 | Advocate | change agent | Systems Thinking, Professionalism, Communication | community health, policy testimony, SDOH | 21-1094 |
| 6 | Innovator | builder/designer | Practice-Based Learning, Systems Thinking, Medical Knowledge | tool building, protocol design, QI | 15-1252 / 19-1042 |
| 7 | Quality/Safety | systems guardian | Practice-Based Learning, Systems Thinking, Clinical Expertise | safety review, systems analysis, protocols | 29-9021 |
| 8 | Wellness Champion | culture builder | PPD, Collaboration, Professionalism | peer support, wellness programming, culture change | 21-1014 |

**8 Career Tasks/Skills (rows, AAMC PCRS-aligned [R2]):** Clinical Expertise (PC) · Medical Knowledge (MK) · Practice-Based Learning (PBLI) · Communication (ICS+IPC) · Professionalism & Ethics (PROF) · Systems Thinking (SBP) · Collaboration & Teamwork (IPC) · Personal & Professional Dev. (PPD).

> ⚠️ Code variable names are FLIPPED: founder "Career Domains" (columns) = code `TRACKS`; founder "Career Tasks/Skills" (rows) = code `DOMAINS`.

## PART V — O*NET Integration (the SOC process)

**Step 1 — Anchor SOC:** specialty → primary SOC (29-1211…29-1249); pulls 277 descriptors, importance (1–5) + level (1–7), normalized 0–100 [R2][R4].

**Step 2 — The 9 O*NET descriptor categories:**

| Category | Items | Scale | ACGME mapping | Lattice domain |
|---|---|---|---|---|
| Abilities | 52 | Imp 1–5 | PC (perceptual/psychomotor), MK (cognitive) | 1, 2 |
| Interests (RIASEC) | 6 | 1–7 | none — desire layer | all (energy proxy) |
| Knowledge | 33 | Imp 1–5 | MK, SBP | 2, 6 |
| Skills | 35 | Imp 1–5 | ICS, PBLI, SBP | 3, 4, 7 |
| Work Activities | 41 | Imp 1–5 | all 6 ACGME | all 8 — richest layer |
| Work Context | 57 | Freq 1–5 | PROF, SBP | 5, 6 + setting modifier |
| Work Styles | 16 | Imp 1–5 | PROF, ICS | 5, 8 |
| Work Values | 6 | Extent 1–7 | PPD, PROF | 8 + P-E fit |
| Job Zones | 1 | 1–5 | training stage | career-stage modifier |

**Step 3 — Adjacent SOC** (translation anchors, not destinations): 24 universal non-physician SOCs + per-specialty curated adjacencies (config files, Part XII).

**Step 4 — Descriptor extraction + fingerprint:** `Overlap = Σ min(d_phys,d_adj) / Σ max(d_phys,d_adj)`; `F_fingerprint = Σ w_j · D_adjacent_j` (w_j from evidence density).

**Step 5 — O*NET data sources** (all free/public): O*NET flat files (277 descriptors); Interest Profiler (60-item RIASEC); Career Changer Matrix (≤10 related occs); CareerOneStop Skills Gap API [R2].

**Step 6 — Specialty milestone→O*NET→lattice crosswalk** (built once per specialty) [R3][R6].

## PART VI — Rosetta Layer (5 external taxonomies)

O*NET (US DOL) [R2] · ESCO (EU) · CIP (US Dept Ed) · DOT (legacy) · RAPIDS (US DOL). Each FISCMAK concept maps to all five → audience-specific output.

## PART VII — Users & Data Flows (reliability weights w_s)

**Trainee:** MedHub duty hours (0.65) · MedHub evals narrative (0.40) · CCC milestones (0.70) [R3][R4] · career docs (0.50) · Mak prompts (0.55) · energy ranking (0.60) · FCWI (0.90) · weekly pulse (0.90) [R16][R17][R18].
**Attending:** self-reported FTE (0.50) · career docs (0.50) · Mak prompts (0.55) · energy ranking (0.60) · FCWI (0.90) · weekly pulse (0.90) [R12].
**Institution:** aggregate, de-identified, **N≥5**; individual Mak chats never institution-facing.

## PART VIII — Assessment Battery (no PFI/SVS/MBI/UWES)

| Frequency | Instrument | Items | Time | Captures |
|---|---|---|---|---|
| Weekly | single-item EE + DP + QoL + MDT | 4 | 1 min | burnout pulse (r=0.76–0.83 vs MBI-EE [R16][R17]); distress trigger (MDT ≥4 [R18]) |
| Monthly | FCWI | 9 | 2 min | career-integrated well-being |
| Quarterly | energy ranking (8) + FTE + goal + setting | ~15 | 5 min | lattice recalibration; F3 update |
| Onboarding/Annual | O*NET Interest Profiler (60) + context | ~65 | 15 min | RIASEC; SOC; setting; stage |
| Pilot only | full PFI (16) + SVS (4) | 20 | 5 min | concurrent validity → drop after r≥0.75 [R10] |

Total annual burden ≈ 2 hours/year.

**The FCWI — 9 items** (0–4 Likert):

| # | Item | Construct | O*NET link | ACGME link | Quadrant |
|---|---|---|---|---|---|
| 1 | "work I spend most time on depletes my energy" | Work Exhaustion | Work Context: Time Pressure | PC workload | OI |
| 2 | "disconnected from people I work with/care for" | Interpersonal Disengagement | Work Activities: Establishing Relationships | ICS | SV |
| 3 | "work feels meaningful, aligned with why I entered medicine" | Meaningfulness | Work Values: Achievement | PROF identity | SI |
| 4 | "satisfied with what I've accomplished" | Satisfaction | Work Activities: Evaluating Info | PBLI reflective | OV |
| 5 | "in control of my professional direction" | Autonomy/Control | Work Values: Independence | SBP | OI |
| 6 | "work I spend most time on gives me energy" | Domain-Specific Energy | Work Values + RIASEC | NEW | SI |
| 7 | "work that matters most is recognized by my institution" | Recognition | Work Values: Recognition | NEW | OI→OV |
| 8 | "after a mistake I learn rather than feel shame" | Growth Mindset | Work Styles: Adaptability | PROF/PBLI | SI |
| 9 | "I prioritize my health under high demand" | Self-Care | Work Styles: Stress Tolerance | PROF | SI |

## PART IX — Formula System

- **F1 Evidence Density:** `D(q,d,t) = Σ w_s · n(s,q,d,t)`
- **F3 Structural Discrepancy:** `Δ = (Actual − Expected)/(Expected + δ)` [R12]
- **F4 Perception Gap:** `P_d = Perceived_d − Expected_d` [R12]
- **F5 Recognition Gap (internal only):** `G = Σ(OI+SI) / Σ(OV+SV)`; G>1.0 = predominantly unrecognized
- **F7 Transfer Potential:** `T(q,d,t) = D(q,d,t) · Relevance(→goal)`
- **F6 Person-Occupation Fit (Phase 2+):** cosine(physician vector, O*NET specialty vector)
- **F8 Hobby-Profession Bridge (Phase 2+):** cosine(hobby vector, specialty vector)

## PART X — Coach Mak

Reflects, probes, generates documents, tracks goals, prepares human-coach briefs — never evaluates or ranks. Context vars: stage, setting, specialty→SOC, role composition, years. **Goal architecture (4 horizons):** 3-mo SMART (OV/OI→OV) · 1-yr SMART+II (OV+OI) · 5-yr WOOP (SI→all) · 10-yr legacy (SI). Adaptive SI probes (8–12/domain/yr). Distress detection: MDT ≥4 → resource link + pause, no auto-report. Three coaching modes (async / structured+human R2C2 / transition) [R11][R13].

## PART XI — User Lifecycle

Onboarding (~30 min): context → Interest Profiler → energy ranking → FCWI baseline → weekly pulse baseline → goals → CV upload+parse → adjacent-SOC calibration. Weekly (<3 min). Monthly FCWI (2 min). Quarterly snapshot (~15 min). Annual comprehensive (~20 min).

## PART XII — Specialty Config Files

`specialty_config/psychiatry_29-1223/`: `onet_descriptors.json` · `acgme_milestones.json` · `crosswalk.json` · `adjacent_socs.json` · `activity_ontology.json` · `setting_modifiers.json`. Each crosswalk is a publishable artifact [R3].

## PART XIII — NLP Pipeline (3-layer dictionary)

L1 O*NET descriptor dictionary (277) [R2] → L2 FISCMAK Activity Ontology (~200+, proprietary) → L3 Rosetta cross-taxonomy. Process: upload → Stanza segmentation → section detection → BioBERT classification → confirmation → evidence-unit creation.

## PART XIV — Outputs

**Physician-facing:** 8×8 lattice heat map · 2×2 quadrant summary · well-being origami plot (7 axes) · trainee milestone heatmap · career snapshot · CV optimization · promotion dossier · invisible-work summary · personal statement · educator/quality portfolio · consulting/industry CV.
**Institution-facing (aggregate, N≥5):** domain-coverage heat map · Recognition Gap distribution · energy-evidence misalignment prevalence [R12] · FCWI trends · FTE discrepancy summary · goal trajectory · trainee milestone trends · team lattice coverage.

## PART XV — Seven-Gap Architecture

| Gap | O*NET connection | FISCMAK source |
|---|---|---|
| Skill | ✅ Skills Gap API | lattice evidence density [R2] |
| Knowledge | ✅ Knowledge descriptors | CV parsing; Mak probes [R2] |
| Credential | ✅ Job Zones + CIP | CV parsing |
| Language | ⚠️ partial (Rosetta) | Output Studio |
| Identity | ⚠️ partial (Work Styles/Values) | FCWI 3,6; Mak SI probes |
| Evidence | ❌ none | lattice OV quadrant |
| Network | ❌ none | Mak probes |

## PART XVI — Clinical Setting Modifier

Inpatient (↑ time pressure, consequence of error; high-OI documentation) · Outpatient (panel size FTE proxy; high-OI coordination/inbox) · Hybrid (weighted blend; highest OI from context-switching) · Non-clinical (Domain 1 deprioritized; descriptors shift to adjacent SOCs). Captured onboarding, updated weekly, recalibrated quarterly [R2].

## PART XVII — Visualizations

17.1 Primary 8×8 heat map (density × energy hue × FTE border × transfer stars; ipsative). 17.2 2×2 quadrant summary (onboarding "aha"). 17.3 Trainee milestone heatmap [R3][R4]. 17.4 Well-being origami plot, 7 axes (EE, DP, FCWI-3 Meaningfulness, MDT, FCWI-6 Energy, FCWI-7 Recognition, FCWI-9 Self-Care). 17.5 Competency–well-being heat map [R5]. Stack: D3.js, Plotly, React, Stanza, BioBERT, BERTopic.

## PART XVIII — Trainee Integration & Institutional Layer

MedHub import (duty hours → F3; evals → NLP; CCC → heatmap) [R3][R4][R6]. Graduation handoff (shared evidence layer trainee→attending). CCC support: milestone import, blind-spot flagging, program-level coverage [R3]. Institutional dashboard N≥5. Value prop: burnout detection [R14], retention [R12], team composition, promotion equity, accreditation [R6][R15], faculty development.

## PART XIX — Governance & AI Boundaries

Physician-owned data; institution sees aggregate N≥5 only; 30-day deletion w/ export. AI does: parse, detect patterns, draft docs, track goals, prep coach briefs, flag distress→resource. AI does NOT: make promotion decisions, diagnose burnout, prescribe, share without consent, replace coaching, rank physicians, auto-report. Formula defensibility: every coefficient cited [R12][R16][R17][R18]. Safety protocol: crisis resources, no auto-report, mandatory-reporting disclosed at consent. Regulatory: not a SaMD; distress flag is not a clinical screen; "AI-generated" labels on all LLM output.

## PART XX — Cost Architecture

Next.js (free) · Supabase ($25/mo) · Vercel ($20/mo) · Stanza/BioBERT (free, ~$50 one-time GPU) · D3/Plotly (free) · Claude/GPT inference (~$0.50–1.50/user/mo) · O*NET API (free) [R2]. Year 1 pilot (15–20): ~$15–30k. Year 2 (50–100): ~$50–100k. Scales to 1,000 at ~$600–1,600/mo (>95% infra gross margin).

## PART XXI — Parallel Build Plan (6 tracks)

A Foundation (schema, ontology, O*NET import, config files) · B Coach Mak (engine, probes, goals, distress) [R11][R13] · C Intelligence (F1/F3/F4/F5/F7, FCWI scoring, 7-gap) · D Visualization (heat map, 2×2, milestone heatmap, origami) · E Output Studio · F Institutional (MedHub, handoff, dashboard, IRB) [R3][R4]. Timeline: Wk1 schema → Wk2–3 density+heatmap → Wk4–5 NLP+discrepancy → Wk6–8 recognition+dossier → Wk9–12 pilot-ready → Mo4–6 pilot (NPS≥40, accuracy≥3.8/5) → Mo7–12 expansion → Mo13–18 full O*NET (F6/F8), Paper 1.

## PART XXII — Publication Strategy

Paper 1 (Mo12): invisible-work 4-quadrant framework, n≥15 → Academic Medicine/JGIM. Paper 2 (Mo18): Recognition Gap predicts dissatisfaction (F5 validity) → JAMA Network Open. Paper 3 (Mo24): competency-lattice longitudinal P-O fit, n≥50 → Annals. Conferences: AAMC, ACGME, SGIM, ASE.

## PART XXIII — FCWI Validation Pathway

Content validity (expert panel, ≥80% agreement) · Face validity (cohort, ≥90% relevant) · Internal consistency (α≥0.80) · Concurrent validity (r≥0.75 vs PFI/SVS [R10]) · Criterion validity (AUC≥0.80 intent-to-leave [R12]) · **Discriminant validity (Items 6–7 incremental R²≥0.05)** · Test-retest (ICC≥0.70).

## PART XXIV — Complete Data Schema

`evidence_unit` (recognition_quadrant ENUM, energy_score INT, sentiment FLOAT, transfer_targets ARRAY, time_class) · `energy_rankings` · `goal_records` (4 horizons) · `narrative_evidence` (distress_flag, energy_signal, invisible_work_flag, mak_session_id) · `transfer_pathways` · `lattice_cell` (fte_discrepancy_flag, transfer_potential_score) · `fcwi_responses` (items 1–9, frequency_tier) · `weekly_pulse` (ee, dp, qol, mdt, energy_boost_task, energy_drain_task, invisible_flag) · `specialty_config` (soc_code, 6 JSON cols) · `riasec_profile` (R,I,A,S,E,C) · `onet_fingerprint` (descriptor_vector FLOAT[], adjacent_soc_weights JSON).

---

## MASTER REFERENCE LIST (reconciled — single unified numbering)

*Merged from the two source lists; duplicates collapsed. 25 unique sources.*

- **[R1]** Shanafelt TD, et al. Association of Burnout, Professional Fulfillment, and Self-care Practices of Physician Leaders With Independently Rated Leadership Effectiveness. *JAMA Netw Open.* 2020.
- **[R2]** Dembe AE, Yao X, Wickizer TM, Shoben AB, Dong XS. Using O*NET to estimate the association between work exposures and chronic diseases. *Am J Ind Med.* 2014.
- **[R3]** Edgar L, Roberts S, Yaghmour NA, et al. Competency Crosswalk: A Multispecialty Review of ACGME Milestones Across Four Competency Domains. *Acad Med.* 2018.
- **[R4]** Park YS, Hamstra SJ, Yamazaki K, Holmboe E. Longitudinal Reliability of Milestones-Based Learning Trajectories in Family Medicine Residents. *JAMA Netw Open.* 2021.
- **[R5]** Staples BB, Burke AE, Batra M, et al. Burnout and Association With Resident Performance as Assessed by Pediatric Milestones. *Acad Pediatr.* 2021.
- **[R6]** Gray BM, Vandergrift JL, Stevens JP, et al. Associations of Internal Medicine Residency Milestone Ratings and Certification Examination Scores With Patient Outcomes. *JAMA.* 2024.
- **[R7]** Nasca TJ, Philibert I, Brigham T, Flynn TC. The Next GME Accreditation System — Rationale and Benefits. *NEJM.* 2012.
- **[R8]** Trockel MT, Hamidi MS, Menon NK, et al. Self-Valuation: Attending to the Most Important Instrument in the Practice of Medicine. *Mayo Clin Proc.* 2019.
- **[R9]** Leo T, Reynolds J, Blair J, et al. Assessment of Clinician Well-Being Using a Biometric-Informed Coaching Platform. *JAMA Netw Open.* 2026.
- **[R10]** Brady KJS, Ni P, Carlasare L, et al. Establishing Crosswalks Between Common Measures of Burnout in US Physicians. *J Gen Intern Med.* 2022.
- **[R11]** Kiser SB, Sterns JD, Lai PY, Horick NK, Palamara K. Physician Coaching by Professionally Trained Peers for Burnout and Well-Being: A Randomized Clinical Trial. *JAMA Netw Open.* 2024.
- **[R12]** Ligibel JA, Goularte N, Berliner JI, et al. Well-Being Parameters and Intention to Leave Current Institution Among Academic Physicians. *JAMA Netw Open.* 2023.
- **[R13]** Dyrbye LN, Shanafelt TD, Gill PR, Satele DV, West CP. Effect of a Professional Coaching Intervention on the Well-being and Distress of Physicians: A Pilot RCT. *JAMA Intern Med.* 2019.
- **[R14]** Guille C, Sen S. Burnout, Depression, and Diminished Well-Being among Physicians. *NEJM.* 2024.
- **[R15]** Smith BK, Yamazaki K, Tekian A, et al. ACGME Milestone Training Ratings and Surgeons' Early Outcomes. *JAMA Surg.* 2024.
- **[R16]** West CP, Dyrbye LN, Satele DV, Sloan JA, Shanafelt TD. Concurrent Validity of Single-Item Measures of Emotional Exhaustion and Depersonalization in Burnout Assessment. *J Gen Intern Med.* 2012.
- **[R17]** Dolan ED, Mohr D, Lempa M, et al. Using a Single Item to Measure Burnout in Primary Care Staff: A Psychometric Evaluation. *J Gen Intern Med.* 2015.
- **[R18]** Wocial LD, Weaver MT. Development and psychometric testing of a new tool for detecting moral distress: the Moral Distress Thermometer. *J Adv Nurs.* 2013.
- **[R19]** Englander R, Cameron T, Ballard AJ, et al. Toward a Common Taxonomy of Competency Domains for the Health Professions and Competencies for Physicians (AAMC PCRS). *Acad Med.* 2013.
- **[R20]** Buckner-Petty S, Dale AM, Evanoff BA. Efficiency of autocoding programs for converting job descriptors into SOC codes. *Am J Ind Med.* 2019.
- **[R21]** Prins SJ, McKetta S, Platt J, et al. Mental illness, drinking, and the social division and structure of labor in the US: 2003–2015. *Am J Ind Med.* 2019.
- **[R22]** Dewey JJ, Chiota-McCollum N, Barratt D, et al. Introducing the Neurology Milestones 2.0. *Neurology.* 2022.
- **[R23]** Lee LJ, Symanski E, Lupo PJ, et al. Data linkage between the National Birth Defects Prevention Study and O*NET. *Am J Ind Med.* 2016.
- **[R24]** Rotenstein LS, Torre M, Ramos MA, et al. Prevalence of Burnout Among Physicians: A Systematic Review. *JAMA.* 2018.
- **[R25]** Abedali S, van den Berg J, Smirnova A, et al. The WellNext Scan: Validity Evidence of a New Team-Based Tool to Map and Support Physicians' Well-Being. *PLoS One.* 2024.

### Reconciliation map (old two lists → master)

| Old "List A" # | Old "List B" # | Master |
|---|---|---|
| A1 Shanafelt | — | R1 |
| A2 Dembe | B1 Dembe | **R2** (dup collapsed) |
| A3 Edgar | B3 Edgar | **R3** (dup) |
| A4 Park | B6 Park | **R4** (dup) |
| A5 Staples | — | R5 |
| A6 Gray | B10 Gray | **R6** (dup) |
| A7 Nasca | B8 Nasca | **R7** (dup) |
| A8 Trockel | — | R8 |
| A9 Leo | — | R9 |
| A10 Brady | — | R10 |
| A11 Kiser | B12 Kiser | **R11** (dup) |
| A12 Ligibel | B14 Ligibel | **R12** (dup) |
| A13 Dyrbye | B11 Dyrbye | **R13** (dup) |
| A14 Guille | B16 Guille | **R14** (dup) |
| A15 Smith | B17 Smith | **R15** (dup) |
| A16 West | — | R16 |
| A17 Dolan | — | R17 |
| A18 Wocial | — | R18 |
| — | B2 Englander | R19 |
| — | B4 Buckner-Petty | R20 |
| — | B5 Prins | R21 |
| — | B7 Dewey | R22 |
| — | B9 Lee | R23 |
| — | B13 Rotenstein | R24 |
| — | B15 Abedali | R25 |

*15 sources appeared in both lists under different numbers (the mess); 3 were List-A-only, 7 were List-B-only. All now unified under R1–R25.*

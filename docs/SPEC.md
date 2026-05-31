# FISCMAK: The Physician Career Lattice Platform
## Full Evidence-Based Specification — Version 3 (Complete)

---

## 1. Executive Summary

FISCMAK is an AI-powered, physician-owned career intelligence platform that maps the full scope of physician work across **8 career domains × 8 career tracks × 4 experiential quadrants** (Objective-Visible, Objective-Invisible, Subjective-Visible, Subjective-Invisible). It integrates validated well-being instruments, ACGME competency frameworks, MedHub evaluation data, NLP-driven narrative analysis, and self-reported FTE allocation into a unified system designed to empower physicians — not evaluate them. The platform serves residents, fellows, and attendings across academic, community, and hybrid settings, providing personalized career navigation, gap detection, and document generation through an AI coaching entity called Coach Mak.

**Core design principle:** Every existing institutional system — RVUs, milestones, promotion criteria, wellness surveys — is designed for the institution to see the physician. FISCMAK is designed for the **physician to see themselves** — and then to choose what to make visible, to whom, and for what purpose.

### Key Architectural Constraints (v3 — non-negotiable)

- No EHR integration — all effort data from self-report (attendings) and MedHub duty hour logs (trainees)
- No composite scores or headline indices shown to physicians
- No compensation/productivity economics layer
- Physician-owned data with explicit consent for any institutional sharing
- AI bounded to coaching and pattern support — not promotion decisions or surveillance
- O*NET Level 1 integration in Phase 1 (SOC lookup + profile display)

---

## 2. The Problem: Invisible Work and Fragmented Measurement

For every hour of direct clinical face time, physicians spend nearly 2 additional hours on EHR and desk work, plus 1–2 hours of after-hours personal time on computer tasks (Sinsky et al., Ann Int Med 2016). In academic medicine, invisible labor includes teaching, mentoring, committee service, and unfunded research — with disproportionate burdens on women and underrepresented-in-medicine faculty.

Existing measurement systems each capture only a fraction of physician work:

| System | Captures | Misses |
|---|---|---|
| RVUs | Billable clinical services | Teaching, mentoring, care coordination, admin |
| ACGME Milestones | Developmental competency | Subjective experience, professional identity |
| EPAs | Entrustment at a point in time | Longitudinal trajectory, invisible preparation |
| Wellness surveys | Burnout symptoms at a moment | Causal structure, domain-specific drivers |

The consequence is **professional dissonance** — psychological discomfort when professional values conflict with work settings. This drives burnout: 39.1% of US physicians report high moral distress (MDT ≥4), accounting for 30% of variability in emotional exhaustion and 25% in depersonalization (Tutty et al., JAMA Network Open 2026). Moral distress is distinct from burnout and requires distinct interventions.

---

## 3. Theoretical Foundations

### 3.1 The 4-Quadrant Model

| Quadrant | Definition | Captured By | FISCMAK Role |
|---|---|---|---|
| Objective-Visible (OV) | Countable outputs — publications, case volumes, milestone ratings, CV lines | RVU systems, promotion dossiers, MedHub evaluations | Primary lattice evidence source |
| Objective-Invisible (OI) | Real work measurable in principle but not tracked — after-hours documentation, prior auths, informal mentoring | Time-motion studies only | Structured Mak prompts; FTE discrepancy flags |
| Subjective-Visible (SV) | Internal experiences externally expressed — empathy, teaching enthusiasm, leadership presence | Milestones, EPAs, 360° evaluations, MedHub narratives | NLP-classified narrative evidence |
| Subjective-Invisible (SI) | Internal experiences neither expressed nor recognized — moral distress, emotional labor, imposter phenomenon | Almost nothing systematically | Adaptive Mak probes; well-being instruments |

Quadrants serve as **recognition language** — metadata tags on evidence records and coaching language — not a 256-cell visualization. A simple 2×2 summary view shows evidence distribution as a proportional area chart.

### 3.2 The 8 Career Domains (AAMC PCRS-Aligned)

1. Clinical Expertise (Patient Care)
2. Medical Knowledge (Scholarship & Learning)
3. Practice-Based Learning & Improvement
4. Communication (Interpersonal & Communication Skills)
5. Professionalism & Ethics
6. Systems Thinking (Systems-Based Practice)
7. Collaboration & Teamwork (Interprofessional Collaboration)
8. Personal & Professional Development

### 3.3 The 8 Career Tracks (Identity-Based)

1. Clinician
2. Educator
3. Researcher
4. Administrator/Leader
5. Advocate
6. Innovator
7. Quality/Safety
8. Wellness Champion

### 3.4 Person-Environment Fit — Core Theoretical Framework

- Person-organization fit explains 36.6% of satisfaction variance and 27.7% of emotional exhaustion in healthcare (Herkes et al., BMJ Open 2019)
- Person-vocation fit: each 1-point increase → 19% lower burnout odds (OR 0.81; Fan et al., PloS One 2025)
- Systematic review of 28 studies: 96.4% reported significant positive association between perception of fit and staff outcomes in healthcare

---

## 4. Platform Architecture: Three Layers

### Layer 1: AI-Guided Intake & Narrative Engine (Coach Mak)

**Career Context Variables:** Training stage, setting, specialty/subspecialty, role composition (% clinical/teaching/research/admin), years in practice.

**Goal Architecture — WOOP + SMART Integration:**
- 6-month goal (SMART): Specific, measurable, near-term deliverable → OV quadrant
- 1-year goal (SMART + Implementation Intentions): Behavioral change with if-then plans → OI → OV transfer
- 5-year goal (WOOP): Aspirational identity vision with mental contrasting → SI → all quadrants

**Domain Energy Ranking:** Physician ranks 8 domains on 5-point scale (very energizing → very draining). Drives probe order, coaching design, transfer pathway prioritization.

**Adaptive SI Probes:** 8–12 deep probes per year per domain via conversational AI, drawing on: Moral Distress Thermometer, professional dissonance, surface vs. deep acting, imposter phenomenon, professional identity formation. Replaces structured 64-question battery.

**Privacy Architecture:** Individual Mak conversations never institution-facing. Aggregate GME views require role, tenant, and minimum-N (≥5) privacy rules.

### Layer 2: Career Intelligence & Gap Detection Dashboard

**Data Sources — No EHR:**

For attendings:
- Self-reported FTE allocation (Expected from institution + Actual from self-report)
- Career documents (CV, portfolio, dossier, teaching evaluations)
- Structured Mak activity prompts (concrete, countable invisible work questions)
- Validated well-being instruments

For trainees:
- MedHub duty hour logs (weekly self-reported — ACGME-mandated standard)
- MedHub end-of-rotation evaluations and multisource feedback
- CCC milestone ratings (imported with consent)
- Career documents and Mak-reported activities

**The Lattice Density Map (Primary Visualization):**
- 8×8 heat map (domains × tracks)
- Color intensity = confirmed evidence density
- Color hue = energy alignment (warm = energizing, cool = draining)
- Cell borders = FTE discrepancy (thick = >20% over expected; dashed = >20% under)
- Star markers = transfer potential (SI cells with high relevance to stated goals)
- Ipsative not normative: reflects physician's own profile, not "bright = good physician"

**When to show numbers (not density):**
- Validated instrument scores with established cutoffs (PFI burnout ≥1.33, MDT ≥4)
- FTE discrepancy percentages ("Teaching: 0.35 actual vs. 0.20 expected (+75%)")
- Longitudinal Δ-scores (change over time)

**Well-Being Profile:** Seven validated dimensions displayed separately — no composite score:
1. Emotional Exhaustion (single-item, r=0.76–0.83 vs. MBI-EE)
2. Depersonalization (single-item, r=0.61–0.72 vs. MBI-DP)
3. Professional Fulfillment (PFI; ≥3.00 = "very good" QoL)
4. Moral Distress (MDT; ≥4 = high risk)
5. Work Engagement (UWES-9)
6. Self-Valuation (SVS; ≤8 = increased burnout risk)
7. Recognition Gap (internal/coaching only — never displayed as a number)

### Layer 3: Career Document Generator & Coaching Interface

**Output Studio** (all from confirmed evidence with provenance, physician edits every document):
- CV optimization
- Educator portfolio
- Quality portfolio
- Promotion dossier/narrative
- Personal statement synthesized from Mak themes
- Invisible work summary
- Career snapshot

**AI Coaching Interface — Three Modes:**
1. Asynchronous AI Coach (daily/weekly) — brief check-ins, implementation intention reminders, micro-reflections, well-being pulse checks
2. Structured Coaching Sessions (monthly/quarterly) — AI prepares coaching briefs; human coach uses R2C2 model
3. Career Transition Support (as needed) — fellow→attending, early→mid-career, mid-career recalibration

---

## 5. The Modular Formula System (v3 — No EHR)

All formula weights trace to published citations. Every formula in Output Studio includes a "Why this number?" section linking to source.

### F1 — Evidence Density per Cell
```
D(q,d,t) = Σ [s=1 to S] wₛ · n(s,q,d,t)
```

| Source | Weight (wₛ) | Basis |
|---|---|---|
| Self-reported FTE allocation | 0.50 | Stable year-to-year; varies 49–66% by method |
| MedHub duty hour logs (trainees) | 0.65 | r = 0.86–0.88 vs. app-recorded |
| MedHub evaluations (narrative) | 0.40 | ICC = 0.30–0.50 single rater; NLP AUC 0.75–0.88 |
| CCC milestone ratings (trainees) | 0.70 | G = 0.60–0.80 with 8–11 assessors |
| Career documents (CV, dossier) | 0.50 | Face validity; objective evidence |
| Structured Mak activity prompts | 0.55 | Concrete countable activities |
| PFI/MDT validated instruments | 0.90 | α = 0.90–0.92; r = 0.76–0.83 |
| Domain energy ranking | 0.60 | Self-report; intrinsic motivation literature |

### F3 — Structural Discrepancy per Domain
```
Δ_struct,d = (Self-Reported Actual_d − Reported Expected_d) / (Reported Expected_d + δ)
```
- Attendings: Actual = self-reported effort; Expected = institutional FTE allocation
- Trainees: Actual = MedHub logged hours; Expected = rotation schedule + ACGME limits

### F4 — Perception Gap per Domain
```
P_d = Perceived_d − Expected_d
```
Perception of misalignment predicts intent to leave (OR 2.12; Pollart et al., n=8,349).

### F5 — Recognition Gap (Internal/Coaching Only — Never Displayed as Number)
```
G = Σ(D_SI,d,t + D_OI,d,t) / Σ(D_OV,d,t + D_SV,d,t + δ)
```
G > 1.0 = predominantly unrecognized work. Used in Mak's internal reasoning and coaching language only.

### F7 — Transfer Potential per Cell
```
T(q,d,t) = D(q,d,t) · Relevance(d,t → Goal)
```
Identifies SI cells with highest relevance to stated career goals. Productized as transfer pathways.

### F6 — Person-Occupation Fit (O*NET — Phase 1 Level 1, Full Phase 3+)
```
F_PO = cosine_similarity(physician_profile_vector, O*NET_specialty_vector)
```
Phase 1: SOC code lookup + O*NET Work Activities display card (~1–2 days engineering). Full computation Phase 3+.

### F8 — Hobby-Profession Bridge (Phase 2+)
```
B_h = cosine_similarity(hobby_O*NET_vector, specialty_O*NET_vector)
```
Deferred to Phase 2.

---

## 6. Validated Instruments (All Free/Open-Source)

### Tiered Delivery

**Tier 1 — Weekly pulse (3 items, ~30 seconds):**
- Single-item EE (r=0.76–0.83 vs. MBI-EE; AUC 0.94)
- Single-item DP (r=0.61–0.72 vs. MBI-DP; AUC 0.93)
- Single-item QoL (0–10 linear analog)

**Tier 2 — Monthly short battery (7–8 items, ~2 minutes):**
- PFI Work Exhaustion subscale (4 items; PFI-WE ≥7 ≈ MBI-EE ≥27)
- PFI Interpersonal Disengagement subscale (6 items; PFI-ID ≥9 ≈ MBI-DP ≥10)
- Moral Distress Thermometer (1 item; ≥4 = high risk)

**Tier 3 — Baseline/6-month/annual (20–26 items, ~5 minutes):**
- Full PFI (16 items; burnout ≥1.33; fulfillment ≥3.00; α=0.90–0.92)
- Self-Valuation Scale (4 items; ≤8 = increased burnout risk)
- UWES-9 (9 items; free for academic research)

### Instrument Delivery Policy
- Users see plain-language summaries only — never instrument names, tier numbers, or raw scores in UI
- No new validated batteries added unless one is removed with equal or lower burden
- Adaptive Mak probes replace structured batteries for SI quadrant exploration

---

## 7. Trainee-Specific Integration

### MedHub
- Duty hour logs → F3 Structural Discrepancy for trainees
- End-of-rotation evaluations + multisource feedback → NLP pipeline → domain + quadrant classification → lattice
- CCC milestone ratings → trainee heatmap overlay (consent required)
- EPA-to-milestone mapping via NLP (AUC 0.75–0.88; Booth et al., Academic Medicine 2023)

### Graduation Handoff
A narrow evidence-tagged seed transfers from trainee system to attending portfolio at graduation. Trainee milestone heatmap and attending 8×8 lattice share a common evidence layer — different visualizations of the same schema.

### CCC Support
Milestone rating import, blind-spot flagging (subcompetencies with no evidence), aggregate program-level domain coverage for accreditation.

---

## 8. NLP Pipeline

**Open-Source Tools:**
- Stanza (Stanford NLP; Apache 2.0) — sentence segmentation, biomedical English models
- Fine-tuned BERT/BioBERT (Hugging Face) — domain classification (AUC 0.75–0.88 for ACGME subcompetencies)
- Lexicon-based + transformer hybrid — sentiment analysis
- BERTopic or LDA (scikit-learn) — topic modeling
- D3.js + Plotly — feedback visualization

**Pipeline Steps:**
1. Document upload (PDF/DOCX/text) with server-side parsing
2. Section-aware heading detection and specialty-oriented placement rules
3. Domain classification (8 domains via fine-tuned BERT)
4. Theme extraction (BERTopic mapped to 8 tracks)
5. Quadrant assignment (OV/OI/SV/SI based on content type)
6. Provisional mapping → physician reconcile (confirm/dismiss) → lattice

**Known Limitations:** NLP cannot reliably identify bottom 10% of performers from narrative data alone. Copy/paste behavior in evaluations limits discriminatory utility. NLP augments — does not replace — human judgment.

---

## 9. FTE-Anchored Discrepancy Model

### Three-Source Comparison for Attendings
- **Expected:** Institutional FTE allocation (physician-reported from HR/department data)
- **Perceived:** What the physician believes the institution expects (8-item survey)
- **Self-Reported Actual:** What the physician reports doing (structured Mak prompts + annual effort report)

### Three-Source Comparison for Trainees
- **Expected:** Rotation schedule + ACGME duty hour limits
- **MedHub Logged:** Weekly self-reported hours + evaluation data
- **Mak-Reported:** Structured activity prompts capturing invisible work not in MedHub

### Why No EHR
1. Eliminates largest institutional adoption barrier (IT governance, HIPAA BAAs — each 6–12 months)
2. Preserves physician-owned data architecture (EHR logs are institutional data)
3. Avoids "pajama time" surveillance anxiety
4. Aligns with how attendings already think about their work (FTE percentages)

---

## 10. Visualization Specifications

| Visualization | Description | Status |
|---|---|---|
| 8×8 Lattice Heat Map | Domains (rows) × Tracks (columns); density + energy + FTE border + star markers + temporal overlay | Partial |
| 2×2 Quadrant Summary | Proportional area chart (OV/OI/SV/SI); the "aha" visualization for onboarding | Missing |
| Trainee Milestone Heatmap | Subcompetency × time (semiannual columns); PGY benchmarks; color = milestone level 1–5 | Missing |
| Well-Being Origami Plot | 7 axes (one per validated dimension); no composite area score; axis-order-invariant | Missing |
| Longitudinal Overlay | Career trajectory T0/T6mo/T1yr lattice snapshots | Missing |

**Origami plot is for well-being ONLY — not the career lattice.**

**Open-Source Tools:** D3.js (BSD), Plotly (MIT), React in-app components.

---

## 11. Data Model (v3)

### Physician Profile Schema
- Identity/context: training stage, setting, specialty/subspecialty, years in practice
- Role composition: % clinical/teaching/research/admin (self-reported)
- FTE: Expected (institutional), Perceived (self-report), Actual (self-report + Mak prompts)
- Goals: 6-month SMART, 1-year SMART+II, 5-year WOOP
- Domain energy ranking (8 domains × 5-point scale)
- Well-being snapshots (tiered: pulse/short/full)
- Career documents (uploaded, parsed, confirmed)
- Mak memory summary (coaching themes, not raw transcripts)
- O*NET SOC code and specialty profile (auto-populated at onboarding)

### Evidence Unit Schema
```typescript
{
  domain: FiscmakDomain,           // 0-7
  track: CareerTrack,              // 0-7
  recognition_quadrant: 'OV' | 'OI' | 'SV' | 'SI',
  time_class: 'past' | 'current' | 'scheduled',
  status: 'proposed' | 'confirmed' | 'dismissed',
  source: 'cv' | 'activity' | 'medhub' | 'milestone' | 'mak',
  transfer_targets: ArtifactType[],
  energy_score: number,
  sentiment: number                // NLP-derived, [-1, +1]
}
```

### Lattice Cell Schema
- Confirmed evidence count and sources
- Energy score (from domain ranking)
- Goal IDs (which goals this cell serves)
- Transfer pathways (SI → OV suggestions)
- FTE discrepancy flag

---

## 12. AI Boundaries

**AI does:** Parse documents, propose mappings, detect patterns, draft career documents, track goals, deliver micro-reflections, prepare coaching briefs, explain why a cell is populated.

**AI does not:** Make promotion decisions, diagnose burnout, prescribe treatment, share individual data without consent, replace human coaching relationships, rank physicians against peers, evaluate physician performance.

**The physician always:** Owns data, confirms every evidence mapping before it populates the lattice, edits every generated document, chooses what to share and with whom.

**Distress flag:** MDT ≥4 in Mak conversation → resource link only. Language: "Some responses suggest you may benefit from speaking with a colleague or wellness resource." Never auto-report.

---

## 13. Governance Model

- All individual data is physician-owned
- Institution receives only aggregate, de-identified data (N ≥ 5 minimum cell)
- Individual Mak conversations are never institution-facing
- Data exportable in standard formats at any time
- Upon account deletion: data deleted within 30 days; physician receives export first

### Safety Concern Protocol
If Mak conversation reveals imminent safety concerns: AI provides crisis resources and encourages disclosure but does not automatically report. Mandatory reporting obligations disclosed in onboarding consent.

---

## 14. Phased Implementation Roadmap

### Phase 0: Foundation (Months 1–3)
- Assemble multidisciplinary steering committee
- Secure institutional buy-in
- Establish data governance and privacy framework
- Select technology stack (all open-source)

### Phase 1: Pilot — Single Department (Months 4–9)
- Recruit 15–20 volunteer physicians (residents, fellows, attendings)
- Deploy: intake module, document upload/parse, lattice visualization, Coach Mak, Output Studio
- O*NET Level 1: auto-populate SOC code; display Work Activities/Skills/Knowledge reference card
- Pair with human coaching (3 sessions over 6 months using R2C2)
- Evaluate: feasibility, acceptability, pre/post PFI, MDT, UWES-9; CV revision rates; goal achievement; evidence confirmation rate

### Phase 2: Refinement & Expansion (Months 10–18)
- Analyze Phase 1 data
- O*NET Level 2: skill similarity vectors; enable F7 with O*NET grounding; hobby bridge prototyping
- Add quadrant/task tags on evidence; transfer pathways UI; NLP v2
- Expand to 2–3 additional departments
- Integrate MedHub data feeds

### Phase 3: Institutional Deployment (Months 19–30)
- Deploy institution-wide with opt-in participation
- O*NET Level 3–4: full F6 (person-occupation fit) with 88-dimension assessment
- Connect to institutional wellness infrastructure
- Train peer coaches
- Publish and disseminate open-source codebase

### Phase 4: Sustainability & Evolution (Months 31+)
- Cross-institutional validation
- Longitudinal career tracking from residency through retirement
- Model retraining
- LLM integration as technology matures

---

## 15. Cost Estimate (Open-Source Stack)

| Period | Estimated Cost | Notes |
|---|---|---|
| Year 1 (pilot, 15–20 physicians) | ~$15,000–30,000 | Primarily personnel time + compute |
| Year 2 (2–3 departments) | ~$50,000–100,000 | Additional departments + coach training |

Infrastructure: Next.js + Supabase ($25/mo) + Vercel ($20/mo) + AI inference (~$0.50–1.50/user/month at pilot scale). All instruments free for research use. O*NET API free.

---

## 16. Evidence Strength Audit

### Tier 1 — Strong (implement immediately)
- Stanford PFI (α=0.90–0.92; validated against MBI in >5,000 physicians)
- Single-item burnout measures (r=0.76–0.83 vs. MBI-EE; AUC 0.94; n>10,000)
- Moral Distress Thermometer (validated in multiple healthcare populations)
- ACGME Milestones 2.0 (national consensus; G=0.60–0.80 with 8–11 assessors)
- Implementation intentions (94 studies; moderate-to-large effect sizes)
- Person-environment fit → burnout/satisfaction (28 studies; 96.4% positive association)
- R2C2 coaching model (validated in residency and faculty settings)
- Professional coaching → burnout reduction (RCT: mean difference -5.2 in EE, p=0.02)
- Peer coaching → PFI improvement (RCT n=138: WE -0.28 vs. +0.28, p=0.02)

### Tier 2 — Moderate (implement with caveats)
- NLP classification of narrative evaluations (AUC 0.75–0.88; single-institution)
- Self-reported FTE (stable year-to-year but varies 49–66% by method)
- MedHub duty hour logs (r=0.86–0.88; underestimates ~7 hrs/wk)
- WOOP/mental contrasting (Hedges' g=0.28; not yet tested in physician career development)
- Perception of time misalignment → intent to leave (OR 2.12; n=8,349)

### Tier 3 — Emerging (research/formative only)
- NLP for CCC rating prediction (limited to surgical specialties)
- BERTopic/LDA for physician narratives (no physician-specific validation)
- Ecological momentary assessment for physician time (single study; n=80)

### Tier 4 — Theoretical (validate before institutional claims)
- 8×8×4 tensor as integrated system (novel; no external validation)
- Formula 5 Recognition Gap ratio as meaningful metric (face validity only)
- Formula 7 Transfer Potential scoring (face validity; O*NET grounding needed)
- Formula 8 Hobby-Profession Bridge (conceptual; no published precedent)
- Lattice density as proxy for career coherence (novel construct)

---

## 17. O*NET Integration (Phase 1 Level 1)

O*NET: free, publicly accessible, US Dept of Labor, 974+ occupational classifications, 277 standardized descriptors. Free API at onetonline.org/developer/.

### Integration Levels by Phase

**Phase 1 (Level 1 — SOC Lookup + Profile Display):**
- Auto-populate physician's specialty SOC code at onboarding (e.g., 29-1223 for Psychiatrists)
- Display O*NET Work Activities, Skills, and Knowledge profile as reference card
- Coach Mak references O*NET descriptors when discussing career domains
- Engineering effort: ~1–2 days (static JSON file + UI card)

**Phase 2 (Level 2 — Skill Similarity):**
- Compute cosine similarity vectors between current specialty and stated career goals
- Enable Formula 7 with O*NET grounding
- Begin hobby-profession bridge prototyping (Formula 8)
- Dawson et al.: 76% accuracy predicting occupational transitions using O*NET skill similarity

**Phase 3+ (Level 3–4 — Full Person-Occupation Fit):**
- Full Formula 6 with 88-dimension assessment (Liu et al., J Applied Psychology 2025)
- Integrating interests, values, skills, knowledge, personality → improved career choice prediction

---

## 18. Specialty-Specific Considerations

### Psychiatry (Pilot Department)
- **High SI density:** Emotional labor, countertransference management, moral distress from involuntary treatment, vicarious trauma — core but rarely captured institutionally
- **Low OV density:** Fewer billable procedures; RVU generation predominantly E/M-based; teaching and supervision central but often unfunded
- **O*NET (SOC 29-1223):** Emphasizes "Assisting and Caring for Others," "Establishing and Maintaining Interpersonal Relationships," "Making Decisions and Solving Problems"
- **ACGME Milestones:** Psychotherapy competence, biopsychosocial formulation, therapeutic alliance — heavily SI/SV quadrant

### Cross-Specialty Applicability
- Domain weights shift by specialty (Systems Thinking more prominent in EM; Scholarship in academic subspecialties)
- Track distributions vary (community internists: Clinician + Quality/Safety; academic subspecialists: Clinician + Researcher + Educator)
- Quadrant distributions differ (procedural specialties: higher OV; cognitive specialties: higher SI)

---

## 19. Ethical Framework

### Core Principles
1. **Physician agency:** Platform is a mirror, not a mandate
2. **Non-maleficence:** No individual data used for promotion decisions or surveillance without consent
3. **Equity awareness:** Platform explicitly names invisible labor disparities by gender, race, and career stage — not to score individuals but to help recognize structural patterns
4. **Transparency:** All AI-generated mappings are provisional until physician-confirmed; system explains every suggestion
5. **Instrument ethics:** Validated instruments for self-awareness and coaching only, not institutional screening

### What the Platform Will Never Do
- Rank physicians against each other
- Generate "fitness for duty" assessments
- Share individual well-being data with supervisors, chairs, or HR without consent
- Use well-being scores as gatekeeping criteria for promotion or privileges
- Replace human coaching relationships with AI-only interactions
- Claim diagnostic or therapeutic function for burnout or mental health conditions

---

## 20. Research Agenda

### Phase 1 Pilot Study Design
- **Design:** Mixed-methods pre-post with qualitative embedded
- **Population:** 15–20 physicians in a single psychiatry department
- **Primary outcomes:** Feasibility (enrollment, retention, engagement); Acceptability (qualitative + SUS)
- **Secondary outcomes:** Pre/post PFI, MDT, UWES-9; CV revision rates; goal achievement; evidence confirmation rate; lattice coverage breadth
- **Duration:** 6 months active + 3-month follow-up
- **Analysis:** Paired t-tests/Wilcoxon for pre-post; thematic analysis for qualitative; descriptive for engagement

### Future Validation Studies
- Construct validity of lattice density as career coherence proxy
- Predictive validity of perception gap for intent to leave
- Convergent validity of domain energy ranking with validated motivation instruments
- Cross-specialty generalizability (minimum 3 specialties, 2 settings)
- Longitudinal resident-to-attending career arc tracking (5-year cohort)

---

## 21. Decision Log

| Decision | Rationale | Status |
|---|---|---|
| Adopt 8×8 tracks (not 8×8×4 as primary UI) | Cognitive load; quadrants as metadata | Confirmed |
| Formula 5 (G) internal only | No validated threshold; risk of reductive interpretation | Confirmed |
| No compensation/productivity layer | Out of scope; institutional economics ≠ physician empowerment | Confirmed |
| 64 SI questions → adaptive Mak probes | Instrument burden; no validation for structured battery | Confirmed |
| Separate trainee vs. attending visualizations (ADR-001) | Different developmental frameworks; shared evidence layer | Confirmed |
| O*NET Level 1 in Phase 1 | Low cost, high value; provides external occupational anchor | Revised (was Phase 2+) |
| No EHR integration | Physician data ownership; deployment speed; surveillance avoidance | Confirmed |
| No composite well-being score | Seven dimensions have distinct clinical meaning | Confirmed |
| Institution sees individual Mak chat | Never — aggregate only with minimum-N rules | Confirmed |
| Ipsative (not normative) lattice | Platform is a mirror, not a ranking system | Confirmed |

---

## 22. Glossary

| Term | Definition |
|---|---|
| FISCMAK | The platform name and AI coaching entity |
| Coach Mak | The AI coaching interface within FISCMAK |
| Lattice | The 8×8 heat map visualization (domains × tracks) |
| Evidence unit | A single confirmed piece of career data mapped to domain, track, and quadrant |
| Reconcile | The physician's act of confirming or dismissing a provisional AI mapping |
| Transfer pathway | A suggested route from an invisible/unrecognized skill to a visible career artifact |
| Domain energy | The physician's self-rated energizing/draining assessment of each career domain |
| Recognition gap (G) | Ratio of invisible to visible evidence (internal metric only) |
| Perception gap (P) | Difference between what physician believes is expected and what is actually allocated |
| OV/OI/SV/SI | Objective-Visible, Objective-Invisible, Subjective-Visible, Subjective-Invisible |
| PFI | Stanford Professional Fulfillment Index |
| MDT | Moral Distress Thermometer |
| SVS | Self-Valuation Scale |
| UWES-9 | Utrecht Work Engagement Scale (9-item) |
| WOOP | Wish Outcome Obstacle Plan (mental contrasting + implementation intentions) |
| R2C2 | Relationship, Reaction, Content, Coaching (feedback model) |
| ADR-001 | Architecture Decision Record for separate trainee visualization |
| SOC | Standard Occupational Classification (O*NET system) |

---

## 23. Summary Statement

FISCMAK operationalizes a single insight: physician careers are multidimensional, but the systems that measure, reward, and develop physicians are each one-dimensional. RVUs see clinical output. Milestones see developmental competency. Promotion criteria see scholarly productivity. Wellness surveys see distress. None sees the whole physician.

The Physician Career Lattice maps the full scope of physician work — visible and invisible, subjective and objective — into a unified framework grounded in validated instruments, ACGME competency standards, occupational science (O*NET), and person-environment fit theory. Coach Mak serves as an AI guide that helps physicians capture, confirm, interpret, and articulate their career evidence — transforming invisible work into recognized contribution and professional dissonance into intentional career navigation.

The platform is designed for the physician to see themselves. Everything else follows from that primary act of recognition.

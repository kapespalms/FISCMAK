# FISCMAK — OpenEvidence handoff & validation roadmap

**Use:** Paste Sections 1–14 into external research AI. Section 15 summarizes OpenEvidence’s May 2026 response.

**Related:** [FISCMAK_INTEGRATED_ARCHITECTURE.md](./FISCMAK_INTEGRATED_ARCHITECTURE.md)

---

## Sections 1–14 — Proposed system (send to OpenEvidence)

See conversation commit or duplicate from integrated architecture. Core points:

- One evidence engine, three audiences, Coach Mak **one entity**
- Baseline + quarterly/six-month/yearly **check-ins** (not “sit-down”)
- Summary confirm — **does this sound right?** — no user scores
- 11-cluster baseline; no instrument sprawl
- PFI 0–4 harmonized; reject RTI, fit %, VOLCANO, parallel batteries
- Institution aggregate only

**Instruction to external AI:**

```text
Cross-reference against published literature. Do not recommend new instruments unless they replace existing ones with lower burden. Do not propose UI redesign or marketing changes. User language must stay plain (no "weather," SOAPO, tier labels).
Prioritize: PFI scale harmonization, mode-effects study, confirmed-only evidence, one Mak thread.
```

---

## Section 15 — OpenEvidence response summary (May 2026)

### Layer ratings (accepted)

| Layer | Rating |
|-------|--------|
| Evidence + confirm gate | Evidence-supported |
| Signal (instruments) | Supported **if** conversational mode validated |
| Interpretation (plain summaries) | Reasonable extrapolation |
| Trainee map | Evidence-supported |
| Attending 8×8 | Design choice — anchor to AAMC domains internally |
| Coach Mak AI | Highest risk — reasonable extrapolation, needs study |
| Output | Reasonable — citation quality key |
| Institution | GME supported; trust requires structural privacy |

### Priority gaps (code — agreed order)

1. **PFI 0–4 everywhere** — quarterly must match onboarding anchors  
2. **Published stems** — scored items verbatim; Mak framing before/after only  
3. **Summary confirm** before `tier3_complete` and before Insights/Plan update  
4. **Confirmed-only lattice** (`status = confirmed`, not scheduled)  
5. **Remove CHS / percentiles** from user UI  
6. **One Mak thread** — not history per SOAP section  
7. **Q-bank dedupe** — skip Q3 burnout when PFI recent  

### Validation studies (before strong claims)

| Study | N | Unblocks |
|-------|---|----------|
| **1 Mode effects** (survey vs Mak, same items) | ~60–80 | Conversational check-in defensible |
| **2 PFI equating** (2 quarterly items ↔ baseline) | Brady method; N~200 if local cal needed | Longitudinal “worse/better since baseline” |
| **3 Reliable change** (4 quarterly waves) | ~100+ | Internal routing thresholds (not user badges) |

**Until Study 2:** say “compared to your last saved summary” — not clinical burnout trajectory.

### Adopt narrowly from prior OpenEvidence

- Brady equating, Q dedupe, mode-effects study, horizon drift as **Mak sentence**, Dyrbye ethics, many-facet Rasch **defer** for eval import

### Reject (confirmed)

RTI, weighted S-Index UI, VOLCANO, 88 O\*NET fit, CBI/BAT/IPIP stack, PROMIS as replacement, user-facing fit scores

### Instrument policy

**No new instruments for MVP.** 11 clusters at upper bound of tolerance.

---

## Claims we will not make (marketing + in-app)

- “Validated conversational PFI” — until Study 1  
- “Burnout trajectory worsened” — until Study 2  
- “We fix burnout” — coaching + visibility only  
- Peer comparison or national benchmarks on wellbeing  

---

## User language note (post–OpenEvidence)

We **removed** user-facing “capacity weather,” “sit-down,” and “validation card.” Use:

- Baseline / quarterly / six-month / yearly **check-in**  
- **Does this summary sound right?**  
- Mak **plain sentences** when work feels heavy — **no dashboard status badge**

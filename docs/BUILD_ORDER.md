# FISCMAK — Build Order

**Version:** 1.0 · **Owner:** Kristen Palmer, MD · **Date:** May 31, 2026
**Purpose:** The sequenced checklist that turns the Master Review (the vision) into buildable slices (tickets). Each line is one scoped task for **one agent on `v3-build`**. Build top to bottom — each slice unblocks the next.

**How to use this:** pick the next unchecked slice → open the named Part in `FISCMAK_Master_System_Review.md` → write a ticket in the AGENTS.md format → hand it to one Claude Code agent → it returns changed files → QA → founder approves merge/migration. Then check the box here.

**Rules (from the Team Charter, every slice):**
- One branch (`v3-build`), one agent at a time, build to spec not beyond.
- Database changes are **founder-gated**: the agent writes the migration, does NOT run it.
- Deploy + merge-to-main + run-migration = founder approves as separate steps.
- Source of truth = the Master Review. Deep math/tables = the Annex.

---

## PHASE 0 — Repo hygiene (do first, unblocks everything)

- [ ] **0.1 Commit the pending `v3-build` edits.** The track/quality_safety/domain work from the May 31 session is uncommitted. Get `v3-build` to a clean committed state. *(No spec ref — just `git status` → review → commit.)*
- [ ] **0.2 Confirm clean build.** `npm run build` passes on `v3-build` before any new work.

---

## PHASE 1 — Foundation: the schema (Track A — unblocks all other tracks)

*Source: Master Review **Part XXIV** (complete data schema) + **Part IV** (lattice structure). Deep ref: Annex §1.*

- [ ] **1.1 Core evidence schema.** `evidence_unit` table: `recognition_quadrant` ENUM(OV/OI/SV/SI), `energy_score` INT(1–5), `sentiment` FLOAT, `transfer_targets` ARRAY, `time_class`. *(Founder-gated migration.)*
- [ ] **1.2 Lattice + ranking tables.** `lattice_cell` (`fte_discrepancy_flag` BOOL, `transfer_potential_score` FLOAT); `energy_rankings` (user_id, domain_index 0–7, rank 1–5, updated_at).
  - **Founder decision 2026-06-01 — energy is two separate concepts:**
    - `energy_rankings` = 1–5 Likert, each domain rated independently (1=very draining, 5=very energizing). This table.
    - 1–8 ordinal force-ranking (most → least energizing) belongs to a future `domain_priority_order` table, built with F6 Person-Occupation Fit. NOT part of this phase.
  - 20260538 had `rank BETWEEN 1–8` (wrong). Corrected by forward migration 20260544 — do not edit 20260538.
- [ ] **1.3 Well-being tables.** `fcwi_responses` (user_id, timestamp, items 1–9, frequency_tier); `weekly_pulse` (ee, dp, qol, mdt, energy_boost_task, energy_drain_task, invisible_flag).
- [ ] **1.4 Goals + narrative.** `goal_records` (4-horizon fields); `narrative_evidence` (domain_index, distress_flag, energy_signal, invisible_work_flag, mak_session_id); `transfer_pathways`.
  - **Founder decision 2026-06-01 — 4 horizons are: 3mo SMART, 1yr SMART+II, 5yr WOOP, 10yr legacy** (Part X).
  - 20260539 had `horizon IN ('6mo','1yr','5yr')` — wrong (6mo→3mo, missing 10yr). Corrected by forward migration 20260550. Do not edit 20260539.
  - `framework` CHECK in 20260539 (`SMART`, `SMART_II`, `WOOP`) does not include `LEGACY` for the 10yr horizon — may need a follow-on ALTER if the app enforces framework per horizon.
- [ ] **1.5 Profile + config.** `riasec_profile` (R,I,A,S,E,C); `onet_fingerprint` (descriptor_vector, adjacent_soc_weights); `specialty_config` (soc_code + 6 JSON cols).
- [ ] **1.6 Confirm fixed track/domain axes** match Master Review Part IV (8 domains, 8 tasks, correct order). *(Resolves the open domain-renumber item.)*

---

## PHASE 2 — Intake & onboarding (Master Review Part XI, first half)

*Source: **Part X** (context vars), **Part V Step 1–2** (SOC), **Part XVI** (setting). Deep ref: Annex Appendix G (SOC×NAICS), Appendix F (setting).*

- [ ] **2.1 Specialty → SOC selector.** Dropdown → auto-assign primary SOC (29-1211…29-1249). Store on profile. *(Annex Appendix G.1 has the full 22-code table.)*
- [ ] **2.2 Setting → NAICS selector.** academic/community/hybrid/government/industry → NAICS + clinical-setting modifier (inpatient/outpatient/hybrid/non-clinical). *(Annex Appendix G.2 + F.)*
- [ ] **2.3 Career-context form.** Stage, subspecialty, role composition (% clinical/teaching/research/admin), years in practice.
- [ ] **2.4 Domain energy ranking.** 8 domains, 1–5 scale → `energy_rankings`.

---

## PHASE 3 — Well-being instruments (Master Review Part VIII — highest-value early win)

*Source: **Part VIII** (canonical FCWI wording), **Part XXIII** (validation). Deep ref: Annex Appendix J.*

- [ ] **3.1 FCWI monthly form.** 9 items, exact Part VIII wording, 0–4 Likert → `fcwi_responses`. **No composite score shown** (governance, Part XIX).
- [ ] **3.2 Weekly pulse form.** 4 items (EE + DP + QoL + MDT) + 2 free-text energy prompts + invisible flag → `weekly_pulse`. MDT ≥4 → resource link, no auto-report.
- [ ] **3.3 Quarterly snapshot flow.** Re-run energy ranking + FTE update + goal review + setting update.

---

## PHASE 4 — Evidence capture & the lattice (Tracks A+C+D)

*Source: **Part XIII** (NLP), **Part IX** (F1), **Part XVII** (visualizations). Deep ref: Annex §4, Appendix K.*

- [ ] **4.1 CV upload + parse.** Upload → Stanza → BioBERT → propose domain/track/quadrant per line → physician confirms/overrides. *(Much of this exists on the branch — verify + finish.)*
- [ ] **4.2 Evidence Density (F1).** `D(q,d,t) = Σ w_s·n` using the Part VII reliability weights.
- [ ] **4.3 8×8 lattice heat map.** Density intensity × energy hue × FTE border × transfer stars (D3). Ipsative.
- [ ] **4.4 2×2 quadrant summary.** Proportional OV/OI/SV/SI area chart — the onboarding "aha."

---

## PHASE 5 — Intelligence formulas (Track C)

*Source: **Part IX**, **Part XV** (seven-gap). Deep ref: Annex Appendix C (composite fit, all weights), Appendix H (gap boundary).*

- [ ] **5.1 F3 Structural Discrepancy** (actual vs expected FTE, setting-normed per Annex F.4).
- [ ] **5.2 F4 Perception Gap.**
- [ ] **5.3 F5 Recognition Gap** (internal only — never shown as a number).
- [ ] **5.4 F7 Transfer Potential.**
- [ ] **5.5 Seven-gap computation** on a stated goal (Part XV table).
- [ ] **5.6 Well-being origami plot** (7 axes, Part XVII.4 — FCWI-based).
- [ ] *Deferred to Phase 2+: F6 Person-Occupation Fit + F8 (the composite vector, Annex Appendix C). Needs O*NET descriptor import first.*

---

## PHASE 6 — Coach Mak (Track B)

*Source: **Part X**. Deep ref: Mak question-framing is the LATER layer — design after the skeleton runs.*

- [ ] **6.1 Goal architecture** (4 horizons: 3mo SMART, 1yr SMART+II, 5yr WOOP, 10yr legacy) → `goal_records`.
- [ ] **6.2 Conversational engine shell** + Mak memory (themes, never raw transcripts).
- [ ] **6.3 Adaptive SI probes** (8–12/domain/yr) → `narrative_evidence`. *(Probe wording = the deferred Mak-interaction work.)*
- [ ] **6.4 Distress detection** (MDT embedded → resource link + pause, no auto-report).

---

## PHASE 7 — Output Studio (Track E)

*Source: **Part XIV** (physician-facing outputs), **Part VI** (Rosetta). Deep ref: Annex Appendix D.*

- [ ] **7.1 CV optimization** (OV evidence by domain + gap detection).
- [ ] **7.2 Invisible-work summary** (OI+SI evidence + F5 framing).
- [ ] **7.3 Promotion dossier / narrative.**
- [ ] **7.4 Career snapshot** (one-page lattice + well-being + goals + FTE).

---

## PHASE 8 — Institutional & trainee layer (Track F — pilot prerequisites)

*Source: **Part XVIII**, **Part XIX** (governance). Deep ref: —*

- [ ] **8.1 MedHub import** (duty hours → F3; evals → NLP; CCC milestones → heatmap). Consent-gated.
- [ ] **8.2 Trainee milestone heatmap** (Part XVII.3) + graduation handoff (shared evidence layer).
- [ ] **8.3 Aggregate dashboard** (N≥5, de-identified; Part XIV institutional views).
- [ ] **8.4 Governance**: data export + 30-day deletion, consent flow w/ mandatory-reporting disclosure, "AI-generated" labels, IRB determination **before recruiting pilot participants**.

---

## Pilot gate (after Phases 1–8)

End-to-end for 15–20 physicians: onboard → energy rank → FCWI → CV → lattice + 2×2 → goal → bridge plan → document output. Targets: NPS ≥40, accuracy ≥3.8/5, ≤15% misrouted evidence. Run PFI/SVS alongside FCWI for concurrent validity (drop at r≥0.75).

---

## Notes on sequence

- **Phase 1 (schema) is the true unblocker** — your Part XXI build plan says "all 6 tracks unblocked once schema is done." Don't start UI before the tables exist.
- **Phase 3 (FCWI) is the fastest visible win** — a 9-item form on top of one table; good first "real thing a physician can use."
- **Mak's question-framing (6.3) is intentionally last** — it depends on every layer beneath it. This is the "add more later" work you flagged.
- Each checkbox = one ticket = one agent session. Don't batch.

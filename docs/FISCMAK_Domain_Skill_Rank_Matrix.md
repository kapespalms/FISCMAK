# FISCMAK — Domain→Skill Rank Matrix (canonical)

**Version:** 1.0 · **Date:** 2026-06-02 · **Owner:** Kristen Palmer, MD
**Status:** CANONICAL reference. Each Career **Domain** (column) ranks all 8 **Skills/Tasks** (1 = most-relevant primary evidence … 8 = least). Ranks **1–3** are that domain's *primary* evidence skills (the top-3 cutoff). Companion machine-readable file: `domain_skill_rank_matrix.json`.

> **Why this exists:** this matrix is the ground truth for *which skills count as primary evidence for which career domain.* It is both (a) the vocabulary target for the DOMAINS/TRACKS un-flip and (b) the oracle the CV parser's domain→skill routing must conform to.

---

## Vocabulary (founder canonical — the un-flip target)

- **DOMAINS** = the 8 career *identities* = the **columns**: Clinician, Educator, Researcher, Administrator/Leader, Advocate, Innovator, Quality/Safety, Wellness Champion.
- **SKILLS / TASKS** = the 8 ACGME-rooted competencies = the **cells/rows**: Clinical Expertise, Medical Knowledge, Practice-Based Learning, Communication, Professionalism & Ethics, Systems Thinking, Collaboration & Teamwork, Personal & Professional Development.
- **The word "TRACKS" is retired.** The model has only Domains and Skills.

> **⚠️ Legacy-code note:** current code still maps `domain_index → SKILLS` and `track_index → DOMAINS` (the historical flip). The in-flight rename aligns code to this vocabulary. **Until then, assert against this matrix by NAME, never by index.**

---

## The matrix

Columns = Career Domains. Rows = rank. Each cell = the Skill at that rank for that domain. The line after rank 3 is the **primary-evidence cutoff**.

| Rank | Clinician | Educator | Researcher | Admin / Leader | Advocate | Innovator | Quality / Safety | Wellness Champion | Refs |
|---|---|---|---|---|---|---|---|---|---|
| **1** | Clinical Expertise | Communication | Medical Knowledge | Systems Thinking | Systems Thinking | Practice-Based Learning | Practice-Based Learning | Personal & Prof. Dev. | [1][2] |
| **2** | Medical Knowledge | Practice-Based Learning | Practice-Based Learning | Collaboration & Teamwork | Professionalism & Ethics | Systems Thinking | Systems Thinking | Collaboration & Teamwork | [1][2] |
| **3** | Communication | Collaboration & Teamwork | Personal & Prof. Dev. | Professionalism & Ethics | Communication | Medical Knowledge | Clinical Expertise | Professionalism & Ethics | [1][2][3] |
| ⎯⎯ | ⎯⎯ *primary cutoff* ⎯⎯ | | | | | | | | |
| **4** | Professionalism & Ethics | Personal & Prof. Dev. | Communication | Communication | Collaboration & Teamwork | Communication | Collaboration & Teamwork | Communication | [1][4] |
| **5** | Collaboration & Teamwork | Clinical Expertise | Clinical Expertise | Practice-Based Learning | Clinical Expertise | Clinical Expertise | Communication | Clinical Expertise | [1][4] |
| **6** | Practice-Based Learning | Medical Knowledge | Collaboration & Teamwork | Clinical Expertise | Medical Knowledge | Collaboration & Teamwork | Professionalism & Ethics | Practice-Based Learning | [1][5] |
| **7** | Systems Thinking | Professionalism & Ethics | Systems Thinking | Medical Knowledge | Practice-Based Learning | Professionalism & Ethics | Medical Knowledge | Systems Thinking | [1][5] |
| **8** | Personal & Prof. Dev. | Systems Thinking | Professionalism & Ethics | Personal & Prof. Dev. | Personal & Prof. Dev. | Personal & Prof. Dev. | Personal & Prof. Dev. | Medical Knowledge | [1][5][3] |

*Validated: every column is a permutation of all 8 skills (each appears exactly once).*

---

## Primary evidence (ranks 1–3) per domain

The top-3 are what a CV line should distribute across when it maps to a domain — base weights ~0.50 / 0.30 / 0.20 before normalization.

| Domain | Primary 1 | Primary 2 | Primary 3 |
|---|---|---|---|
| **Clinician** | Clinical Expertise | Medical Knowledge | Communication |
| **Educator** | Communication | Practice-Based Learning | Collaboration & Teamwork |
| **Researcher** | Medical Knowledge | Practice-Based Learning | Personal & Prof. Dev. |
| **Administrator / Leader** | Systems Thinking | Collaboration & Teamwork | Professionalism & Ethics |
| **Advocate** | Systems Thinking | Professionalism & Ethics | Communication |
| **Innovator** | Practice-Based Learning | Systems Thinking | Medical Knowledge |
| **Quality / Safety** | Practice-Based Learning | Systems Thinking | Clinical Expertise |
| **Wellness Champion** | Personal & Prof. Dev. | Collaboration & Teamwork | Professionalism & Ethics |

---

## Cross-column patterns (what the colors show)

- **Systems Thinking** is the most-shared rank-1 skill — primary for Admin/Leader **and** Advocate, and rank-2 for Innovator and Quality/Safety. It's the connective tissue of the leadership-adjacent domains.
- **Practice-Based Learning** is rank-1 for both Innovator and Quality/Safety and rank-2 for Educator and Researcher — the scholarship/improvement cluster.
- **Communication** sits at rank 4 for most domains — broadly relevant but rarely the *primary* signal except for Educator (1) and Clinician (3).
- **Personal & Professional Development** is rank 8 for six of eight domains — it is its own domain's (Wellness Champion) primary skill but a long-tail skill almost everywhere else.

These shared skills are precisely where career domains connect — the structural basis for transfer-potential (F7) and the lattice's cross-domain reading.

---

## How the parser must conform (assertion contract)

For any CV line the parser routes to a domain `D` with a primary skill `S`:

1. **`S` must be in `primary_skills_by_domain[D]`** (i.e. one of D's rank-1–3 skills). A primary mapping that lands outside the top-3 is a routing error.
2. **Multi-cell spread should favor D's top-3** in roughly rank order (≈0.50 / 0.30 / 0.20 before normalization), never a skill ranked 6–8 as the dominant cell.
3. **Assert by NAME** (full canonical strings in `domain_skill_rank_matrix.json`), not by index, until the DOMAINS/TRACKS rename lands.

A test that walks every static parser mapping and checks rule 1 against the JSON will catch any future flip or mis-route automatically.

---

## References

Numeric refs `[1]–[5]` are the rank-matrix's own source markers as supplied. They are **not yet cross-walked** to the Master Review citation list (R1–R25); reconcile when integrating into `FISCMAK_Master_System_Review.md`.

*Companion: `domain_skill_rank_matrix.json` (machine-readable), `FISCMAK_Intelligence_Layer_Spec.md` (formula context), `FISCMAK_Master_System_Review.md` (Part IV domains, Part IX formulas).*

# FISCMAK Lattice — Confirmed Axis Map (Career Domains × Career Skills)

**Version:** 2.0 · **Owner:** Kristen Palmer, MD · **Date:** May 31, 2026
**Status:** Founder-confirmed reference. This is the *target* skeleton the lattice routing must match.

The lattice is **8 Career Skills/Tasks (rows) × 8 Career Domains (columns)**.

> ⚠️ **Terminology note — the code uses flipped variable names.** What this document (and the founder) calls **Career Domains** is stored in code as `TRACKS`. What this document calls **Career Skills/Tasks** is stored in code as `DOMAINS`. This naming mismatch is the source of prior confusion. The *positions* are correct in code; only the variable names are inverted from the founder's model. Any agent reading the code must apply this mapping:
>
> | Founder term | Code variable |
> |---|---|
> | Career Domains (columns) | `TRACKS` |
> | Career Skills/Tasks (rows) | `DOMAINS` |

A cell = "this **skill/task** (row), exercised within this **career domain** (column)."

---

## Columns — The 8 Career Domains (code: `TRACKS`)

1. Clinician
2. Educator
3. Researcher
4. Administrator / Leader
5. Advocate
6. Innovator
7. Quality / Safety
8. Wellness Champion

## Rows — The 8 Career Skills/Tasks (code: `DOMAINS`)

1. Clinical Expertise
2. Medical Knowledge
3. Practice-Based Learning
4. Communication
5. Professionalism & Ethics
6. Systems Thinking
7. Collaboration & Teamwork
8. Personal & Professional Development

---

## Career Domain → Primary Skills/Tasks (confirmed)

Each career domain (column) concentrates evidence in 3 primary skills/tasks (rows).

| Career Domain (column) | Primary Skills/Tasks (rows) |
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

## Skill/Task → Career Domains that draw on it (inverted view)

| Skill/Task (row) | Career Domains feeding from it (columns) |
|---|---|
| Clinical Expertise | Clinician · Quality/Safety |
| Medical Knowledge | Clinician · Researcher · Innovator |
| Practice-Based Learning | Educator · Researcher · Innovator · Quality/Safety |
| Communication | Clinician · Educator · Advocate |
| Professionalism & Ethics | Administrator/Leader · Advocate · Wellness Champion |
| Systems Thinking | Administrator/Leader · Advocate · Innovator · Quality/Safety |
| Collaboration & Teamwork | Educator · Administrator/Leader · Wellness Champion |
| Personal & Professional Development | Researcher · Wellness Champion |

24 total assignments (8 career domains × 3 skills). Systems Thinking and Practice-Based Learning are the most-shared skills (4 career domains each); Clinical Expertise and Personal & Professional Development the least (2 each).

---

## Open items (not yet resolved)

- **Bug:** `coordinated_complex_care` is stored under the Professionalism skill/task; it belongs under **Clinical Expertise** (care coordination). Fix the subcompetency link.
- **Judgment call:** `handled_conflict` — Communication vs. Collaboration & Teamwork (skill/task row).
- **Judgment call:** `supported_distressed_learner` — Administrator/Leader vs. Wellness Champion (career domain column).

*This map is the target. The live ontology routing is being aligned to it on branch `v3-build`. Remember the code's flipped variable names (see note at top).*

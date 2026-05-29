# FISCMAK — Output Studio spec

**Audience:** Product, engineering  
**Status:** May 2026  
**Scope:** Behavior and traceability. **No visual redesign** — existing Output Studio layout stays.

**Related:** [FISCMAK_INTEGRATED_ARCHITECTURE.md](./FISCMAK_INTEGRATED_ARCHITECTURE.md), [FISCMAK_MAK_LANGUAGE_GUIDE.md](./FISCMAK_MAK_LANGUAGE_GUIDE.md)

---

## Purpose

Generate career documents from **facts the physician confirmed** — not from parser guesses or composite scores.

---

## User promise (plain)

> Every important statement in your document comes from something you saved or confirmed in FISCMAK. You can ask Mak where a line came from.

---

## Data rule

- **Input:** `status = confirmed` evidence units + user-approved check-in summaries + confirmed vault rows.  
- **Exclude:** proposed reconcile items, scheduled-only rotations, raw CDI/CHS, unconfirmed CV keywords.  
- **O\*NET / Lightcast:** internal vocabulary for pivot wording only — never SOC codes in user PDF.

---

## Flow (existing UI)

1. User picks template (CV update, narrative, biosketch, promotion draft, trainee talking points, etc.).  
2. System builds a **source list** (workpaper — may be backend-only at first).  
3. Generate draft in Lexical editor.  
4. User edits; Mak can explain sources on request.  
5. Export.

---

## Citation model (target)

Each claim in generated text links to:

- `evidence_id` or vault row id  
- `source` (activity, CV, check-in summary, eval import)  
- `when` (date or period)

Prompt instruction (generation):

> Do not invent publications, roles, or metrics. Every bullet must cite an evidence_id from the provided list or be marked [needs source].

**Current drift:** `output-generation.ts` may still pass `CareerHealthView` — remove from physician-facing generation path.

---

## Template tones

| Template | Tone |
|----------|------|
| Promotion / dossier | Factual, evidence-forward |
| Personal statement | Reflective, first person |
| CV refresh | Telegraphic, dates and roles |
| Trainee CCC talking points | User-selected bullets only; optional export |
| Industry pivot | Plain skill language; no O\*NET codes in output |

---

## Coach Mak (one entity)

In Output Studio, Mak is still **the same coach**:

- *“This paragraph draws on three activities you confirmed in March — want to see them?”*  
- Not a separate “document bot.”

---

## Forbidden in generated documents

- Career Health Score, percentiles, PFI values  
- “Level 4 entrustment” from keyword inference  
- Fabricated committee roles or publications  
- Institution surveillance language  

---

## MVP implementation steps

1. Pass confirmed evidence array into `output-generation.ts` context.  
2. Strip `health` / CDI from user-facing generate path.  
3. Add citation IDs in prompt + parse footnotes in export (phase 2).  
4. Mak tool/context: list evidence IDs for selected paragraph.

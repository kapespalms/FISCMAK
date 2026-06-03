# FISCMAK — Output Studio & Institution System: Index

*Entry point for the founder and the builder. Ties together the capture → output → institution artifacts built for the Output Studio. Complements the existing project specs (Invisible Work Capture, Intelligence Layer, etc.).*

---

## The spine, in one line

A physician captures work conversationally with Mak → it's tagged to a **controlled vocabulary** → stored once in **one bank** → rendered into any document (CV, dossier, resume, cover letter) for any **institution route** → and a **de-identified aggregate** gives the institution value on day one.

**One capture, many outputs. Edit once, render anywhere.**

---

## The files & how they connect

**1 · What to capture**
- **`FISCMAK_Psychiatry_Dictionary.xlsx`** — the controlled vocabulary: clinical capture (settings, encounters, diagnoses, procedures) + **CV item types**. The shared layer every document and route maps onto. The LLM maps language → these terms; it does not invent.

**2 · Institution routing**
- **`FISCMAK_Route_Standard.xlsx`** — the base every institution inherits. Routing model, institution registry, **profile slots** (what defines a profile, pointing to the other files), intake checklist, and the generic tracks + evidence rubric.
- **`FISCMAK_Promotion_Reference_CWRU.xlsx`** — the first institution overlay (CWRU). Tracks & standards, evidence-of-excellence rubric, P&T pipeline, required documents, CV structure + formatting, candidate guidance, CAPT tips, NIH biosketch + general dossier templates. *CWRU = Standard + this overlay.*

**3 · Output Studio**
- **`FISCMAK_Output_Studio_Templates.xlsx`** — general CV, industry resume, cover letter; modular **toggleable sections** mapped to the dictionary's CV item IDs.
- **`FISCMAK_Dossier_Blueprint_ClinEd.xlsx`** — clinician-educator dossier: capture→CV-section→dossier-component map, what Mak **drafts vs. assembles**, and the **impact-prompt** bank (role / scholarship / impact).
- **`FISCMAK_Output_Studio_Editor_Spec.md`** — editor engine (**TipTap + Shadcn**, headless, MIT) + the toolbar/tools (format, sections, bank, Mak, compliance, output) + export & page numbering.

**4 · Institution value**
- **`FISCMAK_Institutional_Value_DayOne.md`** — the B2B story from self-report only (no EHR/enterprise): five day-one benefits, the **leadership-pipeline signal** (role–energy fit), the privacy guardrail, and the seven **ethical aggregation rules**.

---

## Data flow

```
Capture (Mak + Dictionary)
        │  tagged to competency domain + CV item type
        ▼
   One bank  (Supabase / Postgres — source of truth)
        ├──────────────► Route (Standard ─ or ─ CWRU overlay)
        │                      ▼
        │                Output Studio (templates + editor)
        │                      ▼
        │                Export  (.docx / PDF, page numbers at render)
        │
        └──────────────► de-identified aggregate ──► Institution value (day one)
```

## Engine stack

- **Brain (intelligence):** LLM — Claude / GPT (classify, draft, edit-with-Mak)
- **Data (the bank):** Supabase / Postgres
- **Editor:** TipTap (MIT, headless) + Shadcn/UI + Tailwind
- **Render / export:** python-docx (Word), WeasyPrint (PDF) — page numbers applied here
- **Research input, *not* the engine:** OpenEvidence (clinical-literature tool)

---

## Pilot scope vs. deferred

**Pilot:** capture → bank → CV + monthly bullets + clinician-educator dossier (CWRU), psychiatry, one track; snapshot editing; ~100-term dictionary.

**Deferred (don't let these block the pilot):** full ATS engine + 8 industry vocabularies; UMLS/SNOMED/vector-DB; EHR / OPPE / MedHub / MIPS integrations; TDABC financial modeling; track-changes/comments; S-Index calibration (needs the validation study); affiliate routes.

---

## Open threads

- **Affiliate routes** — UH / MetroHealth / Cleveland Clinic as thin deltas over CWRU (hospital-specific credentialing + committee labels only).
- **Other specialties' dictionaries** — after psychiatry proves the pattern.
- **Standard Route document tabs** — generic CV/biosketch/dossier already live in the Output Studio + CWRU files; reference, don't duplicate.

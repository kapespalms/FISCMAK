# UH Psychiatry — Rotation Orientation Index

**Program:** UH-CMC Psychiatry Residency (`uh-psych-cmc`)  
**Sources:** UH-CMC Psychiatry Resident Website (Google Sites) + program Google Drive  
**Last updated:** May 2026

---

## Two document layers

| Layer | What it is | FISCMAK storage | Used for |
|-------|------------|-----------------|----------|
| **Orientation** | Google Sites logistics — location, personnel, schedule, pre-rotation checklist | `docs/seeds/uh-rotation-orientations/*.json` | **Mak internal only** — lattice placement, capture/debrief questions, Output Studio framing. Not shown in UI; not auto-disclosed. |
| **Curriculum** | MedHub Goals & Objectives — ACGME milestones, competency prose | `docs/seeds/uh_curriculum_*.json` | ILP self-ratings, milestone targets, capture tags |

Residents **do not upload** orientation or curriculum docs during onboarding. These are **program seeds** loaded automatically when a resident's current rotation matches.

---

## Google Drive drop (May 2026)

| Resource | URL | Status |
|----------|-----|--------|
| Rotation documents folder | [Drive folder](https://drive.google.com/drive/u/0/folders/1hpjktsa94DusKYYWs8e0eVtMoBMrfvlG) | Pending — export DOCX/PDF to repo |
| CL/MPU Rotation Syllabus | [Google Doc](https://docs.google.com/document/d/1O7m1WHIlSUvp4h1-DvzgfP_WsHiuMxoj/edit) | Linked to `cl` + `mpu_cl` seeds; export when ready |
| Drive file | [1ugI-d7zIX…](https://drive.google.com/file/d/1ugI-d7zIXnWH5jnMKptDyC_CYo64C2HJ/view) | **Identify rotation** |
| Drive file | [1bSe1jR0…](https://drive.google.com/file/d/1bSe1jR0qEDFNwHiBCdob4j46KaiATNf6/view) | **Identify rotation** |
| Drive file | [1_rQtVZp…](https://drive.google.com/file/d/1_rQtVZpXbKKh2IyQs8jDxO2ci4ja3Cnv/view) | **Identify rotation** |
| Drive file | [1tTuFQ22…](https://drive.google.com/file/d/1tTuFQ22NjDKnyQwUnMHjKgB0hcwN0gxe/view) | **Identify rotation** |
| Drive file | [1mpf6cvz…](https://drive.google.com/file/d/1mpf6cvzvX7SSYgYxgg_2vA0YO5Bftdfd/view) | **Identify rotation** |

**Next step:** For each Drive file, reply with rotation name (e.g., "Psych ED handbook") and we'll map it in `index.json` and ingest any curriculum milestones.

---

## Rotation catalog (25 Google Site pages)

| Status | Rotation | Code | Orientation seed | Curriculum seed |
|--------|----------|------|------------------|-----------------|
| ✅ | Consult-Liaison Psychiatry | `cl` | `cl.json` | — |
| ✅ | Med-Psych Unit (MPU) | `mpu_cl` | `mpu_cl.json` | — |
| ✅ | Inpatient VA (CT6) | `va_ct6` | `va_ct6.json` | `uh_curriculum_inpatient_psychiatry.json` |
| ✅ | Inpatient UH Concord | `uh_concord` | `uh_concord.json` | pending |
| ✅ | Inpatient Northcoast | `northcoast` | `northcoast.json` | pending |
| ✅ | Inpatient CAPU | `capu` | `capu.json` | pending |
| ✅ | Call | `call` | `call.json` | — |
| ✅ | Neurology | `neurology` | `neurology.json` | — |
| ⏳ | Inpatient SWG | `swg` | pending | pending |
| ✅ | Emergency Psychiatry (VA PGY1) | `psych_ed_uh_va` | `psych_ed_va.json` | pending |
| ✅ | Outpatient Child Clinics | `outpatient_child` | `outpatient_child.json` | pending |
| ✅ | Medical Toxicology | `medtox` | `medtox.json` | — |
| ⏳ | Addiction | `outpatient_addiction` | pending | pending |
| ⏳ | Geriatric (SWG) | `geriatric_psychiatry` | pending | pending |
| ⏳ | Interventional Psychiatry | `uh_interventional` | pending | pending |
| ⏳ | Access Clinic | `access_clinic` | pending | pending |
| ⏳ | Psychotherapy Clinic | `psychotherapy_clinic` | pending | pending |
| ⏳ | Outpatient Adult Clinics | `outpatient_adult` | pending | pending |
| ⏳ | Extra Duty | `extra_duty` | pending | — |
| ✅ | Internal Medicine (VA Wards) | `va_im` | `va_im.json` | CWRU IM learning objectives |
| ⏳ | Internal Medicine (UH) | `uh_im` | pending | pending |
| ⏳ | Emergency Medicine (UH) | `uh_ed` | pending | pending |
| ⏳ | Emergency Medicine (VA UCC) | `va_ed_im` | pending | pending |
| ⏳ | Emergency Medicine (Rainbow) | `peds_ed` | pending | pending |
| ⏳ | Medical Toxicology | `medtox` | pending | pending |
| ✅ | Electives (master catalog — 62 options) | `elective` | `elective.json` + `elective_catalog.json` | — |

Machine-readable manifest: `docs/seeds/uh-rotation-orientations/index.json`  
Loader: `src/lib/v2/programs/rotation-orientation.ts`

---

## Institutional onboarding flow

1. Resident joins via `/join/uh-psychiatry` → `?program=uh-psych-cmc`
2. Enters **trainee initials** → block schedule auto-fills PGY + current rotation
3. **Profile step** — rotation dropdown uses registry codes above
4. **Documents step** — resident uploads **their** CV, ILP, evals (not program rotation docs)
5. **Coach Mak** — `buildTraineeProgramBackgroundForMak()` injects rotation context into system prompts only (never user-facing copy)
6. **Rotation debrief** — Mak uses orientation debrief question bank adaptively; resident sees standard 3-layer debrief intro only
7. **Career lattice** — capture tags map to suggested domain×track placements when classifying activities
8. **Output Studio** — AI generation prompt includes Mak background for ILP, career narrative, CV bullets (not clipboard prefill)

---

## Ingesting a new rotation doc

1. Export Google Doc/DOCX to repo (`docs/seeds/source/` or paste content)
2. Create `docs/seeds/uh-rotation-orientations/{code}.json` from Google Site structure
3. If MedHub curriculum exists, create `docs/seeds/uh_curriculum_{service}.json` (see inpatient template)
4. Update `index.json` status → `seeded`
5. Optional: add rows to `docs/seeds/examples/uh_rotation_milestone_targets_long.csv`

---

## Priority for pilot cohort (2026–27)

Based on common PGY-1/2 blocks on the 2026–27 schedule:

1. **VA CT6** + **UH Concord** + **SWG** — core inpatient (SWG orientation next)
2. **CL** + **MPU** — high consult volume; syllabus already linked
3. **Psych ED / Call** — eval cadence pain point (56% faculty feedback satisfaction in APE)
4. **Neurology** + **IM** — off-service blocks with distinct workflows

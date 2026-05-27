# UH Psychiatry MVP — Pilot Status

**Branch:** `cursor/mvp-app-foundation`  
**Last updated:** May 2026

---

## Ready for pilot

| Area | Status | Notes |
|------|--------|-------|
| Institutional onboarding | ✅ | `/join/uh-psychiatry`, roster initials, program contacts |
| Residency + education hubs | ✅ | 25 rotation seeds, call schedule, staff directory UI |
| Staff contact routing | ✅ | Chief residents → Melvyna Williams; education chief → APD |
| Coach Mak capture | ✅ | Activity classification, rotation-aware context |
| Dashboard (trainee) | ✅ | Touchpoints, goals, schedule calendar |
| Output Studio | ✅ | CV, narrative, ILP-oriented templates |
| Documents workspace | ✅ | CV upload + Mak drafts |
| MedHub CSV import API | ✅ | `POST /api/v1/programs/uh-psych-cmc/imports/csv` |
| MedHub sync status API | ✅ | `GET/POST …/imports/medhub/sync` — logs runs; CSV fallback for pilot |
| Pre-CCC summary API | ✅ | `GET …/residents/:userId/pre-ccc` — includes PRITE when imported |
| Pre-CCC batch (cohort) | ✅ | `GET …/pre-ccc/batch` + **Export cohort PDF** in KP Admin |
| Pre-CCC PDF export | ✅ | Per-trainee in Output Studio; batch multi-page PDF for coordinator |
| NLP narrative synthesis v1 | ✅ | Rule-based themes + quotes in pre-CCC |
| Cohort milestone heatmap | ✅ | `GET …/cohort/dashboard` — KP Admin (MedHub 14 / all 21 toggle) |
| Trainee milestone heatmap | ✅ | Output Studio — MedHub 14 subcompetencies |
| PRITE import | ✅ | `POST …/exams/import` + example CSV; surfaced in pre-CCC + PDF |
| KP Admin GME panel | ✅ | Full PD/coordinator workflow |
| Trainee pre-CCC card | ✅ | Output Studio for institutional users |
| Milestone self-rating + discrepancy | ✅ | 21 psychiatry subcompetencies |
| ILP draft-from-gaps + PD approval | ✅ | Trainee draft → PD approve |
| Coordinator prep-time survey | ✅ | KP Admin in-app form |
| Pilot profile seeder | ✅ | `npm run db:seed-mak-profile` |
| User API metric hygiene | ✅ | Career Health Score / CRI stripped |

---

## Run pilot locally

```bash
npm run db:migrate
npm run db:invite-tokens
npm run dev
```

1. Seed resident → import MedHub CSV + optional PRITE CSV in KP Admin
2. Resident → Output Studio → heatmap, self-ratings, ILP draft, pre-CCC PDF
3. PD → cohort heatmap, batch pre-CCC + cohort PDF, approve ILP goals
4. Coordinator → prep-time survey after mock CCC

---

## Still open (post-MVP)

| Item | Spec ref |
|------|----------|
| MedHub live API pull (credentials + fiscmak-admin connector) | H8 |
| LLM narrative synthesis (replace rule-based v1) | H7 follow-up |
| Cohort equity alerts with n≥5 guardrail | C4 follow-up |

---

## Acceptance criteria (psychiatry pilot)

- [x] PD can import MedHub CSV and see quality report
- [x] Pre-CCC PDF export before mock CCC (trainee + cohort batch)
- [x] PRITE scores visible in pre-CCC summary for PD
- [x] Trainee self-rating + discrepancy vs imported evals
- [x] ILP drafted from gaps; PD approves goals
- [x] No Career Health Score / CRI in trainee analytics API
- [x] Coordinator prep-time survey (in-app)
- [x] Cohort milestone heatmap for PD/coordinator

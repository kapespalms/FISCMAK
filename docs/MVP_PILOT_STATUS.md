# UH Psychiatry MVP — Pilot Status

**Branch:** `cursor/mvp-app-foundation`  
**Last updated:** May 2026

---

## Ready for pilot

| Area | Status | Notes |
|------|--------|-------|
| Institutional onboarding | ✅ | `/join/uh-psychiatry`, roster initials, program contacts |
| Residency + education hubs | ✅ | 25 rotation seeds, call schedule, staff directory UI |
| Coach Mak capture | ✅ | Activity classification, rotation-aware context |
| Dashboard (trainee) | ✅ | Touchpoints, goals, schedule calendar |
| Output Studio | ✅ | CV, narrative, ILP-oriented templates |
| Documents workspace | ✅ | CV upload + Mak drafts |
| MedHub CSV import API | ✅ | `POST /api/v1/programs/uh-psych-cmc/imports/csv` |
| Pre-CCC summary API | ✅ | `GET …/residents/:userId/pre-ccc` |
| Pre-CCC batch (cohort) | ✅ | `GET …/pre-ccc/batch` — KP Admin |
| Pre-CCC PDF export | ✅ | Output Studio → Export PDF |
| NLP narrative synthesis v1 | ✅ | Rule-based themes + quotes in pre-CCC |
| KP Admin GME panel | ✅ | CSV import, batch pre-CCC, ILP approval, survey |
| Trainee pre-CCC card | ✅ | Output Studio for institutional users |
| Milestone self-rating + discrepancy | ✅ | Output Studio — 21 psychiatry subcompetencies |
| ILP draft-from-gaps | ✅ | `POST /api/v1/trainee/ilp/draft-from-gaps` |
| PD ILP approval | ✅ | `POST …/ilp/:goalId/approve` |
| Coordinator prep-time survey | ✅ | KP Admin → pilot survey form |
| Pilot profile seeder | ✅ | `npm run db:seed-mak-profile -- --email … --initials …` |
| User API metric hygiene | ✅ | Career Health Score / CRI stripped from analytics API |

---

## Run pilot locally

```bash
npm run db:migrate
npm run db:invite-tokens   # if invite tokens missing
npm run dev
```

1. Sign up resident → `node scripts/seed-mak-profile.mjs --email … --initials YD`
2. KP Admin → import MedHub CSV → load batch pre-CCC + approve ILP goals
3. Resident → Output Studio → CCC prep + milestone self-ratings + ILP draft
4. Coordinator → KP Admin → submit prep-time survey after mock CCC

---

## Still open (post-MVP)

| Item | Spec ref |
|------|----------|
| MedHub live API sync | H8 |
| Chief resident emails / remaining division contacts | Ops |
| LLM-powered narrative synthesis (replace rule-based v1) | H7 follow-up |
| Cohort milestone heatmap dashboard | C4 |

---

## Acceptance criteria (psychiatry pilot)

- [x] PD can import MedHub CSV and see quality report (KP Admin)
- [x] Pre-CCC PDF export before mock CCC
- [x] Trainee 21-subcompetency self-rating + discrepancy vs imported evals
- [x] ILP drafted from gaps; PD approves goals
- [x] No Career Health Score / CRI in trainee analytics API
- [x] Coordinator prep-time survey (in-app)

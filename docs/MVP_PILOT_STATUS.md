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
| Pre-CCC PDF export | ✅ | Output Studio → Export PDF |
| KP Admin GME panel | ✅ | `/app/kp-admin` — CSV upload + pre-CCC preview |
| Trainee pre-CCC card | ✅ | Output Studio for institutional users |
| Milestone self-rating + discrepancy | ✅ | Output Studio — 21 psychiatry subcompetencies |
| ILP draft-from-gaps | ✅ | `POST /api/v1/trainee/ilp/draft-from-gaps` |
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
2. KP Admin → import MedHub CSV → load pre-CCC for trainee UUID
3. Resident → Output Studio → CCC prep snapshot + milestone self-ratings + ILP draft

---

## Still open (post-MVP)

| Item | Spec ref |
|------|----------|
| PD ILP goal approval workflow | H6 follow-up |
| NLP narrative synthesis on evals | H7 |
| MedHub live API sync | H8 |
| Chief resident emails / remaining division contacts | Ops |
| Coordinator prep-time survey | Manual |

---

## Acceptance criteria (psychiatry pilot)

- [x] PD can import MedHub CSV and see quality report (KP Admin)
- [x] Pre-CCC PDF export before mock CCC
- [x] Trainee 21-subcompetency self-rating + discrepancy vs imported evals
- [x] ILP drafted from gaps (PD approval workflow deferred)
- [x] No Career Health Score / CRI in trainee analytics API
- [ ] Coordinator prep-time survey (manual)

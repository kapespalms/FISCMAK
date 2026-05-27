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
| KP Admin GME panel | ✅ | `/app/kp-admin` — CSV upload + pre-CCC preview |
| Trainee pre-CCC card | ✅ | Output Studio for institutional users |
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
3. Resident → Output Studio → CCC prep snapshot

---

## Still open (post-MVP)

| Item | Spec ref |
|------|----------|
| 22-subcompetency self-rating UI + discrepancy overlay | H3 |
| ILP draft-from-gaps wizard | H6 |
| NLP narrative synthesis on evals | H7 |
| MedHub live API sync | H8 |
| Pre-CCC PDF export | H5 follow-up |
| Merge `cursor/mvp-app-foundation` → `main` | Release |

---

## Acceptance criteria (psychiatry pilot)

- [x] PD can import MedHub CSV and see quality report (KP Admin)
- [ ] All PGY levels have pre-CCC PDF before mock CCC (JSON view only today)
- [ ] Trainee 22-subcompetency self-rating + discrepancy
- [ ] ILP drafted from gaps; PD approves goals
- [x] No Career Health Score / CRI in trainee analytics API
- [ ] Coordinator prep-time survey (manual)

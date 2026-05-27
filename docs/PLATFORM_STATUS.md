# FISCMAK Platform Status

**Branch:** `cursor/mvp-app-foundation` (pilot-ready)  
**Last updated:** May 2026

Master checklist for the full platform — not just the UH Psychiatry pilot.

---

## ✅ Pilot-ready (UH Psychiatry GME)

See `docs/MVP_PILOT_STATUS.md` for detail. All acceptance criteria checked.

| Track | Status |
|-------|--------|
| Institutional onboarding + staff directory | ✅ |
| MedHub CSV import + sync status API | ✅ |
| Pre-CCC (single, batch, PDF, PRITE) | ✅ |
| Milestone self-rating + discrepancy | ✅ |
| ILP draft + PD approval | ✅ |
| Cohort + trainee heatmaps | ✅ |
| Coordinator prep-time survey | ✅ |
| KP Admin GME panel | ✅ |

---

## 🚀 Release (do before production pilot)

| Task | Status |
|------|--------|
| Merge `cursor/mvp-app-foundation` → `main` | ⬜ Open PR |
| Run `npm run db:migrate` on production Supabase | ⬜ |
| Set production env vars (Supabase, Anthropic, optional MedHub) | ⬜ |
| End-to-end dry-run with real CSVs | ⬜ |
| Vercel / hosting deploy from `main` | ⬜ |

---

## 🔧 GME institutional (post-pilot)

| Task | Status | Notes |
|------|--------|-------|
| MedHub live API pull | ⬜ | Stub + run logging; needs fiscmak-admin connector |
| LLM narrative synthesis | ⬜ | Rule-based v1 shipped |
| Longitudinal heatmap (subcompetency × semiannual periods) | ⬜ | Single period today |
| Other specialty milestone seeds | ⬜ | Psychiatry only (21 subs) |
| EPA / SIMPL / faculty pulse | ⬜ | Spec only |
| `reporting_periods` table | ⬜ | Pilot uses `"current"` text |
| Cohort equity alerts | ✅ | n≥5 guardrail in cohort dashboard |

---

## 👨‍⚕️ Attending / legacy physician product

| Task | Status | Notes |
|------|--------|-------|
| Career Health Score removed from user dashboard | ✅ | KP Admin preview only |
| Trainee analytics API metric hygiene | ✅ | CRI/CHS stripped |
| Attending analytics — wellbeing slices only | ✅ | Via `sanitizeCareerHealthForUser` |
| 8×8 lattice Phase 1 | ✅ | Activity + energy; API-driven |
| Demo lattice fallback | ✅ | Removed from app; dead code in `demo-data.ts` |
| Full ipsative intensity algorithm (ADR-002) | ⬜ | Backlog |
| CV regex s-index → activity s-index | ⬜ | |
| PFI-16 / UWES-9 formal instruments | ⬜ | Partial |
| Career Data vault UI | ⬜ | Schema exists |
| Jobs marketplace | ⬜ | Scaffold |
| Stripe / B2B program licensing | ⬜ | Scaffold |
| PD/institutional marketing copy | ⬜ | Attending-focused today |

---

## 📚 Docs hygiene

| Doc | Status |
|-----|--------|
| `MVP_PILOT_STATUS.md` | ✅ Current |
| `PLATFORM_STATUS.md` | ✅ This file |
| `MVP_GME_BACKEND_SPEC.md` | ✅ Updated header |
| `FISCMAK_PRODUCT_REVIEW_MASTER.md` | ✅ GME rows updated |
| `README.md` | ✅ GME pilot section |
| `PILOT_RESIDENT_SETUP.md` | ✅ Full flow |

---

## Recommended sequence

1. **Merge PR** → production migrate → dry-run
2. **MedHub live connector** when credentials available
3. **Attending product polish** (vault, jobs) in parallel with pilot feedback
4. **LLM narratives + longitudinal heatmap** after first mock CCC

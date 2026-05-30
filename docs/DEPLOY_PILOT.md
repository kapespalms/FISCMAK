# Production pilot deployment

Deploy the UH Psychiatry GME pilot after merging `cursor/mvp-app-foundation` → `main`.

## 1. Merge and deploy

```bash
git checkout main && git pull
# merge PR #2 or: git merge cursor/mvp-app-foundation
git push origin main
```

Deploy via Vercel (or your host) from `main`.

## 2. Environment variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Client auth |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Staff ILP approve, sync logging |
| `DATABASE_URL` | Yes | `npm run db:migrate` |
| `ANTHROPIC_API_KEY` | Recommended | Coach Mak + LLM narrative synthesis |
| `MEDHUB_API_URL` | Optional | Live MedHub pull (CSV fallback always works) |
| `MEDHUB_API_KEY` | Optional | MedHub bearer token |
| `NARRATIVE_SYNTHESIS_LLM` | Optional | Set `false` to force rule-based narratives |

Copy from `.env.local.example` and fill production values.

## 3. Database migrations

```bash
npm run db:migrate
```

Verifies tables: `evaluation_imports`, `rotation_evaluations`, `milestone_self_ratings`, `ilp_goals`, `in_training_exams`, `medhub_sync_runs`, `pilot_coordinator_surveys`.

Also creates the **`user-documents` storage bucket** (required for PDF/DOCX upload). Confirm:

```bash
npm run db:verify
```

You should see `✓ storage bucket user-documents`. Without it, CV upload fails with “Bucket not found”.

## 4. Pilot validation

```bash
npm run pilot:dry-run
npm run build
```

## 5. Seed first resident

```bash
npm run db:seed-mak-profile -- --email resident@example.com --initials YD --name "Pilot Resident"
```

## 6. Smoke test checklist

- [ ] **Login** — `/login` with pilot account
- [ ] **Document upload** — onboarding or `/app/objective` → upload a `.pdf` or `.docx` CV (must succeed before cohort onboarding)
- [ ] `/join/uh-psychiatry` — institutional signup
- [ ] `/app/kp-admin` — MedHub CSV import, cohort heatmap, batch PDF
- [ ] `/app/output` — trainee pre-CCC, self-ratings, ILP draft
- [ ] Coordinator prep-time survey submit

## 7. Rollback

Revert deploy to previous Vercel deployment. Database migrations are additive — no destructive rollback required for pilot.

# UH Psychiatry — Pilot Resident Setup

Seed a resident profile after they sign up (auth.users row must exist first).

## 1. Sign up

Resident creates account at `/signup` or joins via `/join/uh-psychiatry?token=…`.

## 2. Seed profile from roster

```bash
npm run db:migrate
node scripts/seed-mak-profile.mjs --email resident@example.com --initials YD --name "Your Name"
```

**What it sets:**

- `app_users` — PGY, rotation, institutional onboarding metadata, tier 1/2/3 complete
- `program_memberships` — trainee role on `uh-psych-cmc`
- `career_assessments` — touchpoint 1 answers
- Invite token marked used (when roster slot matches)

## 3. Verify in app

- Dashboard loads without onboarding redirect
- `/app/residency/contacts-calendars#staff-directory` — program contacts
- `/app/residency/call-schedule` — CMC call grid
- `/app/output` — pre-CCC, milestone self-rating, ILP draft, trainee heatmap

## 4. MedHub + PRITE import (PD/coordinator)

Open `/app/kp-admin` or use API:

**MedHub CSV:**

```bash
# Example: docs/seeds/examples/uh_medhub_outpatient_eval_wide.csv
POST /api/v1/programs/uh-psych-cmc/imports/csv
```

**PRITE scores:**

```bash
# Example: docs/seeds/examples/uh_prite_scores_wide.csv
POST /api/v1/programs/uh-psych-cmc/exams/import
```

**Pre-CCC summary:**

`GET /api/v1/programs/uh-psych-cmc/residents/{userId}/pre-ccc?period=current`

**Cohort batch + PDF:** KP Admin → Load cohort summaries → Export cohort PDF

**Cohort heatmap:** KP Admin → Milestone heatmap panel

## 5. Mock CCC flow

1. Resident completes milestone self-ratings → drafts ILP from gaps
2. PD approves ILP goals in KP Admin
3. Coordinator submits prep-time survey in KP Admin
4. Export pre-CCC PDFs for CCC meeting

## Requirements

- `.env.local` with `DATABASE_URL` or Supabase pooler
- Migrations applied: `npm run db:migrate`
- Initials must exist in `docs/seeds/psychiatry_uh_2026_2027_block_schedule.json`

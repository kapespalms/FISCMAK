# UH Psychiatry — Pilot Resident Setup

Seed a resident profile after they sign up (auth.users row must exist first).

## 1. Sign up

Resident creates account at `/signup` or joins via `/join/uh-psychiatry?token=…`.

## 2. Seed profile from roster

```bash
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

## 4. MedHub CSV import (PD/coordinator)

```bash
curl -X POST http://localhost:3000/api/v1/programs/uh-psych-cmc/imports/csv \
  -H "Cookie: …" \
  -H "Content-Type: application/json" \
  -d '{"file_name":"uh_medhub_outpatient_eval_wide.csv","csv_text":"…"}'
```

Example CSV: `docs/seeds/examples/uh_medhub_outpatient_eval_wide.csv`

Pre-CCC summary:

`GET /api/v1/programs/uh-psych-cmc/residents/{userId}/pre-ccc?period=current`

## Requirements

- `.env.local` with `DATABASE_URL` or Supabase pooler
- Migrations applied: `npm run db:migrate`
- Initials must exist in `docs/seeds/psychiatry_uh_2026_2027_block_schedule.json`

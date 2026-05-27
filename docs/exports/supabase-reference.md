# FISCMAK Supabase Reference

Generated for project handoff. **Do not commit real keys to git.**

## Project

| Field | Value |
|-------|--------|
| **Project ref** | `qnskxioqsgnkkuyalqcn` |
| **API URL** | `https://qnskxioqsgnkkuyalqcn.supabase.co` |
| **Dashboard** | https://supabase.com/dashboard/project/qnskxioqsgnkkuyalqcn |
| **SQL Editor** | https://supabase.com/dashboard/project/qnskxioqsgnkkuyalqcn/sql |
| **Table Editor** | https://supabase.com/dashboard/project/qnskxioqsgnkkuyalqcn/editor |
| **API Settings** | https://supabase.com/dashboard/project/qnskxioqsgnkkuyalqcn/settings/api |
| **Database Connect** | https://supabase.com/dashboard/project/qnskxioqsgnkkuyalqcn/settings/database |

## Local env (`.env.local`)

Copy from `.env.local.example`. Required for the app:

```env
NEXT_PUBLIC_SUPABASE_URL=https://qnskxioqsgnkkuyalqcn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon public key from Dashboard → Settings → API>
# or
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable key>

SUPABASE_SERVICE_ROLE_KEY=<service role — server only, never expose to client>

# Migrations / scripts
SESSION_POOLER_URL=postgresql://postgres.qnskxioqsgnkkuyalqcn:<PASSWORD>@aws-1-us-east-1.pooler.supabase.com:5432/postgres
DATABASE_URL=postgresql://postgres:<PASSWORD>@db.qnskxioqsgnkkuyalqcn.supabase.co:5432/postgres
```

Keys live in **your local** `/Users/kristenpalmer/fiscmak/.env.local` (not in git).

## Apply schema

```bash
cd /Users/kristenpalmer/fiscmak
npm run db:migrate    # applies migrations in order
npm run db:verify     # checks expected tables
```

### Migration order (via `scripts/apply-supabase-migrations.mjs`)

1. `docs/FISCMAK_V2_SCHEMA.sql` — base V2 schema
2. `docs/migrations/20260521_touchpoint1_onboarding.sql`
3. `docs/migrations/20260521_career_data_schema.sql`
4. `docs/migrations/20260522_activity_entries_v2.sql`
5. `docs/migrations/20260523_specialty_hierarchy.sql`
6. `docs/migrations/20260523_core_ontology.sql`
7. `docs/migrations/20260523_signal_detection.sql`
8. `docs/migrations/20260523_activity_entries_extended.sql`
9. `docs/migrations/20260523_career_fit_engine.sql`
10. `docs/migrations/20260524_user_subscriptions.sql`
11. `docs/supabase-auth-bridge.sql` — links `auth.users` → `app_users`
12. `docs/supabase-finish-setup.sql`

Also available: `docs/FISCMAK_SUPABASE_SCHEMA.sql` (alternate/legacy bundle), `docs/supabase-reset.sql` (destructive).

## Live data snapshot (May 2026)

| Table | Rows |
|-------|------|
| `app_users` | 2 |
| `documents` | 4 |
| `activity_entries` | 0 |
| `career_assessments` | 1 |
| `chat_messages` | 2 |
| `profiles` | 2 |
| `ontology_invisible_work_activities` | 14 |
| `signal_indicators` | 39 |
| `user_subscriptions` | 0 |

Primary test account: `fiscmak@outlook.com`

## REST API (from app)

- Browser/client: Supabase JS with **anon/publishable** key (`src/lib/supabase/client.ts`)
- Server routes: `@supabase/ssr` + **service role** for admin (`src/lib/supabase/admin.ts`)

Key app tables: `app_users`, `documents`, `activity_entries`, `career_assessments`, `chat_messages`, `onboarding_metadata` (JSON on `app_users`).

## Ontology export

Full ontology JSON: `docs/exports/ontology-full-export.json`

## Auth redirect (local dev)

- Site URL: `http://localhost:3000`
- Callback: `http://localhost:3000/auth/callback`
- Handler: `src/app/auth/callback/route.ts`

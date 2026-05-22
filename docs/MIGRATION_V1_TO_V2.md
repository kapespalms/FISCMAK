# Migration: V1 SOAP Schema → V2 Platform Schema

## Summary

V2 adopts the Desktop spec data model (`app_users`, `career_assessments`, `jobs`, `pathways`, `mempalace_exports`, etc.). The V1 lattice model (`activity_entries`, `lattice_cells`, …) is **deprecated** and not auto-migrated.

## Steps

1. Run [`FISCMAK_V2_SCHEMA.sql`](./FISCMAK_V2_SCHEMA.sql) in Supabase SQL Editor.
2. Existing auth users receive `app_users` rows via the `on_auth_user_created_v2` trigger (new signups) or manual backfill:

```sql
INSERT INTO app_users (user_id, email)
SELECT id, email FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
```

3. V1 tables may remain in the database but the app no longer writes to them when V2 routes are used.

## Data not migrated

| V1 | V2 equivalent |
|----|----------------|
| `activity_entries` | Career inventory via documents + assessments TP2 |
| `lattice_cells` | Pathways + promotion domains |
| `career_goals` (V1) | `user_settings.goals` + promotion dossier |
| `subjective-storage` (localStorage) | Assessments TP3 + analytics burnout trend |
| `mak-conversations` (localStorage) | `chat_messages` table |

Optional: export V1 activities to CSV before decommissioning.

# Migration: V1 SOAP Schema → V2 Platform Schema

## Summary

V2 adopts the Desktop spec data model (`app_users`, `career_assessments`, `jobs`, `pathways`, `mempalace_exports`, etc.). The V1 lattice model (`activity_entries`, `lattice_cells`, …) is **deprecated** and not auto-migrated.

## Steps

1. Run [`FISCMAK_V2_SCHEMA.sql`](./FISCMAK_V2_SCHEMA.sql) in Supabase SQL Editor.
2. Run [`migrations/20260521_touchpoint1_onboarding.sql`](./migrations/20260521_touchpoint1_onboarding.sql) if upgrading an existing V2 install.
3. Run [`migrations/20260521_career_data_schema.sql`](./migrations/20260521_career_data_schema.sql) for the full People–Activities–Metrics–Composites schema (28 domain tables + 8 normative lookup tables + API enrichment pipeline).
4. Existing auth users receive `app_users` rows via the `on_auth_user_created_v2` trigger (new signups) or manual backfill:

```sql
INSERT INTO app_users (user_id, email)
SELECT id, email FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
```

5. V1 tables may remain in the database but the app no longer writes to them when V2 routes are used.

## Career data schema (V2 extension)

The career data schema (`physicians` + 27 related tables) stores:

| Domain | Tables | Purpose |
|--------|--------|---------|
| Identity | `physicians`, `specialty_certifications`, `career_setting`, `identity_verification` | NPI/ORCID, board certs, setting history |
| Scholarly | `publications`, `grants`, `presentations`, `scholarly_metrics` | CV parse + PubMed/OpenAlex/iCite enrichment |
| Clinical | `clinical_productivity`, `scope_of_practice`, `compensation` | wRVUs, SOP Score, compensation trajectory |
| Service/Education | `service_activities`, `educational_activities`, `leadership_positions`, `invisible_work_*` | s-index, IWQ inputs |
| Well-being | `wellbeing_assessments`, `professional_identity`, `career_aspirations` | PFI, BITS, aspirations |
| Industry | `industry_payments`, `industry_positions` | CMS Open Payments, industry roles |
| Composites | `career_development_index`, `invisible_work_quotient`, `lattice_positioning`, `benchmarking_snapshots`, `career_recommendations`, `career_documents` | CDI, 8×8 lattice, AI outputs |
| Pipeline | `api_enrichment_runs`, `reconciliation_items` | CV → API cascade + Mine/Not mine UX |

`physician_id` equals `app_users.user_id` (1:1). TypeScript types: `src/lib/v2/career-data-schema.ts`.

Normative lookup tables (Zaorsky h-index, Killeen SOP, Xierali promotion rates, CDI weight templates) are seeded on migration.

## Data not migrated

| V1 | V2 equivalent |
|----|----------------|
| `activity_entries` | Career inventory via documents + assessments TP2 |
| `lattice_cells` | Pathways + promotion domains |
| `career_goals` (V1) | `user_settings.goals` + promotion dossier |
| `subjective-storage` (localStorage) | Assessments TP3 + analytics burnout trend |
| `mak-conversations` (localStorage) | `chat_messages` table |

Optional: export V1 activities to CSV before decommissioning.

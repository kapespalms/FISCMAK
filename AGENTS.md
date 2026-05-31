<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# FISCMAK agent compass

Use this file as the always-on map. Detailed procedures live in `.cursor/skills/`; heavy delegation in `.cursor/agents/`.

## What FISCMAK is

Two products in one repo:

| Product | Audience | Primary routes |
|---------|----------|----------------|
| **UH Psychiatry GME pilot** | Residents, PDs, coordinators | `/join/uh-psychiatry`, `/app/residency`, `/app/output`, `/app/kp-admin` |
| **Attending career platform** | Individual physicians | `/app/dashboard`, `/app/objective`, `/app/plan`, Coach Mak |

Pilot launch is the current priority. Do not break attending flows while fixing GME.

## Source-of-truth docs

| Topic | Doc |
|-------|-----|
| Deploy + smoke tests | `docs/DEPLOY_PILOT.md`, `docs/RELEASE_CHECKLIST.md` |
| Pilot acceptance | `docs/MVP_PILOT_STATUS.md` |
| Platform backlog | `docs/PLATFORM_STATUS.md` |
| Page boundaries (MECE) | `docs/page-ownership.md` |
| UI copy constraints | `docs/FISCMAK_UI_COPY_CONTRACT.md` |
| Supabase auth/URLs | `docs/SUPABASE_SETUP.md` |
| Agent layer map | `.cursor/README.md` |

## Key code paths

```
src/app/                    Next.js App Router pages + API routes
src/app/api/v1/             BFF JSON API (requireApiUser on protected routes)
src/lib/v2/                 Domain logic (documents, GME, onboarding, Mak)
src/lib/supabase/           Auth client, middleware, server client
docs/migrations/            SQL migrations (must register in scripts/apply-supabase-migrations.mjs)
scripts/                    db:migrate, db:verify, pilot:dry-run, content sync
```

## Critical pipelines

**Evidence Vault (CV upload):**

```text
POST /api/v1/documents/init
  → Supabase Storage bucket `user-documents`
  → browser pdf.js (document-pdf-client.ts)
  → POST /api/v1/documents/{id}/process { client_extracted_text }
  → documents.extracted_text + runCvEnrichmentAfterUpload
```

**GME eval import:** CSV or MedHub API → `evaluation_imports` → cohort heatmaps / pre-CCC.

## When to use which Cursor layer

| Need | Use |
|------|-----|
| Always-on conventions | This file + `.cursor/rules/*.mdc` |
| Repeatable procedure (migrate, smoke test, release) | `/pilot-db-migrate`, `/pilot-smoke-test`, `/release-gates` skills |
| Launch blocker (upload, auth, deploy) | `fiscmak-pilot-launch` subagent |
| GME domain work (MedHub, milestones, pre-CCC) | `fiscmak-gme-domain` subagent |
| Verify a fix without editing | `fiscmak-verifier` subagent (readonly) |
| PR review on open | Cursor Automation (optional, cloud) |

## Hard constraints

- Never commit `.env.local`, secrets, or service role keys.
- New SQL migrations: add file under `docs/migrations/` **and** register in `scripts/apply-supabase-migrations.mjs`.
- Respect page MECE — see `docs/page-ownership.md` before adding UI to a route.
- Only create git commits when the user asks.
- Prefer minimal diffs that unblock real users over architecture debates during pilot.

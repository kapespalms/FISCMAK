<!-- BEGIN:fiscmak-team-rules -->
# FISCMAK — Rules for every agent (read before any work)

These rules come from the FISCMAK Core Team Charter. They are non-negotiable.

1. **One branch.** Work ONLY on `v3-build`. Never create or switch branches unless the Founder explicitly asks. Run `git branch --show-current` and confirm `v3-build` before doing anything.
2. **One vision: the v3 spec** (`fiscmak_v3_spec.docx`). Build to spec — not beyond it. If you think of something not in the spec, FLAG it; do not add it.
3. **Founder approval gate.** NEVER merge to `main`, deploy, or run a database/Supabase migration on your own. These are separate steps the Founder approves. Flag anything that touches auth, user data, RLS policies, or the schema.
4. **Return changed files only**, each with a one-line summary. Don't touch unrelated files or architecture.
5. **One agent at a time.** If you hit a `.git` lock error, STOP and tell the Founder — do not force or delete locks blindly.
6. **Pull before you start; preserve existing patterns** (naming, components, file structure). Smallest change that meets the acceptance criteria.

For each task, output: Interpretation · Implementation Plan · Changed Files · Database Impact · Edge Cases Flagged · QA Checklist (non-developer-testable) · What Was NOT Built.
<!-- END:fiscmak-team-rules -->

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

## v2 / v3 boundary — preventing stale integration

- **v3 features read/write v3 tables:** `evidence_unit`, `lattice_cell`, `fcwi_responses`, `weekly_pulse`, `energy_rankings`, `goal_records`, `narrative_evidence`, `transfer_pathways`, `riasec_profile`, `onet_fingerprint`, `specialty_config`.
- **Do NOT read from or write to v2 tables** (`activity_entries`, `physicians`, etc.) from v3 code UNLESS the ticket explicitly says to reuse one (e.g. the CV parser still uses `activity_entries` — that's deliberate).
- **Before wiring any feature to a table or module, confirm it's the v3 one named in the ticket.** If a v2 path seems needed and the ticket didn't mention it, STOP and flag it — don't integrate it silently.
- **The Master Review is the source of truth for what's current.** If code references something not in the Master Review, treat it as suspect.

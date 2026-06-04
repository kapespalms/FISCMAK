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

<!-- BEGIN:fiscmak-palette-tokens -->
# Locked palette — no red, no neon

The visual palette is LOCKED. White / warm-white base; restrained; muted; never neon, bright, or alarm colors. Before adding ANY color, use these tokens. If a role you need isn't covered here, FLAG it — do not invent a color.

- **Energizing (aliveness)** = `#3C8A60` muted sage — the reserved hero, used sparingly. **NEVER** neon green (`#5FD65F`, `#3BA33B`, etc.).
- **Draining** = `#C28D6C` soft clay. **RED IS BANNED** — never `red-*`, never `#xx0000`. Clay is quiet, not an alarm.
- **THE ONE RED EXCEPTION (founder decision, 2026-06-04):** genuine **crisis / distress / safety surfaces** may use dark red via the `--cx-attention` token (`#9b2c2c`) — e.g., the MDT≥4 escalation banner, crisis-resource prompts. This is *only* for true safety alerts a physician must not miss; never for "draining," errors, or decoration. Everywhere else, red stays banned.
- **Evidence density** = steel ramp `#E6ECF0` → `#C2D0DD` → `#6E93B8` → `#34597A`. **Never** near-black navy (`#143060`) and never royal/bright blue.
- **Value / treasury accent** = gold `#AC8636` (wordmark, primary action, active nav, transfer markers) — the single accent. Muted, not flashy.
- **Neutral / "present but unmarked"** = the muted steel substrate or sand `#E7DEC9` / gray `#9A968C`. **Never amber/`amber-*`.**
- **Ink** `#20201D` · **muted** `#75736C` · **hairline** `#E8E6DF`.

Single source of truth for energy fills = `energyCellClass()` in `src/lib/utils.ts`; for density = `DENSITY_RAMP` in `LatticeHeatmapV3.tsx`. Both must use the tokens above. CVD-safe by construction (green + blue + clay, no red). Red, neon, and amber re-entering the lattice/dashboard is a regression — do not reintroduce.
<!-- END:fiscmak-palette-tokens -->

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
src/lib/v2/lattice/         Parser, document-parser.ts, ontology-bridge.ts, ontology-registry.ts
src/lib/v2/formulas-v3.ts   F1/F3/F4/F5/F7 + SevenGap (Phase 5 complete)
src/components/lattice/     LatticeHeatmapV3 (evidence density × energy, /app/objective?tab=lattice)
src/components/wellbeing/   WellbeingOrigamiPlot (7-axis origami, /app/wellbeing)
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
- **Before integrating any table/module, check `docs/V2_V3_INVENTORY.md`.** Section 3 (superseded) = do NOT use. Section 4 (needs decision) = STOP and ask the founder before wiring v3 code to it.

## Vocabulary un-flip (canonical — commit 7430320, 2026-06-02)

The lattice axis labels were historically inverted in code. The canonical vocabulary now matches the spec everywhere:

| Constant | Meaning | Axis |
|----------|---------|------|
| `SKILLS` (8 items) | Task/competency labels: Clinical Expertise … Personal & Professional Development | **Row axis** |
| `DOMAINS` (8 items) | Career identity labels: Clinician … Wellness Champion | **Column axis** |
| ~~`TRACKS`~~ | **RETIRED.** Never use. |  |

**DB column rename (migration 20260554 — founder-gated, not yet applied):**
- `evidence_unit`, `evidence_cell_weights`, `lattice_cell`: old `domain_index` → `skill_index`; old `track_index` → `domain_index`
- After migration: `skill_index` = task/competency axis (0–7 → SKILLS); `domain_index` = identity axis (0–7 → DOMAINS)
- `energy_rankings`, `goal_records`, `narrative_evidence`: `domain_index` was always the identity axis — **no rename** on these tables
- Code on v3-build already uses the post-rename column names; pipeline:verify will fail until migration is applied

**FISCMAK domain→skill rank matrix:** `docs/domain_skill_rank_matrix.json` is the canonical authority for which skills are primary evidence for which identity domain. Assert by name, not by index.

## Well-being governance (hard rules — Part XIX)

- **NO composite well-being score ever stored or displayed.** `fcwi_responses` has no composite column by design.
- **Plain language only** in physician UI — "FCWI," "EE," "DP," "MDT," "PFI," "MBI" never render.
- **MDT ≥ 4 → resource link + gentle pause; never auto-reported.**
- **Physician-owned at individual level.** Aggregate (N≥5) is institution-facing only.
- **Well-being and career lattice are sibling surfaces, not nested.** Origami plot lives at `/app/wellbeing`; lattice heatmap at `/app/objective`. Do NOT cross-populate.

## Phase status (v3-build, as of 2026-06-02)

Phases 0–5 complete. Phase 6 (Coach Mak) is next.
See `docs/BUILD_ORDER.md` for the authoritative checklist.
Pending founder action: apply migration 20260554 (rename evidence axes) before running `pipeline:verify`.

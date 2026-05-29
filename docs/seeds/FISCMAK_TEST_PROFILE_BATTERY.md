# FISCMAK Test Profile Battery

Layered QA personas for pathway architecture, onboarding, and Coach Mak stage interpretation.

**Staging / local only.** Do not use the shared test password in production or for real physician accounts.

## Setup

1. Add to `.env.local`:

```bash
FISCMAK_TEST_PASSWORD=your-team-test-password
```

2. Provision all profiles (requires Supabase service role + Postgres):

```bash
npm run db:seed-test-profiles
```

Or one profile:

```bash
FISCMAK_TEST_PASSWORD='…' node scripts/seed-test-profile-battery.mjs --username TEST2
```

Dry run (no writes):

```bash
node scripts/seed-test-profile-battery.mjs --all --dry-run
```

## Sign in

- **Demo usernames (no email):** `demo1` through `demo10` + team password (on by default on `/login`)
- **Email:** `{username}@test.fiscmak.local` (e.g. `testgen2@test.fiscmak.local`, `test2@test.fiscmak.local`)
- **Password:** value of `FISCMAK_TEST_PASSWORD` in your `.env.local`

### Quick demo pack (10 accounts)

```bash
FISCMAK_TEST_PASSWORD='…' npm run db:seed-demo-accounts
```

| Username | Persona |
| --- | --- |
| demo1 | PGY-1 · Individual |
| demo2 | PGY-3 · Individual |
| demo3 | Early Career · Individual |
| demo4 | Mid Career · Individual |
| demo5 | Retired · Individual |
| demo6 | PGY-1 · UH Psych |
| demo7 | PGY-2 · UH Psych |
| demo8 | PGY-3 · UH Psych |
| demo9 | MS4 · Individual |
| demo10 | Fellow · Individual |

To hide demo login on `/login`, set `NEXT_PUBLIC_FISCMAK_DEMO_LOGIN=false`.

See `docs/seeds/fiscmak_demo_accounts.json`.

## A. General signup test profiles

No institutional affiliation (`onboarding_path: public`).

| Username | Stage | Formal label | Core system interpretation |
| --- | --- | --- | --- |
| TESTGEN00 | MS3 | Medical Student, Year 3 | Clinical rotations, specialty exploration, early professional identity formation |
| TESTGEN0 | MS4 | Medical Student, Year 4 | Residency applications, interviews, rank list, Match pressure |
| TESTGEN1 | PGY1 | First-Year Resident / Intern | Transition to physician role, supervision, identity shock, clinical responsibility |
| TESTGEN2 | PGY2 | Second-Year Resident | Increasing autonomy, deeper specialty identity, workload adaptation |
| TESTGEN3 | PGY3 | Third-Year Resident | Senior resident development, leadership, teaching, fellowship/job planning depending on specialty |
| TESTGEN4 | PGY4 | Fourth-Year Resident | Advanced resident, chief/fellowship/job transition, board prep depending on specialty |
| TESTGEN5 | PGY5 | Fifth-Year Resident or Fellow-Level Trainee | Long-training specialty, subspecialty development, leadership, transition planning |
| TESTGEN6 | Early Attending | Early-Career Attending (0–7 yr) | First attending role, board certification, contracts, confidence, autonomy |
| TESTGEN7 | Mid-Career Attending | Mid-Career Attending (8–20 yr) | Career leverage, promotion, leadership, reinvention, burnout/meaning |
| TESTGEN8 | Late-Career Attending | Late-Career Attending (20+ yr) | Legacy, mentorship, succession, reduced clinical load, institutional memory |
| TESTGEN9 | Retired | Retired / Emeritus Physician | Legacy, mentorship, consulting, identity transition, portfolio reflection |

## B. Institution-affiliated test profiles

UH Psychiatry program context (`onboarding_path: institutional`, `uh-psych-cmc`).

| Username | Stage | Formal label | Core system interpretation |
| --- | --- | --- | --- |
| TEST00 | MS3 | Medical Student, Year 3 | Institution-linked clinical rotations, specialty coaching, evaluation pressure |
| TEST0 | MS4 | Medical Student, Year 4 | Institution-supported residency application, interviews, rank strategy, Match prep |
| TEST1 | PGY1 | First-Year Resident / Intern | Institution-linked onboarding, milestone development, supervision, transition support |
| TEST2 | PGY2 | Second-Year Resident | Program-based competency growth, increasing autonomy, feedback integration |
| TEST3 | PGY3 | Third-Year Resident | Senior resident development, teaching, leadership, individualized career planning |
| TEST4 | PGY4 | Fourth-Year Resident | Advanced training, board prep, fellowship/job pathway, leadership documentation |
| TEST5 | PGY5 | Fifth-Year Resident or Fellow-Level Trainee | Extended training, subspecialty identity, institutional leadership, transition planning |
| TEST6 | Early Attending | Early-Career Attending (0–7 yr) | Early faculty/staff development, onboarding, mentorship, productivity and promotion systems |
| TEST7 | Mid-Career Attending | Mid-Career Attending (8–20 yr) | Leadership pipeline, promotion readiness, burnout prevention, program-building |
| TEST8 | Late-Career Attending | Late-Career Attending (20+ yr) | Legacy capture, mentorship, succession planning, institutional knowledge |
| TEST9 | Retired | Retired / Emeritus Physician | Legacy portfolio, mentorship, advisory role, continued contribution pathways |

## Mak integration

When a test profile signs in, Coach Mak receives:

- Canonical **test profile interpretation** from `src/lib/v2/test-profile-battery.ts`
- Dynamic **career-stage card** from `src/lib/v2/career-pathway-architecture.ts`
- Existing content-pack, Ibarra, GROW, and MECE layers (unchanged)

Seed data: `docs/seeds/test_profile_battery.json`

## Attending year bands

Product onboarding uses **0–7 / 8–20 / 20+** years post-training (not 0–5 / 5–15 / 15+).

## Related

- [FISCMAK_AI_CAREER_PATHWAY_ARCHITECTURE.md](../FISCMAK_AI_CAREER_PATHWAY_ARCHITECTURE.md)
- [PILOT_RESIDENT_SETUP.md](./PILOT_RESIDENT_SETUP.md)

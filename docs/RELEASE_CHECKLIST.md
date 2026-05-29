# FISCMAK release checklist

Run before every production deploy. See `.env.local.example` for full variable descriptions.

## Quality gates

```bash
npx tsc --noEmit
npm run lint
npm run test
npm run build
```

All four must pass. Lint may report warnings (no errors).

## Required environment variables

| Variable | Required for |
|----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Auth, data persistence |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or `ANON_KEY`) | Client Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side admin writes |
| `ANTHROPIC_API_KEY` | Mak chat + Output Studio AI generation |
| `NEXT_PUBLIC_APP_URL` | Auth redirects, email links |

**Optional (graceful fallback when missing):**

| Variable | Behavior without it |
|----------|---------------------|
| `OPENAI_API_KEY` | Activity classification uses keyword fallback |
| `RESEND_API_KEY` + `RESEND_FROM_EMAIL` | Notifications log-only in dev; contact form still accepts |
| `STRIPE_*` | Premium billing disabled |
| `MEDHUB_API_*` | CSV import only for schedule sync |

## Smoke tests (manual)

- [ ] **Login** → lands on `/app/dashboard` with greeting
- [ ] **Mak panel** — open thread, history loads, send a message, reply appears
- [ ] **Onboarding** — baseline check-in in Mak; summary confirm (“Yes, save this”)
- [ ] **Quarterly / annual** — due banner → Mak flow → summary confirm gate
- [ ] **Output Studio** — generate document; footnotes cite confirmed evidence
- [ ] **Activities** — unconfirmed Mak capture shows “This looks right” confirm
- [ ] **UH residency** — hub, `/app/schedule` tabs, `/app/contacts`, rotation detail, electives catalog
- [ ] **Redirects** — `/app/rotations` → residency hub; `/app/calendar` → schedule blocks tab

## Deploy notes

- Do not commit `.env.local` or secrets.
- Run `npm run db:migrate` when schema migrations ship.
- Without `ANTHROPIC_API_KEY`, Output Studio returns vault prefill (not AI prose) — expected.

# FISCMAK

Career intelligence platform for physicians — 7-touchpoint assessments, Coach Mak with MemPalace memory, job matching, pathways, and promotion toolkit.

Built on Next.js App Router + Supabase Postgres + Claude API (V2 Desktop spec pivot).

## Quick start

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

1. Replace `[YOUR-PASSWORD]` in `DATABASE_URL` with your Supabase database password
2. Paste **anon public** key into `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Dashboard → Settings → API)
3. Optional: set `ANTHROPIC_API_KEY` for full Mak conversations

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Demo mode:** Without Supabase env vars (or with `NEXT_PUBLIC_DEMO_MODE=true`), sign in/sign up skips auth and uses in-memory V2 APIs.

## V2 platform (current)

| Feature | Route / API |
|---------|-------------|
| Tier 1 onboarding | `/app/onboarding` · `POST /api/v1/onboarding/tier1/*` |
| Documents + MemPalace | `/app/objective` · `POST /api/v1/documents` · `/api/v1/mempalace/sync` |
| 7-touchpoint assessments | `/app/assessment` · `/api/v1/assessments/*` |
| Coach Mak v2 | Mak panel · `POST /api/v1/chat/message` |
| Analytics dashboard (CRI) | `/app/dashboard` · `GET /api/v1/analytics/dashboard` |
| Pathways + jobs | `/app/plan` · `/app/jobs` · `/api/v1/pathways` · `/api/v1/jobs/matches` |
| Promotion toolkit | `/app/output` · `/api/v1/promotion/*` · `/api/v1/templates` |

## Database setup

1. Create a Supabase project
2. Run **`docs/FISCMAK_V2_SCHEMA.sql`** in the SQL editor (authoritative V2 schema)
3. Add URL + anon key to `.env.local`
4. Sign up — Tier 1 onboarding creates your `app_users` row

### Google sign-in

1. Supabase → **Authentication → Providers → Google** — enable and add OAuth client ID/secret
2. Google Cloud Console: authorized redirect URI `https://<project-ref>.supabase.co/auth/v1/callback`
3. Supabase → **Authentication → URL Configuration**:
   - **Site URL:** `https://www.fiscmak.com`
   - **Redirect URLs:** `https://www.fiscmak.com/auth/callback`, `https://fiscmak.com/auth/callback`, plus `http://127.0.0.1:3000/auth/callback` for local dev
4. Set `NEXT_PUBLIC_APP_URL=https://www.fiscmak.com` in production (Vercel env)

V1 lattice schema is archived at `docs/archive/FISCMAK_V1_SCHEMA.sql`. See `docs/MIGRATION_V1_TO_V2.md` — V1 activity/lattice data is **not** auto-migrated.

## Specs

- V2 Desktop specs: `docs/spec-v2/`
- Design decisions: `docs/FISCMAK_DESIGN_DECISIONS.md`
- API contract: `docs/spec-v2/FISCMAK_API_Contract.md`

## Deprecated (V1)

Legacy SOAP lattice MVP routes remain for backward compatibility but are not extended:

- `/api/mak/message` → use `/api/v1/chat/message`
- `/api/documents/parse` → use `/api/v1/documents`
- `/api/classify/activity` → use V2 assessments
- Client localStorage fallbacks gated behind demo mode (`src/lib/demo-mode.ts`)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Production server |

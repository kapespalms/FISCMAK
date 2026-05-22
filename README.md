# FISCMAK

Career intelligence platform for physicians — capture evidence, map your 8×8 lattice, talk with Mak, and generate career outputs.

Built from the FISCMAK v1 specifications (Next.js + Supabase + Claude).

## Quick start

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

1. Replace `[YOUR-PASSWORD]` in `DATABASE_URL` with your Supabase database password
2. Paste **anon public** key into `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Dashboard → Settings → API)

```bash
npm install
npm run dev
```

**Important:** The `postgresql://` URL is for running SQL in Supabase/psql. The Next.js app uses `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` only.

Open [http://localhost:3000](http://localhost:3000).

**Demo mode:** Without Supabase env vars, sign in/sign up skips auth and opens the app.

## What's included (MVP shell)

- Landing page with brand (`#5FD65F`)
- Auth (Supabase) with demo fallback
- App shell: Dashboard (SOAP), Lattice 8×8, Mak chat, Activities, Output Studio, Profile, Settings
- Claude API routes for Mak + output generation (when `ANTHROPIC_API_KEY` is set)
- Design system components (Button, Card, Badge, Input)

## Database setup

1. Create a Supabase project
2. Run `docs/FISCMAK_SUPABASE_SCHEMA.sql` in the SQL editor
3. Run `docs/supabase-auth-bridge.sql` (links Supabase Auth to FISCMAK tables)
4. Add URL + anon key to `.env.local`
5. Sign up in the app — profile + activities persist per user

## Specs

See `docs/` for schema and brand guide. Full specs live in `~/Desktop/FISCMAK/love2/`.

## Next phases

- Lexical editor + evidence chips in Output Studio
- Document upload + parsing
- Live lattice from `activity_entries` ✓
- Supabase profiles + activities ✓
- Activity classification (OpenAI or keyword fallback) ✓
- DOCX/PDF export

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Production server |

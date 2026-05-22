# FISCMAK

Career intelligence platform for physicians — capture evidence, map your 8×8 lattice, talk with Mak, and generate career outputs.

Built from the FISCMAK v1 specifications (Next.js + Supabase + Claude).

## Quick start

```bash
cp .env.local.example .env.local
# Add Supabase + Anthropic keys (optional for demo mode)

npm install
npm run dev
```

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
3. Add URL + anon key to `.env.local`

## Specs

See `docs/` for schema and brand guide. Full specs live in `~/Desktop/FISCMAK/love2/`.

## Next phases

- OpenAI activity classification
- Lexical editor + evidence chips in Output Studio
- Document upload + parsing
- Live lattice from `activity_entries`
- DOCX/PDF export

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Production server |

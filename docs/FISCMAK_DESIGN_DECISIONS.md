# FISCMAK Design Decisions (V2 Pivot)

## Brand colors

The Desktop spec uses Slate Blue `#4F46E5` as primary CTA. **FISCMAK keeps Energizing Green `#5FD65F`** as the primary brand color for continuity with the existing MVP and brand guide.

Spec semantic colors are adopted for alerts:

| Token | Hex | Use |
|-------|-----|-----|
| Warning | `#F59E0B` | Milestones, check-in overdue |
| Critical CTA | `#F97316` | Energy alerts |
| Success | `#A3E635` | Achievement badges (optional) |

## API implementation

REST contract from `docs/spec-v2/FISCMAK_API_Contract.md` is implemented as Next.js App Router handlers under `/api/v1/*`, backed by Supabase Postgres.

## Demo mode

When Supabase is not configured, V2 APIs use `src/lib/v2/demo-store.ts` (localStorage) so the app remains usable locally.

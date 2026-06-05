# O*NET 30.3 Seed — FISCMAK

**Source:** O*NET 30.3 Database, May 2026 Release  
**Attribution:** This product uses data from the O*NET 30.3 Database by the U.S. Department of Labor, Employment and Training Administration (USDOL/ETA). Used under the [CC Attribution 4.0 International License](https://www.onetcenter.org/license_db.html). O*NET® is a trademark of USDOL/ETA.  
**Download:** https://www.onetcenter.org/database.html  

---

## Raw data

`../Full_Onet_Seeds/` — the complete O*NET 30.3 Excel files committed to this repo.

## Reproducible build

```
node docs/seeds/onet/build-onet-seed.mjs
```

Reads the raw Excel files and writes the compiled TypeScript seed constants to
`src/lib/v2/onet/`. Re-run after any O*NET version upgrade to refresh vectors.
Requires Node ≥ 18 and the `xlsx` package (already in devDependencies).

## Output files (generated, committed)

| File | Contents |
|------|----------|
| `src/lib/v2/onet/descriptor-catalog.ts` | 243 descriptor definitions with element IDs, titles, categories |
| `src/lib/v2/onet/soc-vectors.ts` | Normalized 243-dim float vectors for 46 SOC codes |
| `src/lib/v2/onet/variance-weights.ts` | Per-descriptor discriminative variance across all 19 physician SOCs |
| `src/lib/v2/onet/domain-fingerprints.ts` | 8 domain vectors per physician SOC (Stage 5 composed) |
| `src/lib/v2/onet/adjacency-baskets.ts` | Top-20 non-physician Job-Zone-≥3 adjacencies per physician SOC |

## Descriptor vector format

243 float values normalized to 0–1, in catalog order:
1. Abilities (52) — Importance scale IM, normalized (v−1)/4
2. Knowledge (33) — Importance scale IM, normalized (v−1)/4
3. Work Activities (41) — Importance scale IM, normalized (v−1)/4
4. Work Context (55) — Context scale CX, normalized (v−1)/4
5. Work Styles (21) — Work Styles Impact scale WI, normalized (v+1.42)/4.42
6. Essential Skills (10) — Importance scale IM, normalized (v−1)/4
7. Transferable Skills (25) — Importance scale IM, normalized (v−1)/4
8. Career Interest Types / RIASEC (6) — OI scale, normalized (v−1)/6

Missing values default to 0.0 (not rated for that occupation).

## Physician scope

SOC codes covered = all specialties in `src/lib/v2/specialty-soc-map.ts`.
Adjacent SOC pool = all non-physician Job Zone ≥ 3 occupations (N=536) from O*NET 30.3.
CC-BY attribution must appear wherever F6/F8 fit scores are surfaced.

# Canva → FISCMAK brand assets

Source board: [FISCMAK Images (Canva)](https://www.canva.com/design/DAHK5kUa0mU/HYc8lfJvLC-vunZLHjW49A/view)

## What works on the dark landing page

| Use on site | Export from Canva | Save as |
|-------------|-------------------|---------|
| Hero king art | Silent C frame — **crop king only**, dark bg, no white | `hero-king-focus.png` |
| FISC pillar | FISC column frame only | `panel-fisc-hd.png` |
| Silent C pillar | Silent C column frame only | `panel-silent-c-hd.png` |
| MAK pillar | MAK column frame only | `panel-mak-hd.png` |
| Coach Mak avatar | M in silent-C ring | `logo-cm.png` |
| User profile fallback | Physician silhouette | `default-profile.png` |

## Do not embed on the landing page

- **Full white name board** (`fiscmak-name-breakdown.png`) — blows out the dark glass layout
- **Full gold-framed queen** (`fiscmak-chess-queen.png`) — heavy frame clashes with hero glass
- **`hero-queen-transparent.png`** — glitchy 520px export
- **`panel-fisc.png` / `panel-*.png`** — ~250px, too blurry

Export individual frames at **PNG · 2×** (or higher), drop in this folder, then:

```bash
npm run brand:sync
```

Hard refresh after sync: Cmd+Shift+R.

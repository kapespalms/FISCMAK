# Canva → FISCMAK brand assets

Source board: [FISCMAK Images (Canva)](https://www.canva.com/design/DAHK5kUa0mU/HYc8lfJvLC-vunZLHjW49A/view)

Export each frame **PNG · 2× size · transparent background where possible**, then drop files here and run `npm run brand:sync`.

| Canva frame | Save as | Used on |
|-------------|---------|---------|
| Hero chess queen (gold frame) | `fiscmak-chess-queen.png` | Landing hero (right panel) |
| FISC + Silent C + MAK board | `fiscmak-name-breakdown.png` | Landing “Meaning” section |
| M in silent-C ring | `logo-cm.png` | Coach Mak chat avatar |
| Default user silhouette | `default-profile.png` | User nav / profile fallback |

**Do not use** auto-cropped `panel-*.png` files (they are ~250px and look blurry on the live site).

```bash
npm run brand:sync
```

Hard refresh production after sync: Cmd+Shift+R.

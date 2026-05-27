#!/usr/bin/env python3
"""Extract transparent landing art from uploaded Heading composites."""

from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = Path("/Users/kristenpalmer/.cursor/projects/Users-kristenpalmer-fiscmak/assets")
OUT = ROOT / "public" / "marketing" / "landing"

BREAKDOWN_SRC = ASSETS / "Heading-2-37eaf03d-9036-40e4-b5d5-be080adf8367.png"
HERO_SRC = ASSETS / "Heading-5-5a6eb600-2e0b-4b4a-8eb1-3cb6b3f13ccf.png"
LOGO_SRC = ASSETS / "Heading-3-b953a403-7585-40ba-86a5-afa037a7ebbd.png"

# (left, top, right, bottom) — frame interiors from 1024×542 composite
PANEL_CROPS = {
    "panel-fisc": (24, 292, 318, 528),
    "panel-silent-c": (352, 292, 668, 528),
    "panel-mak": (688, 292, 1000, 528),
}


def lum(r: int, g: int, b: int) -> float:
    return 0.299 * r + 0.587 * g + 0.114 * b


def sat(r: int, g: int, b: int) -> int:
    return max(r, g, b) - min(r, g, b)


def is_near_white(r: int, g: int, b: int, threshold: int = 238) -> bool:
    return r >= threshold and g >= threshold and b <= threshold + 20


def is_gold_frame(r: int, g: int, b: int) -> bool:
    return r >= 130 and g >= 70 and g <= 230 and b <= 140 and r > b + 30


def is_green_accent(r: int, g: int, b: int) -> bool:
    return g >= 130 and r <= 190 and b <= 190 and g > r + 15


def is_neon_accent(r: int, g: int, b: int) -> bool:
    if is_green_accent(r, g, b):
        return True
    return sat(r, g, b) >= 70 and (b >= 120 or (r >= 130 and g <= 130))


def trim_transparent(im: Image.Image) -> Image.Image:
    bbox = im.getbbox()
    return im.crop(bbox) if bbox else im


def resize_max(im: Image.Image, max_side: int) -> Image.Image:
    w, h = im.size
    scale = min(max_side / w, max_side / h, 1.0)
    if scale >= 1.0:
        return im
    return im.resize((int(w * scale), int(h * scale)), Image.Resampling.LANCZOS)


def extract_art_from_frame(crop: Image.Image) -> Image.Image:
    """Keep chess art + neon crown; drop white mat and gold frame."""
    im = crop.convert("RGBA")
    w, h = im.size
    px = im.load()

    keep = [[False] * w for _ in range(h)]
    for y in range(h):
        for x in range(w):
            r, g, b, _a = px[x, y]
            if is_near_white(r, g, b) or is_gold_frame(r, g, b):
                continue
            if lum(r, g, b) < 235 or is_neon_accent(r, g, b):
                keep[y][x] = True

    # Flood from center-bottom (chess subject)
    seed_x, seed_y = w // 2, int(h * 0.72)
    for dy in range(h):
        y = min(h - 1, seed_y + dy)
        if keep[y][seed_x]:
            seed_y = y
            break

    connected = [[False] * w for _ in range(h)]
    q: deque[tuple[int, int]] = deque()
    if keep[seed_y][seed_x]:
        connected[seed_y][seed_x] = True
        q.append((seed_x, seed_y))

    while q:
        x, y = q.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and keep[ny][nx] and not connected[ny][nx]:
                connected[ny][nx] = True
                q.append((nx, ny))

    neon_keep = [[False] * w for _ in range(h)]
    for y in range(h):
        for x in range(w):
            r, g, b, _a = px[x, y]
            if not is_neon_accent(r, g, b):
                continue
            for dy in range(-20, 21):
                for dx in range(-20, 21):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < h and 0 <= nx < w and connected[ny][nx]:
                        neon_keep[y][x] = True
                        break
                if neon_keep[y][x]:
                    break

    out = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    out_px = out.load()
    for y in range(h):
        for x in range(w):
            if connected[y][x] or neon_keep[y][x]:
                r, g, b, _a = px[x, y]
                out_px[x, y] = (r, g, b, 255)

    return trim_transparent(out)


def process_hero_queen() -> None:
    src = Image.open(HERO_SRC).convert("RGBA")
    crop = src.crop((190, 120, 830, 760))
    out = resize_max(extract_art_from_frame(crop), 520)
    out.save(OUT / "hero-queen-transparent.png", optimize=True)


def process_panels() -> None:
    src = Image.open(BREAKDOWN_SRC).convert("RGBA")
    for name, box in PANEL_CROPS.items():
        panel = extract_art_from_frame(src.crop(box))
        panel = resize_max(panel, 280)
        panel.save(OUT / f"{name}.png", optimize=True)


def process_logo() -> None:
    im = Image.open(LOGO_SRC).convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, _a = px[x, y]
            if is_near_white(r, g, b):
                px[x, y] = (0, 0, 0, 0)
            else:
                px[x, y] = (r, g, b, 255)
    trim_transparent(im).save(OUT / "fiscmak-logo-cm.png", optimize=True)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    process_logo()
    process_hero_queen()
    process_panels()
    for path in sorted(OUT.glob("*.png")):
        im = Image.open(path)
        print(f"{path.name}  {im.size}  {path.stat().st_size // 1024}KB")


if __name__ == "__main__":
    main()

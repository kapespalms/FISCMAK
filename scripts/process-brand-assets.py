#!/usr/bin/env python3
"""Process brand source PNGs into transparent public/brands/ assets."""

from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = Path("/Users/kristenpalmer/.cursor/projects/Users-kristenpalmer-fiscmak/assets")
OUT = ROOT / "public" / "brands"

MAK_SRC = ASSETS / "Heading-4-9c831691-b4f6-453e-b837-6af86bd8fbbc.png"
HERO_SRC = ASSETS / "Heading-5-5a6eb600-2e0b-4b4a-8eb1-3cb6b3f13ccf.png"
LOGO_SRC = ASSETS / "Heading-3-c12f062e-609e-4c6f-b0df-30c0b48575f2.png"

FOREST_DARK = (26, 47, 35, 255)
MAK_AVATAR_SIZE = 256
HERO_MAX = 480


def lum(r: int, g: int, b: int) -> float:
    return 0.299 * r + 0.587 * g + 0.114 * b


def sat(r: int, g: int, b: int) -> int:
    return max(r, g, b) - min(r, g, b)


def is_near_white(r: int, g: int, b: int, threshold: int = 235) -> bool:
    return r >= threshold and g >= threshold and b >= threshold


def is_near_black(r: int, g: int, b: int, threshold: int = 40) -> bool:
    return r <= threshold and g <= threshold and b <= threshold


def is_green_accent(r: int, g: int, b: int) -> bool:
    return g >= 130 and r <= 190 and b <= 190 and g > r + 15


def is_gold_frame(r: int, g: int, b: int) -> bool:
    return r >= 130 and g >= 70 and g <= 230 and b <= 140 and r > b + 30


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


def process_mak_avatar() -> None:
    im = Image.open(MAK_SRC).convert("RGBA")
    px = im.load()
    w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, _a = px[x, y]
            if is_near_white(r, g, b) and not is_green_accent(r, g, b):
                px[x, y] = FOREST_DARK
            elif is_green_accent(r, g, b):
                px[x, y] = (r, g, b, 255)
            else:
                px[x, y] = (0, 0, 0, 0)

    out = resize_max(trim_transparent(im), MAK_AVATAR_SIZE)
    out.save(OUT / "mak-avatar.png", optimize=True)


def process_default_profile() -> None:
    im = Image.open(MAK_SRC).convert("RGBA")
    px = im.load()
    w, h = im.size

    # Crown sits above the circular head — drop the top band of the avatar card.
    crown_cutoff = int(h * 0.34)

    for y in range(h):
        for x in range(w):
            r, g, b, _a = px[x, y]
            if (
                y >= crown_cutoff
                and is_near_white(r, g, b)
                and not is_green_accent(r, g, b)
            ):
                px[x, y] = FOREST_DARK
            else:
                px[x, y] = (0, 0, 0, 0)

    out = resize_max(trim_transparent(im), MAK_AVATAR_SIZE)
    out.save(OUT / "default-profile.png", optimize=True)


def process_logo_cm() -> None:
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

    out = trim_transparent(im)
    out.save(OUT / "logo-cm.png", optimize=True)


def process_hero_chess() -> None:
    src = Image.open(HERO_SRC).convert("RGBA")
    # Focus on framed artwork interior (drops ornate outer mat + frame).
    crop = src.crop((190, 120, 830, 760))
    w, h = crop.size
    px = crop.load()

    keep = [[False] * w for _ in range(h)]
    for y in range(h):
        for x in range(w):
            r, g, b, _a = px[x, y]
            if is_gold_frame(r, g, b):
                continue
            l = lum(r, g, b)
            if l < 52:
                keep[y][x] = True

    # Drop disconnected dark blobs (background silhouette) via flood from queen base.
    seed_x, seed_y = w // 2, int(h * 0.68)
    if not keep[seed_y][seed_x]:
        for dy in range(-40, 41):
            y = seed_y + dy
            if 0 <= y < h and keep[y][seed_x]:
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
            for dy in range(-24, 25):
                for dx in range(-24, 25):
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
            r, g, b, _a = px[x, y]
            if connected[y][x] or neon_keep[y][x]:
                out_px[x, y] = (r, g, b, 255)

    final = resize_max(trim_transparent(out), HERO_MAX)
    final.save(OUT / "hero-chess.png", optimize=True)


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    process_mak_avatar()
    process_default_profile()
    process_logo_cm()
    process_hero_chess()
    for name in ("mak-avatar.png", "default-profile.png", "logo-cm.png", "hero-chess.png"):
        path = OUT / name
        im = Image.open(path)
        print(f"{path.relative_to(ROOT)}  {im.size}  {path.stat().st_size // 1024}KB")


if __name__ == "__main__":
    main()

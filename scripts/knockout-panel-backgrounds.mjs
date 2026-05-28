#!/usr/bin/env node
/**
 * Makes near-white pixels transparent on Canva panel PNGs (light matte export).
 * Run via: npm run brand:sync (or standalone on public/marketing/landing/panel-*-hd.png)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Pixels with R,G,B all above this become transparent. */
const WHITE_THRESHOLD = 238;

export async function knockoutWhiteBackground(filePath) {
  if (!fs.existsSync(filePath)) return false;

  const image = sharp(filePath);
  const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r >= WHITE_THRESHOLD && g >= WHITE_THRESHOLD && b >= WHITE_THRESHOLD) {
      data[i + 3] = 0;
    }
  }

  await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toFile(filePath);

  return true;
}

async function main() {
  const landingDir = path.join(root, "public/marketing/landing");
  const files = fs
    .readdirSync(landingDir)
    .filter((name) => name.startsWith("panel-") && name.endsWith(".png"));

  let processed = 0;
  for (const name of files) {
    const filePath = path.join(landingDir, name);
    await knockoutWhiteBackground(filePath);
    console.log(`✓ knocked out white → ${path.relative(root, filePath)}`);
    processed += 1;
  }

  if (processed === 0) {
    console.log("No panel-*.png files found in public/marketing/landing/");
    process.exit(1);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}

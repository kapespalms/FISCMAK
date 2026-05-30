#!/usr/bin/env node
/**
 * Copy Canva PNG exports into public brand paths.
 *
 * Export 2× PNG from:
 * https://www.canva.com/design/DAHK5kUa0mU/HYc8lfJvLC-vunZLHjW49A/view
 *
 * Drop files in docs/canva-exports/ then: npm run brand:sync
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { knockoutWhiteBackground } from "./knockout-panel-backgrounds.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const drop = path.join(root, "docs/canva-exports");

const MAP = [
  { from: "default-profile.png", to: "public/brands/default-profile.png" },
  { from: "logo-cm.png", to: "public/brands/logo-cm.png" },
  { from: "hero-king-focus.png", to: "public/marketing/landing/hero-king-focus.png" },
  { from: "panel-fisc-hd.png", to: "public/marketing/landing/panel-fisc-hd.png" },
  { from: "panel-silent-c-hd.png", to: "public/marketing/landing/panel-silent-c-hd.png" },
  { from: "panel-mak-hd.png", to: "public/marketing/landing/panel-mak-hd.png" },
  { from: "fiscmak-name-breakdown.png", to: "public/marketing/landing/fiscmak-name-breakdown.png" },
  { from: "logo-cm.png", to: "public/marketing/landing/fiscmak-logo-cm.png" },
];

async function main() {
  if (!fs.existsSync(drop)) {
    fs.mkdirSync(drop, { recursive: true });
    console.log(`Created ${drop}`);
    console.log("See docs/canva-exports/README.md for export names.");
    process.exit(0);
  }

  let copied = 0;
  for (const { from, to } of MAP) {
    const src = path.join(drop, from);
    const dest = path.join(root, to);
    if (!fs.existsSync(src)) continue;
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    if (to.includes("panel-") && to.endsWith(".png")) {
      await knockoutWhiteBackground(dest);
    }
    console.log(`✓ ${from} → ${to}`);
    copied += 1;
  }

  if (copied === 0) {
    console.log("No files in docs/canva-exports/ to sync.");
    console.log("Expected: fiscmak-chess-queen.png, fiscmak-name-breakdown.png, logo-cm.png, default-profile.png");
    process.exit(1);
  }

  console.log(`\nSynced ${copied} file(s). Hard-refresh the browser to see updates.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

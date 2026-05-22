import sharp from "sharp";
import { mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const assets = join(
  process.env.HOME,
  ".cursor/projects/Users-kristenpalmer-fiscmak/assets",
);
const navSrc = join(root, "public/brand/nav-src");
const outDir = join(root, "public/brand/nav");

const COLORS = {
  dashboard: { r: 15, g: 118, b: 110 },
  subjective: { r: 13, g: 148, b: 136 },
  objective: { r: 37, g: 99, b: 235 },
  assessment: { r: 124, g: 58, b: 237 },
  plan: { r: 217, g: 119, b: 6 },
  output: { r: 71, g: 85, b: 105 },
};

async function loadRgba(input) {
  return sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
}

function keyTransparent(pixels, fn) {
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];
    if (fn(r, g, b, a)) pixels[i + 3] = 0;
  }
}

function luminance(r, g, b) {
  return (r * 0.299 + g * 0.587 + b * 0.114) / 255;
}

function tintForeground(pixels, color, { preserveHighlights = false, lineArt = false } = {}) {
  for (let i = 0; i < pixels.length; i += 4) {
    if (pixels[i + 3] === 0) continue;
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const lum = luminance(r, g, b);

    if (preserveHighlights && lum > 0.78) {
      pixels[i] = 255;
      pixels[i + 1] = 255;
      pixels[i + 2] = 255;
      continue;
    }

    if (lineArt) {
      if (lum > 0.55) {
        pixels[i + 3] = 0;
        continue;
      }
      const strength = 1 - lum;
      pixels[i] = Math.round(color.r * strength + r * (1 - strength * 0.15));
      pixels[i + 1] = Math.round(color.g * strength + g * (1 - strength * 0.15));
      pixels[i + 2] = Math.round(color.b * strength + b * (1 - strength * 0.15));
      continue;
    }

    pixels[i] = Math.round(color.r * lum + 255 * (1 - lum) * 0.04);
    pixels[i + 1] = Math.round(color.g * lum + 255 * (1 - lum) * 0.04);
    pixels[i + 2] = Math.round(color.b * lum + 255 * (1 - lum) * 0.04);
  }
}

async function saveRaw({ data, info }, output, { pad = 6, maxDim = 128 } = {}) {
  let buf = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .trim({ threshold: 8 })
    .png()
    .toBuffer();

  if (pad > 0) {
    buf = await sharp(buf)
      .extend({
        top: pad,
        bottom: pad,
        left: pad,
        right: pad,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toBuffer();
  }

  await sharp(buf)
    .resize({ width: maxDim, height: maxDim, fit: "inside", withoutEnlargement: false })
    .png({ compressionLevel: 9 })
    .toFile(output);
}

async function processMak() {
  const { data, info } = await loadRgba(
    join(assets, "image-818849a3-a3d5-4ea4-9f30-54204031750a.png"),
  );
  const px = Buffer.from(data);
  keyTransparent(px, (r, g, b, a) => {
    if (a < 10) return true;
    if (r > 248 && g > 248 && b > 248) return true;
    if (Math.abs(r - g) < 8 && Math.abs(g - b) < 8 && r > 180 && r < 230) return true;
    return false;
  });
  await saveRaw({ data: px, info }, join(outDir, "coach-mak.png"), { pad: 2, maxDim: 128 });
}

async function processBlackBgIcon(input, output, color, { threshold = 35, maxDim = 128 } = {}) {
  const { data, info } = await loadRgba(input);
  const px = Buffer.from(data);
  keyTransparent(px, (r, g, b) => r < threshold && g < threshold && b < threshold);
  tintForeground(px, color);
  await saveRaw({ data: px, info }, output, { pad: 4, maxDim });
}

async function processWhiteBgLineArt(input, output, color) {
  const { data, info } = await loadRgba(input);
  const px = Buffer.from(data);
  keyTransparent(px, (r, g, b) => r > 230 && g > 230 && b > 230);
  tintForeground(px, color, { lineArt: true });
  await saveRaw({ data: px, info }, output, { pad: 4, maxDim: 128 });
}

async function processSubjective() {
  const input = join(assets, "subjective-78cd2311-1704-4f02-be82-078c045e71d8.png");
  const meta = await sharp(input).metadata();
  const half = Math.floor(meta.width / 2);

  const { data, info } = await sharp(input)
    .extract({ left: half, top: 0, width: meta.width - half, height: meta.height })
    .flop()
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const px = Buffer.from(data);
  keyTransparent(px, (r, g, b) => r > 230 && g > 230 && b > 230);
  keyTransparent(px, (r, g, b) => r < 30 && g < 30 && b < 30);
  tintForeground(px, COLORS.subjective, { preserveHighlights: true });
  await saveRaw({ data: px, info }, join(outDir, "subjective.png"), { pad: 4, maxDim: 128 });
}

async function processSvg(input, output, maxDim = 128) {
  await sharp(input)
    .resize({ width: maxDim, height: maxDim, fit: "inside" })
    .png({ compressionLevel: 9 })
    .toFile(output);
}

async function main() {
  await mkdir(outDir, { recursive: true });

  await processMak();
  await processSvg(join(navSrc, "dashboard.svg"), join(outDir, "dashboard.png"), 144);
  await processSubjective();
  await processBlackBgIcon(
    join(assets, "objective-07e2f5fd-df15-476e-876b-51bf56393527.png"),
    join(outDir, "objective.png"),
    COLORS.objective,
  );
  await processWhiteBgLineArt(
    join(assets, "asessment-b8575c97-8500-4359-8c6a-59ba6d875c29.png"),
    join(outDir, "assessment.png"),
    COLORS.assessment,
  );
  await processSvg(join(navSrc, "plan.svg"), join(outDir, "plan.png"), 128);
  await processBlackBgIcon(
    join(assets, "output-2824e4d6-4bb8-4d4b-b17b-9b2d658cb46e.png"),
    join(outDir, "output.png"),
    COLORS.output,
  );

  console.log("Icons written to", outDir);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

#!/usr/bin/env node
/**
 * Build UH psych rotation content manifest from orientation index + public/content/uh-psych.
 * Does NOT download from Google Drive — status tracking only.
 *
 * Usage: node scripts/sync-uh-psych-content.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const INDEX_PATH = path.join(root, "docs/seeds/uh-rotation-orientations/index.json");
const CONTENT_ROOT = path.join(root, "public/content/uh-psych");
const MANIFEST_PATH = path.join(root, "docs/seeds/uh-psych-content-manifest.json");

const EXTERNAL_HOSTS = ["drive.google.com", "docs.google.com"];

function walkRepoFiles(dir, prefix = "") {
  if (!fs.existsSync(dir)) return [];
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walkRepoFiles(abs, rel));
    else if (entry.isFile()) out.push(`/content/uh-psych/${rel}`);
  }
  return out;
}

function isExternalUrl(url) {
  if (url.startsWith("/content/")) return false;
  try {
    const host = new URL(url).hostname;
    return EXTERNAL_HOSTS.some((h) => host.includes(h));
  } catch {
    return !url.startsWith("/");
  }
}

function resolveFileStatus(url, repoPaths) {
  if (url.startsWith("/content/")) {
    const local = path.join(root, "public", url.slice(1));
    return {
      local_path: url,
      status: fs.existsSync(local) ? "in_repo" : "pending_export",
    };
  }

  if (isExternalUrl(url)) {
    const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    const fileId = fileIdMatch?.[1];
    const basenameHint = fileId ? repoPaths.find((p) => p.includes(fileId)) : undefined;
    if (basenameHint) {
      return { local_path: basenameHint, status: "in_repo" };
    }
    return { local_path: null, status: "linked" };
  }

  const normalized = url.replace(/^\.\//, "");
  const hit = repoPaths.find((p) => p.endsWith(normalized));
  if (hit) return { local_path: hit, status: "in_repo" };
  return { local_path: null, status: "pending_export" };
}

function main() {
  const index = JSON.parse(fs.readFileSync(INDEX_PATH, "utf8"));
  const repoPaths = walkRepoFiles(CONTENT_ROOT);
  const rotations = {};

  for (const rotation of index.rotations ?? []) {
    const files = rotation.drive_files ?? [];
    if (files.length === 0) continue;
    rotations[rotation.rotation_code] = files.map((file) => ({
      label: file.label,
      url: file.url,
      ...resolveFileStatus(file.url, repoPaths),
    }));
  }

  const manifest = {
    generated_at: new Date().toISOString(),
    content_root: "public/content/uh-psych",
    rotations,
    pending_identification: index.drive_files_pending_identification ?? [],
    stats: {
      rotation_count: Object.keys(rotations).length,
      file_count: Object.values(rotations).flat().length,
      in_repo: Object.values(rotations)
        .flat()
        .filter((f) => f.status === "in_repo").length,
      linked: Object.values(rotations)
        .flat()
        .filter((f) => f.status === "linked").length,
      pending_export: Object.values(rotations)
        .flat()
        .filter((f) => f.status === "pending_export").length,
    },
  };

  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`✓ Wrote ${MANIFEST_PATH}`);
  console.log(
    `  ${manifest.stats.file_count} rotation files · ${manifest.stats.in_repo} in repo · ${manifest.stats.linked} external · ${manifest.pending_identification.length} pending ID`,
  );
}

main();

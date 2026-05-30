#!/usr/bin/env node
/**
 * ACGME onboarding coverage audit — run after registry or seed updates.
 * Usage: node scripts/audit-acgme-onboarding.mjs
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const seedsDir = path.join(root, "docs/seeds/acgme");

function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(seedsDir, name), "utf8"));
}

function main() {
  const appendixB = readJson("appendix_b_2024_2025.json");
  const milestoneFrameworks = readJson("milestone_frameworks.json");
  const psychiatryMilestones = readJson("psychiatry_milestones_v2.json");
  let milestoneCatalog = { programs: [] };
  let catalogPath = path.join(seedsDir, "milestone_catalog.json");
  if (fs.existsSync(catalogPath)) {
    milestoneCatalog = readJson("milestone_catalog.json");
  }

  const primaries = appendixB.primary_specialties;
  const subspecialtyToPrimary = appendixB.subspecialty_to_primary;
  const primaryByName = new Map(primaries.map((p) => [p.name, p]));
  const onboardingNames = new Set(primaries.map((p) => p.name));

  const seededSlugs = new Set(
    Object.values(milestoneFrameworks.frameworks)
      .filter((f) => f.status === "seeded")
      .map((f) => f.primary_slug),
  );

  const subcompetencyCounts = {
    psychiatry: psychiatryMilestones.subcompetencies?.length ?? 0,
  };

  const rows = primaries.map((p) => {
    const meta = milestoneFrameworks.frameworks[p.slug];
    const milestone_status = meta?.status === "seeded" ? "seeded" : "universal_only";
    return {
      primary_name: p.name,
      slug: p.slug,
      group: p.group,
      subspecialty_count: p.subspecialties.length,
      in_onboarding: onboardingNames.has(p.name),
      milestone_status,
      subcompetency_count: subcompetencyCounts[p.slug] ?? 0,
    };
  });

  const gaps = [];
  const milestone_seed_pending = [];

  for (const row of rows) {
    if (!row.in_onboarding) {
      gaps.push(`Primary specialty missing from onboarding: ${row.primary_name}`);
    }
    if (row.milestone_status === "universal_only") {
      milestone_seed_pending.push(row.primary_name);
    }
  }

  for (const [sub, sponsorPrimary] of Object.entries(subspecialtyToPrimary)) {
    if (!primaryByName.has(sponsorPrimary)) {
      gaps.push(`Subspecialty orphan (no primary): ${sub}`);
      continue;
    }
    const listedUnder = primaries.some((p) => p.subspecialties.includes(sub));
    if (!listedUnder) {
      gaps.push(`Subspecialty missing from all primary lists: ${sub}`);
    }
  }

  for (const p of primaries) {
    for (const sub of p.subspecialties) {
      if (!subspecialtyToPrimary[sub]) {
        gaps.push(`Subspecialty not in evaluation map: ${sub} (under ${p.name})`);
      }
    }
  }

  const audit = {
    source: appendixB.source,
    primary_count: primaries.length,
    subspecialty_count: Object.keys(subspecialtyToPrimary).length,
    seeded_framework_count: rows.filter((r) => r.milestone_status === "seeded").length,
    catalog_program_count: milestoneCatalog.programs?.length ?? 0,
    catalog_parsed_count: (milestoneCatalog.programs ?? []).filter(
      (p) => p.parse_status === "parsed" || p.parse_status === "seeded_manual",
    ).length,
    catalog_url_only_count: (milestoneCatalog.programs ?? []).filter((p) => p.milestone_pdf_url).length,
    rows,
    gaps,
    milestone_seed_pending,
  };

  console.log(`Source: ${audit.source}`);
  console.log(`Primary specialties: ${audit.primary_count}`);
  console.log(`Subspecialty programs: ${audit.subspecialty_count}`);
  console.log(`Onboarding primary list: ${onboardingNames.size}`);
  console.log(`Seeded milestone frameworks: ${audit.seeded_framework_count}`);
  if (audit.catalog_program_count) {
    console.log(`Milestone catalog programs: ${audit.catalog_program_count}`);
    console.log(`  Parsed / manual seeds: ${audit.catalog_parsed_count}`);
    console.log(`  With milestone PDF URL: ${audit.catalog_url_only_count}`);
  }
  console.log("");

  console.log(`Pending specialty milestone seeds: ${milestone_seed_pending.length}`);
  for (const name of milestone_seed_pending.slice(0, 8)) {
    console.log(`  - ${name}`);
  }
  if (milestone_seed_pending.length > 8) {
    console.log(`  ... +${milestone_seed_pending.length - 8} more`);
  }

  if (gaps.length > 0) {
    console.log("\nOnboarding mapping gaps:");
    for (const gap of gaps) console.log(`  ! ${gap}`);
    process.exitCode = 1;
  } else {
    console.log("\nAll ACGME primary specialties are in onboarding with consistent subspecialty maps.");
  }
}

main();

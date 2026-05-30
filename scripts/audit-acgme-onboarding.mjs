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
  const milestoneCatalog = readJson("milestone_catalog.json");
  const allProgramMilestones = readJson("all_program_milestones.json");

  const primaries = appendixB.primary_specialties;
  const subspecialtyToPrimary = appendixB.subspecialty_to_primary;
  const primaryByName = new Map(primaries.map((p) => [p.name, p]));
  const onboardingNames = new Set(primaries.map((p) => p.name));

  const catalogPrograms = milestoneCatalog.programs ?? [];
  const parsedStatuses = new Set(["parsed", "hand_seed", "cached"]);
  const catalogParsed = catalogPrograms.filter((p) => parsedStatuses.has(p.parse_status));
  const catalogUrlOnly = catalogPrograms.filter(
    (p) => !parsedStatuses.has(p.parse_status) && p.milestone_pdf_url,
  );

  const subcompetencyCounts = { psychiatry: psychiatryMilestones.subcompetencies?.length ?? 0 };
  for (const [slug, program] of Object.entries(allProgramMilestones.programs ?? {})) {
    if (slug === "psychiatry") continue;
    subcompetencyCounts[slug] = program.subcompetencies?.length ?? 0;
  }

  const rows = primaries.map((p) => {
    const meta = milestoneFrameworks.frameworks[p.slug];
    const milestone_status =
      meta?.status === "seeded"
        ? "seeded"
        : meta?.status === "catalog_only"
          ? "catalog_only"
          : "universal_only";
    const catalogSlug = meta?.catalog_slug ?? p.slug;
    return {
      primary_name: p.name,
      slug: p.slug,
      group: p.group,
      subspecialty_count: p.subspecialties.length,
      in_onboarding: onboardingNames.has(p.name),
      milestone_status,
      subcompetency_count: subcompetencyCounts[catalogSlug] ?? subcompetencyCounts[p.slug] ?? 0,
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
    catalog_total_programs: catalogPrograms.length,
    catalog_parsed_programs: catalogParsed.length,
    catalog_url_only_programs: catalogUrlOnly.length,
    rows,
    gaps,
    milestone_seed_pending,
  };

  console.log(`Source: ${audit.source}`);
  console.log(`Primary specialties: ${audit.primary_count}`);
  console.log(`Subspecialty programs: ${audit.subspecialty_count}`);
  console.log(`Onboarding primary list: ${onboardingNames.size}`);
  console.log(`Seeded milestone frameworks: ${audit.seeded_framework_count}`);
  console.log(`Milestone catalog programs: ${audit.catalog_total_programs}`);
  console.log(`  Parsed milestones: ${audit.catalog_parsed_programs}`);
  console.log(`  URL-only / pending: ${audit.catalog_url_only_programs}`);
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

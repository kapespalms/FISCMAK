#!/usr/bin/env npx tsx
/**
 * Profile onboarding scenario audit — exercises every meaningful path × career × setting combo.
 * Usage: npm run audit:profiles
 */

import {
  auditProfileScenarios,
  formatProfileScenarioSummary,
} from "../src/lib/v2/profile-scenario-audit";

function printTable(rows: ReturnType<typeof formatProfileScenarioSummary>): void {
  const headers = ["scenario_id", "persona", "content_pack", "instruments", "surfaces", "gme", "mak_stage"];
  const widths = headers.map((h) => h.length);
  for (const row of rows) {
    widths[0] = Math.max(widths[0], row.scenario_id.length);
    widths[1] = Math.max(widths[1], row.persona_id.length);
    widths[2] = Math.max(widths[2], row.content_pack.length);
    widths[3] = Math.max(widths[3], String(row.instruments).length);
    widths[4] = Math.max(widths[4], String(row.surfaces).length);
    widths[5] = Math.max(widths[5], row.gme.length);
    widths[6] = Math.max(widths[6], row.mak_stage.length);
  }

  const pad = (value: string, index: number) => value.padEnd(widths[index]);
  const line = (cells: string[]) => cells.map((c, i) => pad(c, i)).join("  ");

  console.log(line(headers));
  console.log(widths.map((w) => "-".repeat(w)).join("  "));
  for (const row of rows) {
    console.log(
      line([
        row.scenario_id,
        row.persona_id,
        row.content_pack,
        String(row.instruments),
        String(row.surfaces),
        row.gme,
        row.mak_stage,
      ]),
    );
  }
}

function main(): void {
  const audit = auditProfileScenarios();
  const summary = formatProfileScenarioSummary(audit.rows);

  console.log(`Profile scenario audit — ${audit.total_scenarios} scenarios\n`);
  printTable(summary);
  console.log("");

  if (audit.warnings.length > 0) {
    console.log(`Warnings (${audit.warnings.length}):`);
    for (const warning of audit.warnings) {
      console.log(`  ! ${warning}`);
    }
    console.log("");
  }

  if (audit.gaps.length > 0) {
    console.log(`Gaps (${audit.gaps.length}):`);
    for (const gap of audit.gaps) {
      console.log(`  ! ${gap}`);
    }
    console.log("");
  }

  if (audit.errors.length > 0) {
    console.log(`Errors (${audit.errors.length}):`);
    for (const error of audit.errors) {
      console.log(`  ✗ ${error}`);
    }
    process.exitCode = 1;
    return;
  }

  if (audit.gaps.length > 0) {
    process.exitCode = 1;
    return;
  }

  console.log("All profile scenarios computed without errors.");
}

main();

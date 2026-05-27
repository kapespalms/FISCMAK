#!/usr/bin/env node
/**
 * Validates pilot readiness: migrations on disk, example CSVs parse, key routes exist.
 * Usage: node scripts/pilot-dry-run.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function check(name, ok, detail = "") {
  console.log(`${ok ? "✓" : "✗"} ${name}${detail ? ` — ${detail}` : ""}`);
  return ok;
}

let pass = 0;
let fail = 0;

function record(ok) {
  if (ok) pass += 1;
  else fail += 1;
}

const migrations = [
  "docs/migrations/20260530_gme_evaluation_imports.sql",
  "docs/migrations/20260531_gme_milestone_ilp.sql",
  "docs/migrations/20260532_gme_staff_ilp_survey.sql",
  "docs/migrations/20260533_gme_exams_medhub_sync.sql",
  "docs/migrations/20260533_reconciliation_confidence.sql",
];

for (const m of migrations) {
  record(check(`Migration ${path.basename(m)}`, fs.existsSync(path.join(root, m))));
}

const routes = [
  "src/app/api/v1/programs/[programId]/imports/csv/route.ts",
  "src/app/api/v1/programs/[programId]/cohort/dashboard/route.ts",
  "src/app/api/v1/programs/[programId]/cohort-heatmap/route.ts",
  "src/app/api/v1/programs/[programId]/pre-ccc-cohort/route.ts",
  "src/app/api/v1/trainee/milestones/self-ratings/route.ts",
  "src/app/api/v1/trainee/milestones/longitudinal/route.ts",
  "src/app/api/v1/self/pre-ccc-summary/route.ts",
  "src/app/api/v1/ilp-goals/route.ts",
  "src/app/api/v1/rotation-entries/route.ts",
  "src/lib/v2/reconcile-auto-confirm.ts",
  "src/components/gme/RotationLogPanel.tsx",
];

for (const r of routes) {
  record(check(`Route ${r.split("/").slice(-2).join("/")}`, fs.existsSync(path.join(root, r))));
}

const medhubCsv = fs.readFileSync(
  path.join(root, "docs/seeds/examples/uh_medhub_outpatient_eval_wide.csv"),
  "utf8",
);
record(check("MedHub example CSV readable", medhubCsv.includes("milestone_01")));

const priteCsv = fs.readFileSync(
  path.join(root, "docs/seeds/examples/uh_prite_scores_wide.csv"),
  "utf8",
);
record(check("PRITE example CSV readable", priteCsv.includes("overall_percentile")));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);

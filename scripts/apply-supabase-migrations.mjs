#!/usr/bin/env node
/**
 * Apply FISCMAK Supabase migrations using DATABASE_URL / SESSION_POOLER_URL from .env.local
 * Usage: npm run db:migrate
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildConnectionCandidates, connectPostgres, loadEnvLocal } from "./supabase-connection.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

async function tableExists(client, name) {
  const { rows } = await client.query(
    `SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = $1
    ) AS ok`,
    [name],
  );
  return Boolean(rows[0]?.ok);
}

async function columnExists(client, table, column) {
  const { rows } = await client.query(
    `SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2
    ) AS ok`,
    [table, column],
  );
  return Boolean(rows[0]?.ok);
}

async function runSqlFile(client, relativePath, label) {
  const fullPath = path.join(root, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.warn(`  skip (missing file): ${relativePath}`);
    return { ok: false, skipped: true };
  }
  const sql = fs.readFileSync(fullPath, "utf8");
  console.log(`\n→ ${label}`);
  console.log(`  file: ${relativePath}`);
  try {
    await client.query(sql);
    console.log("  ✓ applied");
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/already exists/i.test(msg)) {
      console.log(`  ~ already exists (${msg.split("\n")[0]})`);
      return { ok: true, partial: true };
    }
    console.error(`  ✗ failed: ${msg}`);
    return { ok: false, error: msg };
  }
}

const BACKFILL = `
INSERT INTO app_users (user_id, email, name)
SELECT id, email, COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1))
FROM auth.users
ON CONFLICT (user_id) DO NOTHING;
`;

const VERIFY_TABLES = [
  "app_users",
  "career_assessments",
  "chat_messages",
  "activity_entries",
  "physicians",
  "api_enrichment_runs",
  "reconciliation_items",
  "ontology_sources",
  "signal_categories",
  "job_sources",
  "user_subscriptions",
  "energy_rankings",
  "goal_records",
  "narrative_evidence",
  "transfer_pathways",
  "evidence_unit",
  "lattice_cell",
  "evidence_cell_weights",
  "acgme_frameworks",
  "acgme_subcompetencies",
  "medhub_milestone_crosswalk",
  "fcwi_responses",
  "weekly_pulse",
  "riasec_profile",
  "onet_fingerprint",
  "specialty_config",
];

async function main() {
  loadEnvLocal();

  console.log("FISCMAK Supabase migrations");
  console.log(`Trying ${buildConnectionCandidates().length} connection option(s)…`);

  const client = await connectPostgres();

  const hasAppUsers = await tableExists(client, "app_users");
  const hasPhysicians = await tableExists(client, "physicians");
  const hasActivities = await tableExists(client, "activity_entries");
  const hasOntology = await tableExists(client, "ontology_sources");
  const hasSignals = await tableExists(client, "signal_categories");
  const hasExtendedActivities = await columnExists(client, "activity_entries", "detected_signals");
  const hasJobSources = await tableExists(client, "job_sources");
  const hasSubscriptions = await tableExists(client, "user_subscriptions");
  const hasSpecialtyHierarchy = await columnExists(client, "app_users", "base_specialty");

  console.log("\nCurrent state:");
  console.log(`  app_users: ${hasAppUsers ? "yes" : "no"}`);
  console.log(`  physicians (career data): ${hasPhysicians ? "yes" : "no"}`);
  console.log(`  activity_entries: ${hasActivities ? "yes" : "no"}`);
  console.log(`  ontology_sources: ${hasOntology ? "yes" : "no"}`);
  console.log(`  signal_categories: ${hasSignals ? "yes" : "no"}`);
  console.log(`  activity_entries (7-layer): ${hasExtendedActivities ? "yes" : "no"}`);
  console.log(`  job_sources: ${hasJobSources ? "yes" : "no"}`);
  console.log(`  user_subscriptions: ${hasSubscriptions ? "yes" : "no"}`);
  console.log(`  app_users.base_specialty: ${hasSpecialtyHierarchy ? "yes" : "no"}`);

  const steps = [];

  if (!hasAppUsers) {
    steps.push({
      file: "docs/FISCMAK_V2_SCHEMA.sql",
      label: "V2 platform schema (app_users, assessments, jobs, chat…)",
    });
  } else {
    console.log("\n→ V2 platform schema — skipped (app_users exists)");
  }

  steps.push({
    file: "docs/migrations/20260521_touchpoint1_onboarding.sql",
    label: "Touchpoint 1 onboarding columns",
  });

  if (!hasActivities) {
    steps.push({
      file: "docs/migrations/20260522_activity_entries_v2.sql",
      label: "Activity entries (Mak capture + lattice)",
    });
  } else {
    console.log("\n→ Activity entries — skipped (table exists)");
  }

  if (!hasPhysicians) {
    steps.push({
      file: "docs/migrations/20260521_career_data_schema.sql",
      label: "Career Data vault schema (physicians, enrichment, reconciliation…)",
    });
  } else {
    console.log("\n→ Career Data schema — skipped (physicians exists)");
  }

  if (!hasOntology) {
    steps.push({
      file: "docs/migrations/20260523_core_ontology.sql",
      label: "Core ontology (specialties, competencies, career tracks)",
    });
  } else {
    console.log("\n→ Core ontology — skipped (ontology_sources exists)");
  }

  if (!hasSignals) {
    steps.push({
      file: "docs/migrations/20260523_signal_detection.sql",
      label: "Signal detection (categories, indicators, routing)",
    });
  } else {
    console.log("\n→ Signal detection — skipped (signal_categories exists)");
  }

  if (!hasExtendedActivities) {
    steps.push({
      file: "docs/migrations/20260523_activity_entries_extended.sql",
      label: "Activity entries 7-layer extension (signals + ontology mapping)",
      requiresTable: "activity_entries",
    });
  } else {
    console.log("\n→ Activity entries extension — skipped (detected_signals exists)");
  }

  if (!hasJobSources) {
    steps.push({
      file: "docs/migrations/20260523_career_fit_engine.sql",
      label: "Career fit engine (job sources, preferences, matches)",
    });
  } else {
    console.log("\n→ Career fit engine — skipped (job_sources exists)");
  }

  if (!hasSubscriptions) {
    steps.push({
      file: "docs/migrations/20260524_user_subscriptions.sql",
      label: "User subscriptions (Stripe premium billing)",
    });
  } else {
    console.log("\n→ User subscriptions — skipped (table exists)");
  }

  if (!hasSpecialtyHierarchy) {
    steps.push({
      file: "docs/migrations/20260523_specialty_hierarchy.sql",
      label: "Specialty hierarchy columns on app_users",
      requiresTable: "app_users",
    });
  } else {
    console.log("\n→ Specialty hierarchy — skipped (base_specialty exists)");
  }

  steps.push({
    file: "docs/migrations/20260525_gme_programs.sql",
    label: "GME programs + memberships (UH pilot)",
  });

  steps.push({
    file: "docs/migrations/20260526_program_invite_tokens.sql",
    label: "Program invite tokens + blank pathway programs",
  });

  steps.push({
    file: "docs/migrations/20260527_message_credits_feedback.sql",
    label: "Free message credits + chat feedback",
    requiresTable: "app_users",
  });

  steps.push({
    file: "docs/migrations/20260527b_message_balance_monthly_reset.sql",
    label: "Monthly message balance reset function",
    requiresTable: "app_users",
  });

  steps.push({
    file: "docs/migrations/20260528_profile_avatars_storage.sql",
    label: "Profile avatar storage bucket",
  });

  steps.push({
    file: "docs/migrations/20260529_schedule_message_balance_cron.sql",
    label: "Schedule monthly message balance reset (pg_cron)",
    requiresTable: "app_users",
  });

  steps.push({
    file: "docs/migrations/20260530_gme_evaluation_imports.sql",
    label: "GME evaluation imports + rotation evaluations",
    requiresTable: "programs",
  });

  steps.push({
    file: "docs/migrations/20260531_gme_milestone_ilp.sql",
    label: "GME milestone self-ratings + ILP goals",
    requiresTable: "app_users",
  });

  steps.push({
    file: "docs/migrations/20260532_gme_staff_ilp_survey.sql",
    label: "GME staff ILP policies + coordinator survey",
    requiresTable: "programs",
  });

  steps.push({
    file: "docs/migrations/20260533_gme_exams_medhub_sync.sql",
    label: "PRITE exams + MedHub sync runs",
    requiresTable: "programs",
  });

  steps.push({
    file: "docs/migrations/20260534_onboarding_progress.sql",
    label: "Onboarding progress tracking columns",
    requiresTable: "app_users",
  });

  steps.push({
    file: "docs/migrations/20260533_reconciliation_confidence.sql",
    label: "Reconciliation confidence tier column",
    requiresTable: "reconciliation_items",
  });

  steps.push({
    file: "docs/migrations/20260535_user_documents_storage.sql",
    label: "User documents storage bucket (PDF/DOCX uploads)",
  });

  steps.push({
    file: "docs/migrations/20260536_v3_evidence_fields.sql",
    label: "v3 evidence fields: recognition_quadrant, energy_score, sentiment, transfer_targets, time_class",
    requiresTable: "activity_entries",
  });

  steps.push({
    file: "docs/migrations/20260537_v3_physician_profile.sql",
    label: "v3 physician profile: onet_soc_code, fte columns, mak_memory_summary",
    requiresTable: "app_users",
  });

  steps.push({
    file: "docs/migrations/20260538_energy_rankings.sql",
    label: "Energy rankings table (domain energy 1–8 per user)",
  });

  steps.push({
    file: "docs/migrations/20260544_energy_rankings_rank_constraint.sql",
    label: "Fix energy_rankings rank constraint: 1–8 → 1–5 Likert (founder decision 2026-06-01)",
    requiresTable: "energy_rankings",
  });

  steps.push({
    file: "docs/migrations/20260539_goal_records.sql",
    label: "Goal records table (WOOP + SMART + Implementation Intentions)",
  });

  steps.push({
    file: "docs/migrations/20260550_goal_records_horizon_constraint.sql",
    label: "Fix goal_records horizon: ('6mo','1yr','5yr') → ('3mo','1yr','5yr','10yr') (founder decision 2026-06-01)",
    requiresTable: "goal_records",
  });

  steps.push({
    file: "docs/migrations/20260540_narrative_evidence.sql",
    label: "Narrative evidence table (Coach Mak SI probe responses)",
  });

  steps.push({
    file: "docs/migrations/20260541_transfer_pathways.sql",
    label: "Transfer pathways table (F7 — SI/OI → visible artifact routing)",
    requiresTable: "narrative_evidence",
  });

  steps.push({
    file: "docs/migrations/20260542_evidence_unit.sql",
    label: "Evidence unit table (canonical v3 evidence store — Part XXIV)",
    requiresTable: "activity_entries",
  });

  steps.push({
    file: "docs/migrations/20260543_lattice_cell.sql",
    label: "Lattice cell table (8×8 FTE discrepancy + transfer potential — Part XXIV)",
    requiresTable: "evidence_unit",
  });

  steps.push({
    file: "docs/migrations/20260545_fcwi_responses.sql",
    label: "FCWI responses table (monthly 9-item well-being instrument — Part VIII)",
  });

  steps.push({
    file: "docs/migrations/20260546_weekly_pulse.sql",
    label: "Weekly pulse table (EE + DP + QoL + MDT + energy prompts — Part VIII)",
  });

  steps.push({
    file: "docs/migrations/20260547_riasec_profile.sql",
    label: "RIASEC profile table (O*NET Interest Profiler scores — Part XXIV)",
  });

  steps.push({
    file: "docs/migrations/20260548_onet_fingerprint.sql",
    label: "O*NET fingerprint table (descriptor vector + adjacent SOC weights — Part XXIV)",
    requiresTable: "riasec_profile",
  });

  steps.push({
    file: "docs/migrations/20260549_specialty_config.sql",
    label: "Specialty config table (soc_code + 6 JSON cols — Part XII/XXIV)",
  });

  steps.push({
    file: "docs/migrations/20260551_practice_setting_government.sql",
    label: "Add Government to app_users.practice_setting CHECK constraint (BUILD_ORDER 2.2)",
    requiresTable: "app_users",
  });

  steps.push({
    file: "docs/migrations/20260552_activity_entries_cv_columns.sql",
    label: "Add source_document_id + user_confirmed to activity_entries (CV pipeline — BUILD_ORDER 4.1)",
    requiresTable: "activity_entries",
  });

  steps.push({
    file: "docs/migrations/20260553_evidence_cell_weights.sql",
    label: "evidence_cell_weights table — multi-domain lattice distribution (§8.2 resolved model)",
    requiresTable: "evidence_unit",
  });

  steps.push({
    file: "docs/migrations/20260554_rename_evidence_axes.sql",
    label: "Rename evidence axes: domain_index→skill_index, track_index→domain_index (vocabulary un-flip)",
    requiresTable: "evidence_unit",
  });

  steps.push({
    file: "docs/migrations/20260555_output_studio_wave1.sql",
    label: "Output Studio Wave 1: cv_item_metadata + output_documents (snapshot editing, no-invention rule)",
    requiresTable: "evidence_unit",  // cv_item_metadata FKs to evidence_unit
  });

  steps.push({
    file: "docs/migrations/20260556_acgme_taxonomy.sql",
    label: "ACGME taxonomy: frameworks + subcompetencies + MedHub crosswalk + lattice_skill_index (BUILD_ORDER 8.1 foundation)",
    requiresTable: "milestone_self_ratings",
  });

  let failures = 0;
  for (const step of steps) {
    if (step.requiresTable && !(await tableExists(client, step.requiresTable))) {
      console.log(`\n→ ${step.label} — skipped (${step.requiresTable} not ready)`);
      continue;
    }
    const result = await runSqlFile(client, step.file, step.label);
    if (!result.ok && !result.skipped) failures += 1;
  }

  if (await tableExists(client, "app_users")) {
    console.log("\n→ Backfill app_users from auth.users");
    try {
      await client.query(BACKFILL);
      console.log("  ✓ backfill complete");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`  ~ backfill skipped: ${msg.split("\n")[0]}`);
    }
  }

  console.log("\nVerification:");
  for (const t of VERIFY_TABLES) {
    const ok = await tableExists(client, t);
    console.log(`  ${ok ? "✓" : "✗"} ${t}`);
  }

  if (await tableExists(client, "signal_indicators")) {
    const { rows } = await client.query(
      "SELECT COUNT(*)::int AS n FROM signal_indicators WHERE active = true",
    );
    console.log(`  ✓ signal_indicators (active): ${rows[0]?.n ?? 0}`);
  }
  if (await tableExists(client, "ontology_invisible_work_activities")) {
    const { rows } = await client.query(
      "SELECT COUNT(*)::int AS n FROM ontology_invisible_work_activities WHERE active = true",
    );
    console.log(`  ✓ ontology_invisible_work_activities (active): ${rows[0]?.n ?? 0}`);
  }

  const { rows: docBucketRows } = await client.query(
    `SELECT id FROM storage.buckets WHERE id = 'user-documents'`,
  );
  console.log(
    `  ${docBucketRows[0] ? "✓" : "✗"} storage bucket user-documents (PDF/DOCX uploads)`,
  );

  await client.end();

  if (failures > 0) {
    console.error(
      `\nCompleted with ${failures} failure(s). Check errors above or run SQL manually in Supabase SQL Editor.`,
    );
    process.exit(1);
  }

  console.log("\nDone. Restart `npm run dev` and sign in to use Supabase persistence.");
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});

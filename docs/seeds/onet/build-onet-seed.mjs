#!/usr/bin/env node
/**
 * build-onet-seed.mjs — FISCMAK O*NET 30.3 seed compiler (Step 0B)
 *
 * Implements the LOCKED normalization formulas:
 *
 *   Dual-scale (Abilities, Knowledge, Skills, Work Activities):
 *     V[s,d] = 100 × max(0,(Imp−1)/4) × max(0,(Lvl−1)/6)
 *     Combines Importance (1–5) × Level (0–7), each normalized to 0–1.
 *
 *   Single-scale (Work Context, Work Styles, RIASEC, Job Zones):
 *     V[s,d] = ((x − min) / (max − min)) × 100
 *     Empirical min/max computed across all occupations.
 *
 * Produces:
 *   src/lib/v2/onet/descriptor-catalog.ts   — ordered descriptor index
 *   src/lib/v2/onet/soc-vectors.ts           — 47 needed SOC vectors
 *   src/lib/v2/onet/variance-weights.ts      — discriminative weights (physician SOCs)
 *   src/lib/v2/onet/domain-fingerprints.ts   — 8 domain vectors × 19 physician SOCs
 *   src/lib/v2/onet/adjacency-baskets.ts     — top-20 adjacencies per physician SOC
 *   docs/seeds/onet/all-soc-vectors.json     — all ~894 SOC vectors (for DB seeding)
 *
 * Attribution: O*NET 30.3 Database, U.S. DOL/ETA — CC-BY 4.0
 *   https://www.onetcenter.org/license_db.html
 *
 * Run: node docs/seeds/onet/build-onet-seed.mjs
 */

import fs   from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, "../../..");
const RAW       = path.join(ROOT, "docs/seeds/Full_Onet_Seeds");
const OUT       = path.join(ROOT, "src/lib/v2/onet");
const SEED_OUT  = path.join(ROOT, "docs/seeds/onet");

function readSheet(filename) {
  const wb = XLSX.readFile(path.join(RAW, filename));
  return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
}

function writeTs(filename, content) {
  fs.writeFileSync(path.join(OUT, filename), content, "utf8");
  console.log("  wrote", path.join("src/lib/v2/onet", filename));
}

// ── SOC scopes ──────────────────────────────────────────────────────────────

const PHYSICIAN_SOCS = [
  "29-1211.00","29-1213.00","29-1214.00","29-1215.00","29-1216.00",
  "29-1217.00","29-1218.00","29-1221.00","29-1222.00","29-1223.00",
  "29-1224.00","29-1229.00","29-1229.01","29-1229.03","29-1229.04",
  "29-1229.05","29-1241.00","29-1242.00","29-1249.00",
];

const DOMAIN_ANCHOR_SOCS = {
  Clinician:              "29-1216.00",
  Educator:               "25-1071.00",
  Researcher:             "19-1042.00",
  "Administrator/Leader": "11-9111.00",
  Advocate:               "21-1094.00",
  Innovator:              "15-2051.00",
  "Quality/Safety":       "29-9021.00",
  "Wellness Champion":    "21-1014.00",
};
const INNOVATOR_BLEND_SOC = "19-1042.00";

const ADJACENT_SOCS = [
  "11-9111.00","13-1082.00","13-1111.00","15-1211.00","15-1252.00",
  "15-1255.00","15-2051.00","17-2031.00","17-2112.00","19-1041.00",
  "19-1042.00","19-3032.00","21-1022.00","21-1094.00","23-1022.00",
  "25-1071.00","25-9031.00","27-3042.00","29-2034.00","29-9021.00",
  "29-9092.00","21-1014.00",
];

const HOBBY_SOCS = [
  "27-4021.00","27-2042.00","27-3043.00","27-1013.00",
  "15-1252.00","29-9091.00","35-1011.00",
];

const ALL_NEEDED_SOCS = new Set([
  ...PHYSICIAN_SOCS,
  ...Object.values(DOMAIN_ANCHOR_SOCS),
  INNOVATOR_BLEND_SOC,
  ...ADJACENT_SOCS,
  ...HOBBY_SOCS,
]);

// ── §4 task → descriptor names (O*NET 30.3 exact names) ────────────────────

const TASK_DESCRIPTOR_NAMES = {
  "Clinical Expertise": {
    Knowledge:       ["Medicine and Dentistry", "Biology", "Chemistry"],
    Skills:          ["Science", "Critical Thinking", "Judgment and Decision Making"],
    WorkActivities:  ["Assisting and Caring for Others", "Making Decisions and Solving Problems", "Updating and Using Relevant Knowledge"],
    WorkStyles:      ["Attention to Detail", "Dependability", "Stress Tolerance"],
    WorkContext:     ["Consequence of Error", "Health and Safety of Other Workers", "Dealing with Violent or Physically Aggressive People"],
  },
  "Medical Knowledge": {
    Knowledge:       ["Medicine and Dentistry", "Biology", "Mathematics"],
    Skills:          ["Active Learning", "Reading Comprehension", "Science"],
    WorkActivities:  ["Updating and Using Relevant Knowledge", "Analyzing Data or Information", "Processing Information"],
    WorkStyles:      ["Intellectual Curiosity", "Achievement Orientation", "Initiative"],
    WorkContext:     ["Importance of Being Exact or Accurate"],
  },
  "Practice-Based Learning": {
    Knowledge:       ["Education and Training", "English Language"],
    Skills:          ["Learning Strategies", "Active Learning", "Complex Problem Solving"],
    WorkActivities:  ["Evaluating Information to Determine Compliance", "Judging the Qualities", "Monitoring Processes"],
    WorkStyles:      ["Achievement Orientation", "Perseverance", "Initiative"],
    WorkContext:     ["Frequency of Decision Making"],
  },
  "Communication": {
    Knowledge:       ["Psychology", "Customer and Personal Service", "English Language"],
    Skills:          ["Active Listening", "Speaking", "Social Perceptiveness"],
    WorkActivities:  ["Communicating with Supervisors", "Establishing and Maintaining Interpersonal", "Resolving Conflicts and Negotiating"],
    WorkStyles:      ["Cooperation", "Empathy", "Social Orientation"],
    WorkContext:     ["Contact With Others", "Face-to-Face Discussions with Individuals and Within Teams", "Dealing With Unpleasant, Angry, or Discourteous People"],
  },
  "Professionalism & Ethics": {
    Knowledge:       ["Philosophy and Theology", "Law and Government", "Psychology"],
    Skills:          ["Judgment and Decision Making", "Social Perceptiveness"],
    WorkActivities:  ["Evaluating Information to Determine Compliance", "Resolving Conflicts and Negotiating"],
    WorkStyles:      ["Integrity", "Self-Control", "Dependability"],
    WorkContext:     ["Consequence of Error", "Health and Safety of Other Workers"],
  },
  "Systems Thinking": {
    Knowledge:       ["Administration and Management", "Public Safety and Security", "Law and Government"],
    Skills:          ["Systems Analysis", "Systems Evaluation", "Management of Personnel Resources"],
    WorkActivities:  ["Coordinating the Work and Activities", "Developing Objectives and Strategies", "Organizing, Planning"],
    WorkStyles:      ["Leadership Orientation", "Adaptability", "Initiative"],
    WorkContext:     ["Impact of Decisions on Co-workers or Company Results", "Coordinate or Lead Others in Accomplishing Work Activities"],
  },
  "Collaboration & Teamwork": {
    Knowledge:       ["Customer and Personal Service", "Administration and Management"],
    Skills:          ["Coordination", "Persuasion", "Negotiation"],
    WorkActivities:  ["Communicating with Supervisors", "Establishing and Maintaining Interpersonal", "Coordinating the Work and Activities"],
    WorkStyles:      ["Cooperation", "Leadership Orientation", "Social Orientation"],
    WorkContext:     ["Work With or Contribute to a Work Group or Team", "Coordinate or Lead Others in Accomplishing Work Activities"],
  },
};

const SKILL_NAMES = [
  "Clinical Expertise","Medical Knowledge","Practice-Based Learning",
  "Communication","Professionalism & Ethics","Systems Thinking",
  "Collaboration & Teamwork",
];

const DOMAIN_LABELS = [
  "Clinician","Educator","Researcher","Administrator/Leader",
  "Advocate","Innovator","Quality/Safety","Wellness Champion",
];

const DOMAIN_RANK_MATRIX = [
  [1,2,6,3,4,7,5],
  [5,6,2,1,7,8,3],
  [5,1,2,4,8,7,6],
  [6,7,5,4,3,1,2],
  [5,6,7,3,2,1,4],
  [5,3,1,4,7,2,6],
  [3,7,1,5,6,2,4],
  [5,8,6,4,3,7,2],
];

function rankWeight(rank) { return (8 - rank) / 35; }

// ── load raw O*NET data ──────────────────────────────────────────────────────

console.log("Loading O*NET 30.3 data…");

// Dual-scale: load BOTH IM and LV rows
const abRows  = readSheet("Abilities.xlsx");
const knRows  = readSheet("Knowledge.xlsx");
const waRows  = readSheet("Work Activities.xlsx");
const esRows  = readSheet("Essential Skills.xlsx");
const tsRows  = readSheet("Transferable Skills.xlsx");

// Single-scale
const wcRows  = readSheet("Work Context.xlsx").filter(r => r["Scale ID"] === "CX");
const wsRows  = readSheet("Work Styles.xlsx").filter(r => r["Scale ID"] === "WI");
const oiRows  = readSheet("Career Interest Types.xlsx").filter(r => r["Scale ID"] === "OI");
const jzRows  = readSheet("Job Zones.xlsx");
const occRows = readSheet("Occupation Data.xlsx");

// ── descriptor catalog (ordered) ────────────────────────────────────────────

console.log("Building descriptor catalog…");

function uniqueElemsFrom(rows, scaleId) {
  const seen = new Map();
  for (const r of rows) {
    if (r["Scale ID"] === scaleId && !seen.has(r["Element ID"])) {
      seen.set(r["Element ID"], r["Element Name"]);
    }
  }
  return [...seen.entries()].sort((a,b) => a[0].localeCompare(b[0]));
}

// Dual-scale categories use IM as the anchor for catalog order
const CATALOG_CATEGORIES = [
  { cat: "Abilities",          rows: abRows,  scale: "IM", type: "dual"   },
  { cat: "Knowledge",          rows: knRows,  scale: "IM", type: "dual"   },
  { cat: "WorkActivities",     rows: waRows,  scale: "IM", type: "dual"   },
  { cat: "EssentialSkills",    rows: esRows,  scale: "IM", type: "dual"   },
  { cat: "TransferableSkills", rows: tsRows,  scale: "IM", type: "dual"   },
  { cat: "WorkContext",        rows: wcRows,  scale: "CX", type: "single" },
  { cat: "WorkStyles",         rows: wsRows,  scale: "WI", type: "single" },
  { cat: "RIASEC",             rows: oiRows,  scale: "OI", type: "single" },
];
// Job Zone: one synthetic element appended
const JOB_ZONE_DESCRIPTOR = { idx: 0, elementId: "JZ.1", title: "Job Zone", category: "JobZone" };

const descriptorCatalog = [];
let idx = 0;
for (const { cat, rows, scale } of CATALOG_CATEGORIES) {
  for (const [eid, ename] of uniqueElemsFrom(rows, scale)) {
    descriptorCatalog.push({ idx: idx++, elementId: eid, title: ename, category: cat });
  }
}
JOB_ZONE_DESCRIPTOR.idx = idx;
descriptorCatalog.push(JOB_ZONE_DESCRIPTOR);
const N = descriptorCatalog.length;
console.log(`  ${N} descriptors (${idx} content-model + 1 Job Zone)`);

// Lookup maps
const elemIdxByEid   = new Map(descriptorCatalog.map(d => [d.elementId, d.idx]));
const elemIdxByName  = new Map(descriptorCatalog.map(d => [d.title.toLowerCase(), d.idx]));

function findDescriptorIdx(nameFrag) {
  const frag = nameFrag.toLowerCase();
  if (elemIdxByName.has(frag)) return elemIdxByName.get(frag);
  for (const [title, i] of elemIdxByName) {
    if (title.includes(frag) || frag.includes(title)) return i;
  }
  return null;
}

// ── compute single-scale empirical min/max ───────────────────────────────────

// ── single-scale declared anchors (reproducible across O*NET versions) ──────
// Declared, not empirical — so the scaffold is stable when O*NET updates.

const wcRange = { min: 1, max: 5 };  // Work Context CX (1–5 frequency/context)
const wsRange = { min: 1, max: 5 };  // Work Styles WI  (1–5 importance)
const oiRange = { min: 1, max: 7 };  // RIASEC OI       (1–7 interest)
const jzRange = { min: 1, max: 5 };  // Job Zone        (1–5)

console.log("Single-scale declared anchors:");
console.log(`  Work Context CX:  ${wcRange.min} – ${wcRange.max}`);
console.log(`  Work Styles  WI:  ${wsRange.min} – ${wsRange.max}`);
console.log(`  RIASEC       OI:  ${oiRange.min} – ${oiRange.max}`);

function singleScale(val, { min, max }) {
  if (max === min) return 0;
  return Math.max(0, Math.min(100, ((val - min) / (max - min)) * 100));
}

// ── dual-scale normalization ─────────────────────────────────────────────────

// LOCKED: Level is 0–7, use lv/7. Do NOT revert to (lv-1)/6. See FISCMAK_ONET_Scaffold_Build.md.
// V = 100 × max(0,(IM−1)/4) × max(0,LV/7)
function dualScale(im, lv) {
  const normIm = Math.max(0, (im - 1) / 4);
  const normLv = Math.max(0, lv / 7);          // Level 0–7 → 0–1, preserves the full range
  return 100 * normIm * normLv;
}

// ── index raw data for fast lookup ──────────────────────────────────────────

console.log("Indexing raw rows (IM + LV for dual-scale, single-value for others)…");

// dualIndex[(soc,eid)].im and .lv
const dualIndex = new Map();
function ingestDualRows(rows) {
  for (const r of rows) {
    const soc = r["O*NET-SOC Code"];
    const eid = r["Element ID"];
    const sid = r["Scale ID"];
    const val = parseFloat(r["Data Value"]);
    if (isNaN(val) || (sid !== "IM" && sid !== "LV")) continue;
    const key = `${soc}|${eid}`;
    if (!dualIndex.has(key)) dualIndex.set(key, { im: 0, lv: 0 });
    if (sid === "IM") dualIndex.get(key).im = val;
    else              dualIndex.get(key).lv = val;
  }
}

ingestDualRows(abRows);
ingestDualRows(knRows);
ingestDualRows(waRows);
ingestDualRows(esRows);
ingestDualRows(tsRows);

// singleIndex[(soc,eid)] = value
const singleIndex = new Map();
function ingestSingleRows(rows) {
  for (const r of rows) {
    const soc = r["O*NET-SOC Code"];
    const eid = r["Element ID"];
    const val = parseFloat(r["Data Value"]);
    if (!isNaN(val)) singleIndex.set(`${soc}|${eid}`, val);
  }
}
ingestSingleRows(wcRows);
ingestSingleRows(wsRows);
ingestSingleRows(oiRows);

// Job Zone index
const jzIndex = new Map(jzRows.map(r => [r["O*NET-SOC Code"], r["Job Zone"]]));

// All SOC codes in the dataset
const allSocCodes = [...new Set(occRows.map(r => r["O*NET-SOC Code"]))];
console.log(`  ${allSocCodes.length} total occupations in O*NET 30.3`);

// SOC titles
const socTitles = {};
occRows.forEach(r => { socTitles[r["O*NET-SOC Code"]] = r["Title"]; });

// Identify dual-scale descriptor indices for the catalog
const dualDescriptorIndices = new Set(
  descriptorCatalog.filter(d => ["Abilities","Knowledge","WorkActivities","EssentialSkills","TransferableSkills"].includes(d.category)).map(d => d.idx)
);
const singleDescriptorRows = new Map(
  descriptorCatalog.filter(d => ["WorkContext","WorkStyles","RIASEC"].includes(d.category)).map(d => [d.elementId, { idx: d.idx, cat: d.category }])
);

// ── build vectors for all SOCs ───────────────────────────────────────────────

console.log("Building descriptor vectors for all occupations…");

// Catalog order: [dual descriptors..., single descriptors..., JobZone]
// Build descriptor index ranges
const dualCatalogDescs  = descriptorCatalog.filter(d => dualDescriptorIndices.has(d.idx));
const singleCatalogDescs= descriptorCatalog.filter(d => ["WorkContext","WorkStyles","RIASEC"].includes(d.category));

function buildVector(soc) {
  const v = new Float64Array(N); // default 0.0

  // Dual-scale descriptors
  for (const desc of dualCatalogDescs) {
    const key = `${soc}|${desc.elementId}`;
    const entry = dualIndex.get(key);
    if (entry) v[desc.idx] = dualScale(entry.im, entry.lv);
  }

  // Single-scale descriptors
  for (const desc of singleCatalogDescs) {
    const key = `${soc}|${desc.elementId}`;
    const raw = singleIndex.get(key);
    if (raw !== undefined) {
      let range;
      if (desc.category === "WorkContext") range = wcRange;
      else if (desc.category === "WorkStyles") range = wsRange;
      else range = oiRange;
      v[desc.idx] = singleScale(raw, range);
    }
  }

  // Job Zone (single numeric, fixed range 1–5)
  const jz = jzIndex.get(soc);
  if (jz) v[N-1] = singleScale(jz, jzRange);

  return v;
}

// Build all SOC vectors
const allVectors = new Map();
for (const soc of allSocCodes) {
  allVectors.set(soc, buildVector(soc));
}
console.log(`  built ${allVectors.size} vectors (${N} dims each)`);

// ── synthesize catch-all codes (no direct O*NET data) ───────────────────────

function avgVectors(socs) {
  const vecs = socs.map(s => allVectors.get(s)).filter(Boolean);
  if (!vecs.length) return null;
  const avg = new Float64Array(N);
  for (const v of vecs) for (let i = 0; i < N; i++) avg[i] += v[i] / vecs.length;
  return avg;
}

// 29-1229.00 (Physicians, All Other): average of sub-codes
if (!allVectors.get("29-1229.00") || allVectors.get("29-1229.00").every(v=>v===0)) {
  const v = avgVectors(["29-1229.01","29-1229.03","29-1229.04","29-1229.05"]);
  if (v) { allVectors.set("29-1229.00", v); console.log("  synthesized 29-1229.00 from 4 sub-codes"); }
}
// 29-1249.00 (Surgeons, All Other): average of surgical sub-codes
if (!allVectors.get("29-1249.00") || allVectors.get("29-1249.00").every(v=>v===0)) {
  const v = avgVectors(["29-1241.00","29-1242.00","29-1243.00"]);
  if (v) { allVectors.set("29-1249.00", v); console.log("  synthesized 29-1249.00 from 3 surgical sub-codes"); }
}

// ── variance weights across physician SOCs ────────────────────────────────────

console.log("Computing variance weights across physician SOCs…");

const physVecs = PHYSICIAN_SOCS.map(s => allVectors.get(s)).filter(Boolean);
console.log(`  using ${physVecs.length} physician SOC vectors`);

const varianceWeights = new Array(N).fill(0);
for (let i = 0; i < N; i++) {
  const vals = physVecs.map(v => v[i]);
  const mean = vals.reduce((a,b) => a+b, 0) / vals.length;
  varianceWeights[i] = vals.reduce((s,v) => s + (v-mean)**2, 0) / vals.length;
}
// Normalize to sum = 1
const varSum = varianceWeights.reduce((a,b) => a+b, 0);
const normVarWeights = varianceWeights.map(v => varSum > 0 ? v / varSum : 1 / N);

const topVarDescs = descriptorCatalog
  .map((d,i) => ({ ...d, w: normVarWeights[i] }))
  .sort((a,b) => b.w - a.w)
  .slice(0, 10)
  .map(d => `${d.title} (${d.w.toFixed(4)})`);
console.log("  Top-10 discriminative descriptors:", topVarDescs.join(", "));

// ── extract needed SOC vectors ────────────────────────────────────────────────

const neededVectors = {};
for (const soc of ALL_NEEDED_SOCS) {
  const v = allVectors.get(soc);
  if (!v) { console.warn(`  WARN: ${soc} not found`); continue; }
  neededVectors[soc] = Array.from(v).map(x => parseFloat(x.toFixed(4)));
}

// ── §4 task descriptor masks ─────────────────────────────────────────────────

const taskMasks = {};
for (const [task, catMap] of Object.entries(TASK_DESCRIPTOR_NAMES)) {
  const indices = new Set();
  for (const names of Object.values(catMap)) {
    for (const name of names) {
      const i = findDescriptorIdx(name);
      if (i !== null) indices.add(i);
    }
  }
  taskMasks[task] = [...indices];
}

// ── domain fingerprints (Stage 5) ─────────────────────────────────────────────

console.log("Computing domain fingerprints…");

const domainFingerprints = {};
for (const physSoc of PHYSICIAN_SOCS) {
  const vBase = neededVectors[physSoc];
  if (!vBase) continue;
  domainFingerprints[physSoc] = {};

  for (let d = 0; d < DOMAIN_LABELS.length; d++) {
    const label    = DOMAIN_LABELS[d];
    const anchSoc  = DOMAIN_ANCHOR_SOCS[label];
    let   vAnchor  = neededVectors[anchSoc];
    if (!vAnchor) continue;

    if (label === "Innovator" && neededVectors[INNOVATOR_BLEND_SOC]) {
      const vBlend = neededVectors[INNOVATOR_BLEND_SOC];
      vAnchor = vAnchor.map((v, i) => (v + vBlend[i]) / 2);
    }

    // V_task_sum: anchor vector filtered to each task's §4 descriptors, rank-weighted
    const vTaskSum = new Array(N).fill(0);
    const ranks = DOMAIN_RANK_MATRIX[d];
    for (let s = 0; s < SKILL_NAMES.length; s++) {
      const mask = taskMasks[SKILL_NAMES[s]] ?? [];
      const w    = rankWeight(ranks[s]);
      for (const i of mask) vTaskSum[i] += w * vAnchor[i];
    }

    domainFingerprints[physSoc][label] = vBase.map(
      (v, i) => parseFloat((0.5 * v + 0.5 * vTaskSum[i]).toFixed(4))
    );
  }
}

// ── adjacency baskets (Job Zone ≥ 3, top 20) ────────────────────────────────

console.log("Computing adjacency baskets (Job Zone ≥ 3)…");

const candidatePool = [];
for (const [soc, vec] of allVectors.entries()) {
  if (String(soc).startsWith("29-1")) continue;
  if ((jzIndex.get(soc) ?? 0) < 3) continue;
  candidatePool.push({ soc, title: socTitles[soc] ?? soc, vec: Array.from(vec) });
}
console.log(`  candidate pool: ${candidatePool.length} non-physician Job-Zone-≥3 occupations`);

function cosineSim(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na  += a[i] * a[i];
    nb  += b[i] * b[i];
  }
  return na > 0 && nb > 0 ? dot / Math.sqrt(na * nb) : 0;
}

const adjacencyBaskets = {};
for (const physSoc of PHYSICIAN_SOCS) {
  const vBase = neededVectors[physSoc];
  if (!vBase) continue;
  const sims = candidatePool.map(c => ({
    soc:        c.soc,
    title:      c.title,
    similarity: parseFloat(cosineSim(vBase, c.vec).toFixed(4)),
  }));
  sims.sort((a, b) => b.similarity - a.similarity);
  adjacencyBaskets[physSoc] = sims.slice(0, 20);
}

// ── write all-SOC JSON (for DB seeding) ──────────────────────────────────────

console.log("Writing all-soc-vectors.json…");
const allSocObj = {};
for (const [soc, vec] of allVectors.entries()) {
  allSocObj[soc] = {
    title: socTitles[soc] ?? soc,
    job_zone: jzIndex.get(soc) ?? null,
    vector: Array.from(vec).map(x => parseFloat(x.toFixed(4))),
  };
}
fs.writeFileSync(
  path.join(SEED_OUT, "all-soc-vectors.json"),
  JSON.stringify(allSocObj),
  "utf8"
);
console.log(`  wrote docs/seeds/onet/all-soc-vectors.json (${Object.keys(allSocObj).length} SOCs)`);

// ── write TypeScript seed files ───────────────────────────────────────────────

console.log("\nWriting TypeScript seed files…");

const BANNER = `// AUTO-GENERATED by docs/seeds/onet/build-onet-seed.mjs — do not edit manually.
// Source: O*NET 30.3 Database, U.S. DOL/ETA, May 2026. CC-BY 4.0.
// Normalization: dual-scale V=100×((Im-1)/4)×(Lv/7); single-scale V=((x-min)/(max-min))×100 (declared anchors)
// https://www.onetcenter.org/license_db.html\n\n`;

writeTs("descriptor-catalog.ts", BANNER +
  `export type OnetDescriptor = {
  idx: number;
  elementId: string;
  title: string;
  category: "Abilities"|"Knowledge"|"WorkActivities"|"EssentialSkills"|"TransferableSkills"|"WorkContext"|"WorkStyles"|"RIASEC"|"JobZone";
};\n\n` +
  `export const DESCRIPTOR_CATALOG: readonly OnetDescriptor[] = ${JSON.stringify(descriptorCatalog, null, 2)} as const;\n\n` +
  `export const DESCRIPTOR_COUNT = ${N};\n\n` +
  `/** Normalization metadata for reference and DB validation. */\n` +
  `export const NORMALIZATION_META = ${JSON.stringify({
    version: "O*NET 30.3",
    dualScale:   { formula: "100 × max(0,(Im-1)/4) × max(0,Lv/7)", categories: ["Abilities","Knowledge","WorkActivities","EssentialSkills","TransferableSkills"] },
    singleScale: { formula: "((x-min)/(max-min))×100", ranges: { WorkContext: wcRange, WorkStyles: wsRange, RIASEC: oiRange, JobZone: jzRange } },
  }, null, 2)} as const;\n`
);

writeTs("soc-vectors.ts", BANNER +
  `/** Normalized O*NET 30.3 descriptor vectors (${N}-dim) for all SOC codes used in FISCMAK. */\n` +
  `export const SOC_VECTORS: Readonly<Record<string, readonly number[]>> = ${JSON.stringify(neededVectors, null, 1)};\n`
);

writeTs("variance-weights.ts", BANNER +
  `/**
 * Per-descriptor discriminative variance across ${physVecs.length} physician SOCs (29-12xx).
 * Normalized so weights sum to 1. High weight = strong signal for distinguishing physician types.
 * Used in variance-weighted cosine similarity for F6 Person-Occupation Fit.
 */\n` +
  `export const VARIANCE_WEIGHTS: readonly number[] = [\n  ` +
  normVarWeights.map(v => v.toFixed(8)).join(",\n  ") +
  "\n];\n"
);

writeTs("domain-fingerprints.ts", BANNER +
  `/**
 * Precomputed domain fingerprints per physician SOC.
 * Formula: V_domain = 0.50 × V_base + 0.50 × Σ_r w_r × (V_anchor filtered to §4 task descriptors).
 * Excludes PPD per spec (no O*NET descriptor for identity/self-reflection).
 */\n` +
  `export const DOMAIN_FINGERPRINTS: Readonly<Record<string, Readonly<Record<string, readonly number[]>>>> =\n` +
  `  ${JSON.stringify(domainFingerprints, null, 1)};\n\n` +
  `export const DOMAIN_LABELS = [\n` +
  DOMAIN_LABELS.map(l => `  "${l}"`).join(",\n") + "\n] as const;\n\n" +
  `export const DOMAIN_ANCHOR_SOCS: Readonly<Record<string, string>> = ${JSON.stringify(DOMAIN_ANCHOR_SOCS, null, 2)};\n`
);

const neededTitles = {};
for (const soc of ALL_NEEDED_SOCS) {
  if (socTitles[soc]) neededTitles[soc] = socTitles[soc];
}

writeTs("adjacency-baskets.ts", BANNER +
  `export type AdjacentOccupation = { soc: string; title: string; similarity: number };\n\n` +
  `/** Top-20 non-physician Job-Zone-≥3 adjacent occupations per physician SOC (cosine similarity on ${N}-dim vectors). */\n` +
  `export const ADJACENCY_BASKETS: Readonly<Record<string, readonly AdjacentOccupation[]>> = ` +
  `${JSON.stringify(adjacencyBaskets, null, 1)};\n\n` +
  `export const SOC_TITLES: Readonly<Record<string, string>> = ${JSON.stringify(neededTitles, null, 2)};\n`
);

// ── summary ───────────────────────────────────────────────────────────────────

console.log("\n✓ Step 0B complete — O*NET 30.3 dual-scale normalization applied.");
console.log(`  Descriptor dimensions: ${N}`);
console.log(`    Dual-scale (Abilities + Knowledge + WorkActivities + Skills): ${dualCatalogDescs.length}`);
console.log(`    Single-scale (WorkContext + WorkStyles + RIASEC + JobZone):   ${N - dualCatalogDescs.length}`);
console.log(`  SOC vectors built: ${allVectors.size} total, ${Object.keys(neededVectors).length} bundled in TS`);
console.log(`  Physician SOCs for variance: ${physVecs.length}`);
console.log(`  Non-physician adjacency pool (Job Zone ≥ 3): ${candidatePool.length}`);
console.log(`  Note: Work Values not present in O*NET 30.3 seed (VH/EX scales in reference only).`);
console.log("  Attribution: O*NET 30.3 Database, U.S. DOL/ETA — CC-BY 4.0");
console.log("  https://www.onetcenter.org/license_db.html");

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

// §9A — new anchor SOCs from subspecialty CSV + substitutes for flagged codes
const SUBSPECIALTY_ANCHOR_SOCS = [
  // New parent SOC (Cardiologists — used in subspecialty CSV but not in original PHYSICIAN_SOCS)
  "29-1212.00",
  // New anchor SOCs net-new from the subspecialty CSV
  "17-2072.00","29-2031.00","29-1126.00","25-1042.00","21-1015.00",
  "21-1011.00","21-1012.00","29-2099.00","19-4092.00","29-1123.00",
  "29-1029.00","51-9071.00","29-1127.00","29-2033.00","17-2199.00",
  "11-9121.00","19-2031.00","19-1022.00","29-2032.00","29-1161.00",
  "29-1041.00","17-2011.00",
  // Substitutes for the 5 flagged stale O*NET 30.3 codes
  "19-3033.00","11-9161.00","29-2042.00","29-2043.00","25-2059.00","29-2011.00",
  // Already present in other lists but ensure they are included
  "17-2112.00","19-1042.00","19-1041.00","21-1022.00","15-1252.00",
  "11-9111.00","29-9091.00","27-1013.00","19-3032.00","15-2051.00",
  "29-9092.00","13-1041.00","29-2034.00",
];

const ALL_NEEDED_SOCS = new Set([
  ...PHYSICIAN_SOCS,
  ...Object.values(DOMAIN_ANCHOR_SOCS),
  INNOVATOR_BLEND_SOC,
  ...ADJACENT_SOCS,
  ...HOBBY_SOCS,
  ...SUBSPECIALTY_ANCHOR_SOCS,
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

// Σ(8−rank) for active ranks 1..7 = 28. Denominator 28 makes weights sum to 1.0 (true 50/50 blend).
function rankWeight(rank) { return (8 - rank) / 28; }

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

// ── §9A Subspecialty anchor integration ───────────────────────────────────────

console.log("\n§9A — Computing subspecialty blended vectors and fingerprints…");

// Five stale O*NET 30.3 codes from the CSV — use substitutes for computation.
// Do NOT auto-correct in the CSV data; flag clearly so auditors can track provenance.
const ANCHOR_SOC_SUBSTITUTES = {
  "19-3031.00": "19-3033.00",  // Clinical Psychologists → renamed Clinical and Counseling Psychologists
  "13-1061.00": "11-9161.00",  // Emergency Mgmt Directors — wrong SOC family; 11-9161 is correct
  "29-2041.00": ["29-2042.00","29-2043.00"],  // EMTs/Paramedics split → average of both sub-codes
  "25-2054.00": "25-2059.00",  // Special Education Teachers restructured → All Other
  "29-2010.00": "29-2011.00",  // Clinical Lab Tech group code → Medical & Clinical Lab Technologists
};

// Anchor SOCs in the 29-1xxx range are physician/allied-health family codes.
// The adjacency basket candidate pool EXCLUDES 29-1xxx (same as the main basket pipeline).
// These anchors will never appear in top-20 adjacency results — by design, not an error.
const ANCHOR_SOCS_EXCLUDED_FROM_POOL = new Set([
  "29-1126.00","29-1123.00","29-1127.00","29-1161.00","29-1041.00","29-1029.00",
]);

const SUBSPECIALTY_CSV_DATA = [
  // [subspecialty, parent_soc (no .00), tier, anchor_soc_csv (with .00), anchor_title, alpha]
  ["Electrophysiology","29-1212",2,"17-2072.00","Electronics Engineers",0.2],
  ["Interventional Cardiology","29-1212",2,"29-2031.00","Cardiovascular Technologists",0.2],
  ["Advanced Heart Failure/Transplant","29-1212",2,"21-1022.00","Healthcare Social Workers",0.2],
  ["Adult Congenital Heart","29-1212",2,"25-1042.00","Biological Science Teachers, Postsec",0.2],
  ["Gastroenterology","29-1216",2,"29-2034.00","Radiologic Technologists",0.2],
  ["Hepatology/Transplant","29-1216",2,"21-1022.00","Healthcare Social Workers",0.2],
  ["Pulmonary/Critical Care","29-1216",2,"29-1126.00","Respiratory Therapists",0.2],
  ["Interventional Pulmonology","29-1216",2,"29-2034.00","Radiologic Technologists",0.2],
  ["Hematology/Oncology","29-1216",2,"19-1042.00","Medical Scientists",0.2],
  ["Endocrinology","29-1216",2,"19-1042.00","Medical Scientists",0.2],
  ["Nephrology","29-1216",2,"17-2112.00","Industrial Engineers",0.2],
  ["Rheumatology","29-1216",2,"19-1042.00","Medical Scientists",0.2],
  ["Infectious Disease","29-1216",2,"19-1041.00","Epidemiologists",0.2],
  ["Geriatric Medicine (IM)","29-1216",2,"21-1015.00","Rehabilitation Counselors",0.2],
  ["Critical Care Medicine","29-1216",2,"29-1126.00","Respiratory Therapists",0.2],
  ["Allergy & Immunology","29-1216",2,"19-1042.00","Medical Scientists",0.2],
  ["Clinical Informatics (IM)","29-1216",2,"15-1252.00","Software Developers",0.2],
  ["Hospice & Palliative (IM)","29-1216",2,"21-1022.00","Healthcare Social Workers",0.2],
  ["Sleep Medicine (IM)","29-1216",2,"29-2099.00","Health Technologists, All Other",0.2],
  ["Hospital Medicine (Adult)","29-1216",2,"11-9111.00","Medical/Health Services Managers",0.2],
  ["FM / Geriatric Medicine","29-1215",2,"21-1015.00","Rehabilitation Counselors",0.2],
  ["FM / Sports Medicine","29-1215",2,"29-9091.00","Athletic Trainers",0.2],
  ["FM / Hospice & Palliative","29-1215",2,"21-1022.00","Healthcare Social Workers",0.2],
  ["FM / Addiction Medicine","29-1215",2,"21-1011.00","Substance Abuse Counselors",0.2],
  ["FM / Adolescent Medicine","29-1215",2,"21-1012.00","Educational/Career Counselors",0.2],
  ["Neonatology","29-1221",2,"29-1126.00","Respiratory Therapists",0.2],
  ["Peds Cardiology","29-1221",2,"29-2031.00","Cardiovascular Technologists",0.2],
  ["Peds Critical Care","29-1221",2,"29-1126.00","Respiratory Therapists",0.2],
  ["Peds Emergency Medicine","29-1221",2,"29-2041.00","EMTs/Paramedics",0.2],
  ["Peds GI","29-1221",2,"29-2034.00","Radiologic Technologists",0.2],
  ["Peds Heme/Onc","29-1221",2,"19-1042.00","Medical Scientists",0.2],
  ["Peds Endocrinology","29-1221",2,"19-1042.00","Medical Scientists",0.2],
  ["Peds Pulmonology","29-1221",2,"29-1126.00","Respiratory Therapists",0.2],
  ["Peds Nephrology","29-1221",2,"17-2112.00","Industrial Engineers",0.2],
  ["Peds Rheumatology","29-1221",2,"19-1042.00","Medical Scientists",0.2],
  ["Peds Infectious Disease","29-1221",2,"19-1041.00","Epidemiologists",0.2],
  ["Developmental-Behavioral Peds","29-1221",2,"19-3031.00","Clinical Psychologists",0.2],
  ["Adolescent Medicine","29-1221",2,"21-1012.00","Educational/Career Counselors",0.2],
  ["Child Abuse Pediatrics","29-1221",2,"19-4092.00","Forensic Science Technicians",0.2],
  ["Peds Hospital Medicine","29-1221",2,"11-9111.00","Medical/Health Services Managers",0.2],
  ["Child & Adolescent Psychiatry","29-1223",2,"25-2054.00","Special Education Teachers",0.2],
  ["Addiction Psychiatry","29-1223",2,"21-1011.00","Substance Abuse Counselors",0.2],
  ["Forensic Psychiatry","29-1223",2,"19-4092.00","Forensic Science Technicians",0.2],
  ["Geriatric Psychiatry","29-1223",2,"21-1015.00","Rehabilitation Counselors",0.2],
  ["Consultation-Liaison Psychiatry","29-1223",2,"11-9111.00","Medical/Health Services Managers",0.2],
  ["Addiction Medicine (Psych)","29-1223",2,"21-1011.00","Substance Abuse Counselors",0.2],
  ["Surgical Critical Care","29-1249",2,"29-1126.00","Respiratory Therapists",0.2],
  ["Pediatric Surgery","29-1249",2,"25-2054.00","Special Education Teachers",0.2],
  ["Complex Surgical Oncology","29-1249",2,"19-1042.00","Medical Scientists",0.2],
  ["Vascular Surgery","29-1249",2,"17-2112.00","Industrial Engineers",0.2],
  ["Hand Surgery (Surgery)","29-1249",2,"29-1123.00","Physical Therapists",0.2],
  ["Ortho / Sports Medicine","29-1242",2,"29-9091.00","Athletic Trainers",0.2],
  ["Ortho / Spine","29-1242",2,"17-2112.00","Industrial Engineers",0.2],
  ["Ortho / Hand","29-1242",2,"29-1123.00","Physical Therapists",0.2],
  ["Ortho / Trauma","29-1242",2,"29-2041.00","EMTs/Paramedics",0.2],
  ["Ortho / Pediatric","29-1242",2,"25-2054.00","Special Education Teachers",0.2],
  ["Ortho / Adult Reconstruction","29-1242",2,"17-2112.00","Industrial Engineers",0.2],
  ["Ortho / MSK Oncology","29-1242",2,"19-1042.00","Medical Scientists",0.2],
  ["Otolaryngology (ENT)","29-1249",2,"29-1029.00","Dentists, All Other",0.2],
  ["ENT / Neurotology","29-1249",2,"17-2072.00","Electronics Engineers",0.2],
  ["ENT / Pediatric ENT","29-1249",2,"25-2054.00","Special Education Teachers",0.2],
  ["ENT / Head & Neck Surg Onc","29-1249",2,"19-1042.00","Medical Scientists",0.2],
  ["ENT / Facial Plastic","29-1249",2,"27-1013.00","Fine Artists (Sculptors)",0.2],
  ["ENT / Laryngology","29-1249",2,"29-1127.00","Speech-Language Pathologists",0.2],
  ["ENT / Rhinology","29-1249",2,"29-2034.00","Radiologic Technologists",0.2],
  ["Urology","29-1249",2,"17-2112.00","Industrial Engineers",0.2],
  ["Urology / Pediatric","29-1249",2,"25-2054.00","Special Education Teachers",0.2],
  ["Urology / Female Pelvic/Recon","29-1249",2,"29-1123.00","Physical Therapists",0.2],
  ["Thoracic Surgery","29-1249",2,"17-2112.00","Industrial Engineers",0.2],
  ["Congenital Cardiac Surgery","29-1249",2,"17-2072.00","Electronics Engineers",0.2],
  ["Plastic Surgery","29-1249",2,"27-1013.00","Fine Artists (Sculptors)",0.2],
  ["Plastic / Hand Surgery","29-1249",2,"29-1123.00","Physical Therapists",0.2],
  ["Plastic / Craniofacial","29-1249",2,"17-2112.00","Industrial Engineers",0.2],
  ["Plastic / Microsurgery","29-1249",2,"51-9071.00","Jewelers/Precious Stone Workers",0.2],
  ["Colorectal Surgery","29-1249",2,"17-2112.00","Industrial Engineers",0.2],
  ["EM / Medical Toxicology","29-1214",2,"19-4092.00","Forensic Science Technicians",0.2],
  ["EM / Sports Medicine","29-1214",2,"29-9091.00","Athletic Trainers",0.2],
  ["EM / Ultrasound","29-1214",2,"29-2032.00","Diagnostic Medical Sonographers",0.2],
  ["EM / EMS-Prehospital","29-1214",2,"29-2041.00","EMTs/Paramedics",0.2],
  ["EM / Disaster Medicine","29-1214",2,"13-1061.00","Emergency Management Directors",0.2],
  ["EM / Wilderness Medicine","29-1214",2,"29-2041.00","EMTs/Paramedics",0.2],
  ["EM / Hospice & Palliative","29-1214",2,"21-1022.00","Healthcare Social Workers",0.2],
  ["EM / Critical Care (EMCCM)","29-1214",2,"29-1126.00","Respiratory Therapists",0.2],
  ["EM / Administration","29-1214",2,"11-9111.00","Medical/Health Services Managers",0.2],
  ["EM / Clinical Informatics","29-1214",2,"15-1252.00","Software Developers",0.2],
  ["Anes / Critical Care","29-1211",2,"29-1126.00","Respiratory Therapists",0.2],
  ["Anes / Pain Medicine","29-1211",2,"29-1123.00","Physical Therapists",0.2],
  ["Anes / Cardiac","29-1211",2,"29-2031.00","Cardiovascular Technologists",0.2],
  ["Anes / Pediatric","29-1211",2,"25-2054.00","Special Education Teachers",0.2],
  ["Anes / Neuroanesthesia","29-1211",2,"17-2072.00","Electronics Engineers",0.2],
  ["Anes / Regional-Acute Pain","29-1211",2,"29-2032.00","Diagnostic Medical Sonographers",0.2],
  ["Anes / Obstetric","29-1211",2,"29-1161.00","Nurse Midwives",0.2],
  ["Anes / Perioperative Medicine","29-1211",2,"11-9111.00","Medical/Health Services Managers",0.2],
  ["Neuroradiology","29-1224",2,"19-1042.00","Medical Scientists",0.2],
  ["Musculoskeletal Radiology","29-1224",2,"29-9091.00","Athletic Trainers",0.2],
  ["Breast Imaging","29-1224",2,"19-1042.00","Medical Scientists",0.2],
  ["Pediatric Radiology","29-1224",2,"25-2054.00","Special Education Teachers",0.2],
  ["Abdominal/Body Imaging","29-1224",2,"29-2034.00","Radiologic Technologists",0.2],
  ["Cardiothoracic Imaging","29-1224",2,"29-2031.00","Cardiovascular Technologists",0.2],
  ["Interventional Radiology","29-1224",2,"17-2112.00","Industrial Engineers",0.2],
  ["Nuclear Medicine","29-1224",3,"29-2033.00","Nuclear Medicine Technologists",0.4],
  ["Radiation Oncology","29-1224",2,"17-2199.00","Engineers, All Other",0.2],
  ["Surgical Pathology","29-1222",2,"19-1042.00","Medical Scientists",0.2],
  ["Cytopathology","29-1222",2,"19-1042.00","Medical Scientists",0.2],
  ["Dermatopathology (Path)","29-1222",2,"27-1013.00","Fine Artists (Sculptors)",0.2],
  ["Neuropathology","29-1222",2,"19-1042.00","Medical Scientists",0.2],
  ["Forensic Pathology","29-1222",2,"19-4092.00","Forensic Science Technicians",0.2],
  ["Clinical Pathology/Lab Medicine","29-1222",2,"11-9121.00","Natural Sciences Managers",0.2],
  ["Hematopathology","29-1222",2,"19-1042.00","Medical Scientists",0.2],
  ["Clinical Chemistry","29-1222",2,"19-2031.00","Chemists",0.2],
  ["Microbiology (Path)","29-1222",2,"19-1022.00","Microbiologists",0.2],
  ["Blood Banking/Transfusion","29-1222",2,"11-9121.00","Natural Sciences Managers",0.2],
  ["Molecular Genetic Pathology","29-1222",2,"15-2051.00","Data Scientists",0.2],
  ["Clinical Informatics (Path)","29-1222",2,"15-1252.00","Software Developers",0.2],
  ["Dermatopathology (Derm)","29-1213",2,"19-1042.00","Medical Scientists",0.2],
  ["Mohs/Procedural Dermatology","29-1213",2,"51-9071.00","Jewelers/Precious Stone Workers",0.2],
  ["Pediatric Dermatology","29-1213",2,"25-2054.00","Special Education Teachers",0.2],
  ["Cosmetic Dermatology","29-1213",2,"27-1013.00","Fine Artists (Sculptors)",0.2],
  ["Vascular Neurology/Stroke","29-1217",2,"29-2041.00","EMTs/Paramedics",0.2],
  ["Epilepsy/Clinical Neurophysiology","29-1217",2,"17-2072.00","Electronics Engineers",0.2],
  ["Neuromuscular Medicine","29-1217",2,"19-1042.00","Medical Scientists",0.2],
  ["Movement Disorders","29-1217",2,"19-1042.00","Medical Scientists",0.2],
  ["Behavioral Neurology/Neuropsychiatry","29-1217",2,"19-3031.00","Clinical Psychologists",0.2],
  ["Neuro-oncology","29-1217",2,"19-1042.00","Medical Scientists",0.2],
  ["Headache Medicine","29-1217",2,"21-1015.00","Rehabilitation Counselors",0.2],
  ["Neuroimmunology/MS","29-1217",2,"19-1042.00","Medical Scientists",0.2],
  ["Autonomic Disorders","29-1217",2,"17-2072.00","Electronics Engineers",0.2],
  ["Sleep Medicine (Neuro)","29-1217",2,"29-2099.00","Health Technologists, All Other",0.2],
  ["Neurocritical Care","29-1217",2,"29-1126.00","Respiratory Therapists",0.2],
  ["Pain Medicine (Neuro)","29-1217",2,"29-1123.00","Physical Therapists",0.2],
  ["Hospice & Palliative (Neuro)","29-1217",2,"21-1022.00","Healthcare Social Workers",0.2],
  ["Clinical Informatics (Neuro)","29-1217",2,"15-1252.00","Software Developers",0.2],
  ["Maternal-Fetal Medicine","29-1218",2,"29-2032.00","Diagnostic Medical Sonographers",0.2],
  ["Reproductive Endocrinology/Infertility","29-1218",2,"19-1042.00","Medical Scientists",0.2],
  ["Gynecologic Oncology","29-1218",2,"19-1042.00","Medical Scientists",0.2],
  ["Female Pelvic Med/Recon Surgery","29-1218",2,"29-1123.00","Physical Therapists",0.2],
  ["Complex Family Planning","29-1218",2,"21-1022.00","Healthcare Social Workers",0.2],
  ["Minimally Invasive Gyn Surgery","29-1218",2,"17-2112.00","Industrial Engineers",0.2],
  ["Ophthalmology (general)","29-1229",3,"29-1041.00","Optometrists",0.4],
  ["Retina/Vitreous","29-1229",3,"29-2034.00","Radiologic Technologists",0.4],
  ["Glaucoma","29-1229",3,"17-2112.00","Industrial Engineers",0.4],
  ["Cornea/External Disease","29-1229",3,"19-1042.00","Medical Scientists",0.4],
  ["Oculoplastics","29-1229",3,"27-1013.00","Fine Artists (Sculptors)",0.4],
  ["Pediatric Ophthalmology/Strabismus","29-1229",3,"25-2054.00","Special Education Teachers",0.4],
  ["Neuro-ophthalmology","29-1229",3,"19-1042.00","Medical Scientists",0.4],
  ["PM&R (general)","29-1229",3,"29-1123.00","Physical Therapists",0.4],
  ["Spinal Cord Injury","29-1229",3,"21-1015.00","Rehabilitation Counselors",0.4],
  ["Brain Injury","29-1229",3,"21-1015.00","Rehabilitation Counselors",0.4],
  ["Pain Medicine (PM&R)","29-1229",3,"29-1123.00","Physical Therapists",0.4],
  ["Sports Medicine (PM&R)","29-1229",3,"29-9091.00","Athletic Trainers",0.4],
  ["Pediatric Rehab","29-1229",3,"25-2054.00","Special Education Teachers",0.4],
  ["Neuromuscular (PM&R)","29-1229",3,"17-2072.00","Electronics Engineers",0.4],
  ["EMG/Electrodiagnostics","29-1229",3,"17-2072.00","Electronics Engineers",0.4],
  ["Cancer Rehab","29-1229",3,"21-1015.00","Rehabilitation Counselors",0.4],
  ["Preventive Med/Public Health","29-1229",3,"19-1041.00","Epidemiologists",0.4],
  ["Occupational Medicine","29-1229",3,"13-1041.00","Compliance Officers",0.4],
  ["Aerospace Medicine","29-1229",3,"17-2011.00","Aerospace Engineers",0.4],
  ["Undersea & Hyperbaric Medicine","29-1229",3,"17-2199.00","Engineers, All Other",0.4],
  ["Addiction Medicine (Prev)","29-1229",3,"21-1011.00","Substance Abuse Counselors",0.4],
  ["Clinical Informatics (Prev)","29-1229",3,"15-1252.00","Software Developers",0.4],
  ["Medical Toxicology (Prev)","29-1229",3,"19-4092.00","Forensic Science Technicians",0.4],
  ["Medical Genetics (general)","29-1229",3,"29-9092.00","Genetic Counselors",0.4],
  ["Biochemical Genetics","29-1229",3,"19-2031.00","Chemists",0.4],
  ["Molecular Genetics","29-1229",3,"15-2051.00","Data Scientists",0.4],
  ["Clinical Cytogenetics","29-1229",3,"29-2010.00","Clinical Lab Technologists",0.4],
  ["Pain Medicine (multidisciplinary)","29-1229",3,"29-1123.00","Physical Therapists",0.4],
];

/**
 * Resolve the effective anchor vector for a CSV anchor SOC code.
 * For the 29-2041.00 split case, returns the average of 29-2042.00 + 29-2043.00.
 * For other flagged codes, uses the substitute directly.
 */
function resolveAnchorVector(anchorSocCsv) {
  const sub = ANCHOR_SOC_SUBSTITUTES[anchorSocCsv];
  if (!sub) return neededVectors[anchorSocCsv] ?? null;
  if (Array.isArray(sub)) {
    // Average of two codes (29-2041.00 split case)
    const v1 = neededVectors[sub[0]];
    const v2 = neededVectors[sub[1]];
    if (!v1 || !v2) return null;
    return v1.map((val, i) => parseFloat(((val + v2[i]) / 2).toFixed(4)));
  }
  return neededVectors[sub] ?? null;
}

/**
 * Return a human-readable string for the effective anchor SOC.
 * For the split case: "avg(29-2042.00,29-2043.00)".
 */
function effectiveSocStr(anchorSocCsv) {
  const sub = ANCHOR_SOC_SUBSTITUTES[anchorSocCsv];
  if (!sub) return anchorSocCsv;
  if (Array.isArray(sub)) return `avg(${sub.join(",")})`;
  return sub;
}

// Precompute domain anchor task-weighted vectors from existing physician SOC fingerprints.
// Formula reverse: domain_fp[soc][label] = 0.5*V_base + 0.5*V_atw
// => V_atw = 2*domain_fp[soc][label] - V_soc
// Average over all physician SOCs to cancel out 4-decimal rounding noise.
const vAtwByDomain = {};
for (const label of DOMAIN_LABELS) {
  const acc = new Float64Array(N);
  let cnt = 0;
  for (const [physSoc, byLabel] of Object.entries(domainFingerprints)) {
    const vPhys = neededVectors[physSoc];
    const vFp   = byLabel[label];
    if (!vPhys || !vFp) continue;
    for (let i = 0; i < N; i++) acc[i] += 2 * vFp[i] - vPhys[i];
    cnt++;
  }
  vAtwByDomain[label] = Array.from(acc).map(v => v / cnt);
}

// Compute blended vectors, domain fingerprints, and adjacency baskets for all subspecialties.
const subspecialtyFingerprints = {};
const validationReport = [];

for (const [subspec, parentSocBase, tier, anchorSocCsv, anchorTitleCsv, alpha] of SUBSPECIALTY_CSV_DATA) {
  const parentSoc = parentSocBase + ".00";
  const vParent   = neededVectors[parentSoc];
  const vAnchor   = resolveAnchorVector(anchorSocCsv);
  const effSoc    = effectiveSocStr(anchorSocCsv);
  const isFlagged = anchorSocCsv in ANCHOR_SOC_SUBSTITUTES;

  if (!vParent) { console.warn(`  WARN 9A: parent SOC ${parentSoc} not found for "${subspec}"`); continue; }
  if (!vAnchor) { console.warn(`  WARN 9A: anchor vector not resolved for "${subspec}" (csv=${anchorSocCsv})`); continue; }

  // V_blend = (1-alpha)*V_parent + alpha*V_anchor_effective
  const vBlend = vParent.map((v, i) => parseFloat(((1 - alpha) * v + alpha * vAnchor[i]).toFixed(4)));

  // Domain fingerprints using the pre-derived V_atw vectors
  const domFp = {};
  for (const label of DOMAIN_LABELS) {
    const vAtw = vAtwByDomain[label];
    domFp[label] = vBlend.map((v, i) => parseFloat((0.5 * v + 0.5 * vAtw[i]).toFixed(4)));
  }

  // Adjacency basket (same candidate pool as main pipeline: no 29-1xxx, Job Zone >= 3)
  const sims = candidatePool.map(c => ({
    soc:        c.soc,
    title:      c.title,
    similarity: parseFloat(cosineSim(vBlend, c.vec).toFixed(4)),
  }));
  sims.sort((a, b) => b.similarity - a.similarity);
  const basket = sims.slice(0, 20);

  subspecialtyFingerprints[subspec] = {
    parent_soc:           parentSoc,
    effective_anchor_soc: effSoc,
    alpha,
    blended_vector:       vBlend,
    domain_fingerprints:  domFp,
    adjacency_basket:     basket,
  };

  // §9B — Validate: is the effective anchor in the top-10?
  const top10Socs = new Set(basket.slice(0, 10).map(e => e.soc));
  let inTop10 = false;
  let anchorRank = null;

  if (anchorSocCsv === "29-2041.00") {
    // Split case: check if either substitute appears
    inTop10 = top10Socs.has("29-2042.00") || top10Socs.has("29-2043.00");
    anchorRank = basket.findIndex(e => e.soc === "29-2042.00" || e.soc === "29-2043.00");
    if (anchorRank >= 0) anchorRank += 1; else anchorRank = null;
  } else if (ANCHOR_SOCS_EXCLUDED_FROM_POOL.has(anchorSocCsv)) {
    // 29-1xxx: structurally excluded — not a failure
    inTop10 = false; anchorRank = null;
  } else if (isFlagged) {
    const sub = ANCHOR_SOC_SUBSTITUTES[anchorSocCsv];
    const checkSoc = Array.isArray(sub) ? sub[0] : sub;
    inTop10 = top10Socs.has(checkSoc);
    anchorRank = basket.findIndex(e => e.soc === checkSoc);
    if (anchorRank >= 0) anchorRank += 1; else anchorRank = null;
  } else {
    inTop10 = top10Socs.has(anchorSocCsv);
    anchorRank = basket.findIndex(e => e.soc === anchorSocCsv);
    if (anchorRank >= 0) anchorRank += 1; else anchorRank = null;
  }

  validationReport.push({
    subspecialty:     subspec,
    anchor_soc_csv:   anchorSocCsv,
    effective_soc:    effSoc,
    in_top10:         inTop10,
    anchor_rank:      anchorRank,
    flagged:          isFlagged,
    excluded_from_pool: ANCHOR_SOCS_EXCLUDED_FROM_POOL.has(anchorSocCsv),
  });
}

console.log(`  computed ${Object.keys(subspecialtyFingerprints).length} subspecialty fingerprints`);
const top10Count  = validationReport.filter(r => r.in_top10).length;
const flaggedRows = validationReport.filter(r => r.flagged).length;
const excludedRows= validationReport.filter(r => r.excluded_from_pool).length;
const zeroVecRows = validationReport.filter(r => !r.excluded_from_pool && r.anchor_rank === null && !r.in_top10 && !r.flagged).length;
// Corrected denominator: exclude the 23 structurally pool-barred rows (29-1xxx).
// Fully testable excludes those + zero-vector rows (blend = parent; anchor cannot appear in basket).
const correctedDenom = 166 - excludedRows;           // 143
const correctedPct   = (top10Count / correctedDenom * 100).toFixed(1);
console.log(`  §9B validation (corrected denominator):`);
console.log(`    Anchors in top-10: ${top10Count} / ${correctedDenom} eligible = ${correctedPct}%`);
console.log(`    (Old: ${top10Count}/166 = ${(top10Count/166*100).toFixed(0)}% — incorrect, included pool-barred rows)`);
console.log(`    Excluded from pool (29-1xxx, not in denominator): ${excludedRows}`);
console.log(`    Flagged SOC rows (substitute used): ${flaggedRows}`);
console.log(`  ⚠ Check all-soc-vectors.json for zero-vector anchors — "All Other" codes may have no O*NET data.`);

// Write TypeScript seed files for subspecialties
writeTs("subspecialty-anchors.ts",
  `// AUTO-GENERATED by docs/seeds/onet/build-onet-seed.mjs — do not edit manually.\n` +
  `// Source: O*NET 30.3 Database, U.S. DOL/ETA, May 2026. CC-BY 4.0.\n` +
  `// Subspecialty anchor data from FISCMAK_Subspecialty_Anchor_SOCs.csv (166 rows).\n` +
  `// https://www.onetcenter.org/license_db.html\n\n` +
  `/**\n` +
  ` * Stale O*NET 30.3 codes found in the CSV — flagged, not auto-corrected.\n` +
  ` * Computation uses ANCHOR_SOC_EFFECTIVE; the CSV code is preserved for audit.\n` +
  ` *\n` +
  ` * 19-3031.00 → 19-3033.00 (renamed: Clinical and Counseling Psychologists)\n` +
  ` * 13-1061.00 → 11-9161.00 (wrong SOC family; correct is Emergency Management Directors)\n` +
  ` * 29-2041.00 → avg(29-2042.00,29-2043.00) (split into EMTs + Paramedics)\n` +
  ` * 25-2054.00 → 25-2059.00 (restructured; use Special Education Teachers, All Other)\n` +
  ` * 29-2010.00 → 29-2011.00 (group code; use Medical and Clinical Lab Technologists)\n` +
  ` *\n` +
  ` * Anchor SOCs in the 29-1xxx family (29-1126, 29-1123, 29-1127, 29-1161, 29-1041, 29-1029)\n` +
  ` * are excluded from the adjacency candidate pool by design — not an error.\n` +
  ` */\n\n` +
  `export type SubspecialtyAnchor = {\n` +
  `  /** Parent physician SOC code (with .00). */\n` +
  `  parent_soc: string;\n` +
  `  /** CSV tier (2 = standard 0.20 alpha; 3 = strong anchor 0.40 alpha). */\n` +
  `  tier: number;\n` +
  `  /** Anchor SOC as written in FISCMAK_Subspecialty_Anchor_SOCs.csv. May be a stale O*NET 30.3 code. */\n` +
  `  anchor_soc_csv: string;\n` +
  `  /**\n` +
  `   * Resolved O*NET 30.3 code used for actual computation.\n` +
  `   * Equals anchor_soc_csv unless flagged. For the 29-2041 split: "avg(29-2042.00,29-2043.00)".\n` +
  `   */\n` +
  `  anchor_soc_effective: string;\n` +
  `  anchor_title: string;\n` +
  `  /** Blending weight: V_blend = (1-alpha)*V_parent + alpha*V_anchor. */\n` +
  `  alpha: number;\n` +
  `  /** Present when anchor_soc_csv is stale or incorrect in O*NET 30.3. */\n` +
  `  flagged?: string;\n` +
  `};\n\n` +
  `export const SUBSPECIALTY_ANCHORS: Readonly<Record<string, SubspecialtyAnchor>> = ` +
  JSON.stringify(
    Object.fromEntries(SUBSPECIALTY_CSV_DATA.map(([subspec, parentBase, tier, anchorCsv, anchorTitle, alpha]) => {
      const isFlagged = anchorCsv in ANCHOR_SOC_SUBSTITUTES;
      const sub = ANCHOR_SOC_SUBSTITUTES[anchorCsv];
      const effSoc = !sub ? anchorCsv : (Array.isArray(sub) ? `avg(${sub.join(",")})` : sub);
      const flaggedReasons = {
        "19-3031.00": "Renamed to 19-3033.00 in O*NET 30.3 (Clinical and Counseling Psychologists)",
        "13-1061.00": "Wrong SOC family in O*NET 30.3; correct is 11-9161.00 (Emergency Management Directors)",
        "29-2041.00": "Split into 29-2042.00 (EMTs) + 29-2043.00 (Paramedics) in O*NET 30.3; use average",
        "25-2054.00": "Restructured in O*NET 30.3; use 25-2059.00 (Special Education Teachers, All Other)",
        "29-2010.00": "Group code in O*NET 30.3; use 29-2011.00 (Medical and Clinical Laboratory Technologists)",
      };
      const entry = {
        parent_soc: parentBase + ".00",
        tier,
        anchor_soc_csv: anchorCsv,
        anchor_soc_effective: effSoc,
        anchor_title: anchorTitle,
        alpha,
      };
      if (isFlagged) entry.flagged = flaggedReasons[anchorCsv];
      return [subspec, entry];
    })),
    null, 2
  ) + ` as const;\n`
);

writeTs("subspecialty-fingerprints.ts",
  `// AUTO-GENERATED by docs/seeds/onet/build-onet-seed.mjs — do not edit manually.\n` +
  `// Source: O*NET 30.3 Database, U.S. DOL/ETA, May 2026. CC-BY 4.0.\n` +
  `// Blended vectors: V_blend = (1-alpha)*V_parent + alpha*V_anchor_effective\n` +
  `// Domain fingerprints: V_domain = 0.50*V_blend + 0.50*V_anchor_task_weighted\n` +
  `// Adjacency basket: top-20 non-physician Job-Zone->=3 SOCs by cosine similarity on V_blend.\n` +
  `// https://www.onetcenter.org/license_db.html\n\n` +
  `export type SubspecialtyFingerprint = {\n` +
  `  parent_soc: string;\n` +
  `  effective_anchor_soc: string;\n` +
  `  alpha: number;\n` +
  `  blended_vector: readonly number[];\n` +
  `  domain_fingerprints: Readonly<Record<string, readonly number[]>>;\n` +
  `  /** Top-20 non-physician Job-Zone->=3 adjacent occupations by cosine similarity on blended vector. */\n` +
  `  adjacency_basket: readonly { soc: string; title: string; similarity: number }[];\n` +
  `};\n\n` +
  `export const SUBSPECIALTY_FINGERPRINTS: Readonly<Record<string, SubspecialtyFingerprint>> =\n  ` +
  JSON.stringify(subspecialtyFingerprints, null, 1) + `;\n`
);

// §9B — Write validation report
const ts = new Date().toISOString();
const reportLines = [
  `# Subspecialty Anchor Validation Report (9B)`,
  ``,
  `Generated: ${ts}`,
  `Total subspecialties: ${validationReport.length}`,
  `Validated (anchor in top-10 adjacency basket): ${top10Count}`,
  `Not in top-10: ${validationReport.length - top10Count}`,
  `  - Flagged SOC rows (computation uses substitute): ${flaggedRows}`,
  `  - Excluded from pool (29-1xxx anchors, by design): ${excludedRows}`,
  `  - Unflagged not in top-10 (alpha=0.20 blend too weak): ${validationReport.length - top10Count - flaggedRows - excludedRows}`,
  ``,
  `## Note on adjacency pool`,
  ``,
  `The adjacency candidate pool mirrors the main pipeline: it excludes all 29-1xxx SOC codes`,
  `(physician and allied-health practitioner family) and requires Job Zone >= 3.`,
  `Six anchor SOCs in the CSV are 29-1xxx codes (Respiratory Therapists, Physical Therapists,`,
  `Speech-Language Pathologists, Nurse Midwives, Optometrists, Dentists All Other).`,
  `These codes are used to compute V_blend correctly — they are valid anchor vectors —`,
  `but they cannot appear in the adjacency basket because they are structurally excluded from`,
  `the pool. "Anchor in top-10 = false" for these subspecialties is expected, not a defect.`,
  ``,
  `## Flagged SOC Codes (stale O*NET 30.3 references)`,
  ``,
  `| CSV SOC | Effective SOC | Reason |`,
  `|---------|--------------|--------|`,
  `| 19-3031.00 | 19-3033.00 | Renamed: Clinical and Counseling Psychologists |`,
  `| 13-1061.00 | 11-9161.00 | Wrong SOC family; correct Emergency Management Directors code |`,
  `| 29-2041.00 | avg(29-2042.00,29-2043.00) | Split into EMTs (29-2042) + Paramedics (29-2043) |`,
  `| 25-2054.00 | 25-2059.00 | Restructured; use Special Education Teachers, All Other |`,
  `| 29-2010.00 | 29-2011.00 | Group code; use Medical and Clinical Laboratory Technologists |`,
  ``,
  `## Per-subspecialty results`,
  ``,
  `| Subspecialty | Anchor SOC (CSV) | Effective SOC | Anchor In Top-10 | Anchor Rank | Notes |`,
  `|---|---|---|---|---|---|`,
  ...validationReport.map(r => {
    const notes = r.excluded_from_pool
      ? "29-1xxx excluded from pool by design"
      : r.flagged
        ? "Flagged SOC — substitute used"
        : "";
    return `| ${r.subspecialty} | ${r.anchor_soc_csv} | ${r.effective_soc} | ${r.in_top10 ? "Yes" : "No"} | ${r.anchor_rank ?? "—"} | ${notes} |`;
  }),
];

fs.writeFileSync(
  path.join(SEED_OUT, "subspecialty-validation-report.md"),
  reportLines.join("\n") + "\n",
  "utf8"
);
console.log("  wrote docs/seeds/onet/subspecialty-validation-report.md");

// ── §10A — ACGME milestone-emphasis computation ──────────────────────────────
//
// Reads all 229 ACGME program JSON files, applies parent-resolution + deduplication,
// and computes a normalized 6-vector (share of subcompetencies per ACGME competency key)
// for each of 135 canonical programs.
//
// Parent-resolution rule:
//   1. If JSON parent_slug is set → use it
//   2. Else if filename slug contains '--' → parent = slug.split('--')[0]
//   3. Primaries have parent_slug = null
//
// Deduplication:
//   - If a prefixed slug (e.g., psychiatry--forensic-psychiatry) and its sub-part
//     (forensic-psychiatry) both exist, keep only the non-prefixed slug as canonical.
//   - If a prefixed slug has no non-prefixed counterpart, keep it as-is.

console.log("\n§10A — Computing ACGME milestone-emphasis vectors…");

const ACGME_PROGRAMS_DIR = path.join(ROOT, "docs/seeds/acgme/programs");

/** ACGME competency key → FISCMAK skill-row index (0–5). Skills 6–7 have no ACGME milestone. */
const ACGME_TO_SKILL_IDX = { pc: 0, mk: 1, pbli: 2, ics: 3, prof: 4, sbp: 5 };

/** λ for milestone modulation — tunable, ship value = 1.0 */
const MILESTONE_LAMBDA = 1.0;

// ── Load all program JSON files ──────────────────────────────────────────────

const acgmeProgramFiles = fs.readdirSync(ACGME_PROGRAMS_DIR).filter(f => f.endsWith(".json"));
const acgmeSlugData = {};
for (const f of acgmeProgramFiles) {
  const slug = f.replace("_milestones_v2.json", "");
  acgmeSlugData[slug] = JSON.parse(fs.readFileSync(path.join(ACGME_PROGRAMS_DIR, f), "utf8"));
}
const allAcgmeSlugs = Object.keys(acgmeSlugData);
console.log(`  Loaded ${allAcgmeSlugs.length} ACGME program files`);

// ── Apply deduplication → canonical set ─────────────────────────────────────

const acgmePrimarySet   = new Set(allAcgmeSlugs.filter(s => acgmeSlugData[s].program_type === "primary"));
const acgmeSubSlugs     = allAcgmeSlugs.filter(s => acgmeSlugData[s].program_type !== "primary");
const acgmeNonPrefixed  = new Set(acgmeSubSlugs.filter(s => !s.includes("--")));

const canonicalAcgmeSlugs = [];
for (const s of acgmePrimarySet) canonicalAcgmeSlugs.push(s);
for (const s of acgmeNonPrefixed) canonicalAcgmeSlugs.push(s);
for (const s of acgmeSubSlugs) {
  if (!s.includes("--")) continue;
  const subPart = s.split("--").slice(1).join("--");
  if (!acgmeNonPrefixed.has(subPart)) canonicalAcgmeSlugs.push(s);
}

console.log(`  Canonical programs: ${canonicalAcgmeSlugs.length} (${acgmePrimarySet.size} primary, ${canonicalAcgmeSlugs.length - acgmePrimarySet.size} subspecialty)`);

// ── Resolve parent slug for each canonical program ───────────────────────────

function resolveAcgmeParent(slug, data) {
  if (data.program_type === "primary") return null;
  if (data.parent_slug) return data.parent_slug;
  if (slug.includes("--")) return slug.split("--")[0];
  return null;
}

// ── Compute normalized 6-vector per canonical program ────────────────────────

function computeEmphasisVector(data) {
  const counts = { pc: 0, mk: 0, pbli: 0, ics: 0, prof: 0, sbp: 0 };
  for (const s of (data.subcompetencies || [])) {
    const key = s.acgme_competency_key;
    if (key in counts) counts[key]++;
  }
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const emphasis = Object.fromEntries(
    Object.entries(counts).map(([k, v]) => [k, total > 0 ? v / total : 0])
  );
  return { emphasis, total };
}

/** Map from canonical ACGME slug → computed emphasis + metadata */
const acgmeEmphasisBySlug = {};
for (const slug of canonicalAcgmeSlugs) {
  const data = acgmeSlugData[slug];
  const { emphasis, total } = computeEmphasisVector(data);
  const parentSlug = resolveAcgmeParent(slug, data);
  acgmeEmphasisBySlug[slug] = {
    slug,
    parent_slug: parentSlug,
    program_type: data.program_type === "primary" ? "primary" : "subspecialty",
    emphasis,
    subcompetency_count: total,
  };
}

// ── Build milestone-emphasis.ts ───────────────────────────────────────────────

const milestoneEmphasisEntries = Object.values(acgmeEmphasisBySlug)
  .sort((a, b) => a.slug.localeCompare(b.slug));

writeTs("milestone-emphasis.ts",
  `// AUTO-GENERATED by docs/seeds/onet/build-onet-seed.mjs — do not edit manually.\n` +
  `// Source: ACGME Milestone 2.0 program JSON files (${acgmeProgramFiles.length} files, ${canonicalAcgmeSlugs.length} canonical).\n` +
  `// Attribution: O*NET 30.3 Database, U.S. DOL/ETA — CC-BY 4.0.\n` +
  `// https://www.onetcenter.org/license_db.html\n\n` +
  `/**\n` +
  ` * Normalized ACGME competency-emphasis vectors for all canonical ACGME programs.\n` +
  ` * emphasis[key] = share of subcompetencies in that ACGME competency domain (sums to 1.0).\n` +
  ` * Skills 6 (Collaboration) and 7 (PPD) have no ACGME milestone → not included in emphasis.\n` +
  ` * λ = ${MILESTONE_LAMBDA} (milestone modulation weight — see build-onet-seed.mjs §10B).\n` +
  ` */\n\n` +
  `export type AcgmeEmphasis = {\n` +
  `  slug: string;\n` +
  `  parent_slug: string | null;\n` +
  `  program_type: "primary" | "subspecialty";\n` +
  `  emphasis: {\n` +
  `    pc: number; mk: number; pbli: number; ics: number; prof: number; sbp: number;\n` +
  `  };\n` +
  `  subcompetency_count: number;\n` +
  `};\n\n` +
  `export const MILESTONE_EMPHASIS: readonly AcgmeEmphasis[] = ${JSON.stringify(milestoneEmphasisEntries, null, 2)} as const;\n\n` +
  `/** O(1) lookup by canonical ACGME slug. */\n` +
  `export const MILESTONE_EMPHASIS_BY_SLUG: Readonly<Record<string, AcgmeEmphasis>> = Object.fromEntries(\n` +
  `  MILESTONE_EMPHASIS.map(e => [e.slug, e])\n` +
  `) as Readonly<Record<string, AcgmeEmphasis>>;\n`
);
console.log(`  milestone-emphasis.ts: ${milestoneEmphasisEntries.length} entries`);

// ── §10B — Slug → FISCMAK mapping + milestone-modulated fingerprint regeneration ──
//
// For each FISCMAK subspecialty in SUBSPECIALTY_CSV_DATA that has an ACGME canonical slug:
//   1. Look up the subspecialty's emphasis e_s and its parent's emphasis e_parent
//   2. For each domain, recompute domain_fingerprints using milestone-modulated skill weights:
//        w'_r = w_r × (1 + λ × (e_s[r] − e_parent[r]))   for r ∈ {0..5}
//        w'_r = w_r                                        for r ∈ {6,7}
//      Renormalize w' so Σw'_r = Σw_r (preserve total weight)
//   3. V_domain_modulated = 0.5 × V_blend + 0.5 × Σ_r w'_r × (V_anchor filtered to task_r)
// blended_vector and adjacency_basket are unchanged.

console.log("\n§10B — Applying milestone-modulated domain fingerprints…");

// Precomputed task-weighted anchor vectors (already in vAtwByDomain from §9A).
// These are the V_atw for each domain label.

// §10B Step 1: ACGME canonical slug → FISCMAK subspecialty display name
// Values of null = no FISCMAK entry (FLAGGED in coverage report)
const SLUG_TO_FISCMAK = {
  // Cardiology (parent: internal-medicine via cardiovascular-disease)
  "clinical-cardiac-electrophysiology":           "Electrophysiology",
  "advanced-heart-failure-and-transplant-cardiology": "Advanced Heart Failure/Transplant",
  "cardiovascular-disease":                       "Interventional Cardiology",

  // Internal medicine
  "gastroenterology":                             "Gastroenterology",
  "transplant-hepatology":                        "Hepatology/Transplant",
  "pulmonary-disease-and-critical-care-medicine": "Pulmonary/Critical Care",
  "hematology-and-medical-oncology":              "Hematology/Oncology",
  "endocrinology-diabetes-and-metabolism":        "Endocrinology",
  "nephrology":                                   "Nephrology",
  "rheumatology":                                 "Rheumatology",
  "infectious-disease":                           "Infectious Disease",
  "hospital-medicine":                            "Hospital Medicine (Adult)",
  "critical-care-medicine":                       "Critical Care Medicine",
  "internal-medicine--geriatric-medicine":        "Geriatric Medicine (IM)",
  "internal-medicine--clinical-informatics":      "Clinical Informatics (IM)",
  "internal-medicine--hospice-and-palliative-medicine": "Hospice & Palliative (IM)",
  "internal-medicine--sleep-medicine":            "Sleep Medicine (IM)",
  "internal-medicine--sports-medicine":           null,
  "internal-medicine--addiction-medicine":        "FM / Addiction Medicine",
  "internal-medicine--addiction-psychiatry":      null,

  // Family medicine (prefixed-only)
  "family-medicine--geriatric-medicine":          "FM / Geriatric Medicine",
  "family-medicine--sports-medicine":             "FM / Sports Medicine",
  "family-medicine--hospice-and-palliative-medicine": "FM / Hospice & Palliative",
  "family-medicine--addiction-medicine":          "FM / Addiction Medicine",
  "family-medicine--sleep-medicine":              null,
  "adolescent-medicine":                          "FM / Adolescent Medicine",

  // Allergy and immunology
  "allergy-and-immunology":                       "Allergy & Immunology",

  // Pediatrics
  "neonatal-perinatal-medicine":                  "Neonatology",
  "pediatric-cardiology":                         "Peds Cardiology",
  "pediatric-critical-care":                      "Peds Critical Care",
  "pediatric-emergency-medicine":                 "Peds Emergency Medicine",
  "pediatric-gastroenterology":                   "Peds GI",
  "pediatric-hematology-oncology":                "Peds Heme/Onc",
  "pediatric-endocrinology":                      "Peds Endocrinology",
  "pediatric-pulmonology":                        "Peds Pulmonology",
  "pediatric-nephrology":                         "Peds Nephrology",
  "pediatric-rheumatology":                       "Peds Rheumatology",
  "pediatric-infectious-diseases":                "Peds Infectious Disease",
  "neurodevelopmental-disabilities":              "Developmental-Behavioral Peds",
  "developmental-behavioral-pediatrics":          "Developmental-Behavioral Peds",
  "child-abuse-pediatrics":                       "Child Abuse Pediatrics",

  // Psychiatry
  "child-and-adolescent-psychiatry":              "Child & Adolescent Psychiatry",
  "addiction-psychiatry":                         "Addiction Psychiatry",
  "forensic-psychiatry":                          "Forensic Psychiatry",
  "geriatric-psychiatry":                         "Geriatric Psychiatry",
  "consultation-liaison-psychiatry":              "Consultation-Liaison Psychiatry",
  "psychiatry--addiction-medicine":               "Addiction Medicine (Psych)",
  "psychiatry--hospice-and-palliative-medicine":  null,
  "psychiatry--sleep-medicine":                   "Sleep Medicine (Neuro)",

  // General surgery / surgical subspecialties
  "surgical-critical-care":                       "Surgical Critical Care",
  "pediatric-surgery":                            "Pediatric Surgery",
  "vascular-surgery-independent":                 "Vascular Surgery",
  "colon-and-rectal-surgery":                     "Colorectal Surgery",
  "thoracic-surgery-integrated":                  "Thoracic Surgery",
  "plastic-surgery":                              "Plastic Surgery",
  "neurological-surgery":                         null,

  // ENT (otolaryngology subspecialties)
  "neurotology":                                  "ENT / Neurotology",
  "otolaryngology---head-and-neck-surgery--neurotology": "ENT / Neurotology",
  "head-and-neck-surgery":                        "ENT / Head & Neck Surg Onc",
  "laryngology":                                  "ENT / Laryngology",
  "rhinology":                                    "ENT / Rhinology",
  "facial-plastic-and-reconstructive-surgery":    "ENT / Facial Plastic",
  "otolaryngology---head-and-neck-surgery":       "Otolaryngology (ENT)",

  // Urology
  "female-pelvic-medicine-and-reconstructive-surgery": "Urology / Female Pelvic/Recon",
  "pediatric-urology":                            "Urology / Pediatric",

  // Emergency medicine
  "emergency-medicine--medical-toxicology":       "EM / Medical Toxicology",
  "emergency-medicine--hospice-and-palliative-medicine": "EM / Hospice & Palliative",
  "emergency-medicine--sports-medicine":          null,
  "emergency-medical-services":                   "EM / EMS-Prehospital",
  "undersea-and-hyperbaric-medicine":             "Undersea & Hyperbaric Medicine",
  "preventive-medicine--undersea-and-hyperbaric-medicine": "Undersea & Hyperbaric Medicine",

  // Anesthesiology
  "adult-cardiothoracic-anesthesiology":          "Anes / Cardiac",
  "anesthesiology--critical-care-anesthesiology": "Anes / Critical Care",
  "anesthesiology--addiction-medicine":           "Anes / Critical Care",
  "pediatric-anesthesiology":                     "Anes / Pediatric",
  "regional-anesthesiology-and-acute-pain-medicine": "Anes / Regional-Acute Pain",
  "obstetric-anesthesiology":                     "Anes / Obstetric",
  "anesthesiology--clinical-informatics":         "Clinical Informatics (IM)",
  "anesthesiology--hospice-and-palliative-medicine": "Hospice & Palliative (IM)",

  // Radiology
  "neuroradiology":                               "Neuroradiology",
  "musculoskeletal-radiology":                    "Musculoskeletal Radiology",
  "breast-imaging":                               "Breast Imaging",
  "pediatric-radiology":                          "Pediatric Radiology",
  "abdominal-radiology":                          "Abdominal/Body Imaging",
  "cardiothoracic-radiology":                     "Cardiothoracic Imaging",
  "interventional-radiology-integrated":          "Interventional Radiology",
  "nuclear-medicine":                             "Nuclear Medicine",
  "radiation-oncology":                           "Radiation Oncology",

  // Pathology
  "cytopathology":                                "Cytopathology",
  "dermatopathology":                             "Dermatopathology (Path)",
  "dermatology--dermatopathology":                "Dermatopathology (Derm)",
  "neuropathology":                               "Neuropathology",
  "forensic-pathology":                           "Forensic Pathology",
  "pathology--clinical-informatics":              "Clinical Informatics (Path)",
  "hematopathology":                              "Hematopathology",
  "chemical-pathology":                           "Clinical Chemistry",
  "medical-microbiology":                         "Microbiology (Path)",
  "pathology--blood-banking-and-transfusion-medicine": "Blood Banking/Transfusion",
  "molecular-genetic-pathology":                  "Molecular Genetic Pathology",

  // Dermatology
  "pediatric-dermatology":                        "Pediatric Dermatology",
  "micrographic-surgery-and-dermatologic-oncology": "Mohs/Procedural Dermatology",
  "dermatology--micrographic-surgery-and-dermatologic-oncology": "Mohs/Procedural Dermatology",

  // Neurology
  "vascular-neurology":                           "Vascular Neurology/Stroke",
  "clinical-neurophysiology":                     "Epilepsy/Clinical Neurophysiology",
  "neuromuscular-medicine":                       "Neuromuscular Medicine",
  "movement-disorders":                           "Movement Disorders",
  "behavioral-neurology-and-neuropsychiatry":     "Behavioral Neurology/Neuropsychiatry",
  "headache-medicine":                            "Headache Medicine",
  "autonomic-disorders":                          "Autonomic Disorders",
  "neurocritical-care":                           "Neurocritical Care",
  "neurology--hospice-and-palliative-medicine":   "Hospice & Palliative (Neuro)",
  "neurology--sleep-medicine":                    "Sleep Medicine (Neuro)",

  // OB/GYN
  "maternal-fetal-medicine":                      "Maternal-Fetal Medicine",
  "reproductive-endocrinology-and-infertility":   "Reproductive Endocrinology/Infertility",
  "gynecologic-oncology":                         "Gynecologic Oncology",
  "obstetrics-and-gynecology--female-pelvic-medicine-and-reconstructive-surgery": "Female Pelvic Med/Recon Surgery",
  "obstetrics-and-gynecology--complex-family-planning": "Complex Family Planning",

  // Ophthalmology
  "ophthalmic-plastic-and-reconstructive-surgery": "Oculoplastics",
  "pediatric-ophthalmology-and-strabismus":       "Pediatric Ophthalmology/Strabismus",
  "neuro-ophthalmology":                          "Neuro-ophthalmology",
  "retinal-surgery":                              "Retina/Vitreous",
  "cornea-and-external-disease":                  "Cornea/External Disease",
  "glaucoma":                                     "Glaucoma",
  "ophthalmology--vitreoretinal-surgery":         "Retina/Vitreous",

  // PM&R
  "physical-medicine-and-rehabilitation--spinal-cord-injury-medicine": "Spinal Cord Injury",
  "spinal-cord-injury-medicine":                  "Spinal Cord Injury",
  "brain-injury-medicine":                        "Brain Injury",
  "physical-medicine-and-rehabilitation--pediatric-rehabilitation-medicine": "Pediatric Rehab",
  "pediatric-rehabilitation-medicine":            "Pediatric Rehab",
  "cancer-rehabilitation-medicine":               "Cancer Rehab",
  "physical-medicine-and-rehabilitation--pain-medicine": "Pain Medicine (PM&R)",
  "physical-medicine-and-rehabilitation--sports-medicine": "Sports Medicine (PM&R)",
  "physical-medicine-and-rehabilitation--neuromuscular-medicine": "Neuromuscular (PM&R)",

  // Preventive medicine
  "preventive-medicine--occupational-medicine":   "Occupational Medicine",
  "preventive-medicine--aerospace-medicine":      "Aerospace Medicine",
  "preventive-medicine--addiction-medicine":      "Addiction Medicine (Prev)",
  "preventive-medicine--clinical-informatics":    "Clinical Informatics (Prev)",
  "preventive-medicine--medical-toxicology":      "Medical Toxicology (Prev)",
  "aerospace-medicine":                           "Aerospace Medicine",
  "addiction-medicine":                           "FM / Addiction Medicine",

  // Medical genetics
  "medical-genetics-and-genomics":                "Medical Genetics (general)",
  "medical-biochemical-genetics":                 "Biochemical Genetics",
  "laboratory-genetics-and-genomics":             "Molecular Genetics",
  "medical-genetics-and-genomics--laboratory-genetics-and-genomics": "Molecular Genetics",
  "medical-genetics-and-genomics--medical-biochemical-genetics": "Biochemical Genetics",
  "medical-genetics-and-genomics--molecular-genetic-pathology": "Molecular Genetic Pathology",
  "clinical-cytogenetics-and-genomics":           "Clinical Cytogenetics",
};

// §10B Step 2: Build task-sum contribution for each domain using modulated weights

/**
 * Compute milestone-modulated domain fingerprints for a subspecialty.
 * @param {number[]} vBlend - blended vector (from §9A)
 * @param {Object} emphasisSub - subspecialty emphasis {pc,mk,pbli,ics,prof,sbp}
 * @param {Object} emphasisParent - parent emphasis {pc,mk,pbli,ics,prof,sbp}
 * @returns {Record<string, number[]>} modulated domain fingerprints
 */
function computeModulatedDomainFingerprints(vBlend, emphasisSub, emphasisParent) {
  const domFp = {};
  for (let d = 0; d < DOMAIN_LABELS.length; d++) {
    const label   = DOMAIN_LABELS[d];
    const vAtw    = vAtwByDomain[label];
    const ranks   = DOMAIN_RANK_MATRIX[d];

    // Compute original weights and total weight for skills 0–6
    const wOrig = [];
    for (let r = 0; r < SKILL_NAMES.length; r++) {
      wOrig.push(rankWeight(ranks[r]));
    }
    const totalWOrig = wOrig.reduce((a, b) => a + b, 0);

    // Compute modulated weights w'_r
    const wMod = [];
    for (let r = 0; r < SKILL_NAMES.length; r++) {
      const acgmeKeys = ["pc","mk","pbli","ics","prof","sbp"];
      if (r < 6) {
        // Has ACGME competency mapping
        const key   = acgmeKeys[r];
        const eS    = emphasisSub[key]    ?? 0;
        const eP    = emphasisParent[key] ?? 0;
        const wPrime = wOrig[r] * (1 + MILESTONE_LAMBDA * (eS - eP));
        // Clamp to zero (rare edge case if modulator pushes negative)
        wMod.push(Math.max(0, wPrime));
      } else {
        // Skills 6–7 (Collaboration & Teamwork, PPD) — no ACGME milestone; keep unchanged
        wMod.push(wOrig[r]);
      }
    }

    // Renormalize w' so Σw' = Σw_orig (preserve total weight)
    const totalWMod = wMod.reduce((a, b) => a + b, 0);
    const scale = totalWMod > 0 ? totalWOrig / totalWMod : 1;
    const wModScaled = wMod.map(w => w * scale);

    // Compute modulated V_atw-like sum using task masks and modulated weights
    const vTaskSumMod = new Array(N).fill(0);
    for (let r = 0; r < SKILL_NAMES.length; r++) {
      const mask = taskMasks[SKILL_NAMES[r]] ?? [];
      const w    = wModScaled[r];
      for (const i of mask) vTaskSumMod[i] += w * vAtw[i];
    }

    // Blend: V_domain_modulated = 0.5 × V_blend + 0.5 × V_task_sum_modulated
    domFp[label] = vBlend.map(
      (v, i) => parseFloat((0.5 * v + 0.5 * vTaskSumMod[i]).toFixed(4))
    );
  }
  return domFp;
}

// ── Apply modulation to SUBSPECIALTY_FINGERPRINTS entries that have ACGME mapping ──

// Build reverse lookup: FISCMAK subspecialty name → canonical ACGME slug
const fiscmakToAcgmeSlug = {};
for (const [acgmeSlug, fiscmakName] of Object.entries(SLUG_TO_FISCMAK)) {
  if (fiscmakName && canonicalAcgmeSlugs.includes(acgmeSlug)) {
    // Only record if slug actually exists in canonical set
    if (!fiscmakToAcgmeSlug[fiscmakName]) {
      fiscmakToAcgmeSlug[fiscmakName] = acgmeSlug;
    }
  }
}

// Uniform emphasis fallback (when parent has no ACGME program)
const UNIFORM_EMPHASIS = { pc: 1/6, mk: 1/6, pbli: 1/6, ics: 1/6, prof: 1/6, sbp: 1/6 };

// Build final canonicalSet for O(1) lookup
const canonicalAcgmeSet = new Set(canonicalAcgmeSlugs);

// Track statistics
let modulatedCount     = 0;
let unmodulatedCount   = 0;

// For differentiation check: collect cosine distances
const cosineBySubspec = [];

/** Cosine similarity between two arrays */
function cosineArr(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na  += a[i] * a[i];
    nb  += b[i] * b[i];
  }
  return na > 0 && nb > 0 ? dot / Math.sqrt(na * nb) : 0;
}

// Rebuild subspecialtyFingerprints with modulated domain_fingerprints
const modSubspecialtyFingerprints = {};

for (const [subspec, entry] of Object.entries(subspecialtyFingerprints)) {
  const acgmeSlug = fiscmakToAcgmeSlug[subspec];

  if (!acgmeSlug || !acgmeEmphasisBySlug[acgmeSlug]) {
    // No ACGME milestone data → keep Ticket 9 fingerprint as-is
    modSubspecialtyFingerprints[subspec] = entry;
    unmodulatedCount++;
    continue;
  }

  const emphasisEntry = acgmeEmphasisBySlug[acgmeSlug];
  const emphasisSub   = emphasisEntry.emphasis;

  // Resolve parent emphasis
  const parentSlug    = emphasisEntry.parent_slug;
  let emphasisParent;
  if (parentSlug && acgmeEmphasisBySlug[parentSlug]) {
    emphasisParent = acgmeEmphasisBySlug[parentSlug].emphasis;
  } else {
    emphasisParent = UNIFORM_EMPHASIS;
  }

  const vBlend   = entry.blended_vector;
  const modDomFp = computeModulatedDomainFingerprints(vBlend, emphasisSub, emphasisParent);

  modSubspecialtyFingerprints[subspec] = {
    parent_soc:           entry.parent_soc,
    effective_anchor_soc: entry.effective_anchor_soc,
    alpha:                entry.alpha,
    blended_vector:       entry.blended_vector,
    domain_fingerprints:  modDomFp,
    adjacency_basket:     entry.adjacency_basket,
  };
  modulatedCount++;

  // Collect differentiation metric: compare first domain fingerprint vs Ticket-9 baseline
  const ticket9Fp = entry.domain_fingerprints;
  const domCosines = [];
  for (const label of DOMAIN_LABELS) {
    if (ticket9Fp[label] && modDomFp[label]) {
      domCosines.push(cosineArr(ticket9Fp[label], modDomFp[label]));
    }
  }
  if (domCosines.length > 0) {
    const meanCos = domCosines.reduce((a, b) => a + b, 0) / domCosines.length;
    cosineBySubspec.push({ subspec, meanCos, acgmeSlug });
  }
}

// Write modulated subspecialty-fingerprints.ts
writeTs("subspecialty-fingerprints.ts",
  `// AUTO-GENERATED by docs/seeds/onet/build-onet-seed.mjs — do not edit manually.\n` +
  `// Source: O*NET 30.3 Database, U.S. DOL/ETA, May 2026. CC-BY 4.0.\n` +
  `// Blended vectors: V_blend = (1-alpha)*V_parent + alpha*V_anchor_effective\n` +
  `// Domain fingerprints (§10B): milestone-modulated where ACGME mapping exists.\n` +
  `//   w'_r = w_r × (1 + λ × (e_sub[r] − e_parent[r])), λ=${MILESTONE_LAMBDA}, renormalized.\n` +
  `// Adjacency basket: top-20 non-physician Job-Zone->=3 SOCs by cosine similarity on V_blend.\n` +
  `// https://www.onetcenter.org/license_db.html\n\n` +
  `export type SubspecialtyFingerprint = {\n` +
  `  parent_soc: string;\n` +
  `  effective_anchor_soc: string;\n` +
  `  alpha: number;\n` +
  `  blended_vector: readonly number[];\n` +
  `  domain_fingerprints: Readonly<Record<string, readonly number[]>>;\n` +
  `  /** Top-20 non-physician Job-Zone->=3 adjacent occupations by cosine similarity on blended vector. */\n` +
  `  adjacency_basket: readonly { soc: string; title: string; similarity: number }[];\n` +
  `};\n\n` +
  `export const SUBSPECIALTY_FINGERPRINTS: Readonly<Record<string, SubspecialtyFingerprint>> =\n  ` +
  JSON.stringify(modSubspecialtyFingerprints, null, 1) + `;\n`
);

// §10B: Also compute primary specialty emphasis fingerprints
// For the 21 primary specialties (and any non-primary that serves as parent),
// compute milestone-modulated fingerprints using the primary's own emphasis vs
// uniform (since primaries have no parent).

console.log("\n§10B — Computing specialty-emphasis fingerprints for primary/parent specialties…");

// Determine parent SOC mapping for each ACGME primary slug → physician SOC
// This is best-effort: match by known specialty groups
const PRIMARY_SLUG_TO_SOC = {
  "allergy-and-immunology":          "29-1216.00",
  "anesthesiology":                  "29-1211.00",
  "colon-and-rectal-surgery":        "29-1249.00",
  "dermatology":                     "29-1213.00",
  "emergency-medicine":              "29-1214.00",
  "family-medicine":                 "29-1215.00",
  "internal-medicine":               "29-1216.00",
  "medical-genetics-and-genomics":   "29-1229.00",
  "neurological-surgery":            "29-1249.00",
  "nuclear-medicine":                "29-1224.00",
  "obstetrics-and-gynecology":       "29-1218.00",
  "ophthalmology":                   "29-1229.00",
  "orthopaedic-surgery":             "29-1242.00",
  "osteopathic-neuromusculoskeletal-medicine": "29-1229.00",
  "otolaryngology---head-and-neck-surgery":    "29-1249.00",
  "pathology":                       "29-1222.00",
  "pediatrics":                      "29-1221.00",
  "plastic-surgery":                 "29-1249.00",
  "psychiatry":                      "29-1223.00",
  "transitional-year":               "29-1229.00",
  "urology":                         "29-1249.00",
  // Non-primary specialties that serve as parents for subspecialties in the seed
  "neurology":                       "29-1217.00",
  "cardiovascular-disease":          "29-1212.00",
};

const specialtyEmphasisFingerprints = {};

// Process all specialties that have an emphasis entry and a SOC mapping
const allSpecialtySlugsForFp = [...canonicalAcgmeSlugs.filter(s =>
  acgmeSlugData[s].program_type === "primary" || PRIMARY_SLUG_TO_SOC[s]
)];

for (const slug of allSpecialtySlugsForFp) {
  const soc     = PRIMARY_SLUG_TO_SOC[slug];
  if (!soc) continue;
  const vBase   = neededVectors[soc];
  if (!vBase) continue;
  const emphasisEntry = acgmeEmphasisBySlug[slug];
  if (!emphasisEntry) continue;

  // Primary specialties use uniform as parent (they have no parent)
  const emphasisSelf   = emphasisEntry.emphasis;
  const emphasisParent = UNIFORM_EMPHASIS;

  // For domain fingerprints we need a v_blend ≈ the specialty's base SOC vector
  const vBlend = vBase; // for primaries, blend IS the base vector (alpha=0)

  const modDomFp = computeModulatedDomainFingerprints(vBlend, emphasisSelf, emphasisParent);
  specialtyEmphasisFingerprints[slug] = {
    slug,
    soc,
    domain_fingerprints: modDomFp,
  };
}

writeTs("specialty-emphasis-fingerprints.ts",
  `// AUTO-GENERATED by docs/seeds/onet/build-onet-seed.mjs — do not edit manually.\n` +
  `// Source: O*NET 30.3 + ACGME Milestone 2.0. CC-BY 4.0.\n` +
  `// Domain fingerprints for primary specialties / parents, milestone-modulated.\n` +
  `// Used as fallback when user has specialty but no subspecialty match.\n` +
  `// https://www.onetcenter.org/license_db.html\n\n` +
  `export type SpecialtyEmphasisFingerprint = {\n` +
  `  slug: string;\n` +
  `  soc: string;\n` +
  `  domain_fingerprints: Readonly<Record<string, readonly number[]>>;\n` +
  `};\n\n` +
  `export const SPECIALTY_EMPHASIS_FINGERPRINTS: Readonly<Record<string, SpecialtyEmphasisFingerprint>> =\n  ` +
  JSON.stringify(specialtyEmphasisFingerprints, null, 1) + `;\n`
);
console.log(`  specialty-emphasis-fingerprints.ts: ${Object.keys(specialtyEmphasisFingerprints).length} entries`);

// ── §10C — Validation and coverage report ───────────────────────────────────

console.log("\n§10C — Generating differentiation check and coverage report…");

// Differentiation distribution: mean cosine(modulated, ticket9) per subspecialty
cosineBySubspec.sort((a, b) => a.meanCos - b.meanCos);
const cosVals = cosineBySubspec.map(c => c.meanCos);
const cosMin  = cosVals.length ? cosVals[0] : null;
const cosMax  = cosVals.length ? cosVals[cosVals.length - 1] : null;
const cosMed  = cosVals.length ? cosVals[Math.floor(cosVals.length / 2)] : null;

console.log(`\n  §10C Differentiation (cosine vs Ticket-9 baseline — lower = more differentiation):`);
console.log(`    Subspecialties measured: ${cosineBySubspec.length}`);
if (cosMin !== null) {
  console.log(`    Min  cosine: ${cosMin.toFixed(4)} (most differentiated: ${cosineBySubspec[0].subspec})`);
  console.log(`    Med  cosine: ${cosMed.toFixed(4)}`);
  console.log(`    Max  cosine: ${cosMax.toFixed(4)} (least differentiated: ${cosineBySubspec[cosineBySubspec.length-1].subspec})`);
}

// Spot-checks: print relative emphasis shift for 5 key subspecialties
const SPOT_CHECK_SLUGS = [
  { acgme: "forensic-psychiatry",   fiscmak: "Forensic Psychiatry",    note: "expect high prof+sbp" },
  { acgme: "cardiovascular-disease",fiscmak: "Interventional Cardiology", note: "expect high pc shift" },
  { acgme: "vascular-neurology",    fiscmak: "Vascular Neurology/Stroke", note: "expect high mk shift for neuro parent" },
  { acgme: "pediatric-surgery",     fiscmak: "Pediatric Surgery",       note: "expect high pc shift" },
  { acgme: "physical-medicine-and-rehabilitation--spinal-cord-injury-medicine", fiscmak: "Spinal Cord Injury", note: "expect balanced" },
];

console.log("\n  §10C Spot-checks (emphasis shift = e_sub − e_parent):");
for (const { acgme, fiscmak, note } of SPOT_CHECK_SLUGS) {
  const emphEntry = acgmeEmphasisBySlug[acgme];
  if (!emphEntry) { console.log(`    ${fiscmak}: ACGME slug "${acgme}" not in canonical set`); continue; }
  const eS = emphEntry.emphasis;
  const parentSlug = emphEntry.parent_slug;
  const eP = (parentSlug && acgmeEmphasisBySlug[parentSlug])
    ? acgmeEmphasisBySlug[parentSlug].emphasis
    : UNIFORM_EMPHASIS;
  const shift = Object.fromEntries(
    ["pc","mk","pbli","ics","prof","sbp"].map(k => [k, +(eS[k] - eP[k]).toFixed(4)])
  );
  console.log(`    ${fiscmak} (${note}):`);
  console.log(`      e_sub:    ${Object.entries(eS).map(([k,v])=>`${k}=${v.toFixed(3)}`).join(", ")}`);
  console.log(`      e_parent: ${Object.entries(eP).map(([k,v])=>`${k}=${v.toFixed(3)}`).join(", ")}`);
  console.log(`      shift:    ${Object.entries(shift).map(([k,v])=>`${k}=${v>=0?"+":""}${v}`).join(", ")}`);
}

// Coverage report
const allFiscmakNames = SUBSPECIALTY_CSV_DATA.map(([name]) => name);
const fiscmakWithMilestone = allFiscmakNames.filter(name => name in fiscmakToAcgmeSlug);
const fiscmakWithoutMilestone = allFiscmakNames.filter(name => !(name in fiscmakToAcgmeSlug));

// Flagged ACGME slugs (in canonical but no FISCMAK mapping or null)
const flaggedAcgmeSlugs = [];
for (const [slug, fiscmak] of Object.entries(SLUG_TO_FISCMAK)) {
  if (!canonicalAcgmeSet.has(slug)) continue; // not in our 135
  if (fiscmak === null) flaggedAcgmeSlugs.push({ slug, reason: "no FISCMAK entry" });
}
// ACGME slugs in canonical that are not in SLUG_TO_FISCMAK at all
for (const slug of canonicalAcgmeSlugs) {
  if (!(slug in SLUG_TO_FISCMAK) && acgmeSlugData[slug].program_type !== "primary") {
    flaggedAcgmeSlugs.push({ slug, reason: "not in SLUG_TO_FISCMAK" });
  }
}

const coverageReportLines = [
  `# ACGME Milestone Coverage Report (§10C)`,
  ``,
  `Generated: ${new Date().toISOString()}`,
  ``,
  `## Summary`,
  ``,
  `| Metric | Count |`,
  `|--------|-------|`,
  `| Total ACGME program files | ${acgmeProgramFiles.length} |`,
  `| Canonical programs (after dedup) | ${canonicalAcgmeSlugs.length} |`,
  `| — Primary specialties | ${acgmePrimarySet.size} |`,
  `| — Subspecialties (non-prefixed) | ${[...acgmeNonPrefixed].length} |`,
  `| — Subspecialties (prefixed-only) | ${canonicalAcgmeSlugs.length - acgmePrimarySet.size - [...acgmeNonPrefixed].length} |`,
  `| FISCMAK subspecialties (166 total) | ${allFiscmakNames.length} |`,
  `| With milestone emphasis applied | ${modulatedCount} |`,
  `| Ticket 9 only (no ACGME mapping) | ${unmodulatedCount} |`,
  `| ACGME slugs flagged (no FISCMAK) | ${flaggedAcgmeSlugs.length} |`,
  ``,
  `## Differentiation Check`,
  ``,
  `Cosine similarity between milestone-modulated domain fingerprints and Ticket-9 baseline.`,
  `Lower cosine = more differentiation from parent.`,
  `O\\*NET-only baseline (Ticket 9): median cosine = 0.997`,
  ``,
  `| Metric | Value | Subspecialty |`,
  `|--------|-------|-------------|`,
  cosMin !== null ? `| Min cosine | ${cosMin.toFixed(4)} | ${cosineBySubspec[0].subspec} |` : `| Min cosine | n/a | — |`,
  cosMed !== null ? `| Median cosine | ${cosMed.toFixed(4)} | — |` : `| Median cosine | n/a | — |`,
  cosMax !== null ? `| Max cosine | ${cosMax.toFixed(4)} | ${cosineBySubspec[cosineBySubspec.length-1].subspec} |` : `| Max cosine | n/a | — |`,
  ``,
  `## Spot-Checks`,
  ``,
  `| Subspecialty | Expected | Largest positive shift | Largest negative shift |`,
  `|---|---|---|---|`,
  ...SPOT_CHECK_SLUGS.map(({ acgme, fiscmak, note }) => {
    const emphEntry = acgmeEmphasisBySlug[acgme];
    if (!emphEntry) return `| ${fiscmak} | ${note} | MISSING | MISSING |`;
    const eS = emphEntry.emphasis;
    const parentSlug = emphEntry.parent_slug;
    const eP = (parentSlug && acgmeEmphasisBySlug[parentSlug])
      ? acgmeEmphasisBySlug[parentSlug].emphasis
      : UNIFORM_EMPHASIS;
    const shifts = ["pc","mk","pbli","ics","prof","sbp"].map(k => ({ k, d: eS[k]-eP[k] }));
    shifts.sort((a,b)=>b.d-a.d);
    const top = shifts[0];
    const bot = shifts[shifts.length-1];
    return `| ${fiscmak} | ${note} | ${top.k}=${top.d>=0?"+":""}${top.d.toFixed(3)} | ${bot.k}=${bot.d>=0?"+":""}${bot.d.toFixed(3)} |`;
  }),
  ``,
  `## FLAGGED — ACGME Slugs Without FISCMAK Mapping`,
  ``,
  flaggedAcgmeSlugs.length > 0
    ? [`| ACGME Slug | Reason |`, `|---|---|`,
       ...flaggedAcgmeSlugs.map(f => `| \`${f.slug}\` | ${f.reason} |`)].join("\n")
    : `None — all canonical slugs are mapped.`,
  ``,
  `## FISCMAK Subspecialties Without Milestone Data`,
  ``,
  fiscmakWithoutMilestone.length > 0
    ? [`| FISCMAK Subspecialty | Status |`, `|---|---|`,
       ...fiscmakWithoutMilestone.map(n => `| ${n} | Ticket 9 fingerprint only |`)].join("\n")
    : `None — all FISCMAK subspecialties have milestone data.`,
  ``,
  `## Full ACGME Canonical Slug → FISCMAK Mapping`,
  ``,
  `| ACGME Slug | FISCMAK Name | Status |`,
  `|---|---|---|`,
  ...canonicalAcgmeSlugs
    .filter(s => acgmeSlugData[s].program_type !== "primary")
    .sort()
    .map(slug => {
      const fiscmak = SLUG_TO_FISCMAK[slug];
      if (fiscmak === undefined) return `| \`${slug}\` | — | NOT IN SLUG_TO_FISCMAK |`;
      if (fiscmak === null) return `| \`${slug}\` | — | FLAGGED (no FISCMAK entry) |`;
      return `| \`${slug}\` | ${fiscmak} | mapped |`;
    }),
];

fs.writeFileSync(
  path.join(SEED_OUT, "milestone-coverage-report.md"),
  coverageReportLines.join("\n") + "\n",
  "utf8"
);
console.log("  wrote docs/seeds/onet/milestone-coverage-report.md");
console.log(`  FISCMAK subspecialties with milestone data: ${modulatedCount}`);
console.log(`  FISCMAK subspecialties Ticket-9-only: ${unmodulatedCount}`);
console.log(`  ACGME slugs flagged (no FISCMAK mapping): ${flaggedAcgmeSlugs.length}`);

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

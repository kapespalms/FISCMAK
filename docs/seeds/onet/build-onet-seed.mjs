#!/usr/bin/env node
/**
 * build-onet-seed.mjs — FISCMAK O*NET 30.3 seed compiler
 *
 * Reads raw O*NET Excel files from docs/seeds/Full_Onet_Seeds/ and writes
 * compiled TypeScript constants to src/lib/v2/onet/.
 *
 * Attribution: O*NET 30.3 Database, U.S. DOL/ETA — CC-BY 4.0
 *   https://www.onetcenter.org/license_db.html
 *
 * Run: node docs/seeds/onet/build-onet-seed.mjs
 * Requires: Node >= 18, xlsx package (in devDependencies)
 */

import fs   from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, "../../..");
const RAW       = path.join(ROOT, "docs/seeds/Full_Onet_Seeds");
const OUT       = path.join(ROOT, "src/lib/v2/onet");

// ── helpers ────────────────────────────────────────────────────────────────

function readSheet(filename) {
  const wb = XLSX.readFile(path.join(RAW, filename));
  return XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: "" });
}

function writeTs(filename, content) {
  fs.writeFileSync(path.join(OUT, filename), content, "utf8");
  console.log("  wrote", path.join("src/lib/v2/onet", filename));
}

// ── SOC codes needed ────────────────────────────────────────────────────────

// Physician specialty SOCs (from specialty-soc-map.ts)
const PHYSICIAN_SOCS = [
  "29-1211.00","29-1213.00","29-1214.00","29-1215.00","29-1216.00",
  "29-1217.00","29-1218.00","29-1221.00","29-1222.00","29-1223.00",
  "29-1224.00","29-1229.00","29-1229.01","29-1229.03","29-1229.04",
  "29-1229.05","29-1241.00","29-1242.00","29-1249.00",
];

// Domain anchor SOCs (§6 of Intelligence Layer Spec)
const DOMAIN_ANCHOR_SOCS = {
  Clinician:              "29-1216.00",
  Educator:               "25-1071.00",
  Researcher:             "19-1042.00",
  "Administrator/Leader": "11-9111.00",
  Advocate:               "21-1094.00",
  Innovator:              "15-2051.00",  // blended with 19-1042 below
  "Quality/Safety":       "29-9021.00",
  "Wellness Champion":    "21-1014.00",
};
const INNOVATOR_BLEND_SOC = "19-1042.00"; // Innovator = 50% Data Scientist + 50% Medical Scientist

// Adjacent non-physician SOCs (Appendix A + universal hidden functions)
const ADJACENT_SOCS = [
  "11-9111.00","13-1082.00","13-1111.00","15-1211.00","15-1252.00",
  "15-1255.00","15-2051.00","17-2031.00","17-2112.00","19-1041.00",
  "19-1042.00","19-3032.00","21-1022.00","21-1094.00","23-1022.00",
  "25-1071.00","25-9031.00","27-3042.00","29-2034.00","29-9021.00",
  "29-9092.00","21-1014.00",
];

// Hobby SOCs (for F8 Hobby-Profession Bridge)
const HOBBY_SOCS = [
  "27-4021.00",  // Photographers
  "27-2042.00",  // Musicians and Singers
  "27-3043.00",  // Writers and Authors
  "27-1013.00",  // Fine Artists
  "15-1252.00",  // Software Developers (already in adjacent)
  "29-9091.00",  // Athletic Trainers
  "35-1011.00",  // Chefs and Head Cooks
];

const ALL_NEEDED_SOCS = new Set([
  ...PHYSICIAN_SOCS,
  ...Object.values(DOMAIN_ANCHOR_SOCS),
  INNOVATOR_BLEND_SOC,
  ...ADJACENT_SOCS,
  ...HOBBY_SOCS,
]);

// ── §4 task → descriptor name mapping (from Intelligence Layer Spec §4) ────
// Each task maps to the relevant O*NET descriptor names (partial/fuzzy).
// PPD is excluded from F6 per spec ("Exclude PPD from the fit vector").

// O*NET 30.3 renames several Work Styles and Work Context descriptors vs. older spec language.
// Using exact O*NET 30.3 names here; spec aliases noted in comments.
const TASK_DESCRIPTOR_NAMES = {
  "Clinical Expertise": {
    Knowledge:       ["Medicine and Dentistry", "Biology", "Chemistry"],
    Skills:          ["Science", "Critical Thinking", "Judgment and Decision Making"],
    WorkActivities:  ["Assisting and Caring for Others", "Making Decisions and Solving Problems", "Updating and Using Relevant Knowledge"],
    WorkStyles:      ["Attention to Detail", "Dependability", "Stress Tolerance"],
    // "Health and Safety of Other Workers" = spec "Responsible for Others' Health"
    // "Dealing with Violent or Physically Aggressive People" = spec "Physically Aggressive People"
    WorkContext:     ["Consequence of Error", "Health and Safety of Other Workers", "Dealing with Violent or Physically Aggressive People"],
  },
  "Medical Knowledge": {
    Knowledge:       ["Medicine and Dentistry", "Biology", "Mathematics"],
    Skills:          ["Active Learning", "Reading Comprehension", "Science"],
    WorkActivities:  ["Updating and Using Relevant Knowledge", "Analyzing Data or Information", "Processing Information"],
    // "Intellectual Curiosity" = closest 30.3 WS to spec "Analytical Thinking"
    // "Achievement Orientation" = spec "Achievement/Effort"
    WorkStyles:      ["Intellectual Curiosity", "Achievement Orientation", "Initiative"],
    WorkContext:     ["Importance of Being Exact or Accurate"],
  },
  "Practice-Based Learning": {
    Knowledge:       ["Education and Training", "English Language"],
    Skills:          ["Learning Strategies", "Active Learning", "Complex Problem Solving"],
    WorkActivities:  ["Evaluating Information to Determine Compliance", "Judging the Qualities", "Monitoring Processes"],
    // "Perseverance" = spec "Persistence"
    WorkStyles:      ["Achievement Orientation", "Perseverance", "Initiative"],
    WorkContext:     ["Frequency of Decision Making"],
  },
  "Communication": {
    Knowledge:       ["Psychology", "Customer and Personal Service", "English Language"],
    Skills:          ["Active Listening", "Speaking", "Social Perceptiveness"],
    WorkActivities:  ["Communicating with Supervisors", "Establishing and Maintaining Interpersonal", "Resolving Conflicts and Negotiating"],
    // "Empathy" = spec "Concern for Others"
    WorkStyles:      ["Cooperation", "Empathy", "Social Orientation"],
    // "Face-to-Face Discussions with Individuals and Within Teams" = spec "Face-to-Face"
    // "Dealing With Unpleasant, Angry, or Discourteous People" = spec "Angry People"
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
    // "Leadership Orientation" = spec "Leadership"
    WorkStyles:      ["Leadership Orientation", "Adaptability", "Initiative"],
    // "Impact of Decisions on Co-workers or Company Results" = spec "Responsibility for Outcomes"
    // "Coordinate or Lead Others in Accomplishing Work Activities" = spec "Lead Others"
    WorkContext:     ["Impact of Decisions on Co-workers or Company Results", "Coordinate or Lead Others in Accomplishing Work Activities"],
  },
  "Collaboration & Teamwork": {
    Knowledge:       ["Customer and Personal Service", "Administration and Management"],
    Skills:          ["Coordination", "Persuasion", "Negotiation"],
    WorkActivities:  ["Communicating with Supervisors", "Establishing and Maintaining Interpersonal", "Coordinating the Work and Activities"],
    WorkStyles:      ["Cooperation", "Leadership Orientation", "Social Orientation"],
    WorkContext:     ["Work With or Contribute to a Work Group or Team", "Coordinate or Lead Others in Accomplishing Work Activities"],
  },
  // PPD excluded from F6 (spec §4: "no descriptor for identity/self-reflection")
};

// Domain rank matrix: for each domain, each skill's rank (1=primary, 8=least relevant)
// Source: domain_skill_rank_matrix.json
const SKILL_NAMES = [
  "Clinical Expertise","Medical Knowledge","Practice-Based Learning",
  "Communication","Professionalism & Ethics","Systems Thinking",
  "Collaboration & Teamwork",
];  // 7 skills excluding PPD

const DOMAIN_LABELS = [
  "Clinician","Educator","Researcher","Administrator/Leader",
  "Advocate","Innovator","Quality/Safety","Wellness Champion",
];

// Rank matrix: DOMAIN_RANK_MATRIX[domainIdx][skillIdx] = rank (1–8, PPD=rank8 excluded)
// Derived from domain_skill_rank_matrix.json, PPD column dropped
const DOMAIN_RANK_MATRIX = [
  // Clinician: CE=1,MK=2,PBL=6,Comm=3,PE=4,ST=7,C&T=5
  [1,2,6,3,4,7,5],
  // Educator: CE=5,MK=6,PBL=2,Comm=1,PE=7,ST=8,C&T=3
  [5,6,2,1,7,8,3],
  // Researcher: CE=5,MK=1,PBL=2,Comm=4,PE=8,ST=7,C&T=6
  [5,1,2,4,8,7,6],
  // Administrator/Leader: CE=6,MK=7,PBL=5,Comm=4,PE=3,ST=1,C&T=2
  [6,7,5,4,3,1,2],
  // Advocate: CE=5,MK=6,PBL=7,Comm=3,PE=2,ST=1,C&T=4
  [5,6,7,3,2,1,4],
  // Innovator: CE=5,MK=3,PBL=1,Comm=4,PE=7,ST=2,C&T=6
  [5,3,1,4,7,2,6],
  // Quality/Safety: CE=3,MK=7,PBL=1,Comm=5,PE=6,ST=2,C&T=4
  [3,7,1,5,6,2,4],
  // Wellness Champion: CE=5,MK=8,PBL=6,Comm=4,PE=3,ST=7,C&T=2
  [5,8,6,4,3,7,2],
];

// Normalize rank k (1–8) to weight: (9-k) / sum_weights
// For 7 skills (PPD excluded, ranks 1–7): weights = (8-k) / (8+7+6+5+4+3+2) = (8-k) / 35
function rankWeight(rank) {
  return (8 - rank) / 35;
}

// ── load O*NET data ─────────────────────────────────────────────────────────

console.log("Loading O*NET 30.3 data…");

const abilitiesRows  = readSheet("Abilities.xlsx").filter(r => r["Scale ID"] === "IM");
const knowledgeRows  = readSheet("Knowledge.xlsx").filter(r => r["Scale ID"] === "IM");
const workActRows    = readSheet("Work Activities.xlsx").filter(r => r["Scale ID"] === "IM");
const workCtxRows    = readSheet("Work Context.xlsx").filter(r => r["Scale ID"] === "CX");
const workStyleRows  = readSheet("Work Styles.xlsx").filter(r => r["Scale ID"] === "WI");
const essSkillRows   = readSheet("Essential Skills.xlsx").filter(r => r["Scale ID"] === "IM");
const transSkillRows = readSheet("Transferable Skills.xlsx").filter(r => r["Scale ID"] === "IM");
const interestRows   = readSheet("Career Interest Types.xlsx").filter(r => r["Scale ID"] === "OI");
const jobZoneRows    = readSheet("Job Zones.xlsx");
const occupRows      = readSheet("Occupation Data.xlsx");

// ── build descriptor catalog ────────────────────────────────────────────────

console.log("Building descriptor catalog…");

function uniqueElements(rows) {
  const seen = new Map();
  for (const r of rows) {
    if (!seen.has(r["Element ID"])) {
      seen.set(r["Element ID"], r["Element Name"]);
    }
  }
  return [...seen.entries()].sort((a,b) => a[0].localeCompare(b[0]));
}

const CATEGORY_ROWS = [
  { cat: "Abilities",          rows: abilitiesRows },
  { cat: "Knowledge",          rows: knowledgeRows },
  { cat: "WorkActivities",     rows: workActRows },
  { cat: "WorkContext",        rows: workCtxRows },
  { cat: "WorkStyles",         rows: workStyleRows },
  { cat: "EssentialSkills",    rows: essSkillRows },
  { cat: "TransferableSkills", rows: transSkillRows },
  { cat: "RIASEC",             rows: interestRows },
];

const descriptorCatalog = [];
let idx = 0;
for (const { cat, rows } of CATEGORY_ROWS) {
  for (const [eid, ename] of uniqueElements(rows)) {
    descriptorCatalog.push({ idx, elementId: eid, title: ename, category: cat });
    idx++;
  }
}

const N = descriptorCatalog.length;
console.log(`  ${N} descriptors across 8 categories`);

// Build element-ID → catalog index lookup
const elemIdxMap = new Map(descriptorCatalog.map(d => [d.elementId, d.idx]));

// Build name → catalog index lookup (lowercase, for §4 fuzzy matching)
const elemNameMap = new Map(descriptorCatalog.map(d => [d.title.toLowerCase(), d.idx]));

function findDescriptorIdx(nameFrag) {
  const frag = nameFrag.toLowerCase();
  // Exact match first
  if (elemNameMap.has(frag)) return elemNameMap.get(frag);
  // Substring match
  for (const [title, i] of elemNameMap) {
    if (title.includes(frag) || frag.includes(title)) return i;
  }
  return null;
}

// ── normalization bounds (global, all occupations) ──────────────────────────

console.log("Computing global normalization bounds…");

const globalMin = new Float64Array(N).fill(Infinity);
const globalMax = new Float64Array(N).fill(-Infinity);

const WI_MIN = -1.42, WI_MAX = 3.00; // empirical from data
const OI_MIN = 1.0,   OI_MAX = 7.0;

function normalize(val, cat) {
  const v = typeof val === "number" ? val : parseFloat(val);
  if (isNaN(v)) return 0;
  switch (cat) {
    case "WorkStyles": return Math.max(0, Math.min(1, (v - WI_MIN) / (WI_MAX - WI_MIN)));
    case "RIASEC":     return Math.max(0, Math.min(1, (v - OI_MIN) / (OI_MAX - OI_MIN)));
    default:           return Math.max(0, Math.min(1, (v - 1) / 4));   // IM/CX scale 1–5
  }
}

// ── build per-SOC raw vectors ────────────────────────────────────────────────

console.log("Building SOC descriptor vectors…");

// Index all rows by (socCode, elementId) → normalizedValue
const socVectors = new Map(); // soc → Float64Array(N)

function ensureSocVec(soc) {
  if (!socVectors.has(soc)) socVectors.set(soc, new Float64Array(N));
  return socVectors.get(soc);
}

function ingestRows(rows, cat) {
  for (const r of rows) {
    const soc = r["O*NET-SOC Code"];
    const eid = r["Element ID"];
    const val = r["Data Value"];
    const ei  = elemIdxMap.get(eid);
    if (ei === undefined) continue;
    const norm = normalize(val, cat);
    const vec = ensureSocVec(soc);
    vec[ei] = norm;
  }
}

ingestRows(abilitiesRows,  "Abilities");
ingestRows(knowledgeRows,  "Knowledge");
ingestRows(workActRows,    "WorkActivities");
ingestRows(workCtxRows,    "WorkContext");
ingestRows(workStyleRows,  "WorkStyles");
ingestRows(essSkillRows,   "EssentialSkills");
ingestRows(transSkillRows, "TransferableSkills");
ingestRows(interestRows,   "RIASEC");

console.log(`  ${socVectors.size} SOC vectors built`);

// ── synthesize catch-all SOC vectors by averaging sub-codes ──────────────────
// 29-1229.00 (Physicians, All Other) and 29-1249.00 (Surgeons, All Other) have
// no O*NET incumbent data; approximate by averaging available sub-code vectors.

function avgVectors(socs) {
  const vecs = socs.map(s => socVectors.get(s)).filter(Boolean);
  if (!vecs.length) return null;
  const avg = new Float64Array(N);
  for (const v of vecs) for (let i = 0; i < N; i++) avg[i] += v[i] / vecs.length;
  return avg;
}

const catchAll2291 = avgVectors(["29-1229.01","29-1229.03","29-1229.04","29-1229.05"]);
if (catchAll2291) { socVectors.set("29-1229.00", catchAll2291); console.log("  synthesized 29-1229.00 from 4 sub-codes"); }

const catchAll2492 = avgVectors(["29-1241.00","29-1242.00","29-1243.00"]);
if (catchAll2492) { socVectors.set("29-1249.00", catchAll2492); console.log("  synthesized 29-1249.00 from 3 surgical sub-codes"); }

// ── extract vectors for only needed SOCs ─────────────────────────────────────

const neededVectors = {};
for (const soc of ALL_NEEDED_SOCS) {
  const v = socVectors.get(soc);
  if (!v) { console.warn(`  WARN: ${soc} not found in O*NET data`); continue; }
  neededVectors[soc] = Array.from(v);
}

// ── SOC title map ─────────────────────────────────────────────────────────────

const socTitles = {};
for (const r of occupRows) socTitles[r["O*NET-SOC Code"]] = r["Title"];

// ── variance weights across physician SOCs ────────────────────────────────────

console.log("Computing variance weights across physician SOCs…");

const physVecs = PHYSICIAN_SOCS.map(s => neededVectors[s]).filter(Boolean);
const varianceWeights = new Array(N).fill(0);
for (let i = 0; i < N; i++) {
  const vals = physVecs.map(v => v[i]);
  const mean = vals.reduce((a,b) => a+b, 0) / vals.length;
  const variance = vals.reduce((s,v) => s + (v-mean)**2, 0) / vals.length;
  varianceWeights[i] = variance;
}
// Normalize variance weights to sum to 1
const varSum = varianceWeights.reduce((a,b) => a+b, 0);
const normVarWeights = varianceWeights.map(v => varSum > 0 ? v / varSum : 1 / N);

// ── build §4 task descriptor masks ────────────────────────────────────────────

console.log("Building §4 task-descriptor masks…");

// taskMasks[taskName] = sparse index set of relevant descriptors
const taskMasks = {};
for (const [task, catMap] of Object.entries(TASK_DESCRIPTOR_NAMES)) {
  const indices = new Set();
  for (const names of Object.values(catMap)) {
    for (const name of names) {
      const i = findDescriptorIdx(name);
      if (i !== null) indices.add(i);
      else console.warn(`  WARN: could not resolve descriptor "${name}" for task "${task}"`);
    }
  }
  taskMasks[task] = [...indices];
}

// ── domain fingerprints (Stage 5 compose) ────────────────────────────────────

console.log("Computing domain fingerprints…");

// For each physician SOC × domain, compute:
//   V_domain = 0.50 * V_base + 0.50 * sum_r(w_r * V_anchor_filtered_to_task_r)

const domainFingerprints = {}; // {socCode: {domainLabel: number[]}}

for (const physSoc of PHYSICIAN_SOCS) {
  const vBase = neededVectors[physSoc];
  if (!vBase) continue;
  domainFingerprints[physSoc] = {};

  for (let d = 0; d < DOMAIN_LABELS.length; d++) {
    const domainLabel = DOMAIN_LABELS[d];
    const anchorSoc   = DOMAIN_ANCHOR_SOCS[domainLabel];
    let   vAnchor     = neededVectors[anchorSoc];
    if (!vAnchor) { console.warn(`  WARN: anchor SOC ${anchorSoc} missing for ${domainLabel}`); continue; }

    // Innovator = 50% Data Scientist (15-2051) + 50% Medical Scientist (19-1042)
    if (domainLabel === "Innovator" && neededVectors[INNOVATOR_BLEND_SOC]) {
      const vBlend = neededVectors[INNOVATOR_BLEND_SOC];
      vAnchor = vAnchor.map((v, i) => (v + vBlend[i]) / 2);
    }

    // V_anchor_task = weighted sum of anchor vector filtered to each task's descriptors
    const vTaskSum = new Array(N).fill(0);
    const ranks = DOMAIN_RANK_MATRIX[d];
    for (let s = 0; s < SKILL_NAMES.length; s++) {
      const skill   = SKILL_NAMES[s];
      const mask    = taskMasks[skill] ?? [];
      const w       = rankWeight(ranks[s]);
      for (const i of mask) {
        vTaskSum[i] += w * vAnchor[i];
      }
    }

    // V_domain = 0.50 * V_base + 0.50 * V_task_sum
    const vDomain = vBase.map((v, i) => 0.5 * v + 0.5 * vTaskSum[i]);
    domainFingerprints[physSoc][domainLabel] = vDomain;
  }
}

// ── adjacency baskets (Stage 3) ───────────────────────────────────────────────

console.log("Computing adjacency baskets (Job Zone ≥ 3, top 20)…");

const jobZoneMap = {};
for (const r of jobZoneRows) jobZoneMap[r["O*NET-SOC Code"]] = r["Job Zone"];

// Build candidate pool: non-physician SOCs with Job Zone ≥ 3
const candidatePool = [];
for (const [soc, vec] of socVectors.entries()) {
  if (String(soc).startsWith("29-1")) continue; // exclude physician SOCs
  if ((jobZoneMap[soc] ?? 0) < 3) continue;
  candidatePool.push({ soc, title: socTitles[soc] ?? soc, vec: Array.from(vec) });
}
console.log(`  candidate pool: ${candidatePool.length} non-physician Job Zone ≥ 3 occupations`);

function cosineSim(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na  += a[i] * a[i];
    nb  += b[i] * b[i];
  }
  return (na > 0 && nb > 0) ? dot / Math.sqrt(na * nb) : 0;
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

// ── write TypeScript output files ─────────────────────────────────────────────

console.log("\nWriting TypeScript seed files…");

const BANNER = `// AUTO-GENERATED by docs/seeds/onet/build-onet-seed.mjs — do not edit manually.
// Source: O*NET 30.3 Database, U.S. DOL/ETA, May 2026. CC-BY 4.0.
// https://www.onetcenter.org/license_db.html\n\n`;

writeTs("descriptor-catalog.ts", BANNER +
  `export type OnetDescriptor = {
  idx: number;
  elementId: string;
  title: string;
  category: "Abilities"|"Knowledge"|"WorkActivities"|"WorkContext"|"WorkStyles"|"EssentialSkills"|"TransferableSkills"|"RIASEC";
};\n\n` +
  `export const DESCRIPTOR_CATALOG: readonly OnetDescriptor[] = ${JSON.stringify(descriptorCatalog, null, 2)} as const;\n\n` +
  `export const DESCRIPTOR_COUNT = ${N};\n`
);

writeTs("soc-vectors.ts", BANNER +
  `/** Normalized O*NET 30.3 descriptor vectors (${N}-dim) keyed by SOC code. */\n` +
  `export const SOC_VECTORS: Readonly<Record<string, readonly number[]>> = ${JSON.stringify(neededVectors, null, 1)};\n`
);

writeTs("variance-weights.ts", BANNER +
  `/** Per-descriptor discriminative variance across ${physVecs.length} physician SOCs. Normalized to sum=1. */\n` +
  `export const VARIANCE_WEIGHTS: readonly number[] = ${JSON.stringify(normVarWeights.map(v => parseFloat(v.toFixed(6))))
    .replace(/,/g, ",\n  ")
    .replace("[", "[\n  ")
    .replace("]", ",\n]")};\n`
);

writeTs("domain-fingerprints.ts", BANNER +
  `/**
 * Precomputed domain fingerprints per physician SOC.
 * Formula: V_domain = 0.50 × V_base + 0.50 × Σ w_r × (V_anchor filtered to §4 task descriptors)
 * Anchor SOCs from Intelligence Layer Spec §6.
 */\n` +
  `export const DOMAIN_FINGERPRINTS: Readonly<Record<string, Readonly<Record<string, readonly number[]>>>> =\n` +
  `  ${JSON.stringify(domainFingerprints, null, 1)};\n\n` +
  `export const DOMAIN_LABELS = [\n` +
  DOMAIN_LABELS.map(l => `  "${l}"`).join(",\n") + "\n] as const;\n\n" +
  `export const DOMAIN_ANCHOR_SOCS: Readonly<Record<string, string>> = ${JSON.stringify(DOMAIN_ANCHOR_SOCS, null, 2)};\n`
);

// SOC title map for the needed SOCs
const neededTitles = {};
for (const soc of ALL_NEEDED_SOCS) {
  if (socTitles[soc]) neededTitles[soc] = socTitles[soc];
}

writeTs("adjacency-baskets.ts", BANNER +
  `export type AdjacentOccupation = { soc: string; title: string; similarity: number };\n\n` +
  `/** Top-20 non-physician Job-Zone-≥3 adjacent occupations per physician SOC (cosine similarity). */\n` +
  `export const ADJACENCY_BASKETS: Readonly<Record<string, readonly AdjacentOccupation[]>> = ` +
  `${JSON.stringify(adjacencyBaskets, null, 1)};\n\n` +
  `/** O*NET titles for all SOC codes used in the FISCMAK seed. */\n` +
  `export const SOC_TITLES: Readonly<Record<string, string>> = ${JSON.stringify(neededTitles, null, 2)};\n`
);

console.log("\n✓ O*NET 30.3 seed built successfully.");
console.log(`  ${N} descriptors · ${Object.keys(neededVectors).length} SOC vectors · ${Object.keys(domainFingerprints).length} specialty fingerprint sets`);
console.log("  Attribution: O*NET 30.3 Database, U.S. DOL/ETA — CC-BY 4.0");
console.log("  https://www.onetcenter.org/license_db.html");

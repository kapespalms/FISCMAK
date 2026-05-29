/**
 * Education hub ↔ rotation cross-links — heuristic tag matching on manifest docs.
 */

import { listAllEducationDocuments, type EducationDocument } from "@/lib/v2/programs/uh-residency-content";
import { listRotationOrientationIndex } from "@/lib/v2/programs/rotation-orientation";

const ROTATION_KEYWORDS: Record<string, string[]> = {
  cl: ["consult", "liaison", "delirium", "capacity", "medical clearance"],
  mpu_cl: ["med-psych", "med psych", "mpu", "consult"],
  capu: ["child", "adolescent", "pediatric"],
  outpatient_child: ["child", "adolescent", "pediatric"],
  outpatient_addiction: ["addiction", "mat", "opioid", "substance", "alcohol"],
  va_addiction: ["addiction", "mat", "opioid", "substance"],
  mat_addiction: ["addiction", "mat", "opioid", "substance"],
  geriatric_psychiatry: ["geriatric", "dementia", "elder"],
  neurology: ["neurology", "seizure", "stroke", "headache"],
  call: ["call", "emergency", "crisis"],
  psych_ed_uh_va: ["emergency", "suicide", "crisis", "psychiatric emergency"],
  psych_ed_uh: ["emergency", "suicide", "crisis"],
  uh_interventional: ["ect", "depression", "treatment-resistant"],
  outpatient_adult: ["outpatient", "depression", "anxiety", "bipolar"],
  va_ct6: ["inpatient", "psychosis", "bipolar", "schizophrenia"],
  uh_concord: ["inpatient"],
  swg: ["inpatient", "geriatric"],
  northcoast: ["forensic", "inpatient"],
  medtox: ["toxicology", "overdose", "poison"],
};

function scoreDocument(doc: EducationDocument, rotationCode: string, keywords: Set<string>): number {
  const haystack = [
    doc.title,
    doc.filename,
    doc.description,
    doc.subcategory,
    ...(doc.tags ?? []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const codeSpaced = rotationCode.replace(/_/g, " ");
  const codeHyphen = rotationCode.replace(/_/g, "-");
  let score = 0;

  if (haystack.includes(rotationCode) || haystack.includes(codeSpaced) || haystack.includes(codeHyphen)) {
    score += 12;
  }

  for (const kw of keywords) {
    const needle = kw.toLowerCase().trim();
    if (needle.length < 3) continue;
    if (haystack.includes(needle)) score += 3;
  }

  return score;
}

/** Top education docs related to a rotation (3–6 links). */
export function findEducationDocsForRotation(
  rotationCode: string,
  limit = 6,
): Array<EducationDocument & { categoryId?: string }> {
  const entry = listRotationOrientationIndex().find((e) => e.rotation_code === rotationCode);
  const keywords = new Set<string>([
    rotationCode.replace(/_/g, " "),
    ...(ROTATION_KEYWORDS[rotationCode] ?? []),
    ...(entry?.aliases ?? []),
    ...(entry?.service_name
      ? entry.service_name
          .toLowerCase()
          .split(/[^a-z0-9]+/)
          .filter((w) => w.length > 3)
      : []),
  ]);

  const minResults = 3;
  const maxResults = Math.min(Math.max(limit, minResults), 6);

  const ranked = listAllEducationDocuments()
    .map((doc) => ({ doc, score: scoreDocument(doc, rotationCode, keywords) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.doc.title.localeCompare(b.doc.title));

  return ranked.slice(0, maxResults).map(({ doc }) => doc);
}

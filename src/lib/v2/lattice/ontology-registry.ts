import ontologyExport from "../../../../docs/exports/ontology-full-export.json";
import { SKILLS, DOMAINS } from "@/lib/constants";
import { ACGME_TO_FISCMAK_DOMAIN } from "@/lib/v2/lattice/ontology-bridge";

type OntologyTables = (typeof ontologyExport)["tables"];

export type ActivityLatticePlacement = {
  activityKey: string;
  domainIndex: number;
  trackIndex: number;
  acgmeKey: string;
  defaultDevelopmentLevel: number;
  subcompetencyKey?: string;
  trackKey?: string;
};

/** Free-tier classifier keys → ontology activity_key */
export const FREE_ACTIVITY_ALIASES: Record<string, string> = {
  led_team_project: "led_meeting",
  mentored_junior: "mentored_trainee",
  taught_medical_students: "gave_informal_teaching",
  presented_research: "presented_scholarship",
  emotional_labor: "supported_distressed_learner",
  advocated_change: "advocated_for_change",
  improved_process: "improved_workflow",
};

// Domain rows aligned to the v3 spec (§2.2, AAMC PCRS), in spec order:
//   0 Clinical Expertise · 1 Medical Knowledge · 2 Practice-Based Learning ·
//   3 Communication · 4 Professionalism & Ethics · 5 Systems Thinking ·
//   6 Collaboration & Teamwork · 7 Personal & Professional Development
const FISCMAK_DOMAIN_TO_LATTICE: Record<string, number> = {
  pc: 0,
  mk: 1,
  pbli: 2,
  ics: 3,
  prof: 4,
  sbp: 5,
  scholarship: 1,
  teaching: 2,
  mentorship: 6,
  leadership: 6,
  admin: 5,
  advocacy: 5,
  innovation: 2,
  wellbeing: 7,
  identity: 7,
};

const FISCMAK_DOMAIN_TO_ACGME: Record<string, string> = {
  teaching: "pbli",
  mentorship: "prof",
  leadership: "sbp",
  admin: "sbp",
  wellbeing: "prof",
  scholarship: "mk",
  innovation: "pbli",
  advocacy: "sbp",
  identity: "prof",
};

const TRACK_KEY_TO_INDEX: Record<string, number> = {
  clinician: 0,
  clinician_educator: 1,
  researcher: 2,
  program_leader: 3,
  systems_leader: 3,
  administrator: 3,
  consultant: 3,
  executive: 3,
  advocate: 4,
  innovator: 5,
  quality_safety: 6,
  wellness_champion: 7,
};

function acgmeKeyForDomain(domainKey: string, framework: string): string {
  if (framework === "ACGME") return domainKey;
  return FISCMAK_DOMAIN_TO_ACGME[domainKey] ?? "pbli";
}

function buildRegistry(): {
  byActivityKey: Map<string, ActivityLatticePlacement>;
  textMatchers: Array<{ activityKey: string; phrases: string[] }>;
} {
  const tables = ontologyExport.tables as OntologyTables;
  const domainsById = new Map(
    tables.ontology_competency_domains.map((d) => [d.domain_id, d]),
  );
  const tracksById = new Map(
    tables.ontology_career_tracks.map((t) => [t.track_id, t]),
  );
  const subcompetenciesById = new Map(
    tables.ontology_subcompetencies.map((s) => [s.subcompetency_id, s]),
  );
  const activitiesById = new Map(
    tables.ontology_invisible_work_activities.map((a) => [a.activity_id, a]),
  );

  const byActivityKey = new Map<string, ActivityLatticePlacement>();
  const textMatchers: Array<{ activityKey: string; phrases: string[] }> = [];

  for (const activity of tables.ontology_invisible_work_activities) {
    const phrases = [
      activity.activity_name,
      activity.plain_language_description,
      ...(activity.context_examples ?? []),
    ].filter(Boolean) as string[];
    textMatchers.push({ activityKey: activity.activity_key, phrases });
  }

  for (const sub of tables.ontology_subcompetencies) {
    textMatchers.push({
      activityKey: "",
      phrases: [sub.name, sub.description ?? ""].filter(Boolean),
    });
  }

  for (const mapping of tables.ontology_activity_mappings) {
    if (!mapping.active) continue;
    const activity = activitiesById.get(mapping.activity_id);
    if (!activity) continue;
    const track = tracksById.get(mapping.track_id);
    const sub = subcompetenciesById.get(mapping.subcompetency_id);
    const domain = sub ? domainsById.get(sub.domain_id) : undefined;
    if (!domain || !track || !sub) continue;

    const domainIndex = FISCMAK_DOMAIN_TO_LATTICE[domain.domain_key] ?? 0;
    const trackIndex = TRACK_KEY_TO_INDEX[track.track_key] ?? 0;
    const acgmeKey = acgmeKeyForDomain(domain.domain_key, domain.framework);
    const existing = byActivityKey.get(activity.activity_key);
    const weight = mapping.weight ?? 1;
    if (existing && (existing as ActivityLatticePlacement & { _weight?: number })._weight != null) {
      const prevWeight = (existing as ActivityLatticePlacement & { _weight?: number })._weight ?? 0;
      if (prevWeight >= weight) continue;
    }

    byActivityKey.set(activity.activity_key, {
      activityKey: activity.activity_key,
      domainIndex,
      trackIndex,
      acgmeKey,
      defaultDevelopmentLevel: 3,
      subcompetencyKey: sub.subcompetency_key,
      trackKey: track.track_key,
    });
  }

  return { byActivityKey, textMatchers };
}

const REGISTRY = buildRegistry();

export function lookupActivityPlacement(
  activityKey: string | null | undefined,
  trackKey?: string | null,
): ActivityLatticePlacement | null {
  if (!activityKey) return null;
  const normalized = activityKey.trim().toLowerCase();
  const aliased = FREE_ACTIVITY_ALIASES[normalized] ?? normalized;
  const hit = REGISTRY.byActivityKey.get(aliased);
  if (!hit) return null;
  if (trackKey) {
    const trackIndex = TRACK_KEY_TO_INDEX[trackKey.toLowerCase()];
    if (trackIndex != null) {
      return { ...hit, trackIndex, trackKey };
    }
  }
  return hit;
}

export function lookupTrackKey(trackKey: string | null | undefined): number {
  if (!trackKey) return -1;
  return TRACK_KEY_TO_INDEX[trackKey.toLowerCase()] ?? -1;
}

/** Returns the skill/task name for a skill_index (task axis). */
export function canonicalDomainLabel(domainIndex: number): string {
  return SKILLS[domainIndex] ?? SKILLS[0]!;
}

/** Returns the domain identity name for a domain_index (identity axis). */
export function canonicalTrackLabel(trackIndex: number): string {
  return DOMAINS[trackIndex] ?? DOMAINS[0]!;
}

/** Match document/activity text to ontology activities via exported phrases */
export function matchTextToActivityPlacement(text: string): ActivityLatticePlacement | null {
  const lower = text.toLowerCase();
  let best: { key: string; score: number } | null = null;

  for (const matcher of REGISTRY.textMatchers) {
    if (!matcher.activityKey) continue;
    let score = 0;
    for (const phrase of matcher.phrases) {
      const p = phrase.toLowerCase();
      if (p.length < 4) continue;
      if (lower.includes(p)) score += p.length;
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { key: matcher.activityKey, score };
    }
  }

  if (best) return lookupActivityPlacement(best.key);
  return null;
}

export function resolveAcgmeFromDomainIndex(domainIndex: number): string {
  for (const [key, idx] of Object.entries(ACGME_TO_FISCMAK_DOMAIN)) {
    if (idx === domainIndex) return key;
  }
  return "pc";
}

export { REGISTRY };

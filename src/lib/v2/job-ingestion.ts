/**
 * Job feed ingestion — curated seeds + partner API hooks.
 * Live APIs (Indeed, NEJM, etc.) require partnership keys; curated sync works today.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export type CuratedJob = {
  source_job_id: string;
  source_name: string;
  title: string;
  institution: string;
  location_city: string;
  location_state: string;
  specialty_key: string;
  salary_min: number;
  salary_max: number;
  remote_type: "on-site" | "hybrid" | "remote";
  setting: string;
  role_level: string;
  description: string;
  growth_potential: "HIGH" | "MEDIUM" | "LOW";
  source_url?: string;
};

/** Curated physician roles — expand as partnerships go live. */
export const CURATED_JOBS: CuratedJob[] = [
  {
    source_job_id: "curated-001",
    source_name: "Manual Curation",
    title: "Interventional Cardiologist",
    institution: "Mayo Clinic",
    location_city: "Rochester",
    location_state: "MN",
    specialty_key: "im",
    salary_min: 320000,
    salary_max: 420000,
    remote_type: "on-site",
    setting: "academic",
    role_level: "attending",
    description: "Leading interventional cardiology program with research optional.",
    growth_potential: "HIGH",
  },
  {
    source_job_id: "curated-002",
    source_name: "Manual Curation",
    title: "Academic Hospitalist",
    institution: "Johns Hopkins",
    location_city: "Baltimore",
    location_state: "MD",
    specialty_key: "im",
    salary_min: 250000,
    salary_max: 310000,
    remote_type: "on-site",
    setting: "academic",
    role_level: "attending",
    description: "Academic hospital medicine with teaching and QI opportunities.",
    growth_potential: "HIGH",
  },
  {
    source_job_id: "curated-003",
    source_name: "Manual Curation",
    title: "Clinician-Educator Psychiatrist",
    institution: "UCSF",
    location_city: "San Francisco",
    location_state: "CA",
    specialty_key: "psych",
    salary_min: 280000,
    salary_max: 340000,
    remote_type: "hybrid",
    setting: "academic",
    role_level: "assistant_professor",
    description: "Teaching, supervision, and clinical excellence track.",
    growth_potential: "MEDIUM",
  },
  {
    source_job_id: "curated-004",
    source_name: "Manual Curation",
    title: "Emergency Medicine Physician",
    institution: "Mass General Brigham",
    location_city: "Boston",
    location_state: "MA",
    specialty_key: "em",
    salary_min: 290000,
    salary_max: 360000,
    remote_type: "on-site",
    setting: "academic",
    role_level: "attending",
    description: "High-acuity ED with residency teaching component.",
    growth_potential: "HIGH",
  },
  {
    source_job_id: "curated-005",
    source_name: "Manual Curation",
    title: "Family Medicine — Community Health",
    institution: "Kaiser Permanente",
    location_city: "Oakland",
    location_state: "CA",
    specialty_key: "fm",
    salary_min: 240000,
    salary_max: 290000,
    remote_type: "hybrid",
    setting: "integrated",
    role_level: "attending",
    description: "Panel-based primary care with population health focus.",
    growth_potential: "MEDIUM",
  },
  {
    source_job_id: "curated-006",
    source_name: "Manual Curation",
    title: "Pediatric Hospitalist",
    institution: "Children's Hospital of Philadelphia",
    location_city: "Philadelphia",
    location_state: "PA",
    specialty_key: "peds",
    salary_min: 220000,
    salary_max: 280000,
    remote_type: "on-site",
    setting: "academic",
    role_level: "attending",
    description: "Inpatient pediatrics with medical student and resident teaching.",
    growth_potential: "HIGH",
  },
];

export type JobSyncResult = {
  source: string;
  inserted: number;
  updated: number;
  skipped: number;
  errors: string[];
};

export async function syncCuratedJobs(supabase: SupabaseClient): Promise<JobSyncResult> {
  const result: JobSyncResult = {
    source: "Manual Curation",
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  const { data: sourceRow } = await supabase
    .from("job_sources")
    .select("source_id")
    .eq("source_name", "Manual Curation")
    .maybeSingle();

  const sourceId = sourceRow?.source_id ?? null;

  for (const job of CURATED_JOBS) {
    try {
      const { data: specialty } = await supabase
        .from("ontology_specialties")
        .select("specialty_id")
        .eq("specialty_key", job.specialty_key)
        .maybeSingle();

      const location = `${job.location_city}, ${job.location_state}`;
      const salary = Math.round((job.salary_min + job.salary_max) / 2);

      const { data: existing } = await supabase
        .from("jobs")
        .select("job_id")
        .eq("source_job_id", job.source_job_id)
        .maybeSingle();

      const row = {
        source: job.source_name,
        source_id: sourceId,
        source_job_id: job.source_job_id,
        title: job.title,
        institution: job.institution,
        employer: job.institution,
        location,
        location_city: job.location_city,
        location_state: job.location_state,
        salary,
        salary_min: job.salary_min,
        salary_max: job.salary_max,
        specialties: [job.specialty_key],
        specialty_key: job.specialty_key,
        specialty_id: specialty?.specialty_id ?? null,
        remote_type: job.remote_type,
        setting: job.setting,
        role_level: job.role_level,
        description: job.description,
        raw_description: job.description,
        growth_potential: job.growth_potential,
        source_url: job.source_url ?? null,
        posted_date: new Date().toISOString().slice(0, 10),
        last_seen: new Date().toISOString().slice(0, 10),
        is_active: true,
        updated_at: new Date().toISOString(),
      };

      if (existing?.job_id) {
        await supabase.from("jobs").update(row).eq("job_id", existing.job_id);
        result.updated += 1;
      } else {
        await supabase.from("jobs").insert(row);
        result.inserted += 1;
      }
    } catch (e) {
      result.errors.push(
        `${job.source_job_id}: ${e instanceof Error ? e.message : String(e)}`,
      );
    }
  }

  if (sourceId) {
    await supabase
      .from("job_sources")
      .update({ last_synced_at: new Date().toISOString() })
      .eq("source_id", sourceId);
  }

  return result;
}

/** Placeholder for partner API ingestion — wire when keys are available. */
export async function syncPartnerJobFeeds(
  _supabase: SupabaseClient,
): Promise<JobSyncResult[]> {
  const indeedKey = process.env.INDEED_PUBLISHER_KEY?.trim();
  if (!indeedKey) {
    return [
      {
        source: "Indeed Partner API",
        inserted: 0,
        updated: 0,
        skipped: 0,
        errors: ["INDEED_PUBLISHER_KEY not configured — using curated feed only"],
      },
    ];
  }
  // Partner API integration point
  return [];
}

export async function runJobIngestion(supabase: SupabaseClient): Promise<JobSyncResult[]> {
  const curated = await syncCuratedJobs(supabase);
  const partner = await syncPartnerJobFeeds(supabase);
  return [curated, ...partner];
}

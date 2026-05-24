"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Map } from "lucide-react";
import { CardSection } from "@/components/ui/CardSection";
import { Badge } from "@/components/ui/Badge";
import { PATHWAYS_MAK } from "@/lib/card-mak-prompts";
import type { Pathway } from "@/lib/v2/types";

type PathwayRow = Pathway & { open_positions?: number };

function demandBadge(demand: string | null) {
  if (demand === "HIGH") return "energizing" as const;
  if (demand === "LOW") return "draining" as const;
  return "neutral" as const;
}

type PathwaysExplorerProps = {
  embedded?: boolean;
};

export function PathwaysExplorer({ embedded = false }: PathwaysExplorerProps) {
  const [pathways, setPathways] = useState<PathwayRow[]>([]);
  const [specialty, setSpecialty] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/pathways")
      .then((r) => r.json())
      .then((d) => {
        setPathways((d.pathways as PathwayRow[]) ?? []);
        setSpecialty(d.specialty ?? "");
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const body = (
    <>
      {!embedded && (
        <Link
          href="/app/plan"
          className="mb-6 inline-block text-sm font-medium text-cx-forest-dark/70 hover:text-cx-forest-dark"
        >
          Back to strategy
        </Link>
      )}

      {loading && <p className="text-sm text-cx-forest-dark/70">Loading pathways…</p>}

      {!loading && pathways.length === 0 && (
        <CardSection
          eyebrow="Career pathways"
          title="No pathways yet"
          description="Complete your Career Profile to see specialty pathways tailored to your background."
          icon={Map}
          mak={PATHWAYS_MAK.overview}
        />
      )}

      {!loading && pathways.length > 0 && (
        <div className="space-y-4">
          <CardSection
            compact
            eyebrow={specialty ? `${specialty} pathways` : "Career pathways"}
            title={`${pathways.length} pathway${pathways.length === 1 ? "" : "s"} for your specialty`}
            description="Compare clinical, research, and hybrid tracks — then explore matched open positions."
            icon={Map}
            mak={PATHWAYS_MAK.overview}
            footer={
              <Link
                href="/app/plan?tab=jobs"
                className="inline-flex items-center gap-1 text-sm font-medium text-cx-forest-dark hover:text-cx-forest-dark/80"
              >
                View job matches
                <ChevronRight size={16} />
              </Link>
            }
          />

          <div className="grid gap-4 md:grid-cols-2">
            {pathways.map((pathway) => (
              <CardSection
                key={pathway.pathway_id}
                eyebrow={pathway.specialty}
                title={pathway.pathway_type}
                description={pathway.description ?? undefined}
                mak={PATHWAYS_MAK.pathway(pathway.pathway_type, pathway.description ?? "")}
                footer={
                  pathway.open_positions != null ? (
                    <p className="text-xs text-cx-forest-dark/60">
                      {pathway.open_positions} open position
                      {pathway.open_positions === 1 ? "" : "s"}
                    </p>
                  ) : undefined
                }
              >
                <div className="flex flex-wrap items-center gap-2">
                  {pathway.job_market_demand && (
                    <Badge energy={demandBadge(pathway.job_market_demand)}>
                      {pathway.job_market_demand} demand
                    </Badge>
                  )}
                  {pathway.salary_range && (
                    <span className="text-sm text-cx-forest-dark/80">{pathway.salary_range}</span>
                  )}
                </div>
              </CardSection>
            ))}
          </div>
        </div>
      )}
    </>
  );

  return body;
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Map } from "lucide-react";

type Pathway = {
  pathway_id: string;
  specialty: string;
  pathway_type: string;
  description: string;
  salary_range: string;
  job_market_demand: string;
  open_positions?: number;
};

export function PathwaysExplorer() {
  const [pathways, setPathways] = useState<Pathway[]>([]);
  const [specialty, setSpecialty] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/pathways")
      .then((r) => r.json())
      .then((d) => {
        setPathways(d.pathways ?? []);
        setSpecialty(d.specialty ?? "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function demandBadge(demand: string) {
    if (demand === "HIGH") return "energizing" as const;
    if (demand === "LOW") return "draining" as const;
    return "neutral" as const;
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Map className="text-fiscmak-green" size={22} />
          Career pathways
          {specialty && (
            <span className="text-base font-normal text-fiscmak-muted">
              · {specialty}
            </span>
          )}
        </h2>
        <Link
          href="/app/jobs"
          className="text-sm font-medium text-fiscmak-green hover:underline"
        >
          View job matches →
        </Link>
      </div>

      {loading && <p className="text-sm text-fiscmak-muted">Loading pathways…</p>}

      {!loading && pathways.length === 0 && (
        <Card>
          <p className="text-sm text-fiscmak-muted">
            Complete onboarding to see pathways for your specialty.
          </p>
        </Card>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {pathways.map((p) => (
          <Card key={p.pathway_id} accent="green">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold">{p.pathway_type}</h3>
              <Badge energy={demandBadge(p.job_market_demand)}>
                {p.job_market_demand} demand
              </Badge>
            </div>
            <p className="mt-2 text-sm text-fiscmak-muted">{p.description}</p>
            <p className="mt-2 text-sm">{p.salary_range}</p>
            {p.open_positions != null && (
              <p className="mt-1 text-xs text-fiscmak-muted">
                {p.open_positions} open positions
              </p>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
}

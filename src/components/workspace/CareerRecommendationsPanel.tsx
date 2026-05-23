"use client";

import Link from "next/link";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusChip } from "@/components/ui/StatusChip";
import type { CareerCoachingBrief, CareerRecommendation } from "@/lib/v2/career-recommendations";
import type { MetricStatus } from "@/lib/design-system";

function priorityToStatus(priority: CareerRecommendation["priority"]): MetricStatus {
  if (priority === "urgent") return "needs_attention";
  if (priority === "high") return "developing";
  if (priority === "celebration") return "strong";
  return "stable";
}

function RecommendationCard({
  rec,
  onDiscuss,
}: {
  rec: CareerRecommendation;
  onDiscuss?: (rec: CareerRecommendation) => void;
}) {
  return (
    <div className="rounded-lg border border-fiscmak-border bg-fm-surface p-4 shadow-sm">
      <div className="flex items-start gap-3">
        {rec.priority === "urgent" ? (
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-fm-attention" aria-hidden />
        ) : (
          <TrendingUp size={18} className="mt-0.5 shrink-0 text-fm-neutral" aria-hidden />
        )}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-fm-primary">{rec.title}</p>
            <StatusChip status={priorityToStatus(rec.priority)} />
          </div>
          <p className="mt-2 text-sm text-fiscmak-muted">{rec.message}</p>
          <p className="mt-2 text-caption">Rationale: {rec.trigger}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {onDiscuss && (
              <Button variant="secondary" onClick={() => onDiscuss(rec)}>
                Discuss with Mak
              </Button>
            )}
            {rec.suggested_actions.slice(0, 2).map((a) => (
              <Link
                key={a.url + a.action}
                href={a.url}
                className="inline-flex min-h-[44px] items-center text-sm font-medium text-fm-accent hover:underline"
              >
                {a.action}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CareerRecommendationsPanel({
  brief,
  onDiscuss,
}: {
  brief: CareerCoachingBrief;
  onDiscuss?: (rec: CareerRecommendation) => void;
}) {
  return (
    <Card>
      <p className="text-data-label">Coach Mak recommends</p>
      <h2 className="text-section-header mt-1">{brief.headline}</h2>
      {brief.primary_focus && (
        <p className="mt-2 text-sm text-fiscmak-muted">
          Primary focus:{" "}
          <span className="font-semibold text-fiscmak-ink">{brief.primary_focus.title}</span>
        </p>
      )}
      <div className="mt-4 space-y-3">
        {brief.recommendations.slice(0, 3).map((rec) => (
          <RecommendationCard key={rec.id} rec={rec} onDiscuss={onDiscuss} />
        ))}
      </div>
    </Card>
  );
}

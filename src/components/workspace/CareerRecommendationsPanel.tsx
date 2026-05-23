"use client";

import Link from "next/link";
import { AlertTriangle, Sparkles, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { CareerCoachingBrief, CareerRecommendation } from "@/lib/v2/career-recommendations";

function priorityIcon(priority: CareerRecommendation["priority"]) {
  if (priority === "urgent") return <AlertTriangle size={16} className="text-fiscmak-red" />;
  if (priority === "celebration") return <Sparkles size={16} className="text-fiscmak-green" />;
  return <TrendingUp size={16} className="text-fiscmak-muted" />;
}

function RecommendationCard({
  rec,
  onDiscuss,
}: {
  rec: CareerRecommendation;
  onDiscuss?: (rec: CareerRecommendation) => void;
}) {
  return (
    <div
      className={`rounded-lg border p-4 ${
        rec.priority === "urgent"
          ? "border-fiscmak-red/40 bg-red-50/50"
          : rec.priority === "celebration"
            ? "border-fiscmak-green/40 bg-fiscmak-green-light/40"
            : "border-fiscmak-border"
      }`}
    >
      <div className="flex items-start gap-2">
        {priorityIcon(rec.priority)}
        <div className="flex-1">
          <p className="font-semibold">{rec.title}</p>
          <p className="mt-1 text-sm text-fiscmak-muted">{rec.message}</p>
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
                className="text-sm text-fiscmak-green hover:underline"
              >
                {a.action} →
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
    <Card accent={brief.alert_count > 0 ? "amber" : "green"}>
      <p className="text-xs font-semibold uppercase text-fiscmak-muted">Coach Mak recommends</p>
      <h2 className="mt-1 text-lg font-bold">{brief.headline}</h2>
      {brief.primary_focus && (
        <p className="mt-2 text-sm text-fiscmak-muted">
          Primary focus: <span className="font-semibold text-fiscmak-text">{brief.primary_focus.title}</span>
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

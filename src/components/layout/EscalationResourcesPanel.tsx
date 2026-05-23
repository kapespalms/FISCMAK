"use client";

import Link from "next/link";
import { AlertTriangle, Phone } from "lucide-react";
import type { MakEscalation } from "@/lib/v2/escalation-protocols";
import { CRISIS_RESOURCES } from "@/lib/v2/escalation-protocols";

type EscalationResourcesPanelProps = {
  escalation: MakEscalation;
};

export function EscalationResourcesPanel({ escalation }: EscalationResourcesPanelProps) {
  const isCrisis = escalation.trigger === "crisis_language";

  return (
    <div
      className={`mx-2 mb-3 rounded-xl border p-4 ${
        isCrisis
          ? "border-cx-attention bg-amber-50"
          : "border-cx-border bg-cx-cream/60"
      }`}
    >
      <div className="flex items-start gap-2">
        {isCrisis ? (
          <Phone className="mt-0.5 shrink-0 text-cx-attention" size={18} />
        ) : (
          <AlertTriangle className="mt-0.5 shrink-0 text-cx-text-secondary" size={18} />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-cx-label">
            {isCrisis ? "Crisis support" : "Professional support recommended"}
          </p>
          <p className="mt-1 text-sm text-cx-text">{escalation.message}</p>
          {isCrisis && (
            <ul className="mt-3 space-y-2">
              {CRISIS_RESOURCES.map((r) => (
                <li key={r.label} className="text-sm text-cx-body">
                  <span className="font-medium text-cx-text">{r.label}</span>
                  <span className="text-cx-text-secondary"> — {r.detail}</span>
                </li>
              ))}
            </ul>
          )}
          {escalation.suggestedActions && escalation.suggestedActions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {escalation.suggestedActions.map((a) =>
                a.url.startsWith("http") ? (
                  <a
                    key={a.action}
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-cx-border bg-cx-white px-3 py-1 text-xs font-medium text-cx-text hover:bg-cx-cream"
                  >
                    {a.action}
                  </a>
                ) : (
                  <Link
                    key={a.action}
                    href={a.url}
                    className="rounded-full border border-cx-border bg-cx-white px-3 py-1 text-xs font-medium text-cx-text hover:bg-cx-cream"
                  >
                    {a.action}
                  </Link>
                ),
              )}
            </div>
          )}
          {escalation.pauseCareerCoaching && !isCrisis && (
            <p className="mt-2 text-xs text-cx-text-secondary">
              Career-focused coaching is paused until you acknowledge these resources.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

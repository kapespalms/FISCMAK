"use client";

import Link from "next/link";
import { AlertTriangle, Phone } from "lucide-react";
import type { MakEscalation } from "@/lib/v2/escalation-protocols";
import {
  ADDITIONAL_SUPPORT_RESOURCES,
  PRIMARY_CRISIS_RESOURCES,
  formatResourceContact,
  orderSupportResources,
} from "@/lib/v2/crisis-resources";

type EscalationResourcesPanelProps = {
  escalation: MakEscalation;
  preferOhio?: boolean;
};

function ResourceListItem({
  resource,
}: {
  resource: (typeof PRIMARY_CRISIS_RESOURCES)[number];
}) {
  return (
    <li className="text-sm text-cx-forest-dark/80">
      <span className="font-medium text-cx-forest-dark">{resource.label}</span>
      <span className="text-cx-forest-dark/70"> — {formatResourceContact(resource)}</span>
      {resource.url && (
        <>
          {" "}
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-cx-forest-dark underline underline-offset-2"
          >
            Link
          </a>
        </>
      )}
    </li>
  );
}

export function EscalationResourcesPanel({
  escalation,
  preferOhio,
}: EscalationResourcesPanelProps) {
  const isCrisis = escalation.trigger === "crisis_language";
  const crisisResources = orderSupportResources({ preferOhio }).filter((r) =>
    PRIMARY_CRISIS_RESOURCES.some((p) => p.id === r.id),
  );

  return (
    <div
      className={`mx-2 mb-3 rounded-xl border p-4 ${
        isCrisis ? "cx-alert-banner" : "border-white/20 bg-white/95"
      }`}
    >
      <div className="flex items-start gap-2">
        {isCrisis ? (
          <Phone className="mt-0.5 shrink-0 text-cx-attention" size={18} />
        ) : (
          <AlertTriangle className="mt-0.5 shrink-0 text-cx-attention" size={18} />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-cx-forest-dark/70">
            {isCrisis ? "Crisis support" : "Professional support recommended"}
          </p>
          <p className="mt-1 text-sm text-cx-forest-dark">{escalation.message}</p>
          {isCrisis && (
            <div className="mt-3 space-y-3">
              <ul className="space-y-2">
                {crisisResources.map((r) => (
                  <ResourceListItem key={r.id} resource={r} />
                ))}
              </ul>
              <details className="text-sm text-cx-forest-dark/80">
                <summary className="cursor-pointer font-medium text-cx-forest-dark">
                  More support resources
                </summary>
                <ul className="mt-2 space-y-2 pl-1">
                  {ADDITIONAL_SUPPORT_RESOURCES.map((r) => (
                    <ResourceListItem key={r.id} resource={r} />
                  ))}
                </ul>
              </details>
            </div>
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
                    className="rounded-full border border-cx-forest-dark/20 bg-white px-3 py-1 text-xs font-medium text-cx-forest-dark hover:bg-cx-forest-dark/5"
                  >
                    {a.action}
                  </a>
                ) : (
                  <Link
                    key={a.action}
                    href={a.url}
                    className="rounded-full border border-cx-forest-dark/20 bg-white px-3 py-1 text-xs font-medium text-cx-forest-dark hover:bg-cx-forest-dark/5"
                  >
                    {a.action}
                  </Link>
                ),
              )}
            </div>
          )}
          {escalation.pauseCareerCoaching && !isCrisis && (
            <p className="mt-2 text-xs text-cx-forest-dark/70">
              Career-focused coaching is paused until you acknowledge these resources.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

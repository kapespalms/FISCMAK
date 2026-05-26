"use client";

import { Phone } from "lucide-react";
import { CardSection } from "@/components/ui/CardSection";
import {
  ADDITIONAL_SUPPORT_RESOURCES,
  PRIMARY_CRISIS_RESOURCES,
  formatResourceContact,
  orderSupportResources,
} from "@/lib/v2/crisis-resources";

type WellnessResourcesSectionProps = {
  /** Ohio-based institutional programs (e.g. UH Psychiatry) */
  preferOhio?: boolean;
};

function ResourceRow({ resource }: { resource: (typeof PRIMARY_CRISIS_RESOURCES)[number] }) {
  return (
    <li className="border-b border-cx-forest-dark/10 py-3 last:border-0">
      <p className="text-sm font-medium text-cx-forest-dark">{resource.label}</p>
      <p className="mt-0.5 text-sm text-cx-forest-dark/75">{formatResourceContact(resource)}</p>
      {resource.url && (
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-block text-xs font-medium text-cx-forest-dark underline underline-offset-2 hover:text-cx-forest-dark/80"
        >
          Learn more
        </a>
      )}
    </li>
  );
}

export function WellnessResourcesSection({ preferOhio }: WellnessResourcesSectionProps) {
  const crisis = orderSupportResources({ preferOhio }).filter((r) =>
    PRIMARY_CRISIS_RESOURCES.some((p) => p.id === r.id),
  );
  const additional = ADDITIONAL_SUPPORT_RESOURCES;

  return (
    <CardSection
      className="mt-6"
      eyebrow="Support"
      title="Crisis & wellness resources"
      description="Free, confidential human support. Coach Mak is not a substitute for professional crisis care."
      icon={Phone}
    >
      <div className="space-y-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-cx-forest-dark/60">
            If you are in crisis
          </p>
          <ul className="mt-2">{crisis.map((r) => <ResourceRow key={r.id} resource={r} />)}</ul>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-cx-forest-dark/60">
            Additional support
          </p>
          <ul className="mt-2">{additional.map((r) => <ResourceRow key={r.id} resource={r} />)}</ul>
        </div>
      </div>
    </CardSection>
  );
}

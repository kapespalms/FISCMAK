"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function TechnicalDetailToggle({
  technical,
  sources,
  className,
}: {
  technical?: Record<string, unknown>;
  sources?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const entries = Object.entries(technical ?? {}).filter(([, v]) => v != null);

  if (entries.length === 0 && !sources) return null;

  return (
    <div className={cn("mt-2", className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex min-h-[44px] items-center gap-1 text-xs font-medium text-fm-accent hover:underline"
      >
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        Show technical detail
      </button>
      {open && (
        <div className="mt-2 space-y-2 rounded-md border border-fiscmak-border bg-fm-background px-3 py-2">
          {sources && <p className="text-caption">Source: {sources}</p>}
          {entries.length > 0 && (
            <dl className="space-y-1 text-xs">
              {entries.map(([key, value]) => (
                <div key={key} className="flex gap-2">
                  <dt className="shrink-0 font-mono text-fiscmak-muted">{key}:</dt>
                  <dd className="break-all text-fiscmak-ink">
                    {Array.isArray(value) ? value.join(", ") : String(value)}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}
    </div>
  );
}

export function DataSourceTooltip({
  sources,
  lastUpdated,
}: {
  sources: string;
  lastUpdated?: string;
}) {
  return (
    <p className="text-caption mt-1">
      Source: {sources}
      {lastUpdated ? `. Last updated: ${lastUpdated}` : ""}
    </p>
  );
}

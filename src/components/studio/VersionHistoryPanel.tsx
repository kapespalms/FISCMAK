"use client";

import { History } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CardSection } from "@/components/ui/CardSection";
import { OUTPUT_MAK } from "@/lib/card-mak-prompts";
import type { DocumentVersion } from "@/lib/studio-versions";

export function VersionHistoryPanel({
  versions,
  onRestore,
}: {
  versions: DocumentVersion[];
  onRestore: (version: DocumentVersion) => void;
}) {
  if (versions.length === 0) return null;

  return (
    <CardSection
      compact
      className="mt-4"
      eyebrow="Versions"
      title="Version history"
      icon={History}
      mak={OUTPUT_MAK.version_history}
    >
      <ul className="max-h-40 space-y-2 overflow-y-auto">
        {versions.slice(0, 5).map((v) => (
          <li
            key={v.id}
            className="flex items-center justify-between gap-2 text-xs text-cx-text/70"
          >
            <span>
              v{v.version_number} ·{" "}
              {new Date(v.created_at).toLocaleString(undefined, {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </span>
            <Button
              variant="link"
              className="min-h-0 p-0 text-xs"
              onClick={() => onRestore(v)}
            >
              Restore
            </Button>
          </li>
        ))}
      </ul>
    </CardSection>
  );
}

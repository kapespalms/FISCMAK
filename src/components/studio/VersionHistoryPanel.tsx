"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
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
    <Card className="mt-4 p-4">
      <h3 className="text-sm font-semibold">Version history</h3>
      <ul className="mt-3 max-h-40 space-y-2 overflow-y-auto">
        {versions.slice(0, 5).map((v) => (
          <li
            key={v.id}
            className="flex items-center justify-between gap-2 text-xs text-fiscmak-muted"
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
    </Card>
  );
}

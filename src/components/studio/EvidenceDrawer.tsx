"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import type { ActivityEntry } from "@/lib/types/database";

export function EvidenceDrawer({
  evidence,
  onInsertChip,
  onInsertText,
}: {
  evidence: ActivityEntry[];
  onInsertChip: (item: ActivityEntry) => void;
  onInsertText: (text: string) => void;
}) {
  return (
    <aside className="hidden w-64 shrink-0 space-y-4 overflow-y-auto lg:block">
      <h2 className="text-xs font-semibold uppercase text-fiscmak-muted">
        Evidence drawer
      </h2>
      {evidence.length === 0 && (
        <p className="text-sm text-fiscmak-muted">
          Log activities to populate evidence.
        </p>
      )}
      {evidence.map((item) => (
        <Card key={item.id} className="p-4">
          <p className="line-clamp-3 text-sm font-medium">{item.raw_text}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {item.primary_domain && (
              <Badge className="text-xs">{item.primary_domain}</Badge>
            )}
            {item.primary_track && (
              <Badge className="text-xs">{item.primary_track}</Badge>
            )}
            {item.energy_valence?.includes("energiz") && (
              <Badge energy="energizing" className="text-xs">
                energizing
              </Badge>
            )}
          </div>
          <p className="mt-1 text-xs text-fiscmak-muted">
            {item.activity_date}
          </p>
          <div className="mt-2 flex flex-col gap-1">
            <Button
              variant="link"
              className="justify-start text-sm"
              onClick={() => onInsertChip(item)}
            >
              Insert chip
            </Button>
            <Button
              variant="link"
              className="justify-start text-sm"
              onClick={() => onInsertText(item.raw_text ?? "")}
            >
              Insert text
            </Button>
          </div>
        </Card>
      ))}
    </aside>
  );
}

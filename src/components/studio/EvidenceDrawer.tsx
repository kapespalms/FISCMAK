"use client";

import { Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CardSection } from "@/components/ui/CardSection";
import { MakDiscussLink } from "@/components/ui/MakDiscussLink";
import { OUTPUT_MAK } from "@/lib/card-mak-prompts";
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
      <CardSection
        compact
        eyebrow="Evidence"
        title="Career evidence"
        description={
          evidence.length === 0
            ? "Log activities to populate evidence."
            : `${evidence.length} item${evidence.length > 1 ? "s" : ""} available to cite.`
        }
        icon={Paperclip}
        mak={OUTPUT_MAK.evidence}
      />
      {evidence.map((item) => (
        <div
          key={item.id}
          className="cx-surface-elevated rounded-xl p-4 shadow-sm"
        >
          <p className="line-clamp-3 text-sm font-medium text-cx-forest-dark">{item.raw_text}</p>
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
          <p className="mt-1 text-xs text-cx-forest-dark/70">{item.activity_date}</p>
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
          <div className="mt-2 border-t border-cx-forest-dark/15 pt-2">
            <MakDiscussLink
              mak={{
                ...OUTPUT_MAK.evidence,
                question: `Help me use this evidence in my document: "${(item.raw_text ?? "").slice(0, 80)}…"`,
              }}
              className="text-xs"
            />
          </div>
        </div>
      ))}
    </aside>
  );
}

"use client";

import { NpiRegistryPanel, type NpiRegistryStatus } from "@/components/profile/NpiRegistryPanel";
import { Button } from "@/components/ui/Button";
import { isNpiReconcileItem } from "@/lib/v2/npi-registry";
import { cn } from "@/lib/utils";

export type ReconcileItemView = {
  id: string;
  source: string;
  label: string;
  detail: string;
  status: "pending" | "confirmed" | "rejected";
};

type ReconciliationItemCardProps = {
  item: ReconcileItemView;
  initialNpi?: string;
  npiStatus?: NpiRegistryStatus | null;
  variant?: "default" | "luxury";
  onToggle: (id: string, status: "confirmed" | "rejected") => void;
  onNpiVerified: (id: string, status: "confirmed" | "rejected") => void;
  onNpiSkipped?: () => void;
};

export function ReconciliationItemCard({
  item,
  initialNpi = "",
  npiStatus,
  variant = "default",
  onToggle,
  onNpiVerified,
  onNpiSkipped,
}: ReconciliationItemCardProps) {
  const isNpi = isNpiReconcileItem(item);
  const verified = Boolean(npiStatus?.npi_verified && npiStatus?.npi);
  const luxury = variant === "luxury";

  return (
    <li
      className={cn(
        "relative rounded-xl border p-5",
        luxury
          ? "border-white/5 bg-[#0A0C10] shadow-none"
          : "border-cx-forest-dark/15 bg-white shadow-sm",
      )}
    >
      {!isNpi && (
        <p className={cn(luxury ? "font-futura-bold text-xs uppercase tracking-[0.15em] text-[#D4AF37]" : "text-cx-label uppercase")}>
          {item.source}
        </p>
      )}
      <p
        className={cn(
          luxury ? "font-futura-bold text-lg text-white" : "text-cx-h3",
          !isNpi && "mt-2",
          isNpi && !verified && "pr-28",
        )}
      >
        {verified && npiStatus?.npi ? `NPI ${npiStatus.npi} verified` : item.label}
      </p>
      {!verified && (
        <p className={cn("mt-2 text-sm", luxury ? "text-gray-400" : "text-cx-forest-dark/80")}>
          {item.detail}
        </p>
      )}

      {isNpi ? (
        <div className="mt-4">
          <NpiRegistryPanel
            initialNpi={initialNpi}
            status={npiStatus}
            reconciliationItemId={item.id}
            showSkip
            skipPlacement="corner"
            onVerified={() => onNpiVerified(item.id, "confirmed")}
            onSkipped={onNpiSkipped}
          />
        </div>
      ) : (
        <div className="mt-4 flex gap-3">
          <Button
            variant={item.status === "confirmed" ? "primary" : "secondary"}
            className="min-h-[44px] flex-1"
            onClick={() => onToggle(item.id, "confirmed")}
          >
            Mine
          </Button>
          <Button
            variant={item.status === "rejected" ? "primary" : "secondary"}
            className="min-h-[44px] flex-1"
            onClick={() => onToggle(item.id, "rejected")}
          >
            Not mine
          </Button>
        </div>
      )}
    </li>
  );
}

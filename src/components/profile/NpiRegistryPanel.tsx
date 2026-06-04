"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { normalizeNpiInput } from "@/lib/v2/npi-registry";

export type NpiRegistryStatus = {
  npi: string | null;
  npi_verified: boolean;
  deferred: boolean;
  provider_name?: string | null;
  credential?: string | null;
  organization?: string | null;
  registry_url?: string | null;
};

type NpiRegistryPanelProps = {
  initialNpi?: string;
  status?: NpiRegistryStatus | null;
  reconciliationItemId?: string;
  showSkip?: boolean;
  skipPlacement?: "inline" | "corner";
  onVerified?: (data: NpiRegistryStatus) => void;
  onSkipped?: () => void;
  reloadAfterAction?: boolean;
};

export function NpiRegistryPanel({
  initialNpi = "",
  status,
  reconciliationItemId = "enrichment-npi",
  showSkip = false,
  skipPlacement = "inline",
  onVerified,
  onSkipped,
  reloadAfterAction = false,
}: NpiRegistryPanelProps) {
  const verified = Boolean(status?.npi_verified && status?.npi);
  const [npiValue, setNpiValue] = useState(status?.npi ?? initialNpi);
  const [verifying, setVerifying] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [registryUrl, setRegistryUrl] = useState<string | null>(status?.registry_url ?? null);

  useEffect(() => {
    setNpiValue(status?.npi ?? initialNpi);
    setRegistryUrl(status?.registry_url ?? null);
  }, [status?.npi, status?.registry_url, initialNpi]);

  async function loadStatus(): Promise<NpiRegistryStatus | null> {
    const res = await fetch("/api/v1/npi");
    if (!res.ok) return null;
    return (await res.json()) as NpiRegistryStatus;
  }

  async function verifyNpi() {
    const normalized = normalizeNpiInput(npiValue);
    if (normalized.length !== 10) {
      setVerifyError("Enter a valid 10-digit NPI number.");
      setVerifyMessage(null);
      return;
    }

    setVerifying(true);
    setVerifyError(null);
    setVerifyMessage(null);

    try {
      const res = await fetch("/api/v1/npi/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          npi: normalized,
          reconciliation_item_id: reconciliationItemId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "NPI verification failed");

      setRegistryUrl(typeof data.registry_url === "string" ? data.registry_url : null);
      if (data.verified) {
        setVerifyMessage(data.message ?? "NPI verified.");
        const nextStatus: NpiRegistryStatus = {
          npi: data.npi ?? normalized,
          npi_verified: true,
          deferred: false,
          provider_name: data.provider_name ?? null,
          credential: data.credential ?? null,
          organization: data.organization ?? null,
          registry_url: data.registry_url ?? null,
        };
        onVerified?.(nextStatus);
        if (reloadAfterAction) await loadStatus();
      } else {
        setVerifyError(data.message ?? "No provider found for this NPI.");
      }
    } catch (e) {
      setVerifyError(e instanceof Error ? e.message : "NPI verification failed");
    } finally {
      setVerifying(false);
    }
  }

  async function skipForNow() {
    setSkipping(true);
    setVerifyError(null);
    try {
      const res = await fetch("/api/v1/npi/skip", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Could not skip NPI verification");
      onSkipped?.();
    } catch (e) {
      setVerifyError(e instanceof Error ? e.message : "Could not skip NPI verification");
    } finally {
      setSkipping(false);
    }
  }

  const skipControl = showSkip ? (
    <button
      type="button"
      disabled={verifying || skipping}
      onClick={() => void skipForNow()}
      className="text-sm font-medium text-cx-text/80 underline hover:text-cx-text"
    >
      {skipping ? "Skipping…" : "Skip for now"}
    </button>
  ) : null;

  if (verified && status) {
    return (
      <div className="space-y-2 text-sm text-cx-text">
        <p>
          <span className="font-semibold">NPI:</span> {status.npi}
        </p>
        {status.provider_name && (
          <p>
            <span className="font-semibold">Provider:</span> {status.provider_name}
            {status.credential ? ` (${status.credential})` : ""}
          </p>
        )}
        {status.organization && (
          <p>
            <span className="font-semibold">Location:</span> {status.organization}
          </p>
        )}
        {(registryUrl || status.registry_url) && (
          <a
            href={registryUrl ?? status.registry_url ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block font-medium text-cx-text underline hover:text-cx-text/80"
          >
            View in CMS NPPES registry
          </a>
        )}
      </div>
    );
  }

  return (
    <>
      {showSkip && skipPlacement === "corner" && (
        <div className="absolute right-5 top-5">{skipControl}</div>
      )}
      <div className="space-y-3">
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={npiValue}
        onChange={(e) => {
          setNpiValue(normalizeNpiInput(e.target.value));
          setVerifyError(null);
          setVerifyMessage(null);
        }}
        placeholder="10-digit NPI"
        className="cx-field w-full"
        maxLength={10}
      />
      <div className="flex items-center gap-3">
        <Button
          type="button"
          disabled={verifying || skipping || npiValue.length !== 10}
          onClick={() => void verifyNpi()}
        >
          {verifying ? "Checking NPPES…" : "Verify with NPPES registry"}
        </Button>
      </div>
      {verifyMessage && (
        <p className="rounded-md border border-cx-success/30 bg-cx-success/10 px-3 py-2 text-sm text-cx-text">
          {verifyMessage}
        </p>
      )}
      {verifyError && (
        <p className="rounded-md border border-cx-attention/30 bg-cx-attention/10 px-3 py-2 text-sm text-cx-text">
          {verifyError}
        </p>
      )}
      {registryUrl && (
        <a
          href={registryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm font-medium text-cx-text underline hover:text-cx-text/80"
        >
          View in CMS NPPES registry
        </a>
      )}
      </div>
    </>
  );
}

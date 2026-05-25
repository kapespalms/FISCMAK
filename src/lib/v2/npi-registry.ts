export type NpiRegistryResult = {
  verified: boolean;
  npi: string;
  providerName?: string;
  credential?: string;
  organization?: string;
};

export function normalizeNpiInput(value: string): string {
  return value.replace(/\D/g, "").slice(0, 10);
}

export function isValidNpiFormat(npi: string): boolean {
  return /^\d{10}$/.test(normalizeNpiInput(npi));
}

export function isNpiReconcileItem(item: {
  id: string;
  source?: string;
  label?: string;
}): boolean {
  return (
    item.id === "nppes-npi" ||
    item.id === "enrichment-npi" ||
    item.label?.toLowerCase().includes("npi registry") === true
  );
}

export const NPI_RECONCILE_IDS = ["nppes-npi", "enrichment-npi"] as const;

export function isNpiReconcileId(id: string): boolean {
  return (NPI_RECONCILE_IDS as readonly string[]).includes(id);
}

export function namesLikelyMatch(userName: string, providerName: string): boolean {
  const tokens = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z\s]/g, " ")
      .split(/\s+/)
      .filter((part) => part.length > 1);

  const userTokens = new Set(tokens(userName));
  const providerTokens = tokens(providerName);
  if (userTokens.size === 0 || providerTokens.length === 0) return false;

  const overlap = providerTokens.filter((token) => userTokens.has(token)).length;
  return overlap >= 2 || (overlap >= 1 && providerTokens.length === 1);
}

export async function verifyNpiWithRegistry(npi: string): Promise<NpiRegistryResult> {
  const normalized = normalizeNpiInput(npi);
  if (!isValidNpiFormat(normalized)) {
    return { verified: false, npi: normalized };
  }

  try {
    const res = await fetch(
      `https://npiregistry.cms.hhs.gov/api/?version=2.1&number=${normalized}`,
      { signal: AbortSignal.timeout(8000) },
    );
    if (!res.ok) return { verified: false, npi: normalized };

    const data = (await res.json()) as {
      result_count?: number;
      results?: Array<{
        basic?: {
          first_name?: string;
          last_name?: string;
          credential?: string;
          organization_name?: string;
        };
        addresses?: Array<{ address_purpose?: string; city?: string; state?: string }>;
      }>;
    };

    if (!data.result_count || !data.results?.length) {
      return { verified: false, npi: normalized };
    }

    const result = data.results[0];
    const basic = result.basic;
    const providerName =
      basic?.first_name && basic?.last_name
        ? `${basic.first_name} ${basic.last_name}`.replace(/\s+/g, " ").trim()
        : undefined;
    const location = result.addresses?.find((a) => a.address_purpose === "LOCATION");

    return {
      verified: true,
      npi: normalized,
      providerName,
      credential: basic?.credential,
      organization:
        basic?.organization_name ??
        (location ? `${location.city ?? ""}, ${location.state ?? ""}`.replace(/^,\s*/, "") : undefined),
    };
  } catch {
    return { verified: false, npi: normalized };
  }
}

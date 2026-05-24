/**
 * Optional forward to external MemPalace service when MEMPALACE_API_URL is configured.
 */

export type MemPalacePayload = {
  export_id: string;
  user_id: string;
  coaching_summary: string;
  key_facts: Record<string, unknown>;
  preferences?: Record<string, unknown>;
  career_evolution?: Record<string, unknown>;
  synced_at: string;
};

export function isMemPalaceExternalConfigured(): boolean {
  return Boolean(process.env.MEMPALACE_API_URL?.trim());
}

export async function forwardToMemPalaceService(
  payload: MemPalacePayload,
): Promise<{ forwarded: boolean; external_id?: string; error?: string }> {
  const baseUrl = process.env.MEMPALACE_API_URL?.trim();
  const apiKey = process.env.MEMPALACE_API_KEY?.trim();
  if (!baseUrl) {
    return { forwarded: false, error: "MEMPALACE_API_URL not configured" };
  }

  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, "")}/exports`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      return { forwarded: false, error: await res.text() };
    }

    const data = (await res.json()) as { id?: string; export_id?: string };
    return {
      forwarded: true,
      external_id: data.id ?? data.export_id,
    };
  } catch (e) {
    return {
      forwarded: false,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

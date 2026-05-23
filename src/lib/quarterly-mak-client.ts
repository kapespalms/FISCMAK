export async function initQuarterlyMakSession(): Promise<{
  prompt: string | null;
  error: string | null;
}> {
  try {
    const res = await fetch("/api/v1/touchpoints/quarterly/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "init" }),
    });
    const data = await res.json();
    if (!res.ok) {
      return {
        prompt: null,
        error: data.message ?? data.error ?? "Could not start quarterly pulse session",
      };
    }
    return { prompt: (data.prompt as string | null) ?? null, error: null };
  } catch {
    return { prompt: null, error: "Could not reach quarterly pulse service" };
  }
}

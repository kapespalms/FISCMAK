export async function initAnnualMakSession(): Promise<{
  prompt: string | null;
  error: string | null;
}> {
  try {
    const res = await fetch("/api/v1/touchpoints/annual/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "init" }),
    });
    const data = await res.json();
    if (!res.ok) {
      return {
        prompt: null,
        error: data.message ?? data.error ?? "Could not start annual refresh session",
      };
    }
    return { prompt: (data.prompt as string | null) ?? null, error: null };
  } catch {
    return { prompt: null, error: "Could not reach annual refresh service" };
  }
}

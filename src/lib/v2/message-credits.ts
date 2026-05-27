/** Free-tier AI message allowance before upgrade prompt. */
export const FREE_MESSAGE_LIMIT = 25;

export function getMessageBalance(
  meta: Record<string, unknown> | null | undefined,
  columnBalance?: number | null,
): number {
  if (typeof columnBalance === "number" && Number.isFinite(columnBalance)) {
    return Math.max(0, columnBalance);
  }
  const stored = meta?.message_balance;
  if (typeof stored === "number" && Number.isFinite(stored)) {
    return Math.max(0, stored);
  }
  return FREE_MESSAGE_LIMIT;
}

export function shouldChargeAiMessage(message: string, autoTokens: ReadonlySet<string>): boolean {
  const trimmed = message?.trim();
  if (!trimmed || trimmed === "__welcome__") return false;
  if (autoTokens.has(trimmed)) return false;
  if (/^__review_event:[a-zA-Z0-9_-]+__$/.test(trimmed)) return false;
  return true;
}

export function nextMessageBalance(current: number): number {
  return Math.max(0, current - 1);
}

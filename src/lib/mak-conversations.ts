import type { AppSection } from "@/lib/mak-sections";
import { isClientDemoMode } from "@/lib/demo-mode";

export type MakMessage = { role: "user" | "assistant"; content: string; at?: string };

const STORAGE_KEY = "fiscmak_mak_conversations";
/** One Coach Mak thread across all app sections (OpenEvidence B6). */
const GLOBAL_THREAD_KEY = "__global__" as const;

type ConversationStore = Partial<Record<AppSection | typeof GLOBAL_THREAD_KEY, MakMessage[]>>;

function readStore(): ConversationStore {
  if (typeof window === "undefined" || !isClientDemoMode()) return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as ConversationStore) : {};
  } catch {
    return {};
  }
}

function writeStore(store: ConversationStore) {
  if (!isClientDemoMode()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

/** Migrate legacy per-section demo threads into one global thread. */
function globalMessages(store: ConversationStore): MakMessage[] {
  const existing = store[GLOBAL_THREAD_KEY];
  if (existing?.length) return existing;
  const merged: MakMessage[] = [];
  for (const msgs of Object.values(store)) {
    if (!msgs?.length) continue;
    for (const m of msgs) {
      const dup = merged.some((x) => x.role === m.role && x.content === m.content);
      if (!dup) merged.push(m);
    }
  }
  return merged.slice(-50);
}

export function loadConversation(_section: AppSection): MakMessage[] {
  return globalMessages(readStore());
}

export function saveConversation(_section: AppSection, messages: MakMessage[]) {
  const store = readStore();
  store[GLOBAL_THREAD_KEY] = messages.slice(-50);
  writeStore(store);
}

export function seedConversation(
  _section: AppSection,
  greeting: string,
): MakMessage[] {
  const existing = loadConversation(_section);
  if (existing.length > 0) return existing;
  const initial = [{ role: "assistant" as const, content: greeting }];
  saveConversation(_section, initial);
  return initial;
}

export function resetConversationGreeting(
  _section: AppSection,
  greeting: string,
): MakMessage[] {
  const existing = loadConversation(_section);
  if (existing.length === 0) {
    const initial = [{ role: "assistant" as const, content: greeting }];
    saveConversation(_section, initial);
    return initial;
  }
  if (existing[0]?.role === "assistant") {
    const next = [{ role: "assistant" as const, content: greeting }, ...existing.slice(1)];
    saveConversation(_section, next);
    return next;
  }
  const next = [{ role: "assistant" as const, content: greeting }, ...existing];
  saveConversation(_section, next);
  return next;
}

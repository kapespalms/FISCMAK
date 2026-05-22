import type { AppSection } from "@/lib/mak-sections";
import { isClientDemoMode } from "@/lib/demo-mode";

export type MakMessage = { role: "user" | "assistant"; content: string };

const STORAGE_KEY = "fiscmak_mak_conversations";

type ConversationStore = Partial<Record<AppSection, MakMessage[]>>;

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

export function loadConversation(section: AppSection): MakMessage[] {
  return readStore()[section] ?? [];
}

export function saveConversation(section: AppSection, messages: MakMessage[]) {
  const store = readStore();
  store[section] = messages.slice(-50);
  writeStore(store);
}

export function seedConversation(
  section: AppSection,
  greeting: string,
): MakMessage[] {
  const existing = loadConversation(section);
  if (existing.length > 0) return existing;
  const initial = [{ role: "assistant" as const, content: greeting }];
  saveConversation(section, initial);
  return initial;
}

export function resetConversationGreeting(
  section: AppSection,
  greeting: string,
): MakMessage[] {
  const existing = loadConversation(section);
  if (existing.length === 0) {
    const initial = [{ role: "assistant" as const, content: greeting }];
    saveConversation(section, initial);
    return initial;
  }
  if (existing[0]?.role === "assistant") {
    const next = [{ role: "assistant" as const, content: greeting }, ...existing.slice(1)];
    saveConversation(section, next);
    return next;
  }
  const next = [
    { role: "assistant" as const, content: greeting },
    ...existing,
  ];
  saveConversation(section, next);
  return next;
}

const STORAGE_KEY = "fiscmak_mak_open";

export function loadMakPanelOpen(defaultOpen = true): boolean {
  if (typeof window === "undefined") return defaultOpen;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "true") return true;
    if (stored === "false") return false;
  } catch {
    // ignore
  }
  return defaultOpen;
}

export function saveMakPanelOpen(open: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, String(open));
  } catch {
    // ignore
  }
}

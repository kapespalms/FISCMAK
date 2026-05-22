"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  MAK_FLOW_GREETINGS,
  sectionFromPath,
  type MakFlowIntent,
} from "@/lib/mak-sections";
import {
  loadMakPanelOpen,
  saveMakPanelOpen,
} from "@/lib/mak-panel-preference";
import { IconSidebar } from "@/components/layout/IconSidebar";
import { MakPanel } from "@/components/layout/MakPanel";

type AppShellContextValue = {
  section: ReturnType<typeof sectionFromPath>;
  makOpen: boolean;
  openMak: () => void;
  closeMak: () => void;
  toggleMak: () => void;
  makInputRef: React.RefObject<HTMLInputElement | null>;
  focusMakInput: () => void;
  startMakFlow: (intent: MakFlowIntent, navigateTo?: string) => void;
  displayName: string | null;
  setDisplayName: (name: string | null) => void;
};

const AppShellContext = createContext<AppShellContextValue | null>(null);

export function useAppShell() {
  const ctx = useContext(AppShellContext);
  if (!ctx) throw new Error("useAppShell must be used within AppShell");
  return ctx;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const section = sectionFromPath(pathname);
  const [makOpen, setMakOpen] = useState(true);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const makInputRef = useRef<HTMLInputElement>(null);
  const [flowNonce, setFlowNonce] = useState(0);
  const [pendingFlow, setPendingFlow] = useState<{
    intent: MakFlowIntent;
    greeting: string;
  } | null>(null);

  useEffect(() => {
    setMakOpen(loadMakPanelOpen(true));
  }, []);

  useEffect(() => {
    saveMakPanelOpen(makOpen);
  }, [makOpen]);

  const openMak = useCallback(() => {
    setMakOpen(true);
  }, []);

  const closeMak = useCallback(() => {
    setMakOpen(false);
  }, []);

  const toggleMak = useCallback(() => {
    setMakOpen((open) => !open);
  }, []);

  const focusMakInput = useCallback(() => {
    setTimeout(() => makInputRef.current?.focus(), 100);
  }, []);

  const startMakFlow = useCallback(
    (intent: MakFlowIntent, navigateTo?: string) => {
      const greeting = MAK_FLOW_GREETINGS[intent];
      setPendingFlow({ intent, greeting });
      setFlowNonce((n) => n + 1);
      setMakOpen(true);
      if (navigateTo) router.push(navigateTo);
      focusMakInput();
    },
    [router, focusMakInput],
  );

  const value = useMemo(
    () => ({
      section,
      makOpen,
      openMak,
      closeMak,
      toggleMak,
      makInputRef,
      focusMakInput,
      startMakFlow,
      displayName,
      setDisplayName,
    }),
    [
      section,
      makOpen,
      openMak,
      closeMak,
      toggleMak,
      focusMakInput,
      startMakFlow,
      displayName,
    ],
  );

  return (
    <AppShellContext.Provider value={value}>
      <div className="flex h-screen overflow-hidden bg-white">
        <IconSidebar />
        <MakPanel
          open={makOpen}
          pendingFlow={pendingFlow}
          flowNonce={flowNonce}
          onFlowHandled={() => setPendingFlow(null)}
        />
        <main className="min-w-0 flex-1 overflow-auto bg-fiscmak-subtle p-6 md:p-8">
          {children}
        </main>
      </div>
    </AppShellContext.Provider>
  );
}

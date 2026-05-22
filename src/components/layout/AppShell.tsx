"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  MAK_FLOW_GREETINGS,
  sectionFromPath,
  type AppSection,
  type MakFlowIntent,
} from "@/lib/mak-sections";
import { IconSidebar } from "@/components/layout/IconSidebar";
import { MakPanel } from "@/components/layout/MakPanel";

type AppShellContextValue = {
  section: AppSection;
  makOpen: boolean;
  setMakOpen: (open: boolean) => void;
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
      setMakOpen,
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
        {makOpen && (
          <MakPanel
            pendingFlow={pendingFlow}
            flowNonce={flowNonce}
            onFlowHandled={() => setPendingFlow(null)}
          />
        )}
        <main className="min-w-0 flex-1 overflow-auto bg-[#fafbfc] p-6 md:p-8">
          {children}
        </main>
      </div>
    </AppShellContext.Provider>
  );
}

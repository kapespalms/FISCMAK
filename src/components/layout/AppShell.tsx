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
import { formatDisplayName } from "@/lib/mak-greeting";
import { useIsMobile } from "@/lib/use-media-query";
import { IconSidebar } from "@/components/layout/IconSidebar";
import { MakPanel } from "@/components/layout/MakPanel";
import { LayOfTheLandTour } from "@/components/onboarding/LayOfTheLandTour";

type AppShellContextValue = {
  section: ReturnType<typeof sectionFromPath>;
  makOpen: boolean;
  openMak: () => void;
  closeMak: () => void;
  toggleMak: () => void;
  makInputRef: React.RefObject<HTMLInputElement | null>;
  focusMakInput: () => void;
  startMakFlow: (
    intent: MakFlowIntent,
    navigateTo?: string,
    customGreeting?: string,
    annualRefresh?: boolean,
  ) => void;
  openMakWithMessage: (message?: string, navigateTo?: string) => void;
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
  const isMobile = useIsMobile();
  const section = sectionFromPath(pathname);
  const [makOpen, setMakOpen] = useState(false);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [onboardingActive, setOnboardingActive] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [pendingInitialMessage, setPendingInitialMessage] = useState<string | null>(null);
  const makInputRef = useRef<HTMLInputElement>(null);
  const [flowNonce, setFlowNonce] = useState(0);
  const [pendingFlow, setPendingFlow] = useState<{
    intent: MakFlowIntent;
    greeting: string;
    annualRefresh?: boolean;
  } | null>(null);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    setMakOpen(mobile ? false : loadMakPanelOpen(true));
  }, []);

  useEffect(() => {
    saveMakPanelOpen(makOpen);
  }, [makOpen]);

  useEffect(() => {
    fetch("/api/v1/onboarding/status")
      .then((r) => r.json())
      .then((s) => {
        if (s.name) {
          const parts = String(s.name).trim().split(/\s+/);
          setDisplayName(formatDisplayName(parts[0], parts.slice(1).join(" ")));
        }
        setOnboardingActive(Boolean(s.tier1_complete && !s.tier3_complete));
      })
      .catch(() => undefined);
  }, [pathname]);

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
    (
      intent: MakFlowIntent,
      navigateTo?: string,
      customGreeting?: string,
      annualRefresh?: boolean,
    ) => {
      const greeting = customGreeting ?? MAK_FLOW_GREETINGS[intent];
      setPendingFlow({ intent, greeting, annualRefresh });
      setFlowNonce((n) => n + 1);
      setMakOpen(true);
      if (navigateTo) router.push(navigateTo);
      if (!isMobile) focusMakInput();
    },
    [router, focusMakInput, isMobile],
  );

  const openMakWithMessage = useCallback(
    (message?: string, navigateTo?: string) => {
      if (message?.trim()) setPendingInitialMessage(message.trim());
      setMakOpen(true);
      if (navigateTo) router.push(navigateTo);
    },
    [router],
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
      openMakWithMessage,
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
      openMakWithMessage,
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
          onClose={closeMak}
          onboardingActive={onboardingActive}
          onOpenTour={() => setTourOpen(true)}
          initialMessage={pendingInitialMessage}
          onInitialMessageHandled={() => setPendingInitialMessage(null)}
        />
        <LayOfTheLandTour open={tourOpen} onClose={() => setTourOpen(false)} />
        <main className="min-w-0 flex-1 overflow-auto bg-fiscmak-subtle p-6 md:p-8">
          {children}
        </main>
      </div>
    </AppShellContext.Provider>
  );
}

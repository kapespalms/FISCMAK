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
import { TopNavBar } from "@/components/layout/TopNavBar";
import { MakPanel } from "@/components/layout/MakPanel";
import { AnalyticsProvider } from "@/components/layout/AnalyticsProvider";
import { LayOfTheLandTour } from "@/components/onboarding/LayOfTheLandTour";

export type MakFlowTouchpoint = "annual" | "quarterly";

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
    touchpoint?: MakFlowTouchpoint,
    goalFlow?: "set" | "modify",
    goalModifyId?: string,
    autoMessage?: string,
    outputTemplateType?: string,
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
  const isOnboardingRoute = pathname.startsWith("/app/onboarding");
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
    touchpoint?: MakFlowTouchpoint;
    goalFlow?: "set" | "modify";
    goalModifyId?: string;
    outputTemplateType?: string;
  } | null>(null);

  useEffect(() => {
    if (isOnboardingRoute) {
      setMakOpen(false);
      return;
    }
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    setMakOpen(mobile ? false : loadMakPanelOpen(true));
  }, [isOnboardingRoute]);

  useEffect(() => {
    if (isOnboardingRoute) return;
    saveMakPanelOpen(makOpen);
  }, [makOpen, isOnboardingRoute]);

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
      touchpoint?: MakFlowTouchpoint,
      goalFlow?: "set" | "modify",
      goalModifyId?: string,
      autoMessage?: string,
      outputTemplateType?: string,
    ) => {
      const greeting = customGreeting ?? MAK_FLOW_GREETINGS[intent];
      setPendingFlow({
        intent,
        greeting,
        touchpoint,
        goalFlow,
        goalModifyId,
        outputTemplateType,
      });
      setFlowNonce((n) => n + 1);
      if (autoMessage?.trim()) setPendingInitialMessage(autoMessage.trim());
      if (!pathname.startsWith("/app/onboarding")) {
        setMakOpen(true);
        if (!isMobile) focusMakInput();
      }
      if (navigateTo) router.push(navigateTo);
    },
    [router, focusMakInput, isMobile, pathname],
  );

  const openMakWithMessage = useCallback(
    (message?: string, navigateTo?: string) => {
      if (message?.trim()) setPendingInitialMessage(message.trim());
      if (!pathname.startsWith("/app/onboarding")) {
        setMakOpen(true);
      }
      if (navigateTo) router.push(navigateTo);
    },
    [router, pathname],
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
      <div className="flex h-screen overflow-hidden bg-cx-forest-dark">
        {!isOnboardingRoute && (
          <div className="flex h-full shrink-0">
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
          </div>
        )}
        <LayOfTheLandTour open={tourOpen} onClose={() => setTourOpen(false)} />
        <div className="flex min-w-0 flex-1 flex-col">
          {!isOnboardingRoute && <TopNavBar />}
          <div className="cx-main-shell flex min-h-0 flex-1 flex-col">
            <AnalyticsProvider>
              <main className="font-futura-book min-h-0 flex-1 overflow-auto p-4 md:p-8">
                {children}
              </main>
            </AnalyticsProvider>
          </div>
        </div>
      </div>
    </AppShellContext.Provider>
  );
}

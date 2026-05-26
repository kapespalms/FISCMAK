# FISCMAK — All React Function Components (Full Source)

Generated: 2026-05-25T22:02:42.955Z
Branch: cursor/mvp-app-foundation
Component files: 94 | Page/layout files: 27

> Review companion: docs/FISCMAK_PRODUCT_REVIEW_MASTER.md

## Index

- **src/components/auth/AppleSignInButton.tsx** — AppleSignInButton
- **src/components/auth/AuthGuard.tsx** — AuthGuard
- **src/components/auth/GoogleSignInButton.tsx** — GoogleSignInButton
- **src/components/auth/MarketingAuthInput.tsx** — MarketingAuthInput
- **src/components/brand/CoachMakAvatar.tsx** — CoachMakAvatar
- **src/components/brand/CoachMakMark.tsx** — CoachMakMark
- **src/components/brand/CoachMakVoiceIcon.tsx** — CoachMakVoiceIcon
- **src/components/brand/MakHexMicButton.tsx** — MakHexMicButton
- **src/components/brand/NavIcon.tsx** — NavIcon
- **src/components/brand/SidebarDecoyIcon.tsx** — SidebarDecoyIcon
- **src/components/dashboard/DashboardAlerts.tsx** — DashboardAlerts
- **src/components/dashboard/DashboardDueNow.tsx** — DashboardDueNow
- **src/components/dashboard/DashboardGoalsGrid.tsx** — DashboardGoalCard, DashboardGoalsGrid
- **src/components/dashboard/DashboardMakButton.tsx** — DashboardMakButton
- **src/components/dashboard/DashboardWelcome.tsx** — DashboardWelcome
- **src/components/dashboard/HealthScoreCard.tsx** — HealthScoreCard
- **src/components/dashboard/MiniLattice.tsx** — MiniLattice
- **src/components/dashboard/ProfileSummaryCard.tsx** — ProfileSummaryCard
- **src/components/dashboard/TouchpointProgressStrip.tsx** — TouchpointProgressStrip
- **src/components/lattice/LatticeGrid.tsx** — LatticeGrid
- **src/components/layout/AcademicSoapSectionGate.tsx** — AcademicSoapSectionGate
- **src/components/layout/AnalyticsProvider.tsx** — AnalyticsProvider, useAnalytics, useAnalyticsOptional
- **src/components/layout/AppShell.tsx** — useAppShell, AppShell
- **src/components/layout/EscalationResourcesPanel.tsx** — EscalationResourcesPanel
- **src/components/layout/IconSidebar.tsx** — IconSidebar
- **src/components/layout/MakPanel.tsx** — MakPanel
- **src/components/layout/PageShell.tsx** — PageShell
- **src/components/layout/SectionGateEntry.tsx** — SectionGateEntry
- **src/components/layout/ThemeProvider.tsx** — ThemeProvider
- **src/components/layout/TopNavBar.tsx** — TopNavBar
- **src/components/mak/MakChat.tsx** — MakChat
- **src/components/marketing/ConnectWithFiscmakHeading.tsx** — ConnectWithFiscmakHeading
- **src/components/marketing/ContactFormCard.tsx** — ContactFormCard
- **src/components/marketing/FaqSection.tsx** — FISCMAK_FAQ, FaqSection
- **src/components/marketing/FiscmakNameSection.tsx** — FiscmakNameIntro, FiscmakNameBreakdown, FoundersNarrativeSection, FiscmakNameSection, AboutFiscmakContent
- **src/components/marketing/HowItWorksSection.tsx** — HowItWorksSection
- **src/components/marketing/InstitutionalPartnersSection.tsx** — InstitutionalPartnersSection
- **src/components/marketing/MarketingAuthShell.tsx** — MarketingAuthShell
- **src/components/marketing/MarketingFontShell.tsx** — MarketingFontShell
- **src/components/marketing/MarketingFooter.tsx** — MarketingFooter
- **src/components/marketing/MarketingHeader.tsx** — MarketingHeader
- **src/components/marketing/MarketingHeroSection.tsx** — MarketingHeroSection
- **src/components/marketing/MarketingHomePage.tsx** — MarketingHomePage
- **src/components/marketing/MarketingPageShell.tsx** — MarketingPageShell
- **src/components/onboarding/DashboardRevealOverlay.tsx** — DashboardRevealOverlay
- **src/components/onboarding/GoalSettingPanel.tsx** — GoalSettingPanel, defaultProposedGoals
- **src/components/onboarding/LayOfTheLandTour.tsx** — LayOfTheLandTour
- **src/components/onboarding/OnboardingDocumentsStep.tsx** — OnboardingDocumentsStep
- **src/components/onboarding/OnboardingGuard.tsx** — OnboardingGuard
- **src/components/onboarding/OnboardingWelcome.tsx** — OnboardingWelcome
- **src/components/onboarding/ReconciliationItemCard.tsx** — ReconciliationItemCard
- **src/components/onboarding/SpecialtyIntakeFields.tsx** — SpecialtyIntakeFields
- **src/components/onboarding/Tier1Onboarding.tsx** — Tier1Onboarding
- **src/components/onboarding/Tier2Onboarding.tsx** — Tier2Onboarding
- **src/components/onboarding/Touchpoint1Onboarding.tsx** — Touchpoint1Onboarding
- **src/components/profile/NpiRegistryPanel.tsx** — NpiRegistryPanel
- **src/components/profile/ProfileMenu.tsx** — ProfileMenu
- **src/components/profile/UserAvatar.tsx** — UserAvatar
- **src/components/settings/PremiumUpgradePanel.tsx** — PremiumUpgradePanel
- **src/components/studio/EvidenceChipNode.tsx** — (none)
- **src/components/studio/EvidenceDrawer.tsx** — EvidenceDrawer
- **src/components/studio/StudioLexicalEditor.tsx** — StudioLexicalEditor
- **src/components/studio/VersionHistoryPanel.tsx** — VersionHistoryPanel
- **src/components/ui/Badge.tsx** — Badge
- **src/components/ui/Button.tsx** — Button
- **src/components/ui/Card.tsx** — Card
- **src/components/ui/CardSection.tsx** — CardSectionHeader, CardSection
- **src/components/ui/EmptyState.tsx** — EmptyState
- **src/components/ui/Input.tsx** — Input
- **src/components/ui/LoadingSteps.tsx** — LoadingSteps
- **src/components/ui/MakDiscussLink.tsx** — MakDiscussLink
- **src/components/ui/MetricRow.tsx** — MetricRow
- **src/components/ui/ScoreDisplay.tsx** — ScoreDisplay
- **src/components/ui/StatusChip.tsx** — StatusChip
- **src/components/ui/StatusIndicator.tsx** — StatusIndicator
- **src/components/ui/TechnicalDetailToggle.tsx** — TechnicalDetailToggle, DataSourceTooltip
- **src/components/workspace/ActivitiesView.tsx** — ActivitiesView
- **src/components/workspace/AnnualRefreshPanel.tsx** — AnnualRefreshPanel
- **src/components/workspace/AssessmentInsightsWorkspace.tsx** — AssessmentInsightsWorkspace
- **src/components/workspace/CareerDataReconcilePanel.tsx** — CareerDataReconcilePanel
- **src/components/workspace/CareerDataVaultPanel.tsx** — CareerDataVaultPanel
- **src/components/workspace/CareerStrategyGoalCard.tsx** — CareerStrategyGoalCard
- **src/components/workspace/DashboardWorkspace.tsx** — DashboardWorkspace
- **src/components/workspace/DocumentsView.tsx** — DocumentsView
- **src/components/workspace/GoalsWorkspace.tsx** — GoalsWorkspace
- **src/components/workspace/JobsWorkspace.tsx** — JobsWorkspace
- **src/components/workspace/LatticeView.tsx** — LatticeView
- **src/components/workspace/ObjectiveWorkspace.tsx** — ObjectiveWorkspace
- **src/components/workspace/OutputStudioWorkspace.tsx** — OutputStudioWorkspace
- **src/components/workspace/PathwaysExplorer.tsx** — PathwaysExplorer
- **src/components/workspace/PromotionNarrativeWizard.tsx** — PromotionNarrativeWizard
- **src/components/workspace/QuarterlyPulsePanel.tsx** — QuarterlyPulsePanel
- **src/components/workspace/StrategyWorkspace.tsx** — StrategyWorkspace
- **src/components/workspace/SubjectiveWorkspace.tsx** — SubjectiveWorkspace

---

## src/components/auth/AppleSignInButton.tsx

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

type AppleSignInButtonProps = {
  next?: string;
  label?: string;
};

function AppleIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05 1.88-3.71 1.88-1.66 0-2.07-1-3.71-1-1.66 0-2.17 1-3.73 1.02-1.56.02-2.75-1.57-3.73-2.52C1.79 15.25 1.04 10.45 3.95 7.9c1.45-1.26 3.34-1.99 5.24-1.97 1.64.03 2.53 1.07 3.81 1.07 1.26 0 2.03-1.07 3.81-1.03 1.29.02 2.65.68 3.63 1.75-3.19 1.96-2.67 6.07.53 7.45-.67 1.74-1.54 3.47-2.92 4.11zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

export function AppleSignInButton({
  next = "/app",
  label = "Continue with Apple",
}: AppleSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAppleSignIn() {
    if (!isSupabaseConfigured()) {
      setError("Apple sign-in requires Supabase to be configured.");
      return;
    }

    setLoading(true);
    setError("");

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: { redirectTo },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
  }

  if (!isSupabaseConfigured()) return null;

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="secondary"
        className="w-full gap-2"
        disabled={loading}
        onClick={() => void handleAppleSignIn()}
      >
        <AppleIcon />
        {loading ? "Redirecting…" : label}
      </Button>
      {error && <p className="text-sm text-cx-attention">{error}</p>}
    </div>
  );
}

```

## src/components/auth/AuthGuard.tsx

```tsx
"use client";

import type { User } from "@supabase/supabase-js";
import { ensureAppUser } from "@/lib/v2/ensure-app-user";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(!isSupabaseConfigured());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const supabase = createClient();
    let cancelled = false;

    async function bootstrap(user: User) {
      try {
        await ensureAppUser(supabase, user);
        if (!cancelled) setReady(true);
      } catch (e) {
        if (!cancelled) {
          setError(
            e instanceof Error
              ? e.message
              : "Could not initialize your account. Run docs/FISCMAK_V2_SCHEMA.sql in Supabase.",
          );
        }
      }
    }

    async function initSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled) return;

      if (session?.user) {
        await bootstrap(session.user);
        return;
      }

      router.replace("/login");
    }

    void initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;

      if (session?.user) {
        // Defer async work — awaiting inside this callback can deadlock Supabase auth.
        queueMicrotask(() => {
          if (!cancelled) void bootstrap(session.user);
        });
        return;
      }

      if (event === "SIGNED_OUT") {
        setReady(false);
        router.replace("/login");
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [router]);

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="max-w-md text-center text-cx-attention">{error}</p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-cx-forest-dark/70">Loading…</p>
      </div>
    );
  }

  return <>{children}</>;
}

```

## src/components/auth/GoogleSignInButton.tsx

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

type GoogleSignInButtonProps = {
  next?: string;
  label?: string;
  variant?: "default" | "marketing";
};

function GoogleIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function GoogleSignInButton({
  next = "/app",
  label = "Continue with Google",
  variant = "default",
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGoogleSignIn() {
    if (!isSupabaseConfigured()) {
      setError("Google sign-in requires Supabase to be configured.");
      return;
    }

    setLoading(true);
    setError("");

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
  }

  if (!isSupabaseConfigured()) return null;

  const marketingButtonClass =
    "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-white/20 bg-[#0f1410] px-6 py-3 font-futura-bold text-sm text-white transition hover:border-marketing-accent hover:text-marketing-accent disabled:opacity-50";

  return (
    <div className="space-y-2">
      {variant === "marketing" ? (
        <button
          type="button"
          className={marketingButtonClass}
          disabled={loading}
          onClick={() => void handleGoogleSignIn()}
        >
          <GoogleIcon />
          {loading ? "Redirecting…" : label}
        </button>
      ) : (
        <Button
          type="button"
          variant="secondary"
          className="w-full gap-2"
          disabled={loading}
          onClick={() => void handleGoogleSignIn()}
        >
          <GoogleIcon />
          {loading ? "Redirecting…" : label}
        </Button>
      )}
      {error && (
        <p className={variant === "marketing" ? "text-sm text-[#f5d4c4]" : "text-sm text-cx-attention"}>
          {error}
        </p>
      )}
    </div>
  );
}

```

## src/components/auth/MarketingAuthInput.tsx

```tsx
import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export const MarketingAuthInput = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { label: string }
>(({ className, label, id, ...props }, ref) => (
  <div>
    <label htmlFor={id} className="font-futura-condensed mb-1.5 block text-xs text-white">
      {label}
    </label>
    <input
      ref={ref}
      id={id}
      className={cn(
        "w-full rounded-lg border border-white/20 bg-[#0f1410] px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus:border-marketing-accent focus:outline-none",
        className,
      )}
      {...props}
    />
  </div>
));
MarketingAuthInput.displayName = "MarketingAuthInput";

```

## src/components/brand/CoachMakAvatar.tsx

```tsx
import { cn } from "@/lib/utils";

const ICON_SRC = "/brand/nav/coach-mak.png";

type CoachMakAvatarProps = {
  size?: number;
  className?: string;
};

export function CoachMakAvatar({ size = 32, className }: CoachMakAvatarProps) {
  return (
    // Native img avoids Next/Image issues with uploaded brand assets
    <img
      src={ICON_SRC}
      alt="Coach Mak"
      width={size}
      height={size}
      className={cn("shrink-0 object-contain", className)}
      decoding="async"
    />
  );
}

```

## src/components/brand/CoachMakMark.tsx

```tsx
import { cn } from "@/lib/utils";

type CoachMakMarkProps = {
  size?: number;
  className?: string;
};

/** Hex Coach Mak mark — Loveable palette (navy + accent blue). */
export function CoachMakMark({ size = 32, className }: CoachMakMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <path
        d="M16 2L28.062 9V23L16 30L3.938 23V9L16 2Z"
        fill="var(--fm-primary)"
        stroke="var(--fm-primary)"
        strokeWidth="0.5"
      />
      <text
        x="16"
        y="21"
        textAnchor="middle"
        fill="#ffffff"
        fontSize="13"
        fontWeight="700"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        C
      </text>
    </svg>
  );
}

```

## src/components/brand/CoachMakVoiceIcon.tsx

```tsx
import { cn } from "@/lib/utils";

type CoachMakVoiceIconProps = {
  className?: string;
  recording?: boolean;
};

/** Coach Mak voice capture — waveform + mic mark (50×50). */
export function CoachMakVoiceIcon({ className, recording }: CoachMakVoiceIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="50"
      height="50"
      viewBox="0 0 50 50"
      fill="none"
      className={cn(className, recording && "animate-pulse")}
      aria-hidden
    >
      <rect
        width="50"
        height="50"
        rx="25"
        className={cn(
          "fill-black/5 transition-colors",
          recording && "fill-[#67E151]/20",
        )}
      />
      <path
        d="M38.9 24.25C38.9 23.8358 39.2358 23.5 39.65 23.5C40.0642 23.5 40.4 23.8358 40.4 24.25V26.75C40.4 27.1642 40.0642 27.5 39.65 27.5C39.2358 27.5 38.9 27.1642 38.9 26.75V24.25Z"
        fill="white"
      />
      <path
        d="M41.7 25.55C41.7 25.1358 42.0357 24.8 42.45 24.8C42.8642 24.8 43.2 25.1358 43.2 25.55C43.2 25.9642 42.8642 26.3 42.45 26.3C42.0357 26.3 41.7 25.9642 41.7 25.55Z"
        fill="white"
      />
      <path
        d="M27.5 21.25C27.5 20.8358 27.8358 20.5 28.25 20.5C28.6642 20.5 29 20.8358 29 21.25V29.75C29 30.1642 28.6642 30.5 28.25 30.5C27.8358 30.5 27.5 30.1642 27.5 29.75V21.25Z"
        fill="white"
      />
      <path
        d="M33.1 21.25C33.1 20.8358 33.4358 20.5 33.85 20.5C34.2642 20.5 34.6 20.8358 34.6 21.25V29.75C34.6 30.1642 34.2642 30.5 33.85 30.5C33.4358 30.5 33.1 30.1642 33.1 29.75V21.25Z"
        fill="white"
      />
      <path
        d="M30.3 22.25C30.3 21.8358 30.6358 21.5 31.05 21.5C31.4642 21.5 31.8 21.8358 31.8 22.25V28.75C31.8 29.1642 31.4642 29.5 31.05 29.5C30.6358 29.5 30.3 29.1642 30.3 28.75V22.25Z"
        fill="white"
      />
      <path
        d="M35.9 22.75C35.9 22.3358 36.2358 22 36.65 22C37.0642 22 37.4 22.3358 37.4 22.75V28.25C37.4 28.6642 37.0642 29 36.65 29C36.2358 29 35.9 28.6642 35.9 28.25V22.75Z"
        fill="white"
      />
      <path
        d="M27 11.5C27 12.0343 26.7206 12.5034 26.3 12.7691V37.7309C26.7206 37.9966 27 38.4657 27 39C27 39.8284 26.3284 40.5 25.5 40.5C24.6716 40.5 24 39.8284 24 39C24 38.4244 24.3242 37.9245 24.8 37.673V12.827C24.3242 12.5755 24 12.0756 24 11.5C24 10.6716 24.6716 10 25.5 10C26.3284 10 27 10.6716 27 11.5Z"
        className={cn("transition-colors", recording ? "fill-[#A9FF5C]" : "fill-[#67E151]")}
      />
      <path
        d="M7.5 24.25C7.5 23.8358 7.83579 23.5 8.25 23.5C8.66421 23.5 9 23.8358 9 24.25V26.75C9 27.1642 8.66421 27.5 8.25 27.5C7.83579 27.5 7.5 27.1642 7.5 26.75V24.25Z"
        fill="#5C804B"
      />
      <path
        d="M10.29 22.25C10.29 21.8358 10.6258 21.5 11.04 21.5C11.4542 21.5 11.79 21.8358 11.79 22.25V28.75C11.79 29.1642 11.4542 29.5 11.04 29.5C10.6258 29.5 10.29 29.1642 10.29 28.75V22.25Z"
        fill="#5C804B"
      />
      <path
        d="M13.08 19.25C13.08 18.8358 13.4157 18.5 13.83 18.5C14.2442 18.5 14.58 18.8358 14.58 19.25V31.75C14.58 32.1642 14.2442 32.5 13.83 32.5C13.4157 32.5 13.08 32.1642 13.08 31.75V19.25Z"
        fill="#5C804B"
      />
      <path
        d="M19.08 17.25C19.08 16.8358 19.4157 16.5 19.83 16.5C20.2442 16.5 20.58 16.8358 20.58 17.25V33.75C20.58 34.1642 20.2442 34.5 19.83 34.5C19.4157 34.5 19.08 34.1642 19.08 33.75V17.25Z"
        fill="#5C804B"
      />
      <path
        d="M22.08 21.25C22.08 20.8358 22.4157 20.5 22.83 20.5C23.2442 20.5 23.58 20.8358 23.58 21.25V29.75C23.58 30.1642 23.2442 30.5 22.83 30.5C22.4157 30.5 22.08 30.1642 22.08 29.75V21.25Z"
        fill="#5C804B"
      />
      <path
        d="M16.08 14.25C16.08 13.8358 16.4157 13.5 16.83 13.5C17.2442 13.5 17.58 13.8358 17.58 14.25V36.75C17.58 37.1642 17.2442 37.5 16.83 37.5C16.4157 37.5 16.08 37.1642 16.08 36.75V14.25Z"
        fill="#5C804B"
      />
    </svg>
  );
}

```

## src/components/brand/MakHexMicButton.tsx

```tsx
import { CoachMakVoiceIcon } from "@/components/brand/CoachMakVoiceIcon";
import { cn } from "@/lib/utils";

type MakHexMicButtonProps = {
  recording?: boolean;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
};

export function MakHexMicButton({
  recording,
  disabled,
  onClick,
  className,
}: MakHexMicButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={recording ? "Recording…" : "Voice input"}
      aria-label={recording ? "Recording voice message" : "Voice input"}
      aria-pressed={recording}
      className={cn(
        "relative flex h-[50px] w-[50px] shrink-0 items-center justify-center transition-transform hover:scale-[1.03] disabled:opacity-40",
        recording && "ring-2 ring-[#67E151]/60 ring-offset-2 ring-offset-transparent",
        className,
      )}
    >
      <CoachMakVoiceIcon recording={recording} className="h-[50px] w-[50px]" />
    </button>
  );
}

```

## src/components/brand/NavIcon.tsx

```tsx
import { cn } from "@/lib/utils";

type NavIconProps = {
  src: string;
  alt: string;
  size?: number;
  className?: string;
};

export function NavIcon({ src, alt, size = 22, className }: NavIconProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={cn("shrink-0 object-contain", className)}
      decoding="async"
      draggable={false}
    />
  );
}

```

## src/components/brand/SidebarDecoyIcon.tsx

```tsx
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type SidebarDecoyIconProps = {
  icon: LucideIcon;
  variant?: "brand" | "mak" | "neutral";
  className?: string;
};

/** Placeholder sidebar glyph until final brand PNGs are wired in. */
export function SidebarDecoyIcon({
  icon: Icon,
  variant = "neutral",
  className,
}: SidebarDecoyIconProps) {
  return (
    <div
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-xl",
        variant === "brand" && "bg-[#5FD65F]/20 text-[#5FD65F]",
        variant === "mak" && "bg-[#5FD65F]/20 text-[#5FD65F]",
        variant === "neutral" && "bg-white/10 text-white/70",
        className,
      )}
      aria-hidden
    >
      <Icon size={20} strokeWidth={2} />
    </div>
  );
}

```

## src/components/dashboard/DashboardAlerts.tsx

```tsx
"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { EngagementNotification } from "@/lib/v2/engagement-tracking";
import { cn } from "@/lib/utils";

function severityClass(severity: EngagementNotification["severity"]): string {
  if (severity === "urgent") return "border-red-400/40 bg-red-500/10";
  if (severity === "attention") return "border-amber-400/40 bg-amber-500/10";
  return "border-white/15 bg-white/5";
}

export function DashboardAlerts({ items }: { items: EngagementNotification[] }) {
  if (items.length === 0) return null;

  return (
    <ul className="mt-3 space-y-2" aria-label="Additional reminders">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={item.href ?? "/app/dashboard"}
            className={cn(
              "flex items-start justify-between gap-3 rounded-lg border px-3 py-2.5 transition-opacity hover:opacity-90",
              severityClass(item.severity),
            )}
          >
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-wide text-white/60">
                {item.severity === "urgent" ? "Needs attention" : "Reminder"}
              </p>
              <p className="text-sm font-semibold text-white">{item.title}</p>
              <p className="mt-0.5 line-clamp-2 text-xs text-white/70">{item.message}</p>
            </div>
            <span className="inline-flex shrink-0 items-center gap-0.5 pt-1 text-[10px] font-medium text-[#5FD65F]">
              {item.actionLabel ?? "Open"}
              <ChevronRight size={12} aria-hidden />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

```

## src/components/dashboard/DashboardDueNow.tsx

```tsx
"use client";

import { ArrowRight } from "lucide-react";
import type { DashboardDueNowItem } from "@/lib/v2/dashboard-redesign";

export type DashboardDueItem = DashboardDueNowItem;

export function DashboardDueNow({
  item,
  onContinue,
}: {
  item: DashboardDueItem;
  onContinue: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#5FD65F]/35 bg-[#5FD65F]/10 px-4 py-3">
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wide text-cx-forest-dark/70">
          Due now · {item.label}
        </p>
        <p className="text-sm font-semibold text-cx-forest-dark">{item.title}</p>
        {item.detail && (
          <p className="mt-0.5 line-clamp-2 text-xs text-cx-forest-dark/70">{item.detail}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onContinue}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-cx-forest-dark px-3 py-1.5 text-xs font-semibold text-white hover:bg-cx-forest-dark/90"
      >
        Continue
        <ArrowRight size={14} aria-hidden />
      </button>
    </div>
  );
}

```

## src/components/dashboard/DashboardGoalsGrid.tsx

```tsx
"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StatusIndicator } from "@/components/ui/StatusIndicator";
import type { GoalCardModel } from "@/lib/v2/dashboard-redesign";
import { cn } from "@/lib/utils";

type DashboardGoalCardProps = {
  goal: GoalCardModel;
  compact?: boolean;
  nested?: boolean;
  hideActions?: boolean;
  onDetails?: (goalId: string) => void;
};

const borderColors = {
  primary: "border-l-cx-forest-dark",
  attention: "border-l-amber-500",
  success: "border-l-[#5FD65F]",
};

const fillClasses = {
  primary: "bg-cx-forest-dark",
  attention: "bg-amber-500",
  success: "bg-[#5FD65F]",
};

export function DashboardGoalCard({
  goal,
  compact = false,
  nested = false,
  hideActions = false,
  onDetails,
}: DashboardGoalCardProps) {
  return (
    <article
      className={cn(
        "flex w-full flex-col rounded-xl border border-cx-forest-dark/10 border-l-4",
        nested
          ? "bg-cx-forest-dark/[0.03] p-2.5 shadow-none"
          : cn("bg-white shadow-sm", compact ? "p-3" : "max-w-[280px] p-5"),
        borderColors[goal.borderColor],
      )}
    >
      <p className={cn("font-bold text-cx-forest-dark", compact ? "text-sm" : "text-lg")}>
        {goal.typeLabel}
      </p>

      <h3
        className={cn(
          "mt-1 line-clamp-2 font-semibold text-cx-forest-dark",
          compact ? "text-xs" : "text-base",
        )}
      >
        {goal.title}
      </h3>

      <div className={compact ? "mt-2" : "mt-4"}>
        <div className="flex items-center justify-between gap-2">
          <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-cx-forest-dark/10">
            <div
              className={cn("h-full rounded-full", fillClasses[goal.fillColor])}
              style={{ width: `${Math.max(goal.percent, 4)}%` }}
            />
          </div>
          <span className="shrink-0 text-xs font-semibold text-cx-forest-dark">{goal.percent}%</span>
        </div>
      </div>

      {goal.stalled && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-amber-600">
          <StatusIndicator status="attention" size={14} />
          Needs attention
        </p>
      )}

      {!hideActions && onDetails && (
        <div className={cn("flex gap-2", compact ? "mt-2" : "mt-4")}>
          <button
            type="button"
            onClick={() => onDetails(goal.id)}
            className="rounded-full border border-cx-forest-dark/20 px-3 py-1.5 text-xs font-semibold text-cx-forest-dark hover:bg-cx-forest-dark/5"
          >
            Details
          </button>
        </div>
      )}
    </article>
  );
}

type DashboardGoalsGridProps = {
  goals: GoalCardModel[];
  onDetails?: (goalId: string) => void;
  variant?: "section" | "inline";
};

export function DashboardGoalsGrid({
  goals,
  onDetails,
  variant = "section",
}: DashboardGoalsGridProps) {
  const inline = variant === "inline";

  if (goals.length === 0) {
    if (inline) return null;
    return (
      <section aria-labelledby="goals-heading">
        <h2 id="goals-heading" className="text-xl font-semibold text-cx-forest-dark">
          Your Goals
        </h2>
        <div className="mt-6 rounded-xl bg-white p-5 shadow-sm">
          <p className="text-sm text-cx-forest-dark/70">No active goals yet.</p>
          <Link
            href="/app/plan"
            className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-cx-forest-dark hover:underline"
          >
            Set goals <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    );
  }

  if (inline) {
    return (
      <div className="cx-dashboard-panel rounded-xl bg-white p-3 shadow-sm">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-cx-forest-dark">Goals</h3>
          <Link
            href="/app/plan"
            className="inline-flex items-center gap-0.5 text-[10px] font-medium text-cx-forest-dark/70 hover:text-cx-forest-dark"
          >
            Strategy
            <ArrowRight size={12} />
          </Link>
        </div>
        <div className="mt-2 space-y-2">
          {goals.map((goal) => (
            <DashboardGoalCard key={goal.id} goal={goal} compact nested hideActions />
          ))}
        </div>
      </div>
    );
  }

  return (
    <section aria-labelledby="goals-heading">
      <h2 id="goals-heading" className="text-xl font-semibold text-cx-forest-dark">
        Your Goals
      </h2>
      <div className="mt-6 grid justify-items-center gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {goals.map((goal) => (
          <DashboardGoalCard
            key={goal.id}
            goal={goal}
            onDetails={onDetails}
          />
        ))}
      </div>
    </section>
  );
}

```

## src/components/dashboard/DashboardMakButton.tsx

```tsx
"use client";

import { MessageCircle } from "lucide-react";
import { useAppShell } from "@/components/layout/AppShell";
import { openDashboardMakMenu } from "@/lib/v2/dashboard-mak-menu";
import { cn } from "@/lib/utils";

export function DashboardMakButton({ className }: { className?: string }) {
  const { startMakFlow } = useAppShell();

  return (
    <button
      type="button"
      onClick={() => openDashboardMakMenu(startMakFlow)}
      className={cn(
        "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#5FD65F] px-4 py-2.5 text-sm font-semibold text-cx-forest-dark transition-colors hover:bg-[#5FD65F]/90",
        className,
      )}
    >
      <MessageCircle size={16} aria-hidden />
      Talk with Mak
    </button>
  );
}

```

## src/components/dashboard/DashboardWelcome.tsx

```tsx
"use client";

import { DashboardDueNow, type DashboardDueItem } from "@/components/dashboard/DashboardDueNow";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { DashboardGoalsGrid } from "@/components/dashboard/DashboardGoalsGrid";
import { DashboardMakButton } from "@/components/dashboard/DashboardMakButton";
import { ProfileSummaryCard } from "@/components/dashboard/ProfileSummaryCard";
import { TouchpointProgressStrip } from "@/components/dashboard/TouchpointProgressStrip";
import type { DashboardHeaderModel } from "@/lib/v2/dashboard-architecture";
import type { DashboardLatticeCell } from "@/lib/v2/dashboard-data";
import type { DashboardDueNowItem, GoalCardModel, ProfileRow, TouchpointBarState } from "@/lib/v2/dashboard-redesign";
import type { EngagementNotification } from "@/lib/v2/engagement-tracking";
import { timeOfDayGreeting } from "@/lib/mak-greeting";

type DashboardWelcomeProps = {
  displayName: string;
  tracks?: string[] | null;
  profileLine?: string | null;
  profileRows?: ProfileRow[];
  header: DashboardHeaderModel;
  nextMilestone: string | null;
  goals: GoalCardModel[];
  touchpointStates: TouchpointBarState[];
  latticeCells?: DashboardLatticeCell[];
  dueNow?: DashboardDueItem | null;
  secondaryAlerts?: EngagementNotification[];
  onDueNowContinue?: () => void;
};

export function DashboardWelcome({
  displayName,
  tracks,
  profileLine,
  profileRows = [],
  header,
  nextMilestone,
  goals,
  touchpointStates,
  latticeCells = [],
  dueNow,
  secondaryAlerts = [],
  onDueNowContinue,
}: DashboardWelcomeProps) {
  const salutation = timeOfDayGreeting();

  return (
    <header className="cx-dashboard-hero rounded-2xl bg-cx-forest-dark p-5 shadow-sm md:p-6">
      <h1 className="text-[28px] font-bold leading-snug text-[#5FD65F] md:text-[32px]">
        {salutation}, {displayName}.
      </h1>
      {profileLine && (
        <p className="mt-1 text-base font-medium text-white md:text-lg">{profileLine}</p>
      )}

      <div className="mt-4 grid items-start gap-4 md:grid-cols-2">
        <ProfileSummaryCard
          rows={profileRows}
          tracks={tracks}
          header={header}
          nextMilestone={nextMilestone}
          latticeCells={latticeCells}
        />
        <DashboardGoalsGrid goals={goals} variant="inline" />
      </div>

      {dueNow && onDueNowContinue && (
        <div className="mt-4">
          <DashboardDueNow item={dueNow} onContinue={onDueNowContinue} />
        </div>
      )}

      <DashboardAlerts items={secondaryAlerts} />

      <div className="mt-4 border-t border-white/10 pt-4">
        <TouchpointProgressStrip
          states={touchpointStates}
          href={
            dueNow?.kind === "annual" || dueNow?.kind === "quarterly"
              ? "/app/subjective"
              : "/app/assessment"
          }
        />
      </div>

      <DashboardMakButton className="mt-4" />
    </header>
  );
}

```

## src/components/dashboard/HealthScoreCard.tsx

```tsx
"use client";

import { useId } from "react";
import { ArrowDown, ArrowRight, ArrowUp } from "lucide-react";
import { useAppShell } from "@/components/layout/AppShell";
import type { DashboardHeaderModel } from "@/lib/v2/dashboard-architecture";
import { openDashboardMeceOption } from "@/lib/v2/dashboard-mak-menu";
import { cn } from "@/lib/utils";

const FOREST = "#243b31";
const LIME = "#5FD65F";
const TICK_COUNT = 72;
/** 6 o'clock — fill ticks clockwise (increasing angle in SVG coordinates). */
const GAUGE_START_ANGLE = Math.PI / 2;

function mixHex(from: string, to: string, t: number): string {
  const pf = parseInt(from.slice(1), 16);
  const pt = parseInt(to.slice(1), 16);
  const r = Math.round(((pf >> 16) & 255) * (1 - t) + ((pt >> 16) & 255) * t);
  const g = Math.round(((pf >> 8) & 255) * (1 - t) + ((pt >> 8) & 255) * t);
  const b = Math.round((pf & 255) * (1 - t) + (pt & 255) * t);
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

function TrendIcon({ trend }: { trend: DashboardHeaderModel["trend"] }) {
  if (trend === "up") return <ArrowUp className="text-[#5FD65F]" size={14} />;
  if (trend === "down") return <ArrowDown className="text-red-400" size={14} />;
  return <ArrowRight className="text-white/50" size={14} />;
}

function CircularTickGauge({
  score,
  status,
  trend,
  onDiscuss,
}: {
  score: number | null | undefined;
  status?: string | null;
  trend: DashboardHeaderModel["trend"];
  onDiscuss: () => void;
}) {
  const ringId = useId().replace(/:/g, "");
  const cx = 100;
  const cy = 100;
  const innerR = 68;
  const outerR = 86;
  const hasScore = score != null;
  const value = hasScore ? Math.min(100, Math.max(0, score)) : 0;
  const filledTicks = Math.round((value / 100) * TICK_COUNT);
  const tickSpan = (Math.PI * 2) / TICK_COUNT;

  const ticks = Array.from({ length: TICK_COUNT }, (_, i) => {
    const midAngle = GAUGE_START_ANGLE + i * tickSpan;
    const filled = i < filledTicks;
    const color = filled
      ? mixHex(
          FOREST,
          LIME,
          filledTicks <= 1 ? 1 : i / Math.max(filledTicks - 1, 1),
        )
      : "#ffffff";
    return {
      key: i,
      x1: cx + innerR * Math.cos(midAngle),
      y1: cy + innerR * Math.sin(midAngle),
      x2: cx + outerR * Math.cos(midAngle),
      y2: cy + outerR * Math.sin(midAngle),
      color,
      filled,
    };
  });

  return (
    <button
      type="button"
      onClick={onDiscuss}
      className="group flex w-full flex-col items-center rounded-xl cx-health-gauge bg-cx-forest-dark px-3 py-4 text-left transition-opacity hover:opacity-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5FD65F]"
      aria-label={
        hasScore
          ? `Health score ${value} out of 100. Discuss with Mak.`
          : "Health score unavailable. Discuss with Mak."
      }
    >
      <svg
        viewBox="0 0 200 200"
        className="h-[148px] w-[148px]"
        role="img"
        aria-hidden
      >
        <circle
          cx={cx}
          cy={cy}
          r={innerR - 10}
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeWidth={1.5}
        />

        {ticks.map((tick) => (
          <line
            key={tick.key}
            x1={tick.x1}
            y1={tick.y1}
            x2={tick.x2}
            y2={tick.y2}
            stroke={tick.color}
            strokeWidth={tick.filled ? 3.5 : 3}
            strokeLinecap="round"
            opacity={tick.filled ? 1 : 0.95}
          />
        ))}

        <circle
          cx={cx}
          cy={cy}
          r={innerR - 10}
          fill="none"
          stroke={`url(#${ringId}-inner)`}
          strokeWidth={1}
          opacity={0.35}
        />
        <defs>
          <linearGradient id={`${ringId}-inner`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={FOREST} />
            <stop offset="100%" stopColor={LIME} />
          </linearGradient>
        </defs>
      </svg>

      <div className="-mt-[108px] flex h-[108px] w-[108px] flex-col items-center justify-center pointer-events-none">
        <p className="text-[10px] font-medium uppercase tracking-wider text-white/65">
          Health score
        </p>
        <p className="mt-0.5 text-3xl font-bold leading-none text-[#5FD65F]">
          {hasScore ? value : "—"}
        </p>
        {status && (
          <p className="mt-1 text-[10px] font-medium capitalize text-white/55">
            {status.replace(/_/g, " ")}
          </p>
        )}
      </div>

      <div className="mt-3 flex w-full items-center justify-between gap-2 px-1">
        <p className="text-[10px] text-white/45 group-hover:text-white/60">
          Tap to discuss with Mak
        </p>
        {hasScore && <TrendIcon trend={trend} />}
      </div>
    </button>
  );
}

export function HealthScoreCard({
  header,
  className,
}: {
  header: DashboardHeaderModel;
  className?: string;
}) {
  const { startMakFlow } = useAppShell();

  return (
    <div className={cn(className)}>
      <CircularTickGauge
        score={header.careerHealthScore}
        status={header.scoreStatus}
        trend={header.trend}
        onDiscuss={() => openDashboardMeceOption(startMakFlow, "profile")}
      />
    </div>
  );
}

```

## src/components/dashboard/MiniLattice.tsx

```tsx
"use client";

import Link from "next/link";
import { ChevronRight, Grid3x3 } from "lucide-react";
import { DOMAINS, TRACKS, type LatticeCellState } from "@/lib/constants";
import { cn, energyCellClass } from "@/lib/utils";

type MiniLatticeProps = {
  cells: LatticeCellState[];
  href?: string;
  className?: string;
  compact?: boolean;
  showHeader?: boolean;
};

function getCell(cells: LatticeCellState[], d: number, t: number): LatticeCellState {
  return (
    cells.find((c) => c.domainIndex === d && c.trackIndex === t) ?? {
      domainIndex: d,
      trackIndex: t,
      activityCount: 0,
      energy: null,
    }
  );
}

export function MiniLattice({
  cells,
  href = "/app/objective?tab=lattice",
  className,
  compact = false,
  showHeader = true,
}: MiniLatticeProps) {
  const activeCells = cells.filter((c) => c.activityCount > 0).length;
  const cellSize = compact ? "h-3 w-3" : "h-3.5 w-3.5";
  const gap = compact ? "gap-px" : "gap-0.5";

  return (
    <div
      className={cn(
        "cx-dashboard-subpanel rounded-xl border border-cx-forest-dark/10 bg-cx-forest-dark/[0.03] p-2.5",
        className,
      )}
    >
      {showHeader && (
        <div className="mb-2 flex items-center gap-2">
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-cx-forest-dark/10 text-cx-forest-dark"
            aria-hidden
          >
            <Grid3x3 size={14} strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-medium uppercase tracking-wide text-cx-forest-dark/70">
              Career lattice
            </p>
            <p className="text-xs font-semibold text-cx-forest-dark">
              {activeCells > 0 ? `${activeCells} active cells` : "No activity yet"}
            </p>
          </div>
        </div>
      )}

      <Link href={href} className="group block">
        <div
          className={cn("mx-auto inline-grid", gap)}
          style={{ gridTemplateColumns: "repeat(8, 1fr)" }}
          role="img"
          aria-label={`Career lattice heat map, ${activeCells} of 64 cells with activity`}
        >
          {Array.from({ length: 8 }, (_, d) =>
            Array.from({ length: 8 }, (_, t) => {
              const cell = getCell(cells, d, t);
              const opacity =
                cell.activityCount === 0
                  ? 0.35
                  : Math.min(1, 0.55 + cell.activityCount * 0.06);
              const domain = DOMAINS[d]?.slice(0, 14) ?? "Domain";
              const track = TRACKS[t]?.slice(0, 12) ?? "Track";
              return (
                <div
                  key={`${d}-${t}`}
                  title={
                    cell.activityCount > 0
                      ? `${domain} × ${track}: ${cell.activityCount} activities`
                      : `${domain} × ${track}: no activity`
                  }
                  className={cn(
                    "rounded-[2px] border transition-opacity group-hover:opacity-100",
                    cellSize,
                    energyCellClass(cell.energy, cell.activityCount),
                  )}
                  style={{ opacity }}
                />
              );
            }),
          )}
        </div>
      </Link>

      <Link
        href={href}
        className="mt-2 inline-flex items-center gap-1 text-[10px] font-medium text-cx-forest-dark/70 hover:text-cx-forest-dark"
      >
        Full lattice
        <ChevronRight size={12} />
      </Link>
    </div>
  );
}

```

## src/components/dashboard/ProfileSummaryCard.tsx

```tsx
"use client";

import {
  Flag,
  Route,
  UserCircle,
} from "lucide-react";
import { HealthScoreCard } from "@/components/dashboard/HealthScoreCard";
import { MiniLattice } from "@/components/dashboard/MiniLattice";
import type { DashboardHeaderModel } from "@/lib/v2/dashboard-architecture";
import type { ProfileRow } from "@/lib/v2/dashboard-redesign";
import type { DashboardLatticeCell } from "@/lib/v2/dashboard-data";
import { cn } from "@/lib/utils";

function rowStatusClass(status?: ProfileRow["status"]): string {
  if (status === "strong") return "text-[#5FD65F]";
  if (status === "developing") return "text-amber-600";
  if (status === "needs_attention") return "text-red-600";
  return "text-cx-forest-dark";
}

function formatTrackTitle(tracks: string[] | null | undefined): string {
  if (!tracks?.length) return "Set direction";
  return [...new Set(tracks.map((t) => t.trim()).filter(Boolean))].join(" · ");
}

function SummaryMiniCard({
  icon: Icon,
  label,
  value,
  trailing,
  subtext,
}: {
  icon: typeof Route;
  label: string;
  value: string;
  trailing?: React.ReactNode;
  subtext?: string;
}) {
  return (
    <div className="cx-dashboard-subpanel rounded-lg border border-cx-forest-dark/10 bg-cx-forest-dark/[0.03] p-2.5">
      <div className="flex items-start gap-2">
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-cx-forest-dark/10 text-cx-forest-dark"
          aria-hidden
        >
          <Icon size={14} strokeWidth={2} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-medium uppercase tracking-wide text-cx-forest-dark/70">
            {label}
          </p>
          <div className="mt-0.5 flex items-center gap-1">
            <p className="line-clamp-2 text-xs font-semibold text-cx-forest-dark">{value}</p>
            {trailing}
          </div>
          {subtext && (
            <p className="mt-0.5 text-[10px] text-cx-forest-dark/60">{subtext}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCell({ row }: { row: ProfileRow }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-medium text-cx-forest-dark/70">{row.label}</dt>
      <dd className={cn("mt-0.5 text-xs font-semibold", rowStatusClass(row.status))}>
        {row.value}
      </dd>
    </div>
  );
}

export function ProfileSummaryCard({
  rows,
  tracks,
  header,
  nextMilestone,
  latticeCells = [],
  className,
}: {
  rows: ProfileRow[];
  tracks?: string[] | null;
  header: DashboardHeaderModel;
  nextMilestone: string | null;
  latticeCells?: DashboardLatticeCell[];
  className?: string;
}) {
  const byId = Object.fromEntries(rows.map((row) => [row.id, row]));
  const direction = byId.direction;
  const fulfillment = byId.fulfillment;
  const strain = byId.strain;
  const alignment = byId.alignment;
  const progress = byId.progress;
  const status = byId.status;

  return (
    <div className={cn("cx-dashboard-panel rounded-xl bg-white p-3 shadow-sm", className)}>
      <div className="flex items-start gap-2.5">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cx-forest-dark/10 text-cx-forest-dark"
          aria-hidden
        >
          <UserCircle size={16} strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-cx-forest-dark">Profile</h3>
        </div>
      </div>

      {(direction || strain || fulfillment || alignment || progress || status) && (
        <dl className="mt-3 grid grid-cols-3 gap-x-3 gap-y-2">
          {direction ? <MetricCell row={direction} /> : <div aria-hidden />}
          {strain ? <MetricCell row={strain} /> : <div aria-hidden />}
          <div aria-hidden />

          {fulfillment ? <MetricCell row={fulfillment} /> : <div aria-hidden />}
          {alignment ? <MetricCell row={alignment} /> : <div aria-hidden />}
          <div aria-hidden />

          {progress ? <MetricCell row={progress} /> : <div aria-hidden />}
          {status ? <MetricCell row={status} /> : <div aria-hidden />}
          <div aria-hidden />
        </dl>
      )}

      <div className="mt-3 grid items-start gap-3 sm:grid-cols-2">
        <HealthScoreCard header={header} />
        <MiniLattice cells={latticeCells} compact showHeader />
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <SummaryMiniCard
          icon={Route}
          label={tracks && tracks.length > 1 ? "Tracks" : "Track"}
          value={formatTrackTitle(tracks)}
        />
        <SummaryMiniCard
          icon={Flag}
          label="Next milestone"
          value={nextMilestone ?? "None due"}
          subtext={
            header.nextCheckIn ? `Check-in: ${header.nextCheckIn}` : undefined
          }
        />
      </div>
    </div>
  );
}

```

## src/components/dashboard/TouchpointProgressStrip.tsx

```tsx
"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TouchpointBarState } from "@/lib/v2/dashboard-redesign";

const SEGMENT_LABELS = ["1", "2", "3", "4", "5", "6", "7"];

function segmentClass(state: TouchpointBarState): string {
  if (state === "done") return "bg-[#5FD65F]";
  if (state === "active") {
    return "bg-white ring-1 ring-[#5FD65F]/60 ring-offset-1 ring-offset-cx-forest-dark/80";
  }
  return "bg-white/20";
}

export function TouchpointProgressStrip({
  states,
  href = "/app/assessment",
}: {
  states: TouchpointBarState[];
  href?: string;
}) {
  const completed = states.filter((s) => s === "done").length;
  const hasActive = states.some((s) => s === "active");
  const destination =
    href === "/app/subjective" ? "Perspective for check-ins" : "Insights for touchpoint status";

  return (
    <Link
      href={href}
      className="block rounded-lg transition-opacity hover:opacity-90"
      aria-label={`7 Touch Points progress — open ${destination}`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] font-medium uppercase tracking-wide text-white/70">
          7 Touch Points
        </p>
        <p className="inline-flex items-center gap-0.5 text-[10px] font-medium text-white/60">
          {completed} of 7
          {hasActive && (
            <>
              <span className="text-white/40">·</span>
              <span className="text-[#5FD65F]">Check-in due</span>
            </>
          )}
          <ChevronRight size={12} className="text-white/50" />
        </p>
      </div>
      <div
        className="mt-2 grid grid-cols-7 gap-1"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={7}
        aria-valuenow={completed}
      >
        {states.map((state, i) => (
          <div
            key={SEGMENT_LABELS[i]}
            className={cn("h-2 rounded-full transition-colors", segmentClass(state))}
            title={`Touch point ${SEGMENT_LABELS[i]}`}
          />
        ))}
      </div>
    </Link>
  );
}

```

## src/components/lattice/LatticeGrid.tsx

```tsx
"use client";

import { Fragment, useState } from "react";
import { DOMAINS, TRACKS, type LatticeCellState } from "@/lib/constants";
import { cn, energyCellClass } from "@/lib/utils";
import { Card } from "@/components/ui/Card";

export function LatticeGrid({ cells }: { cells: LatticeCellState[] }) {
  const [selected, setSelected] = useState<LatticeCellState | null>(null);

  function getCell(d: number, t: number) {
    return (
      cells.find((c) => c.domainIndex === d && c.trackIndex === t) ?? {
        domainIndex: d,
        trackIndex: t,
        activityCount: 0,
        energy: null,
      }
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-cx-forest-dark/70">
        Your career pattern:{" "}
        <strong className="text-cx-forest-dark">
          Clinician-Educator with Emerging Systems Leadership
        </strong>
      </p>
      <div className="overflow-x-auto">
        <div
          className="inline-grid gap-1"
          style={{
            gridTemplateColumns: `120px repeat(${TRACKS.length}, minmax(48px, 1fr))`,
          }}
        >
          <div />
          {TRACKS.map((track) => (
            <div
              key={track}
              className="px-1 py-2 text-center text-[10px] font-semibold leading-tight text-cx-forest-dark/60"
            >
              {track.split("/")[0]}
            </div>
          ))}
          {DOMAINS.map((domain, di) => (
            <Fragment key={domain}>
              <div className="flex items-center pr-2 text-right text-[10px] font-medium text-cx-forest-dark/60">
                {domain.split(" ")[0]}
              </div>
              {TRACKS.map((_, ti) => {
                const cell = getCell(di, ti);
                return (
                  <button
                    key={`${di}-${ti}`}
                    type="button"
                    onClick={() => setSelected(cell)}
                    title={`${domain} × ${TRACKS[ti]}: ${cell.activityCount} activities`}
                    className={cn(
                      "flex h-12 min-w-12 items-center justify-center rounded-lg border text-xs font-semibold transition-shadow hover:border-cx-forest-dark hover:shadow-md",
                      energyCellClass(cell.energy, cell.activityCount),
                    )}
                  >
                    {cell.activityCount > 0 ? cell.activityCount : ""}
                  </button>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>

      {selected && selected.activityCount > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-cx-forest-dark">
            {DOMAINS[selected.domainIndex]} × {TRACKS[selected.trackIndex]}
          </h3>
          <p className="mt-2 text-sm text-cx-forest-dark/70">
            {selected.activityCount} activities · Energy:{" "}
            {selected.energy?.replace("_", " ") ?? "mixed"}
          </p>
          <p className="mt-4 text-sm text-cx-forest-dark/80">
            Log activities through Mak or Career Data → Activities to populate live lattice data.
          </p>
        </Card>
      )}
    </div>
  );
}

```

## src/components/layout/AcademicSoapSectionGate.tsx

```tsx
"use client";

import { useEffect, useState } from "react";
import { SectionGateEntry } from "@/components/layout/SectionGateEntry";
import { academicSectionGateGreeting } from "@/lib/v2/academic-profiles";
import type { MakFlowIntent } from "@/lib/mak-sections";
import type { PracticeSetting, CareerStage, AcademicRank } from "@/lib/v2/onboarding-options";

const SECTION_MAP: Partial<
  Record<MakFlowIntent, "subjective" | "objective" | "assessment" | "plan" | "output">
> = {
  discuss: "subjective",
  review: "objective",
  assess: "assessment",
  plan: "plan",
  create: "output",
};

export function AcademicSoapSectionGate({
  intent,
  enabled = true,
}: {
  intent: MakFlowIntent;
  enabled?: boolean;
}) {
  const [greeting, setGreeting] = useState<string | undefined>();

  useEffect(() => {
    if (!enabled) return;
    void (async () => {
      try {
        const [profileRes, meRes] = await Promise.all([
          fetch("/api/v1/onboarding/touchpoint1"),
          fetch("/api/v1/users/me"),
        ]);
        const profile = await profileRes.json();
        const me = await meRes.json();
        const section = SECTION_MAP[intent];
        if (!section) return;
        const text = academicSectionGateGreeting({
          section,
          displayName: me.name ?? me.email ?? "there",
          profile: {
            setting: profile.practice_setting as PracticeSetting | null,
            level: profile.career_stage as CareerStage | null,
            rank: profile.academic_rank as AcademicRank | null,
            track: profile.primary_career_track,
          },
        });
        setGreeting(text);
      } catch {
        setGreeting(undefined);
      }
    })();
  }, [intent, enabled]);

  if (!enabled) return null;
  return <SectionGateEntry intent={intent} customGreeting={greeting} />;
}

```

## src/components/layout/AnalyticsProvider.tsx

```tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { AnalyticsDashboard } from "@/lib/v2/types";
import { fetchDashboardWithTouchpoints } from "@/lib/v2/touchpoint-fetch";

type AnalyticsContextValue = {
  analytics: AnalyticsDashboard | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const AnalyticsContext = createContext<AnalyticsContextValue | null>(null);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [analytics, setAnalytics] = useState<AnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const result = await fetchDashboardWithTouchpoints();
    setAnalytics(result.analytics);
    setError(result.error);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const onRefresh = () => void refresh();
    window.addEventListener("fiscmak:touchpoint-complete", onRefresh);
    window.addEventListener("fiscmak:activity-logged", onRefresh);
    window.addEventListener("fiscmak:goals-updated", onRefresh);
    return () => {
      window.removeEventListener("fiscmak:touchpoint-complete", onRefresh);
      window.removeEventListener("fiscmak:activity-logged", onRefresh);
      window.removeEventListener("fiscmak:goals-updated", onRefresh);
    };
  }, [refresh]);

  const value = useMemo(
    () => ({ analytics, loading, error, refresh }),
    [analytics, loading, error, refresh],
  );

  return (
    <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>
  );
}

export function useAnalytics(): AnalyticsContextValue {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) {
    throw new Error("useAnalytics must be used within AnalyticsProvider");
  }
  return ctx;
}

/** Optional hook for panels that mount outside the provider during tests. */
export function useAnalyticsOptional(): AnalyticsContextValue | null {
  return useContext(AnalyticsContext);
}

```

## src/components/layout/AppShell.tsx

```tsx
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
    touchpoint?: MakFlowTouchpoint;
    goalFlow?: "set" | "modify";
    goalModifyId?: string;
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
      touchpoint?: MakFlowTouchpoint,
      goalFlow?: "set" | "modify",
      goalModifyId?: string,
      autoMessage?: string,
    ) => {
      const greeting = customGreeting ?? MAK_FLOW_GREETINGS[intent];
      setPendingFlow({ intent, greeting, touchpoint, goalFlow, goalModifyId });
      setFlowNonce((n) => n + 1);
      if (autoMessage?.trim()) setPendingInitialMessage(autoMessage.trim());
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
      <div className="flex h-screen overflow-hidden bg-cx-forest-dark">
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
        <LayOfTheLandTour open={tourOpen} onClose={() => setTourOpen(false)} />
        <div className="cx-main-shell flex min-w-0 flex-1 flex-col">
          <TopNavBar />
          <AnalyticsProvider>
            <main className="min-h-0 flex-1 overflow-auto bg-cx-page-muted p-4 md:p-8">
              {children}
            </main>
          </AnalyticsProvider>
        </div>
      </div>
    </AppShellContext.Provider>
  );
}

```

## src/components/layout/EscalationResourcesPanel.tsx

```tsx
"use client";

import Link from "next/link";
import { AlertTriangle, Phone } from "lucide-react";
import type { MakEscalation } from "@/lib/v2/escalation-protocols";
import { CRISIS_RESOURCES } from "@/lib/v2/escalation-protocols";

type EscalationResourcesPanelProps = {
  escalation: MakEscalation;
};

export function EscalationResourcesPanel({ escalation }: EscalationResourcesPanelProps) {
  const isCrisis = escalation.trigger === "crisis_language";

  return (
    <div
      className={`mx-2 mb-3 rounded-xl border p-4 ${
        isCrisis ? "cx-alert-banner" : "border-white/20 bg-white/95"
      }`}
    >
      <div className="flex items-start gap-2">
        {isCrisis ? (
          <Phone className="mt-0.5 shrink-0 text-cx-attention" size={18} />
        ) : (
          <AlertTriangle className="mt-0.5 shrink-0 text-amber-600" size={18} />
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-cx-forest-dark/70">
            {isCrisis ? "Crisis support" : "Professional support recommended"}
          </p>
          <p className="mt-1 text-sm text-cx-forest-dark">{escalation.message}</p>
          {isCrisis && (
            <ul className="mt-3 space-y-2">
              {CRISIS_RESOURCES.map((r) => (
                <li key={r.label} className="text-sm text-cx-forest-dark/80">
                  <span className="font-medium text-cx-forest-dark">{r.label}</span>
                  <span className="text-cx-forest-dark/70"> — {r.detail}</span>
                </li>
              ))}
            </ul>
          )}
          {escalation.suggestedActions && escalation.suggestedActions.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {escalation.suggestedActions.map((a) =>
                a.url.startsWith("http") ? (
                  <a
                    key={a.action}
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-cx-forest-dark/20 bg-white px-3 py-1 text-xs font-medium text-cx-forest-dark hover:bg-cx-forest-dark/5"
                  >
                    {a.action}
                  </a>
                ) : (
                  <Link
                    key={a.action}
                    href={a.url}
                    className="rounded-full border border-cx-forest-dark/20 bg-white px-3 py-1 text-xs font-medium text-cx-forest-dark hover:bg-cx-forest-dark/5"
                  >
                    {a.action}
                  </Link>
                ),
              )}
            </div>
          )}
          {escalation.pauseCareerCoaching && !isCrisis && (
            <p className="mt-2 text-xs text-cx-forest-dark/70">
              Career-focused coaching is paused until you acknowledge these resources.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

```

## src/components/layout/IconSidebar.tsx

```tsx
"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppShell } from "@/components/layout/AppShell";
import { CoachMakMark } from "@/components/brand/CoachMakMark";

/** Slim left rail — Coach Mak toggle; full-height forest green column. */
export function IconSidebar() {
  const { makOpen, toggleMak } = useAppShell();

  return (
    <aside className="cx-forest-sidebar relative flex h-full w-14 shrink-0 flex-col">
      <div className="relative flex h-14 shrink-0 items-center justify-center border-b border-white/10">
        <button
          type="button"
          onClick={toggleMak}
          aria-expanded={makOpen}
          title={makOpen ? "Collapse Coach Mak" : "Open Coach Mak"}
          aria-label={makOpen ? "Collapse Coach Mak" : "Open Coach Mak"}
          className={cn(
            "rounded-xl p-1 transition-colors hover:bg-white/10",
            makOpen && "bg-white/15 ring-1 ring-white/25",
          )}
        >
          <CoachMakMark size={32} className={cn(!makOpen && "opacity-95")} />
        </button>

        <button
          type="button"
          onClick={toggleMak}
          aria-expanded={makOpen}
          title={makOpen ? "Collapse Coach Mak" : "Open Coach Mak"}
          aria-label={makOpen ? "Collapse Coach Mak panel" : "Open Coach Mak panel"}
          className={cn(
            "absolute left-14 top-1/2 z-50 flex h-9 w-6 -translate-y-1/2 items-center justify-center",
            "rounded-r-md border border-l-0 border-white/20 bg-cx-forest-dark text-white/80 shadow-sm",
            "transition-colors hover:bg-white/10 hover:text-white",
            !makOpen && "border-l border-l-white/30 text-white",
          )}
        >
          {makOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>
    </aside>
  );
}

```

## src/components/layout/MakPanel.tsx

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Maximize2, Minimize2, Paperclip, PanelRightClose, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/lib/use-media-query";
import {
  MAK_SECTION_CONFIG,
  MAK_INPUT_PLACEHOLDER,
  makContextLabel,
  type AppSection,
  type MakFlowIntent,
} from "@/lib/mak-sections";
import { buildDashboardGreeting } from "@/lib/mak-greeting";
import { buildSectionGateGreeting } from "@/lib/mak-chatbot-states";
import { isClientDemoMode } from "@/lib/demo-mode";
import {
  loadConversation,
  saveConversation,
  seedConversation,
  resetConversationGreeting,
  type MakMessage,
} from "@/lib/mak-conversations";
import { EscalationResourcesPanel } from "@/components/layout/EscalationResourcesPanel";
import type { MakEscalation } from "@/lib/v2/escalation-protocols";
import { useAppShell } from "@/components/layout/AppShell";
import {
  DASHBOARD_MECE_OPTIONS,
} from "@/lib/v2/dashboard-mak-menu";
import { resolveSectionQuickAction, type SectionQuickAction } from "@/lib/v2/section-mak-routes";
import { buildGoalSettingIntro, goalSettingSuggestedActions, planMakQuickActions } from "@/lib/v2/goal-setting-mak-flow";
import { PLAN_MAK } from "@/lib/card-mak-prompts";
import { CoachMakMark } from "@/components/brand/CoachMakMark";
import { MakHexMicButton } from "@/components/brand/MakHexMicButton";

type MakPanelProps = {
  open: boolean;
  pendingFlow: {
    intent: MakFlowIntent;
    greeting: string;
    touchpoint?: import("@/components/layout/AppShell").MakFlowTouchpoint;
    goalFlow?: "set" | "modify";
    goalModifyId?: string;
  } | null;
  flowNonce: number;
  onFlowHandled: () => void;
  onClose: () => void;
  onboardingActive?: boolean;
  onOpenTour?: () => void;
  initialMessage?: string | null;
  onInitialMessageHandled?: () => void;
};

function formatMessageTime(iso?: string): string {
  const d = iso ? new Date(iso) : new Date();
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function isLastInAssistantRun(messages: MakMessage[], index: number): boolean {
  const msg = messages[index];
  if (msg.role !== "assistant") return false;
  return messages[index + 1]?.role !== "assistant";
}
function greetingForSection(
  section: AppSection,
  displayName: string | null,
): string {
  if (section === "dashboard") {
    return buildDashboardGreeting(displayName);
  }
  return buildSectionGateGreeting({ section, displayName });
}

export function MakPanel({
  open,
  pendingFlow,
  flowNonce,
  onFlowHandled,
  onClose,
  onboardingActive = false,
  onOpenTour,
  initialMessage,
  onInitialMessageHandled,
}: MakPanelProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const { section, makInputRef, displayName, startMakFlow, focusMakInput } = useAppShell();
  const config = MAK_SECTION_CONFIG[section];
  const [messages, setMessages] = useState<MakMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [suggestedActions, setSuggestedActions] = useState<{ action: string; url: string }[]>([]);
  const [activeEscalation, setActiveEscalation] = useState<MakEscalation | null>(null);
  const [touchpointMode, setTouchpointMode] = useState<
    import("@/components/layout/AppShell").MakFlowTouchpoint | null
  >(null);
  const [activeFlowIntent, setActiveFlowIntent] = useState<MakFlowIntent | null>(null);
  const [goalFlowActive, setGoalFlowActive] = useState<"set" | "modify" | null>(null);
  const [goalModifyId, setGoalModifyId] = useState<string | null>(null);
  const [goalsConfirmed, setGoalsConfirmed] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const prevSection = useRef<AppSection | null>(null);

  useEffect(() => {
    if (!open) setExpanded(false);
  }, [open]);

  function handleClose() {
    setExpanded(false);
    onClose();
  }

  useEffect(() => {
    if (!open || isClientDemoMode()) return;
    fetch(`/api/v1/chat/history?limit=40&section=${section}`)
      .then((r) => r.json())
      .then((d) => {
        const apiMessages = (d.messages ?? []) as {
          role: "user" | "assistant";
          content: string;
        }[];
        if (apiMessages.length > 0) {
          setMessages(apiMessages);
        }
      })
      .catch(() => undefined);
  }, [open, section]);

  useEffect(() => {
    if (section !== "plan" || isClientDemoMode()) return;
    fetch("/api/v1/goals")
      .then((r) => r.json())
      .then((d) => setGoalsConfirmed(Boolean(d.goals_confirmed)))
      .catch(() => undefined);

    const onGoalsUpdated = () => {
      fetch("/api/v1/goals")
        .then((r) => r.json())
        .then((d) => setGoalsConfirmed(Boolean(d.goals_confirmed)))
        .catch(() => undefined);
    };
    window.addEventListener("fiscmak:goals-updated", onGoalsUpdated);
    return () => window.removeEventListener("fiscmak:goals-updated", onGoalsUpdated);
  }, [section]);

  useEffect(() => {
    const greeting = greetingForSection(section, displayName);
    if (prevSection.current !== section) {
      prevSection.current = section;
      if (isClientDemoMode()) {
        const stored = loadConversation(section);
        if (stored.length > 0) {
          setMessages(stored);
        } else {
          setMessages(seedConversation(section, greeting));
        }
      } else {
        setMessages((current) =>
          current.length === 0
            ? [{ role: "assistant", content: greeting }]
            : current,
        );
      }
      setInput("");
      setSuggestedActions([]);
    } else if (section === "dashboard" && displayName && isClientDemoMode()) {
      setMessages((current) => {
        if (current.length === 0) {
          return seedConversation(section, greeting);
        }
        if (current[0]?.role === "assistant") {
          const next = [{ role: "assistant" as const, content: greeting }, ...current.slice(1)];
          saveConversation(section, next);
          return next;
        }
        return current;
      });
    }
  }, [section, displayName]);

  useEffect(() => {
    if (!pendingFlow) return;
    if (pendingFlow.greeting === "__welcome__") {
      setLoading(true);
      fetch("/api/v1/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "__welcome__",
          context: { section, onboarding: true, touchpoint_number: 1 },
        }),
      })
        .then((r) => r.json())
        .then((data) => {
          setMessages([{ role: "assistant", content: data.response }]);
          setSuggestedActions(data.suggested_actions ?? []);
        })
        .catch(() => {
          setMessages([{ role: "assistant", content: "Welcome — I'm Coach Mak." }]);
        })
        .finally(() => {
          setLoading(false);
          onFlowHandled();
        });
      setInput("");
      return;
    }
    const next = resetConversationGreeting(section, pendingFlow.greeting);
    setMessages(next);
    setTouchpointMode(pendingFlow.touchpoint ?? null);
    setActiveFlowIntent(pendingFlow.intent);
    setGoalFlowActive(pendingFlow.goalFlow ?? null);
    setGoalModifyId(pendingFlow.goalModifyId ?? null);
    if (section === "plan" && pendingFlow.goalFlow === "set") {
      setSuggestedActions(goalSettingSuggestedActions(null, 0));
    } else if (section === "plan" && pendingFlow.goalFlow === "modify") {
      setSuggestedActions(goalSettingSuggestedActions(
        { mode: "modify", step_index: 1, started_at: new Date().toISOString(), modify_goal_id: pendingFlow.goalModifyId },
        1,
      ));
    } else if (section === "plan" && pendingFlow.touchpoint) {
      setSuggestedActions(planMakQuickActions(true));
    } else if (section === "plan") {
      setSuggestedActions([]);
    }
    setInput("");
    onFlowHandled();
  }, [flowNonce, pendingFlow, section, onFlowHandled]);

  useEffect(() => {
    if (!open || !initialMessage?.trim()) return;
    const msg = initialMessage.trim();
    onInitialMessageHandled?.();
    void sendMessage(msg);
  }, [initialMessage]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, loading]);

  useEffect(() => {
    if (messages.length > 0 && isClientDemoMode()) {
      saveConversation(section, messages);
    }
  }, [messages, section]);

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return;
    const userMsg = text.trim();
    setInput("");
    const history = messages;
    const now = new Date().toISOString();
    const nextMessages: MakMessage[] = [
      ...history,
      { role: "user", content: userMsg, at: now },
    ];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/v1/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          history: history.slice(-8),
          context: {
            section,
            touchpoint_number: section === "assessment" ? 3 : 1,
            onboarding: onboardingActive,
            annual_refresh: touchpointMode === "annual",
            quarterly_pulse: touchpointMode === "quarterly",
            flow_intent: activeFlowIntent ?? undefined,
            goal_setting: goalFlowActive != null,
            goal_flow: goalFlowActive ?? undefined,
            goal_modify_id: goalModifyId ?? undefined,
          },
        }),
      });
      const data = await res.json();
      setSuggestedActions(data.suggested_actions ?? []);
      if (data.touchpoint_submitted) {
        setTouchpointMode(null);
        window.dispatchEvent(new CustomEvent("fiscmak:touchpoint-complete"));
      }
      if (data.activity_captured) {
        window.dispatchEvent(new CustomEvent("fiscmak:activity-logged"));
        if (activeFlowIntent === "capture") {
          setActiveFlowIntent(null);
        }
      }
      if (data.goals_updated) {
        window.dispatchEvent(new CustomEvent("fiscmak:goals-updated"));
        if (goalFlowActive && data.goals) {
          setGoalFlowActive(null);
          setGoalModifyId(null);
          setGoalsConfirmed(true);
        }
      }
      if (data.escalation?.trigger) {
        setActiveEscalation({
          trigger: data.escalation.trigger,
          action: data.escalation.action,
          pauseChatbot: data.escalation.pause_chatbot,
          pauseCareerCoaching: data.escalation.pause_career_coaching,
          message: data.escalation.message ?? "Professional support resources are available.",
          suggestedActions: data.suggested_actions,
        });
      } else {
        setActiveEscalation(null);
      }
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            data.response ??
            "Thanks for sharing. I'm here to help with your career journey.",
          at: new Date().toISOString(),
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "I heard you. For now I'm in demo mode — add ANTHROPIC_API_KEY to enable Claude-powered Mak.",
          at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function transcribeWithWhisper(blob: Blob): Promise<string | null> {
    try {
      const form = new FormData();
      form.append("audio", blob, "capture.webm");
      const res = await fetch("/api/v1/voice/transcribe", { method: "POST", body: form });
      if (!res.ok) return null;
      const data = (await res.json()) as { text?: string };
      return data.text?.trim() || null;
    } catch {
      return null;
    }
  }

  async function recordWithWhisper(): Promise<string | null> {
    if (!navigator.mediaDevices?.getUserMedia) return null;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      return await new Promise((resolve) => {
        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };
        recorder.onstop = async () => {
          stream.getTracks().forEach((t) => t.stop());
          const blob = new Blob(chunks, { type: recorder.mimeType || "audio/webm" });
          resolve(await transcribeWithWhisper(blob));
        };
        recorder.onerror = () => {
          stream.getTracks().forEach((t) => t.stop());
          resolve(null);
        };
        setRecording(true);
        recorder.start();
        setTimeout(() => {
          if (recorder.state === "recording") recorder.stop();
          setRecording(false);
        }, 5000);
      });
    } catch {
      return null;
    }
  }

  function handleVoice() {
    type SpeechCtor = new () => {
      lang: string;
      interimResults: boolean;
      onresult: ((event: { results: { [i: number]: { [j: number]: { transcript: string } } } }) => void) | null;
      onerror: (() => void) | null;
      onend: (() => void) | null;
      start: () => void;
    };

    const win = window as Window & {
      SpeechRecognition?: SpeechCtor;
      webkitSpeechRecognition?: SpeechCtor;
    };

    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

    void (async () => {
      const whisperText = await recordWithWhisper();
      if (whisperText) {
        void sendMessage(whisperText);
        return;
      }

      if (!SpeechRecognition) {
        void sendMessage("I'd like to share how I'm feeling today.");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      setRecording(true);

      recognition.onresult = (event) => {
        const transcript = event.results[0]?.[0]?.transcript ?? "";
        setRecording(false);
        if (transcript) void sendMessage(transcript);
      };

      recognition.onerror = () => setRecording(false);
      recognition.onend = () => setRecording(false);
      recognition.start();
    })();
  }

  function applySectionQuickAction(action: SectionQuickAction) {
    startMakFlow(
      action.intent,
      action.href,
      action.message,
      action.touchpoint,
    );
    if (action.href && action.href !== "/app/dashboard") {
      router.push(action.href);
    }
    if (action.focusInput) {
      focusMakInput();
    }
  }

  function handleDashboardMeceOption(option: (typeof DASHBOARD_MECE_OPTIONS)[number]) {
    applySectionQuickAction({
      intent: option.intent,
      message: option.message,
      href: option.href,
      focusInput: option.focusInput,
    });
  }

  function startPlanGoalSetup() {
    setGoalFlowActive("set");
    setGoalModifyId(null);
    setTouchpointMode(null);
    setActiveFlowIntent("plan");
    const intro = buildGoalSettingIntro();
    setMessages(resetConversationGreeting(section, intro));
    setSuggestedActions(goalSettingSuggestedActions(null, 0));
  }

  function startPlanReview(quarterly: boolean) {
    startMakFlow(
      "plan",
      undefined,
      quarterly
        ? "Let's review milestone progress on your three career goals this quarter."
        : "Let's review your annual goals and reset for the year ahead.",
      quarterly ? "quarterly" : "annual",
      undefined,
      undefined,
      quarterly ? PLAN_MAK.review.autoMessage : "Begin annual goal review.",
    );
  }

  function handleQuickOptionClick(label: string, url = "") {
    if (url === "#tour" || label.includes("Lay of the Land")) {
      onOpenTour?.();
      return;
    }
    if (url && url.startsWith("/")) {
      router.push(url);
      return;
    }
    if (section === "plan") {
      if (
        label === "Set up with Mak" ||
        label === "Set goals with Mak" ||
        label === "Begin Development Goal"
      ) {
        startPlanGoalSetup();
        if (label === "Begin Development Goal") {
          void sendMessage(label);
        }
        return;
      }
      if (
        label === "Review with Mak" ||
        label === "Review goal progress" ||
        label === "Begin quarterly review"
      ) {
        startPlanReview(true);
        return;
      }
      if (label === "Edit in template") {
        router.push("/app/plan");
        return;
      }
    }
    const routed = resolveSectionQuickAction(section, label);
    if (routed) {
      applySectionQuickAction(routed);
      return;
    }
    void sendMessage(label);
  }

  const planQuickActions =
    section === "plan"
      ? suggestedActions.length > 0
        ? suggestedActions
        : goalFlowActive
          ? goalSettingSuggestedActions(null, 0)
          : planMakQuickActions(goalsConfirmed)
      : [];

  const quickActionItems =
    section === "dashboard"
      ? DASHBOARD_MECE_OPTIONS.map((o) => ({
          key: o.id,
          label: o.label,
          onClick: () => handleDashboardMeceOption(o),
        }))
      : section === "plan"
        ? planQuickActions.map((item) => ({
            key: item.action,
            label: item.action,
            onClick: () => handleQuickOptionClick(item.action, item.url),
          }))
        : suggestedActions.length > 0
          ? suggestedActions.map((item) => ({
              key: item.action,
              label: item.action,
              onClick: () => handleQuickOptionClick(item.action, item.url),
            }))
          : config.quickOptions.map((label) => ({
              key: label,
              label,
              onClick: () => handleQuickOptionClick(label),
            }));

  const makQuickPillClass =
    "cx-forest-pill disabled:opacity-50";

  return (
    <>
      {open && isMobile && !expanded && (
        <button
          type="button"
          className="fixed inset-y-0 right-0 z-40 bg-black/40 md:hidden"
          style={{ left: "min(calc(3.5rem + 320px), 100vw)" }}
          aria-label="Close Coach Mak"
          onClick={handleClose}
        />
      )}
      {open && expanded && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40"
          aria-label="Close Coach Mak"
          onClick={handleClose}
        />
      )}
      <aside
        className={cn(
          "cx-mak-panel flex shrink-0 flex-col overflow-hidden border-r transition-[width,transform] duration-200 ease-in-out",
          expanded
            ? cn(
                "fixed inset-0 z-50 w-full border-r-0 shadow-2xl",
                open ? "translate-x-0" : "pointer-events-none translate-x-full",
              )
            : isMobile
              ? cn(
                  "fixed left-14 top-0 z-50 h-full w-[320px] max-w-[calc(100vw-3.5rem)]",
                  open ? "translate-x-0" : "pointer-events-none -translate-x-full",
                )
              : cn(
                  "relative h-full border-l border-white/10",
                  open ? "w-[320px]" : "pointer-events-none w-0 border-l-0",
                ),
        )}
        aria-hidden={!open}
      >
        <div className={cn("flex h-full flex-col", !expanded && !isMobile && "min-w-[320px]", expanded && "min-w-0")}>
          <header className="cx-mak-panel-header shrink-0 border-b border-white/10">
            <div className="flex h-14 items-center justify-between gap-2 px-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="rounded-xl bg-white/10 p-1 ring-1 ring-white/15">
                  <CoachMakMark size={28} />
                </div>
                <p className="truncate text-base font-semibold text-white">Coach Mak</p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => setExpanded((v) => !v)}
                  className="cx-mak-panel-icon-btn flex h-9 w-9 items-center justify-center rounded-xl transition-colors"
                  aria-label={expanded ? "Exit full screen" : "Full screen"}
                  title={expanded ? "Exit full screen" : "Full screen"}
                >
                  {expanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="cx-mak-panel-icon-btn flex h-9 w-9 items-center justify-center rounded-xl transition-colors"
                  aria-label="Close Coach Mak"
                >
                  <X size={18} />
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="cx-mak-panel-icon-btn flex h-9 w-9 items-center justify-center rounded-xl transition-colors"
                  aria-label="Collapse Coach Mak panel"
                >
                  <PanelRightClose size={18} />
                </button>
              </div>
            </div>
            <p className="cx-mak-panel-context text-center text-xs">
              {makContextLabel(section)}
            </p>
          </header>

        <div
          ref={scrollRef}
          className="cx-mak-panel-chat flex-1 space-y-4 overflow-y-auto px-4 py-4"
        >
        {activeEscalation && <EscalationResourcesPanel escalation={activeEscalation} />}
        {messages.map((msg, i) => {
          const showAvatar =
            msg.role === "assistant" && messages[i - 1]?.role !== "assistant";
          const showTimestamp = isLastInAssistantRun(messages, i);

          if (msg.role === "assistant") {
            return (
              <div key={`${i}-${msg.content.slice(0, 12)}`} className="space-y-2">
                <div className="flex items-start gap-2.5">
                  {showAvatar ? (
                    <div className="mt-0.5 shrink-0">
                      <CoachMakMark size={28} />
                    </div>
                  ) : (
                    <div className="w-7 shrink-0" aria-hidden />
                  )}
                  <div className="max-w-[calc(100%-2.25rem)] whitespace-pre-line rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm leading-relaxed text-cx-forest-dark shadow-sm">
                    {msg.content}
                  </div>
                </div>
                {showTimestamp && (
                  <p className="ml-9 font-mono text-[11px] tracking-wide text-white/65">
                    {formatMessageTime(msg.at)}
                  </p>
                )}
              </div>
            );
          }

          return (
            <div key={`${i}-${msg.content.slice(0, 12)}`} className="flex justify-end">
              <div className="max-w-[85%] whitespace-pre-line rounded-2xl border border-white/15 bg-white/95 px-4 py-3 text-sm leading-relaxed text-cx-forest-dark">
                {msg.content}
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex items-start gap-2.5">
            <CoachMakMark size={28} />
            <p className="rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm text-cx-forest-dark/70 shadow-sm">
              Mak is thinking…
            </p>
          </div>
        )}
        </div>

        <div className="cx-mak-panel-footer shrink-0 border-t px-3 py-3">
        {quickActionItems.length > 0 && (
          <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
            {quickActionItems.slice(0, 6).map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={item.onClick}
                disabled={loading}
                className={makQuickPillClass}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/app/objective?tab=documents&upload=1")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white/85 transition-colors hover:bg-white/15 hover:text-white"
            aria-label="Attach document"
          >
            <Paperclip size={18} />
          </button>
          <button
            type="button"
            onClick={() => router.push("/app/objective?tab=vault")}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white/85 transition-colors hover:bg-white/15 hover:text-white"
            aria-label="Career data vault"
          >
            <Briefcase size={18} />
          </button>
          <input
            ref={makInputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void sendMessage(input);
              }
            }}
            placeholder={MAK_INPUT_PLACEHOLDER}
            disabled={loading || recording}
            className="cx-mak-panel-input h-11 min-h-11 flex-1 border-0 bg-transparent px-1 text-sm focus:outline-none"
            aria-label="Message to Coach Mak"
          />
          <MakHexMicButton
            recording={recording}
            disabled={loading}
            onClick={() => {
              if (input.trim()) {
                void sendMessage(input);
              } else {
                handleVoice();
              }
            }}
          />
        </div>
        </div>
        </div>
      </aside>
    </>
  );
}

```

## src/components/layout/PageShell.tsx

```tsx
import { cn } from "@/lib/utils";

type PageShellProps = {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  maxWidth?: "md" | "lg" | "xl" | "full";
};

const WIDTH = {
  md: "max-w-3xl",
  lg: "max-w-5xl",
  xl: "max-w-[1200px]",
  full: "max-w-[1400px]",
};

export function PageShell({
  title,
  subtitle,
  eyebrow,
  action,
  children,
  className,
  maxWidth = "xl",
}: PageShellProps) {
  return (
    <div className={cn("mx-auto w-full", WIDTH[maxWidth], className)}>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-xs font-medium uppercase tracking-wide text-cx-forest-dark/70">
              {eyebrow}
            </p>
          )}
          <h1 className="text-[32px] font-bold leading-snug text-cx-forest-dark">{title}</h1>
          {subtitle && (
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-cx-forest-dark/70">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </header>
      {children}
    </div>
  );
}

```

## src/components/layout/SectionGateEntry.tsx

```tsx
"use client";

import { useEffect, useRef } from "react";
import { useAppShell } from "@/components/layout/AppShell";
import type { MakFlowIntent } from "@/lib/mak-sections";
import { buildSectionGateGreeting } from "@/lib/mak-chatbot-states";

/** Triggers chatbot gate entry once when a SOAPO workspace mounts */
export function SectionGateEntry({
  intent,
  customGreeting,
}: {
  intent: MakFlowIntent;
  customGreeting?: string;
}) {
  const { startMakFlow, displayName } = useAppShell();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    const greeting =
      customGreeting ??
      buildSectionGateGreeting({ section: intentToSection(intent), displayName });
    startMakFlow(intent, undefined, greeting);
  }, [intent, customGreeting, displayName, startMakFlow]);

  return null;
}

function intentToSection(intent: MakFlowIntent) {
  switch (intent) {
    case "discuss":
      return "subjective" as const;
    case "review":
      return "objective" as const;
    case "assess":
      return "assessment" as const;
    case "plan":
      return "plan" as const;
    case "create":
      return "output" as const;
    default:
      return "dashboard" as const;
  }
}

```

## src/components/layout/ThemeProvider.tsx

```tsx
"use client";

import { useEffect } from "react";
import { applyTheme, getPreferredTheme } from "@/lib/theme-preference";

/** Applies saved theme on mount and keeps `dark` class in sync. */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    applyTheme(getPreferredTheme());
  }, []);

  return children;
}

```

## src/components/layout/TopNavBar.tsx

```tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Bell, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  SECTION_NAV,
  SECTION_TO_FLOW,
  sectionFromPath,
  type AppSection,
} from "@/lib/mak-sections";
import { useAppShell } from "@/components/layout/AppShell";
import { ProfileMenu } from "@/components/profile/ProfileMenu";
import { getPreferredTheme, setTheme, type ThemeMode } from "@/lib/theme-preference";

export function TopNavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { startMakFlow } = useAppShell();
  const current = sectionFromPath(pathname);
  const [theme, setThemeState] = useState<ThemeMode>("light");

  useEffect(() => {
    setThemeState(getPreferredTheme());
  }, []);

  function toggleDarkMode() {
    const next: ThemeMode = theme === "dark" ? "light" : "dark";
    setTheme(next);
    setThemeState(next);
  }

  function navigateSection(navSection: AppSection, href: string) {
    if (navSection === "dashboard") {
      router.push(href);
      return;
    }
    const intent = SECTION_TO_FLOW[navSection];
    startMakFlow(intent as "discuss" | "review" | "assess" | "plan" | "create", href);
  }

  return (
    <header className="cx-app-top-bar sticky top-0 z-20 px-4 py-3 md:px-5 md:py-3.5">
      <div className="mx-auto flex max-w-[1400px] items-center gap-2 md:gap-3">
        <nav className="cx-top-nav-strip" aria-label="Main">
          {SECTION_NAV.map(({ section: navSection, href, shortLabel }) => {
            const active = current === navSection;
            return (
              <button
                key={href}
                type="button"
                onClick={() => navigateSection(navSection, href)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "cx-top-nav-tab",
                  active ? "cx-top-nav-tab-active" : "cx-top-nav-tab-inactive",
                )}
              >
                {shortLabel}
              </button>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-0.5 md:gap-1">
          <button
            type="button"
            className="cx-app-top-bar-icon-btn flex h-9 w-9 items-center justify-center"
            aria-label="Notifications"
          >
            <Bell size={18} />
          </button>
          <button
            type="button"
            onClick={toggleDarkMode}
            className="cx-app-top-bar-icon-btn flex h-9 w-9 items-center justify-center"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            title={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <ProfileMenu />
        </div>
      </div>
    </header>
  );
}

```

## src/components/mak/MakChat.tsx

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type Message = { role: "user" | "assistant"; content: string };

const MAK_GREETING =
  "Hi — I'm Mak. Tell me about your practice right now. What's your specialty, what kind of work fills your days? And what matters most about the work you do?";

export function MakChat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: MAK_GREETING },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((m) => [...m, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/mak/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, history: messages }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            data.reply ??
            "Thanks for sharing. Connect your Claude API key in .env.local to enable full Mak conversations.",
        },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          content:
            "I heard you. For now I'm in demo mode — add ANTHROPIC_API_KEY to enable Claude-powered Mak.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="flex h-[calc(100vh-12rem)] flex-col p-0">
      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "bg-cx-forest-dark text-white"
                  : "border border-cx-forest-dark/10 bg-white text-cx-forest-dark"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <p className="text-sm text-cx-forest-dark/70">Mak is thinking…</p>
        )}
      </div>
      <div className="flex gap-2 border-t border-cx-forest-dark/15 p-4">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Share what's happening in your career…"
          className="min-h-11 flex-1 rounded-md border border-cx-forest-dark/20 bg-white px-4 py-2 text-cx-forest-dark focus:border-cx-forest-dark focus:outline-none"
          aria-label="Message to Mak"
        />
        <Button onClick={send} disabled={loading}>
          Send
        </Button>
      </div>
    </Card>
  );
}

```

## src/components/marketing/ConnectWithFiscmakHeading.tsx

```tsx
import { cn } from "@/lib/utils";

type ConnectWithFiscmakHeadingProps = {
  className?: string;
  as?: "h1" | "h2" | "p" | "span";
  size?: "xs" | "sm" | "md" | "lg";
};

const sizeClass = {
  xs: "text-base whitespace-nowrap md:text-lg",
  sm: "text-sm tracking-[0.2em] whitespace-nowrap",
  md: "text-3xl whitespace-nowrap md:text-4xl lg:text-5xl",
  lg: "text-4xl whitespace-nowrap md:text-5xl lg:text-6xl",
};

export function ConnectWithFiscmakHeading({
  className,
  as: Tag = "h2",
  size = "md",
}: ConnectWithFiscmakHeadingProps) {
  return (
    <Tag className={cn("font-futura-bold uppercase leading-tight", sizeClass[size], className)}>
      <span className="text-white">Connect with FISC</span>
      <span className="text-marketing-accent">MAK</span>
    </Tag>
  );
}

```

## src/components/marketing/ContactFormCard.tsx

```tsx
"use client";

import { useState, type FormEvent } from "react";
import { Check } from "lucide-react";
import { ConnectWithFiscmakHeading } from "@/components/marketing/ConnectWithFiscmakHeading";
import { cn } from "@/lib/utils";

type FormState = "idle" | "success" | "error";

export function ContactFormCard({ className }: { className?: string }) {
  const [formState, setFormState] = useState<FormState>("idle");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setFormState("idle");

    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const email = String(data.get("email") ?? "").trim();
    const question = String(data.get("question") ?? "").trim();

    if (!name || !email || !question || !email.includes("@")) {
      setFormState("error");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/v1/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, question }),
      });

      if (!response.ok) {
        setFormState("error");
        return;
      }

      setFormState("success");
      form.reset();
    } catch {
      setFormState("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={cn(
        "w-full max-w-[16rem] rounded-2xl bg-[#1a2419] px-4 py-5 sm:max-w-[17.5rem]",
        className,
      )}
    >
      <ConnectWithFiscmakHeading size="xs" />

      <p className="font-futura-condensed mt-2 text-[10px] leading-snug text-white/90 sm:text-[11px]">
        Your inquiries, ideas, and collaboration opportunities are just a click away.
        Let&apos;s start the conversation.
      </p>

      {formState === "success" ? (
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-[#d4f5c4] px-3 py-2.5 text-[#1a2419]">
          <Check size={14} strokeWidth={2.5} className="mt-0.5 shrink-0" aria-hidden />
          <p className="font-futura-medium text-[10px] leading-snug sm:text-[11px]">
            Successfully submitted. Stay tuned.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-2.5">
          <div>
            <label htmlFor="contact-name" className="font-futura-condensed mb-1 block text-[10px] text-white">
              Full Name
            </label>
            <input
              id="contact-name"
              name="name"
              type="text"
              required
              autoComplete="name"
              placeholder="Coach Mak"
              className="w-full rounded-lg border border-white/20 bg-[#0f1410] px-2.5 py-1.5 text-[10px] text-white placeholder:text-white/35 focus:border-marketing-accent focus:outline-none sm:text-[11px]"
            />
          </div>

          <div>
            <label htmlFor="contact-email" className="font-futura-condensed mb-1 block text-[10px] text-white">
              Email
            </label>
            <input
              id="contact-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="Coach.Mak@hospital.org"
              className="w-full rounded-lg border border-white/20 bg-[#0f1410] px-2.5 py-1.5 text-[10px] text-white placeholder:text-white/35 focus:border-marketing-accent focus:outline-none sm:text-[11px]"
            />
          </div>

          <div>
            <label htmlFor="contact-question" className="font-futura-condensed mb-1 block text-[10px] text-white">
              Question
            </label>
            <textarea
              id="contact-question"
              name="question"
              required
              rows={2}
              placeholder="How can we help you?"
              className="w-full resize-none rounded-lg border border-white/20 bg-[#0f1410] px-2.5 py-1.5 text-[10px] text-white placeholder:text-white/35 focus:border-marketing-accent focus:outline-none sm:text-[11px]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="font-futura-bold rounded-lg bg-marketing-accent px-3 py-2 text-[10px] text-black transition hover:bg-white disabled:opacity-60 sm:text-[11px]"
          >
            {loading ? "Sending…" : "Send a Question"}
          </button>

          {formState === "error" && (
            <div className="rounded-lg bg-[#f5d4c4] px-3 py-2 text-[10px] leading-snug text-[#1a2419] sm:text-[11px]">
              Oops, something went wrong! Please double-check your submission and try again.
            </div>
          )}
        </form>
      )}
    </div>
  );
}

```

## src/components/marketing/FaqSection.tsx

```tsx
"use client";

import { useState } from "react";

export const FISCMAK_FAQ = [
  {
    id: "q1",
    question: "What makes FISCMAK different from wellness apps or job boards?",
    answer:
      "FISCMAK is a career intelligence platform, not a coaching app or job board. We build longitudinal understanding of your career by analyzing patterns in your everyday work over time.",
  },
  {
    id: "q2",
    question: "How does the longitudinal data model work?",
    answer:
      "Every activity you log becomes data. Over months and years, patterns emerge — career trajectory, burnout signals, and opportunity fit that no single CV snapshot can capture.",
  },
  {
    id: "q3",
    question: "Can you customize FISCMAK for our specific program?",
    answer:
      "Yes. We adapt to your program's specialty, size, and goals — including signal weighting, career pathways, output formats, and integration with existing systems.",
  },
  {
    id: "q4",
    question: "How do you guarantee data privacy and security?",
    answer:
      "Data is encrypted at rest and in transit. Role-based access control ensures only authorized leadership sees aggregated insights. Individual data is private by default.",
  },
  {
    id: "q5",
    question: "What's the onboarding process?",
    answer:
      "Onboarding takes about two minutes: profile, career stage, goals — then start logging activities. Coach Mak provides real-time feedback. No training required.",
  },
  {
    id: "q6",
    question: "Is there a free tier for individual physicians?",
    answer:
      "Yes. Free tier includes basic onboarding, activity logging, and standard outputs. Premium coaching and advanced analytics are available for individual subscribers.",
  },
];

export function FaqSection() {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section id="faq" aria-label="Frequently asked questions" className="px-5 py-20">
      <div className="mx-auto max-w-4xl">
        <h2 className="font-futura-bold mb-4 text-4xl text-white md:text-5xl">
          Frequently Asked
          <br />
          <span className="text-marketing-accent">Questions</span>
        </h2>
        <p className="mb-12 text-lg text-gray-400">
          Common questions about career intelligence, privacy, and getting started.
        </p>

        <div className="space-y-4">
          {FISCMAK_FAQ.map((faq) => {
            const open = openId === faq.id;
            return (
              <div key={faq.id} className="overflow-hidden rounded-lg bg-marketing-accent">
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : faq.id)}
                  className="flex w-full items-center justify-between p-6 text-left transition hover:bg-white/90"
                  aria-expanded={open}
                >
                  <span className="font-futura-medium pr-4 text-lg text-black">{faq.question}</span>
                  <span className="font-futura-bold shrink-0 text-2xl text-black">{open ? "−" : "+"}</span>
                </button>
                {open && (
                  <div className="border-t-4 border-black bg-gray-900 p-6 text-sm leading-relaxed text-gray-400">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

```

## src/components/marketing/FiscmakNameSection.tsx

```tsx
import Link from "next/link";

type FiscmakNameIntroProps = {
  id?: string;
};

export function FiscmakNameIntro({ id }: FiscmakNameIntroProps) {
  return (
    <section id={id} className="px-6 py-16 md:px-10 md:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-futura-bold text-5xl text-white md:text-7xl lg:text-8xl">
          <span className="text-white">FISC</span>
          <span className="text-marketing-accent">MAK</span>
        </h2>

        <p className="font-futura-bold mt-6 text-xl md:text-2xl">
          <span className="text-marketing-accent">PRONOUNCED: </span>
          <span className="text-marketing-accent">[ </span>
          <span className="text-white">FIZ-MAK</span>
          <span className="text-marketing-accent"> ]</span>
        </p>

        <p className="font-futura-condensed mt-5 max-w-3xl text-base text-white md:text-lg">
          By the standard rules of grammar, you should pronounce the C in FISC.
        </p>
        <p className="font-futura-bold mt-2 text-base text-marketing-accent md:text-lg">
          We don&apos;t follow the rules here.
        </p>
      </div>
    </section>
  );
}

export function FiscmakNameBreakdown() {
  return (
    <section className="px-6 pb-20 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="border-marketing-accent border-l-4 pl-6">
            <h3 className="font-futura-bold text-3xl text-white">
              FISC
              <br />
              <span className="text-marketing-accent">THE HIDDEN TREASURY</span>
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-gray-400">
              Derived from <em>fiscus</em>, a &quot;fisc&quot; is used to store an empire&apos;s most
              valuable treasures.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-gray-400">
              In medicine, expertise, dedication, and time are the ultimate assets.
            </p>
          </div>

          <div className="border-marketing-accent border-l-4 pl-6">
            <h3 className="font-futura-bold text-3xl text-white">
              THE SILENT &apos;C&apos;
              <br />
              <span className="text-marketing-accent">THE INVISIBLE WORK</span>
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-gray-400">
              Represents the amount of invisible work doctors perform every day.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-gray-400">
              It stands for the hours spent navigating clunky systems, charting, and battling friction
              in silence.
            </p>
          </div>

          <div className="border-marketing-accent border-l-4 pl-6">
            <h3 className="font-futura-bold text-3xl text-white">
              MAK
              <br />
              <span className="text-marketing-accent">THE HIGHEST STANDARD</span>
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-gray-400">Rooted in the name Maximus.</p>
            <p className="mt-4 text-sm leading-relaxed text-gray-400">
              &quot;MAK&quot; stands for the highest possible standard of excellence and autonomy.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FoundersNarrativeSection() {
  return (
    <section id="our-narrative" className="px-6 py-16 md:px-10 md:py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-futura-bold mb-8 text-4xl text-white md:text-5xl">
          Founders&apos; Narrative
        </h2>
        <div className="space-y-6 leading-relaxed text-gray-400">
          <p>
            We built FISCMAK because we saw the same pattern over and over: brilliant physicians doing
            invisible work.
          </p>
          <p>
            The teaching happens but isn&apos;t documented. The mentorship exists but isn&apos;t
            recognized. The emotional labor sustains entire programs but never appears in career
            advancement decisions.
          </p>
          <p>
            We started with a simple question:{" "}
            <span className="font-futura-medium text-marketing-accent">
              What if every activity a physician logs becomes insight about their career trajectory?
            </span>
          </p>
          <p>
            Not coaching. Not job boards. Not wellness tools.{" "}
            <span className="font-futura-medium text-marketing-accent">Career intelligence.</span>
          </p>
          <p>Longitudinal understanding. Pattern recognition. Opportunity mobility.</p>
          <p className="italic">
            FISCMAK is our attempt to make invisible work visible, to honor the treasures physicians
            carry, and to build the career clarity they deserve.
          </p>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/app/onboarding"
            className="font-futura-bold inline-block rounded bg-marketing-accent px-8 py-4 text-black transition hover:bg-white"
          >
            Start Building
          </Link>
        </div>
      </div>
    </section>
  );
}

export function FiscmakNameSection() {
  return (
    <>
      <FiscmakNameIntro id="about-fiscmak" />
      <FiscmakNameBreakdown />
    </>
  );
}

export function AboutFiscmakContent() {
  return (
    <>
      <FiscmakNameIntro />
      <FiscmakNameBreakdown />
    </>
  );
}

```

## src/components/marketing/HowItWorksSection.tsx

```tsx
export function HowItWorksSection() {
  const steps = [
    {
      n: 1,
      title: "Log Activity",
      body: 'Describe your work: "I mentored a junior resident in clinical decision-making."',
    },
    {
      n: 2,
      title: "Detect Signals",
      body: "Coach Mak analyzes mentorship, teaching, leadership, energy, and development signals.",
    },
    {
      n: 3,
      title: "Generate Evidence",
      body: "Auto-generated CV bullets, promotion language, and annual review narratives.",
    },
    {
      n: 4,
      title: "Predict Next",
      body: "Opportunity recommendations based on your trajectory and emerging patterns.",
    },
  ];

  return (
    <section id="how-it-works" aria-label="How FISCMAK works" className="px-5 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-futura-bold mb-12 text-4xl text-white md:text-5xl">
          How <span className="text-marketing-accent">FISCMAK</span> Works
        </h2>

        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.n}
              className="rounded-lg border-l-4 border-marketing-accent bg-gray-900 p-6"
            >
              <div className="mb-4 flex items-center">
                <div className="font-futura-bold mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-marketing-accent text-black">
                  {step.n}
                </div>
                <h3 className="font-futura-bold text-xl text-white">{step.title}</h3>
              </div>
              <p className="text-sm text-gray-400">{step.body}</p>
            </div>
          ))}
        </div>

        <div className="mb-12 rounded-lg border-l-4 border-marketing-accent bg-gray-900 p-8">
          <h3 className="font-futura-bold mb-6 text-2xl text-white">Why It Matters</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div>
              <p className="font-futura-bold mb-2 text-lg text-marketing-accent">For Physicians</p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Career clarity</li>
                <li>Professional outputs</li>
                <li>Burnout detection</li>
                <li>Job matching</li>
              </ul>
            </div>
            <div>
              <p className="font-futura-bold mb-2 text-lg text-marketing-accent">For Programs</p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Retention ↑ 5–10%</li>
                <li>Burnout detection ↑ 65%</li>
                <li>Attrition ↓ 40%</li>
                <li>21× ROI</li>
              </ul>
            </div>
            <div>
              <p className="font-futura-bold mb-2 text-lg text-marketing-accent">Longitudinal</p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Month 6: patterns emerge</li>
                <li>Month 12: predict next moves</li>
                <li>Month 24: own your trajectory</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

```

## src/components/marketing/InstitutionalPartnersSection.tsx

```tsx
import Link from "next/link";

const cards = [
  {
    title: "MASTERING CREATIVITY IN CAREER CLARITY",
    body: "Each element is designed to tell a compelling story and uncover the hidden value in physician work.",
    className: "from-yellow-200 to-yellow-100 text-gray-900",
    bodyClass: "text-gray-800",
  },
  {
    title: "SETTING TRENDS IN RESIDENT RETENTION",
    body: "Reshape how programs see and support their residents with longitudinal career intelligence.",
    className: "from-pink-200 to-pink-100 text-gray-900",
    bodyClass: "text-gray-800",
  },
  {
    title: "PRECISION IN PROGRAM OUTCOMES",
    body: "Tailored to each program's specialty, size, and goals — with measurable wellness and retention metrics.",
    className: "from-blue-900 to-blue-800 text-white",
    bodyClass: "text-gray-300",
  },
  {
    title: "SEAMLESSLY CONNECTING ACROSS INSTITUTIONS",
    body: "Consistent career development messaging across diverse residency programs and departments.",
    className: "from-red-900 to-red-800 text-white",
    bodyClass: "text-gray-300",
  },
];

export function InstitutionalPartnersSection() {
  return (
    <section id="institutions" aria-label="Institutional partnerships" className="px-5 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-futura-bold mb-4 text-4xl text-white md:text-5xl">
          INSTITUTIONAL
          <br />
          <span className="text-marketing-accent">PARTNERSHIPS</span>
        </h2>
        <p className="mb-12 text-lg text-gray-400">
          See how leading programs transform physician development with FISCMAK.
        </p>

        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {cards.map((card) => (
            <div
              key={card.title}
              className={`rounded-lg bg-gradient-to-br p-8 ${card.className}`}
            >
              <h3 className="font-futura-bold mb-4 text-2xl">{card.title}</h3>
              <p className={`text-sm leading-relaxed ${card.bodyClass}`}>{card.body}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link
            href="/app/onboarding"
            className="font-futura-bold inline-block rounded bg-marketing-accent px-8 py-4 text-black transition hover:bg-white"
          >
            Explore Partnerships →
          </Link>
        </div>
      </div>
    </section>
  );
}

```

## src/components/marketing/MarketingAuthShell.tsx

```tsx
import { MarketingFontShell } from "@/components/marketing/MarketingFontShell";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";

export function MarketingAuthShell({ children }: { children: React.ReactNode }) {
  return (
    <MarketingFontShell className="flex min-h-full flex-col">
      <MarketingHeader />
      <main className="flex flex-1 flex-col bg-black">{children}</main>
    </MarketingFontShell>
  );
}

```

## src/components/marketing/MarketingFontShell.tsx

```tsx
import { marketingFontVariables } from "@/lib/fonts/marketing-fonts";
import { cn } from "@/lib/utils";

export function MarketingFontShell({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("marketing-page", marketingFontVariables, className)}>
      {children}
    </div>
  );
}

```

## src/components/marketing/MarketingFooter.tsx

```tsx
import Link from "next/link";
import { ContactFormCard } from "@/components/marketing/ContactFormCard";

const footerLinks = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Our Narrative", href: "/our-narrative", external: true },
  { label: "Institutions", href: "/institutions", isLink: true },
  { label: "FAQ", href: "/faq", isLink: true },
  { label: "Sign In", href: "/login", isLink: true },
] as const;

export function MarketingFooter() {
  return (
    <footer id="contact" aria-label="Footer navigation" className="overflow-visible bg-black">
      <div className="px-6 pb-10 pt-12 sm:pl-[12%] md:px-10 md:pl-[20%] md:pb-12 md:pt-16">
        <ContactFormCard />
      </div>

      <div className="border-t border-white/20" aria-hidden />

      <div className="px-6 py-10 md:px-10 md:py-12">
        <nav
          aria-label="Footer links"
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-gray-400"
        >
          {footerLinks.map((item) =>
            item.external ? (
              <Link key={item.label} href={item.href} className="hover:text-marketing-accent">
                {item.label}
              </Link>
            ) : (
              <a key={item.label} href={item.href} className="hover:text-marketing-accent">
                {item.label}
              </a>
            ),
          )}
        </nav>

        <div className="mt-10 flex items-end justify-between gap-6">
          <Link
            href="/"
            aria-label="FISCMAK home"
            className="font-futura-bold text-2xl tracking-wide md:text-3xl"
          >
            <span className="text-[#f1fbe7]">FISC</span>
            <span className="text-marketing-accent">MAK</span>
          </Link>

          <p className="font-futura-condensed text-sm text-gray-500">
            © {new Date().getFullYear()} FISCMAK
          </p>
        </div>
      </div>
    </footer>
  );
}

```

## src/components/marketing/MarketingHeader.tsx

```tsx
import Link from "next/link";

const navigationItems = [
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Our Narrative", href: "/our-narrative" },
  { label: "Institutions", href: "/institutions" },
];

type MarketingHeaderProps = {
  overlay?: boolean;
};

export function MarketingHeader({ overlay = false }: MarketingHeaderProps) {
  return (
    <header
      className={
        overlay
          ? "absolute left-0 right-0 top-0 z-20 overflow-visible bg-transparent"
          : "relative sticky top-0 z-50 overflow-visible border-b border-white/10 bg-black/80 backdrop-blur-md"
      }
    >
      <nav
        aria-label="Primary navigation"
        className="pointer-events-none absolute inset-x-0 top-0 hidden h-full items-center justify-center lg:flex"
      >
        <div className="pointer-events-auto flex items-center gap-8">
          {navigationItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="font-futura-condensed text-base text-white transition hover:text-marketing-accent"
            >
              {item.label}
            </a>
          ))}
        </div>
      </nav>

      <div className="relative mx-auto flex max-w-[1440px] items-center justify-between px-8 py-6 md:px-10">
        <Link
          href="/"
          aria-label="FISCMAK home"
          className="relative z-10 shrink-0 font-futura-bold text-4xl tracking-wide md:text-5xl"
        >
          <span className="text-white">FISC</span>
          <span className="text-marketing-accent">MAK</span>
        </Link>

        <div className="relative z-10 ml-auto flex shrink-0 items-center justify-end gap-4">
          <Link
            href="/login"
            className="font-futura-bold hidden rounded border border-marketing-accent px-6 py-2.5 text-sm text-white transition hover:bg-marketing-accent hover:text-black sm:inline-block"
          >
            Sign In
          </Link>
          <Link
            href="/app/onboarding"
            className="font-futura-bold rounded bg-marketing-accent px-6 py-2.5 text-sm text-black transition hover:bg-white"
          >
            Start Building
          </Link>
        </div>
      </div>
    </header>
  );
}

```

## src/components/marketing/MarketingHeroSection.tsx

```tsx
function HeroTagline({
  verb,
  middle,
  end,
}: {
  verb: string;
  middle: string;
  end: string;
}) {
  return (
    <p className="font-futura-condensed whitespace-nowrap text-lg md:text-xl lg:text-2xl">
      <span className="text-marketing-accent">{verb}</span>{" "}
      <span className="text-white">{middle}</span>{" "}
      <span className="text-marketing-gold">{end}</span>
    </p>
  );
}

export function MarketingHeroSection() {
  return (
    <section
      id="hero-value-proposition"
      aria-label="Hero value proposition"
      className="relative flex min-h-[min(720px,85svh)] items-start justify-start px-8 pb-20 pt-32 md:px-10 md:pb-24 md:pt-36 lg:px-16 lg:pt-40"
    >
      <div className="relative w-full max-w-6xl">
        <div className="inline-grid grid-cols-[auto_auto_auto] gap-x-[0.35em] text-4xl uppercase leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.25rem]">
          <h1 className="contents font-futura-bold">
            <span className="col-start-1 row-start-1">What</span>
            <span className="col-start-2 row-start-1">move</span>
            <span className="col-start-3 row-start-1 text-marketing-accent">honors</span>
            <span className="col-start-2 row-start-2">your</span>
            <span className="col-start-3 row-start-2">work?</span>
          </h1>
          <p className="col-start-2 col-span-2 row-start-3 mt-3 max-w-md font-futura-condensed text-base normal-case tracking-normal text-white md:mt-4 md:text-lg lg:text-xl">
            An intelligent career platform for physicians.
          </p>
          <div className="col-start-2 col-span-2 row-start-4 mt-5 flex flex-col gap-2 md:mt-6 md:flex-row md:flex-wrap md:gap-x-8 lg:gap-x-10">
            <HeroTagline verb="Capture" middle="the" end="invisible." />
            <HeroTagline verb="Clarify" middle="your" end="direction." />
            <HeroTagline verb="Build" middle="the career" end="you want." />
          </div>
        </div>
      </div>
    </section>
  );
}

```

## src/components/marketing/MarketingHomePage.tsx

```tsx
import { MarketingFontShell } from "@/components/marketing/MarketingFontShell";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingHeroSection } from "@/components/marketing/MarketingHeroSection";
import { FiscmakNameSection } from "@/components/marketing/FiscmakNameSection";
import { HowItWorksSection } from "@/components/marketing/HowItWorksSection";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export function MarketingHomePage() {
  return (
    <MarketingFontShell className="min-h-full">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-marketing-accent focus:px-4 focus:py-2 focus:text-black"
      >
        Skip to content
      </a>

      <div className="relative bg-black">
        <MarketingHeader overlay />
        <main id="main-content">
          <MarketingHeroSection />
        </main>
      </div>

      <FiscmakNameSection />
      <HowItWorksSection />
      <MarketingFooter />
    </MarketingFontShell>
  );
}

```

## src/components/marketing/MarketingPageShell.tsx

```tsx
import { MarketingFontShell } from "@/components/marketing/MarketingFontShell";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export function MarketingPageShell({ children }: { children: React.ReactNode }) {
  return (
    <MarketingFontShell className="min-h-full">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded focus:bg-marketing-accent focus:px-4 focus:py-2 focus:text-black"
      >
        Skip to content
      </a>
      <MarketingHeader />
      <main id="main-content" className="bg-black">
        {children}
      </main>
      <MarketingFooter />
    </MarketingFontShell>
  );
}

```

## src/components/onboarding/DashboardRevealOverlay.tsx

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { SOAP_SECTION_ORDER, SOAP_TAB } from "@/lib/v2/soap-tab-spec";

const BAND_LETTERS: Record<(typeof SOAP_SECTION_ORDER)[number], string> = {
  subjective: "S",
  objective: "O",
  assessment: "A",
  plan: "P",
  output: "O",
};

const BANDS = SOAP_SECTION_ORDER.map((key) => ({
  letter: BAND_LETTERS[key],
  title: SOAP_TAB[key].title,
  detail: SOAP_TAB[key].description,
}));

type DashboardRevealOverlayProps = {
  onComplete: () => void;
};

export function DashboardRevealOverlay({ onComplete }: DashboardRevealOverlayProps) {
  const [index, setIndex] = useState(0);
  const band = BANDS[index];
  const isLast = index >= BANDS.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-cx-forest-dark/70 p-6">
      <div className="max-w-lg rounded-2xl bg-white p-8 shadow-xl">
        <p className="text-xs font-medium uppercase tracking-wide text-cx-forest-dark/70">
          Step 6 of 7 · Dashboard reveal
        </p>
        <h2 className="mt-2 text-xl font-semibold text-cx-forest-dark">Your Career Dashboard</h2>
        <p className="mt-2 text-sm text-cx-forest-dark/80">
          Each section is available from the top navigation bar.
        </p>
        <div className="mt-6 rounded-2xl border-2 border-cx-forest-dark/20 bg-cx-forest-dark/[0.04] p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-cx-forest-dark/70">
            Band {index + 1} of 5
          </p>
          <p className="mt-1 text-lg font-semibold text-[#5FD65F]">
            {band.letter} — {band.title}
          </p>
          <p className="mt-2 text-sm text-cx-forest-dark/80">{band.detail}</p>
        </div>
        <div className="mt-6 flex gap-3">
          {!isLast ? (
            <Button className="flex-1" onClick={() => setIndex((i) => i + 1)}>
              Next band
            </Button>
          ) : (
            <Button className="flex-1" onClick={onComplete}>
              Continue to goal setting
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

```

## src/components/onboarding/GoalSettingPanel.tsx

```tsx
"use client";

import { useState } from "react";
import { Check, Square } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusChip } from "@/components/ui/StatusChip";
import { GOAL_FRAMEWORK_LABELS, type GoalFrameworkType } from "@/lib/v2/soap-tab-spec";
import {
  GOAL_MODIFY_PROMPT,
  GOAL_REPLACE_PROMPT,
  type StructuredGoal,
  defaultStructuredGoals,
} from "@/lib/v2/goal-framework";

export type ProposedGoal = {
  type: GoalFrameworkType;
  title: string;
  rationale: string;
  milestones: string[];
  progress?: number;
  status?: "strong" | "developing" | "needs_attention" | "stable";
  latticeCells?: string[];
  invisibleWorkTargets?: string[];
};

type GoalSettingPanelProps = {
  goals: ProposedGoal[];
  onConfirm: (goals: ProposedGoal[]) => void;
  onModifyWithMak?: (goalType: GoalFrameworkType) => void;
  onWalkthroughWithMak?: () => void;
  loading?: boolean;
};

const DONE_PREFIX = "[x] ";
const TODO_PREFIX = "[ ] ";

function parseMilestone(line: string) {
  if (line.startsWith(DONE_PREFIX)) {
    return { done: true, text: line.slice(DONE_PREFIX.length) };
  }
  if (line.startsWith(TODO_PREFIX)) {
    return { done: false, text: line.slice(TODO_PREFIX.length) };
  }
  return { done: false, text: line.replace(/^[✓☐]\s*/, "") };
}

function formatMilestone(done: boolean, text: string) {
  return `${done ? DONE_PREFIX : TODO_PREFIX}${text}`;
}

function structuredToProposed(goals: StructuredGoal[]): ProposedGoal[] {
  return goals.map((g) => ({
    type: g.type,
    title: g.title,
    rationale: g.rationale,
    milestones: g.milestones.map((m) =>
      formatMilestone(m.status === "completed", `${m.quarter}: ${m.label}`),
    ),
    progress: g.progress,
    status:
      g.type === "sustainability"
        ? "needs_attention"
        : g.type === "maintenance"
          ? "strong"
          : "developing",
    latticeCells: g.latticeCells,
    invisibleWorkTargets: g.invisibleWorkTargets,
  }));
}

export function GoalSettingPanel({
  goals: initial,
  onConfirm,
  onModifyWithMak,
  onWalkthroughWithMak,
  loading,
}: GoalSettingPanelProps) {
  const [goals, setGoals] = useState(initial);
  const [modifyType, setModifyType] = useState<GoalFrameworkType | null>(null);
  const [replaceText, setReplaceText] = useState("");

  function toggleMilestone(goalIndex: number, milestoneIndex: number) {
    setGoals((prev) =>
      prev.map((g, gi) => {
        if (gi !== goalIndex) return g;
        const milestones = [...g.milestones];
        const { done, text } = parseMilestone(milestones[milestoneIndex]);
        milestones[milestoneIndex] = formatMilestone(!done, text);
        return { ...g, milestones };
      }),
    );
  }

  function applyGoalReplacement(goalType: GoalFrameworkType) {
    const text = replaceText.trim();
    if (!text) return;
    setGoals((prev) =>
      prev.map((g) =>
        g.type === goalType
          ? {
              ...g,
              title: text,
              rationale: text,
            }
          : g,
      ),
    );
    setModifyType(null);
    setReplaceText("");
  }

  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wide text-cx-forest-dark/70">Step 7 of 7</p>
      <h1 className="mt-1 text-page-title">Career Strategy</h1>
      <p className="mt-2 text-sm text-cx-forest-dark/80">
        Based on your Career Profile, the platform suggests three goals — Development,
        Maintenance, and Sustainability — each with quarterly SMART milestones. Review each
        and confirm, modify, or replace.
      </p>
      <div className="mt-6 space-y-4">
        {goals.map((goal, gi) => (
          <div
            key={goal.type}
            className="cx-surface-elevated rounded-2xl p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-cx-label uppercase">{GOAL_FRAMEWORK_LABELS[goal.type].label}</p>
              {goal.status && <StatusChip status={goal.status} />}
            </div>
            <h3 className="mt-2 font-semibold text-cx-forest-dark">{goal.title}</h3>
            <p className="mt-2 text-sm text-cx-forest-dark/80">
              <span className="font-medium text-cx-forest-dark">Rationale: </span>
              {goal.rationale}
            </p>
            {goal.progress != null && (
              <p className="mt-2 text-sm text-cx-forest-dark">Progress: {goal.progress}%</p>
            )}
            {goal.latticeCells && goal.latticeCells.length > 0 && (
              <p className="mt-2 text-cx-label">
                Lattice cells: {goal.latticeCells.join("; ")}
              </p>
            )}
            {goal.invisibleWorkTargets && goal.invisibleWorkTargets.length > 0 && (
              <p className="mt-2 text-cx-label">
                Invisible work targeted: {goal.invisibleWorkTargets.join("; ")}
              </p>
            )}
            <ul className="mt-3 space-y-2 text-sm">
              {goal.milestones.map((m, mi) => {
                const { done, text } = parseMilestone(m);
                return (
                  <li key={m}>
                    <button
                      type="button"
                      className="flex items-start gap-2 text-left text-cx-forest-dark hover:text-cx-forest-dark/80"
                      onClick={() => toggleMilestone(gi, mi)}
                    >
                      {done ? (
                        <Check size={16} className="mt-0.5 shrink-0 text-cx-success" />
                      ) : (
                        <Square size={16} className="mt-0.5 shrink-0 text-cx-forest-dark/60" />
                      )}
                      <span>{text}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                variant="secondary"
                className="text-xs"
                onClick={() => setModifyType(goal.type)}
              >
                Modify
              </Button>
              <Button
                variant="secondary"
                className="text-xs"
                onClick={() => {
                  setModifyType(goal.type);
                  setReplaceText("");
                }}
              >
                Replace with my own
              </Button>
            </div>
            {modifyType === goal.type && (
              <div className="cx-surface-elevated mt-4 rounded-xl p-4 text-sm">
                <p className="whitespace-pre-line text-sm text-cx-forest-dark/80">{GOAL_MODIFY_PROMPT}</p>
                <textarea
                  className="mt-3 w-full rounded-xl border border-cx-forest-dark/20 p-3 text-sm text-cx-forest-dark"
                  rows={2}
                  placeholder={GOAL_REPLACE_PROMPT}
                  value={replaceText}
                  onChange={(e) => setReplaceText(e.target.value)}
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    variant="secondary"
                    className="text-xs"
                    disabled={!replaceText.trim()}
                    onClick={() => applyGoalReplacement(goal.type)}
                  >
                    Apply replacement
                  </Button>
                  <Button
                    variant="secondary"
                    className="text-xs"
                    onClick={() => onModifyWithMak?.(goal.type)}
                  >
                    Refine with Coach Mak
                  </Button>
                  <Button
                    variant="secondary"
                    className="text-xs"
                    onClick={() => {
                      setModifyType(null);
                      setReplaceText("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {onWalkthroughWithMak && (
          <Button variant="secondary" className="flex-1" onClick={onWalkthroughWithMak}>
            Walk through with Coach Mak
          </Button>
        )}
        <Button className="flex-1" disabled={loading} onClick={() => onConfirm(goals)}>
          {loading ? "Saving goals…" : "Confirm in template"}
        </Button>
      </div>
    </Card>
  );
}

export function defaultProposedGoals(input: {
  primaryTrack?: string | null;
  careerObjective?: string | null;
  sustainabilityNote?: string | null;
  unreasonableTaskScore?: number | null;
  unrecognizedWorkHours?: number | null;
}): ProposedGoal[] {
  return structuredToProposed(
    defaultStructuredGoals({
      careerObjective: input.careerObjective,
      primaryTrack: input.primaryTrack,
      unreasonableTaskScore: input.unreasonableTaskScore,
      unrecognizedWorkHours: input.unrecognizedWorkHours,
    }),
  );
}

```

## src/components/onboarding/LayOfTheLandTour.tsx

```tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { LAY_OF_LAND_STEPS, markTourSeen } from "@/lib/v2/onboarding-flow";

type LayOfTheLandTourProps = {
  open: boolean;
  onClose: () => void;
};

export function LayOfTheLandTour({ open, onClose }: LayOfTheLandTourProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (open) setStep(0);
  }, [open]);

  if (!open) return null;

  const current = LAY_OF_LAND_STEPS[step];
  const isLast = step >= LAY_OF_LAND_STEPS.length - 1;

  function finish() {
    markTourSeen();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-cx-forest-dark/10 bg-white p-6 shadow-xl">
        <p className="text-xs font-medium uppercase tracking-wide text-cx-forest-dark/70">
          Lay of the Land · {step + 1} / {LAY_OF_LAND_STEPS.length}
        </p>
        <h2 id="tour-title" className="mt-2 text-xl font-semibold text-cx-forest-dark">
          {current.title}
        </h2>
        {current.highlight && (
          <p className="mt-2 text-sm font-medium text-[#5FD65F]">{current.highlight}</p>
        )}
        <p className="mt-3 text-sm leading-relaxed text-cx-forest-dark/80">{current.body}</p>

        <div className="mt-6 flex gap-2">
          {step > 0 && (
            <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          )}
          <Button
            className="flex-1"
            onClick={() => (isLast ? finish() : setStep((s) => s + 1))}
          >
            {isLast ? "Start coaching conversation" : "Next"}
          </Button>
        </div>
        <button
          type="button"
          onClick={finish}
          className="mt-3 w-full text-center text-xs text-cx-forest-dark/60 hover:underline"
        >
          Skip tour
        </button>
      </div>
    </div>
  );
}

```

## src/components/onboarding/OnboardingDocumentsStep.tsx

```tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  ACCEPTED_CV_ACCEPT,
  ACCEPTED_CV_LABEL,
  isAcceptedCvFileName,
} from "@/lib/v2/document-upload";
import {
  ONBOARDING_DOCUMENT_TYPE_OPTIONS,
  getOnboardingUploadOption,
  resolveOnboardingDocumentUpload,
} from "@/lib/v2/onboarding-document-types";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, CircleX, Pencil, Upload, XCircle } from "lucide-react";

type SavedDocument = {
  document_id: string;
  typeId: string;
  typeLabel: string;
  fileName: string;
  preview: string;
  status: "complete";
};

type UploadingDocument = {
  localId: string;
  typeId: string;
  typeLabel: string;
  fileName: string;
  progress: number;
  status: "uploading" | "error";
  error?: string;
};

type DocumentRow = SavedDocument | UploadingDocument;

type OnboardingDocumentsStepProps = {
  onContinue: () => void;
  continueDisabled?: boolean;
};

function isUploading(doc: DocumentRow): doc is UploadingDocument {
  return doc.status === "uploading" || doc.status === "error";
}

function uploadWithProgress(
  form: FormData,
  onProgress: (progress: number) => void,
): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });
    xhr.addEventListener("load", () => {
      let data: Record<string, unknown> = {};
      try {
        data = JSON.parse(xhr.responseText) as Record<string, unknown>;
      } catch {
        reject(new Error("Upload failed"));
        return;
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data);
        return;
      }
      reject(new Error(typeof data.message === "string" ? data.message : "Upload failed"));
    });
    xhr.addEventListener("error", () => reject(new Error("Upload failed")));
    xhr.open("POST", "/api/v1/documents");
    xhr.send(form);
  });
}

export function OnboardingDocumentsStep({
  onContinue,
  continueDisabled = false,
}: OnboardingDocumentsStepProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<DocumentRow[]>([]);
  const [selectedDocType, setSelectedDocType] = useState("CV");
  const [customDocLabel, setCustomDocLabel] = useState("");
  const [pasteText, setPasteText] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editDrafts, setEditDrafts] = useState<Record<string, { typeId: string; customLabel: string }>>(
    {},
  );
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [savingEditId, setSavingEditId] = useState<string | null>(null);
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null);

  const selectedDocOption = getOnboardingUploadOption(selectedDocType);
  const hasCv = documents.some((doc) => !isUploading(doc) && doc.typeId === "CV");
  const isUploadingAny = documents.some((doc) => isUploading(doc) && doc.status === "uploading");

  const refreshSavedDocuments = useCallback(async () => {
    const res = await fetch("/api/v1/documents");
    const data = await res.json();
    const saved = (data.documents ?? []) as Array<{
      document_id: string;
      document_subtype: string;
      document_label: string;
      file_name: string;
      extracted_text_preview?: string;
    }>;

    setDocuments((current) => {
      const inFlight = current.filter(isUploading);
      const savedRows: SavedDocument[] = saved.map((doc) => ({
        document_id: doc.document_id,
        typeId: doc.document_subtype,
        typeLabel: doc.document_label,
        fileName: doc.file_name,
        preview: doc.extracted_text_preview ?? "",
        status: "complete",
      }));
      return [...inFlight, ...savedRows];
    });
  }, []);

  useEffect(() => {
    void refreshSavedDocuments();
  }, [refreshSavedDocuments]);

  async function startUpload(file: File, typeId: string, customLabel?: string) {
    setError("");

    let resolved;
    try {
      resolved = resolveOnboardingDocumentUpload(typeId, customLabel);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Select a document type.");
      return;
    }

    if (!isAcceptedCvFileName(file.name)) {
      setError(`Upload ${ACCEPTED_CV_LABEL}, or paste text below.`);
      return;
    }

    const localId = crypto.randomUUID();
    const uploadingRow: UploadingDocument = {
      localId,
      typeId,
      typeLabel: resolved.document_label,
      fileName: file.name,
      progress: 0,
      status: "uploading",
    };

    setDocuments((current) => [uploadingRow, ...current.filter((doc) => !isUploading(doc) || doc.localId !== localId)]);

    const form = new FormData();
    form.append("file", file);
    form.append("document_type", resolved.document_type);
    form.append("document_subtype", resolved.document_subtype);
    form.append("document_label", resolved.document_label);
    if (customLabel?.trim()) form.append("custom_label", customLabel.trim());

    try {
      await uploadWithProgress(form, (progress) => {
        setDocuments((current) =>
          current.map((doc) =>
            isUploading(doc) && doc.localId === localId ? { ...doc, progress } : doc,
          ),
        );
      });
      setDocuments((current) => current.filter((doc) => !(isUploading(doc) && doc.localId === localId)));
      await refreshSavedDocuments();
      setPasteText("");
      if (typeId === "Other") setCustomDocLabel("");
    } catch (e) {
      const message = e instanceof Error ? e.message : "Upload failed";
      setDocuments((current) =>
        current.map((doc) =>
          isUploading(doc) && doc.localId === localId
            ? { ...doc, status: "error", error: message, progress: 0 }
            : doc,
        ),
      );
      setError(message);
    }
  }

  function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (selectedDocOption?.requiresCustomLabel && !customDocLabel.trim()) {
      setError("Enter a label for your document type.");
      return;
    }

    void startUpload(
      file,
      selectedDocType,
      selectedDocOption?.requiresCustomLabel ? customDocLabel : undefined,
    );
  }

  function onPasteBlur() {
    if (!pasteText.trim()) return;
    if (selectedDocOption?.requiresCustomLabel && !customDocLabel.trim()) {
      setError("Enter a label for your document type.");
      return;
    }

    const file = new File([pasteText.trim()], `pasted-${selectedDocType}.txt`, {
      type: "text/plain",
    });
    void startUpload(
      file,
      selectedDocType,
      selectedDocOption?.requiresCustomLabel ? customDocLabel : undefined,
    );
  }

  function beginEdit() {
    const drafts: Record<string, { typeId: string; customLabel: string }> = {};
    documents.forEach((doc) => {
      if (!isUploading(doc)) {
        drafts[doc.document_id] = {
          typeId: doc.typeId,
          customLabel: doc.typeId === "Other" ? doc.typeLabel : "",
        };
      }
    });
    setEditDrafts(drafts);
    setEditMode(true);
  }

  async function saveDocumentType(
    documentId: string,
    nextTypeId?: string,
    nextCustomLabel?: string,
  ) {
    const draft = editDrafts[documentId];
    const typeId = nextTypeId ?? draft?.typeId;
    if (!typeId) return;

    const option = getOnboardingUploadOption(typeId);
    const customLabel =
      nextCustomLabel ??
      draft?.customLabel ??
      (option?.requiresCustomLabel ? "" : undefined);

    if (option?.requiresCustomLabel && !customLabel?.trim()) {
      setError("Enter a label for Other documents.");
      return;
    }

    setSavingEditId(documentId);
    setError("");
    try {
      const res = await fetch(`/api/v1/documents/${documentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_subtype: typeId,
          custom_label: option?.requiresCustomLabel ? customLabel?.trim() : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Could not update document type");
      setEditDrafts((current) => ({
        ...current,
        [documentId]: {
          typeId,
          customLabel: option?.requiresCustomLabel ? (customLabel?.trim() ?? "") : "",
        },
      }));
      await refreshSavedDocuments();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not update document type");
    } finally {
      setSavingEditId(null);
    }
  }

  async function deleteDocument(documentId: string) {
    setDeletingDocumentId(documentId);
    setError("");
    try {
      const res = await fetch(`/api/v1/documents/${documentId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Could not remove document");

      setSelectedDocumentId((current) => (current === documentId ? null : current));
      setEditDrafts((current) => {
        const next = { ...current };
        delete next[documentId];
        return next;
      });
      setDocuments((current) =>
        current.filter((doc) => isUploading(doc) || doc.document_id !== documentId),
      );
      await refreshSavedDocuments();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not remove document");
    } finally {
      setDeletingDocumentId(null);
    }
  }

  const selectedDocument = documents.find(
    (doc) => !isUploading(doc) && doc.document_id === selectedDocumentId,
  );

  return (
    <Card>
      <h1 className="text-page-title">Upload your documents</h1>

      <div className="mt-5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-cx-forest-dark">Uploaded documents</p>
          {documents.some((doc) => !isUploading(doc)) && (
            <button
              type="button"
              onClick={() => (editMode ? setEditMode(false) : beginEdit())}
              className={cn(
                "inline-flex items-center gap-1 text-sm font-medium transition-colors",
                editMode
                  ? "text-[#d4c574] hover:text-[#d4c574]/80"
                  : "text-cx-forest-dark hover:text-cx-forest-dark/80",
              )}
            >
              <Pencil size={14} />
              {editMode ? "Done" : "Edit"}
            </button>
          )}
        </div>

        {documents.length === 0 ? (
          <div className="rounded-md border border-dashed border-cx-forest-dark/20 px-3 py-4 text-sm text-cx-forest-dark/70">
            No documents yet. CV / Resume is required to continue.
          </div>
        ) : (
          <ul className="space-y-3">
            {documents.map((doc) => {
              if (isUploading(doc)) {
                return (
                  <li
                    key={doc.localId}
                    className="rounded-lg border border-cx-forest-dark/15 px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-cx-forest-dark/60">
                          {doc.typeLabel}
                        </p>
                        <p className="truncate text-sm font-medium text-cx-forest-dark">{doc.fileName}</p>
                      </div>
                      {doc.status === "error" ? (
                        <XCircle size={18} className="shrink-0 text-cx-attention" />
                      ) : (
                        <Circle size={18} className="shrink-0 animate-pulse text-cx-forest-dark/40" />
                      )}
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-cx-forest-dark/10">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-200",
                          doc.status === "error" ? "bg-cx-attention" : "bg-cx-success",
                        )}
                        style={{ width: `${doc.status === "error" ? 100 : doc.progress}%` }}
                      />
                    </div>
                    {doc.status === "error" && doc.error && (
                      <p className="mt-2 text-xs text-cx-attention">{doc.error}</p>
                    )}
                  </li>
                );
              }

              const draft = editDrafts[doc.document_id];
              const activeTypeId = draft?.typeId ?? doc.typeId;
              const draftOption = getOnboardingUploadOption(activeTypeId);

              return (
                <li key={doc.document_id}>
                  <div
                    className={cn(
                      "w-full rounded-lg border px-4 py-3 transition-colors",
                      !editMode && selectedDocumentId === doc.document_id
                        ? "border-cx-forest-dark bg-cx-forest-dark/5"
                        : "border-cx-forest-dark/15",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        {editMode ? (
                          <div className="space-y-2">
                            <select
                              value={draft?.typeId ?? doc.typeId}
                              onChange={(e) => {
                                const nextTypeId = e.target.value;
                                const nextCustomLabel =
                                  nextTypeId === "Other"
                                    ? (editDrafts[doc.document_id]?.customLabel ?? doc.typeLabel)
                                    : "";
                                setEditDrafts((current) => ({
                                  ...current,
                                  [doc.document_id]: {
                                    typeId: nextTypeId,
                                    customLabel: nextCustomLabel,
                                  },
                                }));
                                void saveDocumentType(doc.document_id, nextTypeId, nextCustomLabel);
                              }}
                              className="cx-field w-full text-sm"
                              disabled={
                                savingEditId === doc.document_id ||
                                deletingDocumentId === doc.document_id
                              }
                            >
                              {ONBOARDING_DOCUMENT_TYPE_OPTIONS.map((option) => (
                                <option key={option.id} value={option.id}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                            <p className="truncate text-sm font-medium text-cx-forest-dark">
                              {doc.fileName}
                            </p>
                            {draftOption?.requiresCustomLabel && (
                              <input
                                type="text"
                                value={draft?.customLabel ?? ""}
                                onChange={(e) =>
                                  setEditDrafts((current) => ({
                                    ...current,
                                    [doc.document_id]: {
                                      typeId: draft?.typeId ?? doc.typeId,
                                      customLabel: e.target.value,
                                    },
                                  }))
                                }
                                onBlur={(e) =>
                                  void saveDocumentType(
                                    doc.document_id,
                                    draft?.typeId ?? doc.typeId,
                                    e.target.value,
                                  )
                                }
                                placeholder="Document label"
                                className="cx-field w-full text-sm"
                                disabled={deletingDocumentId === doc.document_id}
                              />
                            )}
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedDocumentId((current) =>
                                current === doc.document_id ? null : doc.document_id,
                              )
                            }
                            className="w-full text-left"
                          >
                            <p className="text-xs font-semibold uppercase tracking-wide text-cx-forest-dark/60">
                              {doc.typeLabel}
                            </p>
                            <p className="truncate text-sm font-medium text-cx-forest-dark">
                              {doc.fileName}
                            </p>
                          </button>
                        )}
                      </div>
                      {editMode ? (
                        <button
                          type="button"
                          aria-label={`Remove ${doc.fileName}`}
                          disabled={deletingDocumentId === doc.document_id}
                          onClick={() => void deleteDocument(doc.document_id)}
                          className="shrink-0 rounded-full transition-opacity hover:opacity-80 disabled:opacity-50"
                        >
                          <CircleX size={18} className="text-[#d4c574]" />
                        </button>
                      ) : (
                        <CheckCircle2 size={18} className="shrink-0 text-[#a9ff5c]" aria-hidden />
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {selectedDocument && !editMode && (
        <div className="mt-4 rounded-lg border border-cx-forest-dark/15 bg-cx-forest-dark/[0.03] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-cx-forest-dark/60">
            Preview
          </p>
          <p className="mt-1 text-sm font-medium text-cx-forest-dark">{selectedDocument.fileName}</p>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-cx-forest-dark/80">
            {selectedDocument.preview || "Document uploaded and parsed successfully."}
          </p>
        </div>
      )}

      <div className="mt-6 space-y-4 border-t border-cx-forest-dark/10 pt-6">
        <div>
          <label htmlFor="tp1-doc-type" className="text-sm font-semibold">
            Document type
          </label>
          <select
            id="tp1-doc-type"
            value={selectedDocType}
            onChange={(e) => {
              setSelectedDocType(e.target.value);
              setCustomDocLabel("");
              setError("");
            }}
            className="cx-field mt-2 w-full"
          >
            {ONBOARDING_DOCUMENT_TYPE_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {selectedDocOption?.requiresCustomLabel && (
          <div>
            <label htmlFor="tp1-custom-label" className="text-sm font-semibold">
              Document label
            </label>
            <input
              id="tp1-custom-label"
              type="text"
              value={customDocLabel}
              onChange={(e) => setCustomDocLabel(e.target.value)}
              placeholder="Describe this document"
              className="cx-field mt-2"
            />
          </div>
        )}

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-cx-forest-dark/25 bg-cx-forest-dark/[0.03] px-6 py-8 transition-colors hover:border-cx-forest-dark/40 hover:bg-cx-forest-dark/5"
        >
          <Upload className="text-cx-forest-dark" size={24} />
          <p className="mt-2 font-semibold">Upload {selectedDocOption?.label ?? "document"}</p>
          <p className="text-sm text-cx-forest-dark/80">{ACCEPTED_CV_LABEL}</p>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_CV_ACCEPT}
          className="hidden"
          onChange={onFileSelected}
        />

        <div className="space-y-2">
          <label htmlFor="tp1-paste" className="text-sm font-semibold">
            Or paste document text
          </label>
          <textarea
            id="tp1-paste"
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            onBlur={onPasteBlur}
            rows={4}
            className="w-full rounded-md border border-cx-forest-dark/15 p-3 text-sm"
            placeholder="Paste document content…"
          />
          <p className="text-xs text-cx-forest-dark/60">
            Pasted text uploads automatically when you click away from this field.
          </p>
        </div>
      </div>

      <div className="mt-6">
        <Button
          className="w-full"
          onClick={onContinue}
          disabled={continueDisabled || isUploadingAny || !hasCv}
        >
          Continue
        </Button>
        {!hasCv && (
          <p className="mt-2 text-center text-xs text-cx-forest-dark/70">
            Upload a CV / Resume to continue.
          </p>
        )}
      </div>

      {error && <p className="cx-alert-banner mt-3 px-4 py-3 text-sm">{error}</p>}
    </Card>
  );
}

```

## src/components/onboarding/OnboardingGuard.tsx

```tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (pathname.startsWith("/app/onboarding")) {
      setReady(true);
      return;
    }

    let cancelled = false;

    fetch("/api/v1/users/me")
      .then(async (response) => {
        if (!response.ok) {
          if (response.status === 401) {
            window.location.assign("/login");
            return null;
          }
          throw new Error("Could not load profile");
        }
        return response.json();
      })
      .then((user) => {
        if (cancelled || !user) return;

        if (!user.tier1_complete) {
          window.location.assign("/app/onboarding");
          return;
        }

        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-cx-forest-dark/70">Loading…</p>
      </div>
    );
  }

  return <>{children}</>;
}

```

## src/components/onboarding/OnboardingWelcome.tsx

```tsx
"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const SOAPO_OVERVIEW = [
  {
    letter: "S",
    name: "Career Perspective",
    detail: "Career aspirations, professional satisfaction, and work-life factors",
  },
  {
    letter: "O",
    name: "Career Data",
    detail: "Verified data from uploaded documents and public databases",
  },
  {
    letter: "A",
    name: "Career Profile",
    detail: "Synthesized profile with strengths, growth areas, and benchmarks",
  },
  {
    letter: "P",
    name: "Career Strategy",
    detail: "Structured goals with quarterly milestones",
  },
  {
    letter: "O",
    name: "Career Documents",
    detail: "CV, biosketch, personal statements, and more",
  },
];

type OnboardingWelcomeProps = {
  onBegin: () => void;
};

export function OnboardingWelcome({ onBegin }: OnboardingWelcomeProps) {
  return (
    <Card>
      <p className="text-xs font-medium uppercase tracking-wide text-cx-forest-dark/70">
        Step 1 of 7
      </p>
      <h1 className="mt-1 text-page-title">Welcome to FISCMAK</h1>
      <p className="mt-3 text-sm text-cx-forest-dark/80">
        This platform organizes career development using a framework familiar to every
        physician: <strong className="text-cx-forest-dark">SOAPO</strong> — Subjective, Objective,
        Assessment, Plan, Output.
      </p>
      <ul className="mt-6 space-y-3">
        {SOAPO_OVERVIEW.map((item) => (
          <li
            key={item.letter + item.name}
            className="cx-surface-elevated flex gap-3 rounded-2xl px-4 py-3"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cx-forest-dark text-sm font-bold text-[#5FD65F]">
              {item.letter}
            </span>
            <div>
              <p className="font-semibold text-cx-forest-dark">{item.name}</p>
              <p className="text-sm text-cx-forest-dark/70">{item.detail}</p>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm text-cx-forest-dark/80">Getting started takes about 20 minutes.</p>
      <Button className="mt-6 w-full" onClick={onBegin}>
        Begin setup
      </Button>
    </Card>
  );
}

```

## src/components/onboarding/ReconciliationItemCard.tsx

```tsx
"use client";

import { NpiRegistryPanel, type NpiRegistryStatus } from "@/components/profile/NpiRegistryPanel";
import { Button } from "@/components/ui/Button";
import { isNpiReconcileItem } from "@/lib/v2/npi-registry";
import { cn } from "@/lib/utils";

export type ReconcileItemView = {
  id: string;
  source: string;
  label: string;
  detail: string;
  status: "pending" | "confirmed" | "rejected";
};

type ReconciliationItemCardProps = {
  item: ReconcileItemView;
  initialNpi?: string;
  npiStatus?: NpiRegistryStatus | null;
  onToggle: (id: string, status: "confirmed" | "rejected") => void;
  onNpiVerified: (id: string, status: "confirmed" | "rejected") => void;
  onNpiSkipped?: () => void;
};

export function ReconciliationItemCard({
  item,
  initialNpi = "",
  npiStatus,
  onToggle,
  onNpiVerified,
  onNpiSkipped,
}: ReconciliationItemCardProps) {
  const isNpi = isNpiReconcileItem(item);
  const verified = Boolean(npiStatus?.npi_verified && npiStatus?.npi);

  return (
    <li className="relative rounded-xl border border-cx-forest-dark/15 bg-white p-5 shadow-sm">
      {!isNpi && <p className="text-cx-label uppercase">{item.source}</p>}
      <p className={cn("text-cx-h3", !isNpi && "mt-2", isNpi && !verified && "pr-28")}>
        {verified && npiStatus?.npi ? `NPI ${npiStatus.npi} verified` : item.label}
      </p>
      {!verified && (
        <p className="mt-2 text-sm text-cx-forest-dark/80">{item.detail}</p>
      )}

      {isNpi ? (
        <div className="mt-4">
          <NpiRegistryPanel
            initialNpi={initialNpi}
            status={npiStatus}
            reconciliationItemId={item.id}
            showSkip
            skipPlacement="corner"
            onVerified={() => onNpiVerified(item.id, "confirmed")}
            onSkipped={onNpiSkipped}
          />
        </div>
      ) : (
        <div className="mt-4 flex gap-3">
          <Button
            variant={item.status === "confirmed" ? "primary" : "secondary"}
            className="min-h-[44px] flex-1"
            onClick={() => onToggle(item.id, "confirmed")}
          >
            Mine
          </Button>
          <Button
            variant={item.status === "rejected" ? "primary" : "secondary"}
            className="min-h-[44px] flex-1"
            onClick={() => onToggle(item.id, "rejected")}
          >
            Not mine
          </Button>
        </div>
      )}
    </li>
  );
}

```

## src/components/onboarding/SpecialtyIntakeFields.tsx

```tsx
"use client";

import { useMemo } from "react";
import {
  filterBaseSpecialties,
  filterSubspecialties,
  hasSubspecialtyOptions,
} from "@/lib/v2/specialty-hierarchy";
import type { CareerStage } from "@/lib/v2/onboarding-options";
import { cn } from "@/lib/utils";

type SpecialtyIntakeFieldsProps = {
  baseSpecialty: string;
  baseQuery: string;
  onBaseQueryChange: (value: string) => void;
  onPickBase: (value: string) => void;
  baseListOpen: boolean;
  onBaseListOpenChange: (open: boolean) => void;
  subspecialty: string;
  subspecialtyQuery: string;
  onSubspecialtyQueryChange: (value: string) => void;
  onPickSubspecialty: (value: string) => void;
  subspecialtyListOpen: boolean;
  onSubspecialtyListOpenChange: (open: boolean) => void;
  trainingComplete: boolean;
  onTrainingCompleteChange: (value: boolean) => void;
  careerStage: CareerStage;
};

export function SpecialtyIntakeFields({
  baseSpecialty,
  baseQuery,
  onBaseQueryChange,
  onPickBase,
  baseListOpen,
  onBaseListOpenChange,
  subspecialty,
  subspecialtyQuery,
  onSubspecialtyQueryChange,
  onPickSubspecialty,
  subspecialtyListOpen,
  onSubspecialtyListOpenChange,
  trainingComplete,
  onTrainingCompleteChange,
  careerStage,
}: SpecialtyIntakeFieldsProps) {
  const filteredBases = useMemo(() => filterBaseSpecialties(baseQuery), [baseQuery]);
  const showSubspecialty = baseSpecialty && hasSubspecialtyOptions(baseSpecialty);
  const filteredSubs = useMemo(
    () => (baseSpecialty ? filterSubspecialties(baseSpecialty, subspecialtyQuery) : []),
    [baseSpecialty, subspecialtyQuery],
  );

  return (
    <div className="space-y-5">
      <div className="relative">
        <label htmlFor="base-specialty-search" className="text-sm font-semibold">
          Base specialty
        </label>
        <p className="mt-0.5 text-xs text-cx-forest-dark/70">
          Residency training program (e.g. Internal Medicine, Pediatrics).
        </p>
        <input
          id="base-specialty-search"
          type="text"
          value={baseQuery}
          onChange={(e) => {
            onBaseQueryChange(e.target.value);
            onBaseListOpenChange(true);
          }}
          onFocus={() => onBaseListOpenChange(true)}
          placeholder="Start typing, e.g. Internal Medicine…"
          className="cx-field mt-2"
          autoComplete="off"
        />
        {baseListOpen && (
          <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-cx-forest-dark/15 bg-white shadow-md">
            {filteredBases.length === 0 ? (
              <li className="px-4 py-3 text-sm text-cx-forest-dark/70">No matches</li>
            ) : (
              filteredBases.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => onPickBase(s)}
                    className={cn(
                      "w-full px-4 py-2.5 text-left text-sm hover:bg-cx-forest-dark/5",
                      baseSpecialty === s && "bg-cx-forest-dark/10 font-semibold",
                    )}
                  >
                    {s}
                  </button>
                </li>
              ))
            )}
          </ul>
        )}
      </div>

      {showSubspecialty && (
        <>
          <div className="relative">
            <label htmlFor="subspecialty-search" className="text-sm font-semibold">
              Fellowship / subspecialty <span className="font-normal text-cx-forest-dark/70">(optional)</span>
            </label>
            <p className="mt-0.5 text-xs text-cx-forest-dark/70">
              e.g. Interventional Cardiology after Internal Medicine residency.
            </p>
            <input
              id="subspecialty-search"
              type="text"
              value={subspecialtyQuery}
              onChange={(e) => {
                onSubspecialtyQueryChange(e.target.value);
                onSubspecialtyListOpenChange(true);
              }}
              onFocus={() => onSubspecialtyListOpenChange(true)}
              placeholder="Start typing subspecialty…"
              className="cx-field mt-2"
              autoComplete="off"
            />
            {subspecialtyListOpen && (
              <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-cx-forest-dark/15 bg-white shadow-md">
                <li>
                  <button
                    type="button"
                    onClick={() => onPickSubspecialty("")}
                    className="w-full px-4 py-2.5 text-left text-sm text-cx-forest-dark/70 hover:bg-cx-forest-dark/5"
                  >
                    None — practicing in base specialty only
                  </button>
                </li>
                {filteredSubs.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      onClick={() => onPickSubspecialty(s)}
                      className={cn(
                        "w-full px-4 py-2.5 text-left text-sm hover:bg-cx-forest-dark/5",
                        subspecialty === s && "bg-cx-forest-dark/10 font-semibold",
                      )}
                    >
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {subspecialty && (
            <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-cx-forest-dark/15 bg-cx-forest-dark/[0.03] px-4 py-3">
              <input
                type="checkbox"
                checked={trainingComplete}
                onChange={(e) => onTrainingCompleteChange(e.target.checked)}
                className="mt-1"
              />
              <span className="text-sm text-cx-forest-dark">
                <span className="font-semibold">Fellowship training complete</span>
                <span className="mt-0.5 block text-cx-forest-dark/70">
                  {careerStage === "Fellow"
                    ? "Leave unchecked while you are still in fellowship."
                    : "Check when you are board-eligible or certified in this subspecialty."}
                </span>
              </span>
            </label>
          )}
        </>
      )}
    </div>
  );
}

```

## src/components/onboarding/Tier1Onboarding.tsx

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import {
  ACGME_SPECIALTIES,
  CAREER_STAGES,
  filterSpecialties,
  type CareerStage,
} from "@/lib/v2/onboarding-options";

export function Tier1Onboarding() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [specialtyQuery, setSpecialtyQuery] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [careerStage, setCareerStage] = useState<CareerStage>("Fellow");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [listOpen, setListOpen] = useState(false);

  const filteredSpecialties = useMemo(
    () => filterSpecialties(specialtyQuery),
    [specialtyQuery],
  );

  useEffect(() => {
    fetch("/api/v1/users/me")
      .then((r) => r.json())
      .then((u) => {
        if (u.tier1_complete) {
          router.replace(u.tier3_complete ? "/app/dashboard" : "/app/dashboard?welcome=1");
          return;
        }
        if (u.name) setName(u.name);
        if (u.specialty) {
          setSpecialty(u.specialty);
          setSpecialtyQuery(u.specialty);
        }
        if (u.career_stage) setCareerStage(u.career_stage);
      })
      .catch(() => {});
  }, [router]);

  async function submitProfile() {
    if (!name.trim()) {
      setError("Enter your name.");
      return;
    }
    if (!specialty || !ACGME_SPECIALTIES.includes(specialty as (typeof ACGME_SPECIALTIES)[number])) {
      setError("Select a specialty from the list.");
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch("/api/v1/onboarding/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        specialty,
        career_stage: careerStage,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message ?? "Could not save profile");
      setLoading(false);
      return;
    }
    router.replace(data.redirect ?? "/app/dashboard?welcome=1");
    router.refresh();
  }

  function pickSpecialty(value: string) {
    setSpecialty(value);
    setSpecialtyQuery(value);
    setListOpen(false);
    setError("");
  }

  return (
    <div className="mx-auto max-w-lg py-8">
      <Card>
        <p className="text-xs font-medium uppercase tracking-wide text-cx-forest-dark/70">
          Welcome · About 2 minutes
        </p>
        <h1 className="mt-1 text-xl font-semibold text-cx-forest-dark">Let&apos;s get you set up</h1>
        <p className="mt-2 text-sm text-cx-forest-dark/80">
          Name, specialty, and role — then Coach Mak takes over. The rest of onboarding happens
          through conversation (about 10–15 minutes), not forms.
        </p>

        <div className="mt-6 space-y-5">
          <div>
            <label htmlFor="onboarding-name" className="text-sm font-semibold text-cx-forest-dark">
              Your name
            </label>
            <input
              id="onboarding-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
              className="cx-field mt-2 min-h-11 w-full"
              autoComplete="name"
            />
          </div>

          <div className="relative">
            <label htmlFor="specialty-search" className="text-sm font-semibold text-cx-forest-dark">
              Specialty
            </label>
            <input
              id="specialty-search"
              type="text"
              value={specialtyQuery}
              onChange={(e) => {
                setSpecialtyQuery(e.target.value);
                setSpecialty("");
                setListOpen(true);
              }}
              onFocus={() => setListOpen(true)}
              placeholder="Start typing, e.g. Cardiology…"
              className="cx-field mt-2 min-h-11 w-full"
              autoComplete="off"
            />
            {listOpen && (
              <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-xl border border-cx-forest-dark/15 bg-white shadow-md">
                {filteredSpecialties.length === 0 ? (
                  <li className="px-4 py-3 text-sm text-cx-forest-dark/60">No matches</li>
                ) : (
                  filteredSpecialties.map((s) => (
                    <li key={s}>
                      <button
                        type="button"
                        onClick={() => pickSpecialty(s)}
                        className={`w-full px-4 py-2.5 text-left text-sm hover:bg-cx-forest-dark/5 ${
                          specialty === s
                            ? "bg-cx-forest-dark/10 font-semibold text-cx-forest-dark"
                            : "text-cx-forest-dark/80"
                        }`}
                      >
                        {s}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>

          <div>
            <p className="text-sm font-semibold text-cx-forest-dark">Career stage / role</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {CAREER_STAGES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setCareerStage(s)}
                  className={`rounded-xl border px-3 py-2.5 text-left text-sm ${
                    careerStage === s
                      ? "border-cx-forest-dark bg-cx-forest-dark/10 font-semibold text-cx-forest-dark"
                      : "border-cx-forest-dark/20 text-cx-forest-dark/80 hover:bg-cx-forest-dark/5"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <Button className="w-full" onClick={submitProfile} disabled={loading}>
            {loading ? "Saving…" : "Meet Coach Mak"}
          </Button>
        </div>

        {error && (
          <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
            {error}
          </p>
        )}
      </Card>
    </div>
  );
}

```

## src/components/onboarding/Tier2Onboarding.tsx

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageShell } from "@/components/layout/PageShell";
import { Upload } from "lucide-react";
import {
  ACCEPTED_CV_ACCEPT,
  ACCEPTED_CV_LABEL,
  isAcceptedCvFileName,
} from "@/lib/v2/document-upload";

export function Tier2Onboarding() {
  const router = useRouter();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [pasteText, setPasteText] = useState("");

  useEffect(() => {
    fetch("/api/v1/users/me")
      .then((r) => r.json())
      .then((u) => {
        if (!u.tier1_complete) router.replace("/app/onboarding");
        if (u.tier2_complete) router.replace("/app/dashboard");
      })
      .catch(() => {});
  }, [router]);

  async function uploadFile(file: File) {
    setProcessing(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("document_type", "CV");
      const res = await fetch("/api/v1/documents", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Upload failed");

      await fetch("/api/v1/mempalace/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      router.replace("/app/dashboard");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
      setProcessing(false);
    }
  }

  async function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isAcceptedCvFileName(file.name)) {
      setError(`Upload ${ACCEPTED_CV_LABEL}, or paste your CV text below.`);
      return;
    }
    await uploadFile(file);
    e.target.value = "";
  }

  async function onPasteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pasteText.trim()) return;
    const blob = new Blob([pasteText.trim()], { type: "text/plain" });
    await uploadFile(new File([blob], "pasted-cv.txt", { type: "text/plain" }));
  }

  function skip() {
    router.replace("/app/dashboard");
    router.refresh();
  }

  return (
    <PageShell
      eyebrow="Optional"
      title="Upload your CV"
      subtitle="Mak uses your CV to personalize coaching, surface invisible work, and prefill promotion narratives."
      maxWidth="md"
      className="py-4"
    >
      <Card>
        <label
          htmlFor="tier2-cv-upload"
          className="flex cursor-pointer flex-col items-center rounded-2xl border-2 border-dashed border-cx-forest-dark/25 bg-cx-forest-dark/[0.03] px-6 py-10 transition-colors hover:border-cx-forest-dark/40 hover:bg-cx-forest-dark/[0.06]"
        >
          <Upload className="text-cx-forest-dark" size={28} />
          <p className="mt-3 font-semibold text-cx-forest-dark">Drop or click to upload CV</p>
          <p className="mt-1 text-sm text-cx-forest-dark/70">{ACCEPTED_CV_LABEL}</p>
          <input
            id="tier2-cv-upload"
            type="file"
            accept={ACCEPTED_CV_ACCEPT}
            className="hidden"
            onChange={onFileSelect}
            disabled={processing}
          />
        </label>

        <form onSubmit={onPasteSubmit} className="mt-6 space-y-3">
          <label htmlFor="tier2-paste" className="text-xs font-medium uppercase tracking-wide text-cx-forest-dark/70">
            Or paste CV text
          </label>
          <textarea
            id="tier2-paste"
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={5}
            placeholder="Paste CV content here…"
            className="w-full rounded-xl border border-cx-forest-dark/20 p-4 text-base text-cx-forest-dark"
          />
          <Button type="submit" disabled={processing || !pasteText.trim()}>
            Upload pasted text
          </Button>
        </form>

        {processing && (
          <p className="mt-4 text-center text-sm text-cx-forest-dark/70">
            Uploading and syncing to MemPalace…
          </p>
        )}
        {error && (
          <p className="cx-alert-banner mt-4 px-4 py-3 text-sm">
            {error}
          </p>
        )}

        <Button variant="secondary" className="mt-6 w-full" onClick={skip} disabled={processing}>
          Skip for now
        </Button>
      </Card>
    </PageShell>
  );
}

```

## src/components/onboarding/Touchpoint1Onboarding.tsx

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageShell } from "@/components/layout/PageShell";
import { CheckCircle2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CAREER_LEVELS,
  PRACTICE_SETTINGS,
  ACADEMIC_RANKS,
  PRIMARY_CAREER_TRACKS,
  requiresAcademicRank,
  type AcademicRank,
  type CareerLevel,
  type PracticeSetting,
  type PrimaryCareerTrack,
} from "@/lib/v2/onboarding-options";
import {
  defaultTrainingComplete,
  isValidBaseSpecialty,
  migrateLegacySpecialty,
} from "@/lib/v2/specialty-hierarchy";
import { SpecialtyIntakeFields } from "@/components/onboarding/SpecialtyIntakeFields";
import { OnboardingWelcome } from "@/components/onboarding/OnboardingWelcome";
import { OnboardingDocumentsStep } from "@/components/onboarding/OnboardingDocumentsStep";
import { ReconciliationItemCard } from "@/components/onboarding/ReconciliationItemCard";
import { isNpiReconcileItem } from "@/lib/v2/npi-registry";
import type { NpiRegistryStatus } from "@/components/profile/NpiRegistryPanel";
import { useAppShell } from "@/components/layout/AppShell";
import { buildReconcileGreeting } from "@/lib/v2/reconcile-mak-helpers";

type OnboardingStep = "welcome" | "profile" | "documents" | "reconcile" | "instruments";

type InstrumentSpec = {
  id: string;
  name: string;
  items: number;
  minutes: number;
  description: string;
};

type ReconcileItem = {
  id: string;
  source: string;
  label: string;
  detail: string;
  status: "pending" | "confirmed" | "rejected";
};

const STEPS: { id: OnboardingStep; label: string }[] = [
  { id: "welcome", label: "Welcome" },
  { id: "profile", label: "Profile" },
  { id: "documents", label: "Documents" },
  { id: "reconcile", label: "Reconcile" },
  { id: "instruments", label: "Coach Mak" },
];

export function Touchpoint1Onboarding() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { startMakFlow } = useAppShell();
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Profile fields
  const [name, setName] = useState("");
  const [baseSpecialty, setBaseSpecialty] = useState("");
  const [baseQuery, setBaseQuery] = useState("");
  const [baseListOpen, setBaseListOpen] = useState(false);
  const [subspecialty, setSubspecialty] = useState("");
  const [subspecialtyQuery, setSubspecialtyQuery] = useState("");
  const [subspecialtyListOpen, setSubspecialtyListOpen] = useState(false);
  const [trainingComplete, setTrainingComplete] = useState(false);
  const [careerLevel, setCareerLevel] = useState<CareerLevel>("Fellow");
  const [practiceSetting, setPracticeSetting] = useState<PracticeSetting>("Academic");
  const [academicRank, setAcademicRank] = useState<AcademicRank>("Assistant Professor");
  const [careerTrack, setCareerTrack] = useState<PrimaryCareerTrack>("Clinician");

  function applyProfileSpecialty(profile: {
    base_specialty?: string | null;
    subspecialty?: string | null;
    specialty?: string | null;
    subspecialty_training_complete?: boolean;
    career_stage?: CareerLevel | null;
  }) {
    const normalized = profile.base_specialty
      ? {
          base_specialty: profile.base_specialty,
          subspecialty: profile.subspecialty ?? null,
          subspecialty_training_complete: Boolean(profile.subspecialty_training_complete),
        }
      : migrateLegacySpecialty(profile.specialty ?? null);

    if (normalized.base_specialty) {
      setBaseSpecialty(normalized.base_specialty);
      setBaseQuery(normalized.base_specialty);
    }
    if (normalized.subspecialty) {
      setSubspecialty(normalized.subspecialty);
      setSubspecialtyQuery(normalized.subspecialty);
      setTrainingComplete(
        profile.subspecialty_training_complete ??
          defaultTrainingComplete(profile.career_stage ?? careerLevel, normalized.subspecialty),
      );
    }
  }

  // Plan data
  const [instruments, setInstruments] = useState<InstrumentSpec[]>([]);
  const [reconcileItems, setReconcileItems] = useState<ReconcileItem[]>([]);
  const [savedNpi, setSavedNpi] = useState("");
  const [npiStatus, setNpiStatus] = useState<NpiRegistryStatus | null>(null);

  const resolveStep = useCallback(
    (u: {
      tier1_complete?: boolean;
      tier2_complete?: boolean;
      tier3_complete?: boolean;
      cv_uploaded?: boolean;
      pending_reconcile_count?: number;
    }) => {
      if (u.tier3_complete) {
        router.replace("/app/dashboard");
        return;
      }
      const param = searchParams.get("step") as OnboardingStep | null;
      if (param && STEPS.some((s) => s.id === param)) {
        setStep(param);
        return;
      }
      if (!u.tier1_complete) setStep("welcome");
      else if (u.cv_uploaded && (u.pending_reconcile_count ?? 0) > 0 && !u.tier2_complete) {
        setStep("reconcile");
      } else if (!u.tier2_complete) setStep("documents");
      else setStep("instruments");
    },
    [router, searchParams],
  );

  useEffect(() => {
    fetch("/api/v1/onboarding/touchpoint1")
      .then((r) => r.json())
      .then((data) => {
        if (data.profile?.name) setName(data.profile.name);
        if (data.profile) {
          applyProfileSpecialty(data.profile);
        }
        if (data.profile?.career_stage) setCareerLevel(data.profile.career_stage);
        if (data.profile?.practice_setting) setPracticeSetting(data.profile.practice_setting);
        if (data.profile?.academic_rank) setAcademicRank(data.profile.academic_rank);
        if (data.profile?.primary_career_track) setCareerTrack(data.profile.primary_career_track);
        if (data.instruments) setInstruments(data.instruments);
        resolveStep(data);
      })
      .catch(() => {});
  }, [resolveStep]);

  function refreshReconciliation() {
    fetch("/api/v1/onboarding/reconciliation")
      .then((r) => r.json())
      .then((d) => {
        setReconcileItems(d.items ?? []);
        if (typeof d.npi === "string") setSavedNpi(d.npi);
        setNpiStatus({
          npi: d.npi ?? null,
          npi_verified: Boolean(d.npi_verified),
          deferred: Boolean(d.npi_verification_deferred),
          provider_name: d.provider_name ?? null,
          credential: d.credential ?? null,
          organization: d.organization ?? null,
          registry_url: d.npi ? `https://npiregistry.cms.hhs.gov/provider-view/${d.npi}` : null,
        });
      })
      .catch(() => {});
  }

  useEffect(() => {
    if (step === "reconcile") {
      refreshReconciliation();
    }
  }, [step]);

  async function submitProfile() {
    if (!name.trim()) {
      setError("Enter your name.");
      return;
    }
    if (!baseSpecialty || !isValidBaseSpecialty(baseSpecialty)) {
      setError("Select a base specialty from the list.");
      return;
    }
    setLoading(true);
    setError("");
    const res = await fetch("/api/v1/onboarding/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
        base_specialty: baseSpecialty,
        subspecialty: subspecialty || null,
        subspecialty_training_complete: subspecialty ? trainingComplete : false,
        career_stage: careerLevel,
        practice_setting: practiceSetting,
        academic_rank: requiresAcademicRank(practiceSetting) ? academicRank : null,
        primary_career_track: careerTrack,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message ?? "Could not save profile");
      setLoading(false);
      return;
    }
    setLoading(false);
    setStep("documents");
    router.replace("/app/onboarding?step=documents");
  }

  function goToReconcile() {
    setStep("reconcile");
    router.replace("/app/onboarding?step=reconcile");
  }

  async function submitReconciliation() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/v1/onboarding/reconciliation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: reconcileItems.map((i) => ({
          id: i.id,
          status: i.status === "rejected" ? "rejected" : "confirmed",
        })),
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.message ?? "Could not save reconciliation");
      setLoading(false);
      return;
    }
    setLoading(false);
    setStep("instruments");
    router.replace("/app/onboarding?step=instruments");
  }

  function canContinueReconcile(): boolean {
    return reconcileItems.every((item) => {
      if (item.status !== "pending") return true;
      return false;
    });
  }

  function handleNpiSkipped() {
    refreshReconciliation();
  }

  function toggleReconcile(id: string, status: "confirmed" | "rejected") {
    setReconcileItems((items) =>
      items.map((i) => (i.id === id ? { ...i, status } : i)),
    );
  }

  function handleNpiVerified(id: string, status: "confirmed" | "rejected") {
    toggleReconcile(id, status);
    refreshReconciliation();
  }

  async function startMakConversation() {
    router.replace("/app/dashboard?welcome=1&onboarding=instruments");
    router.refresh();
  }

  function pickBaseSpecialty(value: string) {
    setBaseSpecialty(value);
    setBaseQuery(value);
    setBaseListOpen(false);
    setSubspecialty("");
    setSubspecialtyQuery("");
    setTrainingComplete(false);
    setError("");
  }

  function pickSubspecialty(value: string) {
    setSubspecialty(value);
    setSubspecialtyQuery(value);
    setSubspecialtyListOpen(false);
    setTrainingComplete(defaultTrainingComplete(careerLevel, value || null));
    setError("");
  }

  const stepIndex = STEPS.findIndex((s) => s.id === step);
  const estimatedMinutes = instruments.reduce((s, i) => s + i.minutes, 0);

  return (
    <PageShell
      eyebrow="Setup"
      title="Get started"
      subtitle="Complete each step to unlock your dashboard"
      maxWidth="md"
      className="py-4"
    >
      <div className="mb-6 flex gap-1 overflow-x-auto">
        {STEPS.map((s, i) => (
          <div
            key={s.id}
            className={cn(
              "cx-nav-pill flex shrink-0 items-center gap-1.5 text-xs",
              i === stepIndex
                ? "cx-nav-pill-active"
                : i < stepIndex
                  ? "cx-nav-pill-inactive bg-cx-forest-dark/10"
                  : "cx-nav-pill-inactive opacity-60",
            )}
          >
            {i < stepIndex ? <CheckCircle2 size={14} /> : <Circle size={14} />}
            {s.label}
          </div>
        ))}
      </div>

      {step === "welcome" && (
        <OnboardingWelcome onBegin={() => {
          setStep("profile");
          router.replace("/app/onboarding?step=profile");
        }} />
      )}

      {step === "profile" && (
        <Card>
          <p className="text-cx-label uppercase">
            Step 2 of 7 · Profile configuration · ~3 minutes
          </p>
          <h1 className="mt-1 text-page-title">Profile configuration</h1>
          <p className="mt-2 text-sm text-cx-forest-dark/80">
            These fields determine benchmarks, document requirements, questionnaire modules, and
            Career Map positioning.
          </p>

          <div className="mt-6 space-y-5">
            <div>
              <label htmlFor="onboarding-name" className="cx-field-label">
                Your name
              </label>
              <input
                id="onboarding-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Smith"
                className="cx-field mt-2"
                autoComplete="name"
              />
            </div>

            <SpecialtyIntakeFields
              baseSpecialty={baseSpecialty}
              baseQuery={baseQuery}
              onBaseQueryChange={setBaseQuery}
              onPickBase={pickBaseSpecialty}
              baseListOpen={baseListOpen}
              onBaseListOpenChange={setBaseListOpen}
              subspecialty={subspecialty}
              subspecialtyQuery={subspecialtyQuery}
              onSubspecialtyQueryChange={setSubspecialtyQuery}
              onPickSubspecialty={pickSubspecialty}
              subspecialtyListOpen={subspecialtyListOpen}
              onSubspecialtyListOpenChange={setSubspecialtyListOpen}
              trainingComplete={trainingComplete}
              onTrainingCompleteChange={setTrainingComplete}
              careerStage={careerLevel}
            />

            <div>
              <p className="text-sm font-semibold">Career level</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {CAREER_LEVELS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setCareerLevel(s);
                      if (subspecialty) {
                        setTrainingComplete(defaultTrainingComplete(s, subspecialty));
                      }
                    }}
                    className={`rounded-lg border px-3 py-2.5 text-left text-sm ${
                      careerLevel === s
                        ? "border-cx-forest-dark bg-cx-forest-dark/10 font-semibold"
                        : "border-cx-forest-dark/20 hover:bg-cx-forest-dark/5"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold">Practice setting</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {PRACTICE_SETTINGS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setPracticeSetting(s)}
                    className={`rounded-lg border px-3 py-2.5 text-left text-sm ${
                      practiceSetting === s
                        ? "border-cx-forest-dark bg-cx-forest-dark/10 font-semibold"
                        : "border-cx-forest-dark/20 hover:bg-cx-forest-dark/5"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {requiresAcademicRank(practiceSetting) && (
              <div>
                <p className="text-sm font-semibold">Academic rank</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {ACADEMIC_RANKS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setAcademicRank(r)}
                      className={`rounded-lg border px-3 py-2.5 text-left text-sm ${
                        academicRank === r
                          ? "border-cx-forest-dark bg-cx-forest-dark/10 font-semibold"
                          : "border-cx-forest-dark/20 hover:bg-cx-forest-dark/5"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <p className="text-sm font-semibold">Primary career track</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                {PRIMARY_CAREER_TRACKS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setCareerTrack(t)}
                    className={`rounded-lg border px-3 py-2.5 text-left text-sm ${
                      careerTrack === t
                        ? "border-cx-forest-dark bg-cx-forest-dark/10 font-semibold"
                        : "border-cx-forest-dark/20 hover:bg-cx-forest-dark/5"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <Button className="w-full" onClick={submitProfile} disabled={loading}>
              {loading ? "Saving…" : "Continue to documents"}
            </Button>
          </div>
          {error && (
            <p className="cx-alert-banner mt-3 px-4 py-3 text-sm">
              {error}
            </p>
          )}
        </Card>
      )}

      {step === "documents" && (
        <OnboardingDocumentsStep onContinue={goToReconcile} continueDisabled={loading} />
      )}

      {step === "reconcile" && (
        <Card>
          <h1 className="text-page-title">Confirm discovered items</h1>

          <ul className="mt-6 space-y-4">
            {reconcileItems.map((item) => (
              <ReconciliationItemCard
                key={item.id}
                item={item}
                initialNpi={savedNpi}
                npiStatus={isNpiReconcileItem(item) ? npiStatus : null}
                onToggle={toggleReconcile}
                onNpiVerified={handleNpiVerified}
                onNpiSkipped={handleNpiSkipped}
              />
            ))}
          </ul>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Button
              className="flex-1"
              onClick={() =>
                startMakFlow(
                  "review",
                  "/app/objective?tab=reconcile",
                  buildReconcileGreeting({ reconciliation: reconcileItems.map((i) => ({ id: i.id, status: i.status })) }),
                )
              }
            >
              Review with Mak
            </Button>
            <Button
              className="flex-1"
              variant="secondary"
              onClick={submitReconciliation}
              disabled={loading || !canContinueReconcile()}
            >
              {loading ? "Saving…" : "Continue to self-assessment"}
            </Button>
          </div>
          {error && (
            <p className="cx-alert-banner mt-3 px-4 py-3 text-sm">
              {error}
            </p>
          )}
        </Card>
      )}

      {step === "instruments" && (
        <Card>
          <p className="text-cx-label uppercase">
            Touchpoint 1 · Step 4 · ~{estimatedMinutes || 15} minutes
          </p>
          <h1 className="mt-1 text-page-title">Self-assessment with Coach Mak</h1>
          <p className="mt-2 text-sm text-cx-forest-dark/80">
            Validated instruments are embedded in a guided conversation — not a survey form.
            After completion, your Career Profile and dashboard generate automatically.
          </p>

          <ul className="mt-4 space-y-2">
            {instruments.map((inst) => (
              <li
                key={inst.id}
                className="rounded-md border border-cx-forest-dark/15 px-3 py-2 text-sm"
              >
                <span className="font-semibold">{inst.name}</span>
                <span className="text-cx-forest-dark/70">
                  {" "}
                  · {inst.items} items · ~{inst.minutes} min — {inst.description}
                </span>
              </li>
            ))}
          </ul>

          <Button className="mt-6 w-full" onClick={startMakConversation}>
            Start conversation with Coach Mak
          </Button>
          <p className="mt-3 text-center text-xs text-cx-forest-dark/70">
            Step 5 (dashboard generation) runs automatically when Mak finishes your instrument
            battery.
          </p>
        </Card>
      )}
    </PageShell>
  );
}

```

## src/components/profile/NpiRegistryPanel.tsx

```tsx
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { normalizeNpiInput } from "@/lib/v2/npi-registry";

export type NpiRegistryStatus = {
  npi: string | null;
  npi_verified: boolean;
  deferred: boolean;
  provider_name?: string | null;
  credential?: string | null;
  organization?: string | null;
  registry_url?: string | null;
};

type NpiRegistryPanelProps = {
  initialNpi?: string;
  status?: NpiRegistryStatus | null;
  reconciliationItemId?: string;
  showSkip?: boolean;
  skipPlacement?: "inline" | "corner";
  onVerified?: (data: NpiRegistryStatus) => void;
  onSkipped?: () => void;
  reloadAfterAction?: boolean;
};

export function NpiRegistryPanel({
  initialNpi = "",
  status,
  reconciliationItemId = "enrichment-npi",
  showSkip = false,
  skipPlacement = "inline",
  onVerified,
  onSkipped,
  reloadAfterAction = false,
}: NpiRegistryPanelProps) {
  const verified = Boolean(status?.npi_verified && status?.npi);
  const [npiValue, setNpiValue] = useState(status?.npi ?? initialNpi);
  const [verifying, setVerifying] = useState(false);
  const [skipping, setSkipping] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [registryUrl, setRegistryUrl] = useState<string | null>(status?.registry_url ?? null);

  useEffect(() => {
    setNpiValue(status?.npi ?? initialNpi);
    setRegistryUrl(status?.registry_url ?? null);
  }, [status?.npi, status?.registry_url, initialNpi]);

  async function loadStatus(): Promise<NpiRegistryStatus | null> {
    const res = await fetch("/api/v1/npi");
    if (!res.ok) return null;
    return (await res.json()) as NpiRegistryStatus;
  }

  async function verifyNpi() {
    const normalized = normalizeNpiInput(npiValue);
    if (normalized.length !== 10) {
      setVerifyError("Enter a valid 10-digit NPI number.");
      setVerifyMessage(null);
      return;
    }

    setVerifying(true);
    setVerifyError(null);
    setVerifyMessage(null);

    try {
      const res = await fetch("/api/v1/npi/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          npi: normalized,
          reconciliation_item_id: reconciliationItemId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "NPI verification failed");

      setRegistryUrl(typeof data.registry_url === "string" ? data.registry_url : null);
      if (data.verified) {
        setVerifyMessage(data.message ?? "NPI verified.");
        const nextStatus: NpiRegistryStatus = {
          npi: data.npi ?? normalized,
          npi_verified: true,
          deferred: false,
          provider_name: data.provider_name ?? null,
          credential: data.credential ?? null,
          organization: data.organization ?? null,
          registry_url: data.registry_url ?? null,
        };
        onVerified?.(nextStatus);
        if (reloadAfterAction) await loadStatus();
      } else {
        setVerifyError(data.message ?? "No provider found for this NPI.");
      }
    } catch (e) {
      setVerifyError(e instanceof Error ? e.message : "NPI verification failed");
    } finally {
      setVerifying(false);
    }
  }

  async function skipForNow() {
    setSkipping(true);
    setVerifyError(null);
    try {
      const res = await fetch("/api/v1/npi/skip", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Could not skip NPI verification");
      onSkipped?.();
    } catch (e) {
      setVerifyError(e instanceof Error ? e.message : "Could not skip NPI verification");
    } finally {
      setSkipping(false);
    }
  }

  const skipControl = showSkip ? (
    <button
      type="button"
      disabled={verifying || skipping}
      onClick={() => void skipForNow()}
      className="text-sm font-medium text-cx-forest-dark/80 underline hover:text-cx-forest-dark"
    >
      {skipping ? "Skipping…" : "Skip for now"}
    </button>
  ) : null;

  if (verified && status) {
    return (
      <div className="space-y-2 text-sm text-cx-forest-dark">
        <p>
          <span className="font-semibold">NPI:</span> {status.npi}
        </p>
        {status.provider_name && (
          <p>
            <span className="font-semibold">Provider:</span> {status.provider_name}
            {status.credential ? ` (${status.credential})` : ""}
          </p>
        )}
        {status.organization && (
          <p>
            <span className="font-semibold">Location:</span> {status.organization}
          </p>
        )}
        {(registryUrl || status.registry_url) && (
          <a
            href={registryUrl ?? status.registry_url ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block font-medium text-cx-forest-dark underline hover:text-cx-forest-dark/80"
          >
            View in CMS NPPES registry
          </a>
        )}
      </div>
    );
  }

  return (
    <>
      {showSkip && skipPlacement === "corner" && (
        <div className="absolute right-5 top-5">{skipControl}</div>
      )}
      <div className="space-y-3">
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={npiValue}
        onChange={(e) => {
          setNpiValue(normalizeNpiInput(e.target.value));
          setVerifyError(null);
          setVerifyMessage(null);
        }}
        placeholder="10-digit NPI"
        className="cx-field w-full"
        maxLength={10}
      />
      <div className="flex items-center gap-3">
        <Button
          type="button"
          disabled={verifying || skipping || npiValue.length !== 10}
          onClick={() => void verifyNpi()}
        >
          {verifying ? "Checking NPPES…" : "Verify with NPPES registry"}
        </Button>
      </div>
      {verifyMessage && (
        <p className="rounded-md border border-cx-success/30 bg-cx-success/10 px-3 py-2 text-sm text-cx-forest-dark">
          {verifyMessage}
        </p>
      )}
      {verifyError && (
        <p className="rounded-md border border-cx-attention/30 bg-cx-attention/10 px-3 py-2 text-sm text-cx-forest-dark">
          {verifyError}
        </p>
      )}
      {registryUrl && (
        <a
          href={registryUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm font-medium text-cx-forest-dark underline hover:text-cx-forest-dark/80"
        >
          View in CMS NPPES registry
        </a>
      )}
      </div>
    </>
  );
}

```

## src/components/profile/ProfileMenu.tsx

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Camera, LogOut, Settings, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppShell } from "@/components/layout/AppShell";
import { UserAvatar } from "@/components/profile/UserAvatar";
import {
  AVATAR_CHANGED_EVENT,
  getProfileAvatarUrl,
  processAvatarFile,
} from "@/lib/profile-avatar";

export function ProfileMenu() {
  const { displayName } = useAppShell();
  const [open, setOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAvatarUrl(getProfileAvatarUrl());
    function onAvatarChange(e: Event) {
      const detail = (e as CustomEvent<string | null>).detail;
      setAvatarUrl(detail ?? getProfileAvatarUrl());
    }
    window.addEventListener(AVATAR_CHANGED_EVENT, onAvatarChange);
    return () => window.removeEventListener(AVATAR_CHANGED_EVENT, onAvatarChange);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError(null);
    try {
      await processAvatarFile(file);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update photo.");
    }
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-full transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cx-forest-dark"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
      >
        <UserAvatar src={avatarUrl} name={displayName} size="sm" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-50 min-w-[200px] overflow-hidden rounded-xl border border-cx-forest-dark/15 bg-white py-1 shadow-lg"
        >
          <div className="border-b border-cx-forest-dark/10 px-4 py-3">
            <p className="truncate text-sm font-semibold text-cx-forest-dark">
              {displayName ?? "Your account"}
            </p>
            {error && <p className="mt-1 text-xs text-cx-attention">{error}</p>}
          </div>
          <Link
            href="/app/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-cx-forest-dark transition-colors hover:bg-cx-forest-dark/5"
          >
            <User size={16} className="text-cx-forest-dark/60" />
            Profile
          </Link>
          <Link
            href="/app/settings"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-cx-forest-dark transition-colors hover:bg-cx-forest-dark/5"
          >
            <Settings size={16} className="text-cx-forest-dark/60" />
            Settings
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={() => fileRef.current?.click()}
            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-cx-forest-dark transition-colors hover:bg-cx-forest-dark/5"
          >
            <Camera size={16} className="text-cx-forest-dark/60" />
            Change photo
          </button>
          <Link
            href="/login"
            role="menuitem"
            onClick={() => setOpen(false)}
            className={cn(
              "flex w-full items-center gap-2.5 border-t border-cx-forest-dark/10 px-4 py-2.5 text-sm text-cx-forest-dark/70 transition-colors hover:bg-cx-forest-dark/5 hover:text-cx-forest-dark",
            )}
          >
            <LogOut size={16} />
            Sign out
          </Link>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        aria-hidden
        onChange={(e) => void handleFileChange(e)}
      />
    </div>
  );
}

```

## src/components/profile/UserAvatar.tsx

```tsx
"use client";

import { User } from "lucide-react";
import { cn } from "@/lib/utils";

type UserAvatarProps = {
  src?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const SIZE = {
  sm: "h-9 w-9 text-xs",
  md: "h-12 w-12 text-sm",
  lg: "h-20 w-20 text-lg",
} as const;

function initialsFromName(name?: string | null): string {
  if (!name?.trim()) return "";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

export function UserAvatar({ src, name, size = "sm", className }: UserAvatarProps) {
  const initials = initialsFromName(name);

  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-cx-forest-dark/10 font-semibold text-cx-forest-dark ring-1 ring-cx-forest-dark/15",
        SIZE[size],
        className,
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : initials ? (
        <span aria-hidden>{initials}</span>
      ) : (
        <User size={size === "lg" ? 28 : size === "md" ? 20 : 18} aria-hidden />
      )}
    </span>
  );
}

```

## src/components/settings/PremiumUpgradePanel.tsx

```tsx
"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { CardSection } from "@/components/ui/CardSection";
import { Button } from "@/components/ui/Button";

type SubscriptionState = {
  tier: "free" | "premium";
  stripe_configured: boolean;
};

export function PremiumUpgradePanel() {
  const [state, setState] = useState<SubscriptionState | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/subscription")
      .then((r) => r.json())
      .then((data) => setState({ tier: data.tier, stripe_configured: data.stripe_configured }))
      .catch(() => setState({ tier: "free", stripe_configured: false }));
  }, []);

  async function startCheckout(planType: "monthly" | "annual") {
    setLoading(planType);
    setError(null);
    try {
      const res = await fetch("/api/v1/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      if (data.url) window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setLoading(null);
    }
  }

  async function openPortal() {
    setLoading("portal");
    setError(null);
    try {
      const res = await fetch("/api/v1/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "portal" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Portal failed");
      if (data.url) window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Portal failed");
    } finally {
      setLoading(null);
    }
  }

  if (!state) return null;

  return (
    <CardSection
      eyebrow="Premium"
      title={state.tier === "premium" ? "Premium active" : "Upgrade to Premium"}
      description={
        state.tier === "premium"
          ? "You have full AI coaching, ontology classification, and job matching."
          : "Free tier includes keyword coaching. Premium unlocks AI-powered Mak ($9/month)."
      }
      icon={Sparkles}
    >
      {state.tier === "premium" ? (
        <Button variant="secondary" onClick={openPortal} disabled={loading === "portal"}>
          {loading === "portal" ? "Opening…" : "Manage subscription"}
        </Button>
      ) : state.stripe_configured ? (
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => startCheckout("monthly")} disabled={Boolean(loading)}>
            {loading === "monthly" ? "Redirecting…" : "Upgrade — $9/month"}
          </Button>
          <Button variant="secondary" onClick={() => startCheckout("annual")} disabled={Boolean(loading)}>
            {loading === "annual" ? "Redirecting…" : "Annual — $99/year"}
          </Button>
        </div>
      ) : (
        <p className="text-sm text-cx-forest-dark/70">
          Stripe is not configured yet. Add STRIPE_SECRET_KEY and price IDs to enable checkout.
        </p>
      )}
      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
    </CardSection>
  );
}

```

## src/components/studio/EvidenceChipNode.tsx

```tsx
import {
  $applyNodeReplacement,
  DecoratorNode,
  type DOMExportOutput,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from "lexical";
import type { JSX } from "react";

export type SerializedEvidenceChipNode = Spread<
  {
    evidenceId: string;
    evidenceText: string;
  },
  SerializedLexicalNode
>;

function EvidenceChipComponent({
  text,
}: {
  evidenceId: string;
  text: string;
}) {
  return (
    <span
      className="mx-0.5 inline-flex cursor-pointer items-center rounded-full bg-cx-forest-dark/10 px-2 py-0.5 text-xs font-semibold text-cx-forest-dark"
      title={text}
      contentEditable={false}
    >
      linked
    </span>
  );
}

export class EvidenceChipNode extends DecoratorNode<JSX.Element> {
  __evidenceId: string;
  __evidenceText: string;

  static getType(): string {
    return "evidence-chip";
  }

  static clone(node: EvidenceChipNode): EvidenceChipNode {
    return new EvidenceChipNode(
      node.__evidenceId,
      node.__evidenceText,
      node.__key,
    );
  }

  constructor(evidenceId: string, evidenceText: string, key?: NodeKey) {
    super(key);
    this.__evidenceId = evidenceId;
    this.__evidenceText = evidenceText;
  }

  createDOM(): HTMLElement {
    const span = document.createElement("span");
    span.className = "evidence-chip-wrapper";
    return span;
  }

  updateDOM(): false {
    return false;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("sup");
    element.textContent = "†";
    element.title = this.__evidenceText;
    return { element };
  }

  decorate(): JSX.Element {
    return (
      <EvidenceChipComponent
        evidenceId={this.__evidenceId}
        text={this.__evidenceText}
      />
    );
  }

  exportJSON(): SerializedEvidenceChipNode {
    return {
      type: "evidence-chip",
      version: 1,
      evidenceId: this.__evidenceId,
      evidenceText: this.__evidenceText,
    };
  }

  static importJSON(
    serialized: SerializedEvidenceChipNode,
  ): EvidenceChipNode {
    return $createEvidenceChipNode(
      serialized.evidenceId,
      serialized.evidenceText,
    );
  }

  getTextContent(): string {
    return this.__evidenceText;
  }

  getEvidenceId(): string {
    return this.__evidenceId;
  }

  getEvidenceText(): string {
    return this.__evidenceText;
  }

  isInline(): true {
    return true;
  }
}

export function $createEvidenceChipNode(
  evidenceId: string,
  evidenceText: string,
): EvidenceChipNode {
  return $applyNodeReplacement(
    new EvidenceChipNode(evidenceId, evidenceText),
  );
}

export function $isEvidenceChipNode(
  node: LexicalNode | null | undefined,
): node is EvidenceChipNode {
  return node instanceof EvidenceChipNode;
}

```

## src/components/studio/EvidenceDrawer.tsx

```tsx
"use client";

import { Paperclip } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CardSection } from "@/components/ui/CardSection";
import { MakDiscussLink } from "@/components/ui/MakDiscussLink";
import { OUTPUT_MAK } from "@/lib/card-mak-prompts";
import type { ActivityEntry } from "@/lib/types/database";

export function EvidenceDrawer({
  evidence,
  onInsertChip,
  onInsertText,
}: {
  evidence: ActivityEntry[];
  onInsertChip: (item: ActivityEntry) => void;
  onInsertText: (text: string) => void;
}) {
  return (
    <aside className="hidden w-64 shrink-0 space-y-4 overflow-y-auto lg:block">
      <CardSection
        compact
        eyebrow="Evidence"
        title="Career evidence"
        description={
          evidence.length === 0
            ? "Log activities to populate evidence."
            : `${evidence.length} item${evidence.length > 1 ? "s" : ""} available to cite.`
        }
        icon={Paperclip}
        mak={OUTPUT_MAK.evidence}
      />
      {evidence.map((item) => (
        <div
          key={item.id}
          className="cx-surface-elevated rounded-xl p-4 shadow-sm"
        >
          <p className="line-clamp-3 text-sm font-medium text-cx-forest-dark">{item.raw_text}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {item.primary_domain && (
              <Badge className="text-xs">{item.primary_domain}</Badge>
            )}
            {item.primary_track && (
              <Badge className="text-xs">{item.primary_track}</Badge>
            )}
            {item.energy_valence?.includes("energiz") && (
              <Badge energy="energizing" className="text-xs">
                energizing
              </Badge>
            )}
          </div>
          <p className="mt-1 text-xs text-cx-forest-dark/70">{item.activity_date}</p>
          <div className="mt-2 flex flex-col gap-1">
            <Button
              variant="link"
              className="justify-start text-sm"
              onClick={() => onInsertChip(item)}
            >
              Insert chip
            </Button>
            <Button
              variant="link"
              className="justify-start text-sm"
              onClick={() => onInsertText(item.raw_text ?? "")}
            >
              Insert text
            </Button>
          </div>
          <div className="mt-2 border-t border-cx-forest-dark/15 pt-2">
            <MakDiscussLink
              mak={{
                ...OUTPUT_MAK.evidence,
                question: `Help me use this evidence in my document: "${(item.raw_text ?? "").slice(0, 80)}…"`,
              }}
              className="text-xs"
            />
          </div>
        </div>
      ))}
    </aside>
  );
}

```

## src/components/studio/StudioLexicalEditor.tsx

```tsx
"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $nodesOfType,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
  type LexicalEditor,
} from "lexical";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListItemNode,
  ListNode,
} from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import {
  EvidenceChipNode,
  $createEvidenceChipNode,
} from "@/components/studio/EvidenceChipNode";
import { saveDraft, loadDraft } from "@/lib/studio-versions";

const theme = {
  paragraph: "mb-2",
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
  },
  list: {
    ul: "list-disc pl-6 mb-2",
    ol: "list-decimal pl-6 mb-2",
    listitem: "mb-1",
  },
};

function Toolbar() {
  const [editor] = useLexicalComposerContext();

  return (
    <div className="flex flex-wrap gap-1 border-b border-cx-forest-dark/15 px-3 py-2">
      {[
        { label: "B", cmd: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold") },
        { label: "I", cmd: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic") },
        { label: "U", cmd: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline") },
        { label: "•", cmd: () => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined) },
        { label: "1.", cmd: () => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined) },
        { label: "↶", cmd: () => editor.dispatchCommand(UNDO_COMMAND, undefined) },
        { label: "↷", cmd: () => editor.dispatchCommand(REDO_COMMAND, undefined) },
      ].map(({ label, cmd }) => (
        <button
          key={label}
          type="button"
          onClick={cmd}
          className="min-h-9 min-w-9 rounded-md border border-cx-forest-dark/20 bg-white px-2 text-sm font-semibold text-cx-forest-dark hover:bg-cx-forest-dark/5"
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function AutoSavePlugin({
  templateId,
  onWordCount,
}: {
  templateId: string;
  onWordCount: (n: number) => void;
}) {
  const [editor] = useLexicalComposerContext();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const persist = useCallback(() => {
    const json = JSON.stringify(editor.getEditorState().toJSON());
    saveDraft(templateId, json);
    editor.getEditorState().read(() => {
      const text = $getRoot().getTextContent();
      onWordCount(text.split(/\s+/).filter(Boolean).length);
    });
  }, [editor, templateId, onWordCount]);

  useEffect(() => {
    const draft = loadDraft(templateId);
    if (draft) {
      try {
        const state = editor.parseEditorState(draft);
        editor.setEditorState(state);
      } catch {
        /* ignore bad draft */
      }
    }
    timerRef.current = setInterval(persist, 10000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [editor, templateId, persist]);

  return (
    <OnChangePlugin
      onChange={() => {
        editor.getEditorState().read(() => {
          const text = $getRoot().getTextContent();
          onWordCount(text.split(/\s+/).filter(Boolean).length);
        });
      }}
    />
  );
}

export type StudioEditorHandle = {
  insertEvidenceChip: (evidenceId: string, evidenceText: string) => void;
  insertPlainText: (text: string) => void;
  setPlainText: (text: string) => void;
  getPlainText: () => string;
  getEditorStateJson: () => string;
  restoreFromJson: (json: string) => void;
  getLinkedEvidence: () => { id: string; text: string }[];
};

type Props = {
  templateId: string;
  onWordCount: (n: number) => void;
};

export const StudioLexicalEditor = forwardRef<StudioEditorHandle, Props>(
  function StudioLexicalEditor({ templateId, onWordCount }, ref) {
    const editorRef = useRef<LexicalEditor | null>(null);

    useImperativeHandle(ref, () => ({
      insertEvidenceChip(evidenceId, evidenceText) {
        editorRef.current?.update(() => {
          const selection = $getSelection();
          const chip = $createEvidenceChipNode(evidenceId, evidenceText);
          const space = $createTextNode(" ");
          if ($isRangeSelection(selection)) {
            selection.insertNodes([space, chip, $createTextNode(" ")]);
          } else {
            const root = $getRoot();
            const p = $createParagraphNode();
            p.append(chip);
            root.append(p);
          }
        });
      },
      insertPlainText(text) {
        editorRef.current?.update(() => {
          const selection = $getSelection();
          const node = $createTextNode(text);
          if ($isRangeSelection(selection)) {
            selection.insertNodes([node]);
          } else {
            const root = $getRoot();
            const p = $createParagraphNode();
            p.append(node);
            root.append(p);
          }
        });
      },
      setPlainText(text) {
        editorRef.current?.update(() => {
          const root = $getRoot();
          root.clear();
          text.split(/\n/).forEach((line) => {
            const p = $createParagraphNode();
            if (line) p.append($createTextNode(line));
            root.append(p);
          });
        });
      },
      getPlainText() {
        let text = "";
        editorRef.current?.getEditorState().read(() => {
          text = $getRoot().getTextContent();
        });
        return text;
      },
      getEditorStateJson() {
        return JSON.stringify(
          editorRef.current?.getEditorState().toJSON() ?? {},
        );
      },
      restoreFromJson(json) {
        try {
          const state = editorRef.current?.parseEditorState(json);
          if (state) editorRef.current?.setEditorState(state);
        } catch {
          /* ignore */
        }
      },
      getLinkedEvidence() {
        const items: { id: string; text: string }[] = [];
        editorRef.current?.getEditorState().read(() => {
          for (const node of $nodesOfType(EvidenceChipNode)) {
            items.push({
              id: node.getEvidenceId(),
              text: node.getEvidenceText(),
            });
          }
        });
        return items;
      },
    }));

    const initialConfig = {
      namespace: `FiscmakStudio-${templateId}`,
      theme,
      nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, EvidenceChipNode],
      onError(error: Error) {
        console.error(error);
      },
    };

    return (
      <LexicalComposer initialConfig={initialConfig}>
        <EditorRefPlugin editorRef={editorRef} />
        <Toolbar />
        <div className="relative min-h-[400px] flex-1">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="min-h-[400px] resize-none px-6 py-4 text-base outline-none" />
            }
            placeholder={
              <div className="pointer-events-none absolute left-6 top-4 text-cx-forest-dark/50">
                Select a template and click Generate, or start writing…
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <ListPlugin />
        <AutoSavePlugin templateId={templateId} onWordCount={onWordCount} />
      </LexicalComposer>
    );
  },
);

function EditorRefPlugin({
  editorRef,
}: {
  editorRef: React.MutableRefObject<LexicalEditor | null>;
}) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    editorRef.current = editor;
    return () => {
      editorRef.current = null;
    };
  }, [editor, editorRef]);
  return null;
}

```

## src/components/studio/VersionHistoryPanel.tsx

```tsx
"use client";

import { History } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CardSection } from "@/components/ui/CardSection";
import { OUTPUT_MAK } from "@/lib/card-mak-prompts";
import type { DocumentVersion } from "@/lib/studio-versions";

export function VersionHistoryPanel({
  versions,
  onRestore,
}: {
  versions: DocumentVersion[];
  onRestore: (version: DocumentVersion) => void;
}) {
  if (versions.length === 0) return null;

  return (
    <CardSection
      compact
      className="mt-4"
      eyebrow="Versions"
      title="Version history"
      icon={History}
      mak={OUTPUT_MAK.version_history}
    >
      <ul className="max-h-40 space-y-2 overflow-y-auto">
        {versions.slice(0, 5).map((v) => (
          <li
            key={v.id}
            className="flex items-center justify-between gap-2 text-xs text-cx-forest-dark/70"
          >
            <span>
              v{v.version_number} ·{" "}
              {new Date(v.created_at).toLocaleString(undefined, {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </span>
            <Button
              variant="link"
              className="min-h-0 p-0 text-xs"
              onClick={() => onRestore(v)}
            >
              Restore
            </Button>
          </li>
        ))}
      </ul>
    </CardSection>
  );
}

```

## src/components/ui/Badge.tsx

```tsx
import { cn } from "@/lib/utils";

type Energy = "energizing" | "draining" | "neutral" | "default";

export function Badge({
  children,
  energy = "default",
  className,
}: {
  children: React.ReactNode;
  energy?: Energy;
  className?: string;
}) {
  const styles: Record<Energy, string> = {
    default: "bg-cx-forest-dark/10 text-cx-forest-dark",
    energizing: "bg-[#5FD65F]/15 text-cx-success",
    draining: "bg-fm-attention/10 text-fm-attention",
    neutral: "bg-fm-developing/15 text-fm-developing",
  };

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold",
        styles[energy],
        className,
      )}
    >
      {children}
    </span>
  );
}

```

## src/components/ui/Button.tsx

```tsx
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "destructive" | "link";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-cx-forest-dark text-white hover:bg-cx-forest-dark/90 active:border-2 active:border-[#5FD65F]",
  secondary:
    "bg-white text-cx-forest-dark border border-cx-forest-dark/20 hover:bg-cx-forest-dark/5",
  destructive: "bg-fm-attention text-white hover:opacity-90",
  link: "bg-transparent text-cx-forest-dark hover:text-cx-forest-dark/80 hover:underline p-0 min-h-0",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-md px-6 py-3 text-base font-semibold transition-colors disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  ),
);
Button.displayName = "Button";

```

## src/components/ui/Card.tsx

```tsx
import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export function Card({
  className,
  accent,
  glass,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { accent?: "green" | "red" | "amber"; glass?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-6",
        glass
          ? "cx-glass-card border-cx-forest-dark/10"
          : "border-cx-forest-dark/10 bg-cx-white shadow-sm",
        accent === "green" && "border-l-4 border-l-[#5FD65F]",
        accent === "red" && "border-l-4 border-l-red-500",
        accent === "amber" && "border-l-4 border-l-cx-attention",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

```

## src/components/ui/CardSection.tsx

```tsx
"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { MakDiscussLink } from "@/components/ui/MakDiscussLink";
import type { MakDiscussConfig } from "@/lib/card-mak-prompts";

export type CardSectionProps = {
  title: string;
  eyebrow?: string;
  description?: string;
  icon?: LucideIcon;
  accent?: "green" | "red" | "amber";
  mak?: MakDiscussConfig;
  action?: React.ReactNode;
  footer?: React.ReactNode;
  compact?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export function CardSectionHeader({
  title,
  eyebrow,
  description,
  icon: Icon,
  action,
  compact,
}: Pick<
  CardSectionProps,
  "title" | "eyebrow" | "description" | "icon" | "action" | "compact"
>) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-3",
        !compact && "border-b border-cx-forest-dark/15 pb-4",
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        {Icon && (
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cx-forest-dark/10 text-cx-forest-dark"
            aria-hidden
          >
            <Icon size={20} strokeWidth={2} />
          </div>
        )}
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-xs font-medium uppercase tracking-wide text-cx-forest-dark/70">
              {eyebrow}
            </p>
          )}
          <h2
            className={cn(
              "font-semibold text-cx-forest-dark",
              compact ? "text-base" : "mt-0.5 text-xl",
              eyebrow && !compact && "mt-1",
            )}
          >
            {title}
          </h2>
          {description && (
            <p
              className={cn(
                "text-sm text-cx-forest-dark/70",
                compact ? "mt-1" : "mt-1.5",
              )}
            >
              {description}
            </p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardSection({
  title,
  eyebrow,
  description,
  icon,
  accent,
  mak,
  action,
  footer,
  compact,
  className,
  children,
}: CardSectionProps) {
  const hasHeader = Boolean(title || eyebrow || description || icon || action);

  return (
    <Card accent={accent} className={className}>
      {hasHeader && (
        <CardSectionHeader
          title={title}
          eyebrow={eyebrow}
          description={description}
          icon={icon}
          action={action}
          compact={compact}
        />
      )}
      {children && (
        <div className={cn(hasHeader && (compact ? "mt-3" : "mt-4"))}>{children}</div>
      )}
      {(mak || footer) && (
        <div
          className={cn(
            "flex flex-wrap items-center gap-3",
            hasHeader || children ? "mt-4 border-t border-cx-forest-dark/15 pt-4" : "",
          )}
        >
          {mak && (
            <MakDiscussLink
              mak={mak}
              className="text-cx-forest-dark hover:text-cx-forest-dark/80"
            />
          )}
          {footer}
        </div>
      )}
    </Card>
  );
}

```

## src/components/ui/EmptyState.tsx

```tsx
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  ghost?: React.ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
  ghost,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-dashed border-cx-forest-dark/20 bg-cx-forest-dark/[0.03] p-8",
        className,
      )}
    >
      {ghost && (
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.07]"
          aria-hidden
        >
          {ghost}
        </div>
      )}
      <div className="relative max-w-lg">
        <h2 className="text-section-header">{title}</h2>
        <p className="mt-2 text-sm text-cx-forest-dark/70">{description}</p>
        {actionLabel && actionHref && (
          <Link href={actionHref} className="mt-4 inline-block">
            <Button>{actionLabel}</Button>
          </Link>
        )}
        {actionLabel && onAction && !actionHref && (
          <Button className="mt-4" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  );
}

```

## src/components/ui/Input.tsx

```tsx
import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement> & { label?: string }
>(({ className, label, id, ...props }, ref) => (
  <div className="flex flex-col gap-2">
    {label && (
      <label htmlFor={id} className="text-sm font-semibold text-cx-forest-dark">
        {label}
      </label>
    )}
    <input
      ref={ref}
      id={id}
      className={cn(
        "min-h-11 rounded-xl border border-cx-forest-dark/20 bg-white px-4 py-3 text-base text-cx-forest-dark focus:border-cx-forest-dark focus:outline-none",
        className,
      )}
      {...props}
    />
  </div>
));
Input.displayName = "Input";

```

## src/components/ui/LoadingSteps.tsx

```tsx
"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = {
  id: string;
  label: string;
  status: "pending" | "active" | "done";
};

export function LoadingSteps({ steps, className }: { steps: Step[]; className?: string }) {
  return (
    <ul className={cn("space-y-2", className)} aria-live="polite">
      {steps.map((step) => (
        <li
          key={step.id}
          className={cn(
            "flex items-center gap-2 text-sm",
            step.status === "done" && "text-cx-success",
            step.status === "active" && "font-medium text-cx-forest-dark",
            step.status === "pending" && "text-cx-forest-dark/50",
          )}
        >
          {step.status === "done" ? (
            <Check size={16} className="shrink-0 text-cx-success" aria-hidden />
          ) : (
            <span
              className={cn(
                "inline-block h-4 w-4 shrink-0 rounded-full border-2",
                step.status === "active" ? "border-[#5FD65F] animate-pulse" : "border-cx-forest-dark/20",
              )}
              aria-hidden
            />
          )}
          {step.label}
        </li>
      ))}
    </ul>
  );
}

```

## src/components/ui/MakDiscussLink.tsx

```tsx
"use client";

import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppShell } from "@/components/layout/AppShell";
import type { MakDiscussConfig } from "@/lib/card-mak-prompts";

type MakDiscussLinkProps = {
  mak: MakDiscussConfig;
  className?: string;
  variant?: "link" | "button";
};

export function MakDiscussLink({
  mak,
  className,
  variant = "link",
}: MakDiscussLinkProps) {
  const { startMakFlow, openMakWithMessage } = useAppShell();

  function handleClick() {
    if (mak.messageOnly) {
      openMakWithMessage(mak.autoMessage ?? mak.question, mak.navigateTo);
      return;
    }
    startMakFlow(
      mak.intent,
      mak.navigateTo,
      mak.question,
      mak.touchpoint,
      mak.goalFlow,
      mak.goalModifyId,
      mak.autoMessage,
    );
  }

  const label = mak.label ?? "Discuss with Mak";

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-cx-forest-dark/20 bg-white px-3 py-1.5 text-xs font-medium text-cx-forest-dark transition-colors hover:border-cx-forest-dark/35 hover:bg-cx-forest-dark/5",
          className,
        )}
      >
        <MessageCircle size={14} className="shrink-0 text-cx-forest-dark" aria-hidden />
        {label}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-medium text-cx-forest-dark transition-colors hover:text-cx-forest-dark/80",
        className,
      )}
    >
      <MessageCircle size={14} className="shrink-0" aria-hidden />
      {label}
    </button>
  );
}

```

## src/components/ui/MetricRow.tsx

```tsx
"use client";

import { StatusChip } from "@/components/ui/StatusChip";
import { TechnicalDetailToggle } from "@/components/ui/TechnicalDetailToggle";
import { MakDiscussLink } from "@/components/ui/MakDiscussLink";
import type { MakDiscussConfig } from "@/lib/card-mak-prompts";
import type { MetricStatus } from "@/lib/design-system";

type MetricRowProps = {
  label: string;
  summary: string;
  status?: MetricStatus;
  percentile?: number | null;
  trend?: string;
  technical?: Record<string, unknown>;
  sourceAttribution?: string;
  mak?: MakDiscussConfig;
};

export function MetricRow({
  label,
  summary,
  status,
  percentile,
  trend,
  technical,
  sourceAttribution,
  mak,
}: MetricRowProps) {
  return (
    <div className="rounded-xl border border-cx-forest-dark/10 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-sm font-semibold text-cx-forest-dark">{label}</p>
        {status && <StatusChip status={status} />}
      </div>
      <p className="mt-2 text-sm leading-relaxed text-cx-forest-dark/80">{summary}</p>
      {percentile != null && (
        <p className="mt-1 text-xs text-cx-forest-dark/60">Benchmark: {percentile}th percentile</p>
      )}
      {trend && <p className="mt-1 text-xs text-cx-forest-dark/60">{trend}</p>}
      {(technical || sourceAttribution) && (
        <TechnicalDetailToggle technical={technical} sources={sourceAttribution} />
      )}
      {mak && (
        <div className="mt-3 border-t border-cx-forest-dark/15 pt-3">
          <MakDiscussLink
            mak={mak}
            className="text-cx-forest-dark hover:text-cx-forest-dark/80"
          />
        </div>
      )}
    </div>
  );
}

```

## src/components/ui/ScoreDisplay.tsx

```tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export function ScoreDisplay({
  value,
  previousValue,
  className,
}: {
  value: number;
  previousValue?: number | null;
  className?: string;
}) {
  const [display, setDisplay] = useState(previousValue ?? value);
  const [pulse, setPulse] = useState(false);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      setDisplay(value);
      return;
    }
    if (previousValue != null && value !== previousValue) {
      setPulse(true);
      const start = previousValue;
      const end = value;
      const duration = 600;
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min(1, (now - t0) / duration);
        setDisplay(Math.round(start + (end - start) * p));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      const t = setTimeout(() => setPulse(false), 700);
      return () => clearTimeout(t);
    }
    setDisplay(value);
  }, [value, previousValue]);

  return (
    <span
      className={cn("text-score-hero", pulse && "animate-score-pulse", className)}
      aria-live="polite"
    >
      {display}
    </span>
  );
}

```

## src/components/ui/StatusChip.tsx

```tsx
import { cn } from "@/lib/utils";
import { STATUS_COLORS, STATUS_LABELS, type MetricStatus } from "@/lib/design-system";

export function StatusChip({
  status,
  className,
}: {
  status: MetricStatus;
  className?: string;
}) {
  const colors = STATUS_COLORS[status];
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
        colors.bg,
        colors.text,
        colors.border,
        className,
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

```

## src/components/ui/StatusIndicator.tsx

```tsx
"use client";

import { AlertTriangle, ArrowRight, Check, Circle, CircleDot } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatusKind = "done" | "active" | "attention" | "locked" | "upcoming";

const CONFIG: Record<
  StatusKind,
  { Icon: typeof Check; className: string; label: string }
> = {
  done: { Icon: Check, className: "text-cx-success", label: "Done" },
  active: { Icon: ArrowRight, className: "text-cx-forest-dark", label: "Active" },
  attention: { Icon: AlertTriangle, className: "text-cx-attention", label: "Attention" },
  locked: { Icon: Circle, className: "text-cx-forest-dark/50", label: "Locked" },
  upcoming: { Icon: CircleDot, className: "text-cx-forest-dark", label: "Upcoming" },
};

type StatusIndicatorProps = {
  status: StatusKind;
  size?: number;
  showLabel?: boolean;
  className?: string;
};

export function StatusIndicator({
  status,
  size = 16,
  showLabel = false,
  className,
}: StatusIndicatorProps) {
  const { Icon, className: colorClass, label } = CONFIG[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <Icon size={size} className={colorClass} aria-hidden />
      {showLabel && <span className="text-cx-label">{label}</span>}
      <span className="sr-only">{label}</span>
    </span>
  );
}

```

## src/components/ui/TechnicalDetailToggle.tsx

```tsx
"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export function TechnicalDetailToggle({
  technical,
  sources,
  className,
}: {
  technical?: Record<string, unknown>;
  sources?: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const entries = Object.entries(technical ?? {}).filter(([, v]) => v != null);

  if (entries.length === 0 && !sources) return null;

  return (
    <div className={cn("mt-2", className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex min-h-[44px] items-center gap-1 text-xs font-medium text-cx-forest-dark/70 hover:text-cx-forest-dark hover:underline"
      >
        {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        Show technical detail
      </button>
      {open && (
        <div className="mt-2 space-y-2 rounded-xl border border-cx-forest-dark/15 bg-cx-forest-dark/[0.03] px-3 py-2">
          {sources && <p className="text-cx-label">Source: {sources}</p>}
          {entries.length > 0 && (
            <dl className="space-y-1 text-xs">
              {entries.map(([key, value]) => (
                <div key={key} className="flex gap-2">
                  <dt className="shrink-0 font-mono text-cx-forest-dark/60">{key}:</dt>
                  <dd className="break-all text-cx-forest-dark">
                    {Array.isArray(value) ? value.join(", ") : String(value)}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      )}
    </div>
  );
}

export function DataSourceTooltip({
  sources,
  lastUpdated,
}: {
  sources: string;
  lastUpdated?: string;
}) {
  return (
    <p className="text-caption mt-1">
      Source: {sources}
      {lastUpdated ? `. Last updated: ${lastUpdated}` : ""}
    </p>
  );
}

```

## src/components/workspace/ActivitiesView.tsx

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CardSection } from "@/components/ui/CardSection";
import { Badge } from "@/components/ui/Badge";
import { ENERGY_OPTIONS } from "@/lib/constants";
import { OBJECTIVE_MAK } from "@/lib/card-mak-prompts";
import { fetchActivities } from "@/lib/activities-storage";
import { cn } from "@/lib/utils";
import type { ActivityEntry } from "@/lib/types/database";
import type { ClassificationResult } from "@/lib/types/database";

export function ActivitiesView() {
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [text, setText] = useState("");
  const [energy, setEnergy] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastClassification, setLastClassification] =
    useState<ClassificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadActivities = useCallback(async () => {
    const data = await fetchActivities();
    setActivities(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadActivities();
    const onLogged = () => void loadActivities();
    window.addEventListener("fiscmak:activity-logged", onLogged);
    return () => window.removeEventListener("fiscmak:activity-logged", onLogged);
  }, [loadActivities]);

  async function addActivity(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/v1/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim(), energy_valence: energy ?? undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message ?? "Failed to save activity");
      }

      if (data.activity) {
        setLastClassification({
          primary_domain: data.activity.primary_domain ?? "",
          primary_track: data.activity.primary_track ?? "",
          primary_domain_confidence: data.activity.primary_domain_confidence ?? 0,
          primary_track_confidence: data.activity.primary_track_confidence ?? 0,
          scope: data.activity.scope ?? "",
          evidence_strength: data.activity.evidence_strength ?? "",
          confidence_score: data.activity.confidence_score ?? 0,
          rationale: "",
        });
      }

      setText("");
      setEnergy(null);
      await loadActivities();
      window.dispatchEvent(new CustomEvent("fiscmak:activity-logged"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save activity");
    } finally {
      setSaving(false);
    }
  }

  function energyAccent(valence: string | null) {
    if (!valence) return undefined;
    if (valence.includes("drain")) return "red" as const;
    if (valence.includes("energiz")) return "green" as const;
    return "amber" as const;
  }

  function badgeEnergy(valence: string | null) {
    if (!valence) return "neutral" as const;
    if (valence.includes("drain")) return "draining" as const;
    if (valence.includes("energiz")) return "energizing" as const;
    return "neutral" as const;
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <CardSection
        eyebrow="Career Data"
        title="Log career evidence"
        description="Capture work that may not show on your CV — or tell Mak from the dashboard."
        icon={ClipboardList}
        mak={OBJECTIVE_MAK.activities}
      >
        <form onSubmit={addActivity} className="space-y-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            className="cx-field w-full"
            placeholder="Something meaningful that might not show up on a CV…"
            aria-label="Activity description"
          />
          <div>
            <p className="text-cx-label">Energy level (optional)</p>
            <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Energy level">
              {ENERGY_OPTIONS.map((o) => {
                const selected = energy === o.value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setEnergy(selected ? null : o.value)}
                    className={cn(
                      "cx-nav-pill text-sm",
                      selected ? "cx-nav-pill-active" : "cx-nav-pill-inactive",
                    )}
                  >
                    {o.label}
                  </button>
                );
              })}
            </div>
          </div>
          <Button type="submit" disabled={saving}>
            {saving ? "Saving & classifying…" : "Save activity"}
          </Button>
        </form>

        {lastClassification && (
          <div className="mt-4 rounded-xl border border-l-4 border-cx-forest-dark/15 border-l-[#5FD65F] bg-cx-forest-dark/[0.03] p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-cx-forest-dark/70">Classification</p>
            <p className="mt-1 font-semibold text-cx-forest-dark">
              {lastClassification.primary_domain} × {lastClassification.primary_track}
            </p>
            <p className="mt-1 text-sm text-cx-forest-dark/80">
              {Math.round(lastClassification.confidence_score * 100)}% confidence
            </p>
          </div>
        )}
      </CardSection>

      <CardSection
        eyebrow="History"
        title="Recent activities"
        mak={OBJECTIVE_MAK.activities}
      >
        {loading && <p className="text-sm text-cx-forest-dark/70">Loading…</p>}
        {!loading && activities.length === 0 && (
          <p className="text-sm text-cx-forest-dark/70">
            No activities yet. Log your first one above or through Mak.
          </p>
        )}
        <div className="space-y-3">
        {activities.map((a) => (
          <div
            key={a.id}
            className={`cx-surface-elevated rounded-xl p-4 ${
              energyAccent(a.energy_valence) === "red"
                ? "border-l-4 border-l-red-500"
                : energyAccent(a.energy_valence) === "green"
                  ? "border-l-4 border-l-cx-success"
                  : energyAccent(a.energy_valence) === "amber"
                    ? "border-l-4 border-l-cx-attention"
                    : ""
            }`}
          >
            <p className="text-sm text-cx-forest-dark">{a.raw_text}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge energy={badgeEnergy(a.energy_valence)}>
                {a.energy_valence?.replace(/_/g, " ") ?? "—"}
              </Badge>
              {a.primary_domain && <Badge>{a.primary_domain}</Badge>}
              {a.primary_track && <Badge>{a.primary_track}</Badge>}
              {a.input_source === "mak_capture" && <Badge>Mak</Badge>}
              <span className="text-xs text-cx-forest-dark/70">{a.activity_date}</span>
            </div>
          </div>
        ))}
        </div>
      </CardSection>
    </div>
  );
}

```

## src/components/workspace/AnnualRefreshPanel.tsx

```tsx
"use client";

import { useState } from "react";
import { CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CardSection } from "@/components/ui/CardSection";
import type { AnnualRefreshStatus } from "@/lib/v2/annual-refresh";
import { filterTouchpointAnswers } from "@/lib/v2/touchpoint-eligibility";
import { postTouchpointJson } from "@/lib/v2/touchpoint-fetch";

type Props = {
  status: AnnualRefreshStatus;
  onComplete?: () => void;
  onBeginWithMak?: () => void;
};

export function AnnualRefreshPanel({ status, onComplete, onBeginWithMak }: Props) {
  const [showFallback, setShowFallback] = useState(false);
  const [careerObjective, setCareerObjective] = useState("");
  const [trackEnergy, setTrackEnergy] = useState("");
  const [invisibleHours, setInvisibleHours] = useState("");
  const [goalReview, setGoalReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState("");

  if (!status.due && !summary) return null;

  async function submit() {
    setLoading(true);
    setError("");
    const now = new Date().toISOString();
    const answers = filterTouchpointAnswers([
      {
        module_id: "career_direction",
        question_id: "three_year_objective",
        value: careerObjective.trim(),
        captured_at: now,
      },
      {
        module_id: "work_engagement",
        question_id: "vigor_mean",
        value: trackEnergy === "" ? "" : Number(trackEnergy),
        captured_at: now,
      },
      {
        module_id: "invisible_work_annual",
        question_id: "weekly_hours",
        value: invisibleHours === "" ? "" : Number(invisibleHours),
        captured_at: now,
      },
      {
        module_id: "goal_annual_reset",
        question_id: "review_summary",
        value: goalReview.trim(),
        captured_at: now,
      },
    ]);

    if (answers.length === 0) {
      setError("Add at least one field before completing the annual refresh.");
      setLoading(false);
      return;
    }

    const result = await postTouchpointJson<{ summary: string }>(
      "/api/v1/touchpoints/annual",
      { answers },
    );
    if (!result.ok || !result.data) {
      setError(result.error ?? "Could not save annual refresh");
      setLoading(false);
      return;
    }
    setSummary(result.data.summary);
    setLoading(false);
    onComplete?.();
  }

  if (summary) {
    return (
      <CardSection
        accent="green"
        eyebrow={`${status.year} annual refresh`}
        title="Complete"
        icon={CalendarClock}
      >
        <pre className="whitespace-pre-wrap text-sm text-cx-forest-dark/80">{summary}</pre>
        <Button variant="secondary" className="mt-4" onClick={() => setSummary(null)}>
          Done
        </Button>
      </CardSection>
    );
  }

  return (
    <CardSection
      accent="amber"
      eyebrow="Touchpoint 3 · Annual deep refresh"
      title={`${status.year} annual career refresh`}
      description="Coach Mak guides seven modules — career direction, engagement, well-being, task burden, unrecognized work, Career Data refresh, and goal reset. Enrichment runs automatically when you finish."
      icon={CalendarClock}
      footer={
        status.days_since_last != null ? (
          <p className="text-xs text-cx-forest-dark/70">
            Last annual refresh: {status.days_since_last} days ago · ~{status.estimated_minutes} min
          </p>
        ) : (
          <p className="text-xs text-cx-forest-dark/70">~{status.estimated_minutes} min</p>
        )
      }
    >
      {!showFallback ? (
        <div className="flex flex-wrap gap-2">
          {onBeginWithMak && (
            <Button onClick={onBeginWithMak}>Begin with Coach Mak</Button>
          )}
          <Button variant="secondary" onClick={() => setShowFallback(true)}>
            Use form instead
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <label className="block text-sm text-cx-forest-dark">
            <span className="font-semibold">3-year career objective</span>
            <textarea
              value={careerObjective}
              onChange={(e) => setCareerObjective(e.target.value)}
              rows={2}
              placeholder="e.g., Program Director within 3 years"
              className="cx-field mt-1 w-full"
            />
          </label>
          <label className="block text-sm text-cx-forest-dark">
            <span className="font-semibold">Track energy (1–10)</span>
            <input
              type="number"
              min={1}
              max={10}
              value={trackEnergy}
              onChange={(e) => setTrackEnergy(e.target.value)}
              className="cx-field mt-1 w-full"
            />
          </label>
          <label className="block text-sm text-cx-forest-dark">
            <span className="font-semibold">Unrecognized work (hours/week)</span>
            <input
              type="number"
              min={0}
              value={invisibleHours}
              onChange={(e) => setInvisibleHours(e.target.value)}
              className="cx-field mt-1 w-full"
            />
          </label>
          <label className="block text-sm text-cx-forest-dark">
            <span className="font-semibold">Goal review summary</span>
            <textarea
              value={goalReview}
              onChange={(e) => setGoalReview(e.target.value)}
              rows={2}
              placeholder="Continue all 3 goals / modify sustainability goal"
              className="cx-field mt-1 w-full"
            />
          </label>
          <div className="flex gap-2">
            <Button onClick={() => void submit()} disabled={loading}>
              {loading ? "Saving…" : "Submit annual refresh"}
            </Button>
            <Button variant="secondary" onClick={() => setShowFallback(false)}>
              Back to Mak
            </Button>
          </div>
          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
              {error}
            </p>
          )}
        </div>
      )}
    </CardSection>
  );
}

```

## src/components/workspace/AssessmentInsightsWorkspace.tsx

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  EyeOff,
  GitBranch,
  MessageSquare,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CardSection } from "@/components/ui/CardSection";
import { MakDiscussLink } from "@/components/ui/MakDiscussLink";
import { PageShell } from "@/components/layout/PageShell";
import { useAppShell } from "@/components/layout/AppShell";
import { AcademicSoapSectionGate } from "@/components/layout/AcademicSoapSectionGate";
import { ASSESSMENT_MAK } from "@/lib/card-mak-prompts";
import { SOAP_TAB } from "@/lib/v2/soap-tab-spec";
import type { AssessmentInsights } from "@/lib/v2/assessment-insights";

function statusBadge(status: "not_started" | "in_progress" | "complete") {
  if (status === "complete") return <Badge>Complete</Badge>;
  if (status === "in_progress") return <Badge energy="energizing">In conversation</Badge>;
  return <Badge energy="neutral">Not yet explored</Badge>;
}

export function AssessmentInsightsWorkspace() {
  const { startMakFlow } = useAppShell();
  const [insights, setInsights] = useState<AssessmentInsights | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/assessments/insights");
      const data = await res.json();
      setInsights(data);
    } catch {
      setInsights(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function discussWithMak() {
    startMakFlow("assess", undefined, ASSESSMENT_MAK.overview.question);
  }

  if (loading) {
    return <p className="text-sm text-cx-forest-dark/70">Loading your career insights…</p>;
  }

  if (!insights) {
    return (
      <PageShell eyebrow={SOAP_TAB.assessment.nav} title={SOAP_TAB.assessment.title} maxWidth="lg">
        <CardSection
          eyebrow={SOAP_TAB.assessment.nav}
          title="Insights from conversation"
          description="Insights appear as you talk with Coach Mak. No forms — just conversation."
          icon={Target}
          mak={ASSESSMENT_MAK.overview}
          footer={
            <Button onClick={discussWithMak}>Talk with Coach Mak</Button>
          }
        />
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow={SOAP_TAB.assessment.nav}
      title={SOAP_TAB.assessment.title}
      subtitle={SOAP_TAB.assessment.description}
      maxWidth="lg"
      action={<Button onClick={discussWithMak}>Discuss with Coach Mak</Button>}
    >
      <AcademicSoapSectionGate intent="assess" />

      <CardSection
        className="mb-6"
        accent="green"
        eyebrow="Career pattern"
        title={insights.career_pattern.label}
        description={insights.career_pattern.narrative}
        icon={Target}
        mak={ASSESSMENT_MAK.career_pattern}
        footer={
          <p className="text-xs font-medium text-cx-forest-dark/70">
            Conversation coverage: {insights.conversation_coverage_pct}% of coaching signals captured
          </p>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <CardSection
          compact
          eyebrow="Coherence"
          title={insights.coherence_score != null ? String(insights.coherence_score) : "—"}
          description={insights.coherence_label}
          icon={GitBranch}
          mak={ASSESSMENT_MAK.coherence}
        />
        <CardSection
          compact
          eyebrow="Service citizenship"
          title={insights.s_index != null ? String(insights.s_index) : "—"}
          description={
            insights.service_citizenship_summary ??
            "Breadth of service beyond clinical care"
          }
          icon={Users}
          mak={ASSESSMENT_MAK.service_citizenship}
        />
        <CardSection
          compact
          eyebrow="Unrecognized work"
          title="Hidden contribution"
          description={
            insights.unrecognized_work_summary ??
            "Work that may not appear on your CV or in compensation."
          }
          icon={EyeOff}
          mak={ASSESSMENT_MAK.unrecognized_work}
        />
      </div>

      <CardSection
        className="mb-6"
        eyebrow="Seven touchpoints"
        title="Collected in conversation"
        description="Mak weaves these topics into natural dialogue over weeks. Status updates automatically."
        icon={MessageSquare}
        mak={ASSESSMENT_MAK.touchpoints}
      >
        <div className="space-y-3">
          {insights.touchpoints.map((tp) => (
            <div
              key={tp.number}
              className="rounded-xl border border-cx-forest-dark/15 bg-white p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-cx-forest-dark">
                    TP{tp.number}: {tp.title}
                  </p>
                  <p className="text-xs text-cx-forest-dark/70">{tp.category}</p>
                </div>
                <div className="flex items-center gap-2">
                  {statusBadge(tp.status)}
                  <span className="text-xs text-cx-forest-dark/60">{tp.coverage_pct}% captured</span>
                  <MakDiscussLink
                    mak={ASSESSMENT_MAK.touchpoint(tp.number, tp.title)}
                    className="text-xs text-cx-forest-dark hover:text-cx-forest-dark/80"
                  />
                </div>
              </div>
              {tp.insights.length > 0 && (
                <ul className="mt-3 space-y-1 text-sm text-cx-forest-dark/70">
                  {tp.insights.map((line) => (
                    <li key={line}>• {line}</li>
                  ))}
                </ul>
              )}
              {tp.collected_signals.length > 0 && (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {tp.collected_signals.map((s) => (
                    <div
                      key={s.label}
                      className="rounded-md bg-cx-forest-dark/[0.04] px-3 py-2 text-xs"
                    >
                      <p className="font-medium text-cx-forest-dark">{s.label}</p>
                      <p className="mt-0.5 text-cx-forest-dark/70">{s.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardSection>

      <div className="grid gap-4 md:grid-cols-2">
        <CardSection
          eyebrow="Profile analysis"
          title="Strengths & opportunities"
          icon={Sparkles}
          mak={ASSESSMENT_MAK.strengths}
        >
          <ul className="space-y-3 text-sm">
            {insights.strengths.map((s) => (
              <li key={`${s.domain}-${s.note}`} className="flex gap-2">
                <span
                  className={`mt-1 h-2 w-2 shrink-0 rounded-full ${
                    s.status === "strength"
                      ? "bg-[#5FD65F]"
                      : s.status === "risk"
                        ? "bg-cx-attention"
                        : "bg-cx-forest-dark/40"
                  }`}
                />
                <div>
                  <p className="font-medium text-cx-forest-dark">{s.domain}</p>
                  <p className="text-cx-forest-dark/70">{s.note}</p>
                </div>
              </li>
            ))}
          </ul>
        </CardSection>

        <CardSection
          eyebrow="CV gap analysis"
          title="Recognition gaps"
          icon={EyeOff}
          mak={ASSESSMENT_MAK.recognition_gaps}
        >
          <ul className="space-y-3 text-sm">
            {insights.recognition_gaps.map((g) => (
              <li key={g.domain} className="rounded-xl border border-cx-forest-dark/15 p-3">
                <p className="font-medium text-cx-forest-dark">{g.domain}</p>
                <p className="mt-1 text-cx-forest-dark/70">
                  Conversation: {g.from_conversation}
                </p>
                <p className="text-cx-forest-dark/70">CV: {g.documented_on_cv}</p>
              </li>
            ))}
          </ul>
        </CardSection>
      </div>

      <CardSection
        className="mt-6"
        accent="amber"
        eyebrow="Next step"
        title="Continue with Mak"
        description={insights.mak_suggested_opener}
        icon={MessageSquare}
        mak={ASSESSMENT_MAK.overview}
        footer={
          <>
            <Link href="/app/output">
              <Button variant="secondary">Create output from insights</Button>
            </Link>
            <Link href="/app/plan">
              <Button variant="secondary">Plan next steps</Button>
            </Link>
          </>
        }
      />
    </PageShell>
  );
}

```

## src/components/workspace/CareerDataReconcilePanel.tsx

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { GitCompare } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CardSection } from "@/components/ui/CardSection";
import { OBJECTIVE_MAK } from "@/lib/card-mak-prompts";

type ReconciliationItem = {
  id: string;
  label: string;
  detail: string;
  source: string;
  status: "pending" | "confirmed" | "rejected";
};

export function CareerDataReconcilePanel() {
  const [items, setItems] = useState<ReconciliationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/onboarding/reconciliation");
      const data = await res.json();
      setItems(data.items ?? []);
    } catch {
      setError("Could not load reconciliation items.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function setStatus(id: string, status: "confirmed" | "rejected") {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
  }

  async function save() {
    setSaving(true);
    setError("");
    const res = await fetch("/api/v1/onboarding/reconciliation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ id: i.id, status: i.status === "pending" ? "confirmed" : i.status })),
      }),
    });
    if (!res.ok) {
      setError("Could not save reconciliation.");
      setSaving(false);
      return;
    }
    setSaving(false);
    void load();
  }

  const pending = items.filter((i) => i.status === "pending");

  if (loading) {
    return <p className="text-sm text-cx-forest-dark/70">Loading items pending review…</p>;
  }

  if (!items.length) {
    return (
      <CardSection
        eyebrow="Reconciliation"
        title="Nothing to review"
        description="No enrichment items pending review. Upload an updated CV to trigger API reconciliation."
        icon={GitCompare}
        mak={OBJECTIVE_MAK.reconcile}
      />
    );
  }

  return (
    <CardSection
      accent={pending.length ? "amber" : "green"}
      eyebrow="Reconciliation queue"
      title={
        pending.length
          ? `${pending.length} item${pending.length > 1 ? "s" : ""} pending review`
          : "All items reviewed"
      }
      icon={GitCompare}
      mak={OBJECTIVE_MAK.reconcile}
      footer={
        pending.length > 0 ? (
          <Button onClick={() => void save()} disabled={saving}>
            {saving ? "Saving…" : "Save reconciliation"}
          </Button>
        ) : undefined
      }
    >
      <ul className="space-y-3">
        {items.map((item) => (
          <li
            key={item.id}
            className="rounded-xl border border-cx-forest-dark/15 bg-cx-forest-dark/[0.03] p-4 text-sm"
          >
            <p className="font-semibold text-cx-forest-dark">{item.label}</p>
            <p className="mt-1 text-sm text-cx-forest-dark/80">{item.detail}</p>
            <p className="mt-1 text-cx-label">Source: {item.source}</p>
            {item.status === "pending" ? (
              <div className="mt-3 flex gap-2">
                <Button onClick={() => setStatus(item.id, "confirmed")}>Confirm</Button>
                <Button variant="secondary" onClick={() => setStatus(item.id, "rejected")}>
                  Reject
                </Button>
              </div>
            ) : (
              <p className="mt-2 text-cx-label capitalize">{item.status}</p>
            )}
          </li>
        ))}
      </ul>
      {error && (
        <p className="cx-alert-banner mt-3 px-4 py-3 text-sm">
          {error}
        </p>
      )}
    </CardSection>
  );
}

```

## src/components/workspace/CareerDataVaultPanel.tsx

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { Database, Fingerprint, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { CardSection } from "@/components/ui/CardSection";
import { useAnalytics } from "@/components/layout/AnalyticsProvider";
import { resolveAcademicProfile, isAcademicContext } from "@/lib/v2/academic-profiles";
import type { PracticeSetting, CareerStage, AcademicRank } from "@/lib/v2/onboarding-options";
import { OBJECTIVE_MAK, makDiscuss } from "@/lib/card-mak-prompts";

type ProfileMeta = {
  practice_setting?: PracticeSetting | null;
  career_stage?: CareerStage | null;
  academic_rank?: AcademicRank | null;
  primary_career_track?: string | null;
};

export function CareerDataVaultPanel() {
  const { analytics, loading: analyticsLoading } = useAnalytics();
  const [profile, setProfile] = useState<ProfileMeta>({});
  const [profileLoading, setProfileLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      const profileRes = await fetch("/api/v1/onboarding/touchpoint1");
      const profileData = await profileRes.json();
      setProfile(profileData.profile ?? {});
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
    const onUpdate = () => void loadProfile();
    window.addEventListener("fiscmak:touchpoint-complete", onUpdate);
    window.addEventListener("fiscmak:activity-logged", onUpdate);
    return () => {
      window.removeEventListener("fiscmak:touchpoint-complete", onUpdate);
      window.removeEventListener("fiscmak:activity-logged", onUpdate);
    };
  }, [loadProfile]);

  const loading = analyticsLoading || profileLoading;

  if (loading) {
    return <p className="text-sm text-cx-forest-dark/70">Loading Career Data vault…</p>;
  }

  const vault = analytics?.career_vault;
  const academic = isAcademicContext({
    setting: profile.practice_setting,
    level: profile.career_stage,
  })
    ? resolveAcademicProfile({
        setting: profile.practice_setting,
        level: profile.career_stage,
        rank: profile.academic_rank,
        track: profile.primary_career_track,
      })
    : null;

  if (!vault?.sections.length) {
    return (
      <CardSection
        eyebrow="Career Data"
        title="Vault empty"
        description="Upload a CV and run enrichment to populate your Career Data vault from OpenAlex, NIH RePORTER, and CV parse."
        icon={Database}
        mak={OBJECTIVE_MAK.documents}
      />
    );
  }

  return (
    <div className="space-y-4">
      <CardSection
        accent={vault.pending_review > 0 ? "amber" : "green"}
        eyebrow="Career Data Vault"
        title={academic?.objectiveLead ?? "Verified career record"}
        description={vault.summary}
        icon={Database}
        mak={OBJECTIVE_MAK.vault}
      >
        {vault.changes_since_quarter && (
          <p className="text-sm font-medium text-cx-forest-dark">{vault.changes_since_quarter}</p>
        )}
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-cx-forest-dark/70">
          {vault.sources.map((s) => (
            <Badge key={s}>{s}</Badge>
          ))}
          {vault.last_enrichment_at && (
            <span>Last enriched {new Date(vault.last_enrichment_at).toLocaleDateString()}</span>
          )}
          {vault.citations_total != null && (
            <span>{vault.citations_total.toLocaleString()} citations indexed</span>
          )}
        </div>
        {vault.pending_review > 0 && (
          <p className="cx-alert-banner mt-3 px-4 py-2 text-sm">
            {vault.pending_review} item{vault.pending_review > 1 ? "s" : ""} pending review in
            Reconcile tab
          </p>
        )}
      </CardSection>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {vault.sections.map(({ id, label, count }) => (
          <CardSection
            key={id}
            compact
            title={label}
            description="Verified from enrichment + CV parse"
            action={<Badge>{count}</Badge>}
            mak={OBJECTIVE_MAK.vaultSection(label)}
          />
        ))}
      </div>

      {(vault.npi_verified || vault.orcid) && (
        <CardSection
          eyebrow="Verified IDs"
          title="Professional identifiers"
          icon={Fingerprint}
          mak={makDiscuss(
            "review",
            "Help me verify my professional identifiers — NPI, ORCID, and what's linked correctly.",
          )}
        >
          <ul className="space-y-1 text-sm text-cx-forest-dark/80">
            {vault.npi_verified && <li>NPI verified via NPPES</li>}
            {vault.orcid && <li>ORCID: {vault.orcid}</li>}
          </ul>
        </CardSection>
      )}

      {academic && (
        <CardSection
          eyebrow="Academic context"
          title="Academic focus"
          description={academic.promotionFocus}
          icon={GraduationCap}
          mak={makDiscuss(
            "review",
            "Discuss my academic profile focus and which output templates fit my promotion path.",
          )}
          footer={
            <p className="text-xs text-cx-forest-dark/70">
              Primary output templates: {academic.outputTemplates.join(" · ")}
            </p>
          }
        />
      )}
    </div>
  );
}

```

## src/components/workspace/CareerStrategyGoalCard.tsx

```tsx
"use client";

import { useState } from "react";
import { ChevronDown, Pencil, Trash2 } from "lucide-react";
import { CardSection } from "@/components/ui/CardSection";
import { GOAL_FRAMEWORK_LABELS, type GoalFrameworkType } from "@/lib/v2/soap-tab-spec";
import type { StructuredGoal } from "@/lib/v2/goal-framework";
import type { CareerGoal } from "@/lib/goals";
import {
  findCurrentMilestoneIndex,
  type MilestoneStatus,
} from "@/lib/v2/goal-milestone-actions";
import { PLAN_MAK } from "@/lib/card-mak-prompts";
import { cn } from "@/lib/utils";

type CareerStrategyGoalCardProps = {
  goal: CareerGoal;
  structured: StructuredGoal | null;
  updating: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onMilestoneStatus: (milestoneIndex: number, status: MilestoneStatus) => void;
};

const MILESTONE_STATUSES: MilestoneStatus[] = [
  "completed",
  "in_progress",
  "not_started",
  "deferred",
];

function frameworkType(goal: CareerGoal): GoalFrameworkType | null {
  const t = goal.goal_type;
  if (t === "development" || t === "maintenance" || t === "sustainability") return t;
  return null;
}

export function CareerStrategyGoalCard({
  goal,
  structured,
  updating,
  onEdit,
  onDelete,
  onMilestoneStatus,
}: CareerStrategyGoalCardProps) {
  const [milestonesOpen, setMilestonesOpen] = useState(false);
  const type = frameworkType(goal);
  const label = type ? GOAL_FRAMEWORK_LABELS[type].label : "Goal";
  const progress = structured?.progress ?? 0;
  const milestoneIndex = findCurrentMilestoneIndex(goal);
  const currentMilestone =
    structured?.milestones.find((m) => m.status === "in_progress") ??
    structured?.milestones.find((m) => m.status === "pending");

  const makConfig = { ...PLAN_MAK.goal(label, goal.goal_title, goal.id), label: "Refine with Mak" };

  return (
    <CardSection
      eyebrow={label}
      title={goal.goal_title}
      description={goal.goal_description ?? undefined}
      mak={makConfig}
      action={<p className="text-sm font-semibold text-[#5FD65F]">{progress}%</p>}
      footer={
        <>
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-1 text-sm text-cx-forest-dark hover:text-cx-forest-dark/80"
          >
            <Pencil size={14} /> Edit
          </button>
          {!type && (
            <button
              type="button"
              onClick={onDelete}
              className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
            >
              <Trash2 size={14} /> Delete
            </button>
          )}
        </>
      }
    >
      <div className="h-2 overflow-hidden rounded-full bg-cx-forest-dark/10">
        <div
          className="h-full rounded-full bg-cx-forest-dark"
          style={{ width: `${Math.max(progress, 4)}%` }}
        />
      </div>

      {currentMilestone && (
        <div className="mt-4 rounded-xl border border-cx-forest-dark/15 bg-cx-forest-dark/[0.03] p-3">
          <p className="text-xs font-medium text-cx-forest-dark/70">This quarter</p>
          <p className="mt-1 text-sm text-cx-forest-dark">{currentMilestone.label}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {MILESTONE_STATUSES.map((status) => (
              <button
                key={status}
                type="button"
                disabled={updating}
                onClick={() => onMilestoneStatus(milestoneIndex, status)}
                className="rounded-full border border-cx-forest-dark/20 bg-white px-2.5 py-1 text-xs capitalize text-cx-forest-dark transition-colors hover:border-cx-forest-dark/40 disabled:opacity-50"
              >
                {status.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>
      )}

      {(goal.recommended_actions?.length ?? 0) > 0 && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setMilestonesOpen((o) => !o)}
            className="flex items-center gap-1 text-xs font-medium text-cx-forest-dark/70 hover:text-cx-forest-dark"
          >
            <ChevronDown
              size={14}
              className={cn("transition-transform", milestonesOpen && "rotate-180")}
            />
            All milestones ({goal.recommended_actions?.length})
          </button>
          {milestonesOpen && (
            <ul className="mt-2 space-y-1 text-sm text-cx-forest-dark/70">
              {goal.recommended_actions!.map((item) => (
                <li key={item} className="leading-snug">
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </CardSection>
  );
}

```

## src/components/workspace/DashboardWorkspace.tsx

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { DashboardWelcome } from "@/components/dashboard/DashboardWelcome";
import { useAppShell } from "@/components/layout/AppShell";
import { useAnalytics } from "@/components/layout/AnalyticsProvider";
import { buildSoapDashboardBands } from "@/lib/v2/dashboard-snapshot";
import { buildDashboardHeader } from "@/lib/v2/dashboard-architecture";
import { loadSubjectiveCheckIn } from "@/lib/subjective-storage";
import { GOAL_MODIFY_PROMPT } from "@/lib/v2/goal-framework";
import { buildGoalSettingIntro } from "@/lib/v2/goal-setting-mak-flow";
import { fetchGoals, saveOnboardingGoalsFromProposal, type CareerGoal } from "@/lib/goals";
import { GOAL_FRAMEWORK_LABELS } from "@/lib/v2/soap-tab-spec";
import type { PracticeSetting, CareerStage, AcademicRank } from "@/lib/v2/onboarding-options";
import { DashboardRevealOverlay } from "@/components/onboarding/DashboardRevealOverlay";
import {
  GoalSettingPanel,
  defaultProposedGoals,
  type ProposedGoal,
} from "@/components/onboarding/GoalSettingPanel";
import { buildCareerDirectionAnnualGreeting } from "@/lib/mak-chatbot-states";
import { initAnnualMakSession } from "@/lib/annual-mak-client";
import { initQuarterlyMakSession } from "@/lib/quarterly-mak-client";
import {
  buildActiveTouchpointView,
  buildDashboardDueNow,
  buildDashboardSecondaryAlerts,
  buildGoalCards,
  buildHealthStatusRow,
  buildProfileRows,
  buildProgressStatus,
  buildRecognitionGapRow,
  touchpointBarStates,
  type ActiveTouchpointView,
} from "@/lib/v2/dashboard-redesign";

type ProfileState = {
  name?: string | null;
  specialty?: string | null;
  career_stage?: CareerStage | null;
  practice_setting?: PracticeSetting | null;
  primary_career_track?: string | null;
  academic_rank?: AcademicRank | null;
  tier3_complete?: boolean;
  career_objective?: string | null;
};

function DashboardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl bg-cx-forest-dark/20 p-6">
      <div className="h-8 w-2/3 rounded-lg bg-cx-forest-dark/30" />
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="h-48 rounded-xl bg-white/40" />
        <div className="h-48 rounded-xl bg-white/40" />
      </div>
    </div>
  );
}

export function DashboardWorkspace() {
  const { startMakFlow, openMak, displayName } = useAppShell();
  const { analytics, loading, error: touchpointError } = useAnalytics();
  const router = useRouter();
  const searchParams = useSearchParams();
  const welcome = searchParams.get("welcome") === "1";
  const [goals, setGoals] = useState<CareerGoal[]>([]);
  const [profile, setProfile] = useState<ProfileState | null>(null);
  const [onboardingPhase, setOnboardingPhase] = useState<"reveal" | "goals" | null>(null);
  const [proposedGoals, setProposedGoals] = useState<ProposedGoal[]>([]);

  useEffect(() => {
    void fetchGoals().then(setGoals);
    const onGoalsUpdated = () => void fetchGoals().then(setGoals);
    window.addEventListener("fiscmak:goals-updated", onGoalsUpdated);
    return () => window.removeEventListener("fiscmak:goals-updated", onGoalsUpdated);
  }, []);

  useEffect(() => {
    Promise.all([
      fetch("/api/v1/onboarding/status").then((r) => r.json()),
      fetch("/api/v1/users/me").then((r) => r.json()),
    ])
      .then(([status, me]) => {
        setProfile({
          ...status,
          academic_rank: me.academic_rank ?? null,
          name: me.name ?? status.name,
        });
        if (
          status.tier3_complete &&
          typeof window !== "undefined" &&
          !localStorage.getItem("fiscmak_goals_onboarding_complete")
        ) {
          setProposedGoals(
            defaultProposedGoals({
              primaryTrack: status.primary_career_track,
              careerObjective: status.career_objective,
            }),
          );
          setOnboardingPhase("reveal");
        }
        if (welcome && status.tier1_complete && !status.tier3_complete) {
          startMakFlow("onboarding");
        }
      })
      .catch(() => {
        if (welcome) startMakFlow("onboarding");
      });
  }, [welcome, startMakFlow]);

  useEffect(() => {
    if (loading || onboardingPhase || !profile?.tier3_complete) return;
    if (typeof window === "undefined") return;
    if (localStorage.getItem("fiscmak_dashboard_mak_intro")) return;
    localStorage.setItem("fiscmak_dashboard_mak_intro", "1");
    openMak();
  }, [loading, onboardingPhase, profile?.tier3_complete, openMak]);

  function beginAnnualMak(href?: string) {
    const name = displayName ?? "there";
    void initAnnualMakSession().then(({ prompt, error: sessionError }) => {
      if (sessionError) console.error(sessionError);
      startMakFlow(
        "discuss",
        href,
        prompt ?? buildCareerDirectionAnnualGreeting(name),
        "annual",
      );
      if (href) router.push(href);
    });
  }

  function beginQuarterlyMak() {
    void initQuarterlyMakSession().then(({ prompt, error: sessionError }) => {
      if (sessionError) console.error(sessionError);
      startMakFlow(
        "discuss",
        "/app/subjective",
        prompt ?? "Let's begin your quarterly check-in. How has your well-being been this quarter?",
        "quarterly",
      );
    });
  }

  function handleTouchpointContinue(tp: ActiveTouchpointView) {
    if (tp.kind === "annual") {
      beginAnnualMak("/app/subjective");
      return;
    }
    if (tp.kind === "quarterly") {
      beginQuarterlyMak();
      router.push("/app/subjective");
      return;
    }
    startMakFlow("assess", "/app/assessment");
    router.push("/app/assessment");
  }

  const subjective = loadSubjectiveCheckIn();
  const subjectiveMetrics = useMemo(() => {
    if (!analytics) return [];
    const bands = buildSoapDashboardBands({
      analytics,
      subjective,
      goals,
      specialty: profile?.specialty ?? null,
      setting: profile?.practice_setting ?? null,
      level: profile?.career_stage ?? null,
      aspiration: profile?.primary_career_track ?? null,
      careerTrack: profile?.primary_career_track ?? null,
      rank: profile?.academic_rank ?? null,
      careerObjective: profile?.career_objective ?? null,
    });
    return bands.find((b) => b.id === "subjective")?.metrics ?? [];
  }, [analytics, subjective, goals, profile]);

  const headerModel = useMemo(() => {
    if (!analytics) return null;
    return buildDashboardHeader({
      name: profile?.name,
      specialty: profile?.specialty,
      setting: profile?.practice_setting ?? null,
      rank: profile?.academic_rank ?? null,
      level: profile?.career_stage ?? null,
      analytics,
      quarterlyPulse: analytics.quarterly_pulse,
    });
  }, [analytics, profile]);

  const profileRows = useMemo(() => {
    if (!analytics || !headerModel) return [];
    const gapRow = buildRecognitionGapRow(analytics);
    return [
      ...buildProfileRows(subjectiveMetrics),
      ...(gapRow ? [gapRow] : []),
      buildProgressStatus(analytics),
      buildHealthStatusRow(headerModel),
    ];
  }, [analytics, headerModel, subjectiveMetrics]);

  const goalCards = useMemo(
    () => buildGoalCards(goals, analytics?.goal_milestone_history ?? []),
    [goals, analytics],
  );

  const touchpointViews = useMemo(
    () => (analytics ? buildActiveTouchpointView(analytics) : { active: null, upcoming: null }),
    [analytics],
  );

  const dueNow = useMemo(
    () => (analytics ? buildDashboardDueNow(analytics, touchpointViews) : null),
    [analytics, touchpointViews],
  );

  const secondaryAlerts = useMemo(
    () =>
      analytics
        ? buildDashboardSecondaryAlerts(analytics.engagement_notifications, dueNow)
        : [],
    [analytics, dueNow],
  );

  const tpStates = useMemo(
    () => touchpointBarStates(analytics?.assessment_progress.completed_touchpoints ?? 0),
    [analytics],
  );

  const nextMilestone = useMemo(() => {
    for (const g of goals) {
      const pending = g.recommended_actions?.find((a) => !/COMPLETED/i.test(a));
      if (pending) return pending.replace(/^Q\d+ \d{4}:\s*/, "");
    }
    return analytics?.next_touchpoint?.category ?? null;
  }, [goals, analytics]);

  function handleDueNowContinue() {
    if (!dueNow) return;
    if (dueNow.kind === "annual") {
      beginAnnualMak("/app/subjective");
      return;
    }
    if (dueNow.kind === "quarterly") {
      beginQuarterlyMak();
      router.push("/app/subjective");
      return;
    }
    const active = touchpointViews.active;
    if (active) handleTouchpointContinue(active);
  }

  return (
    <>
      {onboardingPhase === "reveal" && (
        <DashboardRevealOverlay onComplete={() => setOnboardingPhase("goals")} />
      )}
      {onboardingPhase === "goals" && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-cx-page-muted/95 p-6">
          <GoalSettingPanel
            goals={proposedGoals}
            onWalkthroughWithMak={() =>
              startMakFlow("plan", "/app/plan", buildGoalSettingIntro(), undefined, "set")
            }
            onModifyWithMak={(goalType) =>
              startMakFlow(
                "plan",
                "/app/plan",
                `Let's refine your ${GOAL_FRAMEWORK_LABELS[goalType].label}.\n\n${GOAL_MODIFY_PROMPT}\n\nOr confirm goals in the template and use **Edit in template** for direct field updates.`,
                undefined,
                "set",
              )
            }
            onConfirm={(confirmed) => {
              const saved = saveOnboardingGoalsFromProposal(
                confirmed.map((g) => ({
                  type: g.type,
                  title: g.title,
                  rationale: g.rationale,
                  milestones: g.milestones,
                })),
              );
              setGoals(saved);
              setOnboardingPhase(null);
            }}
          />
        </div>
      )}

      <div className="mx-auto max-w-[1200px]">
        {loading ? (
          <DashboardSkeleton />
        ) : !analytics || !headerModel ? (
          <div className="cx-alert-banner px-4 py-3 text-sm">
            {touchpointError ?? "Could not load dashboard. Refresh the page or finish onboarding first."}
          </div>
        ) : (
          <>
            {touchpointError && (
              <div className="cx-alert-banner mb-4 px-4 py-3 text-sm">{touchpointError}</div>
            )}
            <DashboardWelcome
              displayName={headerModel.displayName}
              tracks={
                profile?.primary_career_track ? [profile.primary_career_track] : null
              }
              profileLine={headerModel.profileLine}
              profileRows={profileRows}
              header={headerModel}
              nextMilestone={nextMilestone}
              goals={goalCards}
              touchpointStates={tpStates}
              latticeCells={analytics.dashboard_lattice}
              dueNow={dueNow}
              secondaryAlerts={secondaryAlerts}
              onDueNowContinue={handleDueNowContinue}
            />
          </>
        )}
      </div>
    </>
  );
}

```

## src/components/workspace/DocumentsView.tsx

```tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { CardSection } from "@/components/ui/CardSection";
import { Badge } from "@/components/ui/Badge";
import { FileText, Upload } from "lucide-react";
import { OBJECTIVE_MAK } from "@/lib/card-mak-prompts";
import {
  ACCEPTED_CV_ACCEPT,
  ACCEPTED_CV_LABEL,
  isAcceptedCvFileName,
} from "@/lib/v2/document-upload";

type V2Document = {
  document_id: string;
  document_type: string;
  file_url: string | null;
  uploaded_at: string;
  extraction_status: string;
  extracted_text_preview?: string;
};

export function DocumentsView() {
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [documents, setDocuments] = useState<V2Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pasteText, setPasteText] = useState("");

  const loadDocuments = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/documents");
      const data = await res.json();
      setDocuments(data.documents ?? []);
    } catch {
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  useEffect(() => {
    if (searchParams.get("upload") !== "1") return;
    const timer = window.setTimeout(() => fileInputRef.current?.click(), 300);
    return () => window.clearTimeout(timer);
  }, [searchParams]);

  async function uploadFile(file: File, documentType = "CV") {
    setProcessing(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("document_type", documentType);
      const res = await fetch("/api/v1/documents", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message ?? "Upload failed");
      }
      await fetch("/api/v1/mempalace/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      await loadDocuments();
      setPasteText("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setProcessing(false);
    }
  }

  async function onFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!isAcceptedCvFileName(file.name)) {
      setError(`Upload ${ACCEPTED_CV_LABEL}, or paste your CV text below.`);
      return;
    }
    await uploadFile(file);
    e.target.value = "";
  }

  async function onPasteSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pasteText.trim()) return;
    const blob = new Blob([pasteText.trim()], { type: "text/plain" });
    const file = new File([blob], "pasted-cv.txt", { type: "text/plain" });
    await uploadFile(file);
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <CardSection
        eyebrow="Upload"
        title="CV & documents"
        description={`${ACCEPTED_CV_LABEL} — syncs to MemPalace for Mak coaching`}
        icon={Upload}
        mak={OBJECTIVE_MAK.documents}
      >
        <label
          htmlFor="file-upload-objective"
          className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-cx-forest-dark/25 bg-cx-forest-dark/[0.03] px-6 py-10 transition-colors hover:border-cx-forest-dark/40 hover:bg-cx-forest-dark/[0.06]"
        >
          <Upload className="text-cx-forest-dark" size={28} />
          <p className="mt-3 font-semibold text-cx-forest-dark">Drop or click to upload CV</p>
          <input
            ref={fileInputRef}
            id="file-upload-objective"
            type="file"
            accept={ACCEPTED_CV_ACCEPT}
            className="hidden"
            onChange={onFileSelect}
            disabled={processing}
          />
        </label>
        {processing && (
          <p className="mt-4 text-center text-sm text-cx-forest-dark/70">
            Processing document and syncing MemPalace…
          </p>
        )}
      </CardSection>

      <CardSection
        eyebrow="Alternative"
        title="Paste document text"
        icon={FileText}
        mak={OBJECTIVE_MAK.documents}
      >
        <form onSubmit={onPasteSubmit} className="space-y-4">
          <textarea
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            rows={6}
            placeholder="Paste CV or personal statement text here…"
            className="cx-field w-full"
          />
          <Button type="submit" disabled={processing || !pasteText.trim()}>
            Upload pasted text
          </Button>
        </form>
      </CardSection>

      <CardSection eyebrow="Library" title="Uploaded documents" mak={OBJECTIVE_MAK.documents}>
        {loading && <p className="text-sm text-cx-forest-dark/70">Loading…</p>}
        {!loading && documents.length === 0 && (
          <p className="text-sm text-cx-forest-dark/70">No documents yet.</p>
        )}
        <div className="space-y-3">
        {documents.map((doc) => (
          <div
            key={doc.document_id}
            className="rounded-xl border border-cx-forest-dark/15 bg-cx-forest-dark/[0.03] p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold text-cx-forest-dark">{doc.document_type}</p>
              <Badge>{doc.extraction_status}</Badge>
            </div>
            <p className="mt-2 text-xs text-cx-forest-dark/70">
              Uploaded {new Date(doc.uploaded_at).toLocaleDateString()}
            </p>
          </div>
        ))}
        </div>
      </CardSection>
    </div>
  );
}

```

## src/components/workspace/GoalsWorkspace.tsx

```tsx
"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CardSection } from "@/components/ui/CardSection";
import { Input } from "@/components/ui/Input";
import {
  type CareerGoal,
  type GoalFormData,
  GOAL_STATUSES,
  emptyGoalForm,
  formToGoalPayload,
  goalToForm,
  persistGoals,
} from "@/lib/goals";
import { SOAP_TAB, type GoalFrameworkType } from "@/lib/v2/soap-tab-spec";
import { careerGoalsToStructuredGoals } from "@/lib/v2/goal-framework";
import { PageShell } from "@/components/layout/PageShell";
import { CareerStrategyGoalCard } from "@/components/workspace/CareerStrategyGoalCard";
import { useAppShell } from "@/components/layout/AppShell";
import { useAnalytics } from "@/components/layout/AnalyticsProvider";
import { buildAnnualPlanResetGreeting } from "@/lib/mak-chatbot-states";
import { buildGoalSettingIntro } from "@/lib/v2/goal-setting-mak-flow";
import { PLAN_MAK } from "@/lib/card-mak-prompts";
import {
  type MilestoneStatus,
} from "@/lib/v2/goal-milestone-actions";

type GoalsWorkspaceProps = {
  embedded?: boolean;
};

const FRAMEWORK_ORDER: GoalFrameworkType[] = [
  "development",
  "maintenance",
  "sustainability",
];

function sortGoals(goals: CareerGoal[]): CareerGoal[] {
  return [...goals].sort((a, b) => {
    const ai = FRAMEWORK_ORDER.indexOf(a.goal_type as GoalFrameworkType);
    const bi = FRAMEWORK_ORDER.indexOf(b.goal_type as GoalFrameworkType);
    const aRank = ai === -1 ? 99 : ai;
    const bRank = bi === -1 ? 99 : bi;
    return aRank - bRank || a.priority - b.priority;
  });
}

function currentQuarterLabel(): string {
  const now = new Date();
  return `Q${Math.floor(now.getMonth() / 3) + 1} ${now.getFullYear()}`;
}

export function GoalsWorkspace({ embedded = false }: GoalsWorkspaceProps) {
  const { startMakFlow } = useAppShell();
  const { analytics } = useAnalytics();
  const formRef = useRef<HTMLDivElement>(null);
  const [goals, setGoals] = useState<CareerGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<GoalFormData>(emptyGoalForm());
  const [error, setError] = useState<string | null>(null);
  const [milestoneUpdating, setMilestoneUpdating] = useState<string | null>(null);
  const [goalsConfirmed, setGoalsConfirmed] = useState(false);

  const loadGoals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/goals");
      const data = await res.json();
      setGoals((data.goals as CareerGoal[]) ?? []);
      setGoalsConfirmed(Boolean(data.goals_confirmed));
    } catch {
      setError("Could not load goals.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadGoals();

    const refresh = () => void loadGoals();
    window.addEventListener("fiscmak:goals-updated", refresh);
    return () => window.removeEventListener("fiscmak:goals-updated", refresh);
  }, [loadGoals]);

  const sortedGoals = useMemo(() => sortGoals(goals.filter((g) => g.status !== "completed")), [goals]);
  const structuredByType = useMemo(() => {
    const map = new Map<GoalFrameworkType, ReturnType<typeof careerGoalsToStructuredGoals>[0]>();
    for (const s of careerGoalsToStructuredGoals(sortedGoals)) {
      map.set(s.type, s);
    }
    return map;
  }, [sortedGoals]);

  const annualDue = analytics?.annual_refresh?.due ?? false;

  function startGoalSettingWithMak() {
    startMakFlow(
      "plan",
      undefined,
      buildGoalSettingIntro(),
      undefined,
      "set",
      undefined,
      PLAN_MAK.setup.autoMessage,
    );
  }

  function reviewWithMak() {
    if (annualDue) {
      startMakFlow(
        "plan",
        undefined,
        buildAnnualPlanResetGreeting({ goals, analytics }),
        "annual",
        undefined,
        undefined,
        "Begin annual goal review.",
      );
    } else {
      startMakFlow(
        "plan",
        undefined,
        `${currentQuarterLabel()} — let's review milestone progress on your three goals.`,
        "quarterly",
        undefined,
        undefined,
        PLAN_MAK.review.autoMessage,
      );
    }
  }

  function openEdit(goal: CareerGoal) {
    setEditingId(goal.id);
    setForm(goalToForm(goal));
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  function closeEdit() {
    setEditingId(null);
    setForm(emptyGoalForm());
  }

  async function saveGoal(e: React.FormEvent) {
    e.preventDefault();
    if (!form.goal_title.trim()) return;
    setError(null);

    const payload = formToGoalPayload(form, editingId ?? undefined);
    const existing = goals.find((g) => g.id === editingId);
    const next = editingId
      ? goals.map((g) =>
          g.id === editingId
            ? ({ ...g, ...payload, goal_type: existing?.goal_type ?? g.goal_type } as CareerGoal)
            : g,
        )
      : goals;

    const result = await persistGoals(next);
    if (!result.ok) {
      setError(result.error ?? "Could not save goal.");
      return;
    }
    setGoals(next);
    closeEdit();
  }

  async function deleteGoal(id: string) {
    if (!confirm("Delete this goal?")) return;
    const next = goals.filter((g) => g.id !== id);
    const result = await persistGoals(next);
    if (!result.ok) {
      setError(result.error ?? "Could not delete goal.");
      return;
    }
    setGoals(next);
  }

  async function updateMilestone(
    goalId: string,
    milestoneIndex: number,
    status: MilestoneStatus,
  ) {
    setMilestoneUpdating(`${goalId}-${status}`);
    setError(null);
    try {
      const res = await fetch("/api/v1/goals/milestone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal_id: goalId, milestone_index: milestoneIndex, status }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Could not update milestone.");
        return;
      }
      const next = (data.goals as CareerGoal[]) ?? goals;
      setGoals(next);
      await persistGoals(next);
    } catch {
      setError("Could not update milestone.");
    } finally {
      setMilestoneUpdating(null);
    }
  }

  const body = (
    <>
      {error && (
        <p className="cx-alert-banner mb-6 px-4 py-3 text-sm">
          {error}
        </p>
      )}

      {!loading && sortedGoals.length > 0 && (
        <CardSection
          className="mb-6"
          compact
          eyebrow={annualDue ? "Annual review" : currentQuarterLabel()}
          title={annualDue ? "Confirm or reset your three goals" : "Mark milestone status below"}
          mak={PLAN_MAK.review}
          footer={
            <Button variant="secondary" className="shrink-0" onClick={reviewWithMak}>
              Review with Mak
            </Button>
          }
        />
      )}

      {editingId && (
        <div ref={formRef} className="mb-6">
          <CardSection
            eyebrow="Template edit"
            title="Edit goal"
            mak={PLAN_MAK.editGoal}
          >
            <form onSubmit={saveGoal} className="space-y-4">
              <Input
                label="Title"
                id="title"
                required
                value={form.goal_title}
                onChange={(e) => setForm((f) => ({ ...f, goal_title: e.target.value }))}
              />
              <div>
                <label htmlFor="desc" className="text-sm font-semibold text-cx-forest-dark">
                  Description
                </label>
                <textarea
                  id="desc"
                  rows={2}
                  value={form.goal_description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, goal_description: e.target.value }))
                  }
                  className="mt-2 w-full rounded-xl border border-cx-forest-dark/20 p-3 text-sm text-cx-forest-dark"
                />
              </div>
              <div>
                <label htmlFor="actions" className="text-sm font-semibold text-cx-forest-dark">
                  Milestones (one per line)
                </label>
                <textarea
                  id="actions"
                  rows={4}
                  value={form.recommended_actions}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, recommended_actions: e.target.value }))
                  }
                  className="mt-2 w-full rounded-xl border border-cx-forest-dark/20 p-3 text-sm text-cx-forest-dark"
                />
              </div>
              <div>
                <label htmlFor="status" className="text-sm font-semibold text-cx-forest-dark">
                  Status
                </label>
                <select
                  id="status"
                  value={form.status}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      status: e.target.value as CareerGoal["status"],
                    }))
                  }
                  className="mt-2 min-h-11 w-full rounded-xl border border-cx-forest-dark/20 px-4 text-sm text-cx-forest-dark"
                >
                  {GOAL_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Button type="submit">Save</Button>
                <Button type="button" variant="secondary" onClick={closeEdit}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardSection>
        </div>
      )}

      {loading && (
        <p className="text-sm text-cx-forest-dark/70">Loading goals…</p>
      )}

      {!loading && sortedGoals.length === 0 && (
        <CardSection
          eyebrow="Career strategy"
          title="No goals yet"
          description="Coach Mak walks you through Development, Maintenance, and Sustainability goals — or edit the template directly."
          mak={PLAN_MAK.setup}
          footer={<Button onClick={startGoalSettingWithMak}>Set up with Mak</Button>}
        />
      )}

      <div className="space-y-4">
        {sortedGoals.map((goal) => {
          const type = goal.goal_type as GoalFrameworkType | null;
          const structured =
            type && FRAMEWORK_ORDER.includes(type)
              ? structuredByType.get(type) ?? null
              : null;

          return (
            <CareerStrategyGoalCard
              key={goal.id}
              goal={goal}
              structured={structured}
              updating={milestoneUpdating != null}
              onEdit={() => openEdit(goal)}
              onDelete={() => deleteGoal(goal.id)}
              onMilestoneStatus={(index, status) =>
                void updateMilestone(goal.id, index, status)
              }
            />
          );
        })}
      </div>

      {!embedded && !loading && sortedGoals.length > 0 && (
        <p className="mt-8 text-center text-sm text-cx-forest-dark/70">
          <Link
            href="/app/plan?tab=pathways"
            className="inline-flex items-center gap-1 font-medium text-cx-forest-dark hover:underline"
          >
            Pathways & position search
            <ArrowRight size={14} />
          </Link>
        </p>
      )}
    </>
  );

  if (embedded) return body;

  return (
    <PageShell
      eyebrow={SOAP_TAB.plan.nav}
      title={SOAP_TAB.plan.title}
      subtitle={SOAP_TAB.plan.description}
      maxWidth="md"
      action={
        !goalsConfirmed ? (
          <Button onClick={startGoalSettingWithMak}>Set up with Mak</Button>
        ) : undefined
      }
    >
      {body}
    </PageShell>
  );
}

```

## src/components/workspace/JobsWorkspace.tsx

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase } from "lucide-react";
import { CardSection } from "@/components/ui/CardSection";
import { Button } from "@/components/ui/Button";
import { PageShell } from "@/components/layout/PageShell";
import { JOBS_MAK } from "@/lib/card-mak-prompts";
import type { Job } from "@/lib/v2/types";
import { cn } from "@/lib/utils";

type Tab = "matches" | "saved";

type JobsWorkspaceProps = {
  embedded?: boolean;
};

export function JobsWorkspace({ embedded = false }: JobsWorkspaceProps) {
  const [tab, setTab] = useState<Tab>("matches");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [savedJobs, setSavedJobs] = useState<Job[]>([]);
  const [commentary, setCommentary] = useState("");
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const loadMatches = useCallback(() => {
    return fetch("/api/v1/jobs/matches")
      .then((r) => r.json())
      .then((d) => {
        setJobs(d.jobs ?? []);
        setCommentary(d.mak_commentary ?? "");
      });
  }, []);

  const loadSaved = useCallback(() => {
    return fetch("/api/v1/jobs/saved")
      .then((r) => r.json())
      .then((d) => {
        const list = (d.jobs ?? []) as Job[];
        setSavedJobs(list);
        setSavedIds(new Set(list.map((j) => j.job_id)));
      });
  }, []);

  useEffect(() => {
    Promise.all([loadMatches(), loadSaved()])
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [loadMatches, loadSaved]);

  async function logView(id: string) {
    await fetch(`/api/v1/jobs/${id}/view`, { method: "POST" });
  }

  async function saveJob(id: string) {
    await fetch(`/api/v1/jobs/${id}/save`, { method: "POST" });
    setSavedIds((prev) => new Set(prev).add(id));
    await loadSaved();
  }

  function renderJob(job: Job) {
    return (
      <CardSection
        key={job.job_id}
        eyebrow={`${job.match_score}% match`}
        title={job.title}
        description={`${job.institution} · ${job.location}${job.salary ? ` · $${job.salary.toLocaleString()}` : ""}`}
        icon={Briefcase}
        mak={JOBS_MAK.role(job.title, job.institution ?? "Unknown institution", job.match_score ?? 0)}
        footer={
          <>
            <Button variant="secondary" onClick={() => void logView(job.job_id)}>
              View
            </Button>
            <Button
              variant={savedIds.has(job.job_id) ? "primary" : "secondary"}
              onClick={() => void saveJob(job.job_id)}
            >
              {savedIds.has(job.job_id) ? "Saved" : "Save"}
            </Button>
          </>
        }
      />
    );
  }

  const list = tab === "matches" ? jobs : savedJobs;

  const body = (
    <>
      {!embedded && (
        <Link href="/app/plan" className="mb-6 inline-block text-sm font-medium text-cx-forest-dark/70 hover:text-cx-forest-dark">
          Back to strategy
        </Link>
      )}

      <div className="mb-6 flex gap-2">
        {(["matches", "saved"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "cx-nav-pill capitalize",
              tab === t ? "cx-nav-pill-active" : "cx-nav-pill-inactive",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-cx-forest-dark/70">Loading matches…</p>
      ) : list.length === 0 ? (
        <CardSection
          eyebrow="Job search"
          title={tab === "saved" ? "No saved positions" : "No matches yet"}
          description={
            tab === "saved"
              ? "Save positions from your match feed to compare them with Coach Mak."
              : "Matches appear as your Career Profile and goals are populated."
          }
          icon={Briefcase}
          mak={JOBS_MAK.overview}
        />
      ) : (
        <div className="space-y-4">
          {list.length > 1 && (
            <CardSection
              compact
              eyebrow="Match feed"
              title={`${list.length} position${list.length > 1 ? "s" : ""}`}
              mak={JOBS_MAK.overview}
            />
          )}
          {list.map(renderJob)}
        </div>
      )}
    </>
  );

  if (embedded) return body;

  return (
    <PageShell
      eyebrow="Position search"
      title="Job matches"
      subtitle={commentary || undefined}
      maxWidth="lg"
    >
      {body}
    </PageShell>
  );
}

```

## src/components/workspace/LatticeView.tsx

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { Grid3x3 } from "lucide-react";
import { CardSection } from "@/components/ui/CardSection";
import { LatticeGrid } from "@/components/lattice/LatticeGrid";
import { fetchActivities } from "@/lib/activities-storage";
import { activitiesToLatticeCells } from "@/lib/lattice";
import { getDemoLatticeCells } from "@/lib/demo-data";
import { LATTICE_MAK } from "@/lib/card-mak-prompts";
import type { LatticeCellState } from "@/lib/constants";

export function LatticeView() {
  const [cells, setCells] = useState<LatticeCellState[]>(getDemoLatticeCells());
  const [usingLive, setUsingLive] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const activities = await fetchActivities();
    if (activities.length > 0) {
      setCells(activitiesToLatticeCells(activities));
      setUsingLive(true);
    } else {
      setCells(getDemoLatticeCells());
      setUsingLive(false);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
    const onUpdate = () => void load();
    window.addEventListener("fiscmak:activity-logged", onUpdate);
    window.addEventListener("fiscmak:touchpoint-complete", onUpdate);
    return () => {
      window.removeEventListener("fiscmak:activity-logged", onUpdate);
      window.removeEventListener("fiscmak:touchpoint-complete", onUpdate);
    };
  }, [load]);

  return (
    <div className="space-y-4">
      <CardSection
        compact
        eyebrow="Career Map"
        title="8 domains × 8 tracks"
        description={
          usingLive
            ? "Live from your logged activities."
            : "Demo data — log activities to populate your map."
        }
        icon={Grid3x3}
        mak={LATTICE_MAK.overview}
      />
      {loading ? (
        <p className="text-sm text-cx-forest-dark/70">Loading lattice…</p>
      ) : (
        <LatticeGrid cells={cells} />
      )}
    </div>
  );
}

```

## src/components/workspace/ObjectiveWorkspace.tsx

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { PageShell } from "@/components/layout/PageShell";
import { SOAP_TAB } from "@/lib/v2/soap-tab-spec";
import { LatticeView } from "@/components/workspace/LatticeView";
import { ActivitiesView } from "@/components/workspace/ActivitiesView";
import { DocumentsView } from "@/components/workspace/DocumentsView";
import { CareerDataVaultPanel } from "@/components/workspace/CareerDataVaultPanel";
import { CareerDataReconcilePanel } from "@/components/workspace/CareerDataReconcilePanel";
import { AcademicSoapSectionGate } from "@/components/layout/AcademicSoapSectionGate";

const TABS = [
  { id: "lattice", label: "Lattice" },
  { id: "vault", label: "Vault" },
  { id: "reconcile", label: "Reconcile" },
  { id: "activities", label: "Activities" },
  { id: "documents", label: "Documents" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ObjectiveWorkspace() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const tab: TabId =
    tabParam === "activities" ||
    tabParam === "documents" ||
    tabParam === "vault" ||
    tabParam === "reconcile"
      ? tabParam
      : "lattice";
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <p className="text-sm text-cx-forest-dark/70">Loading…</p>;
  }

  return (
    <PageShell
      eyebrow={SOAP_TAB.objective.nav}
      title={SOAP_TAB.objective.title}
      subtitle={SOAP_TAB.objective.description}
      maxWidth="full"
    >
      <AcademicSoapSectionGate intent="review" />

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map(({ id, label }) => (
          <a
            key={id}
            href={`/app/objective?tab=${id}`}
            className={cn(
              "cx-nav-pill",
              tab === id ? "cx-nav-pill-active" : "cx-nav-pill-inactive",
            )}
          >
            {label}
          </a>
        ))}
      </div>

      <div className="cx-section-surface">
        {tab === "lattice" && <LatticeView />}
        {tab === "vault" && <CareerDataVaultPanel />}
        {tab === "reconcile" && <CareerDataReconcilePanel />}
        {tab === "activities" && <ActivitiesView />}
        {tab === "documents" && <DocumentsView />}
      </div>
    </PageShell>
  );
}

```

## src/components/workspace/OutputStudioWorkspace.tsx

```tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { OUTPUT_TEMPLATES } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CardSection } from "@/components/ui/CardSection";
import { Badge } from "@/components/ui/Badge";
import { PageShell } from "@/components/layout/PageShell";
import { SOAP_TAB } from "@/lib/v2/soap-tab-spec";
import { fetchActivities } from "@/lib/activities-storage";
import type { ActivityEntry } from "@/lib/types/database";
import { EvidenceDrawer } from "@/components/studio/EvidenceDrawer";
import { VersionHistoryPanel } from "@/components/studio/VersionHistoryPanel";
import {
  StudioLexicalEditor,
  type StudioEditorHandle,
} from "@/components/studio/StudioLexicalEditor";
import { exportDocx, exportPdf, downloadBlob } from "@/lib/studio-export";
import {
  loadVersions,
  saveVersion,
  type DocumentVersion,
} from "@/lib/studio-versions";
import { PromotionNarrativeWizard } from "@/components/workspace/PromotionNarrativeWizard";
import { AcademicSoapSectionGate } from "@/components/layout/AcademicSoapSectionGate";
import { useAppShell } from "@/components/layout/AppShell";
import { OUTPUT_MAK } from "@/lib/card-mak-prompts";
import { MakDiscussLink } from "@/components/ui/MakDiscussLink";
import { Database, FileText, TrendingUp } from "lucide-react";

type ReadinessProfile = {
  target_track: string;
  target_rank: string;
  overall_readiness: number;
  promotion_timeline: string;
  strengths: { domain: string; score: number; note: string }[];
  gaps: { domain: string; score: number; note: string; suggestion: string }[];
};

type V2Template = {
  template_id: string;
  name: string;
  type: string;
  description: string;
};

type OutputContext = {
  career_vault?: {
    summary: string;
    changes_since_quarter: string | null;
    pending_review: number;
  };
  enrichment_delta?: string | null;
};

export function OutputStudioWorkspace() {
  const { startMakFlow } = useAppShell();
  const [selected, setSelected] = useState<string>(OUTPUT_TEMPLATES[0].id);
  const [generating, setGenerating] = useState(false);
  const [outputContext, setOutputContext] = useState<OutputContext | null>(null);
  const [evidence, setEvidence] = useState<ActivityEntry[]>([]);
  const [exportMsg, setExportMsg] = useState("");
  const [wordCount, setWordCount] = useState(0);
  const [saveStatus, setSaveStatus] = useState<"saved" | "unsaved" | "saving">(
    "saved",
  );
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [readiness, setReadiness] = useState<ReadinessProfile | null>(null);
  const [v2Templates, setV2Templates] = useState<V2Template[]>([]);
  const editorRef = useRef<StudioEditorHandle>(null);

  const template = OUTPUT_TEMPLATES.find((t) => t.id === selected)!;

  const loadEvidence = useCallback(async () => {
    setEvidence(await fetchActivities());
  }, []);

  useEffect(() => {
    void loadEvidence();
    const onLogged = () => void loadEvidence();
    window.addEventListener("fiscmak:activity-logged", onLogged);
    return () => window.removeEventListener("fiscmak:activity-logged", onLogged);
  }, [loadEvidence]);

  useEffect(() => {
    setVersions(loadVersions(selected));
    fetch("/api/v1/promotion/readiness")
      .then((r) => r.json())
      .then(setReadiness)
      .catch(() => undefined);
    fetch("/api/v1/templates?type=all")
      .then((r) => r.json())
      .then((d) => setV2Templates(d.templates ?? []))
      .catch(() => undefined);
    fetch("/api/v1/output/generate")
      .then((r) => r.json())
      .then((d) =>
        setOutputContext({
          career_vault: d.career_vault,
          enrichment_delta: d.enrichment_delta,
        }),
      )
      .catch(() => undefined);
  }, [selected]);

  async function generate() {
    setGenerating(true);
    try {
      if (selected === "promotion_narrative") {
        await fetch("/api/v1/promotion/dossier/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            target_rank: readiness?.target_rank,
            target_track: readiness?.target_track,
          }),
        });
      }
      const res = await fetch("/api/v1/output/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateType: selected,
          readiness,
        }),
      });
      const data = await res.json();
      const prefill =
        data.content ??
        (selected === "promotion_narrative" && readiness
          ? buildPromotionPrefill(readiness)
          : "");
      if (data.enrichment_delta || data.vault_summary) {
        setOutputContext({
          career_vault: {
            summary: data.vault_summary ?? outputContext?.career_vault?.summary ?? "",
            changes_since_quarter: data.enrichment_delta ?? null,
            pending_review: data.pending_review ?? 0,
          },
          enrichment_delta: data.enrichment_delta,
        });
      }
      editorRef.current?.setPlainText(prefill);
      setSaveStatus("unsaved");
    } finally {
      setGenerating(false);
    }
  }

  function buildPromotionPrefill(profile: ReadinessProfile): string {
    const strengths = profile.strengths
      .map((s) => `- ${s.domain} (${s.score}%): ${s.note}`)
      .join("\n");
    const gaps = profile.gaps
      .map((g) => `- ${g.domain} (${g.score}%): ${g.note}. ${g.suggestion}`)
      .join("\n");
    return `Promotion Narrative Draft\n\nTarget: ${profile.target_rank} (${profile.target_track})\nTimeline: ${profile.promotion_timeline}\nOverall readiness: ${profile.overall_readiness}%\n\nStrengths:\n${strengths}\n\nGaps to address:\n${gaps}\n\n[Section 1: Clinical Excellence — draft with Mak]\n\n[Section 2: Teaching & Mentorship]\n\n[Section 3: Scholarship & Research]\n\n[Section 4: Service & Leadership]\n\n[Section 5: Career Vision]\n\n[Section 6: Summary]`;
  }

  function handleSaveVersion() {
    if (!editorRef.current) return;
    setSaveStatus("saving");
    const json = editorRef.current.getEditorStateJson();
    const plain = editorRef.current.getPlainText();
    const next = saveVersion(selected, json, plain, "Manual save");
    setVersions(next);
    setSaveStatus("saved");
  }

  function restoreVersion(v: DocumentVersion) {
    editorRef.current?.restoreFromJson(v.content);
    setSaveStatus("unsaved");
  }

  function evidenceForExport() {
    const linked = editorRef.current?.getLinkedEvidence() ?? [];
    return linked.map((l) => {
      const act = evidence.find((e) => e.id === l.id);
      return { id: l.id, text: l.text, date: act?.activity_date };
    });
  }

  async function copyExport() {
    const text = editorRef.current?.getPlainText() ?? "";
    if (!text.trim()) return;
    await navigator.clipboard.writeText(text);
    setExportMsg("Copied to clipboard");
    setTimeout(() => setExportMsg(""), 2000);
  }

  async function downloadDocx() {
    const text = editorRef.current?.getPlainText() ?? "";
    if (!text.trim()) return;
    const blob = await exportDocx(template.name, text, evidenceForExport());
    downloadBlob(
      blob,
      `${selected}_${new Date().toISOString().slice(0, 10)}.docx`,
    );
    setExportMsg("DOCX downloaded");
    setTimeout(() => setExportMsg(""), 2000);
  }

  async function downloadPdf() {
    const text = editorRef.current?.getPlainText() ?? "";
    if (!text.trim()) return;
    const blob = await exportPdf(template.name, text, evidenceForExport());
    downloadBlob(
      blob,
      `${selected}_${new Date().toISOString().slice(0, 10)}.pdf`,
    );
    setExportMsg("PDF downloaded");
    setTimeout(() => setExportMsg(""), 2000);
  }

  const overLimit = wordCount > template.words * 1.1;
  const isPromotionWizard = selected === "promotion_narrative";

  return (
    <PageShell
      eyebrow={SOAP_TAB.output.nav}
      title={SOAP_TAB.output.title}
      subtitle={SOAP_TAB.output.description}
      maxWidth="full"
      className="flex h-[calc(100vh-10rem)] flex-col gap-4"
      action={
        <Button
          variant="secondary"
          onClick={() => {
            setSelected("cv_update");
            startMakFlow(
              "create",
              "/app/output",
              "Let's update your CV with any new publications, grants, roles, or awards since your last version. I'll merge them with your Objective data vault.",
            );
          }}
        >
          Update CV with Mak
        </Button>
      }
    >
      <AcademicSoapSectionGate intent="create" />
      {(outputContext?.enrichment_delta || outputContext?.career_vault?.summary) && (
        <CardSection
          accent="green"
          eyebrow="Career Data source"
          title="Document inputs"
          description={outputContext.career_vault?.summary}
          icon={Database}
          mak={OUTPUT_MAK.career_data_source}
        >
          {outputContext.enrichment_delta && (
            <p className="text-sm font-medium text-cx-forest-dark">{outputContext.enrichment_delta}</p>
          )}
          {(outputContext.career_vault?.pending_review ?? 0) > 0 && (
            <p className="mt-2 text-xs text-cx-forest-dark/70">
              {outputContext.career_vault?.pending_review} item(s) pending review — reconcile in
              Objective before finalizing documents.
            </p>
          )}
        </CardSection>
      )}
      <div className="flex min-h-0 flex-1 gap-6">
      <aside className="w-56 shrink-0 space-y-2 overflow-y-auto">
        <CardSection
          compact
          eyebrow="Templates"
          title="FISCMAK library"
          icon={FileText}
          mak={OUTPUT_MAK.template(template.name)}
        />
        {OUTPUT_TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSelected(t.id)}
            className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
              selected === t.id
                ? "bg-cx-forest-dark/10 font-semibold text-cx-forest-dark"
                : "text-cx-forest-dark/80 hover:bg-cx-forest-dark/5"
            }`}
          >
            {t.name}
          </button>
        ))}
        {v2Templates.length > 0 && (
          <>
            <h2 className="mt-4 px-2 text-xs font-medium uppercase tracking-wide text-cx-forest-dark/70">
              Spec templates
            </h2>
            {v2Templates.map((t) => (
              <button
                key={t.template_id}
                type="button"
                onClick={() => setSelected(t.type === "promotion_narrative" ? "promotion_narrative" : t.type)}
                title={t.description}
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-cx-forest-dark/80 hover:bg-cx-forest-dark/5"
              >
                {t.name}
              </button>
            ))}
          </>
        )}
        <VersionHistoryPanel versions={versions} onRestore={restoreVersion} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        {readiness && (
          <CardSection
            compact
            className="border-cx-forest-dark/15 bg-cx-forest-dark/[0.03]"
            eyebrow="Promotion"
            title="Readiness profile"
            description={`${readiness.target_rank} · ${readiness.target_track} · ${readiness.promotion_timeline}`}
            icon={TrendingUp}
            mak={OUTPUT_MAK.promotion_readiness}
            action={
              <Badge energy={readiness.overall_readiness >= 70 ? "energizing" : "neutral"}>
                {readiness.overall_readiness}% ready
              </Badge>
            }
          />
        )}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-cx-forest-dark/70">
              Active template
            </p>
            <h2 className="text-xl font-semibold text-cx-forest-dark">{template.name}</h2>
            <p className="text-sm text-cx-forest-dark/70">
              {isPromotionWizard
                ? "Six-section wizard — Master Document template"
                : `Target ~${template.words} words`}
            </p>
            <MakDiscussLink
              mak={OUTPUT_MAK.template(template.name)}
              className="mt-2 text-cx-forest-dark hover:text-cx-forest-dark/80"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!isPromotionWizard && (
              <>
                <Button onClick={generate} disabled={generating}>
                  {generating ? "Generating…" : "Generate"}
                </Button>
                <Button variant="secondary" onClick={handleSaveVersion}>
                  Save version
                </Button>
                <Button variant="secondary" onClick={copyExport}>
                  Copy
                </Button>
                <Button variant="secondary" onClick={downloadDocx}>
                  DOCX
                </Button>
                <Button variant="secondary" onClick={downloadPdf}>
                  PDF
                </Button>
              </>
            )}
            {exportMsg && (
              <span className="text-sm text-[#5FD65F]">{exportMsg}</span>
            )}
          </div>
        </div>

        {isPromotionWizard ? (
          <PromotionNarrativeWizard
            readiness={readiness}
            onFullDraft={(text) => {
              void navigator.clipboard.writeText(text);
              setExportMsg("Full narrative copied to clipboard");
              setTimeout(() => setExportMsg(""), 2500);
            }}
          />
        ) : (
        <Card className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
          <StudioLexicalEditor
            key={selected}
            ref={editorRef}
            templateId={selected}
            onWordCount={(n) => {
              setWordCount(n);
              setSaveStatus((s) => (s === "saved" ? "unsaved" : s));
            }}
          />
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-cx-forest-dark/15 px-4 py-2 text-sm text-cx-forest-dark/70">
            <span className={overLimit ? "font-medium text-cx-attention" : ""}>
              {wordCount} / {template.words} words
              {overLimit && " — over recommended limit"}
            </span>
            <span>
              {saveStatus === "saving"
                ? "Saving…"
                : saveStatus === "unsaved"
                  ? "Unsaved changes · auto-save every 10s"
                  : "Saved"}
            </span>
          </div>
        </Card>
        )}

        {!isPromotionWizard && (
      <EvidenceDrawer
        evidence={evidence}
        onInsertChip={(item) =>
          editorRef.current?.insertEvidenceChip(
            item.id,
            item.raw_text ?? "Evidence",
          )
        }
        onInsertText={(text) => editorRef.current?.insertPlainText(text)}
      />
        )}
      </div>
      </div>
    </PageShell>
  );
}

```

## src/components/workspace/PathwaysExplorer.tsx

```tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Map } from "lucide-react";
import { CardSection } from "@/components/ui/CardSection";
import { Badge } from "@/components/ui/Badge";
import { PATHWAYS_MAK } from "@/lib/card-mak-prompts";
import type { Pathway } from "@/lib/v2/types";

type PathwayRow = Pathway & { open_positions?: number };

function demandBadge(demand: string | null) {
  if (demand === "HIGH") return "energizing" as const;
  if (demand === "LOW") return "draining" as const;
  return "neutral" as const;
}

type PathwaysExplorerProps = {
  embedded?: boolean;
};

export function PathwaysExplorer({ embedded = false }: PathwaysExplorerProps) {
  const [pathways, setPathways] = useState<PathwayRow[]>([]);
  const [specialty, setSpecialty] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/v1/pathways")
      .then((r) => r.json())
      .then((d) => {
        setPathways((d.pathways as PathwayRow[]) ?? []);
        setSpecialty(d.specialty ?? "");
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const body = (
    <>
      {!embedded && (
        <Link
          href="/app/plan"
          className="mb-6 inline-block text-sm font-medium text-cx-forest-dark/70 hover:text-cx-forest-dark"
        >
          Back to strategy
        </Link>
      )}

      {loading && <p className="text-sm text-cx-forest-dark/70">Loading pathways…</p>}

      {!loading && pathways.length === 0 && (
        <CardSection
          eyebrow="Career pathways"
          title="No pathways yet"
          description="Complete your Career Profile to see specialty pathways tailored to your background."
          icon={Map}
          mak={PATHWAYS_MAK.overview}
        />
      )}

      {!loading && pathways.length > 0 && (
        <div className="space-y-4">
          <CardSection
            compact
            eyebrow={specialty ? `${specialty} pathways` : "Career pathways"}
            title={`${pathways.length} pathway${pathways.length === 1 ? "" : "s"} for your specialty`}
            description="Compare clinical, research, and hybrid tracks — then explore matched open positions."
            icon={Map}
            mak={PATHWAYS_MAK.overview}
            footer={
              <Link
                href="/app/plan?tab=jobs"
                className="inline-flex items-center gap-1 text-sm font-medium text-cx-forest-dark hover:text-cx-forest-dark/80"
              >
                View job matches
                <ChevronRight size={16} />
              </Link>
            }
          />

          <div className="grid gap-4 md:grid-cols-2">
            {pathways.map((pathway) => (
              <CardSection
                key={pathway.pathway_id}
                eyebrow={pathway.specialty}
                title={pathway.pathway_type}
                description={pathway.description ?? undefined}
                mak={PATHWAYS_MAK.pathway(pathway.pathway_type, pathway.description ?? "")}
                footer={
                  pathway.open_positions != null ? (
                    <p className="text-xs text-cx-forest-dark/60">
                      {pathway.open_positions} open position
                      {pathway.open_positions === 1 ? "" : "s"}
                    </p>
                  ) : undefined
                }
              >
                <div className="flex flex-wrap items-center gap-2">
                  {pathway.job_market_demand && (
                    <Badge energy={demandBadge(pathway.job_market_demand)}>
                      {pathway.job_market_demand} demand
                    </Badge>
                  )}
                  {pathway.salary_range && (
                    <span className="text-sm text-cx-forest-dark/80">{pathway.salary_range}</span>
                  )}
                </div>
              </CardSection>
            ))}
          </div>
        </div>
      )}
    </>
  );

  return body;
}

```

## src/components/workspace/PromotionNarrativeWizard.tsx

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { CardSection } from "@/components/ui/CardSection";
import { MakDiscussLink } from "@/components/ui/MakDiscussLink";
import { Badge } from "@/components/ui/Badge";
import { OUTPUT_MAK } from "@/lib/card-mak-prompts";
import {
  PROMOTION_NARRATIVE_SECTIONS,
  prefillSection,
  type PromotionNarrativeSectionId,
} from "@/lib/v2/promotion-narrative-sections";

type SectionRow = {
  section: PromotionNarrativeSectionId;
  title: string;
  subtitle: string;
  target_words: number;
  content: string | null;
  completion_percentage: number;
};

type DossierPayload = {
  dossier: { dossier_id: string; target_rank: string | null; target_track: string | null };
  sections: SectionRow[];
  overall_completion: number;
  full_draft_preview: string;
  user?: { specialty?: string | null; career_stage?: string | null };
};

type ReadinessProfile = {
  target_track: string;
  target_rank: string;
  strengths: { domain: string; note: string }[];
  gaps: { domain: string; suggestion: string }[];
};

type PromotionNarrativeWizardProps = {
  readiness: ReadinessProfile | null;
  onFullDraft?: (text: string) => void;
};

export function PromotionNarrativeWizard({
  readiness,
  onFullDraft,
}: PromotionNarrativeWizardProps) {
  const [data, setData] = useState<DossierPayload | null>(null);
  const [active, setActive] = useState<PromotionNarrativeSectionId>("introduction");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/v1/promotion/dossier/current");
    const json = (await res.json()) as DossierPayload;
    setData(json);
    setLoading(false);
    return json;
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!data) return;
    const row = data.sections.find((s) => s.section === active);
    setDraft(row?.content ?? "");
  }, [active, data]);

  const sectionDef = PROMOTION_NARRATIVE_SECTIONS.find((s) => s.id === active)!;
  const wordCount = draft.trim() ? draft.trim().split(/\s+/).length : 0;

  async function saveSection() {
    if (!data) return;
    setSaving(true);
    setMessage("");
    const res = await fetch(`/api/v1/promotion/narrative/${active}/save`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dossier_id: data.dossier.dossier_id, content: draft }),
    });
    if (res.ok) {
      setMessage("Section saved");
      await load();
    } else {
      setMessage("Save failed");
    }
    setSaving(false);
    setTimeout(() => setMessage(""), 2000);
  }

  function applyPrefill() {
    if (!data) return;
    const text = prefillSection(active, {
      target_rank: readiness?.target_rank ?? data.dossier.target_rank ?? undefined,
      target_track: readiness?.target_track ?? data.dossier.target_track ?? undefined,
      specialty: data.user?.specialty ?? undefined,
      career_stage: data.user?.career_stage ?? undefined,
      strengths: readiness?.strengths,
      gaps: readiness?.gaps,
    });
    if (text) setDraft(text);
  }

  async function assembleDraft() {
    if (!data) return;
    await navigator.clipboard.writeText(data.full_draft_preview);
    setMessage("Full draft copied to clipboard");
    onFullDraft?.(data.full_draft_preview);
    setTimeout(() => setMessage(""), 2500);
  }

  if (loading || !data) {
    return <p className="text-sm text-cx-forest-dark/70">Loading promotion narrative…</p>;
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
      <aside className="w-full shrink-0 space-y-2 lg:w-64">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-semibold uppercase text-cx-forest-dark/70">6 sections</p>
          <Badge energy={data.overall_completion >= 70 ? "energizing" : "neutral"}>
            {data.overall_completion}%
          </Badge>
        </div>
        {data.sections.map((s) => (
          <button
            key={s.section}
            type="button"
            onClick={() => setActive(s.section)}
            className={`w-full rounded-md border px-3 py-2 text-left text-sm ${
              active === s.section
                ? "border-[#5FD65F] bg-[#5FD65F]/10 font-semibold text-cx-forest-dark"
                : "border-cx-forest-dark/15 text-cx-forest-dark hover:bg-cx-forest-dark/[0.04]"
            }`}
          >
            <p>{s.title}</p>
            <p className="text-xs text-cx-forest-dark/70">
              {s.completion_percentage}% · ~{s.target_words} words
            </p>
          </button>
        ))}
        <Button variant="secondary" className="w-full" onClick={assembleDraft}>
          Assemble full draft
        </Button>
      </aside>

      <CardSection
        className="flex min-h-0 min-w-0 flex-1 flex-col"
        eyebrow="Promotion narrative"
        title={sectionDef.title}
        description={sectionDef.subtitle}
        mak={OUTPUT_MAK.promotion_section(sectionDef.title)}
      >
        <ul className="list-disc space-y-1 pl-5 text-sm text-cx-forest-dark/70">
          {sectionDef.prompts.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>

        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={14}
          placeholder={sectionDef.placeholder}
          className="min-h-[280px] w-full flex-1 rounded-md border border-cx-forest-dark/15 bg-white p-4 text-base leading-relaxed text-cx-forest-dark"
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-cx-forest-dark/70">
            {wordCount} / {sectionDef.targetWords} words
          </p>
          <div className="flex gap-2">
            <MakDiscussLink
              mak={OUTPUT_MAK.promotion_section(sectionDef.title)}
              variant="button"
            />
            <Button variant="secondary" onClick={applyPrefill}>
              Prefill hints
            </Button>
            <Button onClick={saveSection} disabled={saving}>
              {saving ? "Saving…" : "Save section"}
            </Button>
          </div>
        </div>
        {message && <p className="text-sm text-cx-success">{message}</p>}
      </CardSection>
    </div>
  );
}

```

## src/components/workspace/QuarterlyPulsePanel.tsx

```tsx
"use client";

import { useState } from "react";
import { HeartPulse } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { CardSection } from "@/components/ui/CardSection";
import type { QuarterlyPulseStatus } from "@/lib/v2/quarterly-pulse";
import { filterTouchpointAnswers } from "@/lib/v2/touchpoint-eligibility";
import { postTouchpointJson } from "@/lib/v2/touchpoint-fetch";

type Props = {
  status: QuarterlyPulseStatus;
  onComplete?: () => void;
  onBeginWithMak?: () => void;
};

export function QuarterlyPulsePanel({ status, onComplete, onBeginWithMak }: Props) {
  const [showFallback, setShowFallback] = useState(false);
  const [exhaustion, setExhaustion] = useState("");
  const [depersonalization, setDepersonalization] = useState("");
  const [invisibleHours, setInvisibleHours] = useState("");
  const [invisibleCategory, setInvisibleCategory] = useState("");
  const [trackEnergy, setTrackEnergy] = useState("");
  const [cvUpdate, setCvUpdate] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState("");

  if (!status.due && !summary) return null;

  async function submit() {
    setLoading(true);
    setError("");
    const now = new Date().toISOString();
    const answers = filterTouchpointAnswers([
      { module_id: "pfi_screen", question_id: "exhaustion", value: exhaustion === "" ? "" : Number(exhaustion), captured_at: now },
      { module_id: "pfi_screen", question_id: "depersonalization", value: depersonalization === "" ? "" : Number(depersonalization), captured_at: now },
      { module_id: "invisible_pulse", question_id: "weekly_hours", value: invisibleHours === "" ? "" : Number(invisibleHours), captured_at: now },
      { module_id: "invisible_pulse", question_id: "biggest_category", value: invisibleCategory.trim(), captured_at: now },
      { module_id: "career_momentum", question_id: "track_energy", value: trackEnergy === "" ? "" : Number(trackEnergy), captured_at: now },
      { module_id: "cv_update", question_id: "updates", value: cvUpdate.trim(), captured_at: now },
    ]);

    if (answers.length === 0) {
      setError("Add at least one field before submitting the pulse.");
      setLoading(false);
      return;
    }

    const result = await postTouchpointJson<{ summary: string }>(
      "/api/v1/touchpoints/quarterly",
      { answers },
    );
    if (!result.ok || !result.data) {
      setError(result.error ?? "Could not save pulse");
      setLoading(false);
      return;
    }
    setSummary(result.data.summary);
    setLoading(false);
    onComplete?.();
  }

  if (summary) {
    return (
      <CardSection
        accent="green"
        eyebrow={status.quarter_label}
        title="Pulse complete"
        icon={HeartPulse}
      >
        <pre className="whitespace-pre-wrap text-sm text-cx-forest-dark/80">{summary}</pre>
        <Button variant="secondary" className="mt-4" onClick={() => setSummary(null)}>
          Done
        </Button>
      </CardSection>
    );
  }

  return (
    <CardSection
      accent="amber"
      eyebrow="Touchpoint 2 · Quarterly pulse"
      title={`${status.quarter_label} check-in`}
      description="Coach Mak walks you through four quick modules (~5–8 min). Your answers save to your dashboard and Career Data vault automatically."
      icon={HeartPulse}
      footer={
        status.days_since_last != null ? (
          <p className="text-xs text-cx-forest-dark/70">
            Last pulse: {status.days_since_last} days ago
          </p>
        ) : undefined
      }
    >
      {!showFallback ? (
        <div className="flex flex-wrap gap-2">
          {onBeginWithMak && (
            <Button onClick={onBeginWithMak}>Begin with Coach Mak</Button>
          )}
          <Button variant="secondary" onClick={() => setShowFallback(true)}>
            Use form instead
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-sm text-cx-forest-dark">
              <span className="font-semibold">Emotional exhaustion (0–6)</span>
              <input
                type="number"
                min={0}
                max={6}
                value={exhaustion}
                onChange={(e) => setExhaustion(e.target.value)}
                className="cx-field mt-1 w-full"
              />
            </label>
            <label className="text-sm text-cx-forest-dark">
              <span className="font-semibold">Depersonalization (0–6)</span>
              <input
                type="number"
                min={0}
                max={6}
                value={depersonalization}
                onChange={(e) => setDepersonalization(e.target.value)}
                className="cx-field mt-1 w-full"
              />
            </label>
          </div>
          <label className="block text-sm text-cx-forest-dark">
            <span className="font-semibold">Unrecognized work hours per week</span>
            <input
              type="number"
              min={0}
              max={80}
              value={invisibleHours}
              onChange={(e) => setInvisibleHours(e.target.value)}
              className="cx-field mt-1 w-full"
            />
          </label>
          <label className="block text-sm text-cx-forest-dark">
            <span className="font-semibold">Biggest unrecognized work category this quarter</span>
            <input
              type="text"
              value={invisibleCategory}
              onChange={(e) => setInvisibleCategory(e.target.value)}
              placeholder="e.g. after-hours charting, prior auth…"
              className="cx-field mt-1 w-full"
            />
          </label>
          <label className="block text-sm text-cx-forest-dark">
            <span className="font-semibold">Energy for primary career track (1–10)</span>
            <input
              type="number"
              min={1}
              max={10}
              value={trackEnergy}
              onChange={(e) => setTrackEnergy(e.target.value)}
              className="cx-field mt-1 w-full"
            />
          </label>
          <label className="block text-sm text-cx-forest-dark">
            <span className="font-semibold">New achievements since last update (optional)</span>
            <textarea
              value={cvUpdate}
              onChange={(e) => setCvUpdate(e.target.value)}
              rows={2}
              placeholder="Publications, grants, roles, awards…"
              className="cx-field mt-1 w-full"
            />
          </label>
          <div className="flex gap-2">
            <Button onClick={() => void submit()} disabled={loading}>
              {loading ? "Saving…" : "Submit pulse"}
            </Button>
            <Button variant="secondary" onClick={() => setShowFallback(false)}>
              Back to Mak
            </Button>
          </div>
          {error && (
            <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-800">
              {error}
            </p>
          )}
        </div>
      )}
    </CardSection>
  );
}

```

## src/components/workspace/StrategyWorkspace.tsx

```tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { PageShell } from "@/components/layout/PageShell";
import { AcademicSoapSectionGate } from "@/components/layout/AcademicSoapSectionGate";
import { GoalsWorkspace } from "@/components/workspace/GoalsWorkspace";
import { JobsWorkspace } from "@/components/workspace/JobsWorkspace";
import { PathwaysExplorer } from "@/components/workspace/PathwaysExplorer";
import { SOAP_TAB } from "@/lib/v2/soap-tab-spec";

const TABS = [
  { id: "goals", label: "Goals" },
  { id: "pathways", label: "Pathways" },
  { id: "jobs", label: "Jobs" },
] as const;

type TabId = (typeof TABS)[number]["id"];

function tabFromParam(tabParam: string | null): TabId {
  if (tabParam === "jobs" || tabParam === "pathways") return tabParam;
  return "goals";
}

function StrategyWorkspaceInner() {
  const searchParams = useSearchParams();
  const tab = tabFromParam(searchParams.get("tab"));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <p className="text-sm text-cx-forest-dark/70">Loading…</p>;
  }

  const title =
    tab === "jobs"
      ? "Position search"
      : tab === "pathways"
        ? "Career pathways"
        : SOAP_TAB.plan.title;

  const subtitle =
    tab === "jobs"
      ? "Explore matched roles and saved positions alongside your career strategy."
      : tab === "pathways"
        ? "Compare specialty tracks, market demand, and salary ranges — then jump to matched roles."
        : SOAP_TAB.plan.description;

  return (
    <PageShell
      eyebrow={SOAP_TAB.plan.nav}
      title={title}
      subtitle={subtitle}
      maxWidth={tab === "goals" ? "md" : "lg"}
    >
      <AcademicSoapSectionGate intent="plan" />

      <div className="mb-6 flex flex-wrap gap-2">
        {TABS.map(({ id, label }) => (
          <a
            key={id}
            href={`/app/plan?tab=${id}`}
            className={cn(
              "cx-nav-pill",
              tab === id ? "cx-nav-pill-active" : "cx-nav-pill-inactive",
            )}
          >
            {label}
          </a>
        ))}
      </div>

      {tab === "goals" && <GoalsWorkspace embedded />}
      {tab === "pathways" && <PathwaysExplorer embedded />}
      {tab === "jobs" && <JobsWorkspace embedded />}
    </PageShell>
  );
}

export function StrategyWorkspace() {
  return (
    <Suspense fallback={<p className="text-sm text-cx-forest-dark/70">Loading…</p>}>
      <StrategyWorkspaceInner />
    </Suspense>
  );
}

```

## src/components/workspace/SubjectiveWorkspace.tsx

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Compass, TrendingUp } from "lucide-react";
import { CardSection } from "@/components/ui/CardSection";
import { MetricRow } from "@/components/ui/MetricRow";
import { PageShell } from "@/components/layout/PageShell";
import { useAppShell } from "@/components/layout/AppShell";
import { useAnalytics } from "@/components/layout/AnalyticsProvider";
import { SOAP_TAB } from "@/lib/v2/soap-tab-spec";
import { AcademicSoapSectionGate } from "@/components/layout/AcademicSoapSectionGate";
import { dominantInvisibleWorkByLevel } from "@/lib/v2/invisible-work-taxonomy";
import type { PracticeSetting, CareerStage } from "@/lib/v2/onboarding-options";
import { buildCareerDirectionAnnualGreeting, careerAlignmentFromHealth } from "@/lib/mak-chatbot-states";
import { initAnnualMakSession } from "@/lib/annual-mak-client";
import { initQuarterlyMakSession } from "@/lib/quarterly-mak-client";
import { AnnualRefreshPanel } from "@/components/workspace/AnnualRefreshPanel";
import { QuarterlyPulsePanel } from "@/components/workspace/QuarterlyPulsePanel";
import { SUBJECTIVE_MAK } from "@/lib/card-mak-prompts";

type ProfileMeta = {
  career_track?: string | null;
  career_objective?: string | null;
  career_stage?: CareerStage | null;
  practice_setting?: PracticeSetting | null;
};

export function SubjectiveWorkspace() {
  const { startMakFlow, displayName } = useAppShell();
  const { analytics, loading: analyticsLoading } = useAnalytics();
  const [profile, setProfile] = useState<ProfileMeta>({});
  const [profileLoading, setProfileLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    try {
      const profileRes = await fetch("/api/v1/onboarding/touchpoint1");
      const profileData = await profileRes.json();
      setProfile(profileData.profile ?? {});
      setLastUpdate(profileData.profile?.updated_at ?? null);
    } catch {
      setProfile({});
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProfile();
    const onUpdate = () => void loadProfile();
    window.addEventListener("fiscmak:touchpoint-complete", onUpdate);
    return () => window.removeEventListener("fiscmak:touchpoint-complete", onUpdate);
  }, [loadProfile]);

  function handleTouchpointComplete() {
    void loadProfile();
    window.dispatchEvent(new CustomEvent("fiscmak:touchpoint-complete"));
  }

  const health = analytics?.career_health ?? null;
  const loading = analyticsLoading || profileLoading;

  function beginAnnualMak() {
    const name = displayName ?? "there";
    void initAnnualMakSession().then(({ prompt, error: sessionError }) => {
      if (sessionError) console.error(sessionError);
      startMakFlow(
        "discuss",
        undefined,
        prompt ?? buildCareerDirectionAnnualGreeting(name),
        "annual",
      );
    });
  }

  function beginQuarterlyMak() {
    void initQuarterlyMakSession().then(({ prompt, error: sessionError }) => {
      if (sessionError) console.error(sessionError);
      startMakFlow(
        "discuss",
        undefined,
        prompt ?? "Let's begin your quarterly check-in. How has your well-being been this quarter?",
        "quarterly",
      );
    });
  }

  const fulfillment = health?.wellbeing_metrics.find((m) => m.id === "professional_fulfillment");
  const strain = health?.wellbeing_metrics.find((m) => m.id === "burnout_risk");
  const taskBurden = health?.wellbeing_metrics.find((m) => m.id === "task_burden");
  const unrecognized = health?.wellbeing_metrics.find((m) => m.id === "unrecognized_work");
  const alignment = health ? careerAlignmentFromHealth(health) : null;

  if (loading) {
    return <p className="text-sm text-cx-forest-dark/70">Loading career perspective…</p>;
  }

  const subtitle = [
    SOAP_TAB.subjective.description,
    lastUpdate ? `Last updated ${new Date(lastUpdate).toLocaleDateString()}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  const touchpointDue = analytics?.annual_refresh?.due || analytics?.quarterly_pulse?.due;

  return (
    <PageShell
      eyebrow={SOAP_TAB.subjective.nav}
      title={SOAP_TAB.subjective.title}
      subtitle={subtitle}
      maxWidth="lg"
    >
      <AcademicSoapSectionGate intent="discuss" />

      {analytics?.annual_refresh?.due && (
        <div className="mb-6">
          <AnnualRefreshPanel
            status={analytics.annual_refresh}
            onBeginWithMak={beginAnnualMak}
            onComplete={handleTouchpointComplete}
          />
        </div>
      )}

      {!analytics?.annual_refresh?.due && analytics?.quarterly_pulse?.due && (
        <div className="mb-6">
          <QuarterlyPulsePanel
            status={analytics.quarterly_pulse}
            onBeginWithMak={beginQuarterlyMak}
            onComplete={handleTouchpointComplete}
          />
        </div>
      )}

      {!touchpointDue && (
        <CardSection
          className="mb-6"
          eyebrow="Getting started"
          title={`${SOAP_TAB.subjective.title} assessment`}
          description={SOAP_TAB.subjective.chatEntry}
          icon={Compass}
          mak={SUBJECTIVE_MAK.intro}
        />
      )}

      <div className="cx-section-surface space-y-3">
        <MetricRow
          label="Career direction"
          summary={
            profile.career_objective
              ? `Primary career track: ${profile.career_track ?? "Not set"}. Stated 3-year objective: ${profile.career_objective}`
              : `Primary career track: ${profile.career_track ?? "Set with Coach Mak"}. Stated objective: pending quarterly check-in`
          }
          status="developing"
          mak={SUBJECTIVE_MAK.career_direction}
        />

        <MetricRow
          label="Professional fulfillment"
          summary={
            fulfillment?.summary ??
            "Complete your Perspective assessment with Coach Mak to populate this metric."
          }
          status={fulfillment?.status}
          trend={fulfillment ? "Updated from validated professional fulfillment instrument" : undefined}
          mak={SUBJECTIVE_MAK.professional_fulfillment}
        />

        <MetricRow
          label="Work-related strain"
          summary={
            strain?.summary ??
            "Work-related strain indicators appear after your first validated check-in."
          }
          status={strain?.status}
          mak={SUBJECTIVE_MAK.work_strain}
        />

        <MetricRow
          label="Task alignment"
          summary={
            taskBurden?.summary ??
            "Task alignment data identifies work time aligned with core professional role versus tasks outside primary responsibilities."
          }
          status={taskBurden?.status ?? "developing"}
          mak={SUBJECTIVE_MAK.task_alignment}
        />

        <MetricRow
          label="Work engagement"
          summary="Work engagement is measured annually using validated instruments. Complete the full Perspective assessment with Coach Mak."
          status="stable"
          mak={SUBJECTIVE_MAK.work_engagement}
        />

        <MetricRow
          label="Unrecognized work"
          summary={
            unrecognized?.summary ??
            `${dominantInvisibleWorkByLevel(profile.career_stage ?? null)} Estimate hours by category during your quarterly check-in.`
          }
          status={unrecognized?.status ?? "developing"}
          mak={SUBJECTIVE_MAK.unrecognized_work}
        />

        <MetricRow
          label="Career alignment"
          summary={
            alignment != null
              ? `Career Alignment: ${alignment}% — Current professional activities are ${alignment >= 70 ? "well" : alignment >= 50 ? "moderately" : "partially"} aligned with stated career objectives`
              : "Career alignment is computed from aspirations versus your Career Map — complete Insights to populate."
          }
          status={alignment != null ? (alignment >= 70 ? "strong" : alignment >= 50 ? "developing" : "needs_attention") : undefined}
          percentile={alignment}
          mak={SUBJECTIVE_MAK.career_alignment}
        />
      </div>

      <CardSection
        className="mt-6"
        eyebrow="Longitudinal view"
        title="Trends over time"
        description="Longitudinal trends for each metric appear after two or more quarterly updates."
        icon={TrendingUp}
        mak={SUBJECTIVE_MAK.trends}
        footer={
          <Link
            href="/app/plan"
            className="inline-flex items-center gap-1 text-sm font-medium text-cx-forest-dark hover:text-cx-forest-dark/80"
          >
            View sustainability goals
            <ChevronRight size={16} />
          </Link>
        }
      />
    </PageShell>
  );
}

```


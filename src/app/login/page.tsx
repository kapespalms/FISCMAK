"use client";

import Link from "next/link";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { MarketingAuthInput } from "@/components/auth/MarketingAuthInput";
import { MarketingAuthCard, MarketingAuthPanel } from "@/components/marketing/MarketingAuthCard";
import { MarketingAuthShell } from "@/components/marketing/MarketingAuthShell";
import { rememberOnboardingNextPath, navigateToAppPath, sanitizeNextPath } from "@/lib/auth/oauth";
import { DemoLoginPanel } from "@/components/auth/DemoLoginPanel";
import {
  isDemoLoginEnabled,
  isDemoLoginIdentifier,
  resolveDemoLoginEmail,
} from "@/lib/v2/fiscmak-demo-accounts";

async function navigateAfterAuth(fallbackNext: string) {
  const safeFallback = sanitizeNextPath(fallbackNext);
  const preserveOnboardingEntry = safeFallback.startsWith("/app/onboarding");

  try {
    const res = await fetch("/api/v1/onboarding/progress");
    if (res.ok) {
      const data = (await res.json()) as { path?: string };
      const target = preserveOnboardingEntry ? safeFallback : (data.path ?? safeFallback);
      navigateToAppPath(target);
      return;
    }
  } catch {
    /* use fallback */
  }

  navigateToAppPath(safeFallback);
}

type AuthMode = "unknown" | "login" | "signup";

function LoginPageContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authMode, setAuthMode] = useState<AuthMode>("unknown");
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const nextPath = sanitizeNextPath(searchParams.get("next") ?? "/app/onboarding");
  const signedOut = searchParams.get("signed_out") === "1";

  useEffect(() => {
    rememberOnboardingNextPath(nextPath);
  }, [nextPath]);

  useEffect(() => {
    const authError = new URLSearchParams(window.location.search).get("error");
    if (authError) setError(decodeURIComponent(authError));
    const emailParam = searchParams.get("email");
    if (emailParam) setEmail(emailParam);
  }, [searchParams]);

  useEffect(() => {
    setAuthMode("unknown");
    setConfirmPassword("");
  }, [email]);

  async function resolveAuthMode(): Promise<AuthMode> {
    if (isDemoLoginEnabled() && isDemoLoginIdentifier(email)) {
      setAuthMode("login");
      return "login";
    }
    if (!isSupabaseConfigured()) return "signup";
    setCheckingEmail(true);
    try {
      const res = await fetch("/api/v1/auth/email-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      const mode: AuthMode = data.exists ? "login" : "signup";
      setAuthMode(mode);
      return mode;
    } catch {
      setAuthMode("login");
      return "login";
    } finally {
      setCheckingEmail(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!isSupabaseConfigured()) {
      void navigateAfterAuth(nextPath);
      return;
    }

    const mode = authMode === "unknown" ? await resolveAuthMode() : authMode;
    const authEmail =
      isDemoLoginEnabled() && resolveDemoLoginEmail(email)
        ? resolveDemoLoginEmail(email)!
        : email.trim();

    if (mode === "signup") {
      if (password.length < 8) {
        setError("Password must be at least 8 characters.");
        setLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match.");
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: authEmail,
        password,
      });

      if (signUpError) {
        const msg = signUpError.message.toLowerCase().includes("already")
          ? "This email is already registered. Sign in instead."
          : signUpError.message;
        setError(msg);
        if (signUpError.message.toLowerCase().includes("already")) {
          setAuthMode("login");
        }
        setLoading(false);
        return;
      }

      if (data.session) {
        void navigateAfterAuth(nextPath);
        return;
      }

      setError(
        "Account created — check your email to confirm, then sign in. Or disable email confirmation in Supabase Auth settings for local dev.",
      );
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password,
    });

    if (authError) {
      const msg = authError.message.includes("Email not confirmed")
        ? "Check your email to confirm your account, then try again."
        : authError.message;
      setError(msg);
      setLoading(false);
      return;
    }

    if (!data.session) {
      setError("Sign-in did not create a session. Confirm your email or reset your password.");
      setLoading(false);
      return;
    }

    void navigateAfterAuth(nextPath);
  }

  const showConfirmPassword = authMode === "signup";
  const submitLabel =
    checkingEmail
      ? "Checking…"
      : authMode === "signup"
        ? loading
          ? "Creating account…"
          : "Create account"
        : loading
          ? "Signing in…"
          : authMode === "login"
            ? "Sign in"
            : "Continue";

  return (
    <MarketingAuthShell>
      <MarketingAuthPanel>
        <MarketingAuthCard>
          <h1 className="font-futura-bold text-3xl text-white md:text-4xl">Sign in</h1>
          <p className="font-futura-medium mt-2 text-sm text-gray-400">
            {!isSupabaseConfigured() && (
              <span className="text-marketing-accent">
                Demo mode: Supabase not configured — you&apos;ll enter the app without auth.{" "}
              </span>
            )}
            Enter your email and password. New emails create an account automatically.
            {isDemoLoginEnabled() ? " Or use a demo username below — no email needed." : null}
          </p>

          {signedOut && !error && (
            <p className="mt-4 rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-gray-200">
              You&apos;ve been signed out. Sign in again to continue.
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <MarketingAuthInput
              label="Email"
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => {
                if (email.trim()) void resolveAuthMode();
              }}
            />
            <MarketingAuthInput
              label="Password"
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete={authMode === "signup" ? "new-password" : "current-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {showConfirmPassword ? (
              <MarketingAuthInput
                label="Confirm password"
                id="confirmPassword"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            ) : null}

            {error && (
              <p className="rounded-lg bg-[#f5d4c4] px-4 py-3 text-sm leading-relaxed text-[#1a2419]">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || checkingEmail}
              className="font-futura-bold w-full cx-btn bg-marketing-accent px-4 py-3 text-sm text-black transition hover:bg-white disabled:opacity-60"
            >
              {submitLabel}
            </button>

            <p className="text-center">
              <Link
                href="/forgot-password"
                className="font-futura-medium text-sm text-white transition hover:text-marketing-accent"
              >
                Reset password
              </Link>
            </p>
          </form>

          <DemoLoginPanel
            onSignedIn={() => {
              void navigateAfterAuth(nextPath);
            }}
            onError={setError}
          />

          <p className="mt-6 text-center">
            <Link
              href="/"
              className="font-futura-medium inline-flex items-center gap-1 text-sm text-gray-400 transition hover:text-marketing-accent"
            >
              <ChevronLeft size={16} />
              Back to home
            </Link>
          </p>
        </MarketingAuthCard>
      </MarketingAuthPanel>
    </MarketingAuthShell>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <MarketingAuthShell>
          <MarketingAuthPanel>
            <MarketingAuthCard>
              <p className="font-futura-medium text-sm text-gray-400">Loading…</p>
            </MarketingAuthCard>
          </MarketingAuthPanel>
        </MarketingAuthShell>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}

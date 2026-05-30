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
import { mergeOnboardingRedirectPath } from "@/lib/v2/onboarding-progress";
import { DemoAccountPicker } from "@/components/auth/DemoLoginPanel";
import {
  demoAccountForInput,
  isDemoLoginEnabled,
  isDemoLoginIdentifier,
  resolveDemoLoginEmail,
} from "@/lib/v2/fiscmak-demo-accounts";

async function navigateAfterAuth(fallbackNext: string) {
  const safeFallback = sanitizeNextPath(fallbackNext);

  try {
    const res = await fetch("/api/v1/onboarding/progress");
    if (res.ok) {
      const data = (await res.json()) as { path?: string };
      const progressPath = data.path ?? safeFallback;
      const target = mergeOnboardingRedirectPath(
        progressPath,
        safeFallback.startsWith("/app/onboarding") ? safeFallback : null,
      );
      navigateToAppPath(target);
      return;
    }
  } catch {
    /* use fallback */
  }

  navigateToAppPath(safeFallback);
}

type AuthMode = "unknown" | "login" | "signup";

function isTestProfileEmail(email: string): boolean {
  return email.toLowerCase().endsWith("@test.fiscmak.local");
}

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

  const isDemoIdentifier = isDemoLoginIdentifier(email);
  const authEmail = resolveDemoLoginEmail(email) ?? email.trim();
  const selectedDemo = demoAccountForInput(email);

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
    setConfirmPassword("");
    if (isDemoLoginIdentifier(email)) {
      setAuthMode("login");
      return;
    }
    setAuthMode("unknown");
  }, [email]);

  async function resolveAuthMode(): Promise<AuthMode> {
    if (isDemoLoginIdentifier(email)) {
      setAuthMode("login");
      return "login";
    }

    const resolvedEmail = resolveDemoLoginEmail(email) ?? email.trim();
    if (isTestProfileEmail(resolvedEmail)) {
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

    const demoLogin = isDemoLoginIdentifier(email) || isTestProfileEmail(authEmail);
    const mode = demoLogin
      ? "login"
      : authMode === "unknown"
        ? await resolveAuthMode()
        : authMode;

    if (mode === "signup" && !demoLogin) {
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
      let msg = authError.message;
      if (authError.message.includes("Invalid login credentials") && demoLogin) {
        msg =
          "Invalid demo password, or this demo account has not been seeded yet. Use the team demo password.";
      } else if (authError.message.includes("Email not confirmed")) {
        msg = "Check your email to confirm your account, then try again.";
      }
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

  const effectiveMode = isDemoIdentifier ? "login" : authMode;
  const showConfirmPassword = effectiveMode === "signup";
  const submitLabel =
    checkingEmail
      ? "Checking…"
      : effectiveMode === "signup"
        ? loading
          ? "Creating account…"
          : "Create account"
        : loading
          ? "Signing in…"
          : effectiveMode === "login"
            ? "Sign in"
            : "Continue";

  return (
    <MarketingAuthShell>
      <MarketingAuthPanel>
        <MarketingAuthCard>
          <h1 className="font-futura-bold text-3xl uppercase tracking-[0.12em] text-white md:text-4xl">
            Sign in
          </h1>
          <p className="auth-muted font-futura-book mt-2 text-sm leading-relaxed">
            {!isSupabaseConfigured() && (
              <span className="text-[#A3E635]">
                Demo mode: Supabase not configured — you&apos;ll enter the app without auth.{" "}
              </span>
            )}
            {isDemoIdentifier ? (
              <>
                Signing in as <span className="text-white">{email.trim()}</span> — demo accounts
                never create new profiles.
              </>
            ) : (
              <>
                Enter your email and password, or a demo username (
                <span className="text-white">demo1</span>–<span className="text-white">demo10</span>
                ) with the team password.
              </>
            )}
          </p>

          {signedOut && !error && (
            <p className="auth-subtle mt-4 rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm">
              You&apos;ve been signed out. Sign in again to continue.
            </p>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <MarketingAuthInput
              label={isDemoLoginEnabled() ? "Email or demo username" : "Email"}
              id="email"
              type="text"
              required
              autoComplete="username"
              placeholder={isDemoLoginEnabled() ? "you@example.com or demo1" : "you@example.com"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => {
                if (email.trim() && !isDemoLoginIdentifier(email)) {
                  void resolveAuthMode();
                }
              }}
            />
            {selectedDemo ? (
              <p className="auth-muted text-xs">
                {selectedDemo.label} — {selectedDemo.hint}
              </p>
            ) : null}
            <MarketingAuthInput
              label="Password"
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete={effectiveMode === "signup" ? "new-password" : "current-password"}
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
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm leading-relaxed text-red-200">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || checkingEmail}
              className="font-futura-bold w-full rounded-xl bg-white px-4 py-3.5 text-sm uppercase tracking-[0.15em] text-[#0A0C10] transition hover:bg-gray-200 disabled:opacity-60"
            >
              {submitLabel}
            </button>

            <p className="text-center">
              <Link
                href="/forgot-password"
                className="font-futura-medium text-sm text-gray-400 transition hover:text-[#A3E635]"
              >
                Reset password
              </Link>
            </p>
          </form>

          <DemoAccountPicker
            identifier={email}
            onSelect={(username) => {
              setEmail(username);
              setAuthMode("login");
              setConfirmPassword("");
              setError("");
            }}
          />

          <p className="mt-6 text-center">
            <Link
              href="/"
              className="font-futura-medium inline-flex items-center gap-1 text-sm text-gray-400 transition hover:text-[#A3E635]"
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
              <p className="font-futura-medium auth-muted text-sm">Loading…</p>
            </MarketingAuthCard>
          </MarketingAuthPanel>
        </MarketingAuthShell>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}

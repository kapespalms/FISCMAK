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

function LoginPageContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const nextPath = sanitizeNextPath(searchParams.get("next"));
  const signedOut = searchParams.get("signed_out") === "1";

  useEffect(() => {
    rememberOnboardingNextPath(nextPath);
  }, [nextPath]);

  useEffect(() => {
    const authError = new URLSearchParams(window.location.search).get("error");
    if (authError) setError(decodeURIComponent(authError));
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!isSupabaseConfigured()) {
      navigateToAppPath(nextPath);
      return;
    }

    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
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

      navigateToAppPath(nextPath);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Sign-in failed. Please try again.",
      );
      setLoading(false);
    }
  }

  return (
    <MarketingAuthShell>
      <MarketingAuthPanel>
        <MarketingAuthCard>
          <h1 className="font-futura-bold text-3xl text-white md:text-4xl">Sign In</h1>
          <p className="font-futura-medium mt-2 text-sm text-gray-400">
            {!isSupabaseConfigured() && (
              <span className="text-marketing-accent">
                Demo mode: Supabase not configured — you&apos;ll enter the app without auth.{" "}
              </span>
            )}
            <Link href="/signup" className="text-marketing-accent transition hover:text-white">
              Create an account
            </Link>
          </p>

          {signedOut && !error && (
            <p className="mt-4 rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm text-gray-200">
              You&apos;ve been signed out. Sign in again to continue.
            </p>
          )}

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <MarketingAuthInput
              label="Email"
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <MarketingAuthInput
              label="Password"
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {error && (
              <p className="rounded-lg bg-[#f5d4c4] px-4 py-3 text-sm leading-relaxed text-[#1a2419]">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="font-futura-bold w-full cx-btn bg-marketing-accent px-4 py-3 text-sm text-black transition hover:bg-white disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign In"}
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

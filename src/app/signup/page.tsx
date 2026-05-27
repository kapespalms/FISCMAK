"use client";

import Link from "next/link";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { MarketingAuthInput } from "@/components/auth/MarketingAuthInput";
import { MarketingAuthCard, MarketingAuthPanel } from "@/components/marketing/MarketingAuthCard";
import { MarketingAuthShell } from "@/components/marketing/MarketingAuthShell";
import {
  extractInviteTokenFromPath,
  onboardingPathWithOptionalToken,
  rememberOnboardingNextPath,
  sanitizeNextPath,
} from "@/lib/auth/oauth";

function SignupPageContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [inviteToken, setInviteToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = sanitizeNextPath(searchParams.get("next") ?? "/app/onboarding");

  const effectiveNext = useMemo(
    () => onboardingPathWithOptionalToken(nextPath, inviteToken),
    [nextPath, inviteToken],
  );

  useEffect(() => {
    const fromQuery = searchParams.get("token");
    const fromNext = extractInviteTokenFromPath(nextPath);
    setInviteToken(fromQuery ?? fromNext ?? "");
  }, [searchParams, nextPath]);

  useEffect(() => {
    rememberOnboardingNextPath(effectiveNext);
  }, [effectiveNext]);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!isSupabaseConfigured()) {
      router.push(effectiveNext);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signUp({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.session) {
      window.location.assign(effectiveNext);
      return;
    }

    setError(
      "Account created — check your email to confirm, then sign in. Or disable email confirmation in Supabase Auth settings for local dev.",
    );
    setLoading(false);
  }

  return (
    <MarketingAuthShell>
      <MarketingAuthPanel>
        <MarketingAuthCard>
          <h1 className="font-futura-bold text-3xl text-white md:text-4xl">Create account</h1>
          <p className="font-futura-medium mt-2 text-sm text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="text-marketing-accent transition hover:text-white">
              Sign in
            </Link>
          </p>

          <form onSubmit={handleSignup} className="mt-8 space-y-4">
            <GoogleSignInButton next={effectiveNext} label="Continue with Google" variant="marketing" />

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/20" />
              </div>
              <div className="relative flex justify-center">
                <span className="font-futura-medium bg-[#1a2419] px-3 text-xs uppercase text-gray-500">
                  or
                </span>
              </div>
            </div>

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
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
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
            <MarketingAuthInput
              label="Program invite token (optional)"
              id="inviteToken"
              type="text"
              autoComplete="off"
              spellCheck={false}
              placeholder="From your program invite link"
              value={inviteToken}
              onChange={(e) => setInviteToken(e.target.value)}
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
              {loading ? "Creating account…" : "Create account"}
            </button>
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

export default function SignupPage() {
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
      <SignupPageContent />
    </Suspense>
  );
}

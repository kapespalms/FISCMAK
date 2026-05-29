"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { getAuthCallbackUrl } from "@/lib/auth/oauth";
import { MarketingAuthInput } from "@/components/auth/MarketingAuthInput";
import { MarketingAuthCard, MarketingAuthPanel } from "@/components/marketing/MarketingAuthCard";
import { MarketingAuthShell } from "@/components/marketing/MarketingAuthShell";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!isSupabaseConfigured()) {
      setError("Password reset requires Supabase to be configured.");
      setLoading(false);
      return;
    }

    const supabase = createClient();
    const redirectTo = getAuthCallbackUrl("/reset-password");
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });

    if (resetError) {
      setError(resetError.message);
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <MarketingAuthShell>
      <MarketingAuthPanel>
        <MarketingAuthCard>
          <h1 className="font-futura-bold text-3xl text-white md:text-4xl">Reset password</h1>
          <p className="auth-muted font-futura-medium mt-2 text-sm">
            {sent
              ? "If an account exists for that email, we sent a reset link."
              : "Enter your email and we will send a link to choose a new password."}
          </p>

          {!sent ? (
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <MarketingAuthInput
                label="Email"
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                {loading ? "Sending…" : "Send reset link"}
              </button>
            </form>
          ) : (
            <p className="auth-subtle mt-8 rounded-lg border border-white/15 px-4 py-3 text-sm">
              Check your inbox (and spam) for the reset link. It expires after a short time.
            </p>
          )}

          <p className="mt-6 text-center">
            <Link
              href="/login"
              className="font-futura-medium inline-flex items-center gap-1 text-sm transition hover:text-marketing-accent"
            >
              <ChevronLeft size={16} />
              Back to sign in
            </Link>
          </p>
        </MarketingAuthCard>
      </MarketingAuthPanel>
    </MarketingAuthShell>
  );
}

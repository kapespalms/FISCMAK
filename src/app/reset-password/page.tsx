"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { MarketingAuthInput } from "@/components/auth/MarketingAuthInput";
import { MarketingAuthCard, MarketingAuthPanel } from "@/components/marketing/MarketingAuthCard";
import { MarketingAuthShell } from "@/components/marketing/MarketingAuthShell";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (!isSupabaseConfigured()) {
      setError("Password reset requires Supabase to be configured.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    window.location.assign("/app");
  }

  return (
    <MarketingAuthShell>
      <MarketingAuthPanel>
        <MarketingAuthCard>
          <h1 className="font-futura-bold text-3xl text-white md:text-4xl">New password</h1>
          <p className="font-futura-medium mt-2 text-sm text-gray-400">
            Choose a new password for your account.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <MarketingAuthInput
              label="New password"
              id="password"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <MarketingAuthInput
              label="Confirm password"
              id="confirm-password"
              type="password"
              required
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
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
              {loading ? "Saving…" : "Update password"}
            </button>
          </form>

          <p className="mt-6 text-center">
            <Link
              href="/login"
              className="font-futura-medium inline-flex items-center gap-1 text-sm text-white transition hover:text-marketing-accent"
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

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { ensureAppUser } from "@/lib/v2/ensure-app-user";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";
import { MarketingAuthInput } from "@/components/auth/MarketingAuthInput";
import { MarketingAuthShell } from "@/components/marketing/MarketingAuthShell";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const authError = new URLSearchParams(window.location.search).get("error");
    if (authError) setError(decodeURIComponent(authError));
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!isSupabaseConfigured()) {
      router.push("/app");
      return;
    }

    const supabase = createClient();
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      const msg =
        authError.message.includes("Email not confirmed")
          ? "Check your email to confirm your account, then try again."
          : authError.message;
      setError(msg);
      setLoading(false);
      return;
    }

    if (data.user) await ensureAppUser(supabase, data.user);

    window.location.assign("/app");
  }

  return (
    <MarketingAuthShell>
      <div className="flex flex-1 items-center justify-center px-6 py-12 md:py-16">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1a2419] px-8 py-10">
          <h1 className="font-futura-bold text-3xl text-white md:text-4xl">Sign In</h1>
          <p className="font-futura-condensed mt-2 text-sm text-gray-400">
            {!isSupabaseConfigured() && (
              <span className="text-marketing-accent">
                Demo mode: Supabase not configured — you&apos;ll enter the app without auth.{" "}
              </span>
            )}
            <Link href="/signup" className="text-marketing-accent transition hover:text-white">
              Create an account
            </Link>
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <GoogleSignInButton next="/app" variant="marketing" />

            <div className="relative py-1">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/20" />
              </div>
              <div className="relative flex justify-center">
                <span className="font-futura-condensed bg-[#1a2419] px-3 text-xs uppercase text-gray-500">
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
              className="font-futura-bold w-full rounded-lg bg-marketing-accent px-4 py-3 text-sm text-black transition hover:bg-white disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="mt-6 text-center">
            <Link
              href="/"
              className="font-futura-condensed inline-flex items-center gap-1 text-sm text-gray-400 transition hover:text-marketing-accent"
            >
              <ChevronLeft size={16} />
              Back to home
            </Link>
          </p>
        </div>
      </div>
    </MarketingAuthShell>
  );
}

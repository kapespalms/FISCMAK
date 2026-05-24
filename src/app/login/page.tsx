"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { ensureAppUser } from "@/lib/v2/ensure-app-user";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

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

    // Hard navigation so session cookies are loaded before AuthGuard runs
    window.location.assign("/app");
  }

  return (
    <div className="cx-page-gradient-green flex min-h-full items-center justify-center p-6">
      <Card glass className="w-full max-w-md">
        <h1 className="text-page-title">Sign in</h1>
        <p className="mt-2 text-sm text-cx-forest-dark/70">
          {!isSupabaseConfigured() && (
            <span className="text-cx-attention">
              Demo mode: Supabase not configured — you&apos;ll enter the app without auth.{" "}
            </span>
          )}
          <Link href="/signup" className="font-medium text-cx-forest-dark hover:text-cx-forest-dark/80">
            Create an account
          </Link>
        </p>
        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <GoogleSignInButton next="/app" />
          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-cx-forest-dark/15" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white/70 px-2 text-cx-forest-dark/60 backdrop-blur-sm">or</span>
            </div>
          </div>
          <Input
            label="Email"
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Password"
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <p className="cx-alert-banner px-4 py-3 text-sm">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm">
          <Link
            href="/"
            className="inline-flex items-center gap-1 font-medium text-cx-forest-dark hover:text-cx-forest-dark/80"
          >
            <ChevronLeft size={16} />
            Back to home
          </Link>
        </p>
      </Card>
    </div>
  );
}

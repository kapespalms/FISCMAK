"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { GoogleSignInButton } from "@/components/auth/GoogleSignInButton";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!isSupabaseConfigured()) {
      router.push("/app/onboarding");
      return;
    }

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({ email, password });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/app/onboarding");
    router.refresh();
  }

  return (
    <div className="cx-page-gradient flex min-h-full items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <h1 className="text-page-title">Get started</h1>
        <p className="mt-2 text-sm text-cx-forest-dark/70">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-cx-forest-dark hover:text-cx-forest-dark/80">
            Sign in
          </Link>
        </p>
        <form onSubmit={handleSignup} className="mt-6 space-y-4">
          <GoogleSignInButton next="/app/onboarding" label="Sign up with Google" />
          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-cx-forest-dark/15" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-cx-white px-2 text-cx-forest-dark/60">or</span>
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
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <p className="cx-alert-banner px-4 py-3 text-sm">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

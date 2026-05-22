"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!isSupabaseConfigured()) {
      router.push("/app");
      return;
    }

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/app");
    router.refresh();
  }

  return (
    <div className="flex min-h-full items-center justify-center bg-fiscmak-subtle p-6">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold">Sign in</h1>
        <p className="mt-2 text-sm text-fiscmak-muted">
          {!isSupabaseConfigured() && (
            <span className="text-fiscmak-amber">
              Demo mode: Supabase not configured — you&apos;ll enter the app
              without auth.{" "}
            </span>
          )}
          <Link href="/signup" className="text-fiscmak-green hover:underline">
            Create an account
          </Link>
        </p>
        <form onSubmit={handleLogin} className="mt-6 space-y-4">
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
          {error && <p className="text-sm text-fiscmak-red">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm">
          <Link href="/" className="text-fiscmak-green hover:underline">
            ← Back to home
          </Link>
        </p>
      </Card>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

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
    <div className="flex min-h-full items-center justify-center bg-fiscmak-subtle p-6">
      <Card className="w-full max-w-md">
        <h1 className="text-2xl font-bold">Get started</h1>
        <p className="mt-2 text-sm text-fiscmak-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-fiscmak-green hover:underline">
            Sign in
          </Link>
        </p>
        <form onSubmit={handleSignup} className="mt-6 space-y-4">
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
          {error && <p className="text-sm text-fiscmak-red">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

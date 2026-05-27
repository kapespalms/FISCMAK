"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

type AppleSignInButtonProps = {
  next?: string;
  label?: string;
};

function AppleIcon() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05 1.88-3.71 1.88-1.66 0-2.07-1-3.71-1-1.66 0-2.17 1-3.73 1.02-1.56.02-2.75-1.57-3.73-2.52C1.79 15.25 1.04 10.45 3.95 7.9c1.45-1.26 3.34-1.99 5.24-1.97 1.64.03 2.53 1.07 3.81 1.07 1.26 0 2.03-1.07 3.81-1.03 1.29.02 2.65.68 3.63 1.75-3.19 1.96-2.67 6.07.53 7.45-.67 1.74-1.54 3.47-2.92 4.11zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

export function AppleSignInButton({
  next = "/app",
  label = "Continue with Apple",
}: AppleSignInButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleAppleSignIn() {
    if (!isSupabaseConfigured()) {
      setError("Apple sign-in requires Supabase to be configured.");
      return;
    }

    setLoading(true);
    setError("");

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: { redirectTo },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
  }

  if (!isSupabaseConfigured()) return null;

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="secondary"
        className="w-full gap-2"
        disabled={loading}
        onClick={() => void handleAppleSignIn()}
      >
        <AppleIcon />
        {loading ? "Redirecting…" : label}
      </Button>
      {error && <p className="text-sm text-cx-attention">{error}</p>}
    </div>
  );
}

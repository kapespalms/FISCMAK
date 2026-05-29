"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { signOutAndRedirect } from "@/lib/auth/session";

type SignOutButtonProps = {
  className?: string;
  /** Where to land after sign-out. Defaults to login with signed_out flag. */
  redirectTo?: string;
  variant?: "menu" | "settings";
};

export function SignOutButton({
  className,
  redirectTo = "/login?signed_out=1",
  variant = "menu",
}: SignOutButtonProps) {
  const [signingOut, setSigningOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignOut() {
    setSigningOut(true);
    setError(null);
    try {
      await signOutAndRedirect(redirectTo);
    } catch {
      setSigningOut(false);
      setError("Could not sign out. Please try again.");
    }
  }

  if (variant === "settings") {
    return (
      <div className="space-y-2">
        <button
          type="button"
          disabled={signingOut}
          onClick={() => void handleSignOut()}
          className={cn(
            "inline-flex items-center gap-2 rounded-xl border border-cx-forest-dark/20 bg-white px-4 py-2.5 text-sm font-medium text-cx-forest-dark transition hover:bg-cx-forest-dark/5 disabled:opacity-60",
            className,
          )}
        >
          <LogOut size={16} aria-hidden />
          {signingOut ? "Signing out…" : "Sign out"}
        </button>
        {error ? <p className="text-sm text-cx-attention">{error}</p> : null}
        <p className="text-xs text-cx-forest-dark/60">
          Ends your session on this device. You will need to sign in again to access your workspace.
        </p>
      </div>
    );
  }

  return (
    <>
      {error ? <p className="px-4 py-1 text-xs text-cx-attention">{error}</p> : null}
      <button
        type="button"
        role="menuitem"
        disabled={signingOut}
        onClick={() => void handleSignOut()}
        className={cn(
          "flex w-full items-center gap-2.5 border-t border-cx-forest-dark/10 px-4 py-2.5 text-sm text-cx-forest-dark/70 transition-colors hover:bg-cx-forest-dark/5 hover:text-cx-forest-dark disabled:opacity-60",
          className,
        )}
      >
        <LogOut size={16} aria-hidden />
        {signingOut ? "Signing out…" : "Sign out"}
      </button>
    </>
  );
}

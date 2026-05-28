"use client";

import type { User } from "@supabase/supabase-js";
import { ensureAppUser } from "@/lib/v2/ensure-app-user";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(!isSupabaseConfigured());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    const supabase = createClient();
    let cancelled = false;

    async function bootstrap(user: User) {
      try {
        await ensureAppUser(supabase, user);
        if (!cancelled) setReady(true);
      } catch (e) {
        // Don't block sign-in if profile bootstrap fails — user can retry in app.
        console.error("[AuthGuard] ensureAppUser failed:", e);
        if (!cancelled) setReady(true);
      }
    }

    async function initSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (cancelled) return;

      if (session?.user) {
        await bootstrap(session.user);
        return;
      }

      router.replace("/login");
    }

    void initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;

      if (session?.user) {
        // Defer async work — awaiting inside this callback can deadlock Supabase auth.
        queueMicrotask(() => {
          if (!cancelled) void bootstrap(session.user);
        });
        return;
      }

      if (event === "SIGNED_OUT") {
        setReady(false);
        router.replace("/login");
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [router]);

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="max-w-md text-center text-cx-attention">{error}</p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-cx-forest-dark/70">Loading…</p>
      </div>
    );
  }

  return <>{children}</>;
}

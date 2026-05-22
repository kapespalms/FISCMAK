"use client";

import { ensureAppUser } from "@/lib/supabase/ensure-user";
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

    async function init() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }
      try {
        await ensureAppUser(supabase, session.user);
        setReady(true);
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : "Could not initialize your account. Run docs/supabase-auth-bridge.sql in Supabase.",
        );
      }
    }

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!session) router.replace("/login");
      },
    );

    return () => subscription.unsubscribe();
  }, [router]);

  if (error) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="max-w-md text-center text-fiscmak-red">{error}</p>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <p className="text-fiscmak-muted">Loading…</p>
      </div>
    );
  }

  return <>{children}</>;
}

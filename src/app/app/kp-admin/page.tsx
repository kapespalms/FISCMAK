"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { KpAdminDashboard } from "@/components/admin/KpAdminDashboard";

export default function KpAdminPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "allowed" | "denied">("loading");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/v1/admin/kp-access");
        if (!res.ok) {
          if (!cancelled) setStatus("denied");
          return;
        }
        const data = (await res.json()) as { allowed?: boolean };
        if (cancelled) return;
        if (data.allowed) {
          setStatus("allowed");
        } else {
          setStatus("denied");
          router.replace("/app/dashboard");
        }
      } catch {
        if (!cancelled) setStatus("denied");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (status === "loading") {
    return (
      <PageShell eyebrow="Admin" title="KP Admin" subtitle="Loading…" maxWidth="md">
        <p className="text-sm text-cx-text/70">Checking access…</p>
      </PageShell>
    );
  }

  if (status === "denied") {
    return null;
  }

  return (
    <PageShell
      eyebrow="Admin"
      title="KP Admin Dashboard"
      subtitle="Retired components and internal review surfaces"
      maxWidth="md"
    >
      <KpAdminDashboard />
    </PageShell>
  );
}

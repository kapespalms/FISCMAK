"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CardSection } from "@/components/ui/CardSection";
import { ShieldCheck } from "lucide-react";

export function KpAdminSettingsLink() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/v1/admin/kp-access");
        if (!res.ok) return;
        const data = (await res.json()) as { allowed?: boolean };
        if (!cancelled && data.allowed) setAllowed(true);
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!allowed) return null;

  return (
    <CardSection
      eyebrow="Founder"
      title="KP Admin Dashboard"
      description="Review retired onboarding and evidence surfaces removed from user flows."
      icon={ShieldCheck}
    >
      <Link
        href="/app/kp-admin"
        className="inline-flex text-sm font-semibold text-cx-forest-dark underline underline-offset-2 hover:text-cx-forest-dark/80"
      >
        Open KP Admin Dashboard →
      </Link>
    </CardSection>
  );
}

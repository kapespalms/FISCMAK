"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { CardSection } from "@/components/ui/CardSection";
import { Button } from "@/components/ui/Button";

type SubscriptionState = {
  tier: "free" | "premium";
  stripe_configured: boolean;
};

export function PremiumUpgradePanel() {
  const [state, setState] = useState<SubscriptionState | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/subscription")
      .then((r) => r.json())
      .then((data) => setState({ tier: data.tier, stripe_configured: data.stripe_configured }))
      .catch(() => setState({ tier: "free", stripe_configured: false }));
  }, []);

  async function startCheckout(planType: "monthly" | "annual") {
    setLoading(planType);
    setError(null);
    try {
      const res = await fetch("/api/v1/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");
      if (data.url) window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Checkout failed");
    } finally {
      setLoading(null);
    }
  }

  async function openPortal() {
    setLoading("portal");
    setError(null);
    try {
      const res = await fetch("/api/v1/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "portal" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Portal failed");
      if (data.url) window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Portal failed");
    } finally {
      setLoading(null);
    }
  }

  if (!state) return null;

  return (
    <CardSection
      eyebrow="Premium"
      title={state.tier === "premium" ? "Premium active" : "Upgrade to Premium"}
      description={
        state.tier === "premium"
          ? "You have full AI coaching, ontology classification, and job matching."
          : "Free tier includes keyword coaching. Premium unlocks AI-powered Mak ($9/month)."
      }
      icon={Sparkles}
    >
      {state.tier === "premium" ? (
        <Button variant="secondary" onClick={openPortal} disabled={loading === "portal"}>
          {loading === "portal" ? "Opening…" : "Manage subscription"}
        </Button>
      ) : state.stripe_configured ? (
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => startCheckout("monthly")} disabled={Boolean(loading)}>
            {loading === "monthly" ? "Redirecting…" : "Upgrade — $9/month"}
          </Button>
          <Button variant="secondary" onClick={() => startCheckout("annual")} disabled={Boolean(loading)}>
            {loading === "annual" ? "Redirecting…" : "Annual — $99/year"}
          </Button>
        </div>
      ) : (
        <p className="text-sm text-cx-text/70">
          Stripe is not configured yet. Add STRIPE_SECRET_KEY and price IDs to enable checkout.
        </p>
      )}
      {error ? <p className="mt-3 text-sm text-[#C28D6C]">{error}</p> : null}
    </CardSection>
  );
}

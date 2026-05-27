/**
 * Stripe integration for FISCMAK Premium subscriptions.
 */

import Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";

export const STRIPE_PRICES = {
  PREMIUM_MONTHLY: process.env.STRIPE_PRICE_PREMIUM_MONTHLY ?? "",
  PREMIUM_ANNUAL: process.env.STRIPE_PRICE_PREMIUM_ANNUAL ?? "",
};

function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2026-04-22.dahlia" });
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY?.trim());
}

export async function createCheckoutSession(
  userId: string,
  userEmail: string,
  planType: "monthly" | "annual" = "monthly",
) {
  const stripe = getStripe();
  if (!stripe) throw new Error("STRIPE_SECRET_KEY is not configured");

  const priceId =
    planType === "monthly" ? STRIPE_PRICES.PREMIUM_MONTHLY : STRIPE_PRICES.PREMIUM_ANNUAL;
  if (!priceId) throw new Error("Stripe price ID is not configured");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.fiscmak.com";

  return stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    success_url: `${appUrl}/app/dashboard?subscription=success`,
    cancel_url: `${appUrl}/app/settings?subscription=cancelled`,
    customer_email: userEmail,
    client_reference_id: userId,
    metadata: { userId },
    subscription_data: { metadata: { userId } },
  });
}

export async function createCustomerPortalSession(customerId: string) {
  const stripe = getStripe();
  if (!stripe) throw new Error("STRIPE_SECRET_KEY is not configured");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.fiscmak.com";
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl}/app/settings`,
  });
}

export async function getUserSubscription(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching subscription:", error);
    return null;
  }
  return data;
}

export async function hasActiveSubscription(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const subscription = await getUserSubscription(supabase, userId);
  if (!subscription) return false;

  return (
    subscription.status === "active" &&
    (!subscription.cancel_at || new Date(subscription.cancel_at) > new Date())
  );
}

export async function handleStripeWebhook(supabase: SupabaseClient, event: Stripe.Event) {
  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;
      if (!userId) break;

      const planType =
        subscription.items.data[0]?.price?.recurring?.interval === "year" ? "annual" : "monthly";

      const periodStart =
        "current_period_start" in subscription &&
        typeof subscription.current_period_start === "number"
          ? subscription.current_period_start
          : null;
      const periodEnd =
        "current_period_end" in subscription &&
        typeof subscription.current_period_end === "number"
          ? subscription.current_period_end
          : null;

      await supabase.from("user_subscriptions").upsert(
        {
          user_id: userId,
          stripe_subscription_id: subscription.id,
          stripe_customer_id:
            typeof subscription.customer === "string"
              ? subscription.customer
              : subscription.customer.id,
          status: subscription.status,
          plan_type: planType,
          current_period_start: periodStart
            ? new Date(periodStart * 1000).toISOString()
            : null,
          current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
          cancel_at: subscription.cancel_at
            ? new Date(subscription.cancel_at * 1000).toISOString()
            : null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      );
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const userId = subscription.metadata?.userId;
      if (!userId) break;
      await supabase
        .from("user_subscriptions")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("user_id", userId);
      break;
    }
    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;
      console.log(`Payment succeeded for customer ${invoice.customer}`);
      break;
    }
    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      console.error(`Payment failed for customer ${invoice.customer}`);
      break;
    }
    default:
      break;
  }
}

export function verifyWebhookSignature(body: string, signature: string): Stripe.Event {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!stripe || !webhookSecret) {
    throw new Error("Stripe webhook is not configured");
  }
  return stripe.webhooks.constructEvent(body, signature, webhookSecret);
}

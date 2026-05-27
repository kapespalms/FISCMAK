import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  createCheckoutSession,
  createCustomerPortalSession,
  getUserSubscription,
  hasActiveSubscription,
  isStripeConfigured,
} from "@/lib/v2/stripe-config";
import { FREE_MESSAGE_LIMIT, getMessageBalance } from "@/lib/v2/message-credits";
import { getAppUser, isErrorResponse, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  if (auth.demo || !isStripeConfigured()) {
    return jsonOk({
      tier: "free",
      subscription: null,
      stripe_configured: false,
      message_balance: FREE_MESSAGE_LIMIT,
      free_message_limit: FREE_MESSAGE_LIMIT,
      features: {
        free: ["Onboarding", "Keyword coaching", "Activity tracking", "CV templates"],
        premium: ["AI coaching", "Ontology classifier", "Job matching", "Weekly insights"],
      },
    });
  }

  const supabase = await createClient();
  const subscription = await getUserSubscription(supabase, auth.userId);
  const isPremium = await hasActiveSubscription(supabase, auth.userId);
  const user = await getAppUser(auth.userId, auth.demo);
  const messageBalance = getMessageBalance(
    user?.onboarding_metadata ?? undefined,
    user?.message_balance,
  );

  return jsonOk({
    tier: isPremium ? "premium" : "free",
    subscription,
    stripe_configured: true,
    message_balance: isPremium ? null : messageBalance,
    free_message_limit: FREE_MESSAGE_LIMIT,
    features: {
      free: ["Onboarding profile", "Keyword signal detection", "Activity tracking", "CV bullet templates"],
      premium: [
        "All free features",
        "AI coaching with Mak (Claude)",
        "Full ontology classifier",
        "Semantic job matching",
        "Career recommendations",
      ],
    },
  });
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  if (auth.demo) {
    return NextResponse.json({ error: "Subscriptions require a signed-in account" }, { status: 400 });
  }
  if (!isStripeConfigured()) {
    return NextResponse.json({ error: "Stripe is not configured" }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const action = body.action as string | undefined;
  const planType = body.planType === "annual" ? "annual" : "monthly";

  const supabase = await createClient();
  const subscription = await getUserSubscription(supabase, auth.userId);

  if (action === "portal") {
    if (!subscription?.stripe_customer_id) {
      return NextResponse.json({ error: "No billing account found" }, { status: 400 });
    }
    const portal = await createCustomerPortalSession(subscription.stripe_customer_id);
    return jsonOk({ url: portal.url });
  }

  const session = await createCheckoutSession(auth.userId, auth.email, planType);
  return jsonOk({ url: session.url });
}

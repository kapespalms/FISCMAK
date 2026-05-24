import { NextRequest, NextResponse } from "next/server";
import { handleStripeWebhook, verifyWebhookSignature } from "@/lib/v2/stripe-config";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature") || "";

  try {
    const event = verifyWebhookSignature(body, signature);
    const supabase = createAdminClient();

    await handleStripeWebhook(supabase, event);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 400 });
  }
}

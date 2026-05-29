import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { resolveDemoLoginEmail } from "@/lib/v2/fiscmak-demo-accounts";
import { jsonError, jsonOk } from "@/lib/v2/api-helpers";

const TEST_EMAIL_DOMAIN = "test.fiscmak.local";

/** Check whether an auth account exists for this email (signup vs sign-in routing). */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const raw = typeof body.email === "string" ? body.email.trim() : "";
    const email = (resolveDemoLoginEmail(raw) ?? raw).toLowerCase();
    if (!email || !email.includes("@")) {
      return jsonError("validation_error", "Valid email required", 400);
    }

    if (email.endsWith(`@${TEST_EMAIL_DOMAIN}`)) {
      return jsonOk({ exists: true, demo: true });
    }

    if (!isSupabaseConfigured()) {
      return jsonOk({ exists: false, demo: true });
    }

    const admin = createAdminClient();
    const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (error) {
      console.error("[auth/email-status]", error.message);
      return jsonError("internal_error", "Could not verify email", 500);
    }

    const exists = data.users.some((u) => u.email?.toLowerCase() === email);
    return jsonOk({ exists });
  } catch (error) {
    console.error("[auth/email-status] POST failed:", error);
    return jsonError("internal_error", "Could not verify email", 500);
  }
}

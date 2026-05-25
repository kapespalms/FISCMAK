import { jsonError, jsonOk } from "@/lib/v2/api-helpers";
import { sendContactInquiry } from "@/lib/v2/notification-service";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function trimField(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

/** Public marketing contact form — sends inquiry to FISCMAK inbox. */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const name = trimField(body.name, 200);
  const email = trimField(body.email, 320);
  const question = trimField(body.question, 5000);

  if (!name || !email || !question) {
    return jsonError("validation_error", "Name, email, and question are required.", 400);
  }

  if (!EMAIL_PATTERN.test(email)) {
    return jsonError("validation_error", "Please enter a valid email address.", 400);
  }

  const result = await sendContactInquiry({ name, email, question });

  if (!result.sent) {
    return jsonError(
      "email_send_failed",
      result.reason === "email_not_configured"
        ? "Contact email is not configured yet. Please try again later."
        : "Could not send your message. Please try again.",
      503,
    );
  }

  return jsonOk({ sent: true });
}

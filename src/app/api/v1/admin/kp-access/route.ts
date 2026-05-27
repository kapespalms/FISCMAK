import { isKpAdminEmail } from "@/lib/v2/kp-admin";
import { isErrorResponse, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";

export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  return jsonOk({
    allowed: isKpAdminEmail(auth.email),
    email: auth.email,
  });
}

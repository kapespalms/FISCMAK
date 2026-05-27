import {
  isErrorResponse,
  jsonError,
  jsonOk,
  requireApiUser,
} from "@/lib/v2/api-helpers";
import { loadSelfRatings, saveSelfRatings } from "@/lib/v2/gme/trainee-gme-data";

export async function GET(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") ?? "current";

  try {
    const ratings = await loadSelfRatings(auth.userId, auth.demo, period);
    return jsonOk({ period, ratings });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not load self-ratings.";
    return jsonError("db_error", message, 500);
  }
}

export async function PUT(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  let body: {
    period?: string;
    ratings?: Array<{
      subcompetency_id: string;
      self_level: number | null;
      narrative_reflection?: string | null;
    }>;
  };

  try {
    body = await request.json();
  } catch {
    return jsonError("bad_request", "Invalid JSON body.", 400);
  }

  if (!Array.isArray(body.ratings)) {
    return jsonError("bad_request", "ratings array is required.", 400);
  }

  for (const rating of body.ratings) {
    if (!rating.subcompetency_id) {
      return jsonError("bad_request", "Each rating needs subcompetency_id.", 400);
    }
    if (
      rating.self_level != null &&
      (!Number.isInteger(rating.self_level) || rating.self_level < 1 || rating.self_level > 5)
    ) {
      return jsonError("bad_request", "self_level must be 1–5 or null.", 400);
    }
  }

  const period = body.period ?? "current";

  try {
    const ratings = await saveSelfRatings(
      auth.userId,
      auth.email,
      auth.demo,
      period,
      body.ratings,
    );
    return jsonOk({ period, ratings });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Could not save self-ratings.";
    return jsonError("db_error", message, 500);
  }
}

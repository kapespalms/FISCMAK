import { isErrorResponse, jsonError, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";
import {
  captureBankItem,
  fetchBankItems,
  type CaptureInput,
  type CvItemType,
  CV_ITEM_TYPES,
} from "@/lib/v2/output-studio-bank";

// GET /api/v1/output/studio/bank
// Query params: since_date (ISO date), item_type (repeatable or comma-separated)
export async function GET(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  if (auth.demo) return jsonOk({ bank_items: [] });

  const url = new URL(request.url);
  const sinceDate = url.searchParams.get("since_date") ?? undefined;
  const rawTypes = url.searchParams.getAll("item_type").flatMap((t) => t.split(","));
  const itemTypes = rawTypes.filter((t) => (CV_ITEM_TYPES as readonly string[]).includes(t)) as CvItemType[];

  try {
    const bank_items = await fetchBankItems(auth.userId, {
      since_date: sinceDate,
      item_type: itemTypes.length ? itemTypes : undefined,
    });
    return jsonOk({ bank_items });
  } catch (err) {
    console.error("[output/studio/bank GET]", err);
    return jsonError("db_error", "Failed to fetch bank items.", 500);
  }
}

// POST /api/v1/output/studio/bank
// Body: { evidence_unit_id, item_type, structured_data?, display_label? }
export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  if (auth.demo) return jsonError("demo_unsupported", "Output Studio bank is not available in demo mode.", 403);

  let body: Partial<CaptureInput>;
  try {
    body = await request.json();
  } catch {
    return jsonError("validation_error", "Invalid JSON body.", 400);
  }

  if (!body.evidence_unit_id || !body.item_type) {
    return jsonError("validation_error", "evidence_unit_id and item_type are required.", 400);
  }
  if (!(CV_ITEM_TYPES as readonly string[]).includes(body.item_type)) {
    return jsonError("validation_error", `Unrecognized item_type: ${body.item_type}`, 400);
  }

  try {
    const bank_item = await captureBankItem(auth.userId, {
      evidence_unit_id: body.evidence_unit_id,
      item_type: body.item_type,
      structured_data: body.structured_data,
      display_label: body.display_label,
    });
    return jsonOk({ bank_item }, 201);
  } catch (err) {
    console.error("[output/studio/bank POST]", err);
    return jsonError("db_error", "Failed to capture bank item.", 500);
  }
}

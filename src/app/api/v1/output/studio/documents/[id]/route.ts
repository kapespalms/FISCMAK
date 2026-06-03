import { isErrorResponse, jsonError, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";
import {
  fetchOutputDocument,
  updateOutputDocument,
  type DocumentPatch,
  type SectionContent,
} from "@/lib/v2/output-studio-generate";

// GET /api/v1/output/studio/documents/[id]
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  if (auth.demo) return jsonError("demo_unsupported", "Output Studio is not available in demo mode.", 403);

  const { id } = await params;
  try {
    const document = await fetchOutputDocument(auth.userId, id);
    if (!document) return jsonError("not_found", "Document not found.", 404);
    return jsonOk({ document });
  } catch (err) {
    console.error("[output/studio/documents/[id] GET]", err);
    return jsonError("db_error", "Failed to fetch document.", 500);
  }
}

// PATCH /api/v1/output/studio/documents/[id]
// Body: { sections?, status?, title? }
// sections — full replacement of the sections array (snapshot semantics: no partial merge)
// status   — one of: draft | review_ready | exported | archived
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  if (auth.demo) return jsonError("demo_unsupported", "Output Studio is not available in demo mode.", 403);

  const { id } = await params;

  let body: { sections?: SectionContent[]; status?: string; title?: string };
  try {
    body = await request.json();
  } catch {
    return jsonError("validation_error", "Invalid JSON body.", 400);
  }

  const VALID_STATUSES = ["draft", "review_ready", "exported", "archived"] as const;
  type ValidStatus = (typeof VALID_STATUSES)[number];

  const patch: DocumentPatch = {};
  if (body.sections !== undefined) patch.sections = body.sections;
  if (body.title !== undefined) patch.title = body.title;
  if (body.status !== undefined) {
    if (!(VALID_STATUSES as readonly string[]).includes(body.status)) {
      return jsonError("validation_error", `Invalid status: ${body.status}`, 400);
    }
    patch.status = body.status as ValidStatus;
  }

  if (!Object.keys(patch).length) {
    return jsonError("validation_error", "No valid fields to update (sections, status, title).", 400);
  }

  try {
    const document = await updateOutputDocument(auth.userId, id, patch);
    return jsonOk({ document });
  } catch (err) {
    console.error("[output/studio/documents/[id] PATCH]", err);
    return jsonError("db_error", "Failed to update document.", 500);
  }
}

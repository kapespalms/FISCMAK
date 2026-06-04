/**
 * POST /api/v1/output/studio/documents/[id]/export/docx
 *
 * Converts the saved ProseMirror sections to a .docx file and returns it as
 * an attachment download. Only enabled, non-empty sections are included.
 * No LLM, no content invention — faithful render of what's in the DB.
 */

import { isErrorResponse, jsonError, requireApiUser } from "@/lib/v2/api-helpers";
import { fetchOutputDocument, updateOutputDocument } from "@/lib/v2/output-studio-generate";
import { buildDocxBuffer, docxFilename } from "@/lib/v2/output-studio-export";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  if (auth.demo) {
    return jsonError("demo_unsupported", "Export is not available in demo mode.", 403);
  }

  const { id } = await params;

  let doc;
  try {
    doc = await fetchOutputDocument(auth.userId, id);
  } catch (err) {
    console.error("[export/docx] fetch error", err);
    return jsonError("db_error", "Failed to load document.", 500);
  }

  if (!doc) return jsonError("not_found", "Document not found.", 404);

  let buffer: Buffer;
  try {
    buffer = await buildDocxBuffer(doc);
  } catch (err) {
    console.error("[export/docx] conversion error", err);
    return jsonError("export_error", "Failed to generate .docx file.", 500);
  }

  // Mark document as exported (non-blocking — ignore update errors).
  updateOutputDocument(auth.userId, id, { status: "exported" }).catch(() => undefined);

  const filename = docxFilename(doc);

  return new Response(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

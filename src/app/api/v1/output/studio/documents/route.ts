import { isErrorResponse, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";
import { fetchOutputDocuments } from "@/lib/v2/output-studio-generate";

// GET /api/v1/output/studio/documents
// Returns all output_documents for the authenticated user, most-recently-edited first.
export async function GET() {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  if (auth.demo) return jsonOk({ documents: [] });

  try {
    const documents = await fetchOutputDocuments(auth.userId);
    return jsonOk({ documents });
  } catch (err) {
    console.error("[output/studio/documents GET]", err);
    return jsonOk({ error: "db_error", documents: [] }, 500);
  }
}

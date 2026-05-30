import {
  getAppUser,
  isErrorResponse,
  jsonError,
  jsonOk,
  requireApiUser,
  upsertAppUser,
} from "@/lib/v2/api-helpers";
import { fetchDocuments } from "@/lib/v2/db";
import {
  documentFileNameFromRecord,
  documentLabelFromRecord,
} from "@/lib/v2/onboarding-document-types";
import {
  DocumentExtractError,
  extractDocumentText,
} from "@/lib/v2/document-upload";
import { isAcceptedCvFileName } from "@/lib/v2/document-upload-types";
import { getOnboardingMetadata } from "@/lib/v2/onboarding-compute";
import {
  getUserOutputTemplate,
  getUserOutputTemplates,
  isKnownOutputTemplateType,
  removeUserOutputTemplate,
  resolveUserOutputTemplate,
  serializeUserOutputTemplateForClient,
  setUserOutputTemplate,
  truncateTemplateText,
  userOutputTemplateFromDocument,
  type UserOutputTemplate,
} from "@/lib/v2/output-user-templates";

export async function GET(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) return jsonOk({ error: "not_found" }, 404);

  const templateType = new URL(request.url).searchParams.get("template_type");
  const meta = getOnboardingMetadata(user);
  const documents = await fetchDocuments(auth.userId, auth.demo);
  const all = getUserOutputTemplates(meta);

  const seedableDocuments = documents
    .filter((d) => d.extracted_text?.trim())
    .map((d) => ({
      document_id: d.document_id,
      file_name: documentFileNameFromRecord(d),
      document_label: documentLabelFromRecord(d),
      document_type: d.document_type,
      uploaded_at: d.uploaded_at,
      preview: d.extracted_text?.slice(0, 200) ?? "",
    }));

  if (templateType) {
    if (!isKnownOutputTemplateType(templateType)) {
      return jsonError("validation_error", "Unknown template type.", 400);
    }
    const template = resolveUserOutputTemplate(meta, templateType, documents);
    return jsonOk({
      template_type: templateType,
      template: template ? serializeUserOutputTemplateForClient(template) : null,
      seedable_documents: seedableDocuments,
    });
  }

  return jsonOk({
    templates: Object.entries(all)
      .filter((entry): entry is [string, UserOutputTemplate] => entry[1] != null)
      .map(([type, t]) => ({
        template_type: type,
        source: t.source ?? "upload",
        file_name: t.file_name,
        word_count: t.word_count,
        uploaded_at: t.uploaded_at,
      })),
    seedable_documents: seedableDocuments,
  });
}

export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) return jsonOk({ error: "not_found" }, 404);

  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = (await request.json()) as {
      template_type?: string;
      document_id?: string;
    };
    const templateType = body.template_type ?? "";
    const documentId = body.document_id ?? "";

    if (!isKnownOutputTemplateType(templateType)) {
      return jsonError("validation_error", "Valid template_type required.", 400);
    }
    if (!documentId) {
      return jsonError("validation_error", "document_id required.", 400);
    }

    const documents = await fetchDocuments(auth.userId, auth.demo);
    const doc = documents.find((d) => d.document_id === documentId);
    if (!doc) return jsonError("not_found", "Document not found.", 404);

    const record = userOutputTemplateFromDocument(doc);
    if (!record) {
      return jsonError(
        "validation_error",
        "This document has no extractable text. Upload a .txt, .md, .pdf, or .docx file in Career Data first.",
        400,
      );
    }

    const meta = setUserOutputTemplate(getOnboardingMetadata(user), templateType, record);
    await upsertAppUser(
      auth.userId,
      auth.email,
      { onboarding_metadata: meta as Record<string, unknown> },
      auth.demo,
    );

    return jsonOk(
      {
        template_type: templateType,
        template: serializeUserOutputTemplateForClient(record),
      },
      201,
    );
  }

  const form = await request.formData();
  const file = form.get("file") as File | null;
  const templateType = (form.get("template_type") as string) || "";

  if (!file) return jsonError("validation_error", "File required.", 400);
  if (!isKnownOutputTemplateType(templateType)) {
    return jsonError("validation_error", "Valid template_type required.", 400);
  }
  if (!isAcceptedCvFileName(file.name)) {
    return jsonError(
      "validation_error",
      "Upload .txt, .md, .pdf, or .docx.",
      400,
    );
  }

  let extracted: Awaited<ReturnType<typeof extractDocumentText>>;
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    extracted = await extractDocumentText(buffer, file.name, file.type);
  } catch (e) {
    if (e instanceof DocumentExtractError) {
      return jsonError("extraction_error", e.message, 400, { code: e.code });
    }
    return jsonError("extraction_failed", "Could not read this file.", 400);
  }

  const record: UserOutputTemplate = {
    source: "upload",
    file_name: file.name,
    source_format: extracted.format,
    word_count: extracted.wordCount,
    extracted_text: truncateTemplateText(extracted.text),
    uploaded_at: new Date().toISOString(),
  };

  const meta = setUserOutputTemplate(getOnboardingMetadata(user), templateType, record);
  await upsertAppUser(
    auth.userId,
    auth.email,
    { onboarding_metadata: meta as Record<string, unknown> },
    auth.demo,
  );

  return jsonOk(
    {
      template_type: templateType,
      template: serializeUserOutputTemplateForClient(record),
    },
    201,
  );
}

export async function DELETE(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;

  const user = await getAppUser(auth.userId, auth.demo);
  if (!user) return jsonOk({ error: "not_found" }, 404);

  const templateType = new URL(request.url).searchParams.get("template_type");
  if (!templateType || !isKnownOutputTemplateType(templateType)) {
    return jsonError("validation_error", "Valid template_type required.", 400);
  }

  const meta = removeUserOutputTemplate(getOnboardingMetadata(user), templateType);
  await upsertAppUser(
    auth.userId,
    auth.email,
    { onboarding_metadata: meta as Record<string, unknown> },
    auth.demo,
  );

  return jsonOk({ removed: true, template_type: templateType });
}

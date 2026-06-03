import { isErrorResponse, jsonError, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";
import { fetchBankItems, type CvItemType, CV_ITEM_TYPES } from "@/lib/v2/output-studio-bank";
import {
  buildCvSections,
  buildMonthlyBullets,
  createOutputDocument,
} from "@/lib/v2/output-studio-generate";

const VALID_DOCUMENT_TYPES = [
  "cv", "resume_industry", "cover_letter", "biosketch_nih", "biosketch_institutional",
  "promotion_dossier", "personal_statement", "teaching_narrative", "research_narrative",
  "service_narrative", "career_snapshot", "invisible_work_summary", "educator_portfolio",
  "quality_portfolio", "career_narrative", "annual_review", "professional_bio",
] as const;

// POST /api/v1/output/studio/generate
// Body: {
//   document_type: string,    // required — must be a valid output_documents.document_type
//   title: string,            // required
//   audience_context?: string,
//   since_date?: string,      // ISO date — when present, generates monthly-bullets mode
//   item_types?: string[],    // filter bank items by type(s)
// }
//
// Behaviour:
//   - since_date present  → monthly-bullets mode: one flat section of items since that date
//   - since_date absent   → full CV mode: sections grouped by CV_SECTIONS map
//
// Wave 1: no LLM call. Pure structured assembly from cv_item_metadata + evidence_unit.
export async function POST(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  if (auth.demo) return jsonError("demo_unsupported", "Output Studio generate is not available in demo mode.", 403);

  let body: {
    document_type?: string;
    title?: string;
    audience_context?: string;
    since_date?: string;
    item_types?: string[];
  };
  try {
    body = await request.json();
  } catch {
    return jsonError("validation_error", "Invalid JSON body.", 400);
  }

  if (!body.document_type || !body.title) {
    return jsonError("validation_error", "document_type and title are required.", 400);
  }
  if (!(VALID_DOCUMENT_TYPES as readonly string[]).includes(body.document_type)) {
    return jsonError("validation_error", `Unrecognized document_type: ${body.document_type}`, 400);
  }

  const itemTypesFilter = (body.item_types ?? []).filter(
    (t) => (CV_ITEM_TYPES as readonly string[]).includes(t)
  ) as CvItemType[];

  try {
    const bankItems = await fetchBankItems(auth.userId, {
      since_date: body.since_date,
      item_type: itemTypesFilter.length ? itemTypesFilter : undefined,
    });

    const sections = body.since_date
      ? [buildMonthlyBullets(bankItems, body.since_date)]
      : buildCvSections(bankItems);

    const evidenceIds = Array.from(
      new Set(bankItems.map((i) => i.evidence_unit_id))
    );

    const document = await createOutputDocument(auth.userId, {
      document_type: body.document_type,
      title: body.title,
      audience_context: body.audience_context,
      sections,
      evidence_snapshot_ids: evidenceIds,
    });

    return jsonOk({ document }, 201);
  } catch (err) {
    console.error("[output/studio/generate POST]", err);
    return jsonError("db_error", "Failed to generate document.", 500);
  }
}

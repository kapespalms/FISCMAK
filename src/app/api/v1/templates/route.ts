import { isErrorResponse, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";

export async function GET(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const type = new URL(request.url).searchParams.get("type") ?? "cv";
  const templates = [
    {
      template_id: "tmpl-promotion-narrative",
      name: "Promotion Narrative Framework",
      type: "promotion_narrative",
      format: "DOCX",
      description: "Six-section academic promotion narrative auto-filled from Mak coaching",
    },
    {
      template_id: "tmpl-cv-academic",
      name: "Professional CV (Academic Medicine)",
      type: "cv",
      format: "DOCX",
      description: "Formatted for academic medical centers",
    },
    {
      template_id: "tmpl-cover-letter",
      name: "Cover Letter",
      type: "cover_letter",
      format: "DOCX",
      description: "Job or fellowship application",
    },
  ].filter((t) => !type || t.type === type || type === "all");
  return jsonOk({ templates });
}

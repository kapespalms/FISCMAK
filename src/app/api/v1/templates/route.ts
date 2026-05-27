import { isErrorResponse, jsonOk, requireApiUser } from "@/lib/v2/api-helpers";

export async function GET(request: Request) {
  const auth = await requireApiUser();
  if (isErrorResponse(auth)) return auth;
  const type = new URL(request.url).searchParams.get("type") ?? "cv";
  const templates = [
    {
      template_id: "tmpl-personal-statement",
      name: "Personal Statement (ERAS / Fellowship)",
      type: "personal_statement",
      format: "DOCX",
      description:
        "Stage-specific personal statement with specialty guidance — hook, fit, vision, closing",
    },
    {
      template_id: "tmpl-career-narrative",
      name: "Career Narrative (All Stages)",
      type: "career_narrative",
      format: "DOCX",
      description:
        "Stage × track × application narrative — medical student through legacy attending",
    },
    {
      template_id: "tmpl-promotion-narrative",
      name: "Promotion Narrative Framework",
      type: "promotion_narrative",
      format: "DOCX",
      description:
        "Track-specific academic promotion narrative (standard, clinician-educator, clinician-scientist, clinical excellence, educator-administrator)",
    },
    {
      template_id: "tmpl-cv-academic",
      name: "Institutional CV (Academic Medicine)",
      type: "institutional_cv",
      format: "DOCX",
      description: "Comprehensive academic CV — education through clinical activity",
    },
    {
      template_id: "tmpl-biosketch",
      name: "NIH Biosketch (Updated Format)",
      type: "biosketch",
      format: "DOCX",
      description:
        "Sections A–D: Personal Statement, Positions & Honors, Contributions to Science, Research Support",
    },
    {
      template_id: "tmpl-teaching-portfolio",
      name: "Teaching Portfolio (Academic Medicine)",
      type: "teaching_portfolio",
      format: "DOCX",
      description:
        "Philosophy, responsibilities, curriculum innovation, evaluations, scholarship, mentorship",
    },
    {
      template_id: "tmpl-cv-academic-legacy",
      name: "Professional CV (Academic Medicine)",
      type: "cv",
      format: "DOCX",
      description: "Formatted for academic medical centers",
    },
    {
      template_id: "tmpl-cover-letter",
      name: "CV Cover Letter (All Stages)",
      type: "cover_letter",
      format: "DOCX",
      description:
        "Stage × position type × specialty × institutional setting — comprehensive physician cover letter guide",
    },
    {
      template_id: "tmpl-industry-resume",
      name: "Industry Resume (Physician Transition)",
      type: "industry_resume",
      format: "DOCX",
      description:
        "Sector-specific industry resume — AI/health tech, pharma, consulting, VC, devices, and more. 1–2 pages, quantified impact.",
    },
    {
      template_id: "tmpl-industry-cover-letter",
      name: "Industry Cover Letter (Career Pivot)",
      type: "industry_cover_letter",
      format: "DOCX",
      description:
        "Universal pivot cover letter — hook, clinical-to-industry bridge, value proposition, close. Tailored by target sector.",
    },
  ].filter((t) => !type || t.type === type || type === "all");
  return jsonOk({ templates });
}

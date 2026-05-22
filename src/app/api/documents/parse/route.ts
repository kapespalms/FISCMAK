/** @deprecated Use POST /api/v1/documents — V1 parse route retained for legacy uploads. */
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { text, fileName, fileType } = await request.json();

  if (!text?.trim()) {
    return NextResponse.json({ error: "No text to parse" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (apiKey) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-3-5-haiku-20241022",
          max_tokens: 2048,
          messages: [
            {
              role: "user",
              content: `PARSE THIS PHYSICIAN DOCUMENT AND EXTRACT CAREER EVIDENCE. Return JSON only with keys: detected_document_type, extracted_entities (roles, publications, teaching, leadership arrays), inferred_career_phase, summary (2 sentences).

Document (${fileName ?? "upload"}, type: ${fileType ?? "unknown"}):
${text.slice(0, 12000)}`,
            },
          ],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const raw =
          data.content?.find((b: { type: string }) => b.type === "text")?.text ??
          "";
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return NextResponse.json({
            detected_document_type: parsed.detected_document_type ?? "cv",
            extracted_entities: parsed.extracted_entities ?? {},
            inferred_career_phase: parsed.inferred_career_phase,
            summary: parsed.summary,
            parsed_text: text,
          });
        }
      }
    } catch (e) {
      console.error("Document parse error:", e);
    }
  }

  return NextResponse.json({
    detected_document_type: fileType?.includes("statement")
      ? "personal_statement"
      : "cv",
    extracted_entities: {
      roles: [],
      note: "Add ANTHROPIC_API_KEY for full Claude parsing",
    },
    summary: `Uploaded ${fileName ?? "document"} (${text.split(/\s+/).length} words). Review extracted content when AI parsing is enabled.`,
    parsed_text: text,
  });
}

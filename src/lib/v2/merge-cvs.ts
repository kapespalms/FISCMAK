import {
  emptyResumeContent,
  parseResumeContent,
  type ResumeContent,
  type ResumeIncompleteField,
} from "@/lib/v2/resume-content";

export type MergeCvsInput = {
  sources: { document_id: string; label: string; text: string }[];
};

export type MergeCvsResult = {
  content_json: ResumeContent;
  merge_flags: string[];
};

const MERGE_PROMPT = `You merge multiple physician CV/resume source texts into ONE structured JSON resume.

RULES (strict):
- Deduplicate overlapping roles and experiences; keep the most complete wording.
- NEVER invent dates, employers, or credentials. If dates are missing or ambiguous, set dates.incomplete true and dates.display to "" or partial text from sources only.
- Populate incomplete_fields for every block with uncertain dates (block_id + field path).
- Add merge_flags (string array) for human review items, e.g. "possible_duplicate_role", "date_conflict".
- Return JSON only matching this shape:
{
  "version": 1,
  "blocks": [
    { "id": "hdr_1", "type": "header", "name": "", "specialty": "", "credentials": "" },
    { "id": "exp_1", "type": "experience", "organization": "", "role": "", "location": "", "dates": { "display": "", "incomplete": false }, "bullets": [""] },
    { "id": "edu_1", "type": "education", "institution": "", "degree": "", "dates": { "display": "", "incomplete": false } },
    { "id": "skl_1", "type": "skills", "label": "Clinical Skills", "items": [""] }
  ],
  "incomplete_fields": [{ "block_id": "", "field": "dates.display", "reason": "" }],
  "merge_flags": []
}`;

function fallbackMerge(sources: MergeCvsInput["sources"]): MergeCvsResult {
  const content = emptyResumeContent();
  const flags = ["merge_fallback_no_ai"];
  const first = sources[0]?.text ?? "";
  const header = content.blocks[0];
  if (header.type === "header" && first) {
    const nameMatch = first.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)/m);
    if (nameMatch) header.name = nameMatch[1];
  }
  if (sources.length > 1) flags.push("multiple_sources_manual_review");
  return { content_json: content, merge_flags: flags };
}

export async function mergeCvSourcesWithLlm(input: MergeCvsInput): Promise<MergeCvsResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const combined = input.sources
    .map((s, i) => `--- SOURCE ${i + 1}: ${s.label} (${s.document_id}) ---\n${s.text.slice(0, 14000)}`)
    .join("\n\n");

  if (!apiKey?.trim()) {
    return fallbackMerge(input.sources);
  }

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey.trim(),
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-5-haiku-20241022",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: `${MERGE_PROMPT}\n\nSOURCES:\n${combined.slice(0, 48000)}`,
          },
        ],
      }),
    });

    if (!res.ok) return fallbackMerge(input.sources);

    const data = await res.json();
    const raw =
      data.content?.find((b: { type: string }) => b.type === "text")?.text ?? "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return fallbackMerge(input.sources);

    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
    const content = parseResumeContent(parsed);
    if (!content) return fallbackMerge(input.sources);

    const merge_flags = Array.isArray(parsed.merge_flags)
      ? (parsed.merge_flags as string[]).filter((f) => typeof f === "string")
      : [];

    const incomplete_fields: ResumeIncompleteField[] = [
      ...content.incomplete_fields,
      ...(Array.isArray(parsed.incomplete_fields)
        ? (parsed.incomplete_fields as ResumeIncompleteField[])
        : []),
    ];

    return {
      content_json: {
        ...content,
        incomplete_fields,
        merge_flags: [...(content.merge_flags ?? []), ...merge_flags],
      },
      merge_flags,
    };
  } catch (e) {
    console.error("merge-cvs LLM error:", e);
    return fallbackMerge(input.sources);
  }
}

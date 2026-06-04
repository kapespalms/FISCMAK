// Server-only — imported exclusively by the export route handler.
// Converts an OutputDocument's ProseMirror sections → a .docx Buffer using
// the `docx` package (v9.6.1, already installed). No LLM, no fabrication —
// faithful render of whatever is saved in output_documents.sections.

import {
  AlignmentType,
  convertInchesToTwip,
  Document,
  Footer,
  HeadingLevel,
  Packer,
  PageNumber,
  Paragraph,
  TextRun,
} from "docx";
import type { OutputDocument, ProseMirrorNode, SectionContent } from "@/lib/v2/output-studio-generate";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Mark = { type: string };
type TextNode = ProseMirrorNode & { text?: string; marks?: Mark[] };

// ---------------------------------------------------------------------------
// ProseMirror → docx helpers
// ---------------------------------------------------------------------------

const HEADING_MAP: Record<number, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
  1: HeadingLevel.HEADING_1,
  2: HeadingLevel.HEADING_2,
  3: HeadingLevel.HEADING_3,
};

/** Convert a single PM text node (with marks) into a TextRun. */
function textRunFromTextNode(node: TextNode): TextRun {
  const text = node.text ?? "";
  const marks = node.marks ?? [];
  const bold      = marks.some((m) => m.type === "bold")      || undefined;
  const italics   = marks.some((m) => m.type === "italic")    || undefined;
  const underline = marks.some((m) => m.type === "underline") ? {} : undefined;
  return new TextRun({ text, bold, italics, underline });
}

/** Walk the inline children of a paragraph/heading node and collect TextRuns. */
function textRunsFromContent(content: ProseMirrorNode[]): TextRun[] {
  const runs: TextRun[] = [];
  for (const child of content) {
    if (child.type === "text") {
      runs.push(textRunFromTextNode(child as TextNode));
    } else if (child.type === "hardBreak") {
      runs.push(new TextRun({ break: 1 }));
    }
  }
  // Guarantee at least one run so Word renders the paragraph.
  if (runs.length === 0) runs.push(new TextRun(""));
  return runs;
}

/** Convert a PM doc's top-level nodes to docx Paragraphs. */
function pmNodesToParagraphs(nodes: ProseMirrorNode[]): Paragraph[] {
  const result: Paragraph[] = [];

  for (const node of nodes) {
    switch (node.type) {
      case "paragraph": {
        result.push(
          new Paragraph({ children: textRunsFromContent(node.content ?? []) }),
        );
        break;
      }

      case "heading": {
        const level = (node.attrs?.level as number) ?? 1;
        result.push(
          new Paragraph({
            heading: HEADING_MAP[level] ?? HeadingLevel.HEADING_1,
            children: textRunsFromContent(node.content ?? []),
          }),
        );
        break;
      }

      case "bulletList":
      case "orderedList": {
        // Both list types rendered as bullet paragraphs (ordered list is rare
        // in CV output but handled gracefully).
        for (const li of node.content ?? []) {
          for (const liChild of li.content ?? []) {
            if (liChild.type === "paragraph") {
              result.push(
                new Paragraph({
                  bullet: { level: 0 },
                  children: textRunsFromContent(liChild.content ?? []),
                }),
              );
            }
          }
        }
        break;
      }

      // Ignore unknown node types silently.
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// Section → Paragraphs
// ---------------------------------------------------------------------------

/** True when the section's ProseMirror doc has meaningful content. */
function sectionHasContent(section: SectionContent): boolean {
  if (!section.enabled) return false;
  const nodes = section.tiptap_content?.content ?? [];
  if (nodes.length === 0) return false;
  // Filter out the "No items captured yet" placeholder paragraph.
  return nodes.some((n) => {
    if (n.type !== "paragraph") return true;
    const text = (n.content ?? [])
      .filter((c) => c.type === "text")
      .map((c) => (c as TextNode).text ?? "")
      .join("");
    return !text.startsWith("No items captured yet");
  });
}

function sectionToParagraphs(section: SectionContent): Paragraph[] {
  const paragraphs: Paragraph[] = [];

  // Section heading (H2 so it nests under any document-level H1 from content)
  paragraphs.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun({ text: section.label, bold: true })],
      spacing: { before: 240 }, // 12pt before each section
    }),
  );

  const contentNodes = section.tiptap_content?.content ?? [];
  paragraphs.push(...pmNodesToParagraphs(contentNodes));

  return paragraphs;
}

// ---------------------------------------------------------------------------
// Public: build the full .docx Buffer
// ---------------------------------------------------------------------------

export async function buildDocxBuffer(doc: OutputDocument): Promise<Buffer> {
  const enabledSections = doc.sections
    .slice()
    .sort((a, b) => a.order - b.order)
    .filter(sectionHasContent);

  const bodyChildren: Paragraph[] = enabledSections.flatMap(sectionToParagraphs);

  // Ensure the document is never completely empty (Word requirement).
  if (bodyChildren.length === 0) {
    bodyChildren.push(new Paragraph({ children: [new TextRun("")] }));
  }

  const margin = convertInchesToTwip(1); // 1" all sides

  const footer = new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [
          new TextRun({ text: `${doc.title}  —  ` }),
          new TextRun({ children: [PageNumber.CURRENT] }),
          new TextRun({ text: " / " }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES] }),
        ],
      }),
    ],
  });

  const docxDoc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: margin, right: margin, bottom: margin, left: margin },
          },
        },
        footers: { default: footer },
        children: bodyChildren,
      },
    ],
  });

  return Buffer.from(await Packer.toBuffer(docxDoc));
}

/** Derive a safe filename from the document title. */
export function docxFilename(doc: OutputDocument): string {
  const slug = doc.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
  return `${slug || "document"}.docx`;
}

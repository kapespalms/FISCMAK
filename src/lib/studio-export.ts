import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
} from "docx";

export type EvidenceSource = { id: string; text: string; date?: string | null };

export async function exportDocx(
  title: string,
  bodyText: string,
  evidence: EvidenceSource[],
): Promise<Blob> {
  const bodyParagraphs = bodyText
    .split(/\n+/)
    .filter(Boolean)
    .map(
      (line) =>
        new Paragraph({
          children: [new TextRun(line)],
          spacing: { after: 200 },
        }),
    );

  const appendix: Paragraph[] = [
    new Paragraph({ text: "" }),
    new Paragraph({
      text: "EVIDENCE SOURCES",
      heading: HeadingLevel.HEADING_2,
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: "This document uses evidence from your career activities.",
          italics: true,
        }),
      ],
    }),
  ];

  evidence.forEach((ev, i) => {
    appendix.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${i + 1}. `, bold: true }),
          new TextRun(ev.text),
          ...(ev.date
            ? [new TextRun({ text: ` (${ev.date})`, italics: true })]
            : []),
        ],
        spacing: { after: 120 },
      }),
    );
  });

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({
            text: title,
            heading: HeadingLevel.HEADING_1,
          }),
          ...bodyParagraphs,
          ...appendix,
        ],
      },
    ],
  });

  return Packer.toBlob(doc);
}

export async function exportPdf(
  title: string,
  bodyText: string,
  evidence: EvidenceSource[],
): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 48;
  const width = doc.internal.pageSize.getWidth() - margin * 2;
  let y = margin;

  doc.setFontSize(16);
  doc.text(title, margin, y);
  y += 28;

  doc.setFontSize(11);
  const bodyLines = doc.splitTextToSize(bodyText || "(empty)", width);
  for (const line of bodyLines) {
    if (y > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += 14;
  }

  y += 20;
  doc.setFontSize(13);
  doc.text("EVIDENCE SOURCES", margin, y);
  y += 18;
  doc.setFontSize(10);

  evidence.forEach((ev, i) => {
    const block = doc.splitTextToSize(
      `${i + 1}. ${ev.text}${ev.date ? ` (${ev.date})` : ""}`,
      width,
    );
    for (const line of block) {
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += 12;
    }
    y += 4;
  });

  return doc.output("blob");
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

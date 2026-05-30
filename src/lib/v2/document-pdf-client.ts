"use client";

/**
 * Browser-side PDF text extraction (pdf.js). Avoids fragile server-side pdf-parse on Vercel.
 */

export async function extractTextFromPdfFile(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");

  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;

  const pages: string[] = [];
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum += 1) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ("str" in item && typeof item.str === "string" ? item.str : ""))
      .join(" ");
    pages.push(pageText);
  }

  await pdf.destroy();

  const fullText = pages.join("\n").trim();
  if (!fullText) {
    throw new Error(
      "No selectable text found in this PDF. It may be scanned — paste your CV text instead.",
    );
  }

  return fullText;
}

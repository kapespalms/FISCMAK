import type { jsPDF } from "jspdf";
import type { PreCccSummary } from "@/lib/v2/gme/pre-ccc-summary";
import { formatPriteDomainLabel } from "@/lib/v2/gme/pre-ccc-summary";

type PdfWriter = {
  doc: jsPDF;
  margin: number;
  maxWidth: number;
  y: number;
};

function createWriter(doc: jsPDF): PdfWriter {
  const margin = 48;
  const pageWidth = doc.internal.pageSize.getWidth();
  return { doc, margin, maxWidth: pageWidth - margin * 2, y: margin };
}

function addLine(
  writer: PdfWriter,
  text: string,
  opts?: { bold?: boolean; size?: number; gap?: number },
) {
  const size = opts?.size ?? 11;
  writer.doc.setFontSize(size);
  writer.doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
  const lines = writer.doc.splitTextToSize(text, writer.maxWidth) as string[];
  for (const line of lines) {
    if (writer.y > writer.doc.internal.pageSize.getHeight() - writer.margin) {
      writer.doc.addPage();
      writer.y = writer.margin;
    }
    writer.doc.text(line, writer.margin, writer.y);
    writer.y += size + 4;
  }
  writer.y += opts?.gap ?? 6;
}

function appendPreCccSummary(writer: PdfWriter, summary: PreCccSummary) {
  addLine(writer, "FISCMAK · Pre-CCC Summary", { bold: true, size: 16, gap: 10 });
  addLine(
    writer,
    `Trainee: ${summary.trainee_initials ?? "—"} · PGY ${summary.pgy_level ?? "—"} · Period ${summary.reporting_period}`,
  );
  addLine(writer, `Generated ${new Date(summary.generated_at).toLocaleString()}`, {
    size: 9,
    gap: 14,
  });

  addLine(writer, "Data sufficiency", { bold: true, size: 12 });
  addLine(writer, summary.data_sufficiency.note);
  addLine(
    writer,
    `${summary.evaluations.length} evaluation(s) · milestone avg ${summary.milestone_overview.average_across_evals ?? "—"}`,
    { size: 10, gap: 12 },
  );

  if (summary.prite_scores.exams.length) {
    addLine(writer, "In-training exams (PRITE)", { bold: true, size: 12 });
    addLine(writer, summary.prite_scores.note, { gap: 8 });
    for (const exam of summary.prite_scores.exams) {
      const domains = Object.entries(exam.domain_scores)
        .map(([k, v]) => `${formatPriteDomainLabel(k)} ${v}`)
        .join(" · ");
      addLine(
        writer,
        `${exam.exam_type} ${exam.exam_year}: ${exam.overall_percentile ?? "—"}th percentile${domains ? ` · ${domains}` : ""}`,
        { size: 10, gap: 6 },
      );
    }
    writer.y += 4;
  }

  if (summary.narrative_synthesis.strengths.length) {
    addLine(writer, "Strengths (synthesized)", { bold: true, size: 12 });
    addLine(writer, summary.narrative_synthesis.strengths.map((t) => `• ${t}`).join("\n"), {
      gap: 10,
    });
  }

  if (summary.narrative_synthesis.areas_for_growth.length) {
    addLine(writer, "Areas for growth", { bold: true, size: 12 });
    addLine(
      writer,
      summary.narrative_synthesis.areas_for_growth.map((t) => `• ${t}`).join("\n"),
      { gap: 10 },
    );
  }

  addLine(writer, "ILP status", { bold: true, size: 12 });
  addLine(writer, summary.ilp_status.note, { gap: 12 });

  if (summary.narrative_themes.length) {
    addLine(writer, "Narrative themes", { bold: true, size: 12 });
    addLine(writer, summary.narrative_themes.map((t) => `• ${t}`).join("\n"), { gap: 12 });
  }

  if (summary.evaluations.length) {
    addLine(writer, "Rotation evaluations", { bold: true, size: 12 });
    for (const ev of summary.evaluations) {
      addLine(
        writer,
        `${ev.rotation_name ?? "Rotation"} · ${ev.supervisor_name ?? "Supervisor"} (${ev.eval_date ?? "date unknown"})`,
        { bold: true, size: 10 },
      );
      const stats = [
        ev.milestone_average != null ? `avg ${ev.milestone_average}` : null,
        ev.milestone_lowest
          ? `lowest ${ev.milestone_lowest.key.replace(/^milestone_\d+_/, "").replace(/_/g, " ")} (${ev.milestone_lowest.value})`
          : null,
      ]
        .filter(Boolean)
        .join(" · ");
      if (stats) addLine(writer, stats, { size: 9 });
      if (ev.narrative_excerpt) addLine(writer, ev.narrative_excerpt, { size: 9, gap: 10 });
    }
  }

  addLine(writer, summary.disclaimer, { size: 8, gap: 0 });
}

export async function exportPreCccPdf(summary: PreCccSummary): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const writer = createWriter(doc);
  appendPreCccSummary(writer, summary);
  return doc.output("blob");
}

export async function exportPreCccBatchPdf(summaries: PreCccSummary[]): Promise<Blob> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "letter" });

  if (!summaries.length) {
    const writer = createWriter(doc);
    addLine(writer, "FISCMAK · Pre-CCC Batch", { bold: true, size: 16 });
    addLine(writer, "No trainee summaries available.", { gap: 0 });
    return doc.output("blob");
  }

  summaries.forEach((summary, index) => {
    if (index > 0) doc.addPage();
    const writer = createWriter(doc);
    appendPreCccSummary(writer, summary);
  });

  return doc.output("blob");
}

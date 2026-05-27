import type { PreCccSummary } from "@/lib/v2/gme/pre-ccc-summary";

export async function exportPreCccPdf(summary: PreCccSummary): Promise<Blob> {
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 48;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - margin * 2;
  let y = margin;

  const addLine = (text: string, opts?: { bold?: boolean; size?: number; gap?: number }) => {
    const size = opts?.size ?? 11;
    doc.setFontSize(size);
    doc.setFont("helvetica", opts?.bold ? "bold" : "normal");
    const lines = doc.splitTextToSize(text, maxWidth) as string[];
    for (const line of lines) {
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin, y);
      y += size + 4;
    }
    y += opts?.gap ?? 6;
  };

  addLine("FISCMAK · Pre-CCC Summary", { bold: true, size: 16, gap: 10 });
  addLine(
    `Trainee: ${summary.trainee_initials ?? "—"} · PGY ${summary.pgy_level ?? "—"} · Period ${summary.reporting_period}`,
  );
  addLine(`Generated ${new Date(summary.generated_at).toLocaleString()}`, { size: 9, gap: 14 });

  addLine("Data sufficiency", { bold: true, size: 12 });
  addLine(summary.data_sufficiency.note);
  addLine(
    `${summary.evaluations.length} evaluation(s) · milestone avg ${summary.milestone_overview.average_across_evals ?? "—"}`,
    { size: 10, gap: 12 },
  );

  if (summary.narrative_themes.length) {
    addLine("Narrative themes", { bold: true, size: 12 });
    addLine(summary.narrative_themes.map((t) => `• ${t}`).join("\n"), { gap: 12 });
  }

  if (summary.evaluations.length) {
    addLine("Rotation evaluations", { bold: true, size: 12 });
    for (const ev of summary.evaluations) {
      addLine(
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
      if (stats) addLine(stats, { size: 9 });
      if (ev.narrative_excerpt) addLine(ev.narrative_excerpt, { size: 9, gap: 10 });
    }
  }

  addLine(summary.disclaimer, { size: 8, gap: 0 });

  return doc.output("blob");
}

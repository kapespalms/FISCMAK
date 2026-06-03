"use client";

import { useCallback, useState } from "react";
import { useOutputStudio } from "@/lib/v2/output-studio-hook";
import { StudioDocumentList } from "@/components/output-studio/StudioDocumentList";
import { StudioTipTapEditor } from "@/components/output-studio/StudioTipTapEditor";
import type { OutputDocument, SectionContent } from "@/lib/v2/output-studio-generate";

// Output Studio V3 — TipTap-based document editor.
// Documents list → select or generate → open editor.
// Deferred: "Edit with Mak" (LLM revision), export to .docx/PDF.
export function OutputStudioV3() {
  const { documents, loading, generateDocument, updateDocument } = useOutputStudio();
  const [openDoc, setOpenDoc] = useState<OutputDocument | null>(null);

  // If the open doc has been updated, keep local state current
  const handleOpen = useCallback((doc: OutputDocument) => {
    setOpenDoc(doc);
  }, []);

  const handleBack = useCallback(() => {
    setOpenDoc(null);
  }, []);

  const handleSave = useCallback(
    async (sections: SectionContent[], status: string) => {
      if (!openDoc) return;
      const result = await updateDocument(openDoc.id, {
        sections,
        status: status as OutputDocument["status"],
      });
      if (result.document) setOpenDoc(result.document);
    },
    [openDoc, updateDocument]
  );

  if (openDoc) {
    return (
      <div className="h-full min-h-0">
        <StudioTipTapEditor
          document={openDoc}
          onBack={handleBack}
          onSave={handleSave}
        />
      </div>
    );
  }

  return (
    <StudioDocumentList
      documents={documents}
      loading={loading}
      onOpen={handleOpen}
      onGenerate={generateDocument}
    />
  );
}

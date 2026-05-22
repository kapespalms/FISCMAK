import { OutputStudioWorkspace } from "@/components/workspace/OutputStudioWorkspace";

export default function OutputPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Output Studio</h1>
        <p className="mt-1 text-sm text-fiscmak-muted">
          Generate tenure packets, reviews, and narratives with evidence chips
        </p>
      </div>
      <OutputStudioWorkspace />
    </div>
  );
}

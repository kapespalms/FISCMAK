"use client";

import { useState } from "react";
import { OUTPUT_TEMPLATES } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function StudioPage() {
  const [selected, setSelected] = useState<string>(OUTPUT_TEMPLATES[0].id);
  const [content, setContent] = useState("");
  const [generating, setGenerating] = useState(false);

  const template = OUTPUT_TEMPLATES.find((t) => t.id === selected)!;

  async function generate() {
    setGenerating(true);
    try {
      const res = await fetch("/api/output/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateType: selected }),
      });
      const data = await res.json();
      setContent(data.content ?? "");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-7xl gap-6">
      <aside className="w-56 shrink-0 space-y-2 overflow-y-auto">
        <h2 className="px-2 text-xs font-semibold uppercase text-fiscmak-muted">
          FISCMAK templates
        </h2>
        {OUTPUT_TEMPLATES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setSelected(t.id)}
            className={`w-full rounded-md px-3 py-2 text-left text-sm ${
              selected === t.id
                ? "bg-fiscmak-green-light font-semibold text-fiscmak-green-dark"
                : "hover:bg-white"
            }`}
          >
            {t.name}
          </button>
        ))}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{template.name}</h1>
            <p className="text-sm text-fiscmak-muted">
              Target ~{template.words} words
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={generate} disabled={generating}>
              {generating ? "Generating…" : "Generate"}
            </Button>
            <Button variant="secondary">Export</Button>
          </div>
        </div>

        <Card className="min-h-0 flex-1 flex flex-col p-0">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Select a template and click Generate, or start writing…"
            className="min-h-[400px] flex-1 resize-none rounded-lg border-0 p-6 text-base focus:ring-0"
          />
          <div className="flex justify-between border-t border-fiscmak-border px-4 py-2 text-sm text-fiscmak-muted">
            <span>
              {content.split(/\s+/).filter(Boolean).length} / {template.words}{" "}
              words
            </span>
            <span>Auto-save · Lexical editor in next phase</span>
          </div>
        </Card>
      </div>

      <aside className="hidden w-64 shrink-0 space-y-4 lg:block">
        <h2 className="text-xs font-semibold uppercase text-fiscmak-muted">
          Evidence drawer
        </h2>
        <Card className="p-4">
          <p className="text-sm font-medium">Mentored resident — family meeting</p>
          <p className="mt-1 text-xs text-fiscmak-muted">May 2026 · Educator</p>
          <Button variant="link" className="mt-2 text-sm">
            Insert
          </Button>
        </Card>
        <Card className="p-4">
          <p className="text-sm font-medium">Curriculum redesign</p>
          <Badge className="mt-2" energy="energizing">
            energizing
          </Badge>
        </Card>
      </aside>
    </div>
  );
}

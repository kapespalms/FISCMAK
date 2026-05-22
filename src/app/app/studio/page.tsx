"use client";

import { useCallback, useEffect, useState } from "react";
import { OUTPUT_TEMPLATES } from "@/lib/constants";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { fetchActivities } from "@/lib/activities-storage";
import type { ActivityEntry } from "@/lib/types/database";

export default function StudioPage() {
  const [selected, setSelected] = useState<string>(OUTPUT_TEMPLATES[0].id);
  const [content, setContent] = useState("");
  const [generating, setGenerating] = useState(false);
  const [evidence, setEvidence] = useState<ActivityEntry[]>([]);
  const [exportMsg, setExportMsg] = useState("");

  const template = OUTPUT_TEMPLATES.find((t) => t.id === selected)!;

  const loadEvidence = useCallback(async () => {
    setEvidence(await fetchActivities());
  }, []);

  useEffect(() => {
    loadEvidence();
  }, [loadEvidence]);

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

  function insertEvidence(text: string) {
    setContent((c) => (c ? `${c}\n\n${text}` : text));
  }

  async function copyExport() {
    if (!content.trim()) return;
    await navigator.clipboard.writeText(content);
    setExportMsg("Copied to clipboard");
    setTimeout(() => setExportMsg(""), 2000);
  }

  function downloadTxt() {
    if (!content.trim()) return;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selected}_${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setExportMsg("Downloaded");
    setTimeout(() => setExportMsg(""), 2000);
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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold">{template.name}</h1>
            <p className="text-sm text-fiscmak-muted">
              Target ~{template.words} words
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={generate} disabled={generating}>
              {generating ? "Generating…" : "Generate"}
            </Button>
            <Button variant="secondary" onClick={copyExport} disabled={!content}>
              Copy
            </Button>
            <Button variant="secondary" onClick={downloadTxt} disabled={!content}>
              Download .txt
            </Button>
            {exportMsg && (
              <span className="self-center text-sm text-fiscmak-green">
                {exportMsg}
              </span>
            )}
          </div>
        </div>

        <Card className="flex min-h-0 flex-1 flex-col p-0">
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
            <span>DOCX/PDF export in next phase</span>
          </div>
        </Card>
      </div>

      <aside className="hidden w-64 shrink-0 space-y-4 overflow-y-auto lg:block">
        <h2 className="text-xs font-semibold uppercase text-fiscmak-muted">
          Evidence drawer
        </h2>
        {evidence.length === 0 && (
          <p className="text-sm text-fiscmak-muted">
            Log activities to populate evidence.
          </p>
        )}
        {evidence.map((item) => (
          <Card key={item.id} className="p-4">
            <p className="text-sm font-medium line-clamp-3">{item.raw_text}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              {item.primary_track && (
                <Badge className="text-xs">{item.primary_track}</Badge>
              )}
              {item.energy_valence?.includes("energiz") && (
                <Badge energy="energizing" className="text-xs">
                  energizing
                </Badge>
              )}
            </div>
            <p className="mt-1 text-xs text-fiscmak-muted">
              {item.activity_date}
            </p>
            <Button
              variant="link"
              className="mt-2 text-sm"
              onClick={() => insertEvidence(item.raw_text ?? "")}
            >
              Insert
            </Button>
          </Card>
        ))}
      </aside>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import {
  newBlockId,
  reorderBlocks,
  type ResumeBlock,
  type ResumeContent,
  type ResumeIncompleteField,
} from "@/lib/v2/resume-content";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";

type ResumeBlockEditorProps = {
  content: ResumeContent;
  highlightBlockId?: string | null;
  onChange: (content: ResumeContent) => void;
  onHighlightBlock: (blockId: string | null) => void;
};

function updateBlock(blocks: ResumeBlock[], id: string, patch: Partial<ResumeBlock>): ResumeBlock[] {
  return blocks.map((b) => (b.id === id ? ({ ...b, ...patch } as ResumeBlock) : b));
}

export function ResumeBlockEditor({
  content,
  highlightBlockId,
  onChange,
  onHighlightBlock,
}: ResumeBlockEditorProps) {
  function setBlocks(blocks: ResumeBlock[]) {
    onChange({ ...content, blocks });
  }

  function moveBlock(id: string, dir: -1 | 1) {
    const ids = content.blocks.map((b) => b.id);
    const idx = ids.indexOf(id);
    const swap = idx + dir;
    if (swap < 0 || swap >= ids.length) return;
    [ids[idx], ids[swap]] = [ids[swap], ids[idx]];
    setBlocks(reorderBlocks(content.blocks, ids));
  }

  function addExperience() {
    const block = {
      id: newBlockId("exp"),
      type: "experience" as const,
      organization: "",
      role: "",
      dates: { display: "", incomplete: true },
      bullets: [""],
    };
    setBlocks([...content.blocks, block]);
    onHighlightBlock(block.id);
  }

  function addEducation() {
    const block = {
      id: newBlockId("edu"),
      type: "education" as const,
      institution: "",
      degree: "",
      dates: { display: "", incomplete: true },
    };
    setBlocks([...content.blocks, block]);
    onHighlightBlock(block.id);
  }

  function removeBlock(id: string) {
    setBlocks(content.blocks.filter((b) => b.id !== id));
    onChange({
      ...content,
      blocks: content.blocks.filter((b) => b.id !== id),
      incomplete_fields: content.incomplete_fields.filter((f) => f.block_id !== id),
    });
  }

  function setIncomplete(fields: ResumeIncompleteField[]) {
    onChange({ ...content, incomplete_fields: fields });
  }

  return (
    <div className="space-y-4">
      {content.incomplete_fields.length > 0 && (
        <div className="rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3">
          <p className="text-sm font-semibold text-amber-900">
            {content.incomplete_fields.length} item
            {content.incomplete_fields.length === 1 ? "" : "s"} need attention
          </p>
          <ul className="mt-2 space-y-1">
            {content.incomplete_fields.map((f) => (
              <li key={`${f.block_id}-${f.field}`}>
                <button
                  type="button"
                  className="text-left text-sm text-amber-900 underline-offset-2 hover:underline"
                  onClick={() => onHighlightBlock(f.block_id)}
                >
                  {f.field} on block {f.block_id.slice(0, 8)}…
                  {f.reason ? ` — ${f.reason}` : ""}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {content.blocks.map((block, index) => (
        <div
          key={block.id}
          id={`block-${block.id}`}
          className={cn(
            "rounded-xl border border-cx-forest-dark/12 bg-white/60 p-4 backdrop-blur-sm",
            highlightBlockId === block.id && "ring-2 ring-amber-400/70",
          )}
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-cx-forest-dark/55">
              {block.type}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="rounded p-1 text-cx-forest-dark/60 hover:bg-cx-forest-dark/10"
                onClick={() => moveBlock(block.id, -1)}
                disabled={index === 0}
                aria-label="Move up"
              >
                <ChevronUp size={16} />
              </button>
              <button
                type="button"
                className="rounded p-1 text-cx-forest-dark/60 hover:bg-cx-forest-dark/10"
                onClick={() => moveBlock(block.id, 1)}
                disabled={index === content.blocks.length - 1}
                aria-label="Move down"
              >
                <ChevronDown size={16} />
              </button>
              {block.type !== "header" && (
                <button
                  type="button"
                  className="rounded p-1 text-red-700/70 hover:bg-red-50"
                  onClick={() => removeBlock(block.id)}
                  aria-label="Remove block"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>

          {block.type === "header" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="text-cx-forest-dark/70">Name</span>
                <input
                  className="cx-field mt-1 w-full"
                  value={block.name}
                  onChange={(e) =>
                    setBlocks(updateBlock(content.blocks, block.id, { name: e.target.value }))
                  }
                />
              </label>
              <label className="block text-sm">
                <span className="text-cx-forest-dark/70">Specialty</span>
                <input
                  className="cx-field mt-1 w-full"
                  value={block.specialty ?? ""}
                  onChange={(e) =>
                    setBlocks(
                      updateBlock(content.blocks, block.id, { specialty: e.target.value }),
                    )
                  }
                />
              </label>
            </div>
          )}

          {block.type === "experience" && (
            <div className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block text-sm sm:col-span-2">
                  <span className="text-cx-forest-dark/70">Role</span>
                  <input
                    className="cx-field mt-1 w-full"
                    value={block.role}
                    onChange={(e) =>
                      setBlocks(updateBlock(content.blocks, block.id, { role: e.target.value }))
                    }
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-cx-forest-dark/70">Organization</span>
                  <input
                    className="cx-field mt-1 w-full"
                    value={block.organization}
                    onChange={(e) =>
                      setBlocks(
                        updateBlock(content.blocks, block.id, { organization: e.target.value }),
                      )
                    }
                  />
                </label>
                <label className="block text-sm">
                  <span className="text-cx-forest-dark/70">Dates (display)</span>
                  <input
                    className="cx-field mt-1 w-full"
                    value={block.dates.display}
                    placeholder="e.g. 2020 – Present"
                    onChange={(e) => {
                      const display = e.target.value;
                      setBlocks(
                        updateBlock(content.blocks, block.id, {
                          dates: {
                            ...block.dates,
                            display,
                            incomplete: !display.trim(),
                          },
                        }),
                      );
                      if (display.trim()) {
                        setIncomplete(
                          content.incomplete_fields.filter(
                            (f) =>
                              !(f.block_id === block.id && f.field === "dates.display"),
                          ),
                        );
                      }
                    }}
                  />
                </label>
              </div>
              <div>
                <p className="text-sm text-cx-forest-dark/70">Bullets</p>
                {block.bullets.map((bullet, bi) => (
                  <div key={bi} className="mt-2 flex gap-2">
                    <textarea
                      className="cx-field min-h-[60px] flex-1"
                      value={bullet}
                      rows={2}
                      onChange={(e) => {
                        const bullets = [...block.bullets];
                        bullets[bi] = e.target.value;
                        setBlocks(updateBlock(content.blocks, block.id, { bullets }));
                      }}
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  variant="secondary"
                  className="mt-2"
                  onClick={() =>
                    setBlocks(
                      updateBlock(content.blocks, block.id, {
                        bullets: [...block.bullets, ""],
                      }),
                    )
                  }
                >
                  <Plus size={14} className="mr-1 inline" />
                  Add bullet
                </Button>
              </div>
            </div>
          )}

          {block.type === "education" && (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-sm">
                <span className="text-cx-forest-dark/70">Degree</span>
                <input
                  className="cx-field mt-1 w-full"
                  value={block.degree}
                  onChange={(e) =>
                    setBlocks(updateBlock(content.blocks, block.id, { degree: e.target.value }))
                  }
                />
              </label>
              <label className="block text-sm">
                <span className="text-cx-forest-dark/70">Institution</span>
                <input
                  className="cx-field mt-1 w-full"
                  value={block.institution}
                  onChange={(e) =>
                    setBlocks(
                      updateBlock(content.blocks, block.id, { institution: e.target.value }),
                    )
                  }
                />
              </label>
              <label className="block text-sm sm:col-span-2">
                <span className="text-cx-forest-dark/70">Dates (display)</span>
                <input
                  className="cx-field mt-1 w-full"
                  value={block.dates.display}
                  onChange={(e) => {
                    const display = e.target.value;
                    setBlocks(
                      updateBlock(content.blocks, block.id, {
                        dates: { ...block.dates, display, incomplete: !display.trim() },
                      }),
                    );
                  }}
                />
              </label>
            </div>
          )}

          {block.type === "skills" && (
            <label className="block text-sm">
              <span className="text-cx-forest-dark/70">Items (comma-separated)</span>
              <input
                className="cx-field mt-1 w-full"
                value={block.items.join(", ")}
                onChange={(e) =>
                  setBlocks(
                    updateBlock(content.blocks, block.id, {
                      items: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    }),
                  )
                }
              />
            </label>
          )}
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" onClick={addExperience}>
          Add experience
        </Button>
        <Button type="button" variant="secondary" onClick={addEducation}>
          Add education
        </Button>
      </div>
    </div>
  );
}

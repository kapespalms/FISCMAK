"use client";

import { useCallback, useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExt from "@tiptap/extension-underline";
import { cn } from "@/lib/utils";
import { StudioToolbar } from "@/components/output-studio/StudioToolbar";
import type { SectionContent } from "@/lib/v2/output-studio-generate";
import { ChevronDown, ChevronRight, Eye, EyeOff } from "lucide-react";

const EXTENSIONS = [StarterKit, UnderlineExt];

type StudioSectionBlockProps = {
  section: SectionContent;
  onChange: (updated: SectionContent) => void;
  // When true the toolbar is shown (focused section)
  focused: boolean;
  onFocus: () => void;
};

export function StudioSectionBlock({ section, onChange, focused, onFocus }: StudioSectionBlockProps) {
  const [collapsed, setCollapsed] = useState(false);

  const editor = useEditor({
    extensions: EXTENSIONS,
    content: section.tiptap_content ?? { type: "doc", content: [] },
    editable: section.enabled,
    onUpdate: ({ editor: ed }) => {
      onChange({
        ...section,
        tiptap_content: ed.getJSON() as SectionContent["tiptap_content"],
      });
    },
  });

  // Sync enabled state into editor editability
  useEffect(() => {
    if (editor && editor.isEditable !== section.enabled) {
      editor.setEditable(section.enabled);
    }
  }, [editor, section.enabled]);

  // Sync content when section is reset from outside (e.g. after a save/reload)
  const lastContentRef = { current: section.tiptap_content };
  useEffect(() => {
    if (!editor) return;
    if (lastContentRef.current !== section.tiptap_content) {
      editor.commands.setContent(section.tiptap_content ?? { type: "doc", content: [] });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, section.tiptap_content]);

  const toggleEnabled = useCallback(() => {
    onChange({ ...section, enabled: !section.enabled });
  }, [section, onChange]);

  const isEmptyContent =
    !section.tiptap_content ||
    !section.tiptap_content.content ||
    section.tiptap_content.content.length === 0 ||
    (section.tiptap_content.content.length === 1 &&
      section.tiptap_content.content[0].type === "paragraph" &&
      !section.tiptap_content.content[0].content?.length);

  // Auto-hide disabled + empty sections (collapsed by default)
  const isAutoHidden = !section.enabled && isEmptyContent;

  if (isAutoHidden) return null;

  return (
    <div
      className={cn(
        "rounded-xl border transition-colors",
        section.enabled
          ? focused
            ? "border-cx-forest-dark/30 bg-white shadow-sm"
            : "border-cx-forest-dark/15 bg-white"
          : "border-cx-forest-dark/10 bg-cx-forest-dark/[0.02] opacity-60",
      )}
      onClick={onFocus}
    >
      {/* Section header */}
      <div className="flex items-center gap-2 px-4 py-2.5">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setCollapsed((c) => !c); }}
          className="text-cx-text/50 hover:text-cx-text/80"
          title={collapsed ? "Expand section" : "Collapse section"}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
        </button>

        <span className={cn(
          "flex-1 text-sm font-semibold",
          section.enabled ? "text-cx-text" : "text-cx-text/50",
        )}>
          {section.label}
        </span>

        <span className="rounded-full bg-cx-forest-dark/8 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-cx-text/50">
          {section.type.replace(/_/g, " ")}
        </span>

        {/* Toggle: on/off */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); toggleEnabled(); }}
          title={section.enabled ? "Hide this section in document" : "Include this section in document"}
          className={cn(
            "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors",
            section.enabled
              ? "bg-cx-forest-dark/10 text-cx-text hover:bg-cx-forest-dark/15"
              : "bg-cx-forest-dark/5 text-cx-text/40 hover:bg-cx-forest-dark/10",
          )}
        >
          {section.enabled ? (
            <><Eye size={12} /> On</>
          ) : (
            <><EyeOff size={12} /> Off</>
          )}
        </button>
      </div>

      {!collapsed && (
        <>
          {/* Toolbar — only when focused and enabled */}
          {focused && section.enabled && (
            <div className="border-t border-cx-forest-dark/10 px-4 py-2">
              <StudioToolbar editor={editor} />
            </div>
          )}

          {/* Editor area */}
          <div
            className={cn(
              "px-4 pb-4",
              !focused || !section.enabled ? "pt-2" : "pt-3",
            )}
          >
            {section.enabled ? (
              <EditorContent
                editor={editor}
                className={cn(
                  "prose prose-sm max-w-none",
                  "prose-headings:text-cx-text prose-p:text-cx-text/90",
                  "prose-li:text-cx-text/90",
                  "[&_.ProseMirror]:min-h-[60px] [&_.ProseMirror]:outline-none",
                  "[&_.ProseMirror_p.is-editor-empty:first-child::before]:text-cx-text/30",
                  "[&_.ProseMirror_p.is-editor-empty:first-child::before]:content-['Add_content_here...']",
                  "[&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none",
                  "[&_.ProseMirror_p.is-editor-empty:first-child::before]:float-left",
                  "[&_.ProseMirror_p.is-editor-empty:first-child::before]:h-0",
                )}
              />
            ) : (
              <p className="text-xs text-cx-text/40 italic">
                Section hidden — toggle On to include in document.
              </p>
            )}
          </div>

          {/* Provenance count */}
          {section.provenance_ids.length > 0 && (
            <div className="border-t border-cx-forest-dark/8 px-4 py-1.5 text-[10px] text-cx-text/40">
              {section.provenance_ids.length} source{section.provenance_ids.length !== 1 ? "s" : ""} · assembled from bank
            </div>
          )}
        </>
      )}
    </div>
  );
}

"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $nodesOfType,
  FORMAT_TEXT_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
  type LexicalEditor,
} from "lexical";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListItemNode,
  ListNode,
} from "@lexical/list";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import {
  EvidenceChipNode,
  $createEvidenceChipNode,
} from "@/components/studio/EvidenceChipNode";
import { saveDraft, loadDraft } from "@/lib/studio-versions";

const theme = {
  paragraph: "mb-2",
  text: {
    bold: "font-bold",
    italic: "italic",
    underline: "underline",
  },
  list: {
    ul: "list-disc pl-6 mb-2",
    ol: "list-decimal pl-6 mb-2",
    listitem: "mb-1",
  },
};

function Toolbar() {
  const [editor] = useLexicalComposerContext();

  return (
    <div className="flex flex-wrap gap-1 border-b border-fiscmak-border px-3 py-2">
      {[
        { label: "B", cmd: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold") },
        { label: "I", cmd: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic") },
        { label: "U", cmd: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline") },
        { label: "•", cmd: () => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined) },
        { label: "1.", cmd: () => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined) },
        { label: "↶", cmd: () => editor.dispatchCommand(UNDO_COMMAND, undefined) },
        { label: "↷", cmd: () => editor.dispatchCommand(REDO_COMMAND, undefined) },
      ].map(({ label, cmd }) => (
        <button
          key={label}
          type="button"
          onClick={cmd}
          className="min-h-9 min-w-9 rounded-md border border-fiscmak-border bg-white px-2 text-sm font-semibold hover:bg-fiscmak-subtle"
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function AutoSavePlugin({
  templateId,
  onWordCount,
}: {
  templateId: string;
  onWordCount: (n: number) => void;
}) {
  const [editor] = useLexicalComposerContext();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const persist = useCallback(() => {
    const json = JSON.stringify(editor.getEditorState().toJSON());
    saveDraft(templateId, json);
    editor.getEditorState().read(() => {
      const text = $getRoot().getTextContent();
      onWordCount(text.split(/\s+/).filter(Boolean).length);
    });
  }, [editor, templateId, onWordCount]);

  useEffect(() => {
    const draft = loadDraft(templateId);
    if (draft) {
      try {
        const state = editor.parseEditorState(draft);
        editor.setEditorState(state);
      } catch {
        /* ignore bad draft */
      }
    }
    timerRef.current = setInterval(persist, 10000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [editor, templateId, persist]);

  return (
    <OnChangePlugin
      onChange={() => {
        editor.getEditorState().read(() => {
          const text = $getRoot().getTextContent();
          onWordCount(text.split(/\s+/).filter(Boolean).length);
        });
      }}
    />
  );
}

export type StudioEditorHandle = {
  insertEvidenceChip: (evidenceId: string, evidenceText: string) => void;
  insertPlainText: (text: string) => void;
  setPlainText: (text: string) => void;
  getPlainText: () => string;
  getEditorStateJson: () => string;
  restoreFromJson: (json: string) => void;
  getLinkedEvidence: () => { id: string; text: string }[];
};

type Props = {
  templateId: string;
  onWordCount: (n: number) => void;
};

export const StudioLexicalEditor = forwardRef<StudioEditorHandle, Props>(
  function StudioLexicalEditor({ templateId, onWordCount }, ref) {
    const editorRef = useRef<LexicalEditor | null>(null);

    useImperativeHandle(ref, () => ({
      insertEvidenceChip(evidenceId, evidenceText) {
        editorRef.current?.update(() => {
          const selection = $getSelection();
          const chip = $createEvidenceChipNode(evidenceId, evidenceText);
          const space = $createTextNode(" ");
          if ($isRangeSelection(selection)) {
            selection.insertNodes([space, chip, $createTextNode(" ")]);
          } else {
            const root = $getRoot();
            const p = $createParagraphNode();
            p.append(chip);
            root.append(p);
          }
        });
      },
      insertPlainText(text) {
        editorRef.current?.update(() => {
          const selection = $getSelection();
          const node = $createTextNode(text);
          if ($isRangeSelection(selection)) {
            selection.insertNodes([node]);
          } else {
            const root = $getRoot();
            const p = $createParagraphNode();
            p.append(node);
            root.append(p);
          }
        });
      },
      setPlainText(text) {
        editorRef.current?.update(() => {
          const root = $getRoot();
          root.clear();
          text.split(/\n/).forEach((line) => {
            const p = $createParagraphNode();
            if (line) p.append($createTextNode(line));
            root.append(p);
          });
        });
      },
      getPlainText() {
        let text = "";
        editorRef.current?.getEditorState().read(() => {
          text = $getRoot().getTextContent();
        });
        return text;
      },
      getEditorStateJson() {
        return JSON.stringify(
          editorRef.current?.getEditorState().toJSON() ?? {},
        );
      },
      restoreFromJson(json) {
        try {
          const state = editorRef.current?.parseEditorState(json);
          if (state) editorRef.current?.setEditorState(state);
        } catch {
          /* ignore */
        }
      },
      getLinkedEvidence() {
        const items: { id: string; text: string }[] = [];
        editorRef.current?.getEditorState().read(() => {
          for (const node of $nodesOfType(EvidenceChipNode)) {
            items.push({
              id: node.getEvidenceId(),
              text: node.getEvidenceText(),
            });
          }
        });
        return items;
      },
    }));

    const initialConfig = {
      namespace: `FiscmakStudio-${templateId}`,
      theme,
      nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, EvidenceChipNode],
      onError(error: Error) {
        console.error(error);
      },
    };

    return (
      <LexicalComposer initialConfig={initialConfig}>
        <EditorRefPlugin editorRef={editorRef} />
        <Toolbar />
        <div className="relative min-h-[400px] flex-1">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="min-h-[400px] resize-none px-6 py-4 text-base outline-none" />
            }
            placeholder={
              <div className="pointer-events-none absolute left-6 top-4 text-fiscmak-muted">
                Select a template and click Generate, or start writing…
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <HistoryPlugin />
        <ListPlugin />
        <AutoSavePlugin templateId={templateId} onWordCount={onWordCount} />
      </LexicalComposer>
    );
  },
);

function EditorRefPlugin({
  editorRef,
}: {
  editorRef: React.MutableRefObject<LexicalEditor | null>;
}) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    editorRef.current = editor;
    return () => {
      editorRef.current = null;
    };
  }, [editor, editorRef]);
  return null;
}

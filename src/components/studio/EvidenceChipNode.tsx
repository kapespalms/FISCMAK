import {
  $applyNodeReplacement,
  DecoratorNode,
  type DOMExportOutput,
  type LexicalNode,
  type NodeKey,
  type SerializedLexicalNode,
  type Spread,
} from "lexical";
import type { JSX } from "react";

export type SerializedEvidenceChipNode = Spread<
  {
    evidenceId: string;
    evidenceText: string;
  },
  SerializedLexicalNode
>;

function EvidenceChipComponent({
  text,
}: {
  evidenceId: string;
  text: string;
}) {
  return (
    <span
      className="mx-0.5 inline-flex cursor-pointer items-center rounded-full bg-fiscmak-green-light px-2 py-0.5 text-xs font-semibold text-fiscmak-green-dark"
      title={text}
      contentEditable={false}
    >
      linked
    </span>
  );
}

export class EvidenceChipNode extends DecoratorNode<JSX.Element> {
  __evidenceId: string;
  __evidenceText: string;

  static getType(): string {
    return "evidence-chip";
  }

  static clone(node: EvidenceChipNode): EvidenceChipNode {
    return new EvidenceChipNode(
      node.__evidenceId,
      node.__evidenceText,
      node.__key,
    );
  }

  constructor(evidenceId: string, evidenceText: string, key?: NodeKey) {
    super(key);
    this.__evidenceId = evidenceId;
    this.__evidenceText = evidenceText;
  }

  createDOM(): HTMLElement {
    const span = document.createElement("span");
    span.className = "evidence-chip-wrapper";
    return span;
  }

  updateDOM(): false {
    return false;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("sup");
    element.textContent = "†";
    element.title = this.__evidenceText;
    return { element };
  }

  decorate(): JSX.Element {
    return (
      <EvidenceChipComponent
        evidenceId={this.__evidenceId}
        text={this.__evidenceText}
      />
    );
  }

  exportJSON(): SerializedEvidenceChipNode {
    return {
      type: "evidence-chip",
      version: 1,
      evidenceId: this.__evidenceId,
      evidenceText: this.__evidenceText,
    };
  }

  static importJSON(
    serialized: SerializedEvidenceChipNode,
  ): EvidenceChipNode {
    return $createEvidenceChipNode(
      serialized.evidenceId,
      serialized.evidenceText,
    );
  }

  getTextContent(): string {
    return this.__evidenceText;
  }

  getEvidenceId(): string {
    return this.__evidenceId;
  }

  getEvidenceText(): string {
    return this.__evidenceText;
  }

  isInline(): true {
    return true;
  }
}

export function $createEvidenceChipNode(
  evidenceId: string,
  evidenceText: string,
): EvidenceChipNode {
  return $applyNodeReplacement(
    new EvidenceChipNode(evidenceId, evidenceText),
  );
}

export function $isEvidenceChipNode(
  node: LexicalNode | null | undefined,
): node is EvidenceChipNode {
  return node instanceof EvidenceChipNode;
}

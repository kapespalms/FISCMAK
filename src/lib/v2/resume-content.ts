/** Structured CV/resume JSON stored on documents.metadata.content_json */

export type ResumeDateValue = {
  display: string;
  start?: string | null;
  end?: string | null;
  is_current?: boolean;
  incomplete?: boolean;
};

export type ResumeIncompleteField = {
  block_id: string;
  field: string;
  reason?: string;
};

export type ResumeHeaderBlock = {
  id: string;
  type: "header";
  name: string;
  credentials?: string;
  specialty?: string;
  email?: string;
  phone?: string;
  location?: string;
};

export type ResumeExperienceBlock = {
  id: string;
  type: "experience";
  organization: string;
  role: string;
  location?: string;
  dates: ResumeDateValue;
  bullets: string[];
};

export type ResumeEducationBlock = {
  id: string;
  type: "education";
  institution: string;
  degree: string;
  location?: string;
  dates: ResumeDateValue;
  details?: string;
};

export type ResumeSkillsBlock = {
  id: string;
  type: "skills";
  label: string;
  items: string[];
};

export type ResumeBlock =
  | ResumeHeaderBlock
  | ResumeExperienceBlock
  | ResumeEducationBlock
  | ResumeSkillsBlock;

export type ResumeContent = {
  version: 1;
  blocks: ResumeBlock[];
  incomplete_fields: ResumeIncompleteField[];
  merge_flags?: string[];
};

export type ResumeThemeKey = "compact" | "spacious";

export const RESUME_CONTENT_VERSION = 1 as const;

export function newBlockId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().slice(0, 8)}`;
}

export function emptyResumeContent(seed?: Partial<ResumeHeaderBlock>): ResumeContent {
  const header: ResumeHeaderBlock = {
    id: newBlockId("hdr"),
    type: "header",
    name: seed?.name ?? "",
    credentials: seed?.credentials,
    specialty: seed?.specialty,
    email: seed?.email,
    phone: seed?.phone,
    location: seed?.location,
  };
  return {
    version: RESUME_CONTENT_VERSION,
    blocks: [header],
    incomplete_fields: [],
    merge_flags: [],
  };
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function parseDateValue(raw: unknown): ResumeDateValue {
  if (!isRecord(raw)) return { display: "", incomplete: true };
  const display = typeof raw.display === "string" ? raw.display : "";
  return {
    display,
    start: typeof raw.start === "string" ? raw.start : null,
    end: typeof raw.end === "string" ? raw.end : null,
    is_current: raw.is_current === true,
    incomplete: raw.incomplete === true || !display.trim(),
  };
}

function parseIncompleteField(raw: unknown): ResumeIncompleteField | null {
  if (!isRecord(raw)) return null;
  const block_id = typeof raw.block_id === "string" ? raw.block_id : "";
  const field = typeof raw.field === "string" ? raw.field : "";
  if (!block_id || !field) return null;
  return {
    block_id,
    field,
    reason: typeof raw.reason === "string" ? raw.reason : undefined,
  };
}

function parseBlock(raw: unknown): ResumeBlock | null {
  if (!isRecord(raw)) return null;
  const id = typeof raw.id === "string" ? raw.id : newBlockId("blk");
  const type = raw.type;
  if (type === "header") {
    return {
      id,
      type: "header",
      name: typeof raw.name === "string" ? raw.name : "",
      credentials: typeof raw.credentials === "string" ? raw.credentials : undefined,
      specialty: typeof raw.specialty === "string" ? raw.specialty : undefined,
      email: typeof raw.email === "string" ? raw.email : undefined,
      phone: typeof raw.phone === "string" ? raw.phone : undefined,
      location: typeof raw.location === "string" ? raw.location : undefined,
    };
  }
  if (type === "experience") {
    return {
      id,
      type: "experience",
      organization: typeof raw.organization === "string" ? raw.organization : "",
      role: typeof raw.role === "string" ? raw.role : "",
      location: typeof raw.location === "string" ? raw.location : undefined,
      dates: parseDateValue(raw.dates),
      bullets: Array.isArray(raw.bullets)
        ? raw.bullets.filter((b): b is string => typeof b === "string")
        : [],
    };
  }
  if (type === "education") {
    return {
      id,
      type: "education",
      institution: typeof raw.institution === "string" ? raw.institution : "",
      degree: typeof raw.degree === "string" ? raw.degree : "",
      location: typeof raw.location === "string" ? raw.location : undefined,
      dates: parseDateValue(raw.dates),
      details: typeof raw.details === "string" ? raw.details : undefined,
    };
  }
  if (type === "skills") {
    return {
      id,
      type: "skills",
      label: typeof raw.label === "string" ? raw.label : "Skills",
      items: Array.isArray(raw.items)
        ? raw.items.filter((i): i is string => typeof i === "string")
        : [],
    };
  }
  return null;
}

/** Lightweight schema parse (no Zod dep). */
export function parseResumeContent(raw: unknown): ResumeContent | null {
  if (!isRecord(raw)) return null;
  const version = raw.version === 1 ? 1 : RESUME_CONTENT_VERSION;
  const blocksRaw = Array.isArray(raw.blocks) ? raw.blocks : [];
  const blocks = blocksRaw
    .map(parseBlock)
    .filter((b): b is ResumeBlock => b !== null);
  if (blocks.length === 0) return null;
  const incomplete_fields = (Array.isArray(raw.incomplete_fields) ? raw.incomplete_fields : [])
    .map(parseIncompleteField)
    .filter((f): f is ResumeIncompleteField => f !== null);
  const merge_flags = Array.isArray(raw.merge_flags)
    ? raw.merge_flags.filter((f): f is string => typeof f === "string")
    : undefined;
  return {
    version,
    blocks,
    incomplete_fields,
    merge_flags,
  };
}

export function resumeContentFromMetadata(
  metadata: Record<string, unknown> | null | undefined,
): ResumeContent | null {
  if (!metadata?.content_json) return null;
  return parseResumeContent(metadata.content_json);
}

export function collectIncompleteFields(content: ResumeContent): ResumeIncompleteField[] {
  const found: ResumeIncompleteField[] = [...content.incomplete_fields];
  for (const block of content.blocks) {
    if (block.type === "experience" || block.type === "education") {
      if (block.dates.incomplete || !block.dates.display.trim()) {
        found.push({
          block_id: block.id,
          field: "dates.display",
          reason: "Date range missing or uncertain",
        });
      }
    }
  }
  const seen = new Set<string>();
  return found.filter((f) => {
    const key = `${f.block_id}:${f.field}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function reorderBlocks(blocks: ResumeBlock[], orderedIds: string[]): ResumeBlock[] {
  const map = new Map(blocks.map((b) => [b.id, b]));
  const ordered = orderedIds.map((id) => map.get(id)).filter((b): b is ResumeBlock => !!b);
  for (const b of blocks) {
    if (!orderedIds.includes(b.id)) ordered.push(b);
  }
  return ordered;
}

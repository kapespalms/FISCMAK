# FISCMAK Output Studio — Editor Engine & Tools

## Engine decision

- **TipTap** (ProseMirror, **MIT core** — free, self-hosted, structured/block). Headless: no vendor UI.
- **UI built from your existing Shadcn/UI + Tailwind** → on-brand (restrained dark luxury), not a generic gray toolbar.
- **"Edit with Mak" = your own LLM** wired into the editor — no paid vendor AI plugin needed.
- **Export = your render layer** (python-docx / WeasyPrint) — no paid export feature needed.
- **Fallback if you don't want to build the UI yet:** BlockNote (Notion-style UI on the same TipTap foundation; graduate to custom later without re-platforming).
- **Deferred (TipTap Pro or build-later):** track changes + comments (for the mentor-review workflow).

The two things commercial editors charge for — AI editing and export-to-Word — you already have free elsewhere in the stack. The only paid delta is track changes/comments, which is deferrable.

---

## Toolbar & tools

### 1. Format — *standard TipTap extensions (free core)*
- Bold / italic / underline
- Headings H1–H3 (sections & subsections)
- Bulleted & numbered lists
- Link
- Superscript / subscript (citations, asterisks)
- Table (tabular CV sections)
- Clear formatting · Undo / redo

### 2. Structure & sections — *custom nodes/commands*
- **Section block** — each section is a node, not loose text
- **Toggle section on/off** — the "edit out a section" feature; hides for this render, keeps the data
- **Add / remove / reorder sections**
- **Collapse / expand** for navigating long documents (dossiers)

### 3. Bank & evidence — *custom, bank-bound*
- **Insert from bank** — drop a captured entry / CV item into the document
- **Regenerate section from bank** — pull the latest entries (snapshot refresh)
- **Reach grouping** — organize entries under International / National / Regional / Local / Institutional (CWRU requirement)
- **Mark representative publication** — asterisk the 3 reps (CWRU rule)
- **Impact annotation** — attach the role / scholarship / impact note to an entry (CWRU 2025 APT rule)

### 4. Mak — *custom, your LLM*
- **Ask Mak to revise** — tighten / expand / rephrase the selected block
- **Translate for audience** — academic ↔ industry ↔ community language
- **Draft this section** — generate narrative (teaching philosophy, contribution statement) grounded in the bank
- **Significance statement** — draft the 2–3 sentence "why this matters + my role" for a representative publication
- *All Mak edits are grounded in captured evidence; thin evidence → less text, never invented.*

### 5. Compliance helpers — *custom*
- **Length / page meter** — live count against the limit (e.g., CWRU ≤ 2-page narratives), warns when over
- **Date formatter** — enforce `mm/yyyy–present`
- **Spell-out check** — flag unspelled acronyms / abbreviations on first use (CWRU rule)
- **Section presence vs. template** — show required / missing sections for the chosen route

### 6. Output — *custom + render layer*
- **Switch template / route** — CV / resume / dossier / cover letter; Standard route or institution route (CWRU, etc.)
- **Export** — .docx / PDF
- **Page numbering & footer** — applied at export, not in the editor (web editors are continuous scroll). PDF via CSS `@page` counters; Word via a footer field. CWRU footer = *last name · page X of Y · date* (CWRU requires the CV dated and paginated).
- **Comments / track changes** — *deferred* (mentor-review workflow; TipTap Pro or build later)

---

## Build notes

- **Free TipTap core** covers Format + the section primitives.
- **The custom layer** — section toggles, bank-binding, reach/asterisk/impact tools, Mak actions, compliance helpers — is your build, and it's the differentiated value: a generic editor can't do any of it because it isn't bound to the bank or the institution route.
- **Defer** track changes/comments until the mentor-review workflow is a priority.
- Everything here stays free, unwatermarked, self-hosted, and on-brand.

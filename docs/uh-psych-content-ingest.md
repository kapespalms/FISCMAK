# UH psych content ingest (maintainer)

Short guide for exporting rotation PDFs from Google Drive into the repo and keeping the content manifest current.

## What lives where

| Path | Purpose |
|------|---------|
| `docs/seeds/uh-rotation-orientations/index.json` | Rotation index — `drive_files` per rotation, `drive_files_pending_identification` |
| `public/content/uh-psych/` | Resident-facing PDFs (education hub + rotation downloads) |
| `docs/seeds/uh-psych-content-manifest.json` | Generated status map (run sync script) |
| `src/lib/v2/programs/uh-education-manifest.ts` | Auto-generated education hub manifest |

## Export a Drive PDF to the repo

1. Open the file in Google Drive (program folder linked from `index.json` → `drive_folder`).
2. **File → Download → PDF** (or export Google Doc to PDF).
3. Save under `public/content/uh-psych/` using a clear folder:
   - Rotation-specific: e.g. `public/content/uh-psych/rotations/cl-syllabus.pdf`
   - Education: match existing categories (`landmark-articles/`, `psychopharmacology/`, etc.)
4. Add or update the rotation's `drive_files` entry in `index.json`:
   ```json
   { "label": "CL Tips & Tricks", "url": "/content/uh-psych/rotations/cl-tips.pdf" }
   ```
   Use `/content/uh-psych/...` paths for repo files. Keep full Google URLs for items still external-only.

## Regenerate manifests

```bash
node scripts/sync-uh-psych-content.mjs
node scripts/generate-education-manifest.mjs
```

`sync-uh-psych-content.mjs` does **not** download from Drive (auth blocked). It only checks which URLs map to files already in `public/content/uh-psych/` and writes status: `in_repo` | `linked` | `pending_export`.

## Pending identification queue

Six entries in `drive_files_pending_identification` (index.json) are surfaced in the app as **Content gaps** — residents see "coming soon"; maintainers see URLs on the electives footer.

When you identify a file:

1. Note which rotation it belongs to.
2. Export to repo (above).
3. Move the entry from `drive_files_pending_identification` into that rotation's `drive_files`.
4. Re-run sync script.

## CL/MPU syllabus (Google Doc)

The CL/MPU Rotation Syllabus remains an external Google Doc until exported. The app links it with label **CL/MPU Rotation Syllabus** on CL and MPU rotation pages (open in new tab). When ready, export PDF → repo path → update `cl.json` / `mpu_cl.json` and index.

## Verify in the app

- Rotation page **Downloads** block — repo PDFs use in-app path; Drive/Docs open externally.
- `/app/education` — new PDFs appear after `generate-education-manifest.mjs`.
- `/app/residency/electives` footer — content gaps shrink as files are identified.

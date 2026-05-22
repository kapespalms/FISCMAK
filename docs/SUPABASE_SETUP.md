# Supabase setup (FISCMAK)

Your project: **qnskxioqsgnkkuyalqcn**  
Dashboard: https://supabase.com/dashboard/project/qnskxioqsgnkkuyalqcn

---

## Do NOT type this in SQL Editor

```
docs/FISCMAK_SUPABASE_SCHEMA.sql   ← this is a file path, not SQL
```

That causes: `syntax error at or near "docs"`

---

## Step 1 — Open the SQL file in Cursor

In the left file tree, open:

```
fiscmak/docs/FISCMAK_SUPABASE_SCHEMA.sql
```

Select **all** the text (`Cmd+A`), then **Copy** (`Cmd+C`).

---

## Step 2 — Run it in Supabase

1. Go to **SQL Editor** in Supabase  
   https://supabase.com/dashboard/project/qnskxioqsgnkkuyalqcn/sql/new
2. Click in the big text box
3. **Paste** (`Cmd+V`) — you should see lines starting with `-- FISCMAK COMPLETE` and `CREATE TABLE`
4. Click **Run** (or `Cmd+Enter`)
5. Wait — it may take 30–60 seconds. Success = green “Success. No rows returned”

---

## Step 3 — Auth bridge (second script)

Repeat for the second file:

```
fiscmak/docs/supabase-auth-bridge.sql
```

Copy all → paste in a **new** SQL query → **Run**.

This links Supabase login (`auth.users`) to FISCMAK `users` + `profiles`.

---

## Step 4 — App env vars

In `.env.local` on your Mac:

```env
NEXT_PUBLIC_SUPABASE_URL=https://qnskxioqsgnkkuyalqcn.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<paste from Dashboard → Settings → API → anon public>
```

Restart the dev server:

```bash
cd /Users/kristenpalmer/fiscmak && npm run dev
```

Sign up at http://localhost:3000/signup

---

## If Step 2 fails

**`relation "users" already exists`** — tables were created on a previous run. **Do not re-run the full schema.** Use one of:

### Option A — Finish setup (recommended, keeps existing tables)

1. Open `docs/supabase-finish-setup.sql` → copy all → paste → **Run**
2. Open `docs/supabase-auth-bridge.sql` → copy all → paste → **Run**

### Option B — Clean slate (no data to lose yet)

1. Open `docs/supabase-reset.sql` → copy all → **Run**
2. Open `docs/FISCMAK_SUPABASE_SCHEMA.sql` → copy all → **Run**
3. Open `docs/supabase-auth-bridge.sql` → copy all → **Run**

**“relation already exists”** (other tables) — same as above.

**“permission denied”** — use the SQL Editor (not the Table Editor).

**File too big to paste** — in Supabase SQL Editor, use **+ New query**, paste in chunks at `-- =====` section breaks, or ask me to split into Part 1 / Part 2 files.

---

## What each URL is for

| URL | Use |
|-----|-----|
| `https://qnskxioqsgnkkuyalqcn.supabase.co` | Next.js app (anon key) |
| `postgresql://postgres:...@db.qnskxioqsgnkkuyalqcn...` | Direct DB / psql only — **not** pasted into SQL Editor |

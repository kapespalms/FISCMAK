# FISCMAK — App IA & Design System (drill-down)

**Date:** 2026-06-02 · **Source:** read from live code (`mak-sections.ts`, `globals.css`, layout components). Marks built vs. vision and flags design inconsistencies.

---

## Shell layout (shared by physician + institution)

```
┌──┬───────────────────────────────────────────────┐
│  │  [logo]   S · O · A · P · Output    🔔 ☾  Docs  │  ← top nav strip
│M ├───────────────────────────────────────────────┤
│a │                                                 │
│k │                MAIN CONTENT                     │
│  │                (workspace)                      │
│  │                                                 │
└──┴───────────────────────────────────────────────┘
```

- **Left rail** (`IconSidebar`, 56px) — slim, just the **Coach Mak avatar** + an expand tab. Mak is a global dock, present on every screen — *not* a nav menu. Background `#0A0C10` (near-black), accent **lime `#A3E635`**.
- **Top nav strip** (`TopNavBar`) — the section buttons (below). Home logo left; Documents button, Notifications, light/dark toggle right.
- **Main content** — the active workspace.

So the "side bar" is the Mak rail; the **section navigation is the top strip** (SOAP).

---

## Physician app — the SOAP spine

`SECTION_NAV` = **Dashboard · Subjective · Objective · Assessment · Plan · Output** (6 buttons).

| Button | SOAP role | What lives inside | Data / status |
|---|---|---|---|
| **Dashboard** | home | Welcome, due-now, goals grid, mini-lattice, schedule. | 🟡 **v2** (legacy `analytics` + `MiniLattice`) — rebuild target (the 2×2 + heatmap layout). |
| **Subjective** | "S" — how it *feels* | Mak well-being / reflection check-ins, the subjective + invisible self-report. | well-being (FCWI/pulse) is §C2-separate; subjective capture path = the to-build engine. |
| **Objective** | "O" — the *evidence* | Tabs: **Vault · Documents · Activities · Lattice**. The 8×8 lattice + the evidence behind it. | ✅ CV pipeline + v3 heatmap; ⚠️ second v2 lattice stacked (retire). |
| **Assessment** | "A" — the *read* | Insights / analysis of where the physician stands. | ⚠️ **v2** — runs on superseded `career_assessments` (audit C2). Rebuild onto `evidence_unit`/formulas. |
| **Plan** | "P" — the *plan* | Tabs: **Goals** (WOOP/SMART) + **Jobs**. | ✅ goals (`goal_records`); ⛔ Jobs is PARKED but still shipped here. |
| **Output** | the deliverable | The document studio — CV, dossier, cover letter, etc. | ✅ v3 bank ("CV Studio", default); ⚠️ v2 "Document Library" toggle + 7 fragmented builders. |

Plus **Documents** (top-bar button, slightly redundant with Objective's Documents tab) and **Mak** (the always-present left-rail dock).

The metaphor is the strength: a physician reads *Subjective → Objective → Assessment → Plan → Output* the way they'd write a note — self-report, then evidence, then the read, then the plan, then the artifact.

---

## Institution app

There is **no separate polished institution app** today — the institution side is **program-gated views** (the UH Psychiatry GME pilot) plus admin, reached through the same shell with a program membership gate.

| Surface | What it is | Status |
|---|---|---|
| **Program hub** (`/app/uh-psych`) | Residency hub — roster, schedule, contacts, education. | 🟦 built (GME pilot) |
| **Cohort heatmap / dashboard** (`/v1/programs/[id]/cohort-*`) | Aggregate milestone + evidence view across residents. | 🟦 partial |
| **ILP approvals · MedHub sync · eval imports · PRITE** | Program-director / coordinator tooling. | 🟦 built |
| **Staff directory · program gate** | Access control + roster. | 🟦 built |
| **kp-admin** | Founder/pilot ops gate. | built |
| **Aggregate dashboards** (domain coverage, recognition gap, burnout risk, retention patterns) | The de-identified institutional value layer (N≥5, ranges not precision, no drill-to-one). | ⬜ **vision only** — Phase 2+ |

So today's "institution app" = the **GME pilot tooling for program directors**. The *attending*-institution aggregate dashboards (the real B2B value) are specced but unbuilt — and governed by the ethical-aggregation rules: the institution never sees an individual's cells, only patterns across ≥5.

---

## Colors (actual tokens)

| Token | Light | Dark | Use |
|---|---|---|---|
| `--cx-forest-dark` | `#243b31` | `#1a2e24` | Primary brand — deep forest green |
| `--cx-page-muted` | `#f4f5f4` | `#121a16` | Page background |
| Mak rail | `#0A0C10` | — | Near-black left rail |
| Mak accent | **`#A3E635`** lime | — | Expand tab, Mak active ring |
| SOAP section tints | `#E8F4F8` (blue), … | — | Per-section pastel card backgrounds |

## Fonts — Futura PT throughout (✅ matches brand)

| Element | Family / weight | Size |
|---|---|---|
| h1 | Futura PT **Bold** 700 | 32px |
| Big metric | Futura PT Bold, tabular-nums | 48px |
| h2 | Futura PT **Medium** 600 | 18–20px |
| Body | Futura PT **Book** 400 | 14–16px |
| Label | Futura PT Medium 500 | 11–12px |

Fallback `Jost` (free Futura-alike) → Helvetica Neue.

---

## Design inconsistencies to flag (reviewer notes)

1. **The lime `#A3E635` accent conflicts with the stated aesthetic.** Brand intent is *restrained dark luxury, muted accents, no neon* — lime is bright/neon. It's the most visible accent (Mak rail), so it reads against the luxury register. Decide: mute it, or swap toward the **treasury-gold** value color.
2. **Gold = value is in the brand etymology but not in the palette.** "Fisc + mak" → treasury-of-greatness, gold = value — yet there's no gold token implemented. The density ramp and accents could carry that (the navy-vs-gold heat-map question is the same decision).
3. **Three different darks** — forest `#243b31`, near-black rail `#0A0C10`, dark-mode forest `#1a2e24`. Worth unifying to one dark system.
4. **SOAP section pastels** (`#E8F4F8` etc.) are light/airy — verify they fit the dark-luxury register or feel like a different product.

---

## Open design decisions

- Mute the lime / introduce treasury-gold as the value accent (ties to the heat-map ramp decision).
- Unify the dark palette to one system.
- Whether the **institution app** is a separate shell or the same shell with an institution role + aggregate dashboards bolted into Dashboard/Assessment.

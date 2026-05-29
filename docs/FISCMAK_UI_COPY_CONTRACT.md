# FISCMAK — UI copy contract

**Audience:** Product, engineering, QA  
**Status:** May 2026  
**Scope:** In-app copy and API fields shown to users. **Marketing / landing pages unchanged.**

**Related:** [FISCMAK_MAK_LANGUAGE_GUIDE.md](./FISCMAK_MAK_LANGUAGE_GUIDE.md)

---

## Global rules

1. **Coach Mak** — one name in the sidebar; not “Perspective assistant.”  
2. **No numeric wellbeing scores** on any user page (/100, percentiles, PFI values).  
3. **Nav labels** — use `SOAP_TAB` user strings: Perspective, Career Data, Insights, Strategy, Output Studio.  
4. **SOAP / SOAPO / tier** — code and internal docs only.  
5. **No status badges** for “how you’re doing” (no weather, strain, traffic lights for worth).

---

## Per surface

### Dashboard (`/app/dashboard`)

| Shows | Never shows |
|-------|-------------|
| Greeting, name | Career Health Score |
| **Due now:** “Quarterly check-in due” | Numeric energy /7, /10 |
| Mini career map (confirmed) | Peer rank |
| Goal snapshot (read-only link) | Instrument names |
| Entry to Coach Mak | tier 2 incomplete jargon |

**Target (when drift fixed):** remove health score gauge from ownership and UI.

### Perspective (`/app/subjective`)

| Shows | Never shows |
|-------|-------------|
| Link to continue check-in if due | Fulfillment percentile |
| Last **saved summary** from check-in (plain bullets) | Raw metric scores |
| — | Separate “wellbeing dashboard” |

Check-in **happens in Mak**; this page orients and shows last confirmed summary — not a form grid.

### Career Data (`/app/objective`)

| Shows | Never shows |
|-------|-------------|
| Map, vault, reconcile, activities, documents | “Level 4” entrustment |
| Confirm / dismiss on suggestions | Parser counts as truth without label |
| Density language: sparse / growing / well documented (if labeled — usability TBD) | Bright = good physician |

### Insights (`/app/assessment`)

| Shows | Never shows |
|-------|-------------|
| Theme sentences from confirmed data | Domain scores |
| Check-in coverage status (“baseline complete”) | CRI, CDI |

### Strategy (`/app/plan`)

| Shows | Never shows |
|-------|-------------|
| Goals, pathways, jobs | Algorithmic “you should pivot” |

### Output Studio (`/app/output`)

| Shows | Never shows |
|-------|-------------|
| Templates, editor, export | Composite score page in PDF |
| Source hints per claim (target) | Invented CV lines |

### Onboarding (`/app/onboarding`)

| Shows | Never shows |
|-------|-------------|
| About you, Documents, Baseline check-in | “Tier 3” |
| Progress: question N of ~11 (optional) | Cluster IDs |

### Institution (program admin)

| Shows | Never shows |
|-------|-------------|
| Cohort heatmap, pre-CCC themes | Individual Mak chat |
| Data sufficiency | Individual PFI/BITS |

---

## Mak panel chrome

- Title: **Coach Mak** (or avatar + Mak)  
- Subtitle: optional context — *“Quarterly check-in”* during check-in only  
- Never: section name as bot name

---

## API → UI boundary

User APIs must not return: `career_health_score`, raw `instrument_scores`, `pfi.raw`, IWQ, S-Index, CRI for standard physician role.

Internal/admin/KP dev may retain for debugging — not physician UI.

---

## QA checklist (release)

- [ ] No /100 on dashboard or quarterly summary  
- [ ] No “PFI” or “burnout score” in user strings  
- [ ] Mak history persists across nav (when B6 shipped)  
- [ ] Summary confirm required before post-onboarding insights populate  
- [ ] Marketing pages untouched by app copy changes  

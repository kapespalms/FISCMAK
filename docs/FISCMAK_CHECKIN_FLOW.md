# FISCMAK — Check-in flow

**Audience:** Product, engineering  
**Status:** May 2026  
**Note:** Describes behavior and copy. **Does not** change marketing or visual layout.

**Related:** [FISCMAK_MAK_LANGUAGE_GUIDE.md](./FISCMAK_MAK_LANGUAGE_GUIDE.md), [FISCMAK_MAK_QUESTION_CADENCE.md](./FISCMAK_MAK_QUESTION_CADENCE.md)

---

## Onboarding (first time)

```
About you (profile)
    ↓
Documents — CV optional
    ↓
Baseline check-in with Mak (~12 min)
    ↓
Summary — does this sound right?
    ↓
Dashboard
```

### Baseline check-in

- Mak: *“About 12 minutes. I’ll ask standard wellbeing and career questions. You can pause anytime.”*  
- One scored question at a time (~11 for most residents/attendings).  
- Optional short follow-ups (not scored).  
- **Same Coach Mak thread** — not a separate bot.

### Summary confirm

Plain bullets, no scores. Buttons: **Yes, save this** · **Change with Mak** · **Not quite**.

**Backend:** sets `tier3_complete` only after confirm. Code flags: `instrument_answers`, `checkin_summary_confirmed_at`.

---

## Recurring check-ins

| User label | Interval | Content (backend) |
|------------|----------|-------------------|
| Quarterly check-in | ~12 weeks | PFI 2-item screen + invisible pulse + career momentum; optional CV update |
| Six-month check-in | ~6 months | Quarterly + BITS + PIF + UWES; trainee milestone reflection optional |
| Yearly review | ~12 months | Horizon refresh + few narrative questions + year summary |

Each ends with **summary confirm** — same three buttons.

**BITS** at six-month check-in, not every quarter (aligns with `QUARTERLY_MODULES` in code).

---

## Dashboard “due now”

Show logistics only, e.g.:

- *“Quarterly check-in due”*  
- *“Six-month check-in due”*  

**Do not** show a status badge (“weather,” “strain,” colored bands). Mak adjusts tone in conversation when internal signals are heavy.

---

## One Mak thread

- Check-ins are **segments** in the same conversation history.  
- **Target:** `/api/v1/chat/history` not filtered by app section (see `MakPanel.tsx` drift).  
- Page change = internal `page_context` update, not a new greeting.

---

## Question inventory (reference)

| Bucket | Count | Notes |
|--------|-------|-------|
| Baseline clusters | 11 | Once |
| Quarterly form fields | ~10–11 | Repeated each quarter |
| Full published forms | 63 | Not used as one form — clusters only |
| 60-Q bank | 60 total | ~4–6 per year, dedupe vs PFI |
| “Everything in one year” ~185 | — | **Not product design** |

See [FISCMAK_MAK_QUESTION_CADENCE.md](./FISCMAK_MAK_QUESTION_CADENCE.md) for cluster IDs and prompts.

---

## PFI scale rule

All PFI items: **0–4**, published anchors. Quarterly 2-item screen must use **same items and scale** as onboarding subset — not 0–6 MBI-style anchors.

Longitudinal claims (“worse since last check-in”) only after equating study (see [FISCMAK_OPENEVIDENCE_HANDOFF.md](./FISCMAK_OPENEVIDENCE_HANDOFF.md)).

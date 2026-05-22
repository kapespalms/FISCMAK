# FISCMAK VISUAL-FIRST ARCHITECTURE: IMPLEMENTATION SUMMARY

**Version:** 1.0  
**Generated:** May 22, 2026  
**Status:** READY FOR LOVEABLE BUILD  
**Architecture:** Three-Tier Layout + Always-Open Coach Mak

---

## WHAT'S CHANGED FROM CANONICAL SPEC

The original FISCMAK_V1_CANONICAL_BUILD_SPEC.md described a comprehensive system. This visual-first update **does not change the backend, database, or business logic**—it reorganizes the frontend UX around three principles:

1. **Three-Tier Visual Layout** (instead of page-based navigation)
2. **Coach Mak as Primary Navigation** (instead of forms)
3. **Low-Cognitive Drag & Drop Foundation** (for future phases)

---

## THREE-TIER ARCHITECTURE AT A GLANCE

```
┌──────────────────────────────────────────────────────────┐
│ FISCMAK USER INTERFACE                                   │
├──────────┬──────────────────────┬──────────────────────┤
│  TIER 1  │     TIER 2           │      TIER 3          │
│          │                      │                      │
│ Icon     │   Coach Mak Panel    │   Main Workspace     │
│ Sidebar  │   (Always-Open       │                      │
│          │    Conversational AI) │   Page content       │
│  60px    │   320px              │   380px (flexible)   │
│ wide     │   (docked)           │                      │
│          │                      │                      │
│ 6 icons  │ • Chat messages      │ • Active page data   │
│ •💬 Mak │ • Input area (text+  │ • Lattice/cards/     │
│ •📝 S   │   voice)             │   editor             │
│ •📊 O   │ • Adaptive greeting  │ • Real-time updates  │
│ •🎯 A   │ • Contextual menu    │ • Visual display     │
│ •📐 P   │                      │   (no forms)         │
│ •🚀 O   │                      │                      │
└──────────┴──────────────────────┴──────────────────────┘
```

### Tier 1: Icon Sidebar (Fixed Left, 60px)
- **Purpose:** Primary navigation
- **Content:** 6 icons representing SOAP + Output
- **Behavior:** Click icon → page switches, Mak greeting updates
- **Mobile:** Collapses to hamburger or becomes full-width

### Tier 2: Coach Mak Panel (Fixed Left-Middle, 320px)
- **Purpose:** Conversational input & guidance
- **Content:** Chat messages, input field (text/voice), adaptive menu
- **Behavior:** Always visible, changes tone per page, never forces forms
- **Mobile:** Slides in from left, takes full screen with close X

### Tier 3: Main Workspace (Flexible Right, 380px+)
- **Purpose:** Display data, visualizations, editors
- **Content:** Page-specific content (lattice, cards, editor, etc.)
- **Behavior:** Updates when page icon clicked, real-time updates when Mak interaction happens
- **Mobile:** Single column, stacked components

---

## COACH MAK'S ADAPTIVE BEHAVIOR

Coach Mak is **not** a chatbot—it's an **intelligent interface** that changes personality, questions, and options based on what page the user is viewing.

### When on SUBJECTIVE page (S):
**Mak Role:** Listener & Therapist  
**Greeting:** "How are you feeling today?"  
**Questions Focus:**
- Energy signals (0-10 scale, conversational)
- What triggered this feeling
- Alignment with values
- Burnout indicators (hidden scoring)

**User Input Methods:**
- Mood slider (drag or click)
- Mood trigger checkboxes
- Voice: "I'm feeling burned out from admin work"
- Menu selections: "I'm energized / I'm drained / I'm balanced"

**Main Workspace Shows:**
- Energy level slider with gradient
- Mood trigger checkboxes
- Burnout indicator bars (Maslach)
- Value alignment (goals vs. actual time)
- Weekly trend graph

---

### When on OBJECTIVE page (O):
**Mak Role:** Documenter & Classifier  
**Greeting:** "What did you accomplish this week?"  
**Questions Focus:**
- Activity type (clinical, research, teaching, admin, collab)
- Scope (individual, team, department, institution)
- Energy signal for this activity
- Visibility status (hidden, documented, CV-ready)

**User Input Methods:**
- Voice: "I led a journal club for residents this week"
- Text paste: Paste activity description
- Document upload: Upload CV/dossier for parsing
- Menu selections: "What kind of activity? [Clinical] [Teaching] [Research]..."

**Main Workspace Shows:**
- Activity capture card (top)
- Recognition gap alert (if applicable)
- 8×8 lattice grid (color-coded by energy)
- Evidence gallery (filterable)
- Real-time lattice updates as activities logged

---

### When on ASSESSMENT page (A):
**Mak Role:** Analyst & Coach  
**Greeting:** "What patterns are you noticing?"  
**Questions Focus:**
- Career pattern interpretation
- Strengths vs. opportunities
- Blind spots & coherence
- Goal alignment

**User Input Methods:**
- Menu selections: "Show my strengths / Show my blind spots / What's my pattern?"
- Voice: "Does this describe me? [pattern name]"
- Goal clicks: User clicks goal to explore it

**Main Workspace Shows:**
- Career pattern summary (name + explanation)
- Strengths & opportunities (side-by-side)
- Lattice heatmap with annotations
- Coherence score + interpretation
- Recognition gap analysis
- Goal alignment progress

---

### When on PLAN page (P):
**Mak Role:** Strategist & Sponsor  
**Greeting:** "Where do you want to take your career?"  
**Questions Focus:**
- Career aspirations
- Timeline
- What evidence is needed
- Blockers & support

**User Input Methods:**
- Menu selections: "What's next for you? [Publish more] [Get promoted] [Formalize teaching]..."
- Voice: "I want to be promoted to full professor in 5 years"
- Goal creation: [Add goal] button triggers Mak conversation

**Main Workspace Shows:**
- Goal timeline (5-year view, horizontal)
- Active goal cards (progress, milestones, linked evidence)
- Suggested next steps (from Mak analysis)
- Goal roadmap visual

---

### When on OUTPUT page (O):
**Mak Role:** Ghostwriter & Sponsor  
**Greeting:** "What are we writing today?"  
**Questions Focus:**
- Output goal (academic tenure, annual review, promotion, etc.)
- Target audience
- Tone & emphasis

**User Input Methods:**
- Menu selections: "What output? [Academic Tenure] [Annual Review] [Promotion] [Industry Pitch]..."
- Upload institutional template: "Use my institution's template"
- Voice: "I'm applying for academic promotion"

**Main Workspace Shows:**
- Template selection modal (before editor)
- Output Studio with three columns:
  - **Left:** Auto-linked evidence suggestions
  - **Center:** Lexical editor (rich text)
  - **Right:** Evidence drawer (all linked items)
- Word count & guidance (per section)
- Export options (Copy, DOCX, PDF, Email)
- Version history

---

## COGNITIVE LOAD REDUCTION MECHANISMS

### No Form-Filling
**Traditional form:** "Select your activity type [dropdown]"  
**Mak approach:** "What kind of work was this? [Clinical] [Teaching] [Research] [Admin] [Leadership]"
- More conversational
- User feels heard
- Same data collected, lower friction

### Visual Clarity
**Instead of:** "How is your work distributed?" [complex form]  
**Show:** 8×8 lattice grid with real-time color updates
- User sees instantly where energizing work is
- No interpretation needed
- Patterns become obvious

### Contextual Guidance
**Form pain:** User unsure why a field matters  
**Mak approach:** Mak explains context before asking
- "I'm seeing a pattern in your research. Tell me about your latest publication—I want to understand your impact."
- User understands why they're being asked

### Always-Available Input
**Form friction:** Must navigate to specific page to log activity  
**Mak approach:** Click voice button from ANY page
- "I just finished a clinical leadership meeting"
- Activity logged without leaving current page
- Lattice updates in real-time

### Adaptive Menus (Not Forms)
**Form:** Required fields, error messages, re-submission  
**Mak menus:** Context-aware options that show only what's relevant
- On Subjective: "Are you energized / drained / balanced?"
- On Objective: "What kind of activity? [with specialty-specific examples]"
- On Output: "Which template? [pre-built options + upload institutional]"

---

## LOVEABLE BUILD SEQUENCE (UPDATED)

### Phase 1: Visual Foundation (Weeks 1-2)

**Prompt 1: Design System & Icon Sidebar**
- Icon sidebar (60px, 6 icons)
- Design tokens (FISCMAK green #5FD65F, colors, typography, spacing)
- Active state styling
- Navigation routing

**Prompt 2: Three-Tier Layout**
- Layout structure (nav 60px + Mak 320px + workspace flexible)
- Responsive behavior (mobile hamburger)
- Page routing (icon click switches main workspace)
- Test all 6 pages load correctly

**Prompt 3: Coach Mak Panel Base**
- Chat UI (messages, input area, voice button)
- Greeting logic (changes per page)
- Voice recording (30 seconds max)
- Auto-send on voice completion
- Message history scroll

### Phase 2: Subjective (S) Page (Week 3)

**Prompt 4: Energy Level & Mood Tracking**
- Energy slider (0-10, gradient colors)
- Mood trigger checkboxes
- Today's energy display
- Stores in mood_signals table
- Mak responds to slider changes

**Prompt 5: Burnout Indicators & Value Alignment**
- 3-part burnout indicator bars (Maslach)
- Value alignment display (goals vs. actual time)
- Gap visualization
- Connects to Mak insights: "I'm seeing burnout risk. Want to talk?"

**Prompt 6: Weekly Trend Graph**
- 7-day energy trend line chart
- Interactive hover (shows activity on that day)
- Stores in mood_signals table
- Mak offers: "What happened on Wednesday that drained you?"

### Phase 3: Objective (O) Page (Week 4)

**Prompt 7: Activity Capture Card**
- Text input + voice input form
- Posts to Claude → Mak conversation flow
- OpenAI classification in background
- Shows confirmation: "Logged: [Activity] in [Domain]-[Track]"
- Lattice updates in real-time

**Prompt 8: Recognition Gap Alert**
- Conditional alert card
- Calculates visible vs. invisible activities
- Mak offer: "You have [X] hidden gems. Ready to showcase them?"

**Prompt 9: 8×8 Lattice Grid**
- 64 cells rendered as colored boxes
- Color coding: green (energizing) / amber (neutral) / red (draining) / gray (inactive)
- Activity count per cell
- Click cell → modal with all activities in that cell
- Sort options: Most active, Most energizing, Most draining, Recognition gap
- Real-time updates when activities logged

**Prompt 10: Evidence Gallery**
- Carousel or grid of evidence items
- Filters: All, Energizing, Draining, CV-Ready, Invisible
- Click item → sidebar shows details
- Drag item → prepare for Output Studio (future)

### Phase 4: Assessment (A) Page (Week 5)

**Prompt 11: Career Pattern Summary**
- Claude generates pattern name (e.g., "Clinician-Educator with Emerging Systems Leadership")
- Mak explains pattern: "This resonates? Let's build on it."
- Pattern based on: top tracks, energy signals, specialty calibration

**Prompt 12: Strengths & Opportunities**
- Two-column layout
- Strengths (energizing + visible)
- Opportunities (good work, hidden or underutilized)
- Color-coded (green = strength, amber = opportunity, red = risk)

**Prompt 13: Coherence Score & Heatmap**
- Coherence calculation (0-100 scale)
- Interpretation: highly coherent to very scattered
- Annotated lattice overlay (flags, stars, highlights)
- Mak: "Your work tells a unified story. That's strong."

**Prompt 14: Recognition Gap & Goal Alignment**
- What's hidden (research, leadership, teaching)
- Goal progress (checklist, timeline, status)
- Mak suggestions: "Time to close these gaps. Which output first?"

### Phase 5: Plan (P) Page (Week 6)

**Prompt 15: Goal Timeline & Cards**
- 5-year horizontal timeline
- Goal cards (progress bar, status, milestones)
- [Add goal] button → Mak conversation
- Goal editing → Mak asks clarifying questions

**Prompt 16: Suggested Next Steps**
- Mak analyzes activities & gaps
- 3-5 suggestions ("Manuscript ready to submit?")
- [Create goal from this] buttons
- Mak explains reasoning

### Phase 6: Output Studio (O) Page (Weeks 7-8)

**Prompt 17: Template Selection Modal**
- Pre-built templates (9 options)
- [Upload institutional template] button
- Mak recommends based on profile
- On selection → Studio opens with template pre-scoped

**Prompt 18: Three-Column Output Studio**
- **Left panel:** Auto-linked evidence suggestions
  - Evidence items relevant to current section
  - Click to insert into editor
  - [Refresh] button for current section
- **Center panel:** Lexical editor integration
  - Rich text editing (bullets, bold, italics, etc.)
  - Section headers (collapsible)
  - Real-time word count per section
  - Auto-save every 30 seconds
- **Right panel:** Evidence drawer
  - All linked evidence for this document
  - Green checkmark if used
  - Yellow flag if section needs more evidence
  - Click evidence → jump to citation

**Prompt 19: Word Count & Export**
- Per-section word count + guidance
- "You have room for one more paragraph on..."
- Suggestions: [+ Add research collaboration], [+ Add grant leadership]
- Export buttons: Copy, DOCX, PDF, Email
- Version history tracking
- [Restore version] to go back

### Phase 7: Coach Mak Adaptive Behavior (Week 8)

**Prompt 20: Mak Intelligence & Personality**
- Page-specific greetings (changes when page switches)
- Contextual menu options per page
- Conversation flows for each section
- Personality tuning (warm, validating, physician language)
- Smart suggestions based on data
- Celebration on export: "This is going to open doors."

### Phase 8: Testing & Polish (Weeks 9-10)

- Beta testing with 5-10 physicians
- Mobile testing (responsive behavior)
- Edge cases & error handling
- Loading states & empty states
- Security review
- Performance optimization
- Launch

---

## KEY IMPLEMENTATION DETAILS

### Coach Mak Context

Every Mak conversation must maintain:
- **User identity:** Name, specialty, career phase
- **Current page:** So greeting & options are contextual
- **Recent activities:** Last 3-5 logged for context
- **Goals:** Active goals for this month
- **Energy trends:** Last 7 days for pattern recognition
- **Voice data:** Transcribed voice messages stored in Supabase

### Real-Time Updates

When user interacts via Mak or main workspace:
1. Activity logged → OpenAI classifies in background
2. Classification result → Lattice cell updates
3. Cell update → Main workspace re-renders instantly
4. Mak responds to confirm: "Logged: [Activity] | [Energy] | [Visibility]"
5. Evidence gallery adds new item
6. All summaries (coherence, pattern, goals) recalculate

### Responsive Behavior

**Desktop (≥1024px):**
- Full three-tier layout
- Mak panel always visible (320px)
- Main workspace (380px+)

**Tablet (768px-1023px):**
- Sidebar collapses to icon-only (40px)
- Mak panel still docked (240px)
- Main workspace shrinks accordingly

**Mobile (<768px):**
- Icon sidebar (40px) or hamburger
- Mak panel slides in full-screen on icon tap
- Main workspace full width below header
- All components stack vertically

### Voice Input

- Click microphone in Mak input area
- Records for 30 seconds
- "Recording..." timer shows
- Auto-sends on completion or manual stop
- Transcribed via OpenAI Whisper
- Used directly in activity capture or conversation

### Drag & Drop Foundation (Phase 2+)

Current spec supports future enhancement:
- Evidence gallery items have `draggable` attribute
- Main workspace accepts drops
- Drag evidence → Editor inserts citation
- Drag activity → Goal links evidence
- All interactions logged for audit trail

---

## WHAT STAYS THE SAME FROM CANONICAL SPEC

✅ **Database Schema:** 40+ tables, fully specified, no changes  
✅ **API Endpoints:** All Claude/OpenAI integrations identical  
✅ **Formulas & Signals:** Recognition Gap, Lattice Cell Score, Coherence, all the same  
✅ **AI Prompts:** Mak system prompt, OpenAI classification, Claude document parsing—unchanged  
✅ **Privacy Model:** Three-layer (personal/shared/institutional), RLS enforcement, same  
✅ **Design System:** Colors, typography, spacing, all locked in  
✅ **Loveable Build Count:** Still 20 specific prompts (now reorganized by visual tier, not feature)

---

## COMPARISON: FORM-BASED vs. MAK-BASED

### Traditional Form Approach

```
User clicks "Log Activity"
  ↓
Form page loads (form cognitive load)
  ↓
User fills fields:
  - Activity description [text field]
  - Activity type [dropdown]
  - Domain [dropdown]
  - Track [dropdown]
  - Scope [dropdown]
  - Energy [slider]
  - Visibility [radio buttons]
  ↓
User clicks "Submit"
  ↓
Validation errors (if any)
  ↓
Activity logged
  ↓
Page refresh
```

**Friction points:**
- Context switch (from current page to form)
- 7 decisions to make
- Can't ask clarifying questions
- No guidance on why fields matter
- Errors require re-filling

### Mak-Based Approach

```
User clicks voice button (on any page)
  ↓
Mak: "What did you do?" [Open-ended]
  ↓
User: "I led a journal club for residents"
  ↓
Mak: "That's great. How many residents?" [Slot-filling)
  ↓
User: "12 people, about 90 minutes"
  ↓
Mak: "Research or teaching?" [Clarification]
  ↓
User: "Teaching"
  ↓
Mak: "Perfect. Did that feel energizing?"
  ↓
User: "Yes, very"
  ↓
Mak: "Logged: Teaching Journal Club (90 min, 12 residents, Energizing)"
  ↓
Lattice updates instantly
  ↓
No page refresh needed
```

**Advantages:**
- No context switch
- Conversational (feels natural)
- Mak guides user (not user figuring it out)
- Can ask follow-ups
- No errors (Mak asks until confident)
- Instant feedback

---

## DOCUMENT MAP: WHERE EVERYTHING IS

| Document | Purpose | Keep For | Update For |
|----------|---------|----------|-----------|
| FISCMAK_V1_CANONICAL_BUILD_SPEC.md | Backend architecture, schema, formulas | Database setup, API endpoints | None (locked) |
| FISCMAK_VISUAL_ARCHITECTURE_SPEC.md | **NEW** Frontend UX design, three-tier layout, Coach Mak | Loveable build prompts, component specs | Reference for all 20 Loveable prompts |
| FISCMAK_OUTPUT_STUDIO_SPEC.md | Output Studio module (Lexical, templates, export) | Output page build (Prompt 18-19) | None (locked) |
| FISCMAK_SUPABASE_SCHEMA.sql | Database schema | Database initialization | None (locked) |
| FISCMAK_SPECS_PART_2.md | AI prompts, design system, privacy, Loveable build sequence | All builds, all integrations | Update Loveable sequence to match visual-first |
| FISCMAK_BRAND_IDENTITY_GUIDE.md | Brand colors, typography, components | All UI builds | None (locked) |
| FISCMAK_README_MASTER_INDEX.md | Navigation guide | Project overview | Reference visual architecture spec |

---

## NEXT IMMEDIATE STEPS

### For Kp (Product Owner)
1. ✅ Review FISCMAK_VISUAL_ARCHITECTURE_SPEC.md (you are here)
2. ✅ Share with Loveable dev team
3. Schedule kickoff: "Visual-First FISCMAK Build"
4. Confirm Coach Mak personality/tone (provided as baseline)

### For Loveable Dev Team
1. Read FISCMAK_VISUAL_ARCHITECTURE_SPEC.md (this document)
2. Set up Loveable project
3. Create GitHub branch: `feature/visual-first-architecture`
4. Start Prompt 1: Design System & Icon Sidebar
5. Daily: Review updated Mak greetings per page (Phase 7)

### For Backend/Claude Integration
1. Confirm Claude API key ready
2. Prepare test environment for Mak system prompt
3. Test voice-to-text pipeline (OpenAI Whisper)
4. Prepare OpenAI API key for classification

---

## SUCCESS CRITERIA (VISUAL-FIRST BUILD)

✅ Three-tier layout renders correctly (desktop, tablet, mobile)  
✅ Icon sidebar navigation switches pages instantly  
✅ Coach Mak panel always visible, docked on left  
✅ Mak greeting changes per page within 200ms  
✅ Voice input works (30-second recording, auto-send)  
✅ Activity logging via Mak (no forms anywhere)  
✅ Lattice updates in real-time as activities logged  
✅ Output Studio three-column layout works  
✅ All 9 templates generate with pre-scoped evidence  
✅ Export (Copy/DOCX/PDF/Email) works  
✅ Beta testing with 5-10 physicians shows <2% friction on logging/output generation  
✅ All pages responsive (mobile viewport)  
✅ Mobile voice input works on iOS/Android  
✅ Launch with confident UX

---

## FINAL NOTE

This visual-first redesign **makes FISCMAK dramatically easier to use** without changing any business logic, database, or AI integration. The same data flows, same calculations, same outputs—but now collected and displayed in a way that respects physician cognition and time.

**The core insight:** Doctors are busy. Conversations (with Mak) > forms. Visualization > text. Voice > typing.

This spec delivers that.

---

**Status:** READY FOR LOVEABLE BUILD

**Timeline:** 10 weeks  
**Team:** 1-2 Loveable engineers  
**Design:** Complete (visual-first architecture spec)  
**Backend:** Complete (canonical spec)  
**AI Prompts:** Complete (specs Part 2)  
**Brand:** Complete (identity guide)  
**Database:** Complete (Supabase schema)

**All dependencies are met. You can start building today.**


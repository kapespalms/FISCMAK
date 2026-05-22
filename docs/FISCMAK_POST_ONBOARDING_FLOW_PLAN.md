# FISCMAK POST-ONBOARDING UX FLOW: DETAILED PLAN

**Version:** 1.0  
**Status:** Planning Phase  
**Date:** May 22, 2026  
**Focus:** Dashboard as hub + Docked Mak + Conversational options

---

## OVERVIEW: THE NEW PARADIGM

After onboarding completes, user logs in and sees:

```
┌─────────────┬──────────────────────────────────────────────┐
│   SIDEBAR   │                  MAIN WORKSPACE               │
│  (60px)     │                                               │
│             │  DASHBOARD (Default Page)                    │
│ 💬 Mak      │  ════════════════════════════════            │
│ 📊 Icons    │  Good Morning, Dr. Smith.                    │
│ (6 total)   │  How can I help?                             │
│             │                                               │
│             │  [Quick Actions Section]                     │
│             │  ┌─────────────────────────────────────────┐│
│             │  │ ⚡ Capture Invisible Work               ││
│             │  │ 📄 Upload Document                      ││
│             │  │                                         ││
│             │  │ Mak: Discuss Your Energy               ││
│             │  │ Mak: Review Your Activities             ││
│             │  │ Mak: Assess Your Patterns               ││
│             │  │ Mak: Plan Your Strategy                 ││
│             │  │ Mak: Create Your Outputs                ││
│             │  └─────────────────────────────────────────┘│
│             │                                               │
├─────────────┼──────────────────────────────────────────────┤
│ Docked Mak  │                                               │
│ Panel opens │  [Triggered by option click or user action] │
│ here        │                                               │
│ (320px)     │  Chat interface loads                        │
│             │  User & Mak messages                         │
│             │  Input area (text + voice)                  │
│             │  [X] to minimize back to sidebar            │
└─────────────┴──────────────────────────────────────────────┘
```

---

## TIER 1: SIDEBAR BEHAVIOR

### Default State (After Onboarding Login)

```
Width:              60px (icon-only)
Position:           Fixed left
Content:            6 icons
Active State:       Dashboard icon highlighted (default)

Icons (in order):
1. 💬 Mak (always at top)
2. 📊 Dashboard (default selected)
3. 📝 S (Subjective)
4. 📊 O (Objective)
5. 🎯 A (Assessment)
6. 📐 P (Plan)
7. 🚀 O (Output)

Note: 7 icons total (Mak + 6 pages)
```

### Icon Click Behavior

**If clicking a page icon (Dashboard, S, O, A, P, O):**
- Main workspace switches to that page
- Mak panel stays docked on left (unless user closes it)
- Mak greeting updates to match page context
- Conversation history preserved per page

**If clicking Mak icon:**
- If Mak panel is minimized → Expands to 320px docked
- If Mak panel is already open → Minimizes to sidebar (shows only icon)

---

## TIER 2: MAK PANEL BEHAVIOR (NEW DOCKING MODEL)

### Initial State (First Login After Onboarding)

```
Position:           Docked left of main workspace
Width:              320px
Height:             100vh
State:              OPEN (expanded)
Trigger:            Automatic on first post-onboarding login

First Message:
┌─────────────────────────────────────┐
│ Coach Mak                        [X] │
├─────────────────────────────────────┤
│                                     │
│ [Mak avatar/icon]                   │
│                                     │
│ "Good morning, Dr. Smith.           │
│  How can I help today?"             │
│                                     │
│ [Quick action buttons below]        │
│                                     │
└─────────────────────────────────────┘
```

### Mak Panel Header

```
Background:         #5FD65F (FISCMAK green)
Height:             60px
Content:            "Coach Mak" (left) + [X] button (right)
X Button:           Click to minimize panel to sidebar
                    (shows Mak icon only)
```

### Mak Panel Greeting Logic

The greeting **changes based on context**:

**First login of the day:**
```
Time: 5am-12pm   → "Good morning, Dr. Smith."
Time: 12pm-5pm   → "Good afternoon, Dr. Smith."
Time: 5pm-10pm   → "Good evening, Dr. Smith."
Time: 10pm-5am   → "Good evening, Dr. Smith."

Then:
"How can I help today?"
```

**If user has been using for 2+ hours:**
```
"Still going strong! What's next?"
"Taking good notes today. Anything else?"
"You're on a roll. What else can I help with?"
```

**If user hasn't logged in yesterday:**
```
"Welcome back, Dr. Smith. Let's catch up.
 What's been on your mind since last time?"
```

---

## TIER 3: DASHBOARD PAGE (THE HUB)

### Purpose
Central hub after onboarding. Quick access to all major flows. Shows summary of user's current state.

### Layout

```
┌──────────────────────────────────────────────────────────┐
│ DASHBOARD                                                │
│ Updated: Today, 2:47 PM                                 │
├──────────────────────────────────────────────────────────┤
│                                                          │
│ [Quick Stats Summary]                                   │
│ ┌────────────┬────────────┬────────────┬────────────┐  │
│ │ Activities │ This Week: │ Recognition│ Energy     │  │
│ │ Logged     │ Energy 7/10│ Gap       │ Trend      │  │
│ │ 47 total   │            │ 37 hidden │ ↑ +0.3    │  │
│ │            │            │           │            │  │
│ │ ────────── │ ────────── │ ───────── │ ────────── │  │
│ │ [>View all]│ [Activity] │ [Actions] │ [Graph]    │  │
│ └────────────┴────────────┴────────────┴────────────┘  │
│                                                          │
│ [Quick Action Buttons]                                  │
│ ┌──────────────────────────────────────────────────┐   │
│ │ ⚡ Capture Invisible Work                        │   │
│ │    (1-click to log activity via Mak)             │   │
│ │                                                  │   │
│ │ 📄 Upload Document                               │   │
│ │    (CV, dossier, template)                       │   │
│ └──────────────────────────────────────────────────┘   │
│                                                          │
│ [Mak Suggestions - Context-Aware]                       │
│ ┌──────────────────────────────────────────────────┐   │
│ │ "Based on your activity, I'd suggest:"           │   │
│ │                                                  │   │
│ │ [Discuss Your Energy]                            │   │
│ │  (Mak listens + asks about your week)           │   │
│ │                                                  │   │
│ │ [Review Your Activities]                         │   │
│ │  (See what you've logged, flag invisible work)  │   │
│ │                                                  │   │
│ │ [Assess Your Patterns]                           │   │
│ │  (Career pattern analysis, strengths, gaps)     │   │
│ │                                                  │   │
│ │ [Plan Your Strategy]                             │   │
│ │  (Set/update goals, roadmap)                    │   │
│ │                                                  │   │
│ │ [Create Your Outputs]                            │   │
│ │  (Generate CV bullets, promotion narratives)    │   │
│ └──────────────────────────────────────────────────┘   │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

### Quick Stats Section

**Top-left: Activities Logged**
```
Display: 47 (example)
Subtitle: "This week: 12 activities"
Click: Opens Objective page (Activities list)
```

**Top-center: This Week Energy**
```
Display: 7/10
Subtitle: "Trending up (+0.3)"
Click: Opens Subjective page (Energy tracker)
```

**Top-right: Recognition Gap**
```
Display: "37 invisible"
Subtitle: "Out of 47 total"
Click: Opens Objective page (with Recognition Gap filter)
Alert: If gap > 30%, show red flag icon
```

**Far-right: Energy Trend**
```
Display: Mini 7-day line graph
Color: Green if trending up, amber if neutral, red if down
Click: Opens Subjective page (weekly trend detail)
```

---

## QUICK ACTION BUTTONS

### Button 1: Capture Invisible Work

```
Icon:               ⚡ (lightning bolt, energizing)
Text:               "Capture Invisible Work"
Color:              Primary (FISCMAK green #5FD65F)
Size:               Full-width, 48px tall
Subtitle:           "Log an activity in 30 seconds"

On Click:
1. Mak panel expands (if minimized)
2. Mak greeting changes: "Let's make your work visible.
                         What did you just do?"
3. Input area auto-focuses (cursor in text field)
4. Conversation begins (activity capture flow)
5. On completion, confirmation: "Logged! 👍"
6. Mak asks: "Anything else?"
```

### Button 2: Upload Document

```
Icon:               📄 (document)
Text:               "Upload Document"
Color:              Secondary (gray)
Size:               Full-width, 48px tall
Subtitle:           "CV, dossier, template, or PDF"

On Click:
1. Modal opens (file upload dialog)
2. User selects file (drag-drop or file picker)
3. Mak panel shows: "Let me read this. One moment..."
4. Claude processes document in background
5. Mak responds: "I found [X] activities. Want to review?"
6. Shows extracted activities as confirmation
7. User confirms or corrects each one
```

---

## MIGHTIER OPTIONS: THE FIVE MOVER BUTTONS

After quick actions, user sees 5 main options. These **are the SOAP + Output flows**, but framed conversationally:

### Design Strategy

Each option has:
1. **Clear action verb** (Discuss, Review, Assess, Plan, Create)
2. **Clear subject** (Your Energy, Your Activities, Your Patterns, Your Strategy, Your Outputs)
3. **Icon** (visual anchor)
4. **Subtle call-to-action** (tells user what happens)
5. **Mak's personality** (tone matches the action)

### Option 1: Discuss Your Energy

```
Icon:               💭 (thought bubble)
Text:               "Discuss Your Energy"
Subtitle:           "How are you feeling this week?"
Color:              Light green background
Mak Mode:           Listener & Therapist
When Clicked:
  - Mak greeting changes: "How's your energy this week?"
  - Conversational capture of mood, energy, triggers
  - User drags energy slider (0-10), checks mood boxes
  - Mak validates, explores deeper
  - Links to SUBJECTIVE page data
```

### Option 2: Review Your Activities

```
Icon:               📋 (clipboard)
Text:               "Review Your Activities"
Subtitle:           "What have you been doing?"
Color:              Light blue background
Mak Mode:           Documenter & Classifier
When Clicked:
  - Mak greeting: "Let's look at what you've been doing."
  - Shows: Activities logged (this week, this month, all-time)
  - Mak highlights patterns: "I see you do a lot of teaching"
  - Shows recognition gap: "But [X] of this isn't visible"
  - Offers: "Want to make any of these visible?"
  - Links to OBJECTIVE page with activity detail
```

### Option 3: Assess Your Patterns

```
Icon:               🔍 (magnifying glass)
Text:               "Assess Your Patterns"
Subtitle:           "What's your career story?"
Color:              Light purple background
Mak Mode:           Analyst & Coach
When Clicked:
  - Mak greeting: "Let's talk about your patterns."
  - Shows: Career pattern name (generated from data)
  - Example: "Clinician-Educator with Emerging Leadership"
  - Mak explains: "Here's what I'm seeing..."
  - Shows: Strengths, opportunities, coherence score
  - Offers: "Does this feel right? What would you change?"
  - Links to ASSESSMENT page with full analysis
```

### Option 4: Plan Your Strategy

```
Icon:               🗺️ (map)
Text:               "Plan Your Strategy"
Subtitle:           "What's your 5-year path?"
Color:              Light amber background
Mak Mode:           Strategist & Sponsor
When Clicked:
  - Mak greeting: "Let's build your strategy."
  - Shows: Current goals (if any)
  - Mak asks: "What's your next big move?"
  - If no goals: Conversation to create first goal
  - If goals exist: "Want to add another goal or refine these?"
  - Shows: Goal timeline, milestones, evidence needed
  - Links to PLAN page with goal management
```

### Option 5: Create Your Outputs

```
Icon:               ✍️ (writing/pencil)
Text:               "Create Your Outputs"
Subtitle:           "What are we writing today?"
Color:              Light red background
Mak Mode:           Ghostwriter & Sponsor
When Clicked:
  - Mak greeting: "What are we writing today?"
  - Shows: 9 template options
    * Academic Tenure Narrative
    * Annual Performance Review
    * Promotion Narrative
    * Community Impact Summary
    * Industry/Leadership Pitch
    * Career Statement
    * Teaching Philosophy
    * Research Statement
    * [+ Upload Institutional Template]
  - User selects template (or uploads custom)
  - Output Studio opens with pre-scoped evidence
  - Links to OUTPUT page (Lexical editor)
```

---

## MAK PANEL: CONTENT DISPLAY

### Chat Message Area

```
Height:             ~380px (flexible)
Background:         #FAFBFC (light gray)
Message Bubbles:
  - Mak messages:   Left-aligned, green background (#E8F8E8)
  - User messages:  Right-aligned, green background (#5FD65F), white text
  - Font:           14px regular
  - Padding:        12px 16px
  - Border-radius:  8px
  - Max-width:      90% of panel

Scroll:             Auto-scroll to bottom on new message
History:            Show last 10 messages (load more on scroll up)
```

### Input Area

```
Height:             60px (fixed at bottom)
Background:         White with top border (1px #D1D5DB)
Layout:             Flexbox (horizontal)

Text Input:
  - Width:          Flex: 1
  - Height:         40px
  - Border:         1px #D1D5DB
  - Border-radius:  6px
  - Padding:        10px 12px
  - Font:           14px
  - Placeholder:    "Type or click voice..."
  - Focus:          Border becomes #5FD65F (green)

Voice Button:
  - Width:          40px
  - Height:         40px
  - Margin-left:    8px
  - Background:     #5FD65F (green)
  - Color:          White
  - Icon:           Microphone (filled when recording)
  - Border-radius:  6px
  - On click:       Start 30-second voice recording
  - Display:        "Recording... [timer]" during capture
  - On complete:    Auto-send, show transcription in input
```

### Mak Panel Close/Minimize

```
X Button:           Top-right of Mak header
On Click:           
  - Panel collapses to sidebar
  - Shows Mak icon only (in sidebar)
  - Main workspace expands to full width
  - Conversation history preserved
  - User can re-open by clicking Mak icon in sidebar
```

---

## INTERACTION FLOW: COMPLETE EXAMPLE

### User's First Post-Onboarding Login

```
1. User logs in
2. Lands on DASHBOARD page (default)
3. Sidebar shows 7 icons (Mak + 6 pages)
4. Mak panel OPENS AUTOMATICALLY on left (320px)
5. Mak greeting appears:
   
   "Good afternoon, Dr. Chen.
    How can I help?"

6. Dashboard shows:
   - Quick stats (activities, energy, gap, trend)
   - Two quick action buttons (Capture, Upload)
   - Five main option buttons (Discuss, Review, Assess, Plan, Create)

7. User clicks "Capture Invisible Work"
8. Mak says: "Let's make your work visible. What did you do?"
9. User types: "Led clinical rounds with interns"
10. Mak responds: "Nice. How many interns and how long?"
11. User: "8 interns, 90 minutes"
12. Mak: "That's teaching work. Did it feel energizing?"
13. User clicks slider: 8/10
14. Mak: "Logged: Teaching Clinical Rounds (90 min, 8 interns, Energizing) ✓"
15. Lattice updates in background
16. Dashboard updates (activities count +1, energy trend updates)
17. Mak asks: "Anything else?"
18. User: "No, thanks"
19. Mak: "Great. Come back anytime."
```

---

## RESPONSIVE BEHAVIOR (MOBILE)

### Mobile < 768px

**Sidebar:**
- Collapses to hamburger (40px icon only)
- On tap: Slide-out nav

**Mak Panel:**
- Expands to full-screen modal
- Closes with X button
- Takes entire mobile viewport

**Main Workspace:**
- Full width when Mak closed
- Stacks vertically (single column)

**Quick Action Buttons:**
- Stack vertically (full-width)
- 48px height each (touch-friendly)

**Five Main Options:**
- Stack vertically
- Full-width cards
- Touch-friendly padding

---

## STATE MANAGEMENT (FOR LOVEABLE BUILD)

### URL Routing

```
/app/dashboard              → Dashboard page (default)
/app/subjective             → Subjective (S) page
/app/objective              → Objective (O) page
/app/assessment             → Assessment (A) page
/app/plan                   → Plan (P) page
/app/output                 → Output Studio (O) page

Mak panel state is GLOBAL:
- Persists across page navigation
- Closes only when user clicks X
- Conversation history stored per page
```

### Mak Context

Every Mak message needs:
```
{
  currentPage: 'dashboard' | 'subjective' | 'objective' | 'assessment' | 'plan' | 'output',
  makMode: 'listener' | 'documenter' | 'analyst' | 'strategist' | 'ghostwriter',
  conversationHistory: [...last 10 messages per page],
  userContext: {
    name: 'Dr. Chen',
    specialty: 'Pediatrics',
    recentActivities: [...last 5],
    energyTrend: [...last 7 days],
    goals: [...active goals],
    recognitionGap: 37
  }
}
```

### Real-Time Updates

When user interacts (activity logged, energy slider moved, etc.):
```
1. Data sent to backend
2. Processed (OpenAI classification, etc.)
3. Database updated
4. Dashboard stats recalculated
5. Dashboard cards re-render
6. Mak confirms action
7. Conversation continues
```

All in < 3 seconds

---

## SUMMARY: THE NEW FLOW

### After Onboarding Login

**What User Sees:**
1. Sidebar (7 icons: Mak + 6 pages)
2. Mak panel docked on left (always-open, 320px)
3. Dashboard page as default (shows stats + quick actions + 5 options)

**What User Does:**
1. Clicks quick action (Capture / Upload)
   → Mak opens conversation
   → Activity logged
   → Dashboard updates
   → Mak asks "Anything else?"

2. Clicks main option (Discuss / Review / Assess / Plan / Create)
   → Mak greeting changes to match mode
   → Page switches to that section
   → Mak guides conversation
   → Data displayed in main workspace
   → Conversation history preserved

3. Clicks page icon (S, O, A, P, O)
   → Main workspace switches
   → Mak panel stays open
   → Mak greeting updates
   → Same conversation thread continues

4. Clicks X on Mak panel
   → Panel collapses to sidebar
   → Main workspace expands
   → Can re-open by clicking Mak icon

**Cognitive Load:**
- Zero forms
- Zero unclear buttons
- Always-open AI guidance
- Clear conversational flow
- Visual feedback on every action

---

## LOVEABLE BUILD SEQUENCE (UPDATED)

### Phase 1: Dashboard & Mak Foundation (Weeks 1-2)

**Prompt 1: Dashboard Layout**
- Quick stats cards (activities, energy, gap, trend)
- Two quick action buttons
- Five main option buttons
- Responsive grid

**Prompt 2: Mak Panel Docking**
- Docked left panel (320px, 100vh)
- Header with close button [X]
- Chat message display
- Text + voice input
- Auto-minimize on X click
- Auto-expand on Mak icon click

**Prompt 3: Dashboard Button Logic**
- "Capture Invisible Work" → Opens activity capture in Mak
- "Upload Document" → File upload modal
- Five main options → Route to respective pages + update Mak greeting

### Phase 2-6: Pages (S, O, A, P, O)
- Same as before, but now each page loads with Mak panel docked
- Mak greeting changes per page
- Conversation history preserved per page

---

## FILES TO UPDATE

1. FISCMAK_VISUAL_ARCHITECTURE_SPEC.md
   - Add Dashboard page (Section)
   - Update Tier 2 (Mak docking behavior)
   - Add "Post-Onboarding UX Flow" section
   - Update Loveable build sequence

2. COACH_MAK_CONVERSATION_EXAMPLES.md
   - Add Dashboard scenarios
   - Add quick action flows
   - Add five main option greeting changes

3. Create new: DASHBOARD_PAGE_SPEC.md
   - Complete dashboard design
   - Stats cards detail
   - Quick action buttons
   - Five main options
   - Responsive behavior

---

**Status:** PLANNING COMPLETE

Ready to implement? Should we update the visual architecture spec with this refined flow?


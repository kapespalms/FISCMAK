# FISCMAK POST-ONBOARDING UX: EXECUTIVE SUMMARY

**Version:** 1.0  
**Date:** May 22, 2026  
**Status:** REFINED & READY FOR BUILD

---

## THE SHIFT: DASHBOARD-CENTRIC + DOCKED MAK

### Before (Original Visual Architecture)
- Landing on first page (Subjective, Objective, etc.)
- Mak as optional sidebar
- Forms and inputs scattered across pages

### After (Refined UX)
- **Landing on Dashboard** (the hub)
- **Mak always docked** on left (320px, expandable/collapsible)
- **Two quick actions** (Capture, Upload)
- **Five main conversation options** (Discuss, Review, Assess, Plan, Create)
- **Zero forms anywhere**

---

## POST-ONBOARDING FLOW (SIMPLIFIED)

### Step 1: User Logs In
```
→ Lands on DASHBOARD page
→ Sidebar shows 7 icons (Mak + 6 pages)
→ Mak panel OPENS AUTOMATICALLY on left
→ Mak greeting: "Good [morning/afternoon/evening], Dr. [Name].
                  How can I help?"
```

### Step 2: User Sees Dashboard
```
Quick Stats (top):
  • 47 activities logged
  • 7/10 energy this week  
  • 37 invisible (gap alert)
  • Trend graph

Quick Actions:
  • ⚡ Capture Invisible Work
  • 📄 Upload Document

Main Options:
  • 💭 Discuss Your Energy
  • 📋 Review Your Activities
  • 🔍 Assess Your Patterns
  • 🗺️ Plan Your Strategy
  • ✍️ Create Your Outputs
```

### Step 3: User Clicks an Option
```
Example: User clicks "Capture Invisible Work"
  ↓
Mak greeting changes to:
  "Let's make your work visible. What did you do?"
  ↓
User types or speaks activity
  ↓
Mak asks clarifying questions (conversationally)
  ↓
Activity logged, lattice updates
  ↓
Dashboard stats refresh automatically
  ↓
Mak asks: "Anything else?"
```

### Step 4: Or User Clicks a Main Option
```
Example: User clicks "Review Your Activities"
  ↓
Mak greeting changes to:
  "Let's look at what you've been doing."
  ↓
Main workspace switches to OBJECTIVE page
  ↓
Activities list appears in main area
  ↓
Mak in left panel: "I see you logged 47. 
                    37 are invisible. Want to fix that?"
  ↓
User can click activities or stay in Mak conversation
  ↓
Mak guides discovery of hidden work
```

### Step 5: User Navigates Using Icons
```
User clicks 📝 (Subjective) icon
  ↓
Main workspace switches to Subjective page
  ↓
Mak panel stays open (conversation preserved)
  ↓
Mak greeting updates: "How are you feeling?"
  ↓
Energy slider, mood checkboxes appear
  ↓
Conversation continues
```

### Step 6: User Closes Mak Panel
```
User clicks [X] in Mak header
  ↓
Panel collapses to sidebar
  ↓
Mak icon shows in sidebar (pulsing or highlighted)
  ↓
Main workspace expands full width
  ↓
User can still see main page content
  ↓
Click Mak icon to re-open panel
```

---

## KEY DESIGN DECISIONS

### 1. Dashboard is the Hub
- **Why:** Physicians need to see their data at a glance
- **What:** Quick stats + quick actions + conversation options
- **Benefit:** Reduces decision paralysis ("What should I do next?")

### 2. Mak Panel is Always-Docked (Not Drawer)
- **Why:** Conversation should be always available, never hidden
- **How:** Docked to left of workspace (like Slack sidebars)
- **Collapse:** User can minimize to free space, but conversation history is preserved

### 3. Five Main Options (Not 6 Pages)
- **Subjective → "Discuss Your Energy"** (conversational tone)
- **Objective → "Review Your Activities"** (data exploration tone)
- **Assessment → "Assess Your Patterns"** (analytical tone)
- **Plan → "Plan Your Strategy"** (strategic tone)
- **Output → "Create Your Outputs"** (action tone)

**Why:** Each option has a clear **action verb** + **subject** + **subtitle**.
This tells the user exactly what will happen when they click.

### 4. Two Quick Actions (Separate from Main Options)
- **Capture Invisible Work:** 1-click activity logging (most common action)
- **Upload Document:** Import data (less frequent, but important)

**Why:** These are the "working" actions—how data gets into the system.
The five options are the "exploring" and "creating" actions—how data gets used.

### 5. Time-Based Greeting (Not Static)
```
Morning (5am-12pm):     "Good morning, Dr. [Name]."
Afternoon (12pm-5pm):   "Good afternoon, Dr. [Name]."
Evening (5pm-10pm):     "Good evening, Dr. [Name]."
Late night (10pm-5am):  "Good evening, Dr. [Name]."

Then always: "How can I help?"
```

**Variant:** If user has been logged in for 2+ hours:
```
"Still going strong! What's next?"
```

**Variant:** If user hasn't logged in since yesterday:
```
"Welcome back, Dr. [Name]. Let's catch up.
 What's been on your mind?"
```

---

## THE FIVE MAIN OPTIONS: DETAILED BREAKDOWN

### Option 1: Discuss Your Energy (💭)

**Button Color:** Light green  
**Mak Mode:** Listener & Therapist  
**What Happens:**
1. Mak says: "How's your energy this week?"
2. User drags energy slider (0-10)
3. User checks mood boxes
4. Mak asks: "What triggered this?"
5. Conversation deepens
6. Data updates in SUBJECTIVE page (background)
7. Mak validates, celebrates, or offers support

**When to Use:** User wants to process their feelings + track mood

---

### Option 2: Review Your Activities (📋)

**Button Color:** Light blue  
**Mak Mode:** Documenter & Classifier  
**What Happens:**
1. Mak says: "Let's look at what you've been doing."
2. Main workspace switches to OBJECTIVE page
3. Activities list shows (this week, month, all-time)
4. Mak highlights: "I see you do a lot of teaching"
5. Mak alerts: "But [X] of this isn't visible"
6. User clicks activities or stays in Mak convo
7. Mak offers: "Want to make any visible?"

**When to Use:** User wants to see what they've logged + find invisible work

---

### Option 3: Assess Your Patterns (🔍)

**Button Color:** Light purple  
**Mak Mode:** Analyst & Coach  
**What Happens:**
1. Mak says: "Let's talk about your patterns."
2. Main workspace switches to ASSESSMENT page
3. Career pattern name displays (generated from data)
   Example: "Clinician-Educator with Emerging Leadership"
4. Mak explains the pattern in detail
5. Shows: Strengths, opportunities, coherence score
6. Mak asks: "Does this feel right?"
7. User explores deeper or validates

**When to Use:** User wants to understand their career narrative

---

### Option 4: Plan Your Strategy (🗺️)

**Button Color:** Light amber  
**Mak Mode:** Strategist & Sponsor  
**What Happens:**
1. Mak says: "Let's build your strategy."
2. Main workspace switches to PLAN page
3. Goal timeline displays (5-year view)
4. Mak asks: "What's your next big move?"
5. If no goals: Conversation to create first goal
6. If goals exist: "Want to add or refine?"
7. Shows: Goal timeline, milestones, evidence needed
8. Mak helps prioritize

**When to Use:** User wants to set/refine career goals

---

### Option 5: Create Your Outputs (✍️)

**Button Color:** Light red  
**Mak Mode:** Ghostwriter & Sponsor  
**What Happens:**
1. Mak says: "What are we writing today?"
2. Shows 9 template options (modal)
   - Academic Tenure Narrative
   - Annual Performance Review
   - Promotion Narrative
   - Community Impact Summary
   - Industry/Leadership Pitch
   - Career Statement
   - Teaching Philosophy
   - Research Statement
   - + Upload Institutional Template
3. User selects template (or uploads custom)
4. Main workspace switches to OUTPUT page
5. Output Studio opens (three-column layout)
6. Lexical editor pre-scoped with relevant evidence
7. Mak in sidebar: "Let's build your case."

**When to Use:** User wants to generate career documents

---

## MAK PANEL BEHAVIOR: DETAILED

### Docking Model

**Normal State:**
```
Sidebar (60px) | Mak Panel (320px) | Main Workspace (Flexible)
               |                    |
               | Chat area         | Dashboard/Page content
               | Input area        |
               | [X] to minimize   |
```

**Minimized State:**
```
Sidebar (60px + Mak icon) | Main Workspace (Full width)
                          |
Mak icon pulsing (shows  | Page content
there's an active chat)  |
```

### Close/Open Behavior

**Click [X] in Mak header:**
- Panel collapses to sidebar
- Conversation history is **preserved** (not deleted)
- Main workspace expands to full width
- Mak icon shows in sidebar (with visual indicator of active chat)

**Click Mak icon in sidebar:**
- If panel was minimized: Expands to 320px docked
- If panel was already open: Keeps open (no toggle)
- Conversation history loads
- Same message thread continues

### Conversation Persistence Per Page

**Conversation is tied to the page:**
```
User on DASHBOARD, chats with Mak
  ↓
User clicks "Review Your Activities"
  ↓
Switches to OBJECTIVE page
  ↓
Mak greeting changes (but conversation history preserved)
  ↓
User can scroll up to see previous Objective-page messages
  ↓
Click DASHBOARD icon
  ↓
Switches back to Dashboard
  ↓
Mak greeting changes back
  ↓
Previous Dashboard conversation is still there
```

**Database structure:**
```
conversations {
  id
  user_id
  page: 'dashboard' | 'subjective' | 'objective' | 'assessment' | 'plan' | 'output'
  messages: [...]
  timestamp
}
```

---

## RESPONSIVE BEHAVIOR (MOBILE)

### Mobile < 768px

**Sidebar:**
- Collapses to hamburger menu (40px icon)
- Tap to slide-out nav (overlay)

**Mak Panel:**
- Becomes full-screen modal
- 100% width, 100% height
- [X] button to close (returns to main workspace)
- Tap to open (if minimized)

**Main Workspace:**
- Full width when Mak closed
- Single-column layout
- Stacked vertically (no grid)

**Dashboard Buttons:**
- Stack vertically (full-width)
- 48px minimum height (touch-friendly)
- Two-column grid → one column on mobile

---

## IMPLEMENTATION NOTES FOR LOVEABLE

### Prompt Sequence

**Week 1-2: Dashboard + Mak Foundation**

1. **Dashboard Layout**
   - Build quick stats cards
   - Two quick action buttons (Capture, Upload)
   - Five main option buttons (Discuss, Review, Assess, Plan, Create)
   - Responsive grid
   - Stats update in real-time

2. **Mak Panel Docking**
   - Docked panel (fixed position, left of workspace)
   - Header with close [X] button
   - Chat message display
   - Text + voice input area
   - Auto-expand/collapse on icon clicks
   - Conversation history per page
   - Local storage of conversation

3. **Dashboard Button Logic**
   - "Capture Invisible Work" → Focuses Mak input, greeting changes
   - "Upload Document" → Opens file modal, Mak says "reading...", processes document
   - Five main options → Route to respective pages, update Mak greeting

**Weeks 3-7: Pages (S, O, A, P, O)**
- Each page loads with Mak panel docked
- Mak greeting changes per page
- Conversation history preserved when switching pages
- Page content interactive (sliders, buttons, clicks)

**Week 8: Mak Personality**
- Finalize Mak greetings for each page
- Conversation flows for each option
- Personality tone tuning

---

## DASHBOARD STATS: REAL-TIME CALCULATION

### Activities Logged
```
SELECT COUNT(*) FROM activity_entries
WHERE user_id = [current_user]
Display as: "47 total" + "This week: 12"
Update trigger: When new activity logged
```

### Energy This Week
```
SELECT AVG(energy_level) FROM mood_signals
WHERE user_id = [current_user]
AND date >= (TODAY - 7 days)
Display as: "7/10" with trend arrow (+0.3)
Update trigger: When energy slider moved
```

### Recognition Gap
```
invisible_count = (
  SELECT COUNT(*) FROM activity_entries
  WHERE visibility_status NOT IN ('cv_ready', 'documented')
)
gap = invisible_count / total_count * 100
Display as: "37 hidden" + "Gap alert" if gap > 50%
Update trigger: When activity visibility changed
```

### Energy Trend Graph
```
SELECT DATE, AVG(energy_level)
FROM mood_signals
WHERE user_id = [current_user]
AND date >= (TODAY - 7 days)
GROUP BY DATE
Display as: Mini 7-day line chart
Color: Green if trending up, amber if flat, red if down
Update trigger: Real-time as new mood data logged
```

---

## SUCCESS CRITERIA

✅ Dashboard loads as default page post-onboarding  
✅ Mak panel opens automatically on login  
✅ Greeting shows correct time-of-day + user name  
✅ Two quick action buttons work (Capture, Upload)  
✅ Five main options route correctly + update Mak greeting  
✅ Clicking page icon switches workspace + preserves Mak convo  
✅ Clicking [X] minimizes Mak panel without losing conversation  
✅ Stats update in real-time when data changes  
✅ Mobile responsive (hamburger nav, full-screen Mak)  
✅ Conversation history preserved per page  
✅ All 5 Mak modes work (listener, documenter, analyst, strategist, ghostwriter)  

---

## FINAL STRUCTURE

### Layout (Desktop)
```
60px Sidebar | 320px Mak Panel | Flexible Main Workspace
             |                  |
7 icons      | Chat messages    | Dashboard content
             | Input area       | (or S/O/A/P/O page)
             | [X] to close    |
```

### Default Navigation
```
On Login:
  Route to /app/dashboard
  Open Mak panel
  Show greeting: "Good [time], Dr. [Name]. How can I help?"

On Icon Click:
  Route to /app/[page]
  Mak panel stays open
  Greeting updates
  Conversation history loads

On Mak Close [X]:
  Mak panel collapses
  Workspace expands
  Icon shows in sidebar (indicator)

On Mak Icon Click:
  Mak panel expands
  Conversation resumes
```

---

## NEXT STEPS

1. ✅ Approve refined flow (you're here)
2. Update FISCMAK_VISUAL_ARCHITECTURE_SPEC.md with:
   - Dashboard page specification
   - Mak docking behavior (detailed)
   - Five main options (detailed)
   - Post-onboarding flow diagram
3. Create DASHBOARD_PAGE_SPEC.md (standalone)
4. Update Loveable build sequence (3 new prompts for dashboard + mak)
5. Start Prompt 1: Dashboard Layout
6. Start Prompt 2: Mak Panel Docking
7. Start Prompt 3: Dashboard Button Logic

---

**Status:** ✅ PLANNING COMPLETE & APPROVED

Ready to build the first dashboard + Mak docking prompts? 


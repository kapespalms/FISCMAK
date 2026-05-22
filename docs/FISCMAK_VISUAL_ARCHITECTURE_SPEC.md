# FISCMAK VISUAL ARCHITECTURE SPECIFICATION

**Version:** 1.0  
**Status:** NEW - Visual-First Redesign  
**Generated:** May 22, 2026  
**Owner:** Kp  
**Focus:** Three-Tier Layout + Coach Mak Navigation + Low-Cognitive Drag & Drop

---

## EXECUTIVE SUMMARY

FISCMAK's UX is now built around a **Three-Tier Visual Architecture** where:

1. **Tier 1 (Left Icon Bar):** Minimalist sidebar with 6 navigation icons (Mak, Subjective, Objective, Assessment, Plan, Output)
2. **Tier 2 (Coach Mak Panel):** Always-open conversational AI interface that intelligently adapts to each section
3. **Tier 3 (Main Workspace):** Dense data visualizations, grids, editors, and galleries

**Key Principle:** Reduce cognitive load by having Coach Mak guide all major user decisions through conversation, then visually display those choices in the main workspace.

**Example:** 
- User clicks `🚀 Output Studio` 
- Coach Mak immediately appears with "What's your output goal today?" 
- Shows 3 options: "Academic Tenure", "Annual Review", "Industry Pitch"
- User selects one (visually or through Mak)
- Main workspace displays the Output Studio interface pre-scoped to that choice
- Further refinements happen through nested Mak menus (not form fields)

---

## TIER 1: ICON SIDEBAR (MINIMALIST LEFT NAV)

### Design Specifications

```
Width:              60px (icon-only on desktop, expandable on mobile)
Height:             100vh (full viewport height)
Background:         #FFFFFF (white)
Border:             1px right #D1D5DB (subtle gray border)
Position:           Fixed, left: 0
Z-index:            1000
```

### Navigation Icons (6 Total)

```
Icon Set:           Material Design (or similar clean set)
Size:               32px × 32px (centered in 60px width)
Color (Default):    #4B5563 (neutral gray)
Color (Active):     #5FD65F (FISCMAK green)
Color (Hover):      #5FD65F with background #E8F8E8
Transition:         200ms ease
Tooltip:            Show on hover (right-side pop, light gray background)
```

### Icon Order (Top to Bottom)

```
1. 💬 MAK        → Coach Mak (always visible, click to toggle panel width)
   ID: nav-mak
   Label: "Coach Mak"
   
2. 📝 SUBJECTIVE → S (Subjective: Mood, Energy, Values, Burnout)
   ID: nav-subjective
   Label: "Subjective"
   
3. 📊 OBJECTIVE  → O (Objective: Activities, Lattice, Evidence)
   ID: nav-objective
   Label: "Objective"
   
4. 🎯 ASSESSMENT → A (Assessment: Patterns, Signals, Goals)
   ID: nav-assessment
   Label: "Assessment"
   
5. 📐 PLAN       → P (Plan: Outputs, Strategy, Roadmap)
   ID: nav-plan
   Label: "Plan"
   
6. 🚀 OUTPUT     → O (Output: Studio, Templates, Export)
   ID: nav-output
   Label: "Output Studio"
```

### Icon Behavior

**Active State:**
- Border-left: 4px #5FD65F (green accent)
- Background: #F9FAFB (very light gray)
- Icon: Turns green (#5FD65F)

**Hover State (non-active):**
- Background: #E8F8E8 (light green)
- Icon color: #5FD65F (green)

**Mobile (< 768px):**
- Sidebar collapses to icons only
- On icon tap: Slide panel from left (hamburger-style)
- Mak panel stays docked if user wants it

---

## TIER 2: COACH MAK PANEL (ALWAYS-OPEN CONVERSATIONAL AI)

### Design Specifications

```
Width:              320px (default, resizable to 240px-450px)
Height:             100vh (full viewport height, minus footer)
Position:           Fixed, left: 60px
Background:         White (#FFFFFF)
Border:             1px right #D1D5DB (subtle gray)
Z-index:            950 (below nav, above main content)
Overflow:           Auto (scrollable)
```

### Panel Sections

#### Header (Top Fixed, 60px)
```
Background:         #5FD65F (FISCMAK green)
Text:               "Coach Mak"
Font:               18px, 600 semibold, white
Padding:            16px
Icon:               Small Mak avatar (optional, left side)
Close Button:       X (top-right, minimizes to collapsed state)
```

**Collapsed State:**
- Width: 60px (overlaps main content?)
- Actually, clicking X on Mak closes it; clicking Mak icon opens it again
- Or: minimize to icon-only on sidebar (better UX)

#### Chat Area (Scrollable Main Section)
```
Padding:            16px
Background:         #FAFBFC (very light gray, warmer than white)
Message bubbles:    
  - Mak messages: Left-aligned, #E8F8E8 (light green background)
  - User messages: Right-aligned, #5FD65F (green background, white text)
  - Font: 14px, line-height 1.5
  - Padding: 12px 16px
  - Border-radius: 8px
  - Max-width: 90% of panel
```

#### Input Area (Bottom Fixed, 60px)
```
Background:         White with top border #D1D5DB
Padding:            12px
Flex layout:        Input field + Voice button

Input field:
  - Flex: 1
  - Height: 40px
  - Border: 1px #D1D5DB
  - Border-radius: 6px
  - Padding: 10px 12px
  - Font: 14px
  - Placeholder: "Type or click voice..."
  - Focus: Border becomes #5FD65F
  
Voice button:
  - Width: 40px
  - Height: 40px
  - Margin-left: 8px
  - Background: #5FD65F
  - Color: White
  - Border-radius: 6px
  - Icon: Microphone (filled when recording, outline when ready)
  - On click: Start 30-second voice recording
  - Display: "Recording..." timer
  - On release: Auto-send, disable input during processing
```

### Coach Mak's Adaptive Behavior

Coach Mak changes tone, questions, and options based on the active page:

#### When User Opens MAK Panel (Standalone)
```
Greeting:           "Hi there! What's on your mind today?"
Options:            
  - "Log an activity"
  - "Tell me about your week"
  - "Review my energy signals"
  - "Help me find my patterns"
  
Mak Mode:           Listener/Coach (open-ended, exploratory)
Interaction:        Conversational, 3-5 turns to gather context
Output:             Suggests which section to visit next
```

#### When User is in SUBJECTIVE (S)
```
Context:            Mood, energy, values, burnout
Greeting:           "How are you feeling today?"
Menu options:       
  - "I'm energized"
  - "I'm drained"
  - "I'm balanced"
  - (Follow-up: Specific questions about the day)
  
Mak Mode:           Listener/Therapist
Data Collection:    
  - Energy signals (0-10 scale, conversationally)
  - Triggers (what made you feel this way)
  - Burnout indicators (hidden scoring)
  - Values alignment (does this match your goals?)
  
Visual Display:     Main panel shows mood tracker, energy gauge, value alignment
```

#### When User is in OBJECTIVE (O)
```
Context:            Activities, lattice, evidence
Greeting:           "What did you accomplish this week?"
Menu options:       
  - "Log new activity"
  - "Upload a document"
  - "Review my lattice"
  - "Find invisible work"
  
Mak Mode:           Classifier/Documenter
Data Collection:    
  - Activity type (clinical, research, teaching, admin, etc.)
  - Scope (individual, team, department, institution)
  - Energy signal for this activity
  - How visible is this work?
  
Interaction:        Conversational activity capture (not forms)
Visual Display:     Lattice updates in real-time as activities logged
```

#### When User is in ASSESSMENT (A)
```
Context:            Patterns, signals, goals
Greeting:           "What patterns are you noticing?"
Menu options:       
  - "Show my strengths"
  - "Show my blind spots"
  - "What's my career pattern?"
  - "What's draining me?"
  
Mak Mode:           Analyst/Coach
Data Presentation:  
  - Career pattern summary
  - Recognition gaps
  - Coherence score
  - Energy signal trends
  - Specialty-adjusted strengths
  
Interaction:        Mak highlights patterns, user explores further
Visual Display:     Lattice with heatmap, pattern label, goal alignment
```

#### When User is in PLAN (P)
```
Context:            Outputs, strategy, roadmap
Greeting:           "Where do you want to take your career?"
Menu options:       
  - "Generate outputs"
  - "Plan my next move"
  - "Track my progress"
  - "Get promotion ready"
  
Mak Mode:           Sponsor/Strategist
Data Collection:    
  - Career aspiration
  - Timeline
  - What evidence do you need?
  - Institutional constraints
  
Interaction:        Mak helps user articulate strategy
Visual Display:     Goal interface, output suggestions, evidence needs
```

#### When User is in OUTPUT (O)
```
Context:            Output Studio, templates, export
Greeting:           "What are we writing today?"
Menu options:       
  - "Academic tenure"
  - "Annual performance review"
  - "Promotion narrative"
  - "Community health impact"
  - "Industry pitch"
  - "Institutional template"
  
Mak Mode:           Ghostwriter/Sponsor
Interaction:        User selects output type → Mak asks 2-3 clarifying questions → Studio loads pre-scoped
Data Used:          Relevant evidence from lattice
Visual Display:     Output Studio opens with pre-populated template + evidence drawer
```

### Coach Mak's Voice & Personality (Always)

**Tone:**
- Warm, conversational, validating
- Uses physician language (not clinical jargon, not HR speak)
- Asks permission: "Can I ask you something?"
- Celebrates small wins: "That's great work on..."
- Validates struggle: "That sounds exhausting..."

**Patterns:**
- Always listens first, suggests later
- Never judges energizing vs. draining (all valid)
- Focuses on visibility & recognition (not productivity)
- Builds toward identity: "So you're a..."
- Connects back to goals: "This aligns with your..."

**Never:**
- Pushes productivity metrics
- Compares to peers
- Uses corporate jargon
- Assumes anything about the user
- Forces form-filling

---

## TIER 3: MAIN WORKSPACE

### Layout Specifications

```
Position:           Left: 60px (nav) + 320px (Mak panel) = 380px from left
Top:                0px
Right:              0px
Bottom:             0px
Height:             100vh
Background:         #FAFBFC (very light gray, subtle)
Padding:            24px
Overflow:           Auto
```

### Page Sections (SOAP)

---

## PAGE 1: SUBJECTIVE (S)

### Purpose
Capture and visualize mood, energy signals, burnout indicators, and value alignment.

### Visual Layout

```
┌─────────────────────────────────────┐
│ SUBJECTIVE: HOW YOU'RE FEELING       │
│ Updated: Today, 3:45 PM             │
├─────────────────────────────────────┤
│                                     │
│  [Mood Tracker Card]                │
│  ┌─────────────────────────────────┐│
│  │ Today's Energy Level:           ││
│  │                                 ││
│  │ 😴 Drained    😐 Neutral    😊 Energized
│  │  ←──────●──────────────────→   ││
│  │    2/10                   8/10   ││
│  │                                 ││
│  │ Today I felt:                  ││
│  │ ☑ Energized by patient care   ││
│  │ ☑ Drained by admin            ││
│  │ ☐ Challenged by research      ││
│  │ ☐ Fulfilled by teaching       ││
│  └─────────────────────────────────┘│
│                                     │
│  [Burnout Indicators Card]          │
│  ┌─────────────────────────────────┐│
│  │ Burnout Signal Tracking:        ││
│  │                                 ││
│  │ Emotional Exhaustion: ████░  60%││
│  │ Depersonalization:    ██░░  20% ││
│  │ Reduced Efficacy:     ████░  70%││
│  │                                 ││
│  │ 🔴 Alert: Burnout rising       ││
│  │ Recommend: Deep work block?    ││
│  └─────────────────────────────────┘│
│                                     │
│  [Value Alignment Card]             │
│  ┌─────────────────────────────────┐│
│  │ How aligned with your goals?    ││
│  │                                 ││
│  │ Teaching students:    ████████  ││
│  │ Direct patient care:  ██████░░  ││
│  │ Research innovation:  ███░░░░░░ ││
│  │ Leadership:           ████░░░░░ ││
│  │                                 ││
│  │ Your top priority: "Teaching" ││
│  │ Actual % of time:     35%      ││
│  │ Desired % of time:    50%      ││
│  │ Gap:                  -15%     ││
│  └─────────────────────────────────┘│
│                                     │
│  [Weekly Trend Graph]               │
│  ┌─────────────────────────────────┐│
│  │ Energy Trend (Last 7 Days)      ││
│  │                                 ││
│  │  8  ╭─╮           ╭─╮           ││
│  │  6  ╰─╲    ╭─╮   ╱ ╰─           ││
│  │  4      ╰──╯ ╰───╯              ││
│  │  2                               ││
│  │      M  T  W  T  F  S  Su      ││
│  │                                 ││
│  │ Low: Wed (2/10) → Admin heavy  ││
│  │ High: Fri (8/10) → Teaching    ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

### Components

#### Energy Level Slider
```
Type:               Interactive slider (0-10)
Visual:             Gradient bar from red (#DC2626) → amber (#D97706) → green (#5FD65F)
Interaction:        Drag to set, or click number; auto-saves
Display:            "You've been at [X/10] this week on average"
Linked to Mak:      "Let's understand what brings you to [X]..."
```

#### Burnout Indicators (Hidden Scoring)
```
Calculated from:    
  - Energy levels (daily average)
  - Energy variance (high swings = stress)
  - Frequency of "draining" activities
  - User's stated burnout concerns in Mak
  
Display:            Three progress bars (Maslach MBI dimensions)
  - Emotional Exhaustion
  - Depersonalization
  - Reduced Professional Efficacy
  
Thresholds:         
  - Green (< 25%):  Healthy
  - Amber (25-50%): Monitor
  - Red (> 50%):    Alert
  
Action:             If red, Mak suggests immediate deep work or reflection
```

#### Value Alignment
```
Based on:           User's stated goals (from profile) + activity logging
Shows:              
  - Goal (e.g., "Teaching students")
  - Current % of time spent
  - Desired % of time
  - Gap (positive or negative)
  
Visualization:      Horizontal bars with color coding
  - Green if actual > desired (you're overweighting this)
  - Red if actual < desired (opportunity to rebalance)
  - Gray if balanced
  
Interaction:        Click a goal → See all activities supporting it
```

#### Weekly Trend Graph
```
Type:               Line chart, last 7 days
X-axis:             Days of week
Y-axis:             Energy level (0-10)
Line color:         #5FD65F (green)
Hover tooltip:      "Wed, May 22: Energy 2/10 (Admin heavy, 6 hrs meetings)"
Interactive:        Click a day → See what activities happened
```

### User Actions on Subjective Page

1. **Adjust energy slider** → Updates trend, triggers Mak prompt: "Something happened to your energy. What was going on?"
2. **Log a mood trigger** (checkboxes) → Mak follows up: "You said you were energized by patient care. Tell me about a specific moment."
3. **View burnout alert** → Mak offers: "I'm seeing some burnout signals. Want to talk about it, or schedule a deep work block?"
4. **Click on a goal** → Main panel shows activities supporting that goal; Mak suggests: "You're making real progress on teaching—want to formalize it?"

---

## PAGE 2: OBJECTIVE (O)

### Purpose
Log activities, upload documents, visualize the 8×8 lattice, review evidence.

### Visual Layout

```
┌─────────────────────────────────────┐
│ OBJECTIVE: YOUR WORK                │
│ 47 activities logged | 8 weeks      │
├─────────────────────────────────────┤
│                                     │
│  [Activity Capture Card] (Top)      │
│  ┌─────────────────────────────────┐│
│  │ Quick Log                       ││
│  │ ┌─────────────┬──────────────┐  ││
│  │ │ What did    │ 🎤 (Record)  │  ││
│  │ │ you do?     │              │  ││
│  │ │             │ ⌨️  (Type)   │  ││
│  │ └─────────────┴──────────────┘  ││
│  │                                 ││
│  │ [Upload Document] [View Guide]  ││
│  └─────────────────────────────────┘│
│                                     │
│  [Recognition Gap Alert] (If applicable)
│  ┌─────────────────────────────────┐│
│  │ ⚠️  37 activities are invisible  ││
│  │                                 ││
│  │ You've logged 47 total:         ││
│  │ ✅ Documented/visible: 10      ││
│  │ ❓ Invisible work:        37      ││
│  │                                 ││
│  │ Mak's insight: "Your research is world-class
│  │ but no one knows it. Let's fix that."
│  │                                 ││
│  │ [Generate CV bullets] [Review Evidence]
│  └─────────────────────────────────┘│
│                                     │
│  [8×8 Lattice Grid] (Main Content)  │
│  ┌─────────────────────────────────┐│
│  │ CAREER LATTICE                  ││
│  │ (8 domains × 8 tracks)          ││
│  │                                 ││
│  │ Each cell shows:                ││
│  │  - Activity count               ││
│  │  - Energy signal (color)        ││
│  │  - Recent activity preview      ││
│  │                                 ││
│  │ Color coding:                   ││
│  │ 🟢 Green:  Energizing           ││
│  │ 🟡 Amber:  Neutral              ││
│  │ 🔴 Red:    Draining             ││
│  │ ⚪ Light:   Inactive             ││
│  │                                 ││
│  │ [Lattice rendered here]         ││
│  │                                 ││
│  │ Sorting options:                ││
│  │ [Most Active] [Most Energizing] ││
│  │ [Most Draining] [Recognition Gap]
│  └─────────────────────────────────┘│
│                                     │
│  [Evidence Gallery] (Collapsible)   │
│  ┌─────────────────────────────────┐│
│  │ All Evidence (47 items)         ││
│  │ Filter: [All] [Energizing] ...  ││
│  │                                 ││
│  │ [Evidence item 1] [Evidence 2] [3]
│  │ [Evidence item 4] [Evidence 5] [6]
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

### Components

#### Activity Capture Card (Top, Always Visible)
```
Type:               Quick input form (text or voice)
Text input:         Placeholder "What did you do? (be specific)"
Voice button:       Microphone icon, click to record 30 seconds
Guide link:         "Examples of great activity descriptions"

On submit:
  1. Stores raw_text in activity_entries
  2. Mak immediately responds: "Tell me more. What made that [activity] meaningful?"
  3. User answers → Second activity capture turn (scope, energy, visibility)
  4. System classifies in background (OpenAI)
  5. Shows confirmation: "Logged: [Activity] in [Domain]-[Track] cell"
  6. Lattice updates in real-time
  7. Mak: "This is [energizing/draining]. How visible is this in your CV?"
```

#### Recognition Gap Alert (Conditional)
```
Shows when:         (Total activities - Documented activities) > 10
Display:            Card with warning icon
Message:            "You have [X] invisible work. This is important."
Call-to-action:     "Let's find the gems"
On click:           
  - Mak mode: "I'm seeing amazing things you're not getting credit for."
  - Filters Objective page to show invisible activities
  - Mak helps user decide what to promote to "CV-ready"
```

#### 8×8 Lattice Grid
```
Structure:          8 columns (domains) × 8 rows (tracks)
Size:               Responsive, ~600px × 600px on desktop
Cell size:          ~75px × 75px each
Cell content:       
  - Activity count (large number, centered)
  - Energy signal (color fill, semi-transparent)
  - Hover tooltip: "[X] activities | 60% energizing | Recent: [activity name]"

Cell colors:
  - Energizing (10+ activities, mostly green): #5FD65F, opacity 1.0
  - Neutral (5-10 activities, mixed): #D97706, opacity 0.8
  - Draining (10+ activities, red): #DC2626, opacity 1.0
  - Inactive (0-1 activities): #F9FAFB, opacity 0.3

Interaction:
  - Click cell → Modal shows all activities in that cell
  - Sort by: Most active, Most energizing, Most draining, Recognition gap
  - Hover → Tooltip shows brief stats
  - Optional: Animate cell transitions when new activity logged
```

#### Evidence Gallery (Collapsed by Default)
```
Type:               Carousel or grid of evidence items
Filter buttons:     All | Energizing | Draining | CV-Ready | Invisible
Display:            
  - Card per evidence item
  - Title, summary, activity type, date range
  - Energy signal (colored dot)
  - Visibility status (icon)
  
On click evidence item:
  - Sidebar shows full details
  - Mak suggests: "This is perfect for your tenure case. Want to use it?"
```

### User Actions on Objective Page

1. **Log activity via voice/text** → Mak captures classification → Lattice updates
2. **Click a lattice cell** → Modal shows all activities in that cell; user can review/correct
3. **See recognition gap alert** → Mak offers: "You have [X] invisible activities. Let's make you visible."
4. **Upload a document** → Claude parses; system extracts activities; user reviews
5. **Sort lattice by draining** → See where burnout is concentrated; Mak asks: "Want to change this?"

---

## PAGE 3: ASSESSMENT (A)

### Purpose
Analyze patterns, identify strengths and blind spots, understand career trajectory.

### Visual Layout

```
┌─────────────────────────────────────┐
│ ASSESSMENT: YOUR PATTERNS            │
│ Career Phase: Mid-Career Attending   │
│ Career State: Expansion              │
├─────────────────────────────────────┤
│                                     │
│  [Career Pattern Summary Card]      │
│  ┌─────────────────────────────────┐│
│  │ YOUR CAREER PATTERN             ││
│  │                                 ││
│  │ "Clinician-Educator with       ││
│  │ Emerging Systems Leadership"    ││
│  │                                 ││
│  │ Generated from: 47 activities,  ││
│  │ energy signals, identity claims ││
│  │                                 ││
│  │ Mak's analysis:                 ││
│  │ "You're building a strong      ││
│  │ teaching practice while gaining ││
│  │ institutional influence. The    ││
│  │ challenge: your research is     ││
│  │ hidden. Time to change that."   ││
│  │                                 ││
│  │ [View full analysis]            ││
│  └─────────────────────────────────┘│
│                                     │
│  [Strengths & Opportunities] (Side-by-side)
│  ┌─────────────┬───────────────────┐│
│  │ STRENGTHS   │ OPPORTUNITIES     ││
│  │             │                   ││
│  │ 🟢 Teaching │ 🟡 Research       ││
│  │ (30% time,  │ (isolated, not    ││
│  │ energizing) │ visible, but      ││
│  │             │ strong evidence)  ││
│  │ 🟢 Patient  │                   ││
│  │ care        │ 🟡 Leadership     ││
│  │ (clinical   │ (emerging, needs  ││
│  │ excellence) │ positioning)      ││
│  │             │                   ││
│  │ 🟢 Systems  │ 🟡 Collaboration ││
│  │ thinking    │ (strong but       ││
│  │ (visible in │ undervalued)      ││
│  │ committees) │                   ││
│  │             │                   ││
│  └─────────────┴───────────────────┘│
│                                     │
│  [Lattice Heatmap Reloaded]         │
│  ┌─────────────────────────────────┐│
│  │ (Same 8×8 lattice from O,       ││
│  │  but with annotations:           ││
│  │  - Red flag icons on draining    ││
│  │  - Star icons on energizing      ││
│  │  - Highlight on opportunities   ││
│  │  - Mark blind spots)             ││
│  │                                 ││
│  │ [Lattice with overlays]         ││
│  └─────────────────────────────────┘│
│                                     │
│  [Coherence Score]                  │
│  ┌─────────────────────────────────┐│
│  │ How coherent is your career?    ││
│  │                                 ││
│  │ Coherence Score: 72/100        ││
│  │ ████████░░░░░░░░░░░░░░░░       ││
│  │                                 ││
│  │ What this means:                ││
│  │ "Your work hangs together well. ││
│  │ 7/8 of your top tracks align   ││
│  │ with your stated identity."     ││
│  │                                 ││
│  │ Gap: Research is scattered      ││
│  │ across 4 domains instead of     ││
│  │ concentrated. Opportunity for   ││
│  │ focus?"                         ││
│  └─────────────────────────────────┘│
│                                     │
│  [Recognition Gap Analysis]         │
│  ┌─────────────────────────────────┐│
│  │ What you've hidden:             ││
│  │                                 ││
│  │ 🔴 Research (5 papers) → 0 CV  ││
│  │ 🔴 Leadership (3 committees)    ││
│  │    → 1 bullet               ││
│  │ 🟡 Teaching (30% time) →  ││
│  │    scattered bullets            ││
│  │                                 ││
│  │ [Generate outputs to close gaps]││
│  └─────────────────────────────────┘│
│                                     │
│  [Goal Alignment]                   │
│  ┌─────────────────────────────────┐│
│  │ Are you tracking toward your    ││
│  │ career goals?                   ││
│  │                                 ││
│  │ Goal: "Achieve full Professor"  ││
│  │ Timeline: 5 years               ││
│  │ Progress: On track ✓            ││
│  │                                 ││
│  │ What's needed:                  ││
│  │ ☑ Research productivity (4-5    ││
│  │   more papers)                  ││
│  │ ☑ Teaching excellence (awards)  ││
│  │ ☑ Service leadership (chair     ││
│  │   committee)                    ││
│  │                                 ││
│  │ [View detailed roadmap]         ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

### Components

#### Career Pattern Summary
```
Generated from:     
  - Top 3 tracks (by % of total activities)
  - Energy signals (mostly energizing, mixed, or draining)
  - Specialty calibration
  - User identity claims from Mak conversations

Format:            2-3 word phrase + explanation
Examples:
  - "Clinician-Educator with Emerging Systems Leadership"
  - "Research-Focused Clinician with Teaching Excellence"
  - "Emerging Clinician-Leader with Burnout Risk"
  
Mak's role:        Explains the pattern in human terms
```

#### Strengths & Opportunities
```
Structure:         Two-column layout
Left (Strengths):  What's working, energizing, visible
Right (Opportunities): What's hidden, underutilized, needs elevation

Each item shows:
  - Activity type (Teaching, Research, etc.)
  - % of time or activity count
  - Visibility status
  - Why it matters (Mak's insight)
  
Color coding:
  - Green dot: Strength (energizing + visible)
  - Amber dot: Opportunity (good work, hidden or undervalued)
  - Red dot: Risk (draining, needs attention)
```

#### Lattice Heatmap with Annotations
```
Same grid as Objective page, but adds:
  - Red flag icons on cells with mostly draining work
  - Star icons on cells with energizing work
  - Highlight on cells that are underutilized (opportunity)
  - Label on cells that are over-concentrated (blind spot)
  
Interaction:      Click annotation → Mak explains the insight
```

#### Coherence Score
```
Calculation:       1 - (lattice_dispersion_index)
Range:             0-100
Display:           Gauge/progress bar + interpretation

Interpretation:
  - 80+: "Highly coherent. Your work tells a unified story."
  - 60-79: "Coherent. A few scattered elements, but clear narrative."
  - 40-59: "Somewhat scattered. Multiple distinct domains; may lack focus."
  - <40: "Very scattered. No clear pattern; consider consolidation."

Mak's role:        Explains what coherence means for their career stage
```

#### Recognition Gap Analysis
```
Shows:             What the user has done vs. what's documented

Format:            
  - Activity type (Research, Teaching, Leadership)
  - Count of activities
  - Count in CV/documented
  - Gap visual (red if large gap)
  - Opportunity label

Mak's insight:     "You have X hidden gems. Ready to showcase them?"
Call-to-action:    [Generate outputs to close gaps]
```

#### Goal Alignment
```
Based on:          User's stated career goals (from profile)
For each goal:     
  - Goal name & timeline
  - Progress meter (% toward goal)
  - Status (on track / off track / accelerating / behind)
  - What's still needed (checklist)

Mak's role:        "You're on track for Professor. Need 2 more papers and a leadership win."
```

### User Actions on Assessment Page

1. **Read career pattern** → Mak explains it, offers: "Does this feel right?"
2. **See strength** → Mak suggests: "Let's build on this. Want to..."
3. **See opportunity** → Mak asks: "Ready to make this visible?"
4. **Check coherence score** → Mak helps interpret: "What would help you focus?"
5. **View recognition gaps** → Mak offers: "Let's close these gaps. Which output first?"
6. **Check goal progress** → Mak asks: "Any blockers? How can I help?"

---

## PAGE 4: PLAN (P)

### Purpose
Set and track goals, map career strategy, and plan next steps.

### Visual Layout

```
┌─────────────────────────────────────┐
│ PLAN: YOUR STRATEGY                 │
│ 3 active goals | 5-year horizon     │
├─────────────────────────────────────┤
│                                     │
│  [Goal Timeline]                    │
│  ┌─────────────────────────────────┐│
│  │ CAREER GOALS (5-Year View)      ││
│  │                                 ││
│  │ Year 1   Year 2    Year 3       ││
│  │ (Now)    (2027)    (2028)       ││
│  │  │        │         │            ││
│  │  ├─[G1]  │         │            ││
│  │  │        ├─[G2]   │            ││
│  │  │        │         ├─[G3]      ││
│  │  │        │         │            ││
│  │  G1: Publish 2 papers          ││
│  │  G2: Teach advanced seminar    ││
│  │  G3: Chair department committee ││
│  │                                 ││
│  │ [Add goal] [View details]      ││
│  └─────────────────────────────────┘│
│                                     │
│  [Active Goals] (Card per goal)     │
│  ┌─────────────────────────────────┐│
│  │ GOAL #1: Publish 2 Research    ││
│  │          Papers (by end of 2026)
│  │                                 ││
│  │ Progress: ████████░░ 75%       ││
│  │ Status: On track ✓              ││
│  │                                 ││
│  │ What needs to happen:           ││
│  │ ☑ Complete manuscript #1 (DONE)││
│  │ ☑ Submit to journal (DONE)     ││
│  │ ☐ Revisions & resubmit         ││
│  │ ☐ Accept & publish              ││
│  │ ☐ Complete manuscript #2        ││
│  │                                 ││
│  │ Evidence linked to this goal:   ││
│  │ [6 research activities]        ││
│  │                                 ││
│  │ Evidence gaps:                  ││
│  │ "Need to show collaboration in ││
│  │ manuscript work"                ││
│  │                                 ││
│  │ [Edit goal] [Link more evidence]
│  │ [Track progress] [Close goal]   ││
│  └─────────────────────────────────┘│
│                                     │
│  [Goal #2, #3...]                   │
│                                     │
│  [Suggested Next Steps] (from Mak)  │
│  ┌─────────────────────────────────┐│
│  │ Based on your activities &      ││
│  │ goals, Mak suggests:            ││
│  │                                 ││
│  │ 1. "Manuscript #2 is 80% ready. ││
│  │    Submit this month?"          ││
│  │                                 ││
│  │ 2. "You could chair the Quality ││
│  │    Committee next year. Build   ││
│  │    case now?"                   ││
│  │                                 ││
│  │ 3. "Teaching evaluations are    ││
│  │    strong. Time to formalize    ││
│  │    the seminar?"                ││
│  │                                 ││
│  │ [React to each suggestion]      ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

### Components

#### Goal Timeline
```
Type:               Horizontal timeline, 5-year horizon
Format:             Year marker at top, goal cards below
Display:            
  - Year (Now, +1y, +2y, etc.)
  - Goal card (title, status)
  - Connecting lines (dependency-aware)

Interactive:
  - Click goal → Expand to full details
  - [Add goal] button → Mak opens: "What's next for you?"
  - Goals can have dependencies ("After I publish 2 papers, then...")
```

#### Individual Goal Card
```
Format:             Card per goal
Content:            
  - Goal name & deadline
  - Progress bar (% complete)
  - Status (on track / off track / at risk / completed)
  - Milestone checklist (what needs to happen)
  - Linked evidence (activities supporting this goal)
  - Evidence gaps (what's missing)

Interactive:
  - Click [Link evidence] → Filter to activities relevant to this goal
  - Click [Track progress] → Opens modal to update checklist
  - Click [Close goal] → Mark complete; Mak celebrates
  - Click [Edit goal] → Mak asks clarifying questions, updates parameters
```

#### Suggested Next Steps
```
Source:             Mak's analysis of:
  - Current activities
  - Progress on existing goals
  - Gaps in your work
  - Specialty norms
  - Career phase expectations

Format:             Numbered suggestions (3-5)
Tone:               "Based on your work, I'd suggest..."
Examples:           
  - "You're ready to [advance/formalize/publish]..."
  - "To get promoted, you'll need..."
  - "Your [research] is hidden. Let's fix that..."

Interaction:
  - [Create goal from this] → Turns suggestion into formal goal
  - [Learn more] → Mak explains the reasoning
  - [Dismiss] → User doesn't need this right now
```

### User Actions on Plan Page

1. **Create new goal** → Mak conversation: "What are you aiming for?" → Goal created with timeline
2. **Update goal progress** → Click milestone checkbox → Lattice updates; Mak celebrates
3. **Link evidence to goal** → Click [Link evidence] → See activities supporting goal → Confirm
4. **React to suggestion** → Click [Create goal from this] → Goal created
5. **View goal roadmap** → Click timeline → See all goals visually

---

## PAGE 5: OUTPUT STUDIO (O)

### Purpose
Generate, draft, and export polished career documents (CV bullets, annual reviews, promotion narratives, etc.).

### Visual Layout

```
┌─────────────────────────────────────┐
│ OUTPUT STUDIO: CREATE YOUR CASE     │
├─────────────────────────────────────┤
│                                     │
│  [Template Selection] (Top modal)    │
│  ┌─────────────────────────────────┐│
│  │ What are we writing today?      ││
│  │                                 ││
│  │ [Academic Tenure Case]          ││
│  │ [Annual Performance Review]     ││
│  │ [Promotion Narrative]           ││
│  │ [Community Impact Summary]      ││
│  │ [Industry Pitch]                ││
│  │ [Career Statement]              ││
│  │ [Teaching Philosophy]           ││
│  │ [Research Statement]            ││
│  │ [+ Upload Institutional Template]
│  │                                 ││
│  │ Mak: "I'd recommend Academic   ││
│  │ Tenure given your research      ││
│  │ trajectory. But tell me what    ││
│  │ you're prepping for..."         ││
│  └─────────────────────────────────┘│
│                                     │
│  [Output Studio (after selection)]  │
│  ┌─────────────┬───────┬──────────┐│
│  │   LEFT      │CENTER │  RIGHT   ││
│  │   PANEL     │ EDITOR│ EVIDENCE ││
│  │             │       │ DRAWER   ││
│  │ Evidence    │       │          ││
│  │ suggestions │ Lexical
│  │ (auto-      │ Editor │ Linked  ││
│  │ linked      │ (rich  │ evidence││
│  │ based on    │ text)  │ with    ││
│  │ template)   │       │ citations
│  │             │       │          ││
│  │ [Refresh]   │[Export│          ││
│  │             │ opts] │          ││
│  │             │       │          ││
│  │             │       │          ││
│  │             │       │          ││
│  └─────────────┴───────┴──────────┘│
│                                     │
│  [Word Count & Guidance]            │
│  ┌─────────────────────────────────┐│
│  │ Academic Tenure Section 1:      ││
│  │ "Research Accomplishments"      ││
│  │                                 ││
│  │ Word count: 450/500 (90%)       ││
│  │ ████████░░░░░░░░░░░░░░░░░     ││
│  │                                 ││
│  │ Guidance: "You have room for one
│  │ more paragraph about your       ││
│  │ emerging leadership role."      ││
│  │                                 ││
│  │ Suggestions:                    ││
│  │ [+ Add research collaboration]  ││
│  │ [+ Add grant leadership]        ││
│  │                                 ││
│  │ Current evidence used:          ││
│  │ • 3 papers (primary domain)    ││
│  │ • 2 grants (scope: dept)       ││
│  │ • 1 collaboration (emerging)   ││
│  │                                 ││
│  │ Not yet included:               ││
│  │ • Teaching in research train... ││
│  │ • Committee leadership         ││
│  └─────────────────────────────────┘│
│                                     │
│  [Export Options]                   │
│  ┌─────────────────────────────────┐│
│  │ [Copy to clipboard]             ││
│  │ [Download as DOCX]              ││
│  │ [Download as PDF]               ││
│  │ [Email to myself]               ││
│  │ [Save as version]               ││
│  │                                 ││
│  │ Version history:                ││
│  │ • v3 (2 hrs ago) - Final draft  ││
│  │ • v2 (4 hrs ago) - Added teach ││
│  │ • v1 (today) - Generated       ││
│  │                                 ││
│  │ [Restore version]               ││
│  └─────────────────────────────────┘│
│                                     │
└─────────────────────────────────────┘
```

### Components

#### Template Selection Modal
```
Shows before main editor loads.
Options:
  1. Academic Tenure Case (comprehensive)
  2. Annual Performance Review (time-bound)
  3. Promotion Narrative (for specific level)
  4. Community Impact Summary (public health)
  5. Industry Pitch (corporate/startup)
  6. Career Statement (reflective)
  7. Teaching Philosophy (educators)
  8. Research Statement (researchers)
  9. + Upload Institutional Template

For each pre-built template:
  - Icon or preview
  - Description
  - Estimated time to complete
  - Typical word count
  
Mak's role:
  - "I think Academic Tenure makes sense given your research output..."
  - "Want to go with that, or something different?"

On selection:
  - Studio opens with pre-scoped template
  - Left panel auto-populates with relevant evidence
  - Lexical editor loads template sections
  - Word count guidance shows
```

#### Three-Column Layout

**Left Panel (Evidence Suggestions):**
```
Auto-linked based on template sections.
Shows:
  - Evidence item title & summary
  - Activity type & domain
  - Energy signal (colored dot)
  - Date range
  - How it's relevant to current section
  
Interaction:
  - Click evidence → Highlights corresponding text in center editor
  - [Link to section] → Inserts into current cursor position (auto-cite)
  - [Remove] → Unlinks from this section (evidence stays in gallery)
  - [Refresh] → Recomputes relevant evidence for current section
  
Mak integration:
  - "I see you have strong patient safety research. Should we lead with that?"
  - "This grant involves international collaboration—perfect for your leadership section."
```

**Center Panel (Lexical Editor):**
```
Rich text editor (Lexical framework).
Features:
  - Bullet lists, paragraphs, headings
  - Bold, italic, underline
  - Links (to evidence, internal citations)
  - Comments/track changes (for feedback)
  - Auto-save every 30 seconds

Display:
  - Left margin: Caret for inserting evidence quickly
  - Section headers: Collapsible
  - Word count per section: Real-time
  - Template guidance: Sidebar tooltip per section

Mak's voice:
  - "Your research section reads great. Want to add more on your clinical impact?"
  - "This narrative is getting long. Should we tighten it, or split it?"
```

**Right Panel (Evidence Drawer):**
```
Sidebar showing all linked evidence for this document.
Format:
  - Evidence item + citation #
  - Linked to which section (color-coded)
  - Edit/remove options
  
Shows:
  - Which evidence is used: Green checkmark
  - Which sections need more evidence: Yellow flag
  - Which evidence is in the gallery but unused: Gray

Interaction:
  - Click evidence → Jump to where it's cited in editor
  - [Unlink] → Remove from document
  - [Link to different section] → Move citation
  - [View full evidence] → Expand details
```

#### Word Count & Guidance
```
Per section display:
  - Current word count / target word count
  - Progress bar (green if on target, amber if close, red if over)
  - Smart guidance: "You have room for one more paragraph about..."
  
Suggestions:
  - [+ Add achievement in X domain]
  - [+ Add leadership example]
  - [+ Emphasize collaboration]
  
Current evidence used:
  - Bullet list of evidence items currently cited
  - Count by type (papers, grants, teaching, etc.)
  
Not yet included:
  - Evidence from gallery relevant to this section but not yet used
  - Mak suggests: "You have 3 more research collaborations. Should one go here?"
```

#### Export Options
```
Buttons:
  1. [Copy to clipboard] → All text, preserves formatting
  2. [Download as DOCX] → Word document with styling
  3. [Download as PDF] → Professional PDF
  4. [Email to myself] → Sends to user's email
  5. [Save as version] → Creates snapshot for version history

Version history:
  - Shows recent versions with timestamps & edit notes
  - [Restore version] → Reverts to previous version
  - Auto-saves every 30 seconds (minor versions)
  - User creates major versions by clicking [Save as version]

Mak's role:
  - "Ready to send this out? Or want to keep refining?"
  - Celebrates on export: "This is going to open doors. Well done."
```

### User Actions in Output Studio

1. **Select template** → Mak suggests; user confirms or chooses different
2. **Read auto-linked evidence in left panel** → Click to insert into editor
3. **Edit in center editor** → Rich text, real-time word count
4. **Check guidance** → "You have room for one more paragraph on..."
5. **Add evidence not yet linked** → Search gallery in right panel; link to section
6. **Review what's cited** → Right panel shows all linked evidence
7. **Export** → Choose format, download or email

---

## MASTER NAVIGATION BEHAVIOR

### Always-Available Mak Actions

No matter what page the user is on, they can:

1. **Voice input** → Click microphone in Mak input area
   - "I taught a challenging case today"
   - System captures, Mak asks clarifying questions
   - Activity logged without leaving current page

2. **Menu selection** → Mak shows contextual menu
   - "What would help right now?"
   - Options change based on page (e.g., "Log activity", "Generate output", "Set goal")
   - User selects → Mak guides through next steps

3. **Ask Mak directly** → Type question
   - "How do I improve my research visibility?"
   - "Should I apply for this promotion?"
   - Mak responds based on their data

4. **Switch pages** → Click icon in left sidebar
   - Main workspace updates
   - Mak greeting changes based on new page
   - Context preserved (if user was reviewing Objective, switches to Plan, then back to Objective, sees same view)

---

## RESPONSIVE DESIGN (MOBILE)

### Mobile Layout (< 768px)

```
Sidebar:        Collapses to icon-only (40px width) or hamburger
Mak panel:      Slides in from left on icon tap (full-width modal)
Main workspace: Full width below header

On mobile, user typically:
  - Taps hamburger → Sidebar expands
  - Taps Mak icon → Mak panel slides over (full screen)
  - Mak panel has X to close → Back to main workspace
  - Main workspace is single-column (cards stack vertically)
  
Lattice:        Becomes scrollable grid or collapsed view
Editor:         Full screen, keyboard-friendly (no evidence drawer at first)
```

---

## DESIGN TOKENS (FOR LOVEABLE BUILD)

### Colors
```
Primary:            #5FD65F (FISCMAK green)
Primary Dark:       #3BA33B
Primary Light:      #E8F8E8
Energizing:         #5FD65F
Neutral:            #D97706
Draining:           #DC2626
Text Dark:          #111827
Text Secondary:     #4B5563
Border:             #D1D5DB
Background Light:   #FAFBFC
Background White:   #FFFFFF
```

### Typography
```
Font family:        -apple-system, Segoe UI, Helvetica, Arial, sans-serif
H1:                 48px, 700 bold
H2:                 36px, 700 bold
H3:                 24px, 600 semibold
H4:                 20px, 600 semibold
Body:               16px, 400 regular
Small:              14px, 400 regular
Button:             16px, 600 semibold
```

### Spacing (8px grid)
```
xs:  4px
sm:  8px
md:  16px
lg:  24px
xl:  32px
2xl: 48px
```

### Components
```
Button (primary):     12px (vertical) × 24px (horizontal), #5FD65F, white text
Button (secondary):   12px × 24px, #F9FAFB, #111827 text, gray border
Button (destructive): 12px × 24px, #DC2626, white text
Card:                 White background, 1px #D1D5DB border, 8px border-radius
Input:                16px height, 1px #D1D5DB border, 6px border-radius, focus: #5FD65F
Slider:               Gradient fill #DC2626 → #D97706 → #5FD65F
Modal:                White background, center on screen, 400px-600px width, shadow
```

---

## LOVEABLE BUILD SEQUENCE (UPDATED FOR VISUAL-FIRST)

### Phase 1: Visual Foundation (Weeks 1-2)

**Prompt 1:** Design System & Icon Sidebar
- Create icon sidebar (60px, 6 icons)
- Set up design tokens (colors, typography, spacing)
- Test sidebar navigation

**Prompt 2:** Coach Mak Panel
- Build three-tier layout (sidebar + Mak + main content)
- Mak chat UI (messages, input area, voice button)
- Mak greeting logic (changes per page)

**Prompt 3:** Layout & Responsive
- Test responsive behavior (mobile hamburger, etc.)
- Main workspace placeholder
- Page routing (icon click → page switch)

### Phase 2: Subjective (S) Page (Week 3)

**Prompt 4:** Energy Level Slider & Mood Tracking
- Energy slider (0-10, gradient colors)
- Mood trigger checkboxes
- Stores in activity_entries

**Prompt 5:** Burnout Indicators & Value Alignment
- Burnout indicator bars (3-part Maslach)
- Value alignment display (goals vs. actual time)
- Connects to Mak insights

**Prompt 6:** Weekly Trend Graph
- Line chart (last 7 days)
- Interactive hover (show activity)
- Stores in mood_signals table

### Phase 3: Objective (O) Page (Week 4)

**Prompt 7:** Activity Capture Card
- Text + voice input form
- Posts to Claude → Mak conversation
- Auto-classifies with OpenAI
- Displays confirmation

**Prompt 8:** Recognition Gap Alert
- Calculates (Total activities - Documented activities)
- Shows conditional alert card
- Mak suggests: "Let's make you visible"

**Prompt 9:** 8×8 Lattice Grid
- Renders 64 cells
- Color coding (green/red/amber/gray)
- Cell click → Modal with activities
- Real-time updates on new activity

**Prompt 10:** Evidence Gallery
- Display evidence items (carousel or grid)
- Filters (All, Energizing, Draining, CV-Ready, Invisible)
- Click item → Sidebar details

### Phase 4: Assessment (A) Page (Week 5)

**Prompt 11:** Career Pattern Summary
- Claude generates pattern name
- Displays explanation
- Mak contextualizes it

**Prompt 12:** Strengths & Opportunities
- Two-column layout
- Pull from lattice analysis
- Color-coded (green strength, amber opportunity)

**Prompt 13:** Coherence Score & Heatmap
- Calculate and display coherence (0-100)
- Annotated lattice (flags, stars)
- Mak explains interpretation

**Prompt 14:** Recognition Gap & Goal Alignment
- Recognition gap breakdown (what's hidden)
- Goal progress (checklist, timeline, status)
- Mak suggests next steps

### Phase 5: Plan (P) Page (Week 6)

**Prompt 15:** Goal Timeline & Cards
- 5-year horizontal timeline
- Individual goal cards (progress, milestones)
- [Add goal] triggers Mak conversation

**Prompt 16:** Suggested Next Steps
- Mak analyzes activities & gaps
- Generates 3-5 suggestions
- [Create goal from this] button

### Phase 6: Output Studio (O) Page (Weeks 7-8)

**Prompt 17:** Template Selection Modal
- Pre-built templates (9 options)
- Upload institutional template
- Mak recommendation logic

**Prompt 18:** Three-Column Layout
- Left: Evidence suggestions
- Center: Lexical editor integration
- Right: Evidence drawer
- Auto-link evidence to template sections

**Prompt 19:** Word Count & Export Options
- Per-section word count + guidance
- [Copy], [Download DOCX], [Download PDF], [Email]
- Version history tracking

### Phase 7: Mak Integration & Polish (Week 8-9)

**Prompt 20:** Coach Mak Adaptive Behavior
- Mak greetings change per page
- Contextual menu options
- Conversation flows for each section
- Personality & voice tuning

### Phase 8: Testing & Launch (Week 9-10)

- Beta testing with 5-10 physicians
- Error handling, edge cases
- Mobile testing
- Security review
- Launch

---

## SUMMARY: COGNITIVE LOAD REDUCTION

### How This Design Reduces Friction

1. **No form-filling:** All major inputs happen through Mak conversation
   - User never sees form fields
   - Mak asks, user responds conversationally
   - Data auto-flows to backend

2. **Visual clarity:** Main workspace always shows data, never asks for it
   - Lattice is visual → user understands instantly
   - Cards are pre-populated → user reviews, doesn't input
   - Mak controls the UI flow

3. **Contextual guidance:** Mak adapts to each page
   - On Subjective: Mak is therapist/listener
   - On Objective: Mak is documenter/classifier
   - On Output: Mak is ghostwriter/sponsor
   - User never confused about what Mak does

4. **Always-available AI:** Voice input, menu selections, direct questions
   - User can interact from any page
   - Mak remembers context
   - No friction to add activity, ask question, or refine goal

5. **Drag & drop readiness:** Foundation for future low-cognitive UX
   - Main workspace is visual (not text-heavy)
   - Evidence gallery supports drag-to-editor (future phase)
   - All selections traceable (for audit, privacy, transparency)

---

**Status:** READY FOR LOVEABLE BUILD

This specification is production-ready and paired with:
- FISCMAK_V1_CANONICAL_BUILD_SPEC.md (backend architecture)
- FISCMAK_OUTPUT_STUDIO_SPEC.md (Lexical editor details)
- FISCMAK_SUPABASE_SCHEMA.sql (database)
- FISCMAK_SPECS_PART_2.md (AI prompts, design system, privacy)
- FISCMAK_BRAND_IDENTITY_GUIDE.md (colors, typography, components)

**Next:** Share this with Loveable dev team. Start with Prompt 1 (Design System & Icon Sidebar).


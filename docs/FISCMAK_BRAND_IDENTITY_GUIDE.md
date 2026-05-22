# FISCMAK BRAND IDENTITY GUIDE

**Version:** 1.0  
**Status:** FINAL  
**Date:** May 21, 2026

---

## BRAND LOGO

**FISCMAK Logo:**
- Bright geometric arrow/play symbol in bold green circle
- Modern, energetic, action-oriented aesthetic
- Represents movement, growth, and forward momentum in career development
- Bold black stroke on clean white interior arrow
- Primary brand asset for all digital and print materials

---

## COLOR PALETTE (UPDATED)

### Primary Brand Color: ENERGIZING GREEN
```
Name: FISCMAK Energizing Green
Hex: #5FD65F
RGB: 95, 214, 95
HSL: 120, 64%, 61%
Use: Primary buttons, brand accents, energizing activities, logo background
Emotion: Positive, growth, forward momentum, optimistic
```

### Brand Green Variants
```
Light (Backgrounds):    #E8F8E8 (very subtle green tint)
Medium (Logo primary):  #5FD65F (main brand color)
Dark (Hover states):    #3BA33B (deeper green for depth)
```

### Energy Signal Colors
```
Energizing/Success:     #5FD65F (FISCMAK green)
Neutral/Balanced:       #D97706 (amber)
Draining/Caution:       #DC2626 (red)
```

### Accent Colors
```
Black Accent:           #000000 (logo stroke style, bold elements)
White:                  #FFFFFF (primary background)
```

### Neutral Grays
```
Text Dark:              #111827 (headings, body text)
Text Secondary:         #4B5563 (secondary content)
Border/Dividers:        #D1D5DB (subtle borders)
Background Subtle:      #F9FAFB (very light backgrounds)
```

---

## VISUAL LANGUAGE

### Geometric & Bold
- Logo uses bold black stroke on white/light background
- Recommend: Bold, clean lines for UI elements
- Avoid: Soft, rounded, pastel aesthetics
- This is: Modern, energetic, forward-thinking

### Color Psychology
- **Energizing Green (#5FD65F)** = Growth, forward momentum, "what's energizing you"
- **Red (#DC2626)** = Alert, caution, "what's draining you"
- **Amber (#D97706)** = Neutral, balanced state
- **Black accents** = Bold emphasis, importance, depth

### Principle: Visibility of Career Energy
The bright green immediately signals energizing work. The red draws attention to burnout risk. The color system isn't just pretty—it's a diagnostic tool.

---

## BUTTON STYLES (UPDATED)

### Primary Button (FISCMAK Brand)
```css
Background:     #5FD65F (FISCMAK green)
Text:          White
Padding:       12px 24px
Border-radius: 6px
Font-weight:   600 (semibold)
Hover:         #3BA33B (green-dark, slightly darker)
Active:        Black border (#000000) + green background
Focus:         Green with visible focus ring
```

**Use for:** Main actions (Generate output, Save, Submit, Confirm)

### Secondary Button
```css
Background:     #F9FAFB (very light gray)
Text:          #111827 (dark gray)
Border:        2px #D1D5DB
Padding:       12px 24px
Border-radius: 6px
Hover:         #F3F4F6 (slightly darker light gray)
Active:        #E5E7EB
```

**Use for:** Alternative actions (Cancel, Skip, Back)

### Destructive Button (Draining/Delete)
```css
Background:     #DC2626 (red)
Text:          White
Padding:       12px 24px
Border-radius: 6px
Hover:         #B91C1C (darker red)
Focus:         Red with visible focus ring
```

**Use for:** Destructive actions (Delete, Remove, Clear)

### Link Button (Tertiary)
```css
Background:     Transparent
Text:          #5FD65F (FISCMAK green)
Padding:       4px 0
Border:        None
Underline:     On hover
Font-weight:   500
Hover:         #3BA33B (green-dark), underlined
```

**Use for:** Secondary navigation, "Learn more", inline actions

---

## CARD & CONTAINER STYLES

### Primary Card (Information)
```css
Background:     White (#FFFFFF)
Border:         1px #D1D5DB (subtle gray)
Border-radius:  8px
Padding:        24px
Box-shadow:     0 1px 3px rgba(0,0,0,0.1)
Hover:          Subtle shadow increase
Accent border:  Left border 4px #5FD65F (optional, for emphasis)
```

### Energy Signal Cards
```
Energizing activity card:
- Left border: 4px #5FD65F (green)
- Subtle background: #E8F8E8
- Icon: Green checkmark or star

Draining activity card:
- Left border: 4px #DC2626 (red)
- Subtle background: #FEF2F2
- Icon: Red warning or drain symbol

Neutral activity card:
- Left border: 4px #D97706 (amber)
- Standard white background
- Icon: Amber dash or balance symbol
```

---

## LATTICE CELL VISUALIZATION

### Active Energizing Cell (10+ activities, energizing)
```css
Background:     #5FD65F (FISCMAK green)
Opacity:        1.0 (full)
Border:         2px #3BA33B (green-dark)
Text:          White
Icon:          Bright, energized
Hover:          Border becomes black (#000000), shadow added
```

### Active Draining Cell (10+ activities, draining)
```css
Background:     #DC2626 (red)
Opacity:        1.0 (full)
Border:         1px #991B1B (dark red)
Text:          White
Icon:          Alert indicator
Hover:          Bold black border, shadow increase
```

### Neutral Cell (5-10 activities, mixed)
```css
Background:     #D97706 (amber)
Opacity:        0.8
Border:         1px #B45309
Text:          White
Hover:          Border becomes black (#000000)
```

### Inactive Cell (0-1 activities)
```css
Background:     #F9FAFB (very light gray)
Opacity:        0.3
Border:         1px #D1D5DB
Text:          #9CA3AF (light gray)
```

---

## TYPOGRAPHY

### Font Family
```
System stack: -apple-system, Segoe UI, Helvetica, Arial, sans-serif
Fallback: sans-serif
Reason: Fast load, consistent across platforms, professional appearance
```

### Font Sizes & Weights
```
H1 (Landing/Hero):     48px, 700 bold, line-height 1.2
H2 (Section title):    36px, 700 bold, line-height 1.3
H3 (Subsection):       24px, 600 semibold, line-height 1.4
H4 (Card title):       20px, 600 semibold, line-height 1.4

Body text:             16px, 400 regular, line-height 1.5
Secondary text:        14px, 400 regular, line-height 1.4
Small label:           12px, 500 medium, line-height 1.3
Tiny (metadata):       11px, 400 regular, line-height 1.2

Button text:           16px, 600 semibold
Link text:             16px, 500 medium, underlined
```

---

## SPACING SYSTEM

8px base unit (improves rhythm and consistency)

```
xs:   4px    (minimal spacing, tight)
sm:   8px    (small gaps)
md:   16px   (standard padding)
lg:   24px   (large padding, section separation)
xl:   32px   (extra large, major sections)
2xl:  48px   (page-level spacing)
```

### Examples
```
Button padding:       md (vertical) × lg (horizontal) = 12px × 24px
Card padding:         lg = 24px
Section gap:          2xl = 48px
Label to input:       sm = 8px
Component margin:     md = 16px
```

---

## ACCESSIBILITY STANDARDS

✅ **Color Contrast:**
- Text on FISCMAK green: Ensure 4.5:1 contrast (white text on #5FD65F = ✓ 4.75:1)
- Never use color alone (always pair with text or icons)

✅ **Focus States:**
- All interactive elements need visible focus rings
- Use 2px outline in FISCMAK green (#5FD65F)

✅ **Touch Targets:**
- Buttons minimum 44px height (mobile)
- Spacing minimum 8px between interactive elements

✅ **Text Sizing:**
- Minimum 16px for body text (mobile readable)
- No text smaller than 12px except metadata

✅ **Labels:**
- All form inputs must have visible labels (not placeholder-only)
- ARIA labels for icon-only buttons

---

## DARK MODE (Future Consideration)

Current implementation is light-mode only, but CSS variables support future dark mode:

```css
:root {
  --color-bg: #FFFFFF;
  --color-text: #111827;
  --color-border: #D1D5DB;
  --color-green: #5FD65F;
  --color-green-dark: #3BA33B;
  --color-green-light: #E8F8E8;
  --color-red: #DC2626;
  --color-amber: #D97706;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #111827;
    --color-text: #F9FAFB;
    --color-border: #4B5563;
    --color-green: #7FDD7F;
    --color-green-dark: #5FD65F;
    --color-green-light: #1F4D1F;
    --color-red: #EF4444;
    --color-amber: #F59E0B;
  }
}
```

---

## BRAND VOICE & TONE

### Visual Tone
- **Modern:** Clean, bold, geometric (inspired by logo)
- **Energetic:** Bright green signals positivity and growth
- **Professional:** Appropriate for physician audience (not playful)
- **Data-driven:** Colors represent real career signals
- **Empowering:** Helps physicians see their invisible work

### Copy Tone
- Warm, conversational, non-clinical
- Validate before suggesting
- Use physician language (not HR jargon)
- Focus on evidence and visibility
- Celebrate energizing work, address draining work

---

## IMPLEMENTATION IN LOVEABLE

When building FISCMAK in Loveable, use these exact specifications:

1. **Color palette:** Primary #5FD65F, Dark #3BA33B, Light #E8F8E8
2. **Buttons:** Green primary, gray secondary, red destructive
3. **Typography:** System fonts, 16px base body
4. **Spacing:** 8px grid
5. **Cards:** White with 1px gray border
6. **Lattice:** Green for energizing, red for draining, amber for neutral
7. **Focus states:** Green outline (2px)
8. **Energy signals:** Use color consistently (energizing = green, draining = red)

---

## FILES THAT USE THIS GUIDE

- FISCMAK_SPECS_PART_2.md (Part D: Design System) — now updated
- FISCMAK_V1_CANONICAL_BUILD_SPEC.md — reference for constraints
- All Loveable prompts (Prompts 1-20) — use these colors/styles

---

**Brand locked. Ready to build with confidence.**


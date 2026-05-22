# FISCMAK QUICK REFERENCE
## Career Platform - Complete Product Specification
### v1.0 - May 2026

---

## CORE VISION
**Reduce cognitive burden through conversational AI coaching.**  
Progressive disclosure → MemPalace memory → Job marketplace → Career pathways → Accountability

---

## DESIGN SYSTEM AT A GLANCE

| Element | Color | Usage |
|---------|-------|-------|
| Primary Text | #1A1A1A (Muted Black) | Headlines, strong emphasis |
| Secondary Text | #475569 (Slate Gray) | Body copy, descriptions |
| Links & CTAs | #4F46E5 (Slate Blue) | Interactive elements |
| Success/Achievement | #A3E635 (Lime Green) | Badges, milestones, completion |
| Warnings | #F59E0B (Gold) | Important alerts, milestones |
| Critical CTAs | #F97316 (Orange) | Energy alerts, urgent actions |
| Backgrounds | #FFFFFF (White) | Cards, containers |

**Typography:** Arial (system), 28pt H1, 18pt H2, 14pt body, 12pt labels

---

## DATABASE SCHEMA (CORE TABLES)

### Users
```
user_id (UUID, PK) | email | name | specialty | career_stage 
cv_uploaded | mempalace_id | created_at | last_active
```

### Career Assessments
```
assessment_id (UUID, PK) | user_id (FK) | touchpoint_number (1-7)
question_category (ENUM) | questions_answered (JSONB) | score (0-100) | completed_at
```

### Documents
```
document_id (UUID, PK) | user_id (FK) | document_type | file_url 
extracted_text | metadata (JSONB) | uploaded_at
```

### Pathways
```
pathway_id (UUID, PK) | specialty | pathway_type (Clinical/Research/Education/Leadership)
description | salary_range | job_market_demand (HIGH/MEDIUM/LOW)
```

### Jobs
```
job_id (UUID, PK) | source (LinkedIn/Indeed/MedJobs) | external_job_id
title | location | salary | specialties (VARCHAR[]) | description | posted_date
```

---

## KEY FORMULAS

**Assessment Score:**  
`Score = (Weighted Sum / Max) × 100` → 0-100 scale (5-point Likert)

**Career Readiness Index (CRI):**  
`CRI = (Assessment×0.4) + (CV Completeness×0.3) + (Pathway Clarity×0.3)`

**Job Match Score:**  
`Match = (Specialty×0.5) + (Salary×0.2) + (Location×0.2) + (Growth×0.1)` → 0-100%

---

## 3-TIER ONBOARDING

| Tier | Duration | Gate | Action | Data |
|------|----------|------|--------|------|
| **1** | <2 min | REQUIRED | Specialty + Career Stage | user_id created, specialty, career_stage |
| **2** | 3-5 min | OPTIONAL | CV Upload + OCR | document extracted, text, metadata, MemPalace sync |
| **3** | ∞ | OPTIONAL | Goals, Location, Templates, Notifications | preferences, settings |

---

## 7-TOUCHPOINT COACHING CADENCE

| TP | Timing | Focus | Mak Role | Output |
|----|--------|-------|----------|--------|
| 1 | Day 0 | Intro, specialty, goals | Welcomer | Clarity |
| 2 | Day 3 | Background, achievements | Listener | Experience map |
| 3 | Week 1 | Energy, burnout, invisible work | Coach | Wellbeing baseline |
| 4 | Week 2 | Aspirations, values, vision | Mentor | Career vision |
| 5 | Week 3 | Skill gaps, development | Advisor | Dev plan |
| 6 | Month 2 | Job market, networking | Matchmaker | Job matches |
| 7 | Month 3+ | Progress, accountability | Accountability partner | Progress review |

**Assessment Bank:** 60 questions total, deployed across cadence  
**Categories:** Energy, Burnout, Skills, Values, Invisible Work, Market Awareness

---

## COACH MAK BEHAVIORS

| Behavior | Example | Purpose |
|----------|---------|---------|
| **Active Listening** | "Tell me more about what that looks like" | Build trust, surface root causes |
| **Reflective Questions** | "What would your ideal role look like in 3 years?" | Clarify values & goals |
| **Signal Tracking** | Flags burnout patterns → suggests wellness resources | Proactive wellbeing |
| **Invisible Work Recognition** | "You've mentored 5 residents and chaired committees" | Surface full value |
| **Matching & Sponsorship** | "These 3 roles are strong fits for you" | Actionable opportunity guidance |

**Guardrails:** ✓ Active listening, ✗ Medical advice, ✗ Prescriptive, ✓ Scope limits, ✓ Confidentiality

---

## CORE INTEGRATIONS

| Integration | Purpose | Type |
|-------------|---------|------|
| **MemPalace** | Persistent coaching memory, context | API |
| **LinkedIn API** | Job feed, salary benchmarks, insights | REST |
| **Indeed API** | Broad job market data | REST |
| **MedJobs (AAMC)** | Academic medicine positions | REST/Scrape |
| **Bureau of Labor Statistics** | Median salaries by specialty/region | REST |
| **Auth0/Firebase** | OAuth 2.0, SSO, MFA | OAuth |

---

## API ENDPOINTS (KEY ROUTES)

### Auth
- `POST /auth/register` → { auth_token, user_id }
- `POST /auth/login` → { auth_token }
- `POST /auth/logout` → {}

### Onboarding
- `POST /onboarding/tier1/specialty` → { specialty }
- `POST /onboarding/tier1/career-stage` → { career_stage }
- `POST /documents/upload` → { document_id, extracted_text }

### Assessments
- `GET /assessments/current` → { questions, progress }
- `POST /assessments/start` → { assessment_id }
- `POST /assessments/{id}/answer` → { next_question }
- `POST /assessments/{id}/complete` → { score, insights }

### Jobs
- `GET /jobs/matches?specialty=X&location=Y` → { jobs[], mak_commentary }
- `POST /jobs/{jobId}/save` → { saved_at }
- `GET /jobs/saved` → { jobs[] }

### Pathways
- `GET /pathways?specialty=Cardiology` → { pathways[] }
- `GET /pathways/{id}` → { detailed_info, skill_gaps }

### Chat
- `POST /chat/message` → { response, suggested_actions }
- `GET /chat/history?limit=50` → { messages[] }

### MemPalace
- `POST /mempalace/sync` → { mempalace_id, synced_at }
- `GET /mempalace/context` → { coaching_summary, key_facts }

### Settings
- `GET /settings` → { goals, preferences }
- `PUT /settings` → { message: "updated" }

### Analytics
- `GET /analytics/dashboard` → { CRI, onboarding_progress, assessment_progress }

---

## SUCCESS METRICS (TARGET)

| Metric | Target | Why | Owner |
|--------|--------|-----|-------|
| Tier 1 Completion | >80% | Low friction entry = activation | Product |
| CV Upload (Tier 2) | >60% | Rich coaching context | Product |
| 7-Touchpoint Completion | >70% | Sustained engagement | Engagement |
| Job Match Usage | >40% | Marketplace value | Analytics |
| NPS (Net Promoter) | >50 | Overall satisfaction | CX |
| Wellbeing Improvement | +15% | Assessment score delta, burnout reduction | Analytics |

---

## IMPLEMENTATION ROADMAP

### Phase 1 (Mo 1-2): Foundation
- [ ] DB setup (PostgreSQL: users, assessments, documents, pathways, jobs)
- [ ] Auth system (Email/SSO, OTP)
- [ ] Coach Mak v1 (Tier 1 conversational interface)
- [ ] Design system (colors, typography, components)

### Phase 2 (Mo 3-4): Contextual Coaching
- [ ] Tier 2 onboarding (CV upload + OCR/parsing)
- [ ] MemPalace integration
- [ ] Assessment engine (60-question bank, cadence)
- [ ] Coaching insights (wellbeing signals, CRI)

### Phase 3 (Mo 5-6): Opportunity Marketplace
- [ ] Job data feeds (LinkedIn, Indeed, MedJobs, BLS)
- [ ] Job matching engine
- [ ] Job matches dashboard
- [ ] Touchpoints 5-6 (gap analysis, job exploration)

### Phase 4 (Mo 7-8): Advanced Coaching
- [ ] Coach Mak v2 (sponsorship, networking)
- [ ] Career pathways explorer
- [ ] Document templates (CV, resume, cover letter, portfolio)
- [ ] Touchpoint 7 (accountability, progress tracking)

### Phase 5 (Mo 9+): Refinement & Scale
- [ ] Beta testing (100 physician users)
- [ ] Performance optimization (caching, indexing)
- [ ] Institutional partnerships
- [ ] Public launch

---

## TECHNICAL STACK

**Backend:**  
Node.js 18+ or Python 3.10+ | PostgreSQL 14+ | Express.js/FastAPI | AWS S3/Azure Blob | Redis | OpenAI API (GPT-4)

**Frontend:**  
React 18+ | Redux Toolkit/Zustand | Tailwind CSS | Custom React chat + WebSocket | React Native or responsive web

**Integrations:**  
MemPalace API | LinkedIn API | Indeed API | BLS API | Auth0/Firebase (OAuth 2.0, SSO)

---

## SECURITY & COMPLIANCE

- ✓ TLS 1.3 in transit, AES-256 at rest
- ✓ HIPAA BAA with cloud providers (if PHI)
- ✓ GDPR/CCPA: user consent, right to deletion
- ✓ Multi-factor authentication (MFA)
- ✓ Audit logging (all actions with timestamps)
- ✓ Quarterly penetration testing

---

## GLOSSARY

| Term | Definition |
|------|-----------|
| **Coach Mak** | AI conversational mentor/coach/sponsor; primary gateway |
| **Touchpoint** | Scheduled engagement moment in 7-TP cadence (3 months) |
| **Career Readiness** | Composite metric (Assessment + CV + Pathway) |
| **Invisible Work** | Mentoring, committee, service → Mak surfaces it |
| **Pathway** | Career track (Clinical, Research, Education, Leadership) |
| **Burnout Signal** | Assessment flags of exhaustion; Mak provides resources |
| **MemPalace** | Persistent memory system for career context |
| **Job Match Score** | Calculated fit % (0-100, uses specialty/salary/location/growth) |
| **CRI** | Career Readiness Index (0-100) |

---

## QUICK START CHECKLIST FOR DEVELOPMENT

- [ ] **Week 1:** Repo setup, DB schema, auth scaffolding
- [ ] **Week 2:** API framework (Express/FastAPI), basic endpoints
- [ ] **Week 3:** React frontend setup, design system components
- [ ] **Week 4:** Tier 1 onboarding (specialty + stage) → full flow test
- [ ] **Week 5:** Tier 2 (CV upload), OCR integration, MemPalace API
- [ ] **Week 6:** Assessment engine, question bank, scoring logic
- [ ] **Week 7:** Coach Mak LLM integration (GPT-4), chat UI
- [ ] **Week 8:** Job data feeds, matching algorithm, dashboard
- [ ] **Week 9:** Career pathways explorer
- [ ] **Week 10:** Document templates, settings
- [ ] **Week 11:** Analytics dashboard, reporting
- [ ] **Week 12:** Testing, optimization, security review

---

## CONTACT & SUPPORT

- **Architecture Questions:** See FISCMAK_Cursor_Specification.pdf
- **API Details:** See FISCMAK_API_Contract.md
- **Database Queries:** See FISCMAK_Database_Queries.sql
- **Design System:** See color palette and typography sections above

---

**Document prepared:** May 22, 2026  
**Status:** Ready for development

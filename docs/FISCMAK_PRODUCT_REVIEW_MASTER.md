# FISCMAK — Complete Product Review Guide

Generated: 2026-05-25T22:02:42.955Z
Repo: `/Users/kristenpalmer/fiscmak` (branch `cursor/mvp-app-foundation`)
Admin: `/Users/kristenpalmer/fiscmak-admin`

This is your **single navigation file** for reviewing the entire product. Full React component source code is in `docs/exports/all-function-components.md` (94 files, ~377KB).

---

## How to use this document

1. **Start with § Review priority matrix** — what works vs demo vs remove
2. **§ User journey** — trace onboarding → dashboard → output
3. **§ Formulas & evidence** — internal vs user-facing (critical for GME pivot)
4. **§ Components / API / lib tables** — open files in Cursor via paths
5. **Full source dump** — `docs/exports/all-function-components.md`

---

## Review priority matrix

| Area | Status | Key files | Action for GME/CCC pivot |
|------|--------|-----------|--------------------------|
| Marketing site | **Working** | `src/components/marketing/*`, `src/app/page.tsx` | Rewrite institutional copy for PD buyer |
| Auth (login/signup) | **Working** | `src/app/login/page.tsx`, `AuthGuard.tsx` | Add program_admin role later |
| Onboarding TP1 | **Working** | `Touchpoint1Onboarding.tsx`, `onboarding-compute.ts` | Add PGY, program affiliation |
| NPI verify | **Working** | `NpiRegistryPanel.tsx`, `npi-registry.ts` | Optional for trainees |
| Activity capture | **Partial** | `activity-capture.ts`, `MakPanel.tsx` | Core GME feature — prioritize |
| MSF / CCC / ILP | **Built (GME pilot)** | `KpAdminGmePanel`, trainee Output Studio, `/api/v1/trainee/*`, `/api/v1/programs/*` | Extend beyond psychiatry |
| Lattice view | **Working** | `LatticeView.tsx`, `/api/v1/lattice` | Phase 1 ipsative; ADR-002 intensity backlog |
| Career Health Score | **Retired from user UI** | `HealthScoreCard.tsx` (KP Admin only) | Done for trainees; attending wellbeing slices only |
| CRI / CDI / IWQ | **Internal formulas** | `formulas.ts`, `cv-metrics.ts`, `cdi-weights.ts` | Never expose in Mak/docs |
| CV regex s-index | **Deprecated** | `cv-metrics.ts` | Replace with Mannix & Bell activity s-index |
| PFI / instruments | **Partial** | `onboarding-instruments.ts`, assessments API | Formal PFI-16 + UWES-9 |
| Coach Mak chat | **Working** | `api/v1/chat/message/route.ts`, `MakPanel.tsx` | Remove tone-from-PFI; add reflection guardrails |
| Output Studio | **Working** | `OutputStudioWorkspace.tsx`, `output-generation.ts` | Add source tags [CV][Activity][MSF] |
| Promotion wizard | **Attending-focused** | `PromotionNarrativeWizard.tsx` | Defer; GME uses CCC portfolio |
| Jobs feed | **Scaffold** | `job-ingestion.ts`, `JobsWorkspace.tsx` | Not GME MVP |
| Career Data vault | **Schema only** | `career-data-repo.ts`, migrations | Tables exist; vault UI partial |
| Stripe / Pro tier | **Scaffold** | `stripe-config.ts`, webhook | B2B program license instead |
| MedHub admin | **Built in-app** | `KpAdminGmePanel`, CSV import routes | Live API pull pending |
| MSF / CCC / ILP | **Built (GME pilot)** | See GME routes + Output Studio | Psychiatry first |

---

## User journey (files to review in order)

### 1. Marketing → signup
`src/app/page.tsx` → `MarketingHomePage.tsx` → `signup/page.tsx` → `auth/callback/route.ts`

### 2. Onboarding
`onboarding/page.tsx` → `Touchpoint1Onboarding.tsx` → `OnboardingDocumentsStep.tsx` → `GoalSettingPanel.tsx` → `api/v1/onboarding/touchpoint1/route.ts`

### 3. Dashboard (SOAP nav)
`app/app/dashboard/page.tsx` → `DashboardWorkspace.tsx` → wellbeing slices (no CHS gauge) → `MiniLattice.tsx` → `TopNavBar.tsx` + `soap-tab-spec.ts`

### 4. Mak capture
`MakPanel.tsx` → `api/v1/chat/message/route.ts` → `activity-capture.ts` → `FreeClassifier.ts` / `FISCMAKClassifier.ts`

### 5. Perspective / Objective / Subjective
`SubjectiveWorkspace.tsx` (PFI) → `ObjectiveWorkspace.tsx` → `AssessmentInsightsWorkspace.tsx`

### 6. Strategy / Goals
`StrategyWorkspace.tsx` → `GoalsWorkspace.tsx` → `api/v1/goals/route.ts`

### 7. Output Studio
`studio/page.tsx` → `OutputStudioWorkspace.tsx` → `api/v1/output/generate/route.ts` → `output-generation.ts`

---

## Evidence tiers (revised MVP — review against these)

| Tier | Data | Where in code | User-facing? |
|------|------|---------------|--------------|
| **1** | CV, enrichment, activities, s-index, MSF | `api-enrichment.ts`, `activity-capture.ts`, `output-generation.ts` | Yes — documents |
| **2** | PFI-16, UWES-9, effort % | `onboarding-instruments.ts`, `SubjectiveWorkspace.tsx` | Plain wellbeing slices only — no scores or percentiles |
| **3** | Self-ratings, Mak summaries, lattice self-scores | `LatticeView.tsx`, Mak prompts | Reflection only — never auto in promotion claims |
| **Internal** | CDI, CRI, IWQ, career health, job match % | `formulas.ts`, `career-health-view.ts`, `cv-metrics.ts` | **Never** — admin/internal API only |

---

## Formulas & composites (must review)

| Formula | File | Lines (approx) | User sees today? | Target |
|---------|------|----------------|------------------|--------|
| CRI (Career Resilience Index) | `src/lib/v2/formulas.ts` | — | Insights copy | Internal only |
| Job match score | `src/lib/v2/formulas.ts` | — | Jobs page | Defer GME |
| Career Health Score | `src/lib/v2/career-health-view.ts` | — | Dashboard hero | **Remove** |
| CDI weights | `src/lib/v2/cdi-weights.ts` | — | Partial | Internal only |
| CV s-index (regex) | `src/lib/v2/cv-metrics.ts` | — | Onboarding | **Replace** with activity s-index |
| IWQ / BITS | `src/lib/v2/cv-metrics.ts` | — | Internal | Internal only |
| Lattice heat | `src/lib/lattice.ts` | — | Lattice page | Keep; no demo data |
| Demo lattice | `demo-data.ts` | — | Unused in app; safe to delete |

---

## React components (94 files)

| File | Exports | Area |
|------|---------|------|
| `src/components/auth/AppleSignInButton.tsx` | AppleSignInButton | auth |
| `src/components/auth/AuthGuard.tsx` | AuthGuard | auth |
| `src/components/auth/GoogleSignInButton.tsx` | GoogleSignInButton | auth |
| `src/components/auth/MarketingAuthInput.tsx` | MarketingAuthInput | auth |
| `src/components/brand/CoachMakAvatar.tsx` | CoachMakAvatar | brand |
| `src/components/brand/CoachMakMark.tsx` | CoachMakMark | brand |
| `src/components/brand/CoachMakVoiceIcon.tsx` | CoachMakVoiceIcon | brand |
| `src/components/brand/MakHexMicButton.tsx` | MakHexMicButton | brand |
| `src/components/brand/NavIcon.tsx` | NavIcon | brand |
| `src/components/brand/SidebarDecoyIcon.tsx` | SidebarDecoyIcon | brand |
| `src/components/dashboard/DashboardAlerts.tsx` | DashboardAlerts | dashboard |
| `src/components/dashboard/DashboardDueNow.tsx` | DashboardDueNow | dashboard |
| `src/components/dashboard/DashboardGoalsGrid.tsx` | DashboardGoalCard, DashboardGoalsGrid | dashboard |
| `src/components/dashboard/DashboardMakButton.tsx` | DashboardMakButton | dashboard |
| `src/components/dashboard/DashboardWelcome.tsx` | DashboardWelcome | dashboard |
| `src/components/dashboard/HealthScoreCard.tsx` | HealthScoreCard | dashboard |
| `src/components/dashboard/MiniLattice.tsx` | MiniLattice | dashboard |
| `src/components/dashboard/ProfileSummaryCard.tsx` | ProfileSummaryCard | dashboard |
| `src/components/dashboard/TouchpointProgressStrip.tsx` | TouchpointProgressStrip | dashboard |
| `src/components/lattice/LatticeGrid.tsx` | LatticeGrid | lattice |
| `src/components/layout/AcademicSoapSectionGate.tsx` | AcademicSoapSectionGate | layout |
| `src/components/layout/AnalyticsProvider.tsx` | AnalyticsProvider, useAnalytics, useAnalyticsOptional | layout |
| `src/components/layout/AppShell.tsx` | useAppShell, AppShell | layout |
| `src/components/layout/EscalationResourcesPanel.tsx` | EscalationResourcesPanel | layout |
| `src/components/layout/IconSidebar.tsx` | IconSidebar | layout |
| `src/components/layout/MakPanel.tsx` | MakPanel | layout |
| `src/components/layout/PageShell.tsx` | PageShell | layout |
| `src/components/layout/SectionGateEntry.tsx` | SectionGateEntry | layout |
| `src/components/layout/ThemeProvider.tsx` | ThemeProvider | layout |
| `src/components/layout/TopNavBar.tsx` | TopNavBar | layout |
| `src/components/mak/MakChat.tsx` | MakChat | mak |
| `src/components/marketing/ConnectWithFiscmakHeading.tsx` | ConnectWithFiscmakHeading | marketing |
| `src/components/marketing/ContactFormCard.tsx` | ContactFormCard | marketing |
| `src/components/marketing/FaqSection.tsx` | FISCMAK_FAQ, FaqSection | marketing |
| `src/components/marketing/FiscmakNameSection.tsx` | FiscmakNameIntro, FiscmakNameBreakdown, FoundersNarrativeSection, FiscmakNameSection, AboutFiscmakContent | marketing |
| `src/components/marketing/HowItWorksSection.tsx` | HowItWorksSection | marketing |
| `src/components/marketing/InstitutionalPartnersSection.tsx` | InstitutionalPartnersSection | marketing |
| `src/components/marketing/MarketingAuthShell.tsx` | MarketingAuthShell | marketing |
| `src/components/marketing/MarketingFontShell.tsx` | MarketingFontShell | marketing |
| `src/components/marketing/MarketingFooter.tsx` | MarketingFooter | marketing |
| `src/components/marketing/MarketingHeader.tsx` | MarketingHeader | marketing |
| `src/components/marketing/MarketingHeroSection.tsx` | MarketingHeroSection | marketing |
| `src/components/marketing/MarketingHomePage.tsx` | MarketingHomePage | marketing |
| `src/components/marketing/MarketingPageShell.tsx` | MarketingPageShell | marketing |
| `src/components/onboarding/DashboardRevealOverlay.tsx` | DashboardRevealOverlay | onboarding |
| `src/components/onboarding/GoalSettingPanel.tsx` | GoalSettingPanel, defaultProposedGoals | onboarding |
| `src/components/onboarding/LayOfTheLandTour.tsx` | LayOfTheLandTour | onboarding |
| `src/components/onboarding/OnboardingDocumentsStep.tsx` | OnboardingDocumentsStep | onboarding |
| `src/components/onboarding/OnboardingGuard.tsx` | OnboardingGuard | onboarding |
| `src/components/onboarding/OnboardingWelcome.tsx` | OnboardingWelcome | onboarding |
| `src/components/onboarding/ReconciliationItemCard.tsx` | ReconciliationItemCard | onboarding |
| `src/components/onboarding/SpecialtyIntakeFields.tsx` | SpecialtyIntakeFields | onboarding |
| `src/components/onboarding/Tier1Onboarding.tsx` | Tier1Onboarding | onboarding |
| `src/components/onboarding/Tier2Onboarding.tsx` | Tier2Onboarding | onboarding |
| `src/components/onboarding/Touchpoint1Onboarding.tsx` | Touchpoint1Onboarding | onboarding |
| `src/components/profile/NpiRegistryPanel.tsx` | NpiRegistryPanel | profile |
| `src/components/profile/ProfileMenu.tsx` | ProfileMenu | profile |
| `src/components/profile/UserAvatar.tsx` | UserAvatar | profile |
| `src/components/settings/PremiumUpgradePanel.tsx` | PremiumUpgradePanel | settings |
| `src/components/studio/EvidenceChipNode.tsx` | — | studio |
| `src/components/studio/EvidenceDrawer.tsx` | EvidenceDrawer | studio |
| `src/components/studio/StudioLexicalEditor.tsx` | StudioLexicalEditor | studio |
| `src/components/studio/VersionHistoryPanel.tsx` | VersionHistoryPanel | studio |
| `src/components/ui/Badge.tsx` | Badge | ui |
| `src/components/ui/Button.tsx` | Button | ui |
| `src/components/ui/Card.tsx` | Card | ui |
| `src/components/ui/CardSection.tsx` | CardSectionHeader, CardSection | ui |
| `src/components/ui/EmptyState.tsx` | EmptyState | ui |
| `src/components/ui/Input.tsx` | Input | ui |
| `src/components/ui/LoadingSteps.tsx` | LoadingSteps | ui |
| `src/components/ui/MakDiscussLink.tsx` | MakDiscussLink | ui |
| `src/components/ui/MetricRow.tsx` | MetricRow | ui |
| `src/components/ui/ScoreDisplay.tsx` | ScoreDisplay | ui |
| `src/components/ui/StatusChip.tsx` | StatusChip | ui |
| `src/components/ui/StatusIndicator.tsx` | StatusIndicator | ui |
| `src/components/ui/TechnicalDetailToggle.tsx` | TechnicalDetailToggle, DataSourceTooltip | ui |
| `src/components/workspace/ActivitiesView.tsx` | ActivitiesView | workspace |
| `src/components/workspace/AnnualRefreshPanel.tsx` | AnnualRefreshPanel | workspace |
| `src/components/workspace/AssessmentInsightsWorkspace.tsx` | AssessmentInsightsWorkspace | workspace |
| `src/components/workspace/CareerDataReconcilePanel.tsx` | CareerDataReconcilePanel | workspace |
| `src/components/workspace/CareerDataVaultPanel.tsx` | CareerDataVaultPanel | workspace |
| `src/components/workspace/CareerStrategyGoalCard.tsx` | CareerStrategyGoalCard | workspace |
| `src/components/workspace/DashboardWorkspace.tsx` | DashboardWorkspace | workspace |
| `src/components/workspace/DocumentsView.tsx` | DocumentsView | workspace |
| `src/components/workspace/GoalsWorkspace.tsx` | GoalsWorkspace | workspace |
| `src/components/workspace/JobsWorkspace.tsx` | JobsWorkspace | workspace |
| `src/components/workspace/LatticeView.tsx` | LatticeView | workspace |
| `src/components/workspace/ObjectiveWorkspace.tsx` | ObjectiveWorkspace | workspace |
| `src/components/workspace/OutputStudioWorkspace.tsx` | OutputStudioWorkspace | workspace |
| `src/components/workspace/PathwaysExplorer.tsx` | PathwaysExplorer | workspace |
| `src/components/workspace/PromotionNarrativeWizard.tsx` | PromotionNarrativeWizard | workspace |
| `src/components/workspace/QuarterlyPulsePanel.tsx` | QuarterlyPulsePanel | workspace |
| `src/components/workspace/StrategyWorkspace.tsx` | StrategyWorkspace | workspace |
| `src/components/workspace/SubjectiveWorkspace.tsx` | SubjectiveWorkspace | workspace |


---

## App pages & layouts (27 files)

| Route | File |
|-------|------|
| `/about` | `src/app/about/page.tsx` |
| `/app/activities` | `src/app/app/activities/page.tsx` |
| `/app/assessment` | `src/app/app/assessment/page.tsx` |
| `/app/dashboard` | `src/app/app/dashboard/page.tsx` |
| `/app/documents` | `src/app/app/documents/page.tsx` |
| `/app/goals` | `src/app/app/goals/page.tsx` |
| `/app/jobs` | `src/app/app/jobs/page.tsx` |
| `/app/lattice` | `src/app/app/lattice/page.tsx` |
| `/app (layout)` | `src/app/app/layout.tsx` |
| `/app/mak` | `src/app/app/mak/page.tsx` |
| `/app/objective` | `src/app/app/objective/page.tsx` |
| `/app/onboarding` | `src/app/app/onboarding/page.tsx` |
| `/app/onboarding/tier2` | `src/app/app/onboarding/tier2/page.tsx` |
| `/app/output` | `src/app/app/output/page.tsx` |
| `/app` | `src/app/app/page.tsx` |
| `/app/plan` | `src/app/app/plan/page.tsx` |
| `/app/profile` | `src/app/app/profile/page.tsx` |
| `/app/settings` | `src/app/app/settings/page.tsx` |
| `/app/studio` | `src/app/app/studio/page.tsx` |
| `/app/subjective` | `src/app/app/subjective/page.tsx` |
| `/faq` | `src/app/faq/page.tsx` |
| `/institutions` | `src/app/institutions/page.tsx` |
| ` (layout)` | `src/app/layout.tsx` |
| `/login` | `src/app/login/page.tsx` |
| `/our-narrative` | `src/app/our-narrative/page.tsx` |
| `/` | `src/app/page.tsx` |
| `/signup` | `src/app/signup/page.tsx` |


---

## API routes (61 handlers)

| Method | Path | File |
|--------|------|------|
| POST | `//api/classify/activity` | `src/app/api/classify/activity/route.ts` |
| POST | `//api/documents/parse` | `src/app/api/documents/parse/route.ts` |
| POST | `//api/mak/message` | `src/app/api/mak/message/route.ts` |
| POST | `//api/output/generate` | `src/app/api/output/generate/route.ts` |
| GET, POST | `//api/v1/activities` | `src/app/api/v1/activities/route.ts` |
| GET | `//api/v1/analytics/dashboard` | `src/app/api/v1/analytics/dashboard/route.ts` |
| POST | `//api/v1/assessments/:id/answer` | `src/app/api/v1/assessments/[id]/answer/route.ts` |
| POST | `//api/v1/assessments/:id/complete` | `src/app/api/v1/assessments/[id]/complete/route.ts` |
| GET | `//api/v1/assessments/current` | `src/app/api/v1/assessments/current/route.ts` |
| GET | `//api/v1/assessments/history` | `src/app/api/v1/assessments/history/route.ts` |
| GET | `//api/v1/assessments/insights` | `src/app/api/v1/assessments/insights/route.ts` |
| POST | `//api/v1/assessments/start` | `src/app/api/v1/assessments/start/route.ts` |
| POST | `//api/v1/auth/login` | `src/app/api/v1/auth/login/route.ts` |
| POST | `//api/v1/auth/register` | `src/app/api/v1/auth/register/route.ts` |
| GET | `//api/v1/chat/history` | `src/app/api/v1/chat/history/route.ts` |
| POST | `//api/v1/chat/message` | `src/app/api/v1/chat/message/route.ts` |
| GET | `//api/v1/coaching/recommendations` | `src/app/api/v1/coaching/recommendations/route.ts` |
| POST | `//api/v1/contact` | `src/app/api/v1/contact/route.ts` |
| PATCH, DELETE | `//api/v1/documents/:documentId` | `src/app/api/v1/documents/[documentId]/route.ts` |
| GET, POST | `//api/v1/documents` | `src/app/api/v1/documents/route.ts` |
| POST | `//api/v1/enrichment/run` | `src/app/api/v1/enrichment/run/route.ts` |
| POST | `//api/v1/goals/confirm` | `src/app/api/v1/goals/confirm/route.ts` |
| POST | `//api/v1/goals/milestone` | `src/app/api/v1/goals/milestone/route.ts` |
| GET, POST | `//api/v1/goals` | `src/app/api/v1/goals/route.ts` |
| POST | `//api/v1/jobs/:id/save` | `src/app/api/v1/jobs/[id]/save/route.ts` |
| POST | `//api/v1/jobs/:id/view` | `src/app/api/v1/jobs/[id]/view/route.ts` |
| POST | `//api/v1/jobs/activate` | `src/app/api/v1/jobs/activate/route.ts` |
| GET | `//api/v1/jobs/matches` | `src/app/api/v1/jobs/matches/route.ts` |
| GET | `//api/v1/jobs/saved` | `src/app/api/v1/jobs/saved/route.ts` |
| POST | `//api/v1/jobs/sync` | `src/app/api/v1/jobs/sync/route.ts` |
| GET | `//api/v1/mempalace/context` | `src/app/api/v1/mempalace/context/route.ts` |
| POST | `//api/v1/mempalace/sync` | `src/app/api/v1/mempalace/sync/route.ts` |
| POST | `//api/v1/notifications/digest` | `src/app/api/v1/notifications/digest/route.ts` |
| GET | `//api/v1/npi` | `src/app/api/v1/npi/route.ts` |
| POST | `//api/v1/npi/skip` | `src/app/api/v1/npi/skip/route.ts` |
| POST | `//api/v1/npi/verify` | `src/app/api/v1/npi/verify/route.ts` |
| POST | `//api/v1/onboarding/compute` | `src/app/api/v1/onboarding/compute/route.ts` |
| POST | `//api/v1/onboarding/profile` | `src/app/api/v1/onboarding/profile/route.ts` |
| GET, POST | `//api/v1/onboarding/reconciliation` | `src/app/api/v1/onboarding/reconciliation/route.ts` |
| GET | `//api/v1/onboarding/status` | `src/app/api/v1/onboarding/status/route.ts` |
| POST | `//api/v1/onboarding/tier1/career-stage` | `src/app/api/v1/onboarding/tier1/career-stage/route.ts` |
| POST | `//api/v1/onboarding/tier1/specialty` | `src/app/api/v1/onboarding/tier1/specialty/route.ts` |
| GET | `//api/v1/onboarding/touchpoint1` | `src/app/api/v1/onboarding/touchpoint1/route.ts` |
| GET, POST | `//api/v1/output/generate` | `src/app/api/v1/output/generate/route.ts` |
| GET | `//api/v1/pathways/:id` | `src/app/api/v1/pathways/[id]/route.ts` |
| GET | `//api/v1/pathways` | `src/app/api/v1/pathways/route.ts` |
| GET | `//api/v1/promotion/checklist` | `src/app/api/v1/promotion/checklist/route.ts` |
| GET | `//api/v1/promotion/dossier/:id` | `src/app/api/v1/promotion/dossier/[id]/route.ts` |
| POST | `//api/v1/promotion/dossier/create` | `src/app/api/v1/promotion/dossier/create/route.ts` |
| GET | `//api/v1/promotion/dossier/current` | `src/app/api/v1/promotion/dossier/current/route.ts` |
| PUT | `//api/v1/promotion/narrative/:sectionId/save` | `src/app/api/v1/promotion/narrative/[sectionId]/save/route.ts` |
| GET | `//api/v1/promotion/readiness` | `src/app/api/v1/promotion/readiness/route.ts` |
| GET, POST | `//api/v1/subscription` | `src/app/api/v1/subscription/route.ts` |
| GET | `//api/v1/templates` | `src/app/api/v1/templates/route.ts` |
| GET, POST | `//api/v1/touchpoints/annual` | `src/app/api/v1/touchpoints/annual/route.ts` |
| GET, POST | `//api/v1/touchpoints/annual/session` | `src/app/api/v1/touchpoints/annual/session/route.ts` |
| GET, POST | `//api/v1/touchpoints/quarterly` | `src/app/api/v1/touchpoints/quarterly/route.ts` |
| GET, POST | `//api/v1/touchpoints/quarterly/session` | `src/app/api/v1/touchpoints/quarterly/session/route.ts` |
| GET, PUT | `//api/v1/users/me` | `src/app/api/v1/users/me/route.ts` |
| POST | `//api/v1/voice/transcribe` | `src/app/api/v1/voice/transcribe/route.ts` |
| POST | `//api/webhooks/stripe` | `src/app/api/webhooks/stripe/route.ts` |


---

## lib/v2 domain modules (73 files)

| Module | File | Review priority |
|--------|------|----------------|
| `FISCMAKClassifier.ts` | `src/lib/v2/FISCMAKClassifier.ts` | MEDIUM — Pro ontology classifier |
| `academic-profiles.ts` | `src/lib/v2/academic-profiles.ts` | Review |
| `activity-capture.ts` | `src/lib/v2/activity-capture.ts` | HIGH — activity log + lattice feed |
| `annual-mak-flow.ts` | `src/lib/v2/annual-mak-flow.ts` | Review |
| `annual-refresh.ts` | `src/lib/v2/annual-refresh.ts` | Review |
| `api-enrichment.ts` | `src/lib/v2/api-enrichment.ts` | Review |
| `api-helpers.ts` | `src/lib/v2/api-helpers.ts` | Review |
| `assessment-insights.ts` | `src/lib/v2/assessment-insights.ts` | Review |
| `career-alignment-tracking.ts` | `src/lib/v2/career-alignment-tracking.ts` | Review |
| `career-data-repo.ts` | `src/lib/v2/career-data-repo.ts` | Review |
| `career-data-schema.ts` | `src/lib/v2/career-data-schema.ts` | Review |
| `career-health-view.ts` | `src/lib/v2/career-health-view.ts` | HIGH — Career Health Score hero |
| `career-language.ts` | `src/lib/v2/career-language.ts` | Review |
| `career-recommendations.ts` | `src/lib/v2/career-recommendations.ts` | Review |
| `career-vault.ts` | `src/lib/v2/career-vault.ts` | Review |
| `cdi-weights.ts` | `src/lib/v2/cdi-weights.ts` | HIGH — internal CDI weights |
| `classifier-v2.ts` | `src/lib/v2/classifier-v2.ts` | Review |
| `classify-chat-message.ts` | `src/lib/v2/classify-chat-message.ts` | Review |
| `conversational-assessment-service.ts` | `src/lib/v2/conversational-assessment-service.ts` | Review |
| `conversational-assessment.ts` | `src/lib/v2/conversational-assessment.ts` | Review |
| `cv-metrics.ts` | `src/lib/v2/cv-metrics.ts` | HIGH — regex s-index, IWQ, BITS |
| `dashboard-architecture.ts` | `src/lib/v2/dashboard-architecture.ts` | Review |
| `dashboard-data.ts` | `src/lib/v2/dashboard-data.ts` | Review |
| `dashboard-mak-menu.ts` | `src/lib/v2/dashboard-mak-menu.ts` | Review |
| `dashboard-redesign.ts` | `src/lib/v2/dashboard-redesign.ts` | Review |
| `dashboard-snapshot.ts` | `src/lib/v2/dashboard-snapshot.ts` | Review |
| `db.ts` | `src/lib/v2/db.ts` | Review |
| `demo-store.ts` | `src/lib/v2/demo-store.ts` | Review |
| `document-upload.ts` | `src/lib/v2/document-upload.ts` | Review |
| `engagement-tracking.ts` | `src/lib/v2/engagement-tracking.ts` | Review |
| `ensure-app-user.ts` | `src/lib/v2/ensure-app-user.ts` | Review |
| `escalation-protocols.ts` | `src/lib/v2/escalation-protocols.ts` | Review |
| `formulas.ts` | `src/lib/v2/formulas.ts` | HIGH — CRI, job match composites |
| `free-classifier.ts` | `src/lib/v2/free-classifier.ts` | MEDIUM — Free tier classifier |
| `goal-framework.ts` | `src/lib/v2/goal-framework.ts` | Review |
| `goal-milestone-actions.ts` | `src/lib/v2/goal-milestone-actions.ts` | Review |
| `goal-milestone-tracking.ts` | `src/lib/v2/goal-milestone-tracking.ts` | Review |
| `goal-setting-mak-flow.ts` | `src/lib/v2/goal-setting-mak-flow.ts` | MEDIUM — Mak goal flow |
| `instrument-conversation-service.ts` | `src/lib/v2/instrument-conversation-service.ts` | Review |
| `invisible-work-taxonomy.ts` | `src/lib/v2/invisible-work-taxonomy.ts` | Review |
| `job-ingestion.ts` | `src/lib/v2/job-ingestion.ts` | Review |
| `mak-state-machine.ts` | `src/lib/v2/mak-state-machine.ts` | Review |
| `mempalace-external.ts` | `src/lib/v2/mempalace-external.ts` | Review |
| `metric-decline-tracking.ts` | `src/lib/v2/metric-decline-tracking.ts` | Review |
| `notification-service.ts` | `src/lib/v2/notification-service.ts` | Review |
| `npi-registry.ts` | `src/lib/v2/npi-registry.ts` | Review |
| `onboarding-compute.ts` | `src/lib/v2/onboarding-compute.ts` | Review |
| `onboarding-document-types.ts` | `src/lib/v2/onboarding-document-types.ts` | Review |
| `onboarding-flow.ts` | `src/lib/v2/onboarding-flow.ts` | Review |
| `onboarding-instruments.ts` | `src/lib/v2/onboarding-instruments.ts` | HIGH — PFI clusters |
| `onboarding-options.ts` | `src/lib/v2/onboarding-options.ts` | Review |
| `onboarding-touchpoint1.ts` | `src/lib/v2/onboarding-touchpoint1.ts` | Review |
| `output-generation.ts` | `src/lib/v2/output-generation.ts` | HIGH — document generation prompts |
| `promotion-narrative-sections.ts` | `src/lib/v2/promotion-narrative-sections.ts` | Review |
| `quarterly-mak-flow.ts` | `src/lib/v2/quarterly-mak-flow.ts` | Review |
| `quarterly-pulse.ts` | `src/lib/v2/quarterly-pulse.ts` | Review |
| `question-bank.ts` | `src/lib/v2/question-bank.ts` | Review |
| `reconcile-mak-flow.ts` | `src/lib/v2/reconcile-mak-flow.ts` | Review |
| `reconcile-mak-helpers.ts` | `src/lib/v2/reconcile-mak-helpers.ts` | Review |
| `section-mak-routes.ts` | `src/lib/v2/section-mak-routes.ts` | Review |
| `soap-tab-spec.ts` | `src/lib/v2/soap-tab-spec.ts` | Review |
| `spec-table-inventory.ts` | `src/lib/v2/spec-table-inventory.ts` | Review |
| `specialty-hierarchy.ts` | `src/lib/v2/specialty-hierarchy.ts` | Review |
| `stripe-config.ts` | `src/lib/v2/stripe-config.ts` | Review |
| `touchpoint-cadence.ts` | `src/lib/v2/touchpoint-cadence.ts` | Review |
| `touchpoint-eligibility.ts` | `src/lib/v2/touchpoint-eligibility.ts` | Review |
| `touchpoint-fetch.ts` | `src/lib/v2/touchpoint-fetch.ts` | Review |
| `touchpoint-mak-capture.ts` | `src/lib/v2/touchpoint-mak-capture.ts` | Review |
| `touchpoint-mak-orchestrator.ts` | `src/lib/v2/touchpoint-mak-orchestrator.ts` | Review |
| `touchpoint-side-effects.ts` | `src/lib/v2/touchpoint-side-effects.ts` | Review |
| `touchpoint-submit.ts` | `src/lib/v2/touchpoint-submit.ts` | Review |
| `types.ts` | `src/lib/v2/types.ts` | Review |
| `voice-transcription.ts` | `src/lib/v2/voice-transcription.ts` | Review |


---

## Other lib modules (28 files)

| Module | File |
|--------|------|
| `activities-storage.ts` | `src/lib/activities-storage.ts` |
| `annual-mak-client.ts` | `src/lib/annual-mak-client.ts` |
| `card-mak-prompts.ts` | `src/lib/card-mak-prompts.ts` |
| `classify.ts` | `src/lib/classify.ts` |
| `constants.ts` | `src/lib/constants.ts` |
| `dashboard-metrics.ts` | `src/lib/dashboard-metrics.ts` |
| `demo-data.ts` | `src/lib/demo-data.ts` |
| `demo-mode.ts` | `src/lib/demo-mode.ts` |
| `design-system.ts` | `src/lib/design-system.ts` |
| `documents.ts` | `src/lib/documents.ts` |
| `marketing-fonts.ts` | `src/lib/fonts/marketing-fonts.ts` |
| `goals.ts` | `src/lib/goals.ts` |
| `lattice.ts` | `src/lib/lattice.ts` |
| `mak-chatbot-states.ts` | `src/lib/mak-chatbot-states.ts` |
| `mak-conversations.ts` | `src/lib/mak-conversations.ts` |
| `mak-demo-replies.ts` | `src/lib/mak-demo-replies.ts` |
| `mak-greeting.ts` | `src/lib/mak-greeting.ts` |
| `mak-panel-preference.ts` | `src/lib/mak-panel-preference.ts` |
| `mak-sections.ts` | `src/lib/mak-sections.ts` |
| `profile-avatar.ts` | `src/lib/profile-avatar.ts` |
| `quarterly-mak-client.ts` | `src/lib/quarterly-mak-client.ts` |
| `studio-export.ts` | `src/lib/studio-export.ts` |
| `studio-versions.ts` | `src/lib/studio-versions.ts` |
| `subjective-storage.ts` | `src/lib/subjective-storage.ts` |
| `theme-preference.ts` | `src/lib/theme-preference.ts` |
| `database.ts` | `src/lib/types/database.ts` |
| `use-media-query.ts` | `src/lib/use-media-query.ts` |
| `utils.ts` | `src/lib/utils.ts` |


---

## Database & migrations

| Doc | Purpose |
|-----|---------|
| `docs/FISCMAK_PROJECT_INVENTORY.md` | Full table inventory + gap analysis |
| `docs/FISCMAK_V2_SCHEMA.sql` | Core V2 tables |
| `docs/migrations/20260522_activity_entries_v2.sql` | Activity log |
| `docs/migrations/20260521_career_data_schema.sql` | Career Data vault (49 tables) |
| `docs/migrations/20260523_core_ontology.sql` | Ontology for Pro classifier |
| `docs/migrations/20260524_user_subscriptions.sql` | Stripe subscriptions |
| `docs/exports/FISCMAK-supabase-full-schema.sql` | Full schema export |

---

## Mak / AI touchpoints (review prompts carefully)

| File | Role |
|------|------|
| `src/app/api/v1/chat/message/route.ts` | Main Mak orchestration (~600 lines) |
| `src/lib/card-mak-prompts.ts` | Per-section Mak discuss configs |
| `src/lib/v2/goal-setting-mak-flow.ts` | Goal-setting conversation |
| `src/lib/v2/quarterly-mak-flow.ts` | Quarterly pulse Mak |
| `src/lib/v2/annual-mak-flow.ts` | Annual refresh Mak |
| `src/lib/v2/reconcile-mak-flow.ts` | Career data reconciliation |
| `src/lib/v2/output-generation.ts` | Document prefill + Claude Haiku |
| `src/app/api/v1/output/generate/route.ts` | Output Studio API |

Model used today: `claude-3-5-haiku-20241022` (chat, output, CV parse)

---

## FISCMAK Admin Server (`../fiscmak-admin`)

| File | Lines | Purpose |
|------|------:|---------|
| `server.js` | 722 | MedHub client, CSV auto-mapper, quality checker, GME intake |
| `package.json` | — | Express + Anthropic + csv-parser |
| `QUICKSTART.md` | — | 5-min setup |
| `README.md` | — | Full API docs |

---

## Other export files in `docs/exports/`

| File | Contents |
|------|----------|
| `all-function-components.md` | **Full source** of all 94 React components |
| `FISCMAK-supabase-full-schema.sql` | Complete DB schema |
| `ontology-full-export.json` | Ontology tables JSON |
| `marketing-landing-full-code.md` | Marketing page code dump |
| `FISCMAK-env.template` | Env var reference |
| `supabase-reference.md` | Supabase setup notes |

---

## GME pivot — not yet in codebase

Build list for PD-facing product:

- [ ] `programs`, `program_members`, RBAC (PD vs trainee)
- [ ] MedHub CSV import → `evaluation_imports` table
- [ ] ACGME milestone self-assessment (22 subcompetencies)
- [ ] Pre-CCC summary PDF per resident
- [ ] Self vs external discrepancy view
- [ ] ILP co-production workflow
- [ ] Cohort dashboard (PD)
- [ ] NLP narrative synthesis with source quotes
- [ ] Wire `fiscmak-admin` import → Supabase → main app

---

## Quick open in Cursor

```
/Users/kristenpalmer/fiscmak/docs/FISCMAK_PRODUCT_REVIEW_MASTER.md
/Users/kristenpalmer/fiscmak/docs/exports/all-function-components.md
/Users/kristenpalmer/fiscmak/docs/FISCMAK_PROJECT_INVENTORY.md
/Users/kristenpalmer/fiscmak-admin/server.js
```

---

*Regenerate exports: run the generation script in `docs/exports/` or ask Cursor to refresh this file.*

FISCMAK AI Career Pathway Architecture
Layered physician-career intelligence for onboarding, evidence capture, institutional vocabulary, and Output Center personalization
Working Product Specification

Core thesis
FISCMAK should not treat a physician as a generic professional user. Each user carries a career-stage card that encodes training level, specialty, institution, practice setting, stage-specific pressures, local vocabulary, evidence needs, and pathway options. Onboarding creates the card. July 1 updates it for trainees. Every FISCMAK feature reads it.

Document Map
Strategic framing: why medicine needs career architecture after training
FISCMAK AI brain stack and persistent career-stage card
Onboarding, pathway cards, July 1 progression, and stage history
Medical student, resident, fellow, attending, retired, academic, community, hybrid, and industry pathway nuance
Academic ladder, community ladder, and industry/nontraditional career pathways
Institutional vocabulary: learning program culture without flattening individual experience
Follow-up question engine: how the AI learns local nuance over time
Output Center and dashboard behavior by stage
Privacy, surveillance guardrails, and institution-facing principles
Implementation-ready prompts, schemas, and test profile battery
1. Strategic Framing
The problem FISCMAK solves
Medicine invests heavily in producing clinically competent physicians through medical school, residency, and fellowship. But after training, physicians are often treated as finished products. Independent practice is treated as the end of development rather than the beginning of a less structured phase of professional growth.
Residency or fellowship completion creates clinical readiness. It does not automatically create career architecture. Physicians still need mentorship, sponsorship, feedback, negotiation support, promotion strategy, leadership development, career exploration, documentation of invisible work, and tools to translate daily work into evidence.
FISCMAK positioning
Medicine builds the physician. FISCMAK builds career infrastructure around the physician.

Big 4 / professional services analogy: use the scaffolding, not the culture
Professional services firms often build intentional talent-development systems: structured feedback, competency mapping, project histories, staffing strategy, sponsorship, promotion narratives, lateral movement, and leadership pipelines. Medicine can learn from the existence of this infrastructure without importing the worst parts of consulting culture.
Borrow from professional services
Reject from professional services
Competency maps and skill progression
Up-or-out pressure
Project/evidence histories
Constant performance surveillance
Mentorship and sponsorship structures
Burnout-as-status culture
Promotion-readiness narratives
Prestige obsession
Career lattices and lateral pathways
Utilization worship and human commodification
Structured feedback and coaching
Performative productivity and always-on norms

Guiding sentence
FISCMAK adapts the best of professional-services career architecture to medicine without importing the burnout, surveillance, or up-or-out logic that often comes with it.

2. FISCMAK AI Brain Stack
The AI should be layered. It should not answer from a single prompt or a single task label. Each response should synthesize identity, career stage, setting, institutional culture, invisible work, skills, evidence, career track, and strategic next use.
Layer
Question it answers
Purpose
Identity Layer
What is FISCMAK here to do?
Defines FISCMAK as physician career intelligence, not generic career advice.
World Model Layer
What world is the user operating inside?
Medical school, Match/SOAP, residency, fellowship, attending transitions, academic/community/hybrid/industry pathways.
User Stage Layer
Who is this person becoming?
Medical student, PGY, fellow, early attending, mid-career, late-career, retired.
Setting Layer
What culture and incentive system shapes the work?
Academic, community, private, safety-net, VA, rural, hybrid, consulting, health tech, policy, startup.
Activity Interpretation Layer
What happened beneath the surface?
Finds invisible work and hidden labor.
Skill Mapping Layer
What capability does this prove?
Maps to Self, Craft, and Impact skills.
Evidence Layer
How can this work be used?
CVs, promotion, interview stories, grants, teaching portfolios, job/fellowship applications.
Career Track Layer
What future does this support?
Clinician, educator, scholar, leader, founder, consultant, informaticist, advocate, executive.
Strategic Coaching Layer
What should the user do with this?
Document, scale, convert, publish, delegate, stop, share, or translate.
Output Layer
How should this be communicated?
Determines whether the response should be reflective, tactical, CV-ready, or strategic.

Master processing chain
User entry -> Career stage -> Practice setting -> Hidden context -> Invisible work -> Skills demonstrated -> Evidence created -> Career tracks supported -> Strategic next move -> User-facing output.

3. Persistent Career-Stage Card
The career-stage card is the context engine. It is created during onboarding, updated over time, and carried into every FISCMAK surface: Dashboard, Capture, Coach Mak, Evidence Vault, Skill Pulse, Career Lattice, and Output Center.
Field
Purpose
signup_type
General vs institution-affiliated user logic.
career_stage
Medical student, resident, fellow, attending, retired, other.
training_level
MS3, MS4, PGY1-PGY7, fellow year, early/mid/late attending.
specialty
Needed because PGY level has different meaning by specialty.
program_length_years
Prevents incorrect assumptions about graduation proximity.
institution_id
Links to institutional vocabulary and program culture memory.
practice_setting
Academic, community, private, safety-net, hybrid, industry, etc.
developmental_priorities
Stage-specific coaching focus.
next_transition_date
Commonly July 1 for trainees; different for attendings.
stage_history
Preserves longitudinal patterns rather than overwriting prior identity.
privacy_preferences
Determines what can be shared with institution or retained privately.

Example stage card: institution-affiliated PGY2 psychiatry resident
This is an institution-affiliated PGY2 psychiatry resident in a 4-year program. Interpret this user as early-to-mid training. They are likely developing autonomy, psychiatric formulation, consult/interdisciplinary communication, emergency psychiatry skills, psychotherapy exposure, feedback integration, teaching identity, scholarly activity, and early fellowship or career curiosity. Because the user is institution-affiliated, align support with developmental program structures such as ACGME milestones, mentorship, CCC language, scholarly activity, QI, and longitudinal professional development. Do not assume this user is close to graduation.
4. Onboarding and Longitudinal Progression
Onboarding should create the initial card, not interrogate the user
Onboarding should collect only enough information to generate a useful stage card. The system should then learn local nuance over time through targeted follow-up questions during capture and coaching.
User type
Essential onboarding fields
Medical student
MS year, intended/exploring specialty, application cycle, rotations, institution status, primary goal.
Resident/fellow
PGY/fellow year, specialty, program length, institution, expected graduation, fellowship/job interest, scholarly/QI requirements.
Attending
Years post-training, current setting, academic/community/hybrid/industry role, promotion track if any, leadership role, desired outputs.
Retired/emeritus
Retirement status, current contributions, mentorship/advisory interests, legacy goals.

July 1 advancement logic
For trainees, July 1 should trigger an academic-year transition check. Test users can auto-advance, but real users should confirm because off-cycle training, research years, leave, remediation, transfers, specialty changes, preliminary years, fellowship transitions, and delayed graduation are common.
Current status
Default July 1 action
MS3
Suggest MS4 transition.
MS4
Ask whether they matched, SOAPed, entered PGY1, took a gap/research year, or are reapplying.
PGY1
Suggest PGY2 transition.
PGY2
Suggest PGY3 transition.
PGY3+
Determine next stage using specialty and program length; may be senior resident, fellow, or attending.
Fellow
Advance fellowship year or transition to attending if confirmed.
Early/mid/late attending
Do not use July 1 PGY logic; recalculate by years post-training.
Retired
No stage advancement; focus on legacy/advisory/mentorship identity.

Critical rule
PGY level is not equivalent to career stage unless specialty and program length are known. A PGY3 may be final-year in one specialty and mid-training in another.

5. Medical Student, Resident, Fellow, Attending, and Retired Pathways
Stage
Likely pressures
FISCMAK emphasis
MS3
Clinical rotations, specialty exploration, subjective evaluation, early letters, identity formation.
Specialty fit, reflection, feedback capture, early evidence building.
MS4
ERAS, interviews, rank lists, Match anxiety, away rotations, SOAP contingency.
Application narrative, interview coaching, specialty identity, decision support.
PGY1
Transition from student to doctor, supervision, fear of errors, call, documentation, identity shock.
Survival as evidence, reliability, communication, adaptation, early reflection.
PGY2
Increasing autonomy, deeper specialty identity, feedback integration, call/rotation complexity.
Autonomy growth, clinical confidence, hidden work capture, early leadership.
PGY3
Can be final year or mid-training depending specialty.
Interpret through program length; support seniority, teaching, fellowship/job planning.
PGY4-PGY5+
Senior/chief training, fellowship, board prep, transition to attending, advanced specialty mastery.
Evidence packaging, leadership narrative, job/fellowship/promotion readiness.
Fellow
Subspecialty identity, delayed income, niche expertise, academic or job positioning.
Subspecialty evidence, mentorship, transition planning, career design.
Early attending 0-7 years
Autonomy, board certification, contracts, RVUs, mentorship gaps, first-job fit, identity consolidation.
Career architecture, negotiation, annual review, promotion readiness, confidence.
Mid-career 8-20 years
Plateau, leadership, promotion, burnout, reinvention, invisible work overload.
Leverage, strategic subtraction, promotion, leadership evidence, reinvention.
Late career 20+ years
Legacy, succession, mentorship, governance, reduced clinical load.
Legacy capture, mentorship record, institutional impact, advisory identity.
Retired
Identity transition, advisory contributions, mentoring, writing, consulting.
Legacy portfolio, wisdom transfer, advisory/mentorship materials.

6. Academic Ladder, Community Ladder, and Other Industry Pathways
FISCMAK should understand that “career ladder” means different things in different settings. Academic medicine often has a prescribed ladder, though every institution differs. Community medicine often has a less prescribed journey. Industry and nontraditional paths are often opaque without exposure, exploration, and translation of physician skills into nonmedical language.
Academic medicine ladder
Academic medicine may appear more structured than community practice because it often includes formal faculty ranks, promotion tracks, teaching expectations, scholarship requirements, committee work, and institutional review processes. But each institution defines tracks, promotion criteria, timelines, and evidence differently.
Academic stage/rank
Typical evidence valued
Nuance FISCMAK should understand
Instructor / Clinical Instructor / Fellow-to-Faculty
Clinical teaching, early scholarship, mentorship, service, board eligibility/certification.
Often ambiguous and transitional; users need help converting trainee work into faculty evidence.
Assistant Professor / Early Faculty
Teaching, clinical excellence, publications, presentations, QI, curriculum work, grants, committee citizenship.
Promotion clock and expectations vary widely by institution and track. Invisible work can become underrecognized service.
Associate Professor / Established Faculty
Sustained scholarship, leadership, mentorship, regional/national reputation, program building.
Requires evidence of independence, impact, and external recognition; sponsorship becomes critical.
Professor / Senior Faculty
National/international reputation, major leadership, sustained scholarly/educational/clinical impact, mentorship legacy.
Legacy, succession, and institutional stewardship become central.
Leadership roles
Program director, clerkship director, division chief, medical director, vice chair, chair.
Titles do not automatically capture workload; leadership impact must be translated into outcomes and evidence.

Academic track type
Common focus
FISCMAK translation need
Clinical track
Clinical excellence, teaching, quality, service, patient care, local/regional reputation.
Translate clinical and operational work into promotion-ready evidence.
Clinician-educator track
Teaching, curriculum, assessment, mentorship, educational scholarship.
Convert informal teaching and program work into teaching portfolio, scholarship, and leadership narrative.
Research / tenure track
Grants, publications, independent research program, national reputation.
Connect daily clinical/education insights to scholarship and funding narratives.
Clinical scholar / hybrid track
Clinical work plus scholarship, QI, education, leadership.
Help users show coherence across mixed outputs.
Administrative/leadership track
Program building, operations, service lines, workforce, quality, strategy.
Translate systems work into executive evidence and institutional impact.

Academic nuance
Academic ladders are more visible than community ladders, but they are not universal. Every institution has its own promotion criteria, track language, documentation expectations, committee norms, and hidden rules. FISCMAK should ask what counts locally and translate work into both local and portable evidence.


Community medicine ladder
Community physicians often have less prescribed career architecture. There may be fewer formal titles, fewer promotion ladders, and less built-in mentorship. Yet community physicians perform high-value work across access, reliability, team stabilization, workflow repair, service-line growth, quality improvement, local leadership, and patient/community trust.
Community path
Typical development
FISCMAK translation need
Early employed physician
Learning system workflows, building patient panel, meeting productivity expectations, board certification, clinical confidence.
First-job evidence, workflow adaptation, patient access, reliability, negotiation, mentorship mapping.
Established clinician
Clinical mastery, referral relationships, informal leadership, team trust, productivity, patient outcomes.
Document longitudinal impact, patient access, operations, teaching, mentorship, and local reputation.
Lead physician / site lead
Scheduling, operations, team management, quality, peer support, conflict resolution.
Translate operational and people leadership into career evidence.
Medical director
Service-line oversight, quality metrics, workforce, policy, budget, strategic planning.
Build executive narrative, leadership resume, annual review, and institutional impact summaries.
Independent/private practice owner
Business operations, staffing, revenue cycle, compliance, patient relationships, marketing, strategic growth.
Translate entrepreneurship and operations into leadership, business, and systems evidence.
Rural/safety-net/community advocate
Broad scope, resourcefulness, access, community trust, social determinants, advocacy.
Capture complexity, innovation under constraint, community impact, and systems navigation.

Community nuance
Community physicians may have even less of a prescribed journey than academic physicians. The absence of a formal ladder does not mean the absence of growth. FISCMAK should help build the missing ladder from evidence of clinical reliability, operational impact, local leadership, service development, mentorship, and community trust.

Hybrid and industry/nontraditional pathways
Other industry paths can be difficult to navigate because many physicians have limited exposure to them during training. The AI should help users explore possibilities without implying that leaving or reducing clinical care is failure. These pathways may be expansions of medical expertise into systems, strategy, technology, policy, communication, and leadership.
Pathway
Common roles
Translation challenge
Consulting / strategy
Clinical consultant, healthcare strategy, operations, workforce, implementation.
Translate clinical complexity, systems thinking, stakeholder communication, and problem-solving into business language.
Health tech / AI / digital health
Clinical product advisor, product manager, clinical AI evaluator, workflow designer.
Translate frontline pain points into product requirements, safety considerations, user needs, and adoption strategy.
Informatics
CMIO track, clinical informaticist, EHR optimization, data governance.
Translate workflow repair and data/system insights into informatics evidence.
Pharma / medical affairs
Medical science liaison, medical director, clinical development, safety, education.
Translate specialty expertise, communication, evidence appraisal, and cross-functional work.
Insurance / utilization / value-based care
Medical director, utilization review, population health, quality.
Translate clinical judgment into policy, quality, access, and resource stewardship.
Policy / public health
Health policy advisor, public health leader, advocacy, government/nonprofit.
Translate patient-level patterns into systems and policy impact.
Entrepreneurship / founder
Startup founder, clinical innovation, education platform, coaching/product business.
Translate lived problem, market insight, prototype, pilot, and evidence into venture narrative.
Media / writing / speaking
Medical communicator, educator, speaker, thought leader.
Translate expertise into public voice, educational impact, credibility, and audience trust.

Industry nuance
For industry and nontraditional paths, the AI should function as a translator and exposure engine: naming transferable skills, suggesting low-risk exploration steps, identifying missing vocabulary, and helping users build a coherent narrative before they have formal titles in that space.

7. Specialty and Program-Length Nuance
Specialty
Typical residency length
Important nuance
Internal Medicine
3 years
PGY3 often final year; fellowship decisions often begin early.
Pediatrics
3 years
PGY3 often final year; general pediatrics vs fellowship decision.
Family Medicine
3 years
Broad outpatient/community/rural/OB/sports pathways.
Psychiatry
4 years
PGY3/PGY4 often identity refinement, outpatient, therapy, fellowship/job planning.
Emergency Medicine
3-4 years
Shift-based acuity, procedures, burnout, fellowship optionality.
OB/GYN
4 years
Surgical/clinical hybrid, high acuity, fellowship competitiveness.
General Surgery
5 years
PGY5 often chief year; operative autonomy and fellowship/job transition.
Neurosurgery
7 years
Long training; hierarchy, endurance, research, technical identity.
Radiology
5+ including prelim/TY
Delayed specialty immersion; fellowship common.
Anesthesiology
4 including intern year
Procedural/perioperative/ICU/pain pathways.
Dermatology
4 including prelim/TY
Highly competitive; procedural, clinic, research, business pathways.
Pathology
4 years
AP/CP tracks, fellowship common, diagnostic/lab leadership.

8. Institutional Vocabulary and Program Culture Memory
FISCMAK should be inquisitive about each user’s local training and work environment. Terms like call, long call, short call, night float, jeopardy, moonlighting, rotation, consults, recruitment, education committee, QI, didactics, chief role, supervision, and service mean different things by specialty, institution, site, and PGY level.
Key principle
FISCMAK should learn the language of a program while preserving the individuality of each physician’s experience inside that program.

Vocabulary layer
What it captures
Why it matters
Individual vocabulary
What a term means for this user.
Preserves personal experience, emotional load, and context.
Institutional vocabulary
What a term usually means across a program.
Reduces repeated onboarding and helps the AI understand program culture.
Episode-level detail
What happened this time.
Prevents rigid assumptions and captures variation.
External translation
How to describe the local term to outsiders.
Improves CVs, applications, promotion packets, resumes, and interviews.

Local term
Follow-up question
Possible external translation
Long call / short call
What does that include in your program: admissions, consults, cross-cover, ED evaluations, or overnight responsibility?
Urgent clinical coverage involving triage, assessment, documentation, coordination, and handoffs.
Moonlighting
Is it internal or external, paid, supervised or independent, and what clinical setting?
Additional clinical duty demonstrating autonomy, workflow adaptation, and risk management.
Rotation
What service/site and what were your main responsibilities?
Structured clinical assignment with specialty-specific patient care and team responsibilities.
Recruitment committee
Were you reviewing applicants, hosting, interviewing, advising, organizing, or representing the program?
Program representation, candidate advising, mentorship, and institutional citizenship.
Education committee
Are you designing curriculum, representing residents, reviewing didactics, or giving feedback?
Curriculum development, learner advocacy, program improvement, and educational leadership.
QI project
Did you identify the problem, collect data, change workflow, or present outcomes?
Quality improvement, systems analysis, workflow redesign, and outcome-oriented leadership.

Institution-facing doctrine
Institutional vocabulary captures shared context, not private confession. It should be developmental, aggregated, and non-punitive.

9. Follow-Up Question Engine
The AI should ask targeted follow-up questions when a term is ambiguous, locally specific, emotionally loaded, repeated, or likely to carry evidence value. It should ask one or two questions at a time, not interrogate the user.
User mentions
AI should ask
Call / short call / long call
What kind of call is this in your program, how long is it, and what services are covered?
Rotation
What site/service was this and what were your main responsibilities?
Moonlighting
Was it internal/external, supervised/independent, paid, and what clinical setting?
Committee
What role did you play: member, organizer, representative, leader, or advocate?
Recruitment
Were you interviewing, hosting, reviewing, advising, giving tours, or organizing?
Didactics
Were you attending, teaching, designing, evaluating, or giving feedback?
Mentorship
Was this formal or informal, one-time or recurring, peer or hierarchical?
Burnout/strain
Was the strain from volume, acuity, schedule, culture, moral distress, documentation, or lack of control?
Conflict
Was this interpersonal, systems-based, ethical, supervisory, or patient/family-related?

Ask, then remember
The system should not keep asking the same question forever. If a user or institution defines a term, FISCMAK should reuse that context while still checking whether a specific episode differs.

10. Stage-Aware Product Surfaces
Dashboard language by stage
Stage
Dashboard question
MS3
What clinical experiences are shaping your specialty direction?
MS4
What story are you bringing into residency interviews?
PGY1
What are you learning about becoming a doctor?
PGY2
Where are you gaining autonomy?
PGY3
What patterns are emerging in your clinical identity?
Senior resident / fellow
What evidence are you carrying into your next role?
Early attending
What kind of physician are you becoming now that training is over?
Mid-career
What work deserves more leverage, visibility, or boundaries?
Late-career
What legacy are you building or transferring?
Retired
What wisdom, mentorship, or contribution do you want to preserve?

Output Center by stage
Stage
Output Center priorities
MS3
Specialty reflection summaries, rotation feedback, early CV, letter-writer notes, specialty-fit reflections.
MS4
ERAS language, interview answers, personal statement, rank-list reflection, SOAP contingency materials.
PGY1
Learning portfolio, milestone reflection, early CV update, feedback tracker, intern-year growth summary.
PGY2-PGY3
CV bullets, teaching portfolio, scholarly/QI tracking, fellowship exploration, leadership examples, mentorship logs.
Senior resident / fellow
Fellowship/job applications, attending CV, academic CV, cover letters, teaching statement, negotiation prep.
Early attending
Annual review packet, board certification plan, promotion readiness, mentorship map, job negotiation, first-year reflection.
Mid-career
Promotion packet, leadership bio, executive resume, LinkedIn refresh, program impact summary, consulting/industry transition materials.
Late-career
Legacy portfolio, succession planning, institutional impact summary, mentorship record, advisory profile.
Retired
Legacy narrative, consulting/advisory bio, mentorship profile, memoir/reflection archive.

11. Privacy and Institution Guardrails
FISCMAK should support institutions without becoming surveillance infrastructure. Institution-affiliated use should help programs support growth, mentorship, scholarship, career development, and culture awareness while protecting private reflections and individual nuance.
Allow / encourage
Avoid / prohibit
Developmental stage cards
Punitive performance monitoring from raw reflections
Aggregated and de-identified patterns
Private venting or sensitive disclosures visible to program leadership without consent
Shared vocabulary and context
Flattening one user’s experience into institutional truth
User-controlled sharing of outputs
Default institution access to all logs
Mentorship and career support
Using invisible work capture to demand more unpaid work
Program-level improvement signals
Ranking residents by emotional burden or invisible labor

Privacy sentence
FISCMAK should help institutions understand development patterns without turning individual reflection into surveillance.

12. Test Profile Battery
Shared test credentials should not be hardcoded in production documentation or source code. Store any shared testing password in a secure secrets manager or test environment configuration.
General signup test user
Stage
TESTGEN00
MS3 medical student
TESTGEN0
MS4 medical student
TESTGEN1
PGY1 resident
TESTGEN2
PGY2 resident
TESTGEN3
PGY3 resident
TESTGEN4
PGY4 resident
TESTGEN5
PGY5 resident/fellow-level trainee
TESTGEN6
Early attending
TESTGEN7
Mid-career attending
TESTGEN8
Late-career attending
TESTGEN9
Retired physician

Institution-affiliated test user
Stage
TEST00
MS3 medical student
TEST0
MS4 medical student
TEST1
PGY1 resident
TEST2
PGY2 resident
TEST3
PGY3 resident
TEST4
PGY4 resident
TEST5
PGY5 resident/fellow-level trainee
TEST6
Early attending
TEST7
Mid-career attending
TEST8
Late-career attending
TEST9
Retired physician

13. Implementation-Ready Master Prompt
You are FISCMAK, a physician career intelligence system.

Base purpose: Help physicians capture invisible work, translate daily activity into career evidence, and build intentional career trajectories across clinical, academic, community, hybrid, leadership, entrepreneurial, and nontraditional roles.

User pathway context: {{dynamic_user_pathway_context}}

Task: {{user_current_task}}

Reasoning requirements: Interpret the user through career stage, training level, specialty, program length, signup type, practice setting, institutional culture, local vocabulary, hidden curriculum, invisible work, demonstrated skills, evidence potential, career tracks, and strategic next use.

Important: PGY level alone is not enough. Always interpret PGY level through specialty and program length. Institution-affiliated users should receive developmentally supportive guidance aligned with program structures, not surveillance or punitive evaluation. Local program vocabulary should be learned over time but never treated as a single institutional truth.

Output: Return a concise user-facing response that explains what the activity reflects, why it matters, what skills it demonstrates, what evidence it could become, what career tracks it supports, and what next step may be useful.
14. Example Data Schemas
Recommended architecture
Do not train a separate AI for every profile. Store structured user data, generate a dynamic pathway context card, retrieve relevant stage/specialty/institution rules, and pass those into the AI for each task.

{   "user_id": "TEST2",   "signup_type": "institution_affiliated",   "career_stage": "resident",   "training_level": "PGY2",   "specialty": "psychiatry",   "program_length_years": 4,   "institution_id": "UH_Psychiatry",   "practice_setting": "academic_medical_center",   "current_stage_card": "institution_psychiatry_pgy2",   "next_stage_card": "institution_psychiatry_pgy3",   "expected_stage_advance_date": "2026-07-01",   "auto_advance_policy": "confirm_first",   "stage_history": [     {"stage": "PGY1", "start_date": "2025-07-01", "end_date": "2026-06-30"},     {"stage": "PGY2", "start_date": "2026-07-01", "end_date": null}   ],   "privacy_preferences": {     "private_reflections": true,     "share_selected_outputs": true,     "allow_deidentified_institutional_vocabulary": true   } }
15. Final Product Doctrine
Onboarding creates the career-stage card.
July 1 updates it for trainees, with confirmation for real users.
Every FISCMAK feature reads it.
Local vocabulary is learned over time and translated into portable career evidence.
Institutional culture is captured as a shared pattern, not a single truth.
Academic ladders, community ladders, and industry pathways are all valid but require different evidence logic.
Community medicine may have less prescribed structure, so FISCMAK should help build the missing ladder from real work and impact.
Industry/nontraditional pathways require exposure, exploration, and translation of physician skills into new language.
FISCMAK should adapt career architecture from professional services without importing burnout, surveillance, up-or-out pressure, or productivity worship.
The goal is not more work. The goal is making already-existing work visible, usable, and strategically aligned.
One-line summary
FISCMAK should learn where a physician is, what their system calls things, what their work actually means, and how to turn that work into evidence for the path they are building.


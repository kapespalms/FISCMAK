-- FISCMAK Database Query Reference
-- PostgreSQL 14+ with JSON support

-- ============================================================================
-- 1. USER MANAGEMENT
-- ============================================================================

-- Create a new user (Tier 1 onboarding)
INSERT INTO users (user_id, email, name, specialty, career_stage, mempalace_id, created_at)
VALUES (gen_random_uuid(), 'doctor@example.com', 'Dr. Jane Smith', 'Cardiology', 'Fellow', NULL, NOW())
RETURNING user_id, email, created_at;

-- Get user profile with career readiness index
SELECT 
  u.user_id,
  u.name,
  u.specialty,
  u.career_stage,
  u.cv_uploaded,
  u.last_active,
  COALESCE(a.avg_score, 0) as assessment_avg,
  CASE WHEN u.cv_uploaded THEN 100 ELSE 0 END as cv_completeness,
  CASE WHEN u.cv_uploaded AND a.avg_score > 60 THEN 80 ELSE 50 END as pathway_clarity,
  ROUND(
    (COALESCE(a.avg_score, 0) * 0.4) + 
    (CASE WHEN u.cv_uploaded THEN 100 ELSE 0 END * 0.3) +
    (CASE WHEN u.cv_uploaded AND a.avg_score > 60 THEN 80 ELSE 50 END * 0.3)
  ) as career_readiness_index
FROM users u
LEFT JOIN (
  SELECT user_id, AVG(score) as avg_score 
  FROM career_assessments 
  WHERE score IS NOT NULL 
  GROUP BY user_id
) a ON u.user_id = a.user_id
WHERE u.user_id = $1;

-- Update user last active timestamp
UPDATE users SET last_active = NOW() WHERE user_id = $1;

-- Get all users by career stage
SELECT user_id, name, specialty, career_stage, created_at
FROM users
WHERE career_stage = $1  -- 'Fellow', 'Attending', 'Student'
ORDER BY created_at DESC;

-- ============================================================================
-- 2. ASSESSMENT MANAGEMENT
-- ============================================================================

-- Save assessment responses (Tier 1, Touchpoint N)
INSERT INTO career_assessments 
  (assessment_id, user_id, touchpoint_number, question_category, questions_answered, created_at)
VALUES 
  (gen_random_uuid(), $1, 1, 'BURNOUT', 
   '[{"q_id": "Q001", "question": "I feel emotionally exhausted", "answer": 4}, 
     {"q_id": "Q002", "question": "I feel cynical about work", "answer": 3}]'::jsonb,
   NOW())
RETURNING assessment_id, created_at;

-- Mark assessment as complete and store score
UPDATE career_assessments 
SET 
  score = $2,  -- Calculated by app
  completed_at = NOW()
WHERE assessment_id = $1
RETURNING score, completed_at;

-- Get all assessments for a user
SELECT 
  assessment_id,
  touchpoint_number,
  question_category,
  score,
  completed_at,
  EXTRACT(DAY FROM NOW() - completed_at) as days_ago
FROM career_assessments
WHERE user_id = $1
ORDER BY touchpoint_number ASC;

-- Calculate assessment trend (burnout tracking)
SELECT 
  touchpoint_number,
  question_category,
  score,
  completed_at,
  LAG(score) OVER (ORDER BY touchpoint_number) as prev_score,
  (score - LAG(score) OVER (ORDER BY touchpoint_number)) as score_change
FROM career_assessments
WHERE user_id = $1 AND question_category = 'BURNOUT'
ORDER BY touchpoint_number;

-- Get users with concerning burnout signals (score > 70)
SELECT 
  u.user_id,
  u.name,
  u.specialty,
  a.score,
  a.completed_at,
  DATEDIFF(DAY, a.completed_at, NOW()) as days_since_assessment
FROM users u
JOIN career_assessments a ON u.user_id = a.user_id
WHERE a.question_category = 'BURNOUT' AND a.score > 70
  AND a.completed_at > NOW() - INTERVAL '30 days'
ORDER BY a.score DESC;

-- ============================================================================
-- 3. DOCUMENT MANAGEMENT
-- ============================================================================

-- Store uploaded document (Tier 2 onboarding)
INSERT INTO documents 
  (document_id, user_id, document_type, file_url, extracted_text, metadata, uploaded_at)
VALUES 
  (gen_random_uuid(), $1, 'CV', 
   's3://bucket/user123/cv_john_smith.pdf',
   'Dr. John Smith\nCardiology Fellowship...',
   '{"institutions": ["Johns Hopkins", "Mayo Clinic"], 
     "years_experience": 8, 
     "skills": ["interventional", "echocardiography"]}'::jsonb,
   NOW())
RETURNING document_id, uploaded_at;

-- Get user's CV extracted data
SELECT 
  document_id,
  document_type,
  metadata->>'institutions' as institutions,
  metadata->>'years_experience' as experience,
  metadata->'skills' as skills,
  uploaded_at
FROM documents
WHERE user_id = $1 AND document_type = 'CV'
ORDER BY uploaded_at DESC
LIMIT 1;

-- ============================================================================
-- 4. CAREER PATHWAYS
-- ============================================================================

-- Get all pathways for a specialty
SELECT 
  pathway_id,
  specialty,
  pathway_type,
  description,
  salary_range,
  job_market_demand,
  created_at
FROM pathways
WHERE specialty = $1  -- e.g., 'Cardiology'
ORDER BY pathway_type;

-- Get pathway with salary and demand info
SELECT 
  p.pathway_id,
  p.specialty,
  p.pathway_type,
  p.salary_range,
  p.job_market_demand,
  COUNT(j.job_id) as open_positions
FROM pathways p
LEFT JOIN jobs j ON 
  j.specialty = p.specialty AND 
  j.job_type LIKE CONCAT('%', p.pathway_type, '%')
WHERE p.specialty = $1
GROUP BY p.pathway_id, p.specialty, p.pathway_type, p.salary_range, p.job_market_demand;

-- ============================================================================
-- 5. JOB MATCHING
-- ============================================================================

-- Get job opportunities matching user profile
SELECT 
  j.job_id,
  j.title,
  j.location,
  j.salary,
  j.source,
  ROUND(
    (CASE WHEN j.specialty = u.specialty THEN 1.0 ELSE 0.7 END) * 0.5 +
    (CASE WHEN j.salary BETWEEN u.salary_min AND u.salary_max THEN 1.0 ELSE 0.7 END) * 0.2 +
    (CASE WHEN j.location = u.preferred_location THEN 1.0 ELSE 0.5 END) * 0.2 +
    (CASE WHEN j.growth_potential = 'HIGH' THEN 1.0 ELSE 0.5 END) * 0.1
  ) * 100 as match_score
FROM jobs j
CROSS JOIN users u
WHERE u.user_id = $1
  AND j.posted_date > NOW() - INTERVAL '30 days'
  AND (j.specialties @> ARRAY[u.specialty] OR j.title ILIKE CONCAT('%', u.specialty, '%'))
ORDER BY match_score DESC
LIMIT 10;

-- Save job match for user
INSERT INTO user_job_matches (user_id, job_id, match_score, viewed_at)
VALUES ($1, $2, $3, NOW())
ON CONFLICT (user_id, job_id) DO UPDATE
SET viewed_at = NOW();

-- Get top job matches for user by match score
SELECT 
  j.job_id,
  j.title,
  j.location,
  j.salary,
  j.institution,
  j.description,
  jm.match_score,
  jm.viewed_at,
  CASE WHEN jm.saved_at IS NOT NULL THEN true ELSE false END as is_saved
FROM jobs j
JOIN user_job_matches jm ON j.job_id = jm.job_id
WHERE jm.user_id = $1
ORDER BY jm.match_score DESC, j.posted_date DESC;

-- ============================================================================
-- 6. MEMPALACE INTEGRATION
-- ============================================================================

-- Store coaching memory (career context)
INSERT INTO mempalace_exports 
  (export_id, user_id, coaching_summary, key_facts, preferences, career_evolution, created_at)
VALUES 
  (gen_random_uuid(), $1,
   'Dr. Smith is exploring a pivot from clinical practice to medical education. 
    Strong background in cardiology with 8 years experience. Interest in curriculum development.',
   '{"current_title": "Interventional Cardiologist",
     "career_goals": ["Medical education", "Curriculum development"],
     "burnout_signals": "Moderate",
     "mentorship_interests": ["Teaching", "QI projects"]}'::jsonb,
   '{"location_preference": "Northeast",
     "salary_expectations": "180000-220000",
     "work_life_balance_priority": "High"}'::jsonb,
   '{"initial_stage": "Attending",
     "pivot_initiated": "Month 2",
     "progression": "Career redirection pathway"}'::jsonb,
   NOW())
RETURNING export_id, created_at;

-- Retrieve latest coaching memory for user
SELECT 
  coaching_summary,
  key_facts,
  preferences,
  career_evolution,
  created_at
FROM mempalace_exports
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT 1;

-- ============================================================================
-- 7. ANALYTICS & REPORTING
-- ============================================================================

-- Onboarding funnel metrics
SELECT 
  'Tier 1 Complete' as stage,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM users), 2) as percentage
FROM users
UNION ALL
SELECT 
  'Tier 2 Complete' as stage,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM users), 2) as percentage
FROM users
WHERE cv_uploaded = true
UNION ALL
SELECT 
  'Assessment Started' as stage,
  COUNT(DISTINCT user_id) as count,
  ROUND(COUNT(DISTINCT user_id) * 100.0 / (SELECT COUNT(*) FROM users), 2) as percentage
FROM career_assessments
WHERE touchpoint_number >= 1;

-- Engagement metrics by career stage
SELECT 
  u.career_stage,
  COUNT(DISTINCT u.user_id) as total_users,
  COUNT(DISTINCT CASE WHEN u.cv_uploaded THEN u.user_id END) as cv_uploaded,
  COUNT(DISTINCT a.user_id) as assessment_participants,
  ROUND(AVG(a.score), 1) as avg_assessment_score,
  ROUND(AVG(EXTRACT(DAY FROM NOW() - u.last_active))) as avg_days_since_active
FROM users u
LEFT JOIN career_assessments a ON u.user_id = a.user_id
GROUP BY u.career_stage;

-- Job matching usage
SELECT 
  COUNT(DISTINCT user_id) as users_viewing_jobs,
  COUNT(DISTINCT job_id) as unique_jobs_viewed,
  ROUND(AVG(match_score), 1) as avg_match_score,
  COUNT(CASE WHEN viewed_at > NOW() - INTERVAL '7 days' THEN 1 END) as views_last_7_days
FROM user_job_matches;

-- Career readiness distribution
SELECT 
  CASE 
    WHEN cri >= 80 THEN '80-100 (Ready)'
    WHEN cri >= 60 THEN '60-80 (Preparing)'
    WHEN cri >= 40 THEN '40-60 (Early Stage)'
    ELSE '0-40 (Just Starting)'
  END as readiness_level,
  COUNT(*) as user_count,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM users), 2) as percentage
FROM (
  SELECT 
    u.user_id,
    ROUND(
      (COALESCE(a.avg_score, 0) * 0.4) + 
      (CASE WHEN u.cv_uploaded THEN 100 ELSE 0 END * 0.3) +
      (CASE WHEN u.cv_uploaded AND a.avg_score > 60 THEN 80 ELSE 50 END * 0.3)
    ) as cri
  FROM users u
  LEFT JOIN (
    SELECT user_id, AVG(score) as avg_score 
    FROM career_assessments 
    WHERE score IS NOT NULL 
    GROUP BY user_id
  ) a ON u.user_id = a.user_id
) cri_calc
GROUP BY readiness_level
ORDER BY MIN(cri);

-- ============================================================================
-- 8. MAINTENANCE & INDICES
-- ============================================================================

-- Create essential indices for performance
CREATE INDEX idx_users_specialty ON users(specialty);
CREATE INDEX idx_users_career_stage ON users(career_stage);
CREATE INDEX idx_assessments_user_touchpoint ON career_assessments(user_id, touchpoint_number);
CREATE INDEX idx_assessments_category_score ON career_assessments(question_category, score);
CREATE INDEX idx_jobs_specialty ON jobs USING GIN(specialties);
CREATE INDEX idx_jobs_posted ON jobs(posted_date DESC);
CREATE INDEX idx_user_job_matches_score ON user_job_matches(user_id, match_score DESC);
CREATE INDEX idx_documents_user_type ON documents(user_id, document_type);

-- Analyze query performance
EXPLAIN ANALYZE
SELECT j.job_id, j.title, ROUND((match score calculation)) as match_score
FROM jobs j
WHERE j.specialties @> ARRAY['Cardiology']
  AND j.posted_date > NOW() - INTERVAL '30 days'
ORDER BY (match score calculation) DESC
LIMIT 10;

-- ============================================================================
-- 9. DATA INTEGRITY
-- ============================================================================

-- Validate assessment scores are within range
SELECT user_id, assessment_id, score, question_category
FROM career_assessments
WHERE score < 0 OR score > 100
ORDER BY score;

-- Find users without mempalace integration (potential gaps)
SELECT user_id, name, created_at
FROM users
WHERE mempalace_id IS NULL AND created_at < NOW() - INTERVAL '7 days';

-- Identify stale jobs (older than 60 days)
SELECT job_id, title, posted_date, DATEDIFF(DAY, posted_date, NOW()) as days_old
FROM jobs
WHERE posted_date < NOW() - INTERVAL '60 days'
ORDER BY days_old DESC;

-- ============================================================================
-- 10. COACH MAK CONTEXT QUERIES
-- ============================================================================

-- Get full user context for Coach Mak
SELECT 
  u.user_id,
  u.name,
  u.specialty,
  u.career_stage,
  u.institution,
  COALESCE(d.extracted_text, 'No CV uploaded') as cv_summary,
  COALESCE(JSONB_BUILD_OBJECT(
    'latest_assessment', a.score,
    'assessment_category', a.question_category,
    'completed', a.completed_at
  ), '{}') as latest_assessment,
  COALESCE(m.coaching_summary, 'First interaction') as coaching_memory
FROM users u
LEFT JOIN documents d ON u.user_id = d.user_id AND d.document_type = 'CV'
LEFT JOIN LATERAL (
  SELECT score, question_category, completed_at
  FROM career_assessments
  WHERE user_id = u.user_id
  ORDER BY completed_at DESC
  LIMIT 1
) a ON true
LEFT JOIN mempalace_exports m ON u.user_id = m.user_id
  ORDER BY m.created_at DESC LIMIT 1
WHERE u.user_id = $1;

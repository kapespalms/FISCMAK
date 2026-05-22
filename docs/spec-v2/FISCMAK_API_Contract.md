// FISCMAK API Contract Specification
// RESTful JSON API for Coach Mak Platform
// Base URL: https://api.fiscmak.app/v1

// ============================================================================
// AUTH ENDPOINTS
// ============================================================================

// POST /auth/register
// Register new user (email + password)
Request:
{
  "email": "doctor@example.com",
  "password": "securePassword123",
  "name": "Dr. Jane Smith"
}

Response: 201 Created
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "doctor@example.com",
  "name": "Dr. Jane Smith",
  "created_at": "2026-05-22T10:30:00Z",
  "auth_token": "eyJhbGciOiJIUzI1NiIs..."
}

---

// POST /auth/login
// User login
Request:
{
  "email": "doctor@example.com",
  "password": "securePassword123"
}

Response: 200 OK
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "auth_token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 86400,
  "refresh_token": "refresh_token_string"
}

---

// POST /auth/logout
// User logout (requires auth token)
Response: 200 OK
{ "message": "Successfully logged out" }

---

// ============================================================================
// USER PROFILE ENDPOINTS
// ============================================================================

// GET /users/me
// Get current user profile (requires auth)
Response: 200 OK
{
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "doctor@example.com",
  "name": "Dr. Jane Smith",
  "specialty": "Cardiology",
  "career_stage": "Fellow",
  "institution": "Johns Hopkins",
  "cv_uploaded": true,
  "career_readiness_index": 75,
  "last_active": "2026-05-22T14:20:00Z",
  "created_at": "2026-05-15T10:30:00Z"
}

---

// PUT /users/me
// Update user profile
Request:
{
  "name": "Dr. Jane Smith",
  "specialty": "Interventional Cardiology",
  "institution": "Mayo Clinic",
  "career_stage": "Attending"
}

Response: 200 OK
{ "message": "Profile updated", ...updated_user_object }

---

// ============================================================================
// TIER 1 ONBOARDING ENDPOINTS
// ============================================================================

// POST /onboarding/tier1/specialty
// Save specialty selection (Tier 1)
Request:
{
  "specialty": "Cardiology"
}

Response: 200 OK
{
  "specialty": "Cardiology",
  "saved_at": "2026-05-22T10:35:00Z"
}

---

// POST /onboarding/tier1/career-stage
// Save career stage (Tier 1)
Request:
{
  "career_stage": "Fellow"  // Student, Fellow, Attending, Other
}

Response: 200 OK
{
  "career_stage": "Fellow",
  "tier1_complete": true,
  "saved_at": "2026-05-22T10:37:00Z"
}

---

// ============================================================================
// TIER 2 ONBOARDING ENDPOINTS
// ============================================================================

// POST /documents/upload
// Upload CV/Resume (Tier 2)
Request: multipart/form-data
{
  "file": <File>,
  "document_type": "CV"  // CV, Resume, Portfolio, Cover Letter
}

Response: 201 Created
{
  "document_id": "doc-550e8400",
  "document_type": "CV",
  "file_url": "s3://bucket/user123/cv_jane_smith.pdf",
  "extracted_text_preview": "Dr. Jane Smith\nCardiology Fellowship at Johns Hopkins...",
  "extraction_status": "completed",
  "uploaded_at": "2026-05-22T10:40:00Z"
}

---

// GET /documents
// List user's documents
Response: 200 OK
{
  "documents": [
    {
      "document_id": "doc-550e8400",
      "document_type": "CV",
      "file_url": "s3://bucket/user123/cv_jane_smith.pdf",
      "uploaded_at": "2026-05-22T10:40:00Z",
      "extraction_status": "completed"
    }
  ],
  "total": 1
}

---

// ============================================================================
// ASSESSMENT ENDPOINTS
// ============================================================================

// GET /assessments/current
// Get current active assessment (if any)
Response: 200 OK
{
  "assessment_id": "assess-550e8400",
  "touchpoint_number": 1,
  "question_category": "INTRO",
  "questions": [
    {
      "q_id": "Q001",
      "question": "What's your medical specialty?",
      "question_type": "text",
      "required": true
    }
  ],
  "progress": {
    "current_question": 1,
    "total_questions": 10
  }
}

---

// POST /assessments/start
// Start new assessment (begins touchpoint N)
Request:
{
  "touchpoint_number": 1,
  "question_category": "INTRO"
}

Response: 201 Created
{
  "assessment_id": "assess-550e8400",
  "touchpoint_number": 1,
  "started_at": "2026-05-22T11:00:00Z"
}

---

// POST /assessments/{assessmentId}/answer
// Submit answer to current question
Request:
{
  "q_id": "Q001",
  "answer": "Cardiology",
  "timestamp": "2026-05-22T11:02:00Z"
}

Response: 200 OK
{
  "assessment_id": "assess-550e8400",
  "q_id": "Q001",
  "answer_saved": true,
  "next_question": {
    "q_id": "Q002",
    "question": "Where are you in your career?"
  }
}

---

// POST /assessments/{assessmentId}/complete
// Submit complete assessment
Request: (empty body)

Response: 200 OK
{
  "assessment_id": "assess-550e8400",
  "touchpoint_number": 1,
  "score": 78,
  "score_interpretation": "Good foundation for career planning",
  "completed_at": "2026-05-22T11:15:00Z",
  "insights": {
    "key_findings": ["Strong career clarity", "Moderate burnout signals"],
    "recommended_actions": ["Schedule mentor meeting", "Consider wellness activities"]
  }
}

---

// GET /assessments/history
// Get all past assessments
Response: 200 OK
{
  "assessments": [
    {
      "assessment_id": "assess-550e8400",
      "touchpoint_number": 1,
      "question_category": "INTRO",
      "score": 78,
      "completed_at": "2026-05-22T11:15:00Z"
    }
  ],
  "total": 1,
  "completion_rate": 0.14  // 1 of 7 touchpoints
}

---

// ============================================================================
// JOB MATCHING ENDPOINTS
// ============================================================================

// GET /jobs/matches
// Get personalized job matches
Query Parameters:
  - specialty: string (optional, filter by specialty)
  - location: string (optional, filter by location)
  - min_salary: number (optional)
  - max_salary: number (optional)
  - limit: number (default 10)
  - offset: number (default 0)

Response: 200 OK
{
  "jobs": [
    {
      "job_id": "job-550e8400",
      "title": "Interventional Cardiologist",
      "institution": "Mayo Clinic",
      "location": "Rochester, MN",
      "salary": 350000,
      "match_score": 92,
      "match_reasoning": {
        "specialty_match": 1.0,
        "salary_alignment": 0.9,
        "location_preference": 0.8,
        "growth_alignment": 1.0
      },
      "source": "LinkedIn",
      "posted_date": "2026-05-20T00:00:00Z",
      "description": "Leading interventional cardiology program..."
    }
  ],
  "total": 24,
  "has_more": true,
  "mak_commentary": "These 3 roles align perfectly with your background in interventional cardiology. The Mayo Clinic position offers strong research opportunities—remember you mentioned interest in cardiac devices?"
}

---

// POST /jobs/{jobId}/save
// Save job for later
Request: (empty)

Response: 200 OK
{
  "job_id": "job-550e8400",
  "saved": true,
  "saved_at": "2026-05-22T12:00:00Z"
}

---

// GET /jobs/saved
// Get user's saved jobs
Response: 200 OK
{
  "jobs": [
    { ...job_object... }
  ],
  "total": 5
}

---

// POST /jobs/{jobId}/view
// Log job view (analytics)
Request: (empty)

Response: 200 OK
{ "logged": true }

---

// ============================================================================
// CAREER PATHWAYS ENDPOINTS
// ============================================================================

// GET /pathways
// Get career pathways for user's specialty
Response: 200 OK
{
  "specialty": "Cardiology",
  "pathways": [
    {
      "pathway_id": "path-clinical-001",
      "specialty": "Cardiology",
      "pathway_type": "Clinical",
      "description": "Focus on patient care, clinical excellence, and subspecialty depth...",
      "salary_range": "$200,000 - $400,000",
      "job_market_demand": "HIGH",
      "milestones": [
        {
          "year": 1,
          "goal": "Board certification in adult cardiology",
          "description": "Complete board exam and certification"
        }
      ],
      "open_positions": 45
    },
    {
      "pathway_id": "path-research-001",
      "pathway_type": "Research",
      "description": "Career in cardiovascular research, grants, publications...",
      "salary_range": "$120,000 - $250,000",
      "job_market_demand": "MEDIUM",
      "milestones": [],
      "open_positions": 12
    }
  ]
}

---

// GET /pathways/{pathwayId}
// Get detailed pathway information
Response: 200 OK
{
  "pathway_id": "path-clinical-001",
  "specialty": "Cardiology",
  "pathway_type": "Clinical",
  "description": "...",
  "detailed_milestones": [
    { "year": 1, "goal": "...", "skills_needed": [...] },
    { "year": 3, "goal": "..." }
  ],
  "skill_gaps_for_user": [
    "Advanced echocardiography",
    "Clinical trial leadership"
  ],
  "related_jobs": [...],
  "mentors": [...]
}

---

// ============================================================================
// COACH MAK CHAT ENDPOINTS
// ============================================================================

// POST /chat/message
// Send message to Coach Mak
Request:
{
  "message": "I'm feeling burnt out from my current role. What should I do?",
  "context": {
    "current_assessment_id": "assess-550e8400",
    "touchpoint_number": 3
  }
}

Response: 200 OK
{
  "message_id": "msg-550e8400",
  "response": "I hear you. Burnout is a real concern and something we should address directly. Before we talk solutions, I want to understand what's draining your energy the most. Is it the volume of patient cases, the administrative load, the lack of autonomy, or something else? Tell me what a typical week looks like for you.",
  "sentiment": "empathetic",
  "suggested_actions": [
    {
      "action": "Take wellness assessment",
      "url": "/assessments/start?category=wellbeing"
    }
  ],
  "memory_updated": true
}

---

// GET /chat/history
// Get conversation history with Coach Mak
Query Parameters:
  - limit: number (default 50)
  - before: timestamp (optional, for pagination)

Response: 200 OK
{
  "messages": [
    {
      "message_id": "msg-550e8400",
      "role": "user",
      "content": "I'm feeling burnt out...",
      "timestamp": "2026-05-22T14:30:00Z"
    },
    {
      "message_id": "msg-550e8401",
      "role": "assistant",
      "content": "I hear you. Burnout is...",
      "timestamp": "2026-05-22T14:30:15Z"
    }
  ],
  "total": 47,
  "has_more": true
}

---

// ============================================================================
// MEMPALACE INTEGRATION ENDPOINTS
// ============================================================================

// POST /mempalace/sync
// Sync coaching data to MemPalace
Request:
{
  "coaching_summary": "User exploring pivot to medical education...",
  "key_facts": {
    "current_role": "Interventional Cardiologist",
    "years_experience": 8,
    "interests": ["Medical education", "Curriculum development"]
  },
  "preferences": {
    "location": "Northeast",
    "salary_expectations": "180000-220000"
  }
}

Response: 200 OK
{
  "mempalace_id": "mp-550e8400",
  "synced_at": "2026-05-22T14:35:00Z",
  "message": "Coaching data synced to MemPalace"
}

---

// GET /mempalace/context
// Retrieve MemPalace context for Coach Mak
Response: 200 OK
{
  "coaching_summary": "User exploring pivot to medical education...",
  "key_facts": { ...},
  "preferences": { ...},
  "career_evolution": { ...},
  "last_synced": "2026-05-22T14:35:00Z"
}

---

// ============================================================================
// DOCUMENT TEMPLATE ENDPOINTS
// ============================================================================

// GET /templates
// Get available document templates
Query Parameters:
  - type: string (cv, resume, cover_letter, portfolio)

Response: 200 OK
{
  "templates": [
    {
      "template_id": "tmpl-cv-001",
      "name": "Professional CV (Academic Medicine)",
      "type": "cv",
      "format": "DOCX",
      "preview_url": "s3://bucket/templates/cv-academic-preview.pdf",
      "download_url": "api/templates/tmpl-cv-001/download",
      "description": "Formatted for academic medical centers, includes research and teaching sections"
    }
  ]
}

---

// GET /templates/{templateId}/download
// Download template (auto-filled with user data if available)
Query Parameters:
  - prefill: boolean (default true, auto-fill from user CV if available)

Response: 200 OK (binary)
<DOCX file stream>

---

// ============================================================================
// SETTINGS ENDPOINTS
// ============================================================================

// GET /settings
// Get user settings
Response: 200 OK
{
  "goals": ["Career advancement", "Work-life balance"],
  "preferred_location": "Northeast",
  "salary_expectations": {
    "min": 180000,
    "max": 220000
  },
  "job_market_scope": "Academic",  // Academic, Private Practice, Both
  "notification_preferences": {
    "email_frequency": "weekly",  // weekly, biweekly, monthly
    "job_alerts": true,
    "coaching_reminders": true
  },
  "data_sharing": {
    "share_cv_for_matching": true,
    "share_assessments": false
  }
}

---

// PUT /settings
// Update user settings
Request:
{
  "goals": ["Career advancement", "Work-life balance"],
  "preferred_location": "Northeast",
  "salary_expectations": {
    "min": 180000,
    "max": 220000
  },
  "notification_preferences": {
    "email_frequency": "biweekly"
  }
}

Response: 200 OK
{ "message": "Settings updated" }

---

// ============================================================================
// ANALYTICS ENDPOINTS
// ============================================================================

// GET /analytics/dashboard
// Get user's progress dashboard
Response: 200 OK
{
  "career_readiness_index": 75,
  "onboarding_progress": {
    "tier1_complete": true,
    "tier2_complete": true,
    "tier3_complete": false
  },
  "assessment_progress": {
    "completed_touchpoints": 2,
    "total_touchpoints": 7,
    "completion_percentage": 28
  },
  "burnout_trend": {
    "current_score": 68,
    "previous_score": 72,
    "trend": "improving"
  },
  "job_engagement": {
    "jobs_viewed": 12,
    "jobs_saved": 3,
    "average_match_score": 78
  },
  "next_touchpoint": {
    "number": 3,
    "category": "Energy & Burnout Assessment",
    "due_date": "2026-05-29T00:00:00Z",
    "days_until_due": 7
  }
}

---

// ============================================================================
// ERROR RESPONSES
// ============================================================================

// 400 Bad Request
{
  "error": "validation_error",
  "message": "Invalid specialty value",
  "details": {
    "field": "specialty",
    "reason": "Must be a valid medical specialty"
  }
}

---

// 401 Unauthorized
{
  "error": "unauthorized",
  "message": "Authentication required. Please log in.",
  "code": "AUTH_REQUIRED"
}

---

// 403 Forbidden
{
  "error": "forbidden",
  "message": "You do not have permission to access this resource"
}

---

// 404 Not Found
{
  "error": "not_found",
  "message": "Job with ID 'job-550e8400' not found"
}

---

// 500 Internal Server Error
{
  "error": "server_error",
  "message": "An unexpected error occurred. Please try again later.",
  "request_id": "req-550e8400-error-tracking"
}

---

// ============================================================================
// RATE LIMITING
// ============================================================================
/*
All endpoints implement rate limiting:
- Standard: 1000 requests/hour per user
- Chat endpoints: 100 messages/hour per user
- Upload endpoints: 10 uploads/hour per user

Response headers:
  X-RateLimit-Limit: 1000
  X-RateLimit-Remaining: 847
  X-RateLimit-Reset: 1526558400

When limit exceeded: 429 Too Many Requests
{
  "error": "rate_limit_exceeded",
  "message": "Too many requests. Please try again in 3600 seconds.",
  "retry_after": 3600
}
*/

---

// ============================================================================
// AUTHENTICATION HEADERS
// ============================================================================
/*
All authenticated endpoints require:
Authorization: Bearer <auth_token>

Example:
GET /users/me HTTP/1.1
Host: api.fiscmak.app/v1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
*/

---

// ============================================================================
// WEBHOOKS (Future Implementation)
// ============================================================================

/*
POST /webhooks/register
Register for event notifications

Request:
{
  "event_type": "assessment.completed",
  "webhook_url": "https://your-server.com/webhooks/assessment",
  "secret": "webhook_secret_key"
}

Webhook Payload Example:
{
  "event_id": "evt-550e8400",
  "event_type": "assessment.completed",
  "user_id": "user-550e8400",
  "timestamp": "2026-05-22T11:15:00Z",
  "data": {
    "assessment_id": "assess-550e8400",
    "touchpoint_number": 1,
    "score": 78
  }
}
*/

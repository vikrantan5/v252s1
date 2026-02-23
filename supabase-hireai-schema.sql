-- ================================================
-- HIREAI PLATFORM - COMPLETE SUPABASE SCHEMA
-- ================================================
-- This schema supports the full HireAI platform with:
-- - Student profiles with skill matching
-- - Recruiter profiles
-- - Platform jobs (not external jobs)
-- - Applications with skill match scores
-- - Interview invitations
-- ================================================

-- ================================================
-- TABLE 1: STUDENTS PROFILE
-- ================================================
CREATE TABLE IF NOT EXISTS public.students_profile (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid TEXT NOT NULL UNIQUE,
    
    -- Basic Information
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    profile_picture_url TEXT,
    
    -- Education
    college TEXT,
    university TEXT,
    degree TEXT,
    specialization TEXT,
    graduation_year INTEGER,
    
    -- Professional Information
    skills TEXT[] DEFAULT ARRAY[]::TEXT[],
    experience_level TEXT CHECK (experience_level IN ('fresher', 'junior', 'mid', 'senior', 'lead')),
    years_of_experience INTEGER DEFAULT 0,
    
    -- Portfolio
    projects JSONB DEFAULT '[]'::jsonb, -- Array of {title, description, url, tech_stack[]}
    resume_url TEXT,
    portfolio_links JSONB DEFAULT '[]'::jsonb, -- Array of {platform, url} e.g., GitHub, LinkedIn
    
    -- Job Preferences
    preferred_job_roles TEXT[] DEFAULT ARRAY[]::TEXT[],
    preferred_locations TEXT[] DEFAULT ARRAY[]::TEXT[],
    preferred_job_types TEXT[] DEFAULT ARRAY[]::TEXT[], -- internship, full-time, contract
    expected_salary_min INTEGER,
    expected_salary_max INTEGER,
    
    -- Bio
    bio TEXT,
    
    -- Profile Status
    profile_completed BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for students_profile
CREATE INDEX IF NOT EXISTS idx_students_firebase_uid ON public.students_profile(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_students_email ON public.students_profile(email);
CREATE INDEX IF NOT EXISTS idx_students_profile_completed ON public.students_profile(profile_completed);
CREATE INDEX IF NOT EXISTS idx_students_skills ON public.students_profile USING GIN(skills);

-- ================================================
-- TABLE 2: RECRUITERS
-- ================================================
CREATE TABLE IF NOT EXISTS public.recruiters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid TEXT NOT NULL UNIQUE,
    
    -- Basic Information
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    profile_picture_url TEXT,
    
    -- Company Information
    company_name TEXT NOT NULL,
    company_website TEXT,
    company_logo_url TEXT,
    company_description TEXT,
    company_size TEXT, -- e.g., "1-10", "11-50", "51-200", etc.
    industry TEXT,
    
    -- Contact
    linkedin_url TEXT,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for recruiters
CREATE INDEX IF NOT EXISTS idx_recruiters_firebase_uid ON public.recruiters(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_recruiters_email ON public.recruiters(email);
CREATE INDEX IF NOT EXISTS idx_recruiters_company ON public.recruiters(company_name);

-- ================================================
-- TABLE 3: PLATFORM JOBS
-- ================================================
CREATE TABLE IF NOT EXISTS public.platform_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recruiter_id UUID NOT NULL REFERENCES public.recruiters(id) ON DELETE CASCADE,
    
    -- Job Details
    job_title TEXT NOT NULL,
    job_description TEXT NOT NULL,
    role_category TEXT, -- e.g., "Software Engineering", "Data Science", etc.
    
    -- Requirements
    required_skills TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    experience_required INTEGER DEFAULT 0, -- in years
    min_qualifications TEXT,
    
    -- Compensation
    salary_min INTEGER,
    salary_max INTEGER,
    currency TEXT DEFAULT 'INR',
    is_paid BOOLEAN DEFAULT TRUE,
    
    -- Job Type
    job_type TEXT NOT NULL CHECK (job_type IN ('internship', 'full-time', 'part-time', 'contract', 'freelance')),
    internship_duration_months INTEGER, -- Only for internships
    
    -- Work Mode
    work_mode TEXT NOT NULL CHECK (work_mode IN ('remote', 'onsite', 'hybrid')),
    location TEXT, -- City, Country
    
    -- Status
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'draft')),
    openings INTEGER DEFAULT 1,
    
    -- Additional
    application_deadline TIMESTAMP WITH TIME ZONE,
    perks TEXT[], -- e.g., "Health Insurance", "Flexible Hours"
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for platform_jobs
CREATE INDEX IF NOT EXISTS idx_jobs_recruiter ON public.platform_jobs(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.platform_jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_type ON public.platform_jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_jobs_skills ON public.platform_jobs USING GIN(required_skills);
CREATE INDEX IF NOT EXISTS idx_jobs_created ON public.platform_jobs(created_at DESC);

-- ================================================
-- TABLE 4: APPLICATIONS
-- ================================================
CREATE TABLE IF NOT EXISTS public.applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES public.students_profile(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.platform_jobs(id) ON DELETE CASCADE,
    
    -- Application Details
    cover_letter TEXT,
    resume_url TEXT, -- Can be different from profile resume
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'shortlisted', 'rejected', 'interview_scheduled', 'selected', 'withdrawn')),
    
    -- Skill Matching
    skill_match_score INTEGER CHECK (skill_match_score >= 0 AND skill_match_score <= 100),
    matching_skills TEXT[] DEFAULT ARRAY[]::TEXT[],
    missing_skills TEXT[] DEFAULT ARRAY[]::TEXT[],
    
    -- Recruiter Notes
    recruiter_notes TEXT,
    
    -- Timestamps
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for applications
CREATE INDEX IF NOT EXISTS idx_applications_student ON public.applications(student_id);
CREATE INDEX IF NOT EXISTS idx_applications_job ON public.applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_match_score ON public.applications(skill_match_score DESC);
CREATE INDEX IF NOT EXISTS idx_applications_created ON public.applications(applied_at DESC);

-- Unique constraint: One application per student per job
CREATE UNIQUE INDEX IF NOT EXISTS idx_applications_unique ON public.applications(student_id, job_id);

-- ================================================
-- TABLE 5: INTERVIEW INVITATIONS
-- ================================================
CREATE TABLE IF NOT EXISTS public.interview_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
    
    -- Meeting Details
    meeting_url TEXT, -- Cal.com or Calendly link
    meeting_platform TEXT DEFAULT 'google-meet', -- or 'zoom', 'teams', etc.
    scheduled_date TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER DEFAULT 60,
    
    -- Interview Details
    interviewer_name TEXT,
    interview_type TEXT, -- 'technical', 'hr', 'behavioral', etc.
    interview_instructions TEXT,
    
    -- Email
    email_sent BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rescheduled', 'completed', 'cancelled')),
    
    -- Student Response
    student_confirmed BOOLEAN DEFAULT FALSE,
    student_response_date TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for interview_invitations
CREATE INDEX IF NOT EXISTS idx_interviews_application ON public.interview_invitations(application_id);
CREATE INDEX IF NOT EXISTS idx_interviews_status ON public.interview_invitations(status);
CREATE INDEX IF NOT EXISTS idx_interviews_date ON public.interview_invitations(scheduled_date);

-- ================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================

-- Enable RLS on all tables
ALTER TABLE public.students_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recruiters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_invitations ENABLE ROW LEVEL SECURITY;

-- ================================================
-- STUDENTS_PROFILE POLICIES
-- ================================================

-- Students can view their own profile
CREATE POLICY "Students can view own profile" 
ON public.students_profile FOR SELECT
USING (firebase_uid = auth.jwt() ->> 'sub');

-- Students can insert their own profile
CREATE POLICY "Students can insert own profile" 
ON public.students_profile FOR INSERT
WITH CHECK (firebase_uid = auth.jwt() ->> 'sub');

-- Students can update their own profile
CREATE POLICY "Students can update own profile" 
ON public.students_profile FOR UPDATE
USING (firebase_uid = auth.jwt() ->> 'sub');

-- Recruiters can view any student profile (for application reviews)
CREATE POLICY "Recruiters can view all student profiles" 
ON public.students_profile FOR SELECT
USING (true); -- We'll add proper recruiter check in application layer

-- ================================================
-- RECRUITERS POLICIES
-- ================================================

-- Recruiters can view their own profile
CREATE POLICY "Recruiters can view own profile" 
ON public.recruiters FOR SELECT
USING (firebase_uid = auth.jwt() ->> 'sub');

-- Recruiters can insert their own profile
CREATE POLICY "Recruiters can insert own profile" 
ON public.recruiters FOR INSERT
WITH CHECK (firebase_uid = auth.jwt() ->> 'sub');

-- Recruiters can update their own profile
CREATE POLICY "Recruiters can update own profile" 
ON public.recruiters FOR UPDATE
USING (firebase_uid = auth.jwt() ->> 'sub');

-- ================================================
-- PLATFORM_JOBS POLICIES
-- ================================================

-- Anyone can view open jobs
CREATE POLICY "Anyone can view open jobs" 
ON public.platform_jobs FOR SELECT
USING (status = 'open' OR true); -- Modified to allow recruiters to see their own drafts

-- Recruiters can insert jobs
CREATE POLICY "Recruiters can insert jobs" 
ON public.platform_jobs FOR INSERT
WITH CHECK (true); -- Will validate recruiter_id in application layer

-- Recruiters can update their own jobs
CREATE POLICY "Recruiters can update own jobs" 
ON public.platform_jobs FOR UPDATE
USING (true); -- Will validate ownership in application layer

-- Recruiters can delete their own jobs
CREATE POLICY "Recruiters can delete own jobs" 
ON public.platform_jobs FOR DELETE
USING (true); -- Will validate ownership in application layer

-- ================================================
-- APPLICATIONS POLICIES
-- ================================================

-- Students can view their own applications
CREATE POLICY "Students can view own applications" 
ON public.applications FOR SELECT
USING (true); -- Will add firebase_uid check via join in application layer

-- Students can insert applications
CREATE POLICY "Students can insert applications" 
ON public.applications FOR INSERT
WITH CHECK (true); -- Will validate student_id in application layer

-- Students can update their own applications (e.g., withdraw)
CREATE POLICY "Students can update own applications" 
ON public.applications FOR UPDATE
USING (true); -- Will validate ownership in application layer

-- Recruiters can view applications for their jobs
CREATE POLICY "Recruiters can view job applications" 
ON public.applications FOR SELECT
USING (true); -- Will validate via job ownership in application layer

-- Recruiters can update applications (change status, add notes)
CREATE POLICY "Recruiters can update applications" 
ON public.applications FOR UPDATE
USING (true); -- Will validate via job ownership in application layer

-- ================================================
-- INTERVIEW_INVITATIONS POLICIES
-- ================================================

-- Students can view their own interview invitations
CREATE POLICY "Students can view own interviews" 
ON public.interview_invitations FOR SELECT
USING (true); -- Will validate via application join in application layer

-- Students can update their interview status (confirm, reschedule)
CREATE POLICY "Students can update interview status" 
ON public.interview_invitations FOR UPDATE
USING (true); -- Will validate ownership in application layer

-- Recruiters can create interview invitations
CREATE POLICY "Recruiters can create interviews" 
ON public.interview_invitations FOR INSERT
WITH CHECK (true); -- Will validate via application/job ownership in application layer

-- Recruiters can update interview invitations
CREATE POLICY "Recruiters can update interviews" 
ON public.interview_invitations FOR UPDATE
USING (true); -- Will validate via application/job ownership in application layer

-- Recruiters can view interview invitations for their jobs
CREATE POLICY "Recruiters can view interviews" 
ON public.interview_invitations FOR SELECT
USING (true); -- Will validate via application/job ownership in application layer

-- ================================================
-- FUNCTIONS & TRIGGERS
-- ================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_students_profile_updated_at BEFORE UPDATE ON public.students_profile
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_recruiters_updated_at BEFORE UPDATE ON public.recruiters
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_platform_jobs_updated_at BEFORE UPDATE ON public.platform_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interview_invitations_updated_at BEFORE UPDATE ON public.interview_invitations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- COMMENTS FOR DOCUMENTATION
-- ================================================

COMMENT ON TABLE public.students_profile IS 'Complete student profiles with skills and preferences';
COMMENT ON TABLE public.recruiters IS 'Recruiter profiles with company information';
COMMENT ON TABLE public.platform_jobs IS 'Platform jobs posted by recruiters (not external jobs)';
COMMENT ON TABLE public.applications IS 'Job applications with skill matching scores';
COMMENT ON TABLE public.interview_invitations IS 'Interview scheduling and invitation tracking';

-- ================================================
-- SETUP COMPLETE
-- ================================================

/*
NEXT STEPS:
1. Run this SQL in Supabase Dashboard -> SQL Editor
2. Verify all tables are created
3. Check that RLS policies are enabled
4. Test by inserting sample data
5. Update application code to use these tables
*/

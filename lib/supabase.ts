import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Client for frontend (with RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client for backend (bypasses RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// ================================================
// TYPES FOR SUPABASE TABLES
// ================================================

// Resume Analysis (existing feature)
export interface SupabaseResumeAnalysis {
  id: string;
  student_id: string;
  job_id?: string;
  file_name: string;
  resume_url: string;
  overall_score: number;
  category_scores: {
    format: number;
    keywords: number;
    experience: number;
    skills: number;
  };
  strengths: string[];
  improvements: string[];
  keywords: string[];
  ats_compatibility: string;
  created_at: string;
}


// Student Profile
export interface StudentProfile {
  id: string;
  firebase_uid: string;
  full_name: string;
  email: string;
  phone?: string;
  profile_picture_url?: string;
  college?: string;
  university?: string;
  degree?: string;
  specialization?: string;
  graduation_year?: number;
  skills: string[];
  experience_level?: 'fresher' | 'junior' | 'mid' | 'senior' | 'lead';
  years_of_experience: number;
  projects: Array<{
    title: string;
    description: string;
    url?: string;
    tech_stack: string[];
  }>;
  resume_url?: string;
  portfolio_links: Array<{
    platform: string;
    url: string;
  }>;
  preferred_job_roles: string[];
  preferred_locations: string[];
  preferred_job_types: string[];
  expected_salary_min?: number;
  expected_salary_max?: number;
  bio?: string;
  profile_completed: boolean;
  created_at: string;
  updated_at: string;
}

// Recruiter Profile
export interface RecruiterProfile {
  id: string;
  firebase_uid: string;
  full_name: string;
  email: string;
  phone?: string;
  profile_picture_url?: string;
  company_name: string;
  company_website?: string;
  company_logo_url?: string;
  company_description?: string;
  company_size?: string;
  industry?: string;
  linkedin_url?: string;
  created_at: string;
  updated_at: string;
}

// Platform Job
export interface PlatformJob {
  id: string;
  recruiter_id: string;
  job_title: string;
  job_description: string;
  role_category?: string;
  required_skills: string[];
  experience_required: number;
  min_qualifications?: string;
  salary_min?: number;
  salary_max?: number;
  currency: string;
  is_paid: boolean;
  job_type: 'internship' | 'full-time' | 'part-time' | 'contract' | 'freelance';
  internship_duration_months?: number;
  work_mode: 'remote' | 'onsite' | 'hybrid';
  location?: string;
  status: 'open' | 'closed' | 'draft';
  openings: number;
  application_deadline?: string;
  perks?: string[];
  created_at: string;
  updated_at: string;
}

// Application
export interface JobApplication {
  id: string;
  student_id: string;
  job_id: string;
  cover_letter?: string;
  resume_url?: string;
  status: 'pending' | 'shortlisted' | 'rejected' | 'interview_scheduled' | 'selected' | 'withdrawn';
  skill_match_score?: number;
  matching_skills: string[];
  missing_skills: string[];
  recruiter_notes?: string;
  applied_at: string;
  updated_at: string;
}

// Interview Invitation
export interface InterviewInvitation {
  id: string;
  application_id: string;
  meeting_url?: string;
  meeting_platform: string;
  scheduled_date?: string;
  duration_minutes: number;
  interviewer_name?: string;
  interview_type?: string;
  interview_instructions?: string;
  email_sent: boolean;
  email_sent_at?: string;
  status: 'pending' | 'confirmed' | 'rescheduled' | 'completed' | 'cancelled';
  student_confirmed: boolean;
  student_response_date?: string;
  created_at: string;
  updated_at: string;
}
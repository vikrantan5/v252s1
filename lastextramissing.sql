-- ================================================
-- Migration: Add job_role and skills_match columns to resume_analyses
-- ================================================
-- This migration adds support for missing skills detection feature
-- Run this in Supabase SQL Editor
-- ================================================

-- Add job_role column (TEXT, nullable)
ALTER TABLE public.resume_analyses 
ADD COLUMN IF NOT EXISTS job_role TEXT;

-- Add skills_match column (JSONB, nullable)
-- Structure: { requiredSkills: [], detectedSkills: [], missingSkills: [] }
ALTER TABLE public.resume_analyses 
ADD COLUMN IF NOT EXISTS skills_match JSONB;

-- Add index on job_role for faster queries
CREATE INDEX IF NOT EXISTS idx_resume_analyses_job_role 
ON public.resume_analyses(job_role);

-- Add comments for documentation
COMMENT ON COLUMN public.resume_analyses.job_role IS 'Target job role for skill matching (e.g., "frontend-developer", "data-scientist")';
COMMENT ON COLUMN public.resume_analyses.skills_match IS 'JSON object containing requiredSkills, detectedSkills, and missingSkills arrays';

-- ================================================
-- Migration Complete! ✅
-- ================================================
-- 
-- Now you can:
-- 1. Analyze resumes with job role selection
-- 2. See missing skills for specific job roles
-- 3. Get learning resources for missing skills
-- 
-- ================================================

-- ================================================
-- FIREBASE → SUPABASE SYNC VERIFICATION QUERIES
-- ================================================
-- Use these queries in your Supabase SQL editor to verify the sync

-- ================================================
-- 1. ADD FIREBASE_ID COLUMN (Run this first if column doesn't exist)
-- ================================================
ALTER TABLE public.platform_jobs 
ADD COLUMN IF NOT EXISTS firebase_id TEXT UNIQUE;

CREATE INDEX IF NOT EXISTS idx_platform_jobs_firebase_id 
ON public.platform_jobs(firebase_id);

COMMENT ON COLUMN public.platform_jobs.firebase_id IS 'Firebase document ID for syncing';

-- ================================================
-- 2. CHECK SYNC STATUS
-- ================================================

-- Count of jobs with and without firebase_id
SELECT 
  COUNT(*) FILTER (WHERE firebase_id IS NOT NULL) as synced_jobs,
  COUNT(*) FILTER (WHERE firebase_id IS NULL) as unsynced_jobs,
  COUNT(*) as total_jobs
FROM public.platform_jobs;

-- ================================================
-- 3. LIST JOBS WITHOUT FIREBASE_ID
-- ================================================
SELECT 
  id,
  job_title,
  recruiter_id,
  created_at,
  status
FROM public.platform_jobs
WHERE firebase_id IS NULL
ORDER BY created_at DESC;

-- ================================================
-- 4. VERIFY FOREIGN KEY RELATIONSHIPS
-- ================================================

-- Check jobs with their recruiter details
SELECT 
  pj.id,
  pj.firebase_id,
  pj.job_title,
  pj.status,
  r.full_name as recruiter_name,
  r.company_name,
  r.firebase_uid as recruiter_firebase_uid
FROM public.platform_jobs pj
LEFT JOIN public.recruiters r ON pj.recruiter_id = r.id
ORDER BY pj.created_at DESC
LIMIT 20;

-- ================================================
-- 5. CHECK FOR ORPHANED APPLICATIONS
-- ================================================

-- Applications where job doesn't exist
SELECT 
  a.id,
  a.job_id,
  a.student_id,
  a.status,
  a.applied_at
FROM public.applications a
LEFT JOIN public.platform_jobs pj ON a.job_id = pj.id
WHERE pj.id IS NULL;

-- ================================================
-- 6. CHECK INTERVIEW INVITATIONS INTEGRITY
-- ================================================

-- Interview invitations with full chain
SELECT 
  ii.id as invitation_id,
  ii.status as interview_status,
  ii.scheduled_date,
  a.id as application_id,
  pj.firebase_id as job_firebase_id,
  pj.job_title,
  s.full_name as student_name,
  r.company_name
FROM public.interview_invitations ii
JOIN public.applications a ON ii.application_id = a.id
JOIN public.platform_jobs pj ON a.job_id = pj.id
JOIN public.students_profile s ON a.student_id = s.id
JOIN public.recruiters r ON pj.recruiter_id = r.id
ORDER BY ii.created_at DESC
LIMIT 20;

-- ================================================
-- 7. FIND JOBS WITH SPECIFIC FIREBASE_ID
-- ================================================
-- Replace 'YOUR_FIREBASE_JOB_ID' with actual ID
SELECT *
FROM public.platform_jobs
WHERE firebase_id = '1771850705319-iv0ex706g';

-- ================================================
-- 8. CHECK RECRUITER SYNC STATUS
-- ================================================

-- Recruiters and their job counts
SELECT 
  r.id,
  r.firebase_uid,
  r.full_name,
  r.company_name,
  r.email,
  COUNT(pj.id) as job_count
FROM public.recruiters r
LEFT JOIN public.platform_jobs pj ON r.id = pj.recruiter_id
GROUP BY r.id
ORDER BY job_count DESC;

-- ================================================
-- 9. DUPLICATE CHECK
-- ================================================

-- Check for duplicate firebase_id entries
SELECT 
  firebase_id,
  COUNT(*) as count
FROM public.platform_jobs
WHERE firebase_id IS NOT NULL
GROUP BY firebase_id
HAVING COUNT(*) > 1;

-- ================================================
-- 10. COMPREHENSIVE SYNC HEALTH CHECK
-- ================================================
SELECT 
  'Jobs' as table_name,
  COUNT(*) as total_records,
  COUNT(firebase_id) as synced_records,
  COUNT(*) - COUNT(firebase_id) as unsynced_records,
  ROUND(100.0 * COUNT(firebase_id) / NULLIF(COUNT(*), 0), 2) as sync_percentage
FROM public.platform_jobs
UNION ALL
SELECT 
  'Recruiters' as table_name,
  COUNT(*) as total_records,
  COUNT(firebase_uid) as synced_records,
  0 as unsynced_records,
  100.0 as sync_percentage
FROM public.recruiters
UNION ALL
SELECT 
  'Applications' as table_name,
  COUNT(*) as total_records,
  COUNT(a.id) as synced_records,
  0 as unsynced_records,
  100.0 as sync_percentage
FROM public.applications a
JOIN public.platform_jobs pj ON a.job_id = pj.id;

-- ================================================
-- 11. RECENT SYNC ACTIVITY
-- ================================================

-- Recently synced jobs (created in last 7 days)
SELECT 
  id,
  firebase_id,
  job_title,
  status,
  created_at,
  updated_at
FROM public.platform_jobs
WHERE created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- ================================================
-- 12. JOBS BY STATUS WITH SYNC INFO
-- ================================================
SELECT 
  status,
  COUNT(*) as total,
  COUNT(firebase_id) as with_firebase_id,
  COUNT(*) - COUNT(firebase_id) as without_firebase_id
FROM public.platform_jobs
GROUP BY status
ORDER BY total DESC;

-- ================================================
-- 13. MISSING RECRUITERS (Jobs with invalid recruiter_id)
-- ================================================
SELECT 
  pj.id,
  pj.firebase_id,
  pj.job_title,
  pj.recruiter_id,
  pj.created_at
FROM public.platform_jobs pj
LEFT JOIN public.recruiters r ON pj.recruiter_id = r.id
WHERE r.id IS NULL;

-- ================================================
-- 14. SEARCH JOB BY TITLE WITH SYNC STATUS
-- ================================================
-- Replace 'search_term' with actual search term
SELECT 
  id,
  firebase_id,
  job_title,
  work_mode,
  location,
  status,
  CASE 
    WHEN firebase_id IS NOT NULL THEN '✅ Synced'
    ELSE '❌ Not Synced'
  END as sync_status
FROM public.platform_jobs
WHERE job_title ILIKE '%search_term%'
ORDER BY created_at DESC;

-- ================================================
-- 15. CLEANUP ORPHANED DATA (USE WITH CAUTION)
-- ================================================
-- UNCOMMENT ONLY IF YOU WANT TO DELETE ORPHANED APPLICATIONS

-- DELETE FROM public.applications
-- WHERE job_id NOT IN (SELECT id FROM public.platform_jobs);

-- DELETE FROM public.interview_invitations
-- WHERE application_id NOT IN (SELECT id FROM public.applications);

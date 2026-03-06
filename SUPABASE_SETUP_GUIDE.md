"# 🚀 HIREAI SUPABASE SETUP GUIDE

## 📋 Overview

This guide will help you set up the complete Supabase database for the **HireAI Platform** - an integrated job portal with AI-powered interviews, resume analysis, and subscription management.

---

## 🎯 What You'll Set Up

### Database Tables (9 Total):
1. **students_profile** - Student profiles with skills and job preferences
2. **recruiters** - Recruiter profiles with company information
3. **platform_jobs** - Job postings with Firebase sync capability
4. **applications** - Job applications with AI skill matching
5. **interview_invitations** - Interview scheduling and tracking
6. **resume_analyses** - ATS resume analysis results
7. **user_resumes** - AI Resume Builder data
8. **subscriptions** - Razorpay payment tracking
9. **interview_usage** - Free trial and usage tracking

### Additional Features:
- ✅ 30+ Performance Indexes
- ✅ Row Level Security (RLS) Policies
- ✅ Storage Bucket for Resume Files
- ✅ Auto-update Triggers
- ✅ Firebase Auth Integration

---

## ⚡ Quick Setup (5 Minutes)

### STEP 1: Access Your Supabase Dashboard

1. Go to: https://ktmxilcslghutmajhozw.supabase.co
2. Login with your credentials
3. Navigate to **SQL Editor** (left sidebar)

### STEP 2: Run the Complete Setup SQL

1. Click **\"New query\"** button
2. Open the file: `COMPLETE_SUPABASE_SETUP.sql`
3. Copy the **entire content** (all ~750 lines)
4. Paste into the SQL Editor
5. Click **\"Run\"** or press `Ctrl + Enter`
6. ⏱️ Wait 10-15 seconds for completion
7. ✅ You should see: \"Success. No rows returned\"

### STEP 3: Create Storage Bucket for Resumes

1. Go to **Storage** in the left sidebar
2. Click **\"New bucket\"** button
3. Configure:
   - **Name:** `resumes` (exactly this name, lowercase)
   - **Public bucket:** ✅ **ENABLE THIS** (Important!)
   - **File size limit:** 10MB (optional)
   - **Allowed MIME types:** 
     - `application/pdf`
     - `application/vnd.openxmlformats-officedocument.wordprocessingml.document`
4. Click **\"Create bucket\"**

### STEP 4: Verify Setup

1. Go to **Table Editor** in left sidebar
2. You should see these 9 tables:
   - ✅ students_profile
   - ✅ recruiters
   - ✅ platform_jobs
   - ✅ applications
   - ✅ interview_invitations
   - ✅ resume_analyses
   - ✅ user_resumes
   - ✅ subscriptions
   - ✅ interview_usage

3. Check RLS is enabled:
   - Each table should have a 🛡️ shield icon
   - This means Row Level Security is active

---

## 🔐 Environment Variables

Make sure your `.env.local` file has these Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ktmxilcslghutmajhozw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0bXhpbGNzbGdodXRtYWpob3p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE2NTIwNzAsImV4cCI6MjA4NzIyODA3MH0.N3ZsTiy_X_eg7xVr4hL1g_KgVHmwZPBbBVViypLgTho
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0bXhpbGNzbGdodXRtYWpob3p3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTY1MjA3MCwiZXhwIjoyMDg3MjI4MDcwfQ.Ol6IPbMJfASjHb4okIsIB8zLkQjN8xjq1Lwkzvbnk_o
```

---

## 🧪 Testing Your Setup

### Test 1: Check Tables Created
Run this query in SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Expected Result:** 9 tables listed

---

### Test 2: Verify Storage Bucket
Run this query:

```sql
SELECT * FROM storage.buckets WHERE name = 'resumes';
```

**Expected Result:** One row showing the 'resumes' bucket

---

### Test 3: Check Row Counts (Initial - All Zero)

```sql
SELECT 'students_profile' as table_name, COUNT(*) as count FROM students_profile
UNION ALL
SELECT 'recruiters', COUNT(*) FROM recruiters
UNION ALL
SELECT 'platform_jobs', COUNT(*) FROM platform_jobs
UNION ALL
SELECT 'applications', COUNT(*) FROM applications
UNION ALL
SELECT 'interview_invitations', COUNT(*) FROM interview_invitations
UNION ALL
SELECT 'resume_analyses', COUNT(*) FROM resume_analyses
UNION ALL
SELECT 'user_resumes', COUNT(*) FROM user_resumes
UNION ALL
SELECT 'subscriptions', COUNT(*) FROM subscriptions
UNION ALL
SELECT 'interview_usage', COUNT(*) FROM interview_usage;
```

**Expected Result:** All counts should be 0 (empty tables)

---

### Test 4: Test Application Flow

1. Start your Next.js application:
   ```bash
   yarn dev
   ```

2. Test Student Registration:
   - Go to `/sign-up`
   - Register as a student
   - Check Supabase: `SELECT * FROM students_profile;`
   - Should see 1 new row

3. Test Recruiter Registration:
   - Register as a recruiter
   - Check: `SELECT * FROM recruiters;`
   - Should see 1 new row

4. Test Job Posting:
   - Login as recruiter
   - Create a job posting
   - Check: `SELECT * FROM platform_jobs;`
   - Should see 1 new job

5. Test Resume Upload:
   - Login as student
   - Upload a resume
   - Check Storage: Go to Storage → resumes bucket
   - Should see uploaded file
   - Check: `SELECT * FROM resume_analyses;`
   - Should see analysis results

---

## 📊 Database Schema Overview

### Main Relationships:

```
recruiters (1) ─────> (many) platform_jobs
                            │
students_profile (1) ───────┴──> (many) applications
                                       │
                                       └──> (many) interview_invitations

students_profile (1) ───> (many) resume_analyses
students_profile (1) ───> (1) user_resumes
users (1) ───────────────> (many) subscriptions
users (1) ───────────────> (1) interview_usage
```

---

## 🔍 Useful Queries for Management

### View Recent Applications with Job Details
```sql
SELECT 
  a.id,
  s.full_name as student_name,
  s.email as student_email,
  j.job_title,
  r.company_name,
  a.status,
  a.skill_match_score,
  a.applied_at
FROM applications a
JOIN students_profile s ON a.student_id = s.id
JOIN platform_jobs j ON a.job_id = j.id
JOIN recruiters r ON j.recruiter_id = r.id
ORDER BY a.applied_at DESC
LIMIT 10;
```

### Check Active Subscriptions
```sql
SELECT 
  user_id,
  plan_type,
  status,
  start_date,
  end_date,
  amount
FROM subscriptions
WHERE status = 'active'
ORDER BY end_date DESC;
```

### View Top Students by Skills
```sql
SELECT 
  full_name,
  email,
  array_length(skills, 1) as skill_count,
  skills,
  profile_completed
FROM students_profile
WHERE profile_completed = true
ORDER BY skill_count DESC
LIMIT 10;
```

### Job Application Analytics
```sql
SELECT 
  j.job_title,
  r.company_name,
  COUNT(a.id) as application_count,
  AVG(a.skill_match_score) as avg_match_score,
  COUNT(CASE WHEN a.status = 'shortlisted' THEN 1 END) as shortlisted_count
FROM platform_jobs j
JOIN recruiters r ON j.recruiter_id = r.id
LEFT JOIN applications a ON j.id = a.job_id
GROUP BY j.id, j.job_title, r.company_name
ORDER BY application_count DESC;
```

### Resume Analysis Statistics
```sql
SELECT 
  COUNT(*) as total_analyses,
  ROUND(AVG(overall_score), 2) as avg_score,
  COUNT(CASE WHEN ats_compatibility = 'Excellent' THEN 1 END) as excellent_count,
  COUNT(CASE WHEN ats_compatibility = 'Good' THEN 1 END) as good_count,
  COUNT(CASE WHEN ats_compatibility = 'Fair' THEN 1 END) as fair_count,
  COUNT(CASE WHEN ats_compatibility = 'Poor' THEN 1 END) as poor_count
FROM resume_analyses;
```

---

## 🛡️ Row Level Security (RLS) Explained

RLS ensures users can only access their own data:

### Students:
- ✅ Can view/edit their own profile
- ✅ Can view all open jobs
- ✅ Can apply to jobs
- ✅ Can view their own applications
- ✅ Can view their own resume analyses
- ❌ Cannot view other students' data

### Recruiters:
- ✅ Can view/edit their own profile
- ✅ Can create/edit/delete their own jobs
- ✅ Can view applications for their jobs
- ✅ Can view student profiles (for hiring decisions)
- ✅ Can create interview invitations
- ❌ Cannot view other recruiters' jobs

---

## ⚠️ Troubleshooting

### Issue 1: \"relation already exists\"
**Cause:** Tables already created
**Solution:** ✅ This is fine! Skip to next step

---

### Issue 2: \"policy already exists\"
**Cause:** Policies already applied
**Solution:** ✅ This is fine! Setup is complete

---

### Issue 3: RLS Policy Violation
**Error:** `new row violates row-level security policy`

**Solutions:**
1. Check Firebase Auth is working
2. Verify JWT token is being sent
3. Temporarily disable RLS for testing:
   ```sql
   ALTER TABLE students_profile DISABLE ROW LEVEL SECURITY;
   ```
   Remember to re-enable after fixing:
   ```sql
   ALTER TABLE students_profile ENABLE ROW LEVEL SECURITY;
   ```

---

### Issue 4: Storage Upload Fails
**Error:** `Failed to upload file`

**Solutions:**
1. Verify bucket exists: Storage → Should see \"resumes\"
2. Check bucket is PUBLIC: Click bucket → Settings → Public bucket = ON
3. Verify policies:
   ```sql
   SELECT * FROM storage.policies WHERE bucket_id = 'resumes';
   ```

---

### Issue 5: Cannot Insert Data
**Error:** `permission denied for table`

**Solution:**
Check if RLS policies allow your operation:
```sql
-- View all policies for a table
SELECT * FROM pg_policies WHERE tablename = 'students_profile';
```

---

### Issue 6: Firebase Sync Issues
**Symptom:** Jobs not syncing between Firebase and Supabase

**Solution:**
Check firebase_id column exists:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'platform_jobs' 
AND column_name = 'firebase_id';
```

---

## 🔄 Migration from Firebase (Optional)

If you have existing data in Firebase:

### Export Firebase Data:
1. Use Firebase Console → Firestore → Export
2. Convert to JSON format

### Import to Supabase:
```sql
-- Example: Insert student profile
INSERT INTO students_profile (
  firebase_uid, full_name, email, skills, profile_completed
) VALUES (
  'firebase_uid_here',
  'John Doe',
  'john@example.com',
  ARRAY['React', 'Node.js', 'Python'],
  true
);
```

For bulk imports, use the Supabase Dashboard:
- Table Editor → Select Table → Import Data → Upload CSV

---

## 📈 Monitoring & Maintenance

### Daily Checks:
```sql
-- Check for failed applications
SELECT COUNT(*) FROM applications WHERE status = 'pending' AND applied_at < NOW() - INTERVAL '7 days';

-- Check expired subscriptions
SELECT COUNT(*) FROM subscriptions WHERE status = 'active' AND end_date < NOW();
```

### Weekly Cleanup:
```sql
-- Archive old resume analyses (older than 6 months)
DELETE FROM resume_analyses WHERE created_at < NOW() - INTERVAL '6 months';

-- Clean up cancelled subscriptions (older than 1 year)
DELETE FROM subscriptions WHERE status = 'cancelled' AND updated_at < NOW() - INTERVAL '1 year';
```

---

## 🎉 Success Checklist

Before going live, verify:

- [ ] All 9 tables created successfully
- [ ] RLS enabled on all tables (shield icons visible)
- [ ] Storage bucket \"resumes\" created and public
- [ ] Storage policies applied
- [ ] Environment variables configured in .env.local
- [ ] Firebase Auth integration working
- [ ] Test user registration (student & recruiter)
- [ ] Test job posting
- [ ] Test job application
- [ ] Test resume upload and analysis
- [ ] Test subscription creation
- [ ] All API endpoints returning data correctly

---

## 📞 Support Resources

### Supabase Documentation:
- Database: https://supabase.com/docs/guides/database
- Storage: https://supabase.com/docs/guides/storage
- Auth: https://supabase.com/docs/guides/auth
- RLS: https://supabase.com/docs/guides/auth/row-level-security

### Debugging:
1. **Supabase Dashboard → Logs**
   - View real-time database queries
   - Check for errors

2. **Browser Console**
   - Network tab for API calls
   - Console for JavaScript errors

3. **SQL Editor**
   - Test queries directly
   - Verify data structure

### Common Commands:
```sql
-- View all tables
\dt

-- Describe table structure
\d students_profile

-- Check table size
SELECT pg_size_pretty(pg_total_relation_size('students_profile'));

-- View active connections
SELECT * FROM pg_stat_activity WHERE datname = current_database();
```

---

## 🚀 Performance Tips

1. **Use Indexes:**
   - Already created for common queries
   - Add custom indexes if needed:
   ```sql
   CREATE INDEX idx_custom ON table_name(column_name);
   ```

2. **Optimize Queries:**
   - Use `EXPLAIN ANALYZE` to check query performance
   - Add `LIMIT` to large result sets

3. **Monitor Usage:**
   - Go to Dashboard → Database → Usage
   - Check query performance
   - Identify slow queries

4. **Backup Data:**
   - Dashboard → Database → Backups
   - Enable automatic daily backups
   - Test restore process

---

## 📄 Schema Export (Backup)

To backup your schema:

```bash
# Using Supabase CLI
supabase db dump > backup.sql

# Or from SQL Editor
\copy (SELECT * FROM students_profile) TO 'students_backup.csv' CSV HEADER;
```

---

## 🎯 What's Next?

After setup is complete:

1. **Configure Firebase Authentication**
   - Ensure Firebase Auth is integrated
   - Test login/signup flows

2. **Set Up Payment Gateway**
   - Configure Razorpay keys
   - Test subscription flows

3. **Configure Email Service**
   - Set up SendGrid/Resend
   - Test interview invitation emails

4. **Deploy Application**
   - Deploy on Vercel/Netlify
   - Update CORS settings if needed

5. **Monitor Performance**
   - Set up error tracking (Sentry)
   - Monitor Supabase usage
   - Set up alerts for critical issues

---

## ✅ Completion

Congratulations! 🎉 Your HireAI Supabase database is now fully set up and ready to use.

**Created by:** Supabase Setup Script
**Date:** 2025
**Version:** 1.0

For questions or issues, check:
- Supabase Dashboard Logs
- Browser Console
- Application Server Logs

**Happy Building! 🚀**
"
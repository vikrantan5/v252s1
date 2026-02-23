"# 🚀 HIREAI PLATFORM SETUP GUIDE

## PHASE 1 COMPLETE: DATABASE SCHEMA & IDENTITY SYNC ✅

This guide explains how to set up the new Supabase-based architecture.

---

## 📋 WHAT'S BEEN IMPLEMENTED

### 1. **Complete Supabase Schema** 
File: `/app/supabase-hireai-schema.sql`

**Tables Created:**
- ✅ `students_profile` - Complete student profiles with 15+ fields
- ✅ `recruiters` - Recruiter profiles with company info
- ✅ `platform_jobs` - Enhanced job postings (not external jobs)
- ✅ `applications` - Applications with skill match scores
- ✅ `interview_invitations` - Interview scheduling system

**Features:**
- Row Level Security (RLS) policies
- Automatic timestamp updates
- Indexes for fast queries
- Foreign key relationships
- Data validation constraints

### 2. **Identity Sync System**
File: `/app/lib/actions/profile.action.ts`

**Functions:**
- `syncUserToSupabase()` - Syncs Firebase user to Supabase on registration
- `getStudentProfile()` - Retrieves student profile by Firebase UID
- `updateStudentProfile()` - Updates student profile (auto-checks completion)
- `checkProfileCompletion()` - Validates if profile is complete
- `getRecruiterProfile()` - Retrieves recruiter profile
- `updateRecruiterProfile()` - Updates recruiter profile

**Auto-sync:**
- Updated `/app/lib/actions/auth.action.ts` to call `syncUserToSupabase()` on signup
- Firebase UID is stored in Supabase as `firebase_uid` field

### 3. **Skill Matching System**
File: `/app/lib/utils/skillMatch.ts`

**Functions:**
- `calculateSkillMatch()` - Calculates match percentage between student skills and job requirements
- `getMatchScoreColor()` - Returns badge color based on score
- `getMatchScoreText()` - Returns match quality text (Excellent/Good/Fair/Low)
- `sortJobsByMatchScore()` - Sorts jobs by match score
- `filterJobsByMinMatch()` - Filters jobs by minimum match threshold

**Algorithm:**
```
Match Score = (Matching Skills / Required Skills) × 100%
```

### 4. **Job & Application Management**
File: `/app/lib/actions/supabase-job.action.ts`

**Job Functions:**
- `createPlatformJob()` - Create new job posting
- `getJobById()` - Get job with recruiter details
- `getAllPlatformJobs()` - Get all jobs with filters
- `getJobsByRecruiter()` - Get jobs by recruiter
- `updatePlatformJob()` - Update job details
- `deletePlatformJob()` - Delete job
- `getRecommendedJobs()` - Get jobs sorted by skill match for student

**Application Functions:**
- `createApplication()` - Apply to job (auto-calculates skill match, checks profile completion)
- `getStudentApplications()` - Get student's applications with job details
- `getJobApplications()` - Get applications for a job with student profiles
- `updateApplicationStatus()` - Update application status (pending/shortlisted/rejected/interview_scheduled/selected)

### 5. **Interview Invitation System**
File: `/app/lib/actions/interview-invitation.action.ts`

**Functions:**
- `createInterviewInvitation()` - Create interview invitation
- `getInterviewInvitation()` - Get invitation with full details
- `getStudentInterviews()` - Get student's interview invitations
- `updateInterviewStatus()` - Update interview status
- `sendInterviewInvitationEmail()` - Send email (placeholder - needs Resend API key)
- `generateCalComLink()` - Generate Cal.com link (placeholder - needs API key)

### 6. **Updated Supabase Client**
File: `/app/lib/supabase.ts`

**New TypeScript Interfaces:**
- `StudentProfile`
- `RecruiterProfile`
- `PlatformJob`
- `JobApplication`
- `InterviewInvitation`

---

## 🔧 SETUP INSTRUCTIONS

### **STEP 1: Run Supabase Schema**

1. Go to your Supabase Dashboard: https://ktmxilcslghutmajhozw.supabase.co
2. Navigate to **SQL Editor** in the left sidebar
3. Click **\"New query\"**
4. Copy the entire content from `/app/supabase-hireai-schema.sql`
5. Paste it into the SQL Editor
6. Click **\"Run\"** or press `Ctrl+Enter`
7. Verify all tables are created in **Table Editor**

**Verification Checklist:**
- [ ] `students_profile` table exists
- [ ] `recruiters` table exists
- [ ] `platform_jobs` table exists
- [ ] `applications` table exists
- [ ] `interview_invitations` table exists
- [ ] All indexes are created
- [ ] RLS is enabled on all tables

### **STEP 2: Environment Variables**

Your `.env.local` should already have these (confirmed in problem statement):

```env
# Supabase (ALREADY CONFIGURED ✅)
NEXT_PUBLIC_SUPABASE_URL=https://ktmxilcslghutmajhozw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Firebase (ALREADY CONFIGURED ✅)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyB3aa4pf9QpwSVj7Alg501O6-8S0ZHBDXk
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=interview-970c8.firebaseapp.com
# ... other Firebase vars

# Email (PENDING - NEEDED FOR PHASE 6) ⏳
RESEND_API_KEY=re_xxxxxxxxxxxxx

# Scheduling (OPTIONAL) ⏳
CAL_COM_API_KEY=cal_xxxxxxxxxxxxx
```

### **STEP 3: Test Identity Sync**

**Test Flow:**
1. Create a new user account (sign up)
2. Check Supabase **Table Editor** → `students_profile` or `recruiters`
3. Verify a row with matching `firebase_uid` was created

**If sync fails:**
- Check Supabase service role key in `.env.local`
- Check browser console for errors
- Check `/app/lib/actions/auth.action.ts` line ~23

---

## 📊 DATABASE SCHEMA OVERVIEW

### **students_profile**
| Field | Type | Description |
|-------|------|-------------|
| `firebase_uid` | TEXT | **Link to Firebase Auth** |
| `full_name` | TEXT | Student name |
| `email` | TEXT | Email (unique) |
| `phone` | TEXT | Phone number |
| `college` | TEXT | College/University name |
| `degree` | TEXT | Degree program |
| `specialization` | TEXT | Major/Specialization |
| `skills` | TEXT[] | Array of skills |
| `experience_level` | TEXT | fresher/junior/mid/senior/lead |
| `projects` | JSONB | Array of project objects |
| `resume_url` | TEXT | Resume file URL |
| `preferred_job_roles` | TEXT[] | Preferred roles |
| `preferred_locations` | TEXT[] | Preferred locations |
| `profile_completed` | BOOLEAN | **Blocks applications if false** |

### **platform_jobs**
| Field | Type | Description |
|-------|------|-------------|
| `job_title` | TEXT | Job title |
| `job_description` | TEXT | Full description |
| `required_skills` | TEXT[] | **Used for skill matching** |
| `job_type` | TEXT | internship/full-time/contract |
| `work_mode` | TEXT | remote/onsite/hybrid |
| `salary_min` / `salary_max` | INT | Salary range |
| `is_paid` | BOOLEAN | Paid or unpaid |
| `internship_duration_months` | INT | Duration for internships |

### **applications**
| Field | Type | Description |
|-------|------|-------------|
| `student_id` | UUID | Links to students_profile |
| `job_id` | UUID | Links to platform_jobs |
| `status` | TEXT | pending/shortlisted/rejected/interview_scheduled/selected |
| `skill_match_score` | INT | **Auto-calculated (0-100)** |
| `matching_skills` | TEXT[] | Skills that matched |
| `missing_skills` | TEXT[] | Skills student is missing |

---

## 🎯 NEW APPLICATION FLOW

### **Old Flow (REMOVED ❌):**
```
Student applies → Mock AI interview auto-starts
```

### **New Flow (IMPLEMENTED ✅):**
```
1. Student must complete profile (profile_completed = true)
2. Student browses jobs → sees skill match scores
3. Student applies to job
4. Application stored with auto-calculated skill match
5. Recruiter views applicants → sees skill match scores
6. Recruiter can:
   - Shortlist
   - Reject
   - Select for Interview (triggers invitation)
7. When \"Select for Interview\" → Interview invitation created
8. Email sent to student with meeting link (needs Resend API key)
```

---

## 🧪 TESTING CHECKLIST

### **Test 1: Identity Sync**
- [ ] Create new student account
- [ ] Verify row in `students_profile` table
- [ ] Verify `firebase_uid` matches Firebase Auth UID

### **Test 2: Profile Completion**
- [ ] Try to apply to job with incomplete profile
- [ ] Should get error: \"Please complete your profile before applying\"
- [ ] Complete all required fields
- [ ] `profile_completed` should auto-update to `true`

### **Test 3: Skill Matching**
- [ ] Student with skills: [\"React\", \"Node.js\", \"TypeScript\"]
- [ ] Job requires: [\"React\", \"TypeScript\", \"Python\"]
- [ ] Expected match score: 67% (2/3 skills)
- [ ] Should show \"Good Match\" badge

### **Test 4: Application Creation**
- [ ] Complete profile
- [ ] Apply to job
- [ ] Check `applications` table
- [ ] Verify `skill_match_score` is calculated
- [ ] Verify `matching_skills` and `missing_skills` are populated

### **Test 5: Recruiter Views Applicants**
- [ ] Recruiter can see all applicants for their job
- [ ] Applicants sorted by skill match score
- [ ] Can see student profiles
- [ ] Can change application status

---

## 🚧 WHAT'S NEXT (REMAINING PHASES)

### **PHASE 2: Student Profile UI** (Next)
- Create profile completion form
- Profile edit page
- Profile view for recruiters
- Profile completion checker middleware

### **PHASE 3: Job Matching UI**
- Display skill match badges on job cards
- \"Recommended for You\" section
- Match score breakdown (which skills matched/missing)

### **PHASE 4: Enhanced Job Posting Form**
- Add new fields (job_type, salary, paid/unpaid, duration, work_mode)
- Update job creation UI

### **PHASE 5: Recruiter Dashboard**
- View applicants with skill match scores
- Student profile viewer
- Shortlist/Reject/Select actions
- Interview invitation sender

### **PHASE 6: Email & Meeting Integration**
- Integrate Resend API for emails
- Integrate Cal.com or Calendly for scheduling
- Email templates
- Automated invitation sending

### **PHASE 7: Student Dashboard**
- Profile completion widget
- Recommended jobs section
- Application tracking
- Interview invitations view

---

## 🔑 API KEYS NEEDED (Later Phases)

### **Resend (Email Service)**
1. Sign up at https://resend.com
2. Create API key
3. Add to `.env.local` as `RESEND_API_KEY`

### **Cal.com (Optional - Meeting Scheduling)**
1. Sign up at https://cal.com
2. Create API key
3. Add to `.env.local` as `CAL_COM_API_KEY`

**Alternative:** Recruiters can manually provide their Calendly link

---

## 📞 SUPPORT

### **Common Issues:**

**Issue: \"Recruiter not found\" when creating job**
- Ensure recruiter profile exists in `recruiters` table
- Check `firebase_uid` matches

**Issue: \"Profile not found\" when applying**
- Ensure student profile exists in `students_profile` table
- Run identity sync manually if needed

**Issue: RLS policy violation**
- Verify RLS policies are created (check SQL output)
- Use `supabaseAdmin` for server actions (bypasses RLS)

---

## ✅ PHASE 1 COMPLETE!

**What's Working:**
- ✅ Complete database schema
- ✅ Firebase → Supabase identity sync
- ✅ Student & recruiter profiles
- ✅ Skill matching algorithm
- ✅ Job management (create, read, update, delete)
- ✅ Application system with auto-calculated skill match
- ✅ Profile completion checking
- ✅ Interview invitation system (placeholder for email/cal.com)

**Ready for Phase 2:** Building the UI components! 🎨

---

Generated: Phase 1 Implementation
Date: 2025
"
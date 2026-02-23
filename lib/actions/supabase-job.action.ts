""use server";

import { supabaseAdmin } from "@/lib/supabase";
import type { PlatformJob, JobApplication, StudentProfile } from "@/lib/supabase";
import { calculateSkillMatch } from "@/lib/utils/skillMatch";

// ================================================
// JOB ACTIONS
// ================================================

export async function createPlatformJob(params: {
  recruiterFirebaseUid: string;
  jobData: Omit<PlatformJob, "id" | "recruiter_id" | "created_at" | "updated_at">;
}): Promise<{ success: boolean; jobId?: string; error?: string }> {
  try {
    const { recruiterFirebaseUid, jobData } = params;

    // Get recruiter ID from firebase_uid
    const { data: recruiter, error: recruiterError } = await supabaseAdmin
      .from("recruiters")
      .select("id")
      .eq("firebase_uid", recruiterFirebaseUid)
      .single();

    if (recruiterError || !recruiter) {
      throw new Error("Recruiter not found");
    }

    // Insert job
    const { data, error } = await supabaseAdmin
      .from("platform_jobs")
      .insert({
        recruiter_id: recruiter.id,
        ...jobData,
      })
      .select()
      .single();

    if (error) throw error;

    return { success: true, jobId: data.id };
  } catch (error: any) {
    console.error("Create job error:", error);
    return { success: false, error: error.message };
  }
}

export async function getJobById(
  jobId: string
): Promise<{ success: boolean; job?: PlatformJob & { recruiter?: any }; error?: string }> {
  try {
    const { data, error } = await supabaseAdmin
      .from("platform_jobs")
      .select(`
        *,
        recruiters (
          id,
          full_name,
          company_name,
          company_logo_url,
          company_website
        )
      `)
      .eq("id", jobId)
      .single();

    if (error) throw error;

    return { success: true, job: data as any };
  } catch (error: any) {
    console.error("Get job error:", error);
    return { success: false, error: error.message };
  }
}

export async function getAllPlatformJobs(params?: {
  status?: "open" | "closed" | "draft";
  jobType?: string;
  workMode?: string;
  limit?: number;
}): Promise<{ success: boolean; jobs?: PlatformJob[]; error?: string }> {
  try {
    let query = supabaseAdmin
      .from("platform_jobs")
      .select("*")
      .order("created_at", { ascending: false });

    if (params?.status) {
      query = query.eq("status", params.status);
    }
    if (params?.jobType) {
      query = query.eq("job_type", params.jobType);
    }
    if (params?.workMode) {
      query = query.eq("work_mode", params.workMode);
    }
    if (params?.limit) {
      query = query.limit(params.limit);
    }

    const { data, error } = await query;

    if (error) throw error;

    return { success: true, jobs: data as PlatformJob[] };
  } catch (error: any) {
    console.error("Get all jobs error:", error);
    return { success: false, error: error.message };
  }
}

export async function getJobsByRecruiter(
  recruiterFirebaseUid: string
): Promise<{ success: boolean; jobs?: PlatformJob[]; error?: string }> {
  try {
    // Get recruiter ID
    const { data: recruiter } = await supabaseAdmin
      .from("recruiters")
      .select("id")
      .eq("firebase_uid", recruiterFirebaseUid)
      .single();

    if (!recruiter) {
      return { success: true, jobs: [] };
    }

    const { data, error } = await supabaseAdmin
      .from("platform_jobs")
      .select("*")
      .eq("recruiter_id", recruiter.id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return { success: true, jobs: data as PlatformJob[] };
  } catch (error: any) {
    console.error("Get recruiter jobs error:", error);
    return { success: false, error: error.message };
  }
}

export async function updatePlatformJob(
  jobId: string,
  updates: Partial<PlatformJob>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from("platform_jobs")
      .update(updates)
      .eq("id", jobId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Update job error:", error);
    return { success: false, error: error.message };
  }
}

export async function deletePlatformJob(
  jobId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from("platform_jobs")
      .delete()
      .eq("id", jobId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Delete job error:", error);
    return { success: false, error: error.message };
  }
}

// ================================================
// JOB MATCHING FOR STUDENTS
// ================================================

export async function getRecommendedJobs(
  studentFirebaseUid: string,
  limit: number = 20
): Promise<{ 
  success: boolean; 
  jobs?: (PlatformJob & { skill_match_score: number; matching_skills: string[]; missing_skills: string[] })[]; 
  error?: string 
}> {
  try {
    // Get student profile
    const { data: student, error: studentError } = await supabaseAdmin
      .from("students_profile")
      .select("*")
      .eq("firebase_uid", studentFirebaseUid)
      .single();

    if (studentError || !student) {
      throw new Error("Student profile not found");
    }

    const studentProfile = student as StudentProfile;

    // Get all open jobs
    const { data: jobs, error: jobsError } = await supabaseAdmin
      .from("platform_jobs")
      .select("*")
      .eq("status", "open");

    if (jobsError) throw jobsError;

    // Calculate skill match for each job
    const jobsWithMatch = (jobs || []).map(job => {
      const matchResult = calculateSkillMatch(
        studentProfile.skills || [],
        job.required_skills || []
      );

      return {
        ...job,
        skill_match_score: matchResult.matchScore,
        matching_skills: matchResult.matchingSkills,
        missing_skills: matchResult.missingSkills,
      };
    });

    // Sort by match score (highest first)
    const sortedJobs = jobsWithMatch.sort((a, b) => b.skill_match_score - a.skill_match_score);

    // Return top matches
    return { 
      success: true, 
      jobs: sortedJobs.slice(0, limit) as any 
    };
  } catch (error: any) {
    console.error("Get recommended jobs error:", error);
    return { success: false, error: error.message };
  }
}

// ================================================
// APPLICATION ACTIONS
// ================================================

export async function createApplication(params: {
  studentFirebaseUid: string;
  jobId: string;
  coverLetter?: string;
  resumeUrl?: string;
}): Promise<{ success: boolean; applicationId?: string; error?: string }> {
  try {
    const { studentFirebaseUid, jobId, coverLetter, resumeUrl } = params;

    // Get student profile
    const { data: student, error: studentError } = await supabaseAdmin
      .from("students_profile")
      .select("*")
      .eq("firebase_uid", studentFirebaseUid)
      .single();

    if (studentError || !student) {
      throw new Error("Student profile not found");
    }

    // Check if profile is completed
    if (!student.profile_completed) {
      return { success: false, error: "Please complete your profile before applying to jobs" };
    }

    const studentProfile = student as StudentProfile;

    // Get job details
    const { data: job, error: jobError } = await supabaseAdmin
      .from("platform_jobs")
      .select("*")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      throw new Error("Job not found");
    }

    const jobData = job as PlatformJob;

    // Calculate skill match
    const matchResult = calculateSkillMatch(
      studentProfile.skills || [],
      jobData.required_skills || []
    );

    // Check if application already exists
    const { data: existingApp } = await supabaseAdmin
      .from("applications")
      .select("id")
      .eq("student_id", student.id)
      .eq("job_id", jobId)
      .single();

    if (existingApp) {
      return { success: false, error: "You have already applied to this job" };
    }

    // Create application
    const { data: application, error: appError } = await supabaseAdmin
      .from("applications")
      .insert({
        student_id: student.id,
        job_id: jobId,
        cover_letter: coverLetter,
        resume_url: resumeUrl || studentProfile.resume_url,
        status: "pending",
        skill_match_score: matchResult.matchScore,
        matching_skills: matchResult.matchingSkills,
        missing_skills: matchResult.missingSkills,
      })
      .select()
      .single();

    if (appError) throw appError;

    return { success: true, applicationId: application.id };
  } catch (error: any) {
    console.error("Create application error:", error);
    return { success: false, error: error.message };
  }
}

export async function getStudentApplications(
  studentFirebaseUid: string
): Promise<{ success: boolean; applications?: any[]; error?: string }> {
  try {
    // Get student profile
    const { data: student } = await supabaseAdmin
      .from("students_profile")
      .select("id")
      .eq("firebase_uid", studentFirebaseUid)
      .single();

    if (!student) {
      return { success: true, applications: [] };
    }

    // Get applications with job details
    const { data, error } = await supabaseAdmin
      .from("applications")
      .select(`
        *,
        platform_jobs (
          id,
          job_title,
          job_type,
          work_mode,
          location,
          salary_min,
          salary_max,
          recruiters (
            company_name,
            company_logo_url
          )
        )
      `)
      .eq("student_id", student.id)
      .order("applied_at", { ascending: false });

    if (error) throw error;

    return { success: true, applications: data };
  } catch (error: any) {
    console.error("Get student applications error:", error);
    return { success: false, error: error.message };
  }
}

export async function getJobApplications(
  jobId: string
): Promise<{ success: boolean; applications?: any[]; error?: string }> {
  try {
    // Get applications with student details
    const { data, error } = await supabaseAdmin
      .from("applications")
      .select(`
        *,
        students_profile (
          id,
          firebase_uid,
          full_name,
          email,
          phone,
          profile_picture_url,
          college,
          degree,
          specialization,
          skills,
          experience_level,
          years_of_experience,
          resume_url
        )
      `)
      .eq("job_id", jobId)
      .order("applied_at", { ascending: false });

    if (error) throw error;

    return { success: true, applications: data };
  } catch (error: any) {
    console.error("Get job applications error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateApplicationStatus(
  applicationId: string,
  status: JobApplication["status"],
  recruiterNotes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const updates: any = { status };
    if (recruiterNotes) {
      updates.recruiter_notes = recruiterNotes;
    }

    const { error } = await supabaseAdmin
      .from("applications")
      .update(updates)
      .eq("id", applicationId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Update application status error:", error);
    return { success: false, error: error.message };
  }
}
"
"use server";

/**
 * AUTO-SYNC JOB FUNCTION
 * 
 * This server action automatically syncs jobs from Firebase to Supabase.
 * Call this whenever a job is created or updated in Firebase.
 * 
 * Usage:
 * import { syncJobToSupabase, syncJobUpdate } from "@/lib/actions/job-sync.action";
 * 
 * // After creating a job in Firebase
 * await syncJobToSupabase(firebaseJobId);
 * 
 * // After updating a job in Firebase
 * await syncJobUpdate(firebaseJobId);
 */

import { supabaseAdmin } from "@/lib/supabase";
import { adminDb } from "@/lib/firebase/admin";



/**
 * Get or create external recruiter for scraped jobs
 */
async function getExternalRecruiter(): Promise<{ 
  success: boolean; 
  recruiterId?: string; 
  error?: string 
}> {
  try {
    // Check if external recruiter exists
    const { data: existing } = await supabaseAdmin
      .from("recruiters")
      .select("id")
      .eq("firebase_uid", "external_scraper")
      .maybeSingle();
    
    if (existing) {
      return { success: true, recruiterId: existing.id };
    }
    
    // Create external recruiter
    const { data: newRecruiter, error } = await supabaseAdmin
      .from("recruiters")
      .insert({
        firebase_uid: "external_scraper",
        full_name: "External Jobs",
        email: "external@hireai.platform",
        company_name: "External Sources",
        company_description: "Jobs aggregated from external platforms",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select("id")
      .single();
    
    if (error) {
      return { success: false, error: `Failed to create external recruiter: ${error.message}` };
    }
    
    console.log(`[Job Sync] Created external recruiter in Supabase: ${newRecruiter.id}`);
    return { success: true, recruiterId: newRecruiter.id };
    
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Sync or get recruiter from Supabase
 */
async function getOrCreateRecruiter(firebaseUid: string): Promise<{ 
  success: boolean; 
  recruiterId?: string; 
  error?: string 
}> {
  try {
    // Handle external scraper jobs
    if (firebaseUid === "external_scraper") {
      return await getExternalRecruiter();
    }
    // Check if recruiter exists in Supabase
    const { data: existing } = await supabaseAdmin
      .from("recruiters")
      .select("id")
      .eq("firebase_uid", firebaseUid)
      .maybeSingle();
    
    if (existing) {
      return { success: true, recruiterId: existing.id };
    }
    
    // Fetch from Firebase
    const recruiterDoc = await adminDb()
      .collection("recruiters")
      .doc(firebaseUid)
      .get();
    
    if (!recruiterDoc.exists) {
       // If recruiter doesn't exist, use external recruiter as fallback
      console.log(`[Job Sync] Recruiter not found in Firebase: ${firebaseUid}, using external recruiter`);
      return await getExternalRecruiter();
    }
    
    const recruiterData = recruiterDoc.data()!;
    
    // Create in Supabase
    const { data: newRecruiter, error } = await supabaseAdmin
      .from("recruiters")
      .insert({
        firebase_uid: firebaseUid,
        full_name: recruiterData.full_name || recruiterData.name || "Unknown",
        email: recruiterData.email || "",
        phone: recruiterData.phone || "",
        company_name: recruiterData.company_name || recruiterData.companyName || "Unknown Company",
        company_website: recruiterData.company_website || recruiterData.companyWebsite || "",
        company_logo_url: recruiterData.company_logo_url || recruiterData.companyLogo || "",
        company_description: recruiterData.company_description || "",
        industry: recruiterData.industry || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select("id")
      .single();
    
    if (error) {
      return { success: false, error: `Failed to create recruiter: ${error.message}` };
    }
    
    console.log(`[Job Sync] Created recruiter in Supabase: ${newRecruiter.id}`);
    return { success: true, recruiterId: newRecruiter.id };
    
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Sync a job from Firebase to Supabase (CREATE)
 * 
 * @param firebaseJobId - The Firebase document ID of the job
 * @returns Success status and created job ID
 */
export async function syncJobToSupabase(
  firebaseJobId: string
): Promise<{ success: boolean; jobId?: string; error?: string }> {
  try {
    console.log(`[Job Sync] Syncing job: ${firebaseJobId}`);
    
    // Check if already synced
    const { data: existing } = await supabaseAdmin
      .from("platform_jobs")
      .select("id")
      .eq("firebase_id", firebaseJobId)
      .maybeSingle();
    
    if (existing) {
      console.log(`[Job Sync] Job already synced: ${existing.id}`);
      return { success: true, jobId: existing.id };
    }
    
    // Get job from Firebase
    const jobDoc = await adminDb().collection("jobs").doc(firebaseJobId).get();
    
    if (!jobDoc.exists) {
      return { success: false, error: "Job not found in Firebase" };
    }
    
    const jobData = jobDoc.data()!;
    
    // Get or create recruiter
    if (!jobData.recruiterId) {
      return { success: false, error: "Job missing recruiterId" };
    }
    
    const recruiterResult = await getOrCreateRecruiter(jobData.recruiterId);
    
    if (!recruiterResult.success) {
      return { 
        success: false, 
        error: recruiterResult.error || "Failed to sync recruiter" 
      };
    }
    
    // Map Firebase data to Supabase schema
    const supabaseJobData = {
      firebase_id: firebaseJobId,
      recruiter_id: recruiterResult.recruiterId!,
      job_title: jobData.title || "Untitled Position",
      job_description: jobData.description || "",
      role_category: jobData.roleCategory || jobData.category || null,
      required_skills: jobData.requiredSkills || jobData.skills || [],
      experience_required: jobData.experienceRequired || jobData.experience || 0,
      min_qualifications: jobData.minQualifications || jobData.qualifications || null,
      salary_min: jobData.salaryMin || jobData.minSalary || null,
      salary_max: jobData.salaryMax || jobData.maxSalary || null,
      currency: jobData.currency || "INR",
      is_paid: jobData.isPaid !== false,
      job_type: jobData.type || jobData.jobType || "full-time",
      internship_duration_months: jobData.internshipDuration || jobData.duration || null,
      work_mode: jobData.workMode || jobData.mode || "remote",
      location: jobData.location || "",
      status: jobData.status || "open",
      openings: jobData.openings || 1,
      application_deadline: jobData.deadline || jobData.applicationDeadline || null,
      perks: jobData.perks || [],
      created_at: jobData.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Insert into Supabase
    const { data: newJob, error } = await supabaseAdmin
      .from("platform_jobs")
      .insert(supabaseJobData)
      .select("id")
      .single();
    
    if (error) {
      console.error("[Job Sync] Error:", error);
      return { success: false, error: error.message };
    }
    
    console.log(`[Job Sync] Successfully synced job: ${newJob.id}`);
    return { success: true, jobId: newJob.id };
    
  } catch (error: any) {
    console.error("[Job Sync] Fatal error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Update a synced job in Supabase (UPDATE)
 * 
 * @param firebaseJobId - The Firebase document ID of the job
 * @returns Success status
 */
export async function syncJobUpdate(
  firebaseJobId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`[Job Sync] Updating job: ${firebaseJobId}`);
    
    // Find the job in Supabase
    const { data: supabaseJob } = await supabaseAdmin
      .from("platform_jobs")
      .select("id")
      .eq("firebase_id", firebaseJobId)
      .maybeSingle();
    
    if (!supabaseJob) {
      // Job doesn't exist yet, create it
      console.log(`[Job Sync] Job not found, creating new sync`);
      return await syncJobToSupabase(firebaseJobId);
    }
    
    // Get updated data from Firebase
    const jobDoc = await adminDb().collection("jobs").doc(firebaseJobId).get();
    
    if (!jobDoc.exists) {
      return { success: false, error: "Job not found in Firebase" };
    }
    
    const jobData = jobDoc.data()!;
    
    // Update in Supabase
    const updateData = {
      job_title: jobData.title || "Untitled Position",
      job_description: jobData.description || "",
      role_category: jobData.roleCategory || jobData.category || null,
      required_skills: jobData.requiredSkills || jobData.skills || [],
      experience_required: jobData.experienceRequired || jobData.experience || 0,
      min_qualifications: jobData.minQualifications || jobData.qualifications || null,
      salary_min: jobData.salaryMin || jobData.minSalary || null,
      salary_max: jobData.salaryMax || jobData.maxSalary || null,
      currency: jobData.currency || "INR",
      is_paid: jobData.isPaid !== false,
      job_type: jobData.type || jobData.jobType || "full-time",
      internship_duration_months: jobData.internshipDuration || jobData.duration || null,
      work_mode: jobData.workMode || jobData.mode || "remote",
      location: jobData.location || "",
      status: jobData.status || "open",
      openings: jobData.openings || 1,
      application_deadline: jobData.deadline || jobData.applicationDeadline || null,
      perks: jobData.perks || [],
      updated_at: new Date().toISOString()
    };
    
    const { error } = await supabaseAdmin
      .from("platform_jobs")
      .update(updateData)
      .eq("id", supabaseJob.id);
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    console.log(`[Job Sync] Successfully updated job: ${supabaseJob.id}`);
    return { success: true };
    
  } catch (error: any) {
    console.error("[Job Sync] Update error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a job from Supabase when deleted from Firebase
 * 
 * @param firebaseJobId - The Firebase document ID of the job
 * @returns Success status
 */
export async function syncJobDelete(
  firebaseJobId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`[Job Sync] Deleting job: ${firebaseJobId}`);
    
    const { error } = await supabaseAdmin
      .from("platform_jobs")
      .delete()
      .eq("firebase_id", firebaseJobId);
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    console.log(`[Job Sync] Successfully deleted job from Supabase`);
    return { success: true };
    
  } catch (error: any) {
    console.error("[Job Sync] Delete error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Batch sync multiple jobs (useful for migration or bulk operations)
 * 
 * @param firebaseJobIds - Array of Firebase job document IDs
 * @returns Summary of sync results
 */
export async function batchSyncJobs(
  firebaseJobIds: string[]
): Promise<{ 
  success: boolean; 
  results: { created: number; failed: number; errors: string[] } 
}> {
  const results = {
    created: 0,
    failed: 0,
    errors: [] as string[]
  };
  
  console.log(`[Job Sync] Starting batch sync of ${firebaseJobIds.length} jobs`);
  
  for (const jobId of firebaseJobIds) {
    const result = await syncJobToSupabase(jobId);
    
    if (result.success) {
      results.created++;
    } else {
      results.failed++;
      results.errors.push(`${jobId}: ${result.error}`);
    }
  }
  
  console.log(`[Job Sync] Batch complete - Created: ${results.created}, Failed: ${results.failed}`);
  
  return {
    success: results.failed === 0,
    results
  };
}

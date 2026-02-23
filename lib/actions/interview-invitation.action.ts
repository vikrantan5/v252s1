"use server";

import { supabaseAdmin } from "@/lib/supabase";
import type { InterviewInvitation } from "@/lib/supabase";
import { adminDb } from "@/lib/firebase/admin";
import { randomUUID } from "crypto";

// ================================================
// INTERVIEW INVITATION ACTIONS
// ================================================

export async function createInterviewInvitation(params: {
  applicationId: string;
  meetingUrl?: string;
  scheduledDate?: string;
  interviewerName?: string;
  interviewType?: string;
  interviewInstructions?: string;
  durationMinutes?: number;
}): Promise<{ success: boolean; invitationId?: string; error?: string }> {
  try {
    const {
      applicationId,
      meetingUrl,
      scheduledDate,
      interviewerName,
      interviewType,
      interviewInstructions,
      durationMinutes = 60,
    } = params;

    console.log(`[Interview Invitation] Processing application: ${applicationId}`);

    // STEP 1: Get application data from Firebase
    const doc = await adminDb().collection("applications").doc(applicationId).get();
    if (!doc.exists) {
      return { success: false, error: "Application not found in Firebase" };
    }
    
    const firebaseApp = doc.data();
    console.log(`[Interview Invitation] Found application in Firebase`);

    // Validate Firebase app data
    if (!firebaseApp) {
      return { success: false, error: "Application data is empty" };
    }

    if (!firebaseApp.applicantId) {
      return { success: false, error: "Applicant ID not found in application data" };
    }

    // STEP 2: Check if we already have a Supabase mapping
    if (firebaseApp.supabaseId) {
      console.log(`[Interview Invitation] Using existing Supabase ID: ${firebaseApp.supabaseId}`);
      
      // Check if invitation already exists for this application
      const { data: existing } = await supabaseAdmin
        .from("interview_invitations")
        .select("id")
        .eq("application_id", firebaseApp.supabaseId)
        .maybeSingle();

      if (existing) {
        return { success: false, error: "Interview invitation already sent for this application" };
      }
    }

    // STEP 3: Get student from Supabase using Firebase UID
    let studentId: string | null = null;

    const { data: student, error: studentError } = await supabaseAdmin
      .from("students_profile")
      .select("id")
      .eq("firebase_uid", firebaseApp.applicantId) // Now TypeScript knows this is safe
      .maybeSingle();

    // Rest of the function continues...
    if (studentError || !student) {
      console.error(`Student not found in Supabase for Firebase UID: ${firebaseApp.applicantId}`);
      
      // Try to sync student from Firebase to Supabase
      try {
        const studentSyncResult = await syncStudentToSupabase(firebaseApp.applicantId);
        if (!studentSyncResult.success) {
          return { 
            success: false, 
            error: `Student with Firebase UID ${firebaseApp.applicantId} not found in Supabase. Please ensure student profile is synced.` 
          };
        }
        studentId = studentSyncResult.studentId!;
      } catch (syncError: any) {
        return { 
          success: false, 
          error: `Failed to sync student: ${syncError.message}` 
        };
      }
    } else {
      studentId = student.id;
    }

    // STEP 4: Get job from Supabase using Firebase job ID
    let jobId: string | null = null;

    const { data: job, error: jobError } = await supabaseAdmin
      .from("platform_jobs")
      .select("id")
      .eq("firebase_id", firebaseApp.jobId)
      .maybeSingle(); // Use maybeSingle instead of single

    if (jobError || !job) {
      console.error(`Job not found in Supabase for Firebase job ID: ${firebaseApp.jobId}`);
      
      // Try to sync job from Firebase to Supabase
      try {
        const jobSyncResult = await syncJobToSupabase(firebaseApp.jobId);
        if (!jobSyncResult.success) {
          return { 
            success: false, 
            error: `Job with Firebase ID ${firebaseApp.jobId} not found in Supabase. Please ensure job is synced.` 
          };
        }
        jobId = jobSyncResult.jobId!;
      } catch (syncError: any) {
        return { 
          success: false, 
          error: `Failed to sync job: ${syncError.message}` 
        };
      }
    } else {
      jobId = job.id;
    }

    // STEP 5: Create or get application in Supabase
    let supabaseApplicationId = firebaseApp?.supabaseId;
    
    if (!supabaseApplicationId) {
      // Check if application already exists in Supabase with this combination
      const { data: existingApp } = await supabaseAdmin
        .from("applications")
        .select("id")
        .eq("student_id", studentId)
        .eq("job_id", jobId)
        .maybeSingle();

      if (existingApp) {
        supabaseApplicationId = existingApp.id;
        console.log(`[Interview Invitation] Found existing application in Supabase: ${supabaseApplicationId}`);
      } else {
        // Create new application in Supabase with REAL IDs
        supabaseApplicationId = randomUUID(); // Use randomUUID for the application record itself

         // Map Firebase status to valid Supabase status
        // Valid Supabase statuses: 'pending', 'shortlisted', 'rejected', 'interview_scheduled', 'selected', 'withdrawn'
        const mapFirebaseStatusToSupabase = (firebaseStatus: string): string => {
          const statusMap: { [key: string]: string } = {
            'accepted': 'shortlisted',
            'pending': 'pending',
            'shortlisted': 'shortlisted',
            'rejected': 'rejected',
            'interview_scheduled': 'interview_scheduled',
            'selected': 'selected',
            'withdrawn': 'withdrawn',
          };
          return statusMap[firebaseStatus] || 'pending';
        };

        const mappedStatus = mapFirebaseStatusToSupabase(firebaseApp?.status || 'pending');
        
        const { error: appError } = await supabaseAdmin
          .from("applications")
          .insert({
            id: supabaseApplicationId,
            student_id: studentId, // Use REAL student ID from Supabase
            job_id: jobId, // Use REAL job ID from Supabase
            // status: firebaseApp?.status || "pending",
              status: mappedStatus,
            skill_match_score: firebaseApp?.skillMatchScore || 0,
            matching_skills: firebaseApp?.matchingSkills || [],
            missing_skills: firebaseApp?.missingSkills || [],
            cover_letter: firebaseApp?.coverLetter || null,
            resume_url: firebaseApp?.resumeUrl || null,
            applied_at: firebaseApp?.createdAt || new Date().toISOString(),
          });

        if (appError) {
          console.error("Supabase app creation error:", appError);
          throw appError;
        }

        // console.log(`[Interview Invitation] Created application in Supabase: ${supabaseApplicationId}`);
          console.log(`[Interview Invitation] Created application in Supabase: ${supabaseApplicationId} with status: ${mappedStatus}`);
      }

      // Update Firebase with Supabase ID
      await adminDb().collection("applications").doc(applicationId).update({
        supabaseId: supabaseApplicationId
      });
      console.log(`[Interview Invitation] Updated Firebase with Supabase mapping`);
    }

    // STEP 6: Check if invitation already exists
    const { data: existingInvite } = await supabaseAdmin
      .from("interview_invitations")
      .select("id")
      .eq("application_id", supabaseApplicationId)
      .maybeSingle();

    if (existingInvite) {
      return { success: false, error: "Interview invitation already sent for this application" };
    }

    // STEP 7: Create interview invitation
    const invitationId = randomUUID();
    const { data, error } = await supabaseAdmin
      .from("interview_invitations")
      .insert({
        id: invitationId,
        application_id: supabaseApplicationId,
        meeting_url: meetingUrl,
        scheduled_date: scheduledDate,
        interviewer_name: interviewerName,
        interview_type: interviewType,
        interview_instructions: interviewInstructions,
        duration_minutes: durationMinutes,
        meeting_platform: "google-meet",
        status: "pending",
        email_sent: false,
        student_confirmed: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error("Create invitation error:", error);
      throw error;
    }

    console.log(`[Interview Invitation] Successfully created invitation: ${data.id}`);

    // STEP 8: Update application status in Supabase
    await supabaseAdmin
      .from("applications")
      .update({ status: "interview_scheduled" })
      .eq("id", supabaseApplicationId);

    // STEP 9: Update application status in Firebase
    await adminDb().collection("applications").doc(applicationId).update({
      status: "interview_scheduled",
      interviewStatus: "scheduled"
    });

    return { success: true, invitationId: data.id };
  } catch (error: any) {
    console.error("Create interview invitation error:", error);
    return { success: false, error: error.message };
  }
}

// Helper function to sync student to Supabase
async function syncStudentToSupabase(firebaseUid: string): Promise<{ success: boolean; studentId?: string; error?: string }> {
  try {
    // Check if student already exists
    const { data: existing } = await supabaseAdmin
      .from("students_profile")
      .select("id")
      .eq("firebase_uid", firebaseUid)
      .maybeSingle();

    if (existing) {
      return { success: true, studentId: existing.id };
    }

    // Get student data from Firebase
    const studentDoc = await adminDb().collection("students_profile").doc(firebaseUid).get();
    if (!studentDoc.exists) {
      return { success: false, error: "Student not found in Firebase" };
    }

    const studentData = studentDoc.data();
    
    // Validate student data
    if (!studentData) {
      return { success: false, error: "Student data is empty" };
    }

    // Create student in Supabase with safe defaults
    const { data: newStudent, error } = await supabaseAdmin
      .from("students_profile")
      .insert({
        firebase_uid: firebaseUid,
        full_name: studentData.full_name || "",
        email: studentData.email || "",
        phone: studentData.phone || "",
        profile_picture_url: studentData.profile_picture_url || "",
        college: studentData.college || "",
        university: studentData.university || "",
        degree: studentData.degree || "",
        specialization: studentData.specialization || "",
        graduation_year: studentData.graduation_year || null,
        skills: studentData.skills || [],
        experience_level: studentData.experience_level || null,
        years_of_experience: studentData.years_of_experience || 0,
        resume_url: studentData.resume_url || "",
        bio: studentData.bio || "",
        profile_completed: studentData.profile_completed || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select("id")
      .single();

    if (error) throw error;
    return { success: true, studentId: newStudent.id };
  } catch (error: any) {
    console.error("Sync student error:", error);
    return { success: false, error: error.message };
  }
}

// Helper function to sync job to Supabase
// Helper function to sync job to Supabase
async function syncJobToSupabase(firebaseJobId: string): Promise<{ success: boolean; jobId?: string; error?: string }> {
  try {
    // Check if job already exists
    const { data: existing } = await supabaseAdmin
      .from("platform_jobs")
      .select("id")
      .eq("firebase_id", firebaseJobId)
      .maybeSingle();

    if (existing) {
      return { success: true, jobId: existing.id };
    }

    // Get job from Firebase
    const jobDoc = await adminDb().collection("jobs").doc(firebaseJobId).get();
    if (!jobDoc.exists) {
      return { success: false, error: "Job not found in Firebase" };
    }

    const jobData = jobDoc.data();
    
    // Validate job data
    if (!jobData) {
      return { success: false, error: "Job data is empty" };
    }

    // Validate required fields
    if (!jobData.recruiterId) {
      return { success: false, error: "Recruiter ID not found in job data" };
    }

    console.log("Syncing job:", firebaseJobId);
    console.log("Firebase job exists:", jobDoc.exists);
    console.log("Job data:", jobData);

    // Get recruiter from Supabase
    let recruiterId: string;

    const { data: recruiter } = await supabaseAdmin
      .from("recruiters")
      .select("id")
      .eq("firebase_uid", jobData.recruiterId) // Now safe because we validated above
      .maybeSingle();

    if (!recruiter) {
      const recruiterSync = await syncRecruiterToSupabase(jobData.recruiterId);

      if (!recruiterSync.success) {
        return { success: false, error: recruiterSync.error };
      }

      recruiterId = recruiterSync.recruiterId!;
    } else {
      recruiterId = recruiter.id;
    }

    // Create job in Supabase with safe defaults
    const { data: newJob, error } = await supabaseAdmin
      .from("platform_jobs")
      .insert({
        firebase_id: firebaseJobId,
        recruiter_id: recruiterId,
        job_title: jobData.title || "",
        job_description: jobData.description || "",
        required_skills: jobData.requiredSkills || [],
        experience_required: jobData.experienceRequired || 0,
        salary_min: jobData.salaryMin || null,
        salary_max: jobData.salaryMax || null,
        currency: jobData.currency || "INR",
        is_paid: jobData.isPaid !== false,
        job_type: jobData.type || "full-time",
        internship_duration_months: jobData.internshipDuration || null,
        work_mode: jobData.workMode || "remote",
        location: jobData.location || "",
        status: jobData.status || "open",
        openings: jobData.openings || 1,
        application_deadline: jobData.deadline || null,
        perks: jobData.perks || [],
        created_at: jobData.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select("id")
      .single();

    if (error) throw error;
    
    console.log("Job synced successfully:", firebaseJobId);
    return { success: true, jobId: newJob.id };
    
  } catch (error: any) {
    console.error("Sync job error:", error);
    return { success: false, error: error.message };
  }
}

// ... rest of your functions remain the same ...
export async function getInterviewInvitation(
  invitationId: string
): Promise<{ success: boolean; invitation?: any; error?: string }> {
  try {
    const { data, error } = await supabaseAdmin
      .from("interview_invitations")
      .select(`
        *,
        applications (
          id,
          job_id,
          student_id,
          platform_jobs (
            job_title,
            job_type,
            recruiters (
              full_name,
              company_name,
              company_logo_url,
              email
            )
          ),
          students_profile (
            full_name,
            email,
            phone
          )
        )
      `)
      .eq("id", invitationId)
      .single();

    if (error) throw error;

    return { success: true, invitation: data };
  } catch (error: any) {
    console.error("Get interview invitation error:", error);
    return { success: false, error: error.message };
  }
}

export async function getStudentInterviews(
  studentFirebaseUid: string
): Promise<{ success: boolean; interviews?: any[]; error?: string }> {
  try {
    // Get student profile
    const { data: student } = await supabaseAdmin
      .from("students_profile")
      .select("id")
      .eq("firebase_uid", studentFirebaseUid)
      .single();

    if (!student) {
      return { success: true, interviews: [] };
    }

    // Get interviews
    const { data, error } = await supabaseAdmin
      .from("interview_invitations")
      .select(`
        *,
        applications!inner (
          id,
          student_id,
          platform_jobs (
            job_title,
            job_type,
            work_mode,
            location,
            recruiters (
              full_name,
              company_name,
              company_logo_url
            )
          )
        )
      `)
      .eq("applications.student_id", student.id)
      .order("scheduled_date", { ascending: true });

    if (error) throw error;

    return { success: true, interviews: data };
  } catch (error: any) {
    console.error("Get student interviews error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateInterviewStatus(
  invitationId: string,
  status: InterviewInvitation["status"],
  studentConfirmed?: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    const updates: any = { status };
    
    if (studentConfirmed !== undefined) {
      updates.student_confirmed = studentConfirmed;
      updates.student_response_date = new Date().toISOString();
    }

    const { error } = await supabaseAdmin
      .from("interview_invitations")
      .update(updates)
      .eq("id", invitationId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Update interview status error:", error);
    return { success: false, error: error.message };
  }
}

// ================================================
// EMAIL INTEGRATION WITH RESEND
// ================================================

export async function sendInterviewInvitationEmail(params: {
  invitationId: string;
  studentEmail: string;
  studentName: string;
  companyName: string;
  jobTitle: string;
  interviewerName: string;
  meetingUrl: string;
  scheduledDate?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
     const {
      invitationId,
      studentEmail,
      studentName,
      companyName,
      jobTitle,
      interviewerName,
      meetingUrl,
      scheduledDate,
    } = params;

    // Format scheduled date if provided
    const formattedDate = scheduledDate
      ? new Date(scheduledDate).toLocaleString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          timeZoneName: "short",
        })
      : "To be scheduled";

    // Send email via Resend
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        // from: "HireAI Platform <noreply@hireai.com>",
        from: "HireAI Platform <onboarding@resend.dev>",
        to: [studentEmail],
        subject: `🎉 Interview Invitation from ${companyName}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px;">🎉 Congratulations ${studentName}!</h1>
                <p style="color: #f0f0f0; margin-top: 10px; font-size: 16px;">You've been selected for an interview</p>
              </div>
              
              <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
                <p style="font-size: 16px; margin-bottom: 20px;">
                  Great news! <strong>${companyName}</strong> is impressed with your profile and would like to invite you for an interview.
                </p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h2 style="color: #667eea; margin-top: 0; font-size: 20px;">Interview Details</h2>
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 8px 0; color: #666; font-weight: bold;">Company:</td>
                      <td style="padding: 8px 0;">${companyName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #666; font-weight: bold;">Position:</td>
                      <td style="padding: 8px 0;">${jobTitle}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #666; font-weight: bold;">Interviewer:</td>
                      <td style="padding: 8px 0;">${interviewerName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; color: #666; font-weight: bold;">Date & Time:</td>
                      <td style="padding: 8px 0;">${formattedDate}</td>
                    </tr>
                  </table>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${meetingUrl}" 
                     style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: bold; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    Schedule Interview / Join Meeting
                  </a>
                </div>
                
                <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                  <p style="margin: 0; color: #856404;">
                    <strong>📌 Important:</strong> Please click the button above to schedule or join your interview. 
                    ${scheduledDate ? "Make sure to join on time!" : "Choose a convenient time slot."}
                  </p>
                </div>
                
                <h3 style="color: #667eea; margin-top: 30px;">Interview Preparation Tips</h3>
                <ul style="color: #666; line-height: 1.8;">
                  <li>Review your resume and be ready to discuss your projects</li>
                  <li>Research about ${companyName} and the role</li>
                  <li>Prepare questions to ask the interviewer</li>
                  <li>Test your internet connection and audio/video setup</li>
                  <li>Join 5 minutes early to ensure everything works</li>
                </ul>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #999; font-size: 14px;">
                  <p>Good luck! We're rooting for you. 🚀</p>
                  <p style="margin-top: 10px;">
                    Best regards,<br>
                    <strong>HireAI Team</strong>
                  </p>
                </div>
              </div>
              
              <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
                <p>This is an automated email from HireAI Platform.</p>
                <p>If you have any questions, please contact ${companyName} directly.</p>
              </div>
            </body>
          </html>
        `,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Resend API error: ${errorData.message || response.statusText}`);
    }

    // Mark email as sent
    await supabaseAdmin
      .from("interview_invitations")
      .update({
        email_sent: true,
        email_sent_at: new Date().toISOString(),
      })
      .eq("id", invitationId);

     return { success: true };
  } catch (error: any) {
    console.error("Send email error:", error);
    return { success: false, error: error.message };
  }
}

// ================================================
// CAL.COM INTEGRATION
// ================================================

export async function generateCalComLink(params: {
  recruiterName: string;
  jobTitle: string;
  recruiterEmail?: string;
}): Promise<{ success: boolean; link?: string; error?: string }> {
  try {
    // Cal.com API to create event type or get booking link
    // For simplicity, we'll use a generic Cal.com booking link format
    // Recruiters should set up their Cal.com account and provide their username
    
    // Generic Cal.com link format: https://cal.com/{username}/interview
    // We'll return a template that recruiters can customize
    
    const calComApiKey = process.env.CAL_COM_API_KEY;
    
    if (!calComApiKey) {
      return {
        success: false,
        error: "Cal.com API key not configured. Please provide your Cal.com booking link manually.",
      };
    }
    // For now, return a placeholder link
    // In production, you'd fetch the recruiter's Cal.com username from their profile
    // and construct a proper booking link
    
    const placeholderLink = "https://cal.com/schedule-interview";
    
    return { 
      success: true, 
      link: placeholderLink,
    //   error: "Cal.com integration pending - API key required or use Calendly link"
    };
  } catch (error: any) {
    console.error("Generate Cal.com link error:", error);
    return { success: false, error: error.message };
  }
}


/**
 * Alternative: Create a Google Meet link directly
 * This is simpler and doesn't require Cal.com
 */
export async function generateGoogleMeetLink(params: {
  interviewTitle: string;
  scheduledDate?: string;
}): Promise<{ success: boolean; link?: string; error?: string }> {
  try {
    // Generate a random Google Meet link format
    // Format: https://meet.google.com/xxx-yyyy-zzz
    const generateMeetCode = () => {
      const chars = "abcdefghijklmnopqrstuvwxyz";
      const part1 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
      const part2 = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
      const part3 = Array.from({ length: 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
      return `${part1}-${part2}-${part3}`;
    };

    const meetCode = generateMeetCode();
    const meetLink = `https://meet.google.com/${meetCode}`;

    return {
      success: true,
      link: meetLink,
    };
  } catch (error: any) {
    console.error("Generate Google Meet link error:", error);
    return { success: false, error: error.message };
  }
}

async function syncRecruiterToSupabase(firebaseUid: string): Promise<{
  success: boolean;
  recruiterId?: string;
  error?: string;
}> {
  try {
    // Check if already exists
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
      return { success: false, error: "Recruiter not found in Firebase" };
    }

    const recruiterData = recruiterDoc.data();
    
    // Validate recruiter data
    if (!recruiterData) {
      return { success: false, error: "Recruiter data is empty" };
    }

    // Insert into Supabase
    const { data, error } = await supabaseAdmin
      .from("recruiters")
      .insert({
        firebase_uid: firebaseUid,
        full_name: recruiterData.full_name || "",
        email: recruiterData.email || "",
        company_name: recruiterData.company_name || "",
        company_logo_url: recruiterData.company_logo_url || "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) throw error;

    return { success: true, recruiterId: data.id };
  } catch (err: any) {
    console.error("Sync recruiter error:", err);
    return { success: false, error: err.message };
  }
}
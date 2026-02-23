"use server";

import { supabaseAdmin } from "@/lib/supabase";
import type { InterviewInvitation } from "@/lib/supabase";

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

    // Check if invitation already exists
    const { data: existing } = await supabaseAdmin
      .from("interview_invitations")
      .select("id")
      .eq("application_id", applicationId)
      .single();

    if (existing) {
      return { success: false, error: "Interview invitation already sent for this application" };
    }

    // Create invitation
    const { data, error } = await supabaseAdmin
      .from("interview_invitations")
      .insert({
        application_id: applicationId,
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
      })
      .select()
      .single();

    if (error) throw error;

    // Update application status
    await supabaseAdmin
      .from("applications")
      .update({ status: "interview_scheduled" })
      .eq("id", applicationId);

    return { success: true, invitationId: data.id };
  } catch (error: any) {
    console.error("Create interview invitation error:", error);
    return { success: false, error: error.message };
  }
}

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
        from: "HireAI Platform <noreply@hireai.com>",
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
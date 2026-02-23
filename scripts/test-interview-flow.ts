/**
 * Test Interview Invitation Email Flow
 * 
 * This script tests the complete interview invitation workflow:
 * 1. Find a synced job
 * 2. Get/create a test student
 * 3. Create a test application
 * 4. Create interview invitation
 * 5. Send email
 */
// Load environment first before any imports
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });
// Now import other modules
import { createInterviewInvitation, sendInterviewInvitationEmail } from "../lib/actions/interview-invitation.action";
import { supabaseAdmin } from "../lib/supabase";
import { adminDb } from "../lib/firebase/admin";

async function testInterviewInvitationFlow() {
  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║  TESTING INTERVIEW INVITATION FLOW                        ║");
  console.log("╚════════════════════════════════════════════════════════════╝");

  try {
    // Step 1: Find a synced job
    console.log("📋 Step 1: Finding a synced job...");
    const { data: job } = await supabaseAdmin
      .from("platform_jobs")
      .select("*, recruiters(*)")
      .not("firebase_id", "is", null)
      .eq("status", "open")
      .limit(1)
      .single();

    if (!job) {
      console.log("❌ No synced jobs found. Run: yarn sync-all-jobs");
      return;
    }

    console.log(`✅ Found job: ${job.job_title}`);
    console.log(`   Supabase ID: ${job.id}`);
    console.log(`   Firebase ID: ${job.firebase_id}`);
    console.log(`   Company: ${job.recruiters?.company_name || 'N/A'}
`);

    // Step 2: Get or create a test student
    console.log("👨‍🎓 Step 2: Setting up test student...");
    
    const testStudentFirebaseUid = "test_student_" + Date.now();
    
    // Create student in Firebase
    const studentData = {
      full_name: "Test Student (Vikrant)",
      email: "vikrantsinghan5@gmail.com", // Using verified email for testing
      phone: "+1234567890",
      college: "Test University",
      degree: "Computer Science",
      skills: ["JavaScript", "React", "Node.js"],
      profile_completed: true,
    //   createdAt: new Date().toISOString()
    };

    await adminDb()
      .collection("students_profile")
      .doc(testStudentFirebaseUid)
      .set({
        ...studentData,
        createdAt: new Date().toISOString()
      });

    console.log(`✅ Created test student in Firebase: ${testStudentFirebaseUid}`);

    // Create student in Supabase
    const { data: student, error: studentError } = await supabaseAdmin
      .from("students_profile")
      .insert({
        firebase_uid: testStudentFirebaseUid,
        ...studentData,
        years_of_experience: 0,
        projects: [],
        portfolio_links: [],
        preferred_job_roles: [],
        preferred_locations: [],
        preferred_job_types: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (studentError) {
      console.error("❌ Error creating student:", studentError);
      return;
    }

    console.log(`✅ Created test student in Supabase: ${student.id}
`);

    // Step 3: Create application in Firebase
    console.log("📝 Step 3: Creating test application...");
    
    const applicationId = `test_app_${Date.now()}`;
    const applicationData = {
      applicantId: testStudentFirebaseUid,
      jobId: job.firebase_id,
      status: "pending",
      skillMatchScore: 85,
      matchingSkills: ["JavaScript", "React"],
      missingSkills: [],
      createdAt: new Date().toISOString()
    };

    await adminDb()
      .collection("applications")
      .doc(applicationId)
      .set(applicationData);

    console.log(`✅ Created application in Firebase: ${applicationId}
`);

    // Step 4: Create interview invitation
    console.log("📧 Step 4: Creating interview invitation...");
    
    const invitationResult = await createInterviewInvitation({
      applicationId: applicationId,
      meetingUrl: "https://meet.google.com/test-xyz-abc",
      scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      interviewerName: job.recruiters?.full_name || "Hiring Manager",
      interviewType: "Technical Interview",
      interviewInstructions: "Please prepare for coding questions and system design discussion.",
      durationMinutes: 60
    });

    if (!invitationResult.success) {
      console.error("❌ Failed to create invitation:", invitationResult.error);
      return;
    }

    console.log(`✅ Interview invitation created: ${invitationResult.invitationId}
`);

    // Step 5: Send email
    console.log("📮 Step 5: Sending invitation email...");
    
    const emailResult = await sendInterviewInvitationEmail({
      invitationId: invitationResult.invitationId!,
      studentEmail: student.email,
      studentName: student.full_name,
      companyName: job.recruiters?.company_name || "HireAI Platform",
      jobTitle: job.job_title,
      interviewerName: job.recruiters?.full_name || "Hiring Manager",
      meetingUrl: "https://meet.google.com/test-xyz-abc",
      scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });

    if (!emailResult.success) {
      console.error("❌ Failed to send email:", emailResult.error);
      return;
    }

    console.log("✅ Email sent successfully!");

    // Summary
    console.log("╔════════════════════════════════════════════════════════════╗");
    console.log("║  ✅ TEST COMPLETED SUCCESSFULLY                            ║");
    console.log("╚════════════════════════════════════════════════════════════╝");
    console.log("Summary:");
    console.log(`  Job: ${job.job_title}`);
    console.log(`  Student: ${student.full_name} (${student.email})`);
    console.log(`  Application: ${applicationId}`);
    console.log(`  Invitation: ${invitationResult.invitationId}`);
    console.log(`  Email: Sent via Resend`);

    // Cleanup instructions
    console.log("🧹 Cleanup:");
    console.log("  Test data was created. To clean up:");
    console.log(`  1. Delete application: ${applicationId}`);
    console.log(`  2. Delete student: ${testStudentFirebaseUid}`);
    console.log(`  3. Delete invitation: ${invitationResult.invitationId}
`);

  } catch (error: any) {
    console.error("❌ Test failed:", error);
    console.error(error.stack);
  }
}

// Run the test
testInterviewInvitationFlow()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });

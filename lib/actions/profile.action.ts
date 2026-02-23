"use server";

import { supabaseAdmin } from "@/lib/supabase";
import type { StudentProfile, RecruiterProfile } from "@/lib/supabase";

// ================================================
// IDENTITY SYNC - Called after Firebase registration
// ================================================

export async function syncUserToSupabase(params: {
  firebaseUid: string;
  email: string;
  fullName: string;
  role: "jobseeker" | "recruiter";
  phone?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { firebaseUid, email, fullName, role, phone } = params;

    if (role === "jobseeker") {
      // Create student profile
      const { error } = await supabaseAdmin
        .from("students_profile")
        .insert({
          firebase_uid: firebaseUid,
          full_name: fullName,
          email: email,
          phone: phone || null,
          skills: [],
          projects: [],
          portfolio_links: [],
          preferred_job_roles: [],
          preferred_locations: [],
          preferred_job_types: [],
          profile_completed: false,
          years_of_experience: 0,
        });

      if (error) throw error;
    } else {
      // Create recruiter profile (basic - they'll complete it later)
      const { error } = await supabaseAdmin
        .from("recruiters")
        .insert({
          firebase_uid: firebaseUid,
          full_name: fullName,
          email: email,
          phone: phone || null,
          company_name: "", // Will be filled later
        });

      if (error) throw error;
    }

    return { success: true };
  } catch (error: any) {
    console.error("Supabase sync error:", error);
    return { success: false, error: error.message };
  }
}

// ================================================
// STUDENT PROFILE ACTIONS
// ================================================

export async function getStudentProfile(
  firebaseUid: string
): Promise<{ success: boolean; profile?: StudentProfile; error?: string }> {
  try {
    const { data, error } = await supabaseAdmin
      .from("students_profile")
      .select("*")
      .eq("firebase_uid", firebaseUid)
      .single();

    if (error) throw error;

    return { success: true, profile: data as StudentProfile };
  } catch (error: any) {
    console.error("Get student profile error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateStudentProfile(
  firebaseUid: string,
  updates: Partial<StudentProfile>
): Promise<{ success: boolean; error?: string }> {
  try {
    // Check if profile should be marked as completed
    if (updates.profile_completed === undefined) {
      // Auto-check if essential fields are filled
      const { data: currentProfile } = await supabaseAdmin
        .from("students_profile")
        .select("*")
        .eq("firebase_uid", firebaseUid)
        .single();

      if (currentProfile) {
        const merged = { ...currentProfile, ...updates };
        const isComplete = Boolean(
          merged.full_name &&
          merged.email &&
          merged.phone &&
          merged.college &&
          merged.degree &&
          merged.specialization &&
          merged.skills?.length > 0 &&
          merged.experience_level &&
          merged.preferred_job_roles?.length > 0
        );
        
        if (isComplete) {
          updates.profile_completed = true;
        }
      }
    }

    const { error } = await supabaseAdmin
      .from("students_profile")
      .update(updates)
      .eq("firebase_uid", firebaseUid);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Update student profile error:", error);
    return { success: false, error: error.message };
  }
}

export async function checkProfileCompletion(
  firebaseUid: string
): Promise<{ completed: boolean; missingFields?: string[] }> {
  try {
    const { data, error } = await supabaseAdmin
      .from("students_profile")
      .select("*")
      .eq("firebase_uid", firebaseUid)
      .single();

    if (error || !data) {
      return { completed: false, missingFields: ["Profile not found"] };
    }

    const profile = data as StudentProfile;
    const missingFields: string[] = [];

    if (!profile.full_name) missingFields.push("Full Name");
    if (!profile.email) missingFields.push("Email");
    if (!profile.phone) missingFields.push("Phone Number");
    if (!profile.college) missingFields.push("College/University");
    if (!profile.degree) missingFields.push("Degree");
    if (!profile.specialization) missingFields.push("Specialization");
    if (!profile.skills || profile.skills.length === 0) missingFields.push("Skills");
    if (!profile.experience_level) missingFields.push("Experience Level");
    if (!profile.preferred_job_roles || profile.preferred_job_roles.length === 0) {
      missingFields.push("Preferred Job Roles");
    }

    const completed = missingFields.length === 0;

    return { completed, missingFields: completed ? undefined : missingFields };
  } catch (error) {
    console.error("Check profile completion error:", error);
    return { completed: false, missingFields: ["Error checking profile"] };
  }
}

// ================================================
// RECRUITER PROFILE ACTIONS
// ================================================

export async function getRecruiterProfile(
  firebaseUid: string
): Promise<{ success: boolean; profile?: RecruiterProfile; error?: string }> {
  try {
    const { data, error } = await supabaseAdmin
      .from("recruiters")
      .select("*")
      .eq("firebase_uid", firebaseUid)
      .single();

    if (error) throw error;

    return { success: true, profile: data as RecruiterProfile };
  } catch (error: any) {
    console.error("Get recruiter profile error:", error);
    return { success: false, error: error.message };
  }
}

export async function updateRecruiterProfile(
  firebaseUid: string,
  updates: Partial<RecruiterProfile>
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from("recruiters")
      .update(updates)
      .eq("firebase_uid", firebaseUid);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Update recruiter profile error:", error);
    return { success: false, error: error.message };
  }
}

// ================================================
// UTILITY FUNCTIONS
// ================================================

export async function getProfileByEmail(
  email: string
): Promise<{ 
  role: "student" | "recruiter" | null; 
  profile?: StudentProfile | RecruiterProfile 
}> {
  try {
    // Try student first
    const { data: studentData } = await supabaseAdmin
      .from("students_profile")
      .select("*")
      .eq("email", email)
      .single();

    if (studentData) {
      return { role: "student", profile: studentData as StudentProfile };
    }

    // Try recruiter
    const { data: recruiterData } = await supabaseAdmin
      .from("recruiters")
      .select("*")
      .eq("email", email)
      .single();

    if (recruiterData) {
      return { role: "recruiter", profile: recruiterData as RecruiterProfile };
    }

    return { role: null };
  } catch (error) {
    console.error("Get profile by email error:", error);
    return { role: null };
  }
}

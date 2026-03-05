"use server";

import { supabaseAdmin } from "@/lib/supabase";

// Types for Resume Builder
export interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  location?: string;
  title?: string;
}

export interface Education {
  degree: string;
  institution: string;
  location?: string;
  startDate: string;
  endDate?: string;
  gpa?: string;
  description?: string;
}

export interface Experience {
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  responsibilities: string[];
}

export interface Skills {
  technical?: string[];
  soft?: string[];
  tools?: string[];
  frameworks?: string[];
  languages?: string[];
}

export interface Project {
  title: string;
  description: string;
  technologies: string[];
  github?: string;
  liveLink?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

export interface Achievement {
  title: string;
  description?: string;
  date?: string;
}

export interface UserResume {
  id?: string;
  user_id: string;
  personal_info: PersonalInfo;
  summary?: string;
  education: Education[];
  experience: Experience[];
  skills: Skills;
  projects: Project[];
  certifications: Certification[];
  achievements: Achievement[];
  selected_template: string;
  created_at?: string;
  updated_at?: string;
}

// Save or update resume
export async function saveResume(
  userId: string,
  resumeData: Omit<UserResume, "id" | "user_id" | "created_at" | "updated_at">
): Promise<{ success: boolean; resumeId?: string; error?: string }> {
  try {
    // Check if resume exists
    const { data: existing } = await supabaseAdmin
      .from("user_resumes")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    if (existing) {
      // Update existing resume
      const { data, error } = await supabaseAdmin
        .from("user_resumes")
        .update({
          personal_info: resumeData.personal_info,
          summary: resumeData.summary,
          education: resumeData.education,
          experience: resumeData.experience,
          skills: resumeData.skills,
          projects: resumeData.projects,
          certifications: resumeData.certifications,
          achievements: resumeData.achievements,
          selected_template: resumeData.selected_template,
        })
        .eq("user_id", userId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, resumeId: data.id };
    } else {
      // Insert new resume
      const { data, error } = await supabaseAdmin
        .from("user_resumes")
        .insert({
          user_id: userId,
          personal_info: resumeData.personal_info,
          summary: resumeData.summary,
          education: resumeData.education,
          experience: resumeData.experience,
          skills: resumeData.skills,
          projects: resumeData.projects,
          certifications: resumeData.certifications,
          achievements: resumeData.achievements,
          selected_template: resumeData.selected_template,
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, resumeId: data.id };
    }
  } catch (error: any) {
    console.error("Save resume error:", error);
    return { success: false, error: error.message };
  }
}

// Get user's resume
export async function getResume(
  userId: string
): Promise<{ success: boolean; resume?: UserResume; error?: string }> {
  try {
    const { data, error } = await supabaseAdmin
      .from("user_resumes")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) throw error;

    return { success: true, resume: data as UserResume };
  } catch (error: any) {
    console.error("Get resume error:", error);
    return { success: false, error: error.message };
  }
}

// Delete resume
export async function deleteResume(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabaseAdmin
      .from("user_resumes")
      .delete()
      .eq("user_id", userId);

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error("Delete resume error:", error);
    return { success: false, error: error.message };
  }
}

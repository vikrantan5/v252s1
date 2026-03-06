// Skill matching and extraction utilities

import { ROLE_SKILLS, SKILL_RESOURCES } from "./skills-database";

export interface SkillMatchResult {
  requiredSkills: string[];
  detectedSkills: string[];
  missingSkills: string[];
  learningResources: Array<{ skill: string; url: string }>;
}

/**
 * Extract skills from resume text using keyword matching
 */
export function extractSkillsFromText(text: string): string[] {
  const normalizedText = text.toLowerCase();
  const detectedSkills = new Set<string>();

  // Get all unique skills from the database
  const allSkills = new Set<string>();
  Object.values(ROLE_SKILLS).forEach((skillSet) => {
    skillSet.technical.forEach((skill) => allSkills.add(skill));
    skillSet.tools?.forEach((skill) => allSkills.add(skill));
    skillSet.soft?.forEach((skill) => allSkills.add(skill));
  });

  // Check for each skill in the resume text
  allSkills.forEach((skill) => {
    const skillLower = skill.toLowerCase();
    
    // Check for exact match or common variations
    if (
      normalizedText.includes(skillLower) ||
      normalizedText.includes(skillLower.replace(/./g, "")) ||
      normalizedText.includes(skillLower.replace(/s+/g, ""))
    ) {
      detectedSkills.add(skill);
    }
  });

  return Array.from(detectedSkills);
}

/**
 * Get required skills for a specific job role
 */
export function getRequiredSkillsForRole(roleValue: string): string[] {
  const skillSet = ROLE_SKILLS[roleValue];
  if (!skillSet) {
    return [];
  }

  const allSkills: string[] = [
    ...skillSet.technical,
    ...(skillSet.tools || []),
    ...(skillSet.soft || []),
  ];

  return allSkills;
}

/**
 * Match resume skills against job role requirements
 */
export function matchSkills(
  resumeText: string,
  jobRole: string
): SkillMatchResult {
  // Get required skills for the role
  const requiredSkills = getRequiredSkillsForRole(jobRole);

  // Extract skills from resume
  const detectedSkills = extractSkillsFromText(resumeText);

  // Find missing skills
  const detectedSkillsLower = detectedSkills.map((s) => s.toLowerCase());
  const missingSkills = requiredSkills.filter(
    (required) => !detectedSkillsLower.includes(required.toLowerCase())
  );

  // Get learning resources for missing skills
  const learningResources = missingSkills
    .map((skill) => ({
      skill,
      url: SKILL_RESOURCES[skill] || `https://www.google.com/search?q=learn+${encodeURIComponent(skill)}`,
    }))
    .slice(0, 8); // Limit to top 8 resources

  return {
    requiredSkills,
    detectedSkills: detectedSkills.filter((skill) =>
      requiredSkills.some((req) => req.toLowerCase() === skill.toLowerCase())
    ),
    missingSkills,
    learningResources,
  };
}

/**
 * Calculate skill match percentage
 */
export function calculateSkillMatchPercentage(
  detectedSkills: string[],
  requiredSkills: string[]
): number {
  if (requiredSkills.length === 0) return 100;

  const detectedLower = detectedSkills.map((s) => s.toLowerCase());
  const matchedCount = requiredSkills.filter((req) =>
    detectedLower.includes(req.toLowerCase())
  ).length;

  return Math.round((matchedCount / requiredSkills.length) * 100);
}

/**
 * Get role display name from role value
 */
export function getRoleDisplayName(roleValue: string): string {
  // Convert kebab-case to Title Case
  return roleValue
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
